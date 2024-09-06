var I=Object.defineProperty;var l=Object.getOwnPropertyDescriptor;var u=(r,o,e,i)=>{for(var t=i>1?void 0:i?l(o,e):o,d=r.length-1,n;d>=0;d--)(n=r[d])&&(t=(i?n(o,e,t):n(t))||t);return i&&t&&I(o,e,t),t},a=(r,o)=>(e,i)=>o(e,i,r);import{Disposable as E}from"../../base/common/lifecycle.js";import{getIEditor as f}from"../../editor/browser/editorBrowser.js";import"../../editor/common/editorCommon.js";import{localize as m}from"../../nls.js";import"../../platform/commands/common/commands.js";import{ContextKeyExpr as p,RawContextKey as v}from"../../platform/contextkey/common/contextkey.js";import"../../platform/editor/common/editor.js";import{IKeybindingService as y}from"../../platform/keybinding/common/keybinding.js";import{IQuickInputService as S}from"../../platform/quickinput/common/quickInput.js";import"../common/editor.js";import"../common/editor/editorInput.js";import{IEditorGroupsService as h}from"../services/editor/common/editorGroupsService.js";import{IEditorService as g}from"../services/editor/common/editorService.js";const c="inQuickOpen",Z=new v(c,!1,m("inQuickOpen","Whether keyboard focus is inside the quick open control")),k=p.has(c),w="inFilesPicker",$=p.and(k,p.has(w));function ee(r,o){return e=>{const i=e.get(y),t=e.get(S),n={keybindings:i.lookupKeybindings(r)};t.navigate(!!o,n)}}let s=class extends E{constructor(e,i){super();this.editorService=e;this.editorGroupsService=i}_editorViewState=void 0;openedTransientEditors=new Set;set(){if(this._editorViewState)return;const e=this.editorService.activeEditorPane;e&&(this._editorViewState={group:e.group,editor:e.input,state:f(e.getControl())?.saveViewState()??void 0})}async openTransientEditor(e,i){e.options={...e.options,transient:!0};const t=await this.editorService.openEditor(e,i);return t?.input&&t.input!==this._editorViewState?.editor&&t.group.isTransient(t.input)&&this.openedTransientEditors.add(t.input),t}async restore(){if(this._editorViewState){for(const e of this.openedTransientEditors)if(!e.isDirty())for(const i of this.editorGroupsService.groups)i.isTransient(e)&&await i.closeEditor(e,{preserveFocus:!0});await this._editorViewState.group.openEditor(this._editorViewState.editor,{viewState:this._editorViewState.state,preserveFocus:!0}),this.reset()}}reset(){this._editorViewState=void 0,this.openedTransientEditors.clear()}dispose(){super.dispose(),this.reset()}};s=u([a(0,g),a(1,h)],s);export{Z as InQuickPickContextKey,s as PickerEditorState,$ as defaultQuickAccessContext,w as defaultQuickAccessContextKeyValue,ee as getQuickNavigateHandler,k as inQuickPickContext,c as inQuickPickContextKeyValue};
