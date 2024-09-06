var E=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var b=(v,t,r,i)=>{for(var o=i>1?void 0:i?I(t,r):t,s=v.length-1,n;s>=0;s--)(n=v[s])&&(o=(i?n(t,r,o):n(o))||o);return i&&o&&E(t,r,o),o},u=(v,t)=>(r,i)=>t(r,i,v);import{getWindow as w}from"../../../../../vs/base/browser/dom.js";import{StandardKeyboardEvent as N}from"../../../../../vs/base/browser/keyboardEvent.js";import{getDefaultHoverDelegate as T}from"../../../../../vs/base/browser/ui/hover/hoverDelegateFactory.js";import{KeyCode as k}from"../../../../../vs/base/common/keyCodes.js";import"../../../../../vs/base/common/lifecycle.js";import{Schemas as C}from"../../../../../vs/base/common/network.js";import*as h from"../../../../../vs/base/common/path.js";import*as m from"../../../../../vs/base/common/platform.js";import{URI as S}from"../../../../../vs/base/common/uri.js";import{localize as f}from"../../../../../vs/nls.js";import{IConfigurationService as P}from"../../../../../vs/platform/configuration/common/configuration.js";import{IFileService as H}from"../../../../../vs/platform/files/common/files.js";import{IHoverService as D}from"../../../../../vs/platform/hover/browser/hover.js";import{IOpenerService as R}from"../../../../../vs/platform/opener/common/opener.js";import{ITunnelService as W}from"../../../../../vs/platform/tunnel/common/tunnel.js";import"../../../../../vs/platform/workspace/common/workspace.js";import"../../../../../vs/workbench/contrib/debug/common/debug.js";import{IEditorService as M}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{IWorkbenchEnvironmentService as _}from"../../../../../vs/workbench/services/environment/common/environmentService.js";import{IPathService as A}from"../../../../../vs/workbench/services/path/common/pathService.js";const y="\\u0000-\\u0020\\u007f-\\u009f",O=new RegExp("(?:[a-zA-Z][a-zA-Z0-9+.-]{2,}:\\/\\/|data:|www\\.)[^\\s"+y+'"]{2,}[^\\s'+y+`"')}\\],:;.!?]`,"ug"),K=/(?:[a-zA-Z]:(?:(?:\\|\/)[\w\.-]*)+)/,U=/(?:(?:\~|\.)(?:(?:\\|\/)[\w\.-]*)+)/,x=new RegExp(`(${K.source}|${U.source})`),z=/((?:\~|\.)?(?:\/[\w\.-]*)+)/,B=/(?:\:([\d]+))?(?:\:([\d]+))?/,$=new RegExp(`${m.isWindows?x.source:z.source}${B.source}`,"g"),X=/:([\d]+)(?::([\d]+))?$/,G=2e3;var F=(i=>(i[i.Rich=0]="Rich",i[i.Basic=1]="Basic",i[i.None=2]="None",i))(F||{});let g=class{constructor(t,r,i,o,s,n,e,a){this.editorService=t;this.fileService=r;this.openerService=i;this.pathService=o;this.tunnelService=s;this.environmentService=n;this.configurationService=e;this.hoverService=a}linkify(t,r,i,o,s){if(r){const e=t.split(`
`);for(let l=0;l<e.length-1;l++)e[l]=e[l]+`
`;e[e.length-1]||e.pop();const a=e.map(l=>this.linkify(l,!1,i,o));if(a.length===1)return a[0];const c=document.createElement("span");return a.forEach(l=>c.appendChild(l)),c}const n=document.createElement("span");for(const e of this.detectLinks(t))try{switch(e.kind){case"text":n.appendChild(document.createTextNode(e.value));break;case"web":n.appendChild(this.createWebLink(o?t:void 0,e.value,s));break;case"path":{const a=e.captures[0],c=e.captures[1]?Number(e.captures[1]):0,l=e.captures[2]?Number(e.captures[2]):0;n.appendChild(this.createPathLink(o?t:void 0,e.value,a,c,l,i,s));break}}}catch{n.appendChild(document.createTextNode(e.value))}return n}linkifyLocation(t,r,i,o){const s=this.createLink(t);return this.decorateLink(s,void 0,t,o,async n=>{const e=await i.resolveLocationReference(r);await e.source.openInEditor(this.editorService,{startLineNumber:e.line,startColumn:e.column,endLineNumber:e.endLine??e.line,endColumn:e.endColumn??e.column},n)}),s}createWebLink(t,r,i){const o=this.createLink(r);let s=S.parse(r);const n=X.exec(s.path);return n&&(s=s.with({path:s.path.slice(0,n.index),fragment:`L${n[0].slice(1)}`})),this.decorateLink(o,s,t,i,async()=>{if(s.scheme===C.file){const e=s.fsPath,a=await this.pathService.path,c=h.normalize(a.sep===h.posix.sep&&m.isWindows?e.replace(/\\/g,h.posix.sep):e),l=S.parse(c);if(!await this.fileService.exists(l))return;await this.editorService.openEditor({resource:l,options:{pinned:!0,selection:n?{startLineNumber:+n[1],startColumn:+n[2]}:void 0}});return}this.openerService.open(r,{allowTunneling:!!this.environmentService.remoteAuthority&&this.configurationService.getValue("remote.forwardOnOpen")})}),o}createPathLink(t,r,i,o,s,n,e){if(i[0]==="/"&&i[1]==="/")return document.createTextNode(r);const a={selection:{startLineNumber:o,startColumn:s}};if(i[0]==="."){if(!n)return document.createTextNode(r);const p=n.toResource(i),d=this.createLink(r);return this.decorateLink(d,p,t,e,L=>this.editorService.openEditor({resource:p,options:{...a,preserveFocus:L}})),d}if(i[0]==="~"){const p=this.pathService.resolvedUserHome;p&&(i=h.join(p.fsPath,i.substring(1)))}const c=this.createLink(r);c.tabIndex=0;const l=S.file(h.normalize(i));return this.fileService.stat(l).then(p=>{p.isDirectory||this.decorateLink(c,l,t,e,d=>this.editorService.openEditor({resource:l,options:{...a,preserveFocus:d}}))}).catch(()=>{}),c}createLink(t){const r=document.createElement("a");return r.textContent=t,r}decorateLink(t,r,i,o,s){t.classList.add("link");const n=r&&this.tunnelService.canTunnel(r)?f("followForwardedLink","follow link using forwarded port"):f("followLink","follow link"),e=t.ariaLabel=i?m.isMacintosh?f("fileLinkWithPathMac",`Cmd + click to {0}
{1}`,n,i):f("fileLinkWithPath",`Ctrl + click to {0}
{1}`,n,i):m.isMacintosh?f("fileLinkMac","Cmd + click to {0}",n):f("fileLink","Ctrl + click to {0}",n);o?.type===0?o.store.add(this.hoverService.setupManagedHover(T("element"),t,e)):o?.type!==2&&(t.title=e),t.onmousemove=a=>{t.classList.toggle("pointer",m.isMacintosh?a.metaKey:a.ctrlKey)},t.onmouseleave=()=>t.classList.remove("pointer"),t.onclick=a=>{const c=w(t).getSelection();!c||c.type==="Range"||(m.isMacintosh?a.metaKey:a.ctrlKey)&&(a.preventDefault(),a.stopImmediatePropagation(),s(!1))},t.onkeydown=a=>{const c=new N(a);(c.keyCode===k.Enter||c.keyCode===k.Space)&&(c.preventDefault(),c.stopPropagation(),s(c.keyCode===k.Space))}}detectLinks(t){if(t.length>G)return[{kind:"text",value:t,captures:[]}];const r=[O,$],i=["web","path"],o=[],s=(n,e)=>{if(e>=r.length){o.push({value:n,kind:"text",captures:[]});return}const a=r[e];let c=0,l;for(a.lastIndex=0;(l=a.exec(n))!==null;){const d=n.substring(c,l.index);d&&s(d,e+1);const L=l[0];o.push({value:L,kind:i[e],captures:l.slice(1)}),c=l.index+L.length}const p=n.substring(c);p&&s(p,e+1)};return s(t,0),o}};g=b([u(0,M),u(1,H),u(2,R),u(3,A),u(4,W),u(5,_),u(6,P),u(7,D)],g);export{F as DebugLinkHoverBehavior,g as LinkDetector};
