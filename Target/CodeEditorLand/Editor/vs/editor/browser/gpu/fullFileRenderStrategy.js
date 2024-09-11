import{getActiveWindow as C}from"../../../base/browser/dom.js";import{BugIndicatingError as z}from"../../../base/common/errors.js";import{Disposable as j}from"../../../base/common/lifecycle.js";import{EditorOption as w}from"../../common/config/editorOptions.js";import{BindingId as r}from"./gpu.js";import{GPULifecycle as D}from"./gpuDisposable.js";import{quadVertices as N}from"./gpuUtils.js";import{GlyphRasterizer as k}from"./raster/glyphRasterizer.js";var Y=(O=>(O[O.IndicesPerCell=6]="IndicesPerCell",O))(Y||{});const $=`
struct GlyphInfo {
	position: vec2f,
	size: vec2f,
	origin: vec2f,
};

struct Vertex {
	@location(0) position: vec2f,
};

struct Cell {
	position: vec2f,
	unused1: vec2f,
	glyphIndex: f32,
	textureIndex: f32
};

struct LayoutInfo {
	canvasDims: vec2f,
	viewportOffset: vec2f,
	viewportDims: vec2f,
}

struct ScrollOffset {
	offset: vec2f
}

struct VSOutput {
	@builtin(position) position:   vec4f,
	@location(1)       layerIndex: f32,
	@location(0)       texcoord:   vec2f,
};

// Uniforms
@group(0) @binding(${r.ViewportUniform})         var<uniform>       layoutInfo:      LayoutInfo;
@group(0) @binding(${r.AtlasDimensionsUniform})  var<uniform>       atlasDims:       vec2f;
@group(0) @binding(${r.ScrollOffset})            var<uniform>       scrollOffset:    ScrollOffset;

// Storage buffers
@group(0) @binding(${r.GlyphInfo0})              var<storage, read> glyphInfo0:      array<GlyphInfo>;
@group(0) @binding(${r.GlyphInfo1})              var<storage, read> glyphInfo1:      array<GlyphInfo>;
@group(0) @binding(${r.Cells})                   var<storage, read> cells:           array<Cell>;

@vertex fn vs(
	vert: Vertex,
	@builtin(instance_index) instanceIndex: u32,
	@builtin(vertex_index) vertexIndex : u32
) -> VSOutput {
	let cell = cells[instanceIndex];
	// TODO: Is there a nicer way to init this?
	var glyph = glyphInfo0[0];
	let glyphIndex = u32(cell.glyphIndex);
	if (u32(cell.textureIndex) == 0) {
		glyph = glyphInfo0[glyphIndex];
	} else {
		glyph = glyphInfo1[glyphIndex];
	}

	var vsOut: VSOutput;
	// Multiple vert.position by 2,-2 to get it into clipspace which ranged from -1 to 1
	vsOut.position = vec4f(
		(((vert.position * vec2f(2, -2)) / layoutInfo.canvasDims)) * glyph.size + cell.position + ((glyph.origin * vec2f(2, -2)) / layoutInfo.canvasDims) + (((scrollOffset.offset + layoutInfo.viewportOffset) * 2) / layoutInfo.canvasDims),
		0.0,
		1.0
	);

	vsOut.layerIndex = cell.textureIndex;
	// Textures are flipped from natural direction on the y-axis, so flip it back
	vsOut.texcoord = vert.position;
	vsOut.texcoord = (
		// Glyph offset (0-1)
		(glyph.position / atlasDims) +
		// Glyph coordinate (0-1)
		(vsOut.texcoord * (glyph.size / atlasDims))
	);

	return vsOut;
}

@group(0) @binding(${r.TextureSampler}) var ourSampler: sampler;
@group(0) @binding(${r.Texture})        var ourTexture: texture_2d_array<f32>;

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
	return textureSample(ourTexture, ourSampler, vsOut.texcoord, u32(vsOut.layerIndex));
}
`;var X=(e=>(e[e.FloatsPerEntry=6]="FloatsPerEntry",e[e.BytesPerEntry=24]="BytesPerEntry",e[e.Offset_X=0]="Offset_X",e[e.Offset_Y=1]="Offset_Y",e[e.Offset_Unused1=2]="Offset_Unused1",e[e.Offset_Unused2=3]="Offset_Unused2",e[e.GlyphIndex=4]="GlyphIndex",e[e.TextureIndex=5]="TextureIndex",e))(X||{});class o extends j{constructor(i,v,c,t){super();this._context=i;this._device=v;this._canvas=c;this._atlas=t;const n=C(),m=this._context.configuration.options.get(w.fontFamily),e=Math.ceil(this._context.configuration.options.get(w.fontSize)*n.devicePixelRatio);this._glyphRasterizer=this._register(new k(e,m));const s=o._lineCount*o._columnCount*6*Float32Array.BYTES_PER_ELEMENT;this._cellBindBuffer=this._register(D.createBuffer(this._device,{label:"Monaco full file cell buffer",size:s,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST})).object,this._cellValueBuffers=[new ArrayBuffer(s),new ArrayBuffer(s)];const l=2;this._scrollOffsetBindBuffer=this._register(D.createBuffer(this._device,{label:"Monaco scroll offset buffer",size:l*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST})).object,this._scrollOffsetValueBuffers=[new Float32Array(l),new Float32Array(l)]}static _lineCount=3e3;static _columnCount=200;wgsl=$;_glyphRasterizer;_cellBindBuffer;_cellValueBuffers;_activeDoubleBufferIndex=0;_upToDateLines=[new Set,new Set];_visibleObjectCount=0;_scrollOffsetBindBuffer;_scrollOffsetValueBuffers;get bindGroupEntries(){return[{binding:r.Cells,resource:{buffer:this._cellBindBuffer}},{binding:r.ScrollOffset,resource:{buffer:this._scrollOffsetBindBuffer}}]}update(i,v){let c="",t=0,n=0,m=0,e=0,s=0,l=0,E=0,T=0,p=0,I,d=0,y=0,a=0,P=0,h,L="",S=0,G=0,g;const B=C(),M=this._context.viewLayout.getCurrentScrollTop()*B.devicePixelRatio,A=this._scrollOffsetValueBuffers[this._activeDoubleBufferIndex];A[1]=M,this._device.queue.writeBuffer(this._scrollOffsetBindBuffer,0,A);const f=new Float32Array(this._cellValueBuffers[this._activeDoubleBufferIndex]),x=o._columnCount*6,U=this._upToDateLines[this._activeDoubleBufferIndex];let u=Number.MAX_SAFE_INTEGER,_=0;for(t=i.startLineNumber;t<=i.endLineNumber;t++){u=Math.min(u,t),_=Math.max(_,t),h=i.getViewLineRenderingData(t),L=h.content,p=0,g=h.tokens,y=h.minColumn-1,a=0;for(let b=0,R=g.getCount();b<R;b++)if(a=g.getEndOffset(b),!(a<=y)){for(P=g.getMetadata(b),n=y;n<a&&!(n>o._columnCount);n++)if(c=L.charAt(n),c!==" "){if(c==="	"){p+=3;continue}I=this._atlas.getGlyph(this._glyphRasterizer,c,P),m=Math.round((n+p)*v.spaceWidth*B.devicePixelRatio),e=Math.ceil((i.relativeVerticalOffset[t-i.startLineNumber]+Math.floor((i.lineHeight-this._context.configuration.options.get(w.fontSize))/2))*B.devicePixelRatio),s=m/this._canvas.width,l=e/this._canvas.height,E=s*2-1,T=l*2-1,d=((t-1)*o._columnCount+(n+p))*6,f[d+0]=E,f[d+1]=-T,f[d+4]=I.glyphIndex,f[d+5]=I.pageIndex}y=a}S=((t-1)*o._columnCount+(a+p))*6,G=t*o._columnCount*6,f.fill(0,S,G),U.add(t)}const V=(i.endLineNumber-i.startLineNumber+1)*x;return u<=_&&this._device.queue.writeBuffer(this._cellBindBuffer,(u-1)*x*Float32Array.BYTES_PER_ELEMENT,f.buffer,(u-1)*x*Float32Array.BYTES_PER_ELEMENT,(_-u+1)*x*Float32Array.BYTES_PER_ELEMENT),this._activeDoubleBufferIndex=this._activeDoubleBufferIndex?0:1,this._visibleObjectCount=V,V}draw(i,v){if(this._visibleObjectCount<=0)throw new z("Attempt to draw 0 objects");i.draw(N.length/2,this._visibleObjectCount,void 0,(v.startLineNumber-1)*o._columnCount)}}export{o as FullFileRenderStrategy};
