# prismarine-web-client
[![NPM version](https://img.shields.io/npm/v/prismarine-web-client.svg)](http://npmjs.com/package/prismarine-web-client)
[![Build Status](https://github.com/PrismarineJS/prismarine-web-client/workflows/CI/badge.svg)](https://github.com/PrismarineJS/prismarine-web-client/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/prismarine-web-client)

A Minecraft client running in a web page.

## How it Works
prismarine-web-client runs mineflayer and prismarine-viewer in the browser, which connects over WebSocket to a proxy which translates the WebSocket connection into TCP to connect to normal Minecraft Servers.

## Screenshot
![Screenshot of MineWeb in action](screenshot.png)

## Live Demo
https://prismarine-web-client.js.org

## Usage (for self-hosted installations)
First, clone this repo.

Then, set your working directory to that of the repo. Example:
```bash
$ cd ~/prismarine-viewer/
```

Run these commands in bash: 
```bash
$ npm install -g prismarine-web-client
$ prismarine-web-client
``` 
Finally, open `http://localhost:8080` in your browser

## Features

* Display mobs (though sometimes messed up)
* Display players
* Display other entities as colored rectangles
* Display blocks 
* Movement (you can move, and you see entities moving live)
* Place and break blocks

## Roadmap
* Hotbar (PR #42)
* Loading Screen (PR #26)
* Inventory 
* Containers
* More customisation (e.g. mouse sensitivity, text size, issue #40)
* Sounds (Issue #43)
* Day Night Cycle (Issue #8)
* Attacking Entities (Issue #9)
* Spigot Plugin (for auth bypass & possibly hosting its own websocket proxy to reduce latency, issue #13)

## Development

```js
npm install
npm run build-start
```

Then connect to http://localhost:8080



