import Minecraft from '../../..';
import MainMenuScreen from '../gui/screen/MainMenuScreen';
import Context2D from './Context2D'

export default class TextureManager {
  /** @param {Minecraft} mcIn */
  constructor(mcIn) {
    this.mc = mcIn;
    this.imagesPath = []
    this.mapImageObjects = {}
  }

  async reload() {
    this.mapImageObjects = {}

    if(this.mc.currentScreen != null && this.mc.currentScreen instanceof MainMenuScreen) this.mc.currentScreen.preload();
  }

  async bindImage(resource) {
    const image = this.mapImageObjects[resource.getFullPath()]

    if (image == undefined) {
      Context2D.bindImage(null)
      await this.loadImage(resource)
    } else Context2D.bindImage(image)
  }

  async loadImage (resource) {
    const res = await fetch(resource.getFullPath())
    const data = await res.blob()

    const image = new Image()
    image.src = URL.createObjectURL(data)

    return Promise.resolve(this.mapImageObjects[resource.getFullPath()] = image)
  }

  getImagesMap () {
    return this.mapImageObjects
  }

  async getTexture(resource) {
    const image = this.mapImageObjects[resource.getFullPath()]

    if (image == undefined) await this.loadImage(resource)
    else return image
  }
}
