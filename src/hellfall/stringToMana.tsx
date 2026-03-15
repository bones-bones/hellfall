import styled from '@emotion/styled';
import { pipsAtom } from './pipsAtom';
import { useAtomValue } from 'jotai';
import { getDefaultStore } from 'jotai';
import { HCColors } from '../api-types';
import { sameColors } from './colorComps';
const store = getDefaultStore();
// TODO: add shadows to pips in mana costs (or maybe just always?)
// TODO: add better alt text handling (do it like scryfall does)

export const getPipSrc = (name: string) => {
  const pips = store.get(pipsAtom);
  const icon = pips?.find(e => e.symbol.toLowerCase() === name.toLowerCase());
  return icon ? '/hellfall/pips/' + icon.filename : undefined;
};

export const stringToMana = (text: string) => {
  return text
    .split(/({.*?})/)
    .filter(e => e !== '')
    .map(entry => {
      if (entry.startsWith('{') && entry.endsWith('}')) {
        const loc = getPipSrc(entry.slice(1, -1));
        return loc ? (
          <PipContainer>
            <PipSymbol src={loc} alt={entry} />
          </PipContainer>
        ) : (
          entry
        );
      }
      return entry;
    });
};

export const colorsToIndicator = (colors:HCColors) => {
  const pips = store.get(pipsAtom);
  const icon = pips?.find(e => !e.represents_mana && 'colors' in e && sameColors(e.colors!,colors));
  const loc = icon ? '/hellfall/pips/' + icon.filename : undefined;;
  return loc ? (
    <PipContainer>
      <PipSymbol src={loc} alt={icon?.symbol} />
    </PipContainer>
  ) : (
    colors.toString()
  );
}

const PipSymbol = styled('img')({ height: '18px', marginTop: '10px' });
const PipContainer = styled('div')({
  display: 'inline-flex',
  lineHeight: '1.25rem',
  alignItems: 'top',
  padding: '0 1px',
  verticalAlign: 'top',
  marginTop: '-0.25rem',
});
