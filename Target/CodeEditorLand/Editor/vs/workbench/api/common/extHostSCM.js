var J=Object.defineProperty;var K=Object.getOwnPropertyDescriptor;var C=(o,e,t,r)=>{for(var s=r>1?void 0:r?K(e,t):e,n=o.length-1,i;n>=0;n--)(i=o[n])&&(s=(r?i(e,t,s):i(s))||s);return r&&s&&J(e,t,s),s},U=(o,e)=>(t,r)=>e(t,r,o);import{equals as N,sortedDiff as X}from"../../../base/common/arrays.js";import{asPromise as D}from"../../../base/common/async.js";import"../../../base/common/cancellation.js";import{comparePaths as g}from"../../../base/common/comparers.js";import{debounce as B}from"../../../base/common/decorators.js";import{Emitter as m,Event as T}from"../../../base/common/event.js";import"../../../base/common/htmlContent.js";import{DisposableStore as f,MutableDisposable as S}from"../../../base/common/lifecycle.js";import{MarshalledId as I}from"../../../base/common/marshallingIds.js";import{Schemas as y}from"../../../base/common/network.js";import{isLinux as Y}from"../../../base/common/platform.js";import"../../../base/common/sequence.js";import{ThemeIcon as $}from"../../../base/common/themables.js";import{URI as l}from"../../../base/common/uri.js";import{ExtensionIdentifierMap as Z}from"../../../platform/extensions/common/extensions.js";import{ILogService as ee}from"../../../platform/log/common/log.js";import{checkProposedApiEnabled as p,isProposedApiEnabled as P}from"../../services/extensions/common/extensions.js";import{MainContext as k}from"./extHost.protocol.js";import"./extHostCommands.js";import"./extHostDocuments.js";import{MarkdownString as te}from"./extHostTypeConverters.js";function G(o){return o instanceof l}function oe(o,e){return o.scheme===y.file&&e.scheme===y.file&&Y?o.toString()===e.toString():o.toString().toLowerCase()===e.toString().toLowerCase()}function x(o){if(o)return typeof o.iconPath=="string"?l.file(o.iconPath):l.isUri(o.iconPath)||$.isThemeIcon(o.iconPath)?o.iconPath:void 0}function re(o){if(o){if(l.isUri(o))return o;if($.isThemeIcon(o))return o;{const e=o;return{light:e.light,dark:e.dark}}}else return}function ne(o){const e=o.labels?.map(t=>({title:t.title,icon:re(t.icon)}));return{...o,labels:e}}function R(o,e){if(!o.iconPath&&!e.iconPath)return 0;if(o.iconPath){if(!e.iconPath)return 1}else return-1;const t=typeof o.iconPath=="string"?o.iconPath:l.isUri(o.iconPath)?o.iconPath.fsPath:o.iconPath.id,r=typeof e.iconPath=="string"?e.iconPath:l.isUri(e.iconPath)?e.iconPath.fsPath:e.iconPath.id;return g(t,r)}function ie(o,e){let t=0;if(o.strikeThrough!==e.strikeThrough)return o.strikeThrough?1:-1;if(o.faded!==e.faded)return o.faded?1:-1;if(o.tooltip!==e.tooltip)return(o.tooltip||"").localeCompare(e.tooltip||"");if(t=R(o,e),t!==0)return t;if(o.light&&e.light)t=R(o.light,e.light);else{if(o.light)return 1;if(e.light)return-1}if(t!==0)return t;if(o.dark&&e.dark)t=R(o.dark,e.dark);else{if(o.dark)return 1;if(e.dark)return-1}return t}function se(o,e){if(o.command!==e.command)return o.command<e.command?-1:1;if(o.title!==e.title)return o.title<e.title?-1:1;if(o.tooltip!==e.tooltip){if(o.tooltip!==void 0&&e.tooltip!==void 0)return o.tooltip<e.tooltip?-1:1;if(o.tooltip!==void 0)return 1;if(e.tooltip!==void 0)return-1}if(o.arguments===e.arguments)return 0;if(o.arguments)if(e.arguments){if(o.arguments.length!==e.arguments.length)return o.arguments.length-e.arguments.length}else return 1;else return-1;for(let t=0;t<o.arguments.length;t++){const r=o.arguments[t],s=e.arguments[t];if(r!==s&&!(G(r)&&G(s)&&oe(r,s)))return r<s?-1:1}return 0}function V(o,e){let t=g(o.resourceUri.fsPath,e.resourceUri.fsPath,!0);if(t!==0)return t;if(o.command&&e.command)t=se(o.command,e.command);else{if(o.command)return 1;if(e.command)return-1}if(t!==0)return t;if(o.decorations&&e.decorations)t=ie(o.decorations,e.decorations);else{if(o.decorations)return 1;if(e.decorations)return-1}if(t!==0)return t;if(o.multiFileDiffEditorModifiedUri&&e.multiFileDiffEditorModifiedUri)t=g(o.multiFileDiffEditorModifiedUri.fsPath,e.multiFileDiffEditorModifiedUri.fsPath,!0);else{if(o.multiFileDiffEditorModifiedUri)return 1;if(e.multiFileDiffEditorModifiedUri)return-1}if(t!==0)return t;if(o.multiDiffEditorOriginalUri&&e.multiDiffEditorOriginalUri)t=g(o.multiDiffEditorOriginalUri.fsPath,e.multiDiffEditorOriginalUri.fsPath,!0);else{if(o.multiDiffEditorOriginalUri)return 1;if(e.multiDiffEditorOriginalUri)return-1}return t}function ae(o,e){for(let t=0;t<o.length;t++)if(o[t]!==e[t])return!1;return!0}function ue(o,e){return o.command===e.command&&o.title===e.title&&o.tooltip===e.tooltip&&(o.arguments&&e.arguments?ae(o.arguments,e.arguments):o.arguments===e.arguments)}function de(o,e){return N(o,e,ue)}class ce{constructor(e,t,r,s,n){this._extension=e;this._sourceControlHandle=s;this._documentUri=n;this.#t=t,this.#e=r}#e;#t;_value="";get value(){return this._value}set value(e){e=e??"",this.#e.$setInputBoxValue(this._sourceControlHandle,e),this.updateValue(e)}_onDidChange=new m;get onDidChange(){return this._onDidChange.event}_placeholder="";get placeholder(){return this._placeholder}set placeholder(e){this.#e.$setInputBoxPlaceholder(this._sourceControlHandle,e),this._placeholder=e}_validateInput;get validateInput(){return p(this._extension,"scmValidation"),this._validateInput}set validateInput(e){if(p(this._extension,"scmValidation"),e&&typeof e!="function")throw new Error(`[${this._extension.identifier.value}]: Invalid SCM input box validation function`);this._validateInput=e,this.#e.$setValidationProviderIsEnabled(this._sourceControlHandle,!!e)}_enabled=!0;get enabled(){return this._enabled}set enabled(e){e=!!e,this._enabled!==e&&(this._enabled=e,this.#e.$setInputBoxEnablement(this._sourceControlHandle,e))}_visible=!0;get visible(){return this._visible}set visible(e){e=!!e,this._visible!==e&&(this._visible=e,this.#e.$setInputBoxVisibility(this._sourceControlHandle,e))}get document(){return p(this._extension,"scmTextDocument"),this.#t.getDocument(this._documentUri)}showValidationMessage(e,t){p(this._extension,"scmValidation"),this.#e.$showValidationMessage(this._sourceControlHandle,e,t)}$onInputBoxValueChange(e){this.updateValue(e)}updateValue(e){this._value=e,this._onDidChange.fire(e)}}class E{constructor(e,t,r,s,n,i,u){this._proxy=e;this._commands=t;this._sourceControlHandle=r;this._id=s;this._label=n;this.multiDiffEditorEnableViewChanges=i;this._extension=u}static _handlePool=0;_resourceHandlePool=0;_resourceStates=[];_resourceStatesMap=new Map;_resourceStatesCommandsMap=new Map;_resourceStatesDisposablesMap=new Map;_onDidUpdateResourceStates=new m;onDidUpdateResourceStates=this._onDidUpdateResourceStates.event;_disposed=!1;get disposed(){return this._disposed}_onDidDispose=new m;onDidDispose=this._onDidDispose.event;_handlesSnapshot=[];_resourceSnapshot=[];get id(){return this._id}get label(){return this._label}set label(e){this._label=e,this._proxy.$updateGroupLabel(this._sourceControlHandle,this.handle,e)}_hideWhenEmpty=void 0;get hideWhenEmpty(){return this._hideWhenEmpty}set hideWhenEmpty(e){this._hideWhenEmpty=e,this._proxy.$updateGroup(this._sourceControlHandle,this.handle,this.features)}get features(){return{hideWhenEmpty:this.hideWhenEmpty}}get resourceStates(){return[...this._resourceStates]}set resourceStates(e){this._resourceStates=[...e],this._onDidUpdateResourceStates.fire()}handle=E._handlePool++;getResourceState(e){return this._resourceStatesMap.get(e)}$executeResourceCommand(e,t){const r=this._resourceStatesCommandsMap.get(e);return r?D(()=>this._commands.executeCommand(r.command,...r.arguments||[],t)):Promise.resolve(void 0)}_takeResourceStateSnapshot(){const e=[...this._resourceStates].sort(V),r=X(this._resourceSnapshot,e,V).map(i=>{const u=i.toInsert.map(a=>{const d=this._resourceHandlePool++;this._resourceStatesMap.set(d,a);const _=a.resourceUri;let c;if(a.command)if(a.command.command==="vscode.open"||a.command.command==="vscode.diff"||a.command.command==="vscode.changes"){const w=new f;c=this._commands.converter.toInternal(a.command,w),this._resourceStatesDisposablesMap.set(d,w)}else this._resourceStatesCommandsMap.set(d,a.command);const b=P(this._extension,"scmMultiDiffEditor"),A=b?a.multiDiffEditorOriginalUri:void 0,q=b?a.multiFileDiffEditorModifiedUri:void 0,H=x(a.decorations),F=a.decorations&&x(a.decorations.light)||H,L=a.decorations&&x(a.decorations.dark)||H,O=[F,L],W=a.decorations&&a.decorations.tooltip||"",Q=a.decorations&&!!a.decorations.strikeThrough,j=a.decorations&&!!a.decorations.faded,z=a.contextValue||"";return{rawResource:[d,_,O,W,Q,j,z,c,A,q],handle:d}});return{start:i.start,deleteCount:i.deleteCount,toInsert:u}}),s=r.map(({start:i,deleteCount:u,toInsert:a})=>[i,u,a.map(d=>d.rawResource)]),n=r.reverse();for(const{start:i,deleteCount:u,toInsert:a}of n){const d=a.map(c=>c.handle),_=this._handlesSnapshot.splice(i,u,...d);for(const c of _)this._resourceStatesMap.delete(c),this._resourceStatesCommandsMap.delete(c),this._resourceStatesDisposablesMap.get(c)?.dispose(),this._resourceStatesDisposablesMap.delete(c)}return this._resourceSnapshot=e,s}dispose(){this._disposed=!0,this._onDidDispose.fire()}}const v=class v{constructor(e,t,r,s,n,i,u){this._extension=e;this._commands=s;this._id=n;this._label=i;this._rootUri=u;this.#e=r;const a=l.from({scheme:y.vscodeSourceControl,path:`${n}/scm${this.handle}/input`,query:u?`rootUri=${encodeURIComponent(u.toString())}`:void 0});this._inputBox=new ce(e,t,this.#e,this.handle,a),this.#e.$registerSourceControl(this.handle,n,i,u,a)}static _handlePool=0;#e;_groups=new Map;get id(){return this._id}get label(){return this._label}get rootUri(){return this._rootUri}_inputBox;get inputBox(){return this._inputBox}_count=void 0;get count(){return this._count}set count(e){this._count!==e&&(this._count=e,this.#e.$updateSourceControl(this.handle,{count:e}))}_quickDiffProvider=void 0;get quickDiffProvider(){return this._quickDiffProvider}set quickDiffProvider(e){this._quickDiffProvider=e;let t;P(this._extension,"quickDiffProvider")&&(t=e?.label),this.#e.$updateSourceControl(this.handle,{hasQuickDiffProvider:!!e,quickDiffLabel:t})}_historyProvider;_historyProviderDisposable=new S;_historyProviderCurrentHistoryItemGroup;get historyProvider(){return p(this._extension,"scmHistoryProvider"),this._historyProvider}set historyProvider(e){p(this._extension,"scmHistoryProvider"),this._historyProvider=e,this._historyProviderDisposable.value=new f,this.#e.$updateSourceControl(this.handle,{hasHistoryProvider:!!e}),e&&this._historyProviderDisposable.value.add(e.onDidChangeCurrentHistoryItemGroup(()=>{this._historyProviderCurrentHistoryItemGroup=e?.currentHistoryItemGroup,this.#e.$onDidChangeHistoryProviderCurrentHistoryItemGroup(this.handle,this._historyProviderCurrentHistoryItemGroup)}))}_commitTemplate=void 0;get commitTemplate(){return this._commitTemplate}set commitTemplate(e){e!==this._commitTemplate&&(this._commitTemplate=e,this.#e.$updateSourceControl(this.handle,{commitTemplate:e}))}_acceptInputDisposables=new S;_acceptInputCommand=void 0;get acceptInputCommand(){return this._acceptInputCommand}set acceptInputCommand(e){this._acceptInputDisposables.value=new f,this._acceptInputCommand=e;const t=this._commands.converter.toInternal(e,this._acceptInputDisposables.value);this.#e.$updateSourceControl(this.handle,{acceptInputCommand:t})}_actionButtonDisposables=new S;_actionButton;get actionButton(){return p(this._extension,"scmActionButton"),this._actionButton}set actionButton(e){p(this._extension,"scmActionButton"),this._actionButtonDisposables.value=new f,this._actionButton=e;const t=e!==void 0?{command:this._commands.converter.toInternal(e.command,this._actionButtonDisposables.value),secondaryCommands:e.secondaryCommands?.map(r=>r.map(s=>this._commands.converter.toInternal(s,this._actionButtonDisposables.value))),description:e.description,enabled:e.enabled}:void 0;this.#e.$updateSourceControl(this.handle,{actionButton:t??null})}_statusBarDisposables=new S;_statusBarCommands=void 0;get statusBarCommands(){return this._statusBarCommands}set statusBarCommands(e){if(this._statusBarCommands&&e&&de(this._statusBarCommands,e))return;this._statusBarDisposables.value=new f,this._statusBarCommands=e;const t=(e||[]).map(r=>this._commands.converter.toInternal(r,this._statusBarDisposables.value));this.#e.$updateSourceControl(this.handle,{statusBarCommands:t})}_selected=!1;get selected(){return this._selected}_onDidChangeSelection=new m;onDidChangeSelection=this._onDidChangeSelection.event;handle=v._handlePool++;createdResourceGroups=new Map;updatedResourceGroups=new Set;createResourceGroup(e,t,r){const s=P(this._extension,"scmMultiDiffEditor")&&r?.multiDiffEditorEnableViewChanges===!0,n=new E(this.#e,this._commands,this.handle,e,t,s,this._extension),i=T.once(n.onDidDispose)(()=>this.createdResourceGroups.delete(n));return this.createdResourceGroups.set(n,i),this.eventuallyAddResourceGroups(),n}eventuallyAddResourceGroups(){const e=[],t=[];for(const[r,s]of this.createdResourceGroups){s.dispose();const n=r.onDidUpdateResourceStates(()=>{this.updatedResourceGroups.add(r),this.eventuallyUpdateResourceStates()});T.once(r.onDidDispose)(()=>{this.updatedResourceGroups.delete(r),n.dispose(),this._groups.delete(r.handle),this.#e.$unregisterGroup(this.handle,r.handle)}),e.push([r.handle,r.id,r.label,r.features,r.multiDiffEditorEnableViewChanges]);const i=r._takeResourceStateSnapshot();i.length>0&&t.push([r.handle,i]),this._groups.set(r.handle,r)}this.#e.$registerGroups(this.handle,e,t),this.createdResourceGroups.clear()}eventuallyUpdateResourceStates(){const e=[];this.updatedResourceGroups.forEach(t=>{const r=t._takeResourceStateSnapshot();r.length!==0&&e.push([t.handle,r])}),e.length>0&&this.#e.$spliceResourceStates(this.handle,e),this.updatedResourceGroups.clear()}getResourceGroup(e){return this._groups.get(e)}setSelectionState(e){this._selected=e,this._onDidChangeSelection.fire(e)}dispose(){this._acceptInputDisposables.dispose(),this._actionButtonDisposables.dispose(),this._statusBarDisposables.dispose(),this._groups.forEach(e=>e.dispose()),this.#e.$unregisterSourceControl(this.handle)}};C([B(100)],v.prototype,"eventuallyAddResourceGroups",1),C([B(100)],v.prototype,"eventuallyUpdateResourceStates",1);let M=v,h=class{constructor(e,t,r,s){this._commands=t;this._extHostDocuments=r;this.logService=s;this._proxy=e.getProxy(k.MainThreadSCM),this._telemetry=e.getProxy(k.MainThreadTelemetry),t.registerArgumentProcessor({processArgument:n=>{if(n&&n.$mid===I.ScmResource){const i=this._sourceControls.get(n.sourceControlHandle);if(!i)return n;const u=i.getResourceGroup(n.groupHandle);return u?u.getResourceState(n.handle):n}else if(n&&n.$mid===I.ScmResourceGroup){const i=this._sourceControls.get(n.sourceControlHandle);return i?i.getResourceGroup(n.groupHandle):n}else if(n&&n.$mid===I.ScmProvider){const i=this._sourceControls.get(n.handle);return i||n}return n}})}static _handlePool=0;_proxy;_telemetry;_sourceControls=new Map;_sourceControlsByExtension=new Z;_onDidChangeActiveProvider=new m;get onDidChangeActiveProvider(){return this._onDidChangeActiveProvider.event}_selectedSourceControlHandle;createSourceControl(e,t,r,s){this.logService.trace("ExtHostSCM#createSourceControl",e.identifier.value,t,r,s),this._telemetry.$publicLog2("api/scm/createSourceControl",{extensionId:e.identifier.value});const n=h._handlePool++,i=new M(e,this._extHostDocuments,this._proxy,this._commands,t,r,s);this._sourceControls.set(n,i);const u=this._sourceControlsByExtension.get(e.identifier)||[];return u.push(i),this._sourceControlsByExtension.set(e.identifier,u),i}getLastInputBox(e){this.logService.trace("ExtHostSCM#getLastInputBox",e.identifier.value);const t=this._sourceControlsByExtension.get(e.identifier),r=t&&t[t.length-1];return r&&r.inputBox}$provideOriginalResource(e,t,r){const s=l.revive(t);this.logService.trace("ExtHostSCM#$provideOriginalResource",e,s.toString());const n=this._sourceControls.get(e);return!n||!n.quickDiffProvider||!n.quickDiffProvider.provideOriginalResource?Promise.resolve(null):D(()=>n.quickDiffProvider.provideOriginalResource(s,r)).then(i=>i||null)}$onInputBoxValueChange(e,t){this.logService.trace("ExtHostSCM#$onInputBoxValueChange",e);const r=this._sourceControls.get(e);return r&&r.inputBox.$onInputBoxValueChange(t),Promise.resolve(void 0)}$executeResourceCommand(e,t,r,s){this.logService.trace("ExtHostSCM#$executeResourceCommand",e,t,r);const n=this._sourceControls.get(e);if(!n)return Promise.resolve(void 0);const i=n.getResourceGroup(t);return i?i.$executeResourceCommand(r,s):Promise.resolve(void 0)}$validateInput(e,t,r){this.logService.trace("ExtHostSCM#$validateInput",e);const s=this._sourceControls.get(e);return!s||!s.inputBox.validateInput?Promise.resolve(void 0):D(()=>s.inputBox.validateInput(t,r)).then(n=>{if(!n)return Promise.resolve(void 0);const i=te.fromStrict(n.message);return i?Promise.resolve([i,n.type]):Promise.resolve(void 0)})}$setSelectedSourceControl(e){return this.logService.trace("ExtHostSCM#$setSelectedSourceControl",e),e!==void 0&&this._sourceControls.get(e)?.setSelectionState(!0),this._selectedSourceControlHandle!==void 0&&this._sourceControls.get(this._selectedSourceControlHandle)?.setSelectionState(!1),this._selectedSourceControlHandle=e,Promise.resolve(void 0)}async $resolveHistoryItemGroupCommonAncestor(e,t,r){return await this._sourceControls.get(e)?.historyProvider?.resolveHistoryItemGroupCommonAncestor(t,r)??void 0}async $provideHistoryItems(e,t,r){return(await this._sourceControls.get(e)?.historyProvider?.provideHistoryItems(t,r))?.map(i=>ne(i))??void 0}async $provideHistoryItemChanges(e,t,r,s){return await this._sourceControls.get(e)?.historyProvider?.provideHistoryItemChanges(t,r,s)??void 0}};h=C([U(3,ee)],h);export{h as ExtHostSCM,ce as ExtHostSCMInputBox};
