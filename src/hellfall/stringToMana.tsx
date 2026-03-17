import styled from '@emotion/styled';
import { pipsAtom } from './atoms/pipsAtom';
import { useAtomValue } from 'jotai';
import { getDefaultStore } from 'jotai';
import { HCCardSymbol, HCColors } from '../api-types';
import { sameColors } from './colorComps';
const store = getDefaultStore();

export const getPipSrc = (name: string) => {
  const pips = store.get(pipsAtom);
  const icon = pips?.find(e => e.symbol.toLowerCase() === name.toLowerCase());
  return icon ? '/hellfall/pips/' + icon.filename : undefined;
};
export const getPip = (name: string) => {
  const pips = store.get(pipsAtom);
  return pips?.find(e => e.symbol.toLowerCase() === name.toLowerCase());
};
export const pipToSrc = (pip:HCCardSymbol) => {
  return '/hellfall/pips/' + pip.filename;
}
const getClipPath = (pip:HCCardSymbol) => {
  if (!pip.clip_type) {
    return undefined
  }
  switch(pip.clip_type) {
    case 'right-half':
      return 'inset(0 0 0 1.125px)';
    case 'top-left-third':
      return 'path("M9,0v9l-6.84,3.95-.96.55-1.32.76c-.64-1.24-1.01-2.65-1.01-4.14C-1.12,7.32.16,4.81,2.18,3.16,3.83,1.23,6.28,0,9,0Z")';
    case 'bottom-third':
      return 'path("M15.59,13.5c-.53.92-1.22,1.73-2.01,2.4-1.65,1.97-4.13,3.23-6.91,3.23-3.48,0-6.5-1.97-7.99-4.86l1.32-.76,7.79-4.5,7.33,4.23.47.27Z")'
    default:
      return undefined;
  }
};
export const isNoShadow = (name: string) => {
  const pips = store.get(pipsAtom);
  const icon = pips?.find(e => e.symbol.toLowerCase() === name.toLowerCase());
  return icon?.no_shadow as boolean;
};


export const stringToMana = (text: string) => {
  return text
    .split(/({.*?})/)
    .filter(e => e !== '')
    .map(entry => {
      if (entry.startsWith('{') && entry.endsWith('}')) {
        const icon = getPip(entry.slice(1, -1));
        const noShadow=isNoShadow(entry.slice(1,-1))
        return icon ? (
          <PipContainer style={icon.no_shadow ? {margin: '1px 1px -px 1px'} : { filter:'drop-shadow(-1.125px 1.125px 0 rgba(0,0,0,0.85))', clipPath:getClipPath(icon)}}>
            <PipSymbol
              src={pipToSrc(icon)}
              alt={entry}
              title={icon.english}
            />
          </PipContainer>
        ) : (
          entry
        );
      }
      return entry;
    });
};

export const colorsToIndicator = (colors: HCColors) => {
  const pips = store.get(pipsAtom);
  const icon = pips?.find(
    e => !e.represents_mana && 'colors' in e && sameColors(e.colors!, colors)
  );

  // const loc = icon ? '/hellfall/pips/' + icon.filename : undefined;
  return icon ? (
    <PipContainer>
      <PipSymbol src={pipToSrc(icon)} alt={icon?.symbol} title={icon.english} />
    </PipContainer>
  ) : (
    colors.toString()
  );
};

const PipSymbol = styled('img')({ height: '18px'/**,marginTop: '10px'*/});
const PipContainer = styled('div')({
  display: 'inline-block',
  lineHeight: '1.25rem',
  // alignItems: 'top',
  padding: '0px 0.75px 0px 0.75px',
  verticalAlign: 'text-bottom',
  // marginTop: '-0.25rem',
  margin: '1px 1px -1px 1px',
  cursor:'help',
});
