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
4. Install [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)
5. Clone this repo. Github Desktop > File > Clone Repo > https://github.com/bones-bones/hellfall.git

## After pulling down the repo you should
1. Open a terminal, cd into the repo
2. run `yarn clean` (this deletes old version dependencies and old build output)
3. run `yarn` (this installs new tools and dependencies)


## To develop
1. Run `yarn start`
2. Write code


## Updating the database
1. Go to the Hellscube Database google sheet
2. File > Download > CSV
3. Open the csv in a text editor
4. Delete the first two lines
5. Convert it to json: probably via [this](https://www.convertcsv.com/csv-to-json.htm)
6. Copy the output and place it in the data value of (./src/data/Hellscube-Database.json), save
7. run `yarn transform-hc` (this extracts the type and creator datasets)

## Committing code
1. Open GitHub Desktop
2. Branch > New Branch > Bring changes
3. Push code
4. Branch > Create Pull Request


