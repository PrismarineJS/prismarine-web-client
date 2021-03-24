import Minecraft, { renderer } from '../..'
import { ClipboardHelper } from './ClipboardHelper'
import InputMappings from './utils/InputMappings'
import ScreenShotHelper from './utils/ScreenShotHelper'

export default class KeyboardListener {
  /** @param {Minecraft} minecraftIn */
  constructor (minecraftIn) {
    this.mc = minecraftIn
    this.clipboardHelper = new ClipboardHelper()
  }

  onKeyEvent(key, code, action) {
    const iguieventlistener = this.mc.currentScreen;

    if (iguieventlistener != null) {
      if(action != 1) {
        if (action == 0) iguieventlistener.keyReleased(key)
      } else iguieventlistener.keyPressed(key);
    }

    if(action == 0) {
      if(key == 'F2') ScreenShotHelper.saveScreenshot(this.mc.mccanvas.canvas);

      if(this.mc.world != null && this.currentScreen == null) {
        if(key == 'F1') this.mc.gameSettings.hideGUI = !this.mc.gameSettings.hideGUI;  
        if(key == 'F3') this.mc.gameSettings.showDebugInfo = !this.mc.gameSettings.showDebugInfo;

       /*  if(key == 'Escape' && this.mc.currentScreen != null) {
          this.mc.displayGuiScreen(null);
          renderer.domElement.requestPointerLock()
        } */
      }

      if(this.mc.currentScreen == null && this.mc.loadingGui == null && this.mc.playerBot != null) {
        if(key == '1' || key == '2' || key == '3' || key == '4' || key == '5' || key == '6' || key == '7' || key == '8' || key == '9') {
          this.mc.playerBot.bot.setQuickBarSlot(Number(key) - 1);
        }

        // if(code == 'KeyQ') this.mc.playerBot.dropHeldItem();
      }
    }

    // if(!document.getElementById('chatbox').inChat && this.mc.currentScreen == null) this.mc.playerBot.updateBotControlsState(code, action);
  }

  getClipboardString () {
    return this.clipboardHelper.getClipboardString()
  }

  setClipboardString(string) {
    this.clipboardHelper.copyToClipboard(string)
  }

  setupCallbacks () {
    InputMappings.setKeyCallbacks((key, code, action) => {
      this.onKeyEvent(key, code, action)
    })
  }
}