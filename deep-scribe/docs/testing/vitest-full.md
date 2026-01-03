# Vitest API Reference

## test

Alias: `it`

`test` defines a set of related expectations. It receives the test name and a function that holds the expectations to test.

```javascript
import { expect, test } from 'vitest'

test('should work as expected', () => {
  expect(Math.sqrt(4)).toBe(2)
})
```

### test.extend

Use `test.extend` to extend the test context with custom fixtures.

### test.skip / test.skipIf

Skip running certain tests.

```javascript
test.skip('skipped test', () => { ... })
test.skipIf(isDev)('prod only test', () => { ... })
```

### test.only

Only run certain tests in a given suite. Useful for debugging.

### test.concurrent

Marks consecutive tests to be run in parallel.

```javascript
test.concurrent('test 1', async () => { ... })
test.concurrent('test 2', async () => { ... })
```

### test.each

Run the same test with different variables.

```javascript
test.each([
  [1, 1, 2],
  [1, 2, 3],
  [2, 1, 3],
])('add(%i, %i) -> %i', (a, b, expected) => {
  expect(a + b).toBe(expected)
})
```

## describe

Define a new suite in the current context.

```javascript
describe('person', () => {
  test('is active', () => { ... })
})
```

## Setup and Teardown

### beforeEach

Register a callback to be called before each of the tests in the current context runs.

```javascript
beforeEach(async () => {
  await addUser({ name: 'John' })
})
```

### afterEach

Register a callback to be called after each one of the tests in the current context completes.

### beforeAll

Register a callback to be called once before starting to run all tests in the current context.

### afterAll

Register a callback to be called once after all tests have run.
