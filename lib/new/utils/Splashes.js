import Calendar from "./Calendar";
import Random from "./math/Random";
import ResourceLocation from "./ResourceLocation";

const SPLASHES_LOCATION = new ResourceLocation('texts/splashes.txt');
const RANDOM = new Random();

export default class Splashes {
  constructor(username) {
    this.username = username;
    this.possibleSplashes = [];
  }

  async reload() {
    this.apply(await this.prepare());
  }

  async prepare() {
    try {
      const promise = await fetch(SPLASHES_LOCATION.getFullPath()).then(res => res.text()).then(data => data.split(/\r?\n/));
      return await Promise.all(promise);
    } catch {
      return []
    }
  }

  apply(objectIn) {
    this.possibleSplashes = [];
    this.possibleSplashes = objectIn;
  }

  getSplashText() {
    const calendar = new Calendar(new Date());

    if(calendar.get(1) + 1 === 12 && calendar.get(2) === 24) {
      return 'Merry X-mas!'
    } else if(calendar.get(1) + 1 === 1 && calendar.get(2) === 1) {
      return 'Happy new year!'
    } else if(calendar.get(1) + 1 === 10 && calendar.get(2) === 31) {
      return 'OOoooOOOoooo! Spooky!'
    } else if(this.possibleSplashes.length === 0) {
      return ''
    } else {
      return this.username != '' && RANDOM.nextInt(this.possibleSplashes.length) == 42
        ? this.username.toUpperCase() + ' IS YOU'
        : this.possibleSplashes[RANDOM.nextInt(this.possibleSplashes.length)]
    }
  }
}