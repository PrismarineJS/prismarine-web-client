import Context2D from "./renderer/Context2D";

export class MCCanvas {
  constructor(mc) {
    this.mc = mc;

    this.canvas;
    if(document.getElementById('mccanvas')) {
      this.canvas = document.getElementById('canvas');
    } else {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'mccanvas'; 
      document.body.appendChild(this.canvas);
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0px';
      this.canvas.style.left = '0px';
    }

    Context2D.setContext(this.canvas.getContext('2d'));
    
    this.scaledWidth = 0;
    this.scaledHeight = 0;
    this.guiScaleFactor = 0;

    this.updateCanvas();

    window.addEventListener('resize', () => this.onWindowSizeUpdate());
  }

  onWindowSizeUpdate() {
    this.mc.updateWindowSize();
  }

  updateCanvas() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  update() {
    this.updateCanvas();
    this.mc.updateWindowSize();
  }

  calcGuiScale(guiScaleIn) {
    let i;
    for(i = 1; i != guiScaleIn && i < window.innerWidth && i < (window.innerHeight + 40) && window.innerWidth / (i + 1) >= 320 && (window.innerHeight + 40) / (i + 1) >= 240; ++i) {
    }

    return i;
  }

  setGuiScale(scaleFactor) {
    this.guiScaleFactor = scaleFactor;
    const i = ~~(window.innerWidth / scaleFactor);
    this.scaledWidth = i;
    const j = ~~(window.innerHeight / scaleFactor);
    this.scaledHeight = j;
  }

  getGuiScaleFactor() {
    return this.guiScaleFactor;
  }

  getScaledWidth() {
    return ~~this.scaledWidth;
  }

  getScaledHeight() {
    return ~~this.scaledHeight;
  }
}