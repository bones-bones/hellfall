import { useEffect, useRef, useState } from 'react';
import { useKeyPress } from '../hooks';
import { useAtom, useAtomValue } from 'jotai';
import { activeCardAtom } from './atoms/searchAtoms';
import { cardsAtom } from './atoms/cardsAtom';
import {
  Box,
  Card,
  ToolbarIconButton,
  SidePanel,
  useSidePanelModel,
} from '@workday/canvas-kit-react';
import { extLinkIcon, xIcon } from '@workday/canvas-system-icons-web';
import { HellfallCard } from './card/HellfallCard';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import { createStyledDiv, createStyledDivWithRef } from '../styling';

interface ActiveCardPanelProps {
  origin?: 'left' | 'right'; // Optional origin prop, defaulting to "right"
}
const originMap = {
  left: 'start' as const,
  right: 'end' as const,
};
export const ActiveCardPanel = ({ origin = 'right' }: ActiveCardPanelProps) => {
  const cards = useAtomValue(cardsAtom);
  const escape = useKeyPress('Escape');
  const [activeCardFromAtom, setActiveCardFromAtom] = useAtom(activeCardAtom);
  const activeCard = cards.get(activeCardFromAtom);
  const initialTransitionState = activeCard ? 'expanded' : 'collapsed';
  const model = useSidePanelModel({ initialTransitionState });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeCard) {
      model.events.expand();
    } else {
      model.events.collapse();
    }
  }, [activeCard]);
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [activeCard]);

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

  return (
    <StyledSidePanel>
      <SidePanel
        model={model}
        origin={originMap[origin]}
        // initialTransitionState={initialTransitionState}
        // expanded={!!activeCard}
        expandedWidth={Math.max(windowWidth * 0.535, 350)}
        collapsedWidth={0}
        {...sidePanelStencil({ origin })}
      >
        <Card>
          <Card.Body padding={'zero'}>
            <SPContainer ref={scrollContainerRef}>
              <ToolbarIconButton
                icon={xIcon}
                cs={toolbarIconStyles}
                onClick={() => setActiveCardFromAtom('')}
              />
              {activeCard && (
                <ToolbarIconButton
                  as="a"
                  icon={extLinkIcon}
                  cs={toolbarIconStyles}
                  href={'/card/' + encodeURIComponent(activeCard.hcid)}
                  target="_blank"
                />
              )}
              {activeCard && <HellfallCard data={activeCard} />}
            </SPContainer>
          </Card.Body>
        </Card>
      </SidePanel>
    </StyledSidePanel>
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
  },
});
const StyledSidePanel = createStyledDiv(sidePanelStyles, 'StyledSidePanel');

const sidePanelStencil = createStencil({
  vars: {
    origin: 'right',
  },
  base: {},
  modifiers: {
    origin: {
      right: {
        right: 0,
      },
      left: {
        left: 0,
      },
    },
  },
});

const spContainerStyles = createStyles({
  overflowY: 'scroll',
  height: '90vh',
  overflowX: 'hidden',
});
const SPContainer = createStyledDivWithRef(spContainerStyles, 'SPContainer');

const toolbarIconStyles = createStyles({ margin: '2px 0 0 2px' });
