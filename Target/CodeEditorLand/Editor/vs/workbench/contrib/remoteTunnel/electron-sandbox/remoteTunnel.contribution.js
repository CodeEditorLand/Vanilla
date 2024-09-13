var J=Object.defineProperty;var Z=Object.getOwnPropertyDescriptor;var U=(k,v,e,n)=>{for(var i=n>1?void 0:n?Z(v,e):v,o=k.length-1,t;o>=0;o--)(t=k[o])&&(i=(n?t(v,e,i):t(i))||i);return n&&i&&J(v,e,i),i},l=(k,v)=>(e,n)=>v(e,n,k);import{Action as b}from"../../../../base/common/actions.js";import{Disposable as ee,DisposableStore as O}from"../../../../base/common/lifecycle.js";import{Schemas as ne}from"../../../../base/common/network.js";import{joinPath as _}from"../../../../base/common/resources.js";import{isNumber as te,isObject as oe,isString as ie}from"../../../../base/common/types.js";import{URI as se}from"../../../../base/common/uri.js";import{localize as s,localize2 as re}from"../../../../nls.js";import{Action2 as I,MenuId as T,registerAction2 as y}from"../../../../platform/actions/common/actions.js";import{IClipboardService as D}from"../../../../platform/clipboard/common/clipboardService.js";import{ICommandService as K}from"../../../../platform/commands/common/commands.js";import{Extensions as ce,ConfigurationScope as q}from"../../../../platform/configuration/common/configurationRegistry.js";import{ContextKeyExpr as g,IContextKeyService as ae,RawContextKey as de}from"../../../../platform/contextkey/common/contextkey.js";import{IDialogService as Q}from"../../../../platform/dialogs/common/dialogs.js";import{INativeEnvironmentService as ue}from"../../../../platform/environment/common/environment.js";import{ILoggerService as le}from"../../../../platform/log/common/log.js";import{INotificationService as F,Severity as N}from"../../../../platform/notification/common/notification.js";import{IOpenerService as me}from"../../../../platform/opener/common/opener.js";import{IProductService as H}from"../../../../platform/product/common/productService.js";import{IProgressService as pe,ProgressLocation as W}from"../../../../platform/progress/common/progress.js";import{IQuickInputService as Y}from"../../../../platform/quickinput/common/quickInput.js";import{Registry as G}from"../../../../platform/registry/common/platform.js";import{CONFIGURATION_KEY_HOST_NAME as he,CONFIGURATION_KEY_PREFIX as ge,CONFIGURATION_KEY_PREVENT_SLEEP as fe,INACTIVE_TUNNEL_MODE as Se,IRemoteTunnelService as ve,LOGGER_NAME as Ie,LOG_ID as L}from"../../../../platform/remoteTunnel/common/remoteTunnel.js";import{IStorageService as j,StorageScope as S,StorageTarget as R}from"../../../../platform/storage/common/storage.js";import{IWorkspaceContextService as Te,isUntitledWorkspace as ye}from"../../../../platform/workspace/common/workspace.js";import{Extensions as we}from"../../../common/contributions.js";import{IAuthenticationService as ke}from"../../../services/authentication/common/authentication.js";import{IExtensionService as Ee}from"../../../services/extensions/common/extensions.js";import{LifecyclePhase as Ce}from"../../../services/lifecycle/common/lifecycle.js";import{IOutputService as Pe}from"../../../services/output/common/output.js";import{IPreferencesService as xe}from"../../../services/preferences/common/preferences.js";const w=re("remoteTunnel.category","Remote Tunnels"),m="remoteTunnelConnection",Ae=new de(m,"disconnected"),M="remoteTunnelServiceUsed",B="remoteTunnelServicePromptedPreview",z="remoteTunnelExtensionRecommended",V="remoteTunnelHasUsed",be=4*60*1e3,Oe=2;var Ne=(r=>(r.turnOn="workbench.remoteTunnel.actions.turnOn",r.turnOff="workbench.remoteTunnel.actions.turnOff",r.connecting="workbench.remoteTunnel.actions.connecting",r.manage="workbench.remoteTunnel.actions.manage",r.showLog="workbench.remoteTunnel.actions.showLog",r.configure="workbench.remoteTunnel.actions.configure",r.copyToClipboard="workbench.remoteTunnel.actions.copyToClipboard",r.learnMore="workbench.remoteTunnel.actions.learnMore",r))(Ne||{}),f;(t=>(t.turnOn=s("remoteTunnel.actions.turnOn","Turn on Remote Tunnel Access..."),t.turnOff=s("remoteTunnel.actions.turnOff","Turn off Remote Tunnel Access..."),t.showLog=s("remoteTunnel.actions.showLog","Show Remote Tunnel Service Log"),t.configure=s("remoteTunnel.actions.configure","Configure Tunnel Name..."),t.copyToClipboard=s("remoteTunnel.actions.copyToClipboard","Copy Browser URI to Clipboard"),t.learnMore=s("remoteTunnel.actions.learnMore","Get Started with Tunnels")))(f||={});let x=class extends ee{constructor(e,n,i,o,t,c,r,u,a,C,P,p,d,E){super();this.authenticationService=e;this.dialogService=n;this.extensionService=i;this.contextKeyService=o;this.storageService=c;this.quickInputService=u;this.environmentService=a;this.remoteTunnelService=C;this.commandService=P;this.workspaceContextService=p;this.progressService=d;this.notificationService=E;this.logger=this._register(r.createLogger(_(a.logsHome,`${L}.log`),{id:L,name:Ie})),this.connectionStateContext=Ae.bindTo(this.contextKeyService);const h=t.tunnelApplicationConfig;if(!h||!t.tunnelApplicationName){this.logger.error("Missing 'tunnelApplicationConfig' or 'tunnelApplicationName' in product.json. Remote tunneling is not available."),this.serverConfiguration={authenticationProviders:{},editorWebUrl:"",extension:{extensionId:"",friendlyName:""}};return}this.serverConfiguration=h,this._register(this.remoteTunnelService.onDidChangeTunnelStatus(A=>this.handleTunnelStatusUpdate(A))),this.registerCommands(),this.initialize(),this.recommendRemoteExtensionIfNeeded()}connectionStateContext;serverConfiguration;connectionInfo;logger;expiredSessions=new Set;handleTunnelStatusUpdate(e){this.connectionInfo=void 0,e.type==="disconnected"?(e.onTokenFailed&&this.expiredSessions.add(e.onTokenFailed.sessionId),this.connectionStateContext.set("disconnected")):e.type==="connecting"?this.connectionStateContext.set("connecting"):e.type==="connected"&&(this.connectionInfo=e.info,this.connectionStateContext.set("connected"))}async recommendRemoteExtensionIfNeeded(){await this.extensionService.whenInstalledExtensionsRegistered();const e=this.serverConfiguration.extension,n=async()=>{if(this.storageService.getBoolean(z,S.APPLICATION)||await this.extensionService.getExtension(e.extensionId))return!1;const o=this.storageService.get(M,S.APPLICATION);if(!o)return!1;let t;try{const r=JSON.parse(o);if(!oe(r))return!1;const{hostName:u,timeStamp:a}=r;if(!ie(u)||!te(a)||new Date().getTime()>a+be)return!1;t=u}catch{return!1}const c=await this.remoteTunnelService.getTunnelName();return!c||c===t?!1:t},i=async()=>{const o=await n();return o?(this.notificationService.notify({severity:N.Info,message:s({key:"recommend.remoteExtension",comment:["{0} will be a tunnel name, {1} will the link address to the web UI, {6} an extension name. [label](command:commandId) is a markdown link. Only translate the label, do not modify the format"]},"Tunnel '{0}' is avaiable for remote access. The {1} extension can be used to connect to it.",o,e.friendlyName),actions:{primary:[new b("showExtension",s("action.showExtension","Show Extension"),void 0,!0,()=>this.commandService.executeCommand("workbench.extensions.action.showExtensionsWithIds",[e.extensionId])),new b("doNotShowAgain",s("action.doNotShowAgain","Do not show again"),void 0,!0,()=>{this.storageService.store(z,!0,S.APPLICATION,R.USER)})]}}),!0):!1};if(await n()){const o=this._register(new O);o.add(this.storageService.onDidChangeValue(S.APPLICATION,M,o)(async()=>{await i()&&o.dispose()}))}}async initialize(){const[e,n]=await Promise.all([this.remoteTunnelService.getMode(),this.remoteTunnelService.getTunnelStatus()]);if(this.handleTunnelStatusUpdate(n),e.active&&e.session.token)return;const i=async t=>{const c=t&&this.remoteTunnelService.onDidChangeTunnelStatus(a=>{switch(a.type){case"connecting":a.progress&&t.report({message:a.progress});break}});let r;if(e.active){const a=await this.getSessionToken(e.session);a&&(r={...e.session,token:a})}const u=await this.remoteTunnelService.initialize(e.active&&r?{...e,session:r}:Se);if(c?.dispose(),u.type==="connected"){this.connectionInfo=u.info,this.connectionStateContext.set("connected");return}};this.storageService.getBoolean(V,S.APPLICATION,!1)?await this.progressService.withProgress({location:W.Window,title:s({key:"initialize.progress.title",comment:["Only translate 'Looking for remote tunnel', do not change the format of the rest (markdown link format)"]},"[Looking for remote tunnel](command:{0})","workbench.remoteTunnel.actions.showLog")},i):i(void 0)}getPreferredTokenFromSession(e){return e.session.accessToken||e.session.idToken}async startTunnel(e){if(this.connectionInfo)return this.connectionInfo;this.storageService.store(V,!0,S.APPLICATION,R.MACHINE);let n=!1;for(let i=0;i<Oe;i++){n=!1;const o=await this.getAuthenticationSession();if(o===void 0){this.logger.info("No authentication session available, not starting tunnel");return}const t=await this.progressService.withProgress({location:W.Notification,title:s({key:"startTunnel.progress.title",comment:["Only translate 'Starting remote tunnel', do not change the format of the rest (markdown link format)"]},"[Starting remote tunnel](command:{0})","workbench.remoteTunnel.actions.showLog")},c=>new Promise((r,u)=>{let a=!1;const C=this.remoteTunnelService.onDidChangeTunnelStatus(d=>{switch(d.type){case"connecting":d.progress&&c.report({message:d.progress});break;case"connected":C.dispose(),a=!0,r(d.info),d.serviceInstallFailed&&this.notificationService.notify({severity:N.Warning,message:s({key:"remoteTunnel.serviceInstallFailed",comment:['{Locked="](command:{0})"}']},"Installation as a service failed, and we fell back to running the tunnel for this session. See the [error log](command:{0}) for details.","workbench.remoteTunnel.actions.showLog")});break;case"disconnected":C.dispose(),a=!0,n=!!d.onTokenFailed,r(void 0);break}}),P=this.getPreferredTokenFromSession(o),p={sessionId:o.session.id,token:P,providerId:o.providerId,accountLabel:o.session.account.label};this.remoteTunnelService.startTunnel({active:!0,asService:e,session:p}).then(d=>{!a&&(d.type==="connected"||d.type==="disconnected")&&(C.dispose(),d.type==="connected"?r(d.info):(n=!!d.onTokenFailed,r(void 0)))})}));if(t||!n)return t}}async getAuthenticationSession(){const e=await this.getAllSessions(),n=new O,i=n.add(this.quickInputService.createQuickPick({useSeparators:!0}));return i.ok=!1,i.placeholder=s("accountPreference.placeholder","Sign in to an account to enable remote access"),i.ignoreFocusOut=!0,i.items=await this.createQuickpickItems(e),new Promise((o,t)=>{n.add(i.onDidHide(c=>{o(void 0),n.dispose()})),n.add(i.onDidAccept(async c=>{const r=i.selectedItems[0];if("provider"in r){const u=await this.authenticationService.createSession(r.provider.id,r.provider.scopes);o(this.createExistingSessionItem(u,r.provider.id))}else"session"in r?o(r):o(void 0);i.hide()})),i.show()})}createExistingSessionItem(e,n){return{label:e.account.label,description:this.authenticationService.getProvider(n).label,session:e,providerId:n}}async createQuickpickItems(e){const n=[];e.length&&(n.push({type:"separator",label:s("signed in","Signed In")}),n.push(...e),n.push({type:"separator",label:s("others","Others")}));for(const i of await this.getAuthenticationProviders()){const o=e.some(c=>c.providerId===i.id),t=this.authenticationService.getProvider(i.id);(!o||t.supportsMultipleAccounts)&&n.push({label:s({key:"sign in using account",comment:["{0} will be a auth provider (e.g. Github)"]},"Sign in with {0}",t.label),provider:i})}return n}async getAllSessions(){const e=await this.getAuthenticationProviders(),n=new Map,i=await this.remoteTunnelService.getMode();let o;for(const t of e){const c=await this.authenticationService.getSessions(t.id,t.scopes);for(const r of c)if(!this.expiredSessions.has(r.id)){const u=this.createExistingSessionItem(r,t.id);n.set(u.session.account.id,u),i.active&&i.session.sessionId===r.id&&(o=u)}}return o!==void 0&&n.set(o.session.account.id,o),[...n.values()]}async getSessionToken(e){if(e){const n=(await this.getAllSessions()).find(i=>i.session.id===e.sessionId);if(n)return this.getPreferredTokenFromSession(n)}}async getAuthenticationProviders(){const e=this.serverConfiguration.authenticationProviders,n=Object.keys(e).reduce((o,t)=>(o.push({id:t,scopes:e[t].scopes}),o),[]),i=this.authenticationService.declaredProviders;return n.filter(({id:o})=>i.some(t=>t.id===o))}registerCommands(){const e=this;this._register(y(class extends I{constructor(){super({id:"workbench.remoteTunnel.actions.turnOn",title:f.turnOn,category:w,precondition:g.equals(m,"disconnected"),menu:[{id:T.CommandPalette},{id:T.AccountsContext,group:"2_remoteTunnel",when:g.equals(m,"disconnected")}]})}async run(n){const i=n.get(F),o=n.get(D),t=n.get(K),c=n.get(j),r=n.get(Q),u=n.get(Y),a=n.get(H);if(!c.getBoolean(B,S.APPLICATION,!1)){const{confirmed:h}=await r.confirm({message:s("tunnel.preview",'Remote Tunnels is currently in preview. Please report any problems using the "Help: Report Issue" command.'),primaryButton:s({key:"enable",comment:["&& denotes a mnemonic"]},"&&Enable")});if(!h)return;c.store(B,!0,S.APPLICATION,R.USER)}const P=new O,p=u.createQuickPick();p.placeholder=s("tunnel.enable.placeholder","Select how you want to enable access"),p.items=[{service:!1,label:s("tunnel.enable.session","Turn on for this session"),description:s("tunnel.enable.session.description","Run whenever {0} is open",a.nameShort)},{service:!0,label:s("tunnel.enable.service","Install as a service"),description:s("tunnel.enable.service.description","Run whenever you're logged in")}];const d=await new Promise(h=>{P.add(p.onDidAccept(()=>h(p.selectedItems[0]?.service))),P.add(p.onDidHide(()=>h(void 0))),p.show()});if(p.dispose(),d===void 0)return;const E=await e.startTunnel(d);if(E){const h=e.getLinkToOpen(E),A=e.serverConfiguration.extension,X=h.toString(!1).replace(/\)/g,"%29");i.notify({severity:N.Info,message:s({key:"progress.turnOn.final",comment:["{0} will be the tunnel name, {1} will the link address to the web UI, {6} an extension name, {7} a link to the extension documentation. [label](command:commandId) is a markdown link. Only translate the label, do not modify the format"]},"You can now access this machine anywhere via the secure tunnel [{0}](command:{4}). To connect via a different machine, use the generated [{1}]({2}) link or use the [{6}]({7}) extension in the desktop or web. You can [configure](command:{3}) or [turn off](command:{5}) this access via the VS Code Accounts menu.",E.tunnelName,E.domain,X,"workbench.remoteTunnel.actions.manage","workbench.remoteTunnel.actions.configure","workbench.remoteTunnel.actions.turnOff",A.friendlyName,"https://code.visualstudio.com/docs/remote/tunnels"),actions:{primary:[new b("copyToClipboard",s("action.copyToClipboard","Copy Browser Link to Clipboard"),void 0,!0,()=>o.writeText(h.toString(!0))),new b("showExtension",s("action.showExtension","Show Extension"),void 0,!0,()=>t.executeCommand("workbench.extensions.action.showExtensionsWithIds",[A.extensionId]))]}});const $={hostName:E.tunnelName,timeStamp:new Date().getTime()};c.store(M,JSON.stringify($),S.APPLICATION,R.USER)}else i.notify({severity:N.Info,message:s("progress.turnOn.failed","Unable to turn on the remote tunnel access. Check the Remote Tunnel Service log for details.")}),await t.executeCommand("workbench.remoteTunnel.actions.showLog")}})),this._register(y(class extends I{constructor(){super({id:"workbench.remoteTunnel.actions.manage",title:s("remoteTunnel.actions.manage.on.v2","Remote Tunnel Access is On"),category:w,menu:[{id:T.AccountsContext,group:"2_remoteTunnel",when:g.equals(m,"connected")}]})}async run(){e.showManageOptions()}})),this._register(y(class extends I{constructor(){super({id:"workbench.remoteTunnel.actions.connecting",title:s("remoteTunnel.actions.manage.connecting","Remote Tunnel Access is Connecting"),category:w,menu:[{id:T.AccountsContext,group:"2_remoteTunnel",when:g.equals(m,"connecting")}]})}async run(){e.showManageOptions()}})),this._register(y(class extends I{constructor(){super({id:"workbench.remoteTunnel.actions.turnOff",title:f.turnOff,category:w,precondition:g.notEquals(m,"disconnected"),menu:[{id:T.CommandPalette,when:g.notEquals(m,"")}]})}async run(){const n=e.connectionInfo?.isAttached?s("remoteTunnel.turnOffAttached.confirm","Do you want to turn off Remote Tunnel Access? This will also stop the service that was started externally."):s("remoteTunnel.turnOff.confirm","Do you want to turn off Remote Tunnel Access?"),{confirmed:i}=await e.dialogService.confirm({message:n});i&&e.remoteTunnelService.stopTunnel()}})),this._register(y(class extends I{constructor(){super({id:"workbench.remoteTunnel.actions.showLog",title:f.showLog,category:w,menu:[{id:T.CommandPalette,when:g.notEquals(m,"")}]})}async run(n){n.get(Pe).showChannel(L)}})),this._register(y(class extends I{constructor(){super({id:"workbench.remoteTunnel.actions.configure",title:f.configure,category:w,menu:[{id:T.CommandPalette,when:g.notEquals(m,"")}]})}async run(n){n.get(xe).openSettings({query:ge})}})),this._register(y(class extends I{constructor(){super({id:"workbench.remoteTunnel.actions.copyToClipboard",title:f.copyToClipboard,category:w,precondition:g.equals(m,"connected"),menu:[{id:T.CommandPalette,when:g.equals(m,"connected")}]})}async run(n){const i=n.get(D);if(e.connectionInfo){const o=e.getLinkToOpen(e.connectionInfo);i.writeText(o.toString(!0))}}})),this._register(y(class extends I{constructor(){super({id:"workbench.remoteTunnel.actions.learnMore",title:f.learnMore,category:w,menu:[]})}async run(n){await n.get(me).open("https://aka.ms/vscode-server-doc")}}))}getLinkToOpen(e){const n=this.workspaceContextService.getWorkspace(),i=n.folders;let o;i.length===1?o=i[0].uri:n.configuration&&!ye(n.configuration,this.environmentService)&&(o=n.configuration);const t=se.parse(e.link);return o?.scheme===ne.file?_(t,o.path):_(t,this.environmentService.userHome.path)}async showManageOptions(){const e=await this.remoteTunnelService.getMode();return new Promise((n,i)=>{const o=new O,t=this.quickInputService.createQuickPick({useSeparators:!0});t.placeholder=s("manage.placeholder","Select a command to invoke"),o.add(t);const c=[];c.push({id:"workbench.remoteTunnel.actions.learnMore",label:f.learnMore}),this.connectionInfo?(t.title=this.connectionInfo.isAttached?s({key:"manage.title.attached",comment:["{0} is the tunnel name"]},"Remote Tunnel Access enabled for {0} (launched externally)",this.connectionInfo.tunnelName):s({key:"manage.title.orunning",comment:["{0} is the tunnel name"]},"Remote Tunnel Access enabled for {0}",this.connectionInfo.tunnelName),c.push({id:"workbench.remoteTunnel.actions.copyToClipboard",label:f.copyToClipboard,description:this.connectionInfo.domain})):t.title=s("manage.title.off","Remote Tunnel Access not enabled"),c.push({id:"workbench.remoteTunnel.actions.showLog",label:s("manage.showLog","Show Log")}),c.push({type:"separator"}),c.push({id:"workbench.remoteTunnel.actions.configure",label:s("manage.tunnelName","Change Tunnel Name"),description:this.connectionInfo?.tunnelName}),c.push({id:"workbench.remoteTunnel.actions.turnOff",label:f.turnOff,description:e.active?`${e.session.accountLabel} (${e.session.providerId})`:void 0}),t.items=c,o.add(t.onDidAccept(()=>{t.selectedItems[0]&&t.selectedItems[0].id&&this.commandService.executeCommand(t.selectedItems[0].id),t.hide()})),o.add(t.onDidHide(()=>{o.dispose(),n()})),t.show()})}};x=U([l(0,ke),l(1,Q),l(2,Ee),l(3,ae),l(4,H),l(5,j),l(6,le),l(7,Y),l(8,ue),l(9,ve),l(10,K),l(11,Te),l(12,pe),l(13,F)],x);const Re=G.as(we.Workbench);Re.registerWorkbenchContribution(x,Ce.Restored),G.as(ce.Configuration).registerConfiguration({type:"object",properties:{[he]:{description:s("remoteTunnelAccess.machineName","The name under which the remote tunnel access is registered. If not set, the host name is used."),type:"string",scope:q.APPLICATION,ignoreSync:!0,pattern:"^(\\w[\\w-]*)?$",patternErrorMessage:s("remoteTunnelAccess.machineNameRegex","The name must only consist of letters, numbers, underscore and dash. It must not start with a dash."),maxLength:20,default:""},[fe]:{description:s("remoteTunnelAccess.preventSleep","Prevent this computer from sleeping when remote tunnel access is turned on."),type:"boolean",scope:q.APPLICATION,default:!1}}});export{w as REMOTE_TUNNEL_CATEGORY,Ae as REMOTE_TUNNEL_CONNECTION_STATE,m as REMOTE_TUNNEL_CONNECTION_STATE_KEY,x as RemoteTunnelWorkbenchContribution};
