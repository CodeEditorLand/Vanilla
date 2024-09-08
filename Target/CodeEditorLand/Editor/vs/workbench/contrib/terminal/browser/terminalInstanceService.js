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
import { promiseWithResolvers } from "../../../../base/common/async.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  TerminalExtensions
} from "../../../../platform/terminal/common/terminal.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { TerminalContextKeys } from "../common/terminalContextKey.js";
import {
  ITerminalInstanceService
} from "./terminal.js";
import { TerminalInstance } from "./terminalInstance.js";
let TerminalInstanceService = class extends Disposable {
  constructor(_instantiationService, _contextKeyService, environmentService) {
    super();
    this._instantiationService = _instantiationService;
    this._contextKeyService = _contextKeyService;
    this._terminalShellTypeContextKey = TerminalContextKeys.shellType.bindTo(this._contextKeyService);
    this._terminalInRunCommandPicker = TerminalContextKeys.inTerminalRunCommandPicker.bindTo(
      this._contextKeyService
    );
    for (const remoteAuthority of [
      void 0,
      environmentService.remoteAuthority
    ]) {
      const { promise, resolve } = promiseWithResolvers();
      this._backendRegistration.set(remoteAuthority, {
        promise,
        resolve
      });
    }
  }
  _terminalShellTypeContextKey;
  _terminalInRunCommandPicker;
  _backendRegistration = /* @__PURE__ */ new Map();
  _onDidCreateInstance = this._register(
    new Emitter()
  );
  get onDidCreateInstance() {
    return this._onDidCreateInstance.event;
  }
  createInstance(config, target) {
    const shellLaunchConfig = this.convertProfileToShellLaunchConfig(config);
    const instance = this._instantiationService.createInstance(
      TerminalInstance,
      this._terminalShellTypeContextKey,
      this._terminalInRunCommandPicker,
      shellLaunchConfig
    );
    instance.target = target;
    this._onDidCreateInstance.fire(instance);
    return instance;
  }
  convertProfileToShellLaunchConfig(shellLaunchConfigOrProfile, cwd) {
    if (shellLaunchConfigOrProfile && "profileName" in shellLaunchConfigOrProfile) {
      const profile = shellLaunchConfigOrProfile;
      if (!profile.path) {
        return shellLaunchConfigOrProfile;
      }
      return {
        executable: profile.path,
        args: profile.args,
        env: profile.env,
        icon: profile.icon,
        color: profile.color,
        name: profile.overrideName ? profile.profileName : void 0,
        cwd
      };
    }
    if (shellLaunchConfigOrProfile) {
      if (cwd) {
        shellLaunchConfigOrProfile.cwd = cwd;
      }
      return shellLaunchConfigOrProfile;
    }
    return {};
  }
  async getBackend(remoteAuthority) {
    let backend = Registry.as(
      TerminalExtensions.Backend
    ).getTerminalBackend(remoteAuthority);
    if (!backend) {
      await this._backendRegistration.get(remoteAuthority)?.promise;
      backend = Registry.as(
        TerminalExtensions.Backend
      ).getTerminalBackend(remoteAuthority);
    }
    return backend;
  }
  getRegisteredBackends() {
    return Registry.as(
      TerminalExtensions.Backend
    ).backends.values();
  }
  didRegisterBackend(remoteAuthority) {
    this._backendRegistration.get(remoteAuthority)?.resolve();
  }
};
TerminalInstanceService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IWorkbenchEnvironmentService)
], TerminalInstanceService);
registerSingleton(
  ITerminalInstanceService,
  TerminalInstanceService,
  InstantiationType.Delayed
);
export {
  TerminalInstanceService
};
