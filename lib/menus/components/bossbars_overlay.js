const { LitElement, html, css } = require('lit')

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
      
      .bossbar {
        background-image: url("textures/1.18.1/gui/bars.png");
        width: 182px;
        height: 5px;
      }
      .bossbar .fill {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background-image: url("textures/1.18.1/gui/bars.png");
      }`
  }

  render () {
    return html`<div class="bossBars" id="bossBars"></div>`
  }

  init() {
    const e = this.shadowRoot.querySelector('#bossBars')
    const bossBars = new Map();

    this.bot.on('bossBarCreated', (bossBar) => {
      const bar = document.createElement("div");
      bar.classList.add("bossbar");
      const fill = document.createElement("div");
      fill.classList.add("fill");
      bar.append(fill);
      e.append(bar);

      bossBars.set(bossBar.entityUUID, {
        bossBar,
        bar,
        fill
      });
    });
    this.bot.on('bossBarUpdated', (bossBar) => {
      const bar = bossBars.get(bossBar.entityUUID);
      bar.bossBar = bossBar;
    });
    this.bot.on('bossBarDeleted', (bossBar) => {
      bossBars.delete(bossBar.entityUUID);
    });
  }
}

window.customElements.define('pmui-bossbars-overlay', BossBars)
