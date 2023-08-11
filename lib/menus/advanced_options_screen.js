//@ts-check
const { LitElement, html, css } = require('lit')
const { CommonOptionsScreen } = require('./options_store')
const { commonCss, isMobile, openURL } = require('./components/common')
const { hideCurrentModal } = require('../globalState')

class AdvancedOptionsScreen extends CommonOptionsScreen {
  constructor () {
    super()
    this.defineOptions({
      forceMobileControls: { defaultValue: false, convertFn: (v) => v === 'true' }
    })
  }

  static get styles () {
    return css`
      ${commonCss}
      .title {
        top: 4px;
      }

      main {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: calc(100% / 6 - 6px);
        left: 50%;
        width: 310px;
        gap: 4px 0;
        place-items: center;
        place-content: center;
        transform: translate(-50%);
      }

      .wrapper {
        display: flex;
        flex-direction: row;
        width: 100%;
        gap: 0 10px;
        height: 20px;
      }
    `
  }

  render () {
    return html`
      <div class="${'dirt-bg'}"></div>

      <p class="title">Advanced Options</p>
      <main>
        <div class="wrapper">
          <pmui-button pmui-width="150px" pmui-label=${'Force Mobile Controls: ' + (this.forceMobileControls ? 'ON' : 'OFF')} @pmui-click=${() => {
        this.forceMobileControls = !this.forceMobileControls
        if (this.forceMobileControls || isMobile()) {
          document.getElementById('hud').showMobileControls(true)
        } else {
          document.getElementById('hud').showMobileControls(false)
        }
        this.requestUpdate()
      }
      }></pmui-button>
      <pmui-button pmui-width="150px" pmui-label="[Guide] Disable Vsync" @click=${() => openURL('https://gist.github.com/zardoy/6e5ce377d2b4c1e322e660973da069cd')}></pmui-button>
      </div>

        <pmui-button pmui-width="200px" pmui-label="Done" @pmui-click=${() => hideCurrentModal()}></pmui-button>
      </main>
    `
  }
}

window.customElements.define('pmui-advanced-optionsscreen', AdvancedOptionsScreen)
