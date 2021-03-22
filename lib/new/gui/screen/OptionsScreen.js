import { HIDE_GUI } from '../../GameOption'
import Context2D from '../../renderer/Context2D'
import Button from '../widgets/Button'
import GuiScreen from './GuiScreen'

export default class Options extends GuiScreen {
  constructor (prevScreen, settings) {
    super()
    this.prevScreen = prevScreen
    this.settings = settings
  }

  init () {
    this.addButton(HIDE_GUI.createWidget(this.settings, this.width / 2 - 155, this.height / 4, 150));

    this.addButton(new Button(this.width / 2 - 100, this.height / 4 + 120, 200, 20, 'Done', () => {
      this.mc.displayGuiScreen(this.prevScreen)
    }))
  }

  render (mouseX, mouseY) {
    this.renderBackground();

    Context2D.drawText('Options', this.width / 2 - this.mc.mccanvas.canvas.getContext('2d').measureText('Options').width / 2, 15);
    Context2D.drawText('Or use F1 ingame', this.width / 2 - 155, this.height / 4 + 32);

    super.render(mouseX, mouseY)
  }
}
