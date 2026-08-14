import { Link } from 'react-router-dom';

import { useContent } from '../context/ContentContext';

export default function Home() {
  const { tree, treeStatus, retryTree } = useContent();

  return (
    <main className="page">
      <h1>Scriptacademy</h1>
      <p className="page-lead">
        Learn programming and computer science.
      </p>

      <h2 className="section-title">Domains</h2>

      {treeStatus === 'loading' && (
        <p className="muted">Loading domains...</p>
      )}

      {treeStatus === 'error' && (
        <div className="state state--inline">
          <p>Couldn't load content.</p>
          <button
            type="button"
            className="btn"
            onClick={retryTree}
          >
            Try Again
          </button>
        </div>
      )}

      {treeStatus === 'ready' && (
        <section className="cards">
          {tree.map(domain => (
            <Link
              key={domain.slug}
              to={`/${domain.slug}`}
              className="card"
            >
              <h3>{domain.title}</h3>
              {domain.description && (
                <p>{domain.description}</p>
              )}
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}