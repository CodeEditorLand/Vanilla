var p=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var d=(s,i,r,e)=>{for(var t=e>1?void 0:e?h(i,r):i,n=s.length-1,o;n>=0;n--)(o=s[n])&&(t=(e?o(i,r,t):o(t))||t);return e&&t&&p(i,r,t),t},a=(s,i)=>(r,e)=>i(r,e,s);import{Disposable as f,DisposableStore as l}from"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/editor/browser/editorBrowser.js";import{ConfigurationTarget as v}from"../../../../../vs/platform/configuration/common/configuration.js";import{IInstantiationService as m}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IWorkspaceContextService as S}from"../../../../../vs/platform/workspace/common/workspace.js";import{UserSettingsRenderer as I,WorkspaceSettingsRenderer as g}from"../../../../../vs/workbench/contrib/preferences/browser/preferencesRenderers.js";import{IPreferencesService as R}from"../../../../../vs/workbench/services/preferences/common/preferences.js";import{SettingsEditorModel as u}from"../../../../../vs/workbench/services/preferences/common/preferencesModels.js";let c=class extends f{constructor(r,e,t,n){super();this.editor=r;this.instantiationService=e;this.preferencesService=t;this.workspaceContextService=n;this._createPreferencesRenderer(),this._register(this.editor.onDidChangeModel(o=>this._createPreferencesRenderer())),this._register(this.workspaceContextService.onDidChangeWorkbenchState(()=>this._createPreferencesRenderer()))}static ID="editor.contrib.settings";currentRenderer;disposables=this._register(new l);async _createPreferencesRenderer(){this.disposables.clear(),this.currentRenderer=void 0;const r=this.editor.getModel();if(r&&/\.(json|code-workspace)$/.test(r.uri.path)){const e=await this.preferencesService.createPreferencesEditorModel(r.uri);if(e instanceof u&&this.editor.getModel())switch(this.disposables.add(e),e.configurationTarget){case v.WORKSPACE:this.currentRenderer=this.disposables.add(this.instantiationService.createInstance(g,this.editor,e));break;default:this.currentRenderer=this.disposables.add(this.instantiationService.createInstance(I,this.editor,e));break}this.currentRenderer?.render()}}};c=d([a(1,m),a(2,R),a(3,S)],c);export{c as SettingsEditorContribution};
