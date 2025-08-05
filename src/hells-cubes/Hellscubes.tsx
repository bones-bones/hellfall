import { Routes, Route } from "react-router";
import { HellsCube } from "./one";

import { CubeResources } from "./CubeResources";
import { AvatarOfBalls } from "./AvatarOfBalls";
import { Suspense } from "react";
import { Eight } from "./eight";

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
        <Route path="/eight/*" element={<Eight />} />
        <Route path="/ballsjr" element={<AvatarOfBalls />} />
      </Routes>
    </>
  );
};
