//@ts-check
import mcServer from 'space-squid'

/** @type {import('minecraft-protocol').ServerOptions & Record<string ,any>} */
const serverOptions = {
  'motd': 'A Minecraft Server \nRunning flying-squid',
  // host: '',
  'port': 25565,
  'max-players': 10,
  'online-mode': false,
  'logging': true,
  'gameMode': 1,
  'difficulty': 0,
  'worldFolder': 'world',
  // todo set sid, disable entities auto-spawn
  'generation': {
    'name': 'superflat',
    options: {}
    // 'options': {
    //   'worldHeight': 80
    // }
  },
  'kickTimeout': 10000,
  'plugins': {},
  'modpe': false,
  'view-distance': 2,
  'player-list-text': {
    'header': 'Flying squid',
    'footer': 'Test server'
  },
  'everybody-op': true,
  'max-entities': 100,
  'version': '1.16.1'
}
const server = mcServer.createMCServer(serverOptions)
