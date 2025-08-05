import { Link } from "react-router-dom";
import { BigContainer } from "./components";

export const UBEvasion = () => {
  return (
    <>
      <BigContainer>
        <h1>UB Evasion, Low Mana Costs, and Combat Damage Payoffs</h1>
        <div>
          We&apos;ve all seen UB evasion archetypes before, typically always
          with a set mechanic of sorts. (Ninjutsu, Cipher, etc.) What I hope to
          do as Archetype Curator of Dimir is blend all of these together into a
          cohesive yet still freeform-y archetype that churns out attackers that
          are going to hit face, and gets you payoffs for it.
        </div>
        <br />
        <h2>What I Want to See</h2>
        <div>
          Cheap creatures. Creatures that will be able to hit face without fear
          80%+ of the time. Hit face payoffs. The methodology behind these face
          hitters is up to you - I don&apos;t want there to be one singular set
          mechanic to rise above the rest, but I would like to avoid
          anti-synergy.
        </div>
        <br />
        <h2>Other Archetypes to Work With In The Back Of Your Mind</h2>
        <div>
          For now the one I have most vividly in my mind is{" "}
          <Link to="/hellscubes/eight/paradox-incorporated">UR Paradox</Link>,
          with shenanigans like graveyardjutsu or libraryjutsu, cipher, combat
          damage exile off the top, etc. As our surrounding color pair, just
          keep a little love for them (And the other archetypes, too!)
        </div>
        <br />
        <div>—goldcrackle</div>
      </BigContainer>
    </>
  );
};
