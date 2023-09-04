//@ts-check

import { Vec3 } from 'vec3'
import { isGameActive, showModal, gameAdditionalState, activeModalStack, hideCurrentModal } from './globalState'
import { proxy, subscribe } from 'valtio'

import { ControMax } from 'contro-max/build/controMax'
import { CommandEventArgument, SchemaCommandInput } from 'contro-max/build/types'
import { stringStartsWith } from 'contro-max/build/stringUtils'
import { reloadChunks } from './utils'

// doesnt seem to work for now
const customKeymaps = proxy(JSON.parse(localStorage.keymap || '{}'))
subscribe(customKeymaps, () => {
  localStorage.keymap = JSON.parse(customKeymaps)
})

export const contro = new ControMax({
  commands: {
    general: {
      jump: ['Space', 'A'],
      inventory: ['KeyE', 'X'],
      drop: ['KeyQ', 'B'],
      sneak: ['ShiftLeft', 'Right Stick'],
      sprint: ['ControlLeft', 'Left Stick'],
      nextHotbarSlot: [null, 'Left Bumper'],
      prevHotbarSlot: [null, 'Right Bumper'],
      attackDestroy: [null, 'Right Trigger'],
      interactPlace: [null, 'Left Trigger'],
      chat: [['KeyT', 'Enter'], null],
      command: ['Slash', null],
    },
    // waila: {
    //   showLookingBlockRecipe: ['Numpad3'],
    //   showLookingBlockUsages: ['Numpad4']
    // }
  } satisfies Record<string, Record<string, SchemaCommandInput>>,
  movementKeymap: 'WASD',
  movementVector: '2d',
  groupedCommands: {
    general: {
      switchSlot: ['Digits', []]
    }
  },
}, {
  target: document,
  captureEvents() {
    return bot && isGameActive(false)
  },
  storeProvider: {
    load: () => customKeymaps,
    save() { },
  }
})
export type Command = CommandEventArgument<typeof contro['_commandsRaw']>['command']

const setSprinting = (state: boolean) => {
  bot.setControlState('sprint', state)
  gameAdditionalState.isSprinting = state
}

contro.on('movementUpdate', ({ vector, gamepadIndex }) => {
  // gamepadIndex will be used for splitscreen in future
  const coordToAction = [
    ['z', -1, 'forward'],
    ['z', 1, 'back'],
    ['x', -1, 'left'],
    ['x', 1, 'right'],
  ] as const

  const newState: Partial<typeof bot.controlState> = {}
  for (const [coord, v] of Object.entries(vector)) {
    if (v === undefined || Math.abs(v) < 0.3) continue
    // todo use raw values eg for slow movement
    const mappedValue = v < 0 ? -1 : 1
    const foundAction = coordToAction.find(([c, mapV]) => c === coord && mapV === mappedValue)?.[2]
    newState[foundAction] = true
  }

  for (const key of ['forward', 'back', 'left', 'right'] as const) {
    if (newState[key] === bot.controlState[key]) continue
    const action = !!newState[key]
    if (action && !isGameActive(true)) continue
    bot.setControlState(key, action)

    if (key === 'forward') {
      // todo workaround: need to refactor
      if (action) {
        contro.emit('trigger', { command: 'general.forward' } as any)
      } else {
        setSprinting(false)
      }
    }
  }
})

let lastCommandTrigger = null as { command: string, time: number } | null

const secondActionActivationTimeout = 600
const secondActionCommands = {
  'general.jump'() {
    toggleFly()
  },
  'general.forward'() {
    setSprinting(true)
  }
}

// detect pause open, as ANY keyup event is not fired when you exit pointer lock (esc)
subscribe(activeModalStack, () => {
  if (activeModalStack.length) {
    // iterate over pressedKeys
    for (const key of contro.pressedKeys) {
      contro.pressedKeyOrButtonChanged({ code: key }, false)
    }
  }
})

const onTriggerOrReleased = (command: Command, pressed: boolean) => {
  // always allow release!
  if (pressed && !isGameActive(true)) return
  if (stringStartsWith(command, 'general')) {
    // handle general commands
    switch (command) {
      case 'general.jump':
        bot.setControlState('jump', pressed)
        break
      case 'general.sneak':
        gameAdditionalState.isSneaking = pressed
        bot.setControlState('sneak', pressed)
        break
      case 'general.sprint':
        // todo add setting to change behavior
        if (pressed) {
          setSprinting(pressed)
        }
        break
    }
  }
}

// im still not sure, maybe need to refactor to handle in inventory instead
const alwaysHandledCommand = (command: Command) => {
  if (command === 'general.inventory') {
    if (activeModalStack.at(-1)?.reactType === 'inventory') {
      hideCurrentModal()
    }
  }
}

contro.on('trigger', ({ command }) => {
  const willContinue = !isGameActive(true)
  alwaysHandledCommand(command)
  if (willContinue) return

  const secondActionCommand = secondActionCommands[command]
  if (secondActionCommand) {
    if (command === lastCommandTrigger?.command && Date.now() - lastCommandTrigger.time < secondActionActivationTimeout) {
      const commandToTrigger = secondActionCommands[lastCommandTrigger.command]
      commandToTrigger()
      lastCommandTrigger = null
    } else {
      lastCommandTrigger = {
        command,
        time: Date.now(),
      }
    }
  }

  onTriggerOrReleased(command, true)

  if (stringStartsWith(command, 'general')) {
    switch (command) {
      case 'general.inventory':
        document.exitPointerLock?.()
        showModal({ reactType: 'inventory' })
        break
      case 'general.drop':
        if (bot.heldItem) bot.tossStack(bot.heldItem)
        break
      case 'general.chat':
        document.getElementById('hud').shadowRoot.getElementById('chat').enableChat()
        break
      case 'general.command':
        document.getElementById('hud').shadowRoot.getElementById('chat').enableChat('/')
        break
      // todo place / destroy
    }
  }
})

contro.on('release', ({ command }) => {
  onTriggerOrReleased(command, false)
})

// hard-coded keybindings

const hardcodedPressedKeys = new Set<string>()
document.addEventListener('keydown', (e) => {
  if (hardcodedPressedKeys.has('F3')) {
    // reload chunks
    if (e.code === 'KeyA') {
      //@ts-ignore
      const loadedChunks = Object.entries(worldView.loadedChunks).filter(([, v]) => v).map(([key]) => key.split(',').map(Number))
      for (const [x, z] of loadedChunks) {
        worldView.unloadChunk({ x, z })
      }
      reloadChunks()
    }
  }

  if (hardcodedPressedKeys.has(e.code)) return
  hardcodedPressedKeys.add(e.code)
})
document.addEventListener('keyup', (e) => {
  hardcodedPressedKeys.delete(e.code)
})

// #region creative fly
// these controls are more like for gamemode 3

const makeInterval = (fn, interval) => {
  const intervalId = setInterval(fn, interval)

  const cleanup = () => {
    clearInterval(intervalId)
    cleanup.active = false
  }
  cleanup.active = true
  return cleanup
}

const isFlying = () => bot.physics.gravity === 0
let endFlyLoop: ReturnType<typeof makeInterval> | undefined

const currentFlyVector = new Vec3(0, 0, 0)
window.currentFlyVector = currentFlyVector

const startFlyLoop = () => {
  if (!isFlying()) return
  endFlyLoop?.()

  endFlyLoop = makeInterval(() => {
    if (!window.bot) endFlyLoop()
    bot.entity.position.add(currentFlyVector.clone().multiply(new Vec3(0, 0.5, 0)))
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

const standardAirborneAcceleration = 0.02
const toggleFly = () => {
  if (bot.game.gameMode !== 'creative' && bot.game.gameMode !== 'spectator') return
  if (bot.setControlState !== patchedSetControlState) {
    originalSetControlState = bot.setControlState
    bot.setControlState = patchedSetControlState
  }

  if (isFlying()) {
    bot.physics['airborneAcceleration'] = standardAirborneAcceleration
    bot.creative.stopFlying()
    endFlyLoop?.()
  } else {
    // window.flyingSpeed will be removed
    bot.physics['airborneAcceleration'] = window.flyingSpeed ?? 0.1
    bot.entity.velocity = new Vec3(0, 0, 0)
    bot.creative.startFlying()
    startFlyLoop()
  }
  gameAdditionalState.isFlying = isFlying()
}
// #endregion
