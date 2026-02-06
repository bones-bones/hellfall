import styled from '@emotion/styled';
import { FC, PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

export const BigContainerE = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: 'lightgrey',
  minHeight: '95vh',
});

export const BigContainer: FC<PropsWithChildren> = ({ children }) => {
  //
  return (
    <BigContainerE>
      <InnerContainer>
        <Link to="/hellscubes/eight">{'<< back'}</Link>
        {children}
      </InnerContainer>
    </BigContainerE>
  );
};
export const InnerContainer = styled('div')({
  width: '80vw',
  backgroundColor: 'white',
  padding: '20px',
});
export const ManaSymbol = styled('img')({ height: '30px' });
export const ManaSymbolSmall = styled('img')({
  height: '20px',
  paddingInlineEnd: '10px',
  paddingInlineStart: '5px',
});
export const StyledH3 = styled('h3')({ display: 'flex', alignItems: 'center' });

export const Divider = ({ color }: { color: string }) => {
  return (
    <DivContainer>
      <DivLine />
      <ManaSymbol src={color} />
      <DivLine />
    </DivContainer>
  );
};

const DivLine = styled('div')({
  height: '3px',
  width: '20vw',
  background: 'black',
});

const DivContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
