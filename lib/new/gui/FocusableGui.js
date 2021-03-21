import AbstractGui from "./AbstractGui";

export default class FocusableGui extends AbstractGui {
  constructor() {
    super();
    this.listener = null;
    this.isDragging = false;
  }

  mouseMoved(xPos, yPos) {
    return false;
  }

  isMouseOver(mouseX, mouseY) {
    return false
  }

  mouseDragged(mouseX, mouseY, button, dragX, dragY) {
    return this.getListener() != null && this.getIsDragging() && button == 0 ? this.getListener().mouseDragged(mouseX, mouseY, button, dragX, dragY) : false;
  }

  mouseClicked(mouseX, mouseY, button) {
    for(let i = 0; i < this.getEventListeners().length; i++) {
      const iguieventlistener = this.getEventListeners()[i];

      if(iguieventlistener.mouseClicked(mouseX, mouseY, button)) {
        this.setListener(iguieventlistener);
        if(button == 0) this.setDragging(true);
        return true;
      } else {
        this.setListener(null)
        for(let listeners of this.getEventListeners()) {
          listeners.isFocused() && listeners.changeFocus(false);
        }
      }
    }
  }

  mouseReleased(mouseX, mouseY, button) {
    this.setDragging(false)
    
    for(let i = 0; i < this.getEventListeners().length; i++) {
      const iguieventlistener = this.getEventListeners()[i];

      if(iguieventlistener.isMouseOver(mouseX, mouseY)) {
        iguieventlistener.mouseReleased(mouseX, mouseY, button);
        return true;
      }
    }

    return false;
  }

  keyPressed(key, modifiers) {
    return this.getListener() != null && this.getListener().keyPressed(key, modifiers);
  }

  keyReleased(key, modifiers) {
    return this.getListener() != null && this.getListener().keyPressed(key, modifiers);;
  }

  changeFocus(focus) {
    let iguieventlistener = this.getListener()
    let flag = iguieventlistener != null

    if (flag && iguieventlistener.changeFocus(focus)) {
      return true;
   } else {
      let list = this.getEventListeners();
      let j = list.indexOf(iguieventlistener);
      let i;
      if(flag && j >= 0) {
        i = j + (focus ? 1 : 0);
      } else if(focus) {
        i = 0;
      } else {
        i = list.length;
      }

      if(i >= list.length) {
        i = 0;
      }

      let iguieventlistener1 = list[i];
      if(iguieventlistener1.changeFocus(focus)) {
        this.setListener(iguieventlistener1);
        return true;
      }

      this.setListener(null)
      return false
    }
  }

  setDragging(dragging) {
    this.isDragging = dragging;
  }

  setListener(listener) {
    this.listener = listener;
  }

  setFocusedDefault(eventListener) {
    this.setListener(eventListener);
    eventListener !== null && eventListener.changeFocus(true);
  }

  setListenerDefault(eventListener) {
    this.setListener(eventListener);
  }

  getEventListeners() {
    return [];
  }

  getIsDragging() {
    return this.isDragging;
  }

  getListener() {
    return this.listener;
  }
}