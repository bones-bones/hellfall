import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNameToHCID, useIsHCID } from './hellfall/hooks/useNameToId';
import { SingleCard } from './hellfall/card/SingleCard.tsx';

export const CardRoute = () => {
  const params = useParams<{ '*': string }>();
  const navigate = useNavigate();
  const cardIdentifier = params['*'];
  const cardId = useNameToHCID(cardIdentifier || '');
  const IsHCID = useIsHCID(cardIdentifier || '');
  const [shouldRender, setShouldRender] = useState(false);
  useEffect(() => {
    const handleRedirect = async () => {
      if (!IsHCID && cardId) {
        navigate(`/card/${cardId}`, { replace: true });
        return;
      }
      setShouldRender(true);
    };

    handleRedirect();
  }, [cardIdentifier, cardId, navigate]);

  if (!shouldRender) {
    return <div />;
  }
  return <SingleCard />;
};
