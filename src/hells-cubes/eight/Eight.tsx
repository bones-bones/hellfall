import styled from "@emotion/styled";
import white from "../../assets/mono/W.svg";
import blue from "../../assets/mono/U.svg";
import red from "../../assets/mono/R.svg";
import black from "../../assets/mono/B.svg";
import green from "../../assets/mono/G.svg";
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
                  <ManaSymbol src={white} />
                  <ManaSymbol src={blue} /> Azorious Historic
                </h2>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/targeting-matters"}>
                <h2>
                  <ManaSymbol src={red} />
                  <ManaSymbol src={white} /> RW Targeting Matters
                </h2>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/ub-evasion"}>
                <h2>
                  <ManaSymbol src={blue} />
                  <ManaSymbol src={black} /> UB Evasion
                </h2>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/golgari-landistocrats"}>
                <h2>
                  <ManaSymbol src={black} />
                  <ManaSymbol src={green} /> Golgari Landistrocrats
                </h2>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/gruul-self-discard"}>
                <h2>
                  <ManaSymbol src={red} />
                  <ManaSymbol src={green} /> Gruul Self-Discard
                </h2>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/paradox-incorporated"}>
                <h2>
                  <ManaSymbol src={blue} />
                  <ManaSymbol src={red} /> Paradox Incorporated
                </h2>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/small-reanimator"}>
                <h4>
                  <ManaSymbol src={white} />
                  <ManaSymbol src={black} /> small reanimation
                </h4>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/rakdos-crimes"}>
                <h2>
                  <ManaSymbol src={black} />
                  <ManaSymbol src={red} /> Rakdos Crimes
                </h2>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/lands-lands-lands"}>
                <h2>
                  <ManaSymbol src={white} />
                  <ManaSymbol src={green} /> WG LANDS LANDS LANDS
                </h2>
              </Link>
            </div>
            <div>
              <Link to={"/hellscubes/eight/simic-animation"}>
                <h2>
                  <ManaSymbol src={blue} />
                  <ManaSymbol src={green} /> Simic Animation
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
