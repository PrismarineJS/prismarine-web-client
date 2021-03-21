import { ClipboardHelper } from "./ClipboardHelper";
import InputMappings from "./utils/InputMappings";
import ScreenShotHelper from "./utils/ScreenShotHelper";

export default class KeyboardListener {
  constructor(minecraftIn) {
    this.mc = minecraftIn;
    this.clipboardHelper = new ClipboardHelper();
  }

  onKeyEvent(key, action, modifiers) {
    const iguieventlistener = this.mc.currentScreen;

    if(iguieventlistener !== null) {
      if(action != 1) {
        if(action == 0) iguieventlistener.keyReleased(key, modifiers);
      } else {
        iguieventlistener.keyPressed(key, modifiers);

        if(key == 'Escape') {
          
        }
      }
    }

    if(key == 'F2' && action == 0) {
      ScreenShotHelper.saveScreenshot(this.mc.mccanvas.canvas);
    }
  }

  getClipboardString() {
    return this.clipboardHelper.getClipboardString();
  }

  setClipboardString(string) {
    this.clipboardHelper.setClipboardString(string);
  }

  setupCallbacks() {
    InputMappings.setKeyCallbacks((key, action, modifiers) => {
      this.onKeyEvent(key, action, modifiers);
    })
  }
}