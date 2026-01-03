# Chroma - Open Source Embedding Database

Chroma is the open-source embedding database. The fastest way to build Python or JavaScript LLM apps with memory!

[Docs](https://docs.trychroma.com/) | [Homepage](https://www.trychroma.com/)

## Installation

```bash
pip install chromadb 
# python client 

# for javascript
npm install chromadb! 

# for client-server mode
chroma run --path /chroma_db_path
```

## API

The core API is only 4 functions (run our [💡 Google Colab](https://colab.research.google.com/drive/1QEzFyqnoFxq7LUGyP1vzR4iLt9PpCDXv?usp=sharing)):

```python
import chromadb
# setup Chroma in-memory, for easy prototyping. Can add persistence easily!
client = chromadb.Client()

# Create collection. get_collection, get_or_create_collection, delete_collection also available!
collection = client.create_collection("all-my-documents")

# Add docs to the collection. Can also update and delete. Row-based API coming soon!
collection.add(
    documents=["This is document1", "This is document2"], # we handle tokenization, embedding, and indexing automatically. You can skip that and add your own embeddings as well
    metadatas=[{"source": "notion"}, {"source": "google-docs"}], # filter on these!
    ids=["doc1", "doc2"], # unique for each doc
)

# Query/search 2 most similar results. You can also .get by id
results = collection.query(
    query_texts=["This is a query document"],
    n_results=2,
    # where={"metadata_field": "is_equal_to_this"}, # optional filter
    # where_document={"$contains":"search_string"}  # optional filter
)
```

## Use case: Chat your data

1. Add documents to your database. You can pass in your own embeddings, embedding function, or let Chroma embed them for you.
2. Query relevant documents with natural language.
3. Compose documents into the context window of an LLM like GPT4 for additional summarization or analysis.

## Embeddings?

What are embeddings?

- [Read the guide from OpenAI](https://platform.openai.com/docs/guides/embeddings/what-are-embeddings)
- **Literal**: Embedding something turns it from image/text/audio into a list of numbers. 🖼️ or 📄 => [1.2, 2.1, ....]. This process makes documents "understandable" to a machine learning model.
- **By analogy**: An embedding represents the essence of a document. This enables documents and queries with the same essence to be "near" each other and therefore easy to find.
- **Technical**: An embedding is the latent-space position of a document at a layer of a deep neural network. For models trained specifically to embed data, this is the last layer.
- **A small example**: If you search your photos for "famous bridge in San Francisco". By embedding this query and comparing it to the embeddings of your photos and their metadata - it should return photos of the Golden Gate Bridge.

Embeddings databases (also known as vector databases) store embeddings and allow you to search by nearest neighbors rather than by substrings like a traditional database. By default, Chroma uses [Sentence Transformers](https://docs.trychroma.com/guides/embeddings#default:-all-minilm-l6-v2) to embed for you but you can also use OpenAI embeddings, Cohere (multilingual) embeddings, or your own.
