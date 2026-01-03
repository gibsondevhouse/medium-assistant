# tailwindcss-typography

The official Tailwind CSS Typography plugin provides a set of prose classes you can use to add beautiful typographic defaults to any vanilla HTML you don’t control, like HTML rendered from Markdown, or pulled from a CMS.

```html
<article class="prose lg:prose-xl">
  {{ markdown }}
</article>
```

To see what it looks like in action, check out our [live demo](https://play.tailwindcss.com/uj1vGACRJA?layout=preview) on Tailwind Play.

## Installation

Install the plugin from npm:

```bash
npm install -D @tailwindcss/typography
```

Then add the plugin to your main `style.css` file:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

If you are still using Tailwind CSS v3, add the plugin to your `tailwind.config.js` file:

```javascript
// tailwind.config.js
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

## Basic usage

Now you can use the prose classes to add sensible typography styles to any vanilla HTML:

```html
<article class="prose lg:prose-xl">
  <h1>Garlic bread with cheese: What the science tells us</h1>
  <p>
    For years parents have espoused the health benefits of eating garlic bread with cheese to their children, with the food earning such an iconic status in our culture that kids will often dress up as warm, cheesy loaf for Halloween.
  </p>
  <p>
    But a recent study shows that the celebrated appetizer may be linked to a series of rabies cases springing up around the country.
  </p>
  <!-- ... -->
</article>
```

### Choosing a gray scale

This plugin includes a modifier class for each of the five gray scales Tailwind includes by default so you can easily style your content to match the grays you're using in your project.

```html
<article class="prose prose-slate">
  {{ markdown }}
</article>
```

Here are the classes that are generated using a totally default Tailwind CSS v2.0 build:

- `prose-gray`
- `prose-slate`
- `prose-zinc`
- `prose-neutral`
- `prose-stone`

Modifier classes are designed to be used with the [multi-class modifier pattern](http://nicolasgallagher.com/about-html-semantics-front-end-architecture/#component-modifiers) and must be used in conjunction with the base `prose` class.

**Note**: Always include the prose class when adding a gray scale modifier.

### Applying a type scale

Size modifiers allow you to adjust the overall size of your typography for different contexts.

```html
<article class="prose prose-xl">
  {{ markdown }}
</article>
```

Five different typography sizes are included out of the box:

- `prose-sm`
- `prose-base`
- `prose-lg`
- `prose-xl`
- `prose-2xl`

### Adapting to dark mode

Each default color theme includes a hand-designed dark mode version that you can trigger by adding the `prose-invert` class:

```html
<article class="prose dark:prose-invert">
  {{ markdown }}
</article>
```
