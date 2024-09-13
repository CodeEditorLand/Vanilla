var c=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var p=(o,e,a,t)=>{for(var r=t>1?void 0:t?u(e,a):e,s=o.length-1,l;s>=0;s--)(l=o[s])&&(r=(t?l(e,a,r):l(r))||r);return t&&r&&c(e,a,r),r},b=(o,e)=>(a,t)=>e(a,t,o);import*as n from"../../../../../../base/browser/dom.js";import{DisposableStore as d}from"../../../../../../base/common/lifecycle.js";import{localize as I}from"../../../../../../nls.js";import{IInstantiationService as V}from"../../../../../../platform/instantiation/common/instantiation.js";import{WorkbenchObjectTree as E}from"../../../../../../platform/list/browser/listService.js";import{DebugExpressionRenderer as D}from"../../../../debug/browser/debugExpressionRenderer.js";const m=n.$,T=1024;class y extends E{}class k{getHeight(e){return 22}getTemplateId(e){return i.ID}}let i=class{expressionRenderer;static ID="variableElement";get templateId(){return i.ID}constructor(e){this.expressionRenderer=e.createInstance(D)}renderTemplate(e){const a=n.append(e,m(".expression")),t=n.append(a,m("span.name")),r=n.append(a,m("span.value"));return{expression:a,name:t,value:r,elementDisposables:new d}}renderElement(e,a,t){const r=e.element.value.trim()!==""?`${e.element.name}:`:e.element.name;t.name.textContent=r,t.name.title=e.element.type??"",t.elementDisposables.add(this.expressionRenderer.renderValue(t.value,e.element,{colorize:!0,maxValueLength:T,session:void 0}))}disposeElement(e,a,t,r){t.elementDisposables.clear()}disposeTemplate(e){e.elementDisposables.dispose()}};i=p([b(0,V)],i);class S{getWidgetAriaLabel(){return I("debugConsole","Notebook Variables")}getAriaLabel(e){return I("notebookVariableAriaLabel","Variable {0}, value {1}",e.name,e.value)}}export{S as NotebookVariableAccessibilityProvider,i as NotebookVariableRenderer,k as NotebookVariablesDelegate,y as NotebookVariablesTree};
