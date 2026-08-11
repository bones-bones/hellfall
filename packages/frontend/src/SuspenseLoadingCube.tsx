import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledDiv, createStyledSVG } from './styling';

const BASE_COLORS = ['#ececec', '#c8c8c8', '#a8a8a8'] as const;

const OVERLAY_ANIMATION = 'hellfall-loading-cube-pulse 2.4s ease-in-out infinite';

const containerStyles = createStyles({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 'calc(100vh - 72px)',
});
const Container = createStyledDiv(containerStyles, 'Container');

const cubeSvgStyles = createStyles({
  width: 120,
  height: 132,
});
const CubeSvg = createStyledSVG('svg', cubeSvgStyles, 'CubeSvg');

const cubeFaceStyles = createStyles({
  stroke: 'rgba(160, 160, 160, 0.55)',
  strokeWidth: 1,
  strokeLinejoin: 'round',
});
const CubeFace = createStyledSVG('polygon', cubeFaceStyles, 'CubeFace');

const faceOverlay0Styles = createStyles({
  fill: '#000',
  stroke: 'none',
  pointerEvents: 'none',
  opacity: 0,
  animation: OVERLAY_ANIMATION,
  animationDelay: '0s',
});
const FaceOverlay0 = createStyledSVG('polygon', faceOverlay0Styles, 'FaceOverlay0');

const faceOverlay1Styles = createStyles({
  fill: '#000',
  stroke: 'none',
  pointerEvents: 'none',
  opacity: 0,
  animation: OVERLAY_ANIMATION,
  animationDelay: '0.8s',
});
const FaceOverlay1 = createStyledSVG('polygon', faceOverlay1Styles, 'FaceOverlay1');

const faceOverlay2Styles = createStyles({
  fill: '#000',
  stroke: 'none',
  pointerEvents: 'none',
  opacity: 0,
  animation: OVERLAY_ANIMATION,
  animationDelay: '1.6s',
});
const FaceOverlay2 = createStyledSVG('polygon', faceOverlay2Styles, 'FaceOverlay2');

const FACE_OVERLAYS = [FaceOverlay0, FaceOverlay1, FaceOverlay2] as const;

const FACES = [
  '50,12 78,28 50,44 22,28',
  '22,28 50,44 50,76 22,60',
  '50,44 78,28 78,60 50,76',
] as const;

export const SuspenseLoadingCube = () => (
  <Container role="status" aria-label="Loading">
    <CubeSvg viewBox="0 0 100 110" aria-hidden="true">
      {FACES.map((points, index) => (
        <CubeFace key={points} points={points} fill={BASE_COLORS[index]} />
      ))}
      {FACES.map((points, index) => {
        const FaceOverlay = FACE_OVERLAYS[index];
        return <FaceOverlay key={`overlay-${points}`} points={points} />;
      })}
    </CubeSvg>
  </Container>
);
