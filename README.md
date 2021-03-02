# prismarine-web-client
[![NPM version](https://img.shields.io/npm/v/prismarine-web-client.svg)](http://npmjs.com/package/prismarine-web-client)
[![Build Status](https://github.com/PrismarineJS/prismarine-web-client/workflows/CI/badge.svg)](https://github.com/PrismarineJS/prismarine-web-client/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/prismarine-web-client)

### A Minecraft client running in a web page. **Live demo at https://prismarine-web-client.js.org**



## How it Works
prismarine-web-client runs mineflayer and prismarine-viewer in the browser, which connects over WebSocket to a proxy which translates the WebSocket connection into TCP to connect to normal Minecraft servers.

## Screenshot
![Screenshot of prismarine-web-client in action](screenshot.png)

## Live Demo
Click on this link to open it in your browser, no installation necessary: https://prismarine-web-client.js.org

*Tested on Chrome & Firefox for desktop platforms.*

## Usage (for self-hosted installations)
If you want the latest version or want to use auth, you can host an instance yourself.

Run these commands in bash: 
```bash
$ npm install -g prismarine-web-client
$ prismarine-web-client
``` 
Finally, open `http://localhost:8080` in your browser.

## Features

* Display mobs (though sometimes messed up)
* Display players
* Display other entities as colored rectangles
* Display blocks 
* Movement (you can move, and you see entities moving live)
* Place and break blocks

## Roadmap
* Containers (inventory, chests, etc.)
* More Customisation (e.g. mouse sensitivity, text size, issue #40)
* Sounds
* More World Interactions (attacking entities, etc.)
* Cosmetic Rendering Features (day night cycle, fog, etc.)
* Server-Side Support Plugins (for auth bypass & possibly hosting its own websocket proxy to reduce latency, issue #13)

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
$ npm run build-start
```

Then connect to http://localhost:8080 in your browser.



