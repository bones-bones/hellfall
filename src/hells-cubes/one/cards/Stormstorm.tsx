import { HellsCard } from '../HellsCard';

export const Stormstorm = () => {
  const stormCards = ['brainstorm', `storm+crow+type:creature`, 'stormsinger'];
  return <HellsCard queryString={stormCards[Math.floor(Math.random() * stormCards.length)]} />;
};
