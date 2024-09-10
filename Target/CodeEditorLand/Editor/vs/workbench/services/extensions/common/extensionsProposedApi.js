var f=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var b=(i,e,o,n)=>{for(var s=n>1?void 0:n?A(e,o):e,t=i.length-1,r;t>=0;t--)(r=i[t])&&(s=(n?r(e,o,s):r(s))||s);return n&&s&&f(e,o,s),s},a=(i,e)=>(o,n)=>e(o,n,i);import{isNonEmptyArray as c}from"../../../../base/common/arrays.js";import{localize as m}from"../../../../nls.js";import{Disposable as P}from"../../../../base/common/lifecycle.js";import{ExtensionIdentifier as d}from"../../../../platform/extensions/common/extensions.js";import{allApiProposals as u}from"../../../../platform/extensions/common/extensionsApiProposals.js";import{SyncDescriptor as h}from"../../../../platform/instantiation/common/descriptors.js";import{ILogService as I}from"../../../../platform/log/common/log.js";import{IProductService as S}from"../../../../platform/product/common/productService.js";import{Registry as g}from"../../../../platform/registry/common/platform.js";import{IWorkbenchEnvironmentService as v}from"../../environment/common/environmentService.js";import{Extensions as x}from"../../extensionManagement/common/extensionFeatures.js";import{MarkdownString as y}from"../../../../base/common/htmlContent.js";let l=class{constructor(e,o,n){this._logService=e;this._environmentService=o;if(this._envEnabledExtensions=new Set((o.extensionEnabledProposedApi??[]).map(s=>d.toKey(s))),this._envEnablesProposedApiForAll=!o.isBuilt||o.isExtensionDevelopment&&n.quality!=="stable"||this._envEnabledExtensions.size===0&&Array.isArray(o.extensionEnabledProposedApi),this._productEnabledExtensions=new Map,n.extensionEnabledApiProposals)for(const[s,t]of Object.entries(n.extensionEnabledApiProposals)){const r=d.toKey(s),p=t.filter(E=>u[E]?!0:(e.warn(`Via 'product.json#extensionEnabledApiProposals' extension '${r}' wants API proposal '${E}' but that proposal DOES NOT EXIST. Likely, the proposal has been finalized (check 'vscode.d.ts') or was abandoned.`),!1));this._productEnabledExtensions.set(r,p)}}_envEnablesProposedApiForAll;_envEnabledExtensions;_productEnabledExtensions;updateEnabledApiProposals(e){for(const o of e)this.doUpdateEnabledApiProposals(o)}doUpdateEnabledApiProposals(e){const o=d.toKey(e.identifier);if(c(e.enabledApiProposals)&&(e.enabledApiProposals=e.enabledApiProposals.filter(n=>{const s=!!u[n];return s||this._logService.error(`Extension '${o}' wants API proposal '${n}' but that proposal DOES NOT EXIST. Likely, the proposal has been finalized (check 'vscode.d.ts') or was abandoned.`),s})),this._productEnabledExtensions.has(o)){const n=this._productEnabledExtensions.get(o),s=new Set(n),t=new Set(e.enabledApiProposals),r=new Set([...t].filter(p=>!s.has(p)));r.size>0&&(this._logService.error(`Extension '${o}' appears in product.json but enables LESS API proposals than the extension wants.
package.json (LOSES): ${[...t].join(", ")}
product.json (WINS): ${[...s].join(", ")}`),this._environmentService.isExtensionDevelopment&&(this._logService.error(`Proceeding with EXTRA proposals (${[...r].join(", ")}) because extension is in development mode. Still, this EXTENSION WILL BE BROKEN unless product.json is updated.`),n.push(...r))),e.enabledApiProposals=n;return}this._envEnablesProposedApiForAll||this._envEnabledExtensions.has(o)||!e.isBuiltin&&c(e.enabledApiProposals)&&(this._logService.error(`Extension '${e.identifier.value} CANNOT USE these API proposals '${e.enabledApiProposals?.join(", ")||"*"}'. You MUST start in extension development mode or use the --enable-proposed-api command line flag`),e.enabledApiProposals=[])}};l=b([a(0,I),a(1,v),a(2,S)],l);class w extends P{type="markdown";shouldRender(e){return!!e.originalEnabledApiProposals?.length||!!e.enabledApiProposals?.length}render(e){const o=e.originalEnabledApiProposals??e.enabledApiProposals??[],n=new y;if(o.length)for(const s of o)n.appendMarkdown(`- \`${s}\`
`);return{data:n,dispose:()=>{}}}}g.as(x.ExtensionFeaturesRegistry).registerExtensionFeature({id:"enabledApiProposals",label:m("enabledProposedAPIs","API Proposals"),access:{canToggle:!1},renderer:new h(w)});export{l as ExtensionsProposedApi};
