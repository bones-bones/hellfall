import { keyframes } from '@emotion/react';
import { createStyles } from '@workday/canvas-kit-styling';
import { useState, useEffect } from 'react';
import { createStyledDiv, createStyledImg } from '../../styling';

export const HellsCard = ({ queryString }: { queryString: string }) => {
  const [card, setCard] = useState(undefined);

  useEffect(() => {
    let ignore = false;
    (async () => {
      console.log('oi', card);
      const url = `https://api.scryfall.com/cards/random?q=${queryString} game:paper`;

      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Hellfall/0.1.0',
          Accept: 'application/json;q=0.9,*/*;q=0.8',
        },
      });

      const {
        image_uris: { normal },
      } = await resp.json();
      if (!ignore) {
        setCard(normal);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  if (!card) {
    return <LoadingSkeleton />;
  }

  return <StyledImage src={card} />;
};

const imageStyles = createStyles({ maxWidth: '300px', display: 'inline-block' });
const StyledImage = createStyledImg(imageStyles, 'StyledImage');

const LoadingSkeleton = () => {
  return <Frame />;
};

const bounce = keyframes({ '50%': { backgroundColor: 'black' } });

const frameStyles = createStyles({
  width: '300px',
  height: '411px',
  display: 'inline-block',
  border: '3px solid black',
  borderRadius: '10px',
  animation: `${bounce} 1.5s ease infinite`,
});
const Frame = createStyledDiv(frameStyles, 'Frame');
