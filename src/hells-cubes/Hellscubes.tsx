import { Routes, Route } from "react-router";
import { HellsCube } from "./one";

import { CubeResources } from "./CubeResources";
import { AvatarOfBalls } from "./AvatarOfBalls";
import { Suspense } from "react";

export const Hellscubes = () => {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense>
              <CubeResources />
            </Suspense>
          }
        />
        <Route path="/one/*" element={<HellsCube />} />
        <Route path="/ballsjr" element={<AvatarOfBalls />} />
      </Routes>
    </>
  );
};
