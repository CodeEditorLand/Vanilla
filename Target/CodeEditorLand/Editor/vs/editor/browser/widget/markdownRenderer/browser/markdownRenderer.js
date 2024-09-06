var m=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var l=(i,e,t,n)=>{for(var o=n>1?void 0:n?f(e,t):e,r=i.length-1,s;r>=0;r--)(s=i[r])&&(o=(n?s(e,t,o):s(o))||o);return n&&o&&m(e,t,o),o},p=(i,e)=>(t,n)=>e(t,n,i);import{renderMarkdown as u}from"../../../../../../vs/base/browser/markdownRenderer.js";import{createTrustedTypesPolicy as g}from"../../../../../../vs/base/browser/trustedTypes.js";import{onUnexpectedError as y}from"../../../../../../vs/base/common/errors.js";import{Emitter as k}from"../../../../../../vs/base/common/event.js";import"../../../../../../vs/base/common/htmlContent.js";import{DisposableStore as I}from"../../../../../../vs/base/common/lifecycle.js";import"vs/css!./renderedMarkdown";import{applyFontInfo as S}from"../../../../../../vs/editor/browser/config/domFontInfo.js";import"../../../../../../vs/editor/browser/editorBrowser.js";import{EditorOption as _}from"../../../../../../vs/editor/common/config/editorOptions.js";import{ILanguageService as O}from"../../../../../../vs/editor/common/languages/language.js";import{PLAINTEXT_LANGUAGE_ID as v}from"../../../../../../vs/editor/common/languages/modesRegistry.js";import{tokenizeToString as M}from"../../../../../../vs/editor/common/languages/textToHtmlTokenizer.js";import{IOpenerService as h}from"../../../../../../vs/platform/opener/common/opener.js";let d=class{constructor(e,t,n){this._options=e;this._languageService=t;this._openerService=n}static _ttpTokenizer=g("tokenizeToString",{createHTML(e){return e}});_onDidRenderAsync=new k;onDidRenderAsync=this._onDidRenderAsync.event;dispose(){this._onDidRenderAsync.dispose()}render(e,t,n){if(!e)return{element:document.createElement("span"),dispose:()=>{}};const o=new I,r=o.add(u(e,{...this._getRenderOptions(e,o),...t},n));return r.element.classList.add("rendered-markdown"),{element:r.element,dispose:()=>o.dispose()}}_getRenderOptions(e,t){return{codeBlockRenderer:async(n,o)=>{let r;n?r=this._languageService.getLanguageIdByLanguageName(n):this._options.editor&&(r=this._options.editor.getModel()?.getLanguageId()),r||(r=v);const s=await M(this._languageService,o,r),a=document.createElement("span");if(a.innerHTML=d._ttpTokenizer?.createHTML(s)??s,this._options.editor){const c=this._options.editor.getOption(_.fontInfo);S(a,c)}else this._options.codeBlockFontFamily&&(a.style.fontFamily=this._options.codeBlockFontFamily);return this._options.codeBlockFontSize!==void 0&&(a.style.fontSize=this._options.codeBlockFontSize),a},asyncRenderCallback:()=>this._onDidRenderAsync.fire(),actionHandler:{callback:n=>w(this._openerService,n,e.isTrusted),disposables:t}}}};d=l([p(1,O),p(2,h)],d);async function w(i,e,t){try{return await i.open(e,{fromUserGesture:!0,allowContributedOpeners:!0,allowCommands:b(t)})}catch(n){return y(n),!1}}function b(i){return i===!0?!0:i&&Array.isArray(i.enabledCommands)?i.enabledCommands:!1}export{d as MarkdownRenderer,w as openLinkFromMarkdown};
