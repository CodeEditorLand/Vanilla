import { isHotReloadEnabled, registerHotReloadHandler } from "./hotReload.js";
import { observableSignalFromEvent } from "./observable.js";
function readHotReloadableExport(value, reader) {
  observeHotReloadableExports([value], reader);
  return value;
}
function observeHotReloadableExports(values, reader) {
  if (isHotReloadEnabled()) {
    const o = observableSignalFromEvent(
      "reload",
      (event) => registerHotReloadHandler(({ oldExports }) => {
        if (![...Object.values(oldExports)].some(
          (v) => values.includes(v)
        )) {
          return void 0;
        }
        return (_newExports) => {
          event(void 0);
          return true;
        };
      })
    );
    o.read(reader);
  }
}
export {
  observeHotReloadableExports,
  readHotReloadableExport
};
