# Changes to make to database

~~- god I hate this card~~

- 54
- 53
- Hellscube Alignment Chart
- Ancient Hexadon could use sides/faces
  ~~- nd.Doo -> nd. Doo~~
- label column for Man // Door // Hand // Hook // Car Door
  ~~- Cardboard Phoenix doesn't have a color~~
  ~~- BR, U, R, BG, W, P, GU, BP, URP, WG, WB, RG, None, I guess colorless., Colorless, None~~
  ~~- 420Templar and 420 Templar Ginkhole~~
- Bear Grylls (Not a Bear) // Bear Grylls (An Actual Bear). is it green?
  ~~- Spring // Winter // Summer // Fall cap instant~~
  ~~- Wrenn and thirteen is a Planewalker~~
  ~~- Bad Land // Bad Land type~~
- Update the Name section of the tokens database, it's kinda messey

- token sheet: Opt needs Opter // Shocker
- "Related Cards (Read Comment)": "Murder\*3;CROW HURRICANE",

Think of a better way to store sides

Write a script to transform the database

- Wrap in data, delete 54 53

# UI

~~- make color search not suck~~

- ~~make color sort not suck~~
  ~~- add coloridentity function~~
  ~~- Support Piss~~
  ~~-Support Pickles~~
  ~~- Support B/W hybrid~~
  ~~- Enter key should submit search~~
  ~~- add guide for !~~
  ~~- mobile support~~
  ~~- Script to fetch and transform sheets directly from google doc~~
- sort by color but not cmc
- use mv instead of cmc
- make better search syntax (like allowing or)
- tell users how to use not and/or make it easier to use not (!)
- make pagination work with browser back button and make it go back to page 1 when search changes
- make changes in url correctly work with forward and back buttons in browser
- make search for text (including in names) be able to ignore \* (same for hyperlinks to card names)
- implement grid type layout (has singlefaceonly attributes for overall card, but also has card_faces)
- make search results space and size cards dynamically to all have the same height (double size for dfcs and splits)
- make popup container wrap text to window width
- add bars internal to card entries like scryfall does
- switch search to text bar and make the mass of buttons hidden as advanced search
- see if any better images are floating around for HC2 in general
- full documentation
- use draft_image for full image of multisided cards?
- fix formatting of all sagas
- fix formatting of em dashes (no space when it replaces a colon)
- add general get all images method for cards?
- figure out how to handle cards with self-draftpartner (Squadron Wastes, Playset of Squadron Hawks (On Clearance), The Squadron Hawk)
- fix tags for cards with draft_image
- deal with later (skipped): **\_\_\_** Balls, Playset of Squadron Hawks (On Clearance), Half-Thriving \_**\_ Half-Thriving \_\_**, Hell's Cube (both versions), Spain, Shambles the Skeleton // Shambled Bones // Shambled Bones // Shambled Bones // Shambled Bones
- do better: evolution of the dreadmaw
- fix after full switch: watermarks on Nusk // Norn, evolution of the dreadmaw, Siege Rhino // Siege Rhino, Thoughtsiege // Siege Rhino, Disagreement Rhino // Scuffle Rhino // Skirmish Rhino // Siege Rhino // Nuclear Bombardment Rhino, Kolaghan's Command Tower // Kolaghan's Command
- add to HellfallCard: ~~color indicator, ~~ attraction lights
- FIX KEYBOARD SHORTCUTS ON HELLFALL
- add special cases for color searches/color identity searches for Crypticspire Mantis, Gold Sable, Blood ghast // Crip Ghast (It can be either red or blue), the aux (it's colorless), The Based God, Allied Signpost, Archetype Payoff, public domain removal creature (colorless)
- ask for ruling: Armory Manufactor
- deal with multiple creators
- make sure mork fetches draft image where it exists
- deal with spellbooks (prop in relatedCard?)
- figure out problems with pip clipping and shadows
- make other cards in feel the ground quake have each other in all_parts? (Do I want to have kongming's contraptions also do this?)
- get a your dreadmaw reminder card/token as well as dreadmaw offspring tokens
- add sorting for colors (in HCColors arrays) (use color order on Extreme Flower Picking)
- deal with later: Dungeon Jumper
- switch italics to use serif font? (that way it's more distinct)
- make search page update conditions more logical
- implement tags based on notes column to mark spellbook tokens?
- make token search work better
- fully implement NotMagic
- make full images for dfcs with three+ images go to draft_image
- deal with later: 4x Squadron Hawks, Learn from Better Designers, Liliana, Urza's Will (draftpartner)
- deal with draftable sticker sheets (Amonkhet Punchcard, Carnival Elephant Meteor, etc)
- add reminder card for attractions
- figure out subtypes for nontoken tokens (emblems, dungeons, etc.)
- don't fetch SFT tokens with "token" layout from scryfall every time
- add color indicator for Pan & Pan Harmonica (yellow/blue/pink)
- mork:
  - add ids
  - revamp fetch function to deal better with cards that have multiple printings (use bar and set like mtgcardfetcher does; allow use of id; allow use of )
  - make more accessible options for multiside and flip cards (like how scryfall does it) (make sure it works on the actual search page too)
- make links work in card text
- indicate that IOU and Phyrexian Goblin Creature Copy are not directly draftable
- make sure that accents don't interfere with search (test with Niccolò Machiavelli)
- add flavor text search
- special cases: Scared Turtle // Snappy Turtle for flip, , Force of Rowan (for draft), Italic Plagiarist (italics in typeline with regular types)

  - add grid (that allows root-level stuff as well as faces?)?
  - use grid? (or text outside of faces) to deal with , , 4966
  - have 2 new categories of layouts - 1 is grid and the other is disk (grid is defined by rows and columns and can have headers and labels, poly is defined by 3 or more sides in a loop, both can have face-specific on the main card)
  - grid has additional attributes of: row_num, col_num, headers (optional but same length as col_num); labels (optional but same length as row_num);
  - grid can be only some of the faces of a card? (Bear Alignment Chart/bear hate)
  - 3 versions of grid: move_grid for when you move within grid, check_grid for when you check off grid squares, and split_grid for when grid functions as split card
  - check_grid: Gruul Plantation, Magus of the MovieGrid.io, Bear Alignment Chart?, bear hate?, Lotis, Puzzle Master, Ability Bingo, HC7 B I N G O, Press Start: Mega Man
  - move_grid: Blingo, Assimilated Strategist (check?), Hell's Cube (the card)?
  - split_grid: Bear Alignment Chart?, bear hate?, Hellscube Alignment Chart, Conflict in Literature
  - poly: The Kodama Compass, Goblin Boardgamer, Ancient Hexadon, Revolving Wilds, Casio G-Shock Watchwolf?, Goblin Dynamo (hc)
    - abilities only: Goblin Boardgamer, Casio G-Shock Watchwolf, Blingo, Assimilated Strategist, Revolving Wilds? (it does have multiple images though)
  - some sort of flowchart thingy for Spain? or move_grid?
  - instead of move_grid and poly, do general graph/net datastructure

- add hybrid color identity number search prop?
- add extras button for card/tokens, constructed cube, HC0, etc.
- add community standards hider for offensive hc0s
- make brackets in cardnames not break anything
- add cmc prop to faces?
- add variations to hellfallcard?
- make usingApproved a flag on the script itself?
- fiddle with card line spacing to look better
- add cyan for iono.png1
- add name override for 🂓 (domino)
- use pip name for iono.png and associated cards/tokens
- fix order of color words in text
- on individual card pages, make tab name same as card name