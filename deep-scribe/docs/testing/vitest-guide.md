# Vitest Guide

## Overview

[Vitest](https://vitest.dev) is a next-generation testing framework powered by Vite. It offers a fast, unified development experience with out-of-the-box support for ESM, TypeScript, and JSX.

## Installation

```bash
npm install -D vitest
```

**Requirements:** Vite >=v5.0.0 and Node >=v18.0.0

## Configuration

Vitest automatically reads your `vite.config.ts`. If you need specific test configuration, you can add a `test` property to your Vite config or create a `vitest.config.ts`.

```typescript
// vite.config.ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'jsdom', // or 'node'
    globals: true,
  },
})
```

## Writing Tests

By default, Vitest looks for files ending in `.test.ts`, `.spec.ts`, etc.

### Basic Example

```javascript
// sum.js
export function sum(a, b) { return a + b }

// sum.test.js
import { expect, test } from 'vitest'
import { sum } from './sum.js'

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})
```

### Key APIs

* **`test(name, fn)`**: Defines a test case. Alias: `it`.
  * `test.skip`: Skips the test.
  * `test.only`: Runs only this test.
  * `test.each(table)(name, fn)`: Data-driven testing.
* **`describe(name, fn)`**: Groups related tests.
* **`expect(value)`**: Creates an assertion.
* **Setup/Teardown**:
  * `beforeEach(fn)`
  * `afterEach(fn)`
  * `beforeAll(fn)`
  * `afterAll(fn)`

## Running Tests

Add to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui"
  }
}
```

Run with `npm run test`.
