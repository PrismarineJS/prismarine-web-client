//@ts-check
const { html, css } = require('lit')
const { CommonOptionsScreen } = require('./options_store')
const { commonCss, openURL } = require('./components/common')
const { hideCurrentModal } = require('../globalState')
const { toNumber, getScreenRefreshRate } = require('../utils')
const { subscribe } = require('valtio')
const { options } = require('../optionsStorage')

class AdvancedOptionsScreen extends CommonOptionsScreen {
  /** @type {null | number} */
  frameLimitMax = null

  constructor () {
    super()
    this.defineOptions({
      frameLimit: { defaultValue: false, convertFn: (v) => toNumber(v) ?? false },
    })
    subscribe(options, () => {
      this.requestUpdate()
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
          <pmui-button pmui-width="150px" pmui-label=${`Always Show Mobile Controls: ${options.alwaysShowMobileControls ? 'ON' : 'OFF'}`} @pmui-click=${() => {
        options.alwaysShowMobileControls = !options.alwaysShowMobileControls
      }
      }></pmui-button>
      <!-- todo rename button, also might be unstable -->
        <pmui-button pmui-width="150px" pmui-label="Guide: Disable VSync" @click=${() => openURL('https://gist.github.com/zardoy/6e5ce377d2b4c1e322e660973da069cd')}></pmui-button>
      </div>
      <div class="wrapper">
        <pmui-slider .disabled=${!this.frameLimitMax} pmui-label="Frame Limit" .valueDisplay=${this.options.frameLimit || 'VSync'} pmui-value="${this.options.frameLimit || this.frameLimitMax + 1}"
         pmui-type="${this.options.frameLimit ? 'fps' : ''}" pmui-min="20" pmui-max="${this.frameLimitMax + 1}" @input=${(e) => {
        const newVal = e.target.value
        this.changeOption('frameLimit', newVal > this.frameLimitMax ? false : newVal)
        this.requestUpdate()
      }}></pmui-slider>
        <pmui-button pmui-width="20px" pmui-icon="pixelarticons:lock-open" @click=${async () => {
        const rate = await getScreenRefreshRate()
        this.frameLimitMax = rate
        this.requestUpdate()
      }}></pmui-button>
      </div>

      <pmui-button pmui-width="200px" pmui-label="Done" @pmui-click=${() => hideCurrentModal()}></pmui-button>
      </main>
    `
  }
}

window.customElements.define('pmui-advanced-optionsscreen', AdvancedOptionsScreen)
