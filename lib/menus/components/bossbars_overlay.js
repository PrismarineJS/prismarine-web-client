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
      
      .bossBar {
        display: flex;
        gap: 3px;
      }`
  }

  render () {
    return html`<div class="bossBars" id="bossBars"></div>`
  }

  init() {
    const bossBars = new Map();

    this.bot.on('bossBarCreated', (bossBar) => {
      bossBars.set(bossBar.entityUUID, bossBar);
    });
    this.bot.on('bossBarUpdated', (bossBar) => {
      bossBars.set(bossBar.entityUUID, bossBar);
    });
    this.bot.on('bossBarDeleted', (bossBar) => {
      bossBars.delete(bossBar.entityUUID);
    });
  }
}

window.customElements.define('pmui-bossbars-overlay', BossBars)
