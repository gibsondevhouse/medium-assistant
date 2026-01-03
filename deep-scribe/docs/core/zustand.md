# Zustand

## Introduction

A small, fast and scalable bearbones state-management solution using simplified flux principles.

## Installation

```bash
npm install zustand
```

## Create a Store

```javascript
import { create } from 'zustand'

const useStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}))
```

## Bind to Components

```javascript
function BearCounter() {
  const bears = useStore((state) => state.bears)
  return <h1>{bears} around here...</h1>
}
```
