import { BrowserRouter, useRoutes } from "react-router-dom";
import { HellFall } from "./hellfall";
import { Hellscubes } from "./hells-cubes";
import { DeckBuilder } from "./deck-builder";
import { Draft } from "./draft";

export const App = () => {
  return (
    <div>
      <BrowserRouter basename="hellfall">
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
    { path: "/", element: <HellFall /> },
  ]);
};
