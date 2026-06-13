import { BrowserRouter, useRoutes, useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { HellFall } from './hellfall';
import { Hellscubes } from './hells-cubes';
import { DeckBuilder } from './deck-builder';
import { Draft } from './draft';
import { LandBox } from './land-box';
import { SingleCard } from './hellfall/card/SingleCard.tsx';
import { Header } from './header';
import { Decks } from './decks/Decks.tsx';
import { WatchwolfWar } from './watchWolf/WatchWolfWar.tsx';
import { Watchwolfresults } from './watchWolf/WatchWolfResults.tsx';
import { Login } from './auth/Login.tsx';
import { ReviewPage } from './review/ReviewPage.tsx';
import { useNameToHCID, useIsHCID } from './hellfall/hooks/useNameToId.ts';
import { AdvancedSearch } from './hellfall/search-controls/AdvancedSearch.tsx';
import { Syntax } from './hellfall/Syntax.tsx';

const CardRoute = () => {
  const params = useParams<{ '*': string }>();
  const navigate = useNavigate();
  const cardIdentifier = params['*'];
  const cardId = useNameToHCID(cardIdentifier || '');
  const IsHCID = useIsHCID(cardIdentifier || '');
  const [shouldRender, setShouldRender] = useState(false);
  useEffect(() => {
    const handleRedirect = async () => {
      if (cardIdentifier == 'random' || (!IsHCID && cardId)) {
        navigate(`/card/${cardId}`, { replace: true });
        return;
      }
      setShouldRender(true);
    };

    handleRedirect();
  }, [cardIdentifier, cardId, navigate]);

  if (!shouldRender) {
    return <div />;
  }
  return <SingleCard />;
};
const RedirectBase = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/hellfall')) {
      const newPath = location.pathname.replace('/hellfall', '') + location.search;
      navigate(newPath, { replace: true, flushSync:true });
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
      <ApplicationRoutes />
    </BrowserRouter>
  );
};
