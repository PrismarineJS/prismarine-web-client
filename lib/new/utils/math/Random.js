export default class Random {
  constructor() {}

  nextInt(max) {
    return Math.round(this.nextFloat(max));
  }

  nextFloat(max) {
    return Math.random() * max;
  }
}