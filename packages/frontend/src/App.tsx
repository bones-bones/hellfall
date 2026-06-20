import { BrowserRouter, useRoutes, useNavigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { HellFall } from './hellfall';
import { Header } from './header';
import { CardRoute } from './CardRoute';
import { SuspenseLoadingCube } from './SuspenseLoadingCube';

const Hellscubes = lazy(() => import('./cube-resources').then(m => ({ default: m.Hellscubes })));
const DeckBuilder = lazy(() => import('./deck-builder').then(m => ({ default: m.DeckBuilder })));
const Draft = lazy(() => import('./draft').then(m => ({ default: m.Draft })));
const LandBox = lazy(() => import('./land-box').then(m => ({ default: m.LandBox })));
const Decks = lazy(() => import('./decks/Decks').then(m => ({ default: m.Decks })));
const WatchwolfWar = lazy(() =>
  import('./watchWolf/WatchWolfWar').then(m => ({ default: m.WatchwolfWar }))
);
const Watchwolfresults = lazy(() =>
  import('./watchWolf/WatchWolfResults').then(m => ({ default: m.Watchwolfresults }))
);
const Login = lazy(() => import('./auth/Login').then(m => ({ default: m.Login })));
const ReviewPage = lazy(() => import('./review/ReviewPage').then(m => ({ default: m.ReviewPage })));
const AdvancedSearch = lazy(() =>
  import('./hellfall/search-controls/AdvancedSearch').then(m => ({
    default: m.AdvancedSearch,
  }))
);
const Syntax = lazy(() => import('./hellfall/Syntax').then(m => ({ default: m.Syntax })));
const Random = lazy(() => import('./hellfall/Random').then(m => ({ default: m.Random })));

const RedirectBase = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/hellfall')) {
      const newPath = location.pathname.replace('/hellfall', '') + location.search;
      navigate(newPath, { replace: true, flushSync: true });
    }
  }, [location, navigate]);

  return null;
};

const ApplicationRoutes = () => {
  return useRoutes([
    { path: '/hellscubes/*', element: <Hellscubes /> },
    { path: '/deck-builder/*', element: <DeckBuilder /> },
    { path: '/draft', element: <Draft /> },
    { path: '/land-box', element: <LandBox /> },
    { path: '/decks/*', element: <Decks /> },
    { path: '/', element: <HellFall /> },
    { path: '/advanced', element: <AdvancedSearch /> },
    { path: '/syntax', element: <Syntax /> },
    { path: '/card/*', element: <CardRoute /> },
    { path: '/random', element: <Random /> },
    { path: '/login', element: <Login /> },
    { path: '/review/*', element: <ReviewPage /> },
    { path: '/Watchwolfwar', element: <WatchwolfWar /> },
    { path: '/Watchwolfresults', element: <Watchwolfresults /> },
  ]);
};

export const App = () => {
  return (
    <BrowserRouter>
      <RedirectBase />
      <Header />
      <Suspense fallback={<SuspenseLoadingCube />}>
        <ApplicationRoutes />
      </Suspense>
    </BrowserRouter>
  );
};
