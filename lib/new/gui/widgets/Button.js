import Widget from './Widget';

export default class Button extends Widget {
  constructor (x, y, width, height, title, onPressFunc) {
    super(x, y, width, height, title)
    this.onPressFunc = onPressFunc
  }

  onClick(mouseX, mouseY) {
    this.onPressFunc(this);
  }

  keyPressed(key) {
    if (this.active && this.visible && this.getIsHovered()) {
      if(key != 'Enter' && key != ' ') return false
      else {
        this.onPressFunc(this);
        return true
      }
    } else return false
  }
}
