export default class Timer {
  constructor(ticks, lastSyncSysClock) {
    this.renderPartialTicks = 0;
    this.elapsedPartialTicks = 0;
    this.tickLength = 1000.0 / ticks;
    this.lastSyncSysClock = lastSyncSysClock;
  }

  getPartialTicks(gameTime) {
    this.elapsedPartialTicks = (gameTime - this.lastSyncSysClock) / this.tickLength;
    this.lastSyncSysClock = gameTime;
    this.renderPartialTicks += this.elapsedPartialTicks;
    let i = Math.ceil(this.renderPartialTicks);
    this.renderPartialTicks -= i;
    return i;
  }
}