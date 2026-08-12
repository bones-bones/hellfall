import { useCallback, useEffect, useRef, useState } from 'react';
import { useKeyPress } from '../hooks';
import { useAtom, useAtomValue } from 'jotai';
import { activeCardAtom } from './atoms/searchAtoms';
import { cardsAtom } from './atoms/cardsAtom';
import { Card, ToolbarIconButton, SidePanel, useSidePanelModel } from '@workday/canvas-kit-react';
import { externalLinkIcon, xIcon } from '@workday/canvas-system-icons-web';
import { HellfallCard } from './card/HellfallCard';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import { createStenciledButtonDiv, createStyledDiv, StenciledButtonDivProps } from '../styling';

type dragCursor = 'w-resize' | 'ew-resize' | 'e-resize';
interface ActiveCardPanelProps {
  origin?: 'left' | 'right'; // Optional origin prop, defaulting to "right"
  maxWidth?: number;
}
const originMap = {
  left: 'start' as const,
  right: 'end' as const,
};
const dragField = 2;
const minPanelWidth = 350;
export const ActiveCardPanel = ({ origin = 'right', maxWidth }: ActiveCardPanelProps) => {
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
  const [cardEditing, setCardEditing] = useState(false);

  const [maxPanelWidth, setMaxPanelWidth] = useState(maxWidth ?? 1400);

  useEffect(() => {
    const newMaxPanelWidth = Math.min(1400, maxWidth ?? 1400, windowWidth - 20);
    if (newMaxPanelWidth != maxPanelWidth) {
      setMaxPanelWidth(newMaxPanelWidth);
    }
  }, [maxWidth, windowWidth]);
  useEffect(() => {
    setCardEditing(false);
  }, [activeCardFromAtom]);
  const getDragCursor = (width: number) => {
    if (width - dragField <= minPanelWidth) {
      return origin === 'right' ? 'w-resize' : 'e-resize';
    }
    if (width + dragField >= maxPanelWidth) {
      return origin === 'right' ? 'e-resize' : 'w-resize';
    }
    return 'ew-resize';
  };
  const getDefaultWidth = () =>
    cardEditing
      ? Math.min(Math.max(windowWidth * 0.92, 720), maxPanelWidth)
      : maxWidth
      ? Math.min(maxWidth, Math.max(windowWidth * 0.535, minPanelWidth))
      : Math.max(windowWidth * 0.535, minPanelWidth);

  const [panelWidth, setPanelWidth] = useState<number>(getDefaultWidth);
  const [cursorForm, setCursorForm] = useState<dragCursor>('ew-resize');

  useEffect(() => {
    setPanelWidth(getDefaultWidth());
    setCursorForm('ew-resize');
  }, [windowWidth, maxPanelWidth, cardEditing]);

  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      startXRef.current = clientX;
      startWidthRef.current = panelWidth;
      document.body.style.cursor = cursorForm;
    },
    [panelWidth]
  );

  const handleResizeMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = origin === 'right' ? startXRef.current - clientX : clientX - startXRef.current;

      const newPanelWidth = Math.max(
        minPanelWidth,
        Math.min(maxPanelWidth, startWidthRef.current + deltaX)
      );
      const newCursorForm = getDragCursor(newPanelWidth);
      if (cursorForm != newCursorForm) {
        setCursorForm(newCursorForm);
        document.body.style.cursor = newCursorForm;
      }
      if (newPanelWidth != panelWidth) {
        setPanelWidth(newPanelWidth);
      }
    },
    [isDragging, origin, maxPanelWidth]
  );

  const handleResizeEnd = useCallback(() => {
    document.body.style.cursor = '';
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      window.addEventListener('touchmove', handleResizeMove);
      window.addEventListener('touchend', handleResizeEnd);

      // Prevent text selection during drag
      document.body.style.userSelect = 'none';

      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
        window.removeEventListener('touchmove', handleResizeMove);
        window.removeEventListener('touchend', handleResizeEnd);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleResizeMove, handleResizeEnd]);

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
        expandedWidth={panelWidth}
        collapsedWidth={0}
        {...sidePanelStencil({ origin })}
      >
        <SidePanel.Heading hidden size="small">
          Active Card Panel
        </SidePanel.Heading>
        <Card cs={cardStyles}>
          {activeCard && (
            <DragBar
              cursor={cursorForm}
              origin={origin}
              onMouseDown={handleResizeStart}
              onTouchStart={handleResizeStart}
            />
          )}
          <ButtonContainer>
            <ToolbarIconButton
              icon={xIcon}
              cs={toolbarIconStyles}
              onClick={() => setActiveCardFromAtom('')}
            />
            {activeCard && (
              <ToolbarIconButton
                as="a"
                icon={externalLinkIcon}
                cs={toolbarIconStyles}
                href={'/card/' + encodeURIComponent(activeCard.hcid)}
                target="_blank"
              />
            )}
          </ButtonContainer>
          <Card.Body cs={cardBodyStyles}>
            <SPContainer
              ref={scrollContainerRef}
              style={{ overflowX: cardEditing ? 'auto' : 'hidden' }}
            >
              {activeCard && <HellfallCard data={activeCard} onEditingChange={setCardEditing} />}
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
});
const SPContainer = createStyledDiv(spContainerStyles, 'SPContainer');

const toolbarIconStyles = createStyles({ margin: '2px 0 0 2px' });

const buttonContainerStyles = createStyles({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  backgroundColor: 'white',
  padding: '8px 8px 4px 8px',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '4px',
  marginTop: '-20px',
  marginBottom: '-20px',
});

const ButtonContainer = createStyledDiv(buttonContainerStyles);

type DragBarProps = StenciledButtonDivProps & { cursor: dragCursor; origin?: 'right' | 'left' };
const dragBarStencil = createStencil({
  vars: {
    cursor: 'ew-resize',
  },
  base: ({ cursor }) => ({
    width: `${dragField * 2}px`,
    height: '100%',
    cursor,
    position: 'absolute',
    border: 0,
    opacity: 0,
    right: '-3px',
  }),
  modifiers: {
    origin: {
      right: {
        left: '-3px',
      },
    },
  },
});
const DragBar = createStenciledButtonDiv<DragBarProps>(dragBarStencil);

const cardStyles = createStyles({
  position: 'relative',
});

const cardBodyStyles = createStyles({
  padding: 0,
});
