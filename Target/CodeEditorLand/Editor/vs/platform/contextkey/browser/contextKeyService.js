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
import {
  PauseableEmitter
} from "../../../base/common/event.js";
import { Iterable } from "../../../base/common/iterator.js";
import {
  Disposable,
  MutableDisposable
} from "../../../base/common/lifecycle.js";
import { MarshalledId } from "../../../base/common/marshallingIds.js";
import { cloneAndChange, distinct } from "../../../base/common/objects.js";
import { TernarySearchTree } from "../../../base/common/ternarySearchTree.js";
import { URI } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { CommandsRegistry } from "../../commands/common/commands.js";
import {
  ConfigurationTarget,
  IConfigurationService
} from "../../configuration/common/configuration.js";
import {
  IContextKeyService,
  RawContextKey
} from "../common/contextkey.js";
const KEYBINDING_CONTEXT_ATTR = "data-keybinding-context";
class Context {
  static {
    __name(this, "Context");
  }
  _parent;
  _value;
  _id;
  constructor(id, parent) {
    this._id = id;
    this._parent = parent;
    this._value = /* @__PURE__ */ Object.create(null);
    this._value["_contextId"] = id;
  }
  get value() {
    return { ...this._value };
  }
  setValue(key, value) {
    if (this._value[key] !== value) {
      this._value[key] = value;
      return true;
    }
    return false;
  }
  removeValue(key) {
    if (key in this._value) {
      delete this._value[key];
      return true;
    }
    return false;
  }
  getValue(key) {
    const ret = this._value[key];
    if (typeof ret === "undefined" && this._parent) {
      return this._parent.getValue(key);
    }
    return ret;
  }
  updateParent(parent) {
    this._parent = parent;
  }
  collectAllValues() {
    let result = this._parent ? this._parent.collectAllValues() : /* @__PURE__ */ Object.create(null);
    result = { ...result, ...this._value };
    delete result["_contextId"];
    return result;
  }
}
class NullContext extends Context {
  static {
    __name(this, "NullContext");
  }
  static INSTANCE = new NullContext();
  constructor() {
    super(-1, null);
  }
  setValue(key, value) {
    return false;
  }
  removeValue(key) {
    return false;
  }
  getValue(key) {
    return void 0;
  }
  collectAllValues() {
    return /* @__PURE__ */ Object.create(null);
  }
}
class ConfigAwareContextValuesContainer extends Context {
  constructor(id, _configurationService, emitter) {
    super(id, null);
    this._configurationService = _configurationService;
    this._listener = this._configurationService.onDidChangeConfiguration(
      (event) => {
        if (event.source === ConfigurationTarget.DEFAULT) {
          const allKeys = Array.from(this._values, ([k]) => k);
          this._values.clear();
          emitter.fire(new ArrayContextKeyChangeEvent(allKeys));
        } else {
          const changedKeys = [];
          for (const configKey of event.affectedKeys) {
            const contextKey = `config.${configKey}`;
            const cachedItems = this._values.findSuperstr(contextKey);
            if (cachedItems !== void 0) {
              changedKeys.push(
                ...Iterable.map(cachedItems, ([key]) => key)
              );
              this._values.deleteSuperstr(contextKey);
            }
            if (this._values.has(contextKey)) {
              changedKeys.push(contextKey);
              this._values.delete(contextKey);
            }
          }
          emitter.fire(new ArrayContextKeyChangeEvent(changedKeys));
        }
      }
    );
  }
  static {
    __name(this, "ConfigAwareContextValuesContainer");
  }
  static _keyPrefix = "config.";
  _values = TernarySearchTree.forConfigKeys();
  _listener;
  dispose() {
    this._listener.dispose();
  }
  getValue(key) {
    if (key.indexOf(ConfigAwareContextValuesContainer._keyPrefix) !== 0) {
      return super.getValue(key);
    }
    if (this._values.has(key)) {
      return this._values.get(key);
    }
    const configKey = key.substr(
      ConfigAwareContextValuesContainer._keyPrefix.length
    );
    const configValue = this._configurationService.getValue(configKey);
    let value;
    switch (typeof configValue) {
      case "number":
      case "boolean":
      case "string":
        value = configValue;
        break;
      default:
        if (Array.isArray(configValue)) {
          value = JSON.stringify(configValue);
        } else {
          value = configValue;
        }
    }
    this._values.set(key, value);
    return value;
  }
  setValue(key, value) {
    return super.setValue(key, value);
  }
  removeValue(key) {
    return super.removeValue(key);
  }
  collectAllValues() {
    const result = /* @__PURE__ */ Object.create(null);
    this._values.forEach((value, index) => result[index] = value);
    return { ...result, ...super.collectAllValues() };
  }
}
class ContextKey {
  static {
    __name(this, "ContextKey");
  }
  _service;
  _key;
  _defaultValue;
  constructor(service, key, defaultValue) {
    this._service = service;
    this._key = key;
    this._defaultValue = defaultValue;
    this.reset();
  }
  set(value) {
    this._service.setContext(this._key, value);
  }
  reset() {
    if (typeof this._defaultValue === "undefined") {
      this._service.removeContext(this._key);
    } else {
      this._service.setContext(this._key, this._defaultValue);
    }
  }
  get() {
    return this._service.getContextKeyValue(this._key);
  }
}
class SimpleContextKeyChangeEvent {
  constructor(key) {
    this.key = key;
  }
  static {
    __name(this, "SimpleContextKeyChangeEvent");
  }
  affectsSome(keys) {
    return keys.has(this.key);
  }
  allKeysContainedIn(keys) {
    return this.affectsSome(keys);
  }
}
class ArrayContextKeyChangeEvent {
  constructor(keys) {
    this.keys = keys;
  }
  static {
    __name(this, "ArrayContextKeyChangeEvent");
  }
  affectsSome(keys) {
    for (const key of this.keys) {
      if (keys.has(key)) {
        return true;
      }
    }
    return false;
  }
  allKeysContainedIn(keys) {
    return this.keys.every((key) => keys.has(key));
  }
}
class CompositeContextKeyChangeEvent {
  constructor(events) {
    this.events = events;
  }
  static {
    __name(this, "CompositeContextKeyChangeEvent");
  }
  affectsSome(keys) {
    for (const e of this.events) {
      if (e.affectsSome(keys)) {
        return true;
      }
    }
    return false;
  }
  allKeysContainedIn(keys) {
    return this.events.every((evt) => evt.allKeysContainedIn(keys));
  }
}
function allEventKeysInContext(event, context) {
  return event.allKeysContainedIn(new Set(Object.keys(context)));
}
__name(allEventKeysInContext, "allEventKeysInContext");
class AbstractContextKeyService extends Disposable {
  static {
    __name(this, "AbstractContextKeyService");
  }
  _isDisposed;
  _myContextId;
  _onDidChangeContext = this._register(
    new PauseableEmitter({
      merge: /* @__PURE__ */ __name((input) => new CompositeContextKeyChangeEvent(input), "merge")
    })
  );
  onDidChangeContext = this._onDidChangeContext.event;
  constructor(myContextId) {
    super();
    this._isDisposed = false;
    this._myContextId = myContextId;
  }
  get contextId() {
    return this._myContextId;
  }
  createKey(key, defaultValue) {
    if (this._isDisposed) {
      throw new Error(`AbstractContextKeyService has been disposed`);
    }
    return new ContextKey(this, key, defaultValue);
  }
  bufferChangeEvents(callback) {
    this._onDidChangeContext.pause();
    try {
      callback();
    } finally {
      this._onDidChangeContext.resume();
    }
  }
  createScoped(domNode) {
    if (this._isDisposed) {
      throw new Error(`AbstractContextKeyService has been disposed`);
    }
    return new ScopedContextKeyService(this, domNode);
  }
  createOverlay(overlay = Iterable.empty()) {
    if (this._isDisposed) {
      throw new Error(`AbstractContextKeyService has been disposed`);
    }
    return new OverlayContextKeyService(this, overlay);
  }
  contextMatchesRules(rules) {
    if (this._isDisposed) {
      throw new Error(`AbstractContextKeyService has been disposed`);
    }
    const context = this.getContextValuesContainer(this._myContextId);
    const result = rules ? rules.evaluate(context) : true;
    return result;
  }
  getContextKeyValue(key) {
    if (this._isDisposed) {
      return void 0;
    }
    return this.getContextValuesContainer(this._myContextId).getValue(
      key
    );
  }
  setContext(key, value) {
    if (this._isDisposed) {
      return;
    }
    const myContext = this.getContextValuesContainer(this._myContextId);
    if (!myContext) {
      return;
    }
    if (myContext.setValue(key, value)) {
      this._onDidChangeContext.fire(new SimpleContextKeyChangeEvent(key));
    }
  }
  removeContext(key) {
    if (this._isDisposed) {
      return;
    }
    if (this.getContextValuesContainer(this._myContextId).removeValue(key)) {
      this._onDidChangeContext.fire(new SimpleContextKeyChangeEvent(key));
    }
  }
  getContext(target) {
    if (this._isDisposed) {
      return NullContext.INSTANCE;
    }
    return this.getContextValuesContainer(findContextAttr(target));
  }
  dispose() {
    super.dispose();
    this._isDisposed = true;
  }
}
let ContextKeyService = class extends AbstractContextKeyService {
  static {
    __name(this, "ContextKeyService");
  }
  _lastContextId;
  _contexts = /* @__PURE__ */ new Map();
  constructor(configurationService) {
    super(0);
    this._lastContextId = 0;
    const myContext = this._register(
      new ConfigAwareContextValuesContainer(
        this._myContextId,
        configurationService,
        this._onDidChangeContext
      )
    );
    this._contexts.set(this._myContextId, myContext);
  }
  getContextValuesContainer(contextId) {
    if (this._isDisposed) {
      return NullContext.INSTANCE;
    }
    return this._contexts.get(contextId) || NullContext.INSTANCE;
  }
  createChildContext(parentContextId = this._myContextId) {
    if (this._isDisposed) {
      throw new Error(`ContextKeyService has been disposed`);
    }
    const id = ++this._lastContextId;
    this._contexts.set(
      id,
      new Context(id, this.getContextValuesContainer(parentContextId))
    );
    return id;
  }
  disposeContext(contextId) {
    if (!this._isDisposed) {
      this._contexts.delete(contextId);
    }
  }
  updateParent(_parentContextKeyService) {
    throw new Error("Cannot update parent of root ContextKeyService");
  }
};
ContextKeyService = __decorateClass([
  __decorateParam(0, IConfigurationService)
], ContextKeyService);
class ScopedContextKeyService extends AbstractContextKeyService {
  static {
    __name(this, "ScopedContextKeyService");
  }
  _parent;
  _domNode;
  _parentChangeListener = this._register(
    new MutableDisposable()
  );
  constructor(parent, domNode) {
    super(parent.createChildContext());
    this._parent = parent;
    this._updateParentChangeListener();
    this._domNode = domNode;
    if (this._domNode.hasAttribute(KEYBINDING_CONTEXT_ATTR)) {
      let extraInfo = "";
      if (this._domNode.classList) {
        extraInfo = Array.from(
          this._domNode.classList.values()
        ).join(", ");
      }
      console.error(
        `Element already has context attribute${extraInfo ? ": " + extraInfo : ""}`
      );
    }
    this._domNode.setAttribute(
      KEYBINDING_CONTEXT_ATTR,
      String(this._myContextId)
    );
  }
  _updateParentChangeListener() {
    this._parentChangeListener.value = this._parent.onDidChangeContext(
      (e) => {
        const thisContainer = this._parent.getContextValuesContainer(
          this._myContextId
        );
        const thisContextValues = thisContainer.value;
        if (!allEventKeysInContext(e, thisContextValues)) {
          this._onDidChangeContext.fire(e);
        }
      }
    );
  }
  dispose() {
    if (this._isDisposed) {
      return;
    }
    this._parent.disposeContext(this._myContextId);
    this._domNode.removeAttribute(KEYBINDING_CONTEXT_ATTR);
    super.dispose();
  }
  getContextValuesContainer(contextId) {
    if (this._isDisposed) {
      return NullContext.INSTANCE;
    }
    return this._parent.getContextValuesContainer(contextId);
  }
  createChildContext(parentContextId = this._myContextId) {
    if (this._isDisposed) {
      throw new Error(`ScopedContextKeyService has been disposed`);
    }
    return this._parent.createChildContext(parentContextId);
  }
  disposeContext(contextId) {
    if (this._isDisposed) {
      return;
    }
    this._parent.disposeContext(contextId);
  }
  updateParent(parentContextKeyService) {
    if (this._parent === parentContextKeyService) {
      return;
    }
    const thisContainer = this._parent.getContextValuesContainer(
      this._myContextId
    );
    const oldAllValues = thisContainer.collectAllValues();
    this._parent = parentContextKeyService;
    this._updateParentChangeListener();
    const newParentContainer = this._parent.getContextValuesContainer(
      this._parent.contextId
    );
    thisContainer.updateParent(newParentContainer);
    const newAllValues = thisContainer.collectAllValues();
    const allValuesDiff = {
      ...distinct(oldAllValues, newAllValues),
      ...distinct(newAllValues, oldAllValues)
    };
    const changedKeys = Object.keys(allValuesDiff);
    this._onDidChangeContext.fire(
      new ArrayContextKeyChangeEvent(changedKeys)
    );
  }
}
class OverlayContext {
  constructor(parent, overlay) {
    this.parent = parent;
    this.overlay = overlay;
  }
  static {
    __name(this, "OverlayContext");
  }
  getValue(key) {
    return this.overlay.has(key) ? this.overlay.get(key) : this.parent.getValue(key);
  }
}
class OverlayContextKeyService {
  constructor(parent, overlay) {
    this.parent = parent;
    this.overlay = new Map(overlay);
  }
  static {
    __name(this, "OverlayContextKeyService");
  }
  overlay;
  get contextId() {
    return this.parent.contextId;
  }
  get onDidChangeContext() {
    return this.parent.onDidChangeContext;
  }
  bufferChangeEvents(callback) {
    this.parent.bufferChangeEvents(callback);
  }
  createKey() {
    throw new Error("Not supported.");
  }
  getContext(target) {
    return new OverlayContext(this.parent.getContext(target), this.overlay);
  }
  getContextValuesContainer(contextId) {
    const parentContext = this.parent.getContextValuesContainer(contextId);
    return new OverlayContext(parentContext, this.overlay);
  }
  contextMatchesRules(rules) {
    const context = this.getContextValuesContainer(this.contextId);
    const result = rules ? rules.evaluate(context) : true;
    return result;
  }
  getContextKeyValue(key) {
    return this.overlay.has(key) ? this.overlay.get(key) : this.parent.getContextKeyValue(key);
  }
  createScoped() {
    throw new Error("Not supported.");
  }
  createOverlay(overlay = Iterable.empty()) {
    return new OverlayContextKeyService(this, overlay);
  }
  updateParent() {
    throw new Error("Not supported.");
  }
}
function findContextAttr(domNode) {
  while (domNode) {
    if (domNode.hasAttribute(KEYBINDING_CONTEXT_ATTR)) {
      const attr = domNode.getAttribute(KEYBINDING_CONTEXT_ATTR);
      if (attr) {
        return Number.parseInt(attr, 10);
      }
      return Number.NaN;
    }
    domNode = domNode.parentElement;
  }
  return 0;
}
__name(findContextAttr, "findContextAttr");
function setContext(accessor, contextKey, contextValue) {
  const contextKeyService = accessor.get(IContextKeyService);
  contextKeyService.createKey(
    String(contextKey),
    stringifyURIs(contextValue)
  );
}
__name(setContext, "setContext");
function stringifyURIs(contextValue) {
  return cloneAndChange(contextValue, (obj) => {
    if (typeof obj === "object" && obj.$mid === MarshalledId.Uri) {
      return URI.revive(obj).toString();
    }
    if (obj instanceof URI) {
      return obj.toString();
    }
    return void 0;
  });
}
__name(stringifyURIs, "stringifyURIs");
CommandsRegistry.registerCommand("_setContext", setContext);
CommandsRegistry.registerCommand({
  id: "getContextKeyInfo",
  handler() {
    return [...RawContextKey.all()].sort(
      (a, b) => a.key.localeCompare(b.key)
    );
  },
  metadata: {
    description: localize(
      "getContextKeyInfo",
      "A command that returns information about context keys"
    ),
    args: []
  }
});
CommandsRegistry.registerCommand("_generateContextKeyInfo", () => {
  const result = [];
  const seen = /* @__PURE__ */ new Set();
  for (const info of RawContextKey.all()) {
    if (!seen.has(info.key)) {
      seen.add(info.key);
      result.push(info);
    }
  }
  result.sort((a, b) => a.key.localeCompare(b.key));
  console.log(JSON.stringify(result, void 0, 2));
});
export {
  AbstractContextKeyService,
  Context,
  ContextKeyService,
  setContext
};
//# sourceMappingURL=contextKeyService.js.map
