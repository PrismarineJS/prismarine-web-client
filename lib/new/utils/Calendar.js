export default class Calendar {
  constructor(date) {
    this.dateObj = date;
  }

  setTime(date) {
    this.dateObj = date;
  }

  get(index) {
    switch(index) {
      case 0:
        return this.dateObj.getFullYear();
      case 1:
        return this.dateObj.getMonth();
      case 2:
        return this.dateObj.getDate();
      case 4:
        return this.dateObj.getHours();
      case 5:
        return this.dateObj.getMinutes();
      case 6:
        return this.dateObj.getSeconds();
      case 7:
        return this.dateObj.getMilliseconds();
      case 8:
      default:
        return this.dateObj.getTime();
    }
  }
}