import { Link } from 'react-router-dom';
import { Heading } from '@workday/canvas-kit-react/text';
import { styled } from '@workday/canvas-kit-react/common';
import { useAuth } from '../auth';

export const Header = () => {
  const { user, logoutUrl } = useAuth();

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
          {user && logoutUrl && (
            <AuthBlock>
              |{' '}
              <span title={user.email ?? undefined} data-logged-in>{user.username}</span>,{' '}
              <a href={logoutUrl}>logout</a>
            </AuthBlock>
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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});
const Navigation = styled('nav')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  flex: 1,
});
const AuthBlock = styled('span')({ marginLeft: 'auto' });
