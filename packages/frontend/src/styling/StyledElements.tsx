import {
  Box,
  Text,
  Subtext,
  BoxProps,
  TypeLevelProps,
  TextProps,
  PrimaryButtonProps,
  PrimaryButton,
  Heading,
  SecondaryButtonProps,
  SecondaryButton,
  TextInput,
  TextInputProps,
  BodyText,
  TertiaryButtonProps,
  TertiaryButton,
} from '@workday/canvas-kit-react';
import { handleCsProp, Stencil } from '@workday/canvas-kit-styling';
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
// Making generators that are more generic than these causes massive lag

/**
 * Here's how to use a styled component generator to replace emotion styled components:
 * Old code:
 * `const x = styled(y)(z);`
 *
 * New code:
 * `const xStyles = createStyles(z);`
 * `const x = createStyledY(xStyles, 'x');`
 */

/**
 * Here's how to use a stenciled component generator to replace emotion styled components with parameters:
 * Old code:
 * `const x = styled(y)(({ prop }: { prop: type })= > ({ styles }));`
 *
 * New code:
 * `const xStencil = createStencil(z);`
 * `interface XProps extends YProps {
 *   prop?: type
 * }
 * `const x = createStenciledY<XProps>(xStencil, 'x');`
 *
 * `YProps` should be `React.ComponentPropsWithoutRef<y>` if `y` is an intrinsic component, and should be the props type for `y` otherwise (such as `BoxProps` for `Box`)
 */

/**
 *
 */
/**
 * For both kinds of generators, don't try to pass the styles/stencil in a single line.
 * @example Don't do: `const x = createStyledImg(createStyles(y))`.
 * This is because doing it in a single line causes massive rerendering and defeats the purpose of static styling.
 */

export const createStyledImg = (styles: string, displayName: string = 'StyledImg') => {
  const Component = ({ children, ...props }: React.ComponentPropsWithoutRef<'img'>) => (
    <img alt="" {...handleCsProp(props, styles)}>
      {children}
    </img>
  );
  (Component as any).displayName = displayName;
  return Component;
};
export const createStenciledImg = <T extends React.ComponentPropsWithoutRef<'img'>>(
  stencil: Stencil<any>,
  displayName: string = 'StenciledImg'
) => {
  const Component = ({ children, ...props }: T) => (
    <img
      alt=""
      {...handleCsProp(props, (stencil as (props: Record<string, unknown>) => any)(props))}
    >
      {children}
    </img>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledLabel = (styles: string, displayName: string = 'StyledLabel') => {
  const Component = ({ children, ...props }: React.ComponentPropsWithoutRef<'label'>) => (
    <label {...handleCsProp(props, styles)}>{children}</label>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledLegend = (styles: string, displayName: string = 'StyledLegend') => {
  const Component = ({ children, ...props }: React.ComponentPropsWithoutRef<'legend'>) => (
    <legend {...handleCsProp(props, styles)}>{children}</legend>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledTable = (styles: string, displayName: string = 'StyledTable') => {
  const Component = ({ children, ...props }: React.ComponentPropsWithoutRef<'table'>) => (
    <table {...handleCsProp(props, styles)}>{children}</table>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledTableRow = (styles: string, displayName: string = 'StyledTableRow') => {
  const Component = ({ children, ...props }: React.ComponentPropsWithoutRef<'tr'>) => (
    <tr {...handleCsProp(props, styles)}>{children}</tr>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledInput = (styles: string, displayName: string = 'StyledInput') => {
  const Component = ({ children, ...props }: React.ComponentPropsWithoutRef<'input'>) => (
    <input {...handleCsProp(props, styles)}>{children}</input>
  );
  (Component as any).displayName = displayName;
  return Component;
};
export const createStenciledInput = <T extends React.ComponentPropsWithoutRef<'input'>>(
  stencil: Stencil<any>,
  displayName: string = 'StenciledInput'
) => {
  const Component = ({ children, ...props }: T) => (
    <input {...handleCsProp(props, (stencil as (props: Record<string, unknown>) => any)(props))}>
      {children}
    </input>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledTextArea = (styles: string, displayName: string = 'StyledTextArea') => {
  const Component = ({ children, ...props }: React.ComponentPropsWithoutRef<'textarea'>) => (
    <textarea {...handleCsProp(props, styles)}>{children}</textarea>
  );
  (Component as any).displayName = displayName;
  return Component;
};
export const createStyledTextAreaWithRef = (
  styles: string,
  displayName: string = 'StyledTextAreaWithRef'
) => {
  const Component = ({ children, ref, ...props }: React.ComponentPropsWithRef<'textarea'>) => (
    <textarea ref={ref} {...handleCsProp(props, styles)}>
      {children}
    </textarea>
  );
  (Component as any).displayName = displayName;
  return Component;
};
export const createStenciledTextArea = <T extends React.ComponentPropsWithoutRef<'textarea'>>(
  stencil: Stencil<any>,
  displayName: string = 'StenciledTextArea'
) => {
  const Component = ({ children, ...props }: T) => (
    <textarea {...handleCsProp(props, (stencil as (props: Record<string, unknown>) => any)(props))}>
      {children}
    </textarea>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledSelect = (styles: string, displayName: string = 'StyledSelect') => {
  const Component = ({ children, ...props }: React.ComponentPropsWithoutRef<'select'>) => (
    <select {...handleCsProp(props, styles)}>{children}</select>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledHR = (styles: string, displayName: string = 'StyledHR') => {
  const Component = ({ children, ...props }: React.ComponentPropsWithoutRef<'hr'>) => (
    <hr {...handleCsProp(props, styles)}>{children}</hr>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledListItem = (styles: string, displayName: string = 'StyledListItem') => {
  const Component = ({ children, ...props }: React.ComponentPropsWithoutRef<'li'>) => (
    <li {...handleCsProp(props, styles)}>{children}</li>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledButton = (styles: string, displayName: string = 'StyledButton') => {
  const Component = ({ children, ...props }: React.ComponentPropsWithoutRef<'button'>) => (
    <button {...handleCsProp(props, styles)}>{children}</button>
  );
  (Component as any).displayName = displayName;
  return Component;
};
export const createStenciledButton = <T extends React.ComponentPropsWithoutRef<'button'>>(
  stencil: Stencil<any>,
  displayName: string = 'StenciledButton'
) => {
  const Component = ({ children, ...props }: T) => (
    <button {...handleCsProp(props, (stencil as (props: Record<string, unknown>) => any)(props))}>
      {children}
    </button>
  );
  (Component as any).displayName = displayName;
  return Component;
};

/** Use `createStyledJumpLink` instead of this one for links with `#` */
export const createStyledLink = (styles: string, displayName: string = 'StyledLink') => {
  const Component = ({ children, ...props }: LinkProps) => (
    <Link {...handleCsProp(props, styles)}>{children}</Link>
  );
  (Component as any).displayName = displayName;
  return Component;
};
export const createStenciledLink = <T extends LinkProps>(
  stencil: Stencil<any>,
  displayName: string = 'StenciledLink'
) => {
  const Component = ({ children, ...props }: T) => (
    <Link {...handleCsProp(props, (stencil as (props: Record<string, unknown>) => any)(props))}>
      {children}
    </Link>
  );
  (Component as any).displayName = displayName;
  return Component;
};

/** Use this one instead of `createStyledLink` for links with `#` */
export const createStyledJumpLink = (styles: string, displayName: string = 'StyledJumpLink') => {
  const Component = ({ children, ...props }: React.ComponentPropsWithoutRef<'a'>) => (
    <a {...handleCsProp(props, styles)}>{children}</a>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledDiv = (styles: string, displayName: string = 'StyledDiv') => {
  const Component = ({ children, ...props }: BoxProps & React.ComponentPropsWithoutRef<'div'>) => (
    <Box {...handleCsProp(props, styles)}>{children}</Box>
  );
  (Component as any).displayName = displayName;
  return Component;
};
export interface BoxPropsWithRef extends BoxProps {
  ref?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
}
export const createStyledDivWithRef = (
  styles: string,
  displayName: string = 'StyledDivWithRef'
) => {
  const Component = ({ children, ref, ...props }: BoxPropsWithRef) => (
    <Box ref={ref} {...handleCsProp(props, styles)}>
      {children}
    </Box>
  );
  (Component as any).displayName = displayName;
  return Component;
};
export const createStenciledDiv = <T extends BoxProps>(
  stencil: Stencil<any>,
  displayName: string = 'StenciledDiv'
) => {
  const Component = ({ children, ...props }: T) => (
    <Box {...handleCsProp(props, (stencil as (props: Record<string, unknown>) => any)(props))}>
      {children}
    </Box>
  );
  (Component as any).displayName = displayName;
  return Component;
};
export type StenciledButtonDivProps = BoxProps & React.ComponentPropsWithoutRef<'button'>;
export const createStenciledButtonDiv = <T extends StenciledButtonDivProps>(
  stencil: Stencil<any>,
  displayName: string = 'StenciledButtonDiv'
) => {
  const Component = ({ children, ...props }: T) => (
    <Box
      as={'button'}
      {...handleCsProp(props, (stencil as (props: Record<string, unknown>) => any)(props))}
    >
      {children}
    </Box>
  );
  (Component as any).displayName = displayName;
  return Component;
};
export const createStyledDivClickable = (
  styles: string,
  displayName: string = 'StyledDivClickable'
) => {
  const Component = ({
    children,
    ...props
  }: BoxProps & React.ComponentPropsWithoutRef<'button'>) => (
    <Box as={'button'} {...handleCsProp(props, styles)}>
      {children}
    </Box>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledSpan = (styles: string, displayName: string = 'StyledSpan') => {
  const Component = ({ children, ...props }: TextProps) => (
    <Text {...handleCsProp(props, styles)}>{children}</Text>
  );
  (Component as any).displayName = displayName;
  return Component;
};
export const createStenciledSpan = <T extends TextProps>(
  stencil: Stencil<any>,
  displayName: string = 'StenciledSpan'
) => {
  const Component = ({ children, ...props }: T) => (
    <Text {...handleCsProp(props, (stencil as (props: Record<string, unknown>) => any)(props))}>
      {children}
    </Text>
  );
  (Component as any).displayName = displayName;
  return Component;
};

/**
 * Use this for <p>; font sizes are:
 * - large = 20px
 * - medium = 18px
 * - small = 16px
 */
export const createStyledBodyText = (styles: string, displayName: string = 'StyledBodyText') => {
  const Component = ({ children, ...props }: TypeLevelProps) => (
    <BodyText {...handleCsProp(props, styles)}>{children}</BodyText>
  );
  (Component as any).displayName = displayName;
  return Component;
};

/**
 * Use this for <p>; font sizes are:
 * - large = 14px
 * - medium = 12px
 * - small = 10px
 */
export const createStyledSubtext = (styles: string, displayName: string = 'StyledSubtext') => {
  const Component = ({ children, ...props }: TypeLevelProps) => (
    <Subtext {...handleCsProp(props, styles)}>{children}</Subtext>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledHeading = (styles: string, displayName: string = 'StyledHeading') => {
  const Component = ({ children, ...props }: TypeLevelProps) => (
    <Heading {...handleCsProp(props, styles)}>{children}</Heading>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledTextInput = (styles: string, displayName: string = 'StyledTextInput') => {
  const Component = ({ ...props }: TextInputProps & React.ComponentPropsWithoutRef<'input'>) => (
    <TextInput {...handleCsProp(props, styles)} />
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledPrimaryButton = (
  styles: string,
  displayName: string = 'StyledPrimaryButton'
) => {
  const Component = ({
    children,
    ...props
  }: PrimaryButtonProps & React.ComponentPropsWithoutRef<'button'>) => (
    <PrimaryButton as={PrimaryButton} {...handleCsProp(props, styles)}>
      {children}
    </PrimaryButton>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledPrimaryButtonLink = (
  styles: string,
  displayName: string = 'StyledPrimaryButtonLink'
) => {
  const Component = ({
    children,
    ...props
  }: PrimaryButtonProps & React.ComponentPropsWithoutRef<'button'> & LinkProps) => (
    <PrimaryButton as={Link} {...handleCsProp(props, styles)}>
      {children}
    </PrimaryButton>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledSecondaryButton = (
  styles: string,
  displayName: string = 'StyledSecondaryButton'
) => {
  const Component = ({
    children,
    ...props
  }: SecondaryButtonProps & React.ComponentPropsWithoutRef<'button'>) => (
    <SecondaryButton as={SecondaryButton} {...handleCsProp(props, styles)}>
      {children}
    </SecondaryButton>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledSecondaryButtonLink = (
  styles: string,
  displayName: string = 'StyledSecondaryButtonLink'
) => {
  const Component = ({
    children,
    ...props
  }: SecondaryButtonProps & React.ComponentPropsWithoutRef<'button'> & LinkProps) => (
    <SecondaryButton as={Link} {...handleCsProp(props, styles)}>
      {children}
    </SecondaryButton>
  );
  (Component as any).displayName = displayName;
  return Component;
};

export const createStyledTertiaryButton = (
  styles: string,
  displayName: string = 'StyledTertiaryButton'
) => {
  const Component = ({
    children,
    ...props
  }: TertiaryButtonProps & React.ComponentPropsWithoutRef<'button'>) => (
    <TertiaryButton as={TertiaryButton} {...handleCsProp(props, styles)}>
      {children}
    </TertiaryButton>
  );
  (Component as any).displayName = displayName;
  return Component;
};
