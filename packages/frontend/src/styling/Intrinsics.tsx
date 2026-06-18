import { handleCsProp } from '@workday/canvas-kit-styling';
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
    stencil: (props: Record<string, unknown>) => any
  ) =>
  ({ children, ...props }: T) =>
    createElement(tag, { ...handleCsProp(props, stencil(props)) }, children);

export const htmlTableCellList = ['th', 'td'] as const;

export type htmlTableCell = (typeof htmlTableCellList)[number];
export type htmlTableCellProps = React.ComponentPropsWithoutRef<'th'>;
export const createStyledTableCell =
  (tag: htmlTableCell, styles: string) =>
  ({ children, ...props }: htmlTableCellProps) =>
    createElement(tag, { ...handleCsProp(props, styles) }, children);
