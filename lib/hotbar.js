const { LitElement, html, css } = require('lit-element')
const invsprite = require('./invsprite.json')

const itemsSprite = document.createElement('img')
itemsSprite.src = 'invsprite.png'
const itemIcons = new Map()

const createItemIcon = async (item) => {
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')
  c.width = 32
  c.height = 32
  ctx.imageSmoothingEnabled = false;
  (async () => {
    return ctx.drawImage(itemsSprite, item.x, item.y, 32, 32, 0, 0, 32, 32)
  })().then(() => {
    itemIcons.set(item, c)
  })
}

const getItemIcon = async (item) => {
  let icon = itemIcons.get(item)
  if (icon !== undefined) return icon
  await createItemIcon(item)
  icon = itemIcons.get(item)
  return icon
}

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
      const slotImage = this.shadowRoot.getElementById('hotbar-' + (slot - this.bot.inventory.hotbarStart)).firstElementChild

      const icon = await getItemIcon(sprite)
      slotImage.innerHTML = ''
      slotImage.appendChild(await icon)

      slotImage.nextElementSibling.innerHTML = newItem?.count > 1 ? newItem.count : ''
    })
  }

  async reloadHotbar () {
    for (let i = 0; i < 9; i++) {
      const item = this.bot.inventory.slots[this.bot.inventory.hotbarStart + i]
      const sprite = item ? invsprite[item.name] : invsprite.air
      const slotImage = this.shadowRoot.getElementById('hotbar-' + i).firstElementChild

      const icon = await getItemIcon(sprite)
      slotImage.innerHTML = ''
      slotImage.appendChild(await icon)

      slotImage.nextElementSibling.innerHTML = item?.count > 1 ? item.count : ''
    }
  }

  async reloadHotbarSelected (slot) {
    const item = this.bot.inventory.slots[this.bot.inventory.hotbarStart + slot]

    const hotbarSlots = this.shadowRoot.querySelectorAll('.hotbar-slot')
    for (let i = 0; i < hotbarSlots.length; i++) {
      const hotbarSlot = hotbarSlots[i]

      hotbarSlot.classList.remove('selected')
      if (slot === i) hotbarSlot.classList.add('selected')
    }

    this.bot.setQuickBarSlot(slot)
    this.activeItemName = item?.displayName
    const name = this.shadowRoot.getElementById('hotbar-item-name')
    name.classList.remove('hotbar-item-name-fader')
    setTimeout(() => name.classList.add('hotbar-item-name-fader'), 10)
  }

  async reloadHealth (health) {
    const renderer = this.shadowRoot.getElementById('health-renderer')
    if (this.bot.game.gameMode === 'creative') renderer.style.display = 'none'
    else renderer.style.display = 'block'

    const rows = Math.ceil(health / 20)
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
    if (this.bot.game.gameMode === 'creative') renderer.style.display = 'none'
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

    if (this.bot.game.gameMode === 'creative') xpbar.style.display = 'none'
    else xpbar.style.display = 'block'

    for (let i = 0; i < labels.length; i++) labels[i].innerHTML = xp.level === 0 ? '' : xp.level

    this.shadowRoot.getElementById('xp-progress-bar').style.width = `${(xp.progress * 100).toFixed(3)}%`
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
    }

    .hotbar-item canvas {
      width: 100%;
      height: 100%;
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

    .experience-bar {
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

    .heart-renderer {
      position: absolute;
      bottom: calc(30px * var(--guiScale));
      left: calc(50% - (91px * var(--guiScale)));
    
      display: flex;
      flex-direction: column;
    
      width: calc(82px * var(--guiScale));
      height: max-content;
    }
    
    .heart-row {
      display: flex;
      flex-direction: row;
    
      width: calc(82px * var(--guiScale));
      height: calc(9px * var(--guiScale));
    }
    
    .heart-icon {
      width: calc(9px * var(--guiScale));
      height: calc(9px * var(--guiScale));
    
      background-image: url('extra-textures/icons.png');
      background-size: calc(256px * var(--guiScale));
      background-position-x: calc(-16px * var(--guiScale));
      background-position-y: calc(0px * var(--guiScale));
    
      margin-right: calc(-1px * var(--guiScale));
    }
    
    .heart-icon.full:after {
      content: '';
      display: block;
    
      width: calc(9px * var(--guiScale));
      height: calc(9px * var(--guiScale));
    
      background-image: url('extra-textures/icons.png');
      background-size: calc(256px * var(--guiScale));
      background-position-x: calc(-52px * var(--guiScale));
      background-position-y: calc(0px * var(--guiScale));
    }
    
    .heart-icon.half:after {
      content: '';
      display: block;
    
      width: calc(9px * var(--guiScale));
      height: calc(9px * var(--guiScale));
    
      background-image: url('extra-textures/icons.png');
      background-size: calc(256px * var(--guiScale));
      background-position-x: calc(-61px * var(--guiScale));
      background-position-y: calc(0px * var(--guiScale));
    }
    
    .heart-icon.hardcore.half:after {
      background-position-x: calc(-61px * var(--guiScale));
      background-position-y: calc(-45px * var(--guiScale));
    }
    
    .heart-icon.hardcore.full:after {
      background-position-x: calc(-52px * var(--guiScale));
      background-position-y: calc(-45px * var(--guiScale));
    }

    .food-renderer {
      position: absolute;
      bottom: calc(30px * var(--guiScale));
      left: calc(50% + (10px * var(--guiScale)));
    
      display: flex;
      flex-direction: row;
    
      width: calc(82px * var(--guiScale));
      height: calc(9px * var(--guiScale));
    }
    
    .food-icon {
      width: calc(9px * var(--guiScale));
      height: calc(9px * var(--guiScale));
    
      background-image: url('extra-textures/icons.png');
      background-size: calc(256px * var(--guiScale));
      background-position-x: calc(-16px * var(--guiScale));
      background-position-y: calc(-27px * var(--guiScale));
    
      margin-right: calc(-1px * var(--guiScale));
    }
    
    .food-icon.full:after {
      content: '';
      display: block;
    
      width: calc(9px * var(--guiScale));
      height: calc(9px * var(--guiScale));
    
      background-image: url('extra-textures/icons.png');
      background-size: calc(256px * var(--guiScale));
      background-position-x: calc(-52px * var(--guiScale));
      background-position-y: calc(-27px * var(--guiScale));
    }
    
    .food-icon.half:after {
      content: '';
      display: block;
    
      width: calc(9px * var(--guiScale));
      height: calc(9px * var(--guiScale));
    
      background-image: url('extra-textures/icons.png');
      background-size: calc(256px * var(--guiScale));
      background-position-x: calc(-61px * var(--guiScale));
      background-position-y: calc(-27px * var(--guiScale));
    }
    `
  }

  constructor () {
    super()
    this.activeItemName = ''
  }

  render () {
    return html`
      <div class="heart-renderer" id="health-renderer">
      </div>

      <div class="food-renderer" id="food-renderer">
      </div>

      <div class="experience-bar" id="xp-bar">
        <div class="experience-bar-progress empty"></div>
        <div class="experience-bar-progress full" id="xp-progress-bar"></div>
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
