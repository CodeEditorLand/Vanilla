import{createTrustedTypesPolicy as X}from"../../../../vs/base/browser/trustedTypes.js";import{CharCode as d}from"../../../../vs/base/common/charCode.js";import*as R from"../../../../vs/base/common/strings.js";import{assertIsDefined as J}from"../../../../vs/base/common/types.js";import{applyFontInfo as K}from"../../../../vs/editor/browser/config/domFontInfo.js";import{WrappingIndent as j}from"../../../../vs/editor/common/config/editorOptions.js";import"../../../../vs/editor/common/config/fontInfo.js";import{StringBuilder as Q}from"../../../../vs/editor/common/core/stringBuilder.js";import"../../../../vs/editor/common/model.js";import{ModelLineProjectionData as E}from"../../../../vs/editor/common/modelLineProjectionData.js";import{LineInjectedText as F}from"../../../../vs/editor/common/textModelEvents.js";const Y=X("domLineBreaksComputer",{createHTML:i=>i});class H{constructor(t){this.targetWindow=t}static create(t){return new H(new WeakRef(t))}createLineBreaksComputer(t,r,o,e,a){const p=[],s=[];return{addRequest:(m,h,M)=>{p.push(m),s.push(h)},finalize:()=>Z(J(this.targetWindow.deref()),p,t,r,o,e,a,s)}}}function Z(i,t,r,o,e,a,p,s){function m(n){const u=s[n];if(u){const l=F.applyInjectedText(t[n],u),C=u.map(g=>g.options),x=u.map(g=>g.column-1);return new E(x,C,[l.length],[],0)}else return null}if(e===-1){const n=[];for(let u=0,l=t.length;u<l;u++)n[u]=m(u);return n}const h=Math.round(e*r.typicalHalfwidthCharacterWidth),M=a===j.DeepIndent?2:a===j.Indent?1:0,S=Math.round(o*M),f=Math.ceil(r.spaceWidth*S),c=document.createElement("div");K(c,r);const I=new Q(1e4),b=[],k=[],v=[],B=[],_=[];for(let n=0;n<t.length;n++){const u=F.applyInjectedText(t[n],s[n]);let l=0,C=0,x=h;if(a!==j.None)if(l=R.firstNonWhitespaceIndex(u),l===-1)l=0;else{for(let T=0;T<l;T++){const A=u.charCodeAt(T)===d.Tab?o-C%o:1;C+=A}const y=Math.ceil(r.spaceWidth*C);y+r.typicalFullwidthCharacterWidth>h?(l=0,C=0):x=h-y}const g=u.substr(l),W=z(g,C,o,x,I,f);b[n]=l,k[n]=C,v[n]=g,B[n]=W[0],_[n]=W[1]}const w=I.build(),U=Y?.createHTML(w)??w;c.innerHTML=U,c.style.position="absolute",c.style.top="10000",p==="keepAll"?(c.style.wordBreak="keep-all",c.style.overflowWrap="anywhere"):(c.style.wordBreak="inherit",c.style.overflowWrap="break-word"),i.document.body.appendChild(c);const G=document.createRange(),V=Array.prototype.slice.call(c.children,0),D=[];for(let n=0;n<t.length;n++){const u=V[n],l=q(G,u,v[n],B[n]);if(l===null){D[n]=m(n);continue}const C=b[n],x=k[n]+S,g=_[n],W=[];for(let L=0,O=l.length;L<O;L++)W[L]=g[l[L]];if(C!==0)for(let L=0,O=l.length;L<O;L++)l[L]+=C;let y,T;const A=s[n];A?(y=A.map(L=>L.options),T=A.map(L=>L.column-1)):(y=null,T=null),D[n]=new E(T,y,l,W,x)}return c.remove(),D}var $=(t=>(t[t.SPAN_MODULO_LIMIT=16384]="SPAN_MODULO_LIMIT",t))($||{});function z(i,t,r,o,e,a){if(a!==0){const f=String(a);e.appendString('<div style="text-indent: -'),e.appendString(f),e.appendString("px; padding-left: "),e.appendString(f),e.appendString("px; box-sizing: border-box; width:")}else e.appendString('<div style="width:');e.appendString(String(o)),e.appendString('px;">');const p=i.length;let s=t,m=0;const h=[],M=[];let S=0<p?i.charCodeAt(0):d.Null;e.appendString("<span>");for(let f=0;f<p;f++){f!==0&&f%16384===0&&e.appendString("</span><span>"),h[f]=m,M[f]=s;const c=S;S=f+1<p?i.charCodeAt(f+1):d.Null;let I=1,b=1;switch(c){case d.Tab:I=r-s%r,b=I;for(let k=1;k<=I;k++)k<I?e.appendCharCode(160):e.appendASCIICharCode(d.Space);break;case d.Space:S===d.Space?e.appendCharCode(160):e.appendASCIICharCode(d.Space);break;case d.LessThan:e.appendString("&lt;");break;case d.GreaterThan:e.appendString("&gt;");break;case d.Ampersand:e.appendString("&amp;");break;case d.Null:e.appendString("&#00;");break;case d.UTF8_BOM:case d.LINE_SEPARATOR:case d.PARAGRAPH_SEPARATOR:case d.NEXT_LINE:e.appendCharCode(65533);break;default:R.isFullWidthCharacter(c)&&b++,c<32?e.appendCharCode(9216+c):e.appendCharCode(c)}m+=I,s+=b}return e.appendString("</span>"),h[i.length]=m,M[i.length]=s,e.appendString("</div>"),[h,M]}function q(i,t,r,o){if(r.length<=1)return null;const e=Array.prototype.slice.call(t.children,0),a=[];try{N(i,e,o,0,null,r.length-1,null,a)}catch(p){return console.log(p),null}return a.length===0?null:(a.push(r.length),a)}function N(i,t,r,o,e,a,p,s){if(o===a||(e=e||P(i,t,r[o],r[o+1]),p=p||P(i,t,r[a],r[a+1]),Math.abs(e[0].top-p[0].top)<=.1))return;if(o+1===a){s.push(a);return}const m=o+(a-o)/2|0,h=P(i,t,r[m],r[m+1]);N(i,t,r,o,e,m,h,s),N(i,t,r,m,h,a,p,s)}function P(i,t,r,o){return i.setStart(t[r/16384|0].firstChild,r%16384),i.setEnd(t[o/16384|0].firstChild,o%16384),i.getClientRects()}export{H as DOMLineBreaksComputerFactory};
