import Context2D from '../renderer/Context2D'
import ResourceLocation from '../utils/ResourceLocation'

const MOJANG_LOGO_TEXTURE = new ResourceLocation('textures/gui/title/mojangstudios.png')

export default class ResourceLoadingGui {
  constructor (mcIn) {
    this.mc = mcIn
    this.fadeOutStart = -1
    this.fadeInStart = -1
  }

  render (mouseX, mouseY) {
    const width = this.mc.mccanvas.getScaledWidth()
    const height = this.mc.mccanvas.getScaledHeight()

    Context2D.fillRect(0, 0, width, height)

    // const mojangLogoTexture = this.mc.getTextureManager().getTexture(MOJANG_LOGO_TEXTURE);
  }
}
