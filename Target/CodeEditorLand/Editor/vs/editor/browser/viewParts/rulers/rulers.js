import"./rulers.css";import{createFastDomNode as l}from"../../../../base/browser/fastDomNode.js";import{EditorOption as s}from"../../../common/config/editorOptions.js";import"../../../common/viewEvents.js";import"../../../common/viewModel/viewContext.js";import"../../view/renderingContext.js";import{ViewPart as a}from"../../view/viewPart.js";class N extends a{domNode;_renderedRulers;_rulers;_typicalHalfwidthCharacterWidth;constructor(t){super(t),this.domNode=l(document.createElement("div")),this.domNode.setAttribute("role","presentation"),this.domNode.setAttribute("aria-hidden","true"),this.domNode.setClassName("view-rulers"),this._renderedRulers=[];const e=this._context.configuration.options;this._rulers=e.get(s.rulers),this._typicalHalfwidthCharacterWidth=e.get(s.fontInfo).typicalHalfwidthCharacterWidth}dispose(){super.dispose()}onConfigurationChanged(t){const e=this._context.configuration.options;return this._rulers=e.get(s.rulers),this._typicalHalfwidthCharacterWidth=e.get(s.fontInfo).typicalHalfwidthCharacterWidth,!0}onScrollChanged(t){return t.scrollHeightChanged}prepareRender(t){}_ensureRulersCount(){const t=this._renderedRulers.length,e=this._rulers.length;if(t===e)return;if(t<e){const{tabSize:r}=this._context.viewModel.model.getOptions(),o=r;let d=e-t;for(;d>0;){const n=l(document.createElement("div"));n.setClassName("view-ruler"),n.setWidth(o),this.domNode.appendChild(n),this._renderedRulers.push(n),d--}return}let i=t-e;for(;i>0;){const r=this._renderedRulers.pop();this.domNode.removeChild(r),i--}}render(t){this._ensureRulersCount();for(let e=0,i=this._rulers.length;e<i;e++){const r=this._renderedRulers[e],o=this._rulers[e];r.setBoxShadow(o.color?`1px 0 0 0 ${o.color} inset`:""),r.setHeight(Math.min(t.scrollHeight,1e6)),r.setLeft(o.column*this._typicalHalfwidthCharacterWidth)}}}export{N as Rulers};
