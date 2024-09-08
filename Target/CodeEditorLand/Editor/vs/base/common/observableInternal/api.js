import { strictEquals } from "../equals.js";
import { ObservableValue } from "./base.js";
import { DebugNameData } from "./debugName.js";
import { LazyObservableValue } from "./lazyObservableValue.js";
function observableValueOpts(options, initialValue) {
  if (options.lazy) {
    return new LazyObservableValue(
      new DebugNameData(options.owner, options.debugName, void 0),
      initialValue,
      options.equalsFn ?? strictEquals
    );
  }
  return new ObservableValue(
    new DebugNameData(options.owner, options.debugName, void 0),
    initialValue,
    options.equalsFn ?? strictEquals
  );
}
export {
  observableValueOpts
};
