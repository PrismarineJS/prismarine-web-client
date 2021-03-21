import Widgets from "./Widgets";

export default class AbstractButton extends Widgets {
  constructor(x, y, width, height, title) {
    super(x, y, width, height, title);
  }

  onPress() {
  }

  onClick(mouseX, mouseY) {
    this.onPress();
  }

  keyPressed(key, modifiers) {
    if(this.active && this.visible && this.getIsHovered()) {
      if(key != 'Enter' && key != ' ') {
        return false;
      } else {
        this.onPress();
        return true;
      }
    } else return false;
  }
}