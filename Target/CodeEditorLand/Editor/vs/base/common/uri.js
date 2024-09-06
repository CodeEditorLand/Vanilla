import{CharCode as s}from"../../../vs/base/common/charCode.js";import{MarshalledId as q}from"../../../vs/base/common/marshallingIds.js";import*as I from"../../../vs/base/common/path.js";import{isWindows as g}from"../../../vs/base/common/platform.js";const A=/^\w[\w\d+.-]*$/,x=/^\//,P=/^\/\//;function v(t,e){if(!t.scheme&&e)throw new Error(`[UriError]: Scheme is missing: {scheme: "", authority: "${t.authority}", path: "${t.path}", query: "${t.query}", fragment: "${t.fragment}"}`);if(t.scheme&&!A.test(t.scheme))throw new Error("[UriError]: Scheme contains illegal characters.");if(t.path){if(t.authority){if(!x.test(t.path))throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character')}else if(P.test(t.path))throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")')}}function $(t,e){return!t&&!e?"file":t}function E(t,e){switch(t){case"https":case"http":case"file":e?e[0]!==h&&(e=h+e):e=h;break}return e}const a="",h="/",k=/^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;class d{static isUri(e){return e instanceof d?!0:e?typeof e.authority=="string"&&typeof e.fragment=="string"&&typeof e.path=="string"&&typeof e.query=="string"&&typeof e.scheme=="string"&&typeof e.fsPath=="string"&&typeof e.with=="function"&&typeof e.toString=="function":!1}scheme;authority;path;query;fragment;constructor(e,r,n,f,o,i=!1){typeof e=="object"?(this.scheme=e.scheme||a,this.authority=e.authority||a,this.path=e.path||a,this.query=e.query||a,this.fragment=e.fragment||a):(this.scheme=$(e,i),this.authority=r||a,this.path=E(this.scheme,n||a),this.query=f||a,this.fragment=o||a,v(this,i))}get fsPath(){return y(this,!1)}with(e){if(!e)return this;let{scheme:r,authority:n,path:f,query:o,fragment:i}=e;return r===void 0?r=this.scheme:r===null&&(r=a),n===void 0?n=this.authority:n===null&&(n=a),f===void 0?f=this.path:f===null&&(f=a),o===void 0?o=this.query:o===null&&(o=a),i===void 0?i=this.fragment:i===null&&(i=a),r===this.scheme&&n===this.authority&&f===this.path&&o===this.query&&i===this.fragment?this:new u(r,n,f,o,i)}static parse(e,r=!1){const n=k.exec(e);return n?new u(n[2]||a,m(n[4]||a),m(n[5]||a),m(n[7]||a),m(n[9]||a),r):new u(a,a,a,a,a)}static file(e){let r=a;if(g&&(e=e.replace(/\\/g,h)),e[0]===h&&e[1]===h){const n=e.indexOf(h,2);n===-1?(r=e.substring(2),e=h):(r=e.substring(2,n),e=e.substring(n)||h)}return new u("file",r,e,a,a)}static from(e,r){return new u(e.scheme,e.authority,e.path,e.query,e.fragment,r)}static joinPath(e,...r){if(!e.path)throw new Error("[UriError]: cannot call joinPath on URI without path");let n;return g&&e.scheme==="file"?n=d.file(I.win32.join(y(e,!0),...r)).path:n=I.posix.join(e.path,...r),e.with({path:n})}toString(e=!1){return C(this,e)}toJSON(){return this}static revive(e){if(e){if(e instanceof d)return e;{const r=new u(e);return r._formatted=e.external??null,r._fsPath=e._sep===b?e.fsPath??null:null,r}}else return e}[Symbol.for("debug.description")](){return`URI(${this.toString()})`}}function Z(t){return!t||typeof t!="object"?!1:typeof t.scheme=="string"&&(typeof t.authority=="string"||typeof t.authority>"u")&&(typeof t.path=="string"||typeof t.path>"u")&&(typeof t.query=="string"||typeof t.query>"u")&&(typeof t.fragment=="string"||typeof t.fragment>"u")}const b=g?1:void 0;class u extends d{_formatted=null;_fsPath=null;get fsPath(){return this._fsPath||(this._fsPath=y(this,!1)),this._fsPath}toString(e=!1){return e?C(this,!0):(this._formatted||(this._formatted=C(this,!1)),this._formatted)}toJSON(){const e={$mid:q.Uri};return this._fsPath&&(e.fsPath=this._fsPath,e._sep=b),this._formatted&&(e.external=this._formatted),this.path&&(e.path=this.path),this.scheme&&(e.scheme=this.scheme),this.authority&&(e.authority=this.authority),this.query&&(e.query=this.query),this.fragment&&(e.fragment=this.fragment),e}}const R={[s.Colon]:"%3A",[s.Slash]:"%2F",[s.QuestionMark]:"%3F",[s.Hash]:"%23",[s.OpenSquareBracket]:"%5B",[s.CloseSquareBracket]:"%5D",[s.AtSign]:"%40",[s.ExclamationMark]:"%21",[s.DollarSign]:"%24",[s.Ampersand]:"%26",[s.SingleQuote]:"%27",[s.OpenParen]:"%28",[s.CloseParen]:"%29",[s.Asterisk]:"%2A",[s.Plus]:"%2B",[s.Comma]:"%2C",[s.Semicolon]:"%3B",[s.Equals]:"%3D",[s.Space]:"%20"};function S(t,e,r){let n,f=-1;for(let o=0;o<t.length;o++){const i=t.charCodeAt(o);if(i>=s.a&&i<=s.z||i>=s.A&&i<=s.Z||i>=s.Digit0&&i<=s.Digit9||i===s.Dash||i===s.Period||i===s.Underline||i===s.Tilde||e&&i===s.Slash||r&&i===s.OpenSquareBracket||r&&i===s.CloseSquareBracket||r&&i===s.Colon)f!==-1&&(n+=encodeURIComponent(t.substring(f,o)),f=-1),n!==void 0&&(n+=t.charAt(o));else{n===void 0&&(n=t.substr(0,o));const c=R[i];c!==void 0?(f!==-1&&(n+=encodeURIComponent(t.substring(f,o)),f=-1),n+=c):f===-1&&(f=o)}}return f!==-1&&(n+=encodeURIComponent(t.substring(f))),n!==void 0?n:t}function B(t){let e;for(let r=0;r<t.length;r++){const n=t.charCodeAt(r);n===s.Hash||n===s.QuestionMark?(e===void 0&&(e=t.substr(0,r)),e+=R[n]):e!==void 0&&(e+=t[r])}return e!==void 0?e:t}function y(t,e){let r;return t.authority&&t.path.length>1&&t.scheme==="file"?r=`//${t.authority}${t.path}`:t.path.charCodeAt(0)===s.Slash&&(t.path.charCodeAt(1)>=s.A&&t.path.charCodeAt(1)<=s.Z||t.path.charCodeAt(1)>=s.a&&t.path.charCodeAt(1)<=s.z)&&t.path.charCodeAt(2)===s.Colon?e?r=t.path.substr(1):r=t.path[1].toLowerCase()+t.path.substr(2):r=t.path,g&&(r=r.replace(/\//g,"\\")),r}function C(t,e){const r=e?B:S;let n="",{scheme:f,authority:o,path:i,query:c,fragment:U}=t;if(f&&(n+=f,n+=":"),(o||f==="file")&&(n+=h,n+=h),o){let l=o.indexOf("@");if(l!==-1){const p=o.substr(0,l);o=o.substr(l+1),l=p.lastIndexOf(":"),l===-1?n+=r(p,!1,!1):(n+=r(p.substr(0,l),!1,!1),n+=":",n+=r(p.substr(l+1),!1,!0)),n+="@"}o=o.toLowerCase(),l=o.lastIndexOf(":"),l===-1?n+=r(o,!1,!0):(n+=r(o.substr(0,l),!1,!0),n+=o.substr(l))}if(i){if(i.length>=3&&i.charCodeAt(0)===s.Slash&&i.charCodeAt(2)===s.Colon){const l=i.charCodeAt(1);l>=s.A&&l<=s.Z&&(i=`/${String.fromCharCode(l+32)}:${i.substr(3)}`)}else if(i.length>=2&&i.charCodeAt(1)===s.Colon){const l=i.charCodeAt(0);l>=s.A&&l<=s.Z&&(i=`${String.fromCharCode(l+32)}:${i.substr(2)}`)}n+=r(i,!0,!1)}return c&&(n+="?",n+=r(c,!1,!1)),U&&(n+="#",n+=e?U:S(U,!1,!1)),n}function w(t){try{return decodeURIComponent(t)}catch{return t.length>3?t.substr(0,3)+w(t.substr(3)):t}}const _=/(%[0-9A-Za-z][0-9A-Za-z])+/g;function m(t){return t.match(_)?t.replace(_,e=>w(e)):t}export{d as URI,Z as isUriComponents,y as uriToFsPath};
