//@ts-check

import { proxy, ref, subscribe } from 'valtio'
import { pointerLock } from './utils'
import { options } from './optionsStorage'

// todo: refactor structure with support of hideNext=false

type Modal = ({ elem?: HTMLElement & Record<string, any> } & { reactType?: string })

type ContextMenuItem = { callback; label }

export const activeModalStack: Modal[] = proxy([])

export const replaceActiveModalStack = (name: string, newModalStack = activeModalStacks[name]) => {
  hideModal(undefined, undefined, { restorePrevious: false, force: true, })
  activeModalStack.splice(0, activeModalStack.length, ...newModalStack)
  // todo restore previous
}

export const activeModalStacks: Record<string, Modal[]> = {}

window.activeModalStack = activeModalStack

export const customDisplayManageKeyword = 'custom'

const defaultModalActions = {
  show(modal: Modal) {
    if (modal.elem) modal.elem.style.display = 'block'
  },
  hide(modal: Modal) {
    if (modal.elem) modal.elem.style.display = 'none'
  }
}

/**
 * @returns true if operation was successful
 */
const showModalInner = (modal: Modal) => {
  const cancel = modal.elem?.show?.()
  if (cancel && cancel !== customDisplayManageKeyword) return false
  if (cancel !== 'custom') defaultModalActions.show(modal)
  return true
}

export const showModal = (elem: (HTMLElement & Record<string, any>) | { reactType: string }) => {
  const resolved = elem instanceof HTMLElement ? { elem: ref(elem) } : elem
  const curModal = activeModalStack.slice(-1)[0]
  if (elem === curModal?.elem || !showModalInner(resolved)) return
  if (curModal) defaultModalActions.hide(curModal)
  activeModalStack.push(resolved)
}

/**
 *
 * @returns true if previous modal was restored
 */
export const hideModal = (modal = activeModalStack.slice(-1)[0], data: any = undefined, options: { force?: boolean; restorePrevious?: boolean } = {}) => {
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

export const hideCurrentModal = (_data = undefined, restoredActions = undefined) => {
  if (hideModal(undefined, undefined)) {
    restoredActions?.()
    if (activeModalStack.length === 0) {
      if (!isGameActive(false)) {
        showModal(document.getElementById('title-screen'))
      } else {
        pointerLock.requestPointerLock()
      }
    }
  }
}

// ---

export const currentContextMenu = proxy({ items: [] as ContextMenuItem[] | null, x: 0, y: 0, })

export const showContextmenu = (items: ContextMenuItem[], { clientX, clientY }) => {
  Object.assign(currentContextMenu, {
    items,
    x: clientX,
    y: clientY,
  })
}

// ---

export const miscUiState = proxy({
  currentTouch: null as boolean | null,
  singleplayer: false,
  flyingSquid: false,
  wanOpened: false,
  gameLoaded: false,
  resourcePackInstalled: false,
})

export const isGameActive = (foregroundCheck: boolean) => {
  if (foregroundCheck && activeModalStack.length) return false
  return miscUiState.gameLoaded
}

window.miscUiState = miscUiState

// state that is not possible to get via bot and in-game specific
export const gameAdditionalState = proxy({
  isFlying: false,
  isSprinting: false,
  isSneaking: false,
})

window.gameAdditionalState = gameAdditionalState

const savePlayers = () => {
  if (!window.localServer) return
  for (const player of window.localServer.players) {
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
  if (options.closeConfirmation === false) return

  // For major browsers doning only this is enough
  event.preventDefault()

  // Display a confirmation prompt
  event.returnValue = '' // Required for some browsers
  return 'The game is running. Are you sure you want to close this page?'
})
