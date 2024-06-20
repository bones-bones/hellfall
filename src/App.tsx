import { BrowserRouter, useRoutes } from "react-router-dom";
import { HellFall } from "./hellfall";
import { Hellscubes } from "./hells-cubes";
import { DeckBuilder } from "./deck-builder";
import { Draft } from "./draft";
import { LandBox } from "./land-box";
import { SingleCard } from "./hellfall/SingleCard";
import { Header } from "./header";
import { Breakdown } from "./breakdown/Breakdown";

export const App = () => {
  return (
    <div>
      <BrowserRouter basename="hellfall">
        <Header />
        <ApplicationRoutes />
      </BrowserRouter>
    </div>
  );
};

const ApplicationRoutes = () => {
  return useRoutes([
    { path: "/hellscubes/*", element: <Hellscubes /> },
    { path: "/deck-builder/*", element: <DeckBuilder /> },
    { path: "/draft", element: <Draft></Draft> },
    { path: "/land-box", element: <LandBox></LandBox> },
    { path: "/", element: <HellFall /> },
    { path: "/card/*", element: <SingleCard /> },
    { path: "/breakdown", element: <Breakdown /> },
  ]);
};
