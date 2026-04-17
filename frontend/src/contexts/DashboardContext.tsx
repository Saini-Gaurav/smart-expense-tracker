import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type DashboardContextValue = {
  filterStart: string;
  filterEnd: string;
  setFilterStart: (v: string) => void;
  setFilterEnd: (v: string) => void;
  resetDateRange: () => void;
  dataVersion: number;
  bumpRefresh: () => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [dataVersion, setDataVersion] = useState(0);

  const resetDateRange = useCallback(() => {
    setFilterStart('');
    setFilterEnd('');
  }, []);

  const bumpRefresh = useCallback(() => {
    setDataVersion((v) => v + 1);
  }, []);

  const value = useMemo(
    () => ({
      filterStart,
      filterEnd,
      setFilterStart,
      setFilterEnd,
      resetDateRange,
      dataVersion,
      bumpRefresh,
    }),
    [filterStart, filterEnd, resetDateRange, dataVersion, bumpRefresh]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
