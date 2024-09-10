var p=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var d=(l,t,r,n)=>{for(var e=n>1?void 0:n?h(t,r):t,i=l.length-1,s;i>=0;i--)(s=l[i])&&(e=(n?s(t,r,e):s(e))||e);return n&&e&&p(t,r,e),e},u=(l,t)=>(r,n)=>t(r,n,l);import{getClientArea as y,getTopLeftOffset as v}from"../../../../base/browser/dom.js";import{mainWindow as a}from"../../../../base/browser/window.js";import{coalesce as E}from"../../../../base/common/arrays.js";import{language as b,locale as S}from"../../../../base/common/platform.js";import{IEnvironmentService as I}from"../../../../platform/environment/common/environment.js";import{IFileService as w}from"../../../../platform/files/common/files.js";import g from"../../../../platform/languagePacks/common/localizedStrings.js";import{getLogs as L}from"../../../../platform/log/browser/log.js";import{ILogService as x}from"../../../../platform/log/common/log.js";import{Registry as P}from"../../../../platform/registry/common/platform.js";import{Extensions as T}from"../../../common/contributions.js";import{ILifecycleService as $,LifecyclePhase as W}from"../../lifecycle/common/lifecycle.js";let f=class{constructor(t,r,n,e){this.fileService=t;this.environmentService=r;this.lifecycleService=n;this.logService=e}async getLogs(){return L(this.fileService,this.environmentService)}async whenWorkbenchRestored(){this.logService.info("[driver] Waiting for restored lifecycle phase..."),await this.lifecycleService.when(W.Restored),this.logService.info("[driver] Restored lifecycle phase reached. Waiting for contributions..."),await P.as(T.Workbench).whenRestored,this.logService.info("[driver] Workbench contributions created.")}async setValue(t,r){const n=a.document.querySelector(t);if(!n)return Promise.reject(new Error(`Element not found: ${t}`));const e=n;e.value=r;const i=new Event("input",{bubbles:!0,cancelable:!0});e.dispatchEvent(i)}async isActiveElement(t){if(a.document.querySelector(t)!==a.document.activeElement){const n=[];let e=a.document.activeElement;for(;e;){const i=e.tagName,s=e.id?`#${e.id}`:"",c=E(e.className.split(/\s+/g).map(o=>o.trim())).map(o=>`.${o}`).join("");n.unshift(`${i}${s}${c}`),e=e.parentElement}throw new Error(`Active element not found. Current active element is '${n.join(" > ")}'. Looking for ${t}`)}return!0}async getElements(t,r){const n=a.document.querySelectorAll(t),e=[];for(let i=0;i<n.length;i++){const s=n.item(i);e.push(this.serializeElement(s,r))}return e}serializeElement(t,r){const n=Object.create(null);for(let c=0;c<t.attributes.length;c++){const o=t.attributes.item(c);o&&(n[o.name]=o.value)}const e=[];if(r)for(let c=0;c<t.children.length;c++){const o=t.children.item(c);o&&e.push(this.serializeElement(o,!0))}const{left:i,top:s}=v(t);return{tagName:t.tagName,className:t.className,textContent:t.textContent||"",attributes:n,children:e,left:i,top:s}}async getElementXY(t,r,n){const e=typeof r=="number"&&typeof n=="number"?{x:r,y:n}:void 0;return this._getElementXY(t,e)}async typeInEditor(t,r){const n=a.document.querySelector(t);if(!n)throw new Error(`Editor not found: ${t}`);const e=n,i=e.selectionStart,s=i+r.length,c=e.value,o=c.substr(0,i)+r+c.substr(i);e.value=o,e.setSelectionRange(s,s);const m=new Event("input",{bubbles:!0,cancelable:!0});e.dispatchEvent(m)}async getTerminalBuffer(t){const r=a.document.querySelector(t);if(!r)throw new Error(`Terminal not found: ${t}`);const n=r.xterm;if(!n)throw new Error(`Xterm not found: ${t}`);const e=[];for(let i=0;i<n.buffer.active.length;i++)e.push(n.buffer.active.getLine(i).translateToString(!0));return e}async writeInTerminal(t,r){const n=a.document.querySelector(t);if(!n)throw new Error(`Element not found: ${t}`);const e=n.xterm;if(!e)throw new Error(`Xterm not found: ${t}`);e.input(r)}getLocaleInfo(){return Promise.resolve({language:b,locale:S})}getLocalizedStrings(){return Promise.resolve({open:g.open,close:g.close,find:g.find})}async _getElementXY(t,r){const n=a.document.querySelector(t);if(!n)return Promise.reject(new Error(`Element not found: ${t}`));const{left:e,top:i}=v(n),{width:s,height:c}=y(n);let o,m;return r?(o=e+r.x,m=i+r.y):(o=e+s/2,m=i+c/2),o=Math.round(o),m=Math.round(m),{x:o,y:m}}async exitApplication(){}};f=d([u(0,w),u(1,I),u(2,$),u(3,x)],f);function Z(l){Object.assign(a,{driver:l.createInstance(f)})}export{f as BrowserWindowDriver,Z as registerWindowDriver};
