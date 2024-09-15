var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Event } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { MutableObservableValue } from "./observableValue.js";
import { StoredValue } from "./storedValue.js";
import { InternalTestItem } from "./testTypes.js";
let TestExclusions = class extends Disposable {
  constructor(storageService) {
    super();
    this.storageService = storageService;
  }
  static {
    __name(this, "TestExclusions");
  }
  excluded = this._register(
    MutableObservableValue.stored(new StoredValue({
      key: "excludedTestItems",
      scope: StorageScope.WORKSPACE,
      target: StorageTarget.MACHINE,
      serialization: {
        deserialize: /* @__PURE__ */ __name((v) => new Set(JSON.parse(v)), "deserialize"),
        serialize: /* @__PURE__ */ __name((v) => JSON.stringify([...v]), "serialize")
      }
    }, this.storageService), /* @__PURE__ */ new Set())
  );
  /**
   * Event that fires when the excluded tests change.
   */
  onTestExclusionsChanged = this.excluded.onDidChange;
  /**
   * Gets whether there's any excluded tests.
   */
  get hasAny() {
    return this.excluded.value.size > 0;
  }
  /**
   * Gets all excluded tests.
   */
  get all() {
    return this.excluded.value;
  }
  /**
   * Sets whether a test is excluded.
   */
  toggle(test, exclude) {
    if (exclude !== true && this.excluded.value.has(test.item.extId)) {
      this.excluded.value = new Set(Iterable.filter(this.excluded.value, (e) => e !== test.item.extId));
    } else if (exclude !== false && !this.excluded.value.has(test.item.extId)) {
      this.excluded.value = /* @__PURE__ */ new Set([...this.excluded.value, test.item.extId]);
    }
  }
  /**
   * Gets whether a test is excluded.
   */
  contains(test) {
    return this.excluded.value.has(test.item.extId);
  }
  /**
   * Removes all test exclusions.
   */
  clear() {
    this.excluded.value = /* @__PURE__ */ new Set();
  }
};
TestExclusions = __decorateClass([
  __decorateParam(0, IStorageService)
], TestExclusions);
export {
  TestExclusions
};
//# sourceMappingURL=testExclusions.js.map
