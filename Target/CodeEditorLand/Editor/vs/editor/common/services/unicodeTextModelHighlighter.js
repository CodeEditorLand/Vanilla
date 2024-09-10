import{Range as v}from"../core/range.js";import{Searcher as L}from"../model/textModelSearch.js";import*as o from"../../../base/common/strings.js";import{assertNever as U}from"../../../base/common/assert.js";import{DEFAULT_WORD_REGEXP as E,getWordAtText as y}from"../core/wordHelper.js";class j{static computeUnicodeHighlights(i,n,e){const t=e?e.startLineNumber:1,a=e?e.endLineNumber:i.getLineCount(),l=new R(n),c=l.getCandidateCodePoints();let s;c==="allNonBasicAscii"?s=new RegExp("[^\\t\\n\\r\\x20-\\x7E]","g"):s=new RegExp(`${k(Array.from(c))}`,"g");const p=new L(null,s),I=[];let A=!1,u,S=0,H=0,N=0;e:for(let d=t,w=a;d<=w;d++){const h=i.getLineContent(d),B=h.length;p.reset(0);do if(u=p.next(h),u){let g=u.index,C=u.index+u[0].length;if(g>0){const f=h.charCodeAt(g-1);o.isHighSurrogate(f)&&g--}if(C+1<B){const f=h.charCodeAt(C-1);o.isHighSurrogate(f)&&C++}const x=h.substring(g,C);let b=y(g+1,E,h,0);b&&b.endColumn<=g+1&&(b=null);const m=l.shouldHighlightNonBasicASCII(x,b?b.word:null);if(m!==0){m===3?S++:m===2?H++:m===1?N++:U(m);const f=1e3;if(I.length>=f){A=!0;break e}I.push(new v(d,g+1,d,C+1))}}while(u)}return{ranges:I,hasMore:A,ambiguousCharacterCount:S,invisibleCharacterCount:H,nonBasicAsciiCharacterCount:N}}static computeUnicodeHighlightReason(i,n){const e=new R(n);switch(e.shouldHighlightNonBasicASCII(i,null)){case 0:return null;case 2:return{kind:1};case 3:{const a=i.codePointAt(0),l=e.ambiguousCharacters.getPrimaryConfusable(a),c=o.AmbiguousCharacters.getLocales().filter(s=>!o.AmbiguousCharacters.getInstance(new Set([...n.allowedLocales,s])).isAmbiguous(a));return{kind:0,confusableWith:String.fromCodePoint(l),notAmbiguousInLocales:c}}case 1:return{kind:2}}}}function k(r,i){return`[${o.escapeRegExpCharacters(r.map(e=>String.fromCodePoint(e)).join(""))}]`}var T=(e=>(e[e.Ambiguous=0]="Ambiguous",e[e.Invisible=1]="Invisible",e[e.NonBasicAscii=2]="NonBasicAscii",e))(T||{});class R{constructor(i){this.options=i;this.allowedCodePoints=new Set(i.allowedCodePoints),this.ambiguousCharacters=o.AmbiguousCharacters.getInstance(new Set(i.allowedLocales))}allowedCodePoints;ambiguousCharacters;getCandidateCodePoints(){if(this.options.nonBasicASCII)return"allNonBasicAscii";const i=new Set;if(this.options.invisibleCharacters)for(const n of o.InvisibleCharacters.codePoints)P(String.fromCodePoint(n))||i.add(n);if(this.options.ambiguousCharacters)for(const n of this.ambiguousCharacters.getConfusableCodePoints())i.add(n);for(const n of this.allowedCodePoints)i.delete(n);return i}shouldHighlightNonBasicASCII(i,n){const e=i.codePointAt(0);if(this.allowedCodePoints.has(e))return 0;if(this.options.nonBasicASCII)return 1;let t=!1,a=!1;if(n)for(const l of n){const c=l.codePointAt(0),s=o.isBasicASCII(l);t=t||s,!s&&!this.ambiguousCharacters.isAmbiguous(c)&&!o.InvisibleCharacters.isInvisibleCharacter(c)&&(a=!0)}return!t&&a?0:this.options.invisibleCharacters&&!P(i)&&o.InvisibleCharacters.isInvisibleCharacter(e)?2:this.options.ambiguousCharacters&&this.ambiguousCharacters.isAmbiguous(e)?3:0}}function P(r){return r===" "||r===`
`||r==="	"}var O=(t=>(t[t.None=0]="None",t[t.NonBasicASCII=1]="NonBasicASCII",t[t.Invisible=2]="Invisible",t[t.Ambiguous=3]="Ambiguous",t))(O||{});export{T as UnicodeHighlighterReasonKind,j as UnicodeTextModelHighlighter};
