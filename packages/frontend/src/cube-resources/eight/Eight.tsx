import { Routes, Route, Link } from 'react-router-dom';
import { AzoriousHistoric } from './AzoriousHistoric.tsx';
import { TargetingMatters } from './TargetingMatters.tsx';
import { UBEvasion } from './UBEvasion.tsx';
import { GolgariLandistocrats } from './GolgariLandistocrats.tsx';
import { GruulSelfDiscard } from './GruulSelfDiscard.tsx';
import { ParadoxIncorporated } from './ParadoxIncorporated.tsx';
import { SmallReanimation } from './SmallReanimation.tsx';
import { RakdosCrimes } from './RakdosCrimes.tsx';
import { LandsLandsLands } from './LandsLandsLands.tsx';
import { SimicAnimation } from './SimicAnimation.tsx';
import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledImg } from '../../styling';
import { pipMap } from '@hellfall/shared/utils';

export const Eight = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div style={{ paddingLeft: '20px' }}>
            <title>Hells 8 Archetype Guide | Hellfall</title>
            <h1>Hells 8 Archetype Guide</h1>
            <div>
              <Link to={'/hellscubes/eight/azorious-historic'}>
                <h2>
                  <ManaSymbol src={pipMap.getPipSrc('W')} />
                  <ManaSymbol src={pipMap.getPipSrc('U')} /> Azorious Historic
                </h2>
              </Link>
            </div>
            <div>
              <Link to={'/hellscubes/eight/targeting-matters'}>
                <h2>
                  <ManaSymbol src={pipMap.getPipSrc('R')} />
                  <ManaSymbol src={pipMap.getPipSrc('W')} /> RW Targeting Matters
                </h2>
              </Link>
            </div>
            <div>
              <Link to={'/hellscubes/eight/ub-evasion'}>
                <h2>
                  <ManaSymbol src={pipMap.getPipSrc('U')} />
                  <ManaSymbol src={pipMap.getPipSrc('B')} /> UB Evasion
                </h2>
              </Link>
            </div>
            <div>
              <Link to={'/hellscubes/eight/golgari-landistocrats'}>
                <h2>
                  <ManaSymbol src={pipMap.getPipSrc('B')} />
                  <ManaSymbol src={pipMap.getPipSrc('G')} /> Golgari Landistrocrats
                </h2>
              </Link>
            </div>
            <div>
              <Link to={'/hellscubes/eight/gruul-self-discard'}>
                <h2>
                  <ManaSymbol src={pipMap.getPipSrc('R')} />
                  <ManaSymbol src={pipMap.getPipSrc('G')} /> Gruul Self-Discard
                </h2>
              </Link>
            </div>
            <div>
              <Link to={'/hellscubes/eight/paradox-incorporated'}>
                <h2>
                  <ManaSymbol src={pipMap.getPipSrc('U')} />
                  <ManaSymbol src={pipMap.getPipSrc('R')} /> Paradox Incorporated
                </h2>
              </Link>
            </div>
            <div>
              <Link to={'/hellscubes/eight/small-reanimator'}>
                <h4>
                  <ManaSymbol src={pipMap.getPipSrc('W')} />
                  <ManaSymbol src={pipMap.getPipSrc('B')} /> small reanimation
                </h4>
              </Link>
            </div>
            <div>
              <Link to={'/hellscubes/eight/rakdos-crimes'}>
                <h2>
                  <ManaSymbol src={pipMap.getPipSrc('B')} />
                  <ManaSymbol src={pipMap.getPipSrc('R')} /> Rakdos Crimes
                </h2>
              </Link>
            </div>
            <div>
              <Link to={'/hellscubes/eight/lands-lands-lands'}>
                <h2>
                  <ManaSymbol src={pipMap.getPipSrc('W')} />
                  <ManaSymbol src={pipMap.getPipSrc('G')} /> WG LANDS LANDS LANDS
                </h2>
              </Link>
            </div>
            <div>
              <Link to={'/hellscubes/eight/simic-animation'}>
                <h2>
                  <ManaSymbol src={pipMap.getPipSrc('U')} />
                  <ManaSymbol src={pipMap.getPipSrc('G')} /> Simic Animation
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

const manaSymbolStyles = createStyles({ height: '20px' });
const ManaSymbol = createStyledImg(manaSymbolStyles, 'ManaSymbol');
