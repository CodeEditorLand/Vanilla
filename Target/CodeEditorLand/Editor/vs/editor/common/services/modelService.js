var y=Object.defineProperty;var O=Object.getOwnPropertyDescriptor;var x=(h,p,e,i)=>{for(var t=i>1?void 0:i?O(p,e):p,n=h.length-1,o;n>=0;n--)(o=h[n])&&(t=(i?o(p,e,t):o(t))||t);return i&&t&&y(p,e,t),t},v=(h,p)=>(e,i)=>p(e,i,h);import{Emitter as L}from"../../../../vs/base/common/event.js";import{StringSHA1 as T}from"../../../../vs/base/common/hash.js";import{Disposable as z,DisposableStore as D}from"../../../../vs/base/common/lifecycle.js";import{Schemas as b}from"../../../../vs/base/common/network.js";import{equals as A}from"../../../../vs/base/common/objects.js";import*as S from"../../../../vs/base/common/platform.js";import"../../../../vs/base/common/uri.js";import{EditOperation as U}from"../../../../vs/editor/common/core/editOperation.js";import{Range as I}from"../../../../vs/editor/common/core/range.js";import{EDITOR_MODEL_DEFAULTS as M}from"../../../../vs/editor/common/core/textModelDefaults.js";import"../../../../vs/editor/common/languages/language.js";import{PLAINTEXT_LANGUAGE_ID as F}from"../../../../vs/editor/common/languages/modesRegistry.js";import{DefaultEndOfLine as C,EndOfLinePreference as k,EndOfLineSequence as R}from"../../../../vs/editor/common/model.js";import{isEditStackElement as _}from"../../../../vs/editor/common/model/editStack.js";import{createTextBuffer as P,TextModel as H}from"../../../../vs/editor/common/model/textModel.js";import"../../../../vs/editor/common/services/model.js";import{ITextResourcePropertiesService as B}from"../../../../vs/editor/common/services/textResourceConfiguration.js";import"../../../../vs/editor/common/textModelEvents.js";import{IConfigurationService as W}from"../../../../vs/platform/configuration/common/configuration.js";import{IInstantiationService as w}from"../../../../vs/platform/instantiation/common/instantiation.js";import{IUndoRedoService as V}from"../../../../vs/platform/undoRedo/common/undoRedo.js";function f(h){return h.toString()}class N{constructor(p,e,i){this.model=p;this.model=p,this._modelEventListeners.add(p.onWillDispose(()=>e(p))),this._modelEventListeners.add(p.onDidChangeLanguage(t=>i(p,t)))}_modelEventListeners=new D;dispose(){this._modelEventListeners.dispose()}}const j=S.isLinux||S.isMacintosh?C.LF:C.CRLF;class X{constructor(p,e,i,t,n,o,a,r){this.uri=p;this.initialUndoRedoSnapshot=e;this.time=i;this.sharesUndoRedoStack=t;this.heapSize=n;this.sha1=o;this.versionId=a;this.alternativeVersionId=r}}let c=class extends z{constructor(e,i,t,n){super();this._configurationService=e;this._resourcePropertiesService=i;this._undoRedoService=t;this._instantiationService=n;this._modelCreationOptionsByLanguageAndResource=Object.create(null),this._models={},this._disposedModels=new Map,this._disposedModelsHeapSize=0,this._register(this._configurationService.onDidChangeConfiguration(o=>this._updateModelOptions(o))),this._updateModelOptions(void 0)}static MAX_MEMORY_FOR_CLOSED_FILES_UNDO_STACK=20*1024*1024;_serviceBrand;_onModelAdded=this._register(new L);onModelAdded=this._onModelAdded.event;_onModelRemoved=this._register(new L);onModelRemoved=this._onModelRemoved.event;_onModelModeChanged=this._register(new L);onModelLanguageChanged=this._onModelModeChanged.event;_modelCreationOptionsByLanguageAndResource;_models;_disposedModels;_disposedModelsHeapSize;static _readModelOptions(e,i){let t=M.tabSize;if(e.editor&&typeof e.editor.tabSize<"u"){const m=parseInt(e.editor.tabSize,10);isNaN(m)||(t=m),t<1&&(t=1)}let n="tabSize";if(e.editor&&typeof e.editor.indentSize<"u"&&e.editor.indentSize!=="tabSize"){const m=parseInt(e.editor.indentSize,10);isNaN(m)||(n=Math.max(m,1))}let o=M.insertSpaces;e.editor&&typeof e.editor.insertSpaces<"u"&&(o=e.editor.insertSpaces==="false"?!1:!!e.editor.insertSpaces);let a=j;const r=e.eol;r===`\r
`?a=C.CRLF:r===`
`&&(a=C.LF);let d=M.trimAutoWhitespace;e.editor&&typeof e.editor.trimAutoWhitespace<"u"&&(d=e.editor.trimAutoWhitespace==="false"?!1:!!e.editor.trimAutoWhitespace);let s=M.detectIndentation;e.editor&&typeof e.editor.detectIndentation<"u"&&(s=e.editor.detectIndentation==="false"?!1:!!e.editor.detectIndentation);let l=M.largeFileOptimizations;e.editor&&typeof e.editor.largeFileOptimizations<"u"&&(l=e.editor.largeFileOptimizations==="false"?!1:!!e.editor.largeFileOptimizations);let g=M.bracketPairColorizationOptions;return e.editor?.bracketPairColorization&&typeof e.editor.bracketPairColorization=="object"&&(g={enabled:!!e.editor.bracketPairColorization.enabled,independentColorPoolPerBracketType:!!e.editor.bracketPairColorization.independentColorPoolPerBracketType}),{isForSimpleWidget:i,tabSize:t,indentSize:n,insertSpaces:o,detectIndentation:s,defaultEOL:a,trimAutoWhitespace:d,largeFileOptimizations:l,bracketPairColorizationOptions:g}}_getEOL(e,i){if(e)return this._resourcePropertiesService.getEOL(e,i);const t=this._configurationService.getValue("files.eol",{overrideIdentifier:i});return t&&typeof t=="string"&&t!=="auto"?t:S.OS===S.OperatingSystem.Linux||S.OS===S.OperatingSystem.Macintosh?`
`:`\r
`}_shouldRestoreUndoStack(){const e=this._configurationService.getValue("files.restoreUndoStack");return typeof e=="boolean"?e:!0}getCreationOptions(e,i,t){const n=typeof e=="string"?e:e.languageId;let o=this._modelCreationOptionsByLanguageAndResource[n+i];if(!o){const a=this._configurationService.getValue("editor",{overrideIdentifier:n,resource:i}),r=this._getEOL(i,n);o=c._readModelOptions({editor:a,eol:r},t),this._modelCreationOptionsByLanguageAndResource[n+i]=o}return o}_updateModelOptions(e){const i=this._modelCreationOptionsByLanguageAndResource;this._modelCreationOptionsByLanguageAndResource=Object.create(null);const t=Object.keys(this._models);for(let n=0,o=t.length;n<o;n++){const a=t[n],r=this._models[a],d=r.model.getLanguageId(),s=r.model.uri;if(e&&!e.affectsConfiguration("editor",{overrideIdentifier:d,resource:s})&&!e.affectsConfiguration("files.eol",{overrideIdentifier:d,resource:s}))continue;const l=i[d+s],g=this.getCreationOptions(d,s,r.model.isForSimpleWidget);c._setModelOptionsForModel(r.model,g,l)}}static _setModelOptionsForModel(e,i,t){t&&t.defaultEOL!==i.defaultEOL&&e.getLineCount()===1&&e.setEOL(i.defaultEOL===C.LF?R.LF:R.CRLF),!(t&&t.detectIndentation===i.detectIndentation&&t.insertSpaces===i.insertSpaces&&t.tabSize===i.tabSize&&t.indentSize===i.indentSize&&t.trimAutoWhitespace===i.trimAutoWhitespace&&A(t.bracketPairColorizationOptions,i.bracketPairColorizationOptions))&&(i.detectIndentation?(e.detectIndentation(i.insertSpaces,i.tabSize),e.updateOptions({trimAutoWhitespace:i.trimAutoWhitespace,bracketColorizationOptions:i.bracketPairColorizationOptions})):e.updateOptions({insertSpaces:i.insertSpaces,tabSize:i.tabSize,indentSize:i.indentSize,trimAutoWhitespace:i.trimAutoWhitespace,bracketColorizationOptions:i.bracketPairColorizationOptions}))}_insertDisposedModel(e){this._disposedModels.set(f(e.uri),e),this._disposedModelsHeapSize+=e.heapSize}_removeDisposedModel(e){const i=this._disposedModels.get(f(e));return i&&(this._disposedModelsHeapSize-=i.heapSize),this._disposedModels.delete(f(e)),i}_ensureDisposedModelsHeapSize(e){if(this._disposedModelsHeapSize>e){const i=[];for(this._disposedModels.forEach(t=>{t.sharesUndoRedoStack||i.push(t)}),i.sort((t,n)=>t.time-n.time);i.length>0&&this._disposedModelsHeapSize>e;){const t=i.shift();this._removeDisposedModel(t.uri),t.initialUndoRedoSnapshot!==null&&this._undoRedoService.restoreSnapshot(t.initialUndoRedoSnapshot)}}}_createModelData(e,i,t,n){const o=this.getCreationOptions(i,t,n),a=this._instantiationService.createInstance(H,e,i,o,t);if(t&&this._disposedModels.has(f(t))){const s=this._removeDisposedModel(t),l=this._undoRedoService.getElements(t),g=this._getSHA1Computer(),m=g.canComputeSHA1(a)?g.computeSHA1(a)===s.sha1:!1;if(m||s.sharesUndoRedoStack){for(const u of l.past)_(u)&&u.matchesResource(t)&&u.setModel(a);for(const u of l.future)_(u)&&u.matchesResource(t)&&u.setModel(a);this._undoRedoService.setElementsValidFlag(t,!0,u=>_(u)&&u.matchesResource(t)),m&&(a._overwriteVersionId(s.versionId),a._overwriteAlternativeVersionId(s.alternativeVersionId),a._overwriteInitialUndoRedoSnapshot(s.initialUndoRedoSnapshot))}else s.initialUndoRedoSnapshot!==null&&this._undoRedoService.restoreSnapshot(s.initialUndoRedoSnapshot)}const r=f(a.uri);if(this._models[r])throw new Error("ModelService: Cannot add model because it already exists!");const d=new N(a,s=>this._onWillDispose(s),(s,l)=>this._onDidChangeLanguage(s,l));return this._models[r]=d,d}updateModel(e,i){const t=this.getCreationOptions(e.getLanguageId(),e.uri,e.isForSimpleWidget),{textBuffer:n,disposable:o}=P(i,t.defaultEOL);if(e.equalsTextBuffer(n)){o.dispose();return}e.pushStackElement(),e.pushEOL(n.getEOL()===`\r
`?R.CRLF:R.LF),e.pushEditOperations([],c._computeEdits(e,n),()=>[]),e.pushStackElement(),o.dispose()}static _commonPrefix(e,i,t,n,o,a){const r=Math.min(i,o);let d=0;for(let s=0;s<r&&e.getLineContent(t+s)===n.getLineContent(a+s);s++)d++;return d}static _commonSuffix(e,i,t,n,o,a){const r=Math.min(i,o);let d=0;for(let s=0;s<r&&e.getLineContent(t+i-s)===n.getLineContent(a+o-s);s++)d++;return d}static _computeEdits(e,i){const t=e.getLineCount(),n=i.getLineCount(),o=this._commonPrefix(e,t,1,i,n,1);if(t===n&&o===t)return[];const a=this._commonSuffix(e,t-o,o,i,n-o,o);let r,d;return a>0?(r=new I(o+1,1,t-a+1,1),d=new I(o+1,1,n-a+1,1)):o>0?(r=new I(o,e.getLineMaxColumn(o),t,e.getLineMaxColumn(t)),d=new I(o,1+i.getLineLength(o),n,1+i.getLineLength(n))):(r=new I(1,1,t,e.getLineMaxColumn(t)),d=new I(1,1,n,1+i.getLineLength(n))),[U.replaceMove(r,i.getValueInRange(d,k.TextDefined))]}createModel(e,i,t,n=!1){let o;return i?o=this._createModelData(e,i,t,n):o=this._createModelData(e,F,t,n),this._onModelAdded.fire(o.model),o.model}destroyModel(e){const i=this._models[f(e)];i&&i.model.dispose()}getModels(){const e=[],i=Object.keys(this._models);for(let t=0,n=i.length;t<n;t++){const o=i[t];e.push(this._models[o].model)}return e}getModel(e){const i=f(e),t=this._models[i];return t?t.model:null}_schemaShouldMaintainUndoRedoElements(e){return e.scheme===b.file||e.scheme===b.vscodeRemote||e.scheme===b.vscodeUserData||e.scheme===b.vscodeNotebookCell||e.scheme==="fake-fs"}_onWillDispose(e){const i=f(e.uri),t=this._models[i],n=this._undoRedoService.getUriComparisonKey(e.uri)!==e.uri.toString();let o=!1,a=0;if(n||this._shouldRestoreUndoStack()&&this._schemaShouldMaintainUndoRedoElements(e.uri)){const s=this._undoRedoService.getElements(e.uri);if(s.past.length>0||s.future.length>0){for(const l of s.past)_(l)&&l.matchesResource(e.uri)&&(o=!0,a+=l.heapSize(e.uri),l.setModel(e.uri));for(const l of s.future)_(l)&&l.matchesResource(e.uri)&&(o=!0,a+=l.heapSize(e.uri),l.setModel(e.uri))}}const r=c.MAX_MEMORY_FOR_CLOSED_FILES_UNDO_STACK,d=this._getSHA1Computer();if(o)if(!n&&(a>r||!d.canComputeSHA1(e))){const s=t.model.getInitialUndoRedoSnapshot();s!==null&&this._undoRedoService.restoreSnapshot(s)}else this._ensureDisposedModelsHeapSize(r-a),this._undoRedoService.setElementsValidFlag(e.uri,!1,s=>_(s)&&s.matchesResource(e.uri)),this._insertDisposedModel(new X(e.uri,t.model.getInitialUndoRedoSnapshot(),Date.now(),n,a,d.computeSHA1(e),e.getVersionId(),e.getAlternativeVersionId()));else if(!n){const s=t.model.getInitialUndoRedoSnapshot();s!==null&&this._undoRedoService.restoreSnapshot(s)}delete this._models[i],t.dispose(),delete this._modelCreationOptionsByLanguageAndResource[e.getLanguageId()+e.uri],this._onModelRemoved.fire(e)}_onDidChangeLanguage(e,i){const t=i.oldLanguage,n=e.getLanguageId(),o=this.getCreationOptions(t,e.uri,e.isForSimpleWidget),a=this.getCreationOptions(n,e.uri,e.isForSimpleWidget);c._setModelOptionsForModel(e,a,o),this._onModelModeChanged.fire({model:e,oldLanguageId:t})}_getSHA1Computer(){return new E}};c=x([v(0,W),v(1,B),v(2,V),v(3,w)],c);class E{static MAX_MODEL_SIZE=10*1024*1024;canComputeSHA1(p){return p.getValueLength()<=E.MAX_MODEL_SIZE}computeSHA1(p){const e=new T,i=p.createSnapshot();let t;for(;t=i.read();)e.update(t);return e.digest()}}export{E as DefaultModelSHA1Computer,c as ModelService};
