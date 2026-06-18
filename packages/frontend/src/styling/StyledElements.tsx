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
} from '@workday/canvas-kit-react';
import { handleCsProp } from '@workday/canvas-kit-styling';
import { Link, LinkProps } from 'react-router-dom';
// Making generators that are more generic than these causes massive lag

export const createStyledImg =
  (styles: string) =>
  ({ children, ...props }: React.ComponentPropsWithoutRef<'img'>) =>
    (
      <img alt="" {...handleCsProp(props, styles)}>
        {children}
      </img>
    );
export const createStenciledImg =
  <T extends React.ComponentPropsWithoutRef<'img'>>(
    stencil: (props: Record<string, unknown>) => any
  ) =>
  ({ children, ...props }: T) =>
    (
      <img alt="" {...handleCsProp(props, stencil(props))}>
        {children}
      </img>
    );

export const createStyledLabel =
  (styles: string) =>
  ({ children, ...props }: React.ComponentPropsWithoutRef<'label'>) =>
    <label {...handleCsProp(props, styles)}>{children}</label>;

export const createStyledLegend =
  (styles: string) =>
  ({ children, ...props }: React.ComponentPropsWithoutRef<'legend'>) =>
    <legend {...handleCsProp(props, styles)}>{children}</legend>;

export const createStyledInput =
  (styles: string) =>
  ({ children, ...props }: React.ComponentPropsWithoutRef<'input'>) =>
    <input {...handleCsProp(props, styles)}>{children}</input>;
export const createStenciledInput =
  <T extends React.ComponentPropsWithoutRef<'input'>>(
    stencil: (props: Record<string, unknown>) => any
  ) =>
  ({ children, ...props }: T) =>
    <input {...handleCsProp(props, stencil(props))}>{children}</input>;

export const createStyledTextArea =
  (styles: string) =>
  ({ children, ...props }: React.ComponentPropsWithoutRef<'textarea'>) =>
    <textarea {...handleCsProp(props, styles)}>{children}</textarea>;
export const createStenciledTextArea =
  <T extends React.ComponentPropsWithoutRef<'textarea'>>(
    stencil: (props: Record<string, unknown>) => any
  ) =>
  ({ children, ...props }: T) =>
    <textarea {...handleCsProp(props, stencil(props))}>{children}</textarea>;

export const createStyledSelect =
  (styles: string) =>
  ({ children, ...props }: React.ComponentPropsWithoutRef<'select'>) =>
    <select {...handleCsProp(props, styles)}>{children}</select>;

export const createStyledHR =
  (styles: string) =>
  ({ children, ...props }: React.ComponentPropsWithoutRef<'hr'>) =>
    <hr {...handleCsProp(props, styles)}>{children}</hr>;

export const createStyledH3 =
  (styles: string) =>
  ({ children, ...props }: React.ComponentPropsWithoutRef<'h3'>) =>
    <h3 {...handleCsProp(props, styles)}>{children}</h3>;
export const createStenciledH3 =
  <T extends React.ComponentPropsWithoutRef<'h3'>>(
    stencil: (props: Record<string, unknown>) => any
  ) =>
  ({ children, ...props }: T) =>
    <h3 {...handleCsProp(props, stencil(props))}>{children}</h3>;

export const createStyledButton =
  (styles: string) =>
  ({ children, ...props }: React.ComponentPropsWithoutRef<'button'>) =>
    <button {...handleCsProp(props, styles)}>{children}</button>;

export const createStyledLink =
  (styles: string) =>
  ({ children, ...props }: LinkProps) =>
    <Link {...handleCsProp(props, styles)}>{children}</Link>;
export const createStenciledLink =
  <T extends LinkProps>(stencil: (props: Record<string, unknown>) => any) =>
  ({ children, ...props }: T) =>
    <Link {...handleCsProp(props, stencil(props))}>{children}</Link>;

export const createStyledDiv =
  (styles: string) =>
  ({ children, ...props }: BoxProps) =>
    <Box {...handleCsProp(props, styles)}>{children}</Box>;
export const createStenciledDiv =
  <T extends BoxProps>(stencil: (props: Record<string, unknown>) => any) =>
  ({ children, ...props }: T) =>
    <Box {...handleCsProp(props, stencil(props))}>{children}</Box>;

export const createStyledDivClickable =
  (styles: string) =>
  ({ children, ...props }: BoxProps & React.ComponentPropsWithoutRef<'button'>) =>
    (
      <Box as={'button'} {...handleCsProp(props, styles)}>
        {children}
      </Box>
    );

export const createStyledSpan =
  (styles: string) =>
  ({ children, ...props }: TextProps) =>
    <Text {...(handleCsProp(props, styles) as any)}>{children}</Text>;
export const createStenciledSpan =
  <T extends TextProps>(stencil: (props: Record<string, unknown>) => any) =>
  ({ children, ...props }: T) =>
    <Text {...handleCsProp(props, stencil(props))}>{children}</Text>;

export const createStyledSubtext =
  (styles: string) =>
  ({ children, ...props }: TypeLevelProps) =>
    <Subtext {...(handleCsProp(props, styles) as any)}>{children}</Subtext>;

export const createStyledHeading =
  (styles: string) =>
  ({ children, ...props }: TypeLevelProps) =>
    <Heading {...(handleCsProp(props, styles) as any)}>{children}</Heading>;

export const createStyledTextInput =
  (styles: string) =>
  ({ ...props }: TextInputProps & React.ComponentPropsWithoutRef<'input'>) =>
    <TextInput {...(handleCsProp(props as any, styles) as any)} />;

export const createStyledPrimaryButton =
  (styles: string) =>
  ({ children, ...props }: PrimaryButtonProps & React.ComponentPropsWithoutRef<'button'>) =>
    <PrimaryButton {...(handleCsProp(props, styles) as any)}>{children}</PrimaryButton>;

export const createStyledPrimaryButtonLink =
  (styles: string) =>
  ({
    children,
    ...props
  }: PrimaryButtonProps & React.ComponentPropsWithoutRef<'button'> & LinkProps) =>
    (
      <PrimaryButton as={Link} {...(handleCsProp(props, styles) as any)}>
        {children}
      </PrimaryButton>
    );

export const createStyledSecondaryButton =
  (styles: string) =>
  ({ children, ...props }: SecondaryButtonProps & React.ComponentPropsWithoutRef<'button'>) =>
    <SecondaryButton {...(handleCsProp(props, styles) as any)}>{children}</SecondaryButton>;

export const createStyledSecondaryButtonLink =
  (styles: string) =>
  ({
    children,
    ...props
  }: SecondaryButtonProps & React.ComponentPropsWithoutRef<'button'> & LinkProps) =>
    (
      <SecondaryButton as={Link} {...(handleCsProp(props, styles) as any)}>
        {children}
      </SecondaryButton>
    );
