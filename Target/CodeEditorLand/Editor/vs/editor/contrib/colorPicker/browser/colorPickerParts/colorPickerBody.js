import"../colorPicker.css";import*as h from"../../../../../base/browser/dom.js";import{Color as r,HSVA as s}from"../../../../../base/common/color.js";import{Disposable as a}from"../../../../../base/common/lifecycle.js";import"../colorPickerModel.js";import{SaturationBox as n}from"./colorPickerSaturationBox.js";import{InsertButton as l}from"./colorPickerInsertButton.js";import{HueStrip as d,OpacityStrip as p}from"./colorPickerStrip.js";const u=h.$;class w extends a{constructor(o,t,i,e=!1){super();this.model=t;this.pixelRatio=i;this._domNode=u(".colorpicker-body"),h.append(o,this._domNode),this._saturationBox=new n(this._domNode,this.model,this.pixelRatio),this._register(this._saturationBox),this._register(this._saturationBox.onDidChange(this.onDidSaturationValueChange,this)),this._register(this._saturationBox.onColorFlushed(this.flushColor,this)),this._opacityStrip=new p(this._domNode,this.model,e),this._register(this._opacityStrip),this._register(this._opacityStrip.onDidChange(this.onDidOpacityChange,this)),this._register(this._opacityStrip.onColorFlushed(this.flushColor,this)),this._hueStrip=new d(this._domNode,this.model,e),this._register(this._hueStrip),this._register(this._hueStrip.onDidChange(this.onDidHueChange,this)),this._register(this._hueStrip.onColorFlushed(this.flushColor,this)),e&&(this._insertButton=this._register(new l(this._domNode)),this._domNode.classList.add("standalone-colorpicker"))}_domNode;_saturationBox;_hueStrip;_opacityStrip;_insertButton=null;flushColor(){this.model.flushColor()}onDidSaturationValueChange({s:o,v:t}){const i=this.model.color.hsva;this.model.color=new r(new s(i.h,o,t,i.a))}onDidOpacityChange(o){const t=this.model.color.hsva;this.model.color=new r(new s(t.h,t.s,t.v,o))}onDidHueChange(o){const t=this.model.color.hsva,i=(1-o)*360;this.model.color=new r(new s(i===360?0:i,t.s,t.v,t.a))}get domNode(){return this._domNode}get saturationBox(){return this._saturationBox}get opacityStrip(){return this._opacityStrip}get hueStrip(){return this._hueStrip}get enterButton(){return this._insertButton}layout(){this._saturationBox.layout(),this._opacityStrip.layout(),this._hueStrip.layout()}}export{w as ColorPickerBody};
