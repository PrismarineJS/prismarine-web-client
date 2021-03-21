import LSStore from "./utils/LSStore";

export default class GameSettings {
  constructor(mcIn) {
    this.mc = mcIn;

    this.guiScale = 3;
    this.hideGUI = false;
    this.renderDistanceChunks = 6;
    this.loadOptions();
  }

  loadOptions() {
    if(localStorage.getItem('Options')) {
      const optionsData = new LSStore('Options', 'get');
      
      for(const s of optionsData.keySet()) {
        const s1 = optionsData.getString(s);

        try {
          if('guiScale' == s) this.guiScale = parseInt(s1);
          if('hideGUI' == s) this.hideGUI = s1 == 'true' ? true : false;
          if('renderDistanceChunks' == s) this.renderDistanceChunks = parseInt(s1);
        } catch(e) {
          console.warn(`Skipping bad option: ${s}:${s1}`);
        }
      }
    }
  }

  saveOptions() {
    const lsoptions = new LSStore('Options', 'create');
    try {
      lsoptions.addLine('hideGUI:' + this.hideGUI);
      lsoptions.addLine('guiScale:' + this.guiScale);
      lsoptions.addLine('renderDistanceChunks:' + this.renderDistanceChunks);
      lsoptions.saveToLS();
    } catch(e) {
      console.warn('Failed to save options', e);
    }
  }
}