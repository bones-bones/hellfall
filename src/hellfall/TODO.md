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
- add reminder cards for morph and its variants (not just manifest)
- make pagination work with browser back button and make it go back to page 1 when search changes
- make changes in url correctly work with forward and back buttons in browser
- make search for text (including in names) be able to ignore \* (same for hyperlinks to card names)
- implement grid type layout (has singlefaceonly attributes for overall card, but also has card_faces)
- make search results space and size cards dynamically to all have the same height (double size for dfcs and splits)
- make popup container wrap text to window width
- add bars internal to card entries like scryfall does
- special cases: Scared Turtle // Snappy Turtle for flip, Ability Bingo, Bear Alignment Chart, Force of Rowan (for draft), Italic Plagiarist (italics in typeline with regular types)

  - add grid (that allows root-level stuff as well as faces?)?
  - use grid? to deal with Hell's Cube (the card), Hellscube Alignment Chart, Ancient Hexadon, Blingo, Assimilated Strategist, bear hate,

- switch search to text bar and make the mass of buttons hidden as advanced search
- see if any better images are floating around for HC2 in general
- full documentation
- use draft_image for full image of multisided cards?
- fix formatting of all sagas
- fix formatting of em dashes (no space when it replaces a colon)
- rework hybrid identity search to use the comparison operators
- add general get all images method for cards?
- figure out how to handle cards with self-draftpartner (Squadron Wastes, Playset of Squadron Hawks (On Clearance), The Squadron Hawk)
- fix tags for cards with draft_image
- deal with later (skipped): **\_\_\_** Balls, Revolving Wilds, Playset of Squadron Hawks (On Clearance), Half-Thriving \_**\_ Half-Thriving \_\_**, Hell's Cube (both versions)
- do better: evolution of the dreadmaw
- fix after full switch: watermarks on Nusk // Norn, evolution of the dreadmaw, Siege Rhino // Siege Rhino, Thoughtsiege // Siege Rhino, Disagreement Rhino // Scuffle Rhino // Skirmish Rhino // Siege Rhino // Nuclear Bombardment Rhino
- add to HellfallCard: ~~color indicator, ~~ attraction lights
- FIX KEYBOARD SHORTCUTS ON HELLFALL
- figure out how to do shadows on mana symbols in costs
- figure out why loading from the approved db sometimes leads to empty colors
- figure out why new entries sometimes don't get correct derived props
- add special cases for color searches/color identity searches for Crypticspire Mantis, Gold Sable, Blood ghast // Crip Ghast (It can be either red or blue), the aux (it's colorless), The Based God,
- ask for ruling: Armory Manufactor
- deal with multiple creators
- make sure mork fetches draft image where it exists
- deal with spellbooks (prop in relatedCard?)
- call the dermotaxi as token_on_back?
- make simplifier for hybrid identity
- figure out problems with pip clipping and shadows
- make other cards in feel the ground quake have each other in all_parts? (Do I want to have kongming's contraptions also do this?)
- get a your dreadmaw reminder card/token as well as dreadmaw offspring tokens
- add sorting for colors (in HCColors arrays)
- deal with later: Dungeon Jumper, The Rat Pack
- switch italics to use serif font? (that way it's more distinct)
- make search page update conditions more logical
- implement tags based on notes column to mark spellbook tokens?
- make token search work better
- fully implement NotMagic
- make full images for dfcs with three+ images go to draft_image
- deal with later: 4x Squadron Hawks
- start doing variations even between card sheet and token sheet
- deal with draftable sticker sheets (Amonkhet Punchcard, Carnival Elephant Meteor, etc)
- add reminder card for attractions
- figure out subtypes for nontoken tokens (emblems, dungeons, etc.)
- add code to remove cards that aren't in the database
- mork:
  - add ids
  - revamp fetch function to deal better with cards that have multiple printings (use bar and set like mtgcardfetcher does; allow use of id; allow use of )
  - make more accessible options for multiside and flip cards (like how scryfall does it) (make sure it works on the actual search page too)
