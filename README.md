# prismarine-web-client
[![NPM version](https://img.shields.io/npm/v/prismarine-web-client.svg)](http://npmjs.com/package/prismarine-web-client)
[![Build Status](https://github.com/PrismarineJS/prismarine-web-client/workflows/CI/badge.svg)](https://github.com/PrismarineJS/prismarine-web-client/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/prismarine-web-client)

A minecraft client running in a web page. Demo at https://prismarine-web-client.js.org

It runs mineflayer in the browser which connects to a websocket minecraft server.
It provides a simple websocket to tcp proxy as a backend to make it possible to connect to any minecraft server.

## Usage

`npm install -g prismarine-web-client` then run `prismarine-web-client` then open `http://localhost:8080` in your browser

## Features

* display blocks
* display entities as colored rectangles
* movement sync

## Roadmap

* chat
* block placing and breaking

## Development

```js
npm install
npm run build-start
```

Then connect to http://localhost:8080



