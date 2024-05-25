import { Routes, Route } from "react-router";
import { HellsCube } from "./one";

import { Header } from "../header";

import { CubeResources } from "./CubeResources";

export const Hellscubes = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<CubeResources />} />
        <Route path="/one/*" element={<HellsCube />} />
      </Routes>
    </>
  );
};
