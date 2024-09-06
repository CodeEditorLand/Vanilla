import{addMatchMediaChangeListener as D}from"../../../../vs/base/browser/browser.js";import*as T from"../../../../vs/base/browser/dom.js";import{mainWindow as S}from"../../../../vs/base/browser/window.js";import{Color as f}from"../../../../vs/base/common/color.js";import{Emitter as _}from"../../../../vs/base/common/event.js";import{Disposable as I}from"../../../../vs/base/common/lifecycle.js";import{FontStyle as d,TokenMetadata as b}from"../../../../vs/editor/common/encodedTokenAttributes.js";import{TokenizationRegistry as E}from"../../../../vs/editor/common/languages.js";import{generateTokensCSSForColorMap as M,TokenTheme as w}from"../../../../vs/editor/common/languages/supports/tokenization.js";import"../../../../vs/editor/standalone/common/standaloneTheme.js";import{hc_black as H,hc_light as R,vs as B,vs_dark as O}from"../../../../vs/editor/standalone/common/themes.js";import"../../../../vs/platform/environment/common/environment.js";import{Registry as v}from"../../../../vs/platform/registry/common/platform.js";import{getIconsStyleSheet as x,UnthemedProductIconTheme as A}from"../../../../vs/platform/theme/browser/iconsStyleSheet.js";import{asCssVariableName as F,Extensions as L}from"../../../../vs/platform/theme/common/colorRegistry.js";import{ColorScheme as u,isDark as P,isHighContrast as $}from"../../../../vs/platform/theme/common/theme.js";import{Extensions as G}from"../../../../vs/platform/theme/common/themeService.js";const s="vs",m="vs-dark",h="hc-black",c="hc-light",y=v.as(L.ColorContribution),j=v.as(G.ThemingContribution);class k{id;themeName;themeData;colors;defaultColors;_tokenTheme;constructor(e,t){this.themeData=t;const o=t.base;e.length>0?(g(e)?this.id=e:this.id=o+" "+e,this.themeName=e):(this.id=o,this.themeName=o),this.colors=null,this.defaultColors=Object.create(null),this._tokenTheme=null}get label(){return this.themeName}get base(){return this.themeData.base}notifyBaseUpdated(){this.themeData.inherit&&(this.colors=null,this._tokenTheme=null)}getColors(){if(!this.colors){const e=new Map;for(const t in this.themeData.colors)e.set(t,f.fromHex(this.themeData.colors[t]));if(this.themeData.inherit){const t=C(this.themeData.base);for(const o in t.colors)e.has(o)||e.set(o,f.fromHex(t.colors[o]))}this.colors=e}return this.colors}getColor(e,t){const o=this.getColors().get(e);if(o)return o;if(t!==!1)return this.getDefault(e)}getDefault(e){let t=this.defaultColors[e];return t||(t=y.resolveDefaultColor(e,this),this.defaultColors[e]=t,t)}defines(e){return this.getColors().has(e)}get type(){switch(this.base){case s:return u.LIGHT;case h:return u.HIGH_CONTRAST_DARK;case c:return u.HIGH_CONTRAST_LIGHT;default:return u.DARK}}get tokenTheme(){if(!this._tokenTheme){let e=[],t=[];if(this.themeData.inherit){const n=C(this.themeData.base);e=n.rules,n.encodedTokensColors&&(t=n.encodedTokensColors)}const o=this.themeData.colors["editor.foreground"],l=this.themeData.colors["editor.background"];if(o||l){const n={token:""};o&&(n.foreground=o),l&&(n.background=l),e.push(n)}e=e.concat(this.themeData.rules),this.themeData.encodedTokensColors&&(t=this.themeData.encodedTokensColors),this._tokenTheme=w.createFromRawTokenTheme(e,t)}return this._tokenTheme}getTokenStyleMetadata(e,t,o){const n=this.tokenTheme._match([e].concat(t).join(".")).metadata,r=b.getForeground(n),a=b.getFontStyle(n);return{foreground:r,italic:!!(a&d.Italic),bold:!!(a&d.Bold),underline:!!(a&d.Underline),strikethrough:!!(a&d.Strikethrough)}}get tokenColorMap(){return[]}semanticHighlighting=!1}function g(i){return i===s||i===m||i===h||i===c}function C(i){switch(i){case s:return B;case m:return O;case h:return H;case c:return R}}function p(i){const e=C(i);return new k(i,e)}class Ce extends I{_onColorThemeChange=this._register(new _);onDidColorThemeChange=this._onColorThemeChange.event;_onFileIconThemeChange=this._register(new _);onDidFileIconThemeChange=this._onFileIconThemeChange.event;_onProductIconThemeChange=this._register(new _);onDidProductIconThemeChange=this._onProductIconThemeChange.event;_environment=Object.create(null);_knownThemes;_autoDetectHighContrast;_codiconCSS;_themeCSS;_allCSS;_globalStyleElement;_styleElements;_colorMapOverride;_theme;_builtInProductIconTheme=new A;constructor(){super(),this._autoDetectHighContrast=!0,this._knownThemes=new Map,this._knownThemes.set(s,p(s)),this._knownThemes.set(m,p(m)),this._knownThemes.set(h,p(h)),this._knownThemes.set(c,p(c));const e=this._register(x(this));this._codiconCSS=e.getCSS(),this._themeCSS="",this._allCSS=`${this._codiconCSS}
${this._themeCSS}`,this._globalStyleElement=null,this._styleElements=[],this._colorMapOverride=null,this.setTheme(s),this._onOSSchemeChanged(),this._register(e.onDidChange(()=>{this._codiconCSS=e.getCSS(),this._updateCSS()})),D(S,"(forced-colors: active)",()=>{this._onOSSchemeChanged()})}registerEditorContainer(e){return T.isInShadowDOM(e)?this._registerShadowDomContainer(e):this._registerRegularEditorContainer()}_registerRegularEditorContainer(){return this._globalStyleElement||(this._globalStyleElement=T.createStyleSheet(void 0,e=>{e.className="monaco-colors",e.textContent=this._allCSS}),this._styleElements.push(this._globalStyleElement)),I.None}_registerShadowDomContainer(e){const t=T.createStyleSheet(e,o=>{o.className="monaco-colors",o.textContent=this._allCSS});return this._styleElements.push(t),{dispose:()=>{for(let o=0;o<this._styleElements.length;o++)if(this._styleElements[o]===t){this._styleElements.splice(o,1);return}}}}defineTheme(e,t){if(!/^[a-z0-9\-]+$/i.test(e))throw new Error("Illegal theme name!");if(!g(t.base)&&!g(e))throw new Error("Illegal theme base!");this._knownThemes.set(e,new k(e,t)),g(e)&&this._knownThemes.forEach(o=>{o.base===e&&o.notifyBaseUpdated()}),this._theme.themeName===e&&this.setTheme(e)}getColorTheme(){return this._theme}setColorMapOverride(e){this._colorMapOverride=e,this._updateThemeOrColorMap()}setTheme(e){let t;this._knownThemes.has(e)?t=this._knownThemes.get(e):t=this._knownThemes.get(s),this._updateActualTheme(t)}_updateActualTheme(e){!e||this._theme===e||(this._theme=e,this._updateThemeOrColorMap())}_onOSSchemeChanged(){if(this._autoDetectHighContrast){const e=S.matchMedia("(forced-colors: active)").matches;if(e!==$(this._theme.type)){let t;P(this._theme.type)?t=e?h:m:t=e?c:s,this._updateActualTheme(this._knownThemes.get(t))}}}setAutoDetectHighContrast(e){this._autoDetectHighContrast=e,this._onOSSchemeChanged()}_updateThemeOrColorMap(){const e=[],t={},o={addRule:r=>{t[r]||(e.push(r),t[r]=!0)}};j.getThemingParticipants().forEach(r=>r(this._theme,o,this._environment));const l=[];for(const r of y.getColors()){const a=this._theme.getColor(r.id,!0);a&&l.push(`${F(r.id)}: ${a.toString()};`)}o.addRule(`.monaco-editor, .monaco-diff-editor, .monaco-component { ${l.join(`
`)} }`);const n=this._colorMapOverride||this._theme.tokenTheme.getColorMap();o.addRule(M(n)),this._themeCSS=e.join(`
`),this._updateCSS(),E.setColorMap(n),this._onColorThemeChange.fire(this._theme)}_updateCSS(){this._allCSS=`${this._codiconCSS}
${this._themeCSS}`,this._styleElements.forEach(e=>e.textContent=this._allCSS)}getFileIconTheme(){return{hasFileIcons:!1,hasFolderIcons:!1,hidesExplorerArrows:!1}}getProductIconTheme(){return this._builtInProductIconTheme}}export{h as HC_BLACK_THEME_NAME,c as HC_LIGHT_THEME_NAME,Ce as StandaloneThemeService,m as VS_DARK_THEME_NAME,s as VS_LIGHT_THEME_NAME};