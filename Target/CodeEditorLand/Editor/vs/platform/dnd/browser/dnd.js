var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DataTransfers } from "../../../base/browser/dnd.js";
import { mainWindow } from "../../../base/browser/window.js";
import { coalesce } from "../../../base/common/arrays.js";
import { DeferredPromise } from "../../../base/common/async.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { ResourceMap } from "../../../base/common/map.js";
import { parse } from "../../../base/common/marshalling.js";
import { Schemas } from "../../../base/common/network.js";
import { isWeb } from "../../../base/common/platform.js";
import { URI } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { IDialogService } from "../../dialogs/common/dialogs.js";
import { HTMLFileSystemProvider } from "../../files/browser/htmlFileSystemProvider.js";
import { WebFileSystemAccess } from "../../files/browser/webFileSystemAccess.js";
import { ByteSize, IFileService } from "../../files/common/files.js";
import {
  IInstantiationService
} from "../../instantiation/common/instantiation.js";
import { extractSelection } from "../../opener/common/opener.js";
import { Registry } from "../../registry/common/platform.js";
const CodeDataTransfers = {
  EDITORS: "CodeEditors",
  FILES: "CodeFiles"
};
function extractEditorsDropData(e) {
  const editors = [];
  if (e.dataTransfer && e.dataTransfer.types.length > 0) {
    const rawEditorsData = e.dataTransfer.getData(
      CodeDataTransfers.EDITORS
    );
    if (rawEditorsData) {
      try {
        editors.push(...parse(rawEditorsData));
      } catch (error) {
      }
    } else {
      try {
        const rawResourcesData = e.dataTransfer.getData(
          DataTransfers.RESOURCES
        );
        editors.push(
          ...createDraggedEditorInputFromRawResourcesData(
            rawResourcesData
          )
        );
      } catch (error) {
      }
    }
    if (e.dataTransfer?.files) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file && file.path) {
          try {
            editors.push({
              resource: URI.file(
                file.path
              ),
              isExternal: true,
              allowWorkspaceOpen: true
            });
          } catch (error) {
          }
        }
      }
    }
    const rawCodeFiles = e.dataTransfer.getData(CodeDataTransfers.FILES);
    if (rawCodeFiles) {
      try {
        const codeFiles = JSON.parse(rawCodeFiles);
        for (const codeFile of codeFiles) {
          editors.push({
            resource: URI.file(codeFile),
            isExternal: true,
            allowWorkspaceOpen: true
          });
        }
      } catch (error) {
      }
    }
    const contributions = Registry.as(
      Extensions.DragAndDropContribution
    ).getAll();
    for (const contribution of contributions) {
      const data = e.dataTransfer.getData(contribution.dataFormatKey);
      if (data) {
        try {
          editors.push(...contribution.getEditorInputs(data));
        } catch (error) {
        }
      }
    }
  }
  const coalescedEditors = [];
  const seen = new ResourceMap();
  for (const editor of editors) {
    if (!editor.resource) {
      coalescedEditors.push(editor);
    } else if (!seen.has(editor.resource)) {
      coalescedEditors.push(editor);
      seen.set(editor.resource, true);
    }
  }
  return coalescedEditors;
}
__name(extractEditorsDropData, "extractEditorsDropData");
async function extractEditorsAndFilesDropData(accessor, e) {
  const editors = extractEditorsDropData(e);
  if (e.dataTransfer && isWeb && containsDragType(e, DataTransfers.FILES)) {
    const files = e.dataTransfer.items;
    if (files) {
      const instantiationService = accessor.get(IInstantiationService);
      const filesData = await instantiationService.invokeFunction(
        (accessor2) => extractFilesDropData(accessor2, e)
      );
      for (const fileData of filesData) {
        editors.push({
          resource: fileData.resource,
          contents: fileData.contents?.toString(),
          isExternal: true,
          allowWorkspaceOpen: fileData.isDirectory
        });
      }
    }
  }
  return editors;
}
__name(extractEditorsAndFilesDropData, "extractEditorsAndFilesDropData");
function createDraggedEditorInputFromRawResourcesData(rawResourcesData) {
  const editors = [];
  if (rawResourcesData) {
    const resourcesRaw = JSON.parse(rawResourcesData);
    for (const resourceRaw of resourcesRaw) {
      if (resourceRaw.indexOf(":") > 0) {
        const { selection, uri } = extractSelection(
          URI.parse(resourceRaw)
        );
        editors.push({ resource: uri, options: { selection } });
      }
    }
  }
  return editors;
}
__name(createDraggedEditorInputFromRawResourcesData, "createDraggedEditorInputFromRawResourcesData");
async function extractFilesDropData(accessor, event) {
  if (WebFileSystemAccess.supported(mainWindow)) {
    const items = event.dataTransfer?.items;
    if (items) {
      return extractFileTransferData(accessor, items);
    }
  }
  const files = event.dataTransfer?.files;
  if (!files) {
    return [];
  }
  return extractFileListData(accessor, files);
}
__name(extractFilesDropData, "extractFilesDropData");
async function extractFileTransferData(accessor, items) {
  const fileSystemProvider = accessor.get(IFileService).getProvider(Schemas.file);
  if (!(fileSystemProvider instanceof HTMLFileSystemProvider)) {
    return [];
  }
  const results = [];
  for (let i = 0; i < items.length; i++) {
    const file = items[i];
    if (file) {
      const result = new DeferredPromise();
      results.push(result);
      (async () => {
        try {
          const handle = await file.getAsFileSystemHandle();
          if (!handle) {
            result.complete(void 0);
            return;
          }
          if (WebFileSystemAccess.isFileSystemFileHandle(handle)) {
            result.complete({
              resource: await fileSystemProvider.registerFileHandle(
                handle
              ),
              isDirectory: false
            });
          } else if (WebFileSystemAccess.isFileSystemDirectoryHandle(handle)) {
            result.complete({
              resource: await fileSystemProvider.registerDirectoryHandle(
                handle
              ),
              isDirectory: true
            });
          } else {
            result.complete(void 0);
          }
        } catch (error) {
          result.complete(void 0);
        }
      })();
    }
  }
  return coalesce(await Promise.all(results.map((result) => result.p)));
}
__name(extractFileTransferData, "extractFileTransferData");
async function extractFileListData(accessor, files) {
  const dialogService = accessor.get(IDialogService);
  const results = [];
  for (let i = 0; i < files.length; i++) {
    const file = files.item(i);
    if (file) {
      if (file.size > 100 * ByteSize.MB) {
        dialogService.warn(
          localize(
            "fileTooLarge",
            "File is too large to open as untitled editor. Please upload it first into the file explorer and then try again."
          )
        );
        continue;
      }
      const result = new DeferredPromise();
      results.push(result);
      const reader = new FileReader();
      reader.onerror = () => result.complete(void 0);
      reader.onabort = () => result.complete(void 0);
      reader.onload = async (event) => {
        const name = file.name;
        const loadResult = event.target?.result ?? void 0;
        if (typeof name !== "string" || typeof loadResult === "undefined") {
          result.complete(void 0);
          return;
        }
        result.complete({
          resource: URI.from({
            scheme: Schemas.untitled,
            path: name
          }),
          contents: typeof loadResult === "string" ? VSBuffer.fromString(loadResult) : VSBuffer.wrap(new Uint8Array(loadResult))
        });
      };
      reader.readAsArrayBuffer(file);
    }
  }
  return coalesce(await Promise.all(results.map((result) => result.p)));
}
__name(extractFileListData, "extractFileListData");
function containsDragType(event, ...dragTypesToFind) {
  if (!event.dataTransfer) {
    return false;
  }
  const dragTypes = event.dataTransfer.types;
  const lowercaseDragTypes = [];
  for (let i = 0; i < dragTypes.length; i++) {
    lowercaseDragTypes.push(dragTypes[i].toLowerCase());
  }
  for (const dragType of dragTypesToFind) {
    if (lowercaseDragTypes.indexOf(dragType.toLowerCase()) >= 0) {
      return true;
    }
  }
  return false;
}
__name(containsDragType, "containsDragType");
class DragAndDropContributionRegistry {
  static {
    __name(this, "DragAndDropContributionRegistry");
  }
  _contributions = /* @__PURE__ */ new Map();
  register(contribution) {
    if (this._contributions.has(contribution.dataFormatKey)) {
      throw new Error(
        `A drag and drop contributiont with key '${contribution.dataFormatKey}' was already registered.`
      );
    }
    this._contributions.set(contribution.dataFormatKey, contribution);
  }
  getAll() {
    return this._contributions.values();
  }
}
const Extensions = {
  DragAndDropContribution: "workbench.contributions.dragAndDrop"
};
Registry.add(
  Extensions.DragAndDropContribution,
  new DragAndDropContributionRegistry()
);
class LocalSelectionTransfer {
  static {
    __name(this, "LocalSelectionTransfer");
  }
  static INSTANCE = new LocalSelectionTransfer();
  data;
  proto;
  constructor() {
  }
  static getInstance() {
    return LocalSelectionTransfer.INSTANCE;
  }
  hasData(proto) {
    return proto && proto === this.proto;
  }
  clearData(proto) {
    if (this.hasData(proto)) {
      this.proto = void 0;
      this.data = void 0;
    }
  }
  getData(proto) {
    if (this.hasData(proto)) {
      return this.data;
    }
    return void 0;
  }
  setData(data, proto) {
    if (proto) {
      this.data = data;
      this.proto = proto;
    }
  }
}
export {
  CodeDataTransfers,
  Extensions,
  LocalSelectionTransfer,
  containsDragType,
  createDraggedEditorInputFromRawResourcesData,
  extractEditorsAndFilesDropData,
  extractEditorsDropData,
  extractFileListData
};
//# sourceMappingURL=dnd.js.map
