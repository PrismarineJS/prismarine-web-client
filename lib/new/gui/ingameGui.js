import Context2D from '../renderer/Context2D'
import Random from '../utils/math/Random';
import ResourceLocation from '../utils/ResourceLocation';
import AbstractGui from './AbstractGui';
import DebugOverlayGui from './overlay/DebugOverlayGui'
const invsprite = require('./../../invsprite.json')

const WIDGETS_TEX_PATH = new ResourceLocation("textures/gui/widgets.png");
const INV_SPRITE = new ResourceLocation("textures/item/invsprite.png");
const ICONS = new ResourceLocation("textures/gui/icons.png");
const rand = new Random();

export default class IngameGui extends AbstractGui {
  constructor (mcIn) {
    super();
    this.mc = mcIn;
    this.overlayDebug = new DebugOverlayGui(this.mc)
    this.lastSystemTime = 0;
    this.playerHealth = 0;
    this.lastPlayerHealth = 0;
    this.healthUpdateCounter = 0;

    this.scaledWidth = 0;
    this.scaledHeight = 0;
    this.ticks = 0;
  }

  renderIngameGui() {
    this.scaledWidth = this.mc.mccanvas.getScaledWidth();
    this.scaledHeight = this.mc.mccanvas.getScaledHeight();

    if(this.mc.gameSettings.showDebugInfo) {
      this.overlayDebug.render();
    }

    if(!this.mc.gameSettings.hideGUI) {
      this.renderCrosshair();

      this.renderHotbar();

      this.renderHealthFood();

      const i = this.scaledWidth / 2 - 91;
      this.renderXPBar(i);
    }
  }

  tick() {
    ++this.ticks;
  }

  renderCrosshair() {
    this.mc.getTextureManager().bindImage(ICONS);
    this.blit(this.scaledWidth / 2 - 8, this.scaledHeight / 2 - 8, 0, 0, 16, 16);
  }

  renderHotbar() {
    const playerBot = this.mc.playerBot;
    if (playerBot != null) {
      this.mc.getTextureManager().bindImage(WIDGETS_TEX_PATH);

      let i = this.scaledWidth / 2;
      let k = 182;
      let l = 91;

      this.blit(i - 91, this.scaledHeight - 22, 0, 0, 182, 22);
      this.blit(i - 91 - 1 + this.mc.bot.quickBarSlot * 20, this.scaledHeight - 22 - 1, 0, 22, 24, 22);

      this.mc.getTextureManager().bindImage(INV_SPRITE);
      for(let j = 0; j < 9; j++) {
        Context2D.setTransform(this.mc.mccanvas.getGuiScaleFactor() - 1.5, 0, 0, this.mc.mccanvas.getGuiScaleFactor() - 1.5, 0, 0);
        let f = i - 91 - 1 + j * 20;
        const item = playerBot.bot.inventory.slots[playerBot.bot.inventory.hotbarStart + j]
        const sprite = item ? invsprite[item.name] : invsprite.egg;
        this.blit(f * 2, (this.scaledHeight - 22 - 1) * 2, sprite.x * 2, sprite.x * 2, 32, 32);
        Context2D.setTransform(this.mc.mccanvas.getGuiScaleFactor(), 0, 0, this.mc.mccanvas.getGuiScaleFactor(), 0, 0);
      }
    }
  }

  renderXPBar(i) {
    this.mc.getTextureManager().bindImage(ICONS);

    let j = 182;
    let k = (this.mc.player.experience * 183);
    let l = this.scaledHeight - 32 + 3;
    this.blit(i, l, 0, 64, 182, 5);
    if (k > 0) {
       this.blit(i, l, 0, 69, k, 5);
    }

    if (this.mc.playerBot.experience > 0) {
      let level = `${this.mc.playerBot.experience}`;
      let i1 = (this.scaledWidth - this.mc.mccanvas.canvas.getContext('2d').measureText(level).width) / 2;
      let j1 = this.scaledHeight - 31 - 4 + 5;
      Context2D.drawText(level, i1, j1 - 1, 'black', false);
      Context2D.drawText(level, i1, j1 + 1, 'black', false);
      Context2D.drawText(level, i1 - 1, j1, 'black', false);
      Context2D.drawText(level, i1 + 1, j1, 'black', false);
      Context2D.drawText(level, i1, j1, 'rgb(128, 255, 32)', false);
    }
  }
  
  renderHealthFood() {
    const playerBot = this.mc.playerBot;
    const isHardcore = false;

    if(playerBot != null) {
      let i = Math.ceil(playerBot.getHealth());
      let flag = this.healthUpdateCounter > this.ticks && (this.healthUpdateCounter - this.ticks) / 3 % 2 == 1;
      let j = new Date().getMilliseconds();

      if (i < this.playerHealth) {
        this.lastSystemTime = j;
        this.healthUpdateCounter = this.ticks + 20;
      } else if (i > this.playerHealth) {
        this.lastSystemTime = j;
        this.healthUpdateCounter = this.ticks + 10;
      }

      if(j - this.lastSystemTime > 1000) {
        this.playerHealth = i;
        this.lastPlayerHealth = i;
        this.lastSystemTime = j;
      }

      this.playerHealth = i;
      let k = this.lastPlayerHealth;

      let i1 = this.scaledWidth / 2 - 91;
      let j1 = this.scaledWidth / 2 + 91;
      let k1 = this.scaledHeight - 39;

      let f = playerBot.getMaxHealth();
      let l = playerBot.getFoodLevel();
      // Absorption
      let l1 = 0;
      let i2 = Math.ceil((f + l1) / 2.0 / 10.0);
      let j2 = Math.max(10 - (i2 - 2), 3);
      let k2 = k1 - (i2 - 1) * j2 - 10;
      let l2 = k1 - 10;
      let i3 = l1;
      let k3 = -1;

      this.mc.getTextureManager().bindImage(ICONS);

      for(let l5 = Math.ceil((f + l1) / 2.0) - 1; l5 >= 0; --l5) {
        let i6 = 16;

        let j4 = 0;
        if(flag) {
          j4 = 1;
        }

        let k4 = Math.ceil((l5 + 1) / 10.0) - 1;
        let l4 = i1 + l5 % 10 * 8;
        let i5 = k1 - k4 * j2;
        if (i <= 4) {
           i5 += rand.nextInt(2);
        }

        if (i3 <= 0 && l5 == k3) {
           i5 -= 2;
        }

        let j5 = 0;
        if(isHardcore) {
          j5 = 5;
        }

        this.blit(l4, i5, 16 + j4 * 9, 9 * j5, 9, 9);
        if (flag) {
          if (l5 * 2 + 1 < k) {
            this.blit(l4, i5, i6 + 54, 9 * j5, 9, 9);
          }

          if (l5 * 2 + 1 == k) {
            this.blit(l4, i5, i6 + 63, 9 * j5, 9, 9);
          }
        }

        if (i3 > 0) {
           if (i3 == l1 && l1 % 2 == 1) {
            this.blit(l4, i5, i6 + 153, 9 * j5, 9, 9);
              --i3;
           } else {
            this.blit(l4, i5, i6 + 144, 9 * j5, 9, 9);
            i3 -= 2;
           }
        } else {
          if(l5 * 2 + 1 < i) {
            this.blit(l4, i5, i6 + 36, 9 * j5, 9, 9);
          }

           if(l5 * 2 + 1 == i) {
            this.blit(l4, i5, i6 + 45, 9 * j5, 9, 9);
          }
        }
      }

      for(let k6 = 0; k6 < 10; ++k6) {
        let i7 = k1;
        let k7 = 16;
        let i8 = 0;

        if (playerBot.getSaturationLevel() <= 0.0 && this.ticks % (l * 3 + 1) == 0) {
           i7 = k1 + (rand.nextInt(3) - 1);
        }

        let k8 = j1 - k6 * 8 - 9;
        this.blit(k8, i7, 16 + i8 * 9, 27, 9, 9);
        if (k6 * 2 + 1 < l) {
           this.blit(k8, i7, k7 + 36, 27, 9, 9);
        }

        if (k6 * 2 + 1 == l) {
           this.blit(k8, i7, k7 + 45, 27, 9, 9);
        }
     }

     l2 -= 10;
    }
  }

  reset() {}
}
