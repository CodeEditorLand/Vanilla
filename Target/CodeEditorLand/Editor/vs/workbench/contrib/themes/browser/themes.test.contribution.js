var w=Object.defineProperty;var z=Object.getOwnPropertyDescriptor;var S=(m,t,n,r)=>{for(var e=r>1?void 0:r?z(t,n):t,o=m.length-1,s;o>=0;o--)(s=m[o])&&(e=(r?s(t,n,e):s(e))||e);return r&&e&&w(t,n,e),e},f=(m,t)=>(n,r)=>t(n,r,m);import{URI as v}from"../../../../base/common/uri.js";import{ILanguageService as N}from"../../../../editor/common/languages/language.js";import{CommandsRegistry as I}from"../../../../platform/commands/common/commands.js";import{IInstantiationService as F}from"../../../../platform/instantiation/common/instantiation.js";import{IWorkbenchThemeService as P}from"../../../services/themes/common/workbenchThemeService.js";import{IEditorService as M}from"../../../services/editor/common/editorService.js";import{EditorResourceAccessor as A}from"../../../common/editor.js";import{ITextMateTokenizationService as L}from"../../../services/textMate/browser/textMateTokenizationFeature.js";import{TokenizationRegistry as _,TreeSitterTokenizationRegistry as E}from"../../../../editor/common/languages.js";import{TokenMetadata as x}from"../../../../editor/common/encodedTokenAttributes.js";import{findMatchingThemeRule as $}from"../../../services/textMate/common/TMHelper.js";import{Color as u}from"../../../../base/common/color.js";import{IFileService as D}from"../../../../platform/files/common/files.js";import{basename as U}from"../../../../base/common/resources.js";import{Schemas as O}from"../../../../base/common/network.js";import{splitLines as H}from"../../../../base/common/strings.js";import{ITreeSitterParserService as j}from"../../../../editor/common/services/treeSitterParserService.js";import{findMetadata as W}from"../../../services/themes/common/colorThemeData.js";class C{_theme;_cache;_defaultColor;constructor(t){this._theme=t,this._cache=Object.create(null),this._defaultColor="#000000";for(let n=0,r=this._theme.tokenColors.length;n<r;n++){const e=this._theme.tokenColors[n];e.scope||(this._defaultColor=e.settings.foreground)}}_generateExplanation(t,n){return`${t}: ${u.Format.CSS.formatHexA(n,!0).toUpperCase()}`}explainTokenColor(t,n){const r=this._findMatchingThemeRule(t);if(!r){const o=u.fromHex(this._defaultColor);if(!n.equals(o))throw new Error(`[${this._theme.label}]: Unexpected color ${u.Format.CSS.formatHexA(n)} for ${t}. Expected default ${u.Format.CSS.formatHexA(o)}`);return this._generateExplanation("default",n)}const e=u.fromHex(r.settings.foreground);if(!n.equals(e))throw new Error(`[${this._theme.label}]: Unexpected color ${u.Format.CSS.formatHexA(n)} for ${t}. Expected ${u.Format.CSS.formatHexA(e)} coming in from ${r.rawSelector}`);return this._generateExplanation(r.rawSelector,n)}_findMatchingThemeRule(t){return this._cache[t]||(this._cache[t]=$(this._theme,t.split(" "))),this._cache[t]}}let T=class{constructor(t,n,r,e){this.languageService=t;this.themeService=n;this.textMateService=r;this.treeSitterParserService=e}_themedTokenize(t,n){const r=_.getColorMap();let e=null;const o=[];let s=0;for(let c=0,i=n.length;c<i;c++){const a=n[c],l=t.tokenizeLine2(a,e);for(let h=0,k=l.tokens.length>>>1;h<k;h++){const d=l.tokens[h<<1],p=l.tokens[(h<<1)+1],g=h+1<k?l.tokens[h+1<<1]:a.length,b=a.substring(d,g),y=x.getForeground(p);o[s++]={text:b,color:r[y]}}e=l.ruleStack}return o}_themedTokenizeTreeSitter(t,n){const r=_.getColorMap(),e=Array(t.length),o=this.themeService.getColorTheme();for(let s=0,c=t.length;s<c;s++){const i=t[s],a=i.t.split(" "),l=W(o,a,this.languageService.languageIdCodec.encodeLanguageId(n)),h=x.getForeground(l);e[s]={text:i.c,color:r[h]}}return e}_tokenize(t,n){let r=null;const e=[];let o=0;for(let s=0,c=n.length;s<c;s++){const i=n[s],a=t.tokenizeLine(i,r);let l=null;for(let h=0,k=a.tokens.length;h<k;h++){const d=a.tokens[h],p=i.substring(d.startIndex,d.endIndex),g=d.scopes.join(" ");l===g?e[o-1].c+=p:(l=g,e[o++]={c:p,t:g,r:{dark_plus:void 0,light_plus:void 0,dark_vs:void 0,light_vs:void 0,hc_black:void 0}})}r=a.ruleStack}return e}async _getThemesResult(t,n){const r=this.themeService.getColorTheme(),e=i=>{const a="vscode-theme-defaults-themes-",l=i.indexOf(a);if(l!==-1)return i.substring(l+a.length,i.length-5)},o={},c=(await this.themeService.getColorThemes()).filter(i=>!!e(i.id));for(const i of c){const a=i.id;if(await this.themeService.setColorTheme(a,void 0)){const h=e(a);o[h]={document:new C(this.themeService.getColorTheme()),tokens:this._themedTokenize(t,n)}}}return await this.themeService.setColorTheme(r.id,void 0),o}async _getTreeSitterThemesResult(t,n){const r=this.themeService.getColorTheme(),e=i=>{const a="vscode-theme-defaults-themes-",l=i.indexOf(a);if(l!==-1)return i.substring(l+a.length,i.length-5)},o={},c=(await this.themeService.getColorThemes()).filter(i=>!!e(i.id));for(const i of c){const a=i.id;if(await this.themeService.setColorTheme(a,void 0)){const h=e(a);o[h]={document:new C(this.themeService.getColorTheme()),tokens:this._themedTokenizeTreeSitter(t,n)}}}return await this.themeService.setColorTheme(r.id,void 0),o}_enrichResult(t,n){const r={},e=Object.keys(n);for(const o of e)r[o]=0;for(let o=0,s=t.length;o<s;o++){const c=t[o];for(const i of e){const a=n[i].tokens[r[i]];a.text=a.text.substr(c.c.length),a.color&&(c.r[i]=n[i].document.explainTokenColor(c.t,a.color)),a.text.length===0&&r[i]++}}}_treeSitterTokenize(t,n){const r=t.walk();r.gotoFirstChild();let e=!0;const o=[],s=E.get(n);do if(r.currentNode.childCount===0){const c=s?.captureAtPositionTree(r.currentNode.startPosition.row+1,r.currentNode.startPosition.column+1,t);for(o.push({c:r.currentNode.text.replace(/\r\n/g,`
`),t:c?.map(i=>i.name).join(" ")??"",r:{dark_plus:void 0,light_plus:void 0,dark_vs:void 0,light_vs:void 0,hc_black:void 0}});!(e=r.gotoNextSibling())&&(e=r.gotoParent()););}else e=r.gotoFirstChild();while(e);return o}captureSyntaxTokens(t,n){const r=this.languageService.guessLanguageIdByFilepathOrFirstLine(v.file(t));return this.textMateService.createTokenizer(r).then(e=>{if(!e)return[];const o=H(n),s=this._tokenize(e,o);return this._getThemesResult(e,o).then(c=>(this._enrichResult(s,c),s.filter(i=>i.c.length>0)))})}async captureTreeSitterSyntaxTokens(t,n){const r=this.languageService.guessLanguageIdByFilepathOrFirstLine(v.file(t));if(r){const e=await this.treeSitterParserService.getTree(n,r);if(!e)return[];const o=(await this._treeSitterTokenize(e,r)).filter(c=>c.c.length>0),s=await this._getTreeSitterThemesResult(o,r);return this._enrichResult(o,s),o}return[]}};T=S([f(0,N),f(1,P),f(2,L),f(3,j)],T);async function R(m,t,n=!1){const r=e=>{const o=m.get(D),s=U(e),c=m.get(F).createInstance(T);return o.readFile(e).then(i=>n?c.captureTreeSitterSyntaxTokens(s,i.value.toString()):c.captureSyntaxTokens(s,i.value.toString()))};if(t)return await r(t);{const e=m.get(M),o=e.activeEditor?A.getCanonicalUri(e.activeEditor,{filterByScheme:O.file}):null;o&&r(o).then(s=>{})}}I.registerCommand("_workbench.captureSyntaxTokens",function(m,t){return R(m,t)}),I.registerCommand("_workbench.captureTreeSitterSyntaxTokens",function(m,t){return R(m,t,!0)});
