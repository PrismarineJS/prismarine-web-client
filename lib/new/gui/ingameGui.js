import PlayerBot from '../PlayerBot';
import Context2D from '../renderer/Context2D'
import ResourceLocation from '../utils/ResourceLocation';
import AbstractGui from './AbstractGui';
import DebugOverlayGui from './overlay/DebugOverlayGui'
const invsprite = require('./../../invsprite.json')

const WIDGETS_TEX_PATH = new ResourceLocation("textures/1.16.4/gui/widgets.png");
// const INV_SPRITE = 'invsprite.png';
const ICONS = new ResourceLocation("textures/1.16.4/gui/icons.png");

export default class IngameGui extends AbstractGui {
  constructor (mcIn) {
    super();
    this.mc = mcIn;
    this.overlayDebug = new DebugOverlayGui(this.mc);
    this.lastSystemTime = 0;
    this.playerHealth = 0;
    this.lastPlayerHealth = 0;
    this.healthUpdateCounter = 0;

    this.scaledWidth = 0;
    this.scaledHeight = 0;
    this.ticks = 0;
  }

  renderIngameGui() {
    this.scaledWidth = this.mc.mccanvas.scaledWidth;
    this.scaledHeight = this.mc.mccanvas.scaledHeight;

    if(this.mc.gameSettings.showDebugInfo) this.overlayDebug.render();

    if(!this.mc.gameSettings.hideGUI) {
      this.renderCrosshair();
      this.renderHotbar();
      this.renderHealthFood();
      this.renderXPBar();
    }
  }

  tick() {
    ++this.ticks;
  }

  renderCrosshair() {
    this.mc.textureManager.bindImage(ICONS);
    this.blit(this.scaledWidth / 2 - 8, this.scaledHeight / 2 - 8, 0, 0, 16, 16);
  }

  renderHotbar() {
    const playerBot = this.mc.playerBot;
    if (playerBot != null) {
      this.mc.textureManager.bindImage(WIDGETS_TEX_PATH);

      let i = this.scaledWidth / 2;
      this.blit(i - 91, this.scaledHeight - 22, 0, 0, 182, 22);
      this.blit(i - 91 - 1 + this.mc.playerBot.bot.quickBarSlot * 20, this.scaledHeight - 22 - 1, 0, 22, 24, 22);

      /* this.mc.getTextureManager().bindImage(INV_SPRITE);
      for(let j = 0; j < 9; j++) {
        Context2D.setTransform(this.mc.mccanvas.getGuiScaleFactor() - 1.5, 0, 0, this.mc.mccanvas.getGuiScaleFactor() - 1.5, 0, 0);
        let f = i - 91 - 1 + j * 20;
        const item = playerBot.bot.inventory.slots[playerBot.bot.inventory.hotbarStart + j]
        const sprite = item ? invsprite[item.name] : invsprite.egg;
        this.blit(f * 2, (this.scaledHeight - 22 - 1) * 2, sprite.x * 2, sprite.x * 2, 32, 32);
        Context2D.setTransform(this.mc.mccanvas.getGuiScaleFactor(), 0, 0, this.mc.mccanvas.getGuiScaleFactor(), 0, 0);
      } */
    }
  }

  renderXPBar() {
    this.mc.textureManager.bindImage(ICONS);

    let i = this.scaledWidth / 2 - 91;
    let k = (this.mc.playerBot.bot.experience * 183);
    let l = this.scaledHeight - 32 + 3;
    this.blit(i, l, 0, 64, 182, 5);
    if(k > 0) this.blit(i, l, 0, 69, k, 5);

    if(this.mc.playerBot.experience > 0) {
      let level = `${this.mc.playerBot.experience}`;
      let i1 = this.scaledWidth / 2;
      let j1 = this.scaledHeight - 31 - 4 + 7;
      Context2D.drawCenteredText(level, i1, j1 - 1, 'black', false);
      Context2D.drawCenteredText(level, i1, j1 + 1, 'black', false);
      Context2D.drawCenteredText(level, i1 - 1, j1, 'black', false);
      Context2D.drawCenteredText(level, i1 + 1, j1, 'black', false);
      Context2D.drawCenteredText(level, i1, j1, 'rgb(128, 255, 32)', false);
    }
  }
  
  renderHealthFood() {
    /** @type {PlayerBot}  */
    const playerBot = this.mc.playerBot;

    if(playerBot != null) {
      let i = Math.ceil(playerBot.health);
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

      let f = playerBot.maxHealth;
      let l = playerBot.foodLevel;
      let l1 = 0; // Absorption
      let i2 = Math.ceil((f + l1) / 2.0 / 10.0);
      let j2 = Math.max(10 - (i2 - 2), 3);
      let i3 = l1;
      let k3 = -1;

      this.mc.textureManager.bindImage(ICONS);

      for(let l5 = Math.ceil((f + l1) / 2.0) - 1; l5 >= 0; --l5) {
        let i6 = 16;

        let j4 = 0;
        if(flag) j4 = 1;

        let k4 = Math.ceil((l5 + 1) / 10.0) - 1;
        let l4 = i1 + l5 % 10 * 8;
        let i5 = k1 - k4 * j2;
        if(i <= 4) i5 += Math.round(Math.random() * 2);

        if(i3 <= 0 && l5 == k3) i5 -= 2;

        this.blit(l4, i5, 16 + j4 * 9, 0, 9, 9);
        if(flag) {
          if(l5 * 2 + 1 < k) this.blit(l4, i5, i6 + 54, 0, 9, 9);
          if(l5 * 2 + 1 == k) this.blit(l4, i5, i6 + 63, 0, 9, 9);
        }

        if(i3 > 0) {
          if (i3 == l1 && l1 % 2 == 1) {
          this.blit(l4, i5, i6 + 153, 0, 9, 9);
            --i3;
          } else {
            this.blit(l4, i5, i6 + 144, 0, 9, 9);
            i3 -= 2;
          }
        } else {
          if(l5 * 2 + 1 < i) this.blit(l4, i5, i6 + 36, 0, 9, 9);
          if(l5 * 2 + 1 == i) this.blit(l4, i5, i6 + 45, 0, 9, 9);
        }
      }

      for(let k6 = 0; k6 < 10; ++k6) {
        let i7 = k1;
        let k7 = 16;
        let i8 = 0;

        if(playerBot.foodSaturationLevel <= 0.0 && this.ticks % (l * 3 + 1) == 0) i7 = k1 + (Math.round(Math.random() * 3) - 1);

        let k8 = j1 - k6 * 8 - 9;
        this.blit(k8, i7, 16 + i8 * 9, 27, 9, 9);
        if(k6 * 2 + 1 < l) this.blit(k8, i7, k7 + 36, 27, 9, 9);
        if(k6 * 2 + 1 == l) this.blit(k8, i7, k7 + 45, 27, 9, 9);
      }
    }
  }
}
