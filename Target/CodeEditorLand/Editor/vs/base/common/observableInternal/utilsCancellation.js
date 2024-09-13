var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { autorun } from "./autorun.js";
import {
  CancellationError,
  CancellationTokenSource
} from "./commonFacade/cancellation.js";
import { strictEquals } from "./commonFacade/deps.js";
import { DebugNameData } from "./debugName.js";
import { Derived } from "./derived.js";
function waitForState(observable, predicate, isError, cancellationToken) {
  if (!predicate) {
    predicate = /* @__PURE__ */ __name((state) => state !== null && state !== void 0, "predicate");
  }
  return new Promise((resolve, reject) => {
    let isImmediateRun = true;
    let shouldDispose = false;
    const stateObs = observable.map((state) => {
      return {
        isFinished: predicate(state),
        error: isError ? isError(state) : false,
        state
      };
    });
    const d = autorun((reader) => {
      const { isFinished, error, state } = stateObs.read(reader);
      if (isFinished || error) {
        if (isImmediateRun) {
          shouldDispose = true;
        } else {
          d.dispose();
        }
        if (error) {
          reject(error === true ? state : error);
        } else {
          resolve(state);
        }
      }
    });
    if (cancellationToken) {
      const dc = cancellationToken.onCancellationRequested(() => {
        d.dispose();
        dc.dispose();
        reject(new CancellationError());
      });
      if (cancellationToken.isCancellationRequested) {
        d.dispose();
        dc.dispose();
        reject(new CancellationError());
        return;
      }
    }
    isImmediateRun = false;
    if (shouldDispose) {
      d.dispose();
    }
  });
}
__name(waitForState, "waitForState");
function derivedWithCancellationToken(computeFnOrOwner, computeFnOrUndefined) {
  let computeFn;
  let owner;
  if (computeFnOrUndefined === void 0) {
    computeFn = computeFnOrOwner;
    owner = void 0;
  } else {
    owner = computeFnOrOwner;
    computeFn = computeFnOrUndefined;
  }
  let cancellationTokenSource;
  return new Derived(
    new DebugNameData(owner, void 0, computeFn),
    (r) => {
      if (cancellationTokenSource) {
        cancellationTokenSource.dispose(true);
      }
      cancellationTokenSource = new CancellationTokenSource();
      return computeFn(r, cancellationTokenSource.token);
    },
    void 0,
    void 0,
    () => cancellationTokenSource?.dispose(),
    strictEquals
  );
}
__name(derivedWithCancellationToken, "derivedWithCancellationToken");
export {
  derivedWithCancellationToken,
  waitForState
};
//# sourceMappingURL=utilsCancellation.js.map
