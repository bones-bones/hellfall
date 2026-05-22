import { useAtomValue } from 'jotai';
import { cardsAtom } from '../../hellfall/atoms/cardsAtom.ts';
import styled from '@emotion/styled';
import { HCCard } from '@hellfall/shared/types';
import { getFilteredSet } from '@hellfall/shared/filters';

export const HellStart = () => {
  const cards = useAtomValue(cardsAtom);

  return (
    <Container>
      <title>Hellstart | Hellfall</title>
      <pre>
        8 person &quot;draft&quot;format. each player receives four packs, and drafts one. they are
        then passed three packs, and may pick one. the remaining two packs are discarded/unused.
        each player now has two packs that compose their jumpstart boosters. games are best of 1.
        pack page is formated to copy/paste into cock easily.
      </pre>
      Packs
      <div>
        {getFilteredSet(cards, 'FHCJ').map(entry => (
          <HCJPackDisplay key={entry.tags?.[0]} entry={entry} />
        ))}
      </div>
    </Container>
  );
};

const Container = styled.div({});

const HCJPackDisplay = ({ entry }: { entry: HCCard.Any }) => {
  return (
    <div>
      <h3>{entry.name}</h3>
      <img src={entry.image} />
      ...
    </div>
  );
};
