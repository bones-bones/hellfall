import { useEffect, useState } from 'react';
import { useKeyPress } from '../hooks';
import { useAtom, useAtomValue } from 'jotai';
import { activeCardAtom } from './atoms/searchAtoms';
import { cardsAtom } from './atoms/cardsAtom';
import { SidePanel, useSidePanel } from '@workday/canvas-kit-preview-react';
import { Box, Card, ToolbarIconButton } from '@workday/canvas-kit-react';
import { extLinkIcon, xIcon } from '@workday/canvas-system-icons-web';
import { HellfallCard } from './card/HellfallCard';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';

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
    <Box cs={sidePanelStyles}>
    <SidePanel
      {...panelProps}
      expanded={!!activeCard}
      expandedWidth={Math.max(windowWidth * 0.535, 350)}
      collapsedWidth={0}
      origin={origin}
      {...sidePanelStencil({origin})}
    >
      <Card>
        <Card.Body padding={'zero'}>
          <Box cs={spContainer}>
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
          </Box>
        </Card.Body>
      </Card>
    </SidePanel>
    </Box>
  );
};


const sidePanelStyles = createStyles({
  '& section': {
    zIndex: 40,
    height: '100%',
    position: 'fixed',
    backgroundColor: 'transparent',
    top: '35px',
    '& > div': {
      paddingRight: '8px !important',
    },
  }
})

const sidePanelStencil = createStencil({
  vars:{
    origin:'right'
  },
  base:{},
  modifiers:{
    origin: {
      right: {
        right: 0
      },
      left: {
        left: 0
      }
    }
  }
})

const spContainer = createStyles({
  overflowY: 'scroll',
  height: '90vh',
  overflowX: 'hidden',
});
