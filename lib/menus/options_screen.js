const { LitElement, html, css } = require('lit')
const { commonCss, displayScreen, isMobile } = require('./components/common')

class OptionsScreen extends LitElement {
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

  static get properties () {
    return {
      isInsideWorld: { type: Boolean },
      mouseSensitivityX: { type: Number },
      mouseSensitivityY: { type: Number },
      chatWidth: { type: Number },
      chatHeight: { type: Number },
      chatScale: { type: Number },
      sound: { type: Number },
      renderDistance: { type: Number },
      fov: { type: Number },
      guiScale: { type: Number }
    }
  }

  constructor () {
    super()
    this.isInsideWorld = false

    const getValue = (item, defaultValue, convertFn) => window.localStorage.getItem(item) ? convertFn(window.localStorage.getItem(item)) : defaultValue

    this.mouseSensitivityX = getValue('mouseSensX', 50, (v) => Math.floor(Number(v) * 10000))
    this.mouseSensitivityY = getValue('mouseSensY', 50, (v) => Math.floor(Number(v) * 10000))
    this.chatWidth = getValue('chatWidth', 320, (v) => Number(v))
    this.chatHeight = getValue('chatHeight', 180, (v) => Number(v))
    this.chatScale = getValue('chatScale', 100, (v) => Number(v))
    this.sound = getValue('sound', 50, (v) => Number(v))
    this.renderDistance = getValue('renderDistance', 6, (v) => Number(v))
    this.fov = getValue('fov', 75, (v) => Number(v))
    this.guiScale = getValue('guiScale', 3, (v) => Number(v))
    this.forceMobileControls = getValue('forceMobileControls', false, (v) => v === 'true')

    document.documentElement.style.setProperty('--chatScale', `${this.chatScale / 100}`)
    document.documentElement.style.setProperty('--chatWidth', `${this.chatWidth}px`)
    document.documentElement.style.setProperty('--chatHeight', `${this.chatHeight}px`)
    document.documentElement.style.setProperty('--guiScale', `${this.guiScale}`)
  }

  render () {
    return html`
      <div class="${this.isInsideWorld ? 'bg' : 'dirt-bg'}"></div>

      <p class="title">Options</p>

      <main>
        <div class="wrapper">
          <pmui-slider pmui-label="Mouse Sensitivity X" pmui-value="${this.mouseSensitivityX}" pmui-min="1" pmui-max="100" @input=${(e) => {
            this.mouseSensitivityX = Number(e.target.value)
            window.localStorage.setItem('mouseSensX', this.mouseSensitivityX * 0.0001)
          }}></pmui-slider>
          <pmui-slider pmui-label="Mouse Sensitivity Y" pmui-value="${this.mouseSensitivityY}" pmui-min="1" pmui-max="100" @input=${(e) => {
            this.mouseSensitivityY = Number(e.target.value)
            window.localStorage.setItem('mouseSensY', this.mouseSensitivityY * 0.0001)
          }}></pmui-slider>
        </div>
        <div class="wrapper">
          <pmui-slider pmui-label="Chat Width" pmui-value="${this.chatWidth}" pmui-min="0" pmui-max="320" pmui-type="px" @input=${(e) => {
            this.chatWidth = Number(e.target.value)
            window.localStorage.setItem('chatWidth', `${this.chatWidth}`)
            document.documentElement.style.setProperty('--chatWidth', `${this.chatWidth}px`)
          }}></pmui-slider>
          <pmui-slider pmui-label="Chat Height" pmui-value="${this.chatHeight}" pmui-min="0" pmui-max="180" pmui-type="px" @input=${(e) => {
            this.chatHeight = Number(e.target.value)
            window.localStorage.setItem('chatHeight', `${this.chatHeight}`)
            document.documentElement.style.setProperty('--chatHeight', `${this.chatHeight}px`)
          }}></pmui-slider>
        </div>
        <div class="wrapper">
          <pmui-slider pmui-label="Chat Scale" pmui-value="${this.chatScale}" pmui-min="0" pmui-max="100" @input=${(e) => {
            this.chatScale = Number(e.target.value)
            window.localStorage.setItem('chatScale', `${this.chatScale}`)
            document.documentElement.style.setProperty('--chatScale', `${this.chatScale / 100}`)
          }}></pmui-slider>
          <pmui-slider pmui-label="Sound Volume" pmui-value="${this.sound}" pmui-min="0" pmui-max="100" @input=${(e) => {
            this.sound = Number(e.target.value)
            window.localStorage.setItem('sound', `${this.sound}`)
          }}></pmui-slider>
        </div>
        <div class="wrapper">
          <pmui-button pmui-width="150px" pmui-label="Key Binds" @pmui-click=${() => displayScreen(this, document.getElementById('keybinds-screen'))}></pmui-button>
          <pmui-slider pmui-label="Gui Scale" pmui-value="${this.guiScale}" pmui-min="1" pmui-max="4" pmui-type="" @input=${(e) => {
            this.guiScale = Number(e.target.value)
            window.localStorage.setItem('guiScale', `${this.guiScale}`)
            document.documentElement.style.setProperty('--guiScale', `${this.guiScale}`)
          }}></pmui-slider>
        </div>
        ${this.isInsideWorld
? ''
: html`
          <div class="wrapper">
            <pmui-slider pmui-label="Render Distance" pmui-value="${this.renderDistance}" pmui-min="2" pmui-max="6" pmui-type=" chunks" @input=${(e) => {
              this.renderDistance = Number(e.target.value)
              window.localStorage.setItem('renderDistance', `${this.renderDistance}`)
            }}></pmui-slider>
            <pmui-slider pmui-label="Field of View" pmui-value="${this.fov}" pmui-min="30" pmui-max="110" pmui-type="" @input=${(e) => {
              this.fov = Number(e.target.value)
              window.localStorage.setItem('fov', `${this.fov}`)

              this.dispatchEvent(new window.CustomEvent('fov_changed', { fov: this.fov }))
            }}></pmui-slider>
          </div>
        `}
            
        <div class="wrapper">
          <pmui-button pmui-width="150px" pmui-label=${'Force Mobile Controls: ' + (this.forceMobileControls ? 'ON' : 'OFF')} @pmui-click=${() => {
              this.forceMobileControls = !this.forceMobileControls
              window.localStorage.setItem('forceMobileControls', `${this.forceMobileControls}`)
              if (this.forceMobileControls || isMobile()) {
                document.getElementById('hud').showMobileControls(true)
              } else {
                document.getElementById('hud').showMobileControls(false)
              }
              this.requestUpdate()
            }
          }></pmui-button>
        </div>

        <pmui-button pmui-width="200px" pmui-label="Done" @pmui-click=${() => displayScreen(this, document.getElementById(this.isInsideWorld ? 'pause-screen' : 'title-screen'))}></pmui-button>
      </main>
    `
  }
}

window.customElements.define('pmui-optionsscreen', OptionsScreen)
