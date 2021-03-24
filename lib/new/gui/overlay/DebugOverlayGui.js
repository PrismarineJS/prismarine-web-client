import Context2D from '../../renderer/Context2D'
import AbstractGui from '../AbstractGui'

const quadsDescription = [
  'north (towards negative Z)',
  'east (towards positive X)',
  'south (towards positive Z)',
  'west (towards negative X)'
];

/* 
const renderProp = (name, value, nextItem) => {
  return html`${name}: ${typeof value === 'boolean'
    ? html`<span style="color: ${value ? 'lightgreen' : 'red'}">${value}</span>`
    : value}${nextItem ? ' / ' : ''}`
}


 ${targetDiggable ? html`<p>${target.name} | ${Object.entries(target.getProperties()).map(([n, p], idx, arr) => renderProp(n, p, arr[idx + 1]))}</p>` : ''}<br>
${Object.entries(this.customEntries).map(([name, value]) => html`<p>${name}: ${value}</p>`)}
*/

export default class DebugOverlayGui extends AbstractGui {
  constructor(mc) {
    super();
    this.mc = mc;
    this.ctx = Context2D.getContext();

    this.pos = { x: 0, y: 0, y: 0 };
    this.rot = [0, 0];

    this.target = {};
    this.targetDiggable = false;
  }

  render() {
    const playerBot = this.mc.playerBot.bot;

    this.target = playerBot.blockAtCursor();
    this.targetDiggable = (this.target && playerBot.canDigBlock(this.target))

    this.pos = playerBot.entity.position;
    this.rot = [playerBot.entity.yaw, playerBot.entity.pitch];

    const minecraftYaw = this.viewDegToMinecraft(this.rot[0] * -180 / Math.PI)
    const minecraftQuad = Math.floor(((minecraftYaw + 180) / 90 + 0.5) % 4)

    this.createLine(`Prismarine Web Client(${playerBot.version})`, 1, 1);
    this.createLine(`Renderer: three.js r${global.THREE.REVISION}`, 1, 15);
    this.createLine(`XYZ: ${this.pos.x.toFixed(3)} / ${this.pos.y.toFixed(3)} / ${this.pos.z.toFixed(3)}`, 1, 41);
    this.createLine(`Chunk: ${Math.floor(this.pos.x % 16)} ~ ${Math.floor(this.pos.z % 16)} in ${Math.floor(this.pos.x / 16)} ~ ${Math.floor(this.pos.z / 16)}`, 1, 55);
    this.createLine(`Facing (viewer): ${this.rot[0].toFixed(3)} ${this.rot[1].toFixed(3)}`, 1, 43 + 26);
    this.createLine(`Facing (minecraft): ${quadsDescription[minecraftQuad]} (${minecraftYaw.toFixed(1)} ${(this.rot[1] * -180 / Math.PI).toFixed(1)})`, 1, 83);

    if(this.targetDiggable) {
      this.createLine(`Looking at: ${this.target.position.x} ${this.target.position.y} ${this.target.position.z}`, 1, 97);
      this.createLine(`${this.target.name}`, 1, 111);
    }
  }

  createLine(text, x, y) {
    Context2D.fillRect(x, y, this.ctx.measureText(text).width + 4, 12, 'rgba(0, 0, 0, 0.3)');
    Context2D.drawText(text, x, y + 10);
  }

  viewDegToMinecraft(yaw) {
    return yaw % 360 - 180 * (yaw < 0 ? -1 : 1)
  }
}