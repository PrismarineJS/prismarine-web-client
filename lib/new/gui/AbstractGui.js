import Context2D from "../renderer/Context2D";

export default class AbstractGui {
  constructor() {}

  blit(x, y, xUV, yUV, width, height) {
    Context2D.drawImage(xUV, yUV, width, height, x, y, width, height);
  }

  blitOutline(width, height,  boxXYConsumer) {
    boxXYConsumer(width + 1, height);
    boxXYConsumer(width - 1, height);
    boxXYConsumer(width, height + 1);
    boxXYConsumer(width, height - 1);

    boxXYConsumer(width, height);
  }

  createBuffer(bufferWidth, bufferHeight, draw) {
    const ctx = (document.createElement('canvas')).getContext('2d');

    ctx.canvas.width = bufferWidth;
    ctx.canvas.height = bufferHeight;

    ctx.save();
    draw(ctx);
    ctx.restore();

    return ctx.canvas;
  }
}