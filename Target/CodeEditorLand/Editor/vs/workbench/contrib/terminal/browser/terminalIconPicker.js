var f=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var d=(i,o,t,e)=>{for(var n=e>1?void 0:e?m(o,t):o,r=i.length-1,c;r>=0;r--)(c=i[r])&&(n=(e?c(o,t,n):c(n))||n);return e&&n&&f(o,t,n),n},a=(i,o)=>(t,e)=>o(t,e,i);import{Dimension as u,getActiveDocument as h}from"../../../../../vs/base/browser/dom.js";import{HoverPosition as l}from"../../../../../vs/base/browser/ui/hover/hoverWidget.js";import{codiconsLibrary as p}from"../../../../../vs/base/common/codiconsLibrary.js";import{Lazy as I}from"../../../../../vs/base/common/lazy.js";import{Disposable as S}from"../../../../../vs/base/common/lifecycle.js";import{IHoverService as v}from"../../../../../vs/platform/hover/browser/hover.js";import{IInstantiationService as x}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{defaultInputBoxStyles as B}from"../../../../../vs/platform/theme/browser/defaultStyles.js";import{getIconRegistry as y}from"../../../../../vs/platform/theme/common/iconRegistry.js";import{WorkbenchIconSelectBox as _}from"../../../../../vs/workbench/services/userDataProfile/browser/iconSelectBox.js";const b=new I(()=>{const i=y().getIcons(),o=new Set;return i.filter(e=>e.id===p.blank.id||!("fontCharacter"in e.defaults)||o.has(e.defaults.fontCharacter)?!1:(o.add(e.defaults.fontCharacter),!0))});let s=class extends S{constructor(t,e){super();this._hoverService=e;this._iconSelectBox=t.createInstance(_,{icons:b.value,inputBoxStyles:B,showIconInfo:!0})}_iconSelectBox;async pickIcons(){const t=new u(486,260);return new Promise(e=>{this._register(this._iconSelectBox.onDidSelect(r=>{e(r),this._iconSelectBox.dispose()})),this._iconSelectBox.clearInput();const n=this._hoverService.showHover({content:this._iconSelectBox.domNode,target:h().body,position:{hoverPosition:l.BELOW},persistence:{sticky:!0},appearance:{showPointer:!0}},!0);n&&this._register(n),this._iconSelectBox.layout(t),this._iconSelectBox.focus()})}};s=d([a(0,x),a(1,v)],s);export{s as TerminalIconPicker};
