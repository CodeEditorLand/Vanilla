import"../colorPicker.css";import*as t from"../../../../../base/browser/dom.js";import{Disposable as i}from"../../../../../base/common/lifecycle.js";import{localize as n}from"../../../../../nls.js";import{Emitter as s}from"../../../../../base/common/event.js";import{registerIcon as r}from"../../../../../platform/theme/common/iconRegistry.js";import{ThemeIcon as c}from"../../../../../base/common/themables.js";import{Codicon as l}from"../../../../../base/common/codicons.js";const d=t.$;class f extends i{_button;_onClicked=this._register(new s);onClicked=this._onClicked.event;constructor(e){super(),this._button=document.createElement("div"),this._button.classList.add("close-button"),t.append(e,this._button);const o=document.createElement("div");o.classList.add("close-button-inner-div"),t.append(this._button,o),t.append(o,d(".button"+c.asCSSSelector(r("color-picker-close",l.close,n("closeIcon","Icon to close the color picker"))))).classList.add("close-icon"),this._register(t.addDisposableListener(this._button,t.EventType.CLICK,()=>{this._onClicked.fire()}))}}export{f as CloseButton};
