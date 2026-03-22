import { BrowserRouter, useRoutes, useParams, useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { pipsAtom, loadPips } from './hellfall/atoms/pipsAtom';
import { useEffect, useState } from 'react';
import { HellFall } from './hellfall';
import { Hellscubes } from './hells-cubes';
import { DeckBuilder } from './deck-builder';
import { Draft } from './draft';
import { LandBox } from './land-box';
import { SingleCard } from './hellfall/card/SingleCard';
import { Header } from './header';
import { Breakdown } from './breakdown/Breakdown';
import { Decks } from './decks/Decks';
import { WatchwolfWar } from './watchWolf/WatchWolfWar';
import { Watchwolfresults } from './watchWolf/WatchWolfResults';
import { Login } from './auth/Login';
import { useNameToId, useIsId } from './hellfall/backCompat';

const PipsInitializer = ({ children }: { children: React.ReactNode }) => {
  const setPips = useSetAtom(pipsAtom);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadPips().then(data => {
      setPips(data);
      setIsLoaded(true);
    });
  }, [setPips]);

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
    { path: '/login', element: <Login /> },
    { path: '/Watchwolfwar', element: <WatchwolfWar /> },
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
