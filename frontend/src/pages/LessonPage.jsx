import { Link, useParams } from 'react-router-dom';

import useLesson from '../hooks/useLesson';
import formatTitle from '../utils/formatTitle';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Breadcrumbs from '../components/Breadcrumbs';
import {
  BackendErrorState,
  LoadingState,
  NotFoundState,
} from '../components/PageState';

export default function LessonPage() {
  const {
    domain,
    subject,
    module: moduleName,
    lesson,
  } = useParams();

  const slug = [domain, subject, moduleName, lesson]
    .filter(Boolean)
    .join('/');

  const { lesson: data, status } = useLesson(slug);

  if (status === 'loading') {
    return <LoadingState label="Loading lesson..." />;
  }

  if (status === 'error') {
    return <BackendErrorState />;
  }

  if (status === 'notfound') {
    return (
      <NotFoundState
        title="Lesson Not Found"
        message="The lesson you're looking for doesn't exist."
        backTo={`/${domain}/${subject}/${moduleName}`}
        backLabel={`Back to ${formatTitle(moduleName)}`}
      />
    );
  }

  return (
    <main className="lesson-page">
      <Breadcrumbs items={data.breadcrumbs} />

      <MarkdownRenderer content={data.content} />

      <nav className="lesson-nav" aria-label="Lesson navigation">
        {data.prev ? (
          <Link
            to={`/${data.prev.slug}`}
            className="lesson-nav-btn lesson-nav-btn--prev"
          >
            <span className="lesson-nav-arrow">&larr;</span>
            <span>
              <span className="lesson-nav-label">Previous</span>
              <span className="lesson-nav-title">
                {data.prev.title}
              </span>
            </span>
          </Link>
        ) : (
          <span />
        )}

        {data.next ? (
          <Link
            to={`/${data.next.slug}`}
            className="lesson-nav-btn lesson-nav-btn--next"
          >
            <span>
              <span className="lesson-nav-label">Next</span>
              <span className="lesson-nav-title">
                {data.next.title}
              </span>
            </span>
            <span className="lesson-nav-arrow">&rarr;</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}