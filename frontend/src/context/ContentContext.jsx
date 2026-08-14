import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { getContentTree } from '../services/contentApi';

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [tree, setTree] = useState(null);
  const [treeStatus, setTreeStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setTreeStatus('loading');

      try {
        const data = await getContentTree();

        if (!cancelled) {
          setTree(data || []);
          setTreeStatus('ready');
        }
      } catch {
        if (!cancelled) {
          setTreeStatus('error');
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retryTree = useCallback(() => {
    setAttempt(current => current + 1);
  }, []);

  return (
    <ContentContext.Provider
      value={{ tree, treeStatus, retryTree }}
    >
      {children}
    </ContentContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useContent() {
  return useContext(ContentContext);
}