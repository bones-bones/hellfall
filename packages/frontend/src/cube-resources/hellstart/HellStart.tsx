import { useAtomValue, useSetAtom } from 'jotai';
import { cardsAtom } from '../../hellfall/atoms/cardsAtom.ts';
import { HCCard } from '@hellfall/shared/types';
import { GridEntry } from '../../hellfall/display/GridEntry.tsx';
import { ActiveCardPanel } from '../../hellfall/ActiveCardPanel.tsx';
import { activeCardAtom } from '../../hellfall/atoms/searchAtoms.ts';
import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledDiv } from '../../styling';

export const HellStart = () => {
  const cards = useAtomValue(cardsAtom);
  const setActiveCard = useSetAtom(activeCardAtom);

  const HCJPackDisplay = ({ entry }: { entry: HCCard.Any }) => {
    return (
      <span>
        <GridEntry
          url={entry.image!}
          id={entry.id}
          name={entry.name.split(' - ')[0]}
          otherNames={[]}
          imgLinkUrl={`/?q=tag%3D${encodeURIComponent(entry.tags![0])}+set%3DHCJ`}
          onClick={() => {
            window.open(`/?q=tag%3D${encodeURIComponent(entry.tags![0])}+set%3DHCJ`, '_blank');
          }}
          onClickTitle={(event: React.MouseEvent) => {
            if (event.button === 1 || event.metaKey || event.ctrlKey) {
              window.open(`/card/${encodeURIComponent(entry.id)}`, '_blank');
            } else {
              setActiveCard(entry.id);
            }
          }}
        />
      </span>
    );
  };

  return (
    <Container>
      <ActiveCardPanel />
      <title>Hellstart | Hellfall</title>
      <code>
        8 person &quot;draft&quot; format. each player receives four packs, and drafts one. they are
        then passed three packs, and may pick one. the remaining two packs are discarded/unused.
        each player now has two packs that compose their jumpstart boosters. games are best of 1.
        pack page is formated to copy/paste into cock easily.
      </code>
      <br />
      <h1 style={{ lineHeight: 0.5 }}>Packs</h1>
      <div>
        {cards.getAllInSet('FHCJ').map(entry => (
          <HCJPackDisplay key={entry.tags?.[0]} entry={entry} />
        ))}
      </div>
    </Container>
  );
};

const containerStyles = createStyles({
  marginTop: '10px',
  paddingLeft: '32px',
  paddingRight: '32px',
});
const Container = createStyledDiv(containerStyles, 'Container');
