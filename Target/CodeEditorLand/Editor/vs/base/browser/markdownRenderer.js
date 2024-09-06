import*as h from"../../../vs/base/browser/dom.js";import*as E from"vs/base/browser/dompurify/dompurify";import{DomEmitter as O}from"../../../vs/base/browser/event.js";import{createElement as j}from"../../../vs/base/browser/formattedTextRenderer.js";import{StandardKeyboardEvent as F}from"../../../vs/base/browser/keyboardEvent.js";import{StandardMouseEvent as K}from"../../../vs/base/browser/mouseEvent.js";import{renderLabelWithIcons as V}from"../../../vs/base/browser/ui/iconLabel/iconLabels.js";import{onUnexpectedError as Z}from"../../../vs/base/common/errors.js";import{Event as G}from"../../../vs/base/common/event.js";import{escapeDoubleQuotes as L,parseHrefAndDimensions as J,removeMarkdownEscapes as R}from"../../../vs/base/common/htmlContent.js";import{markdownEscapeEscapedIcons as Q}from"../../../vs/base/common/iconLabels.js";import{defaultGenerator as D}from"../../../vs/base/common/idGenerator.js";import{KeyCode as $}from"../../../vs/base/common/keyCodes.js";import{Lazy as z}from"../../../vs/base/common/lazy.js";import{DisposableStore as P,toDisposable as Y}from"../../../vs/base/common/lifecycle.js";import*as g from"vs/base/common/marked/marked";import{parse as X}from"../../../vs/base/common/marshalling.js";import{FileAccess as ee,Schemas as f}from"../../../vs/base/common/network.js";import{cloneAndChange as te}from"../../../vs/base/common/objects.js";import{dirname as ne,resolvePath as _}from"../../../vs/base/common/resources.js";import{escape as A}from"../../../vs/base/common/strings.js";import{URI as b}from"../../../vs/base/common/uri.js";const M=Object.freeze({image:({href:e,title:t,text:r})=>{let a=[],i=[];return e&&({href:e,dimensions:a}=J(e),i.push(`src="${L(e)}"`)),r&&i.push(`alt="${L(r)}"`),t&&i.push(`title="${L(t)}"`),a.length&&(i=i.concat(a)),"<img "+i.join(" ")+">"},paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>`},link({href:e,title:t,tokens:r}){let a=this.parser.parseInline(r);return typeof e!="string"?"":(e===a&&(a=R(a)),t=typeof t=="string"?L(R(t)):"",e=R(e),e=e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),`<a href="${e}" title="${t||e}" draggable="false">${a}</a>`)}});function Ze(e,t={},r={}){const a=new P;let i=!1;const n=j(t),d=function(s){let o;try{o=X(decodeURIComponent(s))}catch{}return o?(o=te(o,c=>{if(e.uris&&e.uris[c])return b.revive(e.uris[c])}),encodeURIComponent(JSON.stringify(o))):s},m=function(s,o){const c=e.uris&&e.uris[s];let l=b.revive(c);return o?s.startsWith(f.data+":")?s:(l||(l=b.parse(s)),ee.uriToBrowserUri(l).toString(!0)):!l||b.parse(s).toString()===l.toString()?s:(l.query&&(l=l.with({query:d(l.query)})),l.toString())},p=new g.Renderer;p.image=M.image,p.link=M.link,p.paragraph=M.paragraph;const T=[],x=[];if(t.codeBlockRendererSync?p.code=({text:s,lang:o})=>{const c=D.nextId(),l=t.codeBlockRendererSync(B(o),s);return x.push([c,l]),`<div class="code" data-code="${c}">${A(s)}</div>`}:t.codeBlockRenderer&&(p.code=({text:s,lang:o})=>{const c=D.nextId(),l=t.codeBlockRenderer(B(o),s);return T.push(l.then(u=>[c,u])),`<div class="code" data-code="${c}">${A(s)}</div>`}),t.actionHandler){const s=function(l){let u=l.target;if(!(u.tagName!=="A"&&(u=u.parentElement,!u||u.tagName!=="A")))try{let I=u.dataset.href;I&&(e.baseUri&&(I=N(b.from(e.baseUri),I)),t.actionHandler.callback(I,l))}catch(I){Z(I)}finally{l.preventDefault()}},o=t.actionHandler.disposables.add(new O(n,"click")),c=t.actionHandler.disposables.add(new O(n,"auxclick"));t.actionHandler.disposables.add(G.any(o.event,c.event)(l=>{const u=new K(h.getWindow(n),l);!u.leftButton&&!u.middleButton||s(u)})),t.actionHandler.disposables.add(h.addDisposableListener(n,"keydown",l=>{const u=new F(l);!u.equals($.Space)&&!u.equals($.Enter)||s(u)}))}e.supportHtml||(p.html=({text:s})=>t.sanitizerOptions?.replaceWithPlaintext?A(s):(e.isTrusted?s.match(/^(<span[^>]+>)|(<\/\s*span>)$/):void 0)?s:""),r.renderer=p;let k=e.value??"";k.length>1e5&&(k=`${k.substr(0,1e5)}\u2026`),e.supportThemeIcons&&(k=Q(k));let w;if(t.fillInIncompleteTokens){const s={...g.defaults,...r},o=g.lexer(k,s),c=pe(o);w=g.parser(c,s)}else w=g.parse(k,{...r,async:!1});e.supportThemeIcons&&(w=V(w).map(o=>typeof o=="string"?o:o.outerHTML).join(""));const S=new DOMParser().parseFromString(C({isTrusted:e.isTrusted,...t.sanitizerOptions},w),"text/html");if(S.body.querySelectorAll("img, audio, video, source").forEach(s=>{const o=s.getAttribute("src");if(o){let c=o;try{e.baseUri&&(c=N(b.from(e.baseUri),c))}catch{}if(s.setAttribute("src",m(c,!0)),t.remoteImageIsAllowed){const l=b.parse(c);l.scheme!==f.file&&l.scheme!==f.data&&!t.remoteImageIsAllowed(l)&&s.replaceWith(h.$("",void 0,s.outerHTML))}}}),S.body.querySelectorAll("a").forEach(s=>{const o=s.getAttribute("href");if(s.setAttribute("href",""),!o||/^data:|javascript:/i.test(o)||/^command:/i.test(o)&&!e.isTrusted||/^command:(\/\/\/)?_workbench\.downloadResource/i.test(o))s.replaceWith(...s.childNodes);else{let c=m(o,!1);e.baseUri&&(c=N(b.from(e.baseUri),o)),s.dataset.href=c}}),n.innerHTML=C({isTrusted:e.isTrusted,...t.sanitizerOptions},S.body.innerHTML),T.length>0)Promise.all(T).then(s=>{if(i)return;const o=new Map(s),c=n.querySelectorAll("div[data-code]");for(const l of c){const u=o.get(l.dataset.code??"");u&&h.reset(l,u)}t.asyncRenderCallback?.()});else if(x.length>0){const s=new Map(x),o=n.querySelectorAll("div[data-code]");for(const c of o){const l=s.get(c.dataset.code??"");l&&h.reset(c,l)}}if(t.asyncRenderCallback)for(const s of n.getElementsByTagName("img")){const o=a.add(h.addDisposableListener(s,"load",()=>{o.dispose(),t.asyncRenderCallback()}))}return{element:n,dispose:()=>{i=!0,a.dispose()}}}function B(e){if(!e)return"";const t=e.split(/[\s+|:|,|\{|\?]/,1);return t.length?t[0]:e}function N(e,t){return/^\w[\w\d+.-]*:/.test(t)?t:e.path.endsWith("/")?_(e,t).toString():_(ne(e),t).toString()}const re=["area","base","br","col","command","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"];function C(e,t){const{config:r,allowedSchemes:a}=se(e),i=new P;i.add(q("uponSanitizeAttribute",(n,d)=>{if(d.attrName==="style"||d.attrName==="class"){if(n.tagName==="SPAN"){if(d.attrName==="style"){d.keepAttr=/^(color\:(#[0-9a-fA-F]+|var\(--vscode(-[a-zA-Z]+)+\));)?(background-color\:(#[0-9a-fA-F]+|var\(--vscode(-[a-zA-Z]+)+\));)?(border-radius:[0-9]+px;)?$/.test(d.attrValue);return}else if(d.attrName==="class"){d.keepAttr=/^codicon codicon-[a-z\-]+( codicon-modifier-[a-z\-]+)?$/.test(d.attrValue);return}}d.keepAttr=!1;return}else if(n.tagName==="INPUT"&&n.attributes.getNamedItem("type")?.value==="checkbox"){if(d.attrName==="type"&&d.attrValue==="checkbox"||d.attrName==="disabled"||d.attrName==="checked"){d.keepAttr=!0;return}d.keepAttr=!1}})),i.add(q("uponSanitizeElement",(n,d)=>{if(d.tagName==="input"&&(n.attributes.getNamedItem("type")?.value==="checkbox"?n.setAttribute("disabled",""):e.replaceWithPlaintext||n.remove()),e.replaceWithPlaintext&&!d.allowedTags[d.tagName]&&d.tagName!=="body"&&n.parentElement){let m,p;if(d.tagName==="#comment")m=`<!--${n.textContent}-->`;else{const w=re.includes(d.tagName),H=n.attributes.length?" "+Array.from(n.attributes).map(S=>`${S.name}="${S.value}"`).join(" "):"";m=`<${d.tagName}${H}>`,w||(p=`</${d.tagName}>`)}const T=document.createDocumentFragment(),x=n.parentElement.ownerDocument.createTextNode(m);T.appendChild(x);const k=p?n.parentElement.ownerDocument.createTextNode(p):void 0;for(;n.firstChild;)T.appendChild(n.firstChild);k&&T.appendChild(k),n.parentElement.replaceChild(T,n)}})),i.add(h.hookDomPurifyHrefAndSrcSanitizer(a));try{return E.sanitize(t,{...r,RETURN_TRUSTED_TYPE:!0})}finally{i.dispose()}}const ae=["align","autoplay","alt","checked","class","colspan","controls","data-code","data-href","disabled","draggable","height","href","loop","muted","playsinline","poster","rowspan","src","style","target","title","type","width","start"];function se(e){const t=[f.http,f.https,f.mailto,f.data,f.file,f.vscodeFileResource,f.vscodeRemote,f.vscodeRemoteResource];return e.isTrusted&&t.push(f.command),{config:{ALLOWED_TAGS:e.allowedTags??[...h.basicMarkupHtmlTags],ALLOWED_ATTR:ae,ALLOW_UNKNOWN_PROTOCOLS:!0},allowedSchemes:t}}function Ge(e){return typeof e=="string"?e:ie(e)}function ie(e,t){let r=e.value??"";r.length>1e5&&(r=`${r.substr(0,1e5)}\u2026`);const a=g.parse(r,{async:!1,renderer:t?le.value:de.value}).replace(/&(#\d+|[a-zA-Z]+);/g,i=>oe.get(i)??i);return C({isTrusted:!1},a).toString()}const oe=new Map([["&quot;",'"'],["&nbsp;"," "],["&amp;","&"],["&#39;","'"],["&lt;","<"],["&gt;",">"]]);function U(){const e=new g.Renderer;return e.code=({text:t})=>t,e.blockquote=({text:t})=>t+`
`,e.html=t=>"",e.heading=function({tokens:t}){return this.parser.parseInline(t)+`
`},e.hr=()=>"",e.list=function({items:t}){return t.map(r=>this.listitem(r)).join(`
`)+`
`},e.listitem=({text:t})=>t+`
`,e.paragraph=function({tokens:t}){return this.parser.parseInline(t)+`
`},e.table=function({header:t,rows:r}){return t.map(a=>this.tablecell(a)).join(" ")+`
`+r.map(a=>a.map(i=>this.tablecell(i)).join(" ")).join(`
`)+`
`},e.tablerow=({text:t})=>t,e.tablecell=function({tokens:t}){return this.parser.parseInline(t)},e.strong=({text:t})=>t,e.em=({text:t})=>t,e.codespan=({text:t})=>t,e.br=t=>`
`,e.del=({text:t})=>t,e.image=t=>"",e.text=({text:t})=>t,e.link=({text:t})=>t,e}const de=new z(e=>U()),le=new z(()=>{const e=U();return e.code=({text:t})=>`
\`\`\`
${t}
\`\`\`
`,e});function v(e){let t="";return e.forEach(r=>{t+=r.raw}),t}function W(e){if(e.tokens)for(let t=e.tokens.length-1;t>=0;t--){const r=e.tokens[t];if(r.type==="text"){const a=r.raw.split(`
`),i=a[a.length-1];if(i.includes("`"))return ge(e);if(i.includes("**"))return Se(e);if(i.match(/\*\w/))return Te(e);if(i.match(/(^|\s)__\w/))return Ie(e);if(i.match(/(^|\s)_\w/))return he(e);if(ce(i)||ue(i)&&e.tokens.slice(0,t).some(n=>n.type==="text"&&n.raw.match(/\[[^\]]*$/))){const n=e.tokens.slice(t+1);return n[0]?.type==="link"&&n[1]?.type==="text"&&n[1].raw.match(/^ *"[^"]*$/)||i.match(/^[^"]* +"[^"]*$/)?ye(e):be(e)}else if(i.match(/(^|\s)\[\w*/))return we(e)}}}function ce(e){return!!e.match(/(^|\s)\[.*\]\(\w*/)}function ue(e){return!!e.match(/^[^\[]*\]\([^\)]*$/)}function me(e){const t=e.items[e.items.length-1],r=t.tokens?t.tokens[t.tokens.length-1]:void 0;let a;if(r?.type==="text"&&!("inRawBlock"in t)&&(a=W(r)),!a||a.type!=="paragraph")return;const i=v(e.items.slice(0,-1)),n=t.raw.match(/^(\s*(-|\d+\.|\*) +)/)?.[0];if(!n)return;const d=n+v(t.tokens.slice(0,-1))+a.raw,m=g.lexer(i+d)[0];if(m.type==="list")return m}const fe=3;function pe(e){for(let t=0;t<fe;t++){const r=ke(e);if(r)e=r;else break}return e}function ke(e){let t,r;for(t=0;t<e.length;t++){const a=e[t];if(a.type==="paragraph"&&a.raw.match(/(\n|^)\|/)){r=xe(e.slice(t));break}if(t===e.length-1&&a.type==="list"){const i=me(a);if(i){r=[i];break}}if(t===e.length-1&&a.type==="paragraph"){const i=W(a);if(i){r=[i];break}}}if(r){const a=[...e.slice(0,t),...r];return a.links=e.links,a}return null}function ge(e){return y(e,"`")}function Te(e){return y(e,"*")}function he(e){return y(e,"_")}function be(e){return y(e,")")}function ye(e){return y(e,'")')}function we(e){return y(e,"](https://microsoft.com)")}function Se(e){return y(e,"**")}function Ie(e){return y(e,"__")}function y(e,t){const r=v(Array.isArray(e)?e:[e]);return g.lexer(r+t)[0]}function xe(e){const t=v(e),r=t.split(`
`);let a,i=!1;for(let n=0;n<r.length;n++){const d=r[n].trim();if(typeof a>"u"&&d.match(/^\s*\|/)){const m=d.match(/(\|[^\|]+)(?=\||$)/g);m&&(a=m.length)}else if(typeof a=="number")if(d.match(/^\s*\|/)){if(n!==r.length-1)return;i=!0}else return}if(typeof a=="number"&&a>0){const n=i?r.slice(0,-1).join(`
`):t,d=!!n.match(/\|\s*$/),m=n+(d?"":"|")+`
|${" --- |".repeat(a)}`;return g.lexer(m)}}function q(e,t){return E.addHook(e,t),Y(()=>E.removeHook(e))}export{ae as allowedMarkdownAttr,pe as fillInIncompleteTokens,Ze as renderMarkdown,ie as renderMarkdownAsPlaintext,Ge as renderStringAsPlaintext};
