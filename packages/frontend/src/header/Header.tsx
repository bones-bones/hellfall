import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heading, styled } from '@workday/canvas-kit-react';

export const Header = () => {
  return (
    <>
      <StyledHeader>
        <StyledHeading size="medium"> {" > it's hellfall"}</StyledHeading>
        <Navigation>
          <Link to={'/'}>search</Link>,{' '}
          <Link to={'/card/random'}>random</Link>,{' '}
          <Link to={'/draft'}>draft</Link>,{' '}
          <Link to={'/deck-builder'}>deck builder</Link>,{' '}
          <Link to={'/hellscubes'}>cube resources</Link>,{' '}
          <Link to={'https://discord.com/channels/631288872814247966/1237418389480407061'}>rules</Link>,{' '}
          <Link to={'/land-box'}>land box</Link>,{' '}
          <Link to={'/decks'}>constructed</Link>, <Link to={'/Watchwolfwar'}>WatchWolfWar</Link>,{' '}
          <Link to={'https://discord.gg/EWFcAnVdkX'}>discord</Link>,{' '}
          <Link to={'https://www.reddit.com/r/HellsCube/'}>reddit</Link>
        </Navigation>
      </StyledHeader>
    </>
  );
};

const StyledHeading = styled(Heading)({
  marginTop: '0px',
  marginBottom: '5px',
});

const StyledHeader = styled('div')({
  backgroundColor: '#C690FF',
  borderBottom: '2px solid lightgray',
  marginTop: '0px',
});
const Navigation = styled('nav')();
