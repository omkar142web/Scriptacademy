import { useEffect, useState } from 'react';

import { getLesson } from '../services/contentApi';

export default function useLesson(slug) {
  const [lesson, setLesson] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');
      setLesson(null);

      try {
        const data = await getLesson(slug);

        if (cancelled) {
          return;
        }

        if (!data) {
          setStatus('notfound');
          return;
        }

        setLesson(data);
        setStatus('ready');
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

  return { lesson, status };
}