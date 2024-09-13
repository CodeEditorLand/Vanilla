var b=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var g=(s,r,o,i)=>{for(var e=i>1?void 0:i?D(r,o):r,n=s.length-1,a;n>=0;n--)(a=s[n])&&(e=(i?a(r,o,e):a(e))||e);return i&&e&&b(r,o,e),e},t=(s,r)=>(o,i)=>r(o,i,s);import{Schemas as y,matchesScheme as k}from"../../../../base/common/network.js";import w from"../../../../base/common/severity.js";import{URI as O}from"../../../../base/common/uri.js";import{localize as v}from"../../../../nls.js";import{IClipboardService as x}from"../../../../platform/clipboard/common/clipboardService.js";import{IConfigurationService as L}from"../../../../platform/configuration/common/configuration.js";import{IDialogService as W}from"../../../../platform/dialogs/common/dialogs.js";import{IInstantiationService as $}from"../../../../platform/instantiation/common/instantiation.js";import{IOpenerService as C}from"../../../../platform/opener/common/opener.js";import{IProductService as M}from"../../../../platform/product/common/productService.js";import{IQuickInputService as R}from"../../../../platform/quickinput/common/quickInput.js";import{IStorageService as U}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as q}from"../../../../platform/telemetry/common/telemetry.js";import{IWorkspaceTrustManagementService as E}from"../../../../platform/workspace/common/workspaceTrust.js";import{IEditorService as P}from"../../../services/editor/common/editorService.js";import{ITrustedDomainService as A,isURLDomainTrusted as Q}from"./trustedDomainService.js";import{configureOpenerTrustedDomainsHandler as j,readStaticTrustedDomains as z}from"./trustedDomains.js";let u=class{constructor(r,o,i,e,n,a,f,l,S,m,c,h){this._openerService=r;this._storageService=o;this._dialogService=i;this._productService=e;this._quickInputService=n;this._editorService=a;this._clipboardService=f;this._telemetryService=l;this._instantiationService=S;this._configurationService=m;this._workspaceTrustService=c;this._trustedDomainService=h;this._openerService.registerValidator({shouldOpen:(p,d)=>this.validateLink(p,d)})}async validateLink(r,o){if(!k(r,y.http)&&!k(r,y.https)||o?.fromWorkspace&&this._workspaceTrustService.isWorkspaceTrusted()&&!this._configurationService.getValue("workbench.trustedDomains.promptInTrustedWorkspace"))return!0;const i=r;let e;if(typeof r=="string"?e=O.parse(r):e=r,await this._trustedDomainService.isValid(e))return!0;{const{scheme:n,authority:a,path:f,query:l,fragment:S}=e;let m=`${n}://${a}${f}`;const c=`${l?"?"+l:""}${S?"#"+S:""}`,h=Math.max(0,60-m.length),p=Math.min(Math.max(5,h),c.length);p===c.length?m+=c:m+=c.charAt(0)+"..."+c.substring(c.length-p+1);const{result:d}=await this._dialogService.prompt({type:w.Info,message:v("openExternalLinkAt","Do you want {0} to open the external website?",this._productService.nameShort),detail:typeof i=="string"?i:m,buttons:[{label:v({key:"open",comment:["&& denotes a mnemonic"]},"&&Open"),run:()=>!0},{label:v({key:"copy",comment:["&& denotes a mnemonic"]},"&&Copy"),run:()=>(this._clipboardService.writeText(typeof i=="string"?i:e.toString(!0)),!1)},{label:v({key:"configureTrustedDomains",comment:["&& denotes a mnemonic"]},"Configure &&Trusted Domains"),run:async()=>{const{trustedDomains:_}=this._instantiationService.invokeFunction(z),T=`${n}://${a}`,I=await j(_,T,e,this._quickInputService,this._storageService,this._editorService,this._telemetryService);return!!(I.indexOf("*")!==-1||Q(e,I))}}],cancelButton:{run:()=>!1}});return d}}};u=g([t(0,C),t(1,U),t(2,W),t(3,M),t(4,R),t(5,P),t(6,x),t(7,q),t(8,$),t(9,L),t(10,E),t(11,A)],u);export{u as OpenerValidatorContributions};
