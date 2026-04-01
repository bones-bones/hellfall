import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heading } from '@workday/canvas-kit-react/text';
import { styled } from '@workday/canvas-kit-react/common';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      // We're already on search, force a reset by navigating with state
      navigate('/', { state: { reset: Date.now() }, replace: true });
    } else {
      navigate('/');
    }
  };
  return (
    <>
      <StyledHeader>
        <StyledHeading size="medium"> {" > it's hellfall"}</StyledHeading>
        <Navigation>
          <Link to={'/'} onClick={handleSearchClick}>
            search
          </Link>
          , <Link to={'/draft'}>draft</Link>, <Link to={'/deck-builder'}>deck builder</Link>,{' '}
          <Link to={'/hellscubes'}>cube resources</Link>, <Link to={'/land-box'}>land box</Link>,{' '}
          <Link to={'/decks'}>constructed</Link>, <Link to={'/Watchwolfwar'}>WatchWolfWar</Link>,{' '}
          <Link to={'https://discord.gg/EWFcAnVdkX'}>discord</Link>,{' '}
          <Link to={'https://www.reddit.com/r/HellsCube/'}>reddit</Link>{' '}
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
