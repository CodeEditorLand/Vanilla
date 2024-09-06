var f=Object.defineProperty;var C=Object.getOwnPropertyDescriptor;var l=(n,e,t,i)=>{for(var o=i>1?void 0:i?C(e,t):e,r=n.length-1,a;r>=0;r--)(a=n[r])&&(o=(i?a(e,t,o):a(o))||o);return i&&o&&f(e,t,o),o},c=(n,e)=>(t,i)=>e(t,i,n);import*as p from"../../../../vs/base/browser/browser.js";import{getWindow as m,getWindowById as h}from"../../../../vs/base/browser/dom.js";import{PixelRatio as g}from"../../../../vs/base/browser/pixelRatio.js";import*as y from"../../../../vs/base/common/arrays.js";import{Emitter as _}from"../../../../vs/base/common/event.js";import{Disposable as E}from"../../../../vs/base/common/lifecycle.js";import*as I from"../../../../vs/base/common/objects.js";import*as w from"../../../../vs/base/common/platform.js";import{ElementSizeObserver as D}from"../../../../vs/editor/browser/config/elementSizeObserver.js";import{FontMeasurements as O}from"../../../../vs/editor/browser/config/fontMeasurements.js";import{migrateOptions as S}from"../../../../vs/editor/browser/config/migrateOptions.js";import{TabFocus as v}from"../../../../vs/editor/browser/config/tabFocus.js";import"../../../../vs/editor/common/config/editorConfiguration.js";import{ComputeOptionsMemory as L,ConfigurationChangedEvent as M,EditorOption as x,editorOptionsRegistry as d}from"../../../../vs/editor/common/config/editorOptions.js";import{EditorZoom as F}from"../../../../vs/editor/common/config/editorZoom.js";import{BareFontInfo as T}from"../../../../vs/editor/common/config/fontInfo.js";import"../../../../vs/editor/common/core/dimension.js";import{AccessibilitySupport as W,IAccessibilityService as R}from"../../../../vs/platform/accessibility/common/accessibility.js";import"../../../../vs/platform/actions/common/actions.js";let u=class extends E{constructor(t,i,o,r,a){super();this._accessibilityService=a;this.isSimpleWidget=t,this.contextMenuId=i,this._containerObserver=this._register(new D(r,o.dimension)),this._targetWindowId=m(r).vscodeWindowId,this._rawOptions=b(o),this._validatedOptions=s.validateOptions(this._rawOptions),this.options=this._computeOptions(),this.options.get(x.automaticLayout)&&this._containerObserver.startObserving(),this._register(F.onDidChangeZoomLevel(()=>this._recomputeOptions())),this._register(v.onDidChangeTabFocus(()=>this._recomputeOptions())),this._register(this._containerObserver.onDidChange(()=>this._recomputeOptions())),this._register(O.onDidChange(()=>this._recomputeOptions())),this._register(g.getInstance(m(r)).onDidChange(()=>this._recomputeOptions())),this._register(this._accessibilityService.onDidChangeScreenReaderOptimized(()=>this._recomputeOptions()))}_onDidChange=this._register(new _);onDidChange=this._onDidChange.event;_onDidChangeFast=this._register(new _);onDidChangeFast=this._onDidChangeFast.event;isSimpleWidget;contextMenuId;_containerObserver;_isDominatedByLongLines=!1;_viewLineCount=1;_lineNumbersDigitCount=1;_reservedHeight=0;_glyphMarginDecorationLaneCount=1;_targetWindowId;_computeOptionsMemory=new L;_rawOptions;_validatedOptions;options;_recomputeOptions(){const t=this._computeOptions(),i=s.checkEquals(this.options,t);i!==null&&(this.options=t,this._onDidChangeFast.fire(i),this._onDidChange.fire(i))}_computeOptions(){const t=this._readEnvConfiguration(),i=T.createFromValidatedSettings(this._validatedOptions,t.pixelRatio,this.isSimpleWidget),o=this._readFontInfo(i),r={memory:this._computeOptionsMemory,outerWidth:t.outerWidth,outerHeight:t.outerHeight-this._reservedHeight,fontInfo:o,extraEditorClassName:t.extraEditorClassName,isDominatedByLongLines:this._isDominatedByLongLines,viewLineCount:this._viewLineCount,lineNumbersDigitCount:this._lineNumbersDigitCount,emptySelectionClipboard:t.emptySelectionClipboard,pixelRatio:t.pixelRatio,tabFocusMode:v.getTabFocusMode(),accessibilitySupport:t.accessibilitySupport,glyphMarginDecorationLaneCount:this._glyphMarginDecorationLaneCount};return s.computeOptions(this._validatedOptions,r)}_readEnvConfiguration(){return{extraEditorClassName:V(),outerWidth:this._containerObserver.getWidth(),outerHeight:this._containerObserver.getHeight(),emptySelectionClipboard:p.isWebKit||p.isFirefox,pixelRatio:g.getInstance(h(this._targetWindowId,!0).window).value,accessibilitySupport:this._accessibilityService.isScreenReaderOptimized()?W.Enabled:this._accessibilityService.getAccessibilitySupport()}}_readFontInfo(t){return O.readFontInfo(h(this._targetWindowId,!0).window,t)}getRawOptions(){return this._rawOptions}updateOptions(t){const i=b(t);s.applyUpdate(this._rawOptions,i)&&(this._validatedOptions=s.validateOptions(this._rawOptions),this._recomputeOptions())}observeContainer(t){this._containerObserver.observe(t)}setIsDominatedByLongLines(t){this._isDominatedByLongLines!==t&&(this._isDominatedByLongLines=t,this._recomputeOptions())}setModelLineCount(t){const i=A(t);this._lineNumbersDigitCount!==i&&(this._lineNumbersDigitCount=i,this._recomputeOptions())}setViewLineCount(t){this._viewLineCount!==t&&(this._viewLineCount=t,this._recomputeOptions())}setReservedHeight(t){this._reservedHeight!==t&&(this._reservedHeight=t,this._recomputeOptions())}setGlyphMarginDecorationLaneCount(t){this._glyphMarginDecorationLaneCount!==t&&(this._glyphMarginDecorationLaneCount=t,this._recomputeOptions())}};u=l([c(4,R)],u);function A(n){let e=0;for(;n;)n=Math.floor(n/10),e++;return e||1}function V(){let n="";return!p.isSafari&&!p.isWebkitWebView&&(n+="no-user-select "),p.isSafari&&(n+="no-minimap-shadow ",n+="enable-user-select "),w.isMacintosh&&(n+="mac "),n}class N{_values=[];_read(e){return this._values[e]}get(e){return this._values[e]}_write(e,t){this._values[e]=t}}class B{_values=[];_read(e){if(e>=this._values.length)throw new Error("Cannot read uninitialized value");return this._values[e]}get(e){return this._read(e)}_write(e,t){this._values[e]=t}}class s{static validateOptions(e){const t=new N;for(const i of d){const o=i.name==="_never_"?void 0:e[i.name];t._write(i.id,i.validate(o))}return t}static computeOptions(e,t){const i=new B;for(const o of d)i._write(o.id,o.compute(t,i,e._read(o.id)));return i}static _deepEquals(e,t){if(typeof e!="object"||typeof t!="object"||!e||!t)return e===t;if(Array.isArray(e)||Array.isArray(t))return Array.isArray(e)&&Array.isArray(t)?y.equals(e,t):!1;if(Object.keys(e).length!==Object.keys(t).length)return!1;for(const i in e)if(!s._deepEquals(e[i],t[i]))return!1;return!0}static checkEquals(e,t){const i=[];let o=!1;for(const r of d){const a=!s._deepEquals(e._read(r.id),t._read(r.id));i[r.id]=a,a&&(o=!0)}return o?new M(i):null}static applyUpdate(e,t){let i=!1;for(const o of d)if(t.hasOwnProperty(o.name)){const r=o.applyUpdate(e[o.name],t[o.name]);e[o.name]=r.newValue,i=i||r.didChange}return i}}function b(n){const e=I.deepClone(n);return S(e),e}export{B as ComputedEditorOptions,u as EditorConfiguration};