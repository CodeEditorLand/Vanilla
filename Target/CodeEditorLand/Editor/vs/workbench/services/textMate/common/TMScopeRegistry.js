import*as i from"../../../../base/common/resources.js";import"../../../../base/common/uri.js";import"../../../../editor/common/encodedTokenAttributes.js";class c{_scopeNameToLanguageRegistration;constructor(){this._scopeNameToLanguageRegistration=Object.create(null)}reset(){this._scopeNameToLanguageRegistration=Object.create(null)}register(e){if(this._scopeNameToLanguageRegistration[e.scopeName]){const a=this._scopeNameToLanguageRegistration[e.scopeName];i.isEqual(a.location,e.location)||console.warn(`Overwriting grammar scope name to file mapping for scope ${e.scopeName}.
Old grammar file: ${a.location.toString()}.
New grammar file: ${e.location.toString()}`)}this._scopeNameToLanguageRegistration[e.scopeName]=e}getGrammarDefinition(e){return this._scopeNameToLanguageRegistration[e]||null}}export{c as TMScopeRegistry};
