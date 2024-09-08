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
import * as nls from "../../../../nls.js";
import * as browser from "../../../../base/browser/browser.js";
import {
  BrowserFeatures,
  KeyboardSupport
} from "../../../../base/browser/canIUse.js";
import * as dom from "../../../../base/browser/dom.js";
import {
  StandardKeyboardEvent,
  printKeyboardEvent,
  printStandardKeyboardEvent
} from "../../../../base/browser/keyboardEvent.js";
import { mainWindow } from "../../../../base/browser/window.js";
import {
  DeferredPromise,
  RunOnceScheduler
} from "../../../../base/common/async.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { parse } from "../../../../base/common/json.js";
import {
  IMMUTABLE_CODE_TO_KEY_CODE,
  KeyCode,
  KeyCodeUtils,
  KeyMod,
  ScanCode,
  ScanCodeUtils
} from "../../../../base/common/keyCodes.js";
import { UserSettingsLabelProvider } from "../../../../base/common/keybindingLabels.js";
import { KeybindingParser } from "../../../../base/common/keybindingParser.js";
import {
  KeyCodeChord,
  ScanCodeChord
} from "../../../../base/common/keybindings.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import * as objects from "../../../../base/common/objects.js";
import {
  OS,
  OperatingSystem,
  isMacintosh
} from "../../../../base/common/platform.js";
import { dirname } from "../../../../base/common/resources.js";
import {
  isLocalizedString
} from "../../../../platform/action/common/action.js";
import { MenuRegistry } from "../../../../platform/actions/common/actions.js";
import {
  CommandsRegistry,
  ICommandService
} from "../../../../platform/commands/common/commands.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import {
  FileOperation,
  IFileService
} from "../../../../platform/files/common/files.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  Extensions
} from "../../../../platform/jsonschemas/common/jsonContributionRegistry.js";
import { AbstractKeybindingService } from "../../../../platform/keybinding/common/abstractKeybindingService.js";
import {
  IKeybindingService
} from "../../../../platform/keybinding/common/keybinding.js";
import { KeybindingResolver } from "../../../../platform/keybinding/common/keybindingResolver.js";
import {
  KeybindingWeight,
  KeybindingsRegistry
} from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ResolvedKeybindingItem } from "../../../../platform/keybinding/common/resolvedKeybindingItem.js";
import { IKeyboardLayoutService } from "../../../../platform/keyboardLayout/common/keyboardLayout.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { commandsExtensionPoint } from "../../actions/common/menusExtensionPoint.js";
import { IExtensionService } from "../../extensions/common/extensions.js";
import {
  ExtensionsRegistry
} from "../../extensions/common/extensionsRegistry.js";
import { IHostService } from "../../host/browser/host.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import {
  KeybindingIO,
  OutputBuilder
} from "../common/keybindingIO.js";
import { getAllUnboundCommands } from "./unboundCommands.js";
function isValidContributedKeyBinding(keyBinding, rejects) {
  if (!keyBinding) {
    rejects.push(nls.localize("nonempty", "expected non-empty value."));
    return false;
  }
  if (typeof keyBinding.command !== "string") {
    rejects.push(
      nls.localize(
        "requirestring",
        "property `{0}` is mandatory and must be of type `string`",
        "command"
      )
    );
    return false;
  }
  if (keyBinding.key && typeof keyBinding.key !== "string") {
    rejects.push(
      nls.localize(
        "optstring",
        "property `{0}` can be omitted or must be of type `string`",
        "key"
      )
    );
    return false;
  }
  if (keyBinding.when && typeof keyBinding.when !== "string") {
    rejects.push(
      nls.localize(
        "optstring",
        "property `{0}` can be omitted or must be of type `string`",
        "when"
      )
    );
    return false;
  }
  if (keyBinding.mac && typeof keyBinding.mac !== "string") {
    rejects.push(
      nls.localize(
        "optstring",
        "property `{0}` can be omitted or must be of type `string`",
        "mac"
      )
    );
    return false;
  }
  if (keyBinding.linux && typeof keyBinding.linux !== "string") {
    rejects.push(
      nls.localize(
        "optstring",
        "property `{0}` can be omitted or must be of type `string`",
        "linux"
      )
    );
    return false;
  }
  if (keyBinding.win && typeof keyBinding.win !== "string") {
    rejects.push(
      nls.localize(
        "optstring",
        "property `{0}` can be omitted or must be of type `string`",
        "win"
      )
    );
    return false;
  }
  return true;
}
const keybindingType = {
  type: "object",
  default: { command: "", key: "" },
  properties: {
    command: {
      description: nls.localize(
        "vscode.extension.contributes.keybindings.command",
        "Identifier of the command to run when keybinding is triggered."
      ),
      type: "string"
    },
    args: {
      description: nls.localize(
        "vscode.extension.contributes.keybindings.args",
        "Arguments to pass to the command to execute."
      )
    },
    key: {
      description: nls.localize(
        "vscode.extension.contributes.keybindings.key",
        "Key or key sequence (separate keys with plus-sign and sequences with space, e.g. Ctrl+O and Ctrl+L L for a chord)."
      ),
      type: "string"
    },
    mac: {
      description: nls.localize(
        "vscode.extension.contributes.keybindings.mac",
        "Mac specific key or key sequence."
      ),
      type: "string"
    },
    linux: {
      description: nls.localize(
        "vscode.extension.contributes.keybindings.linux",
        "Linux specific key or key sequence."
      ),
      type: "string"
    },
    win: {
      description: nls.localize(
        "vscode.extension.contributes.keybindings.win",
        "Windows specific key or key sequence."
      ),
      type: "string"
    },
    when: {
      description: nls.localize(
        "vscode.extension.contributes.keybindings.when",
        "Condition when the key is active."
      ),
      type: "string"
    }
  }
};
const keybindingsExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "keybindings",
  deps: [commandsExtensionPoint],
  jsonSchema: {
    description: nls.localize(
      "vscode.extension.contributes.keybindings",
      "Contributes keybindings."
    ),
    oneOf: [
      keybindingType,
      {
        type: "array",
        items: keybindingType
      }
    ]
  }
});
const NUMPAD_PRINTABLE_SCANCODES = [
  ScanCode.NumpadDivide,
  ScanCode.NumpadMultiply,
  ScanCode.NumpadSubtract,
  ScanCode.NumpadAdd,
  ScanCode.Numpad1,
  ScanCode.Numpad2,
  ScanCode.Numpad3,
  ScanCode.Numpad4,
  ScanCode.Numpad5,
  ScanCode.Numpad6,
  ScanCode.Numpad7,
  ScanCode.Numpad8,
  ScanCode.Numpad9,
  ScanCode.Numpad0,
  ScanCode.NumpadDecimal
];
const otherMacNumpadMapping = /* @__PURE__ */ new Map();
otherMacNumpadMapping.set(ScanCode.Numpad1, KeyCode.Digit1);
otherMacNumpadMapping.set(ScanCode.Numpad2, KeyCode.Digit2);
otherMacNumpadMapping.set(ScanCode.Numpad3, KeyCode.Digit3);
otherMacNumpadMapping.set(ScanCode.Numpad4, KeyCode.Digit4);
otherMacNumpadMapping.set(ScanCode.Numpad5, KeyCode.Digit5);
otherMacNumpadMapping.set(ScanCode.Numpad6, KeyCode.Digit6);
otherMacNumpadMapping.set(ScanCode.Numpad7, KeyCode.Digit7);
otherMacNumpadMapping.set(ScanCode.Numpad8, KeyCode.Digit8);
otherMacNumpadMapping.set(ScanCode.Numpad9, KeyCode.Digit9);
otherMacNumpadMapping.set(ScanCode.Numpad0, KeyCode.Digit0);
let WorkbenchKeybindingService = class extends AbstractKeybindingService {
  constructor(contextKeyService, commandService, telemetryService, notificationService, userDataProfileService, hostService, extensionService, fileService, uriIdentityService, logService, keyboardLayoutService) {
    super(contextKeyService, commandService, telemetryService, notificationService, logService);
    this.hostService = hostService;
    this.keyboardLayoutService = keyboardLayoutService;
    this.isComposingGlobalContextKey = contextKeyService.createKey("isComposing", false);
    this.kbsJsonSchema = new KeybindingsJsonSchema();
    this.updateKeybindingsJsonSchema();
    this._keyboardMapper = this.keyboardLayoutService.getKeyboardMapper();
    this._register(this.keyboardLayoutService.onDidChangeKeyboardLayout(() => {
      this._keyboardMapper = this.keyboardLayoutService.getKeyboardMapper();
      this.updateResolver();
    }));
    this._keybindingHoldMode = null;
    this._cachedResolver = null;
    this.userKeybindings = this._register(new UserKeybindings(userDataProfileService, uriIdentityService, fileService, logService));
    this.userKeybindings.initialize().then(() => {
      if (this.userKeybindings.keybindings.length) {
        this.updateResolver();
      }
    });
    this._register(this.userKeybindings.onDidChange(() => {
      logService.debug("User keybindings changed");
      this.updateResolver();
    }));
    keybindingsExtPoint.setHandler((extensions) => {
      const keybindings = [];
      for (const extension of extensions) {
        this._handleKeybindingsExtensionPointUser(extension.description.identifier, extension.description.isBuiltin, extension.value, extension.collector, keybindings);
      }
      KeybindingsRegistry.setExtensionKeybindings(keybindings);
      this.updateResolver();
    });
    this.updateKeybindingsJsonSchema();
    this._register(extensionService.onDidRegisterExtensions(() => this.updateKeybindingsJsonSchema()));
    this._register(Event.runAndSubscribe(dom.onDidRegisterWindow, ({ window, disposables }) => disposables.add(this._registerKeyListeners(window)), { window: mainWindow, disposables: this._store }));
    this._register(browser.onDidChangeFullscreen((windowId) => {
      if (windowId !== mainWindow.vscodeWindowId) {
        return;
      }
      const keyboard = navigator.keyboard;
      if (BrowserFeatures.keyboard === KeyboardSupport.None) {
        return;
      }
      if (browser.isFullscreen(mainWindow)) {
        keyboard?.lock(["Escape"]);
      } else {
        keyboard?.unlock();
      }
      this._cachedResolver = null;
      this._onDidUpdateKeybindings.fire();
    }));
  }
  _keyboardMapper;
  _cachedResolver;
  userKeybindings;
  isComposingGlobalContextKey;
  _keybindingHoldMode;
  _contributions = [];
  kbsJsonSchema;
  _registerKeyListeners(window) {
    const disposables = new DisposableStore();
    disposables.add(
      dom.addDisposableListener(
        window,
        dom.EventType.KEY_DOWN,
        (e) => {
          if (this._keybindingHoldMode) {
            return;
          }
          this.isComposingGlobalContextKey.set(e.isComposing);
          const keyEvent = new StandardKeyboardEvent(e);
          this._log(
            `/ Received  keydown event - ${printKeyboardEvent(e)}`
          );
          this._log(
            `| Converted keydown event - ${printStandardKeyboardEvent(keyEvent)}`
          );
          const shouldPreventDefault = this._dispatch(
            keyEvent,
            keyEvent.target
          );
          if (shouldPreventDefault) {
            keyEvent.preventDefault();
          }
          this.isComposingGlobalContextKey.set(false);
        }
      )
    );
    disposables.add(
      dom.addDisposableListener(
        window,
        dom.EventType.KEY_UP,
        (e) => {
          this._resetKeybindingHoldMode();
          this.isComposingGlobalContextKey.set(e.isComposing);
          const keyEvent = new StandardKeyboardEvent(e);
          const shouldPreventDefault = this._singleModifierDispatch(
            keyEvent,
            keyEvent.target
          );
          if (shouldPreventDefault) {
            keyEvent.preventDefault();
          }
          this.isComposingGlobalContextKey.set(false);
        }
      )
    );
    return disposables;
  }
  registerSchemaContribution(contribution) {
    this._contributions.push(contribution);
    if (contribution.onDidChange) {
      this._register(
        contribution.onDidChange(
          () => this.updateKeybindingsJsonSchema()
        )
      );
    }
    this.updateKeybindingsJsonSchema();
  }
  updateKeybindingsJsonSchema() {
    this.kbsJsonSchema.updateSchema(
      this._contributions.flatMap((x) => x.getSchemaAdditions())
    );
  }
  _printKeybinding(keybinding) {
    return UserSettingsLabelProvider.toLabel(
      OS,
      keybinding.chords,
      (chord) => {
        if (chord instanceof KeyCodeChord) {
          return KeyCodeUtils.toString(chord.keyCode);
        }
        return ScanCodeUtils.toString(chord.scanCode);
      }
    ) || "[null]";
  }
  _printResolvedKeybinding(resolvedKeybinding) {
    return resolvedKeybinding.getDispatchChords().map((x) => x || "[null]").join(" ");
  }
  _printResolvedKeybindings(output, input, resolvedKeybindings) {
    const padLength = 35;
    const firstRow = `${input.padStart(padLength, " ")} => `;
    if (resolvedKeybindings.length === 0) {
      output.push(
        `${firstRow}${"[NO BINDING]".padStart(padLength, " ")}`
      );
      return;
    }
    const firstRowIndentation = firstRow.length;
    const isFirst = true;
    for (const resolvedKeybinding of resolvedKeybindings) {
      if (isFirst) {
        output.push(
          `${firstRow}${this._printResolvedKeybinding(resolvedKeybinding).padStart(padLength, " ")}`
        );
      } else {
        output.push(
          `${" ".repeat(firstRowIndentation)}${this._printResolvedKeybinding(resolvedKeybinding).padStart(padLength, " ")}`
        );
      }
    }
  }
  _dumpResolveKeybindingDebugInfo() {
    const seenBindings = /* @__PURE__ */ new Set();
    const result = [];
    result.push(`Default Resolved Keybindings (unique only):`);
    for (const item of KeybindingsRegistry.getDefaultKeybindings()) {
      if (!item.keybinding) {
        continue;
      }
      const input = this._printKeybinding(item.keybinding);
      if (seenBindings.has(input)) {
        continue;
      }
      seenBindings.add(input);
      const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(
        item.keybinding
      );
      this._printResolvedKeybindings(result, input, resolvedKeybindings);
    }
    result.push(`User Resolved Keybindings (unique only):`);
    for (const item of this.userKeybindings.keybindings) {
      if (!item.keybinding) {
        continue;
      }
      const input = item._sourceKey ?? "Impossible: missing source key, but has keybinding";
      if (seenBindings.has(input)) {
        continue;
      }
      seenBindings.add(input);
      const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(
        item.keybinding
      );
      this._printResolvedKeybindings(result, input, resolvedKeybindings);
    }
    return result.join("\n");
  }
  _dumpDebugInfo() {
    const layoutInfo = JSON.stringify(
      this.keyboardLayoutService.getCurrentKeyboardLayout(),
      null,
      "	"
    );
    const mapperInfo = this._keyboardMapper.dumpDebugInfo();
    const resolvedKeybindings = this._dumpResolveKeybindingDebugInfo();
    const rawMapping = JSON.stringify(
      this.keyboardLayoutService.getRawKeyboardMapping(),
      null,
      "	"
    );
    return `Layout info:
${layoutInfo}

${resolvedKeybindings}

${mapperInfo}

Raw mapping:
${rawMapping}`;
  }
  _dumpDebugInfoJSON() {
    const info = {
      layout: this.keyboardLayoutService.getCurrentKeyboardLayout(),
      rawMapping: this.keyboardLayoutService.getRawKeyboardMapping()
    };
    return JSON.stringify(info, null, "	");
  }
  enableKeybindingHoldMode(commandId) {
    if (this._currentlyDispatchingCommandId !== commandId) {
      return void 0;
    }
    this._keybindingHoldMode = new DeferredPromise();
    const focusTracker = dom.trackFocus(dom.getWindow(void 0));
    const listener = focusTracker.onDidBlur(
      () => this._resetKeybindingHoldMode()
    );
    this._keybindingHoldMode.p.finally(() => {
      listener.dispose();
      focusTracker.dispose();
    });
    this._log(`+ Enabled hold-mode for ${commandId}.`);
    return this._keybindingHoldMode.p;
  }
  _resetKeybindingHoldMode() {
    if (this._keybindingHoldMode) {
      this._keybindingHoldMode?.complete();
      this._keybindingHoldMode = null;
    }
  }
  customKeybindingsCount() {
    return this.userKeybindings.keybindings.length;
  }
  updateResolver() {
    this._cachedResolver = null;
    this._onDidUpdateKeybindings.fire();
  }
  _getResolver() {
    if (!this._cachedResolver) {
      const defaults = this._resolveKeybindingItems(
        KeybindingsRegistry.getDefaultKeybindings(),
        true
      );
      const overrides = this._resolveUserKeybindingItems(
        this.userKeybindings.keybindings,
        false
      );
      this._cachedResolver = new KeybindingResolver(
        defaults,
        overrides,
        (str) => this._log(str)
      );
    }
    return this._cachedResolver;
  }
  _documentHasFocus() {
    return this.hostService.hasFocus;
  }
  _resolveKeybindingItems(items, isDefault) {
    const result = [];
    let resultLen = 0;
    for (const item of items) {
      const when = item.when || void 0;
      const keybinding = item.keybinding;
      if (keybinding) {
        if (this._assertBrowserConflicts(keybinding)) {
          continue;
        }
        const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(keybinding);
        for (let i = resolvedKeybindings.length - 1; i >= 0; i--) {
          const resolvedKeybinding = resolvedKeybindings[i];
          result[resultLen++] = new ResolvedKeybindingItem(
            resolvedKeybinding,
            item.command,
            item.commandArgs,
            when,
            isDefault,
            item.extensionId,
            item.isBuiltinExtension
          );
        }
      } else {
        result[resultLen++] = new ResolvedKeybindingItem(
          void 0,
          item.command,
          item.commandArgs,
          when,
          isDefault,
          item.extensionId,
          item.isBuiltinExtension
        );
      }
    }
    return result;
  }
  _resolveUserKeybindingItems(items, isDefault) {
    const result = [];
    let resultLen = 0;
    for (const item of items) {
      const when = item.when || void 0;
      if (item.keybinding) {
        const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(item.keybinding);
        for (const resolvedKeybinding of resolvedKeybindings) {
          result[resultLen++] = new ResolvedKeybindingItem(
            resolvedKeybinding,
            item.command,
            item.commandArgs,
            when,
            isDefault,
            null,
            false
          );
        }
      } else {
        result[resultLen++] = new ResolvedKeybindingItem(
          void 0,
          item.command,
          item.commandArgs,
          when,
          isDefault,
          null,
          false
        );
      }
    }
    return result;
  }
  _assertBrowserConflicts(keybinding) {
    if (BrowserFeatures.keyboard === KeyboardSupport.Always) {
      return false;
    }
    if (BrowserFeatures.keyboard === KeyboardSupport.FullScreen && browser.isFullscreen(mainWindow)) {
      return false;
    }
    for (const chord of keybinding.chords) {
      if (!chord.metaKey && !chord.altKey && !chord.ctrlKey && !chord.shiftKey) {
        continue;
      }
      const modifiersMask = KeyMod.CtrlCmd | KeyMod.Alt | KeyMod.Shift;
      let partModifiersMask = 0;
      if (chord.metaKey) {
        partModifiersMask |= KeyMod.CtrlCmd;
      }
      if (chord.shiftKey) {
        partModifiersMask |= KeyMod.Shift;
      }
      if (chord.altKey) {
        partModifiersMask |= KeyMod.Alt;
      }
      if (chord.ctrlKey && OS === OperatingSystem.Macintosh) {
        partModifiersMask |= KeyMod.WinCtrl;
      }
      if ((partModifiersMask & modifiersMask) === (KeyMod.CtrlCmd | KeyMod.Alt)) {
        if (chord instanceof ScanCodeChord && (chord.scanCode === ScanCode.ArrowLeft || chord.scanCode === ScanCode.ArrowRight)) {
          return true;
        }
        if (chord instanceof KeyCodeChord && (chord.keyCode === KeyCode.LeftArrow || chord.keyCode === KeyCode.RightArrow)) {
          return true;
        }
      }
      if ((partModifiersMask & modifiersMask) === KeyMod.CtrlCmd) {
        if (chord instanceof ScanCodeChord && chord.scanCode >= ScanCode.Digit1 && chord.scanCode <= ScanCode.Digit0) {
          return true;
        }
        if (chord instanceof KeyCodeChord && chord.keyCode >= KeyCode.Digit0 && chord.keyCode <= KeyCode.Digit9) {
          return true;
        }
      }
    }
    return false;
  }
  resolveKeybinding(kb) {
    return this._keyboardMapper.resolveKeybinding(kb);
  }
  resolveKeyboardEvent(keyboardEvent) {
    this.keyboardLayoutService.validateCurrentKeyboardMapping(
      keyboardEvent
    );
    return this._keyboardMapper.resolveKeyboardEvent(keyboardEvent);
  }
  resolveUserBinding(userBinding) {
    const keybinding = KeybindingParser.parseKeybinding(userBinding);
    return keybinding ? this._keyboardMapper.resolveKeybinding(keybinding) : [];
  }
  _handleKeybindingsExtensionPointUser(extensionId, isBuiltin, keybindings, collector, result) {
    if (Array.isArray(keybindings)) {
      for (let i = 0, len = keybindings.length; i < len; i++) {
        this._handleKeybinding(
          extensionId,
          isBuiltin,
          i + 1,
          keybindings[i],
          collector,
          result
        );
      }
    } else {
      this._handleKeybinding(
        extensionId,
        isBuiltin,
        1,
        keybindings,
        collector,
        result
      );
    }
  }
  _handleKeybinding(extensionId, isBuiltin, idx, keybindings, collector, result) {
    const rejects = [];
    if (isValidContributedKeyBinding(keybindings, rejects)) {
      const rule = this._asCommandRule(
        extensionId,
        isBuiltin,
        idx++,
        keybindings
      );
      if (rule) {
        result.push(rule);
      }
    }
    if (rejects.length > 0) {
      collector.error(
        nls.localize(
          "invalid.keybindings",
          "Invalid `contributes.{0}`: {1}",
          keybindingsExtPoint.name,
          rejects.join("\n")
        )
      );
    }
  }
  static bindToCurrentPlatform(key, mac, linux, win) {
    if (OS === OperatingSystem.Windows && win) {
      if (win) {
        return win;
      }
    } else if (OS === OperatingSystem.Macintosh) {
      if (mac) {
        return mac;
      }
    } else if (linux) {
      return linux;
    }
    return key;
  }
  _asCommandRule(extensionId, isBuiltin, idx, binding) {
    const { command, args, when, key, mac, linux, win } = binding;
    const keybinding = WorkbenchKeybindingService.bindToCurrentPlatform(
      key,
      mac,
      linux,
      win
    );
    if (!keybinding) {
      return void 0;
    }
    let weight;
    if (isBuiltin) {
      weight = KeybindingWeight.BuiltinExtension + idx;
    } else {
      weight = KeybindingWeight.ExternalExtension + idx;
    }
    const commandAction = MenuRegistry.getCommand(command);
    const precondition = commandAction && commandAction.precondition;
    let fullWhen;
    if (when && precondition) {
      fullWhen = ContextKeyExpr.and(
        precondition,
        ContextKeyExpr.deserialize(when)
      );
    } else if (when) {
      fullWhen = ContextKeyExpr.deserialize(when);
    } else if (precondition) {
      fullWhen = precondition;
    }
    const desc = {
      id: command,
      args,
      when: fullWhen,
      weight,
      keybinding: KeybindingParser.parseKeybinding(keybinding),
      extensionId: extensionId.value,
      isBuiltinExtension: isBuiltin
    };
    return desc;
  }
  getDefaultKeybindingsContent() {
    const resolver = this._getResolver();
    const defaultKeybindings = resolver.getDefaultKeybindings();
    const boundCommands = resolver.getDefaultBoundCommands();
    return WorkbenchKeybindingService._getDefaultKeybindings(
      defaultKeybindings
    ) + "\n\n" + WorkbenchKeybindingService._getAllCommandsAsComment(boundCommands);
  }
  static _getDefaultKeybindings(defaultKeybindings) {
    const out = new OutputBuilder();
    out.writeLine("[");
    const lastIndex = defaultKeybindings.length - 1;
    defaultKeybindings.forEach((k, index) => {
      KeybindingIO.writeKeybindingItem(out, k);
      if (index !== lastIndex) {
        out.writeLine(",");
      } else {
        out.writeLine();
      }
    });
    out.writeLine("]");
    return out.toString();
  }
  static _getAllCommandsAsComment(boundCommands) {
    const unboundCommands = getAllUnboundCommands(boundCommands);
    const pretty = unboundCommands.sort().join("\n// - ");
    return "// " + nls.localize(
      "unboundCommands",
      "Here are other available commands: "
    ) + "\n// - " + pretty;
  }
  mightProducePrintableCharacter(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return false;
    }
    const code = ScanCodeUtils.toEnum(event.code);
    if (NUMPAD_PRINTABLE_SCANCODES.indexOf(code) !== -1) {
      if (event.keyCode === IMMUTABLE_CODE_TO_KEY_CODE[code]) {
        return true;
      }
      if (isMacintosh && event.keyCode === otherMacNumpadMapping.get(code)) {
        return true;
      }
      return false;
    }
    const keycode = IMMUTABLE_CODE_TO_KEY_CODE[code];
    if (keycode !== -1) {
      return false;
    }
    const mapping = this.keyboardLayoutService.getRawKeyboardMapping();
    if (!mapping) {
      return false;
    }
    const keyInfo = mapping[event.code];
    if (!keyInfo) {
      return false;
    }
    if (!keyInfo.value || /\s/.test(keyInfo.value)) {
      return false;
    }
    return true;
  }
};
WorkbenchKeybindingService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IUserDataProfileService),
  __decorateParam(5, IHostService),
  __decorateParam(6, IExtensionService),
  __decorateParam(7, IFileService),
  __decorateParam(8, IUriIdentityService),
  __decorateParam(9, ILogService),
  __decorateParam(10, IKeyboardLayoutService)
], WorkbenchKeybindingService);
class UserKeybindings extends Disposable {
  constructor(userDataProfileService, uriIdentityService, fileService, logService) {
    super();
    this.userDataProfileService = userDataProfileService;
    this.uriIdentityService = uriIdentityService;
    this.fileService = fileService;
    this.watch();
    this.reloadConfigurationScheduler = this._register(
      new RunOnceScheduler(
        () => this.reload().then((changed) => {
          if (changed) {
            this._onDidChange.fire();
          }
        }),
        50
      )
    );
    this._register(
      Event.filter(
        this.fileService.onDidFilesChange,
        (e) => e.contains(
          this.userDataProfileService.currentProfile.keybindingsResource
        )
      )(() => {
        logService.debug("Keybindings file changed");
        this.reloadConfigurationScheduler.schedule();
      })
    );
    this._register(
      this.fileService.onDidRunOperation((e) => {
        if (e.operation === FileOperation.WRITE && e.resource.toString() === this.userDataProfileService.currentProfile.keybindingsResource.toString()) {
          logService.debug("Keybindings file written");
          this.reloadConfigurationScheduler.schedule();
        }
      })
    );
    this._register(
      userDataProfileService.onDidChangeCurrentProfile((e) => {
        if (!this.uriIdentityService.extUri.isEqual(
          e.previous.keybindingsResource,
          e.profile.keybindingsResource
        )) {
          e.join(this.whenCurrentProfileChanged());
        }
      })
    );
  }
  _rawKeybindings = [];
  _keybindings = [];
  get keybindings() {
    return this._keybindings;
  }
  reloadConfigurationScheduler;
  watchDisposables = this._register(new DisposableStore());
  _onDidChange = this._register(
    new Emitter()
  );
  onDidChange = this._onDidChange.event;
  async whenCurrentProfileChanged() {
    this.watch();
    this.reloadConfigurationScheduler.schedule();
  }
  watch() {
    this.watchDisposables.clear();
    this.watchDisposables.add(
      this.fileService.watch(
        dirname(
          this.userDataProfileService.currentProfile.keybindingsResource
        )
      )
    );
    this.watchDisposables.add(
      this.fileService.watch(
        this.userDataProfileService.currentProfile.keybindingsResource
      )
    );
  }
  async initialize() {
    await this.reload();
  }
  async reload() {
    const newKeybindings = await this.readUserKeybindings();
    if (objects.equals(this._rawKeybindings, newKeybindings)) {
      return false;
    }
    this._rawKeybindings = newKeybindings;
    this._keybindings = this._rawKeybindings.map(
      (k) => KeybindingIO.readUserKeybindingItem(k)
    );
    return true;
  }
  async readUserKeybindings() {
    try {
      const content = await this.fileService.readFile(
        this.userDataProfileService.currentProfile.keybindingsResource
      );
      const value = parse(content.value.toString());
      return Array.isArray(value) ? value.filter(
        (v) => v && typeof v === "object"
      ) : [];
    } catch (e) {
      return [];
    }
  }
}
class KeybindingsJsonSchema {
  static schemaId = "vscode://schemas/keybindings";
  commandsSchemas = [];
  commandsEnum = [];
  removalCommandsEnum = [];
  commandsEnumDescriptions = [];
  schema = {
    id: KeybindingsJsonSchema.schemaId,
    type: "array",
    title: nls.localize(
      "keybindings.json.title",
      "Keybindings configuration"
    ),
    allowTrailingCommas: true,
    allowComments: true,
    definitions: {
      editorGroupsSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            groups: {
              $ref: "#/definitions/editorGroupsSchema",
              default: [{}, {}]
            },
            size: {
              type: "number",
              default: 0.5
            }
          }
        }
      },
      commandNames: {
        type: "string",
        enum: this.commandsEnum,
        enumDescriptions: this.commandsEnumDescriptions,
        description: nls.localize(
          "keybindings.json.command",
          "Name of the command to execute"
        )
      },
      commandType: {
        anyOf: [
          // repetition of this clause here and below is intentional: one is for nice diagnostics & one is for code completion
          {
            $ref: "#/definitions/commandNames"
          },
          {
            type: "string",
            enum: this.removalCommandsEnum,
            enumDescriptions: this.commandsEnumDescriptions,
            description: nls.localize(
              "keybindings.json.removalCommand",
              "Name of the command to remove keyboard shortcut for"
            )
          },
          {
            type: "string"
          }
        ]
      },
      commandsSchemas: {
        allOf: this.commandsSchemas
      }
    },
    items: {
      required: ["key"],
      type: "object",
      defaultSnippets: [
        { body: { key: "$1", command: "$2", when: "$3" } }
      ],
      properties: {
        key: {
          type: "string",
          description: nls.localize(
            "keybindings.json.key",
            "Key or key sequence (separated by space)"
          )
        },
        command: {
          anyOf: [
            {
              if: {
                type: "array"
              },
              then: {
                not: {
                  type: "array"
                },
                errorMessage: nls.localize(
                  "keybindings.commandsIsArray",
                  `Incorrect type. Expected "{0}". The field 'command' does not support running multiple commands. Use command 'runCommands' to pass it multiple commands to run.`,
                  "string"
                )
              },
              else: {
                $ref: "#/definitions/commandType"
              }
            },
            {
              $ref: "#/definitions/commandType"
            }
          ]
        },
        when: {
          type: "string",
          description: nls.localize(
            "keybindings.json.when",
            "Condition when the key is active."
          )
        },
        args: {
          description: nls.localize(
            "keybindings.json.args",
            "Arguments to pass to the command to execute."
          )
        }
      },
      $ref: "#/definitions/commandsSchemas"
    }
  };
  schemaRegistry = Registry.as(
    Extensions.JSONContribution
  );
  constructor() {
    this.schemaRegistry.registerSchema(
      KeybindingsJsonSchema.schemaId,
      this.schema
    );
  }
  // TODO@ulugbekna: can updates happen incrementally rather than rebuilding; concerns:
  // - is just appending additional schemas enough for the registry to pick them up?
  // - can `CommandsRegistry.getCommands` and `MenuRegistry.getCommands` return different values at different times? ie would just pushing new schemas from `additionalContributions` not be enough?
  updateSchema(additionalContributions) {
    this.commandsSchemas.length = 0;
    this.commandsEnum.length = 0;
    this.removalCommandsEnum.length = 0;
    this.commandsEnumDescriptions.length = 0;
    const knownCommands = /* @__PURE__ */ new Set();
    const addKnownCommand = (commandId, description) => {
      if (!/^_/.test(commandId)) {
        if (!knownCommands.has(commandId)) {
          knownCommands.add(commandId);
          this.commandsEnum.push(commandId);
          this.commandsEnumDescriptions.push(
            isLocalizedString(description) ? description.value : description
          );
          this.removalCommandsEnum.push(`-${commandId}`);
        }
      }
    };
    const allCommands = CommandsRegistry.getCommands();
    for (const [commandId, command] of allCommands) {
      const commandMetadata = command.metadata;
      addKnownCommand(commandId, commandMetadata?.description);
      if (!commandMetadata || !commandMetadata.args || commandMetadata.args.length !== 1 || !commandMetadata.args[0].schema) {
        continue;
      }
      const argsSchema = commandMetadata.args[0].schema;
      const argsRequired = typeof commandMetadata.args[0].isOptional !== "undefined" ? !commandMetadata.args[0].isOptional : Array.isArray(argsSchema.required) && argsSchema.required.length > 0;
      const addition = {
        if: {
          required: ["command"],
          properties: {
            command: { const: commandId }
          }
        },
        then: {
          required: [].concat(
            argsRequired ? ["args"] : []
          ),
          properties: {
            args: argsSchema
          }
        }
      };
      this.commandsSchemas.push(addition);
    }
    const menuCommands = MenuRegistry.getCommands();
    for (const commandId of menuCommands.keys()) {
      addKnownCommand(commandId);
    }
    this.commandsSchemas.push(...additionalContributions);
    this.schemaRegistry.notifySchemaChanged(KeybindingsJsonSchema.schemaId);
  }
}
registerSingleton(
  IKeybindingService,
  WorkbenchKeybindingService,
  InstantiationType.Eager
);
export {
  WorkbenchKeybindingService
};
