var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, dispose, toDisposable } from "../../../base/common/lifecycle.js";
import { LinkedList } from "../../../base/common/linkedList.js";
function createObjectCollectionBuffer(propertySpecs, capacity) {
  return new ObjectCollectionBuffer(propertySpecs, capacity);
}
__name(createObjectCollectionBuffer, "createObjectCollectionBuffer");
class ObjectCollectionBuffer extends Disposable {
  constructor(propertySpecs, capacity) {
    super();
    this.propertySpecs = propertySpecs;
    this.capacity = capacity;
    this.view = new Float32Array(capacity * 2);
    this.buffer = this.view.buffer;
    this._entrySize = propertySpecs.length;
    for (let i = 0; i < propertySpecs.length; i++) {
      const spec = {
        offset: i,
        ...propertySpecs[i]
      };
      this._propertySpecsMap.set(spec.name, spec);
    }
    this._register(toDisposable(() => dispose(this._entries)));
  }
  static {
    __name(this, "ObjectCollectionBuffer");
  }
  buffer;
  view;
  get bufferUsedSize() {
    return this.viewUsedSize * Float32Array.BYTES_PER_ELEMENT;
  }
  get viewUsedSize() {
    return this._entries.size * this._entrySize;
  }
  _propertySpecsMap = /* @__PURE__ */ new Map();
  _entrySize;
  _entries = new LinkedList();
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  createEntry(data) {
    if (this._entries.size === this.capacity) {
      throw new Error(`Cannot create more entries ObjectCollectionBuffer entries (capacity=${this.capacity})`);
    }
    const value = new ObjectCollectionBufferEntry(this.view, this._propertySpecsMap, this._entries.size, data);
    const removeFromEntries = this._entries.push(value);
    const listeners = [];
    listeners.push(Event.forward(value.onDidChange, this._onDidChange));
    listeners.push(value.onWillDispose(() => {
      const deletedEntryIndex = value.i;
      removeFromEntries();
      this.view.set(this.view.subarray(deletedEntryIndex * this._entrySize + 2, this._entries.size * this._entrySize + 2), deletedEntryIndex * this._entrySize);
      for (const entry of this._entries) {
        if (entry.i > deletedEntryIndex) {
          entry.i--;
        }
      }
      dispose(listeners);
    }));
    return value;
  }
}
class ObjectCollectionBufferEntry extends Disposable {
  constructor(_view, _propertySpecsMap, i, data) {
    super();
    this._view = _view;
    this._propertySpecsMap = _propertySpecsMap;
    this.i = i;
    for (const propertySpec of this._propertySpecsMap.values()) {
      this._view[this.i * this._propertySpecsMap.size + propertySpec.offset] = data[propertySpec.name];
    }
  }
  static {
    __name(this, "ObjectCollectionBufferEntry");
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  _onWillDispose = this._register(new Emitter());
  onWillDispose = this._onWillDispose.event;
  dispose() {
    this._onWillDispose.fire();
    super.dispose();
  }
  set(propertyName, value) {
    this._view[this.i * this._propertySpecsMap.size + this._propertySpecsMap.get(propertyName).offset] = value;
    this._onDidChange.fire();
  }
  get(propertyName) {
    return this._view[this.i * this._propertySpecsMap.size + this._propertySpecsMap.get(propertyName).offset];
  }
}
export {
  createObjectCollectionBuffer
};
//# sourceMappingURL=objectCollectionBuffer.js.map
