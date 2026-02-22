import { Link } from 'react-router-dom';
import { Heading } from '@workday/canvas-kit-react/text';
import { styled } from '@workday/canvas-kit-react/common';
import { useAuth } from '../auth';

export const Header = () => {
  const { user, loading, loginUrl, logoutUrl } = useAuth();

  return (
    <>
      <StyledHeader>
        <StyledHeading size="medium"> {" > it's hellfall"}</StyledHeading>
        <Navigation>
          <Link to={'/'}>search</Link>, <Link to={'/card/random'}>random</Link>,{' '}
          <Link to={'/draft'}>draft</Link>, <Link to={'/deck-builder'}>deck builder</Link>,{' '}
          <Link to={'/hellscubes'}>cube resources</Link>, <Link to={'/land-box'}>land box</Link>,{' '}
          <Link to={'/decks'}>constructed</Link>, <Link to={'/Watchwolfwar'}>WatchWolfWar</Link>,{' '}
          <Link to={'https://discord.gg/EWFcAnVdkX'}>discord</Link>,{' '}
          <Link to={'https://www.reddit.com/r/HellsCube/'}>reddit</Link>
          {loginUrl && (
            <>
              {' '}
              |{' '}
              {user ? (
                <>
                  <span title={user.email ?? undefined}>{user.username}</span>,{' '}
                  <a href={logoutUrl}>logout</a>
                </>
              ) : (
                <a href={loginUrl}>{loading ? '…' : 'login'}</a>
              )}
            </>
          )}
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
