import{illegalArgument as d}from"../../../vs/base/common/errors.js";import{escapeIcons as c}from"../../../vs/base/common/iconLabels.js";import{isEqual as g}from"../../../vs/base/common/resources.js";import{escapeRegExpCharacters as h}from"../../../vs/base/common/strings.js";import{URI as p}from"../../../vs/base/common/uri.js";var m=(t=>(t[t.Paragraph=0]="Paragraph",t[t.Break=1]="Break",t))(m||{});class f{value;isTrusted;supportThemeIcons;supportHtml;baseUri;constructor(r="",t=!1){if(this.value=r,typeof this.value!="string")throw d("value");typeof t=="boolean"?(this.isTrusted=t,this.supportThemeIcons=!1,this.supportHtml=!1):(this.isTrusted=t.isTrusted??void 0,this.supportThemeIcons=t.supportThemeIcons??!1,this.supportHtml=t.supportHtml??!1)}appendText(r,t=0){return this.value+=I(this.supportThemeIcons?c(r):r).replace(/([ \t]+)/g,(n,s)=>"&nbsp;".repeat(s.length)).replace(/\>/gm,"\\>").replace(/\n/g,t===1?`\\
`:`

`),this}appendMarkdown(r){return this.value+=r,this}appendCodeblock(r,t){return this.value+=`
${b(t,r)}
`,this}appendLink(r,t,n){return this.value+="[",this.value+=this._escape(t,"]"),this.value+="](",this.value+=this._escape(String(r),")"),n&&(this.value+=` "${this._escape(this._escape(n,'"'),")")}"`),this.value+=")",this}_escape(r,t){const n=new RegExp(h(t),"g");return r.replace(n,(s,o)=>r.charAt(o-1)!=="\\"?`\\${s}`:s)}}function k(e){return w(e)?!e.value:Array.isArray(e)?e.every(k):!0}function w(e){return e instanceof f?!0:e&&typeof e=="object"?typeof e.value=="string"&&(typeof e.isTrusted=="boolean"||typeof e.isTrusted=="object"||e.isTrusted===void 0)&&(typeof e.supportThemeIcons=="boolean"||e.supportThemeIcons===void 0):!1}function U(e,r){return e===r?!0:!e||!r?!1:e.value===r.value&&e.isTrusted===r.isTrusted&&e.supportThemeIcons===r.supportThemeIcons&&e.supportHtml===r.supportHtml&&(e.baseUri===r.baseUri||!!e.baseUri&&!!r.baseUri&&g(p.from(e.baseUri),p.from(r.baseUri)))}function I(e){return e.replace(/[\\`*_{}[\]()#+\-!~]/g,"\\$&")}function b(e,r){const t=e.match(/^`+/gm)?.reduce((s,o)=>s.length>o.length?s:o).length??0,n=t>=3?t+1:3;return[`${"`".repeat(n)}${r}`,e,`${"`".repeat(n)}`].join(`
`)}function $(e){return e.replace(/"/g,"&quot;")}function F(e){return e&&e.replace(/\\([\\`*_{}[\]()#+\-.!~])/g,"$1")}function H(e){const r=[],t=e.split("|").map(s=>s.trim());e=t[0];const n=t[1];if(n){const s=/height=(\d+)/.exec(n),o=/width=(\d+)/.exec(n),i=s?s[1]:"",a=o?o[1]:"",u=isFinite(parseInt(a)),l=isFinite(parseInt(i));u&&r.push(`width="${a}"`),l&&r.push(`height="${i}"`)}return{href:e,dimensions:r}}export{f as MarkdownString,m as MarkdownStringTextNewlineStyle,b as appendEscapedMarkdownCodeBlockFence,$ as escapeDoubleQuotes,I as escapeMarkdownSyntaxTokens,k as isEmptyMarkdownString,w as isMarkdownString,U as markdownStringEqual,H as parseHrefAndDimensions,F as removeMarkdownEscapes};
