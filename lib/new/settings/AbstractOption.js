export default class AbstractOption {
  constructor(translationKeyIn) {
    this.translatedBaseMessage = translationKeyIn;
  }

  getBaseMessageTranslation() {
    return this.translatedBaseMessage;
 }

  createWidget(options, xIn, yIn, widthIn) {
  }
}