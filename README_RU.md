# prismarine-web-client
[![NPM version](https://img.shields.io/npm/v/prismarine-web-client.svg)](http://npmjs.com/package/prismarine-web-client)
[![Build Status](https://github.com/PrismarineJS/prismarine-web-client/workflows/CI/badge.svg)](https://github.com/PrismarineJS/prismarine-web-client/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/prismarine-web-client)

| 🇺🇸 [English](README.md) | 🇷🇺 [Russian](README_RU.md) |
| ----------------------- | -------------------------- |

A Minecraft client running in a web page. **Live demo at https://webclient.prismarine.js.org/**


## Как это работает
prismarine-web-client запускает mineflayer и prismarine-viewer в вашем браузере, которые подключаются к прокси через WebSocket
который переводит соединение WebSocket в TCP для подключения к обычным серверам Minecraft. Prismarine-web-client основан на:
* [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) для рендера мира
* [mineflayer](https://github.com/PrismarineJS/mineflayer) для высокоуровневого API клиента minecraft

Проверьте эти модули, если вы хотите больше понять, как это работает, и внести свой вклад!

## Скриншот
![Screenshot of prismarine-web-client in action](screenshot.png)

## Live Demo
Нажмите на эту ссылку, чтобы открыть ее в вашем браузере, установка не требуется: https://webclient.prismarine.js.org/

*Протестировано в Chrome и Firefox для настольных платформ.*

## Использование
Чтобы хостить его самостоятельно, выполните эти команды в bash:
```bash
$ npm install -g prismarine-web-client
$ prismarine-web-client
``` 
Наконец, откройте `http://localhost:8080` в вашем браузере.

## Features

* Показывание мобов и игроков
* Показывание блоков 
* Передвижение (Вы можете двигаться, и вы можете видеть передвижение других сущностей)
* Установка и ломание блоков

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
$ cd ~/prismarine-web-client/
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

Some variables are exposed in window for debugging:
* bot
* viewer
* mcData
* worldView
* Vec3
* pathfinder
* debugMenu

### Как добавить дополнительные элементы в меню отладки ?

debugMenu.customEntries['myKey'] = 'myValue'
delete debugMenu.customEntries['myKey']

### Некоторые примеры отладки

В инструментах chrome dev

* `bot.chat('test')` позволяет вам использовать чат
* `bot.chat(JSON.stringify(Object.values(bot.players).map(({username, ping}) => ({username, ping}))))` показывает пинг всех игроков
* `window.bot.entity.position.y += 5` прыжок
* `bot.chat(JSON.stringify(bot.findBlock({matching:(block) => block.name==='diamond_ore', maxDistance:256}).position))` ищет позицию алмазной руды
* `bot.physics.stepHeight = 2` allows you to walk about blocks
* `bot.physics.sprintSpeed = 5` walks faster
* `bot.loadPlugin(pathfinder.pathfinder)` затем `bot.pathfinder.goto(new pathfinder.goals.GoalXZ(100, 100))` идет к координатам 100, 100

Для получения дополнительных идей по отладке прочитайте [mineflayer](https://github.com/PrismarineJS/mineflayer) документацию
