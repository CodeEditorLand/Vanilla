import{Lazy as N}from"./lazy.js";import{sep as L}from"./path.js";const m=new N(()=>{const t=new Intl.Collator(void 0,{numeric:!0,sensitivity:"base"});return{collator:t,collatorIsNumeric:t.resolvedOptions().numeric}}),f=new N(()=>({collator:new Intl.Collator(void 0,{numeric:!0})})),C=new N(()=>({collator:new Intl.Collator(void 0,{numeric:!0,sensitivity:"accent"})}));function w(t,n,r=!1){const e=t||"",l=n||"",s=m.value.collator.compare(e,l);return m.value.collatorIsNumeric&&s===0&&e!==l?e<l?-1:1:s}function B(t,n){const r=f.value.collator;return t=t||"",n=n||"",o(r,t,n)}function P(t,n){const r=f.value.collator;return t=t||"",n=n||"",d(t,n)||o(r,t,n)}function U(t,n){const r=f.value.collator;return t=t||"",n=n||"",I(t,n)||o(r,t,n)}function W(t,n){return t=t||"",n=n||"",t===n?0:t<n?-1:1}function M(t,n){const[r,e]=E(t),[l,s]=E(n);let i=m.value.collator.compare(e,s);if(i===0){if(m.value.collatorIsNumeric&&e!==s)return e<s?-1:1;if(i=m.value.collator.compare(r,l),m.value.collatorIsNumeric&&i===0&&r!==l)return r<l?-1:1}return i}function O(t,n){t=t||"",n=n||"";const r=a(t),e=a(n),l=f.value.collator,s=C.value.collator;return o(s,r,e)||o(l,t,n)}function z(t,n){t=t||"",n=n||"";const r=a(t),e=a(n),l=f.value.collator,s=C.value.collator;return o(s,r,e)||d(t,n)||o(l,t,n)}function D(t,n){t=t||"",n=n||"";const r=a(t),e=a(n),l=f.value.collator,s=C.value.collator;return o(s,r,e)||I(t,n)||o(l,t,n)}function S(t,n){t=t||"",n=n||"";const r=a(t).toLowerCase(),e=a(n).toLowerCase();return r!==e?r<e?-1:1:t!==n?t<n?-1:1:0}const b=/^(.*?)(\.([^.]*))?$/;function E(t,n=!1){const r=t?b.exec(t):[];let e=[r&&r[1]||"",r&&r[3]||""];return n&&(!e[0]&&e[1]||e[0]&&e[0].charAt(0)===".")&&(e=[e[0]+"."+e[1],""]),e}function a(t){const n=t?b.exec(t):[];return n&&n[1]&&n[1].charAt(0)!=="."&&n[3]||""}function o(t,n,r){const e=t.compare(n,r);return e!==0?e:n.length!==r.length?n.length<r.length?-1:1:0}function p(t){const n=t.charAt(0);return n.toLocaleUpperCase()!==n}function x(t){const n=t.charAt(0);return n.toLocaleLowerCase()!==n}function I(t,n){return p(t)&&x(n)?-1:x(t)&&p(n)?1:0}function d(t,n){return x(t)&&p(n)?-1:p(t)&&x(n)?1:0}function A(t,n,r=!1){return r||(t=t&&t.toLowerCase(),n=n&&n.toLowerCase()),t===n?0:t<n?-1:1}function $(t,n,r=!1){const e=t.split(L),l=n.split(L),s=e.length-1,i=l.length-1;let g,u;for(let c=0;;c++){if(g=s===c,u=i===c,g&&u)return w(e[c],l[c],r);if(g)return-1;if(u)return 1;const v=A(e[c],l[c],r);if(v!==0)return v}}function j(t,n,r){const e=t.toLowerCase(),l=n.toLowerCase(),s=y(t,n,r);if(s)return s;const i=e.endsWith(r),g=l.endsWith(r);if(i!==g)return i?-1:1;const u=w(e,l);return u!==0?u:e.localeCompare(l)}function y(t,n,r){const e=t.toLowerCase(),l=n.toLowerCase(),s=e.startsWith(r),i=l.startsWith(r);if(s!==i)return s?-1:1;if(s&&i){if(e.length<l.length)return-1;if(e.length>l.length)return 1}return 0}export{j as compareAnything,y as compareByPrefix,M as compareFileExtensions,O as compareFileExtensionsDefault,D as compareFileExtensionsLower,S as compareFileExtensionsUnicode,z as compareFileExtensionsUpper,w as compareFileNames,B as compareFileNamesDefault,U as compareFileNamesLower,W as compareFileNamesUnicode,P as compareFileNamesUpper,$ as comparePaths};
