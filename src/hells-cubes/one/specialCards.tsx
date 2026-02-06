import { HellsCard } from './HellsCard';
import {
  Stormstorm,
  ObscureCommand,
  PlumberUmbra,
  ABlueCard,
  WildMagic,
  DruidicVow,
  CurveTopper,
} from './cards';

type Card = { path: string; name: string; component: JSX.Element };

export const specialCards: Card[] = [
  {
    path: '/hugh-man',
    name: 'Hugh Man, Human',
    component: <HellsCard queryString="t:Human" />,
  },
  {
    path: '/regal-karakas',
    name: 'Regal Karakas',
    component: <HellsCard queryString="(type:creature+type:legendary)" />,
  },
  {
    path: '/more-white-cards',
    name: 'We Need More White Cards',
    component: (
      <>
        <HellsCard queryString="color=w" key="1" />
        <HellsCard queryString="color=w" key="2" />
        <HellsCard queryString="color=w" key="3" />
      </>
    ),
  },
  {
    path: '/illusionary-gf',
    name: 'Illusionary GF',
    component: <HellsCard queryString="type:chandra" />,
  },
  {
    path: '/absurdly-cryptic',
    name: 'Absurdly Cryptic Command',
    component: (
      <>
        <HellsCard queryString="type:instant+color=U" key="1" />
        <HellsCard queryString="type:instant+color=U" key="2" />
        <HellsCard queryString="type:instant+color=U" key="3" />
        <HellsCard queryString="type:instant+color=U" key="4" />
      </>
    ),
  },
  {
    path: '/black-6-drop',
    name: 'A Black 6 Drop Creature',
    component: <HellsCard queryString="color=B+cmc=6" />,
  },
  {
    path: '/puzzle-box',
    name: 'Puzzle Box of Yogg-Saron',
    component: (
      <>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(entry => {
          return (
            <>
              <h3>{entry + 1}</h3>
              <HellsCard queryString="t:instant+or+t:sorcery" />
            </>
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
        <HellsCard queryString={`oracle:"when+~+dies" t:creature`} key="1" />
        <HellsCard queryString={`oracle:"when+~+dies" t:creature`} key="2" />
      </div>
    ),
  },
  { path: '/storm-storm', name: 'Stormstorm', component: <Stormstorm /> },
  {
    path: '/ultimate-ultimatum',
    name: 'Ultimate Ultimatum',
    component: <HellsCard queryString="ultimatum+-clarion" />,
  },
  {
    path: '/obscure-command',
    name: 'Obscure Command',
    component: <ObscureCommand />,
  },
  {
    path: '/plumber-umbra',
    name: 'Plumber Umbra',
    component: <PlumberUmbra />,
  },
  { path: '/blue-card', name: 'A Blue Card', component: <ABlueCard /> },
  {
    path: '/chandra',
    name: 'Chandra, Throughout the Ages',
    component: (
      <>
        <HellsCard queryString={`!"chandra,+novice+pyromancer"`} />
        <br />
        <HellsCard queryString={`!"chandra,+acolyte+of+flame"`} />
        <br />
        <HellsCard queryString={`!"chandra,+awakened+inferno"`} />
      </>
    ),
  },
  { path: '/wild-magic', name: 'Wildmagic surge', component: <WildMagic /> },
  {
    path: '/phyrexian-oublietterator',
    name: 'Phyrexian Oublietterator',
    component: <HellsCard queryString={`!"Oubliette"`} />,
  },
  {
    path: '/druidic-vow',
    name: "BallsJr123's Druidic vow",
    component: <DruidicVow />,
  },
  {
    path: '/lazav-with-a-flamethrower',
    name: 'Lazav With a Flamethrower',
    component: <HellsCard queryString={`!"chandra,+fire+of+kaladesh"`} />,
  },
  {
    path: '/tit',
    name: 'Tit for Tat',
    component: (
      <img
        src={
          'https://cdn.discordapp.com/attachments/631289553415700492/685521203217170526/cwx75bn555k41.png'
        }
      />
    ),
  },
  {
    path: '/weed-token',
    name: 'Weed Token',
    component: (
      <pre>{`Weed
  Artifact Token

  {2}, {tap}, Sacrifice this artifact: Flip a coin.
  If you win the flip, gain 6 life. Otherwise, lose 3 life.`}</pre>
    ),
  },
  {
    path: '/lucky-charms',
    name: 'Charmping Leprechauns',
    component: (
      <>
        <h2>Blarney&apos;s</h2>
        <HellsCard queryString={`!"rampant+growth"`} />
        <br />
        <HellsCard queryString={`!"Naturalize"`} />
        <br />
        <HellsCard queryString={`!"explore"`} />
        <h2>Stumpy&apos;s</h2>
        <HellsCard queryString={`!"fog"`} />
        <br />
        <HellsCard queryString={`!"giant+growth"`} />
        <br />
        <HellsCard queryString={`!"reclaim"`} />
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
    component: <HellsCard queryString="type:land" />,
  },
].sort((a, b) => {
  if (a.name > b.name) {
    return 1;
  }
  return -1;
});
