import{Lazy as l}from"../../../../../base/common/lazy.js";import{OperatingSystem as C}from"../../../../../base/common/platform.js";const L=new l(()=>p(!0)),h=new l(()=>p(!1));function p(e){let t=0,n=0,a=0,r=0;function u(){return`(?<row${t++}>\\d+)`}function f(){return`(?<col${n++}>\\d+)`}function x(){return`(?<rowEnd${a++}>\\d+)`}function i(){return`(?<colEnd${r++}>\\d+)`}const s=e?"$":"",P=[`(?::|#| |['"],)${u()}([:.]${f()}(?:-(?:${x()}\\.)?${i()})?)?`+s,`['"]?(?:,? |: ?| on )lines? ${u()}(?:-${x()})?(?:,? (?:col(?:umn)?|characters?) ${f()}(?:-${i()})?)?`+s,`:? ?[\\[\\(]${u()}(?:, ?${f()})?[\\]\\)]`+s].join("|").replace(/ /g,"[\xA0 ]");return new RegExp(`(${P})`,e?void 0:"g")}function O(e){const t=k(e)?.suffix;return t?e.substring(0,t.index):e}function v(e){const t=e.startsWith("\\\\?\\")?4:0,n=e.indexOf("?",t);return n===-1?e:e.substring(0,n)}function S(e){let t;const n=[];for(h.value.lastIndex=0;(t=h.value.exec(e))!==null;){const a=g(t);if(a===null)break;n.push(a)}return n}function k(e){return g(L.value.exec(e))}function g(e){const t=e?.groups;return!t||e.length<1?null:{row:o(t.row0||t.row1||t.row2),col:o(t.col0||t.col1||t.col2),rowEnd:o(t.rowEnd0||t.rowEnd1||t.rowEnd2),colEnd:o(t.colEnd0||t.colEnd1||t.colEnd2),suffix:{index:e.index,text:e[0]}}}function o(e){return e===void 0?e:parseInt(e)}const E=/(?<path>(?:file:\/\/\/)?[^\s\|<>\[\({][^\s\|<>]*)$/;function M(e,t){const n=$(e),a=w(e,t);return b(n,a),n}function b(e,t){e.length===0&&e.push(...t);for(const n of t)c(e,n,0,e.length)}function c(e,t,n,a){if(e.length===0){e.push(t);return}if(n>a)return;const r=Math.floor((n+a)/2);if(r>=e.length||t.path.index<e[r].path.index&&(r===0||t.path.index>e[r-1].path.index)){(r>=e.length||t.path.index+t.path.text.length<e[r].path.index&&(r===0||t.path.index>e[r-1].path.index+e[r-1].path.text.length))&&e.splice(r,0,t);return}t.path.index>e[r].path.index?c(e,t,r+1,a):c(e,t,n,r-1)}function $(e){const t=[],n=S(e);for(const a of n){const u=e.substring(0,a.suffix.index).match(E);if(u&&u.index!==void 0&&u.groups?.path){let f=u.index,x=u.groups.path,i;const s=x.match(/^(?<prefix>['"]+)/);if(s?.groups?.prefix){if(i={index:f,text:s.groups.prefix},x=x.substring(i.text.length),x.trim().length===0)continue;if(s.groups.prefix.length>1&&a.suffix.text[0].match(/['"]/)&&s.groups.prefix[s.groups.prefix.length-1]===a.suffix.text[0]){const d=s.groups.prefix.length-1;i.index+=d,i.text=s.groups.prefix[s.groups.prefix.length-1],f+=d}}t.push({path:{index:f+(i?.text.length||0),text:x},prefix:i,suffix:a})}}return t}var m=(i=>(i.PathPrefix="(?:\\.\\.?|\\~|file://)",i.PathSeparatorClause="\\/",i.ExcludedPathCharactersClause="[^\\0<>\\?\\s!`&*()'\":;\\\\]",i.ExcludedStartPathCharactersClause="[^\\0<>\\?\\s!`&*()\\[\\]'\":;\\\\]",i.WinOtherPathPrefix="\\.\\.?|\\~",i.WinPathSeparatorClause="(?:\\\\|\\/)",i.WinExcludedPathCharactersClause="[^\\0<>\\?\\|\\/\\s!`&*()'\":;]",i.WinExcludedStartPathCharactersClause="[^\\0<>\\?\\|\\/\\s!`&*()\\[\\]'\":;]",i))(m||{});const R="(?:(?:(?:\\.\\.?|\\~|file://)|(?:[^\\0<>\\?\\s!`&*()\\[\\]'\":;\\\\][^\\0<>\\?\\s!`&*()'\":;\\\\]*))?(?:\\/(?:[^\\0<>\\?\\s!`&*()'\":;\\\\])+)+)",W="(?:\\\\\\\\\\?\\\\|file:\\/\\/\\/)?[a-zA-Z]:",I=`(?:(?:(?:${W}|\\.\\.?|\\~)|(?:[^\\0<>\\?\\|\\/\\s!\`&*()\\[\\]'":;][^\\0<>\\?\\|\\/\\s!\`&*()'":;]*))?(?:(?:\\\\|\\/)(?:[^\\0<>\\?\\|\\/\\s!\`&*()'":;])+)+)`;function w(e,t){const n=[],a=new RegExp(t===C.Windows?I:R,"g");let r;for(;(r=a.exec(e))!==null;){let u=r[0],f=r.index;if(!u)break;((e.startsWith("--- a/")||e.startsWith("+++ b/"))&&f===4||e.startsWith("diff --git")&&(u.startsWith("a/")||u.startsWith("b/")))&&(u=u.substring(2),f+=2),n.push({path:{index:f,text:u},prefix:void 0,suffix:void 0})}return n}export{S as detectLinkSuffixes,M as detectLinks,k as getLinkSuffix,v as removeLinkQueryString,O as removeLinkSuffix,g as toLinkSuffix,W as winDrivePrefix};
