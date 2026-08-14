import { Link, useLocation } from 'react-router-dom';

import { useContent } from '../context/ContentContext';

export default function Navbar({ onMenuClick }) {
  const { tree } = useContent();
  const location = useLocation();

  const segments = location.pathname
    .split('/')
    .filter(Boolean);

  let context = null;

  if (segments.length > 0 && Array.isArray(tree)) {
    const domain = tree.find(
      node => node.name === segments[0]
    );

    if (domain) {
      const subject = segments[1]
        ? (domain.children || []).find(
            node => node.name === segments[1]
          )
        : null;

      context = {
        domain: domain.title,
        subject: subject ? subject.title : null,
      };
    }
  }

  return (
    <header className="navbar">
      <button
        type="button"
        className="icon-btn navbar-menu"
        onClick={onMenuClick}
        aria-label="Toggle navigation"
      >
        <span className="menu-icon">
          <span />
        </span>
      </button>

      <Link to="/" className="logo">
        Scriptacademy
      </Link>

      {context && (
        <div className="navbar-context">
          <span className="navbar-context-domain">
            {context.domain}
          </span>
          {context.subject && (
            <>
              <span className="navbar-context-sep">/</span>
              <span className="navbar-context-subject">
                {context.subject}
              </span>
            </>
          )}
        </div>
      )}
    </header>
  );
}