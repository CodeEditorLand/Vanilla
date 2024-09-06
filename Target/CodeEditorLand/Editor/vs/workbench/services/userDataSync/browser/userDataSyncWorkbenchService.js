var N=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var E=(y,d,e,t)=>{for(var n=t>1?void 0:t?k(d,e):d,i=y.length-1,r;i>=0;i--)(r=y[i])&&(n=(t?r(d,e,n):r(n))||n);return t&&n&&N(d,e,n),n},o=(y,d)=>(e,t)=>d(e,t,y);import{raceCancellationError as R}from"../../../../../vs/base/common/async.js";import{CancellationTokenSource as x}from"../../../../../vs/base/common/cancellation.js";import{CancellationError as _}from"../../../../../vs/base/common/errors.js";import{Emitter as M,Event as h}from"../../../../../vs/base/common/event.js";import{Disposable as T,DisposableStore as A}from"../../../../../vs/base/common/lifecycle.js";import{isWeb as C}from"../../../../../vs/base/common/platform.js";import{escapeRegExpCharacters as V}from"../../../../../vs/base/common/strings.js";import{URI as f}from"../../../../../vs/base/common/uri.js";import{localize as a}from"../../../../../vs/nls.js";import{IContextKeyService as H}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IDialogService as L,IFileDialogService as Y}from"../../../../../vs/platform/dialogs/common/dialogs.js";import{IFileService as F}from"../../../../../vs/platform/files/common/files.js";import{InstantiationType as K,registerSingleton as B}from"../../../../../vs/platform/instantiation/common/extensions.js";import{IInstantiationService as W}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{ILogService as z}from"../../../../../vs/platform/log/common/log.js";import{INotificationService as Q,Severity as $}from"../../../../../vs/platform/notification/common/notification.js";import{IProductService as G}from"../../../../../vs/platform/product/common/productService.js";import{IProgressService as X,ProgressLocation as b}from"../../../../../vs/platform/progress/common/progress.js";import{IQuickInputService as j}from"../../../../../vs/platform/quickinput/common/quickInput.js";import{ISecretStorageService as q}from"../../../../../vs/platform/secrets/common/secrets.js";import{IStorageService as J,StorageScope as l,StorageTarget as D}from"../../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as Z}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{IUriIdentityService as ee}from"../../../../../vs/platform/uriIdentity/common/uriIdentity.js";import{UserDataSyncStoreTypeSynchronizer as te}from"../../../../../vs/platform/userDataSync/common/globalStateSync.js";import{isAuthenticationProvider as ie,IUserDataAutoSyncService as ne,IUserDataSyncEnablementService as re,IUserDataSyncService as se,IUserDataSyncStoreManagementService as oe,SyncStatus as P,USER_DATA_SYNC_LOG_ID as ae,USER_DATA_SYNC_SCHEME as ce}from"../../../../../vs/platform/userDataSync/common/userDataSync.js";import{IUserDataSyncAccountService as ue}from"../../../../../vs/platform/userDataSync/common/userDataSyncAccount.js";import{IUserDataSyncMachinesService as de}from"../../../../../vs/platform/userDataSync/common/userDataSyncMachines.js";import{UserDataSyncStoreClient as Se}from"../../../../../vs/platform/userDataSync/common/userDataSyncStoreService.js";import{isDiffEditorInput as he}from"../../../../../vs/workbench/common/editor.js";import{IViewDescriptorService as le}from"../../../../../vs/workbench/common/views.js";import{getCurrentAuthenticationSessionInfo as ve}from"../../../../../vs/workbench/services/authentication/browser/authenticationService.js";import{IAuthenticationService as ye}from"../../../../../vs/workbench/services/authentication/common/authentication.js";import{IEditorService as pe}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{IBrowserWorkbenchEnvironmentService as Ie}from"../../../../../vs/workbench/services/environment/browser/environmentService.js";import{IExtensionService as fe}from"../../../../../vs/workbench/services/extensions/common/extensions.js";import{ILifecycleService as ge}from"../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";import{IUserDataInitializationService as me}from"../../../../../vs/workbench/services/userData/browser/userDataInit.js";import{AccountStatus as g,CONTEXT_ACCOUNT_STATE as Ae,CONTEXT_ENABLE_ACTIVITY_VIEWS as Ce,CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW as De,CONTEXT_HAS_CONFLICTS as Pe,CONTEXT_SYNC_ENABLEMENT as we,CONTEXT_SYNC_STATE as Ee,IUserDataSyncWorkbenchService as _e,SHOW_SYNC_LOG_COMMAND_ID as Te,SYNC_CONFLICTS_VIEW_ID as be,SYNC_TITLE as w,SYNC_VIEW_CONTAINER_ID as U}from"../../../../../vs/workbench/services/userDataSync/common/userDataSync.js";import{IViewsService as Ue}from"../../../../../vs/workbench/services/views/common/viewsService.js";class O{constructor(d,e){this.authenticationProviderId=d;this.session=e}get sessionId(){return this.session.id}get accountName(){return this.session.account.label}get accountId(){return this.session.account.id}get token(){return this.session.idToken||this.session.accessToken}}function Oe(y){const d=y;return f.isUri(d?.base)&&f.isUri(d?.input1?.uri)&&f.isUri(d?.input2?.uri)&&f.isUri(d?.result)}let u=class extends T{constructor(e,t,n,i,r,c,s,p,S,v,Ne,ke,Re,xe,Me,Ve,He,I,Le,Ye,Fe,Ke,Be,We,ze,Qe,$e,Ge){super();this.userDataSyncService=e;this.uriIdentityService=t;this.authenticationService=n;this.userDataSyncAccountService=i;this.quickInputService=r;this.storageService=c;this.userDataSyncEnablementService=s;this.userDataAutoSyncService=p;this.telemetryService=S;this.logService=v;this.productService=Ne;this.extensionService=ke;this.environmentService=Re;this.secretStorageService=xe;this.notificationService=Me;this.progressService=Ve;this.dialogService=He;this.viewsService=Le;this.viewDescriptorService=Ye;this.userDataSyncStoreManagementService=Fe;this.lifecycleService=Ke;this.instantiationService=Be;this.editorService=We;this.userDataInitializationService=ze;this.fileService=Qe;this.fileDialogService=$e;this.userDataSyncMachinesService=Ge;this.syncEnablementContext=we.bindTo(I),this.syncStatusContext=Ee.bindTo(I),this.accountStatusContext=Ae.bindTo(I),this.activityViewsEnablementContext=Ce.bindTo(I),this.hasConflicts=Pe.bindTo(I),this.enableConflictsViewContext=De.bindTo(I),this.userDataSyncStoreManagementService.userDataSyncStore&&(this.syncStatusContext.set(this.userDataSyncService.status),this._register(e.onDidChangeStatus(m=>this.syncStatusContext.set(m))),this.syncEnablementContext.set(s.isEnabled()),this._register(s.onDidChangeEnablement(m=>this.syncEnablementContext.set(m))),this.waitAndInitialize())}_serviceBrand;static DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY="userDataSyncAccount.donotUseWorkbenchSession";static CACHED_AUTHENTICATION_PROVIDER_KEY="userDataSyncAccountProvider";static CACHED_SESSION_STORAGE_KEY="userDataSyncAccountPreference";get enabled(){return!!this.userDataSyncStoreManagementService.userDataSyncStore}_authenticationProviders=[];get authenticationProviders(){return this._authenticationProviders}_accountStatus=g.Unavailable;get accountStatus(){return this._accountStatus}_onDidChangeAccountStatus=this._register(new M);onDidChangeAccountStatus=this._onDidChangeAccountStatus.event;_current;get current(){return this._current}syncEnablementContext;syncStatusContext;accountStatusContext;enableConflictsViewContext;hasConflicts;activityViewsEnablementContext;turnOnSyncCancellationToken=void 0;updateAuthenticationProviders(){this._authenticationProviders=(this.userDataSyncStoreManagementService.userDataSyncStore?.authenticationProviders||[]).filter(({id:e})=>this.authenticationService.declaredProviders.some(t=>t.id===e))}isSupportedAuthenticationProviderId(e){return this.authenticationProviders.some(({id:t})=>t===e)}async waitAndInitialize(){await Promise.all([this.extensionService.whenInstalledExtensionsRegistered(),this.userDataInitializationService.whenInitializationFinished()]);try{await this.initialize()}catch(e){this.environmentService.extensionTestsLocationURI||this.logService.error(e)}}async initialize(){if(C){const e=await ve(this.secretStorageService,this.productService);this.currentSessionId===void 0&&e?.id&&(this.environmentService.options?.settingsSyncOptions?.authenticationProvider&&this.environmentService.options.settingsSyncOptions.enabled?this.currentSessionId=e.id:this.useWorkbenchSessionId&&(this.currentSessionId=e.id),this.useWorkbenchSessionId=!1)}await this.update(),this._register(this.authenticationService.onDidChangeDeclaredProviders(()=>this.updateAuthenticationProviders())),this._register(h.filter(h.any(this.authenticationService.onDidRegisterAuthenticationProvider,this.authenticationService.onDidUnregisterAuthenticationProvider),e=>this.isSupportedAuthenticationProviderId(e.id))(()=>this.update())),this._register(h.filter(this.userDataSyncAccountService.onTokenFailed,e=>!e)(()=>this.update("token failure"))),this._register(h.filter(this.authenticationService.onDidChangeSessions,e=>this.isSupportedAuthenticationProviderId(e.providerId))(({event:e})=>this.onDidChangeSessions(e))),this._register(this.storageService.onDidChangeValue(l.APPLICATION,u.CACHED_SESSION_STORAGE_KEY,this._register(new A))(()=>this.onDidChangeStorage())),this._register(h.filter(this.userDataSyncAccountService.onTokenFailed,e=>e)(()=>this.onDidAuthFailure())),this.hasConflicts.set(this.userDataSyncService.conflicts.length>0),this._register(this.userDataSyncService.onDidChangeConflicts(e=>{this.hasConflicts.set(e.length>0),e.length||this.enableConflictsViewContext.reset(),this.editorService.editors.filter(t=>(he(t)?t.original.resource:Oe(t)?t.input1.uri:void 0)?.scheme!==ce?!1:!this.userDataSyncService.conflicts.some(({conflicts:i})=>i.some(({previewResource:r})=>this.uriIdentityService.extUri.isEqual(r,t.resource)))).forEach(t=>t.dispose())}))}async update(e){e&&this.logService.info(`Settings Sync: Updating due to ${e}`),this.updateAuthenticationProviders(),await this.updateCurrentAccount(),this._current&&(this.currentAuthenticationProviderId=this._current.authenticationProviderId),await this.updateToken(this._current),this.updateAccountStatus(this._current?g.Available:g.Unavailable)}async updateCurrentAccount(){const e=this.currentSessionId,t=this.currentAuthenticationProviderId;if(e){const n=t?this.authenticationProviders.filter(({id:i})=>i===t):this.authenticationProviders;for(const{id:i,scopes:r}of n){const c=await this.authenticationService.getSessions(i,r)||[];for(const s of c)if(s.id===e){this._current=new O(i,s);return}}}this._current=void 0}async updateToken(e){let t;if(e)try{this.logService.trace("Settings Sync: Updating the token for the account",e.accountName);const n=e.token;this.logService.trace("Settings Sync: Token updated for the account",e.accountName),t={token:n,authenticationProviderId:e.authenticationProviderId}}catch(n){this.logService.error(n)}await this.userDataSyncAccountService.updateAccount(t)}updateAccountStatus(e){if(this._accountStatus!==e){const t=this._accountStatus;this.logService.trace(`Settings Sync: Account status changed from ${t} to ${e}`),this._accountStatus=e,this.accountStatusContext.set(e),this._onDidChangeAccountStatus.fire(e)}}async turnOn(){if(!this.authenticationProviders.length)throw new Error(a("no authentication providers","Settings sync cannot be turned on because there are no authentication providers available."));if(this.userDataSyncEnablementService.isEnabled())return;if(this.userDataSyncService.status!==P.Idle)throw new Error("Cannot turn on sync while syncing");if(!await this.pick())throw new _;if(this.accountStatus!==g.Available)throw new Error(a("no account","No account available"));const t=this.turnOnSyncCancellationToken=new x,n=C?T.None:this.lifecycleService.onBeforeShutdown(i=>i.veto((async()=>{const{confirmed:r}=await this.dialogService.confirm({type:"warning",message:a("sync in progress","Settings Sync is being turned on. Would you like to cancel it?"),title:a("settings sync","Settings Sync"),primaryButton:a({key:"yes",comment:["&& denotes a mnemonic"]},"&&Yes"),cancelButton:a("no","No")});return r&&t.cancel(),!r})(),"veto.settingsSync"));try{await this.doTurnOnSync(t.token)}finally{n.dispose(),this.turnOnSyncCancellationToken=void 0}await this.userDataAutoSyncService.turnOn(),this.userDataSyncStoreManagementService.userDataSyncStore?.canSwitch&&await this.synchroniseUserDataSyncStoreType(),this.currentAuthenticationProviderId=this.current?.authenticationProviderId,this.environmentService.options?.settingsSyncOptions?.enablementHandler&&this.currentAuthenticationProviderId&&this.environmentService.options.settingsSyncOptions.enablementHandler(!0,this.currentAuthenticationProviderId),this.notificationService.info(a("sync turned on","{0} is turned on",w.value))}async turnoff(e){this.userDataSyncEnablementService.isEnabled()&&(await this.userDataAutoSyncService.turnOff(e),this.environmentService.options?.settingsSyncOptions?.enablementHandler&&this.currentAuthenticationProviderId&&this.environmentService.options.settingsSyncOptions.enablementHandler(!1,this.currentAuthenticationProviderId)),this.turnOnSyncCancellationToken&&this.turnOnSyncCancellationToken.cancel()}async synchroniseUserDataSyncStoreType(){if(!this.userDataSyncAccountService.account)throw new Error("Cannot update because you are signed out from settings sync. Please sign in and try again.");if(!C||!this.userDataSyncStoreManagementService.userDataSyncStore)return;const e=this.userDataSyncStoreManagementService.userDataSyncStore.type==="insiders"?this.userDataSyncStoreManagementService.userDataSyncStore.stableUrl:this.userDataSyncStoreManagementService.userDataSyncStore.insidersUrl,t=this.instantiationService.createInstance(Se,e);t.setAuthToken(this.userDataSyncAccountService.account.token,this.userDataSyncAccountService.account.authenticationProviderId),await this.instantiationService.createInstance(te,t).sync(this.userDataSyncStoreManagementService.userDataSyncStore.type)}syncNow(){return this.userDataAutoSyncService.triggerSync(["Sync Now"],!1,!0)}async doTurnOnSync(e){const t=new A,n=await this.userDataSyncService.createManualSyncTask();try{await this.progressService.withProgress({location:b.Window,title:w.value,command:Te,delay:500},async i=>{i.report({message:a("turning on","Turning on...")}),t.add(this.userDataSyncService.onDidChangeStatus(r=>{r===P.HasConflicts?i.report({message:a("resolving conflicts","Resolving conflicts...")}):i.report({message:a("syncing...","Turning on...")})})),await n.merge(),this.userDataSyncService.status===P.HasConflicts&&await this.handleConflictsWhileTurningOn(e),await n.apply()})}catch(i){throw await n.stop(),i}finally{t.dispose()}}async handleConflictsWhileTurningOn(e){await this.dialogService.prompt({type:$.Warning,message:a("conflicts detected","Conflicts Detected"),detail:a("resolve","Please resolve conflicts to turn on..."),buttons:[{label:a({key:"show conflicts",comment:["&& denotes a mnemonic"]},"&&Show Conflicts"),run:async()=>{const t=R(h.toPromise(h.filter(this.userDataSyncService.onDidChangeConflicts,n=>n.length===0)),e);await this.showConflicts(this.userDataSyncService.conflicts[0]?.conflicts[0]),await t}},{label:a({key:"replace local",comment:["&& denotes a mnemonic"]},"Replace &&Local"),run:async()=>this.replace(!0)},{label:a({key:"replace remote",comment:["&& denotes a mnemonic"]},"Replace &&Remote"),run:()=>this.replace(!1)}],cancelButton:{run:()=>{throw new _}}})}async replace(e){for(const t of this.userDataSyncService.conflicts)for(const n of t.conflicts)await this.accept({syncResource:t.syncResource,profile:t.profile},e?n.remoteResource:n.localResource,void 0,{force:!0})}async accept(e,t,n,i){return this.userDataSyncService.accept(e,t,n,i)}async showConflicts(e){if(!this.userDataSyncService.conflicts.length)return;this.enableConflictsViewContext.set(!0);const t=await this.viewsService.openView(be);t&&e&&await t.open(e)}async resetSyncedData(){const{confirmed:e}=await this.dialogService.confirm({type:"info",message:a("reset","This will clear your data in the cloud and stop sync on all your devices."),title:a("reset title","Clear"),primaryButton:a({key:"resetButton",comment:["&& denotes a mnemonic"]},"&&Reset")});e&&await this.userDataSyncService.resetRemote()}async getAllLogResources(){const e=[],t=await this.fileService.resolve(this.uriIdentityService.extUri.dirname(this.environmentService.logsHome));t.children&&e.push(...t.children.filter(i=>i.isDirectory&&/^\d{8}T\d{6}$/.test(i.name)).sort().reverse().map(i=>i.resource));const n=[];for(const i of e){const c=(await this.fileService.resolve(i)).children?.find(s=>this.uriIdentityService.extUri.basename(s.resource).startsWith(`${ae}.`));c&&n.push(c.resource)}return n}async showSyncActivity(){this.activityViewsEnablementContext.set(!0),await this.waitForActiveSyncViews(),await this.viewsService.openViewContainer(U)}async downloadSyncActivity(){const e=await this.fileDialogService.showOpenDialog({title:a("download sync activity dialog title","Select folder to download Settings Sync activity"),canSelectFiles:!1,canSelectFolders:!0,canSelectMany:!1,openLabel:a("download sync activity dialog open label","Save")});if(e?.[0])return this.progressService.withProgress({location:b.Window},async()=>{const n=(await this.userDataSyncMachinesService.getMachines()).find(S=>S.isCurrent),i=(n?n.name+" - ":"")+"Settings Sync Activity",r=await this.fileService.resolve(e[0]),c=new RegExp(`${V(i)}\\s(\\d+)`),s=[];for(const S of r.children??[])if(S.name===i)s.push(0);else{const v=c.exec(S.name);v&&s.push(parseInt(v[1]))}s.sort((S,v)=>S-v);const p=this.uriIdentityService.extUri.joinPath(e[0],s[0]!==0?i:`${i} ${s[s.length-1]+1}`);return await Promise.all([this.userDataSyncService.saveRemoteActivityData(this.uriIdentityService.extUri.joinPath(p,"remoteActivity.json")),(async()=>{const S=await this.getAllLogResources();await Promise.all(S.map(async v=>this.fileService.copy(v,this.uriIdentityService.extUri.joinPath(p,"logs",`${this.uriIdentityService.extUri.basename(this.uriIdentityService.extUri.dirname(v))}.log`))))})(),this.fileService.copy(this.environmentService.userDataSyncHome,this.uriIdentityService.extUri.joinPath(p,"localActivity"))]),p})}async waitForActiveSyncViews(){const e=this.viewDescriptorService.getViewContainerById(U);if(e){const t=this.viewDescriptorService.getViewContainerModel(e);t.activeViewDescriptors.length||await h.toPromise(h.filter(t.onDidChangeActiveViewDescriptors,n=>t.activeViewDescriptors.length>0))}}async signIn(){const e=this.currentAuthenticationProviderId,t=e?this.authenticationProviders.find(n=>n.id===e):void 0;t?await this.doSignIn(t):await this.pick()}async pick(){const e=await this.doPick();return e?(await this.doSignIn(e),!0):!1}async doPick(){if(this.authenticationProviders.length===0)return;const e=[...this.authenticationProviders].sort(({id:s})=>s===this.currentAuthenticationProviderId?-1:1),t=new Map;if(e.length===1){const s=await this.getAccounts(e[0].id,e[0].scopes);if(s.length)t.set(e[0].id,s);else return e[0]}let n;const i=new A,r=i.add(this.quickInputService.createQuickPick({useSeparators:!0})),c=new Promise(s=>{i.add(r.onDidHide(()=>{i.dispose(),s(n)}))});if(r.title=w.value,r.ok=!1,r.ignoreFocusOut=!0,r.placeholder=a("choose account placeholder","Select an account to sign in"),r.show(),e.length>1){r.busy=!0;for(const{id:s,scopes:p}of e){const S=await this.getAccounts(s,p);S.length&&t.set(s,S)}r.busy=!1}return r.items=this.createQuickpickItems(e,t),i.add(r.onDidAccept(()=>{n=r.selectedItems[0]?.account?r.selectedItems[0]?.account:r.selectedItems[0]?.authenticationProvider,r.hide()})),c}async getAccounts(e,t){const n=new Map;let i=null;const r=await this.authenticationService.getSessions(e,t)||[];for(const c of r){const s=new O(e,c);n.set(s.accountId,s),s.sessionId===this.currentSessionId&&(i=s)}return i&&n.set(i.accountId,i),i?[...n.values()]:[...n.values()].sort(({sessionId:c})=>c===this.currentSessionId?-1:1)}createQuickpickItems(e,t){const n=[];if(t.size){n.push({type:"separator",label:a("signed in","Signed in")});for(const i of e){const r=(t.get(i.id)||[]).sort(({sessionId:s})=>s===this.currentSessionId?-1:1),c=this.authenticationService.getProvider(i.id).label;for(const s of r)n.push({label:`${s.accountName} (${c})`,description:s.sessionId===this.current?.sessionId?a("last used","Last Used with Sync"):void 0,account:s,authenticationProvider:i})}n.push({type:"separator",label:a("others","Others")})}for(const i of e){const r=this.authenticationService.getProvider(i.id);if(!t.has(i.id)||r.supportsMultipleAccounts){const c=r.label;n.push({label:a("sign in using account","Sign in with {0}",c),authenticationProvider:i})}}return n}async doSignIn(e){let t;ie(e)?(this.environmentService.options?.settingsSyncOptions?.authenticationProvider?.id===e.id?t=await this.environmentService.options?.settingsSyncOptions?.authenticationProvider?.signIn():t=(await this.authenticationService.createSession(e.id,e.scopes)).id,this.currentAuthenticationProviderId=e.id):(this.environmentService.options?.settingsSyncOptions?.authenticationProvider?.id===e.authenticationProviderId?t=await this.environmentService.options?.settingsSyncOptions?.authenticationProvider?.signIn():t=e.sessionId,this.currentAuthenticationProviderId=e.authenticationProviderId),this.currentSessionId=t,await this.update()}async onDidAuthFailure(){this.telemetryService.publicLog2("sync/successiveAuthFailures"),this.currentSessionId=void 0,await this.update("auth failure")}onDidChangeSessions(e){this.currentSessionId&&e.removed?.find(t=>t.id===this.currentSessionId)&&(this.currentSessionId=void 0),this.update("change in sessions")}onDidChangeStorage(){this.currentSessionId!==this.getStoredCachedSessionId()&&(this._cachedCurrentSessionId=null,this.update("change in storage"))}_cachedCurrentAuthenticationProviderId=null;get currentAuthenticationProviderId(){return this._cachedCurrentAuthenticationProviderId===null&&(this._cachedCurrentAuthenticationProviderId=this.storageService.get(u.CACHED_AUTHENTICATION_PROVIDER_KEY,l.APPLICATION)),this._cachedCurrentAuthenticationProviderId}set currentAuthenticationProviderId(e){this._cachedCurrentAuthenticationProviderId!==e&&(this._cachedCurrentAuthenticationProviderId=e,e===void 0?this.storageService.remove(u.CACHED_AUTHENTICATION_PROVIDER_KEY,l.APPLICATION):this.storageService.store(u.CACHED_AUTHENTICATION_PROVIDER_KEY,e,l.APPLICATION,D.MACHINE))}_cachedCurrentSessionId=null;get currentSessionId(){return this._cachedCurrentSessionId===null&&(this._cachedCurrentSessionId=this.getStoredCachedSessionId()),this._cachedCurrentSessionId}set currentSessionId(e){this._cachedCurrentSessionId!==e&&(this._cachedCurrentSessionId=e,e===void 0?(this.logService.info("Settings Sync: Reset current session"),this.storageService.remove(u.CACHED_SESSION_STORAGE_KEY,l.APPLICATION)):(this.logService.info("Settings Sync: Updated current session",e),this.storageService.store(u.CACHED_SESSION_STORAGE_KEY,e,l.APPLICATION,D.MACHINE)))}getStoredCachedSessionId(){return this.storageService.get(u.CACHED_SESSION_STORAGE_KEY,l.APPLICATION)}get useWorkbenchSessionId(){return!this.storageService.getBoolean(u.DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY,l.APPLICATION,!1)}set useWorkbenchSessionId(e){this.storageService.store(u.DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY,!e,l.APPLICATION,D.MACHINE)}};u=E([o(0,se),o(1,ee),o(2,ye),o(3,ue),o(4,j),o(5,J),o(6,re),o(7,ne),o(8,Z),o(9,z),o(10,G),o(11,fe),o(12,Ie),o(13,q),o(14,Q),o(15,X),o(16,L),o(17,H),o(18,Ue),o(19,le),o(20,oe),o(21,ge),o(22,W),o(23,pe),o(24,me),o(25,F),o(26,Y),o(27,de)],u),B(_e,u,K.Eager);export{u as UserDataSyncWorkbenchService,Oe as isMergeEditorInput};
