/*
  LessonContent
  ─────────────
  Presentational renderer for a single lesson. The lesson data (body,
  breadcrumbs, prev/next) is resolved by the parent `LearningPage` and
  passed in as `lesson`.

  Relative Markdown links (e.g. `[Variables](./variables.md)`) are
  resolved against this lesson's directory so they keep working no
  matter how deep the URL is nested.
*/

import { Link } from 'react-router-dom';

import MarkdownRenderer from '../components/markdown';
import Breadcrumbs from '../components/Breadcrumbs';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from '../components/Icons';

export default function LessonContent({ lesson }) {
  const basePath = lesson.slug
    ? lesson.slug.split('/').slice(0, -1).join('/')
    : '';

  return (
    <main className="lesson-page">
      <Breadcrumbs items={lesson.breadcrumbs} />

      <MarkdownRenderer
        content={lesson.content}
        basePath={basePath}
      />

      <nav className="lesson-nav" aria-label="Lesson navigation">
        {lesson.prev ? (
          <Link
            to={`/${lesson.prev.slug}`}
            className="lesson-nav-btn lesson-nav-btn--prev"
          >
            <ArrowLeftIcon className="lesson-nav-arrow" />
            <span>
              <span className="lesson-nav-label">
                Previous
              </span>
              <span className="lesson-nav-title">
                {lesson.prev.title}
              </span>
            </span>
          </Link>
        ) : (
          <span />
        )}

        {lesson.next ? (
          <Link
            to={`/${lesson.next.slug}`}
            className="lesson-nav-btn lesson-nav-btn--next"
          >
            <span>
              <span className="lesson-nav-label">
                Next
              </span>
              <span className="lesson-nav-title">
                {lesson.next.title}
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
