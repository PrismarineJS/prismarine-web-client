# prismarine-web-client
[![NPM version](https://img.shields.io/npm/v/prismarine-web-client.svg)](http://npmjs.com/package/prismarine-web-client)
[![Build Status](https://github.com/PrismarineJS/prismarine-web-client/workflows/CI/badge.svg)](https://github.com/PrismarineJS/prismarine-web-client/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/prismarine-web-client)

| 🇺🇸 [English](README.md) | 🇷🇺 [Russian](README_RU.md)  | 🇵🇹 [Portuguese](README_PT.md) |
| ----------------------- | -------------------------- | ---------------------------- |

Um cliente de Minecraft a funcionar numa página web. **Demostração em https://prismarinejs.github.io/prismarine-web-client/**

## Como funciona
prismarine-web-client executa mineflayer e prismarine-viewer no teu navegador, que se conecta por WebSocket a uma proxy 
que traduz o conexão do WebSocket em TCP para poderes conectar-te a servidores normais do Minecraft. Prismarine-web-client é basiado em:
* [prismarine-viewer](https://github.com/PrismarineJS/prismarine-viewer) para renderizar o mundo
* [mineflayer](https://github.com/PrismarineJS/mineflayer) um API incrível do cliente de Minecraft

Da uma olhada nestes módulos se quiseres entender mais sobre como isto funciona e poderes contribuir!

## Captura de tela
![Captura de tela do prismarine-web-client em ação](screenshot.png)

## Demostração ao vivo
Clica neste endereço para o abrires no navegador, sem instalação necessária: https://prismarinejs.github.io/prismarine-web-client/

*Testado no Chrome & Firefox para plataformas desktop.*

## Uso
Para hospedá-lo por si próprio, execute estes comandos no bash: 
```bash
$ npm install -g prismarine-web-client
$ prismarine-web-client
``` 
Finalmente, abra `http://localhost:8080` no seu navigador.

## Conteúdos

* Mostra criaturas e os jogadores
* Mostra os blocos 
* Movimento (podes mover-te, e também ver entidades a mover-se em tempo real)
* Colocar e destruir blocos

## Planeamentos
* Containers (inventário, baús, etc.)
* Sons
* Mais interações no mundo (atacar entidades, etc.)
* Renderizar cosméticos (ciclo dia-noite, nevoeiro, etc.)

## Desenvolvimentos

Se estiveres a contribuir/fazer alterações, precisas intalá-lo de outra forma.

Primeiro, clona o repositório.

Depois, defina o seu diretório de trabalho para o do repositório. Por examplo:
```bash
$ cd ~/prismarine-web-client/
```

Finalmente, execute

```bash
$ npm install
$ npm start
```

Isto vai começar o express e webpack no modo de desenvolvimento; quando salvares um arquivo, o build vai ser executado de novo (demora 5s), 
e podes atualizar a página para veres o novo resultado.

Conecta em http://localhost:8080 no teu navegador.

Poderás ter que desativar o auto salvar no teu IDE para evitar estar constantemente a reconstruir; see https://webpack.js.org/guides/development/#adjusting-your-text-editor.

Para conferir a build de produção (vai demorar alguns minutos para terminar), podes executar `npm run build-start`.

Se estiveres interessado em contribuir, podes dar uma vista de olhos nos projetos em https://github.com/PrismarineJS/prismarine-web-client/projects.

Algumas variáveis estão expostas no objeto global ``window`` para depuração:
* ``bot``
* ``viewer``
* ``mcData``
* ``worldView``
* ``Vec3``
* ``pathfinder``
* ``debugMenu``

### Adicionar coisas no debugMenu

debugMenu.customEntries['myKey'] = 'myValue'
delete debugMenu.customEntries['myKey']

### Alguns exemplos de depuração

Na devtools do chrome:

* `bot.chat('test')` permite usar o chat
* `bot.chat(JSON.stringify(Object.values(bot.players).map(({username, ping}) => ({username, ping}))))` display the ping of everyone
* `window.bot.entity.position.y += 5` saltar
* `bot.chat(JSON.stringify(bot.findBlock({matching:(block) => block.name==='diamond_ore', maxDistance:256}).position))` encontrar a posição de um bloco de diamante
* `bot.physics.stepHeight = 2` permite andar sobre os blocos
* `bot.physics.sprintSpeed = 5` andar mais rápido
* `bot.loadPlugin(pathfinder.pathfinder)` em seguida `bot.pathfinder.goto(new pathfinder.goals.GoalXZ(100, 100))` para ir para a posição 100, 100

Para mais ideas de depuração, leia o documento [mineflayer](https://github.com/PrismarineJS/mineflayer).
