import styled from '@emotion/styled';
import { Box } from '@workday/canvas-kit-react';
import { createStyles } from '@workday/canvas-kit-styling';
import { FC, PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { createStyledImg, createStyledIntrinsic } from '../../styling';

const bigContainerE = createStyles({
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: 'lightgrey',
  minHeight: '95vh',
});
const innerContainer = createStyles({
  width: '80vw',
  backgroundColor: 'white',
  padding: '20px',
});
export const BigContainer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box cs={bigContainerE}>
      <Box cs={innerContainer}>
        <Link to="/hellscubes/eight">{'<< back'}</Link>
        {children}
      </Box>
    </Box>
  );
};

const h3Styles = createStyles({ display: 'flex', alignItems: 'center' });
export const StyledH3 = createStyledIntrinsic('h3', h3Styles);

const manaSymbolStyles = createStyles({ height: '30px' });
export const ManaSymbol = createStyledImg(manaSymbolStyles);
export const manaSymbolSmallStyles = createStyles({
  height: '20px',
  paddingInlineEnd: '10px',
  paddingInlineStart: '5px',
});
export const ManaSymbolSmall = createStyledImg(manaSymbolSmallStyles);

export const Divider = ({ color }: { color: string }) => {
  return (
    <Box cs={divContainer}>
      <Box cs={divLine} />
      <ManaSymbol src={color} />
      <Box />
    </Box>
  );
};

const divLine = createStyles({
  height: '3px',
  width: '20vw',
  background: 'black',
});

const divContainer = createStyles({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
