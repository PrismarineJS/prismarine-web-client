const { LitElement, html, css } = require('lit')

class DebugOverlay extends LitElement {
  static get styles () {
    return css`
      .debug-left-side,
      .debug-right-side {
        position: absolute;
        display: flex;
        flex-direction: column;
        z-index: 40;
      }

      .debug-left-side {
        top: 1px;
        left: 1px;
      }

      .debug-right-side {
        top: 1px;
        right: 1px;
      }

      p {
        display: block;
        color: white;
        font-size: 10px;
        width: fit-content;
        height: 9px;
        margin: 0;
        padding: 0;
        padding-bottom: 1px;
        background: rgba(110, 110, 110, 0.5);
      }

      .debug-right-side p {
        margin-left: auto;
      }

      .empty {
        display: block;
        height: 9px;
      }
    `
  }

  static get properties () {
    return {
      showOverlay: { type: Boolean },
      cursorBlock: { type: Object },
      bot: { type: Object },
      customEntries: { type: Object }
    }
  }

  constructor () {
    super()
    this.showOverlay = false
    this.customEntries = {}
  }

  firstUpdated () {
    document.addEventListener('keydown', e => {
      e ??= window.event
      if (e.key === 'F3') {
        this.showOverlay = !this.showOverlay
        e.preventDefault()
      }
    })
  }

  updated (changedProperties) {
    if (changedProperties.has('bot')) {
      this.bot.on('move', () => {
        this.requestUpdate()
      })
      this.bot.on('time', () => {
        this.requestUpdate()
      })
      this.bot.on('entitySpawn', () => {
        this.requestUpdate()
      })
      this.bot.on('entityGone', () => {
        this.requestUpdate()
      })
    }
  }

  render () {
    if (!this.showOverlay) {
      return html``
    }

    const target = this.cursorBlock
    const targetDiggable = (target && this.bot.canDigBlock(target))

    const pos = this.bot.entity.position
    const rot = [this.bot.entity.yaw, this.bot.entity.pitch]

    const viewDegToMinecraft = (yaw) => yaw % 360 - 180 * (yaw < 0 ? -1 : 1)

    const quadsDescription = [
      'north (towards negative Z)',
      'east (towards positive X)',
      'south (towards positive Z)',
      'west (towards negative X)'
    ]

    const minecraftYaw = viewDegToMinecraft(rot[0] * -180 / Math.PI)
    const minecraftQuad = Math.floor(((minecraftYaw + 180) / 90 + 0.5) % 4)

    const renderProp = (name, value) => {
      return html`<p>${name}: ${typeof value === 'boolean' ? html`<span style="color: ${value ? 'lightgreen' : 'red'}">${value}</span>` : value}</p>`
    }

    const skyL = this.bot.world.getSkyLight(this.bot.entity.position)
    const biomeId = this.bot.world.getBiome(this.bot.entity.position)

    return html`
      <div class="debug-left-side">
        <p>Prismarine Web Client (${this.bot.version})</p>
        <p>E: ${Object.values(this.bot.entities).length}</p>
        <p>${this.bot.game.dimension}</p>
        <div class="empty"></div>
        <p>XYZ: ${pos.x.toFixed(3)} / ${pos.y.toFixed(3)} / ${pos.z.toFixed(3)}</p>
        <p>Chunk: ${Math.floor(pos.x % 16)} ~ ${Math.floor(pos.z % 16)} in ${Math.floor(pos.x / 16)} ~ ${Math.floor(pos.z / 16)}</p>
        <p>Facing (viewer): ${rot[0].toFixed(3)} ${rot[1].toFixed(3)}</p>
        <p>Facing (minecraft): ${quadsDescription[minecraftQuad]} (${minecraftYaw.toFixed(1)} ${(rot[1] * -180 / Math.PI).toFixed(1)})</p>
        <p>Light: ${skyL} (${skyL} sky)</p>
        <p>Biome: minecraft:${window.mcData.biomesArray[biomeId].name}</p>
        <p>Day: ${this.bot.time.day}</p>
        <div class="empty"></div>
        ${Object.entries(this.customEntries).map(([name, value]) => html`<p>${name}: ${value}</p>`)}
      </div>

      <div class="debug-right-side">
        <p>Renderer: three.js r${global.THREE.REVISION}</p>
        <div class="empty"></div>
        ${targetDiggable ? html`<p>${target.name}</p>${Object.entries(target.getProperties()).map(([n, p], idx, arr) => renderProp(n, p, arr[idx + 1]))}` : ''}
        ${targetDiggable ? html`<p>Looking at: ${target.position.x} ${target.position.y} ${target.position.z}</p>` : ''}
      </div>
    `
  }
}

window.customElements.define('pmui-debug-overlay', DebugOverlay)
