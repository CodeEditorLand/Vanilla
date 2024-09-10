var f=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var p=(a,r,e,t)=>{for(var i=t>1?void 0:t?S(r,e):r,s=a.length-1,n;s>=0;s--)(n=a[s])&&(i=(t?n(r,e,i):n(i))||i);return t&&i&&f(r,e,i),i},l=(a,r)=>(e,t)=>r(e,t,a);import{FileAccess as c,nodeModulesAsarUnpackedPath as T,nodeModulesPath as y}from"../../../../base/common/network.js";import{EDITOR_EXPERIMENTAL_PREFER_TREESITTER as m}from"../../../common/services/treeSitterParserService.js";import{IModelService as P}from"../../../common/services/model.js";import{Disposable as d,DisposableMap as I,DisposableStore as L,dispose as h}from"../../../../base/common/lifecycle.js";import{IFileService as C}from"../../../../platform/files/common/files.js";import{ITelemetryService as w}from"../../../../platform/telemetry/common/telemetry.js";import{ILogService as M}from"../../../../platform/log/common/log.js";import{IConfigurationService as b}from"../../../../platform/configuration/common/configuration.js";import{setTimeout0 as D}from"../../../../base/common/platform.js";import{importAMDNodeModule as E}from"../../../../amdX.js";import{Emitter as R,Event as x}from"../../../../base/common/event.js";import{cancelOnDispose as A}from"../../../../base/common/cancellation.js";import{IEnvironmentService as F}from"../../../../platform/environment/common/environment.js";import{canASAR as O}from"../../../../base/common/amd.js";import{CancellationError as k,isCancellationError as N}from"../../../../base/common/errors.js";import{PromiseResult as _}from"../../../../base/common/observableInternal/promise.js";const $="editor.experimental.treeSitterTelemetry",U="@vscode/tree-sitter-wasm/wasm",K="tree-sitter.wasm";function v(a){return`${O&&a.isBuilt?T:y}/${U}`}class B extends d{constructor(e,t,i,s,n){super();this.model=e;this._treeSitterLanguages=t;this._treeSitterImporter=i;this._logService=s;this._telemetryService=n;this._register(x.runAndSubscribe(this.model.onDidChangeLanguage,o=>this._onDidChangeLanguage(o?o.newLanguage:this.model.getLanguageId())))}_parseResult;get parseResult(){return this._parseResult}_languageSessionDisposables=this._register(new L);async _onDidChangeLanguage(e){this._languageSessionDisposables.clear(),this._parseResult=void 0;const t=A(this._languageSessionDisposables);let i;try{i=await this._getLanguage(e,t)}catch(o){if(N(o))return;throw o}const s=await this._treeSitterImporter.getParserClass();if(t.isCancellationRequested)return;const n=this._languageSessionDisposables.add(new Q(new s,i,this._logService,this._telemetryService));this._languageSessionDisposables.add(this.model.onDidChangeContent(o=>this._onDidChangeContent(n,o.changes))),await this._onDidChangeContent(n,[]),!t.isCancellationRequested&&(this._parseResult=n)}_getLanguage(e,t){const i=this._treeSitterLanguages.getOrInitLanguage(e);if(i)return Promise.resolve(i);const s=[];return new Promise((n,o)=>{s.push(this._treeSitterLanguages.onDidAddLanguage(g=>{g.id===e&&(h(s),n(g.language))})),t.onCancellationRequested(()=>{h(s),o(new k)},void 0,s)})}async _onDidChangeContent(e,t){return e.onDidChangeContent(this.model,t)}}var G=(e=>(e.Full="fullParse",e.Incremental="incrementalParse",e))(G||{});class Q{constructor(r,e,t,i){this.parser=r;this.language=e;this._logService=t;this._telemetryService=i;this.parser.setTimeoutMicros(50*1e3),this.parser.setLanguage(e)}_tree;_isDisposed=!1;dispose(){this._isDisposed=!0,this._tree?.delete(),this.parser?.delete()}get tree(){return this._tree}set tree(r){this._tree?.delete(),this._tree=r}get isDisposed(){return this._isDisposed}_onDidChangeContentQueue=Promise.resolve();async onDidChangeContent(r,e){return this._applyEdits(r,e),this._onDidChangeContentQueue=this._onDidChangeContentQueue.then(()=>{if(!this.isDisposed)return this._parseAndUpdateTree(r)}).catch(t=>{this._logService.error("Error parsing tree-sitter tree",t)}),this._onDidChangeContentQueue}_newEdits=!0;_applyEdits(r,e){for(const t of e){const i=t.rangeOffset+t.text.length,s=r.getPositionAt(i);this.tree?.edit({startIndex:t.rangeOffset,oldEndIndex:t.rangeOffset+t.rangeLength,newEndIndex:t.rangeOffset+t.text.length,startPosition:{row:t.range.startLineNumber-1,column:t.range.startColumn-1},oldEndPosition:{row:t.range.endLineNumber-1,column:t.range.endColumn-1},newEndPosition:{row:s.lineNumber-1,column:s.column-1}}),this._newEdits=!0}}async _parseAndUpdateTree(r){const e=await this._parse(r);this._newEdits||(this.tree=e)}_parse(r){let e="fullParse";return this.tree&&(e="incrementalParse"),this._parseAndYield(r,e)}async _parseAndYield(r,e){const t=r.getLanguageId();let i,s=0,n=0;this._newEdits=!1;do{const o=performance.now();try{i=this.parser.parse((g,j)=>this._parseCallback(r,g),this.tree)}catch{}finally{s+=performance.now()-o,n++}if(await new Promise(g=>D(g)),r.isDisposed()||this.isDisposed)return}while(!i&&!this._newEdits);return this.sendParseTimeTelemetry(e,t,s,n),i}_parseCallback(r,e){return r.getTextBuffer().getNearestChunk(e)}sendParseTimeTelemetry(r,e,t,i){this._logService.debug(`Tree parsing (${r}) took ${t} ms and ${i} passes.`),r==="fullParse"?this._telemetryService.publicLog2("treeSitter.fullParse",{languageId:e,time:t,passes:i}):this._telemetryService.publicLog2("treeSitter.incrementalParse",{languageId:e,time:t,passes:i})}}class q extends d{constructor(e,t,i,s){super();this._treeSitterImporter=e;this._fileService=t;this._environmentService=i;this._registeredLanguages=s}_languages=new V;_onDidAddLanguage=this._register(new R);onDidAddLanguage=this._onDidAddLanguage.event;getOrInitLanguage(e){if(this._languages.isCached(e))return this._languages.getSyncIfCached(e);this._addLanguage(e)}async _addLanguage(e){if(!this._languages.get(e)){this._languages.set(e,this._fetchLanguage(e));const i=await this._languages.get(e);if(!i)return;this._onDidAddLanguage.fire({id:e,language:i})}}async _fetchLanguage(e){const t=this._registeredLanguages.get(e),i=this._getLanguageLocation(e);if(!t||!i)return;const s=`${i}/${t}.wasm`,n=await this._fileService.readFile(c.asFileUri(s));return(await this._treeSitterImporter.getParserClass()).Language.load(n.value.buffer)}_getLanguageLocation(e){if(this._registeredLanguages.get(e))return v(this._environmentService)}}class W{_treeSitterImport;async _getTreeSitterImport(){return this._treeSitterImport||(this._treeSitterImport=await E("@vscode/tree-sitter-wasm","wasm/tree-sitter.js")),this._treeSitterImport}_parserClass;async getParserClass(){return this._parserClass||(this._parserClass=(await this._getTreeSitterImport()).Parser),this._parserClass}}let u=class extends d{constructor(e,t,i,s,n,o){super();this._modelService=e;this._telemetryService=i;this._logService=s;this._configurationService=n;this._environmentService=o;this._treeSitterLanguages=this._register(new q(this._treeSitterImporter,t,this._environmentService,this._registeredLanguages)),this.onDidAddLanguage=this._treeSitterLanguages.onDidAddLanguage,this._register(this._configurationService.onDidChangeConfiguration(g=>{g.affectsConfiguration(m)&&this._supportedLanguagesChanged()})),this._supportedLanguagesChanged()}_serviceBrand;_init;_textModelTreeSitters=this._register(new I);_registeredLanguages=new Map;_treeSitterImporter=new W;_treeSitterLanguages;onDidAddLanguage;getOrInitLanguage(e){return this._treeSitterLanguages.getOrInitLanguage(e)}getParseResult(e){return this._textModelTreeSitters.get(e)?.parseResult}async _doInitParser(){const e=await this._treeSitterImporter.getParserClass(),t=this._environmentService;return await e.init({locateFile(i,s){return c.asBrowserUri(`${v(t)}/${K}`).toString(!0)}}),!0}_hasInit=!1;async _initParser(e){return this._hasInit?this._init:(e?(this._hasInit=!0,this._init=this._doInitParser(),this._init.then(()=>this._registerModelServiceListeners())):this._init=Promise.resolve(!1),this._init)}async _supportedLanguagesChanged(){const e=this._getSetting();let t=!0;e.length===0&&(t=!1),await this._initParser(t)&&(e.includes("typescript")?this._addGrammar("typescript","tree-sitter-typescript"):this._removeGrammar("typescript"))}_getSetting(){const e=this._configurationService.getValue(m);return e&&e.length>0?e:this._configurationService.getValue($)?["typescript"]:[]}async _registerModelServiceListeners(){this._register(this._modelService.onModelAdded(e=>{this._createTextModelTreeSitter(e)})),this._register(this._modelService.onModelRemoved(e=>{this._textModelTreeSitters.deleteAndDispose(e)})),this._modelService.getModels().forEach(e=>this._createTextModelTreeSitter(e))}_createTextModelTreeSitter(e){const t=new B(e,this._treeSitterLanguages,this._treeSitterImporter,this._logService,this._telemetryService);this._textModelTreeSitters.set(e,t)}_addGrammar(e,t){this._registeredLanguages.has(e)||this._registeredLanguages.set(e,t)}_removeGrammar(e){this._registeredLanguages.has(e)&&this._registeredLanguages.delete("typescript")}};u=p([l(0,P),l(1,C),l(2,w),l(3,M),l(4,b),l(5,F)],u);class Y{constructor(r){this.promise=r;r.then(e=>{this._result=new _(e,void 0)}).catch(e=>{this._result=new _(void 0,e)})}_result;get result(){return this._result}}class V{_values=new Map;set(r,e){this._values.set(r,new Y(e))}get(r){return this._values.get(r)?.promise}getSyncIfCached(r){return this._values.get(r)?.result?.data}isCached(r){return this._values.get(r)?.result!==void 0}}export{B as TextModelTreeSitter,W as TreeSitterImporter,q as TreeSitterLanguages,Q as TreeSitterParseResult,u as TreeSitterTextModelService};
