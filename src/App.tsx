import { BrowserRouter, useRoutes, useParams, Navigate } from 'react-router-dom';
import { HellFall } from './hellfall';
import { Hellscubes } from './hells-cubes';
import { DeckBuilder } from './deck-builder';
import { Draft } from './draft';
import { LandBox } from './land-box';
import { SingleCard } from './hellfall/SingleCard';
import { Header } from './header';
import { Breakdown } from './breakdown/Breakdown';
import { Decks } from './decks/Decks';

import { NameToId, IsNonTokenName } from './hellfall/backCompat';
import { Watchwolfwar } from './watchWolf/WatchWolfWar';
import { Watchwolfresults } from './watchWolf/WatchWolfResults';

interface ValidatedCardRouteProps {
  element: React.ReactElement;
}

export const App = () => {
  return (
    <BrowserRouter basename="hellfall">
      <Header />
      <ApplicationRoutes />
    </BrowserRouter>
  );
};

const ValidatedCardRoute = ({ element }: ValidatedCardRouteProps) => {
  const params = useParams<{ '*': string }>();
  const cardIdentifier = params['*'];
  if (
    (cardIdentifier &&
      !/^\d+$/.test(cardIdentifier) &&
      IsNonTokenName(cardIdentifier)) ||
    cardIdentifier == "random"
  ) {
    const cardId = NameToId(cardIdentifier);
    return <Navigate to={`/card/${cardId}`} replace />;
  }
  return element;
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
      element: <ValidatedCardRoute element={<SingleCard />} />,
    },
    { path: '/breakdown', element: <Breakdown /> },
    { path: '/Watchwolfwar', element: <Watchwolfwar /> },
    { path: '/Watchwolfresults', element: <Watchwolfresults /> },
  ]);
};
