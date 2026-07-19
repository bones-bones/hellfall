import { handleCsProp, Stencil } from '@workday/canvas-kit-styling';
import { createElement } from 'react';

export const htmlIntrinsicList = [
  'aside',
  'nav',
  'section',
  'div',
  'p',
  'span',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
] as const;

export type htmlIntrinsic = (typeof htmlIntrinsicList)[number];
export type htmlIntrinsicProps = React.ComponentProps<'div'>;
export const createStyledIntrinsic = (
  tag: htmlIntrinsic,
  styles: string,
  displayName: string = 'StyledIntrinsic'
) => {
  const Component = ({ children, ...props }: htmlIntrinsicProps) =>
    createElement(tag, { ...handleCsProp(props, styles) }, children);
  (Component as any).displayName = displayName;
  return Component;
};
export const createStenciledIntrinsic = <T extends htmlIntrinsicProps>(
  tag: htmlIntrinsic,
  stencil: Stencil<any>,
  displayName: string = 'StenciledIntrinsic'
) => {
  const Component = ({ children, ...props }: T) =>
    createElement(
      tag,
      { ...handleCsProp(props, (stencil as (props: Record<string, unknown>) => any)(props)) },
      children
    );
  (Component as any).displayName = displayName;
  return Component;
};

export const htmlSVGList = ['svg', 'polygon'] as const;

export type htmlSVG = (typeof htmlSVGList)[number];
export type htmlSVGProps = React.ComponentProps<'svg'>;
export const createStyledSVG = (
  tag: htmlSVG,
  styles: string,
  displayName: string = 'StyledSVG'
) => {
  const Component = ({ children, ...props }: htmlSVGProps) =>
    createElement(tag, { ...handleCsProp(props, styles) }, children);
  (Component as any).displayName = displayName;
  return Component;
};

export const createStenciledSVG = <T extends htmlSVGProps>(
  tag: htmlSVG,
  stencil: Stencil<any>,
  displayName: string = 'StenciledSVG'
) => {
  const Component = ({ children, ...props }: T) =>
    createElement(
      tag,
      { ...handleCsProp(props, (stencil as (props: Record<string, unknown>) => any)(props)) },
      children
    );
  (Component as any).displayName = displayName;
  return Component;
};
