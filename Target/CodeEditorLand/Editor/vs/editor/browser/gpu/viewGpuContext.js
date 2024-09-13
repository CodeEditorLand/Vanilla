var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getActiveWindow } from "../../../base/browser/dom.js";
import { createFastDomNode } from "../../../base/browser/fastDomNode.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { GPULifecycle } from "./gpuDisposable.js";
import { ensureNonNullable, observeDevicePixelDimensions } from "./gpuUtils.js";
class ViewGpuContext extends Disposable {
  static {
    __name(this, "ViewGpuContext");
  }
  canvas;
  ctx;
  device;
  _onDidChangeCanvasDevicePixelDimensions = this._register(new Emitter());
  onDidChangeCanvasDevicePixelDimensions = this._onDidChangeCanvasDevicePixelDimensions.event;
  constructor() {
    super();
    this.canvas = createFastDomNode(document.createElement("canvas"));
    this.canvas.setClassName("editorCanvas");
    this.ctx = ensureNonNullable(this.canvas.domNode.getContext("webgpu"));
    this.device = GPULifecycle.requestDevice().then((ref) => this._register(ref).object);
    this._register(observeDevicePixelDimensions(this.canvas.domNode, getActiveWindow(), (width, height) => {
      this.canvas.domNode.width = width;
      this.canvas.domNode.height = height;
      this._onDidChangeCanvasDevicePixelDimensions.fire({ width, height });
    }));
  }
}
export {
  ViewGpuContext
};
//# sourceMappingURL=viewGpuContext.js.map
