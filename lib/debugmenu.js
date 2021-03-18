const { LitElement, html, css } = require('lit-element')

class DebugMenu extends LitElement {
  constructor () {
    super()

    this.isOpen = false
    this.customEntries = {}
  }

  firstUpdated () {
    document.addEventListener('keydown', e => {
      e ??= window.event
      if (e.key === 'F3') {
        this.isOpen = !this.isOpen
        e.preventDefault()
      }
    })
  }

  static get styles () {
    return css`
        .debugmenu-wrapper {
            position: fixed;
            z-index:25;
        }

        .debugmenu {
            overflow: hidden;
            color: white;
            font-size: 16px;
            margin: 0px;
            line-height: 100%;
            text-shadow: 2px 2px 0px #3f3f3f;
            font-family: mojangles, minecraft, monospace;
            width: calc(320px * 4);
            max-height: calc(90px * 8);
            top: calc(8px * 16);
            padding: 4px;
        }

        .debugmenu p {
            margin: 0px;
            padding: 1px;
            width: fit-content;
            background-color: rgba(0, 0, 0, 0.5);
        }
    `
  }

  static get properties () {
    return {
      isOpen: { type: Boolean },
      cursorBlock: { type: Object },
      bot: { type: Object },
      customEntries: { type: Object }

    }
  }

  updated (changedProperties) {
    if (changedProperties.has('bot')) {
      this.bot.on('move', () => {
        this.requestUpdate()
      })
    }
  }

  render () {
    if (!this.isOpen) {
      return html``
    }

    const target = this.cursorBlock
    const targetDiggable = (target && this.bot.canDigBlock(target))

    const pos = this.bot.entity.position
    const rot = [this.bot.entity.yaw, this.bot.entity.pitch]

    const viewDegToMinecraft = (yaw) => {
      return yaw % 360 - 180 * (yaw < 0 ? -1 : 1)
    }

    const quadsDescription = [
      'north (towards negative Z)',
      'east (towards positive X)',
      'south (towards positive Z)',
      'west (towards negative X)'
    ]

    const minecraftYaw = viewDegToMinecraft(rot[0] * -180 / Math.PI)
    const minecraftQuad = Math.floor(((minecraftYaw + 180) / 90 + 0.5) % 4)

    const renderProp = (name, value, nextItem) => {
      return html`${name}: ${typeof value === 'boolean'
        ? html`<span style="color: ${value ? 'lightgreen' : 'red'}">${value}</span>`
        : value}${nextItem ? ' / ' : ''}`
    }

    return html`
    <div id="debugmenu-wrapper" class="debugmenu-wrapper">
      <div class="debugmenu" id="debugmenu">
        <p id="debug-entry-renderer">Renderer: three.js r${global.THREE.REVISION}</p>
        </br>
        <p>XYZ: ${pos.x.toFixed(3)} / ${pos.y.toFixed(3)} / ${pos.z.toFixed(3)}</p>
        <p>Chunk: ${Math.floor(pos.x % 16)} ~ ${Math.floor(pos.z % 16)} in ${Math.floor(pos.x / 16)} ~ ${Math.floor(pos.z / 16)}</p>
        <p>Facing (viewer): ${rot[0].toFixed(3)} ${rot[1].toFixed(3)}</p>
        <p>Facing (minecraft): ${quadsDescription[minecraftQuad]} (${minecraftYaw.toFixed(1)} ${(rot[1] * -180 / Math.PI).toFixed(1)})</p>
        ${targetDiggable ? html`<p>Looking at: ${target.position.x} ${target.position.y} ${target.position.z}</p>` : ''}
        ${targetDiggable ? html`<p>${target.name} | ${Object.entries(target.getProperties()).map(([n, p], idx, arr) => renderProp(n, p, arr[idx + 1]))}</p>` : ''}<br>
        ${Object.entries(this.customEntries).map(([name, value]) => html`<p>${name}: ${value}</p>`)}
      </div>
    </div>
    `
  }
}

window.customElements.define('debug-menu', DebugMenu)
