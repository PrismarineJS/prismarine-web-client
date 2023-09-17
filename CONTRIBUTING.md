# Contributing Guide

After forking the repository, run the following commands to get started:

0. Ensure you have [Node.js](https://nodejs.org) and `pnpm` installed. To install pnpm run `npm i -g pnpm`.
1. Install dependencies: `pnpm i`
2. Start the project in development mode: `pnpm start`

A few notes:

- It's recommended to use debugger for debugging. VSCode has a great debugger built-in. If debugger is slow, you can use `--no-sources` flag that would allow browser to speedup .map file parsing.
- Some data are cached between restarts. If you see something doesn't work after upgrading dependencies, try to clear the by simply removing the `dist` folder.
- The same folder `dist` is used for both development and production builds, so be careful when deploying the project.
- Use `start-prod` script to start the project in production mode after running `build` script to build the project.
