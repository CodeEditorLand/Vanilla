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
import "./media/languageStatus.css";
import * as dom from "../../../../base/browser/dom.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Disposable, DisposableStore, dispose, toDisposable } from "../../../../base/common/lifecycle.js";
import Severity from "../../../../base/common/severity.js";
import { getCodeEditor, ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { localize, localize2 } from "../../../../nls.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions, IWorkbenchContribution } from "../../../common/contributions.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ILanguageStatus, ILanguageStatusService } from "../../../services/languageStatus/common/languageStatusService.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { IStatusbarEntry, IStatusbarEntryAccessor, IStatusbarService, ShowTooltipCommand, StatusbarAlignment, StatusbarEntryKind } from "../../../services/statusbar/browser/statusbar.js";
import { parseLinkedText } from "../../../../base/common/linkedText.js";
import { Link } from "../../../../platform/opener/browser/link.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { Action } from "../../../../base/common/actions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { equals } from "../../../../base/common/arrays.js";
import { URI } from "../../../../base/common/uri.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { IAccessibilityInformation } from "../../../../platform/accessibility/common/accessibility.js";
import { IEditorGroupsService, IEditorPart } from "../../../services/editor/common/editorGroupsService.js";
import { IHoverService, nativeHoverDelegate } from "../../../../platform/hover/browser/hover.js";
import { Event } from "../../../../base/common/event.js";
class LanguageStatusViewModel {
  constructor(combined, dedicated) {
    this.combined = combined;
    this.dedicated = dedicated;
  }
  static {
    __name(this, "LanguageStatusViewModel");
  }
  isEqual(other) {
    return equals(this.combined, other.combined) && equals(this.dedicated, other.dedicated);
  }
}
let StoredCounter = class {
  constructor(_storageService, _key) {
    this._storageService = _storageService;
    this._key = _key;
  }
  static {
    __name(this, "StoredCounter");
  }
  get value() {
    return this._storageService.getNumber(this._key, StorageScope.PROFILE, 0);
  }
  increment() {
    const n = this.value + 1;
    this._storageService.store(this._key, n, StorageScope.PROFILE, StorageTarget.MACHINE);
    return n;
  }
};
StoredCounter = __decorateClass([
  __decorateParam(0, IStorageService)
], StoredCounter);
let LanguageStatusContribution = class extends Disposable {
  constructor(editorGroupService) {
    super();
    this.editorGroupService = editorGroupService;
    for (const part of editorGroupService.parts) {
      this.createLanguageStatus(part);
    }
    this._register(editorGroupService.onDidCreateAuxiliaryEditorPart((part) => this.createLanguageStatus(part)));
  }
  static {
    __name(this, "LanguageStatusContribution");
  }
  createLanguageStatus(part) {
    const disposables = new DisposableStore();
    Event.once(part.onWillDispose)(() => disposables.dispose());
    const scopedInstantiationService = this.editorGroupService.getScopedInstantiationService(part);
    disposables.add(scopedInstantiationService.createInstance(LanguageStatus));
  }
};
LanguageStatusContribution = __decorateClass([
  __decorateParam(0, IEditorGroupsService)
], LanguageStatusContribution);
let LanguageStatus = class {
  constructor(_languageStatusService, _statusBarService, _editorService, _hoverService, _openerService, _storageService) {
    this._languageStatusService = _languageStatusService;
    this._statusBarService = _statusBarService;
    this._editorService = _editorService;
    this._hoverService = _hoverService;
    this._openerService = _openerService;
    this._storageService = _storageService;
    _storageService.onDidChangeValue(StorageScope.PROFILE, LanguageStatus._keyDedicatedItems, this._disposables)(this._handleStorageChange, this, this._disposables);
    this._restoreState();
    this._interactionCounter = new StoredCounter(_storageService, "languageStatus.interactCount");
    _languageStatusService.onDidChange(this._update, this, this._disposables);
    _editorService.onDidActiveEditorChange(this._update, this, this._disposables);
    this._update();
    _statusBarService.onDidChangeEntryVisibility((e) => {
      if (!e.visible && this._dedicated.has(e.id)) {
        this._dedicated.delete(e.id);
        this._update();
        this._storeState();
      }
    }, void 0, this._disposables);
  }
  static {
    __name(this, "LanguageStatus");
  }
  static _id = "status.languageStatus";
  static _keyDedicatedItems = "languageStatus.dedicated";
  _disposables = new DisposableStore();
  _interactionCounter;
  _dedicated = /* @__PURE__ */ new Set();
  _model;
  _combinedEntry;
  _dedicatedEntries = /* @__PURE__ */ new Map();
  _renderDisposables = new DisposableStore();
  dispose() {
    this._disposables.dispose();
    this._combinedEntry?.dispose();
    dispose(this._dedicatedEntries.values());
    this._renderDisposables.dispose();
  }
  // --- persisting dedicated items
  _handleStorageChange() {
    this._restoreState();
    this._update();
  }
  _restoreState() {
    const raw = this._storageService.get(LanguageStatus._keyDedicatedItems, StorageScope.PROFILE, "[]");
    try {
      const ids = JSON.parse(raw);
      this._dedicated = new Set(ids);
    } catch {
      this._dedicated.clear();
    }
  }
  _storeState() {
    if (this._dedicated.size === 0) {
      this._storageService.remove(LanguageStatus._keyDedicatedItems, StorageScope.PROFILE);
    } else {
      const raw = JSON.stringify(Array.from(this._dedicated.keys()));
      this._storageService.store(LanguageStatus._keyDedicatedItems, raw, StorageScope.PROFILE, StorageTarget.USER);
    }
  }
  // --- language status model and UI
  _createViewModel(editor) {
    if (!editor?.hasModel()) {
      return new LanguageStatusViewModel([], []);
    }
    const all = this._languageStatusService.getLanguageStatus(editor.getModel());
    const combined = [];
    const dedicated = [];
    for (const item of all) {
      if (this._dedicated.has(item.id)) {
        dedicated.push(item);
      }
      combined.push(item);
    }
    return new LanguageStatusViewModel(combined, dedicated);
  }
  _update() {
    const editor = getCodeEditor(this._editorService.activeTextEditorControl);
    const model = this._createViewModel(editor);
    if (this._model?.isEqual(model)) {
      return;
    }
    this._renderDisposables.clear();
    this._model = model;
    editor?.onDidChangeModelLanguage(this._update, this, this._renderDisposables);
    if (model.combined.length === 0) {
      this._combinedEntry?.dispose();
      this._combinedEntry = void 0;
    } else {
      const [first] = model.combined;
      const showSeverity = first.severity >= Severity.Warning;
      const text = LanguageStatus._severityToComboCodicon(first.severity);
      let isOneBusy = false;
      const ariaLabels = [];
      const element = document.createElement("div");
      for (const status of model.combined) {
        const isPinned = model.dedicated.includes(status);
        element.appendChild(this._renderStatus(status, showSeverity, isPinned, this._renderDisposables));
        ariaLabels.push(LanguageStatus._accessibilityInformation(status).label);
        isOneBusy = isOneBusy || !isPinned && status.busy;
      }
      const props = {
        name: localize("langStatus.name", "Editor Language Status"),
        ariaLabel: localize("langStatus.aria", "Editor Language Status: {0}", ariaLabels.join(", next: ")),
        tooltip: element,
        command: ShowTooltipCommand,
        text: isOneBusy ? `${text}\xA0\xA0$(sync~spin)` : text
      };
      if (!this._combinedEntry) {
        this._combinedEntry = this._statusBarService.addEntry(props, LanguageStatus._id, StatusbarAlignment.RIGHT, { id: "status.editor.mode", alignment: StatusbarAlignment.LEFT, compact: true });
      } else {
        this._combinedEntry.update(props);
      }
      const userHasInteractedWithStatus = this._interactionCounter.value >= 3;
      const targetWindow = dom.getWindow(editor?.getContainerDomNode());
      const node = targetWindow.document.querySelector(".monaco-workbench .statusbar DIV#status\\.languageStatus A>SPAN.codicon");
      const container = targetWindow.document.querySelector(".monaco-workbench .statusbar DIV#status\\.languageStatus");
      if (dom.isHTMLElement(node) && container) {
        const _wiggle = "wiggle";
        const _flash = "flash";
        if (!isOneBusy) {
          node.classList.toggle(_wiggle, showSeverity || !userHasInteractedWithStatus);
          this._renderDisposables.add(dom.addDisposableListener(node, "animationend", (_e) => node.classList.remove(_wiggle)));
          container.classList.toggle(_flash, showSeverity);
          this._renderDisposables.add(dom.addDisposableListener(container, "animationend", (_e) => container.classList.remove(_flash)));
        } else {
          node.classList.remove(_wiggle);
          container.classList.remove(_flash);
        }
      }
      if (!userHasInteractedWithStatus) {
        const hoverTarget = targetWindow.document.querySelector(".monaco-workbench .context-view");
        if (dom.isHTMLElement(hoverTarget)) {
          const observer = new MutationObserver(() => {
            if (targetWindow.document.contains(element)) {
              this._interactionCounter.increment();
              observer.disconnect();
            }
          });
          observer.observe(hoverTarget, { childList: true, subtree: true });
          this._renderDisposables.add(toDisposable(() => observer.disconnect()));
        }
      }
    }
    const newDedicatedEntries = /* @__PURE__ */ new Map();
    for (const status of model.dedicated) {
      const props = LanguageStatus._asStatusbarEntry(status);
      let entry = this._dedicatedEntries.get(status.id);
      if (!entry) {
        entry = this._statusBarService.addEntry(props, status.id, StatusbarAlignment.RIGHT, { id: "status.editor.mode", alignment: StatusbarAlignment.RIGHT });
      } else {
        entry.update(props);
        this._dedicatedEntries.delete(status.id);
      }
      newDedicatedEntries.set(status.id, entry);
    }
    dispose(this._dedicatedEntries.values());
    this._dedicatedEntries = newDedicatedEntries;
  }
  _renderStatus(status, showSeverity, isPinned, store) {
    const parent = document.createElement("div");
    parent.classList.add("hover-language-status");
    const severity = document.createElement("div");
    severity.classList.add("severity", `sev${status.severity}`);
    severity.classList.toggle("show", showSeverity);
    const severityText = LanguageStatus._severityToSingleCodicon(status.severity);
    dom.append(severity, ...renderLabelWithIcons(severityText));
    parent.appendChild(severity);
    const element = document.createElement("div");
    element.classList.add("element");
    parent.appendChild(element);
    const left = document.createElement("div");
    left.classList.add("left");
    element.appendChild(left);
    const label = document.createElement("span");
    label.classList.add("label");
    const labelValue = typeof status.label === "string" ? status.label : status.label.value;
    dom.append(label, ...renderLabelWithIcons(status.busy ? `$(sync~spin)\xA0\xA0${labelValue}` : labelValue));
    left.appendChild(label);
    const detail = document.createElement("span");
    detail.classList.add("detail");
    this._renderTextPlus(detail, status.detail, store);
    left.appendChild(detail);
    const right = document.createElement("div");
    right.classList.add("right");
    element.appendChild(right);
    const { command } = status;
    if (command) {
      store.add(new Link(right, {
        label: command.title,
        title: command.tooltip,
        href: URI.from({
          scheme: "command",
          path: command.id,
          query: command.arguments && JSON.stringify(command.arguments)
        }).toString()
      }, { hoverDelegate: nativeHoverDelegate }, this._hoverService, this._openerService));
    }
    const actionBar = new ActionBar(right, { hoverDelegate: nativeHoverDelegate });
    const actionLabel = isPinned ? localize("unpin", "Remove from Status Bar") : localize("pin", "Add to Status Bar");
    actionBar.setAriaLabel(actionLabel);
    store.add(actionBar);
    let action;
    if (!isPinned) {
      action = new Action("pin", actionLabel, ThemeIcon.asClassName(Codicon.pin), true, () => {
        this._dedicated.add(status.id);
        this._statusBarService.updateEntryVisibility(status.id, true);
        this._update();
        this._storeState();
      });
    } else {
      action = new Action("unpin", actionLabel, ThemeIcon.asClassName(Codicon.pinned), true, () => {
        this._dedicated.delete(status.id);
        this._statusBarService.updateEntryVisibility(status.id, false);
        this._update();
        this._storeState();
      });
    }
    actionBar.push(action, { icon: true, label: false });
    store.add(action);
    return parent;
  }
  static _severityToComboCodicon(sev) {
    switch (sev) {
      case Severity.Error:
        return "$(bracket-error)";
      case Severity.Warning:
        return "$(bracket-dot)";
      default:
        return "$(bracket)";
    }
  }
  static _severityToSingleCodicon(sev) {
    switch (sev) {
      case Severity.Error:
        return "$(error)";
      case Severity.Warning:
        return "$(info)";
      default:
        return "$(check)";
    }
  }
  _renderTextPlus(target, text, store) {
    for (const node of parseLinkedText(text).nodes) {
      if (typeof node === "string") {
        const parts = renderLabelWithIcons(node);
        dom.append(target, ...parts);
      } else {
        store.add(new Link(target, node, void 0, this._hoverService, this._openerService));
      }
    }
  }
  static _accessibilityInformation(status) {
    if (status.accessibilityInfo) {
      return status.accessibilityInfo;
    }
    const textValue = typeof status.label === "string" ? status.label : status.label.value;
    if (status.detail) {
      return { label: localize("aria.1", "{0}, {1}", textValue, status.detail) };
    } else {
      return { label: localize("aria.2", "{0}", textValue) };
    }
  }
  // ---
  static _asStatusbarEntry(item) {
    let kind;
    if (item.severity === Severity.Warning) {
      kind = "warning";
    } else if (item.severity === Severity.Error) {
      kind = "error";
    }
    const textValue = typeof item.label === "string" ? item.label : item.label.shortValue;
    return {
      name: localize("name.pattern", "{0} (Language Status)", item.name),
      text: item.busy ? `${textValue}\xA0\xA0$(sync~spin)` : textValue,
      ariaLabel: LanguageStatus._accessibilityInformation(item).label,
      role: item.accessibilityInfo?.role,
      tooltip: item.command?.tooltip || new MarkdownString(item.detail, { isTrusted: true, supportThemeIcons: true }),
      kind,
      command: item.command
    };
  }
};
LanguageStatus = __decorateClass([
  __decorateParam(0, ILanguageStatusService),
  __decorateParam(1, IStatusbarService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IOpenerService),
  __decorateParam(5, IStorageService)
], LanguageStatus);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(LanguageStatusContribution, LifecyclePhase.Restored);
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "editor.inlayHints.Reset",
      title: localize2("reset", "Reset Language Status Interaction Counter"),
      category: Categories.View,
      f1: true
    });
  }
  run(accessor) {
    accessor.get(IStorageService).remove("languageStatus.interactCount", StorageScope.PROFILE);
  }
});
//# sourceMappingURL=languageStatus.contribution.js.map
