import { DisposableStore } from "../common/lifecycle.js";
import { autorun } from "../common/observable.js";
import { createStyleSheet2 } from "./dom.js";
function createStyleSheetFromObservable(css) {
  const store = new DisposableStore();
  const w = store.add(createStyleSheet2());
  store.add(
    autorun((reader) => {
      w.setStyle(css.read(reader));
    })
  );
  return store;
}
export {
  createStyleSheetFromObservable
};
