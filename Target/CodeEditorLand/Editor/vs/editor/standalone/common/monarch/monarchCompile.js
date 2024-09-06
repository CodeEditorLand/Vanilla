import*as f from"../../../../../vs/editor/standalone/common/monarch/monarchCommon.js";import"../../../../../vs/editor/standalone/common/monarch/monarchTypes.js";function w(r,t){if(!t||!Array.isArray(t))return!1;for(const e of t)if(!r(e))return!1;return!0}function d(r,t){return typeof r=="boolean"?r:t}function x(r,t){return typeof r=="string"?r:t}function C(r){const t={};for(const e of r)t[e]=!0;return t}function E(r,t=!1){t&&(r=r.map(function(n){return n.toLowerCase()}));const e=C(r);return t?function(n){return e[n.toLowerCase()]!==void 0&&e.hasOwnProperty(n.toLowerCase())}:function(n){return e[n]!==void 0&&e.hasOwnProperty(n)}}function b(r,t,e){t=t.replace(/@@/g,"");let n=0,c;do c=!1,t=t.replace(/@(\w+)/g,function(a,o){c=!0;let l="";if(typeof r[o]=="string")l=r[o];else if(r[o]&&r[o]instanceof RegExp)l=r[o].source;else throw r[o]===void 0?f.createError(r,"language definition does not contain attribute '"+o+"', used at: "+t):f.createError(r,"attribute reference '"+o+"' must be a string, used at: "+t);return f.empty(l)?"":"(?:"+l+")"}),n++;while(c&&n<5);t=t.replace(/\x01/g,"@");const g=(r.ignoreCase?"i":"")+(r.unicode?"u":"");if(e&&t.match(/\$[sS](\d\d?)/g)){let o=null,l=null;return i=>(l&&o===i||(o=i,l=new RegExp(f.substituteMatchesRe(r,t,i),g)),l)}return new RegExp(t,g)}function A(r,t,e,n){if(n<0)return r;if(n<t.length)return t[n];if(n>=100){n=n-100;const c=e.split(".");if(c.unshift(e),n<c.length)return c[n]}return null}function R(r,t,e,n){let c=-1,g=e,a=e.match(/^\$(([sS]?)(\d\d?)|#)(.*)$/);a&&(a[3]&&(c=parseInt(a[3]),a[2]&&(c=c+100)),g=a[4]);let o="~",l=g;!g||g.length===0?(o="!=",l=""):/^\w*$/.test(l)?o="==":(a=g.match(/^(@|!@|~|!~|==|!=)(.*)$/),a&&(o=a[1],l=a[2]));let i;if((o==="~"||o==="!~")&&/^(\w|\|)*$/.test(l)){const s=E(l.split("|"),r.ignoreCase);i=function(u){return o==="~"?s(u):!s(u)}}else if(o==="@"||o==="!@"){const s=r[l];if(!s)throw f.createError(r,"the @ match target '"+l+"' is not defined, in rule: "+t);if(!w(function(h){return typeof h=="string"},s))throw f.createError(r,"the @ match target '"+l+"' must be an array of strings, in rule: "+t);const u=E(s,r.ignoreCase);i=function(h){return o==="@"?u(h):!u(h)}}else if(o==="~"||o==="!~")if(l.indexOf("$")<0){const s=b(r,"^"+l+"$",!1);i=function(u){return o==="~"?s.test(u):!s.test(u)}}else i=function(s,u,h,m){return b(r,"^"+f.substituteMatches(r,l,u,h,m)+"$",!1).test(s)};else if(l.indexOf("$")<0){const s=f.fixCase(r,l);i=function(u){return o==="=="?u===s:u!==s}}else{const s=f.fixCase(r,l);i=function(u,h,m,p,z){const k=f.substituteMatches(r,s,h,m,p);return o==="=="?u===k:u!==k}}return c===-1?{name:e,value:n,test:function(s,u,h,m){return i(s,s,u,h,m)}}:{name:e,value:n,test:function(s,u,h,m){const p=A(s,u,h,c);return i(p||"",s,u,h,m)}}}function y(r,t,e){if(e){if(typeof e=="string")return e;if(e.token||e.token===""){if(typeof e.token!="string")throw f.createError(r,"a 'token' attribute must be of type string, in rule: "+t);{const n={token:e.token};if(e.token.indexOf("$")>=0&&(n.tokenSubst=!0),typeof e.bracket=="string")if(e.bracket==="@open")n.bracket=f.MonarchBracket.Open;else if(e.bracket==="@close")n.bracket=f.MonarchBracket.Close;else throw f.createError(r,"a 'bracket' attribute must be either '@open' or '@close', in rule: "+t);if(e.next){if(typeof e.next!="string")throw f.createError(r,"the next state must be a string value in rule: "+t);{let c=e.next;if(!/^(@pop|@push|@popall)$/.test(c)&&(c[0]==="@"&&(c=c.substr(1)),c.indexOf("$")<0&&!f.stateExists(r,f.substituteMatches(r,c,"",[],""))))throw f.createError(r,"the next state '"+e.next+"' is not defined in rule: "+t);n.next=c}}return typeof e.goBack=="number"&&(n.goBack=e.goBack),typeof e.switchTo=="string"&&(n.switchTo=e.switchTo),typeof e.log=="string"&&(n.log=e.log),typeof e.nextEmbedded=="string"&&(n.nextEmbedded=e.nextEmbedded,r.usesEmbedded=!0),n}}else if(Array.isArray(e)){const n=[];for(let c=0,g=e.length;c<g;c++)n[c]=y(r,t,e[c]);return{group:n}}else if(e.cases){const n=[];for(const g in e.cases)if(e.cases.hasOwnProperty(g)){const a=y(r,t,e.cases[g]);g==="@default"||g==="@"||g===""?n.push({test:void 0,value:a,name:g}):g==="@eos"?n.push({test:function(o,l,i,s){return s},value:a,name:g}):n.push(R(r,t,g,a))}const c=r.defaultToken;return{test:function(g,a,o,l){for(const i of n)if(!i.test||i.test(g,a,o,l))return i.value;return c}}}else throw f.createError(r,"an action must be a string, an object with a 'token' or 'cases' attribute, or an array of actions; in rule: "+t)}else return{token:""}}class L{regex=new RegExp("");action={token:""};matchOnlyAtLineStart=!1;name="";constructor(t){this.name=t}setRegex(t,e){let n;if(typeof e=="string")n=e;else if(e instanceof RegExp)n=e.source;else throw f.createError(t,"rules must start with a match string or regular expression: "+this.name);this.matchOnlyAtLineStart=n.length>0&&n[0]==="^",this.name=this.name+": "+n,this.regex=b(t,"^(?:"+(this.matchOnlyAtLineStart?n.substr(1):n)+")",!0)}setAction(t,e){this.action=y(t,this.name,e)}resolveRegex(t){return this.regex instanceof RegExp?this.regex:this.regex(t)}}function S(r,t){if(!t||typeof t!="object")throw new Error("Monarch: expecting a language definition object");const e={languageId:r,includeLF:d(t.includeLF,!1),noThrow:!1,maxStack:100,start:typeof t.start=="string"?t.start:null,ignoreCase:d(t.ignoreCase,!1),unicode:d(t.unicode,!1),tokenPostfix:x(t.tokenPostfix,"."+r),defaultToken:x(t.defaultToken,"source"),usesEmbedded:!1,stateNames:{},tokenizer:{},brackets:[]},n=t;n.languageId=r,n.includeLF=e.includeLF,n.ignoreCase=e.ignoreCase,n.unicode=e.unicode,n.noThrow=e.noThrow,n.usesEmbedded=e.usesEmbedded,n.stateNames=t.tokenizer,n.defaultToken=e.defaultToken;function c(a,o,l){for(const i of l){let s=i.include;if(s){if(typeof s!="string")throw f.createError(e,"an 'include' attribute must be a string at: "+a);if(s[0]==="@"&&(s=s.substr(1)),!t.tokenizer[s])throw f.createError(e,"include target '"+s+"' is not defined at: "+a);c(a+"."+s,o,t.tokenizer[s])}else{const u=new L(a);if(Array.isArray(i)&&i.length>=1&&i.length<=3)if(u.setRegex(n,i[0]),i.length>=3)if(typeof i[1]=="string")u.setAction(n,{token:i[1],next:i[2]});else if(typeof i[1]=="object"){const h=i[1];h.next=i[2],u.setAction(n,h)}else throw f.createError(e,"a next state as the last element of a rule can only be given if the action is either an object or a string, at: "+a);else u.setAction(n,i[1]);else{if(!i.regex)throw f.createError(e,"a rule must either be an array, or an object with a 'regex' or 'include' field at: "+a);i.name&&typeof i.name=="string"&&(u.name=i.name),i.matchOnlyAtStart&&(u.matchOnlyAtLineStart=d(i.matchOnlyAtLineStart,!1)),u.setRegex(n,i.regex),u.setAction(n,i.action)}o.push(u)}}}if(!t.tokenizer||typeof t.tokenizer!="object")throw f.createError(e,"a language definition must define the 'tokenizer' attribute as an object");e.tokenizer=[];for(const a in t.tokenizer)if(t.tokenizer.hasOwnProperty(a)){e.start||(e.start=a);const o=t.tokenizer[a];e.tokenizer[a]=new Array,c("tokenizer."+a,e.tokenizer[a],o)}if(e.usesEmbedded=n.usesEmbedded,t.brackets){if(!Array.isArray(t.brackets))throw f.createError(e,"the 'brackets' attribute must be defined as an array")}else t.brackets=[{open:"{",close:"}",token:"delimiter.curly"},{open:"[",close:"]",token:"delimiter.square"},{open:"(",close:")",token:"delimiter.parenthesis"},{open:"<",close:">",token:"delimiter.angle"}];const g=[];for(const a of t.brackets){let o=a;if(o&&Array.isArray(o)&&o.length===3&&(o={token:o[2],open:o[0],close:o[1]}),o.open===o.close)throw f.createError(e,"open and close brackets in a 'brackets' attribute must be different: "+o.open+`
 hint: use the 'bracket' attribute if matching on equal brackets is required.`);if(typeof o.open=="string"&&typeof o.token=="string"&&typeof o.close=="string")g.push({token:o.token+e.tokenPostfix,open:f.fixCase(e,o.open),close:f.fixCase(e,o.close)});else throw f.createError(e,"every element in the 'brackets' array must be a '{open,close,token}' object or array")}return e.brackets=g,e.noThrow=!0,e}export{S as compile};
