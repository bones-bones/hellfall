import styled from '@emotion/styled';
import { useLands } from './useLands.ts';
import { useState } from 'react';
import { HCCard } from '@hellfall/shared/types';
import { pushProp } from '@hellfall/shared/utils';
import { Select } from '@workday/canvas-kit-preview-react';
import { FormField } from '@workday/canvas-kit-react';

export const LandBox = () => {
  const lands = useLands();
  const [active, setActive] = useState<undefined | HCCard.Normal>();
  const [activeSet, setActiveSet] = useState('HBB.4');

  const grouped = lands
    .filter(e => e.set === activeSet)
    .reduce<Record<string, HCCard.Normal[]>>((landRecord, land) => {
      pushProp(landRecord, land.subtypes?.[0] ?? 'Wastes', land);
      return landRecord;
    }, {} as Record<string, HCCard.Normal[]>);

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
        <FormField label="set: ">
          <Select
            value={activeSet}
            onChange={e => setActiveSet(e.target.value as any)}
            options={[
              { value: 'HBB.4', label: 'HC4' },
              { value: 'HBB.0', label: 'Old' },
            ]}
          />
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
const StyledH2 = styled.h2({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const Container = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
});
const CardsContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  padding: '2px',
});

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
    <BigViewContianer onClick={clear}>
      <StyledHImage key={land.image} src={land.image} />
      <CardFooter {...{ type: 'subtitle' }} rarity={land.rarity as any}>
        Set: {land.set} Creator: {land.creators[0]}
      </CardFooter>
    </BigViewContianer>
  );
};

const BigViewContianer = styled.div({
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
    <ImageContainer onClick={onClick}>
      <StyledImage key={land.image} src={land.image} />
      <CardFooter {...{ type: 'subtitle' }} rarity={land.rarity as any}>
        Set: {land.set} Creator: {land.creators[0]}
      </CardFooter>
    </ImageContainer>
  );
};

const CardFooter = styled.div<{ rarity?: 'mythic' | 'rare' | 'uncommon' }>(({ rarity }) => {
  let backgroundColor = 'black';
  let borderColor = 'white';
  let color = 'white';

  if (rarity == 'mythic') {
    backgroundColor = '#f59326';
    borderColor = '#b43326';
    color = 'black';
  }
  if (rarity == 'rare') {
    backgroundColor = '#e9d292';
    borderColor = '#887441';
    color = 'black';
  }
  if (rarity == 'uncommon') {
    backgroundColor = '#bae2ef';
    borderColor = '#4b6c79';
    color = 'black';
  }

  return {
    width: '100%',
    backgroundColor,
    border: `4px solid ${borderColor}`,
    boxSizing: 'border-box',
    color,
    borderRadius: '5px',
    minHeight: '30px',
    position: 'absolute',
    bottom: '0px',
    display: 'none',
    justifyContent: 'center',
    alignItems: 'center',
  };
});
const StyledImage = styled('img')({ width: '100%' });
const StyledHImage = styled('img')({ height: '100%' });

const ImageContainer = styled.div({
  height: '400px',
  width: '287px',
  position: 'relative',
  ':hover > [type="subtitle"]': { display: 'flex' },
});
