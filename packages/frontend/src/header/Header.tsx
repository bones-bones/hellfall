import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { useUrlSync } from '../hellfall/hooks/useUrlSync';
import { createStyles } from '@workday/canvas-kit-styling';
import {
  createStyledDiv,
  createStyledHeading,
  createStyledIntrinsic,
  createStyledSpan,
} from '../styling';

export const Header = () => {
  useUrlSync();
  const { user, logoutUrl, loginUrl } = useAuth();

  return (
    <>
      <StyledHeader>
        <StyledHeading size="medium">{" > it's hellfall"}</StyledHeading>
        <NavRow>
          <Navigation>
            <Link to={'/'}>search</Link>, <Link to={'/advanced'}>advanced</Link>,{' '}
            <Link to={'/random'}>random</Link>, <Link to={'/draft'}>draft</Link>,{' '}
            <Link to={'/deck-builder'}>deck/cube builder</Link>,{' '}
            <Link to={'/hellscubes'}>cube resources</Link>,{' '}
            <Link to={'https://discord.com/channels/631288872814247966/1237418389480407061'}>
              rules
            </Link>
            , <Link to={'/land-box'}>land box</Link>, <Link to={'/decks'}>constructed</Link>,{' '}
            <Link to={'/Watchwolfwar'}>WatchWolfWar</Link>,{' '}
            <Link to={'https://discord.gg/EWFcAnVdkX'}>discord</Link>,{' '}
            <Link to={'https://www.reddit.com/r/HellsCube/'}>reddit</Link>
          </Navigation>
          {!user ? (
            <AuthBlock>
              {loginUrl ? <a href={loginUrl}>login</a> : <Link to="/login">login</Link>}
            </AuthBlock>
          ) : user && logoutUrl ? (
            <AuthBlock>
              <span title={user.email ?? undefined} data-logged-in>
                {user.username}
                {/* <Link to="/settings">{user.username}</Link> */}
              </span>
              {user.isAdmin && (
                <>
                  , <Link to="/review">review</Link>
                </>
              )}
              , <a href={logoutUrl}>logout</a>
            </AuthBlock>
          ) : null}
        </NavRow>
      </StyledHeader>
    </>
  );
};

const headingStyles = createStyles({
  marginTop: '0px',
  marginBottom: '5px',
});
const StyledHeading = createStyledHeading(headingStyles, 'StyledHeading');

const headerStyles = createStyles({
  backgroundColor: '#C690FF',
  borderBottom: '2px solid lightgray',
  marginTop: '0px',
});
const StyledHeader = createStyledDiv(headerStyles, 'StyledHeader');

const navRowStyles = createStyles({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
  width: '100%',
  fontWeight: 'normal',
});
const NavRow = createStyledDiv(navRowStyles, 'NavRow');

const navigationStyles = createStyles({
  flex: '1 1 auto',
  minWidth: 0,
  paddingLeft: '10px',
});
const Navigation = createStyledIntrinsic('nav', navigationStyles, 'Navigation');

const authBlockStyles = createStyles({
  flexShrink: 0,
  paddingRight: '10px',
  whiteSpace: 'nowrap',
});
const AuthBlock = createStyledSpan(authBlockStyles, 'AuthBlock');
