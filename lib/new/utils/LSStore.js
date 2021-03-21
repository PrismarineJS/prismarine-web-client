export default class LSStore {

  constructor(lsItem, mode) {
    this.content = {};
    this.lsItem = '';
    this.itemData = '';

    if(mode.toLowerCase() === 'create') {
      this.lsItem = lsItem;
      this.itemData = ''
    } else if(mode.toLowerCase() === 'get') {
      const data = localStorage.getItem(lsItem).split("\n");
      data.forEach((line) => {
        if(line !== '') {
          this.content[line.split(':')[0]] = line.split(':')[1];
        }
      });
    }
  }

  addLine(text) {
    this.itemData += (this.itemData === '' ? text : '\n' + text);
  }

  saveToLS() {
    localStorage.setItem(this.lsItem, this.itemData)
  }

  keySet() {
    return Object.keys(this.content);
  }

  getString(key) {
    return this.content[key];
  }
}