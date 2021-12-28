// Takes a prismarine-windows instance and a PlayerWin instance and connects them together.

export default class WindowManager {
  constructor (playerInventory, renderedInventory) {
    console.log('Using WindowManager!')
    this.playerInventory = playerInventory
    this.renderedInventory = renderedInventory

    console.log('registering inventory click events')

    renderedInventory.on('itemEvent', (_id, type, _pos, data) => {
      console.log('ItemEvent triggered', _id, type, _pos, data)
      if (type === 'click') {
        this.onLeftClick(data[1], playerInventory.slots[data[1] + playerInventory.inventoryStart])
      } else if (type === 'rightClick') {
        console.log('right click not implemented', data.inventoryIndex, data.item)
      }
    })
  }

  initialRender () {
    this.renderedInventory.inventoryItems = this.playerInventory.slots.slice(this.playerInventory.inventoryStart, this.playerInventory.inventoryEnd + 1).map(slot => slot ? new Item(slot ? slot.name : 'air', slot ? slot.count : 0) : new Item('air', ''))
    this.playerInventory.on('updateSlot', (slot, _oldItem, newItem) => {
      if (newItem) {
        this.renderedInventory.inventoryItems[slot - this.playerInventory.inventoryStart] = new Item(newItem.name, newItem.count)
      } else {
        this.renderedInventory.inventoryItems[slot - this.playerInventory.inventoryStart] = new Item('air', '')
      }
      this.renderedInventory.needsUpdate = true
    })
  }

  setSlot (inventoryIndex, item) {
    this.renderedInventory.inventoryItems[inventoryIndex] = item
    this.playerInventory.updateSlot(inventoryIndex + this.playerInventory.inventoryStart, item)
    console.log('set', inventoryIndex, item)
    this.renderedInventory.needsUpdate = true
  }

  onLeftClick (inventoryIndex, item) { // this code was mostly copied from the web demo with some modifications
    console.log('left click', inventoryIndex, item)
    const floating = this.renderedInventory.floatingItem
    if (floating) { // if we already have a floating item
      if (item) {
        if (floating.name === item.name) {
          // add to existing slot
          const free = item.stackSize - item.count
          const consumable = Math.min(floating.count, free)
          floating.count -= consumable
          item.count += consumable
          if (floating.count <= 0) delete this.renderedInventory.floatingItem
          this.renderedInventory.needsUpdate = true
        } else {
          // swap
          const old = this.playerInventory.slots[inventoryIndex]
          this.setSlot(inventoryIndex, this.renderedInventory.floatingItem)
          this.renderedInventory.floatingItem = old
          this.renderedInventory.needsUpdate = true
        }
      } else {
        // slot is empty, set floating item to slot
        this.setSlot(inventoryIndex, this.renderedInventory.floatingItem)
        this.renderedInventory.floatingItem = null
        this.renderedInventory.needsUpdate = true
      }
    } else { // pickup item
      this.renderedInventory.floatingItem = item
      this.setSlot(inventoryIndex, null)
    }
  }
}

class Item {
  constructor (name, count) {
    this.name = name
    this.count = count
    this.stackSize = 64
  }

  clone () {
    return new Item(this.name, this.count)
  }
}
