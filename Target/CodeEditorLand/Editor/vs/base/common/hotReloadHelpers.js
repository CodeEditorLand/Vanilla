var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isHotReloadEnabled, registerHotReloadHandler } from "./hotReload.js";
import { IReader, observableSignalFromEvent } from "./observable.js";
function readHotReloadableExport(value, reader) {
  observeHotReloadableExports([value], reader);
  return value;
}
__name(readHotReloadableExport, "readHotReloadableExport");
function observeHotReloadableExports(values, reader) {
  if (isHotReloadEnabled()) {
    const o = observableSignalFromEvent(
      "reload",
      (event) => registerHotReloadHandler(({ oldExports }) => {
        if (![...Object.values(oldExports)].some((v) => values.includes(v))) {
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
__name(observeHotReloadableExports, "observeHotReloadableExports");
export {
  observeHotReloadableExports,
  readHotReloadableExport
};
//# sourceMappingURL=hotReloadHelpers.js.map
