var x=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var l=(a,t,e,n)=>{for(var r=n>1?void 0:n?P(t,e):t,s=a.length-1,i;s>=0;s--)(i=a[s])&&(r=(n?i(t,e,r):i(r))||r);return n&&r&&x(t,e,r),r},u=(a,t)=>(e,n)=>t(e,n,a);import"../../../../../vs/base/common/jsonSchema.js";import{Disposable as m}from"../../../../../vs/base/common/lifecycle.js";import{isFalsyOrWhitespace as p}from"../../../../../vs/base/common/strings.js";import{localize as o}from"../../../../../vs/nls.js";import{MenuId as v,MenuRegistry as f,registerAction2 as g}from"../../../../../vs/platform/actions/common/actions.js";import{CommandsRegistry as _}from"../../../../../vs/platform/commands/common/commands.js";import{ContextKeyExpr as I}from"../../../../../vs/platform/contextkey/common/contextkey.js";import"../../../../../vs/platform/extensions/common/extensions.js";import{SyncDescriptor as E}from"../../../../../vs/platform/instantiation/common/descriptors.js";import{Registry as y}from"../../../../../vs/platform/registry/common/platform.js";import{registerWorkbenchContribution2 as A,WorkbenchPhase as S}from"../../../../../vs/workbench/common/contributions.js";import{SignOutOfAccountAction as D}from"../../../../../vs/workbench/contrib/authentication/browser/actions/signOutOfAccountAction.js";import{IAuthenticationService as R}from"../../../../../vs/workbench/services/authentication/common/authentication.js";import{IBrowserWorkbenchEnvironmentService as b}from"../../../../../vs/workbench/services/environment/browser/environmentService.js";import{Extensions as M}from"../../../../../vs/workbench/services/extensionManagement/common/extensionFeatures.js";import{ExtensionsRegistry as C}from"../../../../../vs/workbench/services/extensions/common/extensionsRegistry.js";import{ManageTrustedExtensionsForAccountAction as k}from"./actions/manageTrustedExtensionsForAccountAction.js";const w=_.registerCommand("workbench.getCodeExchangeProxyEndpoints",function(a,t){return a.get(b).options?.codeExchangeProxyEndpoints}),F={type:"object",additionalProperties:!1,properties:{id:{type:"string",description:o("authentication.id","The id of the authentication provider.")},label:{type:"string",description:o("authentication.label","The human readable name of the authentication provider.")}}},T=C.registerExtensionPoint({extensionPoint:"authentication",jsonSchema:{description:o({key:"authenticationExtensionPoint",comment:["'Contributes' means adds here"]},"Contributes authentication"),type:"array",items:F},activationEventsGenerator:(a,t)=>{for(const e of a)e.id&&t.push(`onAuthenticationRequest:${e.id}`)}});class W extends m{type="table";shouldRender(t){return!!t.contributes?.authentication}render(t){const e=t.contributes?.authentication||[];if(!e.length)return{data:{headers:[],rows:[]},dispose:()=>{}};const n=[o("authenticationlabel","Label"),o("authenticationid","ID")],r=e.sort((s,i)=>s.label.localeCompare(i.label)).map(s=>[s.label,s.id]);return{data:{headers:n,rows:r},dispose:()=>{}}}}const H=y.as(M.ExtensionFeaturesRegistry).registerExtensionFeature({id:"authentication",label:o("authentication","Authentication"),access:{canToggle:!1},renderer:new E(W)});let d=class extends m{constructor(e,n){super();this._authenticationService=e;this._environmentService=n;this._register(w),this._register(H),e.getProviderIds().length&&this._clearPlaceholderMenuItem(),this._registerHandlers(),this._registerAuthenticationExtentionPointHandler(),this._registerEnvContributedAuthenticationProviders(),this._registerActions()}static ID="workbench.contrib.authentication";_placeholderMenuItem=f.appendMenuItem(v.AccountsContext,{command:{id:"noAuthenticationProviders",title:o("authentication.Placeholder","No accounts requested yet..."),precondition:I.false()}});_registerAuthenticationExtentionPointHandler(){T.setHandler((e,{added:n,removed:r})=>{n.forEach(i=>{for(const c of i.value){if(p(c.id)){i.collector.error(o("authentication.missingId","An authentication contribution must specify an id."));continue}if(p(c.label)){i.collector.error(o("authentication.missingLabel","An authentication contribution must specify a label."));continue}this._authenticationService.declaredProviders.some(h=>h.id===c.id)?i.collector.error(o("authentication.idConflict","This authentication id '{0}' has already been registered",c.id)):this._authenticationService.registerDeclaredAuthenticationProvider(c)}}),r.flatMap(i=>i.value).forEach(i=>{const c=this._authenticationService.declaredProviders.find(h=>h.id===i.id);c&&this._authenticationService.unregisterDeclaredAuthenticationProvider(c.id)})})}_registerEnvContributedAuthenticationProviders(){if(this._environmentService.options?.authenticationProviders?.length)for(const e of this._environmentService.options.authenticationProviders)this._authenticationService.registerAuthenticationProvider(e.id,e)}_registerHandlers(){this._register(this._authenticationService.onDidRegisterAuthenticationProvider(e=>{this._clearPlaceholderMenuItem()})),this._register(this._authenticationService.onDidUnregisterAuthenticationProvider(e=>{this._authenticationService.getProviderIds().length||(this._placeholderMenuItem=f.appendMenuItem(v.AccountsContext,{command:{id:"noAuthenticationProviders",title:o("loading","Loading..."),precondition:I.false()}}))}))}_registerActions(){this._register(g(D)),this._register(g(k))}_clearPlaceholderMenuItem(){this._placeholderMenuItem?.dispose(),this._placeholderMenuItem=void 0}};d=l([u(0,R),u(1,b)],d),A(d.ID,d,S.AfterRestored);export{d as AuthenticationContribution};
