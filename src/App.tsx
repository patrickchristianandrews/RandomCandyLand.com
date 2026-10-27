import React, { useState, useEffect, useCallback } from 'react';
import { RandomCandyLandHome } from './pages/RandomCandyLandHome';
import { TrumpGotchaPage } from './pages/TrumpGotchaPage';

type AppRoute = 'home' | 'trump';

function getInitialRoute(): AppRoute {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (path.startsWith('/trump') || hash.includes('trump')) {
    return 'trump';
  }
  return 'home';
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);

  const navigateToHome = useCallback(() => {
    if (window.location.pathname !== '/' || window.location.hash !== '') {
      window.history.pushState(null, '', '/');
    }
    setCurrentRoute('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToTrump = useCallback(() => {
    if (!window.location.pathname.startsWith('/trump')) {
      window.history.pushState(null, '', '/trump');
    }
    setCurrentRoute('trump');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/trump') || hash.includes('trump')) {
        setCurrentRoute('trump');
      } else {
        setCurrentRoute('home');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  if (currentRoute === 'trump') {
    return <TrumpGotchaPage onReturnHome={navigateToHome} />;
  }

  return <RandomCandyLandHome onNavigateToTrump={navigateToTrump} />;
}
