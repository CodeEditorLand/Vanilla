import { Emitter } from "../../../../../base/common/event.js";
class TerminalLinkProviderService {
  _linkProviders = /* @__PURE__ */ new Set();
  get linkProviders() {
    return this._linkProviders;
  }
  _onDidAddLinkProvider = new Emitter();
  get onDidAddLinkProvider() {
    return this._onDidAddLinkProvider.event;
  }
  _onDidRemoveLinkProvider = new Emitter();
  get onDidRemoveLinkProvider() {
    return this._onDidRemoveLinkProvider.event;
  }
  registerLinkProvider(linkProvider) {
    const disposables = [];
    this._linkProviders.add(linkProvider);
    this._onDidAddLinkProvider.fire(linkProvider);
    return {
      dispose: () => {
        for (const disposable of disposables) {
          disposable.dispose();
        }
        this._linkProviders.delete(linkProvider);
        this._onDidRemoveLinkProvider.fire(linkProvider);
      }
    };
  }
}
export {
  TerminalLinkProviderService
};
