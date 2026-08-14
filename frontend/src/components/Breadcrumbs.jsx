import { Link } from 'react-router-dom';

import { ChevronIcon, HomeIcon } from './Icons';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link
        to="/"
        className="breadcrumb-link breadcrumb-home"
      >
        <HomeIcon className="breadcrumb-home-icon" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.slug} className="breadcrumb-item">
            <ChevronIcon className="breadcrumb-separator" />

            {isLast ? (
              <span className="breadcrumb-current">
                {item.title}
              </span>
            ) : (
              <Link to={`/${item.slug}`} className="breadcrumb-link">
                {item.title}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}