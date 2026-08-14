import { Link, useParams } from 'react-router-dom';

import useNode from '../hooks/useNode';
import formatTitle from '../utils/formatTitle';
import Breadcrumbs from '../components/Breadcrumbs';
import {
  BackendErrorState,
  LoadingState,
  NotFoundState,
} from '../components/PageState';

export default function SubjectPage() {
  const { domain, subject } = useParams();
  const slug = `${domain}/${subject}`;
  const { node, status } = useNode(slug);

  if (status === 'loading') {
    return <LoadingState label="Loading subject..." />;
  }

  if (status === 'error') {
    return <BackendErrorState />;
  }

  if (status === 'notfound') {
    return (
      <NotFoundState
        title="Subject Not Found"
        message={`No subject named "${subject}" exists under ${formatTitle(domain)}.`}
        backTo={`/${domain}`}
        backLabel={`Back to ${formatTitle(domain)}`}
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

      <h2 className="section-title">Modules</h2>

      <section className="cards">
        {node.children.map(module => (
          <Link
            key={module.slug}
            to={`/${module.slug}`}
            className="card"
          >
            <h3>{module.title}</h3>
            {module.description && (
              <p>{module.description}</p>
            )}
          </Link>
        ))}
      </section>
    </main>
  );
}