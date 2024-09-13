var k=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var R=(A,p,e,s)=>{for(var t=s>1?void 0:s?D(p,e):p,i=A.length-1,c;i>=0;i--)(c=A[i])&&(t=(s?c(p,e,t):c(t))||t);return s&&t&&k(p,e,t),t},m=(A,p)=>(e,s)=>p(e,s,A);import{Disposable as O,DisposableStore as $,MutableDisposable as T,dispose as j}from"../../../../base/common/lifecycle.js";import*as d from"../../../../nls.js";import{MenuId as y,MenuRegistry as w}from"../../../../platform/actions/common/actions.js";import{CommandsRegistry as I}from"../../../../platform/commands/common/commands.js";import{IDialogService as B}from"../../../../platform/dialogs/common/dialogs.js";import{InstantiationType as M,registerSingleton as z}from"../../../../platform/instantiation/common/extensions.js";import{Severity as L}from"../../../../platform/notification/common/notification.js";import{IQuickInputService as U}from"../../../../platform/quickinput/common/quickInput.js";import{IStorageService as H,StorageScope as S,StorageTarget as _}from"../../../../platform/storage/common/storage.js";import{IActivityService as G,NumberBadge as W}from"../../activity/common/activity.js";import{IAuthenticationExtensionsService as x,IAuthenticationService as P}from"../common/authentication.js";import{IAuthenticationAccessService as K}from"./authenticationAccessService.js";import{IAuthenticationUsageService as N}from"./authenticationUsageService.js";const v=" ";let f=class extends O{constructor(e,s,t,i,c,n,a){super();this.activityService=e;this.storageService=s;this.dialogService=t;this.quickInputService=i;this._authenticationService=c;this._authenticationUsageService=n;this._authenticationAccessService=a;this.registerListeners()}_signInRequestItems=new Map;_sessionAccessRequestItems=new Map;_accountBadgeDisposable=this._register(new T);registerListeners(){this._register(this._authenticationService.onDidChangeSessions(async e=>{e.event.added?.length&&await this.updateNewSessionRequests(e.providerId,e.event.added),e.event.removed?.length&&await this.updateAccessRequests(e.providerId,e.event.removed),this.updateBadgeCount()})),this._register(this._authenticationService.onDidUnregisterAuthenticationProvider(e=>{const s=this._sessionAccessRequestItems.get(e.id)||{};Object.keys(s).forEach(t=>{this.removeAccessRequest(e.id,t)})}))}async updateNewSessionRequests(e,s){const t=this._signInRequestItems.get(e);t&&Object.keys(t).forEach(i=>{s.some(c=>c.scopes.slice().join(v)===i)&&(t[i]?.disposables.forEach(n=>n.dispose()),delete t[i],Object.keys(t).length===0?this._signInRequestItems.delete(e):this._signInRequestItems.set(e,t))})}async updateAccessRequests(e,s){const t=this._sessionAccessRequestItems.get(e);t&&Object.keys(t).forEach(i=>{s.forEach(c=>{const n=t[i].possibleSessions.findIndex(a=>a.id===c.id);n&&t[i].possibleSessions.splice(n,1)}),t[i].possibleSessions.length||this.removeAccessRequest(e,i)})}updateBadgeCount(){this._accountBadgeDisposable.clear();let e=0;if(this._signInRequestItems.forEach(s=>{Object.keys(s).forEach(t=>{e+=s[t].requestingExtensionIds.length})}),this._sessionAccessRequestItems.forEach(s=>{e+=Object.keys(s).length}),e>0){const s=new W(e,()=>d.localize("sign in","Sign in requested"));this._accountBadgeDisposable.value=this.activityService.showAccountsActivity({badge:s})}}removeAccessRequest(e,s){const t=this._sessionAccessRequestItems.get(e)||{};t[s]&&(j(t[s].disposables),delete t[s],this.updateBadgeCount())}updateSessionPreference(e,s,t){const i=`${s}-${e}-${t.scopes.join(v)}`;this.storageService.store(i,t.id,S.WORKSPACE,_.MACHINE),this.storageService.store(i,t.id,S.APPLICATION,_.MACHINE)}getSessionPreference(e,s,t){const i=`${s}-${e}-${t.join(v)}`;return this.storageService.get(i,S.WORKSPACE)??this.storageService.get(i,S.APPLICATION)}removeSessionPreference(e,s,t){const i=`${s}-${e}-${t.join(v)}`;this.storageService.remove(i,S.WORKSPACE),this.storageService.remove(i,S.APPLICATION)}async showGetSessionPrompt(e,s,t,i){let c;(r=>(r[r.Allow=0]="Allow",r[r.Deny=1]="Deny",r[r.Cancel=2]="Cancel"))(c||={});const{result:n}=await this.dialogService.prompt({type:L.Info,message:d.localize("confirmAuthenticationAccess","The extension '{0}' wants to access the {1} account '{2}'.",i,e.label,s),buttons:[{label:d.localize({key:"allow",comment:["&& denotes a mnemonic"]},"&&Allow"),run:()=>0},{label:d.localize({key:"deny",comment:["&& denotes a mnemonic"]},"&&Deny"),run:()=>1}],cancelButton:{run:()=>2}});return n!==2&&(this._authenticationAccessService.updateAllowedExtensions(e.id,s,[{id:t,name:i,allowed:n===0}]),this.removeAccessRequest(e.id,t)),n===0}async selectSession(e,s,t,i,c){const n=await this._authenticationService.getAccounts(e);if(!n.length)throw new Error("No accounts available");const a=new $,o=a.add(this.quickInputService.createQuickPick());o.ignoreFocusOut=!0;const l=new Set,r=c.filter(u=>!l.has(u.account.label)&&l.add(u.account.label)).map(u=>({label:u.account.label,session:u}));return n.forEach(u=>{l.has(u.label)||r.push({label:u.label,account:u})}),r.push({label:d.localize("useOtherAccount","Sign in to another account")}),o.items=r,o.title=d.localize({key:"selectAccount",comment:["The placeholder {0} is the name of an extension. {1} is the name of the type of account, such as Microsoft or GitHub."]},"The extension '{0}' wants to access a {1} account",t,this._authenticationService.getProvider(e).label),o.placeholder=d.localize("getSessionPlateholder","Select an account for '{0}' to use or Esc to cancel",t),await new Promise((u,h)=>{a.add(o.onDidAccept(async b=>{o.dispose();let g=o.selectedItems[0].session;if(!g){const E=o.selectedItems[0].account;try{g=await this._authenticationService.createSession(e,i,{account:E})}catch(C){h(C);return}}const q=g.account.label;this._authenticationAccessService.updateAllowedExtensions(e,q,[{id:s,name:t,allowed:!0}]),this.updateSessionPreference(e,s,g),this.removeAccessRequest(e,s),u(g)})),a.add(o.onDidHide(b=>{o.selectedItems[0]||h("User did not consent to account access"),a.dispose()})),o.show()})}async completeSessionAccessRequest(e,s,t,i){const n=(this._sessionAccessRequestItems.get(e.id)||{})[s];if(!n||!e)return;const a=n.possibleSessions;let o;if(e.supportsMultipleAccounts)try{o=await this.selectSession(e.id,s,t,i,a)}catch{}else await this.showGetSessionPrompt(e,a[0].account.label,s,t)&&(o=a[0]);o&&this._authenticationUsageService.addAccountUsage(e.id,o.account.label,s,t)}requestSessionAccess(e,s,t,i,c){const n=this._sessionAccessRequestItems.get(e)||{};if(n[s])return;const o=this._authenticationService.getProvider(e),l=w.appendMenuItem(y.AccountsContext,{group:"3_accessRequests",command:{id:`${e}${s}Access`,title:d.localize({key:"accessRequest",comment:["The placeholder {0} will be replaced with an authentication provider''s label. {1} will be replaced with an extension name. (1) is to indicate that this menu item contributes to a badge count"]},"Grant access to {0} for {1}... (1)",o.label,t)}}),r=I.registerCommand({id:`${e}${s}Access`,handler:async u=>{this.completeSessionAccessRequest(o,s,t,i)}});n[s]={possibleSessions:c,disposables:[l,r]},this._sessionAccessRequestItems.set(e,n),this.updateBadgeCount()}async requestNewSession(e,s,t,i){this._authenticationService.isAuthenticationProviderRegistered(e)||await new Promise((h,b)=>{const g=this._authenticationService.onDidRegisterAuthenticationProvider(q=>{q.id===e&&(g.dispose(),h())})});let c;try{c=this._authenticationService.getProvider(e)}catch{return}const n=this._signInRequestItems.get(e),a=s.join(v);if(n&&n[a]&&n[a].requestingExtensionIds.includes(t))return;const l=`${e}:${t}:signIn${Object.keys(n||[]).length}`,r=w.appendMenuItem(y.AccountsContext,{group:"2_signInRequests",command:{id:l,title:d.localize({key:"signInRequest",comment:["The placeholder {0} will be replaced with an authentication provider's label. {1} will be replaced with an extension name. (1) is to indicate that this menu item contributes to a badge count."]},"Sign in with {0} to use {1} (1)",c.label,i)}}),u=I.registerCommand({id:l,handler:async h=>{const g=await h.get(P).createSession(e,s);this._authenticationAccessService.updateAllowedExtensions(e,g.account.label,[{id:t,name:i,allowed:!0}]),this.updateSessionPreference(e,t,g)}});if(n){const h=n[a]||{disposables:[],requestingExtensionIds:[]};n[a]={disposables:[...h.disposables,r,u],requestingExtensionIds:[...h.requestingExtensionIds,t]},this._signInRequestItems.set(e,n)}else this._signInRequestItems.set(e,{[a]:{disposables:[r,u],requestingExtensionIds:[t]}});this.updateBadgeCount()}};f=R([m(0,G),m(1,H),m(2,B),m(3,U),m(4,P),m(5,N),m(6,K)],f),z(x,f,M.Delayed);export{f as AuthenticationExtensionsService};
