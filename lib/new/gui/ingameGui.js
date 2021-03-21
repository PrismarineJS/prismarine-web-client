import Context2D from "../renderer/Context2D";

export default class IngameGui {
  constructor(mcIn) {
    this.mc = mcIn;
  }

  renderIngameGui() {
    Context2D.drawText('IngameGui is rendering', 2, 6);
  }

  reset() {}
}