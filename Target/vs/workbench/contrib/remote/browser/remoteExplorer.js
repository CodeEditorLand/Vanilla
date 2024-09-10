var ne=Object.defineProperty;var se=Object.getOwnPropertyDescriptor;var F=(u,l,e,t)=>{for(var r=t>1?void 0:t?se(l,e):l,i=u.length-1,o;i>=0;i--)(o=u[i])&&(r=(t?o(l,e,r):o(r))||r);return t&&r&&ne(l,e,r),r},n=(u,l)=>(e,t)=>l(e,t,u);import*as c from"../../../../nls.js";import{Disposable as w,MutableDisposable as z}from"../../../../base/common/lifecycle.js";import"../../../common/contributions.js";import{Extensions as E,ViewContainerLocation as ae}from"../../../common/views.js";import{IRemoteExplorerService as L,PORT_AUTO_FALLBACK_SETTING as x,PORT_AUTO_FORWARD_SETTING as g,PORT_AUTO_SOURCE_SETTING as h,PORT_AUTO_SOURCE_SETTING_HYBRID as V,PORT_AUTO_SOURCE_SETTING_OUTPUT as $,PORT_AUTO_SOURCE_SETTING_PROCESS as p,TUNNEL_VIEW_CONTAINER_ID as _,TUNNEL_VIEW_ID as A}from"../../../services/remote/common/remoteExplorerService.js";import{AutoTunnelSource as M,forwardedPortsViewEnabled as Y,makeAddress as S,mapHasAddressLocalhostOrAllInterfaces as y,OnPortForward as f,TunnelCloseReason as D,TunnelSource as G}from"../../../services/remote/common/tunnelModel.js";import{ForwardPortAction as j,OpenPortInBrowserAction as k,TunnelPanel as ce,TunnelPanelDescriptor as le,TunnelViewModel as de,OpenPortInPreviewAction as U,openPreviewEnabledContext as ue}from"./tunnelView.js";import{IContextKeyService as q}from"../../../../platform/contextkey/common/contextkey.js";import{IWorkbenchEnvironmentService as J}from"../../../services/environment/common/environmentService.js";import{Registry as P}from"../../../../platform/registry/common/platform.js";import{IStatusbarService as he,StatusbarAlignment as pe}from"../../../services/statusbar/browser/statusbar.js";import{UrlFinder as ve}from"./urlFinder.js";import B from"../../../../base/common/severity.js";import{ConfigurationTarget as Q}from"../../../../platform/configuration/common/configuration.js";import{INotificationService as Se}from"../../../../platform/notification/common/notification.js";import{IOpenerService as fe}from"../../../../platform/opener/common/opener.js";import{ITerminalService as me}from"../../terminal/browser/terminal.js";import{IDebugService as we}from"../../debug/common/debug.js";import{IRemoteAgentService as ge}from"../../../services/remote/common/remoteAgentService.js";import{isWeb as X,OperatingSystem as ye}from"../../../../base/common/platform.js";import{ITunnelService as Z,TunnelPrivacyId as ee}from"../../../../platform/tunnel/common/tunnel.js";import{SyncDescriptor as Pe}from"../../../../platform/instantiation/common/descriptors.js";import{ViewPaneContainer as Ie}from"../../../browser/parts/views/viewPaneContainer.js";import{IActivityService as be,NumberBadge as Fe}from"../../../services/activity/common/activity.js";import{portsViewIcon as Ee}from"./remoteIcons.js";import{Event as H}from"../../../../base/common/event.js";import{IExternalUriOpenerService as xe}from"../../externalUriOpener/common/externalUriOpenerService.js";import{IHostService as Ae}from"../../../services/host/browser/host.js";import{Extensions as Ce}from"../../../../platform/configuration/common/configurationRegistry.js";import{ILogService as te}from"../../../../platform/log/common/log.js";import{IWorkbenchConfigurationService as Te}from"../../../services/configuration/common/configuration.js";import"../../../../platform/remote/common/remoteAgentEnvironment.js";import{Action as re}from"../../../../base/common/actions.js";import{IPreferencesService as Re}from"../../../services/preferences/common/preferences.js";import{IStorageService as Oe,StorageScope as Ne}from"../../../../platform/storage/common/storage.js";const Ot="workbench.view.remote";let C=class extends w{constructor(e,t,r,i,o,a){super();this.contextKeyService=e;this.environmentService=t;this.remoteExplorerService=r;this.tunnelService=i;this.activityService=o;this.statusbarService=a;this._register(P.as(E.ViewsRegistry).registerViewWelcomeContent(A,{content:this.environmentService.remoteAuthority?c.localize("remoteNoPorts",`No forwarded ports. Forward a port to access your running services locally.
[Forward a Port]({0})`,`command:${j.INLINE_ID}`):c.localize("noRemoteNoPorts",`No forwarded ports. Forward a port to access your locally running services over the internet.
[Forward a Port]({0})`,`command:${j.INLINE_ID}`)})),this.enableBadgeAndStatusBar(),this.enableForwardedPortsView()}contextKeyListener=this._register(new z);activityBadge=this._register(new z);entryAccessor;async getViewContainer(){return P.as(E.ViewContainersRegistry).registerViewContainer({id:_,title:c.localize2("ports","Ports"),icon:Ee,ctorDescriptor:new Pe(Ie,[_,{mergeViewWithContainerWhenSingleView:!0}]),storageId:_,hideIfEmpty:!0,order:5},ae.Panel)}async enableForwardedPortsView(){if(this.contextKeyListener.clear(),!!Y.getValue(this.contextKeyService)){const t=await this.getViewContainer(),r=new le(new de(this.remoteExplorerService,this.tunnelService),this.environmentService),i=P.as(E.ViewsRegistry);t&&(this.remoteExplorerService.enablePortsFeatures(),i.registerViews([r],t))}else this.contextKeyListener.value=this.contextKeyService.onDidChangeContext(t=>{t.affectsSome(new Set(Y.keys()))&&this.enableForwardedPortsView()})}enableBadgeAndStatusBar(){const e=P.as(E.ViewsRegistry).onViewsRegistered(t=>{t.find(r=>r.views.find(i=>i.id===A))&&(this._register(H.debounce(this.remoteExplorerService.tunnelModel.onForwardPort,(r,i)=>i,50)(()=>{this.updateActivityBadge(),this.updateStatusBar()})),this._register(H.debounce(this.remoteExplorerService.tunnelModel.onClosePort,(r,i)=>i,50)(()=>{this.updateActivityBadge(),this.updateStatusBar()})),this.updateActivityBadge(),this.updateStatusBar(),e.dispose())})}async updateActivityBadge(){this.remoteExplorerService.tunnelModel.forwarded.size>0&&(this.activityBadge.value=this.activityService.showViewActivity(A,{badge:new Fe(this.remoteExplorerService.tunnelModel.forwarded.size,e=>e===1?c.localize("1forwardedPort","1 forwarded port"):c.localize("nForwardedPorts","{0} forwarded ports",e))}))}updateStatusBar(){this.entryAccessor?this.entryAccessor.update(this.entry):this._register(this.entryAccessor=this.statusbarService.addEntry(this.entry,"status.forwardedPorts",pe.LEFT,40))}get entry(){let e;const t=this.remoteExplorerService.tunnelModel.forwarded.size+this.remoteExplorerService.tunnelModel.detected.size,r=`${t}`;if(t===0)e=c.localize("remote.forwardedPorts.statusbarTextNone","No Ports Forwarded");else{const i=Array.from(this.remoteExplorerService.tunnelModel.forwarded.values());i.push(...Array.from(this.remoteExplorerService.tunnelModel.detected.values())),e=c.localize("remote.forwardedPorts.statusbarTooltip","Forwarded Ports: {0}",i.map(o=>o.remotePort).join(", "))}return{name:c.localize("status.forwardedPorts","Forwarded Ports"),text:`$(radio-tower) ${r}`,ariaLabel:e,tooltip:e,command:`${A}.focus`}}};C=F([n(0,q),n(1,J),n(2,L),n(3,Z),n(4,be),n(5,he)],C);let T=class{constructor(l,e){this.remoteExplorerService=l;this.logService=e;this.remoteExplorerService.tunnelModel.environmentTunnelsSet?this.restore():H.once(this.remoteExplorerService.tunnelModel.onEnvironmentTunnelsSet)(async()=>{await this.restore()})}async restore(){return this.logService.trace("ForwardedPorts: Doing first restore."),this.remoteExplorerService.restore()}};T=F([n(0,L),n(1,te)],T);let R=class extends w{constructor(e,t,r,i,o,a,s,d,I,m,b,N,v,Le,Ve){super();this.terminalService=e;this.notificationService=t;this.openerService=r;this.externalOpenerService=i;this.remoteExplorerService=o;this.contextKeyService=s;this.configurationService=d;this.debugService=I;this.tunnelService=b;this.hostService=N;this.logService=v;this.storageService=Le;this.preferencesService=Ve;a.remoteAuthority&&(d.whenRemoteConfigurationLoaded().then(()=>m.getEnvironment()).then(W=>{this.setup(W),this._register(d.onDidChangeConfiguration(K=>{K.affectsConfiguration(h)?this.setup(W):K.affectsConfiguration(x)&&!this.portListener&&this.listenForPorts()}))}),this.storageService.getBoolean("processPortForwardingFallback",Ne.WORKSPACE,!0)||this.configurationService.updateValue(x,0,Q.WORKSPACE))}procForwarder;outputForwarder;portListener;getPortAutoFallbackNumber(){const e=this.configurationService.inspect(x);if(e.value!==void 0&&(e.value===0||e.value!==e.defaultValue))return e.value;const t=this.configurationService.inspect(h);return t.applicationValue===p||t.userValue===p||t.userLocalValue===p||t.userRemoteValue===p||t.workspaceFolderValue===p||t.workspaceValue===p?0:e.value??20}listenForPorts(){let e=this.getPortAutoFallbackNumber();if(e===0){this.portListener?.dispose();return}this.procForwarder&&!this.portListener&&this.configurationService.getValue(h)===p?this.portListener=this._register(this.remoteExplorerService.tunnelModel.onForwardPort(async()=>{if(e=this.getPortAutoFallbackNumber(),e===0){this.portListener?.dispose();return}Array.from(this.remoteExplorerService.tunnelModel.forwarded.values()).filter(t=>t.source.source===G.Auto).length>e&&(await this.configurationService.updateValue(h,V),this.notificationService.notify({message:c.localize("remote.autoForwardPortsSource.fallback","Over 20 ports have been automatically forwarded. The `process` based automatic port forwarding has been switched to `hybrid` in settings. Some ports may no longer be detected."),severity:B.Warning,actions:{primary:[new re("switchBack",c.localize("remote.autoForwardPortsSource.fallback.switchBack","Undo"),void 0,!0,async()=>{await this.configurationService.updateValue(h,p),await this.configurationService.updateValue(x,0,Q.WORKSPACE),this.portListener?.dispose(),this.portListener=void 0}),new re("showPortSourceSetting",c.localize("remote.autoForwardPortsSource.fallback.showPortSourceSetting","Show Setting"),void 0,!0,async()=>{await this.preferencesService.openSettings({query:"remote.autoForwardPortsSource"})})]}}))})):(this.portListener?.dispose(),this.portListener=void 0)}setup(e){const t=this.procForwarder?.forwarded,r=this.outputForwarder||this.procForwarder;if(this.procForwarder?.dispose(),this.procForwarder=void 0,this.outputForwarder?.dispose(),this.outputForwarder=void 0,e?.os!==ye.Linux)this.configurationService.inspect(h).default?.value!==$&&P.as(Ce.Configuration).registerDefaultConfigurations([{overrides:{"remote.autoForwardPortsSource":$}}]),this.outputForwarder=this._register(new ie(this.terminalService,this.notificationService,this.openerService,this.externalOpenerService,this.remoteExplorerService,this.configurationService,this.debugService,this.tunnelService,this.hostService,this.logService,this.contextKeyService,()=>!1));else{const i=()=>this.configurationService.getValue(h)===p;i()?this.procForwarder=this._register(new oe(!1,t,!r,this.configurationService,this.remoteExplorerService,this.notificationService,this.openerService,this.externalOpenerService,this.tunnelService,this.hostService,this.logService,this.contextKeyService)):this.configurationService.getValue(h)===V&&(this.procForwarder=this._register(new oe(!0,t,!r,this.configurationService,this.remoteExplorerService,this.notificationService,this.openerService,this.externalOpenerService,this.tunnelService,this.hostService,this.logService,this.contextKeyService))),this.outputForwarder=this._register(new ie(this.terminalService,this.notificationService,this.openerService,this.externalOpenerService,this.remoteExplorerService,this.configurationService,this.debugService,this.tunnelService,this.hostService,this.logService,this.contextKeyService,i))}this.listenForPorts()}};R=F([n(0,me),n(1,Se),n(2,fe),n(3,xe),n(4,L),n(5,J),n(6,q),n(7,Te),n(8,we),n(9,ge),n(10,Z),n(11,Ae),n(12,te),n(13,Oe),n(14,Re)],R);class O extends w{constructor(e,t,r,i,o,a,s,d){super();this.notificationService=e;this.remoteExplorerService=t;this.openerService=r;this.externalOpenerService=i;this.tunnelService=o;this.hostService=a;this.logService=s;this.contextKeyService=d;this.lastNotifyTime=new Date,this.lastNotifyTime.setFullYear(this.lastNotifyTime.getFullYear()-1)}lastNotifyTime;static NOTIFY_COOL_DOWN=5e3;lastNotification;lastShownPort;doActionTunnels;alreadyOpenedOnce=new Set;async doAction(e){this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Starting action for ${e[0]?.tunnelRemotePort}`),this.doActionTunnels=e;const t=await this.portNumberHeuristicDelay();if(this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose ${t?.tunnelRemotePort}`),t){const i=(await this.remoteExplorerService.tunnelModel.getAttributes([{port:t.tunnelRemotePort,host:t.tunnelRemoteHost}]))?.get(t.tunnelRemotePort)?.onAutoForward;switch(this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) onAutoForward action is ${i}`),i){case f.OpenBrowserOnce:{if(this.alreadyOpenedOnce.has(t.localAddress))break;this.alreadyOpenedOnce.add(t.localAddress)}case f.OpenBrowser:{const o=S(t.tunnelRemoteHost,t.tunnelRemotePort);await k.run(this.remoteExplorerService.tunnelModel,this.openerService,o);break}case f.OpenPreview:{const o=S(t.tunnelRemoteHost,t.tunnelRemotePort);await U.run(this.remoteExplorerService.tunnelModel,this.openerService,this.externalOpenerService,o);break}case f.Silent:break;default:{const o=new Date().getTime()-this.lastNotifyTime.getTime();this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) time elapsed since last notification ${o} ms`),o>O.NOTIFY_COOL_DOWN&&await this.showNotification(t)}}}}hide(e){this.doActionTunnels&&(this.doActionTunnels=this.doActionTunnels.filter(t=>!e.includes(t.tunnelRemotePort))),this.lastShownPort&&e.indexOf(this.lastShownPort)>=0&&this.lastNotification?.close()}newerTunnel;async portNumberHeuristicDelay(){if(this.logService.trace("ForwardedPorts: (OnAutoForwardedAction) Starting heuristic delay"),!this.doActionTunnels||this.doActionTunnels.length===0)return;this.doActionTunnels=this.doActionTunnels.sort((t,r)=>t.tunnelRemotePort-r.tunnelRemotePort);const e=this.doActionTunnels.shift();return e.tunnelRemotePort%1e3===0?(this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose tunnel because % 1000: ${e.tunnelRemotePort}`),this.newerTunnel=e,e):e.tunnelRemotePort<1e4&&e.tunnelRemotePort!==9229?(this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose tunnel because < 10000: ${e.tunnelRemotePort}`),this.newerTunnel=e,e):(this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Waiting for "better" tunnel than ${e.tunnelRemotePort}`),this.newerTunnel=void 0,new Promise(t=>{setTimeout(()=>{this.newerTunnel?t(void 0):this.doActionTunnels?.includes(e)?t(e):t(void 0)},3e3)}))}async basicMessage(e){const r=(await this.remoteExplorerService.tunnelModel.getAttributes([{host:e.tunnelRemoteHost,port:e.tunnelRemotePort}],!1))?.get(e.tunnelRemotePort)?.label;return c.localize("remote.tunnelsView.automaticForward","Your application{0} running on port {1} is available.  ",r?` (${r})`:"",e.tunnelRemotePort)}linkMessage(){return c.localize({key:"remote.tunnelsView.notificationLink2",comment:["[See all forwarded ports]({0}) is a link. Only translate `See all forwarded ports`. Do not change brackets and parentheses or {0}"]},"[See all forwarded ports]({0})",`command:${ce.ID}.focus`)}async showNotification(e){if(!await this.hostService.hadLastFocus())return;this.lastNotification?.close();let t=await this.basicMessage(e);const r=[this.openBrowserChoice(e)];(!X||ue.getValue(this.contextKeyService))&&r.push(this.openPreviewChoice(e)),e.tunnelLocalPort!==e.tunnelRemotePort&&this.tunnelService.canElevate&&this.tunnelService.isPortPrivileged(e.tunnelRemotePort)&&(t+=c.localize("remote.tunnelsView.elevationMessage","You'll need to run as superuser to use port {0} locally.  ",e.tunnelRemotePort),r.unshift(this.elevateChoice(e))),e.privacy===ee.Private&&X&&this.tunnelService.canChangePrivacy&&r.push(this.makePublicChoice(e)),t+=this.linkMessage(),this.lastNotification=this.notificationService.prompt(B.Info,t,r,{neverShowAgain:{id:"remote.tunnelsView.autoForwardNeverShow",isSecondary:!0}}),this.lastShownPort=e.tunnelRemotePort,this.lastNotifyTime=new Date,this.lastNotification.onDidClose(()=>{this.lastNotification=void 0,this.lastShownPort=void 0})}makePublicChoice(e){return{label:c.localize("remote.tunnelsView.makePublic","Make Public"),run:async()=>{const t=y(this.remoteExplorerService.tunnelModel.forwarded,e.tunnelRemoteHost,e.tunnelRemotePort);return await this.remoteExplorerService.close({host:e.tunnelRemoteHost,port:e.tunnelRemotePort},D.Other),this.remoteExplorerService.forward({remote:{host:e.tunnelRemoteHost,port:e.tunnelRemotePort},local:e.tunnelLocalPort,name:t?.name,elevateIfNeeded:!0,privacy:ee.Public,source:t?.source})}}}openBrowserChoice(e){const t=S(e.tunnelRemoteHost,e.tunnelRemotePort);return{label:k.LABEL,run:()=>k.run(this.remoteExplorerService.tunnelModel,this.openerService,t)}}openPreviewChoice(e){const t=S(e.tunnelRemoteHost,e.tunnelRemotePort);return{label:U.LABEL,run:()=>U.run(this.remoteExplorerService.tunnelModel,this.openerService,this.externalOpenerService,t)}}elevateChoice(e){return{label:c.localize("remote.tunnelsView.elevationButton","Use Port {0} as Sudo...",e.tunnelRemotePort),run:async()=>{await this.remoteExplorerService.close({host:e.tunnelRemoteHost,port:e.tunnelRemotePort},D.Other);const t=await this.remoteExplorerService.forward({remote:{host:e.tunnelRemoteHost,port:e.tunnelRemotePort},local:e.tunnelRemotePort,elevateIfNeeded:!0,source:M});!t||typeof t=="string"||(this.lastNotification?.close(),this.lastShownPort=t.tunnelRemotePort,this.lastNotification=this.notificationService.prompt(B.Info,await this.basicMessage(t)+this.linkMessage(),[this.openBrowserChoice(t),this.openPreviewChoice(e)],{neverShowAgain:{id:"remote.tunnelsView.autoForwardNeverShow",isSecondary:!0}}),this.lastNotification.onDidClose(()=>{this.lastNotification=void 0,this.lastShownPort=void 0}))}}}}class ie extends w{constructor(e,t,r,i,o,a,s,d,I,m,b,N){super();this.terminalService=e;this.notificationService=t;this.openerService=r;this.externalOpenerService=i;this.remoteExplorerService=o;this.configurationService=a;this.debugService=s;this.tunnelService=d;this.hostService=I;this.logService=m;this.contextKeyService=b;this.privilegedOnly=N;this.notifier=new O(t,o,r,i,d,I,m,b),this._register(a.onDidChangeConfiguration(v=>{v.affectsConfiguration(g)&&this.tryStartStopUrlFinder()})),this.portsFeatures=this._register(this.remoteExplorerService.onEnabledPortsFeatures(()=>{this.tryStartStopUrlFinder()})),this.tryStartStopUrlFinder(),a.getValue(h)===V&&this._register(this.tunnelService.onTunnelClosed(v=>this.notifier.hide([v.port])))}portsFeatures;urlFinder;notifier;tryStartStopUrlFinder(){this.configurationService.getValue(g)?this.startUrlFinder():this.stopUrlFinder()}startUrlFinder(){!this.urlFinder&&!this.remoteExplorerService.portsFeaturesEnabled||(this.portsFeatures?.dispose(),this.urlFinder=this._register(new ve(this.terminalService,this.debugService)),this._register(this.urlFinder.onDidMatchLocalUrl(async e=>{if(y(this.remoteExplorerService.tunnelModel.detected,e.host,e.port))return;const t=(await this.remoteExplorerService.tunnelModel.getAttributes([e]))?.get(e.port);if(t?.onAutoForward===f.Ignore||this.privilegedOnly()&&!this.tunnelService.isPortPrivileged(e.port))return;const r=await this.remoteExplorerService.forward({remote:e,source:M},t??null);r&&typeof r!="string"&&this.notifier.doAction([r])})))}stopUrlFinder(){this.urlFinder&&(this.urlFinder.dispose(),this.urlFinder=void 0)}}class oe extends w{constructor(e,t,r,i,o,a,s,d,I,m,b,N){super();this.unforwardOnly=e;this.alreadyAutoForwarded=t;this.needsInitialCandidates=r;this.configurationService=i;this.remoteExplorerService=o;this.notificationService=a;this.openerService=s;this.externalOpenerService=d;this.tunnelService=I;this.hostService=m;this.logService=b;this.contextKeyService=N;this.notifier=new O(a,o,s,d,I,m,b,N),t?.forEach(v=>this.autoForwarded.add(v)),this.initialize()}candidateListener;autoForwarded=new Set;notifiedOnly=new Set;notifier;initialCandidates=new Set;portsFeatures;get forwarded(){return this.autoForwarded}async initialize(){this.remoteExplorerService.tunnelModel.environmentTunnelsSet||await new Promise(e=>this.remoteExplorerService.tunnelModel.onEnvironmentTunnelsSet(()=>e())),this._register(this.configurationService.onDidChangeConfiguration(async e=>{e.affectsConfiguration(g)&&await this.startStopCandidateListener()})),this.portsFeatures=this._register(this.remoteExplorerService.onEnabledPortsFeatures(async()=>{await this.startStopCandidateListener()})),this.startStopCandidateListener()}async startStopCandidateListener(){this.configurationService.getValue(g)?await this.startCandidateListener():this.stopCandidateListener()}stopCandidateListener(){this.candidateListener&&(this.candidateListener.dispose(),this.candidateListener=void 0)}async startCandidateListener(){this.candidateListener||!this.remoteExplorerService.portsFeaturesEnabled||(this.portsFeatures?.dispose(),await this.setInitialCandidates(),this.configurationService.getValue(g)&&(this.candidateListener=this._register(this.remoteExplorerService.tunnelModel.onCandidatesChanged(this.handleCandidateUpdate,this))))}async setInitialCandidates(){if(!this.needsInitialCandidates){this.logService.debug("ForwardedPorts: (ProcForwarding) Not setting initial candidates");return}let e=this.remoteExplorerService.tunnelModel.candidatesOrUndefined;e||(await new Promise(t=>this.remoteExplorerService.tunnelModel.onCandidatesChanged(()=>t())),e=this.remoteExplorerService.tunnelModel.candidates);for(const t of e)this.initialCandidates.add(S(t.host,t.port));this.logService.debug(`ForwardedPorts: (ProcForwarding) Initial candidates set to ${e.map(t=>t.port).join(", ")}`)}async forwardCandidates(){let e;const t=[];this.logService.trace(`ForwardedPorts: (ProcForwarding) Attempting to forward ${this.remoteExplorerService.tunnelModel.candidates.length} candidates`);for(const r of this.remoteExplorerService.tunnelModel.candidates){if(!r.detail){this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${r.port} missing detail`);continue}e||(e=await this.remoteExplorerService.tunnelModel.getAttributes(this.remoteExplorerService.tunnelModel.candidates));const i=e?.get(r.port),o=S(r.host,r.port);if(this.initialCandidates.has(o)&&i?.onAutoForward===void 0||this.notifiedOnly.has(o)||this.autoForwarded.has(o))continue;const a=y(this.remoteExplorerService.tunnelModel.forwarded,r.host,r.port);if(y(this.remoteExplorerService.tunnelModel.detected,r.host,r.port))continue;if(i?.onAutoForward===f.Ignore){this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${r.port} is ignored`);continue}const s=await this.remoteExplorerService.forward({remote:r,source:M},i??null);!a&&s?(this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${r.port} has been forwarded`),this.autoForwarded.add(o)):s&&(this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${r.port} has been notified`),this.notifiedOnly.add(o)),s&&typeof s!="string"&&t.push(s)}if(this.logService.trace(`ForwardedPorts: (ProcForwarding) Forwarded ${t.length} candidates`),t.length!==0)return t}async handleCandidateUpdate(e){const t=[];let r;if(this.unforwardOnly){r=new Map;for(const o of this.remoteExplorerService.tunnelModel.forwarded.entries())o[1].source.source===G.Auto&&r.set(o[0],o[1])}else r=new Map(this.autoForwarded.entries());for(const o of e){const a=o[0];let s=o[1];const d=y(r,s.host,s.port);d?(typeof d=="string"?this.autoForwarded.delete(a):s={host:d.remoteHost,port:d.remotePort},await this.remoteExplorerService.close(s,D.AutoForwardEnd),t.push(s.port)):this.notifiedOnly.has(a)?(this.notifiedOnly.delete(a),t.push(s.port)):this.initialCandidates.has(a)&&this.initialCandidates.delete(a)}if(this.unforwardOnly)return;t.length>0&&await this.notifier.hide(t);const i=await this.forwardCandidates();i&&await this.notifier.doAction(i)}}export{R as AutomaticPortForwarding,C as ForwardedPortsView,T as PortRestore,Ot as VIEWLET_ID};
