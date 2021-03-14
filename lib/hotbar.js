const { LitElement, html, css } = require('lit-element')
const invsprite = require('./invsprite.json')

class HotBar extends LitElement {
  updated (changedProperties) {
    if (changedProperties.has('bot')) {
    // inventory listener
      this.bot.on('spawn', () => {
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
      if (slot >= this.bot.inventory.hotbarStart + 9) return
      if (slot < this.bot.inventory.hotbarStart) return

      const sprite = newItem ? invsprite[newItem.name] : invsprite.air
      const slotImage = this.shadowRoot.getElementById('hotbar-' + (slot - this.bot.inventory.hotbarStart))
      slotImage.style['background-position-x'] = `-${sprite.x * 2}px`
      slotImage.style['background-position-y'] = `-${sprite.y * 2}px`
    })
  }

  async reloadHotbar () {
    for (let i = 0; i < 9; i++) {
      const item = this.bot.inventory.slots[this.bot.inventory.hotbarStart + i]
      const sprite = item ? invsprite[item.name] : invsprite.air
      const slotImage = this.shadowRoot.getElementById('hotbar-' + i)
      slotImage.style['background-position-x'] = `-${sprite.x * 2}px`
      slotImage.style['background-position-y'] = `-${sprite.y * 2}px`
    }
  }

  async reloadHotbarSelected (slot) {
    const planned = (20 * 4 * slot) + 'px'
    this.shadowRoot.getElementById('hotbar-highlight').style.marginLeft = planned
    this.bot.setQuickBarSlot(slot)
  }

  static get properties () {
    return {
      bot: { type: Object },
      viewerVersion: { type: String }
    }
  }

  static get styles () {
    return css`
    #hotbar-image {
        image-rendering: optimizeSpeed;
        image-rendering: -moz-crisp-edges;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: -o-crisp-edges;
        image-rendering: pixelated;
        -ms-interpolation-mode: nearest-neighbor;
        position: absolute;
        top: 100%;
        left: 50%;
        height: calc(256px * 4);
        width: calc(256px * 4);
        transform: translate(calc(-182px * 2), calc(-22px * 4));
        clip-path: inset(0px calc(74px * 4) calc(234px * 4) 0px);
    }
    #hotbar-items-wrapper {
        image-rendering: optimizeSpeed;
        image-rendering: -moz-crisp-edges;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: -o-crisp-edges;
        image-rendering: pixelated;
        -ms-interpolation-mode: nearest-neighbor;
        position: absolute;
        top: 100%;
        left: 50%;
        height: calc(256px * 4);
        width: calc(256px * 4);
        transform: translate(calc(-182px * 2), calc(-22px * 4));
        clip-path: inset(0px calc(74px * 4) calc(234px * 4) 0px);
    }

    #hotbar-highlight {
        image-rendering: optimizeSpeed;
        image-rendering: -moz-crisp-edges;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: -o-crisp-edges;
        image-rendering: pixelated;
        -ms-interpolation-mode: nearest-neighbor;
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
        height: 64px;
        width: 64px;
        margin-top: 12px;
        margin-left: 12px;
        background-image: url('invsprite.png');
        background-size: 2048px auto;
    }
    `
  }

  render () {
    return html`
    <div id="hotbar-wrapper">
      <img id="hotbar-image" src="textures/1.16.4/gui/widgets.png">
      <img id="hotbar-highlight" src="textures/1.16.4/gui/widgets.png">
      <div id="hotbar-items-wrapper">
        <img class="hotbar-item" id="hotbar-0">
        <img class="hotbar-item" id="hotbar-1">
        <img class="hotbar-item" id="hotbar-2">
        <img class="hotbar-item" id="hotbar-3">
        <img class="hotbar-item" id="hotbar-4">
        <img class="hotbar-item" id="hotbar-5">
        <img class="hotbar-item" id="hotbar-6">
        <img class="hotbar-item" id="hotbar-7">
        <img class="hotbar-item" id="hotbar-8">
      </div>
    </div>
    `
  }
}

window.customElements.define('hot-bar', HotBar)
