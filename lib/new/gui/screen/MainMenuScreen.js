import ResourceLocation from '../../utils/ResourceLocation'
import Context2D from '../../renderer/Context2D'
import Button from '../widgets/Button'
import GuiScreen from './GuiScreen'
import Options from './OptionsScreen'
import { removePanorama } from '../../../..'
import ConnectScreen from './ConnectScreen'

const ACCESSIBILITY_TEXTURES = new ResourceLocation('textures/gui/accessibility.png')
const MINECRAFT_TITLE_TEXTURES = new ResourceLocation('textures/gui/title/minecraft.png')
const MINECRAFT_TITLE_EDITION = new ResourceLocation('textures/gui/title/edition.png')
const INV_SPRITE = new ResourceLocation("textures/item/invsprite.png");

export default class MainMenuScreen extends GuiScreen {
  constructor (fade = false) {
    super()
    this.showFadeAnim = fade
    this.firstRenderTime = 0
    this.showTitleWronglySpelled = Number(Math.random().toFixed(1)) < 1.0E-1
    this.splashText = ''
  }

  init() {
    if (this.splashText === '') this.splashText = this.mc.getSplashes().getSplashText()

    this.addButton(new Button(this.width / 2 - 100, this.height / 2 - 10, 200, 20, 'Show Form', () => {
      removePanorama();
      document.getElementById('prismarine-menu').style.display = 'block'
      this.mc.main()
      this.mc.displayGuiScreen(new ConnectScreen(this));
    }))

    this.addButton(new Button(this.width / 2 - 100, this.height / 2 - 10 + 24, 98, 20, 'Options...', () => {
      this.mc.displayGuiScreen(new Options(this, this.mc.gameSettings))
    }))
  }

  render (mouseX, mouseY) {
    if (this.firstRenderTime === 0 && this.showFadeInAnimation) {
      this.firstRenderTime = new Date().getMilliseconds()
    }

    const alpha = this.showFadeInAnimation ? (new Date().getMilliseconds() - this.firstRenderTime) / 1000 : 1
    if (alpha < 0) this.showFadeInAnimation = false
    const fadeAlpha = this.showFadeInAnimation ? alpha : 1

    if (this.showFadeInAnimation) Context2D.setAlpha(fadeAlpha)
    else Context2D.setAlpha(1)

    const s = 'Prismarine Web Client'
    Context2D.drawText(s, 2, this.height - 2)

    const baseX = ~~(this.width / 2 - 137)

    this.mc.getTextureManager().bindImage(MINECRAFT_TITLE_TEXTURES)
    if (this.showTitleWronglySpelled) {
      this.blitOutline(baseX, 30, (width, height) => {
        this.blit(width + 0, height, 0, 0, 99, 44)
        this.blit(width + 99, height, 129, 0, 27, 44)
        this.blit(width + 99 + 26, height, 126, 0, 3, 44)
        this.blit(width + 99 + 26 + 3, height, 99, 0, 26, 44)
        this.blit(width + 155, height, 0, 45, 155, 44)
      })
    } else {
      this.blitOutline(baseX, 30, (width, height) => {
        this.blit(width + 0, height, 0, 0, 155, 44)
        this.blit(width + 155, height, 0, 45, 155, 44)
      })
    }

    this.mc.getTextureManager().bindImage(MINECRAFT_TITLE_EDITION)
    this.blit(baseX + 88, 67, 0, 0, 98, 14)

    const splash = { x: baseX + 220, y: 62, width: this.mc.mccanvas.canvas.getContext('2d').measureText(this.splashText).width, height: 9 }

    Context2D.block(() => {
      const miliT = new Date().getMilliseconds()
      let f2 = 1.5 - Math.abs(Math.sin((miliT % 1000) / 1000.0 * (Math.PI * 2)) * 0.1)
      f2 = f2 * 100.0 / (this.mc.mccanvas.canvas.getContext('2d').measureText(this.splashText).width + 32)

      Context2D.rotateScale(-20 * Math.PI / 180, splash.x, splash.y, f2)
      Context2D.drawText(this.splashText, splash.x, splash.y, 'rgb(255, 255, 0)');
    })

    super.render(mouseX, mouseY)

    // this.mc.getTextureManager().bindImage(INV_SPRITE);
    // Context2D.setTransform(2, 0, 0, 2, 0, 0);
    // this.blit(32, 32, 32, 32, 32, 32);
    // Context2D.setTransform(this.mc.mccanvas.getGuiScaleFactor(), 0, 0, this.mc.mccanvas.getGuiScaleFactor(), 0, 0);
  }

  shouldCloseOnEsc () {
    return false
  }
}
