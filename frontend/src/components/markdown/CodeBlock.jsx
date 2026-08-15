/*
  Code block rendering: a header with the language label (or an
  optional title taken from the fence meta) plus a copy button, and
  syntax-highlighted `<pre><code>` underneath. Mermaid fences are
  rendered as diagrams instead.
*/

import { Children, useRef, useState } from 'react';

import MermaidDiagram from './MermaidDiagram';

const LANGUAGE_LABELS = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  mjs: 'JavaScript',
  cjs: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  py: 'Python',
  python: 'Python',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  json: 'JSON',
  yml: 'YAML',
  yaml: 'YAML',
  md: 'Markdown',
  markdown: 'Markdown',
  bash: 'Bash',
  sh: 'Shell',
  shell: 'Shell',
  zsh: 'Shell',
  console: 'Terminal',
  terminal: 'Terminal',
  output: 'Output',
  text: 'Text',
  txt: 'Text',
  plaintext: 'Text',
  java: 'Java',
  c: 'C',
  h: 'C',
  cpp: 'C++',
  'c++': 'C++',
  cs: 'C#',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  sql: 'SQL',
  xml: 'XML',
  svg: 'SVG',
  dockerfile: 'Docker',
  diff: 'Diff',
  ini: 'INI',
  toml: 'TOML',
  graphql: 'GraphQL',
  kotlin: 'Kotlin',
  swift: 'Swift',
  php: 'PHP',
  ruby: 'Ruby',
  rb: 'Ruby',
  elixir: 'Elixir',
  erlang: 'Erlang',
  lua: 'Lua',
  r: 'R',
  dart: 'Dart',
  scala: 'Scala',
  perl: 'Perl',
  powershell: 'PowerShell',
  ps1: 'PowerShell',
  http: 'HTTP',
};

function formatLanguage(lang) {
  if (!lang) return 'Plain text';
  return LANGUAGE_LABELS[lang.toLowerCase()] || lang;
}

/*
  Extract an optional code-block title from the fence meta.

  Supports `title="filename.js"`, `title='filename.js'`, and a bare
  label such as `  ```js example.js `. Anything else is ignored.
*/
function getCodeTitle(meta) {
  if (typeof meta !== 'string') return null;
  const quoted = /title=["']([^"']+)["']/i.exec(meta);
  if (quoted) return quoted[1].trim();
  const bare = meta.trim();
  if (bare && /^[\w./\- ]+$/.test(bare)) return bare;
  return null;
}

function extractCodeText(children) {
  if (typeof children === 'string') return children;
  return '';
}

export function Pre({ node, children }) {
  const codeElement = Children.toArray(children)[0];
  const className = codeElement ? codeElement.props.className || '' : '';
  const langMatch = /language-([\w-]+)/.exec(className);
  const lang = langMatch ? langMatch[1] : null;

  const meta =
    node?.children?.[0]?.properties?.dataCodeMeta ??
    node?.children?.[0]?.data?.meta;
  const title = getCodeTitle(meta);

  const [copied, setCopied] = useState(false);
  const preRef = useRef(null);

  if (lang === 'mermaid') {
    const text = extractCodeText(codeElement?.props?.children);
    return <MermaidDiagram code={text} />;
  }

  async function handleCopy() {
    const text = preRef.current ? preRef.current.textContent.trim() : '';
    if (!text) return;

    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      try {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        ok = document.execCommand('copy');
        document.body.removeChild(area);
      } catch {
        ok = false;
      }
    }

    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">{title || formatLanguage(lang)}</span>
        <button
          type="button"
          className={
            copied
              ? 'code-block-copy code-block-copy--copied'
              : 'code-block-copy'
          }
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre ref={preRef} tabIndex={0}>
        {children}
      </pre>
    </div>
  );
}

export function Code({ node: _node, className, children, ...props }) {
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}