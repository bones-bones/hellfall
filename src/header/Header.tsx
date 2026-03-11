import { Link } from 'react-router-dom';
import { styled } from '@workday/canvas-kit-react/common';
import { useAuth } from '../auth';

export const Header = () => {
  const { user, logoutUrl, loginUrl } = useAuth();

  return (
    <>
      <StyledHeader>
        <StyledHeading>{" > it's hellfall"}</StyledHeading>
        <NavRow>
          <Navigation>
            <Link to={'/'}>search</Link>|<Link to={'/card/random'}>random</Link>|
            <Link to={'/draft'}>draft</Link>|<Link to={'/deck-builder'}>deck builder</Link>|
            <Link to={'/hellscubes'}>cube resources</Link>|<Link to={'/land-box'}>land box</Link>|
            <Link to={'/decks'}>constructed</Link>|<Link to={'/Watchwolfwar'}>WatchWolfWar</Link>|
            <Link to={'https://discord.gg/EWFcAnVdkX'}>discord</Link>|
            <Link to={'https://www.reddit.com/r/HellsCube/'}>reddit</Link>
           
          </Navigation>
          {user && logoutUrl ? (
              <AuthBlock>
                <span title={user.email ?? undefined} data-logged-in>{user.username}</span>,{' '}
                <a href={logoutUrl}>logout</a>
              </AuthBlock>
            ) : loginUrl ? (
              <AuthBlock>
                <a href={loginUrl}>login</a>
              </AuthBlock>
            ) : null}
        </NavRow>
      </StyledHeader>
    </>
  );
};

const StyledHeading = styled('h1')({
  marginTop: '5px',
  marginBottom: '5px',
});

const StyledHeader = styled('div')({
  backgroundColor: '#C690FF',
  borderBottom: '2px solid lightgray',
  marginTop: '0px',
  paddingBottom: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '4px',
  maxWidth: '100%',
  fontWeight: 'bold',
});
const NavRow = styled('div')({
  justifyContent: 'space-between',
  display: 'flex',
  width: '100%',
});
const Navigation = styled('nav')({
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  alignItems: 'center',
  width:"80vw",
  paddingLeft:"10px",
 
});
const AuthBlock = styled('span')({  paddingRight:"10px", });
