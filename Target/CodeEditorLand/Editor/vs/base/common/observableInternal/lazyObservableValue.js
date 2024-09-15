var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EqualityComparer } from "./commonFacade/deps.js";
import { BaseObservable, IObserver, ISettableObservable, ITransaction, TransactionImpl } from "./base.js";
import { DebugNameData } from "./debugName.js";
class LazyObservableValue extends BaseObservable {
  constructor(_debugNameData, initialValue, _equalityComparator) {
    super();
    this._debugNameData = _debugNameData;
    this._equalityComparator = _equalityComparator;
    this._value = initialValue;
  }
  static {
    __name(this, "LazyObservableValue");
  }
  _value;
  _isUpToDate = true;
  _deltas = [];
  get debugName() {
    return this._debugNameData.getDebugName(this) ?? "LazyObservableValue";
  }
  get() {
    this._update();
    return this._value;
  }
  _update() {
    if (this._isUpToDate) {
      return;
    }
    this._isUpToDate = true;
    if (this._deltas.length > 0) {
      for (const observer of this.observers) {
        for (const change of this._deltas) {
          observer.handleChange(this, change);
        }
      }
      this._deltas.length = 0;
    } else {
      for (const observer of this.observers) {
        observer.handleChange(this, void 0);
      }
    }
  }
  _updateCounter = 0;
  _beginUpdate() {
    this._updateCounter++;
    if (this._updateCounter === 1) {
      for (const observer of this.observers) {
        observer.beginUpdate(this);
      }
    }
  }
  _endUpdate() {
    this._updateCounter--;
    if (this._updateCounter === 0) {
      this._update();
      const observers = [...this.observers];
      for (const r of observers) {
        r.endUpdate(this);
      }
    }
  }
  addObserver(observer) {
    const shouldCallBeginUpdate = !this.observers.has(observer) && this._updateCounter > 0;
    super.addObserver(observer);
    if (shouldCallBeginUpdate) {
      observer.beginUpdate(this);
    }
  }
  removeObserver(observer) {
    const shouldCallEndUpdate = this.observers.has(observer) && this._updateCounter > 0;
    super.removeObserver(observer);
    if (shouldCallEndUpdate) {
      observer.endUpdate(this);
    }
  }
  set(value, tx, change) {
    if (change === void 0 && this._equalityComparator(this._value, value)) {
      return;
    }
    let _tx;
    if (!tx) {
      tx = _tx = new TransactionImpl(() => {
      }, () => `Setting ${this.debugName}`);
    }
    try {
      this._isUpToDate = false;
      this._setValue(value);
      if (change !== void 0) {
        this._deltas.push(change);
      }
      tx.updateObserver({
        beginUpdate: /* @__PURE__ */ __name(() => this._beginUpdate(), "beginUpdate"),
        endUpdate: /* @__PURE__ */ __name(() => this._endUpdate(), "endUpdate"),
        handleChange: /* @__PURE__ */ __name((observable, change2) => {
        }, "handleChange"),
        handlePossibleChange: /* @__PURE__ */ __name((observable) => {
        }, "handlePossibleChange")
      }, this);
      if (this._updateCounter > 1) {
        for (const observer of this.observers) {
          observer.handlePossibleChange(this);
        }
      }
    } finally {
      if (_tx) {
        _tx.finish();
      }
    }
  }
  toString() {
    return `${this.debugName}: ${this._value}`;
  }
  _setValue(newValue) {
    this._value = newValue;
  }
}
export {
  LazyObservableValue
};
//# sourceMappingURL=lazyObservableValue.js.map
