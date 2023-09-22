//@ts-check
const { LitElement, html, css, unsafeCSS } = require('lit')
const widgetsGui = require('minecraft-assets/minecraft-assets/data/1.17.1/gui/widgets.png')
const { options, watchValue } = require('../../optionsStorage')

const buttonClickAudio = new Audio()
buttonClickAudio.src = 'button_click.mp3'
// load as many resources on page load as possible instead on demand as user can disable internet connection after he thinks the page is loaded
buttonClickAudio.load()
watchValue(options, o => {
  buttonClickAudio.volume = o.volume / 100
})

class Button extends LitElement {
  static get styles () {
    return css`
      .button {
        --txrV: 66px;
        position: relative;
        width: 200px;
        height: 20px;
        font-family: minecraft, mojangles, monospace;
        font-size: 10px;
        color: white;
        text-shadow: 1px 1px #222;
        border: none;
        z-index: 1;
        outline: none;
        display: inline-flex;
        justify-content: center;
        align-items: center;
      }

      .button:hover,
      .button:focus-visible {
        --txrV: 86px;
      }

      .button:disabled {
        --txrV: 46px;
        color: #A0A0A0;
        text-shadow: 1px 1px #111;
      }

      .button::after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: calc(50% + 1px);
        height: 20px;
        background: url('${unsafeCSS(widgetsGui)}');
        background-size: 256px;
        background-position-y: calc(var(--txrV) * -1);
        z-index: -1;
      }

      .button::before {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 50%;
        width: 50%;
        height: 20px;
        background: url('${unsafeCSS(widgetsGui)}');
        background-size: 256px;
        background-position-x: calc(-200px + 100%);
        background-position-y: calc(var(--txrV) * -1);
        z-index: -1;
      }

      .icon {
        position: absolute;
        top: 3px;
        left: 3px;
        font-size: 14px;
      }
    `
  }

  static get properties () {
    return {
      label: {
        type: String,
        attribute: 'pmui-label'
      },
      width: {
        type: String,
        attribute: 'pmui-width'
      },
      disabled: {
        type: Boolean,
      },
      onPress: {
        type: Function,
        attribute: 'pmui-click'
      },
      icon: {
        type: Function,
        attribute: 'pmui-icon'
      },
      testId: {
        type: String,
        attribute: 'pmui-test-id'
      }
    }
  }

  constructor () {
    super()
    this.label = ''
    this.icon = undefined
    this.testId = undefined
    this.disabled = false
    this.width = '200px'
    this.onPress = () => { }
  }

  render () {
    return html`
    <button
      class="button"
      ?disabled=${this.disabled}
      @click=${this.onBtnClick}
      style="width: ${this.width};"
      data-test-id=${this.testId}
    >
    <!-- todo self host icons -->
      ${this.icon ? html`<iconify-icon class="icon" icon="${this.icon}"></iconify-icon>` : ''}
      ${this.label}
    </button>`
  }

  onBtnClick (e) {
    buttonClickAudio.play()
    this.dispatchEvent(new window.CustomEvent('pmui-click', { detail: e, }))
  }
}

window.customElements.define('pmui-button', Button)
