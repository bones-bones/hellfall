import { Link } from 'react-router-dom';
import { Heading, styled } from '@workday/canvas-kit-react';
import { useAuth } from '../auth';

export const Header = () => {
  const { user, logoutUrl, loginUrl } = useAuth();

  return (
    <>
      <StyledHeader>
        <StyledHeading size="medium">{" > it's hellfall"}</StyledHeading>
        <NavRow>
          <Navigation>
            <Link to={'/'}>search</Link>
            <NavDivider>|</NavDivider>
            <Link to={'/card/random'}>random</Link>
            <NavDivider>|</NavDivider>
            <Link to={'/draft'}>draft</Link>
            <NavDivider>|</NavDivider>
            <Link to={'/deck-builder'}>deck/cube builder</Link>
            <NavDivider>|</NavDivider>
            <Link to={'/hellscubes'}>cube resources</Link>
            <NavDivider>|</NavDivider>
            <Link to={'https://discord.com/channels/631288872814247966/1237418389480407061'}>
              rules
            </Link>
            <NavDivider>|</NavDivider>
            <Link to={'/land-box'}>land box</Link>
            <NavDivider>|</NavDivider>
            <Link to={'/decks'}>constructed</Link>
            <NavDivider>|</NavDivider>
            <Link to={'/Watchwolfwar'}>WatchWolfWar</Link>
            <NavDivider>|</NavDivider>
            <Link to={'https://discord.gg/EWFcAnVdkX'}>discord</Link>
            <NavDivider>|</NavDivider>
            <Link to={'https://www.reddit.com/r/HellsCube/'}>reddit</Link>
            {!user ? (
              <>
                <NavDivider>|</NavDivider>
                {loginUrl ? (
                  <a href={loginUrl}>login</a>
                ) : (
                  <Link to="/login">login</Link>
                )}
              </>
            ) : null}
          </Navigation>
          {user && logoutUrl ? (
            <AuthBlock>
              <span title={user.email ?? undefined} data-logged-in>
                {user.username}
              </span>
              <NavDivider>|</NavDivider>
              <a href={logoutUrl}>logout</a>
            </AuthBlock>
          ) : null}
        </NavRow>
      </StyledHeader>
    </>
  );
};

const StyledHeading = styled(Heading)({
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
  fontWeight: 'normal',
});
const Navigation = styled('nav')({
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  alignItems: 'center',
  width: '80vw',
  paddingLeft: '10px',
});
const AuthBlock = styled('span')({ paddingRight: '10px' });

const NavDivider = styled('span')({
  padding: '0 2px',
});
