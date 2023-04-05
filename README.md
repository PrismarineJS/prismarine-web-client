# prismarine-web-client
[![NPM version](https://img.shields.io/npm/v/prismarine-web-client.svg)](http://npmjs.com/package/prismarine-web-client)
[![Build Status](https://github.com/PrismarineJS/prismarine-web-client/workflows/CI/badge.svg)](https://github.com/PrismarineJS/prismarine-web-client/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/prismarine-web-client)

| 🇺🇸 [English](README.md) | 🇷🇺 [Russian](README_RU.md)  | 🇵🇹 [Portuguese](README_PT.md) |
| ----------------------- | -------------------------- | ---------------------------- |

A Minecraft client running in a web page. **Live demo at https://prismarinejs.github.io/prismarine-web-client/**


## How it Works
prismarine-web-client runs mineflayer and prismarine-viewer in the browser, which connects over WebSocket to a proxy 
which translates the WebSocket connection into TCP to connect to normal Minecraft servers. Prismarine-web-client is based on:
* [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) for the world rendering
* [mineflayer](https://github.com/PrismarineJS/mineflayer) for the high-level Minecraft client API

Check these modules if you want to understand more how it works and contribute!

## Screenshot
![Screenshot of prismarine-web-client in action](screenshot.png)

## Live Demo
Click on this link to open it in your browser, no installation necessary: https://prismarinejs.github.io/prismarine-web-client/

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
* More world interactions (attacking entities, etc.)
* Cosmetic rendering features (day night cycle, fog, etc.)

## Development

If you're contributing/making changes, you need to install it differently.

First, clone the repo.

Then, set your working directory to that of the repo. For example:
```bash
$ cd ~/prismarine-web-client/
```

Finally, run

```bash
$ npm install
$ npm start
```

This will start express and webpack in development mode; whenever you save a file, the build will be redone (it takes 5s), 
and you can refresh the page to get the new result.

Connect to http://localhost:8080 in your browser.

You may want to disable auto saving in your IDE to avoid constant rebuilding; see https://webpack.js.org/guides/development/#adjusting-your-text-editor.

To check the production build (will take a minute to build), you can run `npm run build-start`.

If you're interested in contributing, you can check projects at https://github.com/PrismarineJS/prismarine-web-client/projects.

Some variables are exposed in the global ``window`` object for debugging:
* ``bot``
* ``viewer``
* ``mcData``
* ``worldView``
* ``Vec3``
* ``pathfinder``
* ``debugMenu``

### Adding stuff to the debugMenu

debugMenu.customEntries['myKey'] = 'myValue'
delete debugMenu.customEntries['myKey']

### Some debugging examples

In Chrome DevTools:

* `bot.chat('test')` allows you to use the chat
* `bot.chat(JSON.stringify(Object.values(bot.players).map(({username, ping}) => ({username, ping}))))` display the ping of everyone
* `window.bot.entity.position.y += 5` jumps
* `bot.chat(JSON.stringify(bot.findBlock({matching:(block) => block.name==='diamond_ore', maxDistance:256}).position))` finds the position of a diamond block
* `bot.physics.stepHeight = 2` allows you to walk about blocks
* `bot.physics.sprintSpeed = 5` walks faster
* `bot.loadPlugin(pathfinder.pathfinder)` then `bot.pathfinder.goto(new pathfinder.goals.GoalXZ(100, 100))` goes to position 100, 100

For more debugging ideas, read the [mineflayer](https://github.com/PrismarineJS/mineflayer) doc.
