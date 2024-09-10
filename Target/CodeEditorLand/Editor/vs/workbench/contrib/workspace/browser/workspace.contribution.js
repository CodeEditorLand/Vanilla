var ce=Object.defineProperty;var ue=Object.getOwnPropertyDescriptor;var f=(d,u,t,r)=>{for(var s=r>1?void 0:r?ue(u,t):u,i=d.length-1,a;i>=0;i--)(a=d[i])&&(s=(r?a(u,t,s):a(s))||s);return r&&s&&ce(u,t,s),s},o=(d,u)=>(t,r)=>u(t,r,d);import"./media/workspaceTrustEditor.css";import{SyncDescriptor as de}from"../../../../platform/instantiation/common/descriptors.js";import{Disposable as I,MutableDisposable as pe}from"../../../../base/common/lifecycle.js";import{localize as e,localize2 as F}from"../../../../nls.js";import{Action2 as Y,registerAction2 as $}from"../../../../platform/actions/common/actions.js";import{ConfigurationScope as g,Extensions as le}from"../../../../platform/configuration/common/configurationRegistry.js";import{IDialogService as z}from"../../../../platform/dialogs/common/dialogs.js";import{IInstantiationService as me}from"../../../../platform/instantiation/common/instantiation.js";import{Severity as y}from"../../../../platform/notification/common/notification.js";import{Registry as h}from"../../../../platform/registry/common/platform.js";import{IWorkspaceTrustEnablementService as P,IWorkspaceTrustManagementService as W,IWorkspaceTrustRequestService as V,WorkspaceTrustUriResponse as O}from"../../../../platform/workspace/common/workspaceTrust.js";import{Extensions as x,WorkbenchPhase as he,registerWorkbenchContribution2 as ke}from"../../../common/contributions.js";import{LifecyclePhase as L}from"../../../services/lifecycle/common/lifecycle.js";import{Codicon as E}from"../../../../base/common/codicons.js";import{IEditorService as Se}from"../../../services/editor/common/editorService.js";import{ContextKeyExpr as C,IContextKeyService as fe}from"../../../../platform/contextkey/common/contextkey.js";import{ICommandService as ge}from"../../../../platform/commands/common/commands.js";import{IStatusbarService as we,StatusbarAlignment as ve}from"../../../services/statusbar/browser/statusbar.js";import{EditorPaneDescriptor as be}from"../../../browser/editor.js";import{shieldIcon as Te,WorkspaceTrustEditor as j}from"./workspaceTrustEditor.js";import{WorkspaceTrustEditorInput as R}from"../../../services/workspaces/browser/workspaceTrustEditorInput.js";import{WORKSPACE_TRUST_BANNER as H,WORKSPACE_TRUST_EMPTY_WINDOW as J,WORKSPACE_TRUST_ENABLED as _,WORKSPACE_TRUST_STARTUP_PROMPT as Q,WORKSPACE_TRUST_UNTRUSTED_FILES as Z}from"../../../services/workspaces/common/workspaceTrust.js";import{EditorExtensions as X}from"../../../common/editor.js";import{ITelemetryService as Ie}from"../../../../platform/telemetry/common/telemetry.js";import{isEmptyWorkspaceIdentifier as ye,isSingleFolderWorkspaceIdentifier as B,IWorkspaceContextService as q,toWorkspaceIdentifier as N,WorkbenchState as p}from"../../../../platform/workspace/common/workspace.js";import{dirname as ee,resolve as We}from"../../../../base/common/path.js";import{IConfigurationService as Ee}from"../../../../platform/configuration/common/configuration.js";import{MarkdownString as M}from"../../../../base/common/htmlContent.js";import{IStorageService as Ce,StorageScope as D,StorageTarget as te}from"../../../../platform/storage/common/storage.js";import{IHostService as Re}from"../../../services/host/browser/host.js";import{IBannerService as Me}from"../../../services/banner/browser/bannerService.js";import{isVirtualWorkspace as De}from"../../../../platform/workspace/common/virtualWorkspace.js";import{LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID as U}from"../../extensions/common/extensions.js";import{IWorkbenchEnvironmentService as Ae}from"../../../services/environment/common/environmentService.js";import{WORKSPACE_TRUST_SETTING_TAG as k}from"../../preferences/common/preferences.js";import{IPreferencesService as Fe}from"../../../services/preferences/common/preferences.js";import{ILabelService as Pe,Verbosity as Oe}from"../../../../platform/label/common/label.js";import{IProductService as xe}from"../../../../platform/product/common/productService.js";import{MANAGE_TRUST_COMMAND_ID as m,WorkspaceTrustContext as A}from"../common/workspace.js";import{isWeb as Le}from"../../../../base/common/platform.js";import{IRemoteAgentService as _e}from"../../../services/remote/common/remoteAgentService.js";import{securityConfigurationNodeBase as Be}from"../../../common/configuration.js";import{basename as qe,dirname as Ne}from"../../../../base/common/resources.js";import{URI as Ue}from"../../../../base/common/uri.js";import{IEnvironmentService as Ke}from"../../../../platform/environment/common/environment.js";import{IFileService as Ge}from"../../../../platform/files/common/files.js";const re="workbench.banner.restrictedMode",se="workspace.trust.startupPrompt.shown",oe="workbench.banner.restrictedMode.dismissed";let w=class extends I{_ctxWorkspaceTrustEnabled;_ctxWorkspaceTrustState;constructor(u,t,r){super(),this._ctxWorkspaceTrustEnabled=A.IsEnabled.bindTo(u),this._ctxWorkspaceTrustEnabled.set(t.isWorkspaceTrustEnabled()),this._ctxWorkspaceTrustState=A.IsTrusted.bindTo(u),this._ctxWorkspaceTrustState.set(r.isWorkspaceTrusted()),this._register(r.onDidChangeTrust(s=>this._ctxWorkspaceTrustState.set(s)))}};w=f([o(0,fe),o(1,P),o(2,W)],w),h.as(x.Workbench).registerWorkbenchContribution(w,L.Restored);let S=class extends I{constructor(t,r,s,i,a){super();this.dialogService=t;this.commandService=r;this.workspaceContextService=s;this.workspaceTrustManagementService=i;this.workspaceTrustRequestService=a;this.registerListeners()}static ID="workbench.contrib.workspaceTrustRequestHandler";get useWorkspaceLanguage(){return!B(N(this.workspaceContextService.getWorkspace()))}registerListeners(){this._register(this.workspaceTrustRequestService.onDidInitiateOpenFilesTrustRequest(async()=>{await this.workspaceTrustManagementService.workspaceResolved;const t=[this.workspaceContextService.getWorkbenchState()!==p.EMPTY?e("openLooseFileWorkspaceDetails","You are trying to open untrusted files in a workspace which is trusted."):e("openLooseFileWindowDetails","You are trying to open untrusted files in a window which is trusted."),e("openLooseFileLearnMore","If you don't want to open untrusted files, we recommend to open them in Restricted Mode in a new window as the files may be malicious. See [our docs](https://aka.ms/vscode-workspace-trust) to learn more.")];await this.dialogService.prompt({type:y.Info,message:this.workspaceContextService.getWorkbenchState()!==p.EMPTY?e("openLooseFileWorkspaceMesssage","Do you want to allow untrusted files in this workspace?"):e("openLooseFileWindowMesssage","Do you want to allow untrusted files in this window?"),buttons:[{label:e({key:"open",comment:["&& denotes a mnemonic"]},"&&Open"),run:({checkboxChecked:r})=>this.workspaceTrustRequestService.completeOpenFilesTrustRequest(O.Open,!!r)},{label:e({key:"newWindow",comment:["&& denotes a mnemonic"]},"Open in &&Restricted Mode"),run:({checkboxChecked:r})=>this.workspaceTrustRequestService.completeOpenFilesTrustRequest(O.OpenInNewWindow,!!r)}],cancelButton:{run:()=>this.workspaceTrustRequestService.completeOpenFilesTrustRequest(O.Cancel)},checkbox:{label:e("openLooseFileWorkspaceCheckbox","Remember my decision for all workspaces"),checked:!1},custom:{icon:E.shield,markdownDetails:t.map(r=>({markdown:new M(r)}))}})})),this._register(this.workspaceTrustRequestService.onDidInitiateWorkspaceTrustRequest(async t=>{await this.workspaceTrustManagementService.workspaceResolved;const r=this.useWorkspaceLanguage?e("workspaceTrust","Do you trust the authors of the files in this workspace?"):e("folderTrust","Do you trust the authors of the files in this folder?"),s=e("immediateTrustRequestMessage","A feature you are trying to use may be a security risk if you do not trust the source of the files or folders you currently have open."),i=t?.message??s,a=t?.buttons??[{label:this.useWorkspaceLanguage?e({key:"grantWorkspaceTrustButton",comment:["&& denotes a mnemonic"]},"&&Trust Workspace & Continue"):e({key:"grantFolderTrustButton",comment:["&& denotes a mnemonic"]},"&&Trust Folder & Continue"),type:"ContinueWithTrust"},{label:e({key:"manageWorkspaceTrustButton",comment:["&& denotes a mnemonic"]},"&&Manage"),type:"Manage"}];a.some(c=>c.type==="Cancel")||a.push({label:e("cancelWorkspaceTrustButton","Cancel"),type:"Cancel"});const{result:n}=await this.dialogService.prompt({type:y.Info,message:r,custom:{icon:E.shield,markdownDetails:[{markdown:new M(i)},{markdown:new M(e("immediateTrustRequestLearnMore","If you don't trust the authors of these files, we do not recommend continuing as the files may be malicious. See [our docs](https://aka.ms/vscode-workspace-trust) to learn more."))}]},buttons:a.filter(c=>c.type!=="Cancel").map(c=>({label:c.label,run:()=>c.type})),cancelButton:(()=>{const c=a.find(l=>l.type==="Cancel");if(c)return{label:c.label,run:()=>c.type}})()});switch(n){case"ContinueWithTrust":await this.workspaceTrustRequestService.completeWorkspaceTrustRequest(!0);break;case"ContinueWithoutTrust":await this.workspaceTrustRequestService.completeWorkspaceTrustRequest(void 0);break;case"Manage":this.workspaceTrustRequestService.cancelWorkspaceTrustRequest(),await this.commandService.executeCommand(m);break;case"Cancel":this.workspaceTrustRequestService.cancelWorkspaceTrustRequest();break}}))}};S=f([o(0,z),o(1,ge),o(2,q),o(3,W),o(4,V)],S);let v=class extends I{constructor(t,r,s,i,a,n,c,l,T,K,G,ze,Ve,je,He){super();this.dialogService=t;this.workspaceContextService=r;this.workspaceTrustEnablementService=s;this.workspaceTrustManagementService=i;this.configurationService=a;this.statusbarService=n;this.storageService=c;this.workspaceTrustRequestService=l;this.bannerService=T;this.labelService=K;this.hostService=G;this.productService=ze;this.remoteAgentService=Ve;this.environmentService=je;this.fileService=He;this.statusbarEntryAccessor=this._register(new pe),(async()=>{if(await this.workspaceTrustManagementService.workspaceTrustInitialized,this.workspaceTrustEnablementService.isWorkspaceTrustEnabled())if(this.registerListeners(),this.updateStatusbarEntry(this.workspaceTrustManagementService.isWorkspaceTrusted()),this.hostService.hasFocus)this.showModalOnStart();else{const ie=this.hostService.onDidChangeFocus(ne=>{ne&&(ie.dispose(),this.showModalOnStart())})}})()}entryId="status.workspaceTrust";statusbarEntryAccessor;registerListeners(){this._register(this.workspaceContextService.onWillChangeWorkspaceFolders(t=>{if(t.fromCache||!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled())return;const r=async s=>{if(this.workspaceTrustManagementService.isWorkspaceTrusted()&&(s.changes.added.length||s.changes.changed.length)){const a=await Promise.all(s.changes.added.map(n=>this.workspaceTrustManagementService.getUriTrustInfo(n.uri)));if(!a.map(n=>n.trusted).every(n=>n)){const{confirmed:n}=await this.dialogService.confirm({type:y.Info,message:e("addWorkspaceFolderMessage","Do you trust the authors of the files in this folder?"),detail:e("addWorkspaceFolderDetail","You are adding files that are not currently trusted to a trusted workspace. Do you trust the authors of these new files?"),cancelButton:e("no","No"),custom:{icon:E.shield}});await this.workspaceTrustManagementService.setUrisTrust(a.map(c=>c.uri),n)}}};return t.join(r(t))})),this._register(this.workspaceTrustManagementService.onDidChangeTrust(t=>{this.updateWorkbenchIndicators(t)})),this._register(this.workspaceTrustRequestService.onDidInitiateWorkspaceTrustRequestOnStartup(async()=>{let t,r,s,i;const a=await this.isAiGeneratedWorkspace();a&&this.productService.aiGeneratedWorkspaceTrust?(t=this.productService.aiGeneratedWorkspaceTrust.title,r=this.productService.aiGeneratedWorkspaceTrust.startupTrustRequestLearnMore,s=this.productService.aiGeneratedWorkspaceTrust.trustOption,i=this.productService.aiGeneratedWorkspaceTrust.dontTrustOption):console.warn("AI generated workspace trust dialog contents not available.");const n=t??(this.useWorkspaceLanguage?e("workspaceTrust","Do you trust the authors of the files in this workspace?"):e("folderTrust","Do you trust the authors of the files in this folder?"));let c;const l=N(this.workspaceContextService.getWorkspace()),T=B(l),K=ye(l);if(!a&&this.workspaceTrustManagementService.canSetParentFolderTrust()){const G=qe(Ne(l.uri));c=e("checkboxString","Trust the authors of all files in the parent folder '{0}'",G)}this.doShowModal(n,{label:s??e({key:"trustOption",comment:["&& denotes a mnemonic"]},"&&Yes, I trust the authors"),sublabel:T?e("trustFolderOptionDescription","Trust folder and enable all features"):e("trustWorkspaceOptionDescription","Trust workspace and enable all features")},{label:i??e({key:"dontTrustOption",comment:["&& denotes a mnemonic"]},"&&No, I don't trust the authors"),sublabel:T?e("dontTrustFolderOptionDescription","Browse folder in restricted mode"):e("dontTrustWorkspaceOptionDescription","Browse workspace in restricted mode")},[T?e("folderStartupTrustDetails","{0} provides features that may automatically execute files in this folder.",this.productService.nameShort):e("workspaceStartupTrustDetails","{0} provides features that may automatically execute files in this workspace.",this.productService.nameShort),r??e("startupTrustRequestLearnMore","If you don't trust the authors of these files, we recommend to continue in restricted mode as the files may be malicious. See [our docs](https://aka.ms/vscode-workspace-trust) to learn more."),K?"":`\`${this.labelService.getWorkspaceLabel(l,{verbose:Oe.LONG})}\``],c)}))}updateWorkbenchIndicators(t){const r=this.getBannerItem(!t);this.updateStatusbarEntry(t),r&&(t?this.bannerService.hide(re):this.bannerService.show(r))}async doShowModal(t,r,s,i,a){await this.dialogService.prompt({type:y.Info,message:t,checkbox:a?{label:a}:void 0,buttons:[{label:r.label,run:async({checkboxChecked:n})=>{n?await this.workspaceTrustManagementService.setParentFolderTrust(!0):await this.workspaceTrustRequestService.completeWorkspaceTrustRequest(!0)}},{label:s.label,run:()=>{this.updateWorkbenchIndicators(!1),this.workspaceTrustRequestService.cancelWorkspaceTrustRequest()}}],custom:{buttonDetails:[r.sublabel,s.sublabel],disableCloseAction:!0,icon:E.shield,markdownDetails:i.map(n=>({markdown:new M(n)}))}}),this.storageService.store(se,!0,D.WORKSPACE,te.MACHINE)}async showModalOnStart(){if(this.workspaceTrustManagementService.isWorkspaceTrusted()){this.updateWorkbenchIndicators(!0);return}if(this.workspaceTrustManagementService.canSetWorkspaceTrust()){if(De(this.workspaceContextService.getWorkspace())){this.updateWorkbenchIndicators(!1);return}if(this.workspaceContextService.getWorkbenchState()===p.EMPTY){this.updateWorkbenchIndicators(!1);return}if(this.startupPromptSetting==="never"){this.updateWorkbenchIndicators(!1);return}if(this.startupPromptSetting==="once"&&this.storageService.getBoolean(se,D.WORKSPACE,!1)){this.updateWorkbenchIndicators(!1);return}this.workspaceTrustRequestService.requestWorkspaceTrustOnStartup()}}get startupPromptSetting(){return this.configurationService.getValue(Q)}get useWorkspaceLanguage(){return!B(N(this.workspaceContextService.getWorkspace()))}async isAiGeneratedWorkspace(){const t=Ue.joinPath(this.environmentService.workspaceStorageHome,"aiGeneratedWorkspaces.json");return await this.fileService.exists(t).then(async r=>{if(r)try{const s=await this.fileService.readFile(t);if(JSON.parse(s.value.toString()).indexOf(this.workspaceContextService.getWorkspace().folders[0].uri.toString())>-1)return!0}catch{}return!1})}getBannerItem(t){const r=this.storageService.getBoolean(oe,D.WORKSPACE,!1);if(this.bannerSetting==="never"||this.bannerSetting==="untilDismissed"&&r)return;const s=[{label:e("restrictedModeBannerManage","Manage"),href:"command:"+m},{label:e("restrictedModeBannerLearnMore","Learn More"),href:"https://aka.ms/vscode-workspace-trust"}];return{id:re,icon:Te,ariaLabel:this.getBannerItemAriaLabels(),message:this.getBannerItemMessages(),actions:s,onClose:()=>{t&&this.storageService.store(oe,!0,D.WORKSPACE,te.MACHINE)}}}getBannerItemAriaLabels(){switch(this.workspaceContextService.getWorkbenchState()){case p.EMPTY:return e("restrictedModeBannerAriaLabelWindow","Restricted Mode is intended for safe code browsing. Trust this window to enable all features. Use navigation keys to access banner actions.");case p.FOLDER:return e("restrictedModeBannerAriaLabelFolder","Restricted Mode is intended for safe code browsing. Trust this folder to enable all features. Use navigation keys to access banner actions.");case p.WORKSPACE:return e("restrictedModeBannerAriaLabelWorkspace","Restricted Mode is intended for safe code browsing. Trust this workspace to enable all features. Use navigation keys to access banner actions.")}}getBannerItemMessages(){switch(this.workspaceContextService.getWorkbenchState()){case p.EMPTY:return e("restrictedModeBannerMessageWindow","Restricted Mode is intended for safe code browsing. Trust this window to enable all features.");case p.FOLDER:return e("restrictedModeBannerMessageFolder","Restricted Mode is intended for safe code browsing. Trust this folder to enable all features.");case p.WORKSPACE:return e("restrictedModeBannerMessageWorkspace","Restricted Mode is intended for safe code browsing. Trust this workspace to enable all features.")}}get bannerSetting(){const t=this.configurationService.getValue(H);return t!=="always"&&Le&&!this.remoteAgentService.getConnection()?.remoteAuthority?"never":t}getRestrictedModeStatusbarEntry(){let t="",r;switch(this.workspaceContextService.getWorkbenchState()){case p.EMPTY:{t=e("status.ariaUntrustedWindow","Restricted Mode: Some features are disabled because this window is not trusted."),r={value:e({key:"status.tooltipUntrustedWindow2",comment:["[abc]({n}) are links.  Only translate `features are disabled` and `window is not trusted`. Do not change brackets and parentheses or {n}"]},`Running in Restricted Mode

Some [features are disabled]({0}) because this [window is not trusted]({1}).`,`command:${U}`,`command:${m}`),isTrusted:!0,supportThemeIcons:!0};break}case p.FOLDER:{t=e("status.ariaUntrustedFolder","Restricted Mode: Some features are disabled because this folder is not trusted."),r={value:e({key:"status.tooltipUntrustedFolder2",comment:["[abc]({n}) are links.  Only translate `features are disabled` and `folder is not trusted`. Do not change brackets and parentheses or {n}"]},`Running in Restricted Mode

Some [features are disabled]({0}) because this [folder is not trusted]({1}).`,`command:${U}`,`command:${m}`),isTrusted:!0,supportThemeIcons:!0};break}case p.WORKSPACE:{t=e("status.ariaUntrustedWorkspace","Restricted Mode: Some features are disabled because this workspace is not trusted."),r={value:e({key:"status.tooltipUntrustedWorkspace2",comment:["[abc]({n}) are links. Only translate `features are disabled` and `workspace is not trusted`. Do not change brackets and parentheses or {n}"]},`Running in Restricted Mode

Some [features are disabled]({0}) because this [workspace is not trusted]({1}).`,`command:${U}`,`command:${m}`),isTrusted:!0,supportThemeIcons:!0};break}}return{name:e("status.WorkspaceTrust","Workspace Trust"),text:`$(shield) ${e("untrusted","Restricted Mode")}`,ariaLabel:t,tooltip:r,command:m,kind:"prominent"}}updateStatusbarEntry(t){if(t&&this.statusbarEntryAccessor.value){this.statusbarEntryAccessor.clear();return}if(!t&&!this.statusbarEntryAccessor.value){const r=this.getRestrictedModeStatusbarEntry();this.statusbarEntryAccessor.value=this.statusbarService.addEntry(r,this.entryId,ve.LEFT,.99*Number.MAX_VALUE)}}};v=f([o(0,z),o(1,q),o(2,P),o(3,W),o(4,Ee),o(5,we),o(6,Ce),o(7,V),o(8,Me),o(9,Pe),o(10,Re),o(11,xe),o(12,_e),o(13,Ke),o(14,Ge)],v),ke(S.ID,S,he.BlockRestore),h.as(x.Workbench).registerWorkbenchContribution(v,L.Restored);class Ye{canSerialize(u){return!0}serialize(u){return""}deserialize(u){return u.createInstance(R)}}h.as(X.EditorFactory).registerEditorSerializer(R.ID,Ye),h.as(X.EditorPane).registerEditorPane(be.create(j,j.ID,e("workspaceTrustEditor","Workspace Trust Editor")),[new de(R)]);const $e="workbench.trust.configure",ae=F("workspacesCategory","Workspaces");$(class extends Y{constructor(){super({id:$e,title:F("configureWorkspaceTrustSettings","Configure Workspace Trust Settings"),precondition:C.and(A.IsEnabled,C.equals(`config.${_}`,!0)),category:ae,f1:!0})}run(d){d.get(Fe).openUserSettings({jsonEditor:!1,query:`@tag:${k}`})}}),$(class extends Y{constructor(){super({id:m,title:F("manageWorkspaceTrust","Manage Workspace Trust"),precondition:C.and(A.IsEnabled,C.equals(`config.${_}`,!0)),category:ae,f1:!0})}run(d){const u=d.get(Se),r=d.get(me).createInstance(R);u.openEditor(r,{pinned:!0})}}),h.as(le.Configuration).registerConfiguration({...Be,properties:{[_]:{type:"boolean",default:!0,description:e("workspace.trust.description","Controls whether or not Workspace Trust is enabled within VS Code."),tags:[k],scope:g.APPLICATION},[Q]:{type:"string",default:"once",description:e("workspace.trust.startupPrompt.description","Controls when the startup prompt to trust a workspace is shown."),tags:[k],scope:g.APPLICATION,enum:["always","once","never"],enumDescriptions:[e("workspace.trust.startupPrompt.always","Ask for trust every time an untrusted workspace is opened."),e("workspace.trust.startupPrompt.once","Ask for trust the first time an untrusted workspace is opened."),e("workspace.trust.startupPrompt.never","Do not ask for trust when an untrusted workspace is opened.")]},[H]:{type:"string",default:"untilDismissed",description:e("workspace.trust.banner.description","Controls when the restricted mode banner is shown."),tags:[k],scope:g.APPLICATION,enum:["always","untilDismissed","never"],enumDescriptions:[e("workspace.trust.banner.always","Show the banner every time an untrusted workspace is open."),e("workspace.trust.banner.untilDismissed","Show the banner when an untrusted workspace is opened until dismissed."),e("workspace.trust.banner.never","Do not show the banner when an untrusted workspace is open.")]},[Z]:{type:"string",default:"prompt",markdownDescription:e("workspace.trust.untrustedFiles.description","Controls how to handle opening untrusted files in a trusted workspace. This setting also applies to opening files in an empty window which is trusted via `#{0}#`.",J),tags:[k],scope:g.APPLICATION,enum:["prompt","open","newWindow"],enumDescriptions:[e("workspace.trust.untrustedFiles.prompt","Ask how to handle untrusted files for each workspace. Once untrusted files are introduced to a trusted workspace, you will not be prompted again."),e("workspace.trust.untrustedFiles.open","Always allow untrusted files to be introduced to a trusted workspace without prompting."),e("workspace.trust.untrustedFiles.newWindow","Always open untrusted files in a separate window in restricted mode without prompting.")]},[J]:{type:"boolean",default:!0,markdownDescription:e("workspace.trust.emptyWindow.description","Controls whether or not the empty window is trusted by default within VS Code. When used with `#{0}#`, you can enable the full functionality of VS Code without prompting in an empty window.",Z),tags:[k],scope:g.APPLICATION}}});let b=class extends I{constructor(t,r,s,i,a){super();this.environmentService=t;this.telemetryService=r;this.workspaceContextService=s;this.workspaceTrustEnablementService=i;this.workspaceTrustManagementService=a;this.workspaceTrustManagementService.workspaceTrustInitialized.then(()=>{this.logInitialWorkspaceTrustInfo(),this.logWorkspaceTrust(this.workspaceTrustManagementService.isWorkspaceTrusted()),this._register(this.workspaceTrustManagementService.onDidChangeTrust(n=>this.logWorkspaceTrust(n)))})}logInitialWorkspaceTrustInfo(){if(!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()){const t=this.environmentService.disableWorkspaceTrust;this.telemetryService.publicLog2("workspaceTrustDisabled",{reason:t?"cli":"setting"});return}this.telemetryService.publicLog2("workspaceTrustFolderCounts",{trustedFoldersCount:this.workspaceTrustManagementService.getTrustedUris().length})}async logWorkspaceTrust(t){if(this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()&&(this.telemetryService.publicLog2("workspaceTrustStateChanged",{workspaceId:this.workspaceContextService.getWorkspace().id,isTrusted:t}),t)){const r=s=>{let i=We(s),a=0;for(;ee(i)!==i&&a<100;)i=ee(i),a++;return a};for(const s of this.workspaceContextService.getWorkspace().folders){const{trusted:i,uri:a}=await this.workspaceTrustManagementService.getUriTrustInfo(s.uri);if(!i)continue;const n=r(s.uri.fsPath),c=r(a.fsPath),l=n-c;this.telemetryService.publicLog2("workspaceFolderDepthBelowTrustedFolder",{workspaceFolderDepth:n,trustedFolderDepth:c,delta:l})}}}};b=f([o(0,Ae),o(1,Ie),o(2,q),o(3,P),o(4,W)],b),h.as(x.Workbench).registerWorkbenchContribution(b,L.Restored);export{w as WorkspaceTrustContextKeys,S as WorkspaceTrustRequestHandler,v as WorkspaceTrustUXHandler};
