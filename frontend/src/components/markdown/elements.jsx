/*
  Element-level components used by the Markdown renderer.

  Each component receives the parsed `node` (hast element) from
  react-markdown together with the standard element props, so we can
  render structure-aware enhancements (heading anchors, table
  scrolling, interactive task lists, external-link handling) while
  keeping the visual styling entirely in CSS.
*/

import { createElement, useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

/*
  ─── Heading (H1–H6) ─────────────────────────────────────────────
  Rehype-slug assigns stable, unique ids. We add a small hover
  anchor so every section is linkable and shareable.
*/
function collectText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  if (node.type === 'element' || node.type === 'root') {
    return (node.children || []).map(collectText).join('');
  }
  return '';
}

function slugify(value) {
  return (
    String(value)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section'
  );
}

export function Heading({ node, children, ...props }) {
  const id = props.id || slugify(collectText(node));
  const label = collectText(node);

  return createElement(
    node?.tagName || 'h2',
    { ...props, id },
    children,
    <a
      className="heading-anchor"
      href={`#${id}`}
      aria-label={`Link to this section${label ? `: ${label}` : ''}`}
      tabIndex="-1"
    >
      #
    </a>,
  );
}

/*
  ─── Link ─────────────────────────────────────────────────────────
  External links open in a new tab with rel protection. Internal
  lesson links (ending in `.md`) navigate client-side via the router.
*/
export function Link({ href, children, basePath }) {
  if (!href) {
    return <a>{children}</a>;
  }

  const isExternal = /^(https?:|mailto:|tel:)/i.test(href);

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  if (href.startsWith('#')) {
    return <a href={href}>{children}</a>;
  }

  if (/\.md$/i.test(href)) {
    const to = resolveLessonPath(href, basePath);
    return <RouterLink to={to}>{children}</RouterLink>;
  }

  return <a href={href}>{children}</a>;
}

/*
  Turn a Markdown link into a client-side route.

  - Absolute links (`/foo/bar.md`) are rooted at `/`.
  - Relative links (`./bar.md`, `../foo/baz.md`) are resolved against the
    current lesson's directory (`basePath`), so links keep working no
    matter how deeply a lesson is nested.
*/
function resolveLessonPath(href, basePath) {
  const cleaned = href.replace(/\.md$/i, '');
  const segments = cleaned.startsWith('/') ? [] : (basePath || '').split('/');

  for (const part of cleaned.split('/')) {
    if (part === '' || part === '.') {
      continue;
    }

    if (part === '..') {
      segments.pop();
      continue;
    }

    segments.push(part);
  }

  return `/${segments.filter(Boolean).join('/')}`;
}

/*
  ─── Image ────────────────────────────────────────────────────────
  Lazy-loaded, with a graceful fallback when the source is broken.
*/
export function Image({ src, alt, title }) {
  const [broken, setBroken] = useState(false);

  if (!src) {
    return <span className="md-image md-image--broken">image</span>;
  }

  return (
    <img
      className={broken ? 'md-image md-image--broken' : 'md-image'}
      src={src}
      alt={alt || ''}
      title={title}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

/*
  ─── Table ────────────────────────────────────────────────────────
  Wrapped in a horizontal-scroll container so wide tables never
  break the page layout.
*/
export function Table({ node: _node, children, ...props }) {
  return (
    <div className="table-wrapper">
      <table {...props}>{children}</table>
    </div>
  );
}

/*
  ─── Task list checkbox ───────────────────────────────────────────
  GFM checkboxes start disabled; we make them interactive and strike
  the parent list item through once checked.
*/
export function Input({ node: _node, checked, ...props }) {
  const [isChecked, setIsChecked] = useState(Boolean(checked));
  const ref = useRef(null);

  useEffect(() => {
    const item = ref.current ? ref.current.closest('li') : null;
    if (item) {
      item.classList.toggle('task-done', isChecked);
    }
  }, [isChecked]);

  if (props.type !== 'checkbox' || typeof checked !== 'boolean') {
    return <input ref={ref} {...props} />;
  }

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={isChecked}
      onChange={(event) => setIsChecked(event.target.checked)}
    />
  );
}