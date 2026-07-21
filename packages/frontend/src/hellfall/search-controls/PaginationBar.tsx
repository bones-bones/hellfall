import { PaginationModel } from '@workday/canvas-kit-react';
import {
  createStyledDiv,
  createStyledSecondaryButton,
  createStyledSecondaryButtonLink,
} from '../../styling';
import { createStyles } from '@workday/canvas-kit-styling';
import {
  chevron2xLeftIcon,
  chevron2xRightIcon,
  chevronLeftIcon,
  chevronRightIcon,
  splitIcon,
} from '@workday/canvas-system-icons-web';
import { useAtomValue } from 'jotai';
import { queryAtom } from '../atoms/searchAtoms';
import { ControlBar } from './ControlBar'; // used for link

/**
 * Pagination controls. To use this properly, pass it as children to {@linkcode ControlBar}
 */
export const PaginationBar = ({
  model,
}: {
  /**
   * The {@linkcode PaginationModel} to use. If omitted, the pagination controls will also be omitted
   */
  model: PaginationModel;
}) => {
  const query = useAtomValue(queryAtom);
  const currentPage = model.state.currentPage;
  const lastPage = model.state.lastPage;
  return (
    <>
      <ControlButton
        icon={chevron2xLeftIcon}
        title={`${currentPage == 1 ? 'You are on' : 'Go to'} the first page of this search`}
        aria-label={`${currentPage == 1 ? 'You are on' : 'Go to'} the first page of this search`}
        onClick={model.events.first}
        disabled={currentPage == 1}
      />
      <ControlButton
        icon={chevronLeftIcon}
        title={`${currentPage == 1 ? 'You are on' : 'Go to'} the ${
          currentPage == 1 ? 'first' : 'previous'
        } page of this search`}
        aria-label={`${currentPage == 1 ? 'You are on' : 'Go to'} the ${
          currentPage == 1 ? 'first' : 'previous'
        } page of this search`}
        onClick={model.events.previous}
        disabled={currentPage == 1}
      />
      <ControlButtonLink
        icon={splitIcon}
        title="Find a random card within this search"
        aria-label="Find a random card within this search"
        to={`/random${query ? `?q=${encodeURIComponent(query)}` : ''}`}
      />
      <ControlButton
        icon={chevronRightIcon}
        title={`${currentPage == lastPage ? 'You are on' : 'Go to'} the ${
          currentPage == 1 ? 'last' : 'next'
        } page of this search`}
        aria-label={`${currentPage == lastPage ? 'You are on' : 'Go to'} the ${
          currentPage == 1 ? 'last' : 'next'
        } page of this search`}
        onClick={model.events.next}
        disabled={currentPage == lastPage}
      />
      <ControlButton
        icon={chevron2xRightIcon}
        title={`${currentPage == lastPage ? 'You are on' : 'Go to'} the last page of this search`}
        aria-label={`${
          currentPage == lastPage ? 'You are on' : 'Go to'
        } the last page of this search`}
        onClick={model.events.last}
        disabled={currentPage == lastPage}
      />
    </>
  );
};

const compactButtonStyles = createStyles({
  width: '20px', // Fixed small width
  height: '20px', // Fixed small height
  minWidth: '20px', // Override any min-width
  padding: 0, // Remove padding
  display: 'block',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  verticalAlign: 'top',
  '&:disabled': {
    cursor: 'not-allowed',
  },
  '& > span': {
    svg: {
      width: '14px', // Smaller icon
      height: '14px',
      display: 'block',
      margin: '0px 0px -0.5px 0px',
      alignSelf: 'center',
      verticalAlign: 'top',
    },
  },
});
const CompactButton = createStyledSecondaryButton(compactButtonStyles, 'CompactButton');

const buttonGroupStyles = createStyles({
  display: 'inline-block',
  flexDirection: 'column', // Stack vertically
  // gap: '4px',               // Space between buttons
  marginLeft: '4px', // Optional spacing from the selectors
  verticalAlign: 'top',
});
const ButtonGroup = createStyledDiv(buttonGroupStyles, 'ButtonGroup');

const controlButtonStyles = createStyles({
  margin: '0 2px',
  borderRadius: '4px',
  // textDecoration:'none',
  // '&:hover, &:focus, &:active': {
  //   textDecoration: 'none'
  // },
  '&:disabled': {
    cursor: 'not-allowed',
  },
});
const ControlButton = createStyledSecondaryButton(controlButtonStyles, 'ControlButton');
const ControlButtonLink = createStyledSecondaryButtonLink(controlButtonStyles, 'ControlButtonLink');
