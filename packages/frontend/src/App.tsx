import { BrowserRouter, useRoutes, useParams, useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { HellFall } from './hellfall';
import { Hellscubes } from './hells-cubes';
import { DeckBuilder } from './deck-builder';
import { Draft } from './draft';
import { LandBox } from './land-box';
import { SingleCard } from './hellfall/card/SingleCard.tsx';
import { Header } from './header';
import { Breakdown } from './breakdown/Breakdown.tsx';
import { Decks } from './decks/Decks.tsx';
import { Watchwolfwar } from './watchWolf/WatchWolfWar.tsx';
import { Watchwolfresults } from './watchWolf/WatchWolfResults.tsx';
import { useNameToId, useIsId } from './hellfall/backCompat.ts';
import { loadPipsData } from '@hellfall/shared/services/pipsService.ts';

const PipsInitializer = ({ children }: { children: React.ReactNode }) => {

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadPipsData();
    setIsLoaded(true)
  }, []);

  if (!isLoaded) {
    return <div />;
  }

  return <>{children}</>;
};
const CardRoute = () => {
  const params = useParams<{ '*': string }>();
  const navigate = useNavigate();
  const cardIdentifier = params['*'];
  const cardId = useNameToId(cardIdentifier || '');
  const IsId = useIsId(cardIdentifier || '');
  const [shouldRender, setShouldRender] = useState(false);
  useEffect(() => {
    const handleRedirect = async () => {
      if (cardIdentifier == 'random' || (!IsId && cardId)) {
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

const ApplicationRoutes = () => {
  return useRoutes([
    { path: '/hellscubes/*', element: <Hellscubes /> },
    { path: '/deck-builder/*', element: <DeckBuilder /> },
    { path: '/draft', element: <Draft /> },
    { path: '/land-box', element: <LandBox /> },
    { path: '/decks/*', element: <Decks /> },
    { path: '/', element: <HellFall /> },
    {
      path: '/card/*',
      element: <CardRoute />,
    },
    { path: '/breakdown', element: <Breakdown /> },
    { path: '/Watchwolfwar', element: <Watchwolfwar /> },
    { path: '/Watchwolfresults', element: <Watchwolfresults /> },
  ]);
};
export const App = () => {
  return (
    <BrowserRouter basename="hellfall">
      <Header />
      <PipsInitializer>
        <ApplicationRoutes />
      </PipsInitializer>
    </BrowserRouter>
  );
};
