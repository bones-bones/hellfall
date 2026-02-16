import { BigContainer, InnerContainer, ManaSymbolSmall } from './components';
import RG from '../../assets/RG.svg';
import { Link } from 'react-router-dom';
export const GruulSelfDiscard = () => {
  return (
    <>
      <BigContainer>
        <h1>Gruul Self-Discard</h1>
        <h2>
          Hey guys. It&apos;s me, <ManaSymbolSmall src={RG} />
          Red/Green
          <ManaSymbolSmall src={RG} /> I will be your steward to Gruul self-discard. Everyone know
          Gruul dumb, so I keep short:
        </h2>
        <h2>
          I want cards that use discarding and the graveyard to build advantage and{' '}
          <i>stay as close to card neutral as possible</i>. I expect red looting and green regrowth
          stocks to the moon.
        </h2>
        <h2>
          If you only make cards with &quot;Discard a card: Do something other than get cards&quot;,
          Gruul is going to be hellbent on turn four. Please look out and think about how we reach
          mid/endgame.
        </h2>

        <h2>
          Basically, these colors (esp. red) already self discard. Focus on payoffs and mitigation
          of impact.
        </h2>

        <h2>
          Black is Gruul&apos;s best friend for graveyard shenanigens, but{' '}
          <Link to="/hellscubes/eight/paradox-incorporated">UR paradox</Link> is a cool outlet for
          madness/impulse/cast from graveyard. White do nothing for Gruul.
        </h2>

        <h2>Have fun you filthy animals</h2>
        <img width="400px" src={'https://i.redd.it/i7lw68wrqxua1.png'} />
        <h3>—Red</h3>
      </BigContainer>
    </>
  );
};
