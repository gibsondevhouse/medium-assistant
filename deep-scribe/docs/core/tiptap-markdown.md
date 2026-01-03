# TipTap Markdown Extension

## Overview

The `@tiptap/markdown` extension allows you to use Tiptap with Markdown. It serializes the editor content to Markdown and parses Markdown to Tiptap content.

## Installation

```bash
npm install @tiptap/markdown
```

## Usage

```javascript
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Markdown from '@tiptap/markdown'

new Editor({
  extensions: [
    StarterKit,
    Markdown,
  ],
  content: `
    # Hello World
    This is **markdown**.
  `,
})
```

## Accessing Content

```javascript
// Get Markdown
const markdown = editor.storage.markdown.getMarkdown()

// Set Markdown (if cleaner than HTML)
// editor.commands.setContent('**Bold**', { emitUpdate: true }) // this usually expects HTML or JSON
// For direct markdown setting, usually we parse it first:
// content: '# Initial Content'
```
