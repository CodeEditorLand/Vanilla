import {
  CancellationTokenSource
} from "../cancellation.js";
import { strictEquals } from "../equals.js";
import { CancellationError } from "../errors.js";
import { autorun } from "./autorun.js";
import {
  observableValue,
  transaction
} from "./base.js";
import { DebugNameData } from "./debugName.js";
import { Derived, derived } from "./derived.js";
class ObservableLazy {
  constructor(_computeValue) {
    this._computeValue = _computeValue;
  }
  _value = observableValue(this, void 0);
  /**
   * The cached value.
   * Does not force a computation of the value.
   */
  get cachedValue() {
    return this._value;
  }
  /**
   * Returns the cached value.
   * Computes the value if the value has not been cached yet.
   */
  getValue() {
    let v = this._value.get();
    if (!v) {
      v = this._computeValue();
      this._value.set(v, void 0);
    }
    return v;
  }
}
class ObservablePromise {
  static fromFn(fn) {
    return new ObservablePromise(fn());
  }
  _value = observableValue(
    this,
    void 0
  );
  /**
   * The promise that this object wraps.
   */
  promise;
  /**
   * The current state of the promise.
   * Is `undefined` if the promise didn't resolve yet.
   */
  promiseResult = this._value;
  constructor(promise) {
    this.promise = promise.then(
      (value) => {
        transaction((tx) => {
          this._value.set(new PromiseResult(value, void 0), tx);
        });
        return value;
      },
      (error) => {
        transaction((tx) => {
          this._value.set(new PromiseResult(void 0, error), tx);
        });
        throw error;
      }
    );
  }
}
class PromiseResult {
  constructor(data, error) {
    this.data = data;
    this.error = error;
  }
  /**
   * Returns the value if the promise resolved, otherwise throws the error.
   */
  getDataOrThrow() {
    if (this.error) {
      throw this.error;
    }
    return this.data;
  }
}
class ObservableLazyPromise {
  constructor(_computePromise) {
    this._computePromise = _computePromise;
  }
  _lazyValue = new ObservableLazy(
    () => new ObservablePromise(this._computePromise())
  );
  /**
   * Does not enforce evaluation of the promise compute function.
   * Is undefined if the promise has not been computed yet.
   */
  cachedPromiseResult = derived(
    this,
    (reader) => this._lazyValue.cachedValue.read(reader)?.promiseResult.read(reader)
  );
  getPromise() {
    return this._lazyValue.getValue().promise;
  }
}
function waitForState(observable, predicate, isError, cancellationToken) {
  if (!predicate) {
    predicate = (state) => state !== null && state !== void 0;
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
export {
  ObservableLazy,
  ObservableLazyPromise,
  ObservablePromise,
  PromiseResult,
  derivedWithCancellationToken,
  waitForState
};
