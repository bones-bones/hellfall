import { useState } from 'react';
import { HCCard } from '@hellfall/shared/types';
import { pushProp } from '@hellfall/shared/utils';
import { FormField, Select } from '@workday/canvas-kit-react';
import { Box, BoxProps } from '@workday/canvas-kit-react';
import { landsData } from '@hellfall/shared/data';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import { createStenciledDiv, createStyledDiv, createStyledIntrinsic } from '../styling';

export const LandBox = () => {
  const lands = landsData.data as HCCard.Normal[];
  const [active, setActive] = useState<undefined | HCCard.Normal>();
  const [activeSet, setActiveSet] = useState('HBB.4');

  const grouped = lands
    .filter(e => e.set === activeSet)
    .reduce<Record<string, HCCard.Normal[]>>((landRecord, land) => {
      pushProp(landRecord, land.subtypes?.[0] ?? 'Wastes', land);
      return landRecord;
    }, {} as Record<string, HCCard.Normal[]>);
  const options = [
    { value: 'HBB.4', label: 'HC4' },
    { value: 'HBB.0', label: 'Old' },
  ];
  return (
    <>
      <title>Land Box | Hellfall</title>
      <h1>Need some lands? grab some from the land box</h1>
      <pre>
        {` How to change basic land art on Cockatrice:
       
- Download your preferred art. The name of the file should be the name of the land (e.g. Plains.png).
- Put the file into Cockatrice's custom image folder (Card Database > Open custom image folder). Reload Cockatrice if you have it open.

–exalted`}
      </pre>
      <div>
        <FormField>
          <FormField.Label>set: </FormField.Label>
          <Select value={activeSet} onChange={e => setActiveSet(e.target.value as any)}>
            {options.map(entry => (
              <option key={entry.value}>{entry.label}</option>
            ))}
          </Select>
        </FormField>
      </div>
      {active && <BigView clear={() => setActive(undefined)} land={active} />}
      <Container>
        {Object.entries(grouped)
          .sort((a, b) => {
            let aVal = 0;
            let bVal = 0;
            if (a[0].includes('Snow')) {
              aVal += 10;
            }
            if (b[0].includes('Snow')) {
              bVal += 10;
            }
            const alphaSort = a[0] > b[0] ? 1 : -1;

            return aVal + alphaSort > bVal ? 1 : -1;
          })
          .map(([type, values], j) => {
            return (
              <CardsContainer key={j}>
                <StyledH2>{type}</StyledH2>

                {values
                  .sort((a, b) => getRarityNumber(b.rarity) - getRarityNumber(a.rarity))
                  .map((entry, i) => {
                    return (
                      <LandImageContainer
                        land={entry}
                        key={i}
                        onClick={() => {
                          setActive(entry);
                        }}
                      />
                    );
                  })}
              </CardsContainer>
            );
          })}
      </Container>
    </>
  );
};
const h2Styles = createStyles({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
const StyledH2 = createStyledIntrinsic('h2', h2Styles, 'StyledH2');

const containerStyles = createStyles({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
});
const Container = createStyledDiv(containerStyles, 'Container');

const cardsContainerStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  padding: '2px',
});
const CardsContainer = createStyledDiv(cardsContainerStyles, 'CardsContainer');

const getRarityNumber = (val?: string) => {
  switch (val) {
    case 'mythic':
      return 3;
    case 'rare':
      return 2;
    case 'uncommon':
      return 1;
    default:
      return 0;
  }
};

const BigView = ({ land, clear }: { land: HCCard.Normal; clear: any }) => {
  return (
    <Box cs={bigViewContainer} onClick={clear}>
      <img
        alt={land.name}
        title={land.name}
        className={hImageStyles}
        key={land.image}
        src={land.image}
      />
      <CardFooter {...{ type: 'subtitle' }} rarity={land.rarity as any}>
        Set: {land.set} Creator: {land.creators[0]}
      </CardFooter>
    </Box>
  );
};

const bigViewContainer = createStyles({
  ':hover > [type="subtitle"]': { display: 'flex' },
  position: 'fixed',
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  zIndex: 5,
  top: '0px',
});

const LandImageContainer = ({ land, onClick }: { land: HCCard.Normal; onClick: any }) => {
  return (
    <Box cs={imageContainer} onClick={onClick}>
      <img
        alt={land.name}
        title={land.name}
        className={imageStyles}
        key={land.image}
        src={land.image}
      />
      <CardFooter {...{ type: 'subtitle' }} rarity={land.rarity as any}>
        Set: {land.set} Creator: {land.creators[0]}
      </CardFooter>
    </Box>
  );
};
const cardFooterStencil = createStencil({
  vars: {},
  base: {
    backgroundColor: 'black',
    border: '4px solid white',
    color: 'white',
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: '5px',
    minHeight: '30px',
    position: 'absolute',
    bottom: '0px',
    display: 'none',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modifiers: {
    rarity: {
      mythic: {
        backgroundColor: '#f59326',
        border: '4px solid #b43326',
        color: 'black',
      },
      rare: {
        backgroundColor: '#e9d292',
        border: '4px solid #887441',
        color: 'black',
      },
      uncommon: {
        backgroundColor: '#bae2ef',
        border: '4px solid 4b6c79',
        color: 'black',
      },
    },
  },
});
interface CardFooterProps extends BoxProps {
  rarity?: 'mythic' | 'rare' | 'uncommon';
}
const CardFooter = createStenciledDiv<CardFooterProps>(cardFooterStencil, 'CardFooter');

const imageStyles = createStyles({ width: '100%' });
const hImageStyles = createStyles({ height: '100%' });

const imageContainer = createStyles({
  height: '400px',
  width: '287px',
  position: 'relative',
  ':hover > [type="subtitle"]': { display: 'flex' },
});
