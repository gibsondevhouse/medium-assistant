# ChromaDB Guide

## Overview

[Chroma](https://www.trychroma.com/) is an open-source embedding database designed to make it easy to build LLM applications by making knowledge, facts, and skills pluggable.

In **Deep Scribe**, we use Chroma to store embeddings of your research notes and drafts, enabling the "Chat with Notes" RAG feature.

## Installation

```bash
pip install chromadb
```

## Core Concepts

* **Collection:** Analogous to a table in a relational DB. Stores documents and their embeddings.
* **Documents:** The raw text content.
* **Embeddings:** Vector representations of the documents. Chroma can generate these automatically (using default models) or you can supply them (e.g., from Gemini).
* **Metadata:** Key-value pairs allowing for filtering (e.g., `{"source": "draft-1"}`).

## Basic Usage (Python)

```python
import chromadb

# 1. Initialize Client (Persistent)
client = chromadb.PersistentClient(path="/path/to/save/db")

# 2. Get/Create Collection
collection = client.get_or_create_collection(name="deep_scribe_research")

# 3. Add Documents
collection.add(
    documents=["This is a document about AI", "This is about cooking"],
    metadatas=[{"source": "paper"}, {"source": "blog"}],
    ids=["id1", "id2"]
)

# 4. Query
results = collection.query(
    query_texts=["artificial intelligence"],
    n_results=1
)
# results['documents'] will contain ["This is a document about AI"]
```

## Deep Scribe Implementation

See `python_backend/knowledge_base.py` for our specific implementation, which wraps ChromaDB and uses **Google Gemini** `text-embedding-004` for high-quality embeddings instead of the default Sentence Transformers.
