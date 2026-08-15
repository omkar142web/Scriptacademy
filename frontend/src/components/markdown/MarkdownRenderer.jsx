/*
  MarkdownRenderer
  ────────────────
  The single, reusable Markdown → React renderer for lesson content.

  Parser stack (all existing remark/rehype infrastructure):
  - remark-gfm     → tables, task lists, strikethrough, autolinks,
                     footnotes
  - remark-math    → `$...$` and `$$...$$` math
  - remark plugins → GitHub-style alerts, `==mark==`, emoji shortcodes
  - rehype-raw     → inline HTML in content
  - rehype-katex   → renders math with KaTeX
  - rehype-highlight → language-aware syntax highlighting
  - rehype-slug    → stable, unique heading ids

  Content and presentation stay separate: every construct is styled in
  `index.css` under `.markdown`, so the renderer is fully reusable on
  any lesson page.
*/

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';

import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import java from 'highlight.js/lib/languages/java';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import markdown from 'highlight.js/lib/languages/markdown';
import diff from 'highlight.js/lib/languages/diff';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import powershell from 'highlight.js/lib/languages/powershell';
import http from 'highlight.js/lib/languages/http';
import ini from 'highlight.js/lib/languages/ini';
import plaintext from 'highlight.js/lib/languages/plaintext';
import lua from 'highlight.js/lib/languages/lua';
import r from 'highlight.js/lib/languages/r';
import perl from 'highlight.js/lib/languages/perl';
import dart from 'highlight.js/lib/languages/dart';
import scala from 'highlight.js/lib/languages/scala';
import graphql from 'highlight.js/lib/languages/graphql';

import { remarkAlerts, remarkMark, remarkEmoji, rehypePreserveCodeMeta } from './plugins';
import { Pre, Code } from './CodeBlock';
import { Heading, Link, Image, Table, Input } from './elements';

/*
  Curated language set for syntax highlighting. Only these grammars
  ship in the main bundle; everything else stays unstyled plain text.
*/
const HIGHLIGHT_LANGUAGES = {
  js: javascript,
  javascript,
  mjs: javascript,
  cjs: javascript,
  ts: typescript,
  typescript,
  py: python,
  python,
  html: xml,
  xml,
  svg: xml,
  css,
  scss,
  json,
  yml: yaml,
  yaml,
  sh: bash,
  shell: bash,
  bash,
  c,
  h: c,
  cpp,
  'c++': cpp,
  cs: csharp,
  csharp,
  java,
  go,
  rust,
  sql,
  md: markdown,
  markdown,
  diff,
  docker: dockerfile,
  dockerfile,
  php,
  rb: ruby,
  ruby,
  swift,
  kotlin,
  ps1: powershell,
  powershell,
  http,
  ini,
  text: plaintext,
  txt: plaintext,
  plaintext,
  lua,
  r,
  perl,
  dart,
  scala,
  graphql,
};

const components = {
  pre: Pre,
  code: Code,
  h1: Heading,
  h2: Heading,
  h3: Heading,
  h4: Heading,
  h5: Heading,
  h6: Heading,
  a: Link,
  img: Image,
  table: Table,
  input: Input,
};

export default function MarkdownRenderer({ content }) {
  return (
    <article className="markdown">
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkMath,
          remarkAlerts,
          remarkMark,
          remarkEmoji,
        ]}
        rehypePlugins={[
          rehypePreserveCodeMeta,
          rehypeRaw,
          rehypeKatex,
          [rehypeHighlight, { languages: HIGHLIGHT_LANGUAGES }],
          rehypeSlug,
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}