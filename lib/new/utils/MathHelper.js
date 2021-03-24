export default class MathHelper {  
  static clamp(num, min, max) {
    return num < min ? min : num > max ? max : num
  }

  static lerp(pct, start, end) {
    return start + pct * (end - start);
  }

  static ceil(value) {
    let i = Math.ceil(value);
    return value > i ? i + 1 : i;
  }

  static normalizeAngle(x, y) {
    return x - (y * Math.floor(x / y));
  }
} 