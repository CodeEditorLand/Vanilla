import { Emitter } from "../../../base/common/event.js";
class TabFocusImpl {
  _tabFocus = false;
  _onDidChangeTabFocus = new Emitter();
  onDidChangeTabFocus = this._onDidChangeTabFocus.event;
  getTabFocusMode() {
    return this._tabFocus;
  }
  setTabFocusMode(tabFocusMode) {
    this._tabFocus = tabFocusMode;
    this._onDidChangeTabFocus.fire(this._tabFocus);
  }
}
const TabFocus = new TabFocusImpl();
export {
  TabFocus
};
