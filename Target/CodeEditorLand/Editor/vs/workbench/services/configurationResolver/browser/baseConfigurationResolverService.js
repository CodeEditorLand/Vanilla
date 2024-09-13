import{Queue as V}from"../../../../base/common/async.js";import{LRUCache as O}from"../../../../base/common/map.js";import{Schemas as S}from"../../../../base/common/network.js";import*as m from"../../../../base/common/types.js";import{isCodeEditor as h,isDiffEditor as w}from"../../../../editor/browser/editorBrowser.js";import*as g from"../../../../nls.js";import{ConfigurationTarget as y}from"../../../../platform/configuration/common/configuration.js";import{StorageScope as b,StorageTarget as R}from"../../../../platform/storage/common/storage.js";import{WorkbenchState as x}from"../../../../platform/workspace/common/workspace.js";import{EditorResourceAccessor as k,SideBySideEditor as E}from"../../../common/editor.js";import{AbstractVariableResolverService as T}from"../common/variableResolver.js";const P="configResolveInputLru",U=5;class A extends T{constructor(r,i,n,e,d,a,l,f,o,c,u){super({getFolderUri:t=>{const s=a.getWorkspace().folders.filter(p=>p.name===t).pop();return s?s.uri:void 0},getWorkspaceFolderCount:()=>a.getWorkspace().folders.length,getConfigurationValue:(t,s)=>e.getValue(s,t?{resource:t}:{}),getAppRoot:()=>r.getAppRoot(),getExecPath:()=>r.getExecPath(),getFilePath:()=>{const t=k.getOriginalUri(n.activeEditor,{supportSideBySide:E.PRIMARY,filterByScheme:[S.file,S.vscodeUserData,this.pathService.defaultUriScheme]});if(t)return this.labelService.getUriLabel(t,{noPrefix:!0})},getWorkspaceFolderPathForFile:()=>{const t=k.getOriginalUri(n.activeEditor,{supportSideBySide:E.PRIMARY,filterByScheme:[S.file,S.vscodeUserData,this.pathService.defaultUriScheme]});if(!t)return;const s=a.getWorkspaceFolder(t);if(s)return this.labelService.getUriLabel(s.uri,{noPrefix:!0})},getSelectedText:()=>{const t=n.activeTextEditorControl;let s=null;if(h(t))s=t;else if(w(t)){const v=t.getOriginalEditor(),C=t.getModifiedEditor();s=v.hasWidgetFocus()?v:C}const p=s?.getModel(),I=s?.getSelection();if(p&&I)return p.getValueInRange(I)},getLineNumber:()=>{const t=n.activeTextEditorControl;if(h(t)){const s=t.getSelection();if(s){const p=s.positionLineNumber;return String(p)}}},getExtension:t=>c.getExtension(t)},f,o.userHome().then(t=>t.path),i);this.configurationService=e;this.commandService=d;this.workspaceContextService=a;this.quickInputService=l;this.labelService=f;this.pathService=o;this.storageService=u}static INPUT_OR_COMMAND_VARIABLES_PATTERN=/\${((input|command):(.*?))}/g;userInputAccessQueue=new V;async resolveWithInteractionReplace(r,i,n,e,d){return i=await this.resolveAnyAsync(r,i),this.resolveWithInteraction(r,i,n,e,d).then(a=>a?a.size>0?this.resolveAnyAsync(r,i,Object.fromEntries(a)):i:null)}async resolveWithInteraction(r,i,n,e,d){const a=await this.resolveAnyMap(r,i);i=a.newConfig;const l=a.resolvedVariables;return this.resolveWithInputAndCommands(r,i,e,n,d).then(f=>{if(this.updateMapping(f,l))return l})}updateMapping(r,i){if(!r)return!1;for(const[n,e]of Object.entries(r))i.set(n,e);return!0}async resolveWithInputAndCommands(r,i,n,e,d){if(!i)return Promise.resolve(void 0);let a=[];if(this.workspaceContextService.getWorkbenchState()!==x.EMPTY&&e){const o=r?{resource:r.uri}:{},c=this.configurationService.inspect(e,o);if(c&&(c.userValue||c.workspaceValue||c.workspaceFolderValue))switch(d){case y.USER:a=c.userValue?.inputs;break;case y.WORKSPACE:a=c.workspaceValue?.inputs;break;default:a=c.workspaceFolderValue?.inputs}else{const u=this.configurationService.getValue(e,o);u&&(a=u.inputs)}}const l=[];this.findVariables(i,l);const f=Object.create(null);for(const o of l){const[c,u]=o.split(":",2);let t;switch(c){case"input":t=await this.showUserInput(e,u,a);break;case"command":{const s=(n?n[u]:void 0)||u;if(t=await this.commandService.executeCommand(s,i),typeof t!="string"&&!m.isUndefinedOrNull(t))throw new Error(g.localize("commandVariable.noStringType","Cannot substitute command variable '{0}' because command did not return a result of type string.",s));break}default:this._contributedVariables.has(o)&&(t=await this._contributedVariables.get(o)())}if(typeof t=="string")f[o]=t;else return}return f}findVariables(r,i){if(typeof r=="string"){let n;for(;(n=A.INPUT_OR_COMMAND_VARIABLES_PATTERN.exec(r))!==null;)if(n.length===4){const e=n[1];i.indexOf(e)<0&&i.push(e)}for(const e of this._contributedVariables.keys())i.indexOf(e)<0&&r.indexOf("${"+e+"}")>=0&&i.push(e)}else if(Array.isArray(r))for(const n of r)this.findVariables(n,i);else if(r)for(const n of Object.values(r))this.findVariables(n,i)}showUserInput(r,i,n){if(!n)return Promise.reject(new Error(g.localize("inputVariable.noInputSection","Variable '{0}' must be defined in an '{1}' section of the debug or task configuration.",i,"inputs")));const e=n.filter(d=>d.id===i).pop();if(e){const d=o=>{throw new Error(g.localize("inputVariable.missingAttribute","Input variable '{0}' is of type '{1}' and must include '{2}'.",i,e.type,o))},a=this.readInputLru(),l=`${r}.${i}`,f=a.get(l);switch(e.type){case"promptString":{m.isString(e.description)||d("description");const o={prompt:e.description,ignoreFocusLost:!0,value:f};return e.default&&(o.value=e.default),e.password&&(o.password=e.password),this.userInputAccessQueue.queue(()=>this.quickInputService.input(o)).then(c=>(typeof c=="string"&&this.storeInputLru(a.set(l,c)),c))}case"pickString":{if(m.isString(e.description)||d("description"),Array.isArray(e.options))for(const u of e.options)!m.isString(u)&&!m.isString(u.value)&&d("value");else d("options");const o=new Array;for(const u of e.options){const t=m.isString(u)?u:u.value,s=m.isString(u)?void 0:u.label,p={label:s?`${s}: ${t}`:t,value:t};t===e.default?(p.description=g.localize("inputVariable.defaultInputValue","(Default)"),o.unshift(p)):!e.default&&t===f?o.unshift(p):o.push(p)}const c={placeHolder:e.description,matchOnDetail:!0,ignoreFocusLost:!0};return this.userInputAccessQueue.queue(()=>this.quickInputService.pick(o,c,void 0)).then(u=>{if(u){const t=u.value;return this.storeInputLru(a.set(l,t)),t}})}case"command":return m.isString(e.command)||d("command"),this.userInputAccessQueue.queue(()=>this.commandService.executeCommand(e.command,e.args)).then(o=>{if(typeof o=="string"||m.isUndefinedOrNull(o))return o;throw new Error(g.localize("inputVariable.command.noStringType","Cannot substitute input variable '{0}' because command '{1}' did not return a result of type string.",i,e.command))});default:throw new Error(g.localize("inputVariable.unknownType","Input variable '{0}' can only be of type 'promptString', 'pickString', or 'command'.",i))}}return Promise.reject(new Error(g.localize("inputVariable.undefinedVariable","Undefined input variable '{0}' encountered. Remove or define '{0}' to continue.",i)))}storeInputLru(r){this.storageService.store(P,JSON.stringify(r.toJSON()),b.WORKSPACE,R.MACHINE)}readInputLru(){const r=this.storageService.get(P,b.WORKSPACE),i=new O(U);try{r&&i.fromJSON(JSON.parse(r))}catch{}return i}}export{A as BaseConfigurationResolverService};
