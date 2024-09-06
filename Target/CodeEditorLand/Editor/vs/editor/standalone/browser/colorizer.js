import{createTrustedTypesPolicy as S}from"../../../../vs/base/browser/trustedTypes.js";import*as C from"../../../../vs/base/common/strings.js";import{ColorId as h,FontStyle as k,MetadataConsts as I}from"../../../../vs/editor/common/encodedTokenAttributes.js";import{TokenizationRegistry as b}from"../../../../vs/editor/common/languages.js";import"../../../../vs/editor/common/languages/language.js";import"../../../../vs/editor/common/model.js";import{LineTokens as d}from"../../../../vs/editor/common/tokens/lineTokens.js";import{RenderLineInput as T,renderViewLine2 as L}from"../../../../vs/editor/common/viewLayout/viewLineRenderer.js";import{ViewLineRenderingData as f}from"../../../../vs/editor/common/viewModel.js";import{MonarchTokenizer as R}from"../../../../vs/editor/standalone/common/monarch/monarchLexer.js";import"../../../../vs/editor/standalone/common/standaloneTheme.js";const O=S("standaloneColorizer",{createHTML:c=>c});class W{static colorizeElement(i,t,n,o){o=o||{};const s=o.theme||"vs",e=o.mimeType||n.getAttribute("lang")||n.getAttribute("data-lang");if(!e)return console.error("Mode not detected"),Promise.resolve();const a=t.getLanguageIdByMimeType(e)||e;i.setTheme(s);const r=n.firstChild?n.firstChild.nodeValue:"";n.className+=" "+s;const u=l=>{const g=O?.createHTML(l)??l;n.innerHTML=g};return this.colorize(t,r||"",a,o).then(u,l=>console.error(l))}static async colorize(i,t,n,o){const s=i.languageIdCodec;let e=4;o&&typeof o.tabSize=="number"&&(e=o.tabSize),C.startsWithUTF8BOM(t)&&(t=t.substr(1));const a=C.splitLines(t);if(!i.isRegisteredLanguageId(n))return p(a,e,s);const r=await b.getOrCreate(n);return r?w(a,e,r,s):p(a,e,s)}static colorizeLine(i,t,n,o,s=4){const e=f.isBasicASCII(i,t),a=f.containsRTL(i,e,n);return L(new T(!1,!0,i,!1,e,a,0,o,[],s,0,0,0,0,-1,"none",!1,!1,null)).html}static colorizeModelLine(i,t,n=4){const o=i.getLineContent(t);i.tokenization.forceTokenization(t);const e=i.tokenization.getLineTokens(t).inflate();return this.colorizeLine(o,i.mightContainNonBasicASCII(),i.mightContainRTL(),e,n)}}function w(c,i,t,n){return new Promise((o,s)=>{const e=()=>{const a=y(c,i,t,n);if(t instanceof R){const r=t.getLoadStatus();if(r.loaded===!1){r.promise.then(e,s);return}}o(a)};e()})}function p(c,i,t){let n=[];const o=(k.None<<I.FONT_STYLE_OFFSET|h.DefaultForeground<<I.FOREGROUND_OFFSET|h.DefaultBackground<<I.BACKGROUND_OFFSET)>>>0,s=new Uint32Array(2);s[0]=0,s[1]=o;for(let e=0,a=c.length;e<a;e++){const r=c[e];s[0]=r.length;const u=new d(s,r,t),l=f.isBasicASCII(r,!0),g=f.containsRTL(r,l,!0),m=L(new T(!1,!0,r,!1,l,g,0,u,[],i,0,0,0,0,-1,"none",!1,!1,null));n=n.concat(m.html),n.push("<br/>")}return n.join("")}function y(c,i,t,n){let o=[],s=t.getInitialState();for(let e=0,a=c.length;e<a;e++){const r=c[e],u=t.tokenizeEncoded(r,!0,s);d.convertToEndOffset(u.tokens,r.length);const l=new d(u.tokens,r,n),g=f.isBasicASCII(r,!0),m=f.containsRTL(r,g,!0),z=L(new T(!1,!0,r,!1,g,m,0,l.inflate(),[],i,0,0,0,0,-1,"none",!1,!1,null));o=o.concat(z.html),o.push("<br/>"),s=u.endState}return o.join("")}export{W as Colorizer};