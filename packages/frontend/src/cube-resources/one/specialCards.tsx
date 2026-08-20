import { JSX } from 'react';
import { ScryCard } from './HellsCard.tsx';
import {
  ObscureCommand,
  ABlueCard,
  WildMagic,
  DruidicVow,
  CurveTopper,
} from './cards';
import { CardMap, getRandom } from '@hellfall/shared/utils';
import { HCCard } from '@hellfall/shared/types';
import { searchCards } from '@hellfall/shared/filters';

type ScryCardParams = { path: string; name: string; component: JSX.Element };

type HellsCardParams = {path: string; name: string; cardGetter: (cardMap:CardMap) => HCCard.Any}

const getterForQuery = (query?:string):((cardMap:CardMap) => HCCard.Any) => {
  const getter = (cardMap:CardMap):HCCard.Any => {
    const resultSet = query ? searchCards(cardMap, query) : undefined;
    const card = resultSet ? getRandom(resultSet) : cardMap.getRandomCard();
    return card;
  }
  return getter
}

export const specialCards: (ScryCardParams|HellsCardParams)[] = [
  {
    path: '/hugh-man',
    name: 'Hugh Man, Human',
    component: <ScryCard queryString="t:human" />,
  },
  {
    path: '/regal-karakas',
    name: 'Regal Karakas',
    component: <ScryCard queryString="t:creature t:legendary" />,
  },
  {
    path: '/more-white-cards',
    name: 'We Need More White Cards',
    component: (
      <>
        <ScryCard queryString="c=w" key="1" />
        <ScryCard queryString="c=w" key="2" />
        <ScryCard queryString="c=w" key="3" />
      </>
    ),
  },
  {
    path: '/illusionary-gf',
    name: 'Illusionary GF',
    component: <ScryCard queryString="t:chandra t:planeswalker" />,
  },
  {
    path: '/absurdly-cryptic',
    name: 'Absurdly Cryptic Command',
    component: (
      <>
        <ScryCard queryString="t:instant c=U" key="1" />
        <ScryCard queryString="t:instant c=U" key="2" />
        <ScryCard queryString="t:instant c=U" key="3" />
        <ScryCard queryString="t:instant c=U" key="4" />
      </>
    ),
  },
  {
    path: '/black-6-drop',
    name: 'A Black 6 Drop Creature',
    component: <ScryCard queryString="c=b mv=6 t:creature" />,
  },
  {
    path: '/puzzle-box',
    name: 'Puzzle Box of Yogg-Saron',
    component: (
      <>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(entry => {
          return (
            <div key={entry}>
              <h3>{entry + 1}</h3>
              <ScryCard queryString="t:instant or t:sorcery" />
            </div>
          );
        })}
      </>
    ),
  },
  {
    path: '/death-seeker',
    name: 'Deathseeker',
    component: (
      <div key="deathseeker">
        <ScryCard queryString={`o:"when ~ dies" t:creature`} key="1" />
        <ScryCard queryString={`o:"when ~ dies" t:creature`} key="2" />
      </div>
    ),
  },
  { path: '/storm-storm', name: 'Stormstorm', cardGetter:getterForQuery('~stormstorm unique:cards include:extras') },
  {
    path: '/ultimate-ultimatum',
    name: 'Ultimate Ultimatum',
    component: <ScryCard queryString="ultimatum c=3 -c:bant" />,
  },
  {
    path: '/obscure-command',
    name: 'Obscure Command',
    component: <ObscureCommand />,
  },
  {
    path: '/plumber-umbra',
    name: 'Plumber Umbra',
    cardGetter:getterForQuery('~"plumber umbra" unique:cards include:extras')
  },
  { path: '/blue-card', name: 'A Blue Card', component: <ABlueCard /> },
  {
    path: '/chandra',
    name: 'Chandra, Throughout the Ages',
    component: (
      <>
        <ScryCard queryString={`!"chandra,+novice+pyromancer"`} />
        <br />
        <ScryCard queryString={`!"chandra,+acolyte+of+flame"`} />
        <br />
        <ScryCard queryString={`!"chandra,+awakened+inferno"`} />
      </>
    ),
  },
  { path: '/wild-magic', name: 'Wildmagic surge', component: <WildMagic /> },
  {
    path: '/phyrexian-oublietterator',
    name: 'Phyrexian Oublietterator',
    component: <ScryCard queryString={`!"Oubliette"`} />,
  },
  {
    path: '/druidic-vow',
    name: "BallsJr123's Druidic vow",
    component: <DruidicVow />,
  },
  {
    path: '/lazav-with-a-flamethrower',
    name: 'Lazav With a Flamethrower',
    component: <ScryCard queryString={`!"chandra,+fire+of+kaladesh"`} />,
  },
  {
    path: '/lucky-charms',
    name: 'Charmping Leprechauns',
    component: (
      <>
        <h2>Blarney&apos;s</h2>
        <ScryCard queryString={`!"rampant+growth"`} />
        <br />
        <ScryCard queryString={`!"Naturalize"`} />
        <br />
        <ScryCard queryString={`!"explore"`} />
        <h2>Stumpy&apos;s</h2>
        <ScryCard queryString={`!"fog"`} />
        <br />
        <ScryCard queryString={`!"giant+growth"`} />
        <br />
        <ScryCard queryString={`!"reclaim"`} />
      </>
    ),
  },
  {
    path: '/curvetopper',
    name: "Ballsjr's Ultimate Curvetopper",
    component: <CurveTopper />,
  },
  {
    path: '/random-growth',
    name: 'Random Growth',
    component: <ScryCard queryString="type:land" />,
  },
].sort((a, b) => {
  if (a.name > b.name) {
    return 1;
  }
  return -1;
});
