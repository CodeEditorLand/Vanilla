import{CharCode as m}from"./charCode.js";import{compareAnything as C}from"./comparers.js";import{createMatches as Y,fuzzyScore as X,isUpper as J,matchesPrefix as K}from"./filters.js";import{hash as Z}from"./hash.js";import{sep as P}from"./path.js";import{isLinux as q,isWindows as ee}from"./platform.js";import{equalsIgnoreCase as te,stripWildcards as re}from"./strings.js";const S=0,w=[S,[]];function v(t,e,o,r){if(!t||!e)return w;const n=t.length,i=e.length;if(n<i)return w;const a=t.toLowerCase();return ne(e,o,i,t,a,n,r)}function ne(t,e,o,r,n,i,a){const c=[],s=[];for(let h=0;h<o;h++){const f=h*i,p=f-i,I=h>0,b=t[h],j=e[h];for(let g=0;g<i;g++){const L=g>0,M=f+g,G=M-1,F=p+g-1,D=L?c[G]:0,Q=I&&L?c[F]:0,O=I&&L?s[F]:0;let z;!Q&&I?z=0:z=oe(b,j,r,n,g,O),z&&Q+z>=D&&(a||I||n.startsWith(e,g))?(s[M]=O+1,c[M]=Q+z):(s[M]=S,c[M]=D)}}const l=[];let u=o-1,d=i-1;for(;u>=0&&d>=0;){const h=u*i+d;s[h]===S||(l.push(d),u--),d--}return[c[o*i-1],l.reverse()]}function oe(t,e,o,r,n,i){let a=0;if(!ce(e,r[n]))return a;if(a+=1,i>0&&(a+=i*5),t===o[n]&&(a+=1),n===0)a+=8;else{const c=ie(o.charCodeAt(n-1));c?a+=c:J(o.charCodeAt(n))&&i===0&&(a+=2)}return a}function ce(t,e){return t===e?!0:t==="/"||t==="\\"?e==="/"||e==="\\":!1}function ie(t){switch(t){case m.Slash:case m.Backslash:return 5;case m.Underline:case m.Dash:case m.Period:case m.Space:case m.SingleQuote:case m.DoubleQuote:case m.Colon:return 4;default:return 0}}const _=[void 0,[]];function Se(t,e,o=0,r=0){const n=e;return n.values&&n.values.length>1?ae(t,n.values,o,r):H(t,e,o,r)}function ae(t,e,o,r){let n=0;const i=[];for(const a of e){const[c,s]=H(t,a,o,r);if(typeof c!="number")return _;n+=c,i.push(...s)}return[n,A(i)]}function H(t,e,o,r){const n=X(e.original,e.originalLowercase,o,t,t.toLowerCase(),r,{firstMatchCanBeWeak:!0,boostFullMatch:!0});return n?[n[0],Y(n)]:_}const y=Object.freeze({score:0}),x=1<<18,T=1<<17,E=65536;function se(t,e,o,r){const n=r.values?r.values:[r];return Z({[r.normalized]:{values:n.map(a=>({value:a.normalized,expectContiguousMatch:a.expectContiguousMatch})),label:t,description:e,allowNonContiguousMatches:o}})}function N(t,e,o,r,n){if(!t||!e.normalized)return y;const i=r.getItemLabel(t);if(!i)return y;const a=r.getItemDescription(t),c=se(i,a,o,e),s=n[c];if(s)return s;const l=le(i,a,r.getItemPath(t),e,o);return n[c]=l,l}function le(t,e,o,r,n){const i=!o||!r.containsPathSeparator;return o&&(q?r.pathNormalized===o:te(r.pathNormalized,o))?{score:x,labelMatch:[{start:0,end:t.length}],descriptionMatch:e?[{start:0,end:e.length}]:void 0}:r.values&&r.values.length>1?ue(t,e,o,r.values,i,n):R(t,e,o,r,i,n)}function ue(t,e,o,r,n,i){let a=0;const c=[],s=[];for(const l of r){const{score:u,labelMatch:d,descriptionMatch:h}=R(t,e,o,l,n,i);if(u===S)return y;a+=u,d&&c.push(...d),h&&s.push(...h)}return{score:a,labelMatch:A(c),descriptionMatch:A(s)}}function R(t,e,o,r,n,i){if(n||!e){const[a,c]=v(t,r.normalized,r.normalizedLowercase,i&&!r.expectContiguousMatch);if(a){const s=K(r.normalized,t);let l;if(s){l=T;const u=Math.round(r.normalized.length/t.length*100);l+=u}else l=E;return{score:l+a,labelMatch:s||B(c)}}}if(e){let a=e;o&&(a=`${e}${P}`);const c=a.length,s=`${a}${t}`,[l,u]=v(s,r.normalized,r.normalizedLowercase,i&&!r.expectContiguousMatch);if(l){const d=B(u),h=[],f=[];return d.forEach(p=>{p.start<c&&p.end>c?(h.push({start:0,end:p.end-c}),f.push({start:p.start,end:c})):p.start>=c?h.push({start:p.start-c,end:p.end-c}):f.push(p)}),{score:l,labelMatch:h,descriptionMatch:f}}}return y}function B(t){const e=[];if(!t)return e;let o;for(const r of t)o&&o.end===r?o.end+=1:(o={start:r,end:r+1},e.push(o));return e}function A(t){const e=t.sort((n,i)=>n.start-i.start),o=[];let r;for(const n of e)!r||!de(r,n)?(r=n,o.push(n)):(r.start=Math.min(r.start,n.start),r.end=Math.max(r.end,n.end));return o}function de(t,e){return!(t.end<e.start||e.end<t.start)}function ye(t,e,o,r,n,i){const a=N(t,o,r,n,i),c=N(e,o,r,n,i),s=a.score,l=c.score;if((s===x||l===x)&&s!==l)return s===x?-1:1;if(s>E||l>E){if(s!==l)return s>l?-1:1;if(s<T&&l<T){const b=he(a.labelMatch,c.labelMatch);if(b!==0)return b}const p=n.getItemLabel(t)||"",I=n.getItemLabel(e)||"";if(p.length!==I.length)return p.length-I.length}if(s!==l)return s>l?-1:1;const u=Array.isArray(a.labelMatch)&&a.labelMatch.length>0,d=Array.isArray(c.labelMatch)&&c.labelMatch.length>0;if(u&&!d)return-1;if(d&&!u)return 1;const h=W(t,a,n),f=W(e,c,n);return h&&f&&h!==f?f>h?-1:1:fe(t,e,o,n)}function W(t,e,o){let r=-1,n=-1;if(e.descriptionMatch&&e.descriptionMatch.length?r=e.descriptionMatch[0].start:e.labelMatch&&e.labelMatch.length&&(r=e.labelMatch[0].start),e.labelMatch&&e.labelMatch.length){if(n=e.labelMatch[e.labelMatch.length-1].end,e.descriptionMatch&&e.descriptionMatch.length){const i=o.getItemDescription(t);i&&(n+=i.length)}}else e.descriptionMatch&&e.descriptionMatch.length&&(n=e.descriptionMatch[e.descriptionMatch.length-1].end);return n-r}function he(t,e){if(!t&&!e||(!t||!t.length)&&(!e||!e.length))return 0;if(!e||!e.length)return-1;if(!t||!t.length)return 1;const o=t[0].start,n=t[t.length-1].end-o,i=e[0].start,c=e[e.length-1].end-i;return n===c?0:c<n?1:-1}function fe(t,e,o,r){const n=r.getItemLabel(t)||"",i=r.getItemLabel(e)||"",a=r.getItemDescription(t),c=r.getItemDescription(e),s=n.length+(a?a.length:0),l=i.length+(c?c.length:0);if(s!==l)return s-l;const u=r.getItemPath(t),d=r.getItemPath(e);return u&&d&&u.length!==d.length?u.length-d.length:n!==i?C(n,i,o.normalized):a&&c&&a!==c?C(a,c,o.normalized):u&&d&&u!==d?C(u,d,o.normalized):0}function U(t){return t.startsWith('"')&&t.endsWith('"')}const k=" ";function $(t){typeof t!="string"&&(t="");const e=t.toLowerCase(),{pathNormalized:o,normalized:r,normalizedLowercase:n}=V(t),i=o.indexOf(P)>=0,a=U(t);let c;const s=t.split(k);if(s.length>1)for(const l of s){const u=U(l),{pathNormalized:d,normalized:h,normalizedLowercase:f}=V(l);h&&(c||(c=[]),c.push({original:l,originalLowercase:l.toLowerCase(),pathNormalized:d,normalized:h,normalizedLowercase:f,expectContiguousMatch:u}))}return{original:t,originalLowercase:e,pathNormalized:o,normalized:r,normalizedLowercase:n,values:c,containsPathSeparator:i,expectContiguousMatch:a}}function V(t){let e;ee?e=t.replace(/\//g,P):e=t.replace(/\\/g,P);const o=re(e).replace(/\s|"/g,"");return{pathNormalized:e,normalized:o,normalizedLowercase:o.toLowerCase()}}function xe(t){return Array.isArray(t)?$(t.map(e=>e.original).join(k)):$(t.original)}export{ye as compareItemsByFuzzyScore,xe as pieceToQuery,$ as prepareQuery,v as scoreFuzzy,Se as scoreFuzzy2,N as scoreItemFuzzy};
