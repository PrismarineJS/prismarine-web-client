const { openURL, displayScreen } = require('./components/common')
const { LitElement, html, css } = require('lit')

class TitleScreen extends LitElement {
  static get styles () {
    return css`
      .minecraft {
        position: absolute;
        top: 30px;
        left: calc(50% - 137px);
      }

      .minecraft .minec {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        background-image: url('textures/1.17.1/gui/title/minecraft.png');
        background-size: 256px;
        width: 155px;
        height: 44px;
      }

      .minecraft .raft {
        display: block;
        position: absolute;
        top: 0;
        left: 155px;
        background-image: url('textures/1.17.1/gui/title/minecraft.png');
        background-size: 256px;
        width: 155px;
        height: 44px;
        background-position-y: -45px;
      }

      .minecraft .edition {
        display: block;
        position: absolute;
        top: 37px;
        left: calc(88px + 5px);
        background-image: url('extra-textures/edition.png');
        background-size: 128px;
        width: 88px;
        height: 14px;
      }

      .splash {
        position: absolute;
        top: 32px;
        left: 227px;
        color: #ff0;
        transform: translate(-50%, -50%) rotateZ(-20deg) scale(1);
        width: max-content;
        text-shadow: 1px 1px #220;
        font-size: 10px;
        animation: splashAnim 400ms infinite alternate linear;
      }

      @keyframes splashAnim {
        to {
           transform: translate(-50%, -50%) rotateZ(-20deg) scale(1.07);
        }
      }

      .menu {
        display: flex;
        flex-direction: column;
        gap: 4px 0;
        position: absolute;
        top: calc(25% + 48px);
        left: 50%;
        width: 200px;
        transform: translate(-50%);
      }

      .menu-row {
        display: flex;
        flex-direction: row;
        gap: 0 4px;
        width: 100%;
      }

      .bottom-info {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        position: absolute;
        bottom: -1px;
        left: 1px;
        width: calc(100% - 2px);
        color: white;
        text-shadow: 1px 1px #222;
        font-size: 10px;
      }
    `
  }

  render () {
    return html`
      <div class="minecraft">
        <div class="minec"></div>
        <div class="raft"></div>
        <div class="edition"></div>
        <span class="splash">Prismarine is a beautiful block</span>
      </div>

      <div class="menu">
        <pmui-button pmui-width="200px" pmui-label="Play" @pmui-click=${() => displayScreen(this, document.getElementById('play-screen'))}></pmui-button>
        <pmui-button pmui-width="200px" pmui-label="Options" @pmui-click=${() => displayScreen(this, document.getElementById('options-screen'))}></pmui-button>
        <div class="menu-row">
          <pmui-button pmui-width="98px" pmui-label="Github" @pmui-click=${() => openURL('https://github.com/PrismarineJS/prismarine-web-client')}></pmui-button>
          <pmui-button pmui-width="98px" pmui-label="Discord" @pmui-click=${() => openURL('https://discord.gg/4Ucm684Fq3')}></pmui-button>
        </div>
      </div>

      <div class="bottom-info">
        <span>Prismarine Web Client</span>
        <span>A minecraft client in the browser!</span>
      </div>
    `
  }
}

window.customElements.define('pmui-titlescreen', TitleScreen)
