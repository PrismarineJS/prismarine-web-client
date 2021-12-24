const { LitElement, html, css } = require('lit')
const invsprite = require('../../invsprite.json')

class Hotbar extends LitElement {
  static get styles () {
    return css`
      .hotbar {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translate(-50%);
        width: 182px;
        height: 22px;
        background: url("textures/1.16.4/gui/widgets.png");
        background-size: 256px;
      }

      #hotbar-selected {
        position: absolute;
        left: -1px;
        top: -1px;
        width: 24px;
        height: 24px;
        background: url("textures/1.16.4/gui/widgets.png");
        background-size: 256px;
        background-position-y: -22px;
      }

      #hotbar-items-wrapper {
        position: absolute;
        top: 0;
        left: 1px;
        display: flex;
        flex-direction: row;
        height: 22px;
        margin: 0;
        padding: 0;
      }

      .hotbar-item {
        position: relative;
        width: 20px;
        height: 22px;
      }

      .item-icon {
        top: 3px;
        left: 2px;
        position: absolute;
        width: 32px;
        height: 32px;
        transform-origin: top left;
        transform: scale(0.5);
        background-image: url('invsprite.png');
        background-size: 1024px auto;
      }

      .item-stack {
        position: absolute;
        color: white;
        font-size: 10px;
        text-shadow: 1px 1px 0 rgb(63, 63, 63);
        right: 1px;
        bottom: 1px;
      }

      #hotbar-item-name {
        color: white;
        position: absolute;
        bottom: 51px;
        left: 50%;
        transform: translate(-50%);
        text-shadow: rgb(63, 63, 63) 1px 1px 0px;
        font-family: mojangles, minecraft, monospace;
        font-size: 10px;
        text-align: center;
      }

      .hotbar-item-name-fader {
        opacity: 0;
        transition: visibility 0s, opacity 1s linear;
        transition-delay: 2s;
      }
    `
  }

  static get properties () {
    return {
      activeItemName: { type: String },
      bot: { type: Object },
      viewerVersion: { type: String }
    }
  }

  constructor () {
    super()
    this.activeItemName = ''
  }

  updated (changedProperties) {
    if (changedProperties.has('bot')) {
      // inventory listener
      this.bot.once('spawn', () => {
        this.init()
      })
    }
  }

  init () {
    this.reloadHotbar()
    this.reloadHotbarSelected(0)

    document.addEventListener('wheel', (e) => {
      const newSlot = ((this.bot.quickBarSlot + Math.sign(e.deltaY)) % 9 + 9) % 9
      this.reloadHotbarSelected(newSlot)
    })

    document.addEventListener('keydown', (e) => {
      const numPressed = e.code.substr(5)
      if (numPressed < 1 || numPressed > 9) return
      this.reloadHotbarSelected(numPressed - 1)
    })

    this.bot.inventory.on('updateSlot', (slot, oldItem, newItem) => {
      if (slot >= this.bot.inventory.hotbarStart + 9) return
      if (slot < this.bot.inventory.hotbarStart) return

      const sprite = newItem ? invsprite[newItem.name] : invsprite.air
      const slotEl = this.shadowRoot.getElementById('hotbar-' + (slot - this.bot.inventory.hotbarStart))
      const slotIcon = slotEl.children[0]
      const slotStack = slotEl.children[1]
      slotIcon.style['background-position-x'] = `-${sprite.x}px`
      slotIcon.style['background-position-y'] = `-${sprite.y}px`
      slotStack.innerHTML = newItem?.count > 1 ? newItem.count : ''
    })
  }

  async reloadHotbar () {
    for (let i = 0; i < 9; i++) {
      const item = this.bot.inventory.slots[this.bot.inventory.hotbarStart + i]
      const sprite = item ? invsprite[item.name] : invsprite.air
      const slotEl = this.shadowRoot.getElementById('hotbar-' + i)
      const slotIcon = slotEl.children[0]
      const slotStack = slotEl.children[1]
      slotIcon.style['background-position-x'] = `-${sprite.x}px`
      slotIcon.style['background-position-y'] = `-${sprite.y}px`
      slotStack.innerHTML = item?.count > 1 ? item.count : ''
    }
  }

  async reloadHotbarSelected (slot) {
    const item = this.bot.inventory.slots[this.bot.inventory.hotbarStart + slot]
    const newLeftPos = (-1 + 20 * slot) + 'px'
    this.shadowRoot.getElementById('hotbar-selected').style.left = newLeftPos
    this.bot.setQuickBarSlot(slot)
    this.activeItemName = item?.displayName ?? ''
    const name = this.shadowRoot.getElementById('hotbar-item-name')
    name.classList.remove('hotbar-item-name-fader')
    setTimeout(() => name.classList.add('hotbar-item-name-fader'), 10)
  }

  render () {
    return html`
      <div class="hotbar">
        <p id="hotbar-item-name">${this.activeItemName}</p>
        <div id="hotbar-selected"></div>
        <div id="hotbar-items-wrapper">
          <div class="hotbar-item" id="hotbar-0">
            <div class="item-icon"></div>
            <span class="item-stack"></span>
          </div>
          <div class="hotbar-item" id="hotbar-1">
            <div class="item-icon"></div>
            <span class="item-stack"></span>
          </div>
          <div class="hotbar-item" id="hotbar-2">
            <div class="item-icon"></div>
            <span class="item-stack"></span>
          </div>
          <div class="hotbar-item" id="hotbar-3">
            <div class="item-icon"></div>
            <span class="item-stack"></span>
          </div>
          <div class="hotbar-item" id="hotbar-4">
            <div class="item-icon"></div>
            <span class="item-stack"></span>
          </div>
          <div class="hotbar-item" id="hotbar-5">
            <div class="item-icon"></div>
            <span class="item-stack"></span>
          </div>
          <div class="hotbar-item" id="hotbar-6">
            <div class="item-icon"></div>
            <span class="item-stack"></span>
          </div>
          <div class="hotbar-item" id="hotbar-7">
            <div class="item-icon"></div>
            <span class="item-stack"></span>
          </div>
          <div class="hotbar-item" id="hotbar-8">
            <div class="item-icon"></div>
            <span class="item-stack"></span>
          </div>
        </div>
      </div>
    `
  }
}

window.customElements.define('pmui-hotbar', Hotbar)
