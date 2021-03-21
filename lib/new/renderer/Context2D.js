let context;
let backupImageSrc;
let imageSrc;

export default class Context2D {
  static setContext(canvasUsed) {
    context = canvasUsed;
  }

  static clear() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }

  static setup(scale, isPixelated) {
    Context2D.setAlpha(1);
    context.imageSmoothingEnabled = !isPixelated;
    context.setTransform(scale, 0, 0, scale, 0, 0);
  }

  static setTransform(scale0, a, b, scale1, c, d) {
    context.setTransform(scale0, a, b, scale1, c, d);
  }

  static fillRect(x, y, width, height, color) {
    if(color) context.fillStyle = ColorHelper.UnpackedColor.UnpackToRGBAColor(color);
    context.fillRect(x, y, width, height);
  }

  static drawImage(xUV, yUV, xUVSize, yUVSize, x, y, width, height) {
    if(imageSrc != null && imageSrc != undefined) context.drawImage(imageSrc, xUV, yUV, xUVSize, yUVSize, x, y, width, height);
  }

  static bindImage(imageSrcIn) {
    imageSrc = imageSrcIn;
  }

  static bindBackupImage(imageSrcIn) {
    backupImageSrc = imageSrcIn;
  }

  static compositionMod(mode) {
    if(mode == 'reset') context.globalCompositeOperation = 'source-over';
    context.globalCompositeOperation = mode;
  }

  static getImageData(x, y, width, height) {
    return context.getImageData(x, y, width, height)
  }

  static putImageData(src, x, y) {
    context.putImageData(src, x, y)
  }

  static getImageSrc() {
    return imageSrc;
  }

  static getBackupImageSrc() {
    return backupImageSrc;
  }

  static setAlpha(alpha) {
    context.globalAlpha = alpha;
  }

   static createTilePattern(tilesX, tilesY, tileXUV, tileYUV, tileWidth, tileHeight, hOffset, vOffset) {
    for(let i = 0; i < tilesX; i++) {
      for(let j = 0; j < tilesY; j++) {
        Context2D.drawImage(tileXUV, tileYUV, tileWidth, tileHeight, hOffset + i * tileWidth, vOffset + j * 16, tileWidth, tileHeight);
      }
    }
  }

  static block(callback) {
    context.save();
    callback();
    context.restore();
  }

  static rotateScale(angle, x, y, scale = 1) {
    context.translate(x, y);
    context.scale(scale, scale);
    context.rotate(angle);
    context.translate(-x, -y);
  }

  /** @deprecated */
  static drawText(text, x, y) {
    if(text !== null && text !== undefined) {
      context.font = 'normal 10px Arial';
      context.fillStyle = 'white';
      context.fillText(text, x, y);
    }
  }
}