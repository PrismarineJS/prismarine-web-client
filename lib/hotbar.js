const { LitElement, html, css } = require('lit')
const invsprite = require('./invsprite.json')

class HotBar extends LitElement {
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

    this.bot.inventory.on('updateSlot', (slot, oldItem, newItem) => {
      if ((slot >= this.bot.inventory.hotbarStart + 9 || slot < this.bot.inventory.hotbarStart) && slot !== this.bot.getEquipmentDestSlot('off-hand')) return

      const sprite = newItem ? invsprite[newItem.name] : invsprite.air
      const slotId = slot === this.bot.getEquipmentDestSlot('off-hand') ? 'offhand' : (slot - this.bot.inventory.hotbarStart)
      const slotImage = this.shadowRoot.getElementById('hotbar-' + slotId)
      slotImage.style['background-position-x'] = `-${sprite.x * 2}px`
      slotImage.style['background-position-y'] = `-${sprite.y * 2}px`
      slotImage.innerHTML = newItem?.count > 1 ? newItem.count : ''
      if (slot === this.bot.getEquipmentDestSlot('off-hand')) {
        const offhandImg = this.shadowRoot.getElementById('hotbar-offhand-image')
        if (newItem) offhandImg.show()
        else offhandImg.hide()
      }
    })
  }

  async reloadHotbar () {
    function updateSlot (key, item) {
      const sprite = item ? invsprite[item.name] : invsprite.air
      const slotImage = this.shadowRoot.getElementById('hotbar-' + key)
      slotImage.style['background-position-x'] = `-${sprite.x * 2}px`
      slotImage.style['background-position-y'] = `-${sprite.y * 2}px`
      slotImage.innerHTML = item?.count > 1 ? item.count : ''
      if (key === 'offhand') {
        const offhandImg = this.shadowRoot.getElementById('hotbar-offhand-image')
        if (item) offhandImg.show()
        else offhandImg.hide()
      }
    }
    for (let i = 0; i < 9; i++) {
      updateSlot(i, this.bot.inventory.slots[this.bot.inventory.hotbarStart + i])
    }
    updateSlot('offhand', this.bot.getEquipmentDestSlot('off-hand'))
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
      viewerVersion: { type: String },
      activeItemName: { type: String }
    }
  }

  static get styles () {
    return css`
    #hotbar-wrapper {
      image-rendering: optimizeSpeed;
      image-rendering: -moz-crisp-edges;
      image-rendering: -webkit-optimize-contrast;
      image-rendering: -o-crisp-edges;
      image-rendering: pixelated;
      -ms-interpolation-mode: nearest-neighbor;
    }

    #hotbar-image {
      position: absolute;
      top: 100%;
      left: 50%;
      height: calc(256px * 4);
      width: calc(256px * 4);
      transform: translate(calc((28.906% + 0% - 100%) / 2), calc(0% + 91.406% - 100%));
      clip-path: inset(0% 28.906% 91.406% 0%); // Magic numbers - use https://bennettfeely.com/clippy/ and manually adjust to make new clip paths
    }

    #hotbar-items-wrapper {
      position: absolute;
      top: 100%;
      left: 50%;
      height: calc(256px * 4);
      width: calc(256px * 4);
      transform: translate(calc((28.906% + 0% - 100%) / 2), calc(0% + 91.406% - 100%));
      clip-path: inset(0% 28.906% 91.406% 0%); // Magic numbers - use https://bennettfeely.com/clippy/ and manually adjust to make new clip paths
    }

    #hotbar-offhand-image {
      position: absolute;
      top: 100%;
      left: 50%;
      height: calc(256px * 4);
      width: calc(256px * 4);
      transform: translate(calc(-9.5% - (100% - 82% - 9.5%) / 2 - 45%), calc(-9% - (100% - 9% - 82.5%)));
      clip-path: inset(9% 82% 82.5% 9.5%); // Magic numbers - use https://bennettfeely.com/clippy/ and manually adjust to make new clip paths
    }
    
    #hotbar-offhand-wrapper {
      position: absolute;
      top: 100%;
      left: 50%;
      height: calc(256px * 4);
      width: calc(256px * 4);
      transform: translate(calc(-0% - (100% - 91% - 0%) / 2 - 45%), calc(-0% - (100% - 0% - 91%) + 0.5%)); // 0.5% for positioning
      clip-path: inset(0% calc(100% - 9%) calc(100% - 9%) 0%);
    }

    #hotbar-highlight {
      position: absolute;
      top: 100%;
      left: 50%;
      height: calc(256px * 4);
      width: calc(256px * 4);
      margin-left: calc(20px * 4 * 4); /* EDIT THIS TO CHANGE WHICH SLOT IS SELECTED */
      transform: translate(calc((-24px * 2) - (20px * 4 * 4) ), calc((-22px * 4) + (-24px * 4) + 4px)); /* first need to translate up to account for clipping, then account for size of image, then 1px to center vertically over the image*/
      clip-path: inset(calc(22px * 4) calc(232px * 4) calc(210px * 4) 0px);
    }

    .hotbar-item {
      display: inline-block;
      height: 32px;
      width: 64px;
      margin-top: 12px;
      margin-left: 12px;
      margin-right: 0.395px;
      background-image: url('invsprite.png');
      background-size: 2048px auto;
      text-align: right;
      font-size: 32px;
      vertical-align: top;
      padding-top: 32px;
      color: #ffffff;
      text-shadow: 2px 2px 0px #3f3f3f;
      font-family: mojangles, minecraft, monospace;
    }

    #hotbar-item-name {
      color: white;
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translate(-50%, calc(-170px));
      margin-top: 0px;
      text-shadow: rgb(63, 63, 63) 2px 2px 0px;
      font-family: mojangles, minecraft, monospace;
      font-size: 24px;
      text-align: center;
    }

    .hotbar-item-name-fader {
      opacity: 0;
      transition: visibility 0s, opacity 2s linear;
      transition-delay: 2s;
    }
    `
  }

  constructor () {
    super()
    this.activeItemName = ''
  }

  render () {
    return html`
    <div id="hotbar-wrapper">
      <p id="hotbar-item-name">${this.activeItemName}</p>
      <img id="hotbar-offhand-image" src="textures/1.16.4/gui/widgets.png">
      <img id="hotbar-image" src="textures/1.16.4/gui/widgets.png">
      <img id="hotbar-highlight" src="textures/1.16.4/gui/widgets.png">
      <div id="hotbar-offhand-wrapper">
        <div class="hotbar-item" id="hotbar-offhand"></div>
      </div>
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
