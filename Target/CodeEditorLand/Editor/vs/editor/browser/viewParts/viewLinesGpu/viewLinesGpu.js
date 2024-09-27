var G=Object.defineProperty;var O=Object.getOwnPropertyDescriptor;var x=(c,u,e,t)=>{for(var i=t>1?void 0:t?O(u,e):u,r=c.length-1,s;r>=0;r--)(s=c[r])&&(i=(t?s(u,e,i):s(i))||i);return t&&i&&G(u,e,i),i},m=(c,u)=>(e,t)=>u(e,t,c);import{getActiveWindow as b}from"../../../../base/browser/dom.js";import{BugIndicatingError as P}from"../../../../base/common/errors.js";import{autorun as B}from"../../../../base/common/observable.js";import{IInstantiationService as S}from"../../../../platform/instantiation/common/instantiation.js";import{ILogService as V}from"../../../../platform/log/common/log.js";import{EditorOption as T}from"../../../common/config/editorOptions.js";import{TextureAtlasPage as d}from"../../gpu/atlas/textureAtlasPage.js";import{FullFileRenderStrategy as C}from"../../gpu/fullFileRenderStrategy.js";import{BindingId as l}from"../../gpu/gpu.js";import{GPULifecycle as p}from"../../gpu/gpuDisposable.js";import{observeDevicePixelDimensions as U,quadVertices as v}from"../../gpu/gpuUtils.js";import{ViewGpuContext as w}from"../../gpu/viewGpuContext.js";import{FloatHorizontalRange as E,HorizontalPosition as R,VisibleRanges as A}from"../../view/renderingContext.js";import{ViewPart as F}from"../../view/viewPart.js";import{ViewLineOptions as L}from"../viewLines/viewLineOptions.js";var D=(r=>(r[r.FloatsPerEntry=6]="FloatsPerEntry",r[r.BytesPerEntry=24]="BytesPerEntry",r[r.Offset_TexturePosition=0]="Offset_TexturePosition",r[r.Offset_TextureSize=2]="Offset_TextureSize",r[r.Offset_OriginPosition=4]="Offset_OriginPosition",r))(D||{});let h=class extends F{constructor(e,t,i,r){super(e);this._viewGpuContext=t;this._instantiationService=i;this._logService=r;this.canvas=this._viewGpuContext.canvas.domNode,this._register(B(s=>{this._viewGpuContext.canvasDevicePixelDimensions.read(s)})),this.initWebgpu()}canvas;_lastViewportData;_lastViewLineOptions;_device;_renderPassDescriptor;_renderPassColorAttachment;_bindGroup;_pipeline;_vertexBuffer;_glyphStorageBuffer=[];_atlasGpuTexture;_atlasGpuTextureVersions=[];_initialized=!1;_renderStrategy;async initWebgpu(){if(this._device=await this._viewGpuContext.device,this._store.isDisposed)return;const e=w.atlas;this._register(e.onDidDeleteGlyphs(()=>{this._atlasGpuTextureVersions.length=0,this._atlasGpuTextureVersions[0]=0,this._atlasGpuTextureVersions[1]=0,this._renderStrategy.reset()}));const t=navigator.gpu.getPreferredCanvasFormat();this._viewGpuContext.ctx.configure({device:this._device,format:t,alphaMode:"premultiplied"}),this._renderPassColorAttachment={view:null,loadOp:"load",storeOp:"store"},this._renderPassDescriptor={label:"Monaco render pass",colorAttachments:[this._renderPassColorAttachment]};let i;{let f;(n=>(n[n.FloatsPerEntry=6]="FloatsPerEntry",n[n.BytesPerEntry=24]="BytesPerEntry",n[n.Offset_CanvasWidth____=0]="Offset_CanvasWidth____",n[n.Offset_CanvasHeight___=1]="Offset_CanvasHeight___",n[n.Offset_ViewportOffsetX=2]="Offset_ViewportOffsetX",n[n.Offset_ViewportOffsetY=3]="Offset_ViewportOffsetY",n[n.Offset_ViewportWidth__=4]="Offset_ViewportWidth__",n[n.Offset_ViewportHeight_=5]="Offset_ViewportHeight_"))(f||={});const a=new Float32Array(6),y=(_=this.canvas.width,g=this.canvas.height)=>(a[0]=_,a[1]=g,a[2]=Math.ceil(this._context.configuration.options.get(T.layoutInfo).contentLeft*b().devicePixelRatio),a[3]=0,a[4]=a[0]-a[2],a[5]=a[1]-a[3],a);i=this._register(p.createBuffer(this._device,{label:"Monaco uniform buffer",size:24,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST},()=>y())).object,this._register(U(this.canvas,b(),(_,g)=>{this._device.queue.writeBuffer(i,0,y(_,g))}))}let r;{let f;(o=>(o[o.FloatsPerEntry=2]="FloatsPerEntry",o[o.BytesPerEntry=8]="BytesPerEntry",o[o.Offset_Width_=0]="Offset_Width_",o[o.Offset_Height=1]="Offset_Height"))(f||={}),r=this._register(p.createBuffer(this._device,{label:"Monaco atlas info uniform buffer",size:8,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST},()=>{const a=new Float32Array(2);return a[0]=e.pageSize,a[1]=e.pageSize,a})).object}this._renderStrategy=this._register(this._instantiationService.createInstance(C,this._context,this._device,this.canvas,e)),this._glyphStorageBuffer[0]=this._register(p.createBuffer(this._device,{label:"Monaco glyph storage buffer",size:24*d.maximumGlyphCount,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST})).object,this._glyphStorageBuffer[1]=this._register(p.createBuffer(this._device,{label:"Monaco glyph storage buffer",size:24*d.maximumGlyphCount,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST})).object,this._atlasGpuTextureVersions[0]=0,this._atlasGpuTextureVersions[1]=0,this._atlasGpuTexture=this._register(p.createTexture(this._device,{label:"Monaco atlas texture",format:"rgba8unorm",size:{width:e.pageSize,height:e.pageSize,depthOrArrayLayers:2},dimension:"2d",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT})).object,this._updateAtlasStorageBufferAndTexture(),this._vertexBuffer=this._register(p.createBuffer(this._device,{label:"Monaco vertex buffer",size:v.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST},v)).object;const s=this._device.createShaderModule({label:"Monaco shader module",code:this._renderStrategy.wgsl});this._pipeline=this._device.createRenderPipeline({label:"Monaco render pipeline",layout:"auto",vertex:{module:s,buffers:[{arrayStride:2*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:0,offset:0,format:"float32x2"}]}]},fragment:{module:s,targets:[{format:t,blend:{color:{srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha"},alpha:{srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha"}}}]}}),this._bindGroup=this._device.createBindGroup({label:"Monaco bind group",layout:this._pipeline.getBindGroupLayout(0),entries:[{binding:l.GlyphInfo0,resource:{buffer:this._glyphStorageBuffer[0]}},{binding:l.GlyphInfo1,resource:{buffer:this._glyphStorageBuffer[1]}},{binding:l.TextureSampler,resource:this._device.createSampler({label:"Monaco atlas sampler",magFilter:"nearest",minFilter:"nearest"})},{binding:l.Texture,resource:this._atlasGpuTexture.createView()},{binding:l.LayoutInfoUniform,resource:{buffer:i}},{binding:l.AtlasDimensionsUniform,resource:{buffer:r}},...this._renderStrategy.bindGroupEntries]}),this._initialized=!0}_updateAtlasStorageBufferAndTexture(){for(const[e,t]of w.atlas.pages.entries()){if(t.version===this._atlasGpuTextureVersions[e])continue;this._logService.trace("Updating atlas page[",e,"] from version ",this._atlasGpuTextureVersions[e]," to version ",t.version);const i=new Float32Array(6*d.maximumGlyphCount);let r=0;for(const s of t.glyphs)i[r+0]=s.x,i[r+0+1]=s.y,i[r+2]=s.w,i[r+2+1]=s.h,i[r+4]=s.originOffsetX,i[r+4+1]=s.originOffsetY,r+=6;if(r/6>d.maximumGlyphCount)throw new Error(`Attempting to write more glyphs (${r/6}) than the GPUBuffer can hold (${d.maximumGlyphCount})`);this._device.queue.writeBuffer(this._glyphStorageBuffer[e],0,i),t.usedArea.right-t.usedArea.left>0&&t.usedArea.bottom-t.usedArea.top>0&&this._device.queue.copyExternalImageToTexture({source:t.source},{texture:this._atlasGpuTexture,origin:{x:t.usedArea.left,y:t.usedArea.top,z:e}},{width:t.usedArea.right-t.usedArea.left,height:t.usedArea.bottom-t.usedArea.top}),this._atlasGpuTextureVersions[e]=t.version}}static canRender(e,t,i){return t.getViewLineRenderingData(i).content.indexOf("e")!==-1}prepareRender(e){throw new P("Should not be called")}render(e){throw new P("Should not be called")}onLinesChanged(e){return!0}onScrollChanged(e){return!0}renderText(e){if(this._initialized)return this._renderText(e)}_renderText(e){this._viewGpuContext.rectangleRenderer.draw(e);const t=new L(this._context.configuration,this._context.theme.type),i=this._renderStrategy.update(e,t);this._updateAtlasStorageBufferAndTexture();const r=this._device.createCommandEncoder({label:"Monaco command encoder"});this._renderPassColorAttachment.view=this._viewGpuContext.ctx.getCurrentTexture().createView({label:"Monaco canvas texture view"});const s=r.beginRenderPass(this._renderPassDescriptor);s.setPipeline(this._pipeline),s.setVertexBuffer(0,this._vertexBuffer),s.setBindGroup(0,this._bindGroup),this._renderStrategy?.draw?this._renderStrategy.draw(s,e):s.draw(v.length/2,i),s.end();const f=r.finish();this._device.queue.submit([f]),this._lastViewportData=e,this._lastViewLineOptions=t}linesVisibleRangesForRange(e,t){return null}_visibleRangesForLineRange(e,t,i){if(this.shouldRender())return null;const r=this._lastViewportData,s=this._lastViewLineOptions;return!r||!s||e<r.startLineNumber||e>r.endLineNumber?null:new A(!1,[new E((t-1)*s.spaceWidth,(i-t-1)*s.spaceWidth)])}visibleRangeForPosition(e){const t=this._visibleRangesForLineRange(e.lineNumber,e.column,e.column);return t?new R(t.outsideRenderedLine,t.ranges[0].left):null}};h=x([m(2,S),m(3,V)],h);export{h as ViewLinesGpu};
