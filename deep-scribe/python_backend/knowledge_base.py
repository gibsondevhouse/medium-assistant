"""
Knowledge Base Service for Deep Scribe
Uses ChromaDB for vector storage and Gemini Embeddings for semantic search
"""

import os
import chromadb
from chromadb.config import Settings
import google.generativeai as genai
from typing import List, Dict, Any, Optional
import hashlib
import json


class KnowledgeBaseService:
    """Service for managing the local knowledge base with embeddings"""

    COLLECTION_NAME = "deep_scribe_research"
    EMBEDDING_MODEL = "models/text-embedding-004"

    def __init__(self, persist_directory: str = None):
        """Initialize ChromaDB client with persistence"""
        if persist_directory is None:
            # Default to user's app data directory
            home = os.path.expanduser("~")
            persist_directory = os.path.join(home, ".deep-scribe", "knowledge_base")

        # Ensure directory exists
        os.makedirs(persist_directory, exist_ok=True)

        self.persist_directory = persist_directory
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(anonymized_telemetry=False)
        )

        # Get or create the collection
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"description": "Deep Scribe research notes and findings"}
        )

        self._api_key = None

    def set_api_key(self, api_key: str):
        """Set the Gemini API key for embeddings"""
        self._api_key = api_key
        genai.configure(api_key=api_key)

    def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a text using Gemini"""
        if not self._api_key:
            raise ValueError("Gemini API key not set")

        result = genai.embed_content(
            model=self.EMBEDDING_MODEL,
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']

    def _generate_query_embedding(self, query: str) -> List[float]:
        """Generate embedding for a query (uses different task type)"""
        if not self._api_key:
            raise ValueError("Gemini API key not set")

        result = genai.embed_content(
            model=self.EMBEDDING_MODEL,
            content=query,
            task_type="retrieval_query"
        )
        return result['embedding']

    def _generate_id(self, content: str, source: str) -> str:
        """Generate a unique ID for a document"""
        hash_input = f"{source}:{content[:500]}"
        return hashlib.sha256(hash_input.encode()).hexdigest()[:16]

    def add_document(
        self,
        content: str,
        source: str,
        title: str,
        doc_type: str = "research",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Add a document to the knowledge base

        Args:
            content: The text content to embed and store
            source: Source identifier (e.g., research topic, draft ID)
            title: Human-readable title
            doc_type: Type of document (research, draft, note)
            metadata: Additional metadata

        Returns:
            Dict with success status and document ID
        """
        try:
            doc_id = self._generate_id(content, source)

            # Check if document already exists
            existing = self.collection.get(ids=[doc_id])
            if existing and existing['ids']:
                return {
                    "success": True,
                    "id": doc_id,
                    "message": "Document already exists",
                    "updated": False
                }

            # Generate embedding
            embedding = self._generate_embedding(content)

            # Prepare metadata
            doc_metadata = {
                "source": source,
                "title": title,
                "doc_type": doc_type,
                "content_length": len(content),
                **(metadata or {})
            }

            # Add to collection
            self.collection.add(
                ids=[doc_id],
                embeddings=[embedding],
                documents=[content],
                metadatas=[doc_metadata]
            )

            return {
                "success": True,
                "id": doc_id,
                "message": "Document added successfully",
                "updated": True
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def add_research_findings(
        self,
        topic: str,
        subtopic: str,
        findings: str,
        research_id: str
    ) -> Dict[str, Any]:
        """Add research findings to the knowledge base"""
        return self.add_document(
            content=findings,
            source=f"research:{research_id}",
            title=f"{topic} - {subtopic}",
            doc_type="research_finding",
            metadata={
                "main_topic": topic,
                "subtopic": subtopic,
                "research_id": research_id
            }
        )

    def add_research_report(
        self,
        topic: str,
        report: str,
        research_id: str
    ) -> Dict[str, Any]:
        """Add a complete research report to the knowledge base"""
        return self.add_document(
            content=report,
            source=f"report:{research_id}",
            title=f"Research Report: {topic}",
            doc_type="research_report",
            metadata={
                "main_topic": topic,
                "research_id": research_id
            }
        )

    def query(
        self,
        query_text: str,
        n_results: int = 5,
        doc_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Query the knowledge base for similar documents

        Args:
            query_text: The search query
            n_results: Number of results to return
            doc_type: Filter by document type (optional)

        Returns:
            Dict with matching documents and their metadata
        """
        try:
            # Generate query embedding
            query_embedding = self._generate_query_embedding(query_text)

            # Prepare where clause for filtering
            where = None
            if doc_type:
                where = {"doc_type": doc_type}

            # Query the collection
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where,
                include=["documents", "metadatas", "distances"]
            )

            # Format results
            documents = []
            if results['ids'] and results['ids'][0]:
                for i, doc_id in enumerate(results['ids'][0]):
                    documents.append({
                        "id": doc_id,
                        "content": results['documents'][0][i] if results['documents'] else "",
                        "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                        "distance": results['distances'][0][i] if results['distances'] else 0,
                        "relevance": 1 - (results['distances'][0][i] if results['distances'] else 0)
                    })

            return {
                "success": True,
                "results": documents,
                "query": query_text,
                "count": len(documents)
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "results": []
            }

    def get_all_documents(self, limit: int = 100) -> Dict[str, Any]:
        """Get all documents in the knowledge base"""
        try:
            results = self.collection.get(
                limit=limit,
                include=["documents", "metadatas"]
            )

            documents = []
            if results['ids']:
                for i, doc_id in enumerate(results['ids']):
                    documents.append({
                        "id": doc_id,
                        "content": results['documents'][i] if results['documents'] else "",
                        "metadata": results['metadatas'][i] if results['metadatas'] else {}
                    })

            return {
                "success": True,
                "documents": documents,
                "count": len(documents)
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "documents": []
            }

    def delete_document(self, doc_id: str) -> Dict[str, Any]:
        """Delete a document from the knowledge base"""
        try:
            self.collection.delete(ids=[doc_id])
            return {"success": True, "id": doc_id}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def clear_all(self) -> Dict[str, Any]:
        """Clear all documents from the knowledge base"""
        try:
            # Delete and recreate collection
            self.client.delete_collection(self.COLLECTION_NAME)
            self.collection = self.client.create_collection(
                name=self.COLLECTION_NAME,
                metadata={"description": "Deep Scribe research notes and findings"}
            )
            return {"success": True, "message": "Knowledge base cleared"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about the knowledge base"""
        try:
            count = self.collection.count()
            return {
                "success": True,
                "total_documents": count,
                "persist_directory": self.persist_directory
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
