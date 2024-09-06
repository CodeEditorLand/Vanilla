var P=Object.defineProperty;var H=Object.getOwnPropertyDescriptor;var T=(C,f,t,e)=>{for(var i=e>1?void 0:e?H(f,t):f,n=C.length-1,o;n>=0;n--)(o=C[n])&&(i=(e?o(f,t,i):o(i))||i);return e&&i&&P(f,t,i),i},l=(C,f)=>(t,e)=>f(t,e,C);import{DomEmitter as L}from"../../../../../vs/base/browser/event.js";import{mainWindow as N}from"../../../../../vs/base/browser/window.js";import"../../../../../vs/base/common/actions.js";import{retry as z,RunOnceScheduler as G}from"../../../../../vs/base/common/async.js";import{CancellationToken as $}from"../../../../../vs/base/common/cancellation.js";import{Emitter as U,Event as A}from"../../../../../vs/base/common/event.js";import{MarkdownString as M}from"../../../../../vs/base/common/htmlContent.js";import{getCodiconAriaLabel as K}from"../../../../../vs/base/common/iconLabels.js";import{KeyCode as B,KeyMod as O}from"../../../../../vs/base/common/keyCodes.js";import{Disposable as F,DisposableStore as V}from"../../../../../vs/base/common/lifecycle.js";import{Schemas as D}from"../../../../../vs/base/common/network.js";import{isWeb as b,platform as X,PlatformToString as q}from"../../../../../vs/base/common/platform.js";import{truncate as S}from"../../../../../vs/base/common/strings.js";import{ThemeIcon as Q}from"../../../../../vs/base/common/themables.js";import{URI as Y}from"../../../../../vs/base/common/uri.js";import*as s from"../../../../../vs/nls.js";import{Action2 as x,IMenuService as j,MenuId as _,MenuItemAction as J,MenuRegistry as Z,registerAction2 as w}from"../../../../../vs/platform/actions/common/actions.js";import{ICommandService as ee}from"../../../../../vs/platform/commands/common/commands.js";import{IConfigurationService as te}from"../../../../../vs/platform/configuration/common/configuration.js";import{Extensions as ie}from"../../../../../vs/platform/configuration/common/configurationRegistry.js";import{ContextKeyExpr as oe,IContextKeyService as ne,RawContextKey as re}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT as ae,IExtensionGalleryService as se,IExtensionManagementService as ce}from"../../../../../vs/platform/extensionManagement/common/extensionManagement.js";import{ExtensionIdentifier as g}from"../../../../../vs/platform/extensions/common/extensions.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{KeybindingWeight as le}from"../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{ILabelService as me}from"../../../../../vs/platform/label/common/label.js";import{ILogService as de}from"../../../../../vs/platform/log/common/log.js";import{IOpenerService as he}from"../../../../../vs/platform/opener/common/opener.js";import{IProductService as ue}from"../../../../../vs/platform/product/common/productService.js";import{IQuickInputService as pe}from"../../../../../vs/platform/quickinput/common/quickInput.js";import{Registry as fe}from"../../../../../vs/platform/registry/common/platform.js";import{PersistentConnectionEventType as E}from"../../../../../vs/platform/remote/common/remoteAgentConnection.js";import{IRemoteAuthorityResolverService as ve}from"../../../../../vs/platform/remote/common/remoteAuthorityResolver.js";import{getRemoteName as W}from"../../../../../vs/platform/remote/common/remoteHosts.js";import{ITelemetryService as Se}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{getVirtualWorkspaceLocation as ge}from"../../../../../vs/platform/workspace/common/virtualWorkspace.js";import{IWorkspaceContextService as Ee}from"../../../../../vs/platform/workspace/common/workspace.js";import{ReloadWindowAction as ye}from"../../../../../vs/workbench/browser/actions/windowActions.js";import{workbenchConfigurationNodeBase as Ce}from"../../../../../vs/workbench/common/configuration.js";import{RemoteNameContext as Ie,VirtualWorkspaceContext as Me}from"../../../../../vs/workbench/common/contextkeys.js";import"../../../../../vs/workbench/common/contributions.js";import{ViewContainerLocation as ke}from"../../../../../vs/workbench/common/views.js";import{infoIcon as Ae}from"../../../../../vs/workbench/contrib/extensions/browser/extensionsIcons.js";import{LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID as be,VIEWLET_ID as xe}from"../../../../../vs/workbench/contrib/extensions/common/extensions.js";import{IBrowserWorkbenchEnvironmentService as _e}from"../../../../../vs/workbench/services/environment/browser/environmentService.js";import{IExtensionService as we}from"../../../../../vs/workbench/services/extensions/common/extensions.js";import{IHostService as Re}from"../../../../../vs/workbench/services/host/browser/host.js";import{IPaneCompositePartService as Te}from"../../../../../vs/workbench/services/panecomposite/browser/panecomposite.js";import{IRemoteAgentService as Le,remoteConnectionLatencyMeasurer as y}from"../../../../../vs/workbench/services/remote/common/remoteAgentService.js";import{IStatusbarService as Ne,StatusbarAlignment as Oe}from"../../../../../vs/workbench/services/statusbar/browser/statusbar.js";let c=class extends F{constructor(t,e,i,n,o,r,a,m,p,k,R,u,d,h,v,I,De,We,Pe){super();this.statusbarService=t;this.environmentService=e;this.labelService=i;this.contextKeyService=n;this.menuService=o;this.quickInputService=r;this.commandService=a;this.extensionService=m;this.remoteAgentService=p;this.remoteAuthorityResolverService=k;this.hostService=R;this.workspaceContextService=u;this.logService=d;this.extensionGalleryService=h;this.telemetryService=v;this.productService=I;this.extensionManagementService=De;this.openerService=We;this.configurationService=Pe;this.remoteAuthority?(this.connectionState="initializing",this.connectionStateContextKey.set(this.connectionState)):this.updateVirtualWorkspaceLocation(),this.registerActions(),this.registerListeners(),this.updateWhenInstalledExtensionsRegistered(),this.updateRemoteStatusIndicator()}static ID="workbench.contrib.remoteStatusIndicator";static REMOTE_ACTIONS_COMMAND_ID="workbench.action.remote.showMenu";static CLOSE_REMOTE_COMMAND_ID="workbench.action.remote.close";static SHOW_CLOSE_REMOTE_COMMAND_ID=!b;static INSTALL_REMOTE_EXTENSIONS_ID="workbench.action.remote.extensions";static REMOTE_STATUS_LABEL_MAX_LENGTH=40;static REMOTE_CONNECTION_LATENCY_SCHEDULER_DELAY=60*1e3;static REMOTE_CONNECTION_LATENCY_SCHEDULER_FIRST_RUN_DELAY=10*1e3;remoteStatusEntry;legacyIndicatorMenu=this._register(this.menuService.createMenu(_.StatusBarWindowIndicatorMenu,this.contextKeyService));remoteIndicatorMenu=this._register(this.menuService.createMenu(_.StatusBarRemoteIndicatorMenu,this.contextKeyService));remoteMenuActionsGroups;remoteAuthority=this.environmentService.remoteAuthority;virtualWorkspaceLocation=void 0;connectionState=void 0;connectionToken=void 0;connectionStateContextKey=new re("remoteConnectionState","").bindTo(this.contextKeyService);networkState=void 0;measureNetworkConnectionLatencyScheduler=void 0;loggedInvalidGroupNames=Object.create(null);_remoteExtensionMetadata=void 0;get remoteExtensionMetadata(){if(!this._remoteExtensionMetadata){const t={...this.productService.remoteExtensionTips,...this.productService.virtualWorkspaceExtensionTips};this._remoteExtensionMetadata=Object.values(t).filter(e=>e.startEntry!==void 0).map(e=>({id:e.extensionId,installed:!1,friendlyName:e.friendlyName,isPlatformCompatible:!1,dependencies:[],helpLink:e.startEntry?.helpLink??"",startConnectLabel:e.startEntry?.startConnectLabel??"",startCommand:e.startEntry?.startCommand??"",priority:e.startEntry?.priority??10,supportedPlatforms:e.supportedPlatforms})),this.remoteExtensionMetadata.sort((e,i)=>e.priority-i.priority)}return this._remoteExtensionMetadata}remoteMetadataInitialized=!1;_onDidChangeEntries=this._register(new U);onDidChangeEntries=this._onDidChangeEntries.event;registerActions(){const t=s.localize2("remote.category","Remote"),e=this;this._register(w(class extends x{constructor(){super({id:c.REMOTE_ACTIONS_COMMAND_ID,category:t,title:s.localize2("remote.showMenu","Show Remote Menu"),f1:!0,keybinding:{weight:le.WorkbenchContrib,primary:O.CtrlCmd|O.Alt|B.KeyO}})}run=()=>e.showRemoteMenu()})),c.SHOW_CLOSE_REMOTE_COMMAND_ID&&(this._register(w(class extends x{constructor(){super({id:c.CLOSE_REMOTE_COMMAND_ID,category:t,title:s.localize2("remote.close","Close Remote Connection"),f1:!0,precondition:oe.or(Ie,Me)})}run=()=>e.hostService.openWindow({forceReuseWindow:!0,remoteAuthority:null})})),this.remoteAuthority&&Z.appendMenuItem(_.MenubarFileMenu,{group:"6_close",command:{id:c.CLOSE_REMOTE_COMMAND_ID,title:s.localize({key:"miCloseRemote",comment:["&& denotes a mnemonic"]},"Close Re&&mote Connection")},order:3.5})),this.extensionGalleryService.isEnabled()&&this._register(w(class extends x{constructor(){super({id:c.INSTALL_REMOTE_EXTENSIONS_ID,category:t,title:s.localize2("remote.install","Install Remote Development Extensions"),f1:!0})}run=(i,n)=>i.get(Te).openPaneComposite(xe,ke.Sidebar,!0).then(r=>{r&&((r?.getViewPaneContainer()).search("@recommended:remotes"),r.focus())})}))}registerListeners(){const t=()=>{this.remoteMenuActionsGroups=void 0,this.updateRemoteStatusIndicator()};this._register(this.legacyIndicatorMenu.onDidChange(t)),this._register(this.remoteIndicatorMenu.onDidChange(t)),this._register(this.labelService.onDidChangeFormatters(()=>this.updateRemoteStatusIndicator()));const e=this.environmentService.options?.windowIndicator;if(e&&e.onDidChange&&this._register(e.onDidChange(()=>this.updateRemoteStatusIndicator())),this.remoteAuthority){const i=this.remoteAgentService.getConnection();i&&this._register(i.onDidStateChange(n=>{switch(n.type){case E.ConnectionLost:case E.ReconnectionRunning:case E.ReconnectionWait:this.setConnectionState("reconnecting");break;case E.ReconnectionPermanentFailure:this.setConnectionState("disconnected");break;case E.ConnectionGain:this.setConnectionState("connected");break}}))}else this._register(this.workspaceContextService.onDidChangeWorkbenchState(()=>{this.updateVirtualWorkspaceLocation(),this.updateRemoteStatusIndicator()}));b&&this._register(A.any(this._register(new L(N,"online")).event,this._register(new L(N,"offline")).event)(()=>this.setNetworkState(navigator.onLine?"online":"offline"))),this._register(this.extensionService.onDidChangeExtensions(async i=>{for(const n of i.added){const o=this.remoteExtensionMetadata.findIndex(r=>g.equals(r.id,n.identifier));o>-1&&(this.remoteExtensionMetadata[o].installed=!0)}})),this._register(this.extensionManagementService.onDidUninstallExtension(async i=>{const n=this.remoteExtensionMetadata.findIndex(o=>g.equals(o.id,i.identifier.id));n>-1&&(this.remoteExtensionMetadata[n].installed=!1)}))}async initializeRemoteMetadata(){if(this.remoteMetadataInitialized)return;const t=q(X);for(let e=0;e<this.remoteExtensionMetadata.length;e++){const i=this.remoteExtensionMetadata[e].id,n=this.remoteExtensionMetadata[e].supportedPlatforms,o=!!(await this.extensionManagementService.getInstalled()).find(r=>g.equals(r.identifier.id,i));this.remoteExtensionMetadata[e].installed=o,o?this.remoteExtensionMetadata[e].isPlatformCompatible=!0:n&&!n.includes(t)?this.remoteExtensionMetadata[e].isPlatformCompatible=!1:this.remoteExtensionMetadata[e].isPlatformCompatible=!0}this.remoteMetadataInitialized=!0,this._onDidChangeEntries.fire(),this.updateRemoteStatusIndicator()}updateVirtualWorkspaceLocation(){this.virtualWorkspaceLocation=ge(this.workspaceContextService.getWorkspace())}async updateWhenInstalledExtensionsRegistered(){await this.extensionService.whenInstalledExtensionsRegistered();const t=this.remoteAuthority;t&&(async()=>{try{const{authority:e}=await this.remoteAuthorityResolverService.resolveAuthority(t);this.connectionToken=e.connectionToken,this.setConnectionState("connected")}catch{this.setConnectionState("disconnected")}})(),this.updateRemoteStatusIndicator(),this.initializeRemoteMetadata()}setConnectionState(t){this.connectionState!==t&&(this.connectionState=t,this.connectionState==="reconnecting"?this.connectionStateContextKey.set("disconnected"):this.connectionStateContextKey.set(this.connectionState),this.updateRemoteStatusIndicator(),t==="connected"&&this.scheduleMeasureNetworkConnectionLatency())}scheduleMeasureNetworkConnectionLatency(){!this.remoteAuthority||this.measureNetworkConnectionLatencyScheduler||(this.measureNetworkConnectionLatencyScheduler=this._register(new G(()=>this.measureNetworkConnectionLatency(),c.REMOTE_CONNECTION_LATENCY_SCHEDULER_DELAY)),this.measureNetworkConnectionLatencyScheduler.schedule(c.REMOTE_CONNECTION_LATENCY_SCHEDULER_FIRST_RUN_DELAY))}async measureNetworkConnectionLatency(){if(this.hostService.hasFocus&&this.networkState!=="offline"){const t=await y.measure(this.remoteAgentService);t&&(t.high?this.setNetworkState("high-latency"):this.networkState==="high-latency"&&this.setNetworkState("online"))}this.measureNetworkConnectionLatencyScheduler?.schedule()}setNetworkState(t){if(this.networkState!==t){const e=this.networkState;this.networkState=t,t==="high-latency"&&this.logService.warn(`Remote network connection appears to have high latency (${y.latency?.current?.toFixed(2)}ms last, ${y.latency?.average?.toFixed(2)}ms average)`),this.connectionToken&&(t==="online"&&e==="high-latency"?this.logNetworkConnectionHealthTelemetry(this.connectionToken,"good"):t==="high-latency"&&e==="online"&&this.logNetworkConnectionHealthTelemetry(this.connectionToken,"poor")),this.updateRemoteStatusIndicator()}}logNetworkConnectionHealthTelemetry(t,e){this.telemetryService.publicLog2("remoteConnectionHealth",{remoteName:W(this.remoteAuthority),reconnectionToken:t,connectionHealth:e})}validatedGroup(t){return t.match(/^(remote|virtualfs)_(\d\d)_(([a-z][a-z0-9+.-]*)_(.*))$/)?!0:(this.loggedInvalidGroupNames[t]||(this.loggedInvalidGroupNames[t]=!0,this.logService.warn(`Invalid group name used in "statusBar/remoteIndicator" menu contribution: ${t}. Entries ignored. Expected format: 'remote_$ORDER_$REMOTENAME_$GROUPING or 'virtualfs_$ORDER_$FILESCHEME_$GROUPING.`)),!1)}getRemoteMenuActions(t){return(!this.remoteMenuActionsGroups||t)&&(this.remoteMenuActionsGroups=this.remoteIndicatorMenu.getActions().filter(e=>this.validatedGroup(e[0])).concat(this.legacyIndicatorMenu.getActions())),this.remoteMenuActionsGroups}updateRemoteStatusIndicator(){const t=this.environmentService.options?.windowIndicator;if(t){let e=t.label.trim();e.startsWith("$(")||(e=`$(remote) ${e}`),this.renderRemoteStatusIndicator(S(e,c.REMOTE_STATUS_LABEL_MAX_LENGTH),t.tooltip,t.command);return}if(this.remoteAuthority){const e=this.labelService.getHostLabel(D.vscodeRemote,this.remoteAuthority)||this.remoteAuthority;switch(this.connectionState){case"initializing":this.renderRemoteStatusIndicator(s.localize("host.open","Opening Remote..."),s.localize("host.open","Opening Remote..."),void 0,!0);break;case"reconnecting":this.renderRemoteStatusIndicator(`${s.localize("host.reconnecting","Reconnecting to {0}...",S(e,c.REMOTE_STATUS_LABEL_MAX_LENGTH))}`,void 0,void 0,!0);break;case"disconnected":this.renderRemoteStatusIndicator(`$(alert) ${s.localize("disconnectedFrom","Disconnected from {0}",S(e,c.REMOTE_STATUS_LABEL_MAX_LENGTH))}`);break;default:{const i=new M("",{isTrusted:!0,supportThemeIcons:!0}),n=this.labelService.getHostTooltip(D.vscodeRemote,this.remoteAuthority);n?i.appendMarkdown(n):i.appendText(s.localize({key:"host.tooltip",comment:["{0} is a remote host name, e.g. Dev Container"]},"Editing on {0}",e)),this.renderRemoteStatusIndicator(`$(remote) ${S(e,c.REMOTE_STATUS_LABEL_MAX_LENGTH)}`,i)}}return}if(this.virtualWorkspaceLocation){const e=this.labelService.getHostLabel(this.virtualWorkspaceLocation.scheme,this.virtualWorkspaceLocation.authority);if(e){const i=new M("",{isTrusted:!0,supportThemeIcons:!0}),n=this.labelService.getHostTooltip(this.virtualWorkspaceLocation.scheme,this.virtualWorkspaceLocation.authority);n?i.appendMarkdown(n):i.appendText(s.localize({key:"workspace.tooltip",comment:["{0} is a remote workspace name, e.g. GitHub"]},"Editing on {0}",e)),(!b||this.remoteAuthority)&&(i.appendMarkdown(`

`),i.appendMarkdown(s.localize({key:"workspace.tooltip2",comment:["[features are not available]({1}) is a link. Only translate `features are not available`. Do not change brackets and parentheses or {0}"]},"Some [features are not available]({0}) for resources located on a virtual file system.",`command:${be}`))),this.renderRemoteStatusIndicator(`$(remote) ${S(e,c.REMOTE_STATUS_LABEL_MAX_LENGTH)}`,i);return}}this.renderRemoteStatusIndicator("$(remote)",s.localize("noHost.tooltip","Open a Remote Window"))}renderRemoteStatusIndicator(t,e,i,n){const{text:o,tooltip:r,ariaLabel:a}=this.withNetworkStatus(t,e,n),m={name:s.localize("remoteHost","Remote Host"),kind:this.networkState==="offline"?"offline":"remote",ariaLabel:a,text:o,showProgress:n,tooltip:r,command:i??c.REMOTE_ACTIONS_COMMAND_ID};this.remoteStatusEntry?this.remoteStatusEntry.update(m):this.remoteStatusEntry=this.statusbarService.addEntry(m,"status.host",Oe.LEFT,Number.MAX_VALUE)}withNetworkStatus(t,e,i){let n=t,o=e,r=K(n);function a(){return!i&&t.startsWith("$(remote)")?t.replace("$(remote)","$(alert)"):t}switch(this.networkState){case"offline":{const m=s.localize("networkStatusOfflineTooltip","Network appears to be offline, certain features might be unavailable.");n=a(),o=this.appendTooltipLine(o,m),r=`${r}, ${m}`;break}case"high-latency":n=a(),o=this.appendTooltipLine(o,s.localize("networkStatusHighLatencyTooltip","Network appears to have high latency ({0}ms last, {1}ms average), certain features may be slow to respond.",y.latency?.current?.toFixed(2),y.latency?.average?.toFixed(2)));break}return{text:n,tooltip:o,ariaLabel:r}}appendTooltipLine(t,e){let i;return typeof t=="string"?i=new M(t,{isTrusted:!0,supportThemeIcons:!0}):i=t??new M("",{isTrusted:!0,supportThemeIcons:!0}),i.value.length>0&&i.appendMarkdown(`

`),i.appendMarkdown(e),i}async installExtension(t){const e=(await this.extensionGalleryService.getExtensions([{id:t}],$.None))[0];await this.extensionManagementService.installFromGallery(e,{isMachineScoped:!1,donotIncludePackAndDependencies:!1,context:{[ae]:!0}})}async runRemoteStartCommand(t,e){await z(async()=>{const i=await this.extensionService.getExtension(t);if(!i)throw Error("Failed to find installed remote extension");return i},300,10),this.commandService.executeCommand(e),this.telemetryService.publicLog2("workbenchActionExecuted",{id:"remoteInstallAndRun",detail:t,from:"remote indicator"})}showRemoteMenu(){const t=r=>{if(r.item.category)return typeof r.item.category=="string"?r.item.category:r.item.category.value},e=()=>{if(this.remoteAuthority)return new RegExp(`^remote_\\d\\d_${W(this.remoteAuthority)}_`);if(this.virtualWorkspaceLocation)return new RegExp(`^virtualfs_\\d\\d_${this.virtualWorkspaceLocation.scheme}_`)},i=()=>{let r=this.getRemoteMenuActions(!0);const a=[],m=e();m&&(r=r.sort((u,d)=>{const h=m.test(u[0]),v=m.test(d[0]);return h!==v?h?-1:1:u[0]!==""&&d[0]===""?-1:u[0]===""&&d[0]!==""?1:u[0].localeCompare(d[0])}));let p;for(const u of r){let d=!1;for(const h of u[1])if(h instanceof J){if(!d){const I=t(h);I!==p&&(a.push({type:"separator",label:I}),p=I),d=!0}const v=typeof h.item.title=="string"?h.item.title:h.item.title.value;a.push({type:"item",id:h.item.id,label:v})}}if(this.configurationService.getValue("workbench.remoteIndicator.showExtensionRecommendations")&&this.extensionGalleryService.isEnabled()&&this.remoteMetadataInitialized){const u=[];for(const d of this.remoteExtensionMetadata)if(!d.installed&&d.isPlatformCompatible){const h=d.startConnectLabel,v=[{iconClass:Q.asClassName(Ae),tooltip:s.localize("remote.startActions.help","Learn More")}];u.push({type:"item",id:d.id,label:h,buttons:v})}a.push({type:"separator",label:s.localize("remote.startActions.install","Install")}),a.push(...u)}a.push({type:"separator"});const R=a.length;return c.SHOW_CLOSE_REMOTE_COMMAND_ID&&(this.remoteAuthority?(a.push({type:"item",id:c.CLOSE_REMOTE_COMMAND_ID,label:s.localize("closeRemoteConnection.title","Close Remote Connection")}),this.connectionState==="disconnected"&&a.push({type:"item",id:ye.ID,label:s.localize("reloadWindow","Reload Window")})):this.virtualWorkspaceLocation&&a.push({type:"item",id:c.CLOSE_REMOTE_COMMAND_ID,label:s.localize("closeVirtualWorkspace.title","Close Remote Workspace")})),a.length===R&&a.pop(),a},n=new V,o=n.add(this.quickInputService.createQuickPick({useSeparators:!0}));o.placeholder=s.localize("remoteActions","Select an option to open a Remote Window"),o.items=i(),o.sortByLabel=!1,o.canSelectMany=!1,n.add(A.once(o.onDidAccept)(async r=>{const a=o.selectedItems;if(a.length===1){const m=a[0].id,p=this.remoteExtensionMetadata.find(k=>g.equals(k.id,m));p?(o.items=[],o.busy=!0,o.placeholder=s.localize("remote.startActions.installingExtension","Installing extension... "),await this.installExtension(p.id),o.hide(),await this.runRemoteStartCommand(p.id,p.startCommand)):(this.telemetryService.publicLog2("workbenchActionExecuted",{id:m,from:"remote indicator"}),this.commandService.executeCommand(m),o.hide())}})),n.add(A.once(o.onDidTriggerItemButton)(async r=>{const a=this.remoteExtensionMetadata.find(m=>g.equals(m.id,r.item.id));a&&await this.openerService.open(Y.parse(a.helpLink))})),n.add(this.legacyIndicatorMenu.onDidChange(()=>o.items=i())),n.add(this.remoteIndicatorMenu.onDidChange(()=>o.items=i())),n.add(o.onDidHide(()=>n.dispose())),this.remoteMetadataInitialized||(o.busy=!0,this._register(this.onDidChangeEntries(()=>{o.busy=!1,o.items=i()}))),o.show()}};c=T([l(0,Ne),l(1,_e),l(2,me),l(3,ne),l(4,j),l(5,pe),l(6,ee),l(7,we),l(8,Le),l(9,ve),l(10,Re),l(11,Ee),l(12,de),l(13,se),l(14,Se),l(15,ue),l(16,ce),l(17,he),l(18,te)],c),fe.as(ie.Configuration).registerConfiguration({...Ce,properties:{"workbench.remoteIndicator.showExtensionRecommendations":{type:"boolean",markdownDescription:s.localize("remote.showExtensionRecommendations","When enabled, remote extensions recommendations will be shown in the Remote Indicator menu."),default:!0}}});export{c as RemoteStatusIndicator};