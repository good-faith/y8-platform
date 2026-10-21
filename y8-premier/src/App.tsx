import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { RouteGuard } from './components/RouteGuard';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Financial } from './pages/Financial';
import { AI } from './pages/AI';
import { PWAInstall } from './components/PWAInstall';
import { UpdateBanner } from './components/UpdateBanner';
import { InstallTracker } from './components/InstallTracker';

const ROUTE_TITLES: Record<string, string> = {
  '/':          'Dashboard | Y8 Premier',
  '/financial': 'Financial | Y8 Premier',
  '/ai':        'AI Hub | Y8 Premier',
  '/auth':      'Sign In | Y8 Premier',
};

function TitleManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = ROUTE_TITLES[pathname] ?? 'Y8 Premier';
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TitleManager />
        <UpdateBanner appName="Y8 Premier" />
        <InstallTracker />
        <PWAInstall />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          
          <Route element={<RouteGuard><Layout /></RouteGuard>}>
            <Route path="/" element={<Home />} />
            <Route path="/financial" element={<Financial />} />
            <Route path="/ai" element={<AI />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

