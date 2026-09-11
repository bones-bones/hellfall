import { useEffect, useRef } from 'react';
import { createStyledSVG } from './styling';
import { createStyles } from '@workday/canvas-kit-styling';

type RawSvgContext = {
  keys(): string[];
  (key: string): string;
};

const svgContext = require.context(
  './assets/sets',
  false,
  /\.svg$/,
  'sync'
) as unknown as RawSvgContext;

const svgByName: Record<string, string> = {};
for (const key of svgContext.keys()) {
  const name = key.replace(/^\.\//, '').replace(/\.svg$/, '');
  const mod = svgContext(key);
  svgByName[name] = typeof mod === 'string' ? mod : (mod as any).default;
}

export function getSetSvg(filename?: string): string | null {
  if (!filename) {
    return null;
  }
  const name = filename.replace(/\.svg$/, '');
  const svg = svgByName[name];
  if (svg == null) {
    throw new Error(`SVG "${filename}" not found. Available: ${Object.keys(svgByName).join(', ')}`);
  }
  return svg;
}

export const BlackSetSVG = ({ filename }: { filename?: string }) => {
  const svg = getSetSvg(filename);
  const containerRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svg) return;

    // Clear previous content to prevent duplicates on re-render
    container.innerHTML = '';

    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    if (doc.querySelector('parsererror')) {
      console.error('Invalid SVG string');
      return;
    }
    const root = doc.documentElement as unknown as SVGSVGElement;
    for (const attr of Array.from(root.attributes)) {
      container.setAttribute(attr.name, attr.value);
    }
    root.querySelectorAll('path[fill]').forEach(p => p.remove());
    while (root.firstChild) {
      container.appendChild(root.firstChild);
    }
  }, [svg]);

  return <BlackSetIcon ref={containerRef} />;
};
const blackSetIconStyles = createStyles({
  height: '18px',
  width: '20px',
  display: 'inline-block',
  fontFamily:
    '"Lato", "Helvetica Neue", Arial, Helvetica, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  lineHeight: '1.25rem',
  // alignItems: 'top',
  padding: '0px 0px 0px 0px',
  verticalAlign: 'inherit',
  // marginTop: '-0.25rem',
  margin: '1px 1px 5px 1px',
});

const BlackSetIcon = createStyledSVG('svg', blackSetIconStyles, 'BlackSetIcon');

export const WhiteSetSVG = ({ filename }: { filename: string }) => {
  const svg = getSetSvg(filename);
  const containerRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svg) return;

    // Clear previous content to prevent duplicates on re-render
    container.innerHTML = '';

    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    if (doc.querySelector('parsererror')) {
      console.error('Invalid SVG string');
      return;
    }
    const root = doc.documentElement as unknown as SVGSVGElement;
    for (const attr of Array.from(root.attributes)) {
      container.setAttribute(attr.name, attr.value);
    }
    root.querySelectorAll('path[fill]').forEach(p => p.remove());
    root.querySelectorAll('path').forEach(p => p.setAttribute('fill', '#fff'));
    while (root.firstChild) {
      container.appendChild(root.firstChild);
    }
  }, [svg]);

  return <svg ref={containerRef} />;
};
