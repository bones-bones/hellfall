import { HellsCard } from '../HellsCard';

export const PlumberUmbra = () => {
  const stormCards = [
    '!Jump',
    `!Leap`,
    `!"Daring+Leap"`,
    `!"leap+of+faith"`,
    `!"leap+of+flame"`,
    `!"mighty leap"`,
  ];
  return <HellsCard queryString={stormCards[Math.floor(Math.random() * stormCards.length)]} />;
};
