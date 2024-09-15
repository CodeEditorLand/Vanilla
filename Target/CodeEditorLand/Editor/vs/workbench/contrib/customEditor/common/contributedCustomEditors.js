var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import * as nls from "../../../../nls.js";
import { IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { Memento } from "../../../common/memento.js";
import { CustomEditorDescriptor, CustomEditorInfo } from "./customEditor.js";
import { customEditorsExtensionPoint, ICustomEditorsExtensionPoint } from "./extensionPoint.js";
import { RegisteredEditorPriority } from "../../../services/editor/common/editorResolverService.js";
import { IExtensionPointUser } from "../../../services/extensions/common/extensionsRegistry.js";
class ContributedCustomEditors extends Disposable {
  static {
    __name(this, "ContributedCustomEditors");
  }
  static CUSTOM_EDITORS_STORAGE_ID = "customEditors";
  static CUSTOM_EDITORS_ENTRY_ID = "editors";
  _editors = /* @__PURE__ */ new Map();
  _memento;
  constructor(storageService) {
    super();
    this._memento = new Memento(ContributedCustomEditors.CUSTOM_EDITORS_STORAGE_ID, storageService);
    const mementoObject = this._memento.getMemento(StorageScope.PROFILE, StorageTarget.MACHINE);
    for (const info of mementoObject[ContributedCustomEditors.CUSTOM_EDITORS_ENTRY_ID] || []) {
      this.add(new CustomEditorInfo(info));
    }
    customEditorsExtensionPoint.setHandler((extensions) => {
      this.update(extensions);
    });
  }
  _onChange = this._register(new Emitter());
  onChange = this._onChange.event;
  update(extensions) {
    this._editors.clear();
    for (const extension of extensions) {
      for (const webviewEditorContribution of extension.value) {
        this.add(new CustomEditorInfo({
          id: webviewEditorContribution.viewType,
          displayName: webviewEditorContribution.displayName,
          providerDisplayName: extension.description.isBuiltin ? nls.localize("builtinProviderDisplayName", "Built-in") : extension.description.displayName || extension.description.identifier.value,
          selector: webviewEditorContribution.selector || [],
          priority: getPriorityFromContribution(webviewEditorContribution, extension.description)
        }));
      }
    }
    const mementoObject = this._memento.getMemento(StorageScope.PROFILE, StorageTarget.MACHINE);
    mementoObject[ContributedCustomEditors.CUSTOM_EDITORS_ENTRY_ID] = Array.from(this._editors.values());
    this._memento.saveMemento();
    this._onChange.fire();
  }
  [Symbol.iterator]() {
    return this._editors.values();
  }
  get(viewType) {
    return this._editors.get(viewType);
  }
  getContributedEditors(resource) {
    return Array.from(this._editors.values()).filter((customEditor) => customEditor.matches(resource));
  }
  add(info) {
    if (this._editors.has(info.id)) {
      console.error(`Custom editor with id '${info.id}' already registered`);
      return;
    }
    this._editors.set(info.id, info);
  }
}
function getPriorityFromContribution(contribution, extension) {
  switch (contribution.priority) {
    case RegisteredEditorPriority.default:
    case RegisteredEditorPriority.option:
      return contribution.priority;
    case RegisteredEditorPriority.builtin:
      return extension.isBuiltin ? RegisteredEditorPriority.builtin : RegisteredEditorPriority.default;
    default:
      return RegisteredEditorPriority.default;
  }
}
__name(getPriorityFromContribution, "getPriorityFromContribution");
export {
  ContributedCustomEditors
};
//# sourceMappingURL=contributedCustomEditors.js.map
