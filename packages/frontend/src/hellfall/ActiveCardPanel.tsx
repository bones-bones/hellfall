import { useEffect, useMemo, useState } from 'react';
import { useKeyPress } from '../hooks';
import { useAtom, useAtomValue } from 'jotai';
import { activeCardAtom } from './atoms/searchAtoms';
import { cardsAtom } from './atoms/cardsAtom';
import { SidePanel, useSidePanel } from '@workday/canvas-kit-preview-react';
import { Card, styled, ToolbarIconButton } from '@workday/canvas-kit-react';
import { extLinkIcon, xIcon } from '@workday/canvas-system-icons-web';
import { HellfallCard } from './card';

interface ActiveCardPanelProps {
  origin?: 'left' | 'right'; // Optional origin prop, defaulting to "right"
}

export const ActiveCardPanel = ({ origin = 'right' }: ActiveCardPanelProps) => {
  const cards = useAtomValue(cardsAtom);
  const escape = useKeyPress('Escape');
  const [activeCardFromAtom, setActiveCardFromAtom] = useAtom(activeCardAtom);
  const activeCard = cards.get(activeCardFromAtom);

  useEffect(() => {
    if (escape) {
      setActiveCardFromAtom('');
    }
  }, [escape]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { panelProps } = useSidePanel({
    initialExpanded: !!activeCard,
  });

  return (
    <StyledSidePanel
      {...panelProps}
      expanded={!!activeCard}
      expandedWidth={Math.max(windowWidth * 0.535, 350)}
      collapsedWidth={0}
      $origin={origin}
    >
      <Card>
        <Card.Body padding={'zero'}>
          <SPContainer>
            <ToolbarIconButton
              icon={xIcon}
              margin={'2px 0 0 2px'}
              onClick={() => setActiveCardFromAtom('')}
            />
            {activeCard && (
              <ToolbarIconButton
                as="a"
                icon={extLinkIcon}
                margin={'2px 0 0 2px'}
                href={'/card/' + encodeURIComponent(activeCard.hcid)}
                target="_blank"
              />
            )}
            {activeCard && <HellfallCard data={activeCard} />}
          </SPContainer>
        </Card.Body>
      </Card>
    </StyledSidePanel>
  );
};

const StyledSidePanel = styled(SidePanel)<{ $origin: 'left' | 'right' }>(({ $origin }) => ({
  zIndex: 40,
  height: '100%',
  position: 'fixed',
  backgroundColor: 'transparent',
  top: '35px',
  ...($origin === 'right' ? { right: 0 } : { left: 0 }),
  '& > div': {
    paddingRight: '8px !important',
  },
}));
const SPContainer = styled('div')({
  overflowY: 'scroll',
  height: '90vh',
  overflowX: 'hidden',
});
