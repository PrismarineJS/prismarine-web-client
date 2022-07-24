const { LitElement, html, css } = require('lit')

const colors = ['pink', 'blue', 'red', 'green', 'yellow', 'purple', 'white']
const divs = [0, 6, 10, 12, 20]
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
      }
      
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
    return html`<div class="bossBars" id="bossBars"></div>`
  }

  setColor(bar) {
    bar.bar.style.backgroundPositionY = `-${colors.indexOf(bar.bossBar.color) * 10}px`
    bar.fill.style.backgroundPositionY = `-${colors.indexOf(bar.bossBar.color) * 10 + 5}px`
  }
  setDiv(bar) {
    bar.div1.style.backgroundPositionY = `-${divs.indexOf(bar.bossBar.dividers) * 10 + 70}px`
    bar.div2.style.backgroundPositionY = `-${divs.indexOf(bar.bossBar.dividers) * 10 + 75}px`
  }
  setProgress(bar) {
    bar.fill.style.width = `${bar.bossBar.health * 100}%`
    bar.div2.style.width = `${bar.bossBar.health * 100}%`
  }
  setTitle(bar) {
    if (bar.bossBar.title.text) bar.title.innerText = bar.bossBar.title.text
    else if (bar.bossBar.title.translate) {
      if (bar.bossBar.title.translate === "entity.minecraft.ender_dragon")
        bar.title.innerText = "Ender Dragon"
      else if (bar.bossBar.title.translate === "entity.minecraft.wither")
        bar.title.innerText = "Wither"
      else
        bar.title.innerText = "Unknown Entity"
    }
  }
  updateBar(bar) {
    this.setColor(bar);
    this.setProgress(bar);
    this.setDiv(bar);
    this.setTitle(bar);
  }

  init() {
    const e = this.shadowRoot.querySelector('#bossBars')
    const bossBars = new Map()

    this.bot.on('bossBarCreated', (bossBar) => {
      const container = document.createElement('div')
      container.classList.add('container')

      const title = document.createElement('div')
      title.classList.add('title')

      const bar = document.createElement("div")
      bar.classList.add("bossbar")
      const fill = document.createElement("div")
      fill.classList.add("fill")
      const div1 = document.createElement("div")
      div1.classList.add("fill")
      div1.style.width = "100%"
      const div2 = document.createElement("div")
      div2.classList.add("fill")
      bar.append(fill, div1, div2)
      container.append(title, bar)
      e.append(container)

      const json = {
        bossBar,
        bar,
        fill,
        div1,
        div2,
        title
      }
      this.updateBar(json)
      bossBars.set(bossBar.entityUUID, json)
    });
    this.bot.on('bossBarUpdated', (bossBar) => {
      const bar = bossBars.get(bossBar.entityUUID)
      bar.bossBar = bossBar
      this.updateBar(bar)
    });
    this.bot.on('bossBarDeleted', (bossBar) => {
      bossBars.delete(bossBar.entityUUID)
    });
  }
}

window.customElements.define('pmui-bossbars-overlay', BossBars)
