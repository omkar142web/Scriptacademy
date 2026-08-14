import { Link, useLocation } from 'react-router-dom';

import { useContent } from '../context/ContentContext';
import { useSidebar } from '../context/SidebarContext';
import { MenuIcon } from './Icons';

export default function Navbar() {
  const { tree } = useContent();
  const { toggle } = useSidebar();
  const location = useLocation();

  const segments = location.pathname
    .split('/')
    .filter(Boolean);

  const isLearning = segments.length >= 3;

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
      {isLearning && (
        <button
          type="button"
          className="icon-btn navbar-menu"
          onClick={toggle}
          aria-label="Toggle navigation"
        >
          <MenuIcon className="menu-icon" />
        </button>
      )}

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