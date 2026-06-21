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
export type htmlIntrinsicProps = React.ComponentPropsWithoutRef<'div'>;
export const createStyledIntrinsic =
  (tag: htmlIntrinsic, styles: string) =>
  ({ children, ...props }: htmlIntrinsicProps) =>
    createElement(tag, { ...handleCsProp(props, styles) }, children);
export const createStenciledIntrinsic =
  <T extends htmlIntrinsicProps>(
    tag: htmlIntrinsic,
    stencil: Stencil<any>
  ) =>
  ({ children, ...props }: T) =>
    createElement(tag, { ...handleCsProp(props, (stencil as (props: Record<string, unknown>) => any)(props)) }, children);

export const htmlTableCellList = ['th', 'td'] as const;

export type htmlTableCell = (typeof htmlTableCellList)[number];
export type htmlTableCellProps = React.ComponentPropsWithoutRef<'th'>;
export const createStyledTableCell =
  (tag: htmlTableCell, styles: string) =>
  ({ children, ...props }: htmlTableCellProps) =>
    createElement(tag, { ...handleCsProp(props, styles) }, children);

export const htmlSVGList = ['svg', 'polygon'] as const;

export type htmlSVG = (typeof htmlSVGList)[number];
export type htmlSVGProps = React.ComponentPropsWithoutRef<'svg'>;
export const createStyledSVG =
  (tag: htmlSVG, styles: string) =>
  ({ children, ...props }: htmlSVGProps) =>
    createElement(tag, { ...handleCsProp(props, styles) }, children);

  export const createStenciledSVG =
  <T extends htmlSVGProps>(
    tag: htmlSVG,
    stencil: Stencil<any>
  ) =>
  ({ children, ...props }: T) =>
    createElement(tag, { ...handleCsProp(props, (stencil as (props: Record<string, unknown>) => any)(props)) }, children);
