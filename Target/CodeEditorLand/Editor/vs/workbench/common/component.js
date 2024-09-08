import {
  Themable
} from "../../platform/theme/common/themeService.js";
import { Memento } from "./memento.js";
class Component extends Themable {
  constructor(id, themeService, storageService) {
    super(themeService);
    this.id = id;
    this.memento = new Memento(this.id, storageService);
    this._register(
      storageService.onWillSaveState(() => {
        this.saveState();
        this.memento.saveMemento();
      })
    );
  }
  memento;
  getId() {
    return this.id;
  }
  getMemento(scope, target) {
    return this.memento.getMemento(scope, target);
  }
  reloadMemento(scope) {
    return this.memento.reloadMemento(scope);
  }
  onDidChangeMementoValue(scope, disposables) {
    return this.memento.onDidChangeValue(scope, disposables);
  }
  saveState() {
  }
}
export {
  Component
};
