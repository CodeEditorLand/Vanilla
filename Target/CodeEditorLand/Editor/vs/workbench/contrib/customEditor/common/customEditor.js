import{distinct as d}from"../../../../base/common/arrays.js";import*as l from"../../../../nls.js";import{RawContextKey as s}from"../../../../platform/contextkey/common/contextkey.js";import{createDecorator as a}from"../../../../platform/instantiation/common/instantiation.js";import{globMatchesResource as u,priorityToRank as r,RegisteredEditorPriority as n}from"../../../services/editor/common/editorResolverService.js";const x=a("customEditorService"),S=new s("activeCustomEditorId","",{type:"string",description:l.localize("context.customEditor","The viewType of the currently active custom editor.")}),O=new s("focusedCustomEditorIsEditable",!1);var m=(t=>(t.default="default",t.builtin="builtin",t.option="option",t))(m||{});class P{id;displayName;providerDisplayName;priority;selector;constructor(e){this.id=e.id,this.displayName=e.displayName,this.providerDisplayName=e.providerDisplayName,this.priority=e.priority,this.selector=e.selector}matches(e){return this.selector.some(o=>o.filenamePattern&&u(o.filenamePattern,e))}}class N{allEditors;constructor(e){this.allEditors=d(e,o=>o.id)}get length(){return this.allEditors.length}get defaultEditor(){return this.allEditors.find(e=>{switch(e.priority){case n.default:case n.builtin:return this.allEditors.every(o=>o===e||p(o,e));default:return!1}})}get bestAvailableEditor(){return Array.from(this.allEditors).sort((o,t)=>r(o.priority)-r(t.priority))[0]}}function p(i,e){return r(i.priority)<r(e.priority)}export{S as CONTEXT_ACTIVE_CUSTOM_EDITOR_ID,O as CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE,P as CustomEditorInfo,N as CustomEditorInfoCollection,m as CustomEditorPriority,x as ICustomEditorService};
