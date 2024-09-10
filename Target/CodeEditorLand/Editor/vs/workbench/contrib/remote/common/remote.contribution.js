var x=Object.defineProperty;var W=Object.getOwnPropertyDescriptor;var u=(s,r,t,o)=>{for(var i=o>1?void 0:o?W(r,t):r,a=s.length-1,d;a>=0;a--)(d=s[a])&&(i=(o?d(r,t,i):d(i))||i);return o&&i&&x(r,t,i),i},n=(s,r)=>(t,o)=>r(t,o,s);import{WorkbenchPhase as f,Extensions as O,registerWorkbenchContribution2 as b}from"../../../common/contributions.js";import{Registry as g}from"../../../../platform/registry/common/platform.js";import{LifecyclePhase as R}from"../../../services/lifecycle/common/lifecycle.js";import{ILabelService as C}from"../../../../platform/label/common/label.js";import{OperatingSystem as m,isWeb as L,OS as E}from"../../../../base/common/platform.js";import{Schemas as h}from"../../../../base/common/network.js";import{IRemoteAgentService as w}from"../../../services/remote/common/remoteAgentService.js";import{ILoggerService as B}from"../../../../platform/log/common/log.js";import{localize as e,localize2 as y}from"../../../../nls.js";import{Disposable as v}from"../../../../base/common/lifecycle.js";import{Extensions as T}from"../../../../platform/configuration/common/configurationRegistry.js";import{IFileService as N}from"../../../../platform/files/common/files.js";import{IDialogService as j,IFileDialogService as z}from"../../../../platform/dialogs/common/dialogs.js";import{IWorkbenchEnvironmentService as U}from"../../../services/environment/common/environmentService.js";import{IWorkspaceContextService as q}from"../../../../platform/workspace/common/workspace.js";import{Action2 as S,registerAction2 as k}from"../../../../platform/actions/common/actions.js";import{Categories as A}from"../../../../platform/action/common/actionCommonCategories.js";import{PersistentConnection as P}from"../../../../platform/remote/common/remoteAgentConnection.js";import{IDownloadService as $}from"../../../../platform/download/common/download.js";import{DownloadServiceChannel as Z}from"../../../../platform/download/common/downloadIpc.js";import{RemoteLoggerChannelClient as K}from"../../../../platform/log/common/logIpc.js";let l=class{constructor(r,t){this.labelService=r;this.remoteAgentService=t;this.registerFormatters()}static ID="workbench.contrib.remoteLabel";registerFormatters(){this.remoteAgentService.getEnvironment().then(r=>{const t=r?.os||E,o={label:"${path}",separator:t===m.Windows?"\\":"/",tildify:t!==m.Windows,normalizeDriveLetter:t===m.Windows,workspaceSuffix:L?void 0:h.vscodeRemote};this.labelService.registerFormatter({scheme:h.vscodeRemote,formatting:o}),r&&this.labelService.registerFormatter({scheme:h.vscodeUserData,formatting:o})})}};l=u([n(0,C),n(1,w)],l);let p=class extends v{constructor(r,t,o){super();const i=r.getConnection();i&&(i.registerChannel("download",new Z(t)),i.withChannel("logger",async a=>this._register(new K(o,a))))}};p=u([n(0,w),n(1,$),n(2,B)],p);let c=class extends v{constructor(t,o,i,a,d,I){super();this.fileService=t;this.dialogService=o;this.environmentService=i;this.contextService=a;this.fileDialogService=d;this.environmentService.remoteAuthority&&I.getEnvironment().then(D=>{D&&this.validateRemoteWorkspace()})}static ID="workbench.contrib.remoteInvalidWorkspaceDetector";async validateRemoteWorkspace(){const t=this.contextService.getWorkspace(),o=t.configuration??t.folders.at(0)?.uri;if(!o||await this.fileService.exists(o))return;if((await this.dialogService.confirm({type:"warning",message:e("invalidWorkspaceMessage","Workspace does not exist"),detail:e("invalidWorkspaceDetail","Please select another workspace to open."),primaryButton:e({key:"invalidWorkspacePrimary",comment:["&& denotes a mnemonic"]},"&&Open Workspace...")})).confirmed)return t.configuration?this.fileDialogService.pickWorkspaceAndOpen({}):this.fileDialogService.pickFolderAndOpen({})}};c=u([n(0,N),n(1,j),n(2,U),n(3,q),n(4,z),n(5,w)],c);const M=g.as(O.Workbench);b(l.ID,l,f.BlockStartup),M.registerWorkbenchContribution(p,R.Restored),b(c.ID,c,f.BlockStartup);const H=!0;if(H){class s extends S{constructor(){super({id:"workbench.action.triggerReconnect",title:y("triggerReconnect","Connection: Trigger Reconnect"),category:A.Developer,f1:!0})}async run(o){P.debugTriggerReconnection()}}class r extends S{constructor(){super({id:"workbench.action.pauseSocketWriting",title:y("pauseSocketWriting","Connection: Pause socket writing"),category:A.Developer,f1:!0})}async run(o){P.debugPauseSocketWriting()}}k(s),k(r)}const F={type:"string",enum:["ui","workspace"],enumDescriptions:[e("ui","UI extension kind. In a remote window, such extensions are enabled only when available on the local machine."),e("workspace","Workspace extension kind. In a remote window, such extensions are enabled only when available on the remote.")]};g.as(T.Configuration).registerConfiguration({id:"remote",title:e("remote","Remote"),type:"object",properties:{"remote.extensionKind":{type:"object",markdownDescription:e("remote.extensionKind","Override the kind of an extension. `ui` extensions are installed and run on the local machine while `workspace` extensions are run on the remote. By overriding an extension's default kind using this setting, you specify if that extension should be installed and enabled locally or remotely."),patternProperties:{"([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$":{oneOf:[{type:"array",items:F},F],default:["ui"]}},default:{"pub.name":["ui"]}},"remote.restoreForwardedPorts":{type:"boolean",markdownDescription:e("remote.restoreForwardedPorts","Restores the ports you forwarded in a workspace."),default:!0},"remote.autoForwardPorts":{type:"boolean",markdownDescription:e("remote.autoForwardPorts","When enabled, new running processes are detected and ports that they listen on are automatically forwarded. Disabling this setting will not prevent all ports from being forwarded. Even when disabled, extensions will still be able to cause ports to be forwarded, and opening some URLs will still cause ports to forwarded."),default:!0},"remote.autoForwardPortsSource":{type:"string",markdownDescription:e("remote.autoForwardPortsSource","Sets the source from which ports are automatically forwarded when {0} is true. On Windows and macOS remotes, the `process` and `hybrid` options have no effect and `output` will be used.","`#remote.autoForwardPorts#`"),enum:["process","output","hybrid"],enumDescriptions:[e("remote.autoForwardPortsSource.process","Ports will be automatically forwarded when discovered by watching for processes that are started and include a port."),e("remote.autoForwardPortsSource.output",'Ports will be automatically forwarded when discovered by reading terminal and debug output. Not all processes that use ports will print to the integrated terminal or debug console, so some ports will be missed. Ports forwarded based on output will not be "un-forwarded" until reload or until the port is closed by the user in the Ports view.'),e("remote.autoForwardPortsSource.hybrid",'Ports will be automatically forwarded when discovered by reading terminal and debug output. Not all processes that use ports will print to the integrated terminal or debug console, so some ports will be missed. Ports will be "un-forwarded" by watching for processes that listen on that port to be terminated.')],default:"process"},"remote.autoForwardPortsFallback":{type:"number",default:20,markdownDescription:e("remote.autoForwardPortFallback","The number of auto forwarded ports that will trigger the switch from `process` to `hybrid` when automatically forwarding ports and `remote.autoForwardPortsSource` is set to `process` by default. Set to `0` to disable the fallback. When `remote.autoForwardPortsFallback` hasn't been configured, but `remote.autoForwardPortsSource` has, `remote.autoForwardPortsFallback` will be treated as though it's set to `0`.")},"remote.forwardOnOpen":{type:"boolean",description:e("remote.forwardOnClick","Controls whether local URLs with a port will be forwarded when opened from the terminal and the debug console."),default:!0},"remote.portsAttributes":{type:"object",patternProperties:{"(^\\d+(-\\d+)?$)|(.+)":{type:"object",description:e("remote.portsAttributes.port",'A port, range of ports (ex. "40000-55000"), host and port (ex. "db:1234"), or regular expression (ex. ".+\\\\/server.js").  For a port number or range, the attributes will apply to that port number or range of port numbers. Attributes which use a regular expression will apply to ports whose associated process command line matches the expression.'),properties:{onAutoForward:{type:"string",enum:["notify","openBrowser","openBrowserOnce","openPreview","silent","ignore"],enumDescriptions:[e("remote.portsAttributes.notify","Shows a notification when a port is automatically forwarded."),e("remote.portsAttributes.openBrowser","Opens the browser when the port is automatically forwarded. Depending on your settings, this could open an embedded browser."),e("remote.portsAttributes.openBrowserOnce","Opens the browser when the port is automatically forwarded, but only the first time the port is forward during a session. Depending on your settings, this could open an embedded browser."),e("remote.portsAttributes.openPreview","Opens a preview in the same window when the port is automatically forwarded."),e("remote.portsAttributes.silent","Shows no notification and takes no action when this port is automatically forwarded."),e("remote.portsAttributes.ignore","This port will not be automatically forwarded.")],description:e("remote.portsAttributes.onForward","Defines the action that occurs when the port is discovered for automatic forwarding"),default:"notify"},elevateIfNeeded:{type:"boolean",description:e("remote.portsAttributes.elevateIfNeeded","Automatically prompt for elevation (if needed) when this port is forwarded. Elevate is required if the local port is a privileged port."),default:!1},label:{type:"string",description:e("remote.portsAttributes.label","Label that will be shown in the UI for this port."),default:e("remote.portsAttributes.labelDefault","Application")},requireLocalPort:{type:"boolean",markdownDescription:e("remote.portsAttributes.requireLocalPort","When true, a modal dialog will show if the chosen local port isn't used for forwarding."),default:!1},protocol:{type:"string",enum:["http","https"],description:e("remote.portsAttributes.protocol","The protocol to use when forwarding this port.")}},default:{label:e("remote.portsAttributes.labelDefault","Application"),onAutoForward:"notify"}}},markdownDescription:e("remote.portsAttributes",`Set properties that are applied when a specific port number is forwarded. For example:

\`\`\`
"3000": {
  "label": "Application"
},
"40000-55000": {
  "onAutoForward": "ignore"
},
".+\\\\/server.js": {
 "onAutoForward": "openPreview"
}
\`\`\``),defaultSnippets:[{body:{"${1:3000}":{label:"${2:Application}",onAutoForward:"openPreview"}}}],errorMessage:e("remote.portsAttributes.patternError","Must be a port number, range of port numbers, or regular expression."),additionalProperties:!1,default:{443:{protocol:"https"},8443:{protocol:"https"}}},"remote.otherPortsAttributes":{type:"object",properties:{onAutoForward:{type:"string",enum:["notify","openBrowser","openPreview","silent","ignore"],enumDescriptions:[e("remote.portsAttributes.notify","Shows a notification when a port is automatically forwarded."),e("remote.portsAttributes.openBrowser","Opens the browser when the port is automatically forwarded. Depending on your settings, this could open an embedded browser."),e("remote.portsAttributes.openPreview","Opens a preview in the same window when the port is automatically forwarded."),e("remote.portsAttributes.silent","Shows no notification and takes no action when this port is automatically forwarded."),e("remote.portsAttributes.ignore","This port will not be automatically forwarded.")],description:e("remote.portsAttributes.onForward","Defines the action that occurs when the port is discovered for automatic forwarding"),default:"notify"},elevateIfNeeded:{type:"boolean",description:e("remote.portsAttributes.elevateIfNeeded","Automatically prompt for elevation (if needed) when this port is forwarded. Elevate is required if the local port is a privileged port."),default:!1},label:{type:"string",description:e("remote.portsAttributes.label","Label that will be shown in the UI for this port."),default:e("remote.portsAttributes.labelDefault","Application")},requireLocalPort:{type:"boolean",markdownDescription:e("remote.portsAttributes.requireLocalPort","When true, a modal dialog will show if the chosen local port isn't used for forwarding."),default:!1},protocol:{type:"string",enum:["http","https"],description:e("remote.portsAttributes.protocol","The protocol to use when forwarding this port.")}},defaultSnippets:[{body:{onAutoForward:"ignore"}}],markdownDescription:e("remote.portsAttributes.defaults",`Set default properties that are applied to all ports that don't get properties from the setting {0}. For example:

\`\`\`
{
  "onAutoForward": "ignore"
}
\`\`\``,"`#remote.portsAttributes#`"),additionalProperties:!1},"remote.localPortHost":{type:"string",enum:["localhost","allInterfaces"],default:"localhost",description:e("remote.localPortHost","Specifies the local host name that will be used for port forwarding.")}}});export{l as LabelContribution};
