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
- implement grid type layout (has singlefaceonly attributes for overall card, but also has card_faces)
- full documentation
- do better: evolution of the dreadmaw
- FIX KEYBOARD SHORTCUTS ON HELLFALL
- add special cases for color searches/color identity searches for Blood ghast // Crip Ghast (It can be either red or blue) (can-ignore-color-identity)
- switch italics to use serif font? (that way it's more distinct)
- deal with later: Shambles the Skeleton // Shambled Bones // Shambled Bones // Shambled Bones // Shambled Bones, gandalf thingy
- add reminder card for attractions
- mork:
  - add ids
  - revamp fetch function to deal better with cards that have multiple printings (use bar and set like mtgcardfetcher does; allow use of id; allow use of )
  - make more accessible options for multiside and flip cards (like how scryfall does it) (make sure it works on the actual search page too)
- make links work in card text

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

- add community standards hider for offensive hc0s
- add variations to hellfallcard?
- fix order of color words in text
- fix face cmc inference for transform and flip backsides
- add phyrexian font
- add double url (both id and name) like scryfall?
- make popup window resizeable
- add real-card-reference tags
- implement smart quotes (autoconvert normal quotes to left/right quotes on page)
- add {69}, {45}, {-2}
- make card name text render in hellfallentry below card (so if card doesn't render, the name will)
- add collections to deal with types, tags, keywords, etc.
- add minimize button next to close button on card pane (turns it into small popup at bottom with only cardname) (also add ability to store multiple like this) (use minus symbol)
- don't trigger new history on activecard change?
- figure out if pip shadows have correct angle (should they be slightly more downward than leftward?)
- implement flip/aftermath rotation buttons (base it off of cockatrice face merge logic)
- put buttons for switching to rotated/still on top later
- add rotations for images that are upright by default
- add hcp draft
- make it possible to properly search for markup characters
- use spoiler feature to allow cockatrice auto-update?
- figure out if i need more specific extras handling if no sets are selected

- make pips servable via the api
- add cubecobra export

- find better way to handle apostrophes in card text for searches
- add link to search with relateds to card page
- make thread for token errors
- add is:conjured and is:remindercard
- add conjured to layouts?
- add reprint handling using oracle id
- fix uuids of all cards that are also on scryfall
- add special cases for searching only for set (use map directly)
- add random button for searches
- make card uuid hard-coded on singleCard pages
- make sets servable via the api
- rework CubeResources page to be all sets page?
- subdivide HCT into specific sets?
- move jumpstart lands to HBB.J
- fix search for dashes
- add keyword tags
- switch to using root/face type pattern
- get rid of as much of the usage of anyPropType as possible
- switch to using mapped/entry type pattern
- add dropdown to tag editor for tags with multiple underlying base tags
- use new change creator functions
- make mse tag autoset image quality to medium
- rename draft images to print images?
- go back and do cards that I skipped before
- add host/augment as layouts? or as frame effects?
- collapse controls on narrow layouts like scryfall does
- store default search settings with users like scryfall does
- get a better random icon
- figure out how to attach links/hrefs to the pagination buttons
- once spain tokens get in, make sure they all get drop_face?
- run the color inference for existing cards once