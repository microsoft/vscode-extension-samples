# smart-template-strings

A sample extension that offers completions inside template strings. Template strings and tag function are becoming popular for embedding SQL-constructs or HTML inside JavaScript or TypeScript. For instance

```js
html(...args) {
    // populate dom from args
}

html`div`
```

This sample shows how to indentify such template strings and how to provide completions inside of them.
