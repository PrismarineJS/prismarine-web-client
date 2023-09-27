//@ts-check
const { html, css, LitElement } = require('lit')
const { subscribe } = require('valtio')
const { hideCurrentModal } = require('../globalState')
const { getScreenRefreshRate } = require('../utils')
const { options } = require('../optionsStorage')
const { commonCss, openURL } = require('./components/common')

class AdvancedOptionsScreen extends LitElement {
  /** @type {null | number} */
  frameLimitMax = null

  constructor () {
    super()
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
        <pmui-slider .disabled=${!this.frameLimitMax} pmui-label="Frame Limit" .valueDisplay=${options.frameLimit || 'VSync'} pmui-value="${options.frameLimit || this.frameLimitMax + 1}"
         pmui-type="${options.frameLimit ? 'fps' : ''}" pmui-min="20" pmui-max="${this.frameLimitMax + 1}" @input=${(e) => {
        const newVal = e.target.value
        options.frameLimit = newVal > this.frameLimitMax ? false : newVal
        this.requestUpdate()
      }}></pmui-slider>
        <pmui-button pmui-width="20px" pmui-icon="pixelarticons:lock-open" @click=${async () => {
        const rate = await getScreenRefreshRate()
        this.frameLimitMax = rate
        this.requestUpdate()
      }}></pmui-button>
      </div>
      <div class="wrapper">
        <pmui-slider pmui-width="150px" pmui-label="Touch Buttons Size" pmui-value="${options.touchButtonsSize}" pmui-type="%" pmui-min="20" pmui-max="100" @input=${(e) => {
        options.touchButtonsSize = +e.target.value
      }}></pmui-slider>
        <pmui-button pmui-width="150px" pmui-label="${`Use Dedicated GPU: ${options.highPerformanceGpu ? 'ON' : 'OFF'}`}" title="Changing requires page reload. Only for those who have two GPUs e.g. on laptops" @pmui-click=${() => {
        options.highPerformanceGpu = !options.highPerformanceGpu
      }}></pmui-button>
      </div>

      <pmui-button pmui-width="200px" pmui-label="Done" @pmui-click=${() => hideCurrentModal()}></pmui-button>
      </main>
    `
  }
}

window.customElements.define('pmui-advanced-optionsscreen', AdvancedOptionsScreen)
