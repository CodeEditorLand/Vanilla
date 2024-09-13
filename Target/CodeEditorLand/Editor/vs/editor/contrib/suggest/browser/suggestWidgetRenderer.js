var W=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var E=(a,t,n,e)=>{for(var o=e>1?void 0:e?V(t,n):t,s=a.length-1,c;s>=0;s--)(c=a[s])&&(o=(e?c(t,n,o):c(o))||o);return e&&o&&W(t,n,o),o},u=(a,t)=>(n,e)=>t(n,e,a);import{$ as r,append as l,hide as F,show as D}from"../../../../base/browser/dom.js";import{IconLabel as U}from"../../../../base/browser/ui/iconLabel/iconLabel.js";import"../../../../base/browser/ui/list/list.js";import{Codicon as j}from"../../../../base/common/codicons.js";import{ThemeIcon as _}from"../../../../base/common/themables.js";import{Emitter as B}from"../../../../base/common/event.js";import{createMatches as G}from"../../../../base/common/filters.js";import{DisposableStore as J}from"../../../../base/common/lifecycle.js";import{URI as L}from"../../../../base/common/uri.js";import"../../../browser/editorBrowser.js";import{EditorOption as b}from"../../../common/config/editorOptions.js";import{CompletionItemKind as C,CompletionItemKinds as Q,CompletionItemTag as X}from"../../../common/languages.js";import{getIconClasses as I}from"../../../common/services/getIconClasses.js";import{IModelService as Y}from"../../../common/services/model.js";import{ILanguageService as Z}from"../../../common/languages/language.js";import*as H from"../../../../nls.js";import{FileKind as S}from"../../../../platform/files/common/files.js";import{registerIcon as ee}from"../../../../platform/theme/common/iconRegistry.js";import{IThemeService as oe}from"../../../../platform/theme/common/themeService.js";import"./suggest.js";import{canExpandCompletionItem as te}from"./suggestWidgetDetails.js";function ne(a){return`suggest-aria-id:${a}`}const ie=ee("suggest-more-info",j.chevronRight,H.localize("suggestMoreInfoIcon","Icon for more information in the suggest widget.")),se=new class p{static _regexRelaxed=/(#([\da-fA-F]{3}){1,2}|(rgb|hsl)a\(\s*(\d{1,3}%?\s*,\s*){3}(1|0?\.\d+)\)|(rgb|hsl)\(\s*\d{1,3}%?(\s*,\s*\d{1,3}%?){2}\s*\))/;static _regexStrict=new RegExp(`^${p._regexRelaxed.source}$`,"i");extract(t,n){if(t.textLabel.match(p._regexStrict))return n[0]=t.textLabel,!0;if(t.completion.detail&&t.completion.detail.match(p._regexStrict))return n[0]=t.completion.detail,!0;if(t.completion.documentation){const e=typeof t.completion.documentation=="string"?t.completion.documentation:t.completion.documentation.value,o=p._regexRelaxed.exec(e);if(o&&(o.index===0||o.index+o[0].length===e.length))return n[0]=o[0],!0}return!1}};let x=class{constructor(t,n,e,o){this._editor=t;this._modelService=n;this._languageService=e;this._themeService=o}_onDidToggleDetails=new B;onDidToggleDetails=this._onDidToggleDetails.event;templateId="suggestion";dispose(){this._onDidToggleDetails.dispose()}renderTemplate(t){const n=new J,e=t;e.classList.add("show-file-icons");const o=l(t,r(".icon")),s=l(o,r("span.colorspan")),c=l(t,r(".contents")),i=l(c,r(".main")),d=l(i,r(".icon-label.codicon")),f=l(i,r("span.left")),v=l(i,r("span.right")),M=new U(f,{supportHighlights:!0,supportIcons:!0});n.add(M);const w=l(f,r("span.signature-label")),k=l(f,r("span.qualifier-label")),N=l(v,r("span.details-label")),h=l(v,r("span.readMore"+_.asCSSSelector(ie)));return h.title=H.localize("readMore","Read More"),{root:e,left:f,right:v,icon:o,colorspan:s,iconLabel:M,iconContainer:d,parametersLabel:w,qualifierLabel:k,detailsLabel:N,readMore:h,disposables:n,configureFont:()=>{const y=this._editor.getOptions(),m=y.get(b.fontInfo),O=m.getMassagedFontFamily(),R=m.fontFeatureSettings,z=y.get(b.suggestFontSize)||m.fontSize,$=y.get(b.suggestLineHeight)||m.lineHeight,P=m.fontWeight,q=m.letterSpacing,A=`${z}px`,g=`${$}px`,K=`${q}px`;e.style.fontSize=A,e.style.fontWeight=P,e.style.letterSpacing=K,i.style.fontFamily=O,i.style.fontFeatureSettings=R,i.style.lineHeight=g,o.style.height=g,o.style.width=g,h.style.height=g,h.style.width=g}}}renderElement(t,n,e){e.configureFont();const{completion:o}=t;e.root.id=ne(n),e.colorspan.style.backgroundColor="";const s={labelEscapeNewLines:!0,matches:G(t.score)},c=[];if(o.kind===C.Color&&se.extract(t,c))e.icon.className="icon customcolor",e.iconContainer.className="icon hide",e.colorspan.style.backgroundColor=c[0];else if(o.kind===C.File&&this._themeService.getFileIconTheme().hasFileIcons){e.icon.className="icon hide",e.iconContainer.className="icon hide";const i=I(this._modelService,this._languageService,L.from({scheme:"fake",path:t.textLabel}),S.FILE),d=I(this._modelService,this._languageService,L.from({scheme:"fake",path:o.detail}),S.FILE);s.extraClasses=i.length>d.length?i:d}else o.kind===C.Folder&&this._themeService.getFileIconTheme().hasFolderIcons?(e.icon.className="icon hide",e.iconContainer.className="icon hide",s.extraClasses=[I(this._modelService,this._languageService,L.from({scheme:"fake",path:t.textLabel}),S.FOLDER),I(this._modelService,this._languageService,L.from({scheme:"fake",path:o.detail}),S.FOLDER)].flat()):(e.icon.className="icon hide",e.iconContainer.className="",e.iconContainer.classList.add("suggest-icon",..._.asClassNameArray(Q.toIcon(o.kind))));o.tags&&o.tags.indexOf(X.Deprecated)>=0&&(s.extraClasses=(s.extraClasses||[]).concat(["deprecated"]),s.matches=[]),e.iconLabel.setLabel(t.textLabel,void 0,s),typeof o.label=="string"?(e.parametersLabel.textContent="",e.detailsLabel.textContent=T(o.detail||""),e.root.classList.add("string-label")):(e.parametersLabel.textContent=T(o.label.detail||""),e.detailsLabel.textContent=T(o.label.description||""),e.root.classList.remove("string-label")),this._editor.getOption(b.suggest).showInlineDetails?D(e.detailsLabel):F(e.detailsLabel),te(t)?(e.right.classList.add("can-expand-details"),D(e.readMore),e.readMore.onmousedown=i=>{i.stopPropagation(),i.preventDefault()},e.readMore.onclick=i=>{i.stopPropagation(),i.preventDefault(),this._onDidToggleDetails.fire()}):(e.right.classList.remove("can-expand-details"),F(e.readMore),e.readMore.onmousedown=null,e.readMore.onclick=null)}disposeTemplate(t){t.disposables.dispose()}};x=E([u(1,Y),u(2,Z),u(3,oe)],x);function T(a){return a.replace(/\r\n|\r|\n/g,"")}export{x as ItemRenderer,ne as getAriaId};
