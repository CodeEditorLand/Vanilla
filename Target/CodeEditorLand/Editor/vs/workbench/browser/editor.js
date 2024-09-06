import{Promises as h}from"../../../vs/base/common/async.js";import{Emitter as v}from"../../../vs/base/common/event.js";import{Iterable as R}from"../../../vs/base/common/iterator.js";import{toDisposable as x}from"../../../vs/base/common/lifecycle.js";import{Schemas as g}from"../../../vs/base/common/network.js";import"../../../vs/base/common/uri.js";import{localize as S}from"../../../vs/nls.js";import"../../../vs/platform/instantiation/common/descriptors.js";import"../../../vs/platform/instantiation/common/instantiation.js";import{Registry as w}from"../../../vs/platform/registry/common/platform.js";import{IUriIdentityService as b}from"../../../vs/platform/uriIdentity/common/uriIdentity.js";import"../../../vs/workbench/browser/parts/editor/editorPane.js";import{EditorCloseContext as P,EditorExtensions as C,EditorResourceAccessor as m,SideBySideEditor as u}from"../../../vs/workbench/common/editor.js";import"../../../vs/workbench/common/editor/editorInput.js";import"../../../vs/workbench/services/editor/common/editorGroupsService.js";import{IEditorService as U}from"../../../vs/workbench/services/editor/common/editorService.js";import{IWorkingCopyService as A}from"../../../vs/workbench/services/workingCopy/common/workingCopyService.js";class d{constructor(e,t,r){this.ctor=e;this.typeId=t;this.name=r}static instantiatedEditorPanes=new Set;static didInstantiateEditorPane(e){return d.instantiatedEditorPanes.has(e)}static _onWillInstantiateEditorPane=new v;static onWillInstantiateEditorPane=d._onWillInstantiateEditorPane.event;static create(e,t,r){return new d(e,t,r)}instantiate(e,t){d._onWillInstantiateEditorPane.fire({typeId:this.typeId});const r=e.createInstance(this.ctor,t);return d.instantiatedEditorPanes.add(this.typeId),r}describes(e){return e.getId()===this.typeId}}class T{mapEditorPanesToEditors=new Map;registerEditorPane(e,t){return this.mapEditorPanesToEditors.set(e,t),x(()=>{this.mapEditorPanesToEditors.delete(e)})}getEditorPane(e){const t=this.findEditorPaneDescriptors(e);if(t.length!==0)return t.length===1?t[0]:e.prefersEditorPane(t)}findEditorPaneDescriptors(e,t){const r=[];for(const i of this.mapEditorPanesToEditors.keys()){const f=this.mapEditorPanesToEditors.get(i)||[];for(const a of f){const l=a.ctor;if(!t&&e.constructor===l){r.push(i);break}else if(t&&e instanceof l){r.push(i);break}}}return!t&&r.length===0?this.findEditorPaneDescriptors(e,!0):r}getEditorPaneByType(e){return R.find(this.mapEditorPanesToEditors.keys(),t=>t.typeId===e)}getEditorPanes(){return Array.from(this.mapEditorPanesToEditors.keys())}getEditors(){const e=[];for(const t of this.mapEditorPanesToEditors.keys()){const r=this.mapEditorPanesToEditors.get(t);r&&e.push(...r.map(i=>i.ctor))}return e}}w.add(C.EditorPane,new T);function dt(n,e){const t=n.get(U),r=n.get(b),i=n.get(A);return new Promise(f=>{let a=[...e];const l=t.onDidCloseEditor(async c=>{if(c.context===P.MOVE)return;let p=m.getOriginalUri(c.editor,{supportSideBySide:u.PRIMARY}),E=m.getOriginalUri(c.editor,{supportSideBySide:u.SECONDARY});if(c.context===P.REPLACE){const o=m.getOriginalUri(t.activeEditor,{supportSideBySide:u.PRIMARY}),s=m.getOriginalUri(t.activeEditor,{supportSideBySide:u.SECONDARY});r.extUri.isEqual(p,o)&&(p=void 0),r.extUri.isEqual(E,s)&&(E=void 0)}if(a=a.filter(o=>!(r.extUri.isEqual(o,p)||r.extUri.isEqual(o,E)||c.context!==P.REPLACE&&(p?.scheme===g.untitled&&r.extUri.isEqual(o,p.with({scheme:o.scheme}))||E?.scheme===g.untitled&&r.extUri.isEqual(o,E.with({scheme:o.scheme}))))),a.length===0){const o=e.filter(s=>i.isDirty(s));return o.length>0&&await h.settled(o.map(async s=>await new Promise(I=>{if(!i.isDirty(s))return I();const D=i.onDidChangeDirty(y=>{if(!y.isDirty()&&r.extUri.isEqual(s,y.resource))return D.dispose(),I()})}))),l.dispose(),f()}})})}function at(n,e,t,r){let i=n.getAriaLabel();return t&&!t.isPinned(n)&&(i=S("preview","{0}, preview",i)),t?.isSticky(e??n)&&(i=S("pinned","{0}, pinned",i)),t&&typeof r=="number"&&r>1&&(i=`${i}, ${t.ariaLabel}`),i}export{d as EditorPaneDescriptor,T as EditorPaneRegistry,at as computeEditorAriaLabel,dt as whenEditorClosed};