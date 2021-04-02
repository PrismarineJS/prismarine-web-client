const { LitElement, html, css } = require('lit-element')
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

    this.bot.inventory.on('updateSlot', async (slot, oldItem, newItem) => {
      if (slot >= this.bot.inventory.hotbarStart + 9) return
      if (slot < this.bot.inventory.hotbarStart) return

      const sprite = newItem ? invsprite[newItem.name] : invsprite.air
      const slotImage = this.shadowRoot.getElementById('hotbar-' + (slot - this.bot.inventory.hotbarStart))
      slotImage.style['background-position-x'] = `-${sprite.x}px`
      slotImage.style['background-position-y'] = `-${sprite.y}px`
      slotImage.nextElementSibling.innerHTML = newItem?.count > 1 ? newItem.count : ''
    })
  }

  async reloadHotbar () {
    for (let i = 0; i < 9; i++) {
      const item = this.bot.inventory.slots[this.bot.inventory.hotbarStart + i]
      const sprite = item ? invsprite[item.name] : invsprite.air
      const slotImage = this.shadowRoot.getElementById('hotbar-' + i)
      slotImage.style['background-position-x'] = `-${sprite.x}px`
      slotImage.style['background-position-y'] = `-${sprite.y}px`
      slotImage.nextElementSibling.innerHTML = item?.count > 1 ? item.count : ''
    }
  }

  async reloadHotbarSelected (slot) {
    const item = this.bot.inventory.slots[this.bot.inventory.hotbarStart + slot]
    const planned = (20 * slot) + 'px'
    this.shadowRoot.getElementById('hotbar-selector').style.marginLeft = planned
    this.bot.setQuickBarSlot(slot)
    this.activeItemName = item?.displayName
    const name = this.shadowRoot.getElementById('hotbar-item-name')
    name.classList.remove('hotbar-item-name-fader')
    setTimeout(() => name.classList.add('hotbar-item-name-fader'), 10)
  }

  async reloadHealth (health, maxHealth = 20) {
    const renderer = this.shadowRoot.getElementById('heart-renderer')
    if (this.bot.game.gameMode === 'creative' || this.bot.game.gameMode === 'spectator') renderer.style.display = 'none'
    else renderer.style.display = 'block'

    const rows = Math.ceil(maxHealth / 20)
    const hearts = Math.floor(health / 2)
    const half = health % 2 !== 0

    renderer.innerHTML = ''
    for (let i = 0; i < rows; i++) {
      const row = document.createElement('div')
      row.className = 'heart-row'
      for (let j = 0; j < 10; j++) {
        const icon = document.createElement('div')
        icon.classList.add('heart-icon')
        if (this.bot.game.hardcore) icon.classList.add('hardcore')
        if (j < hearts) icon.classList.add('full')
        else if (half && j === hearts) icon.classList.add('half')
        row.appendChild(icon)
      }

      renderer.appendChild(row)
    }
  }

  async reloadFood (food) {
    const foods = Math.floor(food / 2)
    const half = food % 2 !== 0

    const renderer = this.shadowRoot.getElementById('food-renderer')
    if (this.bot.game.gameMode === 'creative' || this.bot.game.gameMode === 'spectator') renderer.style.display = 'none'
    else renderer.style.display = 'flex'

    renderer.innerHTML = ''
    for (let i = 0; i < 10; i++) {
      const icon = document.createElement('div')
      icon.classList.add('food-icon')
      if (i <= foods) icon.classList.add('full')
      else if (half && i === foods + 1) icon.classList.add('half')
      renderer.prepend(icon)
    }
  }

  async reloadXP (xp) {
    const xpbar = this.shadowRoot.getElementById('xp-bar')
    const labels = this.shadowRoot.querySelectorAll('.experience-label')
    if (this.bot.game.gameMode === 'creative' || this.bot.game.gameMode === 'spectator') xpbar.style.display = 'none'
    else xpbar.style.display = 'block'
    for (let i = 0; i < labels.length; i++) labels[i].innerHTML = xp.level === 0 ? '' : xp.level
    this.shadowRoot.getElementById('xp-progress').style.width = `${(xp.progress * 100).toFixed(3)}%`
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
    :host {
      --guiScale: var(--guiScaleFactor, 3);
    }
    
    .hotbar-item-name-fader {
      opacity: 0;
      transition: visibility 0s, opacity 2s linear;
      transition-delay: 2s;
    }

    /* New */
    .hotbar, .experience-bar, .heart-renderer, .food-renderer {
      image-rendering: optimizeSpeed;
      image-rendering: -moz-crisp-edges;
      image-rendering: -webkit-optimize-contrast;
      image-rendering: -o-crisp-edges;
      image-rendering: pixelated;
      -ms-interpolation-mode: nearest-neighbor;
    }

    #hotbar-item-name {
      position: absolute;
      bottom: 49px;
      left: 50%;
      transform: translate(-50%);
      margin-top: 0px;

      font-family: mojangles, minecraft, monospace;
      font-size: 10px;

      color: white;
      text-align: center;
      text-shadow: 1px 1px rgb(63, 63, 63);
    }

    .slot-stack {
      position: absolute;
      right: 1px;
      bottom: 1px;

      font-family: mojangles, minecraft, monospace;
      font-size: 10px;

      color: white;
      text-shadow: 1px 1px black;
    }

    .renderers {
      width: 100%;
      height: max-content;
    }
    
    .hud {
      position: absolute;
      left: 50%;
      bottom: 0;
      display: flex;
      flex-direction: column;
      width: max-content;
      height: max-content;
      transform-origin: bottom center;
      transform: translate(-50%) scale(var(--guiScale));
    }
    
    /* Health */
    .heart-renderer {
      position: absolute;
      bottom: 30px;
      left: calc(50% - 91px);
      display: flex;
      flex-direction: column;
      width: 82px;
      height: max-content;
    }
    
    .heart-row {
      display: grid;
      grid-template-columns: repeat(10, 8px);
      width: 82px;
      height: 9px;
    }
    
    .heart-icon {
      width: 9px;
      background-image: url('extra-textures/icons.png');
      background-size: 256px;
      background-position-x: -16px;
      background-position-y: 0px;
    }
    
    .heart-icon.half:after,
    .heart-icon.full:after {
      content: '';
      display: block;
      width: 9px;
      height: 9px;
      background-image: url('extra-textures/icons.png');
      background-size: 256px;
    }
    
    .heart-icon.full:after {
      background-position-x: -52px;
      background-position-y: 0px;
    }
    
    .heart-icon.half:after {
      background-position-x: -61px;
      background-position-y: 0px;
    }
    
    .heart-icon.hardcore.half:after {
      background-position-x: -61px;
      background-position-y: -45px;
    }
    
    .heart-icon.hardcore.full:after {
      background-position-x: -52px;
      background-position-y: -45px;
    }
    
    /* Food */
    .food-renderer {
      position: absolute;
      bottom: 30px;
      right: -1px;
      display: flex;
      flex-direction: row;
      width: 82px;
      height: 9px;
    }
    
    .food-icon {
      width: 9px;
      height: 9px;
      background-image: url('extra-textures/icons.png');
      background-size: 256px;
      background-position-x: -16px;
      background-position-y: -27px;
      margin-right: -1px;
    }
    
    .food-icon.full:after,
    .food-icon.half:after {
      content: '';
      display: block;
      width: 100%;
      height: 100%;
      background-image: url('extra-textures/icons.png');
      background-size: 256px;
    }
    
    .food-icon.full::after {
      background-position-x: -52px;
      background-position-y: -27px;
    }
    
    .food-icon.half:after {
      background-position-x: -61px;
      background-position-y: -27px;
    }
    
    /* XP */
    .experience-bar {
      position: relative;
      width: 182px;
      height: 5px;
      margin-bottom: 2px;
      background-image: url('extra-textures/icons.png');
      background-size: 256px;
      background-position-y: -64px;
    }
    
    .experience-bar-progress {
      position: absolute;
      left: calc(50% - 91px);
      width: 0%;
      height: 100%;
      background-image: url('extra-textures/icons.png');
      background-size: 256px;
      background-position-y: -69px;
    }
    
    .experience-label {
      position: absolute;
      bottom: 2px;
      left: 50%;
      transform: translate(-50%);
      font-family: mojangles, minecraft, monospace;
      font-size: 10px;
      font-weight: 100;
      color: black;
    }
    
    .experience-label.shadow1 {
      left: calc(50% - (1px));
    }
    
    .experience-label.shadow2 {
      left: calc(50% + (1px));
    }
    
    .experience-label.shadow3 {
      bottom: 3px;
    }
    
    .experience-label.shadow4 {
      bottom: 1px;
    }
    
    .experience-label:last-child {
      color: rgb(128, 255, 32);
    }
    
    /* Hotbar */
    .hotbar {
      position: relative;
      display: flex;
      width: calc(182px);
      height: calc(22px);
      background-image: url('textures/1.16.4/gui/widgets.png');
      background-size: calc(256px);
    }
    
    .hotbar-slot {
      position: relative;
      width: 20px;
      height: 22px;
    }
    
    .hotbar-slot .hotbar-item {
      position: relative;
      top: -25%;
      left: -25%;
      transform: scale(0.5);
    }
    
    .hotbar-selector {
      position: absolute;
      top: -1px;
      left: -1px;
      width: 24px;
      height: 22px;
      background-image: url('textures/1.16.4/gui/widgets.png');
      background-size: 256px;
      background-position-y: -22px;
      z-index: 3;
    }
    
    .hotbar-item {
      display: flex;
      width: 32px;
      height: 32px;
      background-image: url('invsprite.png');
      background: 2048px auto;
      background-position-x: 0px;
      background-position-y: 0px;
    }
    `
  }

  constructor () {
    super()
    this.activeItemName = ''
  }

  render () {
    return html`
      <div class="hud">
        <p id="hotbar-item-name">${this.activeItemName}</p>
        <div class="renderers">
          <div class="heart-renderer" id="heart-renderer">
          </div>
          <div class="food-renderer" id="food-renderer">
          </div>
        </div>
        <div class="experience-bar" id="xp-bar">
          <div class="experience-bar-progress" id="xp-progress"></div>
          <span class="experience-label shadow1"></span>
          <span class="experience-label shadow2"></span>
          <span class="experience-label shadow3"></span>
          <span class="experience-label shadow4"></span>
          <span class="experience-label"></span>
        </div>
        <div class="hotbar">
          <div class="hotbar-selector" id="hotbar-selector"></div>
          <div class="hotbar-slot"><div class="hotbar-item" id="hotbar-0"></div><span class="slot-stack"></span></div>
          <div class="hotbar-slot"><div class="hotbar-item" id="hotbar-1"></div><span class="slot-stack"></span></div>
          <div class="hotbar-slot"><div class="hotbar-item" id="hotbar-2"></div><span class="slot-stack"></span></div>
          <div class="hotbar-slot"><div class="hotbar-item" id="hotbar-3"></div><span class="slot-stack"></span></div>
          <div class="hotbar-slot"><div class="hotbar-item" id="hotbar-4"></div><span class="slot-stack"></span></div>
          <div class="hotbar-slot"><div class="hotbar-item" id="hotbar-5"></div><span class="slot-stack"></span></div>
          <div class="hotbar-slot"><div class="hotbar-item" id="hotbar-6"></div><span class="slot-stack"></span></div>
          <div class="hotbar-slot"><div class="hotbar-item" id="hotbar-7"></div><span class="slot-stack"></span></div>
          <div class="hotbar-slot"><div class="hotbar-item" id="hotbar-8"></div><span class="slot-stack"></span></div>
        </div>
      </div>
    `
  }
}

window.customElements.define('hot-bar', HotBar)
