import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import MarkdownRenderer from '../components/MarkdownRenderer';
import { getLesson } from '../services/contentApi';

export default function Lesson() {
  const location = useLocation();

  const [lesson, setLesson] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const lessonPath =
    location.pathname
      .replace(/^\/+/, '')
      .replace(/\/+$/, '');

  useEffect(() => {
    async function loadLesson() {
      setLoading(true);
      setError(false);

      try {
        const data =
          await getLesson(lessonPath);

        if (!data) {
          setError(true);
          return;
        }

        setLesson(data);
      } catch (error) {
        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [lessonPath]);

  if (loading) {
    return (
      <main className="lesson-page">
        <p>Loading lesson...</p>
      </main>
    );
  }

  if (error || !lesson) {
    return (
      <main className="lesson-page">
        <h1>Lesson Not Found</h1>

        <p>
          No Markdown file exists for:
        </p>

        <code>
          {lessonPath}.md
        </code>
      </main>
    );
  }

  return (
    <main className="lesson-page">
      <MarkdownRenderer
        content={lesson.content}
      />
    </main>
  );
}