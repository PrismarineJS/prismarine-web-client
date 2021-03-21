export default class DateFormat {
  constructor(format) {
    this.formatPattern = format;
  }

  format(date) {
    let format = this.formatPattern;
    format = format.replace(/D+/, `${DateFormatUtils.getDayYear(date)}`);
    format = format.replace(/G+/, `${date.getFullYear() > 0 ? 'AD' : 'BC'}`);
    format = format.replace(/K+/, `${date.getHours() - (date.getHours() > 12 ? 12 : 0)}`);
    format = format.replace(/H+/, `${date.getHours()}`);
    format = format.replace(/u+/, `${date.getDate()}`);
    format = format.replace(/M+/, `0${date.getMonth() + 1}`.slice(-2));
    format = format.replace(/d+/, `${date.getDate()}`);
    format = format.replace(/a+/, `${date.getHours() > 12 ? 'PM' : 'AM'}`);
    format = format.replace(/H+/, `0${date.getHours()}`.slice(-2));
    format = format.replace(/m+/, `0${date.getMinutes()}`.slice(-2));
    format = format.replace(/s+/, `0${date.getSeconds()}`.slice(-2));
    format = format.replace(/S+/, `${date.getMilliseconds()}`);
    format = format.replace(/y+/, `${date.getFullYear()}`);
    format = format.replace(/w+/, `${DateFormatUtils.getWeekYear(date)}`);
    format = format.replace(/E+/, `${DateFormatUtils.getWeekName(date)}`);
    return format;
  }
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export class DateFormatUtils {
  static getWeekYear(dateFrom) {
    let date = new Date(dateFrom.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    let week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000- 3 + (week1.getDay() + 6) % 7) / 7);
  }

  static isLeapYear(date) {
    var year = date.getFullYear();
    if((year & 3) != 0) return false;
    return ((year % 100) != 0 || (year % 400) == 0);
  }

  static getDayYear(dateFrom) {
    var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var mn = dateFrom.getMonth();
    var dn = dateFrom.getDate();
    var dayOfYear = dayCount[mn] + dn;
    if(mn > 1 && DateFormatUtils.isLeapYear(dateFrom)) dayOfYear++;
    return dayOfYear;
  }

  static getWeekName(dateFrom) {
    return weekdays[dateFrom.getDay()]
  }
}