import{Emitter as s}from"../../../common/event.js";import{Widget as n}from"../widget.js";import"./radio.css";import{DisposableMap as a,DisposableStore as d}from"../../../common/lifecycle.js";import{$ as l}from"../../dom.js";import{Button as m}from"../button/button.js";import{createInstantHoverDelegate as c}from"../hover/hoverDelegateFactory.js";class f extends n{_onDidSelect=this._register(new s);onDidSelect=this._onDidSelect.event;domNode;hoverDelegate;items=[];activeItem;buttons=this._register(new a);constructor(e){super(),this.hoverDelegate=e.hoverDelegate??this._register(c()),this.domNode=l(".monaco-custom-radio"),this.domNode.setAttribute("role","radio"),this.setItems(e.items)}setItems(e){this.buttons.clearAndDisposeAll(),this.items=e,this.activeItem=this.items.find(t=>t.isActive)??this.items[0];for(let t=0;t<this.items.length;t++){const o=this.items[t],i=new d,r=i.add(new m(this.domNode,{hoverDelegate:this.hoverDelegate,title:o.tooltip,supportIcons:!0}));r.enabled=!o.disabled,i.add(r.onDidClick(()=>{this.activeItem!==o&&(this.activeItem=o,this.updateButtons(),this._onDidSelect.fire(t))})),this.buttons.set(r,{item:o,dispose:()=>i.dispose()})}this.updateButtons()}setActiveItem(e){if(e<0||e>=this.items.length)throw new Error("Invalid Index");this.activeItem=this.items[e],this.updateButtons()}setEnabled(e){for(const[t]of this.buttons)t.enabled=e}updateButtons(){let e=!1;for(const[t,{item:o}]of this.buttons){const i=e;e=o===this.activeItem,t.element.classList.toggle("active",e),t.element.classList.toggle("previous-active",i),t.label=o.text}}}export{f as Radio};
