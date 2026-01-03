# Tailwind Typography

## Installation

```bash
npm install -D @tailwindcss/typography
```

**tailwinc.config.js**:

```javascript
module.exports = {
  theme: {
    // ...
  },
  plugins: [
    require('@tailwindcss/typography'),
    // ...
  ],
}
```

## Basic Usage

add the `prose` class to any vanilla HTML block to turn it into a beautiful article.

```html
<article class="prose lg:prose-xl">
  <h1>Garlic bread with cheese: What the science tells us</h1>
  <p>
    For years parents have espoused the health benefits of eating garlic bread with cheese to their
    children, with the food earning such an iconic status in our culture that kids will often dress
    up as warm, cheesy loaf for Halloween.
  </p>
  <!-- ... -->
</article>
```
