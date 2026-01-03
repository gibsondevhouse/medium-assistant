# Google AI Embeddings (Gemini API)

## Overview

Text embeddings measure the relatedness of text strings. Embeddings are vector representations (arrays of floating point numbers).

## Models

- `text-embedding-004` (Latest)
- `embedding-001`

## Usage (Python)

```python
import google.generativeai as genai

result = genai.embed_content(
    model="models/text-embedding-004",
    content="What is the meaning of life?",
    task_type="retrieval_document",
    title="Embedding of single string"
)

# 1 input > 1 vector output
print(str(result['embedding'])[:50], '... TRIMMED]')
```

## Task Types

- `retrieval_query`: Specifies the given text is a query in a search/retrieval setting.
- `retrieval_document`: Specifies the given text is a document in a search/retrieval setting.
