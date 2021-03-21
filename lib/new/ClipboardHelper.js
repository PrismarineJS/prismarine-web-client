export class ClipboardHelper {
  async getClipboardString() {
    const promise = navigator.clipboard.readText()
    .then((text) => text.toString())
    .catch(err => {
      console.log('Something went wrong', err);
    });
    return await promise;
  }

  copyToClipboard(clipboardContent) {
    navigator.clipboard.writeText(clipboardContent);
  }

  setClipboardString(string) {
    if(navigator.clipboard) {
      ClipboardHelper.copyToClipboard(string);
    } else {
      console.log('Clipboard is not supported!') 
    }
  }
}