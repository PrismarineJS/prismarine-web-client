import { renderer } from '../../../..'
import Context2D from '../../renderer/Context2D'
import Button from '../widgets/Button'
import { ConfirmOpenLinkScreen } from './ConfirmOpenLinkScreen'
import GuiScreen from './GuiScreen'
import Options from './OptionsScreen'

export default class IngameMenu extends GuiScreen {
  constructor () {
    super()
  }

  shouldCloseOnEsc() {
    return false
  }

  init () {
    this.addButton(new Button(this.width / 2 - 102, this.height / 4 + 24 + -16, 204, 20, 'Return to Game', () => {
      this.mc.displayGuiScreen(null);
      renderer.domElement.requestPointerLock()
    }));

    this.addButton(new Button(this.width / 2 - 102, this.height / 4 + 48 + -16, 98, 20, 'Discord', () => {
      this.mc.displayGuiScreen(new ConfirmOpenLinkScreen((wasConfirmed) => {
        if(wasConfirmed) {
          window.open("https://discord.gg/4Ucm684Fq3");
        }
        this.mc.displayGuiScreen(this);
      }, "https://discord.gg/4Ucm684Fq3", true));
    }));

    this.addButton(new Button(this.width / 2 + 4, this.height / 4 + 48 + -16, 98, 20, 'Github', () => {
      this.mc.displayGuiScreen(new ConfirmOpenLinkScreen((wasConfirmed) => {
        if(wasConfirmed) {
          window.open("https://github.com/PrismarineJS/prismarine-web-client");
        }
        this.mc.displayGuiScreen(this);
     }, "https://github.com/PrismarineJS/prismarine-web-client", true));
    }));

    this.addButton(new Button(this.width / 2 - 102, this.height / 4 + 96 + -16, 98, 20, 'Options...', () => {
      this.mc.displayGuiScreen(new Options(this, this.mc.gameSettings))
    }));

    this.addButton(new Button(this.width / 2 - 102, this.height / 4 + 120 + -16, 204, 20, 'Disconnect', () => {
      this.mc.playerBot.bot.emit('end', 'back to title');
    })).active = false
  }

  render (mouseX, mouseY) {
    this.renderBackground();
    Context2D.drawCenteredText('Game Menu', this.width / 2, 40);
    super.render(mouseX, mouseY)
  }
}