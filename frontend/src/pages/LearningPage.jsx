/*
  LearningPage
  ─────────────
  The single content-driven entry point for every "learning" route, no
  matter how deep the URL is. The previous routing assumed a fixed
  Domain / Subject / Module / Lesson depth, which broke once topic
  folders were introduced between modules and lessons.

  Instead of hard-coding each level, this page takes the full URL slug,
  resolves it against the content tree, and renders either:

    - a folder listing  (modules -> topics -> lessons), or
    - a single lesson    (Markdown body + previous/next navigation).

  The slug is rebuilt from `useLocation().pathname` so it works for any
  number of path segments.
*/

import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { getNode, getLesson } from '../services/contentApi';
import formatTitle from '../utils/formatTitle';
import Breadcrumbs from '../components/Breadcrumbs';
import LessonContent from './LessonPage';
import {
  BackendErrorState,
  LoadingState,
  NotFoundState,
} from '../components/PageState';

/*
  Resolve a slug to either a folder (with its children) or a lesson
  (with body, breadcrumbs, prev/next). One request serves folders; lessons
  fall back to the lesson endpoint for the rendered content.
*/
function useLearningContent(slug) {
  const [content, setContent] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!slug) {
      setStatus('notfound');
      return;
    }

    let cancelled = false;

    setStatus('loading');
    setContent(null);

    async function load() {
      try {
        const node = await getNode(slug);

        if (cancelled) {
          return;
        }

        if (node && node.type === 'folder') {
          setContent({ type: 'folder', node });
          setStatus('ready');
          return;
        }

        // Not a folder: fall back to loading it as a lesson.
        const lesson = await getLesson(slug);

        if (cancelled) {
          return;
        }

        if (lesson) {
          setContent({ type: 'lesson', lesson });
          setStatus('ready');
        } else {
          setStatus('notfound');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { content, status };
}

function FolderListing({ node }) {
  const folders = node.children.filter(
    (child) => child.type === 'folder',
  );
  const lessons = node.children.filter(
    (child) => child.type === 'lesson',
  );

  return (
    <main className="page">
      <Breadcrumbs items={node.breadcrumbs} />

      <h1>{node.title}</h1>

      {node.description && (
        <p className="page-lead">{node.description}</p>
      )}

      {folders.length > 0 && (
        <>
          <h2 className="section-title">Topics</h2>

          <section className="cards">
            {folders.map((topic) => (
              <Link
                key={topic.slug}
                to={`/${topic.slug}`}
                className="card"
              >
                <h3>{topic.title}</h3>
                {topic.description && (
                  <p>{topic.description}</p>
                )}
              </Link>
            ))}
          </section>
        </>
      )}

      {lessons.length > 0 && (
        <>
          <h2 className="section-title">Lessons</h2>

          <ol className="lesson-list">
            {lessons.map((lesson, index) => (
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
        </>
      )}

      {folders.length === 0 && lessons.length === 0 && (
        <p className="muted">
          This section has no content yet.
        </p>
      )}
    </main>
  );
}

export default function LearningPage() {
  const location = useLocation();
  const slug = location.pathname.replace(/^\/+|\/+$/g, '');

  const { content, status } = useLearningContent(slug);

  const parentSlug = useMemo(
    () => slug.split('/').slice(0, -1).join('/'),
    [slug],
  );
  const parentName = parentSlug.split('/').pop();

  if (status === 'loading') {
    return <LoadingState label="Loading content..." />;
  }

  if (status === 'error') {
    return <BackendErrorState />;
  }

  if (status === 'notfound') {
    return (
      <main className="page">
        <NotFoundState
          title="Page Not Found"
          message="The page you're looking for doesn't exist."
          backTo={parentSlug ? `/${parentSlug}` : '/'}
          backLabel={
            parentSlug
              ? `Back to ${formatTitle(parentName)}`
              : 'Back to Home'
          }
        />
      </main>
    );
  }

  if (content.type === 'folder') {
    return <FolderListing node={content.node} />;
  }

  return <LessonContent lesson={content.lesson} />;
}
