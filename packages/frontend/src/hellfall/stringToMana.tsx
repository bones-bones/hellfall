// import styled from '@emotion/styled';
import type { HCColors } from '@hellfall/shared/types';
import { formatQuotes, pipMap, pipToSrc } from '@hellfall/shared/utils';
import { BoxProps } from '@workday/canvas-kit-react';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import { createStenciledDiv, createStyledImg } from '../styling';

export const stringToMana = (text: string) => {
  return formatQuotes(text)
    .split(/({.*?})/)
    .filter(e => e !== '')
    .map(entry => {
      if (entry.startsWith('{') && entry.endsWith('}')) {
        const icon = pipMap.get(entry);
        return icon ? (
          <PipContainer useShadow={!icon.no_shadow} clip_type={icon.clip_type}>
            <PipSymbol src={pipToSrc(icon)} alt={entry} title={icon.english} />
          </PipContainer>
        ) : (
          entry
        );
      }
      return entry;
    });
};

export const colorsToIndicator = (colors: HCColors) => {
  const pip = pipMap.getIndicator(colors);

  return pip ? (
    <PipContainer>
      <PipSymbol src={pipToSrc(pip)} alt={pip?.symbol} title={pip.english} />
    </PipContainer>
  ) : (
    colors.toString()
  );
};

interface PipContainerProps extends BoxProps {
  useShadow?: boolean;
  clip_type?: 'right-half' | 'top-left-third' | 'bottom-third';
}
const pipSymbol = createStyles({ height: '18px' /**,marginTop: '10px'*/ });

const PipSymbol = createStyledImg(pipSymbol, 'PipSymbol');

const pipStencil = createStencil({
  vars: {},
  base: {
    display: 'inline-block',
    fontFamily:
      '"Lato", "Helvetica Neue", Arial, Helvetica, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    lineHeight: '1.25rem',
    // alignItems: 'top',
    padding: '0px 0.75px 0px 0.75px',
    verticalAlign: 'text-bottom',
    // marginTop: '-0.25rem',
    margin: '1px 1px -1px 1px',
    cursor: 'help',
  },
  modifiers: {
    useShadow: {
      true: {
        filter: 'drop-shadow(-1.125px 1.125px 0 rgba(0,0,0,0.85))',
      },
    },
    clip_type: {
      'right-half': {
        clipPath: 'inset(0 0 0 1.125px)',
      },
      'top-left-third': {
        clipPath:
          'path("M9,0v9l-6.84,3.95-.96.55-1.32.76c-.64-1.24-1.01-2.65-1.01-4.14C-1.12,7.32.16,4.81,2.18,3.16,3.83,1.23,6.28,0,9,0Z")',
      },
      'bottom-third': {
        clipPath:
          'path("M15.59,13.5c-.53.92-1.22,1.73-2.01,2.4-1.65,1.97-4.13,3.23-6.91,3.23-3.48,0-6.5-1.97-7.99-4.86l1.32-.76,7.79-4.5,7.33,4.23.47.27Z")',
      },
    },
  },
});
const PipContainer = createStenciledDiv<PipContainerProps>(pipStencil, 'PipContainer');
