import {
  BigContainer,
  ManaSymbol,
  ManaSymbolSmall,
  StyledH3,
} from "./components";
import { getPipSrc } from "../../hellfall/stringToMana";
import { Link } from "react-router-dom";
export const GolgariLandistocrats = () => {
  return (
    <BigContainer>
      <h1>
        <ManaSymbol src={getPipSrc("B/G")} /> Golgari Landistocrats
      </h1>
      <div>
        Green loves lands and the graveyard, and black loves… the graveyard
        (Isn’t the color pie <i>amazing?</i>), so wouldn’t it be nice if you
        could put them together and use lands for more than mana by killing them
        off? No? Well, I have the archetype for you: BG Landistocrats! This
        archetype is all about sacrificing, milling, or otherwise filling your
        graveyard with lands to be used as a resource for reanimating or buffing
        cards in some way later.
      </div>
      <br />
      <h2>☠️ Lands are Kil</h2>
      <div>
        So the life of the loam of Landistocrats starts with getting lands into
        your graveyard in the first place. This is what I imagine will be the
        easiest part of this archetype to fulfill. There should be plenty of
        ways to either sacrifice lands, or get lands into your graveyard by
        milling/discarding land cards.
      </div>
      <br />
      <div>
        Fetches are a classic example of this, being lands that sacrifice
        themselves while also benefiting the user (Very important!!!). Land sac
        outlets are nice, too, but please make them in moderation. Cards that
        search for lands just to dump them into the graveyard are pretty funny
        and also great support for what will be outlined in the next section.
      </div>
      <br />
      <h2>🪱 Landfill</h2>
      <div>
        This is what would bring in the main value of playing Landisocrats: our
        beloved triggers. You want to reward the reckless action of removing
        your main source of mana by making cards that trigger upon lands dying
        or entering the graveyard in some way. My favorite example of this is{" "}
        <strong>Landfill</strong>.
      </div>
      <br />
      <div>
        Landfill is like Landfall but it triggers when a land enters your
        graveyard, rather than the battlefield. This is an amazing method to tie
        in all of the random bullshit I imagine people will come up with to get
        lands into the graveyard very nicely. Benefits include mana acceleration
        like Treasures or ramping into more lands as well as card advantage like
        drawing cards or providing ways to play land cards from your graveyard.
      </div>
      <br />
      <h2>(?) So my graveyard is full of lands. Now what?</h2>
      <div>
        Great question if I’d say so myself. You fucking idiot. OF COURSE I said
        so mysel-
      </div>
      <br />
      <div>
        The best payoffs for Landistocrats can come from the landfill triggers
        themselves, such as the good ol’ Drain and Gain™ or buffing creatures
        you control in some way, whether it be p/t or some abomination of a
        keyword ability. Other payoffs can come from the act of lands dying or
        being sacrificed, or buffs based on the number of lands in your
        graveyard in general (Think Lord of Extinction, but for lands only). The
        rest is up to you. God only knows what shit you’ll come up with to make
        this work, but I have faith in all of you. Just find a way to win the
        game somehow.
      </div>
      <h2>💡 Archetype Synergy</h2>
      <StyledH3>
        <Link to="/hellscubes/eight/lands-lands-lands">
          <ManaSymbolSmall src={getPipSrc("G/W")} />
          GW Lands
        </Link>
      </StyledH3>
      <div>
        You know what pairs well with Landistocrats? Lands. Amazing, I know. WG
        will have plenty of valuable lands that will help accelerate our
        game-plan by providing value and more fodder to sac later.
      </div>
      <StyledH3>
        <Link to="/hellscubes/eight/simic-animation">
          <ManaSymbolSmall src={getPipSrc("G/U")} />
          GU Animate Everything
        </Link>
      </StyledH3>
      <div>
        Animating lands lets them die in combat easier, which can be a nice 2
        for 1 for you by dealing damage as well as triggering landfill.
      </div>
      <StyledH3>
        <Link to="/hellscubes/eight/gruul-self-discard">
          <ManaSymbolSmall src={getPipSrc("R/G")} />
          RG Self Discard
        </Link>
      </StyledH3>
      <div>
        Not as obvious, but this archetype can help offset the loss from
        discarding cards by using them later for Landistocrats shenanigans.
      </div>
      <h2>My Terrible Conclusion</h2>
      <div>
        So that’s that! Good luck, have fun, lock the fuck in, and don’t
        squander your resources too quickly.
      </div>
      <br />
      <div>—c4sdabomb</div>
    </BigContainer>
  );
};
