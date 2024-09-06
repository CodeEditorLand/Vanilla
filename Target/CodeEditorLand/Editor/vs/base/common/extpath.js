import{CharCode as s}from"../../../vs/base/common/charCode.js";import{isAbsolute as C,join as h,normalize as A,posix as c,sep as g}from"../../../vs/base/common/path.js";import{isWindows as l}from"../../../vs/base/common/platform.js";import{equalsIgnoreCase as I,rtrim as m,startsWithIgnoreCase as N}from"../../../vs/base/common/strings.js";import{isNumber as L}from"../../../vs/base/common/types.js";function u(e){return e===s.Slash||e===s.Backslash}function D(e){return e.replace(/[\\/]/g,c.sep)}function z(e){return e.indexOf("/")===-1&&(e=D(e)),/^[a-zA-Z]:(\/|$)/.test(e)&&(e="/"+e),e}function R(e,r=c.sep){if(!e)return"";const n=e.length,t=e.charCodeAt(0);if(u(t)){if(u(e.charCodeAt(1))&&!u(e.charCodeAt(2))){let i=3;const f=i;for(;i<n&&!u(e.charCodeAt(i));i++);if(f!==i&&!u(e.charCodeAt(i+1))){for(i+=1;i<n;i++)if(u(e.charCodeAt(i)))return e.slice(0,i+1).replace(/[\\/]/g,r)}}return r}else if(x(t)&&e.charCodeAt(1)===s.Colon)return u(e.charCodeAt(2))?e.slice(0,2)+r:e.slice(0,2);let o=e.indexOf("://");if(o!==-1){for(o+=3;o<n;o++)if(u(e.charCodeAt(o)))return e.slice(0,o+1)}return""}function q(e){if(!l||!e||e.length<5)return!1;let r=e.charCodeAt(0);if(r!==s.Backslash||(r=e.charCodeAt(1),r!==s.Backslash))return!1;let n=2;const t=n;for(;n<e.length&&(r=e.charCodeAt(n),r!==s.Backslash);n++);return!(t===n||(r=e.charCodeAt(n+1),isNaN(r)||r===s.Backslash))}const E=/[\\/:\*\?"<>\|]/g,W=/[/]/g,k=/^(con|prn|aux|clock\$|nul|lpt[0-9]|com[0-9])(\.(.*?))?$/i;function M(e,r=l){const n=r?E:W;return!(!e||e.length===0||/^\s+$/.test(e)||(n.lastIndex=0,n.test(e))||r&&k.test(e)||e==="."||e===".."||r&&e[e.length-1]==="."||r&&e.length!==e.trim().length||e.length>255)}function P(e,r,n){const t=e===r;return!n||t?t:!e||!r?!1:I(e,r)}function $(e,r,n,t=g){if(e===r)return!0;if(!e||!r||r.length>e.length)return!1;if(n){if(!N(e,r))return!1;if(r.length===e.length)return!0;let i=r.length;return r.charAt(r.length-1)===t&&i--,e.charAt(i)===t}return r.charAt(r.length-1)!==t&&(r+=t),e.indexOf(r)===0}function x(e){return e>=s.A&&e<=s.Z||e>=s.a&&e<=s.z}function U(e,r){return l&&e.endsWith(":")&&(e+=g),C(e)||(e=h(r,e)),e=A(e),F(e)}function F(e){return l?(e=m(e,g),e.endsWith(":")&&(e+=g)):(e=m(e,g),e||(e=g)),e}function V(e){const r=A(e);return l?e.length>3?!1:b(r)&&(e.length===2||r.charCodeAt(2)===s.Backslash):r===c.sep}function b(e,r=l){return r?x(e.charCodeAt(0))&&e.charCodeAt(1)===s.Colon:!1}function j(e,r=l){return b(e,r)?e[0]:void 0}function H(e,r,n){return r.length>e.length?-1:e===r?0:(n&&(e=e.toLowerCase(),r=r.toLowerCase()),e.indexOf(r))}function T(e){const r=e.split(":");let n,t,o;for(const i of r){const f=Number(i);L(f)?t===void 0?t=f:o===void 0&&(o=f):n=n?[n,i].join(":"):i}if(!n)throw new Error("Format for `--goto` should be: `FILE:LINE(:COLUMN)`");return{path:n,line:t!==void 0?t:void 0,column:o!==void 0?o:t!==void 0?1:void 0}}const O="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",S="BDEFGHIJKMOQRSTUVWXYZbdefghijkmoqrstuvwxyz0123456789";function Z(e,r,n=8){let t="";for(let i=0;i<n;i++){let f;i===0&&l&&!r&&(n===3||n===4)?f=S:f=O,t+=f.charAt(Math.floor(Math.random()*f.length))}let o;return r?o=`${r}-${t}`:o=t,e?h(e,o):o}export{j as getDriveLetter,R as getRoot,b as hasDriveLetter,H as indexOfPath,P as isEqual,$ as isEqualOrParent,u as isPathSeparator,V as isRootOrDriveLetter,q as isUNC,M as isValidBasename,x as isWindowsDriveLetter,T as parseLineAndColumnAware,Z as randomPath,F as removeTrailingPathSeparator,U as sanitizeFilePath,z as toPosixPath,D as toSlashes};
