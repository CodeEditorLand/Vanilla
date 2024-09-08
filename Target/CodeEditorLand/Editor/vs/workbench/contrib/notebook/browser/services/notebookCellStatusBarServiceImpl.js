import { onUnexpectedExternalError } from "../../../../../base/common/errors.js";
import { Emitter } from "../../../../../base/common/event.js";
import {
  Disposable,
  toDisposable
} from "../../../../../base/common/lifecycle.js";
class NotebookCellStatusBarService extends Disposable {
  _serviceBrand;
  _onDidChangeProviders = this._register(
    new Emitter()
  );
  onDidChangeProviders = this._onDidChangeProviders.event;
  _onDidChangeItems = this._register(new Emitter());
  onDidChangeItems = this._onDidChangeItems.event;
  _providers = [];
  registerCellStatusBarItemProvider(provider) {
    this._providers.push(provider);
    let changeListener;
    if (provider.onDidChangeStatusBarItems) {
      changeListener = provider.onDidChangeStatusBarItems(
        () => this._onDidChangeItems.fire()
      );
    }
    this._onDidChangeProviders.fire();
    return toDisposable(() => {
      changeListener?.dispose();
      const idx = this._providers.findIndex((p) => p === provider);
      this._providers.splice(idx, 1);
    });
  }
  async getStatusBarItemsForCell(docUri, cellIndex, viewType, token) {
    const providers = this._providers.filter(
      (p) => p.viewType === viewType || p.viewType === "*"
    );
    return await Promise.all(
      providers.map(async (p) => {
        try {
          return await p.provideCellStatusBarItems(
            docUri,
            cellIndex,
            token
          ) ?? { items: [] };
        } catch (e) {
          onUnexpectedExternalError(e);
          return { items: [] };
        }
      })
    );
  }
}
export {
  NotebookCellStatusBarService
};
