# ChromaDB

## Overview

Chroma is the open-source embedding database. Chroma makes it easy to build LLM apps by making knowledge, facts, and skills pluggable for LLMs.

## Support

- [Docs](https://docs.trychroma.com/docs/overview/introduction)
- [Python Client](https://docs.trychroma.com/reference/py-collection)
- [JS Client](https://docs.trychroma.com/reference/js-collection)

## Getting Started

```bash
pip install chromadb
```

```python
import chromadb
chroma_client = chromadb.Client()

collection = chroma_client.create_collection(name="my_collection")

collection.add(
    documents=["This is a document", "This is another document"],
    metadatas=[{"source": "my_source"}, {"source": "my_source"}],
    ids=["id1", "id2"]
)

results = collection.query(
    query_texts=["This is a query document"],
    n_results=2
)
```
