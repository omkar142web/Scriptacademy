import { useEffect, useMemo, useState } from 'react';
import {
  Link,
  NavLink,
  useParams,
} from 'react-router-dom';

import { useContent } from '../context/ContentContext';
import { useProgress } from '../context/ProgressContext';
import { CheckIcon, ChevronIcon } from './Icons';

export default function Sidebar({ open, onClose }) {
  const { tree, treeStatus, retryTree } = useContent();
  const { isCompleted } = useProgress();
  const { domain, subject, module: moduleName } = useParams();

  const subjectNode = useMemo(() => {
    if (!Array.isArray(tree)) {
      return null;
    }

    const domainNode = tree.find(
      node => node.name === domain
    );

    if (!domainNode) {
      return null;
    }

    return (
      (domainNode.children || []).find(
        node => node.name === subject
      ) || null
    );
  }, [tree, domain, subject]);

  const modules = useMemo(
    () =>
      (subjectNode?.children || []).filter(
        node => node.type === 'folder'
      ),
    [subjectNode]
  );

  const lessonCount = useMemo(() => {
    if (!subjectNode) return 0;

    let count = 0;
    const walk = nodes => {
      for (const node of nodes) {
        if (node.type === 'lesson') {
          count += 1;
        } else {
          walk(node.children || []);
        }
      }
    };

    walk(subjectNode.children || []);
    return count;
  }, [subjectNode]);

  const [expanded, setExpanded] = useState(
    () => new Set()
  );

  useEffect(() => {
    if (!moduleName) {
      return;
    }

    setExpanded(previous => {
      if (previous.has(moduleName)) {
        return previous;
      }

      const next = new Set(previous);
      next.add(moduleName);
      return next;
    });
  }, [moduleName]);

  const toggle = name => {
    setExpanded(previous => {
      const next = new Set(previous);

      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
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
            <div className="sidebar-meta">
              {lessonCount} lessons
              {modules.length > 0 && ` · ${modules.length} sections`}
            </div>
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
            modules.map(module => {
              const isOpen = expanded.has(module.name);
              const isCurrent = module.name === moduleName;

              return (
                <div
                  key={module.slug}
                  className="sidebar-group"
                >
                  <button
                    type="button"
                    className={`sidebar-group-title${
                      isCurrent ? ' active' : ''
                    }`}
                    onClick={() => toggle(module.name)}
                    aria-expanded={isOpen}
                  >
                    <ChevronIcon
                      className={`chevron${
                        isOpen ? ' chevron--open' : ''
                      }`}
                    />
                    <span className="sidebar-group-label">
                      {module.title}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="sidebar-children">
                      {module.children
                        .filter(
                          node => node.type === 'lesson'
                        )
                        .map(lesson => (
                          <NavLink
                            key={lesson.slug}
                            to={`/${lesson.slug}`}
                            end
                            onClick={onClose}
                            className={({ isActive }) =>
                              `sidebar-link${
                                isActive ? ' active' : ''
                              }`
                            }
                          >
                            <span
                              className={`lesson-status${
                                isCompleted(lesson.slug)
                                  ? ' is-complete'
                                  : ''
                              }`}
                              aria-hidden="true"
                            >
                              {isCompleted(lesson.slug) && (
                                <CheckIcon className="lesson-status-check" />
                              )}
                            </span>
                            <span className="sidebar-lesson-label">
                              {lesson.title}
                            </span>
                          </NavLink>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
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