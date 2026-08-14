import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/" className="breadcrumb-link">
        Home
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.slug} className="breadcrumb-item">
            <span className="breadcrumb-separator">/</span>

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
