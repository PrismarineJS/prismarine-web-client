/* global THREE, prompt */

// Workaround for process.versions.node not existing in the browser
process.versions.node = '14.0.0'

const mineflayer = require('mineflayer')
const { WorldView, Viewer } = require('prismarine-viewer/viewer')
const Vec3 = require('vec3').Vec3
global.THREE = require('three')
const chat = require('./lib/chat')

const maxPitch = 0.5 * Math.PI
const minPitch = -0.5 * Math.PI

async function main () {
  const viewDistance = 6
  const host = prompt('Host', '95.111.249.143')
  const port = parseInt(prompt('Port', '10000'))
  const username = prompt('Username', 'pviewer_person' + (Math.floor(Math.random() * 1000)))
  let password = prompt('Password (blank for offline)', '')
  password = password === '' ? undefined : password
  console.log(`connecting to ${host} ${port} with ${username}`)

  const bot = mineflayer.createBot({
    host,
    port,
    username,
    password
  })

  bot.on('end', () => {
    console.log('disconnected')
  })

  bot.once('spawn', () => {
    console.log('bot spawned - starting viewer')

    const version = bot.version

    const center = bot.entity.position

    const worldView = new WorldView(bot.world, viewDistance, center)

    // Create three.js context, add to page
    const renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio || 1)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    chat.init(undefined, bot._client, renderer)

    // Create viewer
    const viewer = new Viewer(renderer)
    viewer.setVersion(version)

    worldView.listenToBot(bot)
    worldView.init(bot.entity.position)

    function botPosition () {
      viewer.setFirstPersonCamera(bot.entity.position, bot.entity.yaw, bot.entity.pitch)
      worldView.updatePosition(bot.entity.position)
    }

    bot.on('move', botPosition)

    // Link WorldView and Viewer
    viewer.listen(worldView)
    viewer.camera.position.set(center.x, center.y, center.z)

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
      console.log(e.code)

      if (e.code in codes) {
        bot.setControlState(codes[e.code], true)
      }
    }, false)

    document.addEventListener('keyup', (e) => {
      if (e.code in codes) {
        bot.setControlState(codes[e.code], false)
      }
    }, false)

    document.addEventListener('mousedown', (e) => {
      const ButtonBlock = bot.blockAtCursor()
      if (!ButtonBlock) return
      if (e.button === 0) {
        if (bot.canDigBlock(ButtonBlock)) {
          bot.dig(ButtonBlock)
        }
      } else if (e.button === 2) {
        const vecArray = [new Vec3(0, -1, 0), new Vec3(0, 1, 0), new Vec3(0, 0, -1), new Vec3(0, 0, 1), new Vec3(-1, 0, 0), new Vec3(1, 0, 0)]
        const vec = vecArray[ButtonBlock.face]

        bot.placeBlock(ButtonBlock, vec)
      }
    }, false)

    document.addEventListener('mouseup', (e) => {
      bot.stopDigging()
    }, false)

    // Browser animation loop
    const animate = () => {
      window.requestAnimationFrame(animate)
      viewer.update()
      renderer.render(viewer.scene, viewer.camera)
    }
    animate()
  })
}
main()
