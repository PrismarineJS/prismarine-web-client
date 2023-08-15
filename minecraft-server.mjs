//@ts-check
import mcServer from 'flying-squid'

mcServer.createMCServer({
  'motd': 'A Minecraft Server \nRunning flying-squid',
  'port': 25565,
  'max-players': 10,
  'online-mode': false,
  'logging': true,
  'gameMode': 1,
  'difficulty': 0,
  'worldFolder': 'world',
  // todo set sid, disable entities auto-spawn
  'generation': {
    'name': 'diamond_square',
    'options': {
      'worldHeight': 80
    }
  },
  'kickTimeout': 10000,
  'plugins': {},
  'modpe': false,
  'view-distance': 10,
  'player-list-text': {
    'header': 'Flying squid',
    'footer': 'Test server'
  },
  'everybody-op': true,
  'max-entities': 100,
  'version': '1.16.1'
})
