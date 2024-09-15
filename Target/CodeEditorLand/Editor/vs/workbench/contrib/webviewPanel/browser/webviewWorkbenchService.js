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
import { CancelablePromise, createCancelablePromise, DeferredPromise } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { memoize } from "../../../../base/common/decorators.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { combinedDisposable, Disposable, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { EditorActivation } from "../../../../platform/editor/common/editor.js";
import { createDecorator, IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { GroupIdentifier } from "../../../common/editor.js";
import { DiffEditorInput } from "../../../common/editor/diffEditorInput.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { IOverlayWebview, IWebviewService, WebviewInitInfo } from "../../webview/browser/webview.js";
import { CONTEXT_ACTIVE_WEBVIEW_PANEL_ID } from "./webviewEditor.js";
import { WebviewIconManager, WebviewIcons } from "./webviewIconManager.js";
import { IEditorGroup, IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { ACTIVE_GROUP_TYPE, IEditorService, SIDE_GROUP_TYPE } from "../../../services/editor/common/editorService.js";
import { WebviewInput, WebviewInputInitInfo } from "./webviewEditorInput.js";
const IWebviewWorkbenchService = createDecorator("webviewEditorService");
function canRevive(reviver, webview) {
  return reviver.canResolve(webview);
}
__name(canRevive, "canRevive");
let LazilyResolvedWebviewEditorInput = class extends WebviewInput {
  constructor(init, webview, _webviewWorkbenchService) {
    super(init, webview, _webviewWorkbenchService.iconManager);
    this._webviewWorkbenchService = _webviewWorkbenchService;
  }
  static {
    __name(this, "LazilyResolvedWebviewEditorInput");
  }
  _resolved = false;
  _resolvePromise;
  dispose() {
    super.dispose();
    this._resolvePromise?.cancel();
    this._resolvePromise = void 0;
  }
  async resolve() {
    if (!this._resolved) {
      this._resolved = true;
      this._resolvePromise = createCancelablePromise((token) => this._webviewWorkbenchService.resolveWebview(this, token));
      try {
        await this._resolvePromise;
      } catch (e) {
        if (!isCancellationError(e)) {
          throw e;
        }
      }
    }
    return super.resolve();
  }
  transfer(other) {
    if (!super.transfer(other)) {
      return;
    }
    other._resolved = this._resolved;
    return other;
  }
};
__decorateClass([
  memoize
], LazilyResolvedWebviewEditorInput.prototype, "resolve", 1);
LazilyResolvedWebviewEditorInput = __decorateClass([
  __decorateParam(2, IWebviewWorkbenchService)
], LazilyResolvedWebviewEditorInput);
class RevivalPool {
  static {
    __name(this, "RevivalPool");
  }
  _awaitingRevival = [];
  enqueueForRestoration(input, token) {
    const promise = new DeferredPromise();
    const remove = /* @__PURE__ */ __name(() => {
      const index = this._awaitingRevival.findIndex((entry) => input === entry.input);
      if (index >= 0) {
        this._awaitingRevival.splice(index, 1);
      }
    }, "remove");
    const disposable = combinedDisposable(
      input.webview.onDidDispose(remove),
      token.onCancellationRequested(() => {
        remove();
        promise.cancel();
      })
    );
    this._awaitingRevival.push({ input, promise, disposable });
    return promise.p;
  }
  reviveFor(reviver, token) {
    const toRevive = this._awaitingRevival.filter(({ input }) => canRevive(reviver, input));
    this._awaitingRevival = this._awaitingRevival.filter(({ input }) => !canRevive(reviver, input));
    for (const { input, promise: resolve, disposable } of toRevive) {
      reviver.resolveWebview(input, token).then((x) => resolve.complete(x), (err) => resolve.error(err)).finally(() => {
        disposable.dispose();
      });
    }
  }
}
let WebviewEditorService = class extends Disposable {
  constructor(editorGroupsService, _editorService, _instantiationService, _webviewService) {
    super();
    this._editorService = _editorService;
    this._instantiationService = _instantiationService;
    this._webviewService = _webviewService;
    this._iconManager = this._register(this._instantiationService.createInstance(WebviewIconManager));
    this._register(editorGroupsService.registerContextKeyProvider({
      contextKey: CONTEXT_ACTIVE_WEBVIEW_PANEL_ID,
      getGroupContextKeyValue: /* @__PURE__ */ __name((group) => this.getWebviewId(group.activeEditor), "getGroupContextKeyValue")
    }));
    this._register(_editorService.onDidActiveEditorChange(() => {
      this.updateActiveWebview();
    }));
    this._register(_webviewService.onDidChangeActiveWebview(() => {
      this.updateActiveWebview();
    }));
    this.updateActiveWebview();
  }
  static {
    __name(this, "WebviewEditorService");
  }
  _revivers = /* @__PURE__ */ new Set();
  _revivalPool = new RevivalPool();
  _iconManager;
  get iconManager() {
    return this._iconManager;
  }
  _activeWebview;
  _onDidChangeActiveWebviewEditor = this._register(new Emitter());
  onDidChangeActiveWebviewEditor = this._onDidChangeActiveWebviewEditor.event;
  getWebviewId(input) {
    let webviewInput;
    if (input instanceof WebviewInput) {
      webviewInput = input;
    } else if (input instanceof DiffEditorInput) {
      if (input.primary instanceof WebviewInput) {
        webviewInput = input.primary;
      } else if (input.secondary instanceof WebviewInput) {
        webviewInput = input.secondary;
      }
    }
    return webviewInput?.webview.providedViewType ?? "";
  }
  updateActiveWebview() {
    const activeInput = this._editorService.activeEditor;
    let newActiveWebview;
    if (activeInput instanceof WebviewInput) {
      newActiveWebview = activeInput;
    } else if (activeInput instanceof DiffEditorInput) {
      if (activeInput.primary instanceof WebviewInput && activeInput.primary.webview === this._webviewService.activeWebview) {
        newActiveWebview = activeInput.primary;
      } else if (activeInput.secondary instanceof WebviewInput && activeInput.secondary.webview === this._webviewService.activeWebview) {
        newActiveWebview = activeInput.secondary;
      }
    }
    if (newActiveWebview !== this._activeWebview) {
      this._activeWebview = newActiveWebview;
      this._onDidChangeActiveWebviewEditor.fire(newActiveWebview);
    }
  }
  openWebview(webviewInitInfo, viewType, title, showOptions) {
    const webview = this._webviewService.createWebviewOverlay(webviewInitInfo);
    const webviewInput = this._instantiationService.createInstance(WebviewInput, { viewType, name: title, providedId: webviewInitInfo.providedViewType }, webview, this.iconManager);
    this._editorService.openEditor(webviewInput, {
      pinned: true,
      preserveFocus: showOptions.preserveFocus,
      // preserve pre 1.38 behaviour to not make group active when preserveFocus: true
      // but make sure to restore the editor to fix https://github.com/microsoft/vscode/issues/79633
      activation: showOptions.preserveFocus ? EditorActivation.RESTORE : void 0
    }, showOptions.group);
    return webviewInput;
  }
  revealWebview(webview, group, preserveFocus) {
    const topLevelEditor = this.findTopLevelEditorForWebview(webview);
    this._editorService.openEditor(topLevelEditor, {
      preserveFocus,
      // preserve pre 1.38 behaviour to not make group active when preserveFocus: true
      // but make sure to restore the editor to fix https://github.com/microsoft/vscode/issues/79633
      activation: preserveFocus ? EditorActivation.RESTORE : void 0
    }, group);
  }
  findTopLevelEditorForWebview(webview) {
    for (const editor of this._editorService.editors) {
      if (editor === webview) {
        return editor;
      }
      if (editor instanceof DiffEditorInput) {
        if (webview === editor.primary || webview === editor.secondary) {
          return editor;
        }
      }
    }
    return webview;
  }
  openRevivedWebview(options) {
    const webview = this._webviewService.createWebviewOverlay(options.webviewInitInfo);
    webview.state = options.state;
    const webviewInput = this._instantiationService.createInstance(LazilyResolvedWebviewEditorInput, { viewType: options.viewType, providedId: options.webviewInitInfo.providedViewType, name: options.title }, webview);
    webviewInput.iconPath = options.iconPath;
    if (typeof options.group === "number") {
      webviewInput.updateGroup(options.group);
    }
    return webviewInput;
  }
  registerResolver(reviver) {
    this._revivers.add(reviver);
    const cts = new CancellationTokenSource();
    this._revivalPool.reviveFor(reviver, cts.token);
    return toDisposable(() => {
      this._revivers.delete(reviver);
      cts.dispose(true);
    });
  }
  shouldPersist(webview) {
    if (webview instanceof LazilyResolvedWebviewEditorInput) {
      return true;
    }
    return Iterable.some(this._revivers.values(), (reviver) => canRevive(reviver, webview));
  }
  async tryRevive(webview, token) {
    for (const reviver of this._revivers.values()) {
      if (canRevive(reviver, webview)) {
        await reviver.resolveWebview(webview, token);
        return true;
      }
    }
    return false;
  }
  async resolveWebview(webview, token) {
    const didRevive = await this.tryRevive(webview, token);
    if (!didRevive && !token.isCancellationRequested) {
      return this._revivalPool.enqueueForRestoration(webview, token);
    }
  }
  setIcons(id, iconPath) {
    this._iconManager.setIcons(id, iconPath);
  }
};
WebviewEditorService = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IWebviewService)
], WebviewEditorService);
export {
  IWebviewWorkbenchService,
  LazilyResolvedWebviewEditorInput,
  WebviewEditorService
};
//# sourceMappingURL=webviewWorkbenchService.js.map
