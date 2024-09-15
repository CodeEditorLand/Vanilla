var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../base/common/event.js";
import { ResolvedKeybinding, KeyCodeChord, Keybinding } from "../../../../base/common/keybindings.js";
import { OS } from "../../../../base/common/platform.js";
import { ContextKeyExpression, ContextKeyValue, IContextKey, IContextKeyChangeEvent, IContextKeyService, IContextKeyServiceTarget, IScopedContextKeyService } from "../../../contextkey/common/contextkey.js";
import { IKeybindingService, IKeyboardEvent } from "../../common/keybinding.js";
import { NoMatchingKb, ResolutionResult } from "../../common/keybindingResolver.js";
import { ResolvedKeybindingItem } from "../../common/resolvedKeybindingItem.js";
import { USLayoutResolvedKeybinding } from "../../common/usLayoutResolvedKeybinding.js";
class MockKeybindingContextKey {
  static {
    __name(this, "MockKeybindingContextKey");
  }
  _defaultValue;
  _value;
  constructor(defaultValue) {
    this._defaultValue = defaultValue;
    this._value = this._defaultValue;
  }
  set(value) {
    this._value = value;
  }
  reset() {
    this._value = this._defaultValue;
  }
  get() {
    return this._value;
  }
}
class MockContextKeyService {
  static {
    __name(this, "MockContextKeyService");
  }
  _serviceBrand;
  _keys = /* @__PURE__ */ new Map();
  dispose() {
  }
  createKey(key, defaultValue) {
    const ret = new MockKeybindingContextKey(defaultValue);
    this._keys.set(key, ret);
    return ret;
  }
  contextMatchesRules(rules) {
    return false;
  }
  get onDidChangeContext() {
    return Event.None;
  }
  bufferChangeEvents(callback) {
    callback();
  }
  getContextKeyValue(key) {
    const value = this._keys.get(key);
    if (value) {
      return value.get();
    }
  }
  getContext(domNode) {
    return null;
  }
  createScoped(domNode) {
    return this;
  }
  createOverlay() {
    return this;
  }
  updateParent(_parentContextKeyService) {
  }
}
class MockScopableContextKeyService extends MockContextKeyService {
  static {
    __name(this, "MockScopableContextKeyService");
  }
  /**
   * Don't implement this for all tests since we rarely depend on this behavior and it isn't implemented fully
   */
  createScoped(domNote) {
    return new MockScopableContextKeyService();
  }
}
class MockKeybindingService {
  static {
    __name(this, "MockKeybindingService");
  }
  _serviceBrand;
  inChordMode = false;
  get onDidUpdateKeybindings() {
    return Event.None;
  }
  getDefaultKeybindingsContent() {
    return "";
  }
  getDefaultKeybindings() {
    return [];
  }
  getKeybindings() {
    return [];
  }
  resolveKeybinding(keybinding) {
    return USLayoutResolvedKeybinding.resolveKeybinding(keybinding, OS);
  }
  resolveKeyboardEvent(keyboardEvent) {
    const chord = new KeyCodeChord(
      keyboardEvent.ctrlKey,
      keyboardEvent.shiftKey,
      keyboardEvent.altKey,
      keyboardEvent.metaKey,
      keyboardEvent.keyCode
    );
    return this.resolveKeybinding(chord.toKeybinding())[0];
  }
  resolveUserBinding(userBinding) {
    return [];
  }
  lookupKeybindings(commandId) {
    return [];
  }
  lookupKeybinding(commandId) {
    return void 0;
  }
  customKeybindingsCount() {
    return 0;
  }
  softDispatch(keybinding, target) {
    return NoMatchingKb;
  }
  dispatchByUserSettingsLabel(userSettingsLabel, target) {
  }
  dispatchEvent(e, target) {
    return false;
  }
  enableKeybindingHoldMode(commandId) {
    return void 0;
  }
  mightProducePrintableCharacter(e) {
    return false;
  }
  toggleLogging() {
    return false;
  }
  _dumpDebugInfo() {
    return "";
  }
  _dumpDebugInfoJSON() {
    return "";
  }
  registerSchemaContribution() {
  }
}
export {
  MockContextKeyService,
  MockKeybindingService,
  MockScopableContextKeyService
};
//# sourceMappingURL=mockKeybindingService.js.map
