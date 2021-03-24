import ResourceLocation from '../../utils/ResourceLocation'
import Context2D from '../../renderer/Context2D'
import Button from '../widgets/Button'
import GuiScreen from './GuiScreen'
import Options from './OptionsScreen'
import ConnectScreen from './ConnectScreen'
import { ConfirmOpenLinkScreen } from './ConfirmOpenLinkScreen'

const MINECRAFT_TITLE_TEXTURES = new ResourceLocation('textures/1.16.4/gui/title/minecraft.png')
const MINECRAFT_TITLE_EDITION = new ResourceLocation('textures/1.16.4/gui/title/edition.png')
const WIDGETS = new ResourceLocation('textures/1.16.4/gui/widgets.png');
const OPTIONS_BACKGROUND = new ResourceLocation('textures/1.16.4/gui/options_background.png');

export default class MainMenuScreen extends GuiScreen {
  constructor (fade = false) {
    super()
    this.showFadeAnim = fade
    this.firstRenderTime = 0
    this.showTitleWronglySpelled = Number(Math.random().toFixed(1)) < 1.0E-1
    this.splashText = ''
  }

  shouldCloseOnEsc () {
    return false
  }

  preload() {
    this.mc.textureManager.loadImage(WIDGETS);
    this.mc.textureManager.loadImage(OPTIONS_BACKGROUND);
    this.mc.textureManager.loadImage(MINECRAFT_TITLE_TEXTURES);
    this.mc.textureManager.loadImage(MINECRAFT_TITLE_EDITION);
  }

  init() {
    if (this.splashText === '') this.splashText = this.mc.splashes.getSplashText();

    this.addButton(new Button(this.width / 2 - 100, this.height / 2 - 10, 200, 20, 'Show Form', () => {
      document.getElementById('prismarine-menu').style.display = 'block'
      this.mc.main()
      this.mc.displayGuiScreen(new ConnectScreen(this));
    }))

    this.addButton(new Button(this.width / 2 - 100, this.height / 2 - 10 + 24, 200, 20, 'Options...', () => {
      this.mc.displayGuiScreen(new Options(this, this.mc.gameSettings))
    }));

    this.addButton(new Button(this.width / 2 - 100, this.height / 2 - 10 + 48, 98, 20, 'Discord', () => {
      this.mc.displayGuiScreen(new ConfirmOpenLinkScreen((wasConfirmed) => {
        if(wasConfirmed) {
          window.open("https://discord.gg/4Ucm684Fq3");
        }
        this.mc.displayGuiScreen(this);
      }, "https://discord.gg/4Ucm684Fq3", true));
    }));

    this.addButton(new Button(this.width / 2 + 2, this.height / 2 - 10 + 48, 98, 20, 'Github', () => {
      this.mc.displayGuiScreen(new ConfirmOpenLinkScreen((wasConfirmed) => {
        if(wasConfirmed) {
          window.open("https://github.com/PrismarineJS/prismarine-web-client");
        }
        this.mc.displayGuiScreen(this);
     }, "https://github.com/PrismarineJS/prismarine-web-client", true));
    }));
  }

  render(mouseX, mouseY) {
    Context2D.fillRect(0, 0, this.width + 1, this.height + 1, 'rgba(0, 0, 0, 0.3)');

    if(this.firstRenderTime === 0 && this.showFadeInAnimation) {
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

    this.mc.textureManager.bindImage(MINECRAFT_TITLE_TEXTURES)
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

    this.mc.textureManager.bindImage(MINECRAFT_TITLE_EDITION)
    this.blit(baseX + 88, 67, 0, 0, 98, 14)

    const splashWidth = Context2D.getContext().measureText(this.splashText).width;

    Context2D.block(() => {
      const miliT = new Date().getMilliseconds()
      let f2 = 1.5 - Math.abs(Math.sin((miliT % 1000) / 1000.0 * (Math.PI * 2)) * 0.1)
      f2 = f2 * 100.0 / (splashWidth + 32)

      Context2D.rotateScale(-20 * Math.PI / 180, baseX + 247, 59, f2)
      Context2D.drawText(this.splashText, baseX + 247 - splashWidth / 2, 59 - 9 / 2, 'rgb(255, 255, 0)');
    })

    super.render(mouseX, mouseY)
  }
}
