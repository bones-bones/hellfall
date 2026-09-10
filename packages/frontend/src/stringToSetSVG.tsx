import { useEffect, useRef } from 'react';

type RawSvgContext = {
  keys(): string[];
  (key: string): string;
};

const svgContext = require.context(
  '@/assets/sets',
  false,
  /\.svg$/,
  'sync'
) as unknown as RawSvgContext;

const svgByName: Record<string, string> = {};
for (const key of svgContext.keys()) {
  const name = key.replace(/^\.\//, '').replace(/\.svg$/, '');
  svgByName[name] = svgContext(key);
}

export function getSetSvg(fileName: string): string {
  const name = fileName.replace(/\.svg$/, '');
  const svg = svgByName[name];
  if (svg == null) {
    throw new Error(`SVG "${fileName}" not found. Available: ${Object.keys(svgByName).join(', ')}`);
  }
  return svg;
}

export const BlackSetSVG = ({ svg }: { svg: string }) => {
  const containerRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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

  return <svg ref={containerRef} />;
};
export const WhiteSetSVG = ({ svg }: { svg: string }) => {
  const containerRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
