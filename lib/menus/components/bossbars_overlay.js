const { LitElement, html, css } = require('lit')
const { styleMap } = require('lit/directives/style-map.js')

const colors = ['pink', 'blue', 'red', 'green', 'yellow', 'purple', 'white']
const divs = [0, 6, 10, 12, 20]
const translations = {
  'entity.minecraft.ender_dragon': 'Ender Dragon',
  'entity.minecraft.wither': 'Wither'
}
class BossBar extends LitElement {
  constructor (bar) {
    super()
    this.bar = bar
    this.title = ''
    this.progress = 0
    this.bossBarStyles = {}
    this.fillStyles = {}
    this.div1Styles = {}
    this.div2Styles = {}
  }

  static get styles () {
    return css`
      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .title {
        font-size: 7px;
        color: #fff;
      }
      .bossbar {
        background-image: url("textures/1.18.1/gui/bars.png");
        width: 182px;
        height: 5px;
        position: relative;
      }
      .bossbar .fill {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        height: 5px;
        width: 0;
        background-image: url("textures/1.18.1/gui/bars.png");
      }`
  }

  static get properties () {
    return {
      bar: { type: Object }
    }
  }

  render () {
    this.updateBar(this.bar)

    return html`
        <div class="container">
            <div class="title">${this.title}</div>
            <div class="bossbar" style=${styleMap(this.bossBarStyles)}>
                <div class="fill" style=${styleMap(this.fillStyles)}></div>
                <div class="fill" style=${styleMap(this.div1Styles)}></div>
                <div class="fill" style=${styleMap(this.div2Styles)}></div>
            </div>
        </div>`
  }

  setTitle (bar) {
    if (bar._title.text) this.title = bar._title.text
    else this.title = translations[this._title.translate] || 'Unkown Entity'
  }

  setColor (bar) {
    this.bossBarStyles.backgroundPositionY = `-${colors.indexOf(bar._color) * 10}px`
    this.fillStyles.backgroundPositionY = `-${colors.indexOf(bar._color) * 10 + 5}px`
  }

  setProgress (bar) {
    this.fillStyles.width = `${bar._health * 100}%`
    this.div2Styles.width = `${bar._health * 100}%`
  }

  setDiv (bar) {
    this.div1Styles.backgroundPositionY = `-${divs.indexOf(bar._dividers) * 10 + 70}px`
    this.div2Styles.backgroundPositionY = `-${divs.indexOf(bar._dividers) * 10 + 75}px`
  }

  updateBar (bar) {
    this.setTitle(bar)
    this.setColor(bar)
    this.setDiv(bar)
    this.setProgress(bar)
  }
}

class BossBars extends LitElement {
  constructor () {
    super()
    this.bossBars = new Map()
  }

  static get styles () {
    return css`
      .bossBars {
        display: flex;
        flex-direction: column;
        gap: 5px;
        position: absolute;
        top: 9px;
        left: 50%;
        transform: translate(-50%);
      }`
  }

  static get properties () {
    return {
      bossBars: { type: Map }
    }
  }

  render () {
    return html`<div class="bossBars" id="bossBars">
        ${[...this.bossBars.values()]}
    </div>`
  }

  init () {
    this.bot.on('bossBarCreated', async (bossBar) => {
      this.bossBars.set(bossBar.entityUUID, new BossBar(bossBar))
      this.requestUpdate()
    })
    this.bot.on('bossBarUpdated', (bossBar) => {
      const bar = this.bossBars.get(bossBar.entityUUID)
      bar.bar = bossBar
      bar.requestUpdate()
    })
    this.bot.on('bossBarDeleted', (bossBar) => {
      this.bossBars.delete(bossBar.entityUUID)
      this.requestUpdate()
    })
  }
}

window.customElements.define('pmui-bossbars-overlay', BossBars)
window.customElements.define('pmui-bossbar', BossBar)
