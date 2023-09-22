const { LitElement, html, css } = require('lit')
const { commonCss, isMobile } = require('./components/common')
const { showModal, hideCurrentModal, isGameActive, miscUiState } = require('../globalState')
const { toNumber, openFilePicker, setLoadingScreenStatus } = require('../utils')
const { options, watchValue } = require('../optionsStorage')
const { subscribe } = require('valtio')
const { subscribeKey } = require('valtio/utils')
const { getResourcePackName, uninstallTexturePack, resourcePackState } = require('../texturePack')
const { fsState } = require('../loadSave')

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

  constructor () {
    super()

    watchValue(options, o => {
      document.documentElement.style.setProperty('--chatScale', `${o.chatScale / 100}`)
      document.documentElement.style.setProperty('--chatWidth', `${o.chatWidth}px`)
      document.documentElement.style.setProperty('--chatHeight', `${o.chatHeight}px`)
      document.documentElement.style.setProperty('--guiScale', `${o.guiScale}`)
    })

    subscribe(options, () => {
      this.requestUpdate()
    })
    subscribeKey(miscUiState, 'singleplayer', () => {
      this.requestUpdate()
    })
    subscribeKey(resourcePackState, 'resourcePackInstalled', () => {
      this.requestUpdate()
    })
  }

  render () {
    return html`
      <div class="${isGameActive(false) ? 'bg' : 'dirt-bg'}"></div>

      <p class="title">Options</p>

      <main>
        <div class="wrapper">
          <pmui-slider pmui-label="Mouse Sensitivity X" pmui-value="${options.mouseSensX}" pmui-min="1" pmui-max="100" @input=${(e) => {
        options.mouseSensX = +e.target.value
      }}></pmui-slider>
          <pmui-slider pmui-label="Mouse Sensitivity Y" pmui-value="${options.mouseSensY}" pmui-min="1" pmui-max="100" @input=${(e) => {
        options.mouseSensY = +e.target.value
      }}></pmui-slider>
        </div>
        <div class="wrapper">
          <pmui-slider pmui-label="Chat Width" pmui-value="${options.chatWidth}" pmui-min="0" pmui-max="320" pmui-type="px" @input=${(e) => {
        options.chatWidth = +e.target.value
      }}></pmui-slider>
          <pmui-slider pmui-label="Chat Height" pmui-value="${options.chatHeight}" pmui-min="0" pmui-max="180" pmui-type="px" @input=${(e) => {
        options.chatHeight = +e.target.value
      }}></pmui-slider>
        </div>
        <div class="wrapper">
          <pmui-slider pmui-label="Chat Scale" pmui-value="${options.chatScale}" pmui-min="0" pmui-max="100" @input=${(e) => {
        options.chatScale = +e.target.value
      }}></pmui-slider>
          <pmui-slider pmui-label="Sound Volume" pmui-value="${options.volume}" pmui-min="0" pmui-max="100" @input=${(e) => {
        options.volume = +e.target.value
      }}></pmui-slider>
        </div>
        <div class="wrapper">
          <pmui-button .disabled=${true} pmui-width="150px" pmui-label="Key Binds" @pmui-click=${() => showModal(document.getElementById('keybinds-screen'))}></pmui-button>
          <pmui-slider pmui-label="Gui Scale" pmui-value="${options.guiScale}" pmui-min="1" pmui-max="4" pmui-type="" @change=${(e) => {
        options.guiScale = +e.target.value
      }}></pmui-slider>
        </div>
        <div class="wrapper">
          <pmui-slider pmui-label="Render Distance" pmui-value="${options.renderDistance}" .disabled="${isGameActive(false) && !miscUiState.singleplayer ? 'Can be changed only from main menu for now' : undefined}" pmui-min="2" pmui-max="${miscUiState.singleplayer ? 16 : 6}" pmui-type=" chunks" @change=${(e) => {
        options.renderDistance = +e.target.value
      }}></pmui-slider>
        <pmui-slider pmui-label="Field of View" pmui-value="${options.fov}" pmui-min="30" pmui-max="110" pmui-type="" @input=${(e) => {
        options.fov = +e.target.value
      }}></pmui-slider>
      </div>

        <div class="wrapper">
          <pmui-button pmui-width="150px" pmui-label=${'Advanced'} @pmui-click=${() => {
        showModal(document.querySelector('pmui-advanced-optionsscreen'))
      }
      }></pmui-button>
          <pmui-button pmui-width="150px" pmui-label=${'Mouse Raw Input: ' + (options.mouseRawInput ? 'ON' : 'OFF')} title="Wether to disable any mouse acceleration (MC does it by default)" @pmui-click=${() => {
        options.mouseRawInput = !options.mouseRawInput
      }
      }></pmui-button>
        </div>
        <div class="wrapper">
          <pmui-button title="Auto Fullscreen allows you to use Ctrl+W and Escape without delays" .disabled="${!navigator['keyboard'] ? "Your browser doesn't support keyboard lock API" : undefined}" pmui-width="150px" pmui-label=${'Auto Fullscreen: ' + (options.autoFullScreen ? 'ON' : 'OFF')} title="Wether to disable any mouse acceleration (MC does it by default)" @pmui-click=${() => {
        options.autoFullScreen = !options.autoFullScreen
      }
      }></pmui-button>
        <!-- todo also allow to remap f11 -->
            <pmui-button title="Exit fullscreen (not recommended, also you can always do it with F11)" pmui-width="150px" pmui-label=${'Auto Exit Fullscreen: ' + (options.autoExitFullscreen ? 'ON' : 'OFF')} @pmui-click=${() => {
        options.autoExitFullscreen = !options.autoExitFullscreen
      }
      }></pmui-button>
        </div>
        <div class="wrapper">
          <pmui-button pmui-width="150px" pmui-label=${'Resource Pack: ' + (resourcePackState.resourcePackInstalled ? 'ON' : 'OFF')} @pmui-click=${async () => {
        if (resourcePackState.resourcePackInstalled) {
          const resourcePackName = await getResourcePackName()
          if (confirm(`Uninstall ${resourcePackName} resource pack?`)) {
            // todo make hidable
            setLoadingScreenStatus('Uninstalling texturepack...')
            await uninstallTexturePack()
            setLoadingScreenStatus(undefined)
          }
        } else {
          if (!fsState.inMemorySave && isGameActive(false)) {
            alert('Unable to install resource pack in loaded save for now')
            return
          }
          openFilePicker('resourcepack')
        }
      }}></pmui-button>
      </div>

        <pmui-button pmui-width="200px" pmui-label="Done" @pmui-click=${() => hideCurrentModal()}></pmui-button>
      </main>
    `
  }
}

window.customElements.define('pmui-optionsscreen', OptionsScreen)
