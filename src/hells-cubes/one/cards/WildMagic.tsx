export const WildMagic = () => {
  const strings = [
    "If you roll this text, roll an additional 5 times on the Wild Magic Surge table and gain all that text instead, ignoring this result on subsequent rolls.",
    "Until the end of your next turn, players cast spells as if they were copies of Wild Magic Surge.",
    "Turn all face down creatures face up and manifest all face up creatures. (These are simultaneous.)",
    "Exile all spells on the stack.",
    "Roll a d6. It becomes an X/X Construct artifact creature token named Modron, where X is the number face up on the die.",
    "You gain flying until the end of your next turn. (You can’t be attacked by creatures without flying.)",
    "Wild Magic Surge deals 4 damage to each creature and yourself.",
    "Create a 3/2 pink Flamingo creature token with flying.",
    "Cast a copy of Magic Missile.",
    "Regenerate all creatures.",
    "Roll a d6. If the result was even, target creature gets +X/+X until end of turn, where X was the roll. If the result was odd, target creature gets -X/-X until end of turn, where X was the roll.",
    "Discard a card, then draw two cards.",
    "Play a random card from your hand without paying its mana cost. (You are forced to play lands as well.)",
    "Draw 7 cards. At the end of your next turn, discard 7 cards.",
    "Gain 5 life. At the beginning of your next upkeep, gain 5 life.",
    "Draw two cards, then discard a card.",
    "Sneeze on two target creatures. (Tap them. If you control a creature with infect, destroy them instead.)",
    "Create two treasure tokens.",
    "Goad all creatures.",
    "Wild Magic Surge becomes a minigame until end of turn. Play one round of two truths and a lie with all opponents, with you telling the truths and lie. If you win, draw two cards.",
    "Treat the next roll target opponent makes as a 1. Roll a d4.",
    "For the rest of the game, nonland permanents and spells you cast are blue. Draw a card.",
    "Feel bad that this card did nothing. (Sucks to be you!)",
    "Look at your opponent’s hand, then scry 1.",
    "Roll 1d3. Put that many +1/+1 counters on target creature.",
    "Until end of turn, you may cast spells as though they had flash.",
    "Add UR. Target opponent gains control of Wild Magic Surge. ",
    "If you are playing planechase, activate the chaos ability of the plane you are on, then planeswalk. If you are not, activate the chaos ability of a plane chosen at random.",
    "Set your life total to 1. At the beginning of your next upkeep, gain 19 life.",
    "Prevent all combat damage that would be dealt until the end of your next turn.",
    "Dance until the beginning of your next upkeep. If you do, you may tap up to three target permanents.",
    "Wild Magic Surge deals 4 damage to any target.",
    "Scry 2d4.",
    `Choose one:
      Add Zoomer Blue // Boomer White to your hand
      Add Ok Boomer to your hand`,
    "Each player loses 3 life.",
    "Create 1d4 1/2 Horror creature tokens named Flumph with lifelink, defender and flying.",
    "Create two 1/1 green Frog creature tokens. Target opponent creates a 1/1 green Frog creature token.",
    "Gain 2d6 life.",
    "You get an emblem with “At the beginning of your upkeep, target creature you control gains deathtouch and infect until end of turn.” and an emblem with “At the beginning of your end step, lose 2 life.”",
    "Target player from outside the game controls your next turn. At the beginning of your next upkeep, draw 2 cards.",
    "Return target creature to its owner’s hand.",
    "Destroy two target lands controlled by different players.",
    "Each player may say some weeb shit and sacrifice a permanent. If they don’t, they sacrifice two permanents and their honor instead.",
    "Fateseal 1d4.",
    "Cast a copy of a random instant or sorcery spell with converted mana cost 2. (Link)",
    "Create a token copy of Pheldagriff.",
    "You may rename any number of target creatures you control.",
    "All creatures lose their text boxes until end of turn.",
    "Search your library for a basic land card, reveal it and put it onto the battlefield tapped. Shuffle your library.",
    "Each player gives a card in their hand to an opponent of their choice.",
    "Tap or untap each permanent at random. (Flip a coin for each. This does not count as flipping a coin or rolling a dice for the purpose of effects.)",
    "Support 2, then support your opponent. (To support your opponent, pay them a compliment or tell them how much you respect them.)",
    "Add UURR.",
    "Tell a joke. If you do, up to three target creatures laugh uncontrollably. (Tap them. They don’t untap during their controller’s next untap step.)",
    "Manifest Wild Magic Surge as it resolves.",
    "All lands become forests in addition to their other types.",
    "Exile Wild Magic Surge, then cast it from exile without paying its mana cost. Replace its text with “Cascade, cascade”.",
    "Each player gains control of creatures controlled by the player to their left until the end of your next turn. They all gain haste.",
    "Spells cast cost [1] more until end of turn.",
    "Spells cast cost [1] less until end of turn.",
    "Until end of turn, you may play any number of land cards.",
    "Punch target creature. If you do, it’s destroyed.",
    "Note the number of cards in your hand. Shuffle your hand into your library, and draw cards equal to target creature you control’s power. That creature has power equal to the noted number.",
    "Wild Magic Surge deals 6 damage split as you choose amongst any number of target creatures.",
    "Creatures you don’t control gain islandwalk until the end of your next turn. Creatures you don’t control get -1/+0 until the end of your next turn.",
    "Counter target spell. If you do, draw a card.",
    "You become a 3/X Elk creature token with shroud and haste until the end of your next turn, where X is your life total. You’re still a player. (Damage does not fall off player creatures, but is permanent instead.)",
    "Cast a copy of Babymake.",
    "You cannot lose the game and opponents cannot win the game until the end of your next turn.",
    "Create a token copy of a random bear. (A bear is a 2/2 with CMC 2.)",
    "Until the end of your next turn, if a source would deal damage to you, it deals half that damage, rounded down, instead”",
    "Add a token copy of “Avatar of Me” to your hand.",
    "Put a -1/-1 counter on each creature.",
    "Create a green enchantment token named Rainbow with “Lands tap for any colour of mana.”",
    "Exile the top three cards of your library. You may play them until end of turn.",
    "Cast a copy of Better Than One.",
    "Until end of turn, all cards in your sideboard gain “Need: Discard a card.” Until end of turn, after you Need a card, draw a card.",
    "Create a red enchantment token named Wound with “If a source would deal damage to a permanent or player, it deals double that damage to that permanent or player instead.”",
    "Search your library for a card and put it into your hand. Shuffle your library.",
    "Create a Food token. If you have sacrificed a Food token this game, create two instead.",
    "Untap up to two target lands you control. Draw a card. ",
    "Cast a copy of Chaos Warp, targeting a permanent chosen at random.",
    "Lifelink. Wild Magic Surge deals 1 damage to each creature.",
    "Draw a card for each card on the stack.",
    "Deathtouch. Wild Magic Surge deals 1 damage to target creature you don’t control.",
    "Exile all creatures, then return them to the battlefield under their owner’s control.",
    "A creature chosen at random gains flying.",
    "Prevent the next instance of damage that would be dealt to you.",
    "Cast a copy of Teferi’s Protection.",
    "Target creature you control gains Phasing. (It continues to have it in any zone for the remainder of the game.)",
    "Until the end of your next turn, whenever you would roll a die, instead roll three and choose which to use.",
    "Exchange control of all permanents and all cards in your hand with target opponent.",
    "You get an emblem with “Permanents have devoid.”",
    "You get an emblem with “Your devotion to Niv Mizzet is increased by 1.” Create a number of 3/1 red and blue Scientist creature tokens equal to your devotion to Niv Mizzet.",
    "Each player draws the bottom card of their deck.",
    "Return a random instant or sorcery card from your graveyard to your hand.",
    "Wild Magic Surge deals 1d6 damage to target creature.",
    "Draw 1d4 cards.",
    "Untap all lands you control.",
    "Gain 5 life, draw a card, create a 3/3 green Dinosaur creature token, target opponent discards a card and Wild Magic Surge deals 3 damage to any target.",
    "If you rolled this naturally, win the match. (Not just the game!)",
  ];

  return <h1>{strings[Math.floor(Math.random() * strings.length)]}</h1>;
};