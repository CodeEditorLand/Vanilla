import{CharCode as g}from"../../../../../vs/base/common/charCode.js";import{Color as k}from"../../../../../vs/base/common/color.js";import*as D from"../../../../../vs/base/common/json.js";import{getParseErrorMessage as B}from"../../../../../vs/base/common/jsonErrorMessages.js";import{basename as K}from"../../../../../vs/base/common/path.js";import*as I from"../../../../../vs/base/common/resources.js";import*as T from"../../../../../vs/base/common/types.js";import"../../../../../vs/base/common/uri.js";import*as S from"../../../../../vs/nls.js";import"../../../../../vs/platform/extensionResourceLoader/common/extensionResourceLoader.js";import{Registry as $}from"../../../../../vs/platform/registry/common/platform.js";import{StorageScope as H,StorageTarget as q}from"../../../../../vs/platform/storage/common/storage.js";import{Extensions as Y,DEFAULT_COLOR_CONFIG_VALUE as v,editorBackground as A,editorForeground as _}from"../../../../../vs/platform/theme/common/colorRegistry.js";import{ColorScheme as x}from"../../../../../vs/platform/theme/common/theme.js";import{getThemeTypeSelector as X}from"../../../../../vs/platform/theme/common/themeService.js";import{getTokenClassificationRegistry as Z,parseClassifierString as w,SemanticTokenRule as O,TokenStyle as M}from"../../../../../vs/platform/theme/common/tokenClassificationRegistry.js";import{parse as Q}from"../../../../../vs/workbench/services/themes/common/plistParser.js";import{createMatchers as z}from"../../../../../vs/workbench/services/themes/common/textMateScopeMatcher.js";import{convertSettings as j}from"../../../../../vs/workbench/services/themes/common/themeCompatibility.js";import"../../../../../vs/workbench/services/themes/common/themeConfiguration.js";import{ExtensionData as L,THEME_SCOPE_CLOSE_PAREN as ee,THEME_SCOPE_OPEN_PAREN as te,THEME_SCOPE_WILDCARD as E,themeScopeRegex as oe,VS_HC_LIGHT_THEME as ne,VS_HC_THEME as ie,VS_LIGHT_THEME as re}from"../../../../../vs/workbench/services/themes/common/workbenchThemeService.js";const se=$.as(Y.ColorContribution),P=Z(),F={comments:["comment","punctuation.definition.comment"],strings:["string","meta.embedded.assembly"],keywords:["keyword - keyword.operator","keyword.control","storage","storage.type"],numbers:["constant.numeric"],types:["entity.name.type","entity.name.class","support.type","support.class"],functions:["entity.name.function","support.function"],variables:["variable","entity.name.variable"]};class C{static STORAGE_KEY="colorThemeData";id;label;settingsId;description;isLoaded;location;watch;extensionData;themeSemanticHighlighting;customSemanticHighlighting;customSemanticHighlightingDeprecated;themeTokenColors=[];customTokenColors=[];colorMap={};customColorMap={};semanticTokenRules=[];customSemanticTokenRules=[];themeTokenScopeMatchers;customTokenScopeMatchers;textMateThemingRules=void 0;tokenColorIndex=void 0;constructor(e,t,o){this.id=e,this.label=t,this.settingsId=o,this.isLoaded=!1}get semanticHighlighting(){return this.customSemanticHighlighting!==void 0?this.customSemanticHighlighting:this.customSemanticHighlightingDeprecated!==void 0?this.customSemanticHighlightingDeprecated:!!this.themeSemanticHighlighting}get tokenColors(){if(!this.textMateThemingRules){let a=function(s){s.scope&&s.settings&&(s.scope==="token.info-token"&&(r=!0),t.push({scope:s.scope,settings:{foreground:b(s.settings.foreground),background:b(s.settings.background),fontStyle:s.settings.fontStyle}}))};var e=a;const t=[],o=this.getColor(_)||this.getDefault(_),n=this.getColor(A)||this.getDefault(A);t.push({settings:{foreground:b(o),background:b(n)}});let r=!1;this.themeTokenColors.forEach(a),this.customTokenColors.forEach(a),r||ce[this.type].forEach(a),this.textMateThemingRules=t}return this.textMateThemingRules}getColor(e,t){const o=this.customColorMap[e];if(o instanceof k)return o;if(o===void 0){const n=this.colorMap[e];if(n!==void 0)return n}if(t!==!1)return this.getDefault(e)}getTokenStyle(e,t,o,n=!0,r={}){const a={foreground:void 0,bold:void 0,underline:void 0,strikethrough:void 0,italic:void 0},s={foreground:-1,bold:-1,underline:-1,strikethrough:-1,italic:-1};function l(u,f,h){f.foreground&&s.foreground<=u&&(s.foreground=u,a.foreground=f.foreground,r.foreground=h);for(const p of["bold","underline","strikethrough","italic"]){const m=p,y=f[m];y!==void 0&&s[m]<=u&&(s[m]=u,a[m]=y,r[m]=h)}}function c(u){const f=u.selector.match(e,t,o);f>=0&&l(f,u.style,u)}this.semanticTokenRules.forEach(c),this.customSemanticTokenRules.forEach(c);let d=!1;for(const u in s){const f=u;s[f]===-1?d=!0:s[f]=Number.MAX_VALUE}if(d)for(const u of P.getTokenStylingDefaultRules()){const f=u.selector.match(e,t,o);if(f>=0){let h;if(u.defaults.scopesToProbe&&(h=this.resolveScopes(u.defaults.scopesToProbe),h&&l(f,h,u.defaults.scopesToProbe)),!h&&n!==!1){const p=u.defaults[this.type];h=this.resolveTokenStyleValue(p),h&&l(f,h,p)}}}return M.fromData(a)}resolveTokenStyleValue(e){if(e!==void 0){if(typeof e=="string"){const{type:t,modifiers:o,language:n}=w(e,"");return this.getTokenStyle(t,o,n)}else if(typeof e=="object")return e}}getTokenColorIndex(){if(!this.tokenColorIndex){const e=new fe;this.tokenColors.forEach(t=>{e.add(t.settings.foreground),e.add(t.settings.background)}),this.semanticTokenRules.forEach(t=>e.add(t.style.foreground)),P.getTokenStylingDefaultRules().forEach(t=>{const o=t.defaults[this.type];o&&typeof o=="object"&&e.add(o.foreground)}),this.customSemanticTokenRules.forEach(t=>e.add(t.style.foreground)),this.tokenColorIndex=e}return this.tokenColorIndex}get tokenColorMap(){return this.getTokenColorIndex().asArray()}getTokenStyleMetadata(e,t,o,n=!0,r={}){const{type:a,language:s}=w(e,o),l=this.getTokenStyle(a,t,s,n,r);if(l)return{foreground:this.getTokenColorIndex().get(l.foreground),bold:l.bold,underline:l.underline,strikethrough:l.strikethrough,italic:l.italic}}getTokenStylingRuleScope(e){if(this.customSemanticTokenRules.indexOf(e)!==-1)return"setting";if(this.semanticTokenRules.indexOf(e)!==-1)return"theme"}getDefault(e){return se.resolveDefaultColor(e,this)}resolveScopes(e,t){this.themeTokenScopeMatchers||(this.themeTokenScopeMatchers=this.themeTokenColors.map(J)),this.customTokenScopeMatchers||(this.customTokenScopeMatchers=this.customTokenColors.map(J));for(const n of e){let u=function(f,h){for(let p=0;p<f.length;p++){const m=f[p](n);if(m>=0){const y=h[p],R=h[p].settings;m>=s&&R.foreground&&(r=R.foreground,s=m,d=y),m>=l&&T.isString(R.fontStyle)&&(a=R.fontStyle,l=m,c=y)}}};var o=u;let r,a,s=-1,l=-1,c,d;if(u(this.themeTokenScopeMatchers,this.themeTokenColors),u(this.customTokenScopeMatchers,this.customTokenColors),r!==void 0||a!==void 0)return t&&(t.foreground=d,t.bold=t.italic=t.underline=t.strikethrough=c,t.scope=n),M.fromSettings(r,a)}}defines(e){const t=this.customColorMap[e];return t instanceof k?!0:t===void 0&&this.colorMap.hasOwnProperty(e)}setCustomizations(e){this.setCustomColors(e.colorCustomizations),this.setCustomTokenColors(e.tokenColorCustomizations),this.setCustomSemanticTokenColors(e.semanticTokenColorCustomizations)}setCustomColors(e){this.customColorMap={},this.overwriteCustomColors(e);const t=this.getThemeSpecificColors(e);T.isObject(t)&&this.overwriteCustomColors(t),this.tokenColorIndex=void 0,this.textMateThemingRules=void 0,this.customTokenScopeMatchers=void 0}overwriteCustomColors(e){for(const t in e){const o=e[t];o===v?this.customColorMap[t]=v:typeof o=="string"&&(this.customColorMap[t]=k.fromHex(o))}}setCustomTokenColors(e){this.customTokenColors=[],this.customSemanticHighlightingDeprecated=void 0,this.addCustomTokenColors(e);const t=this.getThemeSpecificColors(e);T.isObject(t)&&this.addCustomTokenColors(t),this.tokenColorIndex=void 0,this.textMateThemingRules=void 0,this.customTokenScopeMatchers=void 0}setCustomSemanticTokenColors(e){if(this.customSemanticTokenRules=[],this.customSemanticHighlighting=void 0,e){this.customSemanticHighlighting=e.enabled,e.rules&&this.readSemanticTokenRules(e.rules);const t=this.getThemeSpecificColors(e);T.isObject(t)&&(t.enabled!==void 0&&(this.customSemanticHighlighting=t.enabled),t.rules&&this.readSemanticTokenRules(t.rules))}this.tokenColorIndex=void 0,this.textMateThemingRules=void 0}isThemeScope(e){return e.charAt(0)===te&&e.charAt(e.length-1)===ee}isThemeScopeMatch(e){const t=e.charAt(0),o=e.charAt(e.length-1),n=e.slice(0,-1),r=e.slice(1,-1),a=e.slice(1);return e===this.settingsId||this.settingsId.includes(r)&&t===E&&o===E||this.settingsId.startsWith(n)&&o===E||this.settingsId.endsWith(a)&&t===E}getThemeSpecificColors(e){let t;for(const o in e){const n=e[o];if(this.isThemeScope(o)&&n instanceof Object&&!Array.isArray(n)){const r=o.match(oe)||[];for(const a of r){const s=a.substring(1,a.length-1);if(this.isThemeScopeMatch(s)){t||(t={});const l=n;for(const c in l){const d=t[c],u=l[c];Array.isArray(d)&&Array.isArray(u)?t[c]=d.concat(u):u&&(t[c]=u)}}}}}return t}readSemanticTokenRules(e){for(const t in e)if(!this.isThemeScope(t))try{const o=W(t,e[t]);o&&this.customSemanticTokenRules.push(o)}catch{}}addCustomTokenColors(e){for(const t in F){const o=t,n=e[o];if(n){const r=typeof n=="string"?{foreground:n}:n,a=F[o];for(const s of a)this.customTokenColors.push({scope:s,settings:r})}}if(Array.isArray(e.textMateRules))for(const t of e.textMateRules)t.scope&&t.settings&&this.customTokenColors.push(t);e.semanticHighlighting!==void 0&&(this.customSemanticHighlightingDeprecated=e.semanticHighlighting)}ensureLoaded(e){return this.isLoaded?Promise.resolve(void 0):this.load(e)}reload(e){return this.load(e)}load(e){if(!this.location)return Promise.resolve(void 0);this.themeTokenColors=[],this.clearCaches();const t={colors:{},textMateRules:[],semanticTokenRules:[],semanticHighlighting:!1};return U(e,this.location,t).then(o=>{this.isLoaded=!0,this.semanticTokenRules=t.semanticTokenRules,this.colorMap=t.colors,this.themeTokenColors=t.textMateRules,this.themeSemanticHighlighting=t.semanticHighlighting})}clearCaches(){this.tokenColorIndex=void 0,this.textMateThemingRules=void 0,this.themeTokenScopeMatchers=void 0,this.customTokenScopeMatchers=void 0}toStorage(e){const t={};for(const n in this.colorMap)t[n]=k.Format.CSS.formatHexA(this.colorMap[n],!0);const o=JSON.stringify({id:this.id,label:this.label,settingsId:this.settingsId,themeTokenColors:this.themeTokenColors.map(n=>({settings:n.settings,scope:n.scope})),semanticTokenRules:this.semanticTokenRules.map(O.toJSONObject),extensionData:L.toJSONObject(this.extensionData),themeSemanticHighlighting:this.themeSemanticHighlighting,colorMap:t,watch:this.watch});e.store(C.STORAGE_KEY,o,H.PROFILE,q.USER)}get baseTheme(){return this.classNames[0]}get classNames(){return this.id.split(" ")}get type(){switch(this.baseTheme){case re:return x.LIGHT;case ie:return x.HIGH_CONTRAST_DARK;case ne:return x.HIGH_CONTRAST_LIGHT;default:return x.DARK}}static createUnloadedThemeForThemeType(e,t){return C.createUnloadedTheme(X(e),t)}static createUnloadedTheme(e,t){const o=new C(e,"","__"+e);if(o.isLoaded=!1,o.themeTokenColors=[],o.watch=!1,t)for(const n in t)o.colorMap[n]=k.fromHex(t[n]);return o}static createLoadedEmptyTheme(e,t){const o=new C(e,"",t);return o.isLoaded=!0,o.themeTokenColors=[],o.watch=!1,o}static fromStorageData(e){const t=e.get(C.STORAGE_KEY,H.PROFILE);if(t)try{const o=JSON.parse(t),n=new C("","","");for(const r in o)switch(r){case"colorMap":{const a=o[r];for(const s in a)n.colorMap[s]=k.fromHex(a[s]);break}case"themeTokenColors":case"id":case"label":case"settingsId":case"watch":case"themeSemanticHighlighting":n[r]=o[r];break;case"semanticTokenRules":{const a=o[r];if(Array.isArray(a))for(const s of a){const l=O.fromJSONObject(P,s);l&&n.semanticTokenRules.push(l)}break}case"location":break;case"extensionData":n.extensionData=L.fromJSONObject(o.extensionData);break}return!n.id||!n.settingsId?void 0:n}catch{return}}static fromExtensionTheme(e,t,o){const n=e.uiTheme||"vs-dark",r=ae(o.extensionId,e.path),a=`${n} ${r}`,s=e.label||K(e.path),l=e.id||s,c=new C(a,s,l);return c.description=e.description,c.watch=e._watch===!0,c.location=t,c.extensionData=o,c.isLoaded=!1,c}}function ae(i,e){e.startsWith("./")&&(e=e.substr(2));let t=`${i}-${e}`;return t=t.replace(/[^_a-zA-Z0-9-]/g,"-"),t.charAt(0).match(/[0-9-]/)&&(t="_"+t),t}async function U(i,e,t){if(I.extname(e)===".json"){const o=await i.readExtensionResource(e),n=[],r=D.parse(o,n);if(n.length>0)return Promise.reject(new Error(S.localize("error.cannotparsejson","Problems parsing JSON theme file: {0}",n.map(c=>B(c.error)).join(", "))));if(D.getNodeType(r)!=="object")return Promise.reject(new Error(S.localize("error.invalidformat","Invalid format for JSON theme file: Object expected.")));if(r.include&&await U(i,I.joinPath(I.dirname(e),r.include),t),Array.isArray(r.settings))return j(r.settings,t),null;t.semanticHighlighting=t.semanticHighlighting||r.semanticHighlighting;const a=r.colors;if(a){if(typeof a!="object")return Promise.reject(new Error(S.localize({key:"error.invalidformat.colors",comment:["{0} will be replaced by a path. Values in quotes should not be translated."]},"Problem parsing color theme file: {0}. Property 'colors' is not of type 'object'.",e.toString())));for(const c in a){const d=a[c];d===v?delete t.colors[c]:typeof d=="string"&&(t.colors[c]=k.fromHex(a[c]))}}const s=r.tokenColors;if(s)if(Array.isArray(s))t.textMateRules.push(...s);else if(typeof s=="string")await V(i,I.joinPath(I.dirname(e),s),t);else return Promise.reject(new Error(S.localize({key:"error.invalidformat.tokenColors",comment:["{0} will be replaced by a path. Values in quotes should not be translated."]},"Problem parsing color theme file: {0}. Property 'tokenColors' should be either an array specifying colors or a path to a TextMate theme file",e.toString())));const l=r.semanticTokenColors;if(l&&typeof l=="object")for(const c in l)try{const d=W(c,l[c]);d&&t.semanticTokenRules.push(d)}catch{return Promise.reject(new Error(S.localize({key:"error.invalidformat.semanticTokenColors",comment:["{0} will be replaced by a path. Values in quotes should not be translated."]},"Problem parsing color theme file: {0}. Property 'semanticTokenColors' contains a invalid selector",e.toString())))}}else return V(i,e,t)}function V(i,e,t){return i.readExtensionResource(e).then(o=>{try{const r=Q(o).settings;return Array.isArray(r)?(j(r,t),Promise.resolve(null)):Promise.reject(new Error(S.localize("error.plist.invalidformat","Problem parsing tmTheme file: {0}. 'settings' is not array.")))}catch(n){return Promise.reject(new Error(S.localize("error.cannotparse","Problems parsing tmTheme file: {0}",n.message)))}},o=>Promise.reject(new Error(S.localize("error.cannotload","Problems loading tmTheme file {0}: {1}",e.toString(),o.message))))}const ce={light:[{scope:"token.info-token",settings:{foreground:"#316bcd"}},{scope:"token.warn-token",settings:{foreground:"#cd9731"}},{scope:"token.error-token",settings:{foreground:"#cd3131"}},{scope:"token.debug-token",settings:{foreground:"#800080"}}],dark:[{scope:"token.info-token",settings:{foreground:"#6796e6"}},{scope:"token.warn-token",settings:{foreground:"#cd9731"}},{scope:"token.error-token",settings:{foreground:"#f44747"}},{scope:"token.debug-token",settings:{foreground:"#b267e6"}}],hcLight:[{scope:"token.info-token",settings:{foreground:"#316bcd"}},{scope:"token.warn-token",settings:{foreground:"#cd9731"}},{scope:"token.error-token",settings:{foreground:"#cd3131"}},{scope:"token.debug-token",settings:{foreground:"#800080"}}],hcDark:[{scope:"token.info-token",settings:{foreground:"#6796e6"}},{scope:"token.warn-token",settings:{foreground:"#008000"}},{scope:"token.error-token",settings:{foreground:"#FF0000"}},{scope:"token.debug-token",settings:{foreground:"#b267e6"}}]},G=i=>-1;function N(i,e){function t(r,a){for(let s=a-1;s>=0;s--)if(le(r,i[s]))return s;return-1}if(e.length<i.length)return-1;let o=e.length-1,n=t(e[o--],i.length);if(n>=0){const r=(n+1)*65536+i[n].length;for(;o>=0;)if(n=t(e[o--],n),n===-1)return-1;return r}return-1}function le(i,e){if(!i)return!1;if(i===e)return!0;const t=e.length;return i.length>t&&i.substr(0,t)===e&&i[t]==="."}function J(i){const e=i.scope;if(!e||!i.settings)return G;const t=[];if(Array.isArray(e))for(const o of e)z(o,N,t);else z(e,N,t);return t.length===0?G:o=>{let n=t[0].matcher(o);for(let r=1;r<t.length;r++)n=Math.max(n,t[r].matcher(o));return n}}function W(i,e){const t=P.parseTokenSelector(i);let o;if(typeof e=="string"?o=M.fromSettings(e,void 0):ue(e)&&(o=M.fromSettings(e.foreground,e.fontStyle,e.bold,e.underline,e.strikethrough,e.italic)),o)return{selector:t,style:o}}function ue(i){return i&&(T.isString(i.foreground)||T.isString(i.fontStyle)||T.isBoolean(i.italic)||T.isBoolean(i.underline)||T.isBoolean(i.strikethrough)||T.isBoolean(i.bold))}class fe{_lastColorId;_id2color;_color2id;constructor(){this._lastColorId=0,this._id2color=[],this._color2id=Object.create(null)}add(e){if(e=b(e),e===void 0)return 0;let t=this._color2id[e];return t||(t=++this._lastColorId,this._color2id[e]=t,this._id2color[t]=e,t)}get(e){if(e=b(e),e===void 0)return 0;const t=this._color2id[e];return t||(console.log(`Color ${e} not in index.`),0)}asArray(){return this._id2color.slice(0)}}function b(i){if(!i)return;typeof i!="string"&&(i=k.Format.CSS.formatHexA(i,!0));const e=i.length;if(i.charCodeAt(0)!==g.Hash||e!==4&&e!==5&&e!==7&&e!==9)return;const t=[g.Hash];for(let o=1;o<e;o++){const n=de(i.charCodeAt(o));if(!n)return;t.push(n),(e===4||e===5)&&t.push(n)}return t.length===9&&t[7]===g.F&&t[8]===g.F&&(t.length=7),String.fromCharCode(...t)}function de(i){return i>=g.Digit0&&i<=g.Digit9||i>=g.A&&i<=g.F?i:i>=g.a&&i<=g.f?i-g.a+g.A:0}export{C as ColorThemeData};
