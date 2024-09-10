var u=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var m=(n,e,t,r)=>{for(var o=r>1?void 0:r?I(e,t):e,i=n.length-1,d;i>=0;i--)(d=n[i])&&(o=(r?d(e,t,o):d(o))||o);return r&&o&&u(e,t,o),o},l=(n,e)=>(t,r)=>e(t,r,n);import{windowOpenNoOpener as f}from"../../../base/browser/dom.js";import{Schemas as c}from"../../../base/common/network.js";import{AbstractCodeEditorService as a}from"../../browser/services/abstractCodeEditorService.js";import{ICodeEditorService as C}from"../../browser/services/codeEditorService.js";import{ScrollType as p}from"../../common/editorCommon.js";import{IContextKeyService as h}from"../../../platform/contextkey/common/contextkey.js";import{InstantiationType as E,registerSingleton as v}from"../../../platform/instantiation/common/extensions.js";import{IThemeService as g}from"../../../platform/theme/common/themeService.js";let s=class extends a{_editorIsOpen;_activeCodeEditor;constructor(e,t){super(t),this._register(this.onCodeEditorAdd(()=>this._checkContextKey())),this._register(this.onCodeEditorRemove(()=>this._checkContextKey())),this._editorIsOpen=e.createKey("editorIsOpen",!1),this._activeCodeEditor=null,this._register(this.registerCodeEditorOpenHandler(async(r,o,i)=>o?this.doOpenEditor(o,r):null))}_checkContextKey(){let e=!1;for(const t of this.listCodeEditors())if(!t.isSimpleWidget){e=!0;break}this._editorIsOpen.set(e)}setActiveCodeEditor(e){this._activeCodeEditor=e}getActiveCodeEditor(){return this._activeCodeEditor}doOpenEditor(e,t){if(!this.findModel(e,t.resource)){if(t.resource){const i=t.resource.scheme;if(i===c.http||i===c.https)return f(t.resource.toString()),e}return null}const o=t.options?t.options.selection:null;if(o)if(typeof o.endLineNumber=="number"&&typeof o.endColumn=="number")e.setSelection(o),e.revealRangeInCenter(o,p.Immediate);else{const i={lineNumber:o.startLineNumber,column:o.startColumn};e.setPosition(i),e.revealPositionInCenter(i,p.Immediate)}return e}findModel(e,t){const r=e.getModel();return r&&r.uri.toString()!==t.toString()?null:r}};s=m([l(0,h),l(1,g)],s),v(C,s,E.Eager);export{s as StandaloneCodeEditorService};
