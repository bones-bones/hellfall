import { useEffect, useState } from 'react';

// import { Select } from '@workday/canvas-kit-preview-react/select';
import { cardsAtom } from '../hellfall/atoms/cardsAtom.ts';
import { Area } from './Area.tsx';
import { useAtom, useAtomValue } from 'jotai';
import { deckAtom, draftAtom } from './draftAtom.ts';
import { DeckConstruction } from './DeckConstruction.tsx';
import { CARDS_PER_PACK } from './constants.ts';
import { keyframes } from '@emotion/react';
import { canBeACommander, CardMap } from '@hellfall/shared/utils';
import type { Pack, Round, TheDraft } from './types.ts';
import { HCCard } from '@hellfall/shared/types';
import { createStyledDiv } from '../styling/StyledElements.tsx';
import { createStyles } from '@workday/canvas-kit-styling';
import { FormField, Select } from '@workday/canvas-kit-react';

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const Draft = () => {
  const [Set, setSet] = useState<'HLC' | 'HC2' | 'HC3' | 'HC4' | 'HC5' | 'HC6' | undefined>(
    undefined
  );

  const [draft, setDraft] = useAtom(draftAtom);

  const cardMap = useAtomValue(cardsAtom);

  const deckToBuild = useAtomValue(deckAtom);

  useEffect(() => {
    const draft: TheDraft = [];
    if (Set) {
      if (Set === 'HC6') {
        const nonManders = cardMap
          .getAllInSetDirect('HC6')
          .filter(card => !card.not_directly_draftable);
        const commanders = new CardMap();
        nonManders.forEach((card: HCCard.Any, id: string) => {
          if (canBeACommander(card)) {
            commanders.set(card);
            nonManders.delete(id);
          }
        });

        // const commanders = filtered.filter(canBeACommander);
        const shuffledManders = shuffle(commanders.cards());
        const shuffledNonManders = shuffle(nonManders.cards());

        for (let i = 0; i < 3; i++) {
          const round = [];
          for (let j = 0; j < 8; j++) {
            const pack: Pack = shuffledManders
              .splice(0, 2)
              .concat(shuffledNonManders.splice(0, 18));
            round.push(pack);
          }
          draft.push(round as Round);
        }
        setDraft(draft);
      } else {
        const filtered = cardMap
          .getAllInSetDirect(Set)
          .filter(card => !card.not_directly_draftable);
        const shuffled = shuffle(filtered.cards());

        for (let i = 0; i < 3; i++) {
          const round = [];
          for (let j = 0; j < 8; j++) {
            const pack: Pack = shuffled.splice(0, CARDS_PER_PACK);
            round.push(pack);
          }
          draft.push(round as Round);
        }
        setDraft(draft);
      }
    }
  }, [Set]);

  if (Set === 'HC5') {
    return (
      <ErrorContainer>
        <ErrorBanner>ERROR</ErrorBanner>
      </ErrorContainer>
    );
  }
  const options = [
    { value: '---', disabled: true },
    { value: 'HLC' },
    { value: 'HC2' },
    { value: 'HC3' },
    { value: 'HC4' },
    { value: 'HC5' },
    { value: 'HC6' },
    { value: 'HC7' },
    { value: 'HCK' },
    { value: 'HC8' },
    { value: 'HKL' },
    { value: 'NRM' },
  ];

  return (
    <>
      <title>Draft</title>
      <h2>
        Hellscube draft simulator (the bots are dumb) (if you are looking to play afterwards, try
        draftmancer instead)
      </h2>
      {cardMap && !Set && (
        <FormField>
          <Select value={Set} onChange={e => setSet(e.target.value as any)}>
            {' '}
            {options.map(entry => (
              <option key={entry.value}>{entry.value}</option>
            ))}
          </Select>
        </FormField>
      )}
      {deckToBuild.length !== 0 && <DeckConstruction cards={deckToBuild} />}
      {draft && deckToBuild.length === 0 && <Area />}
    </>
  );
};
const frames = keyframes({
  '0%': { transform: 'translate(0)' },
  '20%': { transform: 'translate(-3px, 3px)' },
  '40%': { transform: 'translate(-3px, -3px)' },
  '60%': { transform: 'translate(3px, 3px)' },
  '80%': { transform: 'translate(3px, -3px)' },
  '100%': { transform: 'translate(0)' },
});
const errorContainerStyles = createStyles({
  display: 'flex',
  justifyContent: 'center',
});
const ErrorContainer = createStyledDiv(errorContainerStyles);

const errorBannerStyles = createStyles({
  color: 'red',
  fontSize: '30px',
  fontWeight: '600',
  animation: `${frames} 0.1s linear infinite`,
});
const ErrorBanner = createStyledDiv(errorBannerStyles);
