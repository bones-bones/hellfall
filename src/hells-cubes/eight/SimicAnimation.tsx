import {
  BigContainer,
  InnerContainer,
  ManaSymbolSmall,
  StyledH3,
} from "./components";
import { getPipSrc } from "../../hellfall/stringToMana";
import { Link } from "react-router-dom";
export const SimicAnimation = () => {
  return (
    <>
      <BigContainer>
        <h1>Simic Animation</h1>
        <div>
          In true Simic fashion, our goal is to take things that unfortunately aren’t creatures, and
          with a little Hellscube magic, turn them into lean, mean, game-progress-making creatures!
          Whether that’s normal things like lands and artifacts, or something wacky like your entire
          hand or graveyard, we’ll make it happen! This is an unusual archetype, and as such, will
          probably require some focused effort to really make it click. That being said, here are my
          goals and how I think we can bring this archetype to life:
        </div>
        <h2>Creating an Animation Pitch</h2>
        <div>
          First of all, we need ways to animate things. The methods of doing so are likely going to
          vary card by card, but the top minds of Hellscube (and me, idk why I was invited) have
          already come up with a handy dandy mechanic to streamline the process:
          <br /> <br />
          <strong>Animate (keyword action):</strong> To animate a target, it becomes a creature in
          addition to its other types, and has power and toughness equal to its mana value. (This
          effect lasts indefinitely.)
          <br /> <br />
          <strong>Animate N (keyword action):</strong> To animate N a target, it becomes an N/N
          creature in addition to its other types. (This effect lasts indefinitely.)
          <br /> <br />
          Some example cards with these mechanics are in this thread: ⁠Proposed mechanic for UG:
          Anima…. I imagine animate N will be the more common variant, since it’s easier to tune the
          stats according to the mana cost and effect of the card using it. On the other hand, since
          animate (no number afterwards) doesn’t really work on lands and tokens, I think it’s
          probably better used on cards which animate themselves. Of course, you don’t have to use
          this mechanic if it doesn’t fit the card you’re making, but if it does, I encourage you to
          use Animate to shortcut the wordy phrasing of animation!
        </div>
        <h2>Assembling an Animation Studio</h2>
        <div>
          Second, and more difficult, are payoffs for animation. These will likely be in shorter
          supply, so I encourage you to make them if you have ideas! Of course, controlling more
          creatures is its own reward, but the archetype needs some cohesion to make it work. Some
          ideas I have include:
        </div>
        <ul>
          <li>
            Payoffs for having several permanent types (something like Superman, but in these colors
            and for types. Or just payoffs for creatures with additional card types)
          </li>
          <br />
          <li>
            Payoffs for having animated permanents of specific types (lands and artifacts are
            probably the best candidates for this)
          </li>
        </ul>
        <h2>Easy Archetype Pairings</h2>
        <Link to={'/hellscubes/eight/lands-lands-lands'}>
          <StyledH3>
            <ManaSymbolSmall src={getPipSrc("G/W")} />
            WG Lands
          </StyledH3>
        </Link>
        <div>Manlands. That is all.</div>
        <br />
        <div>
          Well, I have more to say. But it’s still about manlands. I encourage you to lean into the
          theme of “land creatures!” Make some payoffs for land creatures, since they seem like a
          great fit for HC8 all around. Most of the green archetypes are happy with land creatures,
          especially…
        </div>

        <Link to={'/hellscubes/eight/golgari-landistocrats'}>
          <StyledH3>
            <ManaSymbolSmall src={getPipSrc("B/G")} />
            BG Landristocrats
          </StyledH3>
        </Link>
        <div>
          You know what’s hard to sacrifice? Lands. You know what’s easy to sacrifice? Creatures.
          You see where I’m going with this. Animating lands makes them more likely to die, whether
          in combat or in an unfortunate Deadly Dispute. While that might usually be something to
          tread lightly around, HC8 is fully set up to take advantage of it! BG landristocrats turns
          the risk-reward of land animation into reward-reward, so embrace it and let your land
          animation dreams come true!
        </div>
        <h2>TLDR</h2>
        <div>
          Make things that animate. Mostly lands and some artifacts, along with other wacky hellsy
          ideas. But more importantly, start brainstorming ideas for animation payoffs.
        </div>
        <div>—wrendle_</div>
      </BigContainer>
    </>
  );
};
