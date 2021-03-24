export class ClipboardHelper {
  async getClipboardString () {
    const promise = navigator.clipboard.readText()
      .then((text) => text.toString())
      .catch(err => {
        console.log('Something went wrong', err)
      })
    return await promise
  }

  copyToClipboard(string) {
    if(navigator.clipboard) navigator.clipboard.writeText(string);
    else console.log('Clipboard is not supported!');
  }
}
