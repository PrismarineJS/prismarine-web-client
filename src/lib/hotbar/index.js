const { LitElement, html, css } = require('lit-element')
const invsprite = require('./invsprite.json')

class HotBar extends LitElement {
  connectedCallback() {
    super.connectedCallback()
    this.reloadHotbar()
    this.reloadHotbarSelected(0)
    document.addEventListener('wheel', (e) => {
      const newSlot = ((this.bot.quickBarSlot + Math.sign(e.deltaY)) % 9 + 9) % 9
      this.reloadHotbarSelected(newSlot)
    })

    this.bot.inventory.on('updateSlot', (slot, oldItem, newItem) => {
      if (slot >= this.bot.inventory.hotbarStart + 9) return
      if (slot < this.bot.inventory.hotbarStart) return

      const sprite = newItem ? invsprite[newItem.name] : invsprite.air
      const slotImage = this.shadowRoot.getElementById('hotbar-' + (slot - this.bot.inventory.hotbarStart))
      slotImage.style['background-position-x'] = `-${sprite.x * 2}px`
      slotImage.style['background-position-y'] = `-${sprite.y * 2}px`
      slotImage.innerHTML = newItem?.count > 1 ? newItem.count : ''
    })
  }

  async reloadHotbar () {
    for (let i = 0; i < 9; i++) {
      const item = this.bot.inventory.slots[this.bot.inventory.hotbarStart + i]
      const sprite = item ? invsprite[item.name] : invsprite.air
      const slotImage = this.shadowRoot.getElementById('hotbar-' + i)
      slotImage.style['background-position-x'] = `-${sprite.x * 2}px`
      slotImage.style['background-position-y'] = `-${sprite.y * 2}px`
      slotImage.innerHTML = item?.count > 1 ? item.count : ''
    }
  }

  async reloadHotbarSelected (slot) {
    const item = this.bot.inventory.slots[this.bot.inventory.hotbarStart + slot]
    const planned = (20 * 4 * slot) + 'px'
    this.shadowRoot.getElementById('hotbar-highlight').style.marginLeft = planned
    this.bot.setQuickBarSlot(slot)
    this.activeItemName = item?.displayName
    const name = this.shadowRoot.getElementById('hotbar-item-name')
    name.classList.remove('hotbar-item-name-fader')
    setTimeout(() => name.classList.add('hotbar-item-name-fader'), 10)
  }

  static get properties () {
    return {
      bot: { type: Object },
      activeItemName: { type: String }
    }
  }

  static get styles () {
    return css(require('index.css'))
  }

  constructor () {
    super()
    this.activeItemName = ''
  }

  render () {
    return html`
    <div id="hotbar-wrapper">
      <p id="hotbar-item-name">${this.activeItemName}</p>
      <img id="hotbar-image" src="textures/1.16.4/gui/widgets.png">
      <img id="hotbar-highlight" src="textures/1.16.4/gui/widgets.png">
      <div id="hotbar-items-wrapper">
        <div class="hotbar-item" id="hotbar-0"></div>
        <div class="hotbar-item" id="hotbar-1"></div>
        <div class="hotbar-item" id="hotbar-2"></div>
        <div class="hotbar-item" id="hotbar-3"></div>
        <div class="hotbar-item" id="hotbar-4"></div>
        <div class="hotbar-item" id="hotbar-5"></div>
        <div class="hotbar-item" id="hotbar-6"></div>
        <div class="hotbar-item" id="hotbar-7"></div>
        <div class="hotbar-item" id="hotbar-8"></div>
      </div>
    </div>
    `
  }
}

window.customElements.define('hot-bar', HotBar)
