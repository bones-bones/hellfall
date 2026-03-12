# Hellfall API types

This library documents the definitive comprehensive typings for hellfall, which are based on [the Scryfall API][api] (and copied from its [github][scryfall_git]) for use in Typescript & Javascript projects.

## Notable File Descriptions & Notable Differences from Scryfall

### Values

#### Color

This is for card colors. Most of this file (everything except HCColor and HCColors) isn't currently in use anywhere else becuase it causes React errors that we can't figure out how to solve. It includes the regular magic colors, as well as the colors exclusive to Hellscube.

#### ImageStatus

This is for the image status, as well as for explaining why a face doesn't have an image. This takes up much of the role of Layout in the Scryfall version.

#### Layout

This is for the card layout. We really only use it for info that can't be stored with ImageStatus.

### RelatedCard

This is for simplified versions of cards that can be stored to show card relationships. We use this for more than Scryfall does, since it's useful for Draftpartner cards.

### CardFields

We don't use a lot of the URI fields that scryfall has, since we store more things directly. We also store card types, subtypes, and supertypes to allow for easier searching.

We also have `color_identity_hybrid`, which allows for searching for color identity using different hybrid rules, as well as some fields that make it easier to export cards for drafts.

We don't make the distinction that Scryfall does between sides and faces.

### CardFace

We really only have one kind of face, so this file is much simpler than Scryfall's version.

### Card

Since don't make the distinction that Scryfall does between sides and faces, this file is simpler than Scryfall's version.

### Symbology

This is for symbols/pips.

We don't use `loose_variant`, `transposable` (since we have some cards that use transposed symbols), `cmc`, `appears_in_mana_costs`, `funny` (all our cards are funny), `hybrid`, or `phyrexian` (though maybe we should use those last two).

We use `filename` instead of `svg_uri` because 1. not all of our symbols have svgs, though we do try our best, and 2. we store the files in /public/ rather than as urls.

<!-- This library uses [semver] for versioning. These versions only describe this library, not the Scryfall API as a whole. -->

<!-- ## Installation -->

<!-- ```bash -->
<!-- npm install @scryfall/api-types -->
<!-- ``` -->

<!-- ## Examples -->
<!--  -->
<!-- ### Fetching a card -->

<!-- ```ts -->
<!-- // CommonJS module syntax -->
<!-- const { ScryfallCard } = require("@scryfall/api-types"); -->

<!-- // ES module syntax -->
<!-- import { ScryfallCard } from "@scryfall/api-types"; -->

<!-- // Fetch a card -->
<!-- const response = await fetch("https://api.scryfall.com/cards/iko/275"); -->
<!-- const godzilla: ScryfallCard.Any = await response.json(); -->
<!-- ``` -->

<!-- ### Fetching the list of sets -->

<!-- ```ts -->
<!-- // CommonJS module syntax -->
<!-- const { ScryfallList } = require("@scryfall/api-types"); -->

<!-- // ES module syntax -->
<!-- import { ScryfallList } from "@scryfall/api-types"; -->

<!-- // Fetch the list of all sets -->
<!-- const response = await fetch("https://api.scryfall.com/sets"); -->
<!-- const sets: ScryfallList.Sets = await response.json(); -->
<!-- ``` -->

<!-- ### Type narrowing on a card -->

<!-- ```ts -->
<!-- import { ScryfallCard, ScryfallLayout } from "@scryfall/api-types"; -->

<!-- // This card might be of any type. -->
<!-- // You cannot access `mysteryCard.card_faces`, because it might not have that property. -->
<!-- const mysteryCard: ScryfallCard.Any = getCard(); -->

<!-- // You can narrow by layout: -->
<!-- if (mysteryCard.layout === ScryfallLayout.Transform) { -->
  <!-- // It's a transforming DFC! -->
  <!-- // You can access transform-specific fields in this scope, or assign it to a variable. -->
  <!-- const faces = anyCard.card_faces; -->
  <!-- const transform: ScryfallCard.Transform = mysteryCard; -->
<!-- } -->

<!-- // You can also narrow by property: -->
<!-- if ("card_faces" in anyCard) { -->
  <!-- // It's *some* kind of multi-faced card. -->
  <!-- // You can now access the card_faces property. -->
  <!-- // You'll need to do some further type narrowing to know more about what's in the card. -->
  <!-- const faces = anyCard.card_faces; -->
  <!-- const multifaced: ScryfallCard.AnyMultiFaced = anyCard; -->
<!-- } else { -->
  <!-- const sfc: ScryfallCard.AnySingleFaced = anyCard; -->
<!-- } -->
<!-- ``` -->

## Usage

Each type and enum exported by this library corresponds to a Hellfall API object and its values.

Points of interest:

- [HCCard](src/objects/Card/Card.ts) describes [Cards](https://scryfall.com/docs/api/cards) and their faces. Each individual card layout is managed via type narrowing on the `layout` field.
  <!-- - [ScryfallCatalog](src/objects/Catalog/Catalog.ts) describes [the catalogs](https://scryfall.com/docs/api/catalogs). -->
  <!-- - [ScryfallError](src/objects/Error/Error.ts) describes [error responses](https://scryfall.com/docs/api/errors). -->
  <!-- - [ScryfallList](src/objects/List/List.ts) describes [lists](https://scryfall.com/docs/api/lists), and provides shortcuts to describe the common types of lists. -->
  <!-- - [ScryfallMigration](src/objects/Migration/Migration.ts) describes [migrations](https://scryfall.com/docs/api/migrations). -->
  <!-- - [ScryfallSet](src/objects/Set/Set.ts) describes [card sets](https://scryfall.com/docs/api/sets). -->

<!-- If the API provides an object, this library provides it as well. (If it doesn't, please [tell us][issues]!) -->

All primary types and values are prefixed with `HC` to avoid conflict with the standard library (e.g. `Object`, `Error`, `Set`) and to minimise conflict with your other libraries and dependencies (e.g. `Color`, `LanguageCode`). If we didn't have the prefix you'd be forced to append one yourself one on import, so we've defaulted to including it.

Enum fields are described both in terms of an enum and a set of strings in order to give you the option of interacting with that field with either one.

[semver]: https://semver.org/
[api]: https://scryfall.com/docs/api
[issues]: https://github.com/scryfall/api-types/issues
[scryfall_git]: https://github.com/scryfall/api-types/blob/main/README.md
