var S=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var h=(i,o,e,r)=>{for(var t=r>1?void 0:r?T(o,e):o,l=i.length-1,n;l>=0;l--)(n=i[l])&&(t=(r?n(o,e,t):n(t))||t);return r&&t&&S(o,e,t),t},P=(i,o)=>(e,r)=>o(e,r,i);import{Dimension as D}from"../../../../../vs/base/browser/dom.js";import{AsyncIterableObject as w}from"../../../../../vs/base/common/async.js";import{CancellationToken as f}from"../../../../../vs/base/common/cancellation.js";import{Color as x,RGBA as A}from"../../../../../vs/base/common/color.js";import{DisposableStore as O}from"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/editor/browser/editorBrowser.js";import{EditorOption as b}from"../../../../../vs/editor/common/config/editorOptions.js";import"../../../../../vs/editor/common/core/editOperation.js";import{Range as m}from"../../../../../vs/editor/common/core/range.js";import"../../../../../vs/editor/common/languageFeatureRegistry.js";import"../../../../../vs/editor/common/languages.js";import{TrackedRangeStickiness as N}from"../../../../../vs/editor/common/model.js";import{getColorPresentations as H,getColors as L}from"../../../../../vs/editor/contrib/colorPicker/browser/color.js";import{ColorDetector as I}from"../../../../../vs/editor/contrib/colorPicker/browser/colorDetector.js";import{ColorPickerModel as F}from"../../../../../vs/editor/contrib/colorPicker/browser/colorPickerModel.js";import{ColorPickerWidget as W}from"../../../../../vs/editor/contrib/colorPicker/browser/colorPickerWidget.js";import{HoverAnchorType as V,RenderedHoverParts as k}from"../../../../../vs/editor/contrib/hover/browser/hoverTypes.js";import*as j from"../../../../../vs/nls.js";import{IThemeService as _}from"../../../../../vs/platform/theme/common/themeService.js";class z{constructor(o,e,r,t){this.owner=o;this.range=e;this.model=r;this.provider=t}forceShowAtRange=!0;isValidForHoverAnchor(o){return o.type===V.Range&&this.range.startColumn<=o.range.startColumn&&this.range.endColumn>=o.range.endColumn}}let v=class{constructor(o,e){this._editor=o;this._themeService=e}hoverOrdinal=2;_colorPicker;computeSync(o,e){return[]}computeAsync(o,e,r){return w.fromPromise(this._computeAsync(o,e,r))}async _computeAsync(o,e,r){if(!this._editor.hasModel())return[];const t=I.get(this._editor);if(!t)return[];for(const l of e){if(!t.isColorDecoration(l))continue;const n=t.getColorData(l.range.getStartPosition());if(n)return[await y(this,this._editor.getModel(),n.colorInfo,n.provider)]}return[]}renderHoverParts(o,e){const r=M(this,this._editor,this._themeService,e,o);if(!r)return new k([]);this._colorPicker=r.colorPicker;const t={hoverPart:r.hoverPart,hoverElement:this._colorPicker.domNode,dispose(){r.disposables.dispose()}};return new k([t])}getAccessibleContent(o){return j.localize("hoverAccessibilityColorParticipant","There is a color picker here.")}handleResize(){this._colorPicker?.layout()}isColorPickerVisible(){return!!this._colorPicker}};v=h([P(1,_)],v);class B{constructor(o,e,r,t){this.owner=o;this.range=e;this.model=r;this.provider=t}}let p=class{constructor(o,e){this._editor=o;this._themeService=e}hoverOrdinal=2;_color=null;async createColorHover(o,e,r){if(!this._editor.hasModel()||!I.get(this._editor))return null;const l=await L(r,this._editor.getModel(),f.None);let n=null,s=null;for(const d of l){const a=d.colorInfo;m.containsRange(a.range,o.range)&&(n=a,s=d.provider)}const c=n??o,C=s??e,u=!!n;return{colorHover:await y(this,this._editor.getModel(),c,C),foundInEditor:u}}async updateEditorModel(o){if(!this._editor.hasModel())return;const e=o.model;let r=new m(o.range.startLineNumber,o.range.startColumn,o.range.endLineNumber,o.range.endColumn);this._color&&(await g(this._editor.getModel(),e,this._color,r,o),r=R(this._editor,r,e))}renderHoverParts(o,e){return M(this,this._editor,this._themeService,e,o)}set color(o){this._color=o}get color(){return this._color}};p=h([P(1,_)],p);async function y(i,o,e,r){const t=o.getValueInRange(e.range),{red:l,green:n,blue:s,alpha:c}=e.color,C=new A(Math.round(l*255),Math.round(n*255),Math.round(s*255),c),u=new x(C),d=await H(o,e,r,f.None),a=new F(u,[],0);return a.colorPresentations=d||[],a.guessColorPresentation(u,t),i instanceof v?new z(i,m.lift(e.range),a,r):new B(i,m.lift(e.range),a,r)}function M(i,o,e,r,t){if(r.length===0||!o.hasModel())return;if(t.setMinimumDimensions){const a=o.getOption(b.lineHeight)+8;t.setMinimumDimensions(new D(302,a))}const l=new O,n=r[0],s=o.getModel(),c=n.model,C=l.add(new W(t.fragment,c,o.getOption(b.pixelRatio),e,i instanceof p));let u=!1,d=new m(n.range.startLineNumber,n.range.startColumn,n.range.endLineNumber,n.range.endColumn);if(i instanceof p){const a=n.model.color;i.color=a,g(s,c,a,d,n),l.add(c.onColorFlushed(E=>{i.color=E}))}else l.add(c.onColorFlushed(async a=>{await g(s,c,a,d,n),u=!0,d=R(o,d,c)}));return l.add(c.onDidChangeColor(a=>{g(s,c,a,d,n)})),l.add(o.onDidChangeModelContent(a=>{u?u=!1:(t.hide(),o.focus())})),{hoverPart:n,colorPicker:C,disposables:l}}function R(i,o,e){const r=[],t=e.presentation.textEdit??{range:o,text:e.presentation.label,forceMoveMarkers:!1};r.push(t),e.presentation.additionalTextEdits&&r.push(...e.presentation.additionalTextEdits);const l=m.lift(t.range),n=i.getModel()._setTrackedRange(null,l,N.GrowsOnlyWhenTypingAfter);return i.executeEdits("colorpicker",r),i.pushUndoStop(),i.getModel()._getTrackedRange(n)??l}async function g(i,o,e,r,t){const l=await H(i,{range:r,color:{red:e.rgba.r/255,green:e.rgba.g/255,blue:e.rgba.b/255,alpha:e.rgba.a}},t.provider,f.None);o.colorPresentations=l||[]}export{z as ColorHover,v as ColorHoverParticipant,B as StandaloneColorPickerHover,p as StandaloneColorPickerParticipant};