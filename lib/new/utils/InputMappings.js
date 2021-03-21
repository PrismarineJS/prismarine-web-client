let modifiers = {
  key: '',
  altKeyDown: false,
  altGrKeyDown: false,
  capsLockKeyDown: false,
  controlKeyDown: false,
  numLockKeyDown: false,
  shiftKeyDown: false
}

export default class InputMappings {
  static resetKeyBehavior(e, key) {
    if(e.key == key) e.preventDefault();
  }

  static isKeyDown(key) {
    if(key == 'Shift') {
      return modifiers.shiftKeyDown;
    } else if(key == 'Control') {
      return modifiers.controlKeyDown;
    } else if(key == 'Alt') {
      return modifiers.altKeyDown;
    } else {
      return key == modifiers.key;
    }
  }

  static setKeyCallbacks(keyCallback) {
    const handleKeyDown = (e) => {
      InputMappings.resetKeyBehavior(e, 'F3');
      InputMappings.resetKeyBehavior(e, 'F5');
      InputMappings.resetKeyBehavior(e, 'F7');
      InputMappings.resetKeyBehavior(e, 'F8');
      InputMappings.resetKeyBehavior(e, 'F11');
      InputMappings.resetKeyBehavior(e, 'Escape');
      InputMappings.resetKeyBehavior(e, 'Tab');

      keyCallback(e.key, 1, {
        altKeyDown: e.getModifierState('Alt'),
        altGrKeyDown: e.getModifierState('AltGraph'),
        capsLockKeyDown: e.getModifierState('CapsLock'),
        controlKeyDown: e.getModifierState('Control'),
        numLockKeyDown: e.getModifierState('NumLock'),
        shiftKeyDown: e.getModifierState('Shift')
      })
    }

    const handleKeyUp = (e) => {
      keyCallback(e.key, 0, {
        altKeyDown: e.getModifierState('Alt'),
        altGrKeyDown: e.getModifierState('AltGraph'),
        capsLockKeyDown: e.getModifierState('CapsLock'),
        controlKeyDown: e.getModifierState('Control'),
        numLockKeyDown: e.getModifierState('NumLock'),
        shiftKeyDown: e.getModifierState('Shift')
      })
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }

  static setMouseCallbacks(mouseMoveCallback, touchMoveCallback, mouseButtonCallback, touchCallback, scrollCallback) {
    const handleMouseMove = (e) => {
      mouseMoveCallback(e.clientX, e.clientY);
    }

    const handleMouseUp = (e) => {
      mouseButtonCallback(e.button, 0, {
        altKeyDown: e.getModifierState('Alt'),
        altGrKeyDown: e.getModifierState('AltGraph'),
        capsLockKeyDown: e.getModifierState('CapsLock'),
        controlKeyDown: e.getModifierState('Control'),
        numLockKeyDown: e.getModifierState('NumLock'),
        shiftKeyDown: e.getModifierState('Shift')
      })
    }

    const handleMouseDown = (e) => {
      mouseButtonCallback(e.button, 1, {
        altKeyDown: e.getModifierState('Alt'),
        altGrKeyDown: e.getModifierState('AltGraph'),
        capsLockKeyDown: e.getModifierState('CapsLock'),
        controlKeyDown: e.getModifierState('Control'),
        numLockKeyDown: e.getModifierState('NumLock'),
        shiftKeyDown: e.getModifierState('Shift')
      })
    }

    const handleTouchMove = (e) => {
      touchMoveCallback(event.touches[0].clientX, event.touches[0].clientY);
    }

    const handleTouchStart = (e) => {
      touchCallback(0, 0, {
        altKeyDown: e.getModifierState('Alt'),
        altGrKeyDown: e.getModifierState('AltGraph'),
        capsLockKeyDown: e.getModifierState('CapsLock'),
        controlKeyDown: e.getModifierState('Control'),
        numLockKeyDown: e.getModifierState('NumLock'),
        shiftKeyDown: e.getModifierState('Shift')
      })
    }

    const handleTouchEnd = (e) => {
      touchCallback(0, 1, {
        altKeyDown: e.getModifierState('Alt'),
        altGrKeyDown: e.getModifierState('AltGraph'),
        capsLockKeyDown: e.getModifierState('CapsLock'),
        controlKeyDown: e.getModifierState('Control'),
        numLockKeyDown: e.getModifierState('NumLock'),
        shiftKeyDown: e.getModifierState('Shift')
      })
    }

    const handleContextMenu = (e) => {
      e.preventDefault();
    }

    const handleScroll = (e) => {
      if(e.getModifierState('Control')) e.preventDefault();
      scrollCallback(e.deltaX, e.deltaY);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('wheel', handleScroll, { passive: false });
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