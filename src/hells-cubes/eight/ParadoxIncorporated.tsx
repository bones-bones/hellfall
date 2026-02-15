import {
  BigContainer,
  InnerContainer,
  ManaSymbol,
  ManaSymbolSmall,
} from "./components";
import UR from "../../assets/hybrid/UR.svg";
import RG from "../../assets/hybrid/RG.svg";
import { Link } from "react-router-dom";
export const ParadoxIncorporated = () => {
  return (
    <BigContainer>
      <h1>
        Paradox Incorporated <ManaSymbol src={UR} />
      </h1>
      <div>
        Welcome to the Paradox Employee Handbook! We at Paradox Incorporated are
        committed to avoiding the most boring zone in all of Hellscube history,
        the hand. Some fools will tell you that the best form of card advantage
        is card draw but we at Paradox Incorporated hate this concept. So, we
        have come up with an innovative solution to this issue: Paradox.
        Paradox, the birth child of our ingenious scientists and definitely not
        a mechanic printed in the Doctor Who commander decks, is a brand new
        mechanic that gives up all the benefits we could want for avoiding
        playing from the most boring zone in existence.
      </div>
      <br />
      <h2>Paradox :symbolT: :symbolUT:</h2>
      <div>
        Put simply,{" "}
        <i>
          Paradox is an effect that triggers whenever you cast a spell from
          anywhere but your hand.
        </i>{" "}
        This means whenever you cast a spell from any non-boring zone including
        but not limited to; graveyard, exile, deck, sideboard, stack,
        battlefield, command zone, or some other weird zone like Hell; you can
        still get the benefits. Although this may seem like your typical Izzet
        Spellslinger archetype, Paradox actually plays out a bit differently.
        Our card draw should be mostly relegated to more unique versions like
        impulse draws, future sight effects, underworld breach effects, or
        wishes as opposed to the traditional form of card draw. After all, the
        last thing we would want is to add more cards to our hand. So if you are
        in either of Paradox Inc’s two colors, feel free to keep that in mind.
        Additionally, Paradox dosen’t care how you cast the spell or how many
        you cast, just make sure the spells are from other zones. Multicasting,
        while useful, isn’t essential.
      </div>
      <br />
      <h2>Help Wanted</h2>
      <div>
        One of our best employees, [[Agent Fblthp]] has gone ahead and done what
        he does best: get lost. Specifically, he has gotten lost in “HC6”. He
        fits perfectly in Paradox Incorporated and shows how to make a payoff
        that doesn’t necessarily have Paradox itself stapled onto it. Feel free
        to use his work as inspiration. In addition, I would appreciate if
        anyone could help find him and bring this masterpiece of an employee
        back to our company in HC8.
      </div>
      <br />
      <h2>Real Estate</h2>
      <div>
        Despite what people may think, Paradox Incorporated is not a real estate
        company. If you wish to claim some land for the company be aware that we
        are the only archetype that isn’t in anyway connected to the 2 real
        estate giants, Landistocrats and Lands. As such our lands can be more
        general and less utility focused. Mana is our bottleneck and we have
        plenty of card advantage so we don’t need all that many effects stapled
        to our lands. In fact, our keyword specifically excludes lands so if you
        do create a land, be aware that having lands with effects will generally
        not be worth it for Paradox. Instead lands that have fixing or benefit
        from paradoxically casting spells are greatly appreciated instead.
        Additionally, as the enemy of the land decks in the format, Paradox
        Incorporated may just be the main archetype for land hate if it is
        needed.
      </div>
      <br />
      <h2>Payday</h2>
      <div>
        As we have realized at Paradox Incorporated, it is quite easy for us to
        get carried away in the unique ways to cast cards from non-boring zones
        and not realize that there is no way to actually profit from it. Paradox
        is an inherently joke-limiting keyword but it is a necessary evil to
        allow this archetype to thrive. Paradox Incorporated will be keeping a
        sharp eye to ensure that profits can still be made and that payoffs are
        being made at a reasonable pace.
      </div>
      <br />
      <h2>Other Archetypes</h2>
      <div>
        Like BR Crimes, casting spells outside your hand is pretty common in
        card design. As such, making a card that supports Paradox in neighboring
        colors could be as simple as giving a spell Flashback or giving it Plot.
        Although I do have to mention one of our compatriots in specific.
      </div>
      <h3>
        <Link to="/hellscubes/eight/gruul-self-discard">
          <ManaSymbolSmall src={RG} /> RG Discard
        </Link>
      </h3>
      <div>
        Gruul understands the idiocracy of playing cards from hand like we do.
        In fact they hate the hand zone so much they made an entire strategy to
        removing every card in there. Madness and Flashback stand as great
        mechanics that allow you to combine the best of both mechanics and
        celebrate the unity of hand-hating.
      </div>
      <br />
      <div>
        That is everything you need to know. Paradox Incorporated hopes that you
        enjoy your time here and work as hard as you can to make the cube a
        better, hand-free place.
      </div>
      <br />
      <div>—legallyabyssal</div>
    </BigContainer>
  );
};
