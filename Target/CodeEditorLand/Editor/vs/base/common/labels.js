import{hasDriveLetter as L,toSlashes as I}from"./extpath.js";import{posix as c,sep as w,win32 as b}from"./path.js";import{OS as T,OperatingSystem as d,isMacintosh as P,isWindows as h}from"./platform.js";import{extUri as U,extUriIgnorePathCase as E}from"./resources.js";import{rtrim as $,startsWithIgnoreCase as z}from"./strings.js";function N(e,n){const{os:i,tildify:t,relative:s}=n;if(s){const r=H(e,s,i);if(typeof r=="string")return r}let o=e.fsPath;if(i===d.Windows&&!h?o=o.replace(/\//g,"\\"):i!==d.Windows&&h&&(o=o.replace(/\\/g,"/")),i!==d.Windows&&t?.userHome){const r=t.userHome.fsPath;let l;e.scheme!==t.userHome.scheme&&e.path[0]===c.sep&&e.path[1]!==c.sep?l=t.userHome.with({path:e.path}).fsPath:l=o,o=j(l,r,i)}return(i===d.Windows?b:c).normalize(k(o,i===d.Windows))}function H(e,n,i){const t=i===d.Windows?b:c,s=i===d.Linux?U:E,o=n.getWorkspace(),f=o.folders.at(0);if(!f)return;e.scheme!==f.uri.scheme&&e.path[0]===c.sep&&e.path[1]!==c.sep&&(e=f.uri.with({path:e.path}));const r=n.getWorkspaceFolder(e);if(!r)return;let l;if(s.isEqual(r.uri,e)?l="":l=s.relativePath(r.uri,e)??"",l&&(l=t.normalize(l)),o.folders.length>1&&!n.noPrefix){const g=r.name?r.name:s.basenameOrAuthority(r.uri);l=l?`${g} \u2022 ${l}`:g}return l}function k(e,n=h){return L(e,n)?e.charAt(0).toUpperCase()+e.slice(1):e}let y=Object.create(null);function j(e,n,i=T){if(i===d.Windows||!e||!n)return e;let t=y.original===n?y.normalized:void 0;t||(t=n,h&&(t=I(t)),t=`${$(t,c.sep)}${c.sep}`,y={original:n,normalized:t});let s=e;return h&&(s=I(s)),(i===d.Linux?s.startsWith(t):z(s,t))?`~/${s.substr(t.length)}`:e}function q(e,n){return e.replace(/^~($|\/|\\)/,`${n}$1`)}const O="\u2026",p="\\\\",x="~";function D(e,n=w){const i=new Array(e.length);let t=!1;for(let s=0;s<e.length;s++){const o=e[s];if(o===""){i[s]=`.${n}`;continue}if(!o){i[s]=o;continue}t=!0;let f="",r=o;r.indexOf(p)===0?(f=r.substr(0,r.indexOf(p)+p.length),r=r.substr(r.indexOf(p)+p.length)):r.indexOf(n)===0?(f=r.substr(0,r.indexOf(n)+n.length),r=r.substr(r.indexOf(n)+n.length)):r.indexOf(x)===0&&(f=r.substr(0,r.indexOf(x)+x.length),r=r.substr(r.indexOf(x)+x.length));const l=r.split(n);for(let g=1;t&&g<=l.length;g++)for(let u=l.length-g;t&&u>=0;u--){t=!1;let m=l.slice(u,u+g).join(n);for(let a=0;!t&&a<e.length;a++)if(a!==s&&e[a]&&e[a].indexOf(m)>-1){const v=u+g===l.length,W=u>0&&e[a].indexOf(n)>-1?n+m:m,A=e[a].endsWith(W);t=!v||A}if(!t){let a="";(l[0].endsWith(":")||f!=="")&&(u===1&&(u=0,g++,m=l[0]+n+m),u>0&&(a=l[0]+n),a=f+a),u>0&&(a=a+O+n),a=a+m,u+g<l.length&&(a=a+n+O),i[s]=a}}t&&(i[s]=o)}return i}var B=(t=>(t[t.TEXT=0]="TEXT",t[t.VARIABLE=1]="VARIABLE",t[t.SEPARATOR=2]="SEPARATOR",t))(B||{});function M(e,n=Object.create(null)){const i=[];let t=!1,s="";for(const o of e)if(o==="$"||t&&o==="{")s&&i.push({value:s,type:0}),s="",t=!0;else if(o==="}"&&t){const f=n[s];if(typeof f=="string")f.length&&i.push({value:f,type:1});else if(f){const r=i[i.length-1];(!r||r.type!==2)&&i.push({value:f.label,type:2})}s="",t=!1}else s+=o;return s&&!t&&i.push({value:s,type:0}),i.filter((o,f)=>{if(o.type===2){const r=i[f-1],l=i[f+1];return[r,l].every(g=>g&&(g.type===1||g.type===0)&&g.value.length>0)}return!0}).map(o=>o.value).join("")}function _(e,n){return P||n?e.replace(/\(&&\w\)|&&/g,"").replace(/&/g,P?"&":"&&"):e.replace(/&&|&/g,i=>i==="&"?"&&":"&")}function G(e,n){return P||n?e.replace(/\(&&\w\)|&&/g,""):h?e.replace(/&&|&/g,i=>i==="&"?"&&":"&"):e.replace(/&&/g,"_")}function J(e){return e.replace(/&/g,"&&")}function K(e){if(e.endsWith("]")){const n=e.lastIndexOf(" [",e.length-2);if(n!==-1){const i=R(e.substring(0,n)),t=e.substring(n);return{name:i.name+t,parentPath:i.parentPath}}}return R(e)}function R(e){const n=e.indexOf("/")!==-1?c:b,i=n.basename(e),t=n.dirname(e);return i.length?{name:i,parentPath:t}:{name:t,parentPath:""}}export{N as getPathLabel,G as mnemonicButtonLabel,_ as mnemonicMenuLabel,k as normalizeDriveLetter,D as shorten,K as splitRecentLabel,M as template,j as tildify,J as unmnemonicLabel,q as untildify};
