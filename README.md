# It's hellfall

Like scryfall but for Hellscube. Also other stuff.

## [hellfall](./src/hellfall/)

Core hellfall application.

## [hellscube](./src/hells-cubes/)

This page contains random card selectors used for various cubes to make irl drafting smoother. currently only supports 1.

## [data-transformer](./data-transformers/)

Scripts used for extracting and transforming data

## [deck-builder](./src/deck-builder/)

This pages contains tools to help with building a deck then exporting it to tabletop simulator (or other formats)

## [TODO](./TODO.md)

todo list

# Getting started/How to guides

You want to contribute? Great!

## Onetime setup

1. Download [VS Code](https://code.visualstudio.com/download), it is a great dev environment
2. Install [node/npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). Pretty much any version should work
3. Download [GitHub Desktop](https://desktop.github.com/), or not, it's just super easy to deal with
4. Install [yarn](https://yarnpkg.com/getting-started/install)
5. Clone this repo. Github Desktop > File > Clone Repo > https://github.com/bones-bones/hellfall.git

## After pulling down the repo you should

1. Open a terminal, cd into the repo
2. run `yarn run clean` (this deletes old version dependencies and old build output)
3. run `yarn` (this installs new tools and dependencies)

## To develop

1. Run `yarn run start`
2. Write code

## To connect the database

Before you can update the database from the [google sheet](https://docs.google.com/spreadsheets/d/1qqGCedHmQ8bwi-YFjmv-pNKKMjubZQUAaF7ItJN5d1g), you need an API key.

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and sign in.
2. Click the project dropdown (select a project) in the top left, then create a new project.
3. Click the burger menu in the top left, then go to APIs & Services, then Library, then search for and enable Sheets.
4. Go to APIs & Services, then Credentials, then click Create Credentials, choosing API key.
5. For restrictions, choose Google Sheets API. Then click create. Then click Show key to get the key.
6. Make a copy of `keys-template.ts`, rename it to `keys.ts`, then paste the key into `sheetsKey`. Now you

## Updating the database

run `yarn run transform-hc` (this updates all datasets)

To run without overwriting data that can't be stored in the sheet, run `yarn run transform-hc --update`

## Committing code

1. Open GitHub Desktop
2. Branch > New Branch > Bring changes
3. Push code
4. Branch > Create Pull Request
