import { renderer } from "../../../..";
import Context2D from "../../renderer/Context2D";
import Button from "../widgets/Button";
import GuiScreen from "./GuiScreen";
import Options from "./OptionsScreen";

export default class IngameMenu extends GuiScreen {
  constructor() {
    super();
  }

  shouldCloseOnEsc() {
    return false;
  }

  init() {
    this.addButton(new Button(this.width / 2 - 100, this.height / 3 + 20, 200, 20, 'Return to Game', () => {
      this.mc.currentScreen = null;
      renderer.domElement.requestPointerLock();
    }));

    this.addButton(new Button(this.width / 2 - 100, this.height / 3 + 20 + 24, 98, 20, 'Options...', () => {
      this.mc.displayGuiScreen(new Options(this, this.mc.gameSettings));
    }));

    this.addButton(new Button(this.width / 2 - 100, this.height / 3 + 20 + 48, 200, 20, 'Disconnect', () => {
      this.mc.bot.quit();
    })).active = false;
  }

  render(mouseX, mouseY) {
    Context2D.setAlpha(0.4);
    Context2D.fillRect(0, 0, this.width, this.height);
    Context2D.setAlpha(1);

    super.render(mouseX, mouseY);
  }
}