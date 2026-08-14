import {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    setOpen(previous => !previous);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <SidebarContext.Provider
      value={{ open, toggle, close }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useSidebar() {
  return useContext(SidebarContext);
}