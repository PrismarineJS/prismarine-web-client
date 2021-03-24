import { GUI_SCALE, HIDE_GUI, MOUSE_SENSIBILITY_X, MOUSE_SENSIBILITY_Y, RENDER_DISTANCE } from '../../GameOption'
import Context2D from '../../renderer/Context2D'
import Button from '../widgets/Button'
import GuiScreen from './GuiScreen'

export default class Options extends GuiScreen {
  constructor(prevScreen) {
    super()
    this.prevScreen = prevScreen;
  }

  init () {
    this.addButton(MOUSE_SENSIBILITY_X.createWidget(this.mc.gameSettings, this.width / 2 - 155, this.height / 4, 150));
    this.addButton(MOUSE_SENSIBILITY_Y.createWidget(this.mc.gameSettings, this.width / 2 + 5, this.height / 4, 150));
    this.addButton(GUI_SCALE.createWidget(this.mc.gameSettings, this.width / 2 - 155, this.height / 4 + 24, 150));
    this.addButton(RENDER_DISTANCE.createWidget(this.mc.gameSettings, this.width / 2 + 5, this.height / 4 + 24, 150));

    this.addButton(new Button(this.width / 2 - 155, this.height / 4 + 48, 150, 20, 'Language...', () => {
    })).active = false;

    this.addButton(new Button(this.width / 2 - 100, this.height / 4 + 120, 200, 20, 'Done', () => {
      this.mc.displayGuiScreen(this.prevScreen)
    }))
  }

  mouseClicked(mouseX, mouseY, button) {
    let guiScale = this.mc.gameSettings.guiScale;
    if(super.mouseClicked(mouseX, mouseY, button)) {
      if(this.mc.gameSettings.guiScale != guiScale) this.mc.updateWindowSize();
      return true;
    }
    return false;
  }

  render(mouseX, mouseY) {
    this.renderBackground();
    Context2D.drawCenteredText('Options', this.width / 2, 15);
    Context2D.drawText('F1 to Show/Hide Gui', this.width / 2 - 155, this.height / 4 + 78);
    Context2D.drawText('F2 to Take Screenshot', this.width / 2 - 155, this.height / 4 + 88);
    Context2D.drawText('F3 to Show/Hide Debug Overlay', this.width / 2 - 155, this.height / 4 + 98);
    super.render(mouseX, mouseY)
  }
}
