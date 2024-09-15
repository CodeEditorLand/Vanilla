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
  DisposableStore,
  toDisposable
} from "../../../base/common/lifecycle.js";
import {
  extHostNamedCustomer
} from "../../services/extensions/common/extHostCustomers.js";
import {
  StatusbarAlignment
} from "../../services/statusbar/browser/statusbar.js";
import {
  ExtHostContext,
  MainContext
} from "../common/extHost.protocol.js";
import {
  IExtensionStatusBarItemService,
  StatusBarUpdateKind
} from "./statusBarExtensionPoint.js";
let MainThreadStatusBar = class {
  constructor(extHostContext, statusbarService) {
    this.statusbarService = statusbarService;
    const proxy = extHostContext.getProxy(ExtHostContext.ExtHostStatusBar);
    const entries = [];
    for (const [entryId, item] of statusbarService.getEntries()) {
      entries.push(asDto(entryId, item));
    }
    proxy.$acceptStaticEntries(entries);
    this._store.add(
      statusbarService.onDidChange((e) => {
        if (e.added) {
          proxy.$acceptStaticEntries([asDto(e.added[0], e.added[1])]);
        }
      })
    );
    function asDto(entryId, item) {
      return {
        entryId,
        name: item.entry.name,
        text: item.entry.text,
        tooltip: item.entry.tooltip,
        command: typeof item.entry.command === "string" ? item.entry.command : typeof item.entry.command === "object" ? item.entry.command.id : void 0,
        priority: item.priority,
        alignLeft: item.alignment === StatusbarAlignment.LEFT,
        accessibilityInformation: item.entry.ariaLabel ? { label: item.entry.ariaLabel, role: item.entry.role } : void 0
      };
    }
    __name(asDto, "asDto");
  }
  _store = new DisposableStore();
  dispose() {
    this._store.dispose();
  }
  $setEntry(entryId, id, extensionId, name, text, tooltip, command, color, backgroundColor, alignLeft, priority, accessibilityInformation) {
    const kind = this.statusbarService.setOrUpdateEntry(
      entryId,
      id,
      extensionId,
      name,
      text,
      tooltip,
      command,
      color,
      backgroundColor,
      alignLeft,
      priority,
      accessibilityInformation
    );
    if (kind === StatusBarUpdateKind.DidDefine) {
      this._store.add(
        toDisposable(() => this.statusbarService.unsetEntry(entryId))
      );
    }
  }
  $disposeEntry(entryId) {
    this.statusbarService.unsetEntry(entryId);
  }
};
__name(MainThreadStatusBar, "MainThreadStatusBar");
MainThreadStatusBar = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadStatusBar),
  __decorateParam(1, IExtensionStatusBarItemService)
], MainThreadStatusBar);
export {
  MainThreadStatusBar
};
//# sourceMappingURL=mainThreadStatusBar.js.map
