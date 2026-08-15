/*
  Server-side render check for the Markdown renderer.

  Renders one Markdown document that exercises every supported
  construct and asserts the expected HTML appears. Run with:

      node scripts/test-markdown.mjs
*/

import { createServer } from 'vite';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

const DOCUMENT = `---
title: This is front matter
---

# Heading One

Paragraph with **bold**, *italic*, ***bold italic***, ~~struck~~,
\`inline code\`, ==highlighted==, :rocket: emoji, and an [external link](https://example.com).

## Heading Two

A paragraph with an autolink <https://example.org> and escaped \\*characters\\*.

### Heading Three {#custom-id}

#### Heading Four

##### Heading Five

###### Heading Six

- unordered one
- unordered two
  - nested item
    1. nested ordered
    2. nested ordered two
- unordered three

1. first
2. second
   - mixed nested
3. third

- [x] completed task
- [ ] pending task

> A blockquote with **bold** and \`code\`.

> Outer quote
> > Nested quote

---

\`\`\`javascript title="greet.js"
function greet(name) {
  console.log("Hello, " + name + "!");
}
\`\`\`

\`\`\`python
def add(a, b):
    return a + b
\`\`\`

\`\`\`
plain text without a language
\`\`\`

\`\`\`output
Hello World
\`\`\`

| Name | Quantity | Price |
| :--- | :---: | ---: |
| apples | 3 | $1.20 |
| \`code\` | [link](https://example.com) | **bold** |

> [!NOTE]
> Useful information for the reader.

> [!TIP] A tip that starts inline
> Second line.

> [!WARNING]
> Be careful here.

Math: inline $E = mc^2$ and display:

$$
\\int_0^1 x^2 \\, dx = \\frac{1}{3}
$$

<kbd>Ctrl</kbd> + <kbd>C</kbd> copies text.

![alt text](https://example.com/image.png)

A footnote reference[^1] and another[^2].

[^1]: The first footnote.
[^2]: The second footnote with \`code\`.

Relative lesson link: [Variables](./variables.md)

\`\`\`mermaid
graph TD
  A[Start] --> B[Finish]
\`\`\`
`;

const CHECKS = [
  ['h1', /<h1 id="heading-one">/],
  ['h2 id', /<h2 id="heading-two">/],
  ['heading slug', /<h3 id="heading-three-custom-id">/],
  ['heading anchor', /class="heading-anchor"/],
  ['h4', /<h4 id="heading-four">/],
  ['h5', /<h5 id="heading-five">/],
  ['h6', /<h6 id="heading-six">/],
  ['bold', /<strong>/],
  ['italic', /<em>/],
  ['strikethrough', /<del>/],
  ['inline code', /<code>inline code<\/code>/],
  ['mark', /<mark>highlighted<\/mark>/],
  ['emoji', /🚀/],
  ['external link target', /href="https:\/\/example.com" target="_blank" rel="noopener noreferrer"/],
  ['autolink', /href="https:\/\/example\.org"/],
  ['ordered list', /<ol>/],
  ['unordered list', /<ul>/],
  ['nested list', /<ul>.*<ol>.*<li>nested ordered<\/li>/s],
  ['task list item', /class="task-list-item"/],
  ['task checkbox', /<input type="checkbox" checked=""/],
  ['blockquote', /<blockquote>/],
  ['nested blockquote', new RegExp('<blockquote>\\s*<p>Outer quote</p>\\s*<blockquote>')],
  ['hr', /<hr[/\s>]/],
  ['js code block', /class="code-block-header"/],
  ['code title', />greet\.js</],
  ['copy button', /class="code-block-copy"/],
  ['highlighting spans', /class="hljs/],
  ['plain text code', /Plain text/],
  ['output label', />Output</],
  ['table wrapper', /class="table-wrapper"/],
  ['table align center', /style="text-align:center"/],
  ['table align right', /style="text-align:right"/],
  ['alert note', /md-alert md-alert-note/],
  ['alert data', /data-alert="note"/],
  ['alert inline tip', /md-alert-tip/],
  ['alert warning', /md-alert-warning/],
  ['inline math', /katex/],
  ['display math', /katex-display/],
  ['kbd', /<kbd>Ctrl<\/kbd>/],
  ['image lazy', /loading="lazy"/],
  ['footnote ref', /href="#user-content-fn-1"/],
  ['footnotes section', /data-footnotes/],
  ['relative md link', /href="\/variables"/],
  ['mermaid holder', /mermaid-holder/],
];

const vite = await createServer({
  logLevel: 'error',
  server: { middlewareMode: true },
  appType: 'custom',
});

let failures = 0;

try {
  const { default: MarkdownRenderer } = await vite.ssrLoadModule(
    '/src/components/markdown/MarkdownRenderer.jsx',
  );

  const html = renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(MarkdownRenderer, { content: DOCUMENT }),
    ),
  );

  for (const [name, pattern] of CHECKS) {
    const ok = pattern.test(html);
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
    if (!ok) {
      failures += 1;
      const probe = pattern.source.replace(/\\[sSdDwW]/, '').slice(0, 60);
      const idx = probe ? html.indexOf(probe) : -1;
      const around =
        idx >= 0 ? html.slice(Math.max(0, idx - 100), idx + 160) : html.slice(0, 300);
      console.log(`       …${around.replace(/\n/g, '\\n')}…`);
    }
  }
} finally {
  await vite.close();
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\nAll checks passed');