import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { FC, PropsWithChildren } from 'react';
import { HCBorderColor, HCMiscColors } from '@hellfall/shared/types';
import { looseOpList, sorts } from '@hellfall/shared/filters';

const mapListToCodeAnd = (textList: string[]) =>
  textList.map((text, i) => (
    <>
      {i == textList.length - 1 && ' and '}
      <code>{text}</code>
      {i < textList.length - 1 && ', '}
    </>
  ));
const mapListToCodeOr = (textList: string[]) =>
  textList.map((text, i) => (
    <>
      {i == textList.length - 1 && ' or '}
      <code>{text}</code>
      {i < textList.length - 1 && ', '}
    </>
  ));
export const Syntax = () => {
  return (
    <>
      <title>Search Reference | Hellfall</title>
      <BigContainer>
        <h1>Search Syntax</h1>
        <div>
          Hellfall's syntax is heavily based on that of Scryfall, so please see{' '}
          <Link to={'https://scryfall.com/docs/syntax'}>the scryfall syntax docs</Link> for a lot of
          this. This page documents the syntax that Hellfall uses that differs from that of
          scryfall.
        </div>
        <h2>Colors</h2>
        <div>
          Hellscube has extra colors, so you can use <code>p</code> or <code>purple</code> to search
          for purple. You can also search for misc colors ({mapListToCodeAnd(HCMiscColors)}) using
          either their names or <code>misc</code> as a wildcard that matches all of them. You can
          also use <code>misc</code> before any color search to treat all misc colors as a single
          color (e.g. for searches against numbers of colors){' '}
        </div>
        <br />
        <div>
          You can't use <code>id:</code> as a keyword for color identity searches, since that's
          reserved for card ids.
        </div>
        <br />
        <div>
          You can use <code>indicator:</code> to search for color indicators of specific colors, and
          you can use <code>hybrid:</code> to search for color identity using based hybrid rules
          (like for HC6 draft).
        </div>
        <h2>Card Types/Text/Names</h2>
        <div>
          You can specifically search for supertypes with <code>super:</code>, main card types with{' '}
          <code>ct:</code> or <code>cardtype:</code>, and subtypes with <code>sub:</code>.{' '}
        </div>
        <br />
        <div>
          You can search for a card's id with <code>id:</code>.
        </div>
        <br />
        <div>
          Using <code>~</code> as a placeholder for the card's name doesn't work yet.
        </div>
        <br />
        <div>
          You can also use everything in{' '}
          <Link to={'https://scryfall.com/docs/syntax#spells'}>
            Spells, Permanents, and Effects
          </Link>
          .
        </div>
        <h2>Tags, Creators, and Artists</h2>
        <div>
          Hellfall doesn't have art tags yet, so those don't work yet. Oracle tags do work, though,
          and can also be found with <code>tag:</code>.
        </div>
        <br />
        <div>
          The tag search works mostly like other text search filters, except that it has some
          special handling for tag notes. You can use <code>tag:x{'<'}</code> to find cards that
          have any tag note for <code>x</code>, and you can use{' '}
          <code>
            tag:x{'<'}y{'>'}
          </code>{' '}
          to search for <code>y</code> in the notes for tag <code>x</code>.
        </div>
        <br />
        <div>
          You can also use <code>tagnote:</code> or <code>tn:</code> to search against just the tag
          notes.{' '}
        </div>
        <br />
        <div>
          You can use all the scryfall search terms for artists, and you can use{' '}
          <code>creator:</code> in the same way.
        </div>
        <br />
        <div>
          You can also search for artist notes in much the same way as for tag notes, including
          using <code>artistnote:</code> or <code>an:</code> to search against artist notes
          directly.
        </div>
        <h2>Mana Costs</h2>
        {/* TODO: Implement good mana search */}
        <div>
          A lot of the functionality of the scryfall mana search hasn't been added yet, so{' '}
          <code>mana:</code> currently acts like a regular text search term, though{' '}
          <code>is:hybrid</code> and <code>is:phyrexian</code> do work.
        </div>
        <br />
        {/* TODO: add these */}
        <div>
          {' '}
          {mapListToCodeAnd(['manavalue:even', 'manavalue:odd', 'devotion:', 'produces:'])} haven't
          been implemented yet.{' '}
        </div>
        <h2>Numbers</h2>
        <div>
          <code>manavalue:</code>, <code>power:</code>, <code>toughness:</code>, <code>pt:</code>,
          <code>loyalty:</code>, <code>defense:</code>/<code>def:</code>, and <code>cn:</code> all
          work as keywords.
        </div>
        <br />
        <div>
          You can use numeric expressions ({mapListToCodeAnd(looseOpList)}) to compare a numeric
          keyword (one of the ones listed above, or a color search keyword (
          {mapListToCodeOr(['color', 'identity', 'indicator', 'hybrid'])})) to either another
          numeric keyword or to a number.
        </div>
        <br />
        <div>
          <code>:</code> is interpreted as the default for that keyword, and <code>!:</code> as its
          inverse. You can also use these operators for any other keyword, and it will try to
          interpret them as logically as possible, though it might default to simply treating{' '}
          {mapListToCodeAnd(['<=', '=', '>='])} as equivalent to <code>:</code> and treating{' '}
          {mapListToCodeAnd(['>', '!=', '<', '!:'])} as equivalent to negating the search term.
        </div>
        <h2>Logic/Conditions</h2>
        <div>
          Instead of using <code>!</code> before a name to get the exact name, use <code>=</code>{' '}
          instead. This will match all cards with that exact name (including flavor names and names
          of faces). This also works for all other text components of cards, as well as for{' '}
          <code>lore:</code>.
        </div>
        <br />
        <div>
          Everything from Scryfall's{' '}
          <Link to={'https://scryfall.com/docs/syntax#negating'}>Negating Conditions</Link> section
          applies, except that <code>include:</code> can also be inverted to turn it into{' '}
          <code>exclude:</code>, and vice versa.
        </div>
        <br />
        <div>
          You can use <code>~</code> before a search term to have that search term check against a
          card's related cards.
        </div>
        <br />
        <div>
          You can also use <code>is:</code> with{' '}
          {mapListToCodeOr(['draftpartner', 'token', 'tokenmaker', 'persistent'])} to find cards
          that are that, and you can use <code>has:</code> with those terms to find cards that have
          related cards that match them.
        </div>
        <br />
        <div>
          Everything from Scryfall's{' '}
          <Link to={'https://scryfall.com/docs/syntax#or'}>Using "Or"</Link> and{' '}
          <Link to={'https://scryfall.com/docs/syntax#nesting'}>Nesting Conditions</Link> sections
          also applies.
        </div>
        <br />
        <div>
          When using <code>~</code> on parentheses <code>( )</code>, the search will look for cards
          with related cards that match the entirety of the contents of the parentheses.
        </div>
        <br />
        <div>Regex hasn't been implemented yet.</div>
        <h2>Sets and Blocks</h2>
        <div>
          Use <code>s:</code> or <code>set:</code> to find cards in a set, use <code>ts:</code> or{' '}
          <code>tokenset:</code> to find cards made by cards in a set, and use <code>b:</code> or{' '}
          <code>block:</code> to find both.
        </div>
        <br />
        <div>
          Since reprints haven't been fully implemented yet, <code>in:</code> doesn't work. You can
          use <code>is:masterpiece</code> and <code>is:rebalanced</code> though.
        </div>
        <div>
          <code>st:</code> also hasn't been implemented yet.
        </div>
        <h2>Legality</h2>
        <div>
          To find cards with a given legality in a given format, use <code>f:</code>,{' '}
          <code>format:</code>, or <code>legal:</code> to find cards that are legal,{' '}
          <code>banned:</code> for banned, or <code>notlegal:</code> for not legal.
        </div>
        <br />
        <div>
          The current supported formats are: <code>standard</code>, <code>4cb</code>, and{' '}
          <code>commander</code>.
        </div>
        <br />
        <div>
          You can use <code>is:commander</code> to find cards that can be your commander and can use{' '}
          <code>is:partner</code> to find cards with partner mechanics, but the other{' '}
          <code>is:</code> search terms from{' '}
          <Link to={'https://scryfall.com/docs/syntax#legality'}>Scryfall</Link> haven't been
          implemented yet.
        </div>
        <h2>Watermarks, Layout, Border, Frame, & Foil</h2>
        <div>The watermark searches from Scryfall work.</div>
        <br />
        <div>
          You can search for{' '}
          <Link
            to={
              'https://github.com/bones-bones/hellfall/blob/main/packages/shared/src/types/Card/values/Layout.ts'
            }
          >
            layouts
          </Link>{' '}
          using <code>is:</code> or <code>layout:</code> to find card layouts, <code>has:</code> or{' '}
          <code>facelayout:</code> to find face layouts, and <code>anylayout:</code> to find both.
          This includes all the layouts that work with{' '}
          <Link to={'https://scryfall.com/docs/syntax#faces'}>Scryfall</Link>.
        </div>
        <br />
        <div>
          Use the <code>border:</code> keyword to find cards with a{' '}
          {mapListToCodeOr(Object.values(HCBorderColor))} border.
        </div>
        <br />
        <div>
          You can search for{' '}
          <Link
            to={
              'https://github.com/bones-bones/hellfall/blob/main/packages/shared/src/types/Card/values/Frame.ts'
            }
          >
            card frames
          </Link>{' '}
          or{' '}
          <Link
            to={
              'https://github.com/bones-bones/hellfall/blob/main/packages/shared/src/types/Card/values/Frame.ts'
            }
          >
            frame-effects
          </Link>{' '}
          using <code>cardframe:</code> or <code>frameeffect:</code> respectively, or you can search
          for both at once using <code>frame:</code>. This includes all the card frames and frame
          effects that work with <Link to={'https://scryfall.com/docs/syntax#faces'}>Scryfall</Link>
          .
        </div>
        <br />
        <div>
          You can search for<Link to={'https://mtg.wiki/page/Showcase'}>showcase frames</Link> using{' '}
          <code>showcase:</code>. You can also search for a plane to get all showcase frames from
          that plane.
        </div>
        <br />
        <div>
          You can also use the following with <code>is:</code>:{' '}
          {mapListToCodeAnd([
            'fullart',
            'extendedart',
            'verticalart',
            'noart',
            'showcase',
            'etched',
            'borderless',
            'colorshifted',
            'old',
            'new',
            'foil',
            'nonfoil',
          ])}
          .{' '}
        </div>
        <h2>Display/Sort</h2>
        <div>
          <code>unique:</code>, <code>display:</code>, and <code>prefer:</code> aren't implemented
          yet.
        </div>
        <br />
        <div>
          Hellfall treats sort keywords a bit differently from Scryfall in order to allow sorting
          with multiple keywords at once. Because of this, the{' '}
          {mapListToCodeAnd(['sort:', 'order:', 'direction', 'dir:'])} keywords are all
          interchangeable, and can have a sorting term ({mapListToCodeOr(sorts.slice(0, -1))})
          and/or a direction term (<code>asc</code> or <code>desc</code>). If you're using both a
          sorting term and a direction term, separate them with a comma and put the sorting term
          first. The search will try to combine them as much as possible, so you don't have to put
          both the sort and the direction in a single term, but it helps.
        </div>
        <br />
        {/* TODO: figure out how to word this better */}
        <div>
          When there are multiple sort keywords, they are applied from left to right, with later
          ones only being used to break ties. Because of this, any that can't have any effect or
          that are duplicates are ignored.
        </div>
        <h2>Miscellaneous</h2>
        <div>
          All the <Link to={'https://scryfall.com/docs/syntax#shortcuts'}>shorthands</Link> that
          work for Scryfall and have any cards in hellscube that match them also work in Hellfall.
        </div>
        <h2>Include/Exclude</h2>
        <div>
          Use <code>include:extras</code> to reveal all cards. You can also use{' '}
          <code>include:extracards</code> to add cards, <code>include:tokens</code> to add tokens,
          or <code>include:veto</code> to add vetoed cards. If you want to exclude cards that{' '}
          <em>aren't</em> extras, use <code>exclude:nonextras</code>.
        </div>
        <h2>Not Implemented Yet</h2>
        <div>
          Everything in Games, Promos, & Spotlights, Year, Reprints, Languages (except{' '}
          {mapListToCodeAnd(['is:alchemy', 'is:rebalanced'])}){' '}
        </div>
        <h2>Won't Be Implemented</h2>
        <div>
          The following won't be implemented: <code>rarity:, is:funny</code>, all pricing searches
        </div>
      </BigContainer>
    </>
  );
};

export const BigContainerE = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: 'lightgrey',
  minHeight: '95vh',
});

export const BigContainer: FC<PropsWithChildren> = ({ children }) => {
  //
  return (
    <BigContainerE>
      <InnerContainer>{children}</InnerContainer>
    </BigContainerE>
  );
};
export const InnerContainer = styled('div')({
  width: '80vw',
  backgroundColor: 'white',
  padding: '20px',
});
export const ManaSymbol = styled('img')({ height: '30px' });
export const ManaSymbolSmall = styled('img')({
  height: '20px',
  paddingInlineEnd: '10px',
  paddingInlineStart: '5px',
});
export const StyledH3 = styled('h3')({ display: 'flex', alignItems: 'center' });

export const Divider = ({ color }: { color: string }) => {
  return (
    <DivContainer>
      <DivLine />
      <ManaSymbol src={color} />
      <DivLine />
    </DivContainer>
  );
};

const DivLine = styled('div')({
  height: '3px',
  width: '20vw',
  background: 'black',
});

const DivContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
