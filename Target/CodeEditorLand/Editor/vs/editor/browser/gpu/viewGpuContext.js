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
  addDisposableListener,
  getActiveWindow
} from "../../../base/browser/dom.js";
import {
  createFastDomNode
} from "../../../base/browser/fastDomNode.js";
import { BugIndicatingError } from "../../../base/common/errors.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import {
  observableValue,
  runOnChange
} from "../../../base/common/observable.js";
import * as nls from "../../../nls.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import {
  INotificationService,
  Severity
} from "../../../platform/notification/common/notification.js";
import { TextureAtlas } from "./atlas/textureAtlas.js";
import { GPULifecycle } from "./gpuDisposable.js";
import { ensureNonNullable, observeDevicePixelDimensions } from "./gpuUtils.js";
let ViewGpuContext = class extends Disposable {
  constructor(_instantiationService, _notificationService, configurationService) {
    super();
    this._instantiationService = _instantiationService;
    this._notificationService = _notificationService;
    this.configurationService = configurationService;
    this.canvas = createFastDomNode(document.createElement("canvas"));
    this.canvas.setClassName("editorCanvas");
    this.ctx = ensureNonNullable(this.canvas.domNode.getContext("webgpu"));
    this.device = GPULifecycle.requestDevice((message) => {
      const choices = [{
        label: nls.localize("editor.dom.render", "Use DOM-based rendering"),
        run: /* @__PURE__ */ __name(() => this.configurationService.updateValue("editor.experimentalGpuAcceleration", "off"), "run")
      }];
      this._notificationService.prompt(Severity.Warning, message, choices);
    }).then((ref) => this._register(ref).object);
    this.device.then((device) => {
      if (!ViewGpuContext._atlas) {
        ViewGpuContext._atlas = this._instantiationService.createInstance(TextureAtlas, device.limits.maxTextureDimension2D, void 0);
        runOnChange(this.devicePixelRatio, () => ViewGpuContext.atlas.clear());
      }
    });
    const dprObs = observableValue(this, getActiveWindow().devicePixelRatio);
    this._register(addDisposableListener(getActiveWindow(), "resize", () => {
      dprObs.set(getActiveWindow().devicePixelRatio, void 0);
    }));
    this.devicePixelRatio = dprObs;
    const canvasDevicePixelDimensions = observableValue(this, { width: this.canvas.domNode.width, height: this.canvas.domNode.height });
    this._register(observeDevicePixelDimensions(
      this.canvas.domNode,
      getActiveWindow(),
      (width, height) => {
        this.canvas.domNode.width = width;
        this.canvas.domNode.height = height;
        canvasDevicePixelDimensions.set({ width, height }, void 0);
      }
    ));
    this.canvasDevicePixelDimensions = canvasDevicePixelDimensions;
  }
  static {
    __name(this, "ViewGpuContext");
  }
  canvas;
  ctx;
  device;
  static _atlas;
  /**
   * The shared texture atlas to use across all views.
   *
   * @throws if called before the GPU device is resolved
   */
  static get atlas() {
    if (!ViewGpuContext._atlas) {
      throw new BugIndicatingError(
        "Cannot call ViewGpuContext.textureAtlas before device is resolved"
      );
    }
    return ViewGpuContext._atlas;
  }
  /**
   * The shared texture atlas to use across all views. This is a convenience alias for
   * {@link ViewGpuContext.atlas}.
   *
   * @throws if called before the GPU device is resolved
   */
  get atlas() {
    return ViewGpuContext.atlas;
  }
  canvasDevicePixelDimensions;
  devicePixelRatio;
  /**
   * This method determines which lines can be and are allowed to be rendered using the GPU
   * renderer. Eventually this should trend all lines, except maybe exceptional cases like
   * decorations that use class names.
   */
  static canRender(options, viewportData, lineNumber) {
    const data = viewportData.getViewLineRenderingData(lineNumber);
    if (data.containsRTL || data.maxColumn > 200 || data.continuesWithWrappedLine || data.inlineDecorations.length > 0) {
      return false;
    }
    return true;
  }
};
ViewGpuContext = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, IConfigurationService)
], ViewGpuContext);
export {
  ViewGpuContext
};
//# sourceMappingURL=viewGpuContext.js.map
