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
import { coalesce } from "../../../../base/common/arrays.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  dispose
} from "../../../../base/common/lifecycle.js";
import { LinkedMap, ResourceMap, Touch } from "../../../../base/common/map.js";
import { equals } from "../../../../base/common/objects.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import {
  EditorExtensions,
  EditorInputCapabilities,
  EditorsOrder,
  GroupModelChangeKind
} from "../../../common/editor.js";
import { SideBySideEditorInput } from "../../../common/editor/sideBySideEditorInput.js";
import {
  GroupsOrder,
  IEditorGroupsService
} from "../../../services/editor/common/editorGroupsService.js";
let EditorsObserver = class extends Disposable {
  constructor(editorGroupsContainer, editorGroupService, storageService) {
    super();
    this.editorGroupService = editorGroupService;
    this.storageService = storageService;
    this.editorGroupsContainer = editorGroupsContainer ?? editorGroupService;
    this.isScoped = !!editorGroupsContainer;
    this.registerListeners();
    this.loadState();
  }
  static {
    __name(this, "EditorsObserver");
  }
  static STORAGE_KEY = "editors.mru";
  keyMap = /* @__PURE__ */ new Map();
  mostRecentEditorsMap = new LinkedMap();
  editorsPerResourceCounter = new ResourceMap();
  _onDidMostRecentlyActiveEditorsChange = this._register(
    new Emitter()
  );
  onDidMostRecentlyActiveEditorsChange = this._onDidMostRecentlyActiveEditorsChange.event;
  get count() {
    return this.mostRecentEditorsMap.size;
  }
  get editors() {
    return [...this.mostRecentEditorsMap.values()];
  }
  hasEditor(editor) {
    const editors = this.editorsPerResourceCounter.get(editor.resource);
    return editors?.has(this.toIdentifier(editor)) ?? false;
  }
  hasEditors(resource) {
    return this.editorsPerResourceCounter.has(resource);
  }
  toIdentifier(arg1, editorId) {
    if (typeof arg1 !== "string") {
      return this.toIdentifier(arg1.typeId, arg1.editorId);
    }
    if (editorId) {
      return `${arg1}/${editorId}`;
    }
    return arg1;
  }
  editorGroupsContainer;
  isScoped;
  registerListeners() {
    this._register(
      this.editorGroupsContainer.onDidAddGroup(
        (group) => this.onGroupAdded(group)
      )
    );
    this._register(
      this.editorGroupService.onDidChangeEditorPartOptions(
        (e) => this.onDidChangeEditorPartOptions(e)
      )
    );
    this._register(
      this.storageService.onWillSaveState(() => this.saveState())
    );
  }
  onGroupAdded(group) {
    const groupEditorsMru = group.getEditors(
      EditorsOrder.MOST_RECENTLY_ACTIVE
    );
    for (let i = groupEditorsMru.length - 1; i >= 0; i--) {
      this.addMostRecentEditor(
        group,
        groupEditorsMru[i],
        false,
        true
      );
    }
    if (this.editorGroupsContainer.activeGroup === group && group.activeEditor) {
      this.addMostRecentEditor(
        group,
        group.activeEditor,
        true,
        false
      );
    }
    this.registerGroupListeners(group);
  }
  registerGroupListeners(group) {
    const groupDisposables = new DisposableStore();
    groupDisposables.add(
      group.onDidModelChange((e) => {
        switch (e.kind) {
          // Group gets active: put active editor as most recent
          case GroupModelChangeKind.GROUP_ACTIVE: {
            if (this.editorGroupsContainer.activeGroup === group && group.activeEditor) {
              this.addMostRecentEditor(
                group,
                group.activeEditor,
                true,
                false
              );
            }
            break;
          }
          // Editor opens: put it as second most recent
          //
          // Also check for maximum allowed number of editors and
          // start to close oldest ones if needed.
          case GroupModelChangeKind.EDITOR_OPEN: {
            if (e.editor) {
              this.addMostRecentEditor(
                group,
                e.editor,
                false,
                true
              );
              this.ensureOpenedEditorsLimit(
                { groupId: group.id, editor: e.editor },
                group.id
              );
            }
            break;
          }
        }
      })
    );
    groupDisposables.add(
      group.onDidCloseEditor((e) => {
        this.removeMostRecentEditor(group, e.editor);
      })
    );
    groupDisposables.add(
      group.onDidActiveEditorChange((e) => {
        if (e.editor) {
          this.addMostRecentEditor(
            group,
            e.editor,
            this.editorGroupsContainer.activeGroup === group,
            false
          );
        }
      })
    );
    Event.once(group.onWillDispose)(() => dispose(groupDisposables));
  }
  onDidChangeEditorPartOptions(event) {
    if (!equals(event.newPartOptions.limit, event.oldPartOptions.limit)) {
      const activeGroup = this.editorGroupsContainer.activeGroup;
      let exclude;
      if (activeGroup.activeEditor) {
        exclude = {
          editor: activeGroup.activeEditor,
          groupId: activeGroup.id
        };
      }
      this.ensureOpenedEditorsLimit(exclude);
    }
  }
  addMostRecentEditor(group, editor, isActive, isNew) {
    const key = this.ensureKey(group, editor);
    const mostRecentEditor = this.mostRecentEditorsMap.first;
    if (isActive || !mostRecentEditor) {
      this.mostRecentEditorsMap.set(
        key,
        key,
        mostRecentEditor ? Touch.AsOld : void 0
      );
    } else {
      this.mostRecentEditorsMap.set(
        key,
        key,
        Touch.AsOld
      );
      this.mostRecentEditorsMap.set(
        mostRecentEditor,
        mostRecentEditor,
        Touch.AsOld
      );
    }
    if (isNew) {
      this.updateEditorResourcesMap(editor, true);
    }
    this._onDidMostRecentlyActiveEditorsChange.fire();
  }
  updateEditorResourcesMap(editor, add) {
    let resource;
    let typeId;
    let editorId;
    if (editor instanceof SideBySideEditorInput) {
      resource = editor.primary.resource;
      typeId = editor.primary.typeId;
      editorId = editor.primary.editorId;
    } else {
      resource = editor.resource;
      typeId = editor.typeId;
      editorId = editor.editorId;
    }
    if (!resource) {
      return;
    }
    const identifier = this.toIdentifier(typeId, editorId);
    if (add) {
      let editorsPerResource = this.editorsPerResourceCounter.get(resource);
      if (!editorsPerResource) {
        editorsPerResource = /* @__PURE__ */ new Map();
        this.editorsPerResourceCounter.set(
          resource,
          editorsPerResource
        );
      }
      editorsPerResource.set(
        identifier,
        (editorsPerResource.get(identifier) ?? 0) + 1
      );
    } else {
      const editorsPerResource = this.editorsPerResourceCounter.get(resource);
      if (editorsPerResource) {
        const counter = editorsPerResource.get(identifier) ?? 0;
        if (counter > 1) {
          editorsPerResource.set(identifier, counter - 1);
        } else {
          editorsPerResource.delete(identifier);
          if (editorsPerResource.size === 0) {
            this.editorsPerResourceCounter.delete(resource);
          }
        }
      }
    }
  }
  removeMostRecentEditor(group, editor) {
    this.updateEditorResourcesMap(editor, false);
    const key = this.findKey(group, editor);
    if (key) {
      this.mostRecentEditorsMap.delete(key);
      const map = this.keyMap.get(group.id);
      if (map && map.delete(key.editor) && map.size === 0) {
        this.keyMap.delete(group.id);
      }
      this._onDidMostRecentlyActiveEditorsChange.fire();
    }
  }
  findKey(group, editor) {
    const groupMap = this.keyMap.get(group.id);
    if (!groupMap) {
      return void 0;
    }
    return groupMap.get(editor);
  }
  ensureKey(group, editor) {
    let groupMap = this.keyMap.get(group.id);
    if (!groupMap) {
      groupMap = /* @__PURE__ */ new Map();
      this.keyMap.set(group.id, groupMap);
    }
    let key = groupMap.get(editor);
    if (!key) {
      key = { groupId: group.id, editor };
      groupMap.set(editor, key);
    }
    return key;
  }
  async ensureOpenedEditorsLimit(exclude, groupId) {
    if (!this.editorGroupService.partOptions.limit?.enabled || typeof this.editorGroupService.partOptions.limit.value !== "number" || this.editorGroupService.partOptions.limit.value <= 0) {
      return;
    }
    const limit = this.editorGroupService.partOptions.limit.value;
    if (this.editorGroupService.partOptions.limit?.perEditorGroup) {
      if (typeof groupId === "number") {
        const group = this.editorGroupsContainer.getGroup(groupId);
        if (group) {
          await this.doEnsureOpenedEditorsLimit(
            limit,
            group.getEditors(EditorsOrder.MOST_RECENTLY_ACTIVE).map((editor) => ({ editor, groupId })),
            exclude
          );
        }
      } else {
        for (const group of this.editorGroupsContainer.groups) {
          await this.ensureOpenedEditorsLimit(exclude, group.id);
        }
      }
    } else {
      await this.doEnsureOpenedEditorsLimit(
        limit,
        [...this.mostRecentEditorsMap.values()],
        exclude
      );
    }
  }
  async doEnsureOpenedEditorsLimit(limit, mostRecentEditors, exclude) {
    let mostRecentEditorsCountingForLimit;
    if (this.editorGroupService.partOptions.limit?.excludeDirty) {
      mostRecentEditorsCountingForLimit = mostRecentEditors.filter(
        ({ editor }) => {
          if (editor.isDirty() && !editor.isSaving() || editor.hasCapability(EditorInputCapabilities.Scratchpad)) {
            return false;
          }
          return true;
        }
      );
    } else {
      mostRecentEditorsCountingForLimit = mostRecentEditors;
    }
    if (limit >= mostRecentEditorsCountingForLimit.length) {
      return;
    }
    const leastRecentlyClosableEditors = mostRecentEditorsCountingForLimit.reverse().filter(({ editor, groupId }) => {
      if (editor.isDirty() && !editor.isSaving() || editor.hasCapability(EditorInputCapabilities.Scratchpad)) {
        return false;
      }
      if (exclude && editor === exclude.editor && groupId === exclude.groupId) {
        return false;
      }
      if (this.editorGroupsContainer.getGroup(groupId)?.isSticky(editor)) {
        return false;
      }
      return true;
    });
    let editorsToCloseCount = mostRecentEditorsCountingForLimit.length - limit;
    const mapGroupToEditorsToClose = /* @__PURE__ */ new Map();
    for (const { groupId, editor } of leastRecentlyClosableEditors) {
      let editorsInGroupToClose = mapGroupToEditorsToClose.get(groupId);
      if (!editorsInGroupToClose) {
        editorsInGroupToClose = [];
        mapGroupToEditorsToClose.set(groupId, editorsInGroupToClose);
      }
      editorsInGroupToClose.push(editor);
      editorsToCloseCount--;
      if (editorsToCloseCount === 0) {
        break;
      }
    }
    for (const [groupId, editors] of mapGroupToEditorsToClose) {
      const group = this.editorGroupsContainer.getGroup(groupId);
      if (group) {
        await group.closeEditors(editors, { preserveFocus: true });
      }
    }
  }
  saveState() {
    if (this.isScoped) {
      return;
    }
    if (this.mostRecentEditorsMap.isEmpty()) {
      this.storageService.remove(
        EditorsObserver.STORAGE_KEY,
        StorageScope.WORKSPACE
      );
    } else {
      this.storageService.store(
        EditorsObserver.STORAGE_KEY,
        JSON.stringify(this.serialize()),
        StorageScope.WORKSPACE,
        StorageTarget.MACHINE
      );
    }
  }
  serialize() {
    const registry = Registry.as(
      EditorExtensions.EditorFactory
    );
    const entries = [...this.mostRecentEditorsMap.values()];
    const mapGroupToSerializableEditorsOfGroup = /* @__PURE__ */ new Map();
    return {
      entries: coalesce(
        entries.map(({ editor, groupId }) => {
          const group = this.editorGroupsContainer.getGroup(groupId);
          if (!group) {
            return void 0;
          }
          let serializableEditorsOfGroup = mapGroupToSerializableEditorsOfGroup.get(group);
          if (!serializableEditorsOfGroup) {
            serializableEditorsOfGroup = group.getEditors(EditorsOrder.SEQUENTIAL).filter((editor2) => {
              const editorSerializer = registry.getEditorSerializer(editor2);
              return editorSerializer?.canSerialize(editor2);
            });
            mapGroupToSerializableEditorsOfGroup.set(
              group,
              serializableEditorsOfGroup
            );
          }
          const index = serializableEditorsOfGroup.indexOf(editor);
          if (index === -1) {
            return void 0;
          }
          return { groupId, index };
        })
      )
    };
  }
  async loadState() {
    if (this.editorGroupsContainer === this.editorGroupService.mainPart || this.editorGroupsContainer === this.editorGroupService) {
      await this.editorGroupService.whenReady;
    }
    let hasRestorableState = false;
    if (!this.isScoped) {
      const serialized = this.storageService.get(
        EditorsObserver.STORAGE_KEY,
        StorageScope.WORKSPACE
      );
      if (serialized) {
        hasRestorableState = true;
        this.deserialize(JSON.parse(serialized));
      }
    }
    if (!hasRestorableState) {
      const groups = this.editorGroupsContainer.getGroups(
        GroupsOrder.MOST_RECENTLY_ACTIVE
      );
      for (let i = groups.length - 1; i >= 0; i--) {
        const group = groups[i];
        const groupEditorsMru = group.getEditors(
          EditorsOrder.MOST_RECENTLY_ACTIVE
        );
        for (let i2 = groupEditorsMru.length - 1; i2 >= 0; i2--) {
          this.addMostRecentEditor(
            group,
            groupEditorsMru[i2],
            true,
            true
          );
        }
      }
    }
    for (const group of this.editorGroupsContainer.groups) {
      this.registerGroupListeners(group);
    }
  }
  deserialize(serialized) {
    const mapValues = [];
    for (const { groupId, index } of serialized.entries) {
      const group = this.editorGroupsContainer.getGroup(groupId);
      if (!group) {
        continue;
      }
      const editor = group.getEditorByIndex(index);
      if (!editor) {
        continue;
      }
      const editorIdentifier = this.ensureKey(group, editor);
      mapValues.push([editorIdentifier, editorIdentifier]);
      this.updateEditorResourcesMap(editor, true);
    }
    this.mostRecentEditorsMap.fromJSON(mapValues);
  }
};
EditorsObserver = __decorateClass([
  __decorateParam(1, IEditorGroupsService),
  __decorateParam(2, IStorageService)
], EditorsObserver);
export {
  EditorsObserver
};
//# sourceMappingURL=editorsObserver.js.map
