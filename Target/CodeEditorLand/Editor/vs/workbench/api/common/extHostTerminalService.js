var L=Object.defineProperty;var H=Object.getOwnPropertyDescriptor;var b=(a,t,e,i)=>{for(var n=i>1?void 0:i?H(t,e):t,r=a.length-1,o;r>=0;r--)(o=a[r])&&(n=(i?o(t,e,n):o(n))||n);return i&&n&&L(t,e,n),n},p=(a,t)=>(e,i)=>t(e,i,a);import{Promises as R}from"../../../../vs/base/common/async.js";import{CancellationTokenSource as _}from"../../../../vs/base/common/cancellation.js";import{NotSupportedError as I}from"../../../../vs/base/common/errors.js";import{Emitter as d}from"../../../../vs/base/common/event.js";import{Disposable as y,DisposableStore as w,MutableDisposable as B}from"../../../../vs/base/common/lifecycle.js";import{MarshalledId as S}from"../../../../vs/base/common/marshallingIds.js";import{ThemeColor as P}from"../../../../vs/base/common/themables.js";import{URI as z}from"../../../../vs/base/common/uri.js";import{generateUuid as W}from"../../../../vs/base/common/uuid.js";import{localize as Q}from"../../../../vs/nls.js";import"../../../../vs/platform/extensions/common/extensions.js";import{createDecorator as K}from"../../../../vs/platform/instantiation/common/instantiation.js";import"../../../../vs/platform/terminal/common/environmentVariable.js";import{serializeEnvironmentDescriptionMap as U,serializeEnvironmentVariableCollection as q}from"../../../../vs/platform/terminal/common/environmentVariableShared.js";import{ProcessPropertyType as T}from"../../../../vs/platform/terminal/common/terminal.js";import{TerminalDataBufferer as j}from"../../../../vs/platform/terminal/common/terminalDataBuffering.js";import{MainContext as N}from"../../../../vs/workbench/api/common/extHost.protocol.js";import{IExtHostCommands as k}from"../../../../vs/workbench/api/common/extHostCommands.js";import{IExtHostRpcService as V}from"../../../../vs/workbench/api/common/extHostRpcService.js";import{TerminalQuickFix as M,ViewColumn as G}from"../../../../vs/workbench/api/common/extHostTypeConverters.js";import"../../../../vs/workbench/contrib/terminal/common/terminal.js";import"../../../../vs/workbench/services/editor/common/editorGroupColumn.js";import{EnvironmentVariableMutatorType as C,Disposable as E}from"./extHostTypes.js";const Ye=K("IExtHostTerminalService");class O extends y{constructor(e,i,n,r){super();this._proxy=e;this._id=i;this._creationOptions=n;this._name=r;this._creationOptions=Object.freeze(this._creationOptions),this._pidPromise=new Promise(s=>this._pidPromiseComplete=s);const o=this;this.value={get name(){return o._name||""},get processId(){return o._pidPromise},get creationOptions(){return o._creationOptions},get exitStatus(){return o._exitStatus},get state(){return o._state},get selection(){return o._selection},get shellIntegration(){return o.shellIntegration},sendText(s,l=!0){o._checkDisposed(),o._proxy.$sendText(o._id,s,l)},show(s){o._checkDisposed(),o._proxy.$show(o._id,s)},hide(){o._checkDisposed(),o._proxy.$hide(o._id)},dispose(){o._disposed||(o._disposed=!0,o._proxy.$dispose(o._id))},get dimensions(){if(!(o._cols===void 0||o._rows===void 0))return{columns:o._cols,rows:o._rows}}}}_disposed=!1;_pidPromise;_cols;_pidPromiseComplete;_rows;_exitStatus;_state={isInteractedWith:!1};_selection;shellIntegration;isOpen=!1;value;_onWillDispose=this._register(new d);onWillDispose=this._onWillDispose.event;dispose(){this._onWillDispose.fire(),super.dispose()}async create(e,i){if(typeof this._id!="string")throw new Error("Terminal has already been created");await this._proxy.$createTerminal(this._id,{name:e.name,shellPath:e.shellPath??void 0,shellArgs:e.shellArgs??void 0,cwd:e.cwd??i?.cwd??void 0,env:e.env??void 0,icon:A(e.iconPath)??void 0,color:P.isThemeColor(e.color)?e.color.id:void 0,initialText:e.message??void 0,strictEnv:e.strictEnv??void 0,hideFromUser:e.hideFromUser??void 0,forceShellIntegration:i?.forceShellIntegration??void 0,isFeatureTerminal:i?.isFeatureTerminal??void 0,isExtensionOwnedTerminal:!0,useShellEnvironment:i?.useShellEnvironment??void 0,location:i?.location||this._serializeParentTerminal(e.location,i?.resolvedExtHostIdentifier),isTransient:e.isTransient??void 0})}async createExtensionTerminal(e,i,n,r,o){if(typeof this._id!="string")throw new Error("Terminal has already been created");if(await this._proxy.$createTerminal(this._id,{name:this._name,isExtensionCustomPtyTerminal:!0,icon:r,color:P.isThemeColor(o)?o.id:void 0,location:i?.location||this._serializeParentTerminal(e,n),isTransient:!0}),typeof this._id=="string")throw new Error("Terminal creation failed");return this._id}_serializeParentTerminal(e,i){return typeof e=="object"?"parentTerminal"in e&&e.parentTerminal&&i?{parentTerminal:i}:"viewColumn"in e?{viewColumn:G.from(e.viewColumn),preserveFocus:e.preserveFocus}:void 0:e}_checkDisposed(){if(this._disposed)throw new Error("Terminal has already been disposed")}set name(e){this._name=e}setExitStatus(e,i){this._exitStatus=Object.freeze({code:e,reason:i})}setDimensions(e,i){return e===this._cols&&i===this._rows||e===0||i===0?!1:(this._cols=e,this._rows=i,!0)}setInteractedWith(){return this._state.isInteractedWith?!1:(this._state={isInteractedWith:!0},!0)}setSelection(e){this._selection=e}_setProcessId(e){this._pidPromiseComplete?(this._pidPromiseComplete(e),this._pidPromiseComplete=void 0):this._pidPromise.then(i=>{i!==e&&(this._pidPromise=Promise.resolve(e))})}}class x{constructor(t){this._pty=t}id=0;shouldPersist=!1;_onProcessData=new d;onProcessData=this._onProcessData.event;_onProcessReady=new d;get onProcessReady(){return this._onProcessReady.event}_onDidChangeProperty=new d;onDidChangeProperty=this._onDidChangeProperty.event;_onProcessExit=new d;onProcessExit=this._onProcessExit.event;refreshProperty(t){throw new Error(`refreshProperty is not suppported in extension owned terminals. property: ${t}`)}updateProperty(t,e){throw new Error(`updateProperty is not suppported in extension owned terminals. property: ${t}, value: ${e}`)}async start(){}shutdown(){this._pty.close()}input(t){this._pty.handleInput?.(t)}resize(t,e){this._pty.setDimensions?.({columns:t,rows:e})}clearBuffer(){}async processBinary(t){}acknowledgeDataEvent(t){}async setUnicodeVersion(t){}getInitialCwd(){return Promise.resolve("")}getCwd(){return Promise.resolve("")}startSendingEvents(t){this._pty.onDidWrite(e=>this._onProcessData.fire(e)),this._pty.onDidClose?.((e=void 0)=>{this._onProcessExit.fire(e===void 0?void 0:e)}),this._pty.onDidOverrideDimensions?.(e=>{e&&this._onDidChangeProperty.fire({type:T.OverrideDimensions,value:{cols:e.columns,rows:e.rows}})}),this._pty.onDidChangeName?.(e=>{this._onDidChangeProperty.fire({type:T.Title,value:e})}),this._pty.open(t||void 0),t&&this._pty.setDimensions?.(t),this._onProcessReady.fire({pid:-1,cwd:"",windowsPty:void 0})}}let J=1,u=class extends y{constructor(e,i,n){super();this._extHostCommands=i;this._proxy=n.getProxy(N.MainThreadTerminalService),this._bufferer=new j(this._proxy.$sendProcessData),this._proxy.$registerProcessSupport(e),this._extHostCommands.registerArgumentProcessor({processArgument:r=>{const o=s=>{const l=s;return this.getTerminalById(l.instanceId)?.value};switch(r?.$mid){case S.TerminalContext:return o(r);default:{if(Array.isArray(r))for(let s=0;s<r.length&&r[s].$mid===S.TerminalContext;s++)r[s]=o(r[s]);return r}}}}),this._register({dispose:()=>{for(const[r,o]of this._terminalProcesses)o.shutdown(!0)}})}_serviceBrand;_proxy;_activeTerminal;_terminals=[];_terminalProcesses=new Map;_terminalProcessDisposables={};_extensionTerminalAwaitingStart={};_getTerminalPromises={};_environmentVariableCollections=new Map;_defaultProfile;_defaultAutomationProfile;_lastQuickFixCommands=this._register(new B);_bufferer;_linkProviders=new Set;_profileProviders=new Map;_quickFixProviders=new Map;_terminalLinkCache=new Map;_terminalLinkCancellationSource=new Map;get activeTerminal(){return this._activeTerminal?.value}get terminals(){return this._terminals.map(e=>e.value)}_onDidCloseTerminal=new d;onDidCloseTerminal=this._onDidCloseTerminal.event;_onDidOpenTerminal=new d;onDidOpenTerminal=this._onDidOpenTerminal.event;_onDidChangeActiveTerminal=new d;onDidChangeActiveTerminal=this._onDidChangeActiveTerminal.event;_onDidChangeTerminalDimensions=new d;onDidChangeTerminalDimensions=this._onDidChangeTerminalDimensions.event;_onDidChangeTerminalState=new d;onDidChangeTerminalState=this._onDidChangeTerminalState.event;_onDidChangeShell=new d;onDidChangeShell=this._onDidChangeShell.event;_onDidWriteTerminalData=new d({onWillAddFirstListener:()=>this._proxy.$startSendingDataEvents(),onDidRemoveLastListener:()=>this._proxy.$stopSendingDataEvents()});onDidWriteTerminalData=this._onDidWriteTerminalData.event;_onDidExecuteCommand=new d({onWillAddFirstListener:()=>this._proxy.$startSendingCommandEvents(),onDidRemoveLastListener:()=>this._proxy.$stopSendingCommandEvents()});onDidExecuteTerminalCommand=this._onDidExecuteCommand.event;getDefaultShell(e){return(e?this._defaultAutomationProfile:this._defaultProfile)?.path||""}getDefaultShellArgs(e){return(e?this._defaultAutomationProfile:this._defaultProfile)?.args||[]}createExtensionTerminal(e,i){const n=new O(this._proxy,W(),e,e.name),r=new x(e.pty);return n.createExtensionTerminal(e.location,i,this._serializeParentTerminal(e,i).resolvedExtHostIdentifier,A(e.iconPath),Y(e.color)).then(o=>{const s=this._setupExtHostProcessListeners(o,r);this._terminalProcessDisposables[o]=s}),this._terminals.push(n),n.value}_serializeParentTerminal(e,i){if(i=i||{},e.location&&typeof e.location=="object"&&"parentTerminal"in e.location){const n=e.location.parentTerminal;if(n){const r=this._terminals.find(o=>o.value===n);r&&(i.resolvedExtHostIdentifier=r._id)}}else e.location&&typeof e.location!="object"?i.location=e.location:i.location&&typeof i.location=="object"&&"splitActiveTerminal"in i.location&&(i.location={splitActiveTerminal:!0});return i}attachPtyToTerminal(e,i){if(!this.getTerminalById(e))throw new Error(`Cannot resolve terminal with id ${e} for virtual process`);const r=new x(i),o=this._setupExtHostProcessListeners(e,r);this._terminalProcessDisposables[e]=o}async $acceptActiveTerminalChanged(e){const i=this._activeTerminal;if(e===null){this._activeTerminal=void 0,i!==this._activeTerminal&&this._onDidChangeActiveTerminal.fire(this._activeTerminal);return}const n=this.getTerminalById(e);n&&(this._activeTerminal=n,i!==this._activeTerminal&&this._onDidChangeActiveTerminal.fire(this._activeTerminal.value))}async $acceptTerminalProcessData(e,i){const n=this.getTerminalById(e);n&&this._onDidWriteTerminalData.fire({terminal:n.value,data:i})}async $acceptTerminalDimensions(e,i,n){const r=this.getTerminalById(e);r&&r.setDimensions(i,n)&&this._onDidChangeTerminalDimensions.fire({terminal:r.value,dimensions:r.value.dimensions})}async $acceptDidExecuteCommand(e,i){const n=this.getTerminalById(e);n&&this._onDidExecuteCommand.fire({terminal:n.value,...i})}async $acceptTerminalMaximumDimensions(e,i,n){this._terminalProcesses.get(e)?.resize(i,n)}async $acceptTerminalTitleChange(e,i){const n=this.getTerminalById(e);n&&(n.name=i)}async $acceptTerminalClosed(e,i,n){const r=this._getTerminalObjectIndexById(this._terminals,e);if(r!==null){const o=this._terminals.splice(r,1)[0];o.setExitStatus(i,n),this._onDidCloseTerminal.fire(o.value)}}$acceptTerminalOpened(e,i,n,r){if(i){const l=this._getTerminalObjectIndexById(this._terminals,i);if(l!==null){this._terminals[l]._id=e,this._onDidOpenTerminal.fire(this.terminals[l]),this._terminals[l].isOpen=!0;return}}const o={name:r.name,shellPath:r.executable,shellArgs:r.args,cwd:typeof r.cwd=="string"?r.cwd:z.revive(r.cwd),env:r.env,hideFromUser:r.hideFromUser},s=new O(this._proxy,e,o,n);this._terminals.push(s),this._onDidOpenTerminal.fire(s.value),s.isOpen=!0}async $acceptTerminalProcessId(e,i){this.getTerminalById(e)?._setProcessId(i)}async $startExtensionTerminal(e,i){const n=this.getTerminalById(e);if(!n)return{message:Q("launchFail.idMissingOnExtHost","Could not find the terminal with id {0} on the extension host",e)};n.isOpen||await new Promise(o=>{const s=this.onDidOpenTerminal(async l=>{l===n.value&&(s.dispose(),o())})});const r=this._terminalProcesses.get(e);r?r.startSendingEvents(i):this._extensionTerminalAwaitingStart[e]={initialDimensions:i}}_setupExtHostProcessListeners(e,i){const n=new w;n.add(i.onProcessReady(o=>this._proxy.$sendProcessReady(e,o.pid,o.cwd,o.windowsPty))),n.add(i.onDidChangeProperty(o=>this._proxy.$sendProcessProperty(e,o))),this._bufferer.startBuffering(e,i.onProcessData),n.add(i.onProcessExit(o=>this._onProcessExit(e,o))),this._terminalProcesses.set(e,i);const r=this._extensionTerminalAwaitingStart[e];return r&&i instanceof x&&(i.startSendingEvents(r.initialDimensions),delete this._extensionTerminalAwaitingStart[e]),n}$acceptProcessAckDataEvent(e,i){this._terminalProcesses.get(e)?.acknowledgeDataEvent(i)}$acceptProcessInput(e,i){this._terminalProcesses.get(e)?.input(i)}$acceptTerminalInteraction(e){const i=this.getTerminalById(e);i?.setInteractedWith()&&this._onDidChangeTerminalState.fire(i.value)}$acceptTerminalSelection(e,i){this.getTerminalById(e)?.setSelection(i)}$acceptProcessResize(e,i,n){try{this._terminalProcesses.get(e)?.resize(i,n)}catch(r){if(r.code!=="EPIPE"&&r.code!=="ERR_IPC_CHANNEL_CLOSED")throw r}}$acceptProcessShutdown(e,i){this._terminalProcesses.get(e)?.shutdown(i)}$acceptProcessRequestInitialCwd(e){this._terminalProcesses.get(e)?.getInitialCwd().then(i=>this._proxy.$sendProcessProperty(e,{type:T.InitialCwd,value:i}))}$acceptProcessRequestCwd(e){this._terminalProcesses.get(e)?.getCwd().then(i=>this._proxy.$sendProcessProperty(e,{type:T.Cwd,value:i}))}$acceptProcessRequestLatency(e){return Promise.resolve(e)}registerLinkProvider(e){return this._linkProviders.add(e),this._linkProviders.size===1&&this._proxy.$startLinkProvider(),new E(()=>{this._linkProviders.delete(e),this._linkProviders.size===0&&this._proxy.$stopLinkProvider()})}registerProfileProvider(e,i,n){if(this._profileProviders.has(i))throw new Error(`Terminal profile provider "${i}" already registered`);return this._profileProviders.set(i,n),this._proxy.$registerProfileProvider(i,e.identifier.value),new E(()=>{this._profileProviders.delete(i),this._proxy.$unregisterProfileProvider(i)})}registerTerminalQuickFixProvider(e,i,n){if(this._quickFixProviders.has(e))throw new Error(`Terminal quick fix provider "${e}" is already registered`);return this._quickFixProviders.set(e,n),this._proxy.$registerQuickFixProvider(e,i),new E(()=>{this._quickFixProviders.delete(e),this._proxy.$unregisterQuickFixProvider(e)})}async $provideTerminalQuickFixes(e,i){const n=new _().token;if(n.isCancellationRequested)return;const r=this._quickFixProviders.get(e);if(!r)return;const o=await r.provideTerminalQuickFixes(i,n);if(o===null||Array.isArray(o)&&o.length===0)return;const s=new w;if(this._lastQuickFixCommands.value=s,!Array.isArray(o))return o?M.from(o,this._extHostCommands.converter,s):void 0;const l=[];for(const v of o){const h=M.from(v,this._extHostCommands.converter,s);h&&l.push(h)}return l}async $createContributedProfileTerminal(e,i){const n=new _().token;let r=await this._profileProviders.get(e)?.provideTerminalProfile(n);if(!n.isCancellationRequested){if(r&&!("options"in r)&&(r={options:r}),!r||!("options"in r))throw new Error(`No terminal profile options provided for id "${e}"`);if("pty"in r.options){this.createExtensionTerminal(r.options,i);return}this.createTerminalFromOptions(r.options,i)}}async $provideLinks(e,i){const n=this.getTerminalById(e);if(!n)return[];this._terminalLinkCache.delete(e),this._terminalLinkCancellationSource.get(e)?.dispose(!0);const o=new _;this._terminalLinkCancellationSource.set(e,o);const s=[],l={terminal:n.value,line:i},v=[];for(const c of this._linkProviders)v.push(R.withAsyncBody(async m=>{o.token.onCancellationRequested(()=>m({provider:c,links:[]}));const f=await c.provideTerminalLinks(l,o.token)||[];o.token.isCancellationRequested||m({provider:c,links:f})}));const h=await Promise.all(v);if(o.token.isCancellationRequested)return[];const D=new Map;for(const c of h)c&&c.links.length>0&&s.push(...c.links.map(m=>{const f={id:J++,startIndex:m.startIndex,length:m.length,label:m.tooltip};return D.set(f.id,{provider:c.provider,link:m}),f}));return this._terminalLinkCache.set(e,D),s}$activateLink(e,i){const n=this._terminalLinkCache.get(e)?.get(i);n&&n.provider.handleTerminalLink(n.link)}_onProcessExit(e,i){this._bufferer.stopBuffering(e),this._terminalProcesses.delete(e),delete this._extensionTerminalAwaitingStart[e];const n=this._terminalProcessDisposables[e];n&&(n.dispose(),delete this._terminalProcessDisposables[e]),this._proxy.$sendProcessExit(e,i)}getTerminalById(e){return this._getTerminalObjectById(this._terminals,e)}getTerminalIdByApiObject(e){const i=this._terminals.findIndex(n=>n.value===e);return i>=0?i:null}_getTerminalObjectById(e,i){const n=this._getTerminalObjectIndexById(e,i);return n!==null?e[n]:null}_getTerminalObjectIndexById(e,i){const n=e.findIndex(r=>r._id===i);return n>=0?n:null}getEnvironmentVariableCollection(e){let i=this._environmentVariableCollections.get(e.identifier.value);return i||(i=this._register(new $),this._setEnvironmentVariableCollection(e.identifier.value,i)),i.getScopedEnvironmentVariableCollection(void 0)}_syncEnvironmentVariableCollection(e,i){const n=q(i.map),r=U(i.descriptionMap);this._proxy.$setEnvironmentVariableCollection(e,i.persistent,n.length===0?void 0:n,r)}$initEnvironmentVariableCollections(e){e.forEach(i=>{const n=i[0],r=this._register(new $(i[1]));this._setEnvironmentVariableCollection(n,r)})}$acceptDefaultProfile(e,i){const n=this._defaultProfile;this._defaultProfile=e,this._defaultAutomationProfile=i,n?.path!==e.path&&this._onDidChangeShell.fire(e.path)}_setEnvironmentVariableCollection(e,i){this._environmentVariableCollections.set(e,i),this._register(i.onDidChangeCollection(()=>{this._syncEnvironmentVariableCollection(e,i)}))}};u=b([p(1,k),p(2,V)],u);class $ extends y{map=new Map;scopedCollections=new Map;descriptionMap=new Map;_persistent=!0;get persistent(){return this._persistent}set persistent(t){this._persistent=t,this._onDidChangeCollection.fire()}_onDidChangeCollection=new d;get onDidChangeCollection(){return this._onDidChangeCollection&&this._onDidChangeCollection.event}constructor(t){super(),this.map=new Map(t)}getScopedEnvironmentVariableCollection(t){const e=this.getScopeKey(t);let i=this.scopedCollections.get(e);return i||(i=new X(this,t),this.scopedCollections.set(e,i),this._register(i.onDidChangeCollection(()=>this._onDidChangeCollection.fire()))),i}replace(t,e,i,n){this._setIfDiffers(t,{value:e,type:C.Replace,options:i??{applyAtProcessCreation:!0},scope:n})}append(t,e,i,n){this._setIfDiffers(t,{value:e,type:C.Append,options:i??{applyAtProcessCreation:!0},scope:n})}prepend(t,e,i,n){this._setIfDiffers(t,{value:e,type:C.Prepend,options:i??{applyAtProcessCreation:!0},scope:n})}_setIfDiffers(t,e){if(e.options&&e.options.applyAtProcessCreation===!1&&!e.options.applyAtShellIntegration)throw new Error("EnvironmentVariableMutatorOptions must apply at either process creation or shell integration");const i=this.getKey(t,e.scope),n=this.map.get(i),r=e.options?{applyAtProcessCreation:e.options.applyAtProcessCreation??!1,applyAtShellIntegration:e.options.applyAtShellIntegration??!1}:{applyAtProcessCreation:!0};if(!n||n.value!==e.value||n.type!==e.type||n.options?.applyAtProcessCreation!==r.applyAtProcessCreation||n.options?.applyAtShellIntegration!==r.applyAtShellIntegration||n.scope?.workspaceFolder?.index!==e.scope?.workspaceFolder?.index){const o=this.getKey(t,e.scope),s={variable:t,...e,options:r};this.map.set(o,s),this._onDidChangeCollection.fire()}}get(t,e){const i=this.getKey(t,e),n=this.map.get(i);return n?F(n):void 0}getKey(t,e){const i=this.getScopeKey(e);return i.length?`${t}:::${i}`:t}getScopeKey(t){return this.getWorkspaceKey(t?.workspaceFolder)??""}getWorkspaceKey(t){return t?t.uri.toString():void 0}getVariableMap(t){const e=new Map;for(const[i,n]of this.map)this.getScopeKey(n.scope)===this.getScopeKey(t)&&e.set(n.variable,F(n));return e}delete(t,e){const i=this.getKey(t,e);this.map.delete(i),this._onDidChangeCollection.fire()}clear(t){if(t?.workspaceFolder){for(const[e,i]of this.map)i.scope?.workspaceFolder?.index===t.workspaceFolder.index&&this.map.delete(e);this.clearDescription(t)}else this.map.clear(),this.descriptionMap.clear();this._onDidChangeCollection.fire()}setDescription(t,e){const i=this.getScopeKey(e),n=this.descriptionMap.get(i);if(!n||n.description!==t){let r;typeof t=="string"?r=t:r=t?.value.split(`

`)[0];const o={description:r,scope:e};this.descriptionMap.set(i,o),this._onDidChangeCollection.fire()}}getDescription(t){const e=this.getScopeKey(t);return this.descriptionMap.get(e)?.description}clearDescription(t){const e=this.getScopeKey(t);this.descriptionMap.delete(e)}}class X{constructor(t,e){this.collection=t;this.scope=e}get persistent(){return this.collection.persistent}set persistent(t){this.collection.persistent=t}_onDidChangeCollection=new d;get onDidChangeCollection(){return this._onDidChangeCollection&&this._onDidChangeCollection.event}getScoped(t){return this.collection.getScopedEnvironmentVariableCollection(t)}replace(t,e,i){this.collection.replace(t,e,i,this.scope)}append(t,e,i){this.collection.append(t,e,i,this.scope)}prepend(t,e,i){this.collection.prepend(t,e,i,this.scope)}get(t){return this.collection.get(t,this.scope)}forEach(t,e){this.collection.getVariableMap(this.scope).forEach((i,n)=>t.call(e,n,i,this),this.scope)}[Symbol.iterator](){return this.collection.getVariableMap(this.scope).entries()}delete(t){this.collection.delete(t,this.scope),this._onDidChangeCollection.fire(void 0)}clear(){this.collection.clear(this.scope)}set description(t){this.collection.setDescription(t,this.scope)}get description(){return this.collection.getDescription(this.scope)}}let g=class extends u{constructor(t,e){super(!1,t,e)}createTerminal(t,e,i){throw new I}createTerminalFromOptions(t,e){throw new I}};g=b([p(0,k),p(1,V)],g);function A(a){if(!(!a||typeof a=="string"))return"id"in a?{id:a.id,color:a.color}:a}function Y(a){return P.isThemeColor(a)?a:void 0}function F(a){const t={...a};return delete t.scope,t.options=t.options??void 0,delete t.variable,t}export{u as BaseExtHostTerminalService,O as ExtHostTerminal,Ye as IExtHostTerminalService,g as WorkerExtHostTerminalService};
