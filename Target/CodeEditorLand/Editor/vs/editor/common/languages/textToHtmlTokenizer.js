import{CharCode as r}from"../../../base/common/charCode.js";import*as C from"../../../base/common/strings.js";import{LanguageId as L}from"../encodedTokenAttributes.js";import{TokenizationRegistry as b}from"../languages.js";import{LineTokens as z}from"../tokens/lineTokens.js";import{NullState as h,nullTokenizeEncoded as E}from"./nullTokenize.js";const S={getInitialState:()=>h,tokenizeEncoded:(i,n,o)=>E(L.Null,o)};function O(i,n,o){return T(n,i.languageIdCodec,b.get(o)||S)}async function N(i,n,o){if(!o)return T(n,i.languageIdCodec,S);const s=await b.getOrCreate(o);return T(n,i.languageIdCodec,s||S)}function w(i,n,o,s,g,p,u){let k="<div>",a=s,d=0,e=!0;for(let l=0,I=n.getCount();l<I;l++){const c=n.getEndOffset(l);if(c<=s)continue;let t="";for(;a<c&&a<g;a++){const m=i.charCodeAt(a);switch(m){case r.Tab:{let f=p-(a+d)%p;for(d+=f-1;f>0;)u&&e?(t+="&#160;",e=!1):(t+=" ",e=!0),f--;break}case r.LessThan:t+="&lt;",e=!1;break;case r.GreaterThan:t+="&gt;",e=!1;break;case r.Ampersand:t+="&amp;",e=!1;break;case r.Null:t+="&#00;",e=!1;break;case r.UTF8_BOM:case r.LINE_SEPARATOR:case r.PARAGRAPH_SEPARATOR:case r.NEXT_LINE:t+="\uFFFD",e=!1;break;case r.CarriageReturn:t+="&#8203",e=!1;break;case r.Space:u&&e?(t+="&#160;",e=!1):(t+=" ",e=!0);break;default:t+=String.fromCharCode(m),e=!1}}if(k+=`<span style="${n.getInlineStyle(l,o)}">${t}</span>`,c>g||a>=g)break}return k+="</div>",k}function T(i,n,o){let s='<div class="monaco-tokenized-source">';const g=C.splitLines(i);let p=o.getInitialState();for(let u=0,k=g.length;u<k;u++){const a=g[u];u>0&&(s+="<br/>");const d=o.tokenizeEncoded(a,!0,p);z.convertToEndOffset(d.tokens,a.length);const l=new z(d.tokens,a,n).inflate();let I=0;for(let c=0,t=l.getCount();c<t;c++){const m=l.getClassName(c),f=l.getEndOffset(c);s+=`<span class="${m}">${C.escape(a.substring(I,f))}</span>`,I=f}p=d.endState}return s+="</div>",s}export{T as _tokenizeToString,w as tokenizeLineToHTML,N as tokenizeToString,O as tokenizeToStringSync};
