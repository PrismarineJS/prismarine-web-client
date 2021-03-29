const { LitElement, html, css } = require('lit-element')
const invsprite = require('./invsprite.json')

const guiScale = 3;

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
      if (slot >= this.bot.inventory.hotbarStart + 9) return
      if (slot < this.bot.inventory.hotbarStart) return

      const sprite = newItem ? invsprite[newItem.name] : invsprite.air
      const slotImage = this.shadowRoot.getElementById('hotbar-' + (slot - this.bot.inventory.hotbarStart)).firstElementChild;
      slotImage.style['background-position-x'] = `-${sprite.x * (guiScale / 2)}px`
      slotImage.style['background-position-y'] = `-${sprite.y * (guiScale / 2)}px`
      slotImage.nextElementSibling.innerHTML = newItem?.count > 1 ? newItem.count : ''
    })
  }

  async reloadHotbar () {
    for (let i = 0; i < 9; i++) {
      const item = this.bot.inventory.slots[this.bot.inventory.hotbarStart + i]
      const sprite = item ? invsprite[item.name] : invsprite.air
      const slotImage = this.shadowRoot.getElementById('hotbar-' + i).firstElementChild;
      slotImage.style['background-position-x'] = `-${sprite.x * (guiScale / 2)}px`
      slotImage.style['background-position-y'] = `-${sprite.y * (guiScale / 2)}px`
      slotImage.nextElementSibling.innerHTML = item?.count > 1 ? item.count : ''
    }
  }

  async reloadHotbarSelected (slot) {
    const item = this.bot.inventory.slots[this.bot.inventory.hotbarStart + slot]

    const hotbarSlots = this.shadowRoot.querySelectorAll('.hotbar-slot');
    for (let i = 0; i < hotbarSlots.length; i++) {
      const hotbarSlot = hotbarSlots[i];
      
      hotbarSlot.classList.remove('selected');
      if(slot == i) hotbarSlot.classList.add('selected');
    }

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
    .hotbar-item-name-fader {
      opacity: 0;
      transition: visibility 0s, opacity 2s linear;
      transition-delay: 2s;
    }

    /* New */
    #hotbar-item-name {
      --guiScale: 3;
      position: absolute;
      bottom: calc(49px * var(--guiScale));
      left: 50%;
      transform: translate(-50%);
      margin-top: 0px;

      font-family: mojangles, minecraft, monospace;
      font-size: calc(10px * var(--guiScale));

      color: white;
      text-align: center;
      text-shadow: calc(1px * var(--guiScale)) calc(1px * var(--guiScale)) rgb(63, 63, 63);
    }

    .hotbar {
      --guiScale: 3;

      image-rendering: optimizeSpeed;
      image-rendering: -moz-crisp-edges;
      image-rendering: -webkit-optimize-contrast;
      image-rendering: -o-crisp-edges;
      image-rendering: pixelated;
      -ms-interpolation-mode: nearest-neighbor;

      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%);
    
      display: flex;
    
      width: calc(182px * var(--guiScale));
      height: calc(22px * var(--guiScale));
      background-image: url('textures/1.16.4/gui/widgets.png');
      background-size: calc(256px * var(--guiScale));
    }

    .hotbar-slot:first-child {
      margin-left: calc(1px * var(--guiScale));
    }
    
    .hotbar-slot {
      position: relative;
    
      width: calc(20px * var(--guiScale));
      height: calc(22px * var(--guiScale));
    }

    .hotbar-item {
      display: block;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      height: calc(16px * var(--guiScale));
      width: calc(16px * var(--guiScale));
    
      background-image: url('invsprite.png');
      background-size: calc(512px * var(--guiScale)) auto;
    }

    .slot-stack {
      position: absolute;
      right: calc(1px * var(--guiScale));
      bottom: calc(1px * var(--guiScale));

      font-family: mojangles, minecraft, monospace;
      font-size: calc(10px * var(--guiScale));

      color: white;
      text-shadow: calc(1px * var(--guiScale)) calc(1px * var(--guiScale)) black;
    }

    .hotbar-slot.selected::after {
      content: '';
      display: block;
      position: absolute;
      top: calc(-1px * var(--guiScale));
      left: calc(-2px * var(--guiScale));
    
      width: calc(24px * var(--guiScale));
      height: calc(22px * var(--guiScale));
    
      background-image: url('textures/1.16.4/gui/widgets.png');
      background-size: calc(256px * var(--guiScale));
      background-position-y: calc(-22px * var(--guiScale));
    }

    /* Experience Bar */
    .experience-bar {
      --guiScale: 3;

      image-rendering: optimizeSpeed;
      image-rendering: -moz-crisp-edges;
      image-rendering: -webkit-optimize-contrast;
      image-rendering: -o-crisp-edges;
      image-rendering: pixelated;
      -ms-interpolation-mode: nearest-neighbor;
      
      position: absolute;
      bottom: calc(24px * var(--guiScale));
      left: 50%;
      transform: translate(-50%);

      width: calc(182px * var(--guiScale));
      height: calc(5px * var(--guiScale));
    }

    .experience-bar-progress {
      position: absolute;
      bottom: 0;
      left: calc(50% - (91px * var(--guiScale)));

      width: 0%;
      height: 100%;
    }

    .experience-bar-progress.empty {
      width: 100%;
      background-image: url('extra-textures/icons.png');
      background-size: calc(256px * var(--guiScale));
      background-position-y: calc(-64px * var(--guiScale));
    }

    .experience-bar-progress.full {
      background-image: url('extra-textures/icons.png');
      background-size: calc(256px * var(--guiScale));
      background-position-y: calc(-69px * var(--guiScale));
    }

    .experience-label {
      position: absolute;
      bottom: calc(1px * var(--guiScale));
      left: 50%;
      transform: translate(-50%);

      font-family: mojangles, minecraft, monospace;
      font-size: calc(10px * var(--guiScale));

      color: rgb(128, 255, 32);
      z-index: 1;
    }

    .experience-label.shadow1 {
      color: black;
      left: calc(50% - (1px * var(--guiScale)));
    }

    .experience-label.shadow2 {
      color: black;
      left: calc(50% + (1px * var(--guiScale)));
    }

    .experience-label.shadow3 {
      color: black;
      bottom: calc(2px * var(--guiScale));
    }

    .experience-label.shadow4 {
      color: black;
      bottom: calc(0px * var(--guiScale));
    }
    `
  }

  constructor () {
    super()
    this.activeItemName = ''
  }

  render () {    
    return html`
    <div class="experience-bar">
      <div class="experience-bar-progress empty"></div>
      <div class="experience-bar-progress full"></div>
      <span class="experience-label shadow1"></span>
      <span class="experience-label shadow2"></span>
      <span class="experience-label shadow3"></span>
      <span class="experience-label shadow4"></span>
      <span class="experience-label"></span>
    </div>

    <p id="hotbar-item-name">${this.activeItemName}</p>
    <div class="hotbar">
      <div class="hotbar-slot" id="hotbar-0"><div class="hotbar-item"></div><span class="slot-stack"><span></div>
      <div class="hotbar-slot" id="hotbar-1"><div class="hotbar-item"></div><span class="slot-stack"><span></div>
      <div class="hotbar-slot" id="hotbar-2"><div class="hotbar-item"></div><span class="slot-stack"><span></div>
      <div class="hotbar-slot" id="hotbar-3"><div class="hotbar-item"></div><span class="slot-stack"><span></div>
      <div class="hotbar-slot" id="hotbar-4"><div class="hotbar-item"></div><span class="slot-stack"><span></div>
      <div class="hotbar-slot" id="hotbar-5"><div class="hotbar-item"></div><span class="slot-stack"><span></div>
      <div class="hotbar-slot" id="hotbar-6"><div class="hotbar-item"></div><span class="slot-stack"><span></div>
      <div class="hotbar-slot" id="hotbar-7"><div class="hotbar-item"></div><span class="slot-stack"><span></div>
      <div class="hotbar-slot" id="hotbar-8"><div class="hotbar-item"></div><span class="slot-stack"><span></div>
    </div>
    `
  }
}

window.customElements.define('hot-bar', HotBar)
