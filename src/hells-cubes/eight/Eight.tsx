import styled from "@emotion/styled";
import { getPipSrc } from "../../hellfall/stringToMana";
import { Routes, Route, Link } from "react-router-dom";
import { AzoriousHistoric } from "./AzoriousHistoric";
import { TargetingMatters } from "./TargetingMatters";
import { UBEvasion } from "./UBEvasion";
import { GolgariLandistocrats } from "./GolgariLandistocrats";
import { GruulSelfDiscard } from "./GruulSelfDiscard";
import { ParadoxIncorporated } from "./ParadoxIncorporated";
import { SmallReanimation } from "./SmallReanimation";
import { RakdosCrimes } from "./RakdosCrimes";
import { LandsLandsLands } from "./LandsLandsLands";
import { SimicAnimation } from "./SimicAnimation";

export const Eight = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div style={{ paddingLeft: "20px" }}>
            <h1>Hells 8 Archetype Guide</h1>
            <div>
              <Link to={"/hellscubes/eight/azorious-historic"}>
                <h2>
                  <ManaSymbol src={getPipSrc("W")} />
                  <ManaSymbol src={getPipSrc("U")} /> Azorious Historic
                </h2>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/targeting-matters"}>
                <h2>
                  <ManaSymbol src={getPipSrc("R")} />
                  <ManaSymbol src={getPipSrc("W")} /> RW Targeting Matters
                </h2>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/ub-evasion"}>
                <h2>
                  <ManaSymbol src={getPipSrc("U")} />
                  <ManaSymbol src={getPipSrc("B")} /> UB Evasion
                </h2>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/golgari-landistocrats"}>
                <h2>
                  <ManaSymbol src={getPipSrc("B")} />
                  <ManaSymbol src={getPipSrc("G")} /> Golgari Landistrocrats
                </h2>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/gruul-self-discard"}>
                <h2>
                  <ManaSymbol src={getPipSrc("R")} />
                  <ManaSymbol src={getPipSrc("G")} /> Gruul Self-Discard
                </h2>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/paradox-incorporated"}>
                <h2>
                  <ManaSymbol src={getPipSrc("U")} />
                  <ManaSymbol src={getPipSrc("R")} /> Paradox Incorporated
                </h2>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/small-reanimator"}>
                <h4>
                  <ManaSymbol src={getPipSrc("W")} />
                  <ManaSymbol src={getPipSrc("B")} /> small reanimation
                </h4>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/rakdos-crimes"}>
                <h2>
                  <ManaSymbol src={getPipSrc("B")} />
                  <ManaSymbol src={getPipSrc("R")} /> Rakdos Crimes
                </h2>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/lands-lands-lands"}>
                <h2>
                  <ManaSymbol src={getPipSrc("W")} />
                  <ManaSymbol src={getPipSrc("G")} /> WG LANDS LANDS LANDS
                </h2>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/simic-animation"}>
                <h2>
                  <ManaSymbol src={getPipSrc("U")} />
                  <ManaSymbol src={getPipSrc("G")} /> Simic Animation
                </h2>
              </Link>
            </div>
          </div>
        }
      />
      <Route path="/azorious-historic" element={<AzoriousHistoric />} />
      <Route path="/targeting-matters" element={<TargetingMatters />} />
      <Route path="/ub-evasion" element={<UBEvasion />} />
      <Route path="/golgari-landistocrats" element={<GolgariLandistocrats />} />
      <Route path="/gruul-self-discard" element={<GruulSelfDiscard />} />
      <Route path="/paradox-incorporated" element={<ParadoxIncorporated />} />
      <Route path="/small-reanimator" element={<SmallReanimation />} />
      <Route path="/rakdos-crimes" element={<RakdosCrimes />} />
      <Route path="/lands-lands-lands" element={<LandsLandsLands />} />
      <Route path="/simic-animation" element={<SimicAnimation />} />
    </Routes>
  );
};

const ManaSymbol = styled("img")({ height: "20px" });
