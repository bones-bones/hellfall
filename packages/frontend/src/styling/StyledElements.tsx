// // this file causes too much lag. I'll try to figure out a better approach later
// // @ts-nocheck prevent lag
// import { Box, BoxProps, CSSProperties, Text, TextProps, Subtext, TypeLevelProps } from '@workday/canvas-kit-react';
// import { createStyles } from '@workday/canvas-kit-styling';
// import { createElement } from 'react';

// type StencilResult = { className: string; style?: CSSProperties };

// const getStyleClass = (styles: CSSProperties | string): string => {
//   return typeof styles === 'string' ? styles : createStyles(styles);
// };

// export const createStyledDiv = (styles: CSSProperties| string) => {
//   const styleClass = getStyleClass(styles);
//   return ({ children, ...props }: BoxProps) => (<Box cs={styleClass} {...props}>{children}</Box>);
// };

// export const createStencilDiv = (stencil: (props: Record<string, unknown>)=>StencilResult,) => {
//   return({ children, ...props }: Record<string,unknown> & BoxProps) => (<Box {...props} cs={stencil(props)}>{children}</Box>);
// };

// export const createStyledSpan = (styles: CSSProperties| string) => {
//   const styleClass = getStyleClass(styles);
//   return ({ children, ...props }: TextProps) => (<Text cs={styleClass} {...props}>{children}</Text>);
// };

// export const createStencilSpan = (stencil: (props: Record<string, unknown>)=>StencilResult,) => {
//   return({ children, ...props }: Record<string,unknown> & TextProps) => (<Text {...props} cs={stencil(props)}>{children}</Text>);
// };

// export const createStyledSubtext = (styles: CSSProperties| string) => {
//   const styleClass = getStyleClass(styles);
//   return ({ children, ...props }: TypeLevelProps) => (<Subtext cs={styleClass} {...props}>{children}</Subtext>);
// };
// export const createStencilSubtext = (stencil: (props: Record<string, unknown>)=>StencilResult,) => {
//   return({ children, ...props }: Record<string,unknown> & TypeLevelProps) => (<Subtext {...props} cs={stencil(props)}>{children}</Subtext>);
// };

// export const createStyledIntrinsic = <T extends keyof HTMLElementTagNameMap>(
//   tag: T,
//   styles: CSSProperties| string
// ) => {
//   const styleClass = getStyleClass(styles);
//   return ({ children, ...props }: React.ComponentPropsWithoutRef<T>) => (createElement(tag, { className: styleClass, ...props }, children))
// };

// export const createStencilIntrinsic = <T extends keyof HTMLElementTagNameMap>(
//   tag: T,
//   stencil: (props: Record<string, unknown>)=>StencilResult,
// ) => {
//   return ({ children, ...props }: Record<string, unknown> & React.ComponentPropsWithoutRef<T>) => (
//     createElement(tag, { ...stencil(props), ...props }, children)
//   );
// };
