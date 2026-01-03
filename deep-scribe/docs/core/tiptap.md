# TipTap Editor

## Introduction

Tiptap is a headless wrapper around ProseMirror. It provides the editing experience but gives you full control over the UI.

## Installation

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
```

## Usage

```jsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World!</p>',
  })

  return <EditorContent editor={editor} />
}
```
