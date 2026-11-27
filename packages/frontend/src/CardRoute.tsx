import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNameToHCID, useIsHCID } from './hellfall/hooks/useNameToId';
import { SingleCard, SingleCardView } from './hellfall/card/SingleCard.tsx';
import { canUseServerSearch } from './auth/isServerSearchEnabled';
import { useServerCard } from './hellfall/hooks/useServerCard';

export const CardRoute = () => (canUseServerSearch() ? <ServerCardRoute /> : <ClientCardRoute />);

const ClientCardRoute = () => {
  const params = useParams<{ '*': string }>();
  const navigate = useNavigate();
  const cardIdentifier = params['*'];
  const cardId = useNameToHCID(cardIdentifier || '');
  const IsHCID = useIsHCID(cardIdentifier || '');
  const [shouldRender, setShouldRender] = useState(false);
  useEffect(() => {
    const handleRedirect = async () => {
      if (!IsHCID && cardId) {
        navigate(`/card/${encodeURIComponent(cardId)}`, { replace: true });
        return;
      }
      setShouldRender(true);
    };

    handleRedirect();
  }, [cardIdentifier, cardId, navigate, IsHCID]);

  if (!shouldRender) {
    return <div />;
  }
  return <SingleCard />;
};

/**
 * Deep links without a client CardMap: resolve HCID/name via API, normalize URL to HCID.
 */
const ServerCardRoute = () => {
  const params = useParams<{ '*': string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const identifier = params['*'] ? decodeURIComponent(params['*']) : '';
  const { card, loading, error } = useServerCard(identifier || undefined);

  useEffect(() => {
    if (!card?.hcid) return;
    if (card.hcid === identifier) return;
    navigate(`/card/${encodeURIComponent(card.hcid)}${location.search}`, { replace: true });
  }, [card, identifier, navigate, location.search]);

  if (loading || !identifier) {
    return <div />;
  }
  if (error || !card) {
    return <h2>Nothing was found...</h2>;
  }
  // Wait for name → HCID redirect before rendering the card page.
  if (card.hcid !== identifier) {
    return <div />;
  }
  return <SingleCardView entryToRender={card} />;
};
