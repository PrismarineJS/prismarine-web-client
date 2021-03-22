import DateFormat from './DateFormat'

const DATE_FORMAT = new DateFormat('yyyy-MM-dd_HH.mm.ss')
let lastTaken = ''

export default class ScreenShotHelper {
  static saveScreenshot(canvas) {
    const screenshot = ScreenShotHelper.createScreenshot(canvas)
    
    const downladLink = document.createElement('a')
    downladLink.setAttribute('download', ScreenShotHelper.getTimestampedForPNGFile())
    downladLink.setAttribute('href', screenshot)
    downladLink.click()
    downladLink.remove()
  }

  static createScreenshot (canvas) {
    return canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
  }

  static getTimestampedForPNGFile () {
    const formatedDate = DATE_FORMAT.format(new Date())
    let i = 1

    while (true) {
      const fileName = formatedDate + (i == 1 ? '' : '_' + i) + '.png'

      if (lastTaken != fileName) {
        lastTaken = fileName
        return fileName
      }

      i++
    }
  }
}
