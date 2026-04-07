import { useAtom, useAtomValue } from 'jotai';
import { cardsAtom } from '../hellfall/atoms/cardsAtom';
import { HCCard } from '../api-types';
import styled from '@emotion/styled';
import { xIcon } from '@workday/canvas-system-icons-web';

import { SidePanel, SidePanelOpenDirection } from '@workday/canvas-kit-react/side-panel';
import { Card, TertiaryButton, ToolbarIconButton } from '@workday/canvas-kit-react';
import { HellfallCard } from '../hellfall/card/HellfallCard';
import { activeCardAtom } from '../hellfall/atoms/searchAtoms';
import { canBeACommander } from '../hellfall/canBeACommander';
// TODO: make sure this still works
export const Breakdown = () => {
  const cards = useAtomValue(cardsAtom).filter(e => e.set === 'HC7.0');
  const [activeCardFromAtom, setActiveCardFromAtom] = useAtom(activeCardAtom);
  const activeCard = cards.find(entry => {
    return entry.id === activeCardFromAtom;
  });

  const sorted = cards.reduce<Record<string, HCCard.Any[]>>((curr, next) => {
    if (curr[next.toFaces()[0]?.colors.join() || 'undefined']) {
      curr[next.toFaces()[0]?.colors.join() || 'undefined'].push(next);
    } else {
      curr[next.toFaces()[0]?.colors.join() || 'undefined'] = [next];
    }

    return curr;
  }, {});

  const canBeCommander = cards
    .filter(e => canBeACommander(e))
    .reduce<Record<string, HCCard.Any[]>>(
      (curr, next) => {
        const colorSet = Array.from(new Set(next.color_identity.flat().filter(Boolean))).sort();
        console.log(colorSet);
        if (curr[next.toFaces()[0]?.colors.join('') || 'undefined']) {
          curr[next.toFaces()[0]?.colors.join('') || 'undefined'].push(next);
        } else {
          curr[next.toFaces()[0]?.colors.join('') || 'undefined'] = [next];
        }

        return curr;
      },
      {
        W: [],
        U: [],
        B: [],
        R: [],
        G: [],
        WU: [],
        WB: [],
        WR: [],
        WG: [],
        UB: [],
        UR: [],
        UG: [],
        BR: [],
        BG: [],
        RG: [],
        // WUB: [],
        // WUR: [],
        // WUG: [],
        // WBR: [],
        // WBG: [],
        // WRG: [],
      }
    );

  return (
    <>
      {cards.length}
      <StyledSidePanel
        openWidth={window.screen.width > 450 ? 810 : 400}
        openDirection={SidePanelOpenDirection.Right}
        open={!!activeCard}
      >
        {!!activeCard && (
          <Card>
            <Card.Body padding={'zero'}>
              <SPContainer>
                <ToolbarIconButton icon={xIcon} onClick={() => setActiveCardFromAtom('')} />
                {activeCard && <HellfallCard data={activeCard} />}
              </SPContainer>
            </Card.Body>
          </Card>
        )}
      </StyledSidePanel>

      <ColorTracker cards={sorted} color={'White'} />
      <ColorTracker cards={sorted} color={'Black'} />
      <ColorTracker cards={sorted} color={'Blue'} />
      <ColorTracker cards={sorted} color={'Red'} />
      <ColorTracker cards={sorted} color={'Green'} />
      <ColorTracker cards={sorted} color={'Purple'} />
      {/* <h2>Commanders (not ready)</h2>
      {Object.entries(canBeCommander)
        .sort((a, b) => {
          if (a[0].split(";").length > b[0].split(";").length) {
            return 1;
          }
          return -1;
        })
        .map(([key, cards]) => {
          return <div key={key}>{`${key}: ${cards.length}`}</div>;
        })} */}
    </>
  );
};
const CardColumn = styled.div({ display: 'flex', flexDirection: 'column' });
const CMCColumn = styled.div({ width: '14vw' });
const Container = styled.div({ display: 'flex' });
const CardEntry = styled.div<{
  isCreature: boolean;
  cardColor: 'White' | 'Blue' | 'Black' | 'Red' | 'Green' | 'Purple' | 'Colorless' | 'Multicolor';
}>(({ isCreature, cardColor }) => ({
  height: '40px',
  border: '1px solid black',
  overflow: 'hidden',
  boxSizing: 'border-box' as const,
  backgroundColor: cardColor + (isCreature ? 'EE' : '99'),
}));

const hexForColor = (
  color: 'White' | 'Blue' | 'Black' | 'Red' | 'Green' | 'Colorless' | 'Purple' | 'Multicolor'
) => {
  switch (color) {
    case 'White': {
      return '#f8e7b9';
    }
    case 'Blue': {
      return '#0e67ab';
    }
    case 'Black': {
      return '#a69f9d';
    }
    case 'Red': {
      return '#eba082';
    }
    case 'Green': {
      return '#00733d';
    }
    case 'Colorless': {
      return '#Colorless';
    }
    case 'Purple': {
      return '#702963';
    }
    default:
      return '#c2ae00';
  }
};

const ColorTracker = ({ cards, color }: { cards: Record<string, HCCard.Any[]>; color: string }) => {
  const [_activeCardFromAtom, setActiveCardFromAtom] = useAtom(activeCardAtom);

  return (
    <div style={{ border: `2px solid ${color}` }}>
      <h2>
        {color} ({cards[color].length})
      </h2>

      <Container>
        {new Array(7).fill(1).map((_, index) => {
          const uhh = cards[color]
            .sort((a, b) => {
              if (
                a.toFaces()[0].types?.includes('Creature') &&
                b.toFaces()[0].types?.includes('Creature')
              ) {
                return a.toFaces()[0].name > b.toFaces()[0].name ? 1 : -1;
              }
              if (
                a.toFaces()[0].types?.includes('Creature') &&
                !b.toFaces()[0].types?.includes('Creature')
              ) {
                return -1;
              }

              return 1;
            })
            .filter(entry => {
              if (!entry.mana_value && index == 0) {
                return true;
              }

              return entry.mana_value === index + 1 || (index + 1 == 7 && entry.mana_value >= 7);
            });
          return (
            <CMCColumn key={index}>
              <h4>
                {index + 1 == 1 ? '0-1' : index + 1 == 7 ? '7+' : index + 1} ({uhh.length})
              </h4>
              <CardColumn>
                {uhh.map(e => (
                  <CardEntry
                    key={e.name}
                    isCreature={Boolean(e.toFaces()[0].types?.includes('Creature'))}
                    cardColor={
                      hexForColor(
                        (e.toFaces()[0].colors == undefined
                          ? 'Colorless'
                          : e.toFaces()[0].colors.length > 1
                          ? 'Multicolor'
                          : e.toFaces()[0].colors) as any
                      ) as any
                    }
                  >
                    <TertiaryButton
                      color="black"
                      onClick={() => {
                        setActiveCardFromAtom(e.id);
                      }}
                    >
                      {e.name}
                    </TertiaryButton>
                  </CardEntry>
                ))}
              </CardColumn>
            </CMCColumn>
          );
        })}
      </Container>
    </div>
  );
};
const StyledSidePanel = styled(SidePanel)({
  zIndex: 40,
  height: '100%',
  position: 'fixed',
  backgroundColor: 'transparent',
  top: '10px',
});
const SPContainer = styled('div')({
  overflowY: 'scroll',
  height: '90vh',
  overflowX: 'hidden',
});
