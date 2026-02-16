import rw from '../../assets/RW.svg';
import br from '../../assets/BR.svg';
import wb from '../../assets/WB.svg';
import wu from '../../assets/WU.svg';
import rg from '../../assets/RG.svg';
import { BigContainer, Divider, InnerContainer, ManaSymbolSmall, StyledH3 } from './components';
import { Link } from 'react-router-dom';
export const TargetingMatters = () => {
  return (
    <BigContainer>
      <h1>RW Targetting Matters</h1>
      <div>
        If you&apos;ve played any amount of Magic between MH3 and a couple of days ago, you might
        want to throttle me to death for this one, but thog dont caare. You&apos;re getting
        Targeting Matters whether you like it or not. (Also known as Heroic/Valiant/That Horseshit
        Nadu Was Doing For A While).
      </div>
      <br />
      <Divider color={rw} />
      <h2>Things That Target</h2>
      <div>
        This happens a lot anyway. Equipments, Auras, Dilu Horses and Giant Growths just to name a
        few. But, in order to make them not be dead cards so much, make sure to give them a little
        something for your trouble. Maybe a tapped Treasure, or a Cycling effect, or even some card
        draw (such as with Defiant Strike). You could even change your potential buff spells into
        Overload spells. Just some food for thought.
      </div>
      <br />
      <Divider color={rw} />
      <h2>Things That Get Targetted</h2>
      <div>
        This is the part that is less automatic. You gotta include payoffs for being targetted. This
        can be something literal like &quot;When this creature is targetted, get X.&quot;, it could
        be something mostly related to the concept (such as Zada, Hedron Grinder&apos;s ability) or
        it could even just be something you&apos;d want to target (I&apos;ll get to that). You could
        even make Indicate hand tokens. Please do that. Please make Indicate hand tokens.
      </div>
      <br />
      <Divider color={rw} />
      <h2>Brothers In Arms</h2>
      <Link to="/hellscubes/eight/rakdos-crimes">
        <StyledH3>
          <ManaSymbolSmall src={br} /> {'Rakdos Crimes'}
        </StyledH3>
      </Link>
      <div>
        This, I feel, is quite obvious. There&apos;s not much of a leap between targetting your own
        stuff and targetting your opponent&apos;s stuff. I like the idea of Conditional Auras that
        MumkeGutz brought up, but another thing you could do is make a guy who turns targets into
        crimes. You&apos;ll figure it out, I&apos;m sure.
      </div>
      <Link to="/hellscubes/eight/small-reanimator">
        <StyledH3>
          <ManaSymbolSmall src={wb} /> Orzhov Small Reanimator
        </StyledH3>
      </Link>
      <div>
        Ever noticed what the second word in Reanimate is? Checkmate atheists. For real though,
        I&apos;m sure there will be plenty of good creatures to target in these colours, especially
        since Dimir is all about evasive creatures.
      </div>
      <Link to="/hellscubes/eight/azorious-historic">
        <StyledH3>
          <ManaSymbolSmall src={wu} /> Azorius Historic
        </StyledH3>
      </Link>
      <div>Equipments are historic. Little bit thin, but it&apos;s something.</div>
      <Link to="/hellscubes/eight/gruul-self-discard">
        <StyledH3>
          <ManaSymbolSmall src={rg} /> Gruul Self-Discard
        </StyledH3>
      </Link>
      <div>
        I&apos;m sure you can staple some targetted effects onto Channel abilities, or heck, you
        could even add Cycling to some of the target effects.
      </div>
      <h2>Conclusion</h2>
      <div style={{ whiteSpace: 'pre' }}>
        {`"                                                   You.                        "`}
        <br /> <i>—Sorin Markov</i>
      </div>
      <br />
      <div>—oatmeal42</div>
    </BigContainer>
  );
};
