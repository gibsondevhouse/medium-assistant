# Vitest Documentation

## Overview

Vitest (pronounced as "veetest") is a next generation testing framework powered by Vite.
You can learn more about the rationale behind the project in the [Why Vitest](https://vitest.dev/guide/why) section.

## Trying Vitest Online

You can try Vitest online on [StackBlitz](https://vitest.new). It runs Vitest directly in the browser, and is almost identical to the local setup but doesn't require installing anything on your machine.

## Adding Vitest to Your Project

```bash
npm install -D vitest
```

TIP: Vitest requires Vite >=v6.0.0 and Node >=v20.0.0

## Writing Tests

As an example, we will write a simple test that verifies the output of a function that adds two numbers.

```javascript
// sum.js
export function sum(a, b) { return a + b }
```

```javascript
// sum.test.js
import { expect, test } from 'vitest'
import { sum } from './sum.js'

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})
```

Run with `npx vitest`.
