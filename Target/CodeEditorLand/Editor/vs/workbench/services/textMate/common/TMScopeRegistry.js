import*as i from"../../../../base/common/resources.js";class o{_scopeNameToLanguageRegistration;constructor(){this._scopeNameToLanguageRegistration=Object.create(null)}reset(){this._scopeNameToLanguageRegistration=Object.create(null)}register(e){if(this._scopeNameToLanguageRegistration[e.scopeName]){const a=this._scopeNameToLanguageRegistration[e.scopeName];i.isEqual(a.location,e.location)}this._scopeNameToLanguageRegistration[e.scopeName]=e}getGrammarDefinition(e){return this._scopeNameToLanguageRegistration[e]||null}}export{o as TMScopeRegistry};
