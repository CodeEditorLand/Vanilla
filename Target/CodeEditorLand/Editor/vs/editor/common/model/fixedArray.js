var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { arrayInsert } from "../../../base/common/arrays.js";
class FixedArray {
  constructor(_default) {
    this._default = _default;
  }
  static {
    __name(this, "FixedArray");
  }
  _store = [];
  get(index) {
    if (index < this._store.length) {
      return this._store[index];
    }
    return this._default;
  }
  set(index, value) {
    while (index >= this._store.length) {
      this._store[this._store.length] = this._default;
    }
    this._store[index] = value;
  }
  replace(index, oldLength, newLength) {
    if (index >= this._store.length) {
      return;
    }
    if (oldLength === 0) {
      this.insert(index, newLength);
      return;
    } else if (newLength === 0) {
      this.delete(index, oldLength);
      return;
    }
    const before = this._store.slice(0, index);
    const after = this._store.slice(index + oldLength);
    const insertArr = arrayFill(newLength, this._default);
    this._store = before.concat(insertArr, after);
  }
  delete(deleteIndex, deleteCount) {
    if (deleteCount === 0 || deleteIndex >= this._store.length) {
      return;
    }
    this._store.splice(deleteIndex, deleteCount);
  }
  insert(insertIndex, insertCount) {
    if (insertCount === 0 || insertIndex >= this._store.length) {
      return;
    }
    const arr = [];
    for (let i = 0; i < insertCount; i++) {
      arr[i] = this._default;
    }
    this._store = arrayInsert(this._store, insertIndex, arr);
  }
}
function arrayFill(length, value) {
  const arr = [];
  for (let i = 0; i < length; i++) {
    arr[i] = value;
  }
  return arr;
}
__name(arrayFill, "arrayFill");
export {
  FixedArray
};
//# sourceMappingURL=fixedArray.js.map
