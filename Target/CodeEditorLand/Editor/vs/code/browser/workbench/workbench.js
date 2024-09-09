import{isStandalone as E}from"../../../base/browser/browser.js";import{mainWindow as n}from"../../../base/browser/window.js";import{VSBuffer as S,decodeBase64 as k,encodeBase64 as w}from"../../../base/common/buffer.js";import{Emitter as A}from"../../../base/common/event.js";import{Disposable as U}from"../../../base/common/lifecycle.js";import{parse as C}from"../../../base/common/marshalling.js";import{Schemas as u}from"../../../base/common/network.js";import{posix as h}from"../../../base/common/path.js";import{isEqual as g}from"../../../base/common/resources.js";import{ltrim as R}from"../../../base/common/strings.js";import{URI as l}from"../../../base/common/uri.js";import b from"../../../platform/product/common/product.js";import"../../../platform/secrets/common/secrets.js";import{isFolderToOpen as m,isWorkspaceToOpen as y}from"../../../platform/window/common/window.js";import"../../../workbench/services/authentication/browser/authenticationService.js";import{create as I}from"../../../workbench/workbench.web.main.internal.js";class P{async seal(e){return e}async unseal(e){return e}}var _=(r=>(r.ALGORITHM="AES-GCM",r[r.KEY_LENGTH=256]="KEY_LENGTH",r[r.IV_LENGTH=12]="IV_LENGTH",r))(_||{});class v{constructor(e){this.authEndpoint=e}_serverKey;static supported(){return!!crypto.subtle}async seal(e){const t=n.crypto.getRandomValues(new Uint8Array(12)),r=await n.crypto.subtle.generateKey({name:"AES-GCM",length:256},!0,["encrypt","decrypt"]),o=new Uint8Array(await n.crypto.subtle.exportKey("raw",r)),i=await this.getKey(o),s=new TextEncoder().encode(e),d=await n.crypto.subtle.encrypt({name:"AES-GCM",iv:t},i,s),p=new Uint8Array([...o,...t,...new Uint8Array(d)]);return w(S.wrap(p))}async unseal(e){const t=k(e);if(t.byteLength<60)throw Error("Invalid length for the value for credentials.crypto");const r=256/8,o=t.slice(0,r),i=t.slice(r,r+12),s=t.slice(r+12),d=await this.getKey(o.buffer),p=await n.crypto.subtle.decrypt({name:"AES-GCM",iv:i.buffer},d,s.buffer);return new TextDecoder().decode(new Uint8Array(p))}async getKey(e){if(!e||e.byteLength!==256/8)throw Error("Invalid length for clientKey");const t=await this.getServerKeyPart(),r=new Uint8Array(256/8);for(let o=0;o<r.byteLength;o++)r[o]=e[o]^t[o];return n.crypto.subtle.importKey("raw",r,{name:"AES-GCM",length:256},!0,["encrypt","decrypt"])}async getServerKeyPart(){if(this._serverKey)return this._serverKey;let e=0,t;for(;e<=3;)try{const r=await fetch(this.authEndpoint,{credentials:"include",method:"POST"});if(!r.ok)throw new Error(r.statusText);const o=new Uint8Array(await await r.arrayBuffer());if(o.byteLength!==256/8)throw Error("The key retrieved by the server is not 256 bit long.");return this._serverKey=o,this._serverKey}catch(r){t=r,e++,await new Promise(o=>setTimeout(o,e*e*100))}throw t}}class T{constructor(e){this.crypto=e}_storageKey="secrets.provider";_secretsPromise=this.load();type="persisted";async load(){const e=this.loadAuthSessionFromElement(),t=localStorage.getItem(this._storageKey);if(t)try{const r=JSON.parse(await this.crypto.unseal(t));return{...e,...r}}catch(r){console.error("Failed to decrypt secrets from localStorage",r),localStorage.removeItem(this._storageKey)}return e}loadAuthSessionFromElement(){let e;const t=n.document.getElementById("vscode-workbench-auth-session"),r=t?t.getAttribute("data-settings"):void 0;if(r)try{e=JSON.parse(r)}catch{}if(!e)return{};const o={};if(o[`${b.urlProtocol}.loginAccount`]=JSON.stringify(e),e.providerId!=="github")return console.error(`Unexpected auth provider: ${e.providerId}. Expected 'github'.`),o;const i=JSON.stringify({extensionId:"vscode.github-authentication",key:"github.auth"});return o[i]=JSON.stringify(e.scopes.map(s=>({id:e.id,scopes:s,accessToken:e.accessToken}))),o}async get(e){return(await this._secretsPromise)[e]}async set(e,t){const r=await this._secretsPromise;r[e]=t,this._secretsPromise=Promise.resolve(r),this.save()}async delete(e){const t=await this._secretsPromise;delete t[e],this._secretsPromise=Promise.resolve(t),this.save()}async save(){try{const e=await this.crypto.seal(JSON.stringify(await this._secretsPromise));localStorage.setItem(this._storageKey,e)}catch(e){console.error(e)}}}class f extends U{constructor(t){super();this._callbackRoute=t}static REQUEST_ID=0;static QUERY_KEYS=["scheme","authority","path","query","fragment"];_onCallback=this._register(new A);onCallback=this._onCallback.event;pendingCallbacks=new Set;lastTimeChecked=Date.now();checkCallbacksTimeout=void 0;onDidChangeLocalStorageDisposable;create(t={}){const r=++f.REQUEST_ID,o=[`vscode-reqid=${r}`];for(const i of f.QUERY_KEYS){const s=t[i];s&&o.push(`vscode-${i}=${encodeURIComponent(s)}`)}if(!(t.authority==="vscode.github-authentication"&&t.path==="/dummy")){const i=`vscode-web.url-callbacks[${r}]`;localStorage.removeItem(i),this.pendingCallbacks.add(r),this.startListening()}return l.parse(n.location.href).with({path:this._callbackRoute,query:o.join("&")})}startListening(){if(this.onDidChangeLocalStorageDisposable)return;const t=()=>this.onDidChangeLocalStorage();n.addEventListener("storage",t),this.onDidChangeLocalStorageDisposable={dispose:()=>n.removeEventListener("storage",t)}}stopListening(){this.onDidChangeLocalStorageDisposable?.dispose(),this.onDidChangeLocalStorageDisposable=void 0}async onDidChangeLocalStorage(){const t=Date.now()-this.lastTimeChecked;t>1e3?this.checkCallbacks():this.checkCallbacksTimeout===void 0&&(this.checkCallbacksTimeout=setTimeout(()=>{this.checkCallbacksTimeout=void 0,this.checkCallbacks()},1e3-t))}checkCallbacks(){let t;for(const r of this.pendingCallbacks){const o=`vscode-web.url-callbacks[${r}]`,i=localStorage.getItem(o);if(i!==null){try{this._onCallback.fire(l.revive(JSON.parse(i)))}catch(s){console.error(s)}t=t??new Set(this.pendingCallbacks),t.delete(r),localStorage.removeItem(o)}}t&&(this.pendingCallbacks=t,this.pendingCallbacks.size===0&&this.stopListening()),this.lastTimeChecked=Date.now()}}class a{constructor(e,t,r){this.workspace=e;this.payload=t;this.config=r}static QUERY_PARAM_EMPTY_WINDOW="ew";static QUERY_PARAM_FOLDER="folder";static QUERY_PARAM_WORKSPACE="workspace";static QUERY_PARAM_PAYLOAD="payload";static create(e){let t=!1,r,o=Object.create(null);return new URL(document.location.href).searchParams.forEach((s,d)=>{switch(d){case a.QUERY_PARAM_FOLDER:e.remoteAuthority&&s.startsWith(h.sep)?r={folderUri:l.from({scheme:u.vscodeRemote,path:s,authority:e.remoteAuthority})}:r={folderUri:l.parse(s)},t=!0;break;case a.QUERY_PARAM_WORKSPACE:e.remoteAuthority&&s.startsWith(h.sep)?r={workspaceUri:l.from({scheme:u.vscodeRemote,path:s,authority:e.remoteAuthority})}:r={workspaceUri:l.parse(s)},t=!0;break;case a.QUERY_PARAM_EMPTY_WINDOW:r=void 0,t=!0;break;case a.QUERY_PARAM_PAYLOAD:try{o=C(s)}catch(p){console.error(p)}break}}),t||(e.folderUri?r={folderUri:l.revive(e.folderUri)}:e.workspaceUri&&(r={workspaceUri:l.revive(e.workspaceUri)})),new a(r,o,e)}trusted=!0;async open(e,t){if(t?.reuse&&!t.payload&&this.isSame(this.workspace,e))return!0;const r=this.createTargetUrl(e,t);if(r){if(t?.reuse)return n.location.href=r,!0;{let o;return E()?o=n.open(r,"_blank","toolbar=no"):o=n.open(r),!!o}}return!1}createTargetUrl(e,t){let r;if(!e)r=`${document.location.origin}${document.location.pathname}?${a.QUERY_PARAM_EMPTY_WINDOW}=true`;else if(m(e)){const o=this.encodeWorkspacePath(e.folderUri);r=`${document.location.origin}${document.location.pathname}?${a.QUERY_PARAM_FOLDER}=${o}`}else if(y(e)){const o=this.encodeWorkspacePath(e.workspaceUri);r=`${document.location.origin}${document.location.pathname}?${a.QUERY_PARAM_WORKSPACE}=${o}`}return t?.payload&&(r+=`&${a.QUERY_PARAM_PAYLOAD}=${encodeURIComponent(JSON.stringify(t.payload))}`),r}encodeWorkspacePath(e){return this.config.remoteAuthority&&e.scheme===u.vscodeRemote?encodeURIComponent(`${h.sep}${R(e.path,h.sep)}`).replaceAll("%2F","/"):encodeURIComponent(e.toString(!0))}isSame(e,t){return!e||!t?e===t:m(e)&&m(t)?g(e.folderUri,t.folderUri):y(e)&&y(t)?g(e.workspaceUri,t.workspaceUri):!1}hasRemote(){if(this.workspace){if(m(this.workspace))return this.workspace.folderUri.scheme===u.vscodeRemote;if(y(this.workspace))return this.workspace.workspaceUri.scheme===u.vscodeRemote}return!0}}function L(c){const e=document.cookie.split("; ");for(const t of e)if(t.startsWith(c+"="))return t.substring(c.length+1)}(function(){const c=n.document.getElementById("vscode-workbench-web-configuration"),e=c?c.getAttribute("data-settings"):void 0;if(!c||!e)throw new Error("Missing web configuration element");const t=JSON.parse(e),r=L("vscode-secret-key-path"),o=r&&v.supported()?new v(r):new P;I(n.document.body,{...t,windowIndicator:t.windowIndicator??{label:"$(remote)",tooltip:`${b.nameShort} Web`},settingsSyncOptions:t.settingsSyncOptions?{enabled:t.settingsSyncOptions.enabled}:void 0,workspaceProvider:a.create(t),urlCallbackProvider:new f(t.callbackRoute),secretStorageProvider:t.remoteAuthority&&!r?void 0:new T(o)})})();export{T as LocalStorageSecretStorageProvider};
