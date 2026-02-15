import {
  BigContainer,
  Divider,
  InnerContainer,
  ManaSymbolSmall,
  StyledH3,
} from "./components";
import RB from "../../assets/hybrid/BR.svg";
import RW from "../../assets/hybrid/RW.svg";
import RG from "../../assets/hybrid/RG.svg";
import UR from "../../assets/hybrid/UR.svg";
import { Link } from "react-router-dom";
export const RakdosCrimes = () => {
  return (
    <>
      <BigContainer>
        <h1>Rakdos Crimes</h1>
        <div>
          You know &apos;em, you love &apos;em, and now it&apos;s time to commit as many of them as
          possible. In the case that you don&apos;t know what a crime is, the first card I clicked
          on in Scryfall defines a crime as{' '}
          <i>
            (Targeting opponents, anything they control, and/or cards in their graveyards is a
            crime.)
          </i>
          .
        </div>
        <br />
        <Divider color={RB} />
        <h2>The Crimes Themselves</h2>
        <div>
          A lot of accidental crimes tend to creep into card design. Targeted removal, targeted
          graveyard removal, targeted burn, nasty unpleasant evil auras and curses, you know the
          sort. What we need now is very intentional crimes. Ping a single opponent instead of each
          opponent, picking off graveyard cards one at a time instead of bojuka bogs, that sort of
          stuff. This is the category of cards that I think I have the least concern about, given
          that the average cube is full of this kind of stuff anyway, so just do your best and have
          fun.
        </div>
        <br />
        <Divider color={RB} />
        <h2>Crime Payoffs</h2>
        <div>
          Now this is where I have a bit of concern. Making the crimes themselves is easy enough,
          profiting off of them is something that we&apos;re going to have to remember to do. SO,
          things that care about targeting your opponents stuff. OTJ, being the set with crimes, had
          a few of these, and feel free to have a look around. Just make sure to make these,
          alright? I don&apos;t have much else to say in this category.
        </div>
        <br />
        <Divider color={RB} />
        <h2>Our Partners in Crime</h2>
        <StyledH3>
          <Link to="/hellscubes/eight/targeting-matters">
            <ManaSymbolSmall src={RW} />
            Boros Targeting
          </Link>
        </StyledH3>
        <div>
          Our wonderful compatriots in mardu touching. This wonderful partnership shall result in
          many indicate jokes. Although please don&apos;t step on the toes of orzhov when making
          them. In addition to this, there&apos;s a cool but small subset of auras that scryfall
          calls &quot;Conditional Auras&quot;.{' '}
          <a href="https://tagger.scryfall.com/tags/card/conditional-aura">These things.</a> Anyway,
          if you can think of fun jokes to do with these they would be cool, given that they work
          with boros targeting as they boost your own stuff, and rakdos crimes, since they hurt your
          opponents stuff.
        </div>
        <StyledH3>
          <Link to="/hellscubes/eight/gruul-self-discard">
            <ManaSymbolSmall src={RG} />
            Gruul Everythingslinger
          </Link>
        </StyledH3>
        <div>
          You know what&apos;s better than cards you can cast to commit crimes? Cards you can
          discard or cast to commit crimes. Madness, Channel, you know the sort. Make a few of these
          with burn or stuff, to give everythingslinger a few more options for shooting people and
          to give us even more lovely lovely crimes
        </div>
        <StyledH3>
          <Link to="/hellscubes/eight/paradox-incorporated">
            <ManaSymbolSmall src={UR} />
            Izzet Paradox
          </Link>
        </StyledH3>
        <div>
          yeah im not going to beat around the bush and be fancy here since this one&apos;s a
          stretch, but once again, crimes that benefit other archetypes, foretelling crimes and
          flashbacking crimes and all other kinds of posthumous crimes.
        </div>
        <br />
        <img src="https://media.tenor.com/FwP1UdcbX9AAAAAM/night-in-the-woods-nitw.gif" />
        <div>—munkegutz</div>
      </BigContainer>
    </>
  );
};
