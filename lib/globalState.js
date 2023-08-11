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

export const hideModal = (modal = activeModalStack.slice(-1)[0], data, postActions) => {
  if (modal) {
    const cancel = modal.hide?.(data)
    if (!cancel || cancel === customDisplayManageKeyword) {
      if (cancel !== customDisplayManageKeyword) modal.style.display = 'none'
      activeModalStack.pop()
      const newModal = activeModalStack.slice(-1)[0]
      if (newModal) {
        // would be great to ignore cancel I guess?
        showModalInner(newModal)
      }
      postActions?.()
    }
  } else {
    document.exitPointerLock()
  }
}

export const hideCurrentModal = () => {
  // todo this might be tricky
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', })) // trigger handler in index.js
}
