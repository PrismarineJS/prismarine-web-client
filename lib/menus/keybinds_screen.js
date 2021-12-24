const { LitElement, html, css } = require('lit')
const { commonCss, displayScreen } = require('./components/common')

class KeyBindsScreen extends LitElement {
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
        top: 30px;
        left: 50%;
        transform: translate(-50%);
        width: 100%;
        height: calc(100% - 64px);
        place-items: center;
        background: rgba(0, 0, 0, 0.5);
        box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.7), inset 0 -3px 6px rgba(0, 0, 0, 0.7);
      }

      .keymap-list {
        width: 288px;
        display: flex;
        flex-direction: column;
        padding: 4px 0;
        overflow-y: auto;
      }

      .keymap-list::-webkit-scrollbar {
        width: 6px;
      }

      .keymap-list::-webkit-scrollbar-track {
        background: #000;
      }

      .keymap-list::-webkit-scrollbar-thumb {
        background: #ccc;
        box-shadow: inset -1px -1px 0 #4f4f4f;
      }

      .keymap-entry {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 20px;
        place-content: center;
        place-items: center;
        justify-content: space-between;
      }

      span {
        color: white;
        text-shadow: 1px 1px 0 rgb(63, 63, 63);
        font-size: 10px;
      }

      .keymap-entry-btns {
        display: flex;
        flex-direction: row;
        gap: 4px;
      }

      .bottom-btns {
        display: flex;
        flex-direction: row;
        width: 310px;
        height: 20px;
        justify-content: space-between;
        position: absolute;
        bottom: 9px;
        left: 50%;
        transform: translate(-50%);
      }

    `
  }

  static get properties () {
    return {
      keymaps: { type: Object },
      selected: { type: Number }
    }
  }

  constructor () {
    super()
    this.selected = -1
    this.keymaps = [
      { defaultKey: 'KeyW', key: 'KeyW', name: 'Walk Forwards' },
      { defaultKey: 'KeyS', key: 'KeyS', name: 'Walk Backwards' },
      { defaultKey: 'KeyA', key: 'KeyA', name: 'Strafe Left' },
      { defaultKey: 'KeyD', key: 'KeyD', name: 'Strafe Right' },
      { defaultKey: 'Space', key: 'Space', name: 'Jump' },
      { defaultKey: 'ShiftLeft', key: 'ShiftLeft', name: 'Sneak' },
      { defaultKey: 'ControlLeft', key: 'ControlLeft', name: 'Sprint' },
      { defaultKey: 'KeyT', key: 'KeyT', name: 'Open Chat' },
      { defaultKey: 'Slash', key: 'Slash', name: 'Open Command' },
      // { defaultKey: '0', key: '0', name: 'Attack/Destroy' },
      // { defaultKey: '1', key: '1', name: 'Place Block' },
      { defaultKey: 'KeyQ', key: 'KeyQ', name: 'Drop Item' }
      // { defaultKey: 'Digit1', key: 'Digit1', name: 'Hotbar Slot 1' },
      // { defaultKey: 'Digit2', key: 'Digit2', name: 'Hotbar Slot 2' },
      // { defaultKey: 'Digit3', key: 'Digit3', name: 'Hotbar Slot 3' },
      // { defaultKey: 'Digit4', key: 'Digit4', name: 'Hotbar Slot 4' },
      // { defaultKey: 'Digit5', key: 'Digit5', name: 'Hotbar Slot 5' },
      // { defaultKey: 'Digit6', key: 'Digit6', name: 'Hotbar Slot 6' },
      // { defaultKey: 'Digit7', key: 'Digit7', name: 'Hotbar Slot 7' },
      // { defaultKey: 'Digit8', key: 'Digit8', name: 'Hotbar Slot 8' },
      // { defaultKey: 'Digit9', key: 'Digit9', name: 'Hotbar Slot 9' },
      // { defaultKey: 'KeyE', key: 'KeyE', name: 'Open Inventory' }
    ]

    document.addEventListener('keydown', (e) => {
      if (this.selected !== -1) {
        this.keymaps[this.selected].key = e.code
        this.selected = -1
        this.requestUpdate()
      }
    })
  }

  render () {
    return html`
      <div class="dirt-bg"></div>

        <p class="title">Key Binds</p>

        <main>
          <div class="keymap-list">
            ${this.keymaps.map((m, i) => html`
            <div class="keymap-entry">
              <span>${m.name}</span>

              <div class="keymap-entry-btns">
                <pmui-button pmui-width="72px" pmui-label="${this.selected === i ? `> ${m.key} <` : m.key}" @pmui-click=${e => {
                  e.target.setAttribute('pmui-label', `> ${m.key} <`)
                  this.selected = i
                  this.requestUpdate()
                }}></pmui-button>
                <pmui-button pmui-width="50px" ?pmui-disabled=${m.key === m.defaultKey} pmui-label="Reset" @pmui-click=${() => {
                  this.keymaps[i].key = this.keymaps[i].defaultKey
                  this.requestUpdate()
                  this.selected = -1
                }}></pmui-button>
              </div>
            </div>
          `)}
          </div>
        </main>

        <div class="bottom-btns">
          <pmui-button pmui-width="150px" pmui-label="Reset All Keys" ?pmui-disabled=${!this.keymaps.some(v => v.key !== v.defaultKey)} @pmui-click=${this.onResetAllPress}></pmui-button>
          <pmui-button pmui-width="150px" pmui-label="Done" @pmui-click=${() => displayScreen(this, document.getElementById('options-screen'))}></pmui-button>
        </div>
    `
  }

  onResetAllPress () {
    for (let i = 0; i < this.keymaps.length; i++) {
      this.keymaps[i].key = this.keymaps[i].defaultKey
    }
    this.requestUpdate()
  }
}

window.customElements.define('pmui-keybindsscreen', KeyBindsScreen)
