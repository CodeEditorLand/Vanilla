import{firstOrDefault as a}from"../../../../vs/base/common/arrays.js";import{Emitter as n,Event as g}from"../../../../vs/base/common/event.js";import{Disposable as u}from"../../../../vs/base/common/lifecycle.js";import{observableFromEvent as o}from"../../../../vs/base/common/observable.js";import"../../../../vs/base/common/uri.js";import{TokenizationRegistry as d}from"../../../../vs/editor/common/languages.js";import"../../../../vs/editor/common/languages/language.js";import{PLAINTEXT_LANGUAGE_ID as l}from"../../../../vs/editor/common/languages/modesRegistry.js";import{LanguagesRegistry as c}from"../../../../vs/editor/common/services/languagesRegistry.js";class s extends u{_serviceBrand;static instanceCount=0;_onDidRequestBasicLanguageFeatures=this._register(new n);onDidRequestBasicLanguageFeatures=this._onDidRequestBasicLanguageFeatures.event;_onDidRequestRichLanguageFeatures=this._register(new n);onDidRequestRichLanguageFeatures=this._onDidRequestRichLanguageFeatures.event;_onDidChange=this._register(new n({leakWarningThreshold:200}));onDidChange=this._onDidChange.event;_requestedBasicLanguages=new Set;_requestedRichLanguages=new Set;_registry;languageIdCodec;constructor(e=!1){super(),s.instanceCount++,this._registry=this._register(new c(!0,e)),this.languageIdCodec=this._registry.languageIdCodec,this._register(this._registry.onDidChange(()=>this._onDidChange.fire()))}dispose(){s.instanceCount--,super.dispose()}registerLanguage(e){return this._registry.registerLanguage(e)}isRegisteredLanguageId(e){return this._registry.isRegisteredLanguageId(e)}getRegisteredLanguageIds(){return this._registry.getRegisteredLanguageIds()}getSortedRegisteredLanguageNames(){return this._registry.getSortedRegisteredLanguageNames()}getLanguageName(e){return this._registry.getLanguageName(e)}getMimeType(e){return this._registry.getMimeType(e)}getIcon(e){return this._registry.getIcon(e)}getExtensions(e){return this._registry.getExtensions(e)}getFilenames(e){return this._registry.getFilenames(e)}getConfigurationFiles(e){return this._registry.getConfigurationFiles(e)}getLanguageIdByLanguageName(e){return this._registry.getLanguageIdByLanguageName(e)}getLanguageIdByMimeType(e){return this._registry.getLanguageIdByMimeType(e)}guessLanguageIdByFilepathOrFirstLine(e,t){const i=this._registry.guessLanguageIdByFilepathOrFirstLine(e,t);return a(i,null)}createById(e){return new r(this.onDidChange,()=>this._createAndGetLanguageIdentifier(e))}createByMimeType(e){return new r(this.onDidChange,()=>{const t=this.getLanguageIdByMimeType(e);return this._createAndGetLanguageIdentifier(t)})}createByFilepathOrFirstLine(e,t){return new r(this.onDidChange,()=>{const i=this.guessLanguageIdByFilepathOrFirstLine(e,t);return this._createAndGetLanguageIdentifier(i)})}_createAndGetLanguageIdentifier(e){return(!e||!this.isRegisteredLanguageId(e))&&(e=l),e}requestBasicLanguageFeatures(e){this._requestedBasicLanguages.has(e)||(this._requestedBasicLanguages.add(e),this._onDidRequestBasicLanguageFeatures.fire(e))}requestRichLanguageFeatures(e){this._requestedRichLanguages.has(e)||(this._requestedRichLanguages.add(e),this.requestBasicLanguageFeatures(e),d.getOrCreate(e),this._onDidRequestRichLanguageFeatures.fire(e))}}class r{_value;onDidChange;constructor(e,t){this._value=o(this,e,()=>t()),this.onDidChange=g.fromObservable(this._value)}get languageId(){return this._value.get()}}export{s as LanguageService};
