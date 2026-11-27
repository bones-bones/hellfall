# Welcome to the Hellfall application

It's pretty standard ts/react. It makes use of the [canvas-kit](https://github.com/Workday/canvas-kit) library cause it's nice.
It should be like scryfall, but use local data. One day we might get a real db.

With `REACT_APP_SERVER_SEARCH=1` and `REACT_APP_AUTH_API_URL` set, home search uses the server `/api/cards/search` API (paginated) instead of downloading the full catalog up front. Card routes, Random, and related prints also hit the auth API (`/api/cards/hcid/:hcid`, `/api/cards/random`, `/api/cards/:id/prints`) so they do not require a client CardMap. See the [frontend README](../../README.md#server-backed-search).

## Need something to work on? check the [TODO](./TODO.md)
