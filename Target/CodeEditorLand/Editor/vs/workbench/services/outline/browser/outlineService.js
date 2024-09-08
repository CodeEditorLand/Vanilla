import { Emitter } from "../../../../base/common/event.js";
import {
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { LinkedList } from "../../../../base/common/linkedList.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  IOutlineService
} from "./outline.js";
class OutlineService {
  _factories = new LinkedList();
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  canCreateOutline(pane) {
    for (const factory of this._factories) {
      if (factory.matches(pane)) {
        return true;
      }
    }
    return false;
  }
  async createOutline(pane, target, token) {
    for (const factory of this._factories) {
      if (factory.matches(pane)) {
        return await factory.createOutline(pane, target, token);
      }
    }
    return void 0;
  }
  registerOutlineCreator(creator) {
    const rm = this._factories.push(creator);
    this._onDidChange.fire();
    return toDisposable(() => {
      rm();
      this._onDidChange.fire();
    });
  }
}
registerSingleton(IOutlineService, OutlineService, InstantiationType.Delayed);
