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
import { VSBuffer } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Emitter } from "../../../base/common/event.js";
import { DisposableStore, dispose, IDisposable } from "../../../base/common/lifecycle.js";
import { StopWatch } from "../../../base/common/stopwatch.js";
import { assertType } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { CommandsRegistry } from "../../../platform/commands/common/commands.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { NotebookDto } from "./mainThreadNotebookDto.js";
import { INotebookCellStatusBarService } from "../../contrib/notebook/common/notebookCellStatusBarService.js";
import { INotebookCellStatusBarItemProvider, INotebookContributionData, INotebookExclusiveDocumentFilter, NotebookData, NotebookExtensionDescription, TransientOptions } from "../../contrib/notebook/common/notebookCommon.js";
import { INotebookService, SimpleNotebookProviderInfo } from "../../contrib/notebook/common/notebookService.js";
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { SerializableObjectWithBuffers } from "../../services/extensions/common/proxyIdentifier.js";
import { ExtHostContext, ExtHostNotebookShape, MainContext, MainThreadNotebookShape } from "../common/extHost.protocol.js";
import { IRelativePattern } from "../../../base/common/glob.js";
import { revive } from "../../../base/common/marshalling.js";
import { INotebookFileMatchNoModel } from "../../contrib/search/common/searchNotebookHelpers.js";
import { NotebookPriorityInfo } from "../../contrib/search/common/search.js";
import { coalesce } from "../../../base/common/arrays.js";
let MainThreadNotebooks = class {
  constructor(extHostContext, _notebookService, _cellStatusBarService, _logService) {
    this._notebookService = _notebookService;
    this._cellStatusBarService = _cellStatusBarService;
    this._logService = _logService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostNotebook);
  }
  _disposables = new DisposableStore();
  _proxy;
  _notebookSerializer = /* @__PURE__ */ new Map();
  _notebookCellStatusBarRegistrations = /* @__PURE__ */ new Map();
  dispose() {
    this._disposables.dispose();
    dispose(this._notebookSerializer.values());
  }
  $registerNotebookSerializer(handle, extension, viewType, options, data) {
    const disposables = new DisposableStore();
    disposables.add(this._notebookService.registerNotebookSerializer(viewType, extension, {
      options,
      dataToNotebook: /* @__PURE__ */ __name(async (data2) => {
        const sw = new StopWatch();
        let result;
        if (data2.byteLength === 0 && viewType === "interactive") {
          result = NotebookDto.fromNotebookDataDto({ cells: [], metadata: {} });
        } else {
          const dto = await this._proxy.$dataToNotebook(handle, data2, CancellationToken.None);
          result = NotebookDto.fromNotebookDataDto(dto.value);
        }
        this._logService.trace(`[NotebookSerializer] dataToNotebook DONE after ${sw.elapsed()}ms`, {
          viewType,
          extensionId: extension.id.value
        });
        return result;
      }, "dataToNotebook"),
      notebookToData: /* @__PURE__ */ __name((data2) => {
        const sw = new StopWatch();
        const result = this._proxy.$notebookToData(handle, new SerializableObjectWithBuffers(NotebookDto.toNotebookDataDto(data2)), CancellationToken.None);
        this._logService.trace(`[NotebookSerializer] notebookToData DONE after ${sw.elapsed()}`, {
          viewType,
          extensionId: extension.id.value
        });
        return result;
      }, "notebookToData"),
      save: /* @__PURE__ */ __name(async (uri, versionId, options2, token) => {
        const stat = await this._proxy.$saveNotebook(handle, uri, versionId, options2, token);
        return {
          ...stat,
          children: void 0,
          resource: uri
        };
      }, "save"),
      searchInNotebooks: /* @__PURE__ */ __name(async (textQuery, token, allPriorityInfo) => {
        const contributedType = this._notebookService.getContributedNotebookType(viewType);
        if (!contributedType) {
          return { results: [], limitHit: false };
        }
        const fileNames = contributedType.selectors;
        const includes = fileNames.map((selector) => {
          const globPattern = selector.include || selector;
          return globPattern.toString();
        });
        if (!includes.length) {
          return {
            results: [],
            limitHit: false
          };
        }
        const thisPriorityInfo = coalesce([{ isFromSettings: false, filenamePatterns: includes }, ...allPriorityInfo.get(viewType) ?? []]);
        const otherEditorsPriorityInfo = Array.from(allPriorityInfo.keys()).flatMap((key) => {
          if (key !== viewType) {
            return allPriorityInfo.get(key) ?? [];
          }
          return [];
        });
        const searchComplete = await this._proxy.$searchInNotebooks(handle, textQuery, thisPriorityInfo, otherEditorsPriorityInfo, token);
        const revivedResults = searchComplete.results.map((result) => {
          const resource = URI.revive(result.resource);
          return {
            resource,
            cellResults: result.cellResults.map((e) => revive(e))
          };
        });
        return { results: revivedResults, limitHit: searchComplete.limitHit };
      }, "searchInNotebooks")
    }));
    if (data) {
      disposables.add(this._notebookService.registerContributedNotebookType(viewType, data));
    }
    this._notebookSerializer.set(handle, disposables);
    this._logService.trace("[NotebookSerializer] registered notebook serializer", {
      viewType,
      extensionId: extension.id.value
    });
  }
  $unregisterNotebookSerializer(handle) {
    this._notebookSerializer.get(handle)?.dispose();
    this._notebookSerializer.delete(handle);
  }
  $emitCellStatusBarEvent(eventHandle) {
    const emitter = this._notebookCellStatusBarRegistrations.get(eventHandle);
    if (emitter instanceof Emitter) {
      emitter.fire(void 0);
    }
  }
  async $registerNotebookCellStatusBarItemProvider(handle, eventHandle, viewType) {
    const that = this;
    const provider = {
      async provideCellStatusBarItems(uri, index, token) {
        const result = await that._proxy.$provideNotebookCellStatusBarItems(handle, uri, index, token);
        return {
          items: result?.items ?? [],
          dispose() {
            if (result) {
              that._proxy.$releaseNotebookCellStatusBarItems(result.cacheId);
            }
          }
        };
      },
      viewType
    };
    if (typeof eventHandle === "number") {
      const emitter = new Emitter();
      this._notebookCellStatusBarRegistrations.set(eventHandle, emitter);
      provider.onDidChangeStatusBarItems = emitter.event;
    }
    const disposable = this._cellStatusBarService.registerCellStatusBarItemProvider(provider);
    this._notebookCellStatusBarRegistrations.set(handle, disposable);
  }
  async $unregisterNotebookCellStatusBarItemProvider(handle, eventHandle) {
    const unregisterThing = /* @__PURE__ */ __name((handle2) => {
      const entry = this._notebookCellStatusBarRegistrations.get(handle2);
      if (entry) {
        this._notebookCellStatusBarRegistrations.get(handle2)?.dispose();
        this._notebookCellStatusBarRegistrations.delete(handle2);
      }
    }, "unregisterThing");
    unregisterThing(handle);
    if (typeof eventHandle === "number") {
      unregisterThing(eventHandle);
    }
  }
};
__name(MainThreadNotebooks, "MainThreadNotebooks");
MainThreadNotebooks = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadNotebook),
  __decorateParam(1, INotebookService),
  __decorateParam(2, INotebookCellStatusBarService),
  __decorateParam(3, ILogService)
], MainThreadNotebooks);
CommandsRegistry.registerCommand("_executeDataToNotebook", async (accessor, ...args) => {
  const [notebookType, bytes] = args;
  assertType(typeof notebookType === "string", "string");
  assertType(bytes instanceof VSBuffer, "VSBuffer");
  const notebookService = accessor.get(INotebookService);
  const info = await notebookService.withNotebookDataProvider(notebookType);
  if (!(info instanceof SimpleNotebookProviderInfo)) {
    return;
  }
  const dto = await info.serializer.dataToNotebook(bytes);
  return new SerializableObjectWithBuffers(NotebookDto.toNotebookDataDto(dto));
});
CommandsRegistry.registerCommand("_executeNotebookToData", async (accessor, ...args) => {
  const [notebookType, dto] = args;
  assertType(typeof notebookType === "string", "string");
  assertType(typeof dto === "object");
  const notebookService = accessor.get(INotebookService);
  const info = await notebookService.withNotebookDataProvider(notebookType);
  if (!(info instanceof SimpleNotebookProviderInfo)) {
    return;
  }
  const data = NotebookDto.fromNotebookDataDto(dto.value);
  const bytes = await info.serializer.notebookToData(data);
  return bytes;
});
export {
  MainThreadNotebooks
};
//# sourceMappingURL=mainThreadNotebook.js.map
