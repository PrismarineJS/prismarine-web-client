import Context2D from "../../renderer/Context2D";
import Button from "../widgets/Button";
import GuiScreen from "./GuiScreen";
import MainMenuScreen from "./MainMenuScreen";

export default class WorldLoading extends GuiScreen {
  constructor() {
    super();
    this.status = '';
    this.backBtn;
  }

  init() {
    this.backBtn = this.addButton(new Button(this.width / 2 - 100, this.height / 4 + 40, 200, 20, 'Back To Title', () => {
      this.mc.displayGuiScreen(new MainMenuScreen());
    }))

    this.backBtn.visible = false;
    this.backBtn.active = false;
  }

  render(mouseX, mouseY) {
    this.renderDirtBackground(0);
    Context2D.drawText(this.status, this.width / 2 - this.mc.mccanvas.canvas.getContext('2d').measureText(this.status).width / 2, this.height / 4);
    super.render(mouseX, mouseY);
  }

  setStatus(text) {
    this.status = text;

    if(this.status == 'You have been disconnected from the server. Please reload the page to rejoin' ||
    this.status == 'The Minecraft server kicked you. Please reload the page to rejoin' || this.status == 'Error encountered. Please reload the page') {
      this.backBtn.visible = true;
      this.backBtn.active = false;
    }
  }
}