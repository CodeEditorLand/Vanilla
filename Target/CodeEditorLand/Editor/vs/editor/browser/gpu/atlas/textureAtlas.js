var u=Object.defineProperty;var c=Object.getOwnPropertyDescriptor;var m=(p,s,t,r)=>{for(var e=r>1?void 0:r?c(s,t):s,i=p.length-1,l;i>=0;i--)(l=p[i])&&(e=(r?l(s,t,e):l(e))||e);return r&&e&&u(s,t,e),e},h=(p,s)=>(t,r)=>s(t,r,p);import{getActiveWindow as d}from"../../../../base/browser/dom.js";import{CharCode as o}from"../../../../base/common/charCode.js";import{Event as T}from"../../../../base/common/event.js";import{Disposable as f,dispose as G,MutableDisposable as S,toDisposable as v}from"../../../../base/common/lifecycle.js";import{TwoKeyMap as R}from"../../../../base/common/map.js";import{IInstantiationService as A}from"../../../../platform/instantiation/common/instantiation.js";import{IThemeService as I}from"../../../../platform/theme/common/themeService.js";import{MetadataConsts as a}from"../../../common/encodedTokenAttributes.js";import{GlyphRasterizer as b}from"../raster/glyphRasterizer.js";import{IdleTaskQueue as M}from"../taskQueue.js";import{TextureAtlasPage as y}from"./textureAtlasPage.js";let n=class extends f{constructor(t,r,e,i){super();this._maxTextureSize=t;this._themeService=e;this._instantiationService=i;this._allocatorType=r?.allocatorType??"slab",this._register(T.runAndSubscribe(this._themeService.onDidColorThemeChange,()=>{this._colorMap=this._themeService.getColorTheme().tokenColorMap}));const l=Math.max(1,Math.floor(d().devicePixelRatio));this.pageSize=Math.min(1024*l,this._maxTextureSize);const g=this._instantiationService.createInstance(y,0,this.pageSize,this._allocatorType);this._pages.push(g);const _=new b(1,"");g.getGlyph(_,"",0),_.dispose(),this._register(v(()=>G(this._pages)))}_colorMap;_warmUpTask=this._register(new S);_warmedUpRasterizers=new Set;_allocatorType;_pages=[];get pages(){return this._pages}pageSize;_glyphPageIndex=new R;getGlyph(t,r,e){return e&=~(a.LANGUAGEID_MASK|a.TOKEN_TYPE_MASK|a.BALANCED_BRACKETS_MASK),this._warmedUpRasterizers.has(t.id)||(this._warmUpAtlas(t),this._warmedUpRasterizers.add(t.id)),this._tryGetGlyph(this._glyphPageIndex.get(r,e)??0,t,r,e)}_tryGetGlyph(t,r,e,i){return this._glyphPageIndex.set(e,i,t),this._pages[t].getGlyph(r,e,i)??(t+1<this._pages.length?this._tryGetGlyph(t+1,r,e,i):void 0)??this._getGlyphFromNewPage(r,e,i)}_getGlyphFromNewPage(t,r,e){return this._pages.push(this._instantiationService.createInstance(y,this._pages.length,this.pageSize,this._allocatorType)),this._glyphPageIndex.set(r,e,this._pages.length-1),this._pages[this._pages.length-1].getGlyph(t,r,e)}getUsagePreview(){return Promise.all(this._pages.map(t=>t.getUsagePreview()))}getStats(){return this._pages.map(t=>t.getStats())}_warmUpAtlas(t){this._warmUpTask.value?.clear();const r=this._warmUpTask.value=new M;for(let e=o.A;e<=o.Z;e++)r.enqueue(()=>{for(const i of this._colorMap.keys())this.getGlyph(t,String.fromCharCode(e),i<<a.FOREGROUND_OFFSET&a.FOREGROUND_MASK)});for(let e=o.a;e<=o.z;e++)r.enqueue(()=>{for(const i of this._colorMap.keys())this.getGlyph(t,String.fromCharCode(e),i<<a.FOREGROUND_OFFSET&a.FOREGROUND_MASK)});for(let e=o.ExclamationMark;e<=o.Tilde;e++)r.enqueue(()=>{for(const i of this._colorMap.keys())this.getGlyph(t,String.fromCharCode(e),i<<a.FOREGROUND_OFFSET&a.FOREGROUND_MASK)})}};n=m([h(2,I),h(3,A)],n);export{n as TextureAtlas};
