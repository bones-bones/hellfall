import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getAuthApiUrl } from './getAuthApiUrl';

/**
 * Login route: redirects to Discord OAuth when auth is configured, or shows a message.
 * The nav only shows the logged-in indicator when the session cookie is set; this page is reachable via direct URL.
 */
export const Login = () => {
  const { user, loading, loginUrl } = useAuth();
  const authConfigured = !!getAuthApiUrl();

  if (!authConfigured) {
    return (
      <div style={{ padding: 24 }}>
        <title>Login | Hellfall</title>
        <p>Login is not configured. Set REACT_APP_AUTH_API_URL to enable Discord login.</p>
        <Link to="/">Back to search</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <title>Login Loading | Hellfall</title>
        <p>…</p>
      </div>
    );
  }

  if (user) {
    return (
      <div style={{ padding: 24 }}>
        <title>Logged In | Hellfall</title>
        <p>
          You're logged in as <strong>{user.username}</strong>.
        </p>
        <Link to="/">Back to search</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <title>Login | Hellfall</title>
      <p>Sign in with Discord to continue.</p>
      <a href={loginUrl}>Login with Discord</a>
      <br />
      <Link to="/">Back to search</Link>
    </div>
  );
};
