/* global THREE, prompt */
const net = require('net')
const config = require('./config.json')

// Workaround for process.versions.node not existing in the browser
process.versions.node = '14.0.0'

const mineflayer = require('mineflayer')
const { WorldView, Viewer } = require('prismarine-viewer/viewer')
const pathfinder = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3')
global.THREE = require('three')
const Chat = require('./lib/chat')

let status = 'Waiting for user'

const maxPitch = 0.5 * Math.PI
const minPitch = -0.5 * Math.PI

async function statusRunner () {
  const array = ['.', '..', '...', '']
  // eslint-disable-next-line promise/param-names
  const timer = ms => new Promise(res => setTimeout(res, ms))

  async function load () {
    for (let i = 0; true; i = ((i + 1) % array.length)) {
      document.getElementById('loading-text').innerText = status + array[i]
      await timer(500)
    }
  }

  load()
}

async function reloadHotbar (bot, viewer) {
  console.log('Loading hotbar.')
  for (let i = 0; i < 9; i++) {
    // eslint-disable-next-line no-undef
    const http = new XMLHttpRequest()
    let url = bot.inventory.slots[bot.inventory.hotbarStart + i] ? window.location.href + 'textures/' + viewer.version + '/items/' + bot.inventory.slots[bot.inventory.hotbarStart + i].name + '.png' : ''
    http.open('HEAD', url)

    http.onreadystatechange = function () {
      if (this.readyState === this.DONE) {
        if (this.status === 404) {
          url = bot.inventory.slots[bot.inventory.hotbarStart + i] ? window.location.href + 'textures/' + viewer.version + '/blocks/' + bot.inventory.slots[bot.inventory.hotbarStart + i].name + '.png' : ''
        }
        document.getElementById('hotbar-' + i).src = url
      }
    }
    http.send()
  }
}

async function reloadHotbarSelected (bot, slot) {
  console.log('Changing the selected hotbar slot to ' + slot.toString() + '!')
  const planned = (20 * 4 * slot) + 'px'
  document.getElementById('hotbar-highlight').style.marginLeft = planned
  bot.setQuickBarSlot(slot)
  console.log('Successfully changed to ' + planned + '!')
}

async function main () {
  statusRunner()
  const viewDistance = 6
  const hostprompt = prompt('Host:port', config.defaultHost)
  const proxyprompt = prompt('Proxy:port (blank for default)', config.defaultProxy)
  const defaultUserName = window.localStorage.getItem('username') ?? 'pviewer' + (Math.floor(Math.random() * 1000))
  const username = prompt('Username', defaultUserName)
  window.localStorage.setItem('username', username)
  let password = prompt('Password (blank for offline)', '')
  password = password === '' ? undefined : password

  let host, port, proxy, proxyport
  if (!hostprompt.includes(':')) {
    host = hostprompt
    port = 25565
  } else {
    [host, port] = hostprompt.split(':')
    port = parseInt(port, 10)
  }

  if (!proxyprompt.includes(':')) {
    proxy = proxyprompt
    proxyport = undefined
  } else {
    [proxy, proxyport] = proxyprompt.split(':')
    proxyport = parseInt(proxyport, 10)
  }
  console.log(`connecting to ${host} ${port} with ${username}`)

  if (proxy) {
    console.log(`using proxy ${proxy} ${proxyport}`)
    net.setProxy({ hostname: proxy, port: proxyport })
  }

  status = 'Logging in'

  const bot = mineflayer.createBot({
    host,
    port,
    username,
    password,
    viewDistance: 'tiny',
    checkTimeoutInterval: 240 * 1000,
    noPongTimeout: 240 * 1000,
    closeTimeout: 240 * 1000
  })

  bot.on('error', (err) => {
    console.log('Encountered error!', err)
    status = 'Error encountered. Please reload the page'
  })

  bot.on('kicked', (kickReason) => {
    console.log('User was kicked!', kickReason)
    status = 'The Minecraft server kicked you. Please reload the page to rejoin'
  })

  bot.on('end', (endReason) => {
    console.log('disconnected for', endReason)
    status = 'You have been disconnected from the server. Please reload the page to rejoin'
  })

  bot.once('login', () => {
    status = 'Loading world...'
  })

  bot.once('spawn', () => {
    const mcData = require('minecraft-data')(bot.version)

    reloadHotbarSelected(bot, 0)
    status = 'Placing blocks (starting viewer)...'

    console.log('bot spawned - starting viewer')

    const version = bot.version

    const center = bot.entity.position

    const worldView = new WorldView(bot.world, viewDistance, center)

    // Create three.js context, add to page
    const renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio || 1)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    const chat = Chat.init(bot._client, renderer)

    // Create viewer
    const viewer = new Viewer(renderer)
    viewer.setVersion(version)

    window.worldView = worldView
    window.bot = bot
    window.mcData = mcData
    window.viewer = viewer
    window.Vec3 = Vec3
    window.pathfinder = pathfinder

    reloadHotbar(bot, viewer)

    // Link WorldView and Viewer
    viewer.listen(worldView)
    worldView.listenToBot(bot)
    worldView.init(bot.entity.position)

    function botPosition () {
      viewer.setFirstPersonCamera(bot.entity.position, bot.entity.yaw, bot.entity.pitch)
      worldView.updatePosition(bot.entity.position)
    }
    bot.on('move', botPosition)
    viewer.camera.position.set(center.x, center.y, center.z)

    status = 'Setting callbacks...'

    function moveCallback (e) {
      bot.entity.pitch -= e.movementY * 0.01
      bot.entity.pitch = Math.max(minPitch, Math.min(maxPitch, bot.entity.pitch))
      bot.entity.yaw -= e.movementX * 0.01

      viewer.setFirstPersonCamera(null, bot.entity.yaw, bot.entity.pitch)
    }

    function changeCallback () {
      if (document.pointerLockElement === renderer.domElement ||
        document.mozPointerLockElement === renderer.domElement ||
        document.webkitPointerLockElement === renderer.domElement) {
        document.addEventListener('mousemove', moveCallback, false)
      } else {
        document.removeEventListener('mousemove', moveCallback, false)
      }
    }

    document.addEventListener('pointerlockchange', changeCallback, false)
    document.addEventListener('mozpointerlockchange', changeCallback, false)
    document.addEventListener('webkitpointerlockchange', changeCallback, false)

    renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock ||
      renderer.domElement.mozRequestPointerLock ||
      renderer.domElement.webkitRequestPointerLock
    document.addEventListener('mousedown', (e) => {
      renderer.domElement.requestPointerLock()
    })

    document.addEventListener('contextmenu', (e) => e.preventDefault(), false)

    const codes = {
      KeyW: 'forward',
      KeyS: 'back',
      KeyA: 'right',
      KeyD: 'left',
      Space: 'jump',
      ShiftLeft: 'sneak',
      ControlLeft: 'sprint'
    }

    document.addEventListener('keydown', (e) => {
      if (chat.inChat) return
      console.log(e.code)
      if (e.code in codes) {
        bot.setControlState(codes[e.code], true)
      }
      if (e.code.startsWith('Digit')) {
        const numPressed = e.code.substr(5)
        reloadHotbarSelected(bot, numPressed - 1)
      }
      if (e.code === 'KeyQ') {
        bot.tossStack(bot.heldItem)
      }
    }, false)

    document.addEventListener('keyup', (e) => {
      if (e.code in codes) {
        bot.setControlState(codes[e.code], false)
      }
    }, false)

    document.addEventListener('mousedown', (e) => {
      if (document.pointerLockElement !== renderer.domElement) return

      const cursorBlock = bot.blockAtCursor()
      if (!cursorBlock) return

      if (e.button === 0) {
        if (bot.canDigBlock(cursorBlock)) {
          bot.dig(cursorBlock, 'ignore')
        }
      } else if (e.button === 2) {
        const vecArray = [new Vec3(0, -1, 0), new Vec3(0, 1, 0), new Vec3(0, 0, -1), new Vec3(0, 0, 1), new Vec3(-1, 0, 0), new Vec3(1, 0, 0)]
        const vec = vecArray[cursorBlock.face]

        const delta = cursorBlock.intersect.minus(cursorBlock.position)
        bot._placeBlockWithOptions(cursorBlock, vec, { delta, forceLook: 'ignore' })
      }
    }, false)

    document.addEventListener('mouseup', (e) => {
      bot.stopDigging()
    }, false)

    document.addEventListener('wheel', (e) => {
      const newSlot = ((bot.quickBarSlot + Math.sign(e.deltaY)) % 9 + 9) % 9
      reloadHotbarSelected(bot, newSlot)
    })

    status = 'Done!'
    console.log(status) // only do that because it's read in index.html and npm run fix complains.

    setTimeout(function () {
      // remove loading screen, wait a second to make sure a frame has properly rendered
      document.querySelectorAll('.loader').forEach((item) => {
        item.style = 'display: none;'
      })
    }, 2500)

    // Browser animation loop
    const animate = () => {
      window.requestAnimationFrame(animate)
      viewer.update()
      renderer.render(viewer.scene, viewer.camera)
    }
    animate()

    // inventory listener
    bot.inventory.on('updateSlot', (slot, oldItem, newItem) => {
      if (slot >= bot.inventory.hotbarStart + 9) return
      if (slot < bot.inventory.hotbarStart) return

      // eslint-disable-next-line no-undef
      const http = new XMLHttpRequest()
      let url = newItem ? window.location.href + 'textures/' + viewer.version + '/items/' + newItem.name + '.png' : ''
      http.open('HEAD', url)

      http.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
          if (this.status === 404) {
            url = newItem ? window.location.href + 'textures/' + viewer.version + '/blocks/' + newItem.name + '.png' : ''
          }
          document.getElementById('hotbar-' + (slot - bot.inventory.hotbarStart)).src = url
        }
      }
      http.send()
    })

    window.addEventListener('resize', () => {
      viewer.camera.aspect = window.innerWidth / window.innerHeight
      viewer.camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })
  })
}
main()
