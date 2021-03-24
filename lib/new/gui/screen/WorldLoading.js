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
    Context2D.drawCenteredText(this.status, this.width / 2, this.height / 4);
    super.render(mouseX, mouseY);
  }

  setStatus(text) {
    this.status = text;

    if(text == 'You have been disconnected from the server. Please reload the page to rejoin' ||
    text == 'The Minecraft server kicked you. Please reload the page to rejoin' || text == 'Error encountered. Please reload the page') {
      this.backBtn.visible = true;
    }

    if(text == 'Done!') {
      const showEl = (str) => { document.getElementById(str).style = 'display:block' }

      setTimeout(() => {
        this.mc.currentScreen = null;

        showEl('chatbox')
        showEl('playerlist')
      }, 2500)
    }
  }

  shouldCloseOnEsc() {
    return false;
  }
}