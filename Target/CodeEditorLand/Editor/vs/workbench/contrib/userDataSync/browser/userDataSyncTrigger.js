var g=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var p=(d,n,i,r)=>{for(var t=r>1?void 0:r?v(n,i):n,s=d.length-1,u;s>=0;s--)(u=d[s])&&(t=(r?u(n,i,t):u(t))||t);return r&&t&&g(n,i,t),t},f=(d,n)=>(i,r)=>n(i,r,d);import{Event as o}from"../../../../../vs/base/common/event.js";import{Disposable as E}from"../../../../../vs/base/common/lifecycle.js";import{isWeb as I}from"../../../../../vs/base/common/platform.js";import{isEqual as l}from"../../../../../vs/base/common/resources.js";import{IUserDataProfilesService as S}from"../../../../../vs/platform/userDataProfile/common/userDataProfile.js";import{IUserDataAutoSyncService as b}from"../../../../../vs/platform/userDataSync/common/userDataSync.js";import"../../../../../vs/workbench/common/contributions.js";import"../../../../../vs/workbench/common/editor/editorInput.js";import{VIEWLET_ID as h}from"../../../../../vs/workbench/contrib/extensions/common/extensions.js";import{IEditorService as D}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{IHostService as y}from"../../../../../vs/workbench/services/host/browser/host.js";import{KeybindingsEditorInput as P}from"../../../../../vs/workbench/services/preferences/browser/keybindingsEditorInput.js";import{SettingsEditor2Input as C}from"../../../../../vs/workbench/services/preferences/common/preferencesEditorInput.js";import{IViewsService as k}from"../../../../../vs/workbench/services/views/common/viewsService.js";let m=class extends E{constructor(i,r,t,s,u){super();this.userDataProfilesService=r;const a=o.filter(o.any(o.map(i.onDidActiveEditorChange,()=>this.getUserDataEditorInputSource(i.activeEditor)),o.map(o.filter(t.onDidChangeViewContainerVisibility,e=>e.id===h&&e.visible),e=>e.id)),e=>e!==void 0);I?this._register(o.debounce(o.any(o.map(u.onDidChangeFocus,()=>"windowFocus"),o.map(a,e=>e)),(e,c)=>e?[...e,c]:[c],1e3)(e=>s.triggerSync(e,!0,!1))):this._register(a(e=>s.triggerSync([e],!0,!1)))}getUserDataEditorInputSource(i){if(!i)return;if(i instanceof C)return"settingsEditor";if(i instanceof P)return"keybindingsEditor";const r=i.resource;if(l(r,this.userDataProfilesService.defaultProfile.settingsResource))return"settingsEditor";if(l(r,this.userDataProfilesService.defaultProfile.keybindingsResource))return"keybindingsEditor"}};m=p([f(0,D),f(1,S),f(2,k),f(3,b),f(4,y)],m);export{m as UserDataSyncTrigger};