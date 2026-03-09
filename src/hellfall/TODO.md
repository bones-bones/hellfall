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
- switch Hell's Cube (the card), Hellscube Alignment Chart, to use the new face system
- add reminder cards for morph and its variants (not just manifest)
- ~~ use multi_token for Scrap Heap Reminder Card1 (also add wurms),~~
- keep both images for A-Sky Diamond,
- make pagination work with browser back button and make it go back to page 1 when search changes
- make changes in url correctly work with forward and back buttons in browser
- make search for text (including in names) be able to ignore \* (same for hyperlinks to card names)
- ~~ add handling for splitting sides>4~~
- implement grid type layout (has singlefaceonly attributes for overall card, but also has card_faces)
- make search results space and size cards dynamically to all have the same height (double size for dfcs and splits)
- make popup container wrap text to window width
- add bars internal to card entries like scryfall does
- special cases: Scared Turtle // Snappy Turtle for flip, Pie Rat for toughness (because of parseInt for comparing/sorting?), Ability Bingo
- make sure non-number p/t values work in searches (X, \*, etc.)
- make tokens searchable (use set?)
- add ability to search by number of colors (identity)
- switch search to text bar and make the mass of buttons hidden as advanced search
- ~~ add side 5+ parsing, then use B//R//E//A//D as a test case for it~~
- see if any better images are floating around for HC2 in general
- ~~ add secondary image for single-faced cards if necessary~~
- ~~ add new related card categories for draftpartner (kongming, meld, taco bell, etc.)~~
  ~~ or maybe just have a list of ids in the main card and a variable in the secondary card pointing to the main card? (easier to implement quickly; won't interfere) (make these optional card fields)~~
  ~~ or maybe have an optional prop in RelatedCard to indicate draftpartner relationships?~~
  ~~ also add optional prop to indicate that this card shouldn't go directly into draft~~
  ~~ single prop/set of props for storing image shown in draft alongside draftpartner props~~
- ~~ add viewer for draft image after other side images~~
- ~~ show draftpartners on related cards on HellfallCard~~
- full documentation