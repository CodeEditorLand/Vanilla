var a=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var c=(s,e,i,o)=>{for(var r=o>1?void 0:o?p(e,i):e,n=s.length-1,d;n>=0;n--)(d=s[n])&&(r=(o?d(e,i,r):d(r))||r);return o&&r&&a(e,i,r),r},m=(s,e)=>(i,o)=>e(i,o,s);import{Codicon as g}from"../../../../../vs/base/common/codicons.js";import{Schemas as f}from"../../../../../vs/base/common/network.js";import"../../../../../vs/base/common/themables.js";import{URI as I}from"../../../../../vs/base/common/uri.js";import*as l from"../../../../../vs/nls.js";import{registerIcon as v}from"../../../../../vs/platform/theme/common/iconRegistry.js";import"../../../../../vs/workbench/common/editor.js";import{EditorInput as h}from"../../../../../vs/workbench/common/editor/editorInput.js";import{IPreferencesService as u}from"../../../../../vs/workbench/services/preferences/common/preferences.js";import"../../../../../vs/workbench/services/preferences/common/preferencesModels.js";const M=v("settings-editor-label-icon",g.settings,l.localize("settingsEditorLabelIcon","Icon of the settings editor label."));let t=class extends h{static ID="workbench.input.settings2";_settingsModel;resource=I.from({scheme:f.vscodeSettings,path:"settingseditor"});constructor(e){super(),this._settingsModel=e.createSettings2EditorModel()}matches(e){return super.matches(e)||e instanceof t}get typeId(){return t.ID}getName(){return l.localize("settingsEditor2InputName","Settings")}getIcon(){return M}async resolve(){return this._settingsModel}dispose(){this._settingsModel.dispose(),super.dispose()}};t=c([m(0,u)],t);export{t as SettingsEditor2Input};
