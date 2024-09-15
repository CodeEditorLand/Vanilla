var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createStyleSheet2 } from "./dom.js";
import { DisposableStore, IDisposable } from "../common/lifecycle.js";
import { autorun, IObservable } from "../common/observable.js";
function createStyleSheetFromObservable(css) {
  const store = new DisposableStore();
  const w = store.add(createStyleSheet2());
  store.add(autorun((reader) => {
    w.setStyle(css.read(reader));
  }));
  return store;
}
__name(createStyleSheetFromObservable, "createStyleSheetFromObservable");
export {
  createStyleSheetFromObservable
};
//# sourceMappingURL=domObservable.js.map
