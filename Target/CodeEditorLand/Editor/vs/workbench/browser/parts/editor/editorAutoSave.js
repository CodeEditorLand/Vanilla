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
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { Disposable, DisposableStore, IDisposable, dispose, toDisposable } from "../../../../base/common/lifecycle.js";
import { IFilesConfigurationService, AutoSaveMode, AutoSaveDisabledReason } from "../../../services/filesConfiguration/common/filesConfigurationService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { SaveReason, IEditorIdentifier, GroupIdentifier, EditorInputCapabilities } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IWorkingCopyService } from "../../../services/workingCopy/common/workingCopyService.js";
import { IWorkingCopy, WorkingCopyCapabilities } from "../../../services/workingCopy/common/workingCopy.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IMarkerService } from "../../../../platform/markers/common/markers.js";
import { URI } from "../../../../base/common/uri.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
let EditorAutoSave = class extends Disposable {
  constructor(filesConfigurationService, hostService, editorService, editorGroupService, workingCopyService, logService, markerService, uriIdentityService) {
    super();
    this.filesConfigurationService = filesConfigurationService;
    this.hostService = hostService;
    this.editorService = editorService;
    this.editorGroupService = editorGroupService;
    this.workingCopyService = workingCopyService;
    this.logService = logService;
    this.markerService = markerService;
    this.uriIdentityService = uriIdentityService;
    for (const dirtyWorkingCopy of this.workingCopyService.dirtyWorkingCopies) {
      this.onDidRegister(dirtyWorkingCopy);
    }
    this.registerListeners();
  }
  static {
    __name(this, "EditorAutoSave");
  }
  static ID = "workbench.contrib.editorAutoSave";
  // Auto save: after delay
  scheduledAutoSavesAfterDelay = /* @__PURE__ */ new Map();
  // Auto save: focus change & window change
  lastActiveEditor = void 0;
  lastActiveGroupId = void 0;
  lastActiveEditorControlDisposable = this._register(new DisposableStore());
  // Auto save: waiting on specific condition
  waitingOnConditionAutoSaveWorkingCopies = new ResourceMap((resource) => this.uriIdentityService.extUri.getComparisonKey(resource));
  waitingOnConditionAutoSaveEditors = new ResourceMap((resource) => this.uriIdentityService.extUri.getComparisonKey(resource));
  registerListeners() {
    this._register(this.hostService.onDidChangeFocus((focused) => this.onWindowFocusChange(focused)));
    this._register(this.hostService.onDidChangeActiveWindow(() => this.onActiveWindowChange()));
    this._register(this.editorService.onDidActiveEditorChange(() => this.onDidActiveEditorChange()));
    this._register(this.filesConfigurationService.onDidChangeAutoSaveConfiguration(() => this.onDidChangeAutoSaveConfiguration()));
    this._register(this.workingCopyService.onDidRegister((workingCopy) => this.onDidRegister(workingCopy)));
    this._register(this.workingCopyService.onDidUnregister((workingCopy) => this.onDidUnregister(workingCopy)));
    this._register(this.workingCopyService.onDidChangeDirty((workingCopy) => this.onDidChangeDirty(workingCopy)));
    this._register(this.workingCopyService.onDidChangeContent((workingCopy) => this.onDidChangeContent(workingCopy)));
    this._register(this.markerService.onMarkerChanged((e) => this.onConditionChanged(e, AutoSaveDisabledReason.ERRORS)));
    this._register(this.filesConfigurationService.onDidChangeAutoSaveDisabled((resource) => this.onConditionChanged([resource], AutoSaveDisabledReason.DISABLED)));
  }
  onConditionChanged(resources, condition) {
    for (const resource of resources) {
      const workingCopyResult = this.waitingOnConditionAutoSaveWorkingCopies.get(resource);
      if (workingCopyResult?.condition === condition) {
        if (workingCopyResult.workingCopy.isDirty() && this.filesConfigurationService.getAutoSaveMode(workingCopyResult.workingCopy.resource, workingCopyResult.reason).mode !== AutoSaveMode.OFF) {
          this.discardAutoSave(workingCopyResult.workingCopy);
          this.logService.trace(`[editor auto save] running auto save from condition change event`, workingCopyResult.workingCopy.resource.toString(), workingCopyResult.workingCopy.typeId);
          workingCopyResult.workingCopy.save({ reason: workingCopyResult.reason });
        }
      } else {
        const editorResult = this.waitingOnConditionAutoSaveEditors.get(resource);
        if (editorResult?.condition === condition && !editorResult.editor.editor.isDisposed() && editorResult.editor.editor.isDirty() && this.filesConfigurationService.getAutoSaveMode(editorResult.editor.editor, editorResult.reason).mode !== AutoSaveMode.OFF) {
          this.waitingOnConditionAutoSaveEditors.delete(resource);
          this.logService.trace(`[editor auto save] running auto save from condition change event with reason ${editorResult.reason}`);
          this.editorService.save(editorResult.editor, { reason: editorResult.reason });
        }
      }
    }
  }
  onWindowFocusChange(focused) {
    if (!focused) {
      this.maybeTriggerAutoSave(SaveReason.WINDOW_CHANGE);
    }
  }
  onActiveWindowChange() {
    this.maybeTriggerAutoSave(SaveReason.WINDOW_CHANGE);
  }
  onDidActiveEditorChange() {
    if (this.lastActiveEditor && typeof this.lastActiveGroupId === "number") {
      this.maybeTriggerAutoSave(SaveReason.FOCUS_CHANGE, { groupId: this.lastActiveGroupId, editor: this.lastActiveEditor });
    }
    const activeGroup = this.editorGroupService.activeGroup;
    const activeEditor = this.lastActiveEditor = activeGroup.activeEditor ?? void 0;
    this.lastActiveGroupId = activeGroup.id;
    this.lastActiveEditorControlDisposable.clear();
    const activeEditorPane = this.editorService.activeEditorPane;
    if (activeEditor && activeEditorPane) {
      this.lastActiveEditorControlDisposable.add(activeEditorPane.onDidBlur(() => {
        this.maybeTriggerAutoSave(SaveReason.FOCUS_CHANGE, { groupId: activeGroup.id, editor: activeEditor });
      }));
    }
  }
  maybeTriggerAutoSave(reason, editorIdentifier) {
    if (editorIdentifier) {
      if (!editorIdentifier.editor.isDirty() || editorIdentifier.editor.isReadonly() || editorIdentifier.editor.hasCapability(EditorInputCapabilities.Untitled)) {
        return;
      }
      const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(editorIdentifier.editor, reason);
      if (autoSaveMode.mode !== AutoSaveMode.OFF) {
        if (reason === SaveReason.WINDOW_CHANGE && (autoSaveMode.mode === AutoSaveMode.ON_FOCUS_CHANGE || autoSaveMode.mode === AutoSaveMode.ON_WINDOW_CHANGE) || reason === SaveReason.FOCUS_CHANGE && autoSaveMode.mode === AutoSaveMode.ON_FOCUS_CHANGE) {
          this.logService.trace(`[editor auto save] triggering auto save with reason ${reason}`);
          this.editorService.save(editorIdentifier, { reason });
        }
      } else if (editorIdentifier.editor.resource && (autoSaveMode.reason === AutoSaveDisabledReason.ERRORS || autoSaveMode.reason === AutoSaveDisabledReason.DISABLED)) {
        this.waitingOnConditionAutoSaveEditors.set(editorIdentifier.editor.resource, { editor: editorIdentifier, reason, condition: autoSaveMode.reason });
      }
    } else {
      this.saveAllDirtyAutoSaveables(reason);
    }
  }
  onDidChangeAutoSaveConfiguration() {
    let reason = void 0;
    switch (this.filesConfigurationService.getAutoSaveMode(void 0).mode) {
      case AutoSaveMode.ON_FOCUS_CHANGE:
        reason = SaveReason.FOCUS_CHANGE;
        break;
      case AutoSaveMode.ON_WINDOW_CHANGE:
        reason = SaveReason.WINDOW_CHANGE;
        break;
      case AutoSaveMode.AFTER_SHORT_DELAY:
      case AutoSaveMode.AFTER_LONG_DELAY:
        reason = SaveReason.AUTO;
        break;
    }
    if (reason) {
      this.saveAllDirtyAutoSaveables(reason);
    }
  }
  saveAllDirtyAutoSaveables(reason) {
    for (const workingCopy of this.workingCopyService.dirtyWorkingCopies) {
      if (workingCopy.capabilities & WorkingCopyCapabilities.Untitled) {
        continue;
      }
      const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(workingCopy.resource, reason);
      if (autoSaveMode.mode !== AutoSaveMode.OFF) {
        workingCopy.save({ reason });
      } else if (autoSaveMode.reason === AutoSaveDisabledReason.ERRORS || autoSaveMode.reason === AutoSaveDisabledReason.DISABLED) {
        this.waitingOnConditionAutoSaveWorkingCopies.set(workingCopy.resource, { workingCopy, reason, condition: autoSaveMode.reason });
      }
    }
  }
  onDidRegister(workingCopy) {
    if (workingCopy.isDirty()) {
      this.scheduleAutoSave(workingCopy);
    }
  }
  onDidUnregister(workingCopy) {
    this.discardAutoSave(workingCopy);
  }
  onDidChangeDirty(workingCopy) {
    if (workingCopy.isDirty()) {
      this.scheduleAutoSave(workingCopy);
    } else {
      this.discardAutoSave(workingCopy);
    }
  }
  onDidChangeContent(workingCopy) {
    if (workingCopy.isDirty()) {
      this.scheduleAutoSave(workingCopy);
    }
  }
  scheduleAutoSave(workingCopy) {
    if (workingCopy.capabilities & WorkingCopyCapabilities.Untitled) {
      return;
    }
    const autoSaveAfterDelay = this.filesConfigurationService.getAutoSaveConfiguration(workingCopy.resource).autoSaveDelay;
    if (typeof autoSaveAfterDelay !== "number") {
      return;
    }
    this.discardAutoSave(workingCopy);
    this.logService.trace(`[editor auto save] scheduling auto save after ${autoSaveAfterDelay}ms`, workingCopy.resource.toString(), workingCopy.typeId);
    const handle = setTimeout(() => {
      this.discardAutoSave(workingCopy);
      if (workingCopy.isDirty()) {
        const reason = SaveReason.AUTO;
        const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(workingCopy.resource, reason);
        if (autoSaveMode.mode !== AutoSaveMode.OFF) {
          this.logService.trace(`[editor auto save] running auto save`, workingCopy.resource.toString(), workingCopy.typeId);
          workingCopy.save({ reason });
        } else if (autoSaveMode.reason === AutoSaveDisabledReason.ERRORS || autoSaveMode.reason === AutoSaveDisabledReason.DISABLED) {
          this.waitingOnConditionAutoSaveWorkingCopies.set(workingCopy.resource, { workingCopy, reason, condition: autoSaveMode.reason });
        }
      }
    }, autoSaveAfterDelay);
    this.scheduledAutoSavesAfterDelay.set(workingCopy, toDisposable(() => {
      this.logService.trace(`[editor auto save] clearing pending auto save`, workingCopy.resource.toString(), workingCopy.typeId);
      clearTimeout(handle);
    }));
  }
  discardAutoSave(workingCopy) {
    dispose(this.scheduledAutoSavesAfterDelay.get(workingCopy));
    this.scheduledAutoSavesAfterDelay.delete(workingCopy);
    this.waitingOnConditionAutoSaveWorkingCopies.delete(workingCopy.resource);
    this.waitingOnConditionAutoSaveEditors.delete(workingCopy.resource);
  }
};
EditorAutoSave = __decorateClass([
  __decorateParam(0, IFilesConfigurationService),
  __decorateParam(1, IHostService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IEditorGroupsService),
  __decorateParam(4, IWorkingCopyService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IMarkerService),
  __decorateParam(7, IUriIdentityService)
], EditorAutoSave);
export {
  EditorAutoSave
};
//# sourceMappingURL=editorAutoSave.js.map
