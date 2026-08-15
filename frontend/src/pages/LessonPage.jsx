import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import useLesson from '../hooks/useLesson';
import formatTitle from '../utils/formatTitle';
import { useContent } from '../context/ContentContext';
import { useProgress } from '../context/ProgressContext';
import MarkdownRenderer from '../components/markdown';
import Breadcrumbs from '../components/Breadcrumbs';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
} from '../components/Icons';
import {
  BackendErrorState,
  LoadingState,
  NotFoundState,
} from '../components/PageState';

function stripFirstHeading(markdown) {
  return markdown.replace(/^[ \t]*#+[ \t]+.*(?:\r?\n|$)/, '');
}

export default function LessonPage() {
  const {
    domain,
    subject,
    module: moduleName,
    lesson: lessonName,
  } = useParams();

  const slug = [domain, subject, moduleName, lessonName]
    .filter(Boolean)
    .join('/');

  const { lesson: data, status } = useLesson(slug);
  const { tree } = useContent();
  const { isCompleted, toggle } = useProgress();
  const [headings, setHeadings] = useState([]);

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

  const moduleCrumb = data.breadcrumbs.find(
    crumb => crumb.slug === [domain, subject, moduleName].join('/')
  );

  let total = 0;
  let done = 0;

  const domainNode = Array.isArray(tree)
    ? tree.find(node => node.name === domain)
    : null;
  const subjectNode = domainNode
    ? (domainNode.children || []).find(
        node => node.name === subject
      )
    : null;
  const moduleNode = subjectNode
    ? (subjectNode.children || []).find(
        node => node.name === moduleName
      )
    : null;

  if (moduleNode) {
    const lessons = (moduleNode.children || []).filter(
      node => node.type === 'lesson'
    );
    total = lessons.length;
    done = lessons.filter(lesson =>
      isCompleted(lesson.slug)
    ).length;
  }

  const completed = isCompleted(data.slug);
  const percent = total ? Math.round((done / total) * 100) : 0;
  const tocItems = headings.filter(
    heading => heading.depth >= 2 && heading.depth <= 3
  );

  return (
    <main className="lesson-page">
      <Breadcrumbs items={data.breadcrumbs} />

      <header className="lesson-header">
        <div className="lesson-header-main">
          {moduleCrumb && (
            <p className="lesson-module">{moduleCrumb.title}</p>
          )}
          <h1>{data.title}</h1>
          {data.description && (
            <p className="lesson-lead">{data.description}</p>
          )}
        </div>

        <div className="lesson-header-nav">
          {data.prev ? (
            <Link
              to={`/${data.prev.slug}`}
              className="lesson-mini-btn"
              aria-label={`Previous lesson: ${data.prev.title}`}
            >
              <ArrowLeftIcon />
            </Link>
          ) : (
            <span
              className="lesson-mini-btn lesson-mini-btn--disabled"
              aria-hidden="true"
            >
              <ArrowLeftIcon />
            </span>
          )}

          {data.next ? (
            <Link
              to={`/${data.next.slug}`}
              className="lesson-mini-btn"
              aria-label={`Next lesson: ${data.next.title}`}
            >
              <ArrowRightIcon />
            </Link>
          ) : (
            <span
              className="lesson-mini-btn lesson-mini-btn--disabled"
              aria-hidden="true"
            >
              <ArrowRightIcon />
            </span>
          )}
        </div>
      </header>

      <div className="lesson-meta-row">
        <div className="lesson-progress">
          {total > 0 && (
            <>
              <span className="lesson-progress-text">
                {done} of {total} lessons completed
              </span>
              <span className="lesson-progress-track">
                <span
                  className="lesson-progress-fill"
                  style={{ width: `${percent}%` }}
                />
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          className={`lesson-complete-btn${
            completed ? ' is-complete' : ''
          }`}
          onClick={() => toggle(data.slug)}
        >
          {completed && <CheckIcon className="btn-icon" />}
          {completed ? 'Completed' : 'Mark as complete'}
        </button>
      </div>

      <div className="lesson-layout">
        <article className="lesson-body">
          <MarkdownRenderer
            content={stripFirstHeading(data.content)}
            onHeadings={setHeadings}
          />
        </article>

        {tocItems.length > 1 && (
          <aside className="lesson-toc">
            <p className="lesson-toc-title">On this page</p>
            <nav>
              {tocItems.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`lesson-toc-link lesson-toc-link--${item.depth}`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </aside>
        )}
      </div>

      <nav className="lesson-nav" aria-label="Lesson navigation">
        {data.prev ? (
          <Link
            to={`/${data.prev.slug}`}
            className="lesson-nav-btn lesson-nav-btn--prev"
          >
            <ArrowLeftIcon className="lesson-nav-arrow" />
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
            <ArrowRightIcon className="lesson-nav-arrow" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}