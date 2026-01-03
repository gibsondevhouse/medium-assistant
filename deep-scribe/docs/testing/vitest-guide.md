# Getting Started

## Overview

Vitest (pronounced as "veetest") is a next generation testing framework powered by Vite.
You can learn more about the rationale behind the project in the [Why Vitest](https://vitest.dev/guide/why) section.

## Trying Vitest Online

You can try Vitest online on [StackBlitz](https://vitest.new). It runs Vitest directly in the browser, and it is almost identical to the local setup but doesn't require installing anything on your machine.

## Adding Vitest to Your Project

[Learn how to install by Video](https://vueschool.io/lessons/how-to-install-vitest?friend=vueuse)

```bash
npm install -D vitest
```

```bash
yarn add -D vitest
```

```bash
pnpm add -D vitest
```

```bash
bun add -D vitest
```

**TIP**
Vitest requires Vite >=v5.0.0 and Node >=v18.0.0

It is recommended that you install a copy of vitest in your package.json, using one of the methods listed above. However, if you would prefer to run vitest directly, you can use `npx vitest` (the npx tool comes with npm and Node.js).

The npx tool will execute the specified command. By default, npx will first check if the command exists in the local project's binaries. If it is not found there, npx will look in the system's $PATH and execute it if found. If the command is not found in either location, npx will install it in a temporary location prior to execution.

## Writing Tests

As an example, we will write a simple test that verifies the output of a function that adds two numbers.

`sum.js`:

```javascript
export function sum(a, b) {
  return a + b
}
```

`sum.test.js`:

```javascript
import { expect, test } from 'vitest'
import { sum } from './sum.js'

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})
```

**TIP**
By default, tests must contain `.test.` or `.spec.` in their file name.

Next, in order to execute the test, add the following section to your package.json:

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

Finally, run `npm run test`, `yarn test` or `pnpm test`, depending on your package manager, and Vitest will print this message:

```
✓ sum.test.js (1)
   ✓ adds 1 + 2 to equal 3

Test Files  1 passed (1)
     Tests  1 passed (1)
  Start at  02:15:44
  Duration  311ms
```

**WARNING**
If you are using Bun as your package manager, make sure to use `bun run test` command instead of `bun test`, otherwise Bun will run its own test runner.

Learn more about the usage of Vitest, see the [API](https://vitest.dev/api/) section.

## Configuring Vitest

One of the main advantages of Vitest is its unified configuration with Vite. If present, `vitest` will read your root `vite.config.ts` to match with the plugins and setup as your Vite app. For example, your Vite `resolve.alias` and plugins configuration will work out-of-the-box. If you want a different configuration during testing, you can:

- Create `vitest.config.ts`, which will have the higher priority
- Pass `--config` option to CLI, e.g. `vitest --config ./path/to/vitest.config.ts`
- Use `process.env.VITEST` or `mode` property on `defineConfig` (will be set to `test` if not overridden) to conditionally apply different configuration in `vite.config.ts`. Note that like any other environment variable, `VITEST` is also exposed on `import.meta.env` in your tests.

Vitest supports the same extensions for your configuration file as Vite does: `.js`, `.mjs`, `.cjs`, `.ts`, `.cts`, `.mts`. Vitest does not support `.json` extension.

If you are not using Vite as your build tool, you can configure Vitest using the `test` property in your config file:

```javascript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // ...
  },
})
```

**TIP**
Even if you do not use Vite yourself, Vitest relies heavily on it for its transformation pipeline. For that reason, you can also configure any property described in [Vite documentation](https://vitejs.dev/config/).

If you are already using Vite, add `test` property in your Vite config. You'll also need to add a reference to Vitest types using a triple slash directive at the top of your config file.

```javascript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    // ...
  },
})
```

See the list of config options in the [Config Reference](https://vitest.dev/config/)

**WARNING**
If you decide to have two separate config files for Vite and Vitest, make sure to define the same Vite options in your Vitest config file since it will override your Vite file, not extend it. You can also use `mergeConfig` method from `vite` or `vitest/config` entries to merge Vite config with Vitest config:

```javascript
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.mjs'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    // ...
  },
}))
```

However, we recommend using the same file for both Vite and Vitest, instead of creating two separate files.
