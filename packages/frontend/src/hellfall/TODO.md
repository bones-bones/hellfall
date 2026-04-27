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
  ~~- Support B/W hybrid~~
  ~~- Enter key should submit search~~
  ~~- add guide for !~~
  ~~- mobile support~~
  ~~- Script to fetch and transform sheets directly from google doc~~
- sort by color but not cmc
- make better search syntax (like allowing or)
- tell users how to use not and/or make it easier to use not (!)
- implement grid type layout (has singlefaceonly attributes for overall card, but also has card_faces)
- add bars internal to card entries like scryfall does
- full documentation
- do better: evolution of the dreadmaw
- FIX KEYBOARD SHORTCUTS ON HELLFALL
- add special cases for color searches/color identity searches for Crypticspire Mantis, Gold Sable, Blood ghast // Crip Ghast (It can be either red or blue), the aux (it's colorless), The Based God, Allied Signpost, Archetype Payoff, public domain removal creature (colorless)
- make other cards in feel the ground quake have each other in all_parts? (Do I want to have kongming's contraptions also do this?)
- switch italics to use serif font? (that way it's more distinct)
- make search page update conditions more logical
- fully implement NotMagic
- deal with later: Wild Magic Surge (both versions), Hell's Cube (both versions), Spain, Shambles the Skeleton // Shambled Bones // Shambled Bones // Shambled Bones // Shambled Bones
- add reminder card for attractions
- figure out subtypes for nontoken tokens (emblems, dungeons, etc.)
- mork:
  - add ids
  - revamp fetch function to deal better with cards that have multiple printings (use bar and set like mtgcardfetcher does; allow use of id; allow use of )
  - make more accessible options for multiside and flip cards (like how scryfall does it) (make sure it works on the actual search page too)
- make links work in card text
- make sure that accents don't interfere with search (test with Niccolò Machiavelli)

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
- add community standards hider for offensive hc0s
- add variations to hellfallcard?
- make usingApproved a flag on the script itself?
- fiddle with card line spacing to look better
- fix order of color words in text
- on individual card pages, make tab name same as card name
- add color inference for faces
- when adding flip, make it independent of side for Bubsy, Furred Kind
- add ability to have color indicator pips in text (for 6246)
- fix face cmc inference for transform and flip backsides
- make sure cards with phyrexian text have tag
- add phyrexian font
- add double url (both id and name) like scryfall?
- implement subtags
- prevent search entries from filling history for text
- make popup window resizeable
- add real-card-reference tags
- dynamically reorder related in HellfallCard to minimize empty space while maximizing image width
- implement smart quotes (autoconvert normal quotes to left/right quotes on page)
- add button to expose card json? and copy/pastable card details?
- switch search to text bar and make the mass of buttons hidden as advanced search
  - make separate filter method that takes in search keyword, operator, and search term and filters cards appropriately
  <!-- - add `Record<string,string[]>` of equivalents for shorthand versions of search keywords (use scryfall) -->
  - make 2 new top-level types: 1 for search terms that has props for kind of search term, equivalents, and parsing and 1 for keywords that has props for values and equivalents (`Record<string,string[]>`) (optional), default operator, search term type, and equivalent keywords
  - add methods for other ones
  - add handling for invalid keywords
  - add search bar interface and move full controls to advanced search page
- rework set selector to be dropdown that adds?
- add collector numbers for sets
- add {69}, {45}, {-2}
- make card name text render in hellfallentry below card (so if card doesn't render, the name will)
- add card to plaintext function; add it as alt text to card images (do by face/all faces)
- add collections to deal with types, tags, keywords, etc.
- make layout able to be an array?
- allow for retro search option that matches both 93 and 97
- fix layouts on faces
- go through and add borders, correct face layouts, finishes, frames, and frameEffects
  - deal with later: Nebula5, Opter // Shocker
- add minimize button next to close button on card pane (turns it into small popup at bottom with only cardname) (also add ability to store multiple like this) (use minus symbol)
- add button in pane to open card in new tab (use box with arrow)
- don't trigger new history on activecard change
- add ability to search for individual misc colors?
- figure out if pip shadows have correct angle (should they be slightly more downward than leftward?)
- implement flip/aftermath rotation buttons (base it off of cockatrice face merge logic)
- clean up hcj webpage
- rework tts
- put buttons for switching to rotated/still on top later
- add rotations for images that are upright by default
- add token ids
- add hcp draft
- add cost autofill for search
- add cube builder utility for exporting custom cubes to draftmancer
- figure out whether/how to make missing frame tags work with specific faces
- use to title case for adding types to types.json
- subdivide showcase-frame
- make it possible to properly search for markup characters
