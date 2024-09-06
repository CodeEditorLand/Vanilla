var k=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var f=(p,t,i,s)=>{for(var e=s>1?void 0:s?g(t,i):t,n=p.length-1,r;n>=0;n--)(r=p[n])&&(e=(s?r(t,i,e):r(e))||e);return s&&e&&k(t,i,e),e},d=(p,t)=>(i,s)=>t(i,s,p);import{fromNow as S}from"../../../../../../vs/base/common/date.js";import{DisposableStore as x}from"../../../../../../vs/base/common/lifecycle.js";import{localize as a,localize2 as I}from"../../../../../../vs/nls.js";import{Action2 as A}from"../../../../../../vs/platform/actions/common/actions.js";import{IDialogService as E}from"../../../../../../vs/platform/dialogs/common/dialogs.js";import{IInstantiationService as w}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{IProductService as y}from"../../../../../../vs/platform/product/common/productService.js";import{IQuickInputService as _}from"../../../../../../vs/platform/quickinput/common/quickInput.js";import{IAuthenticationAccessService as b}from"../../../../../../vs/workbench/services/authentication/browser/authenticationAccessService.js";import{IAuthenticationUsageService as P}from"../../../../../../vs/workbench/services/authentication/browser/authenticationUsageService.js";import{IAuthenticationService as Q}from"../../../../../../vs/workbench/services/authentication/common/authentication.js";import{IExtensionService as L}from"../../../../../../vs/workbench/services/extensions/common/extensions.js";class W extends A{constructor(){super({id:"_manageTrustedExtensionsForAccount",title:I("manageTrustedExtensionsForAccount","Manage Trusted Extensions For Account"),category:I("accounts","Accounts"),f1:!0})}run(t,i){return t.get(w).createInstance(h).run(i)}}let h=class{constructor(t,i,s,e,n,r,o){this._productService=t;this._extensionService=i;this._dialogService=s;this._quickInputService=e;this._authenticationService=n;this._authenticationUsageService=r;this._authenticationAccessService=o}async run(t){const{providerId:i,accountLabel:s}=await this._resolveProviderAndAccountLabel(t?.providerId,t?.accountLabel);if(!i||!s)return;const e=await this._getItems(i,s);if(!e.length)return;const n=new x,r=this._createQuickPick(n,i,s);r.items=e,r.selectedItems=e.filter(o=>o.type!=="separator"&&!!o.picked),r.show()}async _resolveProviderAndAccountLabel(t,i){if(!t||!i){const s=new Array;for(const n of this._authenticationService.getProviderIds()){const r=this._authenticationService.getProvider(n).label,o=await this._authenticationService.getSessions(n),v=new Set;for(const m of o)v.has(m.account.label)||(v.add(m.account.label),s.push({providerId:n,providerLabel:r,accountLabel:m.account.label}))}const e=await this._quickInputService.pick(s.map(n=>({providerId:n.providerId,label:n.accountLabel,description:n.providerLabel})),{placeHolder:a("pickAccount","Pick an account to manage trusted extensions for"),matchOnDescription:!0});if(e)t=e.providerId,i=e.label;else return{providerId:void 0,accountLabel:void 0}}return{providerId:t,accountLabel:i}}async _getItems(t,i){const s=this._authenticationAccessService.readAllowedExtensions(t,i),e=this._productService.trustedExtensionAuthAccess,n=Array.isArray(e)?e:typeof e=="object"?e[t]??[]:[];for(const c of n){const u=s.find(l=>l.id===c);if(u)u.allowed=!0,u.trusted=!0;else{const l=await this._extensionService.getExtension(c);l&&s.push({id:c,name:l.displayName||l.name,allowed:!0,trusted:!0})}}if(!s.length)return this._dialogService.info(a("noTrustedExtensions","This account has not been used by any extensions.")),[];const r=this._authenticationUsageService.readAccountUsages(t,i),o=[],v=[];for(const c of s){const u=r.find(l=>c.id===l.extensionId);c.lastUsed=u?.lastUsed,c.trusted?o.push(c):v.push(c)}const m=(c,u)=>(u.lastUsed||0)-(c.lastUsed||0);return[...v.sort(m).map(this._toQuickPickItem),{type:"separator",label:a("trustedExtensions","Trusted by Microsoft")},...o.sort(m).map(this._toQuickPickItem)]}_toQuickPickItem(t){const i=t.lastUsed,s=i?a({key:"accountLastUsedDate",comment:['The placeholder {0} is a string with time information, such as "3 days ago"']},"Last used this account {0}",S(i,!0)):a("notUsed","Has not used this account");let e,n;return t.trusted&&(e=a("trustedExtensionTooltip",`This extension is trusted by Microsoft and
always has access to this account`),n=!0),{label:t.name,extension:t,description:s,tooltip:e,disabled:n,picked:t.allowed===void 0||t.allowed}}_createQuickPick(t,i,s){const e=t.add(this._quickInputService.createQuickPick({useSeparators:!0}));return e.canSelectMany=!0,e.customButton=!0,e.customLabel=a("manageTrustedExtensions.cancel","Cancel"),e.title=a("manageTrustedExtensions","Manage Trusted Extensions"),e.placeholder=a("manageExtensions","Choose which extensions can access this account"),t.add(e.onDidAccept(()=>{const n=e.items.filter(o=>o.type!=="separator").map(o=>o.extension),r=new Set(e.selectedItems.map(o=>o.extension));n.forEach(o=>{o.allowed=r.has(o)}),this._authenticationAccessService.updateAllowedExtensions(i,s,n),e.hide()})),t.add(e.onDidHide(()=>{t.dispose()})),t.add(e.onDidCustom(()=>{e.hide()})),e}};h=f([d(0,y),d(1,L),d(2,E),d(3,_),d(4,Q),d(5,P),d(6,b)],h);export{W as ManageTrustedExtensionsForAccountAction};