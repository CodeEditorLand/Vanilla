import {
  Disposable
} from "../../../../../base/common/lifecycle.js";
class ResourcePool extends Disposable {
  constructor(_itemFactory) {
    super();
    this._itemFactory = _itemFactory;
  }
  pool = [];
  _inUse = /* @__PURE__ */ new Set();
  get inUse() {
    return this._inUse;
  }
  get() {
    if (this.pool.length > 0) {
      const item2 = this.pool.pop();
      this._inUse.add(item2);
      return item2;
    }
    const item = this._register(this._itemFactory());
    this._inUse.add(item);
    return item;
  }
  release(item) {
    this._inUse.delete(item);
    this.pool.push(item);
  }
}
export {
  ResourcePool
};
