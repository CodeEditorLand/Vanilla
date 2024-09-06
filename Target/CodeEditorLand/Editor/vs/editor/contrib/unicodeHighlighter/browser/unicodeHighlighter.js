var J=Object.defineProperty;var X=Object.getOwnPropertyDescriptor;var x=(n,t,i,o)=>{for(var e=o>1?void 0:o?X(t,i):t,s=n.length-1,c;s>=0;s--)(c=n[s])&&(e=(o?c(t,i,e):c(e))||e);return o&&e&&J(t,i,e),e},p=(n,t)=>(i,o)=>t(i,o,n);import{RunOnceScheduler as T}from"../../../../base/common/async.js";import{CharCode as Y}from"../../../../base/common/charCode.js";import{Codicon as Z}from"../../../../base/common/codicons.js";import{MarkdownString as ee}from"../../../../base/common/htmlContent.js";import{Disposable as U}from"../../../../base/common/lifecycle.js";import*as ie from"../../../../base/common/platform.js";import{InvisibleCharacters as L,isBasicASCII as te}from"../../../../base/common/strings.js";import"./unicodeHighlighter.css";import*as r from"../../../../nls.js";import{ConfigurationTarget as m,IConfigurationService as C}from"../../../../platform/configuration/common/configuration.js";import{IInstantiationService as oe}from"../../../../platform/instantiation/common/instantiation.js";import{IOpenerService as ne}from"../../../../platform/opener/common/opener.js";import{IQuickInputService as re}from"../../../../platform/quickinput/common/quickInput.js";import{registerIcon as se}from"../../../../platform/theme/common/iconRegistry.js";import{IWorkspaceTrustManagementService as ae}from"../../../../platform/workspace/common/workspaceTrust.js";import"../../../browser/editorBrowser.js";import{EditorAction as v,EditorContributionInstantiation as ce,registerEditorAction as O,registerEditorContribution as le}from"../../../browser/editorExtensions.js";import{EditorOption as E,inUntrustedWorkspace as R,unicodeHighlightConfigKeys as g}from"../../../common/config/editorOptions.js";import"../../../common/core/range.js";import"../../../common/editorCommon.js";import{ILanguageService as he}from"../../../common/languages/language.js";import{TrackedRangeStickiness as de}from"../../../common/model.js";import{ModelDecorationOptions as ge}from"../../../common/model/textModel.js";import{IEditorWorkerService as z}from"../../../common/services/editorWorker.js";import{UnicodeHighlighterReasonKind as b,UnicodeTextModelHighlighter as V}from"../../../common/services/unicodeTextModelHighlighter.js";import{isModelDecorationInComment as W,isModelDecorationInString as N,isModelDecorationVisible as $}from"../../../common/viewModel/viewModelDecorations.js";import{HoverAnchorType as F,HoverParticipantRegistry as ue}from"../../hover/browser/hoverTypes.js";import{MarkdownHover as pe,renderMarkdownHovers as me}from"../../hover/browser/markdownHoverParticipant.js";import{BannerController as be}from"./bannerController.js";const fe=se("extensions-warning-message",Z.warning,r.localize("warningIcon","Icon shown with a warning message in the extensions editor."));let f=class extends U{constructor(i,o,e,s){super();this._editor=i;this._editorWorkerService=o;this._workspaceTrustService=e;this._bannerController=this._register(s.createInstance(be,i)),this._register(this._editor.onDidChangeModel(()=>{this._bannerClosed=!1,this._updateHighlighter()})),this._options=i.getOption(E.unicodeHighlighting),this._register(e.onDidChangeTrust(c=>{this._updateHighlighter()})),this._register(i.onDidChangeConfiguration(c=>{c.hasChanged(E.unicodeHighlighting)&&(this._options=i.getOption(E.unicodeHighlighting),this._updateHighlighter())})),this._updateHighlighter()}static ID="editor.contrib.unicodeHighlighter";_highlighter=null;_options;_bannerController;_bannerClosed=!1;dispose(){this._highlighter&&(this._highlighter.dispose(),this._highlighter=null),super.dispose()}_updateState=i=>{if(i&&i.hasMore){if(this._bannerClosed)return;const o=Math.max(i.ambiguousCharacterCount,i.nonBasicAsciiCharacterCount,i.invisibleCharacterCount);let e;if(i.nonBasicAsciiCharacterCount>=o)e={message:r.localize("unicodeHighlighting.thisDocumentHasManyNonBasicAsciiUnicodeCharacters","This document contains many non-basic ASCII unicode characters"),command:new y};else if(i.ambiguousCharacterCount>=o)e={message:r.localize("unicodeHighlighting.thisDocumentHasManyAmbiguousUnicodeCharacters","This document contains many ambiguous unicode characters"),command:new I};else if(i.invisibleCharacterCount>=o)e={message:r.localize("unicodeHighlighting.thisDocumentHasManyInvisibleUnicodeCharacters","This document contains many invisible unicode characters"),command:new D};else throw new Error("Unreachable");this._bannerController.show({id:"unicodeHighlightBanner",message:e.message,icon:fe,actions:[{label:e.command.shortLabel,href:`command:${e.command.id}`}],onClose:()=>{this._bannerClosed=!0}})}else this._bannerController.hide()};_updateHighlighter(){if(this._updateState(null),this._highlighter&&(this._highlighter.dispose(),this._highlighter=null),!this._editor.hasModel())return;const i=Ie(this._workspaceTrustService.isWorkspaceTrusted(),this._options);if([i.nonBasicASCII,i.ambiguousCharacters,i.invisibleCharacters].every(e=>e===!1))return;const o={nonBasicASCII:i.nonBasicASCII,ambiguousCharacters:i.ambiguousCharacters,invisibleCharacters:i.invisibleCharacters,includeComments:i.includeComments,includeStrings:i.includeStrings,allowedCodePoints:Object.keys(i.allowedCharacters).map(e=>e.codePointAt(0)),allowedLocales:Object.keys(i.allowedLocales).map(e=>e==="_os"?new Intl.NumberFormat().resolvedOptions().locale:e==="_vscode"?ie.language:e)};this._editorWorkerService.canComputeUnicodeHighlights(this._editor.getModel().uri)?this._highlighter=new _(this._editor,o,this._updateState,this._editorWorkerService):this._highlighter=new Ce(this._editor,o,this._updateState)}getDecorationInfo(i){return this._highlighter?this._highlighter.getDecorationInfo(i):null}};f=x([p(1,z),p(2,ae),p(3,oe)],f);function Ie(n,t){return{nonBasicASCII:t.nonBasicASCII===R?!n:t.nonBasicASCII,ambiguousCharacters:t.ambiguousCharacters,invisibleCharacters:t.invisibleCharacters,includeComments:t.includeComments===R?!n:t.includeComments,includeStrings:t.includeStrings===R?!n:t.includeStrings,allowedCharacters:t.allowedCharacters,allowedLocales:t.allowedLocales}}let _=class extends U{constructor(i,o,e,s){super();this._editor=i;this._options=o;this._updateState=e;this._editorWorkerService=s;this._updateSoon=this._register(new T(()=>this._update(),250)),this._register(this._editor.onDidChangeModelContent(()=>{this._updateSoon.schedule()})),this._updateSoon.schedule()}_model=this._editor.getModel();_updateSoon;_decorations=this._editor.createDecorationsCollection();dispose(){this._decorations.clear(),super.dispose()}_update(){if(this._model.isDisposed())return;if(!this._model.mightContainNonBasicASCII()){this._decorations.clear();return}const i=this._model.getVersionId();this._editorWorkerService.computedUnicodeHighlights(this._model.uri,this._options).then(o=>{if(this._model.isDisposed()||this._model.getVersionId()!==i)return;this._updateState(o);const e=[];if(!o.hasMore)for(const s of o.ranges)e.push({range:s,options:M.instance.getDecorationFromOptions(this._options)});this._decorations.set(e)})}getDecorationInfo(i){if(!this._decorations.has(i))return null;const o=this._editor.getModel();if(!$(o,i))return null;const e=o.getValueInRange(i.range);return{reason:K(e,this._options),inComment:W(o,i),inString:N(o,i)}}};_=x([p(3,z)],_);class Ce extends U{constructor(i,o,e){super();this._editor=i;this._options=o;this._updateState=e;this._updateSoon=this._register(new T(()=>this._update(),250)),this._register(this._editor.onDidLayoutChange(()=>{this._updateSoon.schedule()})),this._register(this._editor.onDidScrollChange(()=>{this._updateSoon.schedule()})),this._register(this._editor.onDidChangeHiddenAreas(()=>{this._updateSoon.schedule()})),this._register(this._editor.onDidChangeModelContent(()=>{this._updateSoon.schedule()})),this._updateSoon.schedule()}_model=this._editor.getModel();_updateSoon;_decorations=this._editor.createDecorationsCollection();dispose(){this._decorations.clear(),super.dispose()}_update(){if(this._model.isDisposed())return;if(!this._model.mightContainNonBasicASCII()){this._decorations.clear();return}const i=this._editor.getVisibleRanges(),o=[],e={ranges:[],ambiguousCharacterCount:0,invisibleCharacterCount:0,nonBasicAsciiCharacterCount:0,hasMore:!1};for(const s of i){const c=V.computeUnicodeHighlights(this._model,this._options,s);for(const H of c.ranges)e.ranges.push(H);e.ambiguousCharacterCount+=e.ambiguousCharacterCount,e.invisibleCharacterCount+=e.invisibleCharacterCount,e.nonBasicAsciiCharacterCount+=e.nonBasicAsciiCharacterCount,e.hasMore=e.hasMore||c.hasMore}if(!e.hasMore)for(const s of e.ranges)o.push({range:s,options:M.instance.getDecorationFromOptions(this._options)});this._updateState(e),this._decorations.set(o)}getDecorationInfo(i){if(!this._decorations.has(i))return null;const o=this._editor.getModel(),e=o.getValueInRange(i.range);return $(o,i)?{reason:K(e,this._options),inComment:W(o,i),inString:N(o,i)}:null}}class Ci{constructor(t,i,o){this.owner=t;this.range=i;this.decoration=o}isValidForHoverAnchor(t){return t.type===F.Range&&this.range.startColumn<=t.range.startColumn&&this.range.endColumn>=t.range.endColumn}}const j=r.localize("unicodeHighlight.configureUnicodeHighlightOptions","Configure Unicode Highlight Options");let A=class{constructor(t,i,o){this._editor=t;this._languageService=i;this._openerService=o}hoverOrdinal=5;computeSync(t,i){if(!this._editor.hasModel()||t.type!==F.Range)return[];const o=this._editor.getModel(),e=this._editor.getContribution(f.ID);if(!e)return[];const s=[],c=new Set;let H=300;for(const S of i){const h=e.getDecorationInfo(S);if(!h)continue;const w=o.getValueInRange(S.range).codePointAt(0),l=B(w);let d;switch(h.reason.kind){case b.Ambiguous:{te(h.reason.confusableWith)?d=r.localize("unicodeHighlight.characterIsAmbiguousASCII","The character {0} could be confused with the ASCII character {1}, which is more common in source code.",l,B(h.reason.confusableWith.codePointAt(0))):d=r.localize("unicodeHighlight.characterIsAmbiguous","The character {0} could be confused with the character {1}, which is more common in source code.",l,B(h.reason.confusableWith.codePointAt(0)));break}case b.Invisible:d=r.localize("unicodeHighlight.characterIsInvisible","The character {0} is invisible.",l);break;case b.NonBasicAscii:d=r.localize("unicodeHighlight.characterIsNonBasicAscii","The character {0} is not a basic ASCII character.",l);break}if(c.has(d))continue;c.add(d);const a={codePoint:w,reason:h.reason,inComment:h.inComment,inString:h.inString},Q=r.localize("unicodeHighlight.adjustSettings","Adjust settings"),q=`command:${k.ID}?${encodeURIComponent(JSON.stringify(a))}`,G=new ee("",!0).appendMarkdown(d).appendText(" ").appendLink(q,Q,j);s.push(new pe(this,S.range,[G],!1,H++))}return s}renderHoverParts(t,i){return me(t,i,this._editor,this._languageService,this._openerService)}getAccessibleContent(t){return t.contents.map(i=>i.value).join(`
`)}};A=x([p(1,he),p(2,ne)],A);function P(n){return`U+${n.toString(16).padStart(4,"0")}`}function B(n){let t=`\`${P(n)}\``;return L.isInvisibleCharacter(n)||(t+=` "${`${ve(n)}`}"`),t}function ve(n){return n===Y.BackTick?"`` ` ``":"`"+String.fromCodePoint(n)+"`"}function K(n,t){return V.computeUnicodeHighlightReason(n,t)}class M{static instance=new M;map=new Map;getDecorationFromOptions(t){return this.getDecoration(!t.includeComments,!t.includeStrings)}getDecoration(t,i){const o=`${t}${i}`;let e=this.map.get(o);return e||(e=ge.createDynamic({description:"unicode-highlight",stickiness:de.NeverGrowsWhenTypingAtEdges,className:"unicode-highlight",showIfCollapsed:!0,overviewRuler:null,minimap:null,hideInCommentTokens:t,hideInStringTokens:i}),this.map.set(o,e)),e}}class He extends v{static ID="editor.action.unicodeHighlight.disableHighlightingInComments";shortLabel=r.localize("unicodeHighlight.disableHighlightingInComments.shortLabel","Disable Highlight In Comments");constructor(){super({id:I.ID,label:r.localize("action.unicodeHighlight.disableHighlightingInComments","Disable highlighting of characters in comments"),alias:"Disable highlighting of characters in comments",precondition:void 0})}async run(t,i,o){const e=t?.get(C);e&&this.runAction(e)}async runAction(t){await t.updateValue(g.includeComments,!1,m.USER)}}class Se extends v{static ID="editor.action.unicodeHighlight.disableHighlightingInStrings";shortLabel=r.localize("unicodeHighlight.disableHighlightingInStrings.shortLabel","Disable Highlight In Strings");constructor(){super({id:I.ID,label:r.localize("action.unicodeHighlight.disableHighlightingInStrings","Disable highlighting of characters in strings"),alias:"Disable highlighting of characters in strings",precondition:void 0})}async run(t,i,o){const e=t?.get(C);e&&this.runAction(e)}async runAction(t){await t.updateValue(g.includeStrings,!1,m.USER)}}class I extends v{static ID="editor.action.unicodeHighlight.disableHighlightingOfAmbiguousCharacters";shortLabel=r.localize("unicodeHighlight.disableHighlightingOfAmbiguousCharacters.shortLabel","Disable Ambiguous Highlight");constructor(){super({id:I.ID,label:r.localize("action.unicodeHighlight.disableHighlightingOfAmbiguousCharacters","Disable highlighting of ambiguous characters"),alias:"Disable highlighting of ambiguous characters",precondition:void 0})}async run(t,i,o){const e=t?.get(C);e&&this.runAction(e)}async runAction(t){await t.updateValue(g.ambiguousCharacters,!1,m.USER)}}class D extends v{static ID="editor.action.unicodeHighlight.disableHighlightingOfInvisibleCharacters";shortLabel=r.localize("unicodeHighlight.disableHighlightingOfInvisibleCharacters.shortLabel","Disable Invisible Highlight");constructor(){super({id:D.ID,label:r.localize("action.unicodeHighlight.disableHighlightingOfInvisibleCharacters","Disable highlighting of invisible characters"),alias:"Disable highlighting of invisible characters",precondition:void 0})}async run(t,i,o){const e=t?.get(C);e&&this.runAction(e)}async runAction(t){await t.updateValue(g.invisibleCharacters,!1,m.USER)}}class y extends v{static ID="editor.action.unicodeHighlight.disableHighlightingOfNonBasicAsciiCharacters";shortLabel=r.localize("unicodeHighlight.disableHighlightingOfNonBasicAsciiCharacters.shortLabel","Disable Non ASCII Highlight");constructor(){super({id:y.ID,label:r.localize("action.unicodeHighlight.disableHighlightingOfNonBasicAsciiCharacters","Disable highlighting of non basic ASCII characters"),alias:"Disable highlighting of non basic ASCII characters",precondition:void 0})}async run(t,i,o){const e=t?.get(C);e&&this.runAction(e)}async runAction(t){await t.updateValue(g.nonBasicASCII,!1,m.USER)}}class k extends v{static ID="editor.action.unicodeHighlight.showExcludeOptions";constructor(){super({id:k.ID,label:r.localize("action.unicodeHighlight.showExcludeOptions","Show Exclude Options"),alias:"Show Exclude Options",precondition:void 0})}async run(t,i,o){const{codePoint:e,reason:s,inString:c,inComment:H}=o,S=String.fromCodePoint(e),h=t.get(re),u=t.get(C);function w(a){return L.isInvisibleCharacter(a)?r.localize("unicodeHighlight.excludeInvisibleCharFromBeingHighlighted","Exclude {0} (invisible character) from being highlighted",P(a)):r.localize("unicodeHighlight.excludeCharFromBeingHighlighted","Exclude {0} from being highlighted",`${P(a)} "${S}"`)}const l=[];if(s.kind===b.Ambiguous)for(const a of s.notAmbiguousInLocales)l.push({label:r.localize("unicodeHighlight.allowCommonCharactersInLanguage",'Allow unicode characters that are more common in the language "{0}".',a),run:async()=>{Ae(u,[a])}});if(l.push({label:w(e),run:()=>_e(u,[e])}),H){const a=new He;l.push({label:a.label,run:async()=>a.runAction(u)})}else if(c){const a=new Se;l.push({label:a.label,run:async()=>a.runAction(u)})}if(s.kind===b.Ambiguous){const a=new I;l.push({label:a.label,run:async()=>a.runAction(u)})}else if(s.kind===b.Invisible){const a=new D;l.push({label:a.label,run:async()=>a.runAction(u)})}else if(s.kind===b.NonBasicAscii){const a=new y;l.push({label:a.label,run:async()=>a.runAction(u)})}else De(s);const d=await h.pick(l,{title:j});d&&await d.run()}}async function _e(n,t){const i=n.getValue(g.allowedCharacters);let o;typeof i=="object"&&i?o=i:o={};for(const e of t)o[String.fromCodePoint(e)]=!0;await n.updateValue(g.allowedCharacters,o,m.USER)}async function Ae(n,t){const i=n.inspect(g.allowedLocales).user?.value;let o;typeof i=="object"&&i?o=Object.assign({},i):o={};for(const e of t)o[e]=!0;await n.updateValue(g.allowedLocales,o,m.USER)}function De(n){throw new Error(`Unexpected value: ${n}`)}O(I),O(D),O(y),O(k),le(f.ID,f,ce.AfterFirstRender),ue.register(A);export{He as DisableHighlightingInCommentsAction,Se as DisableHighlightingInStringsAction,I as DisableHighlightingOfAmbiguousCharactersAction,D as DisableHighlightingOfInvisibleCharactersAction,y as DisableHighlightingOfNonBasicAsciiCharactersAction,k as ShowExcludeOptions,f as UnicodeHighlighter,Ci as UnicodeHighlighterHover,A as UnicodeHighlighterHoverParticipant,fe as warningIcon};
