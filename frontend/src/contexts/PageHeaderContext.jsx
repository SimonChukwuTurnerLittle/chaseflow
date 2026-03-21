import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PageHeaderContext = createContext(null);

export function PageHeaderProvider({ children }) {
  const [header, setHeader] = useState(null);
  return (
    <PageHeaderContext.Provider value={{ header, setHeader }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

/**
 * Call from a page component to set the TopBar title, subtitle, and optional actions (ReactNode).
 */
export function useSetPageHeader(title, subtitle, actions) {
  const ctx = useContext(PageHeaderContext);
  const setHeader = ctx?.setHeader;

  useEffect(() => {
    if (setHeader) {
      setHeader({ title, subtitle, actions });
    }
    return () => {
      if (setHeader) setHeader(null);
    };
  }, [title, subtitle, actions, setHeader]);
}

export function usePageHeader() {
  return useContext(PageHeaderContext)?.header;
}
