import { Link, useParams } from 'react-router-dom';

import useNode from '../hooks/useNode';
import formatTitle from '../utils/formatTitle';
import Breadcrumbs from '../components/Breadcrumbs';
import {
  BackendErrorState,
  LoadingState,
  NotFoundState,
} from '../components/PageState';

export default function ModulePage() {
  const { domain, subject, module: moduleName } = useParams();
  const slug = `${domain}/${subject}/${moduleName}`;
  const { node, status } = useNode(slug);

  if (status === 'loading') {
    return <LoadingState label="Loading module..." />;
  }

  if (status === 'error') {
    return <BackendErrorState />;
  }

  if (status === 'notfound') {
    return (
      <NotFoundState
        title="Module Not Found"
        message={`No module named "${moduleName}" exists under ${formatTitle(subject)}.`}
        backTo={`/${domain}/${subject}`}
        backLabel={`Back to ${formatTitle(subject)}`}
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

      <h2 className="section-title">Lessons</h2>

      <ol className="lesson-list">
        {node.children.map((lesson, index) => (
          <li key={lesson.slug}>
            <Link
              to={`/${lesson.slug}`}
              className="lesson-list-link"
            >
              <span className="lesson-list-number">
                {index + 1}
              </span>
              <span className="lesson-list-body">
                <span className="lesson-list-title">
                  {lesson.title}
                </span>
                {lesson.description && (
                  <span className="lesson-list-desc">
                    {lesson.description}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}