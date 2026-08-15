import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'scriptacademy:completed-lessons';

function readCompleted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed);
  } catch {
    // Ignore corrupted storage.
  }
  return new Set();
}

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [completed, setCompleted] = useState(readCompleted);

  const isCompleted = useCallback(
    slug => completed.has(slug),
    [completed]
  );

  const toggle = useCallback(slug => {
    setCompleted(previous => {
      const next = new Set(previous);

      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify([...next])
        );
      } catch {
        // Ignore storage failures.
      }

      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ isCompleted, toggle }),
    [isCompleted, toggle]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useProgress() {
  return useContext(ProgressContext);
}
