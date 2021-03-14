const { LitElement, html, css } = require('lit-element')

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
    const baseUrl = window.location.href.match(/(^[^#]*)/)[0]
    const self = this
    document.addEventListener('wheel', (e) => {
      const newSlot = ((this.bot.quickBarSlot + Math.sign(e.deltaY)) % 9 + 9) % 9
      this.reloadHotbarSelected(newSlot)
    })

    this.bot.inventory.on('updateSlot', (slot, oldItem, newItem) => {
      if (slot >= this.bot.inventory.hotbarStart + 9) return
      if (slot < this.bot.inventory.hotbarStart) return

      // eslint-disable-next-line no-undef
      const http = new XMLHttpRequest()
      let url = newItem ? baseUrl + 'textures/' + this.viewerVersion + '/items/' + newItem.name + '.png' : ''
      http.open('HEAD', url)

      http.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
          if (this.status === 404) {
            url = newItem ? baseUrl + 'textures/' + self.viewerVersion + '/blocks/' + newItem.name + '.png' : ''
          }
          self.shadowRoot.getElementById('hotbar-' + (slot - self.bot.inventory.hotbarStart)).src = url
        }
      }
      http.send()
    })
  }

  async reloadHotbar () {
    const baseUrl = window.location.href.match(/(^[^#]*)/)[0]
    const self = this
    for (let i = 0; i < 9; i++) {
      // eslint-disable-next-line no-undef
      const http = new XMLHttpRequest()
      let url = this.bot.inventory.slots[this.bot.inventory.hotbarStart + i] ? baseUrl + 'textures/' + this.viewerVersion + '/items/' + this.bot.inventory.slots[this.bot.inventory.hotbarStart + i].name + '.png' : ''
      http.open('HEAD', url)

      http.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
          if (this.status === 404) {
            url = self.bot.inventory.slots[self.bot.inventory.hotbarStart + i] ? baseUrl + 'textures/' + self.viewerVersion + '/blocks/' + self.bot.inventory.slots[self.bot.inventory.hotbarStart + i].name + '.png' : ''
          }
          self.shadowRoot.getElementById('hotbar-' + i).src = url
        }
      }
      http.send()
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
        height: calc(16px * 4);
        width: calc(16px * 4);
        margin-top: calc(3px * 4);
        margin-left: calc(3px * 4);
    }
    `
  }

  render () {
    return html`
    <div id="hotbar-wrapper">
      <img id="hotbar-image" src="textures/1.16.4/gui/widgets.png">
      <img id="hotbar-highlight" src="textures/1.16.4/gui/widgets.png">
      <div id="hotbar-items-wrapper">
        <img class="hotbar-item" id="hotbar-0" src="textures/1.16.4/blocks/stone.png">
        <img class="hotbar-item" id="hotbar-1" src="textures/1.16.4/items/chain.png">
        <img class="hotbar-item" id="hotbar-2" src="textures/1.16.4/items/flint_and_steel.png">
        <img class="hotbar-item" id="hotbar-3" src="textures/1.16.4/items/firework_rocket.png">
        <img class="hotbar-item" id="hotbar-4" src="textures/1.16.4/items/golden_carrot.png">
        <img class="hotbar-item" id="hotbar-5" src="textures/1.16.4/items/netherite_pickaxe.png">
        <img class="hotbar-item" id="hotbar-6" src="textures/1.16.4/items/netherite_pickaxe.png">
        <img class="hotbar-item" id="hotbar-7" src="textures/1.16.4/items/netherite_axe.png">
        <img class="hotbar-item" id="hotbar-8" src="textures/1.16.4/items/netherite_shovel.png">
      </div>
    </div>
    `
  }
}

window.customElements.define('hot-bar', HotBar)
