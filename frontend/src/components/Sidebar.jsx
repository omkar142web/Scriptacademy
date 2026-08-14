import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { useContent } from '../context/ContentContext';

function currentSlug(pathname) {
  return pathname.split('/').filter(Boolean).join('/');
}

function ancestorsOf(slug) {
  const parts = slug.split('/');
  const ancestors = [];

  for (let i = 1; i < parts.length; i += 1) {
    ancestors.push(parts.slice(0, i).join('/'));
  }

  return ancestors;
}

export default function Sidebar({ open, onClose }) {
  const { tree, treeStatus, retryTree } = useContent();
  const location = useLocation();

  const slug = currentSlug(location.pathname);

  const ancestors = useMemo(
    () => ancestorsOf(slug),
    [slug]
  );

  const [expanded, setExpanded] = useState(
    () => new Set()
  );

  useEffect(() => {
    setExpanded(previous => {
      const next = new Set(previous);
      let changed = false;

      for (const ancestor of ancestors) {
        if (!next.has(ancestor)) {
          next.add(ancestor);
          changed = true;
        }
      }

      return changed ? next : previous;
    });
  }, [ancestors]);

  const toggle = nodeSlug => {
    setExpanded(previous => {
      const next = new Set(previous);

      if (next.has(nodeSlug)) {
        next.delete(nodeSlug);
      } else {
        next.add(nodeSlug);
      }

      return next;
    });
  };

  function renderNode(node) {
    if (node.type === 'lesson') {
      return (
        <NavLink
          key={node.slug}
          to={`/${node.slug}`}
          end
          onClick={onClose}
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }
        >
          {node.title}
        </NavLink>
      );
    }

    const isOpen = expanded.has(node.slug);

    return (
      <div
        key={node.slug}
        className="sidebar-group"
      >
        <button
          type="button"
          className={`sidebar-group-title${
            slug === node.slug ? ' active' : ''
          }`}
          onClick={() => toggle(node.slug)}
          aria-expanded={isOpen}
        >
          <span
            className={`chevron${
              isOpen ? ' chevron--open' : ''
            }`}
          />
          <span className="sidebar-group-label">
            {node.title}
          </span>
        </button>

        {isOpen && (
          <div className="sidebar-children">
            {node.children.map(renderNode)}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <aside
        className={`sidebar${open ? ' sidebar--open' : ''}`}
      >
        <div className="sidebar-scroll">
          {treeStatus === 'loading' && (
            <div className="sidebar-status">
              Loading content...
            </div>
          )}

          {treeStatus === 'error' && (
            <div className="sidebar-status">
              Couldn't load content.
              <button
                type="button"
                className="sidebar-retry"
                onClick={retryTree}
              >
                Retry
              </button>
            </div>
          )}

          {treeStatus === 'ready' &&
            tree.map(renderNode)}
        </div>
      </aside>

      {open && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
        />
      )}
    </>
  );
}