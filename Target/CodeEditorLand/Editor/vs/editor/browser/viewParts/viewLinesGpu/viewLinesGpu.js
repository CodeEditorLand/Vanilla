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
import { getActiveWindow } from "../../../../base/browser/dom.js";
import { BugIndicatingError } from "../../../../base/common/errors.js";
import { autorun } from "../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { TextureAtlasPage } from "../../gpu/atlas/textureAtlasPage.js";
import { FullFileRenderStrategy } from "../../gpu/fullFileRenderStrategy.js";
import { BindingId } from "../../gpu/gpu.js";
import { GPULifecycle } from "../../gpu/gpuDisposable.js";
import { observeDevicePixelDimensions, quadVertices } from "../../gpu/gpuUtils.js";
import { ViewGpuContext } from "../../gpu/viewGpuContext.js";
import { ViewPart } from "../../view/viewPart.js";
import { ViewLineOptions } from "../viewLines/viewLineOptions.js";
var GlyphStorageBufferInfo = /* @__PURE__ */ ((GlyphStorageBufferInfo2) => {
  GlyphStorageBufferInfo2[GlyphStorageBufferInfo2["FloatsPerEntry"] = 6] = "FloatsPerEntry";
  GlyphStorageBufferInfo2[GlyphStorageBufferInfo2["BytesPerEntry"] = 24] = "BytesPerEntry";
  GlyphStorageBufferInfo2[GlyphStorageBufferInfo2["Offset_TexturePosition"] = 0] = "Offset_TexturePosition";
  GlyphStorageBufferInfo2[GlyphStorageBufferInfo2["Offset_TextureSize"] = 2] = "Offset_TextureSize";
  GlyphStorageBufferInfo2[GlyphStorageBufferInfo2["Offset_OriginPosition"] = 4] = "Offset_OriginPosition";
  return GlyphStorageBufferInfo2;
})(GlyphStorageBufferInfo || {});
let ViewLinesGpu = class extends ViewPart {
  constructor(context, _viewGpuContext, _instantiationService, _logService) {
    super(context);
    this._viewGpuContext = _viewGpuContext;
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this.canvas = this._viewGpuContext.canvas.domNode;
    this._register(autorun((reader) => {
      this._viewGpuContext.canvasDevicePixelDimensions.read(reader);
    }));
    this.initWebgpu();
  }
  static {
    __name(this, "ViewLinesGpu");
  }
  canvas;
  _device;
  _renderPassDescriptor;
  _renderPassColorAttachment;
  _bindGroup;
  _pipeline;
  _vertexBuffer;
  _glyphStorageBuffer = [];
  _atlasGpuTexture;
  _atlasGpuTextureVersions = [];
  _initialized = false;
  _renderStrategy;
  async initWebgpu() {
    this._device = await this._viewGpuContext.device;
    if (this._store.isDisposed) {
      return;
    }
    const atlas = ViewGpuContext.atlas;
    this._register(atlas.onDidDeleteGlyphs(() => {
      this._atlasGpuTextureVersions.length = 0;
      this._atlasGpuTextureVersions[0] = 0;
      this._atlasGpuTextureVersions[1] = 0;
      this._renderStrategy.reset();
    }));
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    this._viewGpuContext.ctx.configure({
      device: this._device,
      format: presentationFormat,
      alphaMode: "premultiplied"
    });
    this._renderPassColorAttachment = {
      view: null,
      // Will be filled at render time
      loadOp: "load",
      storeOp: "store"
    };
    this._renderPassDescriptor = {
      label: "Monaco render pass",
      colorAttachments: [this._renderPassColorAttachment]
    };
    let layoutInfoUniformBuffer;
    {
      let Info;
      ((Info2) => {
        Info2[Info2["FloatsPerEntry"] = 6] = "FloatsPerEntry";
        Info2[Info2["BytesPerEntry"] = 24] = "BytesPerEntry";
        Info2[Info2["Offset_CanvasWidth____"] = 0] = "Offset_CanvasWidth____";
        Info2[Info2["Offset_CanvasHeight___"] = 1] = "Offset_CanvasHeight___";
        Info2[Info2["Offset_ViewportOffsetX"] = 2] = "Offset_ViewportOffsetX";
        Info2[Info2["Offset_ViewportOffsetY"] = 3] = "Offset_ViewportOffsetY";
        Info2[Info2["Offset_ViewportWidth__"] = 4] = "Offset_ViewportWidth__";
        Info2[Info2["Offset_ViewportHeight_"] = 5] = "Offset_ViewportHeight_";
      })(Info || (Info = {}));
      const bufferValues = new Float32Array(6 /* FloatsPerEntry */);
      const updateBufferValues = /* @__PURE__ */ __name((canvasDevicePixelWidth = this.canvas.width, canvasDevicePixelHeight = this.canvas.height) => {
        bufferValues[0 /* Offset_CanvasWidth____ */] = canvasDevicePixelWidth;
        bufferValues[1 /* Offset_CanvasHeight___ */] = canvasDevicePixelHeight;
        bufferValues[2 /* Offset_ViewportOffsetX */] = Math.ceil(this._context.configuration.options.get(EditorOption.layoutInfo).contentLeft * getActiveWindow().devicePixelRatio);
        bufferValues[3 /* Offset_ViewportOffsetY */] = 0;
        bufferValues[4 /* Offset_ViewportWidth__ */] = bufferValues[0 /* Offset_CanvasWidth____ */] - bufferValues[2 /* Offset_ViewportOffsetX */];
        bufferValues[5 /* Offset_ViewportHeight_ */] = bufferValues[1 /* Offset_CanvasHeight___ */] - bufferValues[3 /* Offset_ViewportOffsetY */];
        return bufferValues;
      }, "updateBufferValues");
      layoutInfoUniformBuffer = this._register(GPULifecycle.createBuffer(this._device, {
        label: "Monaco uniform buffer",
        size: 24 /* BytesPerEntry */,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      }, () => updateBufferValues())).object;
      this._register(observeDevicePixelDimensions(this.canvas, getActiveWindow(), (w, h) => {
        this._device.queue.writeBuffer(layoutInfoUniformBuffer, 0, updateBufferValues(w, h));
      }));
    }
    let atlasInfoUniformBuffer;
    {
      let Info;
      ((Info2) => {
        Info2[Info2["FloatsPerEntry"] = 2] = "FloatsPerEntry";
        Info2[Info2["BytesPerEntry"] = 8] = "BytesPerEntry";
        Info2[Info2["Offset_Width_"] = 0] = "Offset_Width_";
        Info2[Info2["Offset_Height"] = 1] = "Offset_Height";
      })(Info || (Info = {}));
      atlasInfoUniformBuffer = this._register(GPULifecycle.createBuffer(this._device, {
        label: "Monaco atlas info uniform buffer",
        size: 8 /* BytesPerEntry */,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      }, () => {
        const values = new Float32Array(2 /* FloatsPerEntry */);
        values[0 /* Offset_Width_ */] = atlas.pageSize;
        values[1 /* Offset_Height */] = atlas.pageSize;
        return values;
      })).object;
    }
    this._renderStrategy = this._register(this._instantiationService.createInstance(FullFileRenderStrategy, this._context, this._device, this.canvas, atlas));
    this._glyphStorageBuffer[0] = this._register(GPULifecycle.createBuffer(this._device, {
      label: "Monaco glyph storage buffer",
      size: 24 /* BytesPerEntry */ * TextureAtlasPage.maximumGlyphCount,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    })).object;
    this._glyphStorageBuffer[1] = this._register(GPULifecycle.createBuffer(this._device, {
      label: "Monaco glyph storage buffer",
      size: 24 /* BytesPerEntry */ * TextureAtlasPage.maximumGlyphCount,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    })).object;
    this._atlasGpuTextureVersions[0] = 0;
    this._atlasGpuTextureVersions[1] = 0;
    this._atlasGpuTexture = this._register(GPULifecycle.createTexture(this._device, {
      label: "Monaco atlas texture",
      format: "rgba8unorm",
      // TODO: Dynamically grow/shrink layer count
      size: { width: atlas.pageSize, height: atlas.pageSize, depthOrArrayLayers: 2 },
      dimension: "2d",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
    })).object;
    this._updateAtlasStorageBufferAndTexture();
    this._vertexBuffer = this._register(GPULifecycle.createBuffer(this._device, {
      label: "Monaco vertex buffer",
      size: quadVertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    }, quadVertices)).object;
    const module = this._device.createShaderModule({
      label: "Monaco shader module",
      code: this._renderStrategy.wgsl
    });
    this._pipeline = this._device.createRenderPipeline({
      label: "Monaco render pipeline",
      layout: "auto",
      vertex: {
        module,
        entryPoint: "vs",
        buffers: [
          {
            arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
            // 2 floats, 4 bytes each
            attributes: [
              { shaderLocation: 0, offset: 0, format: "float32x2" }
              // position
            ]
          }
        ]
      },
      fragment: {
        module,
        entryPoint: "fs",
        targets: [
          {
            format: presentationFormat,
            blend: {
              color: {
                srcFactor: "src-alpha",
                dstFactor: "one-minus-src-alpha"
              },
              alpha: {
                srcFactor: "src-alpha",
                dstFactor: "one-minus-src-alpha"
              }
            }
          }
        ]
      }
    });
    this._bindGroup = this._device.createBindGroup({
      label: "Monaco bind group",
      layout: this._pipeline.getBindGroupLayout(0),
      entries: [
        // TODO: Pass in generically as array?
        { binding: BindingId.GlyphInfo0, resource: { buffer: this._glyphStorageBuffer[0] } },
        { binding: BindingId.GlyphInfo1, resource: { buffer: this._glyphStorageBuffer[1] } },
        {
          binding: BindingId.TextureSampler,
          resource: this._device.createSampler({
            label: "Monaco atlas sampler",
            magFilter: "nearest",
            minFilter: "nearest"
          })
        },
        { binding: BindingId.Texture, resource: this._atlasGpuTexture.createView() },
        { binding: BindingId.ViewportUniform, resource: { buffer: layoutInfoUniformBuffer } },
        { binding: BindingId.AtlasDimensionsUniform, resource: { buffer: atlasInfoUniformBuffer } },
        ...this._renderStrategy.bindGroupEntries
      ]
    });
    this._initialized = true;
  }
  _updateAtlasStorageBufferAndTexture() {
    for (const [layerIndex, page] of ViewGpuContext.atlas.pages.entries()) {
      if (page.version === this._atlasGpuTextureVersions[layerIndex]) {
        continue;
      }
      this._logService.trace("Updating atlas page[", layerIndex, "] from version ", this._atlasGpuTextureVersions[layerIndex], " to version ", page.version);
      const values = new Float32Array(6 /* FloatsPerEntry */ * TextureAtlasPage.maximumGlyphCount);
      let entryOffset = 0;
      for (const glyph of page.glyphs) {
        values[entryOffset + 0 /* Offset_TexturePosition */] = glyph.x;
        values[entryOffset + 0 /* Offset_TexturePosition */ + 1] = glyph.y;
        values[entryOffset + 2 /* Offset_TextureSize */] = glyph.w;
        values[entryOffset + 2 /* Offset_TextureSize */ + 1] = glyph.h;
        values[entryOffset + 4 /* Offset_OriginPosition */] = glyph.originOffsetX;
        values[entryOffset + 4 /* Offset_OriginPosition */ + 1] = glyph.originOffsetY;
        entryOffset += 6 /* FloatsPerEntry */;
      }
      if (entryOffset / 6 /* FloatsPerEntry */ > TextureAtlasPage.maximumGlyphCount) {
        throw new Error(`Attempting to write more glyphs (${entryOffset / 6 /* FloatsPerEntry */}) than the GPUBuffer can hold (${TextureAtlasPage.maximumGlyphCount})`);
      }
      this._device.queue.writeBuffer(this._glyphStorageBuffer[layerIndex], 0, values);
      if (page.usedArea.right - page.usedArea.left > 0 && page.usedArea.bottom - page.usedArea.top > 0) {
        this._device.queue.copyExternalImageToTexture(
          { source: page.source },
          {
            texture: this._atlasGpuTexture,
            origin: {
              x: page.usedArea.left,
              y: page.usedArea.top,
              z: layerIndex
            }
          },
          {
            width: page.usedArea.right - page.usedArea.left,
            height: page.usedArea.bottom - page.usedArea.top
          }
        );
      }
      this._atlasGpuTextureVersions[layerIndex] = page.version;
    }
  }
  static canRender(options, viewportData, lineNumber) {
    const d = viewportData.getViewLineRenderingData(lineNumber);
    return d.content.indexOf("e") !== -1;
  }
  prepareRender(ctx) {
    throw new BugIndicatingError("Should not be called");
  }
  render(ctx) {
    throw new BugIndicatingError("Should not be called");
  }
  onLinesChanged(e) {
    return true;
  }
  onScrollChanged(e) {
    return true;
  }
  // subscribe to more events
  renderText(viewportData) {
    if (this._initialized) {
      return this._renderText(viewportData);
    }
  }
  _renderText(viewportData) {
    const options = new ViewLineOptions(this._context.configuration, this._context.theme.type);
    const visibleObjectCount = this._renderStrategy.update(viewportData, options);
    this._updateAtlasStorageBufferAndTexture();
    const encoder = this._device.createCommandEncoder({ label: "Monaco command encoder" });
    this._renderPassColorAttachment.view = this._viewGpuContext.ctx.getCurrentTexture().createView({ label: "Monaco canvas texture view" });
    const pass = encoder.beginRenderPass(this._renderPassDescriptor);
    pass.setPipeline(this._pipeline);
    pass.setVertexBuffer(0, this._vertexBuffer);
    pass.setBindGroup(0, this._bindGroup);
    if (this._renderStrategy?.draw) {
      this._renderStrategy.draw(pass, viewportData);
    } else {
      pass.draw(quadVertices.length / 2, visibleObjectCount);
    }
    pass.end();
    const commandBuffer = encoder.finish();
    this._device.queue.submit([commandBuffer]);
  }
};
ViewLinesGpu = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ILogService)
], ViewLinesGpu);
export {
  ViewLinesGpu
};
//# sourceMappingURL=viewLinesGpu.js.map
