import { Link, useParams } from 'react-router-dom';

import useNode from '../hooks/useNode';
import Breadcrumbs from '../components/Breadcrumbs';
import {
  BackendErrorState,
  LoadingState,
  NotFoundState,
} from '../components/PageState';

export default function DomainPage() {
  const { domain } = useParams();
  const { node, status } = useNode(domain);

  if (status === 'loading') {
    return <LoadingState label="Loading domain..." />;
  }

  if (status === 'error') {
    return <BackendErrorState />;
  }

  if (status === 'notfound') {
    return (
      <NotFoundState
        title="Domain Not Found"
        message={`No domain named "${domain}" exists.`}
        backTo="/"
        backLabel="Back to Home"
      />
    );
  }

  return (
    <main className="page">
      <Breadcrumbs items={node.breadcrumbs} />

      <h1>{node.title}</h1>

      {node.description && (
        <p className="page-lead">{node.description}</p>
      )}

      <h2 className="section-title">Subjects</h2>

      <section className="cards">
        {node.children.map(subject => (
          <Link
            key={subject.slug}
            to={`/${subject.slug}`}
            className="card"
          >
            <h3>{subject.title}</h3>
            {subject.description && (
              <p>{subject.description}</p>
            )}
          </Link>
        ))}
      </section>
    </main>
  );
}