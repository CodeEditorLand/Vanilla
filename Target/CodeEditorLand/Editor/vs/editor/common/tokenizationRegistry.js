var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Color } from "../../base/common/color.js";
import { Emitter, Event } from "../../base/common/event.js";
import { Disposable, IDisposable, toDisposable } from "../../base/common/lifecycle.js";
import { ITokenizationRegistry, ITokenizationSupportChangedEvent, ILazyTokenizationSupport } from "./languages.js";
import { ColorId } from "./encodedTokenAttributes.js";
class TokenizationRegistry {
  static {
    __name(this, "TokenizationRegistry");
  }
  _tokenizationSupports = /* @__PURE__ */ new Map();
  _factories = /* @__PURE__ */ new Map();
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  _colorMap;
  constructor() {
    this._colorMap = null;
  }
  handleChange(languageIds) {
    this._onDidChange.fire({
      changedLanguages: languageIds,
      changedColorMap: false
    });
  }
  register(languageId, support) {
    this._tokenizationSupports.set(languageId, support);
    this.handleChange([languageId]);
    return toDisposable(() => {
      if (this._tokenizationSupports.get(languageId) !== support) {
        return;
      }
      this._tokenizationSupports.delete(languageId);
      this.handleChange([languageId]);
    });
  }
  get(languageId) {
    return this._tokenizationSupports.get(languageId) || null;
  }
  registerFactory(languageId, factory) {
    this._factories.get(languageId)?.dispose();
    const myData = new TokenizationSupportFactoryData(this, languageId, factory);
    this._factories.set(languageId, myData);
    return toDisposable(() => {
      const v = this._factories.get(languageId);
      if (!v || v !== myData) {
        return;
      }
      this._factories.delete(languageId);
      v.dispose();
    });
  }
  async getOrCreate(languageId) {
    const tokenizationSupport = this.get(languageId);
    if (tokenizationSupport) {
      return tokenizationSupport;
    }
    const factory = this._factories.get(languageId);
    if (!factory || factory.isResolved) {
      return null;
    }
    await factory.resolve();
    return this.get(languageId);
  }
  isResolved(languageId) {
    const tokenizationSupport = this.get(languageId);
    if (tokenizationSupport) {
      return true;
    }
    const factory = this._factories.get(languageId);
    if (!factory || factory.isResolved) {
      return true;
    }
    return false;
  }
  setColorMap(colorMap) {
    this._colorMap = colorMap;
    this._onDidChange.fire({
      changedLanguages: Array.from(this._tokenizationSupports.keys()),
      changedColorMap: true
    });
  }
  getColorMap() {
    return this._colorMap;
  }
  getDefaultBackground() {
    if (this._colorMap && this._colorMap.length > ColorId.DefaultBackground) {
      return this._colorMap[ColorId.DefaultBackground];
    }
    return null;
  }
}
class TokenizationSupportFactoryData extends Disposable {
  constructor(_registry, _languageId, _factory) {
    super();
    this._registry = _registry;
    this._languageId = _languageId;
    this._factory = _factory;
  }
  static {
    __name(this, "TokenizationSupportFactoryData");
  }
  _isDisposed = false;
  _resolvePromise = null;
  _isResolved = false;
  get isResolved() {
    return this._isResolved;
  }
  dispose() {
    this._isDisposed = true;
    super.dispose();
  }
  async resolve() {
    if (!this._resolvePromise) {
      this._resolvePromise = this._create();
    }
    return this._resolvePromise;
  }
  async _create() {
    const value = await this._factory.tokenizationSupport;
    this._isResolved = true;
    if (value && !this._isDisposed) {
      this._register(this._registry.register(this._languageId, value));
    }
  }
}
export {
  TokenizationRegistry
};
//# sourceMappingURL=tokenizationRegistry.js.map
