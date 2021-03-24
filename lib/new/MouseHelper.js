import Minecraft, { viewer, renderer } from '../../index.js'
import IngameMenu from './gui/screen/IngameMenu.js'
import InputMappings from './utils/InputMappings.js'

export default class MouseHelper {
  /** @param {Minecraft} minecraftIn */
  constructor (minecraftIn) {
    this.minecraft = minecraftIn
    this.mouseX = 0
    this.mouseY = 0
    this.lastTouch;
    this.activeButton;
  }

  registerCallbacks () {
    InputMappings.setMouseCallbacks((xPos, yPos, touches, movementX, movementY) => {
      this.cursorPosCallback(xPos, yPos, movementX, movementY);
    }, (button, action) => {
      this.mouseButtonCallback(button, action)
    }, (button, action) => {
      this.mouseButtonCallback(button, action)
    }, (xDelta, yDelta) => {
      this.scrollCallback(xDelta, yDelta)
    })
  }

  mouseButtonCallback(button, action) {
    if (this.minecraft.loadingGui == null) {
      const flag = action === 1

      const btn = button

      if(flag) {
        this.activeButton = btn
      } else if (this.activeButton != -1) {
        this.activeButton = -1
      }

      const aboolean = new Array([false, false])
      if (this.minecraft.currentScreen !== null) {
        const x = this.mouseX / this.minecraft.mccanvas.guiScaleFactor
        const y = this.mouseY / this.minecraft.mccanvas.guiScaleFactor

        if(flag) {
          aboolean[0] = this.minecraft.currentScreen.mouseClicked(x, y, btn)
        } else {
          aboolean[1] = this.minecraft.currentScreen.mouseReleased(x, y, btn)
        }
      } else if(this.minecraft.currentScreen == null && this.minecraft.playerBot != null) {
        /* this.minecraft.playerBot.placeBlockInWorld();

        if(flag) this.minecraft.playerBot.digBlockInWorld();
        else this.minecraft.playerBot.stopDigging(); */
      }
    }

    /* if(!(document.pointerLockElement === renderer.domElement ||
      document.mozPointerLockElement === renderer.domElement ||
      document.webkitPointerLockElement === renderer.domElement)) {
      this.minecraft.displayGuiScreen(new IngameMenu());
    } */
  }

  cursorPosCallback(xpos, ypos, touches, xMovement, yMovement) {
    const iguieventlistener = this.minecraft.currentScreen;

    if(iguieventlistener !== null) {
      const x = xpos / this.minecraft.mccanvas.guiScaleFactor;
      const y = ypos / this.minecraft.mccanvas.guiScaleFactor;

      iguieventlistener.mouseMoved(x, y)

      if (this.activeButton !== -1) {
        const x1 = (xpos - this.mouseX) * this.minecraft.mccanvas.guiScaleFactor
        const y1 = (ypos - this.mouseY) * this.minecraft.mccanvas.guiScaleFactor
        iguieventlistener.mouseDragged(x, y, this.activeButton, x1, y1)
      }
    }

   /*  if(this.minecraft.world != null) {
      if(this.minecraft.playerBot != null && this.minecraft.currentScreen == null) {
        this.minecraft.playerBot.updateBotMovement({ movementX: xMovement, movementY: yMovement });
        viewer.setFirstPersonCamera(null, this.minecraft.playerBot.bot.entity.yaw, this.minecraft.playerBot.bot.entity.pitch)
        this.minecraft.playerBot.updateCursor();
      }
    } */

    this.mouseX = xpos;
    this.mouseY = ypos;
  }

  scrollCallback(xDelta, yDelta) {
    if(this.minecraft.loadingGui == null) {
      if(this.minecraft.currentScreen != null) {

      } else if(this.minecraft.playerBot != null) {
        this.minecraft.playerBot.bot.setQuickBarSlot(((this.minecraft.playerBot.bot.quickBarSlot + Math.sign(yDelta)) % 9 + 9) % 9);
      }
    }
  }
}
