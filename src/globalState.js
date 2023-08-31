//@ts-check

import { proxy, ref, subscribe } from 'valtio'
import { pointerLock } from './utils'
import { options } from './optionsStorage'

// todo: refactor structure with support of hideNext=false

/**
 * @typedef {({elem?: HTMLElement & Record<string, any>} & {reactType?: string})} Modal
 * @typedef {{callback, label}} ContextMenuItem
 */

/** @type {Modal[]} */
export const activeModalStack = proxy([])

export const replaceActiveModalStack = (name, newModalStack = activeModalStacks[name]) => {
  hideModal(undefined, undefined, { restorePrevious: false, force: true, })
  activeModalStack.splice(0, activeModalStack.length, ...newModalStack)
  // todo restore previous
}

/** @type {Record<string, Modal[]>} */
export const activeModalStacks = {}

window.activeModalStack = activeModalStack

export const customDisplayManageKeyword = 'custom'

const defaultModalActions = {
  show (/** @type {Modal} */modal) {
    if (modal.elem) modal.elem.style.display = 'block'
  },
  hide (/** @type {Modal} */modal) {
    if (modal.elem) modal.elem.style.display = 'none'
  }
}

const showModalInner = (/** @type {Modal} */ modal) => {
  const cancel = modal.elem?.show?.()
  if (cancel && cancel !== customDisplayManageKeyword) return false
  if (cancel !== 'custom') defaultModalActions.show(modal)
  return true
}

export const showModal = (/** @type {HTMLElement & Record<string, any> | {reactType: string}} */ elem) => {
  const resolved = elem instanceof HTMLElement ? { elem: ref(elem) } : elem
  const curModal = activeModalStack.slice(-1)[0]
  if (elem === curModal?.elem || !showModalInner(resolved)) return
  if (curModal) defaultModalActions.hide(curModal)
  activeModalStack.push(resolved)
}

/**
 *
 * @param {*} data
 * @param {{ force?: boolean, restorePrevious?: boolean, }} options
 * @returns
 */
export const hideModal = (modal = activeModalStack.slice(-1)[0], data = undefined, options = {}) => {
  const { force = false, restorePrevious = true } = options
  if (!modal) return
  let cancel = modal.elem?.hide?.(data)
  if (force && cancel !== customDisplayManageKeyword) {
    cancel = undefined
  }

  if (!cancel || cancel === customDisplayManageKeyword) {
    if (cancel !== customDisplayManageKeyword) defaultModalActions.hide(modal)
    activeModalStack.pop()
    const newModal = activeModalStack.slice(-1)[0]
    if (newModal && restorePrevious) {
      // would be great to ignore cancel I guess?
      showModalInner(newModal)
    }
    return true
  }
}

export const hideCurrentModal = (_data = undefined, preActions = undefined) => {
  if (hideModal(undefined, undefined)) {
    preActions?.()
    if (!isGameActive()) {
      showModal(document.getElementById('title-screen'))
    } else {
      pointerLock.requestPointerLock() // will work only if no modals left
    }
  }
}

// ---

export const currentContextMenu = proxy({ items: /** @type {ContextMenuItem[] | null} */[], x: 0, y: 0, })

export const showContextmenu = (/** @type {ContextMenuItem[]} */items, { clientX, clientY }) => {
  Object.assign(currentContextMenu, {
    items,
    x: clientX,
    y: clientY,
  })
}

// ---

export const miscUiState = proxy({
  currentTouch: null,
  singleplayer: false,
  gameLoaded: false,
})

export const isGameActive = (foregroundCheck) => {
  if (foregroundCheck && activeModalStack.length) return false
  return miscUiState.gameLoaded
}

window.miscUiState = miscUiState

// state that is not possible to get via bot and in-game specific
export const gameAdditionalState = proxy({
  isFlying: false,
  isSprinting: false,
})

window.gameAdditionalState = gameAdditionalState

const savePlayers = () => {
  if (!window.singlePlayerServer) return
  for (const player of window.singlePlayerServer.players) {
    player.save()
  }
}

setInterval(() => {
  savePlayers()
  // todo investigate unload failures instead
}, 2000)

window.addEventListener('unload', (e) => {
  savePlayers()
})

window.inspectPlayer = () => require('fs').promises.readFile('/world/playerdata/9e487d23-2ffc-365a-b1f8-f38203f59233.dat').then(window.nbt.parse).then(console.log)

// todo move from global state
window.addEventListener('beforeunload', (event) => {
  // todo-low maybe exclude chat?
  if (!isGameActive(true) && activeModalStack.at(-1)?.elem.id !== 'chat') return
  if (sessionStorage.lastReload && options.preventDevReloadWhilePlaying === false) return

  // For major browsers doning only this is enough
  event.preventDefault()

  // Display a confirmation prompt
  event.returnValue = '' // Required for some browsers
  return 'The game is running. Are you sure you want to close this page?'
})
