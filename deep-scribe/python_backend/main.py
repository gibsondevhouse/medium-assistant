from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socket
from dotenv import load_dotenv
import os
import argparse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from router import GeminiRouter
from knowledge_base import KnowledgeBaseService
from services.google_search import GoogleSearchService
from services.google_books import GoogleBooksService
import uvicorn
from utils.logger import logger

load_dotenv()

app = FastAPI()

# Initialize Services
kb_service = KnowledgeBaseService()
search_service = GoogleSearchService()
books_service = GoogleBooksService()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

@app.get("/")
def read_root():
    logger.info("Health check endpoint called")
    return {"message": "Hello from Deep Scribe Backend (Gemini)"}

# --- GEMINI ROUTER ---
router = GeminiRouter()

class GenerateRequest(BaseModel):
    model: str
    prompt: str
    api_key: str

@app.post("/api/generate")
async def generate_content(request: GenerateRequest):
    logger.info(f"Generating content with model: {request.model}")
    result = router.generate(
        model=request.model,
        prompt=request.prompt,
        api_key=request.api_key
    )
    if not result.get("success"):
        logger.error(f"Generation failed: {result.get('error')}")
    return result


# --- TOOLS ENDPOINTS ---

class SearchRequest(BaseModel):
    query: str
    num_results: int = 5
    api_key: str
    search_engine_id: str

@app.post("/api/tools/search")
async def google_search(request: SearchRequest):
    """
    Perform a Google Custom Search to ground the research.
    """
    # Configure on the fly with user provided keys (stateless)
    search_service.configure(request.api_key, request.search_engine_id)
    return search_service.search(request.query, request.num_results)

class BooksRequest(BaseModel):
    query: str
    max_results: int = 5
    api_key: str

@app.post("/api/tools/books")
async def google_books(request: BooksRequest):
    """
    Search Google Books for authoritative sources.
    """
    books_service.configure(request.api_key)
    return books_service.search(request.query, request.max_results)


# --- KNOWLEDGE BASE ENDPOINTS ---

class KBAddDocumentRequest(BaseModel):
    content: str
    source: str
    title: str
    doc_type: str = "research"
    metadata: Optional[Dict[str, Any]] = None
    api_key: str

class KBAddResearchRequest(BaseModel):
    topic: str
    subtopic: str
    findings: str
    research_id: str
    api_key: str

class KBAddReportRequest(BaseModel):
    topic: str
    report: str
    research_id: str
    api_key: str

class KBQueryRequest(BaseModel):
    query: str
    n_results: int = 5
    doc_type: Optional[str] = None
    api_key: str

class KBDeleteRequest(BaseModel):
    doc_id: str

class KBChatRequest(BaseModel):
    message: str
    n_context: int = 3
    api_key: str


@app.post("/api/kb/add")
async def kb_add_document(request: KBAddDocumentRequest):
    """Add a document to the knowledge base"""
    logger.info(f"Adding document: {request.title}")
    kb_service.set_api_key(request.api_key)
    return kb_service.add_document(
        content=request.content,
        source=request.source,
        title=request.title,
        doc_type=request.doc_type,
        metadata=request.metadata
    )

@app.post("/api/kb/add-research")
async def kb_add_research(request: KBAddResearchRequest):
    """Add research findings to the knowledge base"""
    logger.info(f"Adding research: {request.topic} - {request.subtopic}")
    kb_service.set_api_key(request.api_key)
    return kb_service.add_research_findings(
        topic=request.topic,
        subtopic=request.subtopic,
        findings=request.findings,
        research_id=request.research_id
    )

@app.post("/api/kb/add-report")
async def kb_add_report(request: KBAddReportRequest):
    """Add a research report to the knowledge base"""
    logger.info(f"Adding report: {request.topic}")
    kb_service.set_api_key(request.api_key)
    return kb_service.add_research_report(
        topic=request.topic,
        report=request.report,
        research_id=request.research_id
    )

@app.post("/api/kb/query")
async def kb_query(request: KBQueryRequest):
    """Query the knowledge base for similar documents"""
    logger.info(f"Querying KB: {request.query}")
    kb_service.set_api_key(request.api_key)
    return kb_service.query(
        query_text=request.query,
        n_results=request.n_results,
        doc_type=request.doc_type
    )

@app.get("/api/kb/documents")
async def kb_get_documents(limit: int = 100):
    """Get all documents in the knowledge base"""
    return kb_service.get_all_documents(limit=limit)

@app.delete("/api/kb/document/{doc_id}")
async def kb_delete_document(doc_id: str):
    """Delete a document from the knowledge base"""
    logger.info(f"Deleting document: {doc_id}")
    return kb_service.delete_document(doc_id)

@app.delete("/api/kb/clear")
async def kb_clear():
    """Clear all documents from the knowledge base"""
    logger.warning("Clearing entire Knowledge Base")
    return kb_service.clear_all()

@app.get("/api/kb/stats")
async def kb_stats():
    """Get knowledge base statistics"""
    return kb_service.get_stats()

@app.post("/api/kb/chat")
async def kb_chat(request: KBChatRequest):
    """
    Chat with your notes - RAG-powered conversation
    """
    logger.info(f"Chat request: {request.message[:50]}...")
    kb_service.set_api_key(request.api_key)

    # First, query for relevant context
    context_results = kb_service.query(
        query_text=request.message,
        n_results=request.n_context
    )

    if not context_results.get("success"):
        logger.error(f"KB Query failed: {context_results.get('error')}")
        return {
            "success": False,
            "error": context_results.get("error", "Failed to query knowledge base")
        }

    # Build context from results
    context_parts = []
    for doc in context_results.get("results", []):
        title = doc.get("metadata", {}).get("title", "Untitled")
        content = doc.get("content", "")[:2000]  # Limit context size
        context_parts.append(f"### {title}\n{content}")

    context_text = "\n\n---\n\n".join(context_parts) if context_parts else "No relevant notes found."

    # Generate response using Gemini
    prompt = f"""You are a helpful research assistant. Answer the user's question based on the following notes from their knowledge base. If the notes don't contain relevant information, say so and provide what help you can.

## User's Notes (from Knowledge Base):
{context_text}

## User's Question:
{request.message}

## Instructions:
- Answer based primarily on the notes provided above
- If the notes don't cover the topic, acknowledge this
- Be concise but thorough
- Reference specific notes when relevant
"""

    result = router.generate(
        model="gemini-2.5-flash",
        prompt=prompt,
        api_key=request.api_key
    )

    return {
        "success": result.get("success", False),
        "response": result.get("content", ""),
        "context_used": len(context_results.get("results", [])),
        "sources": [
            {
                "id": doc.get("id"),
                "title": doc.get("metadata", {}).get("title", "Untitled"),
                "relevance": doc.get("relevance", 0)
            }
            for doc in context_results.get("results", [])
        ]
    }


@app.get("/config")
def get_config():
    return {
        "hardware": {"type": "Cloud Native (Gemini)"},
        "provider": "gemini"
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Deep Scribe Gemini Backend")
    parser.add_argument("--port", type=int, help="Port to run the server on")
    args = parser.parse_args()

    port = args.port
    if port is None:
        port = find_free_port()
        logger.info(f"No port provided, found free port: {port}")
    
    logger.info(f"Starting Deep Scribe Gemini backend on port {port}")
    uvicorn.run(app, host="127.0.0.1", port=int(port))