//@ts-check

/**
 * @typedef {(HTMLElement & Record<string, any>)} Modal
 */

/** @type {Modal[]} */
export const activeModalStack = []

window.activeModalStack = activeModalStack

export const customDisplayManageKeyword = 'custom'

const showModalInner = (/** @type {Modal} */ modal) => {
  const cancel = modal.show?.()
  if (cancel && cancel !== customDisplayManageKeyword) return false
  if (cancel !== 'custom') modal.style.display = 'block'
  return true
}

export const showModal = (/** @type {Modal} */ modal) => {
  const curModal = activeModalStack.slice(-1)[0]
  if (modal === curModal || !showModalInner(modal)) return
  if (curModal) curModal.style.display = 'none'
  activeModalStack.push(modal)
}

export const hideModal = (modal = activeModalStack.slice(-1)[0], data) => {
  if (!modal) return
  const cancel = modal.hide?.(data)
  if (!cancel || cancel === customDisplayManageKeyword) {
    if (cancel !== customDisplayManageKeyword) modal.style.display = 'none'
    activeModalStack.pop()
    const newModal = activeModalStack.slice(-1)[0]
    if (newModal) {
      // would be great to ignore cancel I guess?
      showModalInner(newModal)
    }
    return true
  }
}

export const hideCurrentModal = (data, preActions) => {
  if (hideModal(undefined, undefined)) {
    preActions?.()
    if (document.getElementById('hud').style.display === 'none') {
      showModal(document.getElementById('title-screen'))
    } else {
      window.renderer.domElement.requestPointerLock() // will work only if no modals left
    }
  }
}
