const modifiers = {
  key: '',
  altKeyDown: false,
  altGrKeyDown: false,
  capsLockKeyDown: false,
  controlKeyDown: false,
  numLockKeyDown: false,
  shiftKeyDown: false
}

export default class InputMappings {
  static resetKeyBehavior (e, key) {
    if(e.key == key) e.preventDefault();
  }

  static isKeyDown (key) {
    if (key == 'Shift') return modifiers.shiftKeyDown;
    else if (key == 'Control') return modifiers.controlKeyDown;
    else if (key == 'Alt') return modifiers.altKeyDown;
    else return key == modifiers.key;
  }

  static setKeyCallbacks (keyCallback) {
    /** @param {KeyboardEvent} e */
    const handleKeyDown = (e) => {
      InputMappings.resetKeyBehavior(e, 'F1')
      InputMappings.resetKeyBehavior(e, 'F3')
      InputMappings.resetKeyBehavior(e, 'F5')
      InputMappings.resetKeyBehavior(e, 'F7')
      InputMappings.resetKeyBehavior(e, 'F8')
      InputMappings.resetKeyBehavior(e, 'F11')
      InputMappings.resetKeyBehavior(e, 'Escape')
      InputMappings.resetKeyBehavior(e, 'Tab')

      keyCallback(e.key, e.code, 1)
    }

    const handleKeyUp = (e) => {
      keyCallback(e.key, e.code, 0)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  }

  static setMouseCallbacks (mouseMoveCallback, mouseButtonCallback, touchCallback, scrollCallback) {
    /** @param {MouseEvent} e */
    const handleMouseMove = (e) => {
      mouseMoveCallback(e.clientX, e.clientY, null, e.movementX, e.movementY);
    }

    const handleMouseUp = (e) => {
      mouseButtonCallback(e.button, 0)
    }

    const handleMouseDown = (e) => {
      mouseButtonCallback(e.button, 1)
    }

    /** @param {TouchEvent} e */
    const handleTouchMove = (e) => {
      window.scrollTo(0, 0);
      e.preventDefault();
      e.stopPropagation();
      mouseMoveCallback(e.touches[0].clientX, e.touches[1].clientX, e.touches, e.touches[0].pageX - lastTouch.pageX, e.touches[0].pageY - lastTouch.pageY);
    }

    const handleTouchStart = (e) => {
      touchCallback(0, 0)
    }

    const handleTouchEnd = (e) => {
      touchCallback(0, 1)
    }

    const handleContextMenu = (e) => {
      e.preventDefault()
    }

    const handleScroll = (e) => {
      if(e.getModifierState('Control')) e.preventDefault()
      scrollCallback(e.deltaX, e.deltaY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp, false)
    window.addEventListener('touchend', handleTouchEnd)
    window.addEventListener('touchcancel', handleTouchEnd)
    window.addEventListener('mousedown', handleMouseDown, false)
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('wheel', handleScroll, { passive: false })
  }
}

window.addEventListener('keydown', (e) => {
  modifiers.key = e.key,
  modifiers.altKeyDown = e.getModifierState('Alt'),
  modifiers.altGrKeyDown = e.getModifierState('AltGraph'),
  modifiers.capsLockKeyDown = e.getModifierState('CapsLock'),
  modifiers.controlKeyDown = e.getModifierState('Control'),
  modifiers.numLockKeyDown = e.getModifierState('NumLock'),
  modifiers.shiftKeyDown = e.getModifierState('Shift')
})

window.addEventListener('keyup', (e) => {
  modifiers.key = e.key,
  modifiers.altKeyDown = e.getModifierState('Alt'),
  modifiers.altGrKeyDown = e.getModifierState('AltGraph'),
  modifiers.capsLockKeyDown = e.getModifierState('CapsLock'),
  modifiers.controlKeyDown = e.getModifierState('Control'),
  modifiers.numLockKeyDown = e.getModifierState('NumLock'),
  modifiers.shiftKeyDown = e.getModifierState('Shift')
})
