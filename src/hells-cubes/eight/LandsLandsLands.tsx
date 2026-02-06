import { BigContainer, InnerContainer, ManaSymbolSmall } from './components';
import GW from '../../assets/GW.svg';
import BG from '../../assets/BG.svg';
import { Link } from 'react-router-dom';
import UR from '../../assets/UR.svg';
export const LandsLandsLands = () => {
  return (
    <>
      <BigContainer>
        <h3>Lands.</h3>
        <h2>Lands.</h2>
        <h1>Lands.</h1>
        <div>
          We love &apos;em. We need &apos;em. But none of the other folks undertand &apos;em like we
          do. <ManaSymbolSmall src={GW} />
          gamers- the God-fearing folk who live off the lands, who feel them underneath our toes and
          who connect with their utility.
        </div>
        <br />
        <div>
          Some red deck gamer is going to play 17 basic mountains, a few hasty creatures and
          flashback a burn spell or two. Us? We cram every single bit of utility, win-con, value
          engine and other sub-par non-basic we can into the bad boy. If our lands are coming in
          untapped, it meant we jumped through more hoops than you&apos;ll find at a gym session for
          40-something white women. It meant we worked for it.
        </div>
        <br />
        <div>
          Tempo? You have the gall to talk to me about tempo?! Your filthy basic island is not going
          to tap for shit when your hand is empty. I&apos;ll be proliferating, populating, and
          animating all the way to the bank when your oh-so-swanky engine putters out on turn 9. We
          spit on tempo. A game of magic is going to take a maximum of 30-something turns, give or
          take. If your utility land comes online on turn 5, that&apos;s 25 turns of free value for
          you. Delicious, delicious value. I&apos;d like to see your 15 swamps do that, nerd.
        </div>
        <br />
        <div>
          But we&apos;re not just activating our lands. Our sisters over in{' '}
          <Link to="/hellscubes/eight/golgari-landistocrats">
            <img height="12px" src={BG} /> Lands
          </Link>{' '}
          have the right of it that lands should go in the graveyard- but why stop there? Why not
          lands with suspend hopping into exile? Lands in hands being beheld for extra effects,
          lands going into and on top of libraries, and then being milled into the graveyard. If our
          lands aren&apos;t going on a merry jig through every zone in the game, why even bother?
        </div>
        <br />
        <div>
          Now, with all this, you might still be thinking; &quot;But Pax, where&apos;s our
          playables? If we&apos;re drafting 17 nonbasics, how do we fill out the rest of the
          deck?!&quot; First of all, screw you for using my real name, that&apos;s Commisar Curator
          to you. Second; when you draft Lands, your lands are your playables. Plus, with a mana
          base the size of Boston, splash away!
        </div>
        <br />
        <div>
          And you know what? For you fuckers, I&apos;ll even throw in some Land design tips for the
          low low price of free:
        </div>
        <ul>
          <li>
            Don&apos;t make something that&apos;s just better than a basic land. Give it a downside.
            Tapped entering and life are classics, but get jiggy with it.
          </li>
          <br />
          <li>
            Don&apos;t make all the lands colorless. The lands are ours. If I see one filthy{' '}
            <Link to="/hellscubes/eight/paradox-incorporated">
              Paradox <img height="12px" src={UR} /> gamer
            </Link>{' '}
            playing with our utillity lands, I&apos;m going to be knocking in skulls.
          </li>
          <br />
          <li>
            Make the supporting cast too. What&apos;s a Reliquary Tower without its Knight of The
            Reliquary? What- those cards have little to no inherent synergy? Well make some that do!
            Cards that care about lands in zones or activated abilities of lands are obvious, but
            the ol&apos; exploration mappy tutors are also swell. Get creative- that&apos;s your
            job, not mine.
          </li>
        </ul>
        <div>—p4xie_</div>
      </BigContainer>
    </>
  );
};
