import InputMappings from "./utils/InputMappings.js";

export default class MouseHelper {
  constructor(minecraftIn) {
    this.minecraft = minecraftIn;
    this.mouseX = 0;
    this.mouseY = 0;
  }

  registerCallbacks() {
    InputMappings.setMouseCallbacks((xPos, yPos) => {
      this.cursorPosCallback(xPos, yPos)
    }, (xPos, yPos) => {
      this.cursorPosCallback(xPos, yPos)
    }, (button, action, modifiers) => {
      this.mouseButtonCallback(button, action)
    }, (button, action, modifiers) => {
      this.mouseButtonCallback(button, action)
    }, (xDelta, yDelta) => {
      this.scrollCallback(xDelta, yDelta);
    })
  }

  mouseButtonCallback(button, action) {
    if(this.minecraft.loadingGui == null) {
      const flag = action === 1;

      const btn = button;
  
      if(flag) {
        this.activeButton = btn;
      } else if(this.activeButton != -1) {
        this.activeButton = -1;
      }
  
      let aboolean = new Array([false, false])
      if(this.minecraft.currentScreen !== null) {
        let x = this.mouseX / this.minecraft.mccanvas.getGuiScaleFactor();
        let y = this.mouseY / this.minecraft.mccanvas.getGuiScaleFactor();
        
        if(flag) {
          aboolean[0] = this.minecraft.currentScreen.mouseClicked(x, y, btn);
    
        } else {
          aboolean[1] = this.minecraft.currentScreen.mouseReleased(x, y, btn);
        }
      }
    }
  }

  cursorPosCallback(xpos, ypos) {
    const iguieventlistener = this.minecraft.currentScreen;

    if(iguieventlistener !== null) {
      let x = xpos / this.minecraft.mccanvas.guiScale;
      let y = ypos / this.minecraft.mccanvas.guiScale;

      iguieventlistener.mouseMoved(x, y);

      if(this.activeButton !== -1) {  
        let x1 = (xpos - this.mouseX) * this.minecraft.mccanvas.guiScale;
        let y1 = (ypos - this.mouseY) * this.minecraft.mccanvas.guiScale;
        iguieventlistener.mouseDragged(x, y, this.activeButton, x1, y1);
      }
    }

    this.mouseX = xpos;
    this.mouseY = ypos;
  }

  getMouseX() {
    return this.mouseX;
  }

  getMouseY() {
    return this.mouseY;
  }
}