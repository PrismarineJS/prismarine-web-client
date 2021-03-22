import { renderer } from '../../../..'
import Context2D from '../../renderer/Context2D'
import Button from '../widgets/Button'
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
    this.addButton(new Button(this.width / 2 - 100, this.height / 3 + 20, 200, 20, 'Return to Game', () => {
      this.mc.displayGuiScreen(null);
      renderer.domElement.requestPointerLock()
    }))

    this.addButton(new Button(this.width / 2 - 100, this.height / 3 + 20 + 24, 98, 20, 'Options...', () => {
      this.mc.displayGuiScreen(new Options(this, this.mc.gameSettings))
    }))

    this.addButton(new Button(this.width / 2 - 100, this.height / 3 + 20 + 48, 200, 20, 'Disconnect', () => {
      this.mc.bot.emit('end', 'back to title');
    })).active = true
  }

  render (mouseX, mouseY) {
    this.renderBackground();

    Context2D.drawText('Game Menu', this.width / 2 - this.mc.mccanvas.canvas.getContext('2d').measureText('Game Menu').width / 2, 40);
    
    super.render(mouseX, mouseY)
  }
}