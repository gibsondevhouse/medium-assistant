# Embeddings

The Gemini API offers text embedding models to generate embeddings for words, phrases, sentences, and code. These foundational embeddings power advanced NLP tasks such as semantic search, classification, and clustering, providing more accurate, context-aware results than keyword-based approaches.

## Generating embeddings

Use the `embedContent` method to generate text embeddings:

### Python

```python
from google import genai

client = genai.Client()
result = client.models.embed_content(
    model="gemini-embedding-001",
    contents="What is the meaning of life?")
print(result.embeddings)
```

### JavaScript

```javascript
import { GoogleGenAI } from "@google/genai";

async function main() {
  const ai = new GoogleGenAI({});
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: 'What is the meaning of life?',
  });
  console.log(response.embeddings);
}

main();
```

### Go

```go
package main

import (
 "context"
 "encoding/json"
 "fmt"
 "log"
 "google.golang.org/genai"
)

func main() {
 ctx := context.Background()
 client, err := genai.NewClient(ctx, nil)
 if err != nil {
  log.Fatal(err)
 }

 contents := []*genai.Content{
  genai.NewContentFromText("What is the meaning of life?", genai.RoleUser),
 }

 result, err := client.Models.EmbedContent(ctx, "gemini-embedding-001", contents, nil, )
 if err != nil {
  log.Fatal(err)
 }

 embeddings, err := json.MarshalIndent(result.Embeddings, "", "  ")
 if err != nil {
  log.Fatal(err)
 }

 fmt.Println(string(embeddings))
}
```

### REST

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H 'Content-Type: application/json' \
    -d '{"model": "models/gemini-embedding-001",
         "content": {
             "parts":[{
                 "text": "What is the meaning of life?"}]}}'
```

You can also generate embeddings for multiple chunks at once by passing them in as a list of strings.
