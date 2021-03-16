const { LitElement, html, css } = require('lit-element')

class DebugMenuEntry {
  constructor (text, hidden, breaking) {
    this.text = text
    this.hidden = hidden
    this.breaking = breaking
  }
}

class DebugMenu extends LitElement {
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
      debugEntries: { type: Object }
    }
  }

  render () {
    return html`
    <div id="debugmenu-wrapper" class="debugmenu-wrapper">
      <div class="debugmenu" id="debugmenu" style="display: none;">
        <p id="debug-entry-renderer">Renderer: three.js r${global.THREE.REVISION}</p>
        </br>
        ${Object.entries(this.debugEntries).map(([id, entry]) => html`
          <p id="debug-entry-${id}" style="display:${entry.hidden ? 'none' : 'block'}">${entry.text}</p>${entry.breaking ? html`<br>` : ''}
        `)}
      </div>
    </div>
    `
  }

  constructor () {
    super()

    this.debugEntries = {}
  }

  /**
   * Creates debug menu entry
   *
   * @param  {string} text - Text to render
   * @param  {boolean} [breaking=false] - Adds a line break after the entry if set to true (useful if you want to separate a section from everything else)
   * @return {number} Debug entry id - keep it somewhere to update entry contents later!
   */
  addEntry (text, breaking = false) {
    const currentIds = Object.keys(this.debugEntries)
    const id = parseInt(currentIds[currentIds.length - 1] ?? -1) + 1

    this.debugEntries[id] = new DebugMenuEntry(text, false, breaking)

    this.requestUpdate()
    return id
  }

  /**
   * Updates entry contents
   *
   * @param  {number} id - Debug entry id (returned with addEntry())
   * @param  {string} text - Text to render
   * @return {boolean} true if successfully updated, false otherwise (if entry doesn't exist)
   */
  updateEntry (id, text) {
    if (this.debugEntries[id] !== undefined) {
      this.debugEntries[id].text = text

      if (this.isOpen) this.requestUpdate() // This will make performance comparisons easier should something go wrong
      return true
    }

    return false
  }

  /**
   * Sets entry visibility
   *
   * @param  {number} id - Debug entry id (returned with addEntry())
   * @param  {boolean} [shouldRender=true] - set to false if you want to hide the entry
   * @return {boolean|undefined} current visibility or undefined if entry doesn't exist
   */
  setEntryVisible (id, shouldRender = true) {
    if (this.debugEntries[id] !== undefined) {
      this.debugEntries[id].hidden = !shouldRender

      this.requestUpdate()
      return this.debugEntries[id].hidden
    }
  }

  /**
   * Returns entry internals
   *
   * @param  {number} id - Debug entry id (returned with addEntry())
   * @return {DebugEntry} Debug entry internals
   */
  getEntry (id) {
    return this.debugEntries[id] ?? null
  }

  /**
   * Completely removes debug entry (you won't be able to update it afterwards!)
   *
   * @param  {number} id - Debug entry id (returned with addEntry())
   * @return {boolean} true if element existed and was successfully annihilated, false otherwise
   */
  removeEntry (id) {
    if (this.debugEntries[id]) {
      delete this.debugEntries[id]

      this.requestUpdate()
      return true
    }

    return false
  }

  init (bot) {
    const debugMenu = this.shadowRoot.querySelector('#debugmenu')
    this.isOpen = false

    const showMenu = (shouldShow = true) => {
      debugMenu.style.display = shouldShow ? 'block' : 'none'
      this.isOpen = shouldShow
    }

    document.addEventListener('keydown', e => {
      e ??= window.event
      if (e.key === 'F3') {
        showMenu(!this.isOpen)

        this.requestUpdate()
        e.preventDefault()
      }
    })

    const viewDegToMinecraft = (yaw) => {
      return yaw % 360 - 180 * (yaw < 0 ? -1 : 1)
    }

    const quadsDescription = [
      'north (towards negative Z)',
      'east (towards positive X)',
      'south (towards positive Z)',
      'west (towards negative X)'
    ]

    const positionEntry = this.addEntry('XYZ: 0 / 0 / 0')
    const chunkEntry = this.addEntry('Chunk: 0 0 0 in 0 0 0')
    const rotationEntryV = this.addEntry('Facing (viewer): 0 0')
    const rotationEntryM = this.addEntry('Facing (minecraft): 0 0')
    const targetBlockEntry = this.addEntry('Looking at: 0 0 0', true)

    bot.on('move', () => {
      const pos = bot.entity.position
      const rot = [bot.entity.yaw, bot.entity.pitch]

      const minecraftYaw = viewDegToMinecraft(rot[0] * -180 / Math.PI)
      const minecraftQuad = Math.floor(((minecraftYaw + 180) / 90 + 0.5) % 4)

      const target = bot.blockAtCursor() // TODO: We should probably make a public property somewhere to not raycast it from every module
      const targetDiggable = (target && bot.canDigBlock(target))

      this.updateEntry(positionEntry, `XYZ: ${pos.x.toFixed(3)} / ${pos.y.toFixed(3)} / ${pos.z.toFixed(3)}`)
      this.updateEntry(chunkEntry, `Chunk: ${Math.floor(pos.x % 16)} ~ ${Math.floor(pos.z % 16)} in ${Math.floor(pos.x / 16)} ~ ${Math.floor(pos.z / 16)}`)

      this.updateEntry(rotationEntryV, `Facing (viewer): ${rot[0].toFixed(3)} ${rot[1].toFixed(3)}`)
      this.updateEntry(rotationEntryM, `Facing (minecraft): ${quadsDescription[minecraftQuad]} (${minecraftYaw.toFixed(1)} ${(rot[1] * -180 / Math.PI).toFixed(1)})`)

      if (targetDiggable) {
        if (this.getEntry(targetBlockEntry).hidden) this.setEntryVisible(targetBlockEntry, true)

        this.updateEntry(targetBlockEntry, `Looking at: ${target.position.x} ${target.position.y} ${target.position.z}`)
      } else if (!targetDiggable && !this.getEntry(targetBlockEntry).hidden) {
        this.setEntryVisible(targetBlockEntry, false)
      }
    })
  }
}

window.customElements.define('debug-menu', DebugMenu)
