var g=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var p=(d,n,i,r)=>{for(var t=r>1?void 0:r?v(n,i):n,s=d.length-1,m;s>=0;s--)(m=d[s])&&(t=(r?m(n,i,t):m(t))||t);return r&&t&&g(n,i,t),t},f=(d,n)=>(i,r)=>n(i,r,d);import{Event as o}from"../../../../base/common/event.js";import{Disposable as E}from"../../../../base/common/lifecycle.js";import{isWeb as I}from"../../../../base/common/platform.js";import{isEqual as l}from"../../../../base/common/resources.js";import{IUserDataProfilesService as b}from"../../../../platform/userDataProfile/common/userDataProfile.js";import{IUserDataAutoSyncService as S}from"../../../../platform/userDataSync/common/userDataSync.js";import{IEditorService as h}from"../../../services/editor/common/editorService.js";import{IHostService as y}from"../../../services/host/browser/host.js";import{KeybindingsEditorInput as D}from"../../../services/preferences/browser/keybindingsEditorInput.js";import{SettingsEditor2Input as P}from"../../../services/preferences/common/preferencesEditorInput.js";import{IViewsService as C}from"../../../services/views/common/viewsService.js";import{VIEWLET_ID as k}from"../../extensions/common/extensions.js";let u=class extends E{constructor(i,r,t,s,m){super();this.userDataProfilesService=r;const c=o.filter(o.any(o.map(i.onDidActiveEditorChange,()=>this.getUserDataEditorInputSource(i.activeEditor)),o.map(o.filter(t.onDidChangeViewContainerVisibility,e=>e.id===k&&e.visible),e=>e.id)),e=>e!==void 0);I?this._register(o.debounce(o.any(o.map(m.onDidChangeFocus,()=>"windowFocus"),o.map(c,e=>e)),(e,a)=>e?[...e,a]:[a],1e3)(e=>s.triggerSync(e,!0,!1))):this._register(c(e=>s.triggerSync([e],!0,!1)))}getUserDataEditorInputSource(i){if(!i)return;if(i instanceof P)return"settingsEditor";if(i instanceof D)return"keybindingsEditor";const r=i.resource;if(l(r,this.userDataProfilesService.defaultProfile.settingsResource))return"settingsEditor";if(l(r,this.userDataProfilesService.defaultProfile.keybindingsResource))return"keybindingsEditor"}};u=p([f(0,h),f(1,b),f(2,C),f(3,S),f(4,y)],u);export{u as UserDataSyncTrigger};
