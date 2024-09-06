var d=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var p=(t,r,e,o)=>{for(var i=o>1?void 0:o?f(r,e):r,s=t.length-1,c;s>=0;s--)(c=t[s])&&(i=(o?c(r,e,i):c(i))||i);return o&&i&&d(r,e,i),i},n=(t,r)=>(e,o)=>r(e,o,t);import{RunOnceScheduler as W}from"../../../../vs/base/common/async.js";import{Disposable as l}from"../../../../vs/base/common/lifecycle.js";import{ILifecycleMainService as m}from"../../../../vs/platform/lifecycle/electron-main/lifecycleMainService.js";import{IUserDataProfilesMainService as v}from"../../../../vs/platform/userDataProfile/electron-main/userDataProfile.js";import{LoadReason as u}from"../../../../vs/platform/window/electron-main/window.js";import{IWindowsMainService as h}from"../../../../vs/platform/windows/electron-main/windows.js";import{toWorkspaceIdentifier as w}from"../../../../vs/platform/workspace/common/workspace.js";let a=class extends l{constructor(e,o,i){super();this.userDataProfilesService=o;this.windowsMainService=i;this._register(e.onWillLoadWindow(s=>{s.reason===u.LOAD&&this.unsetProfileForWorkspace(s.window)})),this._register(e.onBeforeCloseWindow(s=>this.unsetProfileForWorkspace(s))),this._register(new W(()=>this.cleanUpEmptyWindowAssociations(),30*1e3)).schedule()}async unsetProfileForWorkspace(e){const o=this.getWorkspace(e),i=this.userDataProfilesService.getProfileForWorkspace(o);i?.isTransient&&(this.userDataProfilesService.unsetWorkspace(o,i.isTransient),i.isTransient&&await this.userDataProfilesService.cleanUpTransientProfiles())}getWorkspace(e){return e.openedWorkspace??w(e.backupPath,e.isExtensionDevelopmentHost)}cleanUpEmptyWindowAssociations(){const e=this.userDataProfilesService.getAssociatedEmptyWindows();if(e.length===0)return;const o=this.windowsMainService.getWindows().map(i=>this.getWorkspace(i));for(const i of e)o.some(s=>s.id===i.id)||this.userDataProfilesService.unsetWorkspace(i,!1)}};a=p([n(0,m),n(1,v),n(2,h)],a);export{a as UserDataProfilesHandler};