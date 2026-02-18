import {
  BrowserRouter,
  useRoutes,
  useParams,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useSetAtom } from "jotai";
import { pipsAtom, loadPips } from "./hellfall/pipsAtom";
import { useEffect, useState } from "react";
import { HellFall } from "./hellfall";
import { Hellscubes } from "./hells-cubes";
import { DeckBuilder } from "./deck-builder";
import { Draft } from "./draft";
import { LandBox } from "./land-box";
import { SingleCard } from "./hellfall/SingleCard";
import { Header } from "./header";
import { Breakdown } from "./breakdown/Breakdown";
import { Decks } from "./decks/Decks";
import { Watchwolfwar } from "./watchWolf/WatchWolfWar";
import { Watchwolfresults } from "./watchWolf/WatchWolfResults";
import { useNameToId, useIsNonTokenName } from "./hellfall/backCompat";

const PipsInitializer = ({ children }: { children: React.ReactNode }) => {
  const setPips = useSetAtom(pipsAtom);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadPips().then((data) => {
      setPips(data);
      setIsLoaded(true);
    });
  }, [setPips]);

  if (!isLoaded) {
    return <div></div>;
  }

  return <>{children}</>;
};
const CardRoute = () => {
  const params = useParams<{ "*": string }>();
  const navigate = useNavigate();
  const cardIdentifier = params["*"];
  const IsNonTokenName = useIsNonTokenName(cardIdentifier || "");
  const cardId = useNameToId(cardIdentifier || "");
  const [shouldRender, setShouldRender] = useState(false);
  useEffect(() => {
    const handleRedirect = async () => {
      if (
        cardIdentifier == "random" ||
        (cardIdentifier && !/^\d+$/.test(cardIdentifier) && IsNonTokenName)
      ) {
        navigate(`/card/${cardId}`, { replace: true });
        return;
      }
      setShouldRender(true);
    };

    handleRedirect();
  }, [cardIdentifier, cardId, IsNonTokenName, navigate]);

  if (!shouldRender) {
    return <div></div>;
  }
  return <SingleCard />;
};

const ApplicationRoutes = () => {
  return useRoutes([
    { path: "/hellscubes/*", element: <Hellscubes /> },
    { path: "/deck-builder/*", element: <DeckBuilder /> },
    { path: "/draft", element: <Draft /> },
    { path: "/land-box", element: <LandBox /> },
    { path: "/decks/*", element: <Decks /> },
    { path: "/", element: <HellFall /> },
    {
      path: "/card/*",
      element: <CardRoute />,
    },
    { path: "/breakdown", element: <Breakdown /> },
    { path: "/Watchwolfwar", element: <Watchwolfwar /> },
    { path: "/Watchwolfresults", element: <Watchwolfresults /> },
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
