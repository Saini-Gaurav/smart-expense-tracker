import { useEffect, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardProvider } from './contexts/DashboardContext';
import AppShell from './layouts/AppShell';
import AuthPage from './pages/AuthPage';
import ExpensesPage from './pages/ExpensesPage';
import OverviewPage from './pages/OverviewPage';
import { useAuth } from './state/AuthContext';

function Protected({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function CatchAll() {
  const { user } = useAuth();
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  const { hydrate, user } = useAuth();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="login" />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="register" />} />
      <Route
        path="/"
        element={
          <Protected>
            <DashboardProvider>
              <AppShell />
            </DashboardProvider>
          </Protected>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OverviewPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
      </Route>
      <Route path="*" element={<CatchAll />} />
    </Routes>
  );
}
