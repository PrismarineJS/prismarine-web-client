const { LitElement, html, css } = require('lit')

const colors = ['pink', 'blue', 'red', 'green', 'yellow', 'purple', 'white']
const divs = [0, 6, 10, 12, 20]
class BossBar extends LitElement {
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

  render () {
    return html`
        <div class="container">
            <div class="title" id="title"></div>
            <div class="bossbar" id="bossbar">
                <div class="fill" id="fill"></div>
                <div class="fill" id="div1"></div>
                <div class="fill" id="div2"></div>
            </div>
        </div>`
  }

  async init () {
    await super.getUpdateComplete()

    this.titleEl = this.shadowRoot.querySelector('#title')
    this.bossbarEl = this.shadowRoot.querySelector('#bossbar')
    this.fillEl = this.shadowRoot.querySelector('#fill')
    this.div1El = this.shadowRoot.querySelector('#div1')
    this.div2El = this.shadowRoot.querySelector('#div2')
  }

  setTitle (bar) {
    if (bar.title.text) this.titleEl.innerText = bar.title.text
    else if (bar.title.translate) {
      if (bar.title.translate === 'entity.minecraft.ender_dragon') {
        this.titleEl.innerText = 'Ender Dragon'
      } else if (bar.title.translate === 'entity.minecraft.wither') {
        this.titleEl.innerText = 'Wither'
      } else {
        this.titleEl.innerText = 'Unknown Entity'
      }
    }
  }

  setColor (bar) {
    this.bossbarEl.style.backgroundPositionY = `-${colors.indexOf(bar.color) * 10}px`
    this.fillEl.style.backgroundPositionY = `-${colors.indexOf(bar.color) * 10 + 5}px`
  }

  setProgress (bar) {
    this.fillEl.style.width = `${bar.health * 100}%`
    this.div2El.style.width = `${bar.health * 100}%`
  }

  setDiv (bar) {
    this.div1El.style.backgroundPositionY = `-${divs.indexOf(bar.dividers) * 10 + 70}px`
    this.div2El.style.backgroundPositionY = `-${divs.indexOf(bar.dividers) * 10 + 75}px`
  }

  updateBar (bar) {
    this.setColor(bar)
    this.setProgress(bar)
    this.setDiv(bar)
    this.setTitle(bar)
  }
}
window.customElements.define('pmui-bossbar', BossBar)

class BossBars extends LitElement {
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

  render () {
    return html`<div class="bossBars" id="bossBars"></div>`
  }

  init () {
    const e = this.shadowRoot.querySelector('#bossBars')
    const bossBars = new Map()

    this.bot.on('bossBarCreated', async (bossBar) => {
      const bar = document.createElement('pmui-bossbar')
      e.append(bar)
      await bar.init()

      bar.updateBar(bossBar)
      bossBars.set(bossBar.entityUUID, bar)
    })
    this.bot.on('bossBarUpdated', (bossBar) => {
      const bar = bossBars.get(bossBar.entityUUID)
      bar.updateBar(bossBar)
    })
    this.bot.on('bossBarDeleted', (bossBar) => {
      const bar = bossBars.get(bossBar.entityUUID)
      e.removeChild(bar)

      bossBars.delete(bossBar.entityUUID)
    })
  }
}

window.customElements.define('pmui-bossbars-overlay', BossBars)
