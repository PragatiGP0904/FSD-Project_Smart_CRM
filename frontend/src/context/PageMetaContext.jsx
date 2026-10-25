import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const PageMetaContext = createContext(null);

export function PageMetaProvider({ children }) {
  const [meta, setMeta] = useState({ title: 'Dashboard', crumbs: [{ label: 'Dashboard' }] });
  const value = useMemo(() => ({ meta, setMeta }), [meta]);
  return <PageMetaContext.Provider value={value}>{children}</PageMetaContext.Provider>;
}

export function usePageMeta() {
  const context = useContext(PageMetaContext);
  if (!context) throw new Error('usePageMeta must be used within PageMetaProvider');
  return context;
}

export function useDocumentMeta(title, crumbs) {
  const { setMeta } = usePageMeta();
  const signature = JSON.stringify(crumbs);
  useEffect(() => {
    setMeta({ title, crumbs: JSON.parse(signature) });
  }, [title, signature, setMeta]);
}
