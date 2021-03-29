const { LitElement, html, css } = require('lit-element')
require('../components/button')

class IngameMenu extends LitElement {
  constructor () {
    super();
  }

  static get styles () {
    return css`
      :host {
        --guiScale: var(--guiScaleFactor, 3);
      }

      .ingame-menu-screen {
        position: absolute;
        top: 0;
        left: 0;

        width: 100vw;
        height: 100vh;

        background: rgba(0, 0, 0, 0.75);
        z-index: 10;
      }

      .ingame-menu-container {
        position: absolute;
        top: calc(25% + calc((24px - 16px) * var(--guiScale)));
        left: 50%;

        transform: translate(-50%);

        width: max-content;
        height: max-content;
      }
    `;
  }

  render () {
    return html`
      <div class="ingame-menu-screen">
        <div class="ingame-menu-container">
          <legacy-button btn-width="200px" @click=${() => { this.closeScreen() }}>Return to Game</legacy-button>
          <!--<legacy-button btn-width="200px" @click=${() => { this.style.display = 'none'; document.getElementById('options-menu').style.display = "block"; }}>Options...</legacy-button>-->
        </div>
      </div>
    `;
  }

  closeScreen() {
    this.style.display = 'none';
    renderer.domElement.requestPointerLock(); 
  }
}

window.customElements.define('ingame-menu', IngameMenu)