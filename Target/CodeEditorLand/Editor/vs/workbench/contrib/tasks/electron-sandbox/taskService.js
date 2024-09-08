var K=Object.defineProperty;var Q=Object.getOwnPropertyDescriptor;var f=(m,r,i,t)=>{for(var o=t>1?void 0:t?Q(r,i):r,n=m.length-1,s;n>=0;n--)(s=m[n])&&(o=(t?s(r,i,o):s(o))||o);return t&&o&&K(r,i,o),o},e=(m,r)=>(i,t)=>r(i,t,m);import*as c from"../../../../nls.js";import*as v from"../../../../base/common/semver/semver.js";import{IWorkspaceContextService as j}from"../../../../platform/workspace/common/workspace.js";import"../common/taskSystem.js";import{ExecutionEngine as I}from"../common/tasks.js";import"../common/taskConfiguration.js";import{AbstractTaskService as H}from"../browser/abstractTaskService.js";import{ITaskService as J}from"../common/taskService.js";import{InstantiationType as U,registerSingleton as X}from"../../../../platform/instantiation/common/extensions.js";import{TerminalTaskSystem as Y}from"../browser/terminalTaskSystem.js";import{IDialogService as Z}from"../../../../platform/dialogs/common/dialogs.js";import{TerminateResponseCode as $}from"../../../../base/common/processes.js";import{IModelService as ee}from"../../../../editor/common/services/model.js";import{ITextModelService as re}from"../../../../editor/common/services/resolverService.js";import{ICommandService as ie}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as te}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as oe}from"../../../../platform/contextkey/common/contextkey.js";import{IFileService as se}from"../../../../platform/files/common/files.js";import{ILogService as ne}from"../../../../platform/log/common/log.js";import{IMarkerService as me}from"../../../../platform/markers/common/markers.js";import{INotificationService as ae}from"../../../../platform/notification/common/notification.js";import{IOpenerService as ce}from"../../../../platform/opener/common/opener.js";import{IProgressService as Se}from"../../../../platform/progress/common/progress.js";import{IQuickInputService as fe}from"../../../../platform/quickinput/common/quickInput.js";import{IStorageService as ve}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as Ie}from"../../../../platform/telemetry/common/telemetry.js";import{IViewDescriptorService as pe}from"../../../common/views.js";import{IViewsService as ue}from"../../../services/views/common/viewsService.js";import{IOutputService as le}from"../../../services/output/common/output.js";import{ITerminalGroupService as de,ITerminalService as ke}from"../../terminal/browser/terminal.js";import{IConfigurationResolverService as ge}from"../../../services/configurationResolver/common/configurationResolver.js";import{IEditorService as he}from"../../../services/editor/common/editorService.js";import{IWorkbenchEnvironmentService as ye}from"../../../services/environment/common/environmentService.js";import{IExtensionService as Te}from"../../../services/extensions/common/extensions.js";import{ILifecycleService as Ce}from"../../../services/lifecycle/common/lifecycle.js";import{IPathService as Pe}from"../../../services/path/common/pathService.js";import{IPreferencesService as _e}from"../../../services/preferences/common/preferences.js";import{ITextFileService as xe}from"../../../services/textfile/common/textfiles.js";import{IWorkspaceTrustManagementService as be,IWorkspaceTrustRequestService as Ee}from"../../../../platform/workspace/common/workspaceTrust.js";import{ITerminalProfileResolverService as Re}from"../../terminal/common/terminal.js";import{IPaneCompositePartService as we}from"../../../services/panecomposite/browser/panecomposite.js";import{IThemeService as We}from"../../../../platform/theme/common/themeService.js";import{IInstantiationService as Ae}from"../../../../platform/instantiation/common/instantiation.js";import{IRemoteAgentService as Fe}from"../../../services/remote/common/remoteAgentService.js";import{IAccessibilitySignalService as De}from"../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";let a=class extends H{constructor(r,i,t,o,n,s,p,u,l,d,k,S,g,h,y,T,C,P,_,x,b,E,R,w,W,A,F,D,M,L,V,z,O,B,N,q,Me){super(r,i,t,o,n,s,p,u,l,d,k,g,h,y,T,C,P,_,x,b,E,R,w,W,A,F,D,M,L,V,z,O,B,S,q,N),this._register(S.onBeforeShutdown(G=>G.veto(this.beforeShutdown(),"veto.tasks")))}_getTaskSystem(){if(this._taskSystem)return this._taskSystem;const r=this._createTerminalTaskSystem();return this._taskSystem=r,this._taskSystemListeners=[this._taskSystem.onDidStateChange(i=>{this._taskRunningState.set(this._taskSystem.isActiveSync()),this._onDidStateChange.fire(i)})],this._taskSystem}_computeLegacyConfiguration(r){const{config:i,hasParseErrors:t}=this._getConfiguration(r);return t?Promise.resolve({workspaceFolder:r,hasErrors:!0,config:void 0}):i?Promise.resolve({workspaceFolder:r,config:i,hasErrors:!1}):Promise.resolve({workspaceFolder:r,hasErrors:!0,config:void 0})}_versionAndEngineCompatible(r){const i=r&&r.version?r.version:void 0,t=this.executionEngine;return i===void 0||v.satisfies("0.1.0",i)&&t===I.Process||v.satisfies("2.0.0",i)&&t===I.Terminal}beforeShutdown(){if(!this._taskSystem||!this._taskSystem.isActiveSync()||this._taskSystem instanceof Y)return!1;let r;return this._taskSystem.canAutoTerminate()?r=Promise.resolve({confirmed:!0}):r=this._dialogService.confirm({message:c.localize("TaskSystem.runningTask","There is a task running. Do you want to terminate it?"),primaryButton:c.localize({key:"TaskSystem.terminateTask",comment:["&& denotes a mnemonic"]},"&&Terminate Task")}),r.then(i=>i.confirmed?this._taskSystem.terminateAll().then(t=>{let o=!0,n;for(const s of t)o=o&&s.success,n===void 0&&s.code!==void 0&&(n=s.code);return o?(this._taskSystem=void 0,this._disposeTaskSystemListeners(),!1):n&&n===$.ProcessNotFound?this._dialogService.confirm({message:c.localize("TaskSystem.noProcess","The launched task doesn't exist anymore. If the task spawned background processes exiting VS Code might result in orphaned processes. To avoid this start the last background process with a wait flag."),primaryButton:c.localize({key:"TaskSystem.exitAnyways",comment:["&& denotes a mnemonic"]},"&&Exit Anyways"),type:"info"}).then(s=>!s.confirmed):!0},t=>!0):!0)}};a=f([e(0,te),e(1,me),e(2,le),e(3,we),e(4,ue),e(5,ie),e(6,he),e(7,se),e(8,j),e(9,Ie),e(10,xe),e(11,Ce),e(12,ee),e(13,Te),e(14,fe),e(15,ge),e(16,ke),e(17,de),e(18,ve),e(19,Se),e(20,ce),e(21,Z),e(22,ae),e(23,oe),e(24,ye),e(25,Re),e(26,Pe),e(27,re),e(28,_e),e(29,pe),e(30,Ee),e(31,be),e(32,ne),e(33,We),e(34,Ae),e(35,Fe),e(36,De)],a),X(J,a,U.Delayed);export{a as TaskService};
