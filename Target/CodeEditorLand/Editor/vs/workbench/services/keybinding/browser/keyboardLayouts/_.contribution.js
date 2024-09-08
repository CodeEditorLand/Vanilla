class KeyboardLayoutContribution {
  static INSTANCE = new KeyboardLayoutContribution();
  _layoutInfos = [];
  get layoutInfos() {
    return this._layoutInfos;
  }
  constructor() {
  }
  registerKeyboardLayout(layout) {
    this._layoutInfos.push(layout);
  }
}
export {
  KeyboardLayoutContribution
};
