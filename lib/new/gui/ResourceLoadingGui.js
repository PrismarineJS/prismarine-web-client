import Context2D from '../renderer/Context2D'

export default class ResourceLoadingGui {
  constructor(mcIn) {
    this.mc = mcIn;
  }

  render(mouseX, mouseY) {
    const width = this.mc.mccanvas.scaledWidth;
    const height = this.mc.mccanvas.scaledHeight;
    Context2D.fillRect(0, 0, width, height, 'rgb(120, 120, 120)');
  }
}
