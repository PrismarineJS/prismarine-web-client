const { LitElement, html, css, unsafeCSS } = require('lit')

const widgetsGui = require('minecraft-assets/minecraft-assets/data/1.17.1/gui/widgets.png')

class Slider extends LitElement {
  static get styles () {
    return css`
      .slider-container {
        --txrV: -46px;
        position: relative;
        width: 150px;
        height: 20px;
        font-family: minecraft, mojangles, monospace;
        font-size: 10px;
        color: white;
        text-shadow: 1px 1px #220;
        z-index: 1;
      }

      .slider-thumb {
        --txrV: -66px;
        pointer-events: none;
        width: 8px;
        height: 20px;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 3;
      }

      .slider-container:hover .slider:not(:disabled)~.slider-thumb {
        --txrV: -86px;
      }

      .slider-container::after,
      .slider-thumb::after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 50%;
        height: 20px;
        background: url('${unsafeCSS(widgetsGui)}');
        background-size: 256px;
        background-position-y: var(--txrV);
        z-index: -1;
      }

      .slider-container::before,
      .slider-thumb::before {
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
        background-position-y: var(--txrV);
        z-index: -1;
      }

      .slider {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        -webkit-appearance: none;
        appearance: none;
        background: none;
        width: 100%;
        height: 20px;
        margin: 0;
      }

      .slider:disabled {
        cursor: not-allowed;
      }
      .slider~.disabled {
        display: none;
      }
      /* .disabled after .slider selector */
      .slider:disabled~.disabled {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
        background: rgba(0, 0, 0, .5);
      }

      .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        position: relative;
        appearance: none;
        width: 8px;
        height: 20px;
        background: transparent;
      }

      .slider::-moz-range-thumb {
        width: 8px;
        height: 20px;
        background: transparent;
      }

      label {
        pointer-events: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 6;
        width: max-content;
      }
    `
  }

  constructor () {
    super()
    this.label = ''
    this.type = '%'
    this.width = '150px'
    this.value = '50'
    this.min = '0'
    this.max = '100'
    this.ratio = (Number(this.value) - Number(this.min)) / (Number(this.max) - Number(this.min))
  }

  updated () {
    this.ratio = (Number(this.value) - Number(this.min)) / (Number(this.max) - Number(this.min))
  }

  static get properties () {
    return {
      label: {
        type: String,
        attribute: 'pmui-label'
      },
      type: {
        type: String,
        attribute: 'pmui-type'
      },
      width: {
        type: String,
        attribute: 'pmui-width'
      },
      value: {
        type: String,
        attribute: 'pmui-value'
      },
      valueDisplay: {
        type: String,
      },
      min: {
        type: String,
        attribute: 'pmui-min'
      },
      max: {
        type: String,
        attribute: 'pmui-max'
      },
      disabled: {
        type: String,
        attribute: 'pmui-disabled'
      },
      ratio: { type: Number }
    }
  }

  render () {
    return html`
      <div
        class="slider-container"
        style="width: ${this.width};"
      >
        <input
          type="range"
          class="slider"
          min="${this.min}"
          max="${this.max}"
          value="${this.value}"
          ?disabled=${!!this.disabled}
          @input=${(e) => {
      const range = e.target
      this.ratio = (range.value - range.min) / (range.max - range.min)
      this.value = range.value
    }}
      @pointerdown=${() => {
      window.addEventListener('pointerup', (e) => {
        this.dispatchEvent(new InputEvent('change'))
      }, {
        once: true,
      })
    }}
      @keyup=${() => {
      this.dispatchEvent(new InputEvent('change'))
    }}>
        <div class="disabled" title="${this.disabled}"></div>
        <div
          class="slider-thumb"
          style="left: calc((100% * ${this.ratio}) - (8px * ${this.ratio}));"
        ></div>
        <label>${this.label}: ${this.valueDisplay ?? this.value}${this.type}</label>
      </div>
    `
  }
}

window.customElements.define('pmui-slider', Slider)
