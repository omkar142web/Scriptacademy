import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useParams } from 'react-router-dom';

import { useContent } from '../context/ContentContext';
import { ChevronIcon } from './Icons';

function SidebarTree({ nodes, expanded, toggle, onClose }) {
  return nodes.map((node) => {
    if (node.type === 'lesson') {
      return (
        <NavLink
          key={node.slug}
          to={`/${node.slug}`}
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
      <div key={node.slug} className="sidebar-group">
        <button
          type="button"
          className={`sidebar-group-title${
            isOpen ? ' active' : ''
          }`}
          onClick={() => toggle(node.slug)}
          aria-expanded={isOpen}
        >
          <ChevronIcon
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
            <SidebarTree
              nodes={node.children}
              expanded={expanded}
              toggle={toggle}
              onClose={onClose}
            />
          </div>
        )}
      </div>
    );
  });
}

export default function Sidebar({ open, onClose }) {
  const { tree, treeStatus, retryTree } = useContent();
  const { domain, subject } = useParams();
  const location = useLocation();

  const currentSlug = location.pathname.replace(/^\/+|\/+$/g, '');

  const subjectNode = useMemo(() => {
    if (!Array.isArray(tree)) {
      return null;
    }

    const domainNode = tree.find(
      (node) => node.name === domain,
    );

    if (!domainNode) {
      return null;
    }

    return (
      (domainNode.children || []).find(
        (node) => node.name === subject,
      ) || null
    );
  }, [tree, domain, subject]);

  const [expanded, setExpanded] = useState(() => new Set());

  useEffect(() => {
    if (!subjectNode || !currentSlug) {
      return;
    }

    setExpanded((previous) => {
      const next = new Set(previous);

      currentSlug.split('/').reduce((prefix, segment) => {
        const path = prefix ? `${prefix}/${segment}` : segment;
        // Expand every ancestor folder so the active lesson stays visible.
        next.add(path);
        return path;
      }, '');

      return next;
    });
  }, [currentSlug, subjectNode]);

  const toggle = (slug) => {
    setExpanded((previous) => {
      const next = new Set(previous);

      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }

      return next;
    });
  };

  return (
    <>
      <aside
        className={`sidebar${open ? ' sidebar--open' : ''}`}
      >
        {subjectNode && (
          <div className="sidebar-header">
            <Link
              to={`/${domain}/${subject}`}
              className="sidebar-subject-link"
              onClick={onClose}
            >
              {subjectNode.title}
            </Link>
          </div>
        )}

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
            subjectNode &&
            subjectNode.children && (
              <SidebarTree
                nodes={subjectNode.children}
                expanded={expanded}
                toggle={toggle}
                onClose={onClose}
              />
            )}
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
