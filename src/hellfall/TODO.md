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
- add color indicators to HellfallCard
- sort by color but not cmc
- use mv instead of cmc
- make better search syntax (like allowing or)
- tell users how to use not and/or make it easier to use not (!)
- add reminder cards for morph and its variants (not just manifest)
- ~~ use multi_token for Scrap Heap Reminder Card1 (also add wurms),~~
- keep both images for A-Sky Diamond,
- make pagination work with browser back button and make it go back to page 1 when search changes
- make changes in url correctly work with forward and back buttons in browser
- make search for text (including in names) be able to ignore \* (same for hyperlinks to card names)
- implement grid type layout (has singlefaceonly attributes for overall card, but also has card_faces)
- make search results space and size cards dynamically to all have the same height (double size for dfcs and splits)
- make popup container wrap text to window width
- add bars internal to card entries like scryfall does
- special cases: Scared Turtle // Snappy Turtle for flip, Pie Rat for toughness (because of parseInt for comparing/sorting?), Ability Bingo, Bear Alignment Chart, Force of Rowan (for draft)

  - HOW,
  - add grid (that allows root-level stuff as well as faces?)?
  - switch Hell's Cube (the card), Hellscube Alignment Chart, Ancient Hexadon, Blingo, Assimilated Strategist to use the new face system

- add ability to search by number of colors (identity)
- switch search to text bar and make the mass of buttons hidden as advanced search
- see if any better images are floating around for HC2 in general
- full documentation
- use draft_image for full image of multisided cards?
- add redirect for card name (in backcompat) that looks for first name in multiface cards
- make sure subids work with backcompat
- fix formatting of all sagas
- fix formatting of all flavor text attribution (always newline, no space)
- make token copy of hells cards work when added either way (currently requires insertion of relatedcard with component: "token")
- rework hybrid identity search to use the comparison operators
- add general get all images method for cards?
- figure out how to handle cards with self-draftpartner (Squadron Wastes, Playset of Squadron Hawks (On Clearance), The Squadron Hawk) and draftpartner with tokens (Notorious Wicker Picker)
- figure out how to deal with sticker sheets consistently! (Notorious Wicker Picker, Land of **\_\_** and **\_\_**, Hellscube Imperial Appraiser, Wicky P, Vintage Banworthy, Hellscube Rebalancing Team, Honk Honk)
  - have main card have two sides; second side is sticker sheet, but doesn't have image in main card
  - main card has draft image of both sides and main image of just regular card
  - sticker sheet is also attached token that has its own image and draftpartner with main card
  - main card name is just the regular card
  - this is partially done; need to fully implement the partner part
- fix tags for cards with draft_image
- deal with later (skipped): **\_\_\_** Balls, Revolving Wilds, Playset of Squadron Hawks (On Clearance), Half-Thriving \_**\_ Half-Thriving \_\_**, Hell's Cube (both versions)
- do better: evolution of the dreadmaw
- fix after full switch: watermarks on Nusk // Norn, evolution of the dreadmaw, Siege Rhino // Siege Rhino
- add to HellfallCard: ~~color indicator, ~~ attraction lights
- allow for removal of optional props, sides, and cards from all_parts that aren't in the database where appropriate (also remove duplicates from all_parts) (use sheet to hold subtokens as token ids in related cards column) (use component of to code for tokens of hellscube cards)
- ~~ remove props that are in singleface cards but not multiface cards when adding card_faces to existing card ~~
- FIX KEYBOARD SHORTCUTS ON HELLFALL
- figure out how to do shadows on mana symbols in costs
- figure out why loading from the approved db sometimes leads to empty colors
- figure out why new entries sometimes don't get correct derived props
- add english hover to pips
- add special cases for color searches/color identity searches for Crypticspire Mantis, Gold Sable, Blood ghast // Crip Ghast (It can be either red or blue), the aux (it's colorless), The Based God,
- ask for ruling: Armory Manufactor
- use layout to help disambiguate what's on the back for multis with draft images
- don't count back sides that are reminders, tokens, or dungeons for color identity
- deal with multiple creators
- make sure mork fetches draft image where it exists
