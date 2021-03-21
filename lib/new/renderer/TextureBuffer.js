export default class TextureBuffer {
  constructor() {
    this.buffer = {};
  }

  add(key, source) {
    if(!this.buffer[key]) {
      this.buffer[key] = source;
    }
  }

  get(key) {
    try {
      if(!this.buffer[key]) {
        const c = document.createElement('canvas');
        c.width = c.height = 1;
        return c;
      } else {
        return this.buffer[key];
      }
    } catch(e) {
      const c = document.createElement('canvas');
      c.width = c.height = 1;
      return c;
    }
  }

  has(key) {
    return this.buffer[key] != undefined && this.buffer[key] != null;
  }

  remove(key) {
    try {
      if(this.buffer.has(key)) {
        let src = this.buffer[key];
        delete this.buffer[key];
        return src;
      }
    } catch(e) {
      Util.createLog(`Failed to remove buffer of key ${key}`)
    }
  }

  clearAll() {
    this.buffer = {};
  }
}