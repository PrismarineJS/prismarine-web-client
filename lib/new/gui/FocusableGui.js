import AbstractGui from './AbstractGui'

export default class FocusableGui extends AbstractGui {
  constructor () {
    super()
    this.listener = null
    this.isDragging = false
  }

  mouseMoved(xPos, yPos) {
    return false
  }

  isMouseOver(mouseX, mouseY) {
    return false
  }

  mouseDragged(mouseX, mouseY, button, dragX, dragY) {
    return this.listener != null && this.isDragging&& button == 0 ? this.listener.mouseDragged(mouseX, mouseY, button, dragX, dragY) : false
  }

  mouseClicked (mouseX, mouseY, button) {
    for (let i = 0; i < this.getEventListeners().length; i++) {
      const iguieventlistener = this.getEventListeners()[i]

      if (iguieventlistener.mouseClicked(mouseX, mouseY, button)) {
        this.listener = iguieventlistener;
        if (button == 0) this.isDragging = true;
        return true
      } else {
        this.listener = null;
        for (const listeners of this.getEventListeners()) {
          listeners.focused && listeners.changeFocus(false)
        }
      }
    }
  }

  mouseReleased (mouseX, mouseY, button) {
    this.isDragging = false;

    for (let i = 0; i < this.getEventListeners().length; i++) {
      const iguieventlistener = this.getEventListeners()[i]

      if (iguieventlistener.isMouseOver(mouseX, mouseY)) {
        iguieventlistener.mouseReleased(mouseX, mouseY, button)
        return true
      }
    }

    return false
  }

  keyPressed (key) {
    return this.listener != null && this.listener.keyPressed(key)
  }

  keyReleased (key) {
    return this.listener != null && this.listener.keyPressed(key)
  }

  changeFocus (focus) {
    const iguieventlistener = this.listener
    const flag = iguieventlistener != null

    if (flag && iguieventlistener.changeFocus(focus)) return true
    else {
      const list = this.getEventListeners()
      const j = list.indexOf(iguieventlistener)
      let i
      if (flag && j >= 0) i = j + (focus ? 1 : 0)
      else if (focus) i = 0
      else i = list.length;

      if(i >= list.length) i = 0;

      const iguieventlistener1 = list[i]
      if(iguieventlistener1.changeFocus(focus)) {
        this.listener = iguieventlistener1;
        return true
      }

      this.listener = null
      return false
    }
  }

  setFocusedDefault (eventListener) {
    this.listener = eventListener;
    eventListener !== null && eventListener.changeFocus(true)
  }

  getEventListeners () {
    return []
  }
}
