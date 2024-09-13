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
import { BroadcastDataChannel } from "../../base/browser/broadcast.js";
import {
  DataTransfers
} from "../../base/browser/dnd.js";
import {
  DragAndDropObserver,
  EventType,
  addDisposableListener,
  onDidRegisterWindow
} from "../../base/browser/dom.js";
import { mainWindow } from "../../base/browser/window.js";
import { coalesce } from "../../base/common/arrays.js";
import {
  UriList
} from "../../base/common/dataTransfer.js";
import { Emitter, Event } from "../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  markAsSingleton
} from "../../base/common/lifecycle.js";
import { stringify } from "../../base/common/marshalling.js";
import { Mimes } from "../../base/common/mime.js";
import { FileAccess, Schemas } from "../../base/common/network.js";
import { isWindows } from "../../base/common/platform.js";
import { basename, isEqual } from "../../base/common/resources.js";
import { URI } from "../../base/common/uri.js";
import {
  CodeDataTransfers,
  Extensions,
  LocalSelectionTransfer,
  createDraggedEditorInputFromRawResourcesData,
  extractEditorsAndFilesDropData
} from "../../platform/dnd/browser/dnd.js";
import { IFileService } from "../../platform/files/common/files.js";
import {
  IInstantiationService
} from "../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../platform/label/common/label.js";
import { extractSelection } from "../../platform/opener/common/opener.js";
import { Registry } from "../../platform/registry/common/platform.js";
import {
  IWorkspaceContextService,
  hasWorkspaceFileExtension,
  isTemporaryWorkspace
} from "../../platform/workspace/common/workspace.js";
import {
  IWorkspacesService
} from "../../platform/workspaces/common/workspaces.js";
import {
  EditorResourceAccessor,
  isEditorIdentifier,
  isResourceDiffEditorInput,
  isResourceMergeEditorInput,
  isResourceSideBySideEditorInput
} from "../common/editor.js";
import { IEditorService } from "../services/editor/common/editorService.js";
import { IHostService } from "../services/host/browser/host.js";
import { ITextFileService } from "../services/textfile/common/textfiles.js";
import { IWorkspaceEditingService } from "../services/workspaces/common/workspaceEditing.js";
class DraggedEditorIdentifier {
  constructor(identifier) {
    this.identifier = identifier;
  }
  static {
    __name(this, "DraggedEditorIdentifier");
  }
}
class DraggedEditorGroupIdentifier {
  constructor(identifier) {
    this.identifier = identifier;
  }
  static {
    __name(this, "DraggedEditorGroupIdentifier");
  }
}
async function extractTreeDropData(dataTransfer) {
  const editors = [];
  const resourcesKey = Mimes.uriList.toLowerCase();
  if (dataTransfer.has(resourcesKey)) {
    try {
      const asString = await dataTransfer.get(resourcesKey)?.asString();
      const rawResourcesData = JSON.stringify(
        UriList.parse(asString ?? "")
      );
      editors.push(
        ...createDraggedEditorInputFromRawResourcesData(
          rawResourcesData
        )
      );
    } catch (error) {
    }
  }
  return editors;
}
__name(extractTreeDropData, "extractTreeDropData");
let ResourcesDropHandler = class {
  constructor(options, fileService, workspacesService, editorService, workspaceEditingService, hostService, contextService, instantiationService) {
    this.options = options;
    this.fileService = fileService;
    this.workspacesService = workspacesService;
    this.editorService = editorService;
    this.workspaceEditingService = workspaceEditingService;
    this.hostService = hostService;
    this.contextService = contextService;
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "ResourcesDropHandler");
  }
  async handleDrop(event, targetWindow, resolveTargetGroup, afterDrop, options) {
    const editors = await this.instantiationService.invokeFunction(
      (accessor) => extractEditorsAndFilesDropData(accessor, event)
    );
    if (!editors.length) {
      return;
    }
    await this.hostService.focus(targetWindow);
    if (this.options.allowWorkspaceOpen) {
      const localFilesAllowedToOpenAsWorkspace = coalesce(
        editors.filter(
          (editor) => editor.allowWorkspaceOpen && editor.resource?.scheme === Schemas.file
        ).map((editor) => editor.resource)
      );
      if (localFilesAllowedToOpenAsWorkspace.length > 0) {
        const isWorkspaceOpening = await this.handleWorkspaceDrop(
          localFilesAllowedToOpenAsWorkspace
        );
        if (isWorkspaceOpening) {
          return;
        }
      }
    }
    const externalLocalFiles = coalesce(
      editors.filter(
        (editor) => editor.isExternal && editor.resource?.scheme === Schemas.file
      ).map((editor) => editor.resource)
    );
    if (externalLocalFiles.length) {
      this.workspacesService.addRecentlyOpened(
        externalLocalFiles.map((resource) => ({ fileUri: resource }))
      );
    }
    const targetGroup = resolveTargetGroup?.();
    await this.editorService.openEditors(
      editors.map((editor) => ({
        ...editor,
        resource: editor.resource,
        options: {
          ...editor.options,
          ...options,
          pinned: true
        }
      })),
      targetGroup,
      { validateTrust: true }
    );
    afterDrop?.(targetGroup);
  }
  async handleWorkspaceDrop(resources) {
    const toOpen = [];
    const folderURIs = [];
    await Promise.all(
      resources.map(async (resource) => {
        if (hasWorkspaceFileExtension(resource)) {
          toOpen.push({ workspaceUri: resource });
          return;
        }
        try {
          const stat = await this.fileService.stat(resource);
          if (stat.isDirectory) {
            toOpen.push({ folderUri: stat.resource });
            folderURIs.push({ uri: stat.resource });
          }
        } catch (error) {
        }
      })
    );
    if (toOpen.length === 0) {
      return false;
    }
    if (toOpen.length > folderURIs.length || folderURIs.length === 1) {
      await this.hostService.openWindow(toOpen);
    } else if (isTemporaryWorkspace(this.contextService.getWorkspace())) {
      await this.workspaceEditingService.addFolders(folderURIs);
    } else {
      await this.workspaceEditingService.createAndEnterWorkspace(
        folderURIs
      );
    }
    return true;
  }
};
ResourcesDropHandler = __decorateClass([
  __decorateParam(1, IFileService),
  __decorateParam(2, IWorkspacesService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IWorkspaceEditingService),
  __decorateParam(5, IHostService),
  __decorateParam(6, IWorkspaceContextService),
  __decorateParam(7, IInstantiationService)
], ResourcesDropHandler);
function fillEditorsDragData(accessor, resourcesOrEditors, event, options) {
  if (resourcesOrEditors.length === 0 || !event.dataTransfer) {
    return;
  }
  const textFileService = accessor.get(ITextFileService);
  const editorService = accessor.get(IEditorService);
  const fileService = accessor.get(IFileService);
  const labelService = accessor.get(ILabelService);
  const resources = coalesce(
    resourcesOrEditors.map((resourceOrEditor) => {
      if (URI.isUri(resourceOrEditor)) {
        return { resource: resourceOrEditor };
      }
      if (isEditorIdentifier(resourceOrEditor)) {
        if (URI.isUri(resourceOrEditor.editor.resource)) {
          return { resource: resourceOrEditor.editor.resource };
        }
        return void 0;
      }
      return resourceOrEditor;
    })
  );
  const fileSystemResources = resources.filter(
    ({ resource }) => fileService.hasProvider(resource)
  );
  if (!options?.disableStandardTransfer) {
    const lineDelimiter = isWindows ? "\r\n" : "\n";
    event.dataTransfer.setData(
      DataTransfers.TEXT,
      fileSystemResources.map(
        ({ resource }) => labelService.getUriLabel(resource, { noPrefix: true })
      ).join(lineDelimiter)
    );
    const firstFile = fileSystemResources.find(
      ({ isDirectory }) => !isDirectory
    );
    if (firstFile) {
      const firstFileUri = FileAccess.uriToFileUri(firstFile.resource);
      if (firstFileUri.scheme === Schemas.file) {
        event.dataTransfer.setData(
          DataTransfers.DOWNLOAD_URL,
          [
            Mimes.binary,
            basename(firstFile.resource),
            firstFileUri.toString()
          ].join(":")
        );
      }
    }
  }
  const files = fileSystemResources.filter(({ isDirectory }) => !isDirectory);
  if (files.length) {
    event.dataTransfer.setData(
      DataTransfers.RESOURCES,
      JSON.stringify(files.map(({ resource }) => resource.toString()))
    );
  }
  const contributions = Registry.as(
    Extensions.DragAndDropContribution
  ).getAll();
  for (const contribution of contributions) {
    contribution.setData(resources, event);
  }
  const draggedEditors = [];
  for (const resourceOrEditor of resourcesOrEditors) {
    let editor;
    if (isEditorIdentifier(resourceOrEditor)) {
      const untypedEditor = resourceOrEditor.editor.toUntyped({
        preserveViewState: resourceOrEditor.groupId
      });
      if (untypedEditor) {
        editor = {
          ...untypedEditor,
          resource: EditorResourceAccessor.getCanonicalUri(untypedEditor)
        };
      }
    } else if (URI.isUri(resourceOrEditor)) {
      const { selection, uri } = extractSelection(resourceOrEditor);
      editor = {
        resource: uri,
        options: selection ? { selection } : void 0
      };
    } else if (!resourceOrEditor.isDirectory) {
      editor = { resource: resourceOrEditor.resource };
    }
    if (!editor) {
      continue;
    }
    {
      const resource = editor.resource;
      if (resource) {
        const textFileModel = textFileService.files.get(resource);
        if (textFileModel) {
          if (typeof editor.languageId !== "string") {
            editor.languageId = textFileModel.getLanguageId();
          }
          if (typeof editor.encoding !== "string") {
            editor.encoding = textFileModel.getEncoding();
          }
          if (typeof editor.contents !== "string" && textFileModel.isDirty() && !textFileModel.textEditorModel.isTooLargeForHeapOperation()) {
            editor.contents = textFileModel.textEditorModel.getValue();
          }
        }
        if (!editor.options?.viewState) {
          editor.options = {
            ...editor.options,
            viewState: (() => {
              for (const visibleEditorPane of editorService.visibleEditorPanes) {
                if (isEqual(
                  visibleEditorPane.input.resource,
                  resource
                )) {
                  const viewState = visibleEditorPane.getViewState();
                  if (viewState) {
                    return viewState;
                  }
                }
              }
              return void 0;
            })()
          };
        }
      }
    }
    draggedEditors.push(editor);
  }
  if (draggedEditors.length) {
    event.dataTransfer.setData(
      CodeDataTransfers.EDITORS,
      stringify(draggedEditors)
    );
    const uriListEntries = [];
    for (const editor of draggedEditors) {
      if (editor.resource) {
        uriListEntries.push(editor.resource);
      } else if (isResourceDiffEditorInput(editor)) {
        if (editor.modified.resource) {
          uriListEntries.push(editor.modified.resource);
        }
      } else if (isResourceSideBySideEditorInput(editor)) {
        if (editor.primary.resource) {
          uriListEntries.push(editor.primary.resource);
        }
      } else if (isResourceMergeEditorInput(editor)) {
        uriListEntries.push(editor.result.resource);
      }
    }
    if (!options?.disableStandardTransfer) {
      event.dataTransfer.setData(
        Mimes.uriList,
        UriList.create(uriListEntries.slice(0, 1))
      );
    }
    event.dataTransfer.setData(
      DataTransfers.INTERNAL_URI_LIST,
      UriList.create(uriListEntries)
    );
  }
}
__name(fillEditorsDragData, "fillEditorsDragData");
class CompositeDragAndDropData {
  constructor(type, id) {
    this.type = type;
    this.id = id;
  }
  static {
    __name(this, "CompositeDragAndDropData");
  }
  update(dataTransfer) {
  }
  getData() {
    return { type: this.type, id: this.id };
  }
}
class DraggedCompositeIdentifier {
  constructor(compositeId) {
    this.compositeId = compositeId;
  }
  static {
    __name(this, "DraggedCompositeIdentifier");
  }
  get id() {
    return this.compositeId;
  }
}
class DraggedViewIdentifier {
  constructor(viewId) {
    this.viewId = viewId;
  }
  static {
    __name(this, "DraggedViewIdentifier");
  }
  get id() {
    return this.viewId;
  }
}
class CompositeDragAndDropObserver extends Disposable {
  static {
    __name(this, "CompositeDragAndDropObserver");
  }
  static instance;
  static get INSTANCE() {
    if (!CompositeDragAndDropObserver.instance) {
      CompositeDragAndDropObserver.instance = new CompositeDragAndDropObserver();
      markAsSingleton(CompositeDragAndDropObserver.instance);
    }
    return CompositeDragAndDropObserver.instance;
  }
  transferData = LocalSelectionTransfer.getInstance();
  onDragStart = this._register(
    new Emitter()
  );
  onDragEnd = this._register(
    new Emitter()
  );
  constructor() {
    super();
    this._register(
      this.onDragEnd.event((e) => {
        const id = e.dragAndDropData.getData().id;
        const type = e.dragAndDropData.getData().type;
        const data = this.readDragData(type);
        if (data?.getData().id === id) {
          this.transferData.clearData(
            type === "view" ? DraggedViewIdentifier.prototype : DraggedCompositeIdentifier.prototype
          );
        }
      })
    );
  }
  readDragData(type) {
    if (this.transferData.hasData(
      type === "view" ? DraggedViewIdentifier.prototype : DraggedCompositeIdentifier.prototype
    )) {
      const data = this.transferData.getData(
        type === "view" ? DraggedViewIdentifier.prototype : DraggedCompositeIdentifier.prototype
      );
      if (data && data[0]) {
        return new CompositeDragAndDropData(type, data[0].id);
      }
    }
    return void 0;
  }
  writeDragData(id, type) {
    this.transferData.setData(
      [
        type === "view" ? new DraggedViewIdentifier(id) : new DraggedCompositeIdentifier(id)
      ],
      type === "view" ? DraggedViewIdentifier.prototype : DraggedCompositeIdentifier.prototype
    );
  }
  registerTarget(element, callbacks) {
    const disposableStore = new DisposableStore();
    disposableStore.add(
      new DragAndDropObserver(element, {
        onDragEnter: /* @__PURE__ */ __name((e) => {
          e.preventDefault();
          if (callbacks.onDragEnter) {
            const data = this.readDragData("composite") || this.readDragData("view");
            if (data) {
              callbacks.onDragEnter({
                eventData: e,
                dragAndDropData: data
              });
            }
          }
        }, "onDragEnter"),
        onDragLeave: /* @__PURE__ */ __name((e) => {
          const data = this.readDragData("composite") || this.readDragData("view");
          if (callbacks.onDragLeave && data) {
            callbacks.onDragLeave({
              eventData: e,
              dragAndDropData: data
            });
          }
        }, "onDragLeave"),
        onDrop: /* @__PURE__ */ __name((e) => {
          if (callbacks.onDrop) {
            const data = this.readDragData("composite") || this.readDragData("view");
            if (!data) {
              return;
            }
            callbacks.onDrop({
              eventData: e,
              dragAndDropData: data
            });
            this.onDragEnd.fire({
              eventData: e,
              dragAndDropData: data
            });
          }
        }, "onDrop"),
        onDragOver: /* @__PURE__ */ __name((e) => {
          e.preventDefault();
          if (callbacks.onDragOver) {
            const data = this.readDragData("composite") || this.readDragData("view");
            if (!data) {
              return;
            }
            callbacks.onDragOver({
              eventData: e,
              dragAndDropData: data
            });
          }
        }, "onDragOver")
      })
    );
    if (callbacks.onDragStart) {
      this.onDragStart.event(
        (e) => {
          callbacks.onDragStart(e);
        },
        this,
        disposableStore
      );
    }
    if (callbacks.onDragEnd) {
      this.onDragEnd.event(
        (e) => {
          callbacks.onDragEnd(e);
        },
        this,
        disposableStore
      );
    }
    return this._register(disposableStore);
  }
  registerDraggable(element, draggedItemProvider, callbacks) {
    element.draggable = true;
    const disposableStore = new DisposableStore();
    disposableStore.add(
      new DragAndDropObserver(element, {
        onDragStart: /* @__PURE__ */ __name((e) => {
          const { id, type } = draggedItemProvider();
          this.writeDragData(id, type);
          e.dataTransfer?.setDragImage(element, 0, 0);
          this.onDragStart.fire({
            eventData: e,
            dragAndDropData: this.readDragData(type)
          });
        }, "onDragStart"),
        onDragEnd: /* @__PURE__ */ __name((e) => {
          const { type } = draggedItemProvider();
          const data = this.readDragData(type);
          if (!data) {
            return;
          }
          this.onDragEnd.fire({
            eventData: e,
            dragAndDropData: data
          });
        }, "onDragEnd"),
        onDragEnter: /* @__PURE__ */ __name((e) => {
          if (callbacks.onDragEnter) {
            const data = this.readDragData("composite") || this.readDragData("view");
            if (!data) {
              return;
            }
            if (data) {
              callbacks.onDragEnter({
                eventData: e,
                dragAndDropData: data
              });
            }
          }
        }, "onDragEnter"),
        onDragLeave: /* @__PURE__ */ __name((e) => {
          const data = this.readDragData("composite") || this.readDragData("view");
          if (!data) {
            return;
          }
          callbacks.onDragLeave?.({
            eventData: e,
            dragAndDropData: data
          });
        }, "onDragLeave"),
        onDrop: /* @__PURE__ */ __name((e) => {
          if (callbacks.onDrop) {
            const data = this.readDragData("composite") || this.readDragData("view");
            if (!data) {
              return;
            }
            callbacks.onDrop({
              eventData: e,
              dragAndDropData: data
            });
            this.onDragEnd.fire({
              eventData: e,
              dragAndDropData: data
            });
          }
        }, "onDrop"),
        onDragOver: /* @__PURE__ */ __name((e) => {
          if (callbacks.onDragOver) {
            const data = this.readDragData("composite") || this.readDragData("view");
            if (!data) {
              return;
            }
            callbacks.onDragOver({
              eventData: e,
              dragAndDropData: data
            });
          }
        }, "onDragOver")
      })
    );
    if (callbacks.onDragStart) {
      this.onDragStart.event(
        (e) => {
          callbacks.onDragStart(e);
        },
        this,
        disposableStore
      );
    }
    if (callbacks.onDragEnd) {
      this.onDragEnd.event(
        (e) => {
          callbacks.onDragEnd(e);
        },
        this,
        disposableStore
      );
    }
    return this._register(disposableStore);
  }
}
function toggleDropEffect(dataTransfer, dropEffect, shouldHaveIt) {
  if (!dataTransfer) {
    return;
  }
  dataTransfer.dropEffect = shouldHaveIt ? dropEffect : "none";
}
__name(toggleDropEffect, "toggleDropEffect");
let ResourceListDnDHandler = class {
  constructor(toResource, instantiationService) {
    this.toResource = toResource;
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "ResourceListDnDHandler");
  }
  getDragURI(element) {
    const resource = this.toResource(element);
    return resource ? resource.toString() : null;
  }
  getDragLabel(elements) {
    const resources = coalesce(elements.map(this.toResource));
    return resources.length === 1 ? basename(resources[0]) : resources.length > 1 ? String(resources.length) : void 0;
  }
  onDragStart(data, originalEvent) {
    const resources = [];
    for (const element of data.elements) {
      const resource = this.toResource(element);
      if (resource) {
        resources.push(resource);
      }
    }
    if (resources.length) {
      this.instantiationService.invokeFunction(
        (accessor) => fillEditorsDragData(accessor, resources, originalEvent)
      );
    }
  }
  onDragOver(data, targetElement, targetIndex, targetSector, originalEvent) {
    return false;
  }
  drop(data, targetElement, targetIndex, targetSector, originalEvent) {
  }
  dispose() {
  }
};
ResourceListDnDHandler = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ResourceListDnDHandler);
class GlobalWindowDraggedOverTracker extends Disposable {
  static {
    __name(this, "GlobalWindowDraggedOverTracker");
  }
  static CHANNEL_NAME = "monaco-workbench-global-dragged-over";
  broadcaster = this._register(
    new BroadcastDataChannel(
      GlobalWindowDraggedOverTracker.CHANNEL_NAME
    )
  );
  constructor() {
    super();
    this.registerListeners();
  }
  registerListeners() {
    this._register(
      Event.runAndSubscribe(
        onDidRegisterWindow,
        ({ window, disposables }) => {
          disposables.add(
            addDisposableListener(
              window,
              EventType.DRAG_OVER,
              () => this.markDraggedOver(false),
              true
            )
          );
          disposables.add(
            addDisposableListener(
              window,
              EventType.DRAG_LEAVE,
              () => this.clearDraggedOver(false),
              true
            )
          );
        },
        { window: mainWindow, disposables: this._store }
      )
    );
    this._register(
      this.broadcaster.onDidReceiveData((data) => {
        if (data === true) {
          this.markDraggedOver(true);
        } else {
          this.clearDraggedOver(true);
        }
      })
    );
  }
  draggedOver = false;
  get isDraggedOver() {
    return this.draggedOver;
  }
  markDraggedOver(fromBroadcast) {
    if (this.draggedOver === true) {
      return;
    }
    this.draggedOver = true;
    if (!fromBroadcast) {
      this.broadcaster.postData(true);
    }
  }
  clearDraggedOver(fromBroadcast) {
    if (this.draggedOver === false) {
      return;
    }
    this.draggedOver = false;
    if (!fromBroadcast) {
      this.broadcaster.postData(false);
    }
  }
}
const globalDraggedOverTracker = new GlobalWindowDraggedOverTracker();
function isWindowDraggedOver() {
  return globalDraggedOverTracker.isDraggedOver;
}
__name(isWindowDraggedOver, "isWindowDraggedOver");
export {
  CompositeDragAndDropData,
  CompositeDragAndDropObserver,
  DraggedCompositeIdentifier,
  DraggedEditorGroupIdentifier,
  DraggedEditorIdentifier,
  DraggedViewIdentifier,
  ResourceListDnDHandler,
  ResourcesDropHandler,
  extractTreeDropData,
  fillEditorsDragData,
  isWindowDraggedOver,
  toggleDropEffect
};
//# sourceMappingURL=dnd.js.map
