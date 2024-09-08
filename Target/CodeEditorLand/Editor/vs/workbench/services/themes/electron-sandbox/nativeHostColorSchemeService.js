var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { isBoolean, isObject } from "../../../../base/common/types.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-sandbox/environmentService.js";
import { IHostColorSchemeService } from "../common/hostColorSchemeService.js";
let NativeHostColorSchemeService = class extends Disposable {
  constructor(nativeHostService, environmentService, storageService) {
    super();
    this.nativeHostService = nativeHostService;
    this.storageService = storageService;
    this._register(
      this.nativeHostService.onDidChangeColorScheme(
        (scheme) => this.update(scheme)
      )
    );
    const initial = this.getStoredValue() ?? environmentService.window.colorScheme;
    this.dark = initial.dark;
    this.highContrast = initial.highContrast;
    this.nativeHostService.getOSColorScheme().then((scheme) => this.update(scheme));
  }
  static STORAGE_KEY = "HostColorSchemeData";
  _onDidChangeColorScheme = this._register(
    new Emitter()
  );
  onDidChangeColorScheme = this._onDidChangeColorScheme.event;
  dark;
  highContrast;
  getStoredValue() {
    const stored = this.storageService.get(
      NativeHostColorSchemeService.STORAGE_KEY,
      StorageScope.APPLICATION
    );
    if (stored) {
      try {
        const scheme = JSON.parse(stored);
        if (isObject(scheme) && isBoolean(scheme.highContrast) && isBoolean(scheme.dark)) {
          return scheme;
        }
      } catch (e) {
      }
    }
    return void 0;
  }
  update({ highContrast, dark }) {
    if (dark !== this.dark || highContrast !== this.highContrast) {
      this.dark = dark;
      this.highContrast = highContrast;
      this.storageService.store(
        NativeHostColorSchemeService.STORAGE_KEY,
        JSON.stringify({ highContrast, dark }),
        StorageScope.APPLICATION,
        StorageTarget.MACHINE
      );
      this._onDidChangeColorScheme.fire();
    }
  }
};
NativeHostColorSchemeService = __decorateClass([
  __decorateParam(0, INativeHostService),
  __decorateParam(1, INativeWorkbenchEnvironmentService),
  __decorateParam(2, IStorageService)
], NativeHostColorSchemeService);
registerSingleton(
  IHostColorSchemeService,
  NativeHostColorSchemeService,
  InstantiationType.Delayed
);
export {
  NativeHostColorSchemeService
};
