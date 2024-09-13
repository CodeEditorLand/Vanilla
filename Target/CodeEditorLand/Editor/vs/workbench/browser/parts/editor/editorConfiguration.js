var v=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var f=(c,a,t,e)=>{for(var o=e>1?void 0:e?b(a,t):a,d=c.length-1,s;d>=0;d--)(s=c[d])&&(o=(e?s(a,t,o):s(o))||o);return e&&o&&v(a,t,o),o},p=(c,a)=>(t,e)=>a(t,e,c);import{coalesce as C}from"../../../../base/common/arrays.js";import{Event as y}from"../../../../base/common/event.js";import{Disposable as w}from"../../../../base/common/lifecycle.js";import{localize as n}from"../../../../nls.js";import{Extensions as E,ConfigurationScope as k}from"../../../../platform/configuration/common/configurationRegistry.js";import{ByteSize as L,getLargeFileConfirmationLimit as N}from"../../../../platform/files/common/files.js";import{Registry as I}from"../../../../platform/registry/common/platform.js";import{workbenchConfigurationNodeBase as u}from"../../../common/configuration.js";import{IEditorResolverService as S,RegisteredEditorPriority as l}from"../../../services/editor/common/editorResolverService.js";import{IWorkbenchEnvironmentService as R}from"../../../services/environment/common/environmentService.js";import{IExtensionService as A}from"../../../services/extensions/common/extensions.js";let r=class extends w{constructor(t,e,o){super();this.editorResolverService=t;this.environmentService=o;(async()=>(await e.whenInstalledExtensionsRegistered(),this.updateDynamicEditorConfigurations(),this.registerListeners()))()}static ID="workbench.contrib.dynamicEditorConfigurations";static AUTO_LOCK_DEFAULT_ENABLED=new Set(["terminalEditor","mainThreadWebview-simpleBrowser.view","mainThreadWebview-browserPreview"]);static AUTO_LOCK_EXTRA_EDITORS=[{id:"workbench.input.interactive",label:n("interactiveWindow","Interactive Window"),priority:l.builtin},{id:"mainThreadWebview-markdown.preview",label:n("markdownPreview","Markdown Preview"),priority:l.builtin},{id:"mainThreadWebview-simpleBrowser.view",label:n("simpleBrowser","Simple Browser"),priority:l.builtin},{id:"mainThreadWebview-browserPreview",label:n("livePreview","Live Preview"),priority:l.builtin}];static AUTO_LOCK_REMOVE_EDITORS=new Set(["vscode-interactive-input","interactive","vscode.markdown.preview.editor"]);configurationRegistry=I.as(E.Configuration);autoLockConfigurationNode;defaultBinaryEditorConfigurationNode;editorAssociationsConfigurationNode;editorLargeFileConfirmationConfigurationNode;registerListeners(){this._register(y.debounce(this.editorResolverService.onDidChangeEditorRegistrations,(t,e)=>e)(()=>this.updateDynamicEditorConfigurations()))}updateDynamicEditorConfigurations(){const t=[...this.editorResolverService.getEditors(),...r.AUTO_LOCK_EXTRA_EDITORS].filter(i=>!r.AUTO_LOCK_REMOVE_EDITORS.has(i.id)),e=this.editorResolverService.getEditors().filter(i=>i.priority!==l.exclusive).map(i=>i.id),o=Object.create(null);for(const i of t)o[i.id]={type:"boolean",default:r.AUTO_LOCK_DEFAULT_ENABLED.has(i.id),description:i.label};const d=Object.create(null);for(const i of t)d[i.id]=r.AUTO_LOCK_DEFAULT_ENABLED.has(i.id);const s=this.autoLockConfigurationNode;this.autoLockConfigurationNode={...u,properties:{"workbench.editor.autoLockGroups":{type:"object",description:n("workbench.editor.autoLockGroups","If an editor matching one of the listed types is opened as the first in an editor group and more than one group is open, the group is automatically locked. Locked groups will only be used for opening editors when explicitly chosen by a user gesture (for example drag and drop), but not by default. Consequently, the active editor in a locked group is less likely to be replaced accidentally with a different editor."),properties:o,default:d,additionalProperties:!1}}};const m=this.defaultBinaryEditorConfigurationNode;this.defaultBinaryEditorConfigurationNode={...u,properties:{"workbench.editor.defaultBinaryEditor":{type:"string",default:"",enum:[...e,""],description:n("workbench.editor.defaultBinaryEditor","The default editor for files detected as binary. If undefined, the user will be presented with a picker.")}}};const g=this.editorAssociationsConfigurationNode;this.editorAssociationsConfigurationNode={...u,properties:{"workbench.editorAssociations":{type:"object",markdownDescription:n("editor.editorAssociations",'Configure [glob patterns](https://aka.ms/vscode-glob-patterns) to editors (for example `"*.hex": "hexEditor.hexedit"`). These have precedence over the default behavior.'),patternProperties:{".*":{type:"string",enum:e}}}}};const h=this.editorLargeFileConfirmationConfigurationNode;this.editorLargeFileConfirmationConfigurationNode={...u,properties:{"workbench.editorLargeFileConfirmation":{type:"number",default:N(this.environmentService.remoteAuthority)/L.MB,minimum:1,scope:k.RESOURCE,markdownDescription:n("editorLargeFileSizeConfirmation","Controls the minimum size of a file in MB before asking for confirmation when opening in the editor. Note that this setting may not apply to all editor types and environments.")}}},this.configurationRegistry.updateConfigurations({add:[this.autoLockConfigurationNode,this.defaultBinaryEditorConfigurationNode,this.editorAssociationsConfigurationNode,this.editorLargeFileConfirmationConfigurationNode],remove:C([s,m,g,h])})}};r=f([p(0,S),p(1,A),p(2,R)],r);export{r as DynamicEditorConfigurations};
