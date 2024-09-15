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
import { distinct } from "../../../base/common/arrays.js";
import {
  VSDataTransfer,
  createStringDataTransferItem
} from "../../../base/common/dataTransfer.js";
import {
  Disposable,
  DisposableMap,
  DisposableStore
} from "../../../base/common/lifecycle.js";
import { isNumber, isUndefinedOrNull } from "../../../base/common/types.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { INotificationService } from "../../../platform/notification/common/notification.js";
import { Registry } from "../../../platform/registry/common/platform.js";
import {
  Extensions,
  NoTreeViewError,
  ResolvableTreeItem
} from "../../common/views.js";
import {
  extHostNamedCustomer
} from "../../services/extensions/common/extHostCustomers.js";
import { IExtensionService } from "../../services/extensions/common/extensions.js";
import { IViewsService } from "../../services/views/common/viewsService.js";
import {
  ExtHostContext,
  MainContext
} from "../common/extHost.protocol.js";
import * as typeConvert from "../common/extHostTypeConverters.js";
import { DataTransferFileCache } from "../common/shared/dataTransferCache.js";
let MainThreadTreeViews = class extends Disposable {
  constructor(extHostContext, viewsService, notificationService, extensionService, logService) {
    super();
    this.viewsService = viewsService;
    this.notificationService = notificationService;
    this.extensionService = extensionService;
    this.logService = logService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTreeViews);
  }
  _proxy;
  _dataProviders = this._register(
    new DisposableMap()
  );
  _dndControllers = /* @__PURE__ */ new Map();
  async $registerTreeViewDataProvider(treeViewId, options) {
    this.logService.trace(
      "MainThreadTreeViews#$registerTreeViewDataProvider",
      treeViewId,
      options
    );
    this.extensionService.whenInstalledExtensionsRegistered().then(() => {
      const dataProvider = new TreeViewDataProvider(
        treeViewId,
        this._proxy,
        this.notificationService
      );
      const disposables = new DisposableStore();
      this._dataProviders.set(treeViewId, {
        dataProvider,
        dispose: /* @__PURE__ */ __name(() => disposables.dispose(), "dispose")
      });
      const dndController = options.hasHandleDrag || options.hasHandleDrop ? new TreeViewDragAndDropController(
        treeViewId,
        options.dropMimeTypes,
        options.dragMimeTypes,
        options.hasHandleDrag,
        this._proxy
      ) : void 0;
      const viewer = this.getTreeView(treeViewId);
      if (viewer) {
        viewer.showCollapseAllAction = options.showCollapseAll;
        viewer.canSelectMany = options.canSelectMany;
        viewer.manuallyManageCheckboxes = options.manuallyManageCheckboxes;
        viewer.dragAndDropController = dndController;
        if (dndController) {
          this._dndControllers.set(treeViewId, dndController);
        }
        viewer.dataProvider = dataProvider;
        this.registerListeners(treeViewId, viewer, disposables);
        this._proxy.$setVisible(treeViewId, viewer.visible);
      } else {
        this.notificationService.error(
          "No view is registered with id: " + treeViewId
        );
      }
    });
  }
  $reveal(treeViewId, itemInfo, options) {
    this.logService.trace(
      "MainThreadTreeViews#$reveal",
      treeViewId,
      itemInfo?.item,
      itemInfo?.parentChain,
      options
    );
    return this.viewsService.openView(treeViewId, options.focus).then(() => {
      const viewer = this.getTreeView(treeViewId);
      if (viewer && itemInfo) {
        return this.reveal(
          viewer,
          this._dataProviders.get(treeViewId).dataProvider,
          itemInfo.item,
          itemInfo.parentChain,
          options
        );
      }
      return void 0;
    });
  }
  $refresh(treeViewId, itemsToRefreshByHandle) {
    this.logService.trace(
      "MainThreadTreeViews#$refresh",
      treeViewId,
      itemsToRefreshByHandle
    );
    const viewer = this.getTreeView(treeViewId);
    const dataProvider = this._dataProviders.get(treeViewId);
    if (viewer && dataProvider) {
      const itemsToRefresh = dataProvider.dataProvider.getItemsToRefresh(
        itemsToRefreshByHandle
      );
      return viewer.refresh(
        itemsToRefresh.length ? itemsToRefresh : void 0
      );
    }
    return Promise.resolve();
  }
  $setMessage(treeViewId, message) {
    this.logService.trace(
      "MainThreadTreeViews#$setMessage",
      treeViewId,
      message.toString()
    );
    const viewer = this.getTreeView(treeViewId);
    if (viewer) {
      viewer.message = message;
    }
  }
  $setTitle(treeViewId, title, description) {
    this.logService.trace(
      "MainThreadTreeViews#$setTitle",
      treeViewId,
      title,
      description
    );
    const viewer = this.getTreeView(treeViewId);
    if (viewer) {
      viewer.title = title;
      viewer.description = description;
    }
  }
  $setBadge(treeViewId, badge) {
    this.logService.trace(
      "MainThreadTreeViews#$setBadge",
      treeViewId,
      badge?.value,
      badge?.tooltip
    );
    const viewer = this.getTreeView(treeViewId);
    if (viewer) {
      viewer.badge = badge;
    }
  }
  $resolveDropFileData(destinationViewId, requestId, dataItemId) {
    const controller = this._dndControllers.get(destinationViewId);
    if (!controller) {
      throw new Error("Unknown tree");
    }
    return controller.resolveDropFileData(requestId, dataItemId);
  }
  async $disposeTree(treeViewId) {
    const viewer = this.getTreeView(treeViewId);
    if (viewer) {
      viewer.dataProvider = void 0;
    }
    this._dataProviders.deleteAndDispose(treeViewId);
  }
  async reveal(treeView, dataProvider, itemIn, parentChain, options) {
    options = options ? options : { select: false, focus: false };
    const select = isUndefinedOrNull(options.select) ? false : options.select;
    const focus = isUndefinedOrNull(options.focus) ? false : options.focus;
    let expand = Math.min(
      isNumber(options.expand) ? options.expand : options.expand === true ? 1 : 0,
      3
    );
    if (dataProvider.isEmpty()) {
      await treeView.refresh();
    }
    for (const parent of parentChain) {
      const parentItem = dataProvider.getItem(parent.handle);
      if (parentItem) {
        await treeView.expand(parentItem);
      }
    }
    const item = dataProvider.getItem(itemIn.handle);
    if (item) {
      await treeView.reveal(item);
      if (select) {
        treeView.setSelection([item]);
      }
      if (focus === false) {
        treeView.setFocus();
      } else if (focus) {
        treeView.setFocus(item);
      }
      let itemsToExpand = [item];
      for (; itemsToExpand.length > 0 && expand > 0; expand--) {
        await treeView.expand(itemsToExpand);
        itemsToExpand = itemsToExpand.reduce((result, itemValue) => {
          const item2 = dataProvider.getItem(itemValue.handle);
          if (item2 && item2.children && item2.children.length) {
            result.push(...item2.children);
          }
          return result;
        }, []);
      }
    }
  }
  registerListeners(treeViewId, treeView, disposables) {
    disposables.add(
      treeView.onDidExpandItem(
        (item) => this._proxy.$setExpanded(treeViewId, item.handle, true)
      )
    );
    disposables.add(
      treeView.onDidCollapseItem(
        (item) => this._proxy.$setExpanded(treeViewId, item.handle, false)
      )
    );
    disposables.add(
      treeView.onDidChangeSelectionAndFocus(
        (items) => this._proxy.$setSelectionAndFocus(
          treeViewId,
          items.selection.map(({ handle }) => handle),
          items.focus.handle
        )
      )
    );
    disposables.add(
      treeView.onDidChangeVisibility(
        (isVisible) => this._proxy.$setVisible(treeViewId, isVisible)
      )
    );
    disposables.add(
      treeView.onDidChangeCheckboxState((items) => {
        this._proxy.$changeCheckboxState(
          treeViewId,
          items.map((item) => {
            return {
              treeItemHandle: item.handle,
              newState: item.checkbox?.isChecked ?? false
            };
          })
        );
      })
    );
  }
  getTreeView(treeViewId) {
    const viewDescriptor = Registry.as(Extensions.ViewsRegistry).getView(
      treeViewId
    );
    return viewDescriptor ? viewDescriptor.treeView : null;
  }
  dispose() {
    for (const dataprovider of this._dataProviders) {
      const treeView = this.getTreeView(dataprovider[0]);
      if (treeView) {
        treeView.dataProvider = void 0;
      }
    }
    this._dataProviders.dispose();
    this._dndControllers.clear();
    super.dispose();
  }
};
__name(MainThreadTreeViews, "MainThreadTreeViews");
MainThreadTreeViews = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadTreeViews),
  __decorateParam(1, IViewsService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, ILogService)
], MainThreadTreeViews);
class TreeViewDragAndDropController {
  constructor(treeViewId, dropMimeTypes, dragMimeTypes, hasWillDrop, _proxy) {
    this.treeViewId = treeViewId;
    this.dropMimeTypes = dropMimeTypes;
    this.dragMimeTypes = dragMimeTypes;
    this.hasWillDrop = hasWillDrop;
    this._proxy = _proxy;
  }
  static {
    __name(this, "TreeViewDragAndDropController");
  }
  dataTransfersCache = new DataTransferFileCache();
  async handleDrop(dataTransfer, targetTreeItem, token, operationUuid, sourceTreeId, sourceTreeItemHandles) {
    const request = this.dataTransfersCache.add(dataTransfer);
    try {
      const dataTransferDto = await typeConvert.DataTransfer.from(dataTransfer);
      if (token.isCancellationRequested) {
        return;
      }
      return await this._proxy.$handleDrop(
        this.treeViewId,
        request.id,
        dataTransferDto,
        targetTreeItem?.handle,
        token,
        operationUuid,
        sourceTreeId,
        sourceTreeItemHandles
      );
    } finally {
      request.dispose();
    }
  }
  async handleDrag(sourceTreeItemHandles, operationUuid, token) {
    if (!this.hasWillDrop) {
      return;
    }
    const additionalDataTransferDTO = await this._proxy.$handleDrag(
      this.treeViewId,
      sourceTreeItemHandles,
      operationUuid,
      token
    );
    if (!additionalDataTransferDTO) {
      return;
    }
    const additionalDataTransfer = new VSDataTransfer();
    additionalDataTransferDTO.items.forEach(([type, item]) => {
      additionalDataTransfer.replace(
        type,
        createStringDataTransferItem(item.asString)
      );
    });
    return additionalDataTransfer;
  }
  resolveDropFileData(requestId, dataItemId) {
    return this.dataTransfersCache.resolveFileData(requestId, dataItemId);
  }
}
class TreeViewDataProvider {
  constructor(treeViewId, _proxy, notificationService) {
    this.treeViewId = treeViewId;
    this._proxy = _proxy;
    this.notificationService = notificationService;
    this.hasResolve = this._proxy.$hasResolve(this.treeViewId);
  }
  static {
    __name(this, "TreeViewDataProvider");
  }
  itemsMap = /* @__PURE__ */ new Map();
  hasResolve;
  getChildren(treeItem) {
    if (!treeItem) {
      this.itemsMap.clear();
    }
    return this._proxy.$getChildren(
      this.treeViewId,
      treeItem ? treeItem.handle : void 0
    ).then(
      (children) => this.postGetChildren(children),
      (err) => {
        if (!NoTreeViewError.is(err)) {
          this.notificationService.error(err);
        }
        return [];
      }
    );
  }
  getItemsToRefresh(itemsToRefreshByHandle) {
    const itemsToRefresh = [];
    if (itemsToRefreshByHandle) {
      for (const treeItemHandle of Object.keys(itemsToRefreshByHandle)) {
        const currentTreeItem = this.getItem(treeItemHandle);
        if (currentTreeItem) {
          const treeItem = itemsToRefreshByHandle[treeItemHandle];
          this.updateTreeItem(currentTreeItem, treeItem);
          if (treeItemHandle === treeItem.handle) {
            itemsToRefresh.push(currentTreeItem);
          } else {
            this.itemsMap.delete(treeItemHandle);
            this.itemsMap.set(
              currentTreeItem.handle,
              currentTreeItem
            );
            const parent = treeItem.parentHandle ? this.itemsMap.get(treeItem.parentHandle) : null;
            if (parent) {
              itemsToRefresh.push(parent);
            }
          }
        }
      }
    }
    return itemsToRefresh;
  }
  getItem(treeItemHandle) {
    return this.itemsMap.get(treeItemHandle);
  }
  isEmpty() {
    return this.itemsMap.size === 0;
  }
  async postGetChildren(elements) {
    if (elements === void 0) {
      return void 0;
    }
    const result = [];
    const hasResolve = await this.hasResolve;
    if (elements) {
      for (const element of elements) {
        const resolvable = new ResolvableTreeItem(
          element,
          hasResolve ? (token) => {
            return this._proxy.$resolve(
              this.treeViewId,
              element.handle,
              token
            );
          } : void 0
        );
        this.itemsMap.set(element.handle, resolvable);
        result.push(resolvable);
      }
    }
    return result;
  }
  updateTreeItem(current, treeItem) {
    treeItem.children = treeItem.children ? treeItem.children : void 0;
    if (current) {
      const properties = distinct([
        ...Object.keys(
          current instanceof ResolvableTreeItem ? current.asTreeItem() : current
        ),
        ...Object.keys(treeItem)
      ]);
      for (const property of properties) {
        current[property] = treeItem[property];
      }
      if (current instanceof ResolvableTreeItem) {
        current.resetResolve();
      }
    }
  }
}
export {
  MainThreadTreeViews
};
//# sourceMappingURL=mainThreadTreeViews.js.map
