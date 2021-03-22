import Minecraft from '../..'
import { ClipboardHelper } from './ClipboardHelper'
import InputMappings from './utils/InputMappings'
import ScreenShotHelper from './utils/ScreenShotHelper'

export default class KeyboardListener {
  /** @param {Minecraft} minecraftIn */
  constructor (minecraftIn) {
    this.mc = minecraftIn
    this.clipboardHelper = new ClipboardHelper()
  }

  onKeyEvent (key, action, modifiers) {
    const iguieventlistener = this.mc.currentScreen

    if (iguieventlistener !== null) {
      if (action != 1) {
        if (action == 0) iguieventlistener.keyReleased(key, modifiers)
      } else {
        iguieventlistener.keyPressed(key, modifiers)
      }
    }

    if(action == 0) {
      if (key == 'F2') {
        ScreenShotHelper.saveScreenshot(this.mc.mccanvas.canvas)
      }

      if(key == 'F1' && this.mc.isInsideWorld) {
        this.mc.gameSettings.hideGUI = !this.mc.gameSettings.hideGUI;
      }

      if(key == 'F3' && this.mc.isInsideWorld) {
        this.mc.gameSettings.showDebugInfo = !this.mc.gameSettings.showDebugInfo;
      }

      if(this.mc.currentScreen == null && this.mc.loadingGui == null) {
        if(key == '1' || key == '2' || key == '3' || key == '4' || key == '5' || key == '6' || key == '7' || key == '8' || key == '9') {
          this.mc.playerBot.bot.setQuickBarSlot(Number(key) - 1);
        }
      }
    }
  }

  getClipboardString () {
    return this.clipboardHelper.getClipboardString()
  }

  setClipboardString (string) {
    this.clipboardHelper.setClipboardString(string)
  }

  setupCallbacks () {
    InputMappings.setKeyCallbacks((key, action, modifiers) => {
      this.onKeyEvent(key, action, modifiers)
    })
  }
}