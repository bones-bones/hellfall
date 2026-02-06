import { useAtom } from 'jotai';
import { isCommanderAtom, legalityAtom } from '../searchAtoms';
import { SearchCheckbox } from '../SearchCheckbox';
import { StyledLegend, StyledLabel } from '../StyledLabel';
import { StyledComponentHolder } from '../StyledComponentHolder';
import { useState } from 'react';

export const CardLegalityControls = () => {
  const [legality, setLegality] = useAtom(legalityAtom);
  const [isCommander, setIsCommander] = useAtom(isCommanderAtom);
  const [open, setOpen] = useState(legality.length > 0);

  return (
    <fieldset>
      <StyledLegend>{'Constructed Legality'}</StyledLegend>
      {open ? (
        <>
          <StyledComponentHolder>
            <StyledLabel htmlFor="constructedLegal">Standard Legal</StyledLabel>
            <SearchCheckbox
              id="constructedLegal"
              type="checkbox"
              checked={legality.includes('legal')}
              onChange={event => {
                setLegality(
                  event.target.checked ? [...legality, 'legal'] : legality.filter(e => e != 'legal')
                );
              }}
            />
          </StyledComponentHolder>
          <StyledComponentHolder>
            <StyledLabel htmlFor="4cbLegal">4 Card Blind Legal</StyledLabel>
            <SearchCheckbox
              id="4cbLegal"
              type="checkbox"
              checked={legality.includes('4cbLegal')}
              onChange={event => {
                setLegality(
                  event.target.checked
                    ? [...legality, '4cbLegal']
                    : legality.filter(e => e != '4cbLegal')
                );
              }}
            />
          </StyledComponentHolder>
          <StyledComponentHolder>
            <StyledLabel htmlFor="hellsmanderLegal">Hellsmander Legal</StyledLabel>
            <SearchCheckbox
              id="hellsmanderLegal"
              type="checkbox"
              checked={legality.includes('hellsmanderLegal')}
              onChange={event => {
                setLegality(
                  event.target.checked
                    ? [...legality, 'hellsmanderLegal']
                    : legality.filter(e => e != 'hellsmanderLegal')
                );
              }}
            />
          </StyledComponentHolder>
          <StyledComponentHolder>
            <StyledLabel htmlFor="canBeYourCommander">{'Can Be Your Commander'}</StyledLabel>
            <SearchCheckbox
              id="canBeYourCommander"
              type="checkbox"
              checked={isCommander === true}
              onChange={event => {
                setIsCommander(event.target.checked);
              }}
            />
          </StyledComponentHolder>
          <br />
          <button
            onClick={() => {
              setOpen(false);
            }}
          >
            show less
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            setOpen(true);
          }}
        >
          show more
        </button>
      )}
    </fieldset>
  );
};
