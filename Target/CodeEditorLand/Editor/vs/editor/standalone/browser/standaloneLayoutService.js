var u=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var m=(n,e,i,t)=>{for(var o=t>1?void 0:t?v(e,i):e,s=n.length-1,c;s>=0;s--)(c=n[s])&&(o=(t?c(e,i,o):c(o))||o);return t&&o&&u(e,i,o),o},C=(n,e)=>(i,t)=>e(i,t,n);import*as f from"../../../base/browser/dom.js";import{mainWindow as E}from"../../../base/browser/window.js";import{coalesce as g}from"../../../base/common/arrays.js";import{Event as a}from"../../../base/common/event.js";import{ICodeEditorService as l}from"../../browser/services/codeEditorService.js";import{InstantiationType as p,registerSingleton as y}from"../../../platform/instantiation/common/extensions.js";import{ILayoutService as I}from"../../../platform/layout/browser/layoutService.js";let r=class{constructor(e){this._codeEditorService=e}onDidLayoutMainContainer=a.None;onDidLayoutActiveContainer=a.None;onDidLayoutContainer=a.None;onDidChangeActiveContainer=a.None;onDidAddContainer=a.None;get mainContainer(){return this._codeEditorService.listCodeEditors().at(0)?.getContainerDomNode()??E.document.body}get activeContainer(){return(this._codeEditorService.getFocusedCodeEditor()??this._codeEditorService.getActiveCodeEditor())?.getContainerDomNode()??this.mainContainer}get mainContainerDimension(){return f.getClientArea(this.mainContainer)}get activeContainerDimension(){return f.getClientArea(this.activeContainer)}mainContainerOffset={top:0,quickPickTop:0};activeContainerOffset={top:0,quickPickTop:0};get containers(){return g(this._codeEditorService.listCodeEditors().map(e=>e.getContainerDomNode()))}getContainer(){return this.activeContainer}whenContainerStylesLoaded(){}focus(){this._codeEditorService.getFocusedCodeEditor()?.focus()}};r=m([C(0,l)],r);let d=class extends r{constructor(i,t){super(t);this._container=i}get mainContainer(){return this._container}};d=m([C(1,l)],d),y(I,r,p.Delayed);export{d as EditorScopedLayoutService};
