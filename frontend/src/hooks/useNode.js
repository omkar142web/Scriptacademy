import { useEffect, useState } from 'react';

import { getNode } from '../services/contentApi';

export default function useNode(slug) {
  const [node, setNode] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');
      setNode(null);

      try {
        const data = await getNode(slug);

        if (cancelled) {
          return;
        }

        if (!data || data.type === 'lesson') {
          setStatus('notfound');
          return;
        }

        setNode(data);
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

  return { node, status };
}