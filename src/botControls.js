//@ts-check

const { Vec3 } = require('vec3')
const { isGameActive, showModal, gameAdditionalState } = require('./globalState')

const keyBindScrn = document.getElementById('keybinds-screen')

// these controls are for gamemode 3 actually

const makeInterval = (fn, interval) => {
  const intervalId = setInterval(fn, interval)

  const cleanup = () => {
    clearInterval(intervalId)
    cleanup.active = false
  }
  cleanup.active = true
  return cleanup
}

const flySpeedMult = 0.5

const isFlying = () => bot.physics.gravity === 0
/** @type {ReturnType<typeof makeInterval>|undefined} */
let endFlyLoop

const currentFlyVector = new Vec3(0, 0, 0)
window.currentFlyVector = currentFlyVector

const startFlyLoop = () => {
  if (!isFlying()) return
  endFlyLoop?.()

  endFlyLoop = makeInterval(() => {
    if (!window.bot) endFlyLoop()
    bot.entity.position.add(currentFlyVector.clone().multiply(new Vec3(flySpeedMult, flySpeedMult, flySpeedMult)))
  }, 50)
}

// todo we will get rid of patching it when refactor controls
let originalSetControlState
const patchedSetControlState = (action, state) => {
  if (!isFlying()) {
    return originalSetControlState(action, state)
  }

  const actionPerFlyVector = {
    jump: new Vec3(0, 1, 0),
    sneak: new Vec3(0, -1, 0),
  }

  const changeVec = actionPerFlyVector[action]
  if (!changeVec) {
    return originalSetControlState(action, state)
  }
  const toAddVec = changeVec.scaled(state ? 1 : -1)
  for (const coord of ['x', 'y', 'z']) {
    if (toAddVec[coord] === 0) continue
    if (currentFlyVector[coord] === toAddVec[coord]) return
  }
  currentFlyVector.add(toAddVec)
}

const toggleFly = () => {
  if (bot.game.gameMode !== 'creative' && bot.game.gameMode !== 'spectator') return
  if (bot.setControlState !== patchedSetControlState) {
    originalSetControlState = bot.setControlState
    bot.setControlState = patchedSetControlState
  }

  if (isFlying()) {
    bot.creative.stopFlying()
    endFlyLoop?.()
  } else {
    bot.entity.velocity = new Vec3(0, 0, 0)
    bot.creative.startFlying()
    startFlyLoop()
  }
  gameAdditionalState.isFlying = isFlying()
}

let lastJumpUsage = 0
document.addEventListener('keydown', (e) => {
  if (!isGameActive(true)) return

  keyBindScrn.keymaps.forEach(km => {
    if (e.code === km.key) {
      switch (km.defaultKey) {
        case 'KeyE':
          // todo reenable
          showModal({ reactType: 'inventory', })
          // todo seems to be workaround
          // avoid calling inner keybinding listener, but should be handled there
          e.stopImmediatePropagation()
          break
        case 'KeyQ':
          if (bot.heldItem) bot.tossStack(bot.heldItem)
          break
        case 'ControlLeft':
          bot.setControlState('sprint', true)
          gameAdditionalState.isSprinting = true
          break
        case 'ShiftLeft':
          bot.setControlState('sneak', true)
          break
        case 'Space':
          bot.setControlState('jump', true)
          break
        case 'KeyD':
          bot.setControlState('right', true)
          e.preventDefault()
          break
        case 'KeyA':
          bot.setControlState('left', true)
          e.preventDefault()
          break
        case 'KeyS':
          bot.setControlState('back', true)
          break
        case 'KeyW':
          bot.setControlState('forward', true)
          break
      }
    }
  })
}, {
  capture: true,
})

document.addEventListener('keyup', (e) => {
  // if (!isGameActive(true)) return

  keyBindScrn.keymaps.forEach(km => {
    if (e.code === km.key) {
      switch (km.defaultKey) {
        case 'ControlLeft':
          bot.setControlState('sprint', false)
          gameAdditionalState.isSprinting = false
          break
        case 'ShiftLeft':
          bot.setControlState('sneak', false)
          break
        case 'Space':
          const toggleFlyAction = Date.now() - lastJumpUsage < 500
          if (toggleFlyAction) {
            toggleFly()
          }
          lastJumpUsage = Date.now()

          bot.setControlState('jump', false)
          break
        case 'KeyD':
          bot.setControlState('right', false)
          break
        case 'KeyA':
          bot.setControlState('left', false)
          break
        case 'KeyS':
          bot.setControlState('back', false)
          break
        case 'KeyW':
          bot.setControlState('forward', false)
          break
      }
    }
  })
}, false)
