import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const BASE_COLORS = ['#ececec', '#c8c8c8', '#a8a8a8'] as const;

const overlayPulse = keyframes`
  0%, 100% {
    opacity: 0;
  }
  16.66% {
    opacity: 0.38;
  }
  33.33% {
    opacity: 0;
  }
`;

const Container = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 'calc(100vh - 72px)',
});

const CubeSvg = styled('svg')({
  width: 120,
  height: 132,
});

const CubeFace = styled('polygon')({
  stroke: 'rgba(160, 160, 160, 0.55)',
  strokeWidth: 1,
  strokeLinejoin: 'round',
});

const FaceOverlay = styled('polygon')<{ delay: string }>(({ delay }) => ({
  fill: '#000',
  stroke: 'none',
  pointerEvents: 'none',
  opacity: 0,
  animation: `${overlayPulse} 2.4s ease-in-out infinite`,
  animationDelay: delay,
}));

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
      {FACES.map((points, index) => (
        <FaceOverlay key={`overlay-${points}`} points={points} delay={`${index * 0.8}s`} />
      ))}
    </CubeSvg>
  </Container>
);
