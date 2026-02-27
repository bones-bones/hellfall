import { FormField, PrimaryButton, TextInput } from '@workday/canvas-kit-react';
import { useRef, useState } from 'react';
import { cardsAtom } from '../hellfall/cardsAtom';
import { HCCard } from '../api-types';
import { HellfallEntry } from '../hellfall/HellfallEntry';
import { useAtomValue } from 'jotai';

export const AvatarOfBalls = () => {
  const cards = useAtomValue(cardsAtom);
  const powerRef = useRef<HTMLInputElement>(null);

  const numRef = useRef<HTMLInputElement>(null);

  const [cardsToRender, setCardsToRender] = useState<HCCard.Any[]>([]);
  console.log(cardsToRender);

  return (
    <>
      <h2>Avatar of BallsJr123</h2>
      <FormField label={'Power?'}>
        <TextInput type="number" defaultValue={3} ref={powerRef} />
      </FormField>
      <FormField label={'How many?'}>
        <TextInput type="number" defaultValue={2} ref={numRef} />
      </FormField>
      <PrimaryButton
        onClick={() => {
          const filtered = cards.filter(entry => {
            return (
              entry.types?.includes('Creature') &&
              ((entry.name.includes('Negative') &&
                parseInt(powerRef.current?.value || '3') == -1) ||
                entry.cmc == parseInt(powerRef.current?.value || '3') ||
                0)
            );
          });

          const cardsTo = [];
          for (let i = 0; i < parseInt(numRef.current?.value || '2'); i++) {
            cardsTo.push(filtered[Math.floor(Math.random() * filtered.length)]);
          }

          setCardsToRender(cardsTo);
        }}
      >
        BALLS
      </PrimaryButton>
      <br />
      <br />
      <div>
        {cardsToRender.map((e, i) =>
          e !== undefined ? (
            <HellfallEntry
              key={e.name + i}
              id={e.id}
              name={e.name}
              url={e.image!}
              onClick={() => {
                // void
              }}
              onClickTitle={() => {
                // void
              }}
            />
          ) : (
            <>MISS</>
          )
        )}
      </div>
    </>
  );
};

// https://scryfall.com/random?q=type%3Acreature++cmc%3D3
