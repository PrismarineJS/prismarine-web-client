export default class Splashes {
  constructor (username) {
    this.username = username
    this.possibleSplashes = []
  }

  async reload () {
    this.apply(await this.prepare())
  }

  async prepare () {
    try {
      const promise = await fetch('./extra-textures/minecraft/texts/splashes.txt').then(res => res.text()).then(data => data.split(/\r?\n/))
      return await Promise.all(promise)
    } catch {
      return []
    }
  }

  apply (objectIn) {
    this.possibleSplashes = []
    this.possibleSplashes = objectIn
  }

  getSplashText () {
    const date = new Date();

    if(date.getMonth() + 1 === 12 && date.getDate() === 24) {
      return 'Merry X-mas!'
    } else if(date.getMonth() + 1 === 1 && date.getDate() === 1) {
      return 'Happy new year!'
    } else if(date.getMonth() + 1 === 10 && date.getDate() === 31) {
      return 'OOoooOOOoooo! Spooky!'
    } else if(this.possibleSplashes.length === 0) {
      return ''
    } else {
      return this.username != '' && Math.round(Math.random() * this.possibleSplashes.length) == 42
        ? this.username.toUpperCase() + ' IS YOU'
        : this.possibleSplashes[Math.round(Math.random() * this.possibleSplashes.length)]
    }
  }
}
