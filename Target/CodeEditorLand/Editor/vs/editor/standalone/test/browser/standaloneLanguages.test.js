import h from"assert";import"../../../../base/common/color.js";import{Emitter as m}from"../../../../base/common/event.js";import{DisposableStore as k}from"../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as A}from"../../../../base/test/common/utils.js";import{MetadataConsts as e}from"../../../common/encodedTokenAttributes.js";import{Token as i}from"../../../common/languages.js";import{TokenTheme as b}from"../../../common/languages/supports/tokenization.js";import{LanguageService as N}from"../../../common/services/languageService.js";import{TokenizationSupportAdapter as w}from"../../browser/standaloneLanguages.js";import"../../common/standaloneTheme.js";import{UnthemedProductIconTheme as F}from"../../../../platform/theme/browser/iconsStyleSheet.js";import"../../../../platform/theme/common/colorRegistry.js";import{ColorScheme as S}from"../../../../platform/theme/common/theme.js";import"../../../../platform/theme/common/themeService.js";suite("TokenizationSupport2Adapter",()=>{A();const n="tttt";class g extends b{counter=0;constructor(){super(null,null)}match(o,r){return(this.counter++<<e.FOREGROUND_OFFSET|o<<e.LANGUAGEID_OFFSET)>>>0}}class E{setTheme(o){throw new Error("Not implemented")}setAutoDetectHighContrast(o){throw new Error("Not implemented")}defineTheme(o,r){throw new Error("Not implemented")}getColorTheme(){return{label:"mock",tokenTheme:new g,themeName:S.LIGHT,type:S.LIGHT,getColor:(o,r)=>{throw new Error("Not implemented")},defines:o=>{throw new Error("Not implemented")},getTokenStyleMetadata:(o,r,u)=>{},semanticHighlighting:!1,tokenColorMap:[]}}setColorMapOverride(o){}getFileIconTheme(){return{hasFileIcons:!1,hasFolderIcons:!1,hidesExplorerArrows:!1}}_builtInProductIconTheme=new F;getProductIconTheme(){return this._builtInProductIconTheme}onDidColorThemeChange=new m().event;onDidFileIconThemeChange=new m().event;onDidProductIconThemeChange=new m().event}class a{static INSTANCE=new a;constructor(){}clone(){return this}equals(o){return this===o}}function c(s,o,r){class u{getInitialState(){return a.INSTANCE}tokenize(D,O){return{tokens:s,endState:a.INSTANCE}}}const l=new k,d=l.add(new N);l.add(d.registerLanguage({id:n}));const I=new w(n,new u,d,new E),f=I.tokenize("whatever",!0,a.INSTANCE);h.deepStrictEqual(f.tokens,o);const T=I.tokenizeEncoded("whatever",!0,a.INSTANCE),p=[];for(let t=0;t<T.tokens.length;t++)p[t]=T.tokens[t];const C=d.languageIdCodec.encodeLanguageId(n)<<e.LANGUAGEID_OFFSET;for(let t=1;t<r.length;t+=2)r[t]|=C;h.deepStrictEqual(p,r),l.dispose()}test("tokens always start at index 0",()=>{c([{startIndex:7,scopes:"foo"},{startIndex:0,scopes:"bar"}],[new i(0,"foo",n),new i(0,"bar",n)],[0,0<<e.FOREGROUND_OFFSET|e.BALANCED_BRACKETS_MASK,0,1<<e.FOREGROUND_OFFSET|e.BALANCED_BRACKETS_MASK])}),test("tokens always start after each other",()=>{c([{startIndex:0,scopes:"foo"},{startIndex:5,scopes:"bar"},{startIndex:3,scopes:"foo"}],[new i(0,"foo",n),new i(5,"bar",n),new i(5,"foo",n)],[0,0<<e.FOREGROUND_OFFSET|e.BALANCED_BRACKETS_MASK,5,1<<e.FOREGROUND_OFFSET|e.BALANCED_BRACKETS_MASK,5,2<<e.FOREGROUND_OFFSET|e.BALANCED_BRACKETS_MASK])})});
