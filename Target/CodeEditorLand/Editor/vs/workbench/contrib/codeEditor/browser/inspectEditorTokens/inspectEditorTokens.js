var B=Object.defineProperty;var G=Object.getOwnPropertyDescriptor;var H=(p,e,o,i)=>{for(var r=i>1?void 0:i?G(e,o):e,n=p.length-1,d;n>=0;n--)(d=p[n])&&(r=(i?d(e,o,r):d(r))||r);return i&&r&&B(e,o,r),r},T=(p,e)=>(o,i)=>e(o,i,p);import"vs/css!./inspectEditorTokens";import*as l from"../../../../../../vs/base/browser/dom.js";import{CancellationTokenSource as q}from"../../../../../../vs/base/common/cancellation.js";import{CharCode as F}from"../../../../../../vs/base/common/charCode.js";import{Color as E}from"../../../../../../vs/base/common/color.js";import{KeyCode as j}from"../../../../../../vs/base/common/keyCodes.js";import{Disposable as z}from"../../../../../../vs/base/common/lifecycle.js";import{Schemas as U}from"../../../../../../vs/base/common/network.js";import{ContentWidgetPositionPreference as W}from"../../../../../../vs/editor/browser/editorBrowser.js";import{EditorAction as J,EditorContributionInstantiation as K,registerEditorAction as Q,registerEditorContribution as X}from"../../../../../../vs/editor/browser/editorExtensions.js";import"../../../../../../vs/editor/common/core/position.js";import{Range as O}from"../../../../../../vs/editor/common/core/range.js";import"../../../../../../vs/editor/common/editorCommon.js";import{ColorId as Y,FontStyle as N,StandardTokenType as w,TokenMetadata as L}from"../../../../../../vs/editor/common/encodedTokenAttributes.js";import{TreeSitterTokenizationRegistry as Z}from"../../../../../../vs/editor/common/languages.js";import{ILanguageService as ee}from"../../../../../../vs/editor/common/languages/language.js";import"../../../../../../vs/editor/common/model.js";import{ILanguageFeaturesService as te}from"../../../../../../vs/editor/common/services/languageFeatures.js";import{ITreeSitterParserService as ie}from"../../../../../../vs/editor/common/services/treeSitterParserService.js";import{SEMANTIC_HIGHLIGHTING_SETTING_ID as ne}from"../../../../../../vs/editor/contrib/semanticTokens/common/semanticTokensConfig.js";import*as $ from"../../../../../../vs/nls.js";import{IConfigurationService as oe}from"../../../../../../vs/platform/configuration/common/configuration.js";import{INotificationService as re}from"../../../../../../vs/platform/notification/common/notification.js";import{SemanticTokenRule as ae}from"../../../../../../vs/platform/theme/common/tokenClassificationRegistry.js";import{ITextMateTokenizationService as de}from"../../../../../../vs/workbench/services/textMate/browser/textMateTokenizationFeature.js";import{findMatchingThemeRule as se}from"../../../../../../vs/workbench/services/textMate/common/TMHelper.js";import"../../../../../../vs/workbench/services/themes/common/colorThemeData.js";import{IWorkbenchThemeService as le}from"../../../../../../vs/workbench/services/themes/common/workbenchThemeService.js";const t=l.$;let _=class extends z{static ID="editor.contrib.inspectEditorTokens";static get(e){return e.getContribution(_.ID)}_editor;_textMateService;_treeSitterService;_themeService;_languageService;_notificationService;_configurationService;_languageFeaturesService;_widget;constructor(e,o,i,r,n,d,s,c){super(),this._editor=e,this._textMateService=o,this._treeSitterService=i,this._themeService=n,this._languageService=r,this._notificationService=d,this._configurationService=s,this._languageFeaturesService=c,this._widget=null,this._register(this._editor.onDidChangeModel(a=>this.stop())),this._register(this._editor.onDidChangeModelLanguage(a=>this.stop())),this._register(this._editor.onKeyUp(a=>a.keyCode===j.Escape&&this.stop()))}dispose(){this.stop(),super.dispose()}launch(){this._widget||this._editor.hasModel()&&this._editor.getModel().uri.scheme!==U.vscodeNotebookCell&&(this._widget=new A(this._editor,this._textMateService,this._treeSitterService,this._languageService,this._themeService,this._notificationService,this._configurationService,this._languageFeaturesService))}stop(){this._widget&&(this._widget.dispose(),this._widget=null)}toggle(){this._widget?this.stop():this.launch()}};_=H([T(1,de),T(2,ie),T(3,ee),T(4,le),T(5,re),T(6,oe),T(7,te)],_);class ce extends J{constructor(){super({id:"editor.action.inspectTMScopes",label:$.localize("inspectEditorTokens","Developer: Inspect Editor Tokens and Scopes"),alias:"Developer: Inspect Editor Tokens and Scopes",precondition:void 0})}run(e,o){_.get(o)?.toggle()}}function V(p){p.length>40&&(p=p.substr(0,20)+"\u2026"+p.substr(p.length-20));let e="";for(let o=0,i=p.length;o<i;o++){const r=p.charCodeAt(o);switch(r){case F.Tab:e+="\u2192";break;case F.Space:e+="\xB7";break;default:e+=String.fromCharCode(r)}}return e}class A extends z{static _ID="editor.contrib.inspectEditorTokensWidget";allowEditorOverflow=!0;_isDisposed;_editor;_languageService;_themeService;_textMateService;_treeSitterService;_notificationService;_configurationService;_languageFeaturesService;_model;_domNode;_currentRequestCancellationTokenSource;constructor(e,o,i,r,n,d,s,c){super(),this._isDisposed=!1,this._editor=e,this._languageService=r,this._themeService=n,this._textMateService=o,this._treeSitterService=i,this._notificationService=d,this._configurationService=s,this._languageFeaturesService=c,this._model=this._editor.getModel(),this._domNode=document.createElement("div"),this._domNode.className="token-inspect-widget",this._currentRequestCancellationTokenSource=new q,this._beginCompute(this._editor.getPosition()),this._register(this._editor.onDidChangeCursorPosition(a=>this._beginCompute(this._editor.getPosition()))),this._register(n.onDidColorThemeChange(a=>this._beginCompute(this._editor.getPosition()))),this._register(s.onDidChangeConfiguration(a=>a.affectsConfiguration("editor.semanticHighlighting.enabled")&&this._beginCompute(this._editor.getPosition()))),this._editor.addContentWidget(this)}dispose(){this._isDisposed=!0,this._editor.removeContentWidget(this),this._currentRequestCancellationTokenSource.cancel(),super.dispose()}getId(){return A._ID}_beginCompute(e){const o=this._textMateService.createTokenizer(this._model.getLanguageId()),i=this._computeSemanticTokens(e),r=this._treeSitterService.getParseResult(this._model);l.clearNode(this._domNode),this._domNode.appendChild(document.createTextNode($.localize("inspectTMScopesWidget.loading","Loading..."))),Promise.all([o,i]).then(([n,d])=>{this._isDisposed||(this._compute(n,d,r?.tree,e),this._domNode.style.maxWidth=`${Math.max(this._editor.getLayoutInfo().width*.66,500)}px`,this._editor.layoutContentWidget(this))},n=>{this._notificationService.warn(n),setTimeout(()=>{_.get(this._editor)?.stop()})})}_isSemanticColoringEnabled(){const e=this._configurationService.getValue(ne,{overrideIdentifier:this._model.getLanguageId(),resource:this._model.uri})?.enabled;return typeof e=="boolean"?e:this._themeService.getColorTheme().semanticHighlighting}_compute(e,o,i,r){const n=e&&this._getTokensAtPosition(e,r),d=o&&this._getSemanticTokenAtPosition(o,r),s=i&&this._getTreeSitterTokenAtPosition(i,r);if(!n&&!d&&!s){l.reset(this._domNode,"No grammar or semantic tokens available.");return}const c=n?.metadata,a=d?.metadata,h=d&&V(this._model.getValueInRange(d.range)),S=n&&V(this._model.getLineContent(r.lineNumber).substring(n.token.startIndex,n.token.endIndex)),I=h||S||"";if(l.reset(this._domNode,t("h2.tiw-token",void 0,I,t("span.tiw-token-length",void 0,`${I.length} ${I.length===1?"char":"chars"}`))),l.append(this._domNode,t("hr.tiw-metadata-separator",{style:"clear:both"})),l.append(this._domNode,t("table.tiw-metadata-table",void 0,t("tbody",void 0,t("tr",void 0,t("td.tiw-metadata-key",void 0,"language"),t("td.tiw-metadata-value",void 0,c?.languageId||"")),t("tr",void 0,t("td.tiw-metadata-key",void 0,"standard token type"),t("td.tiw-metadata-value",void 0,this._tokenTypeToString(c?.tokenType||w.Other))),...this._formatMetadata(a,c)))),d){l.append(this._domNode,t("hr.tiw-metadata-separator"));const y=l.append(this._domNode,t("table.tiw-metadata-table",void 0)),k=l.append(y,t("tbody",void 0,t("tr",void 0,t("td.tiw-metadata-key",void 0,"semantic token type"),t("td.tiw-metadata-value",void 0,d.type))));if(d.modifiers.length&&l.append(k,t("tr",void 0,t("td.tiw-metadata-key",void 0,"modifiers"),t("td.tiw-metadata-value",void 0,d.modifiers.join(" ")))),d.metadata){const f=["foreground","bold","italic","underline","strikethrough"],u={},v=new Array;for(const g of f)if(d.metadata[g]!==void 0){const m=d.definitions[g],P=this._renderTokenStyleDefinition(m,g),b=P.map(D=>l.isHTMLElement(D)?D.outerHTML:D).join();let M=u[b];M||(u[b]=M=[],v.push([P,b])),M.push(g)}for(const[g,m]of v)l.append(k,t("tr",void 0,t("td.tiw-metadata-key",void 0,u[m].join(", ")),t("td.tiw-metadata-value",void 0,...g)))}}if(n){const y=this._themeService.getColorTheme();l.append(this._domNode,t("hr.tiw-metadata-separator"));const k=l.append(this._domNode,t("table.tiw-metadata-table")),f=l.append(k,t("tbody"));S&&S!==I&&l.append(f,t("tr",void 0,t("td.tiw-metadata-key",void 0,"textmate token"),t("td.tiw-metadata-value",void 0,`${S} (${S.length})`)));const u=new Array;for(let m=n.token.scopes.length-1;m>=0;m--)u.push(n.token.scopes[m]),m>0&&u.push(t("br"));l.append(f,t("tr",void 0,t("td.tiw-metadata-key",void 0,"textmate scopes"),t("td.tiw-metadata-value.tiw-metadata-scopes",void 0,...u)));const v=se(y,n.token.scopes,!1),g=d?.metadata?.foreground;if(v){if(g!==n.metadata.foreground){let m=t("code.tiw-theme-selector",void 0,v.rawSelector,t("br"),JSON.stringify(v.settings,null,"	"));g&&(m=t("s",void 0,m)),l.append(f,t("tr",void 0,t("td.tiw-metadata-key",void 0,"foreground"),t("td.tiw-metadata-value",void 0,m)))}}else g||l.append(f,t("tr",void 0,t("td.tiw-metadata-key",void 0,"foreground"),t("td.tiw-metadata-value",void 0,"No theme selector")))}if(s){l.append(this._domNode,t("hr.tiw-metadata-separator"));const y=l.append(this._domNode,t("table.tiw-metadata-table")),k=l.append(y,t("tbody"));l.append(k,t("tr",void 0,t("td.tiw-metadata-key",void 0,"tree-sitter token"),t("td.tiw-metadata-value",void 0,`${s.text}`)));const f=new Array;let u=s;for(;u.parent;)f.push(u.type),u=u.parent,u&&f.push(t("br"));l.append(k,t("tr",void 0,t("td.tiw-metadata-key",void 0,"tree-sitter scopes"),t("td.tiw-metadata-value.tiw-metadata-scopes",void 0,...f)));const g=Z.get(this._model.getLanguageId())?.captureAtPosition(r.lineNumber,r.column,this._model);g&&g.length>0&&l.append(k,t("tr",void 0,t("td.tiw-metadata-key",void 0,"foreground"),t("td.tiw-metadata-value",void 0,g[0].name)))}}_formatMetadata(e,o){const i=new Array;function r(a){const h=e?.[a]||o?.[a];if(h!==void 0){const S=e?.[a]?"tiw-metadata-semantic":"";i.push(t("tr",void 0,t("td.tiw-metadata-key",void 0,a),t(`td.tiw-metadata-value.${S}`,void 0,h)))}return h}const n=r("foreground"),d=r("background");if(n&&d){const a=E.fromHex(d),h=E.fromHex(n);a.isOpaque()?i.push(t("tr",void 0,t("td.tiw-metadata-key",void 0,"contrast ratio"),t("td.tiw-metadata-value",void 0,a.getContrastRatio(h.makeOpaque(a)).toFixed(2)))):i.push(t("tr",void 0,t("td.tiw-metadata-key",void 0,"Contrast ratio cannot be precise for background colors that use transparency"),t("td.tiw-metadata-value")))}const s=new Array;function c(a){let h;e&&e[a]?h=t("span.tiw-metadata-semantic",void 0,a):o&&o[a]&&(h=a),h&&(s.length&&s.push(" "),s.push(h))}return c("bold"),c("italic"),c("underline"),c("strikethrough"),s.length&&i.push(t("tr",void 0,t("td.tiw-metadata-key",void 0,"font style"),t("td.tiw-metadata-value",void 0,...s))),i}_decodeMetadata(e){const o=this._themeService.getColorTheme().tokenColorMap,i=L.getLanguageId(e),r=L.getTokenType(e),n=L.getFontStyle(e),d=L.getForeground(e),s=L.getBackground(e);return{languageId:this._languageService.languageIdCodec.decodeLanguageId(i),tokenType:r,bold:n&N.Bold?!0:void 0,italic:n&N.Italic?!0:void 0,underline:n&N.Underline?!0:void 0,strikethrough:n&N.Strikethrough?!0:void 0,foreground:o[d],background:o[s]}}_tokenTypeToString(e){switch(e){case w.Other:return"Other";case w.Comment:return"Comment";case w.String:return"String";case w.RegEx:return"RegEx";default:return"??"}}_getTokensAtPosition(e,o){const i=o.lineNumber,r=this._getStateBeforeLine(e,i),n=e.tokenizeLine(this._model.getLineContent(i),r),d=e.tokenizeLine2(this._model.getLineContent(i),r);let s=0;for(let a=n.tokens.length-1;a>=0;a--){const h=n.tokens[a];if(o.column-1>=h.startIndex){s=a;break}}let c=0;for(let a=d.tokens.length>>>1;a>=0;a--)if(o.column-1>=d.tokens[a<<1]){c=a;break}return{token:n.tokens[s],metadata:this._decodeMetadata(d.tokens[(c<<1)+1])}}_getStateBeforeLine(e,o){let i=null;for(let r=1;r<o;r++)i=e.tokenizeLine(this._model.getLineContent(r),i).ruleStack;return i}isSemanticTokens(e){return e&&e.data}async _computeSemanticTokens(e){if(!this._isSemanticColoringEnabled())return null;const o=this._languageFeaturesService.documentSemanticTokensProvider.ordered(this._model);if(o.length){const r=o[0],n=await Promise.resolve(r.provideDocumentSemanticTokens(this._model,null,this._currentRequestCancellationTokenSource.token));if(this.isSemanticTokens(n))return{tokens:n,legend:r.getLegend()}}const i=this._languageFeaturesService.documentRangeSemanticTokensProvider.ordered(this._model);if(i.length){const r=i[0],n=e.lineNumber,d=new O(n,1,n,this._model.getLineMaxColumn(n)),s=await Promise.resolve(r.provideDocumentRangeSemanticTokens(this._model,d,this._currentRequestCancellationTokenSource.token));if(this.isSemanticTokens(s))return{tokens:s,legend:r.getLegend()}}return null}_getSemanticTokenAtPosition(e,o){const i=e.tokens.data,r=this._model.getLanguageId();let n=0,d=0;const s=o.lineNumber-1,c=o.column-1;for(let a=0;a<i.length;a+=5){const h=i[a],S=i[a+1],I=i[a+2],y=i[a+3],k=i[a+4],f=n+h,u=h===0?d+S:S;if(s===f&&u<=c&&c<u+I){const v=e.legend.tokenTypes[y]||"not in legend (ignored)",g=[];let m=k;for(let x=0;m>0&&x<e.legend.tokenModifiers.length;x++)m&1&&g.push(e.legend.tokenModifiers[x]),m=m>>1;m>0&&g.push("not in legend (ignored)");const P=new O(f+1,u+1,f+1,u+1+I),b={},M=this._themeService.getColorTheme().tokenColorMap,C=this._themeService.getColorTheme().getTokenStyleMetadata(v,g,r,!0,b);let R;return C&&(R={languageId:void 0,tokenType:w.Other,bold:C?.bold,italic:C?.italic,underline:C?.underline,strikethrough:C?.strikethrough,foreground:M[C?.foreground||Y.None],background:void 0}),{type:v,modifiers:g,range:P,metadata:R,definitions:b}}n=f,d=u}return null}_walkTreeforPosition(e,o){const i=this._model.getOffsetAt(o);e.gotoFirstChild();let r=!1,n=null;do e.currentNode.startIndex<=i&&i<e.currentNode.endIndex?(r=!0,n=e.currentNode):r=!1;while(r?e.gotoFirstChild():e.gotoNextSibling());return n}_getTreeSitterTokenAtPosition(e,o){const i=e.walk();return this._walkTreeforPosition(i,o)}_renderTokenStyleDefinition(e,o){const i=new Array;if(e===void 0)return i;const r=this._themeService.getColorTheme();if(Array.isArray(e)){const n={};r.resolveScopes(e,n);const d=n[o];if(d&&n.scope){const s=t("ul.tiw-metadata-values"),c=Array.isArray(d.scope)?d.scope:[String(d.scope)];for(const a of c)s.appendChild(t("li.tiw-metadata-value.tiw-metadata-scopes",void 0,a));return i.push(n.scope.join(" "),s,t("code.tiw-theme-selector",void 0,JSON.stringify(d.settings,null,"	"))),i}return i}else if(ae.is(e)){const n=r.getTokenStylingRuleScope(e);return n==="setting"?(i.push(`User settings: ${e.selector.id} - ${this._renderStyleProperty(e.style,o)}`),i):(n==="theme"&&i.push(`Color theme: ${e.selector.id} - ${this._renderStyleProperty(e.style,o)}`),i)}else{const n=r.resolveTokenStyleValue(e);return i.push(`Default: ${n?this._renderStyleProperty(n,o):""}`),i}}_renderStyleProperty(e,o){switch(o){case"foreground":return e.foreground?E.Format.CSS.formatHexA(e.foreground,!0):"";default:return e[o]!==void 0?String(e[o]):""}}getDomNode(){return this._domNode}getPosition(){return{position:this._editor.getPosition(),preference:[W.BELOW,W.ABOVE]}}}X(_.ID,_,K.Lazy),Q(ce);