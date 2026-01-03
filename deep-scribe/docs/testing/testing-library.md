# React Testing Library

## Installation

```bash
npm install --save-dev @testing-library/react @testing-library/dom
```

## The Problem

You want to write maintainable tests for your React components. As a part of this goal, you want your tests to avoid including implementation details of your components and rather focus on making your tests give you the confidence for which they are intended.

## The Solution

The React Testing Library is a very light-weight solution for testing React components. It provides light utility functions on top of react-dom and react-dom/test-utils, in a way that encourages better testing practices.

Primary guiding principle:
> The more your tests resemble the way your software is used, the more confidence they can give you.

It exposes a recommended way to find elements by a `data-testid` as an "escape hatch" for elements where the text content and label do not make sense or is not practical.
