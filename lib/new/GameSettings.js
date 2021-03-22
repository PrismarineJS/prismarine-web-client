import LSStore from './utils/LSStore'

export default class GameSettings {
  constructor (mcIn) {
    this.mc = mcIn

    this.showDebugInfo = false
    this.guiScale = 3
    this.hideGUI = false
    this.renderDistanceChunks = 6;
    this.loadOptions()
  }

  loadOptions () {
    if (localStorage.getItem('Options')) {
      const optionsData = new LSStore('Options', 'get')

      for (const s of optionsData.keySet()) {
        const s1 = optionsData.getString(s)

        try {
          if (s == 'guiScale') this.guiScale = parseInt(s1)
          if (s == 'hideGUI') this.hideGUI = s1 == 'true'
          if (s == 'renderDistanceChunks') this.renderDistanceChunks = parseInt(s1)
        } catch (e) {
          console.warn(`Skipping bad option: ${s}:${s1}`)
        }
      }
    }
  }

  saveOptions () {
    const lsoptions = new LSStore('Options', 'create')
    try {
      lsoptions.addLine('hideGUI:' + this.hideGUI)
      lsoptions.addLine('guiScale:' + this.guiScale)
      lsoptions.addLine('renderDistanceChunks:' + this.renderDistanceChunks)
      lsoptions.saveToLS()
    } catch (e) {
      console.warn('Failed to save options', e)
    }
  }
}
