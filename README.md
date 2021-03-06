# prismarine-web-client
[![NPM version](https://img.shields.io/npm/v/prismarine-web-client.svg)](http://npmjs.com/package/prismarine-web-client)
[![Build Status](https://github.com/PrismarineJS/prismarine-web-client/workflows/CI/badge.svg)](https://github.com/PrismarineJS/prismarine-web-client/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/prismarine-web-client)

A Minecraft client running in a web page. **Live demo at https://prismarine.js.org/prismarine-web-client/**


## How it Works
prismarine-web-client runs mineflayer and prismarine-viewer in the browser, which connects over WebSocket to a proxy 
which translates the WebSocket connection into TCP to connect to normal Minecraft servers.

## Screenshot
![Screenshot of prismarine-web-client in action](screenshot.png)

## Live Demo
Click on this link to open it in your browser, no installation necessary: https://prismarine.js.org/prismarine-web-client

*Tested on Chrome & Firefox for desktop platforms.*

## Usage
To host it yourself, run these commands in bash: 
```bash
$ npm install -g prismarine-web-client
$ prismarine-web-client
``` 
Finally, open `http://localhost:8080` in your browser.

## Features

* Display mobs and players
* Display blocks 
* Movement (you can move, and you see entities moving live)
* Place and break blocks

## Roadmap
* Containers (inventory, chests, etc.)
* Sounds
* More World Interactions (attacking entities, etc.)
* Cosmetic Rendering Features (day night cycle, fog, etc.)

## Development

If you're contributing/making changes, you need to install it differently.

First, clone the repo.

Then, set your working directory to that of the repo. For example:
```bash
$ cd ~/prismarine-viewer/
```

Finally, run

```bash
$ npm install
$ npm start
```

This will start express and webpack in development mode: whenever you save a file, the build will be redone (it takes 5s), 
and you can refresh the page to get the new result.

Connect to http://localhost:8080 in your browser.

You may want to disable auto saving in your IDE to avoid constant rebuilding, see https://webpack.js.org/guides/development/#adjusting-your-text-editor

To check the production build (take a minute to build), you can run `npm run build-start`

If you're interested in contributing, you can check projects at https://github.com/PrismarineJS/prismarine-web-client/projects

