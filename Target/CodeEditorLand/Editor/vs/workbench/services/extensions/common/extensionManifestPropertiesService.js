var g=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var f=(u,s,e,t)=>{for(var n=t>1?void 0:t?k(s,e):s,i=u.length-1,o;i>=0;i--)(o=u[i])&&(n=(t?o(s,e,n):o(n))||n);return t&&n&&g(s,e,n),n},d=(u,s)=>(e,t)=>s(e,t,u);import{IConfigurationService as K}from"../../../../platform/configuration/common/configuration.js";import{ALL_EXTENSION_KINDS as W,ExtensionIdentifierMap as a}from"../../../../platform/extensions/common/extensions.js";import{ExtensionsRegistry as h}from"./extensionsRegistry.js";import{getGalleryExtensionId as r}from"../../../../platform/extensionManagement/common/extensionManagementUtil.js";import{isNonEmptyArray as E}from"../../../../base/common/arrays.js";import{IProductService as S}from"../../../../platform/product/common/productService.js";import{createDecorator as M}from"../../../../platform/instantiation/common/instantiation.js";import{InstantiationType as b,registerSingleton as I}from"../../../../platform/instantiation/common/extensions.js";import{Disposable as v}from"../../../../base/common/lifecycle.js";import{WORKSPACE_TRUST_EXTENSION_SUPPORT as y}from"../../workspaces/common/workspaceTrust.js";import{isBoolean as l}from"../../../../base/common/types.js";import{IWorkspaceTrustEnablementService as m}from"../../../../platform/workspace/common/workspaceTrust.js";import{ILogService as T}from"../../../../platform/log/common/log.js";import{isWeb as x}from"../../../../base/common/platform.js";const w=M("extensionManifestPropertiesService");let c=class extends v{constructor(e,t,n,i){super();this.productService=e;this.configurationService=t;this.workspaceTrustEnablementService=n;this.logService=i;this._configuredExtensionWorkspaceTrustRequestMap=new a;const o=t.inspect(y).userValue||{};for(const p of Object.keys(o))this._configuredExtensionWorkspaceTrustRequestMap.set(p,o[p]);if(this._productExtensionWorkspaceTrustRequestMap=new Map,e.extensionUntrustedWorkspaceSupport)for(const p of Object.keys(e.extensionUntrustedWorkspaceSupport))this._productExtensionWorkspaceTrustRequestMap.set(p,e.extensionUntrustedWorkspaceSupport[p])}_serviceBrand;_extensionPointExtensionKindsMap=null;_productExtensionKindsMap=null;_configuredExtensionKindsMap=null;_productVirtualWorkspaceSupportMap=null;_configuredVirtualWorkspaceSupportMap=null;_configuredExtensionWorkspaceTrustRequestMap;_productExtensionWorkspaceTrustRequestMap;prefersExecuteOnUI(e){const t=this.getExtensionKind(e);return t.length>0&&t[0]==="ui"}prefersExecuteOnWorkspace(e){const t=this.getExtensionKind(e);return t.length>0&&t[0]==="workspace"}prefersExecuteOnWeb(e){const t=this.getExtensionKind(e);return t.length>0&&t[0]==="web"}canExecuteOnUI(e){return this.getExtensionKind(e).some(n=>n==="ui")}canExecuteOnWorkspace(e){return this.getExtensionKind(e).some(n=>n==="workspace")}canExecuteOnWeb(e){return this.getExtensionKind(e).some(n=>n==="web")}getExtensionKind(e){const t=this.deduceExtensionKind(e),n=this.getConfiguredExtensionKind(e);if(n&&n.length>0){const i=[];for(const o of n)o!=="-web"&&i.push(o);return n.includes("-web")&&!i.length&&(i.push("ui"),i.push("workspace")),x&&!n.includes("-web")&&!n.includes("web")&&t.includes("web")&&i.push("web"),i}return t}getUserConfiguredExtensionKind(e){if(this._configuredExtensionKindsMap===null){const n=new a,i=this.configurationService.getValue("remote.extensionKind")||{};for(const o of Object.keys(i))n.set(o,i[o]);this._configuredExtensionKindsMap=n}const t=this._configuredExtensionKindsMap.get(e.id);return t?this.toArray(t):void 0}getExtensionUntrustedWorkspaceSupportType(e){if(!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()||!e.main)return!0;const t=this.getConfiguredExtensionWorkspaceTrustRequest(e),n=this.getProductExtensionWorkspaceTrustRequest(e);return t!==void 0?t:n?.override!==void 0?n.override:e.capabilities?.untrustedWorkspaces?.supported!==void 0?e.capabilities.untrustedWorkspaces.supported:n?.default!==void 0?n.default:!1}getExtensionVirtualWorkspaceSupportType(e){const t=this.getConfiguredVirtualWorkspaceSupport(e);if(t!==void 0)return t;const n=this.getProductVirtualWorkspaceSupport(e);if(n?.override!==void 0)return n.override;const i=e.capabilities?.virtualWorkspaces;if(l(i))return i;if(i){const o=i.supported;if(l(o)||o==="limited")return o}return n?.default!==void 0?n.default:!0}deduceExtensionKind(e){if(e.main)return e.browser?x?["workspace","web"]:["workspace"]:["workspace"];if(e.browser)return["web"];let t=[...W];if((E(e.extensionPack)||E(e.extensionDependencies))&&(t=x?["workspace","web"]:["workspace"]),e.contributes)for(const n of Object.keys(e.contributes)){const i=this.getSupportedExtensionKindsForExtensionPoint(n);i.length&&(t=t.filter(o=>i.includes(o)))}return t.length||this.logService.warn("Cannot deduce extensionKind for extension",r(e.publisher,e.name)),t}getSupportedExtensionKindsForExtensionPoint(e){if(this._extensionPointExtensionKindsMap===null){const n=new Map;h.getExtensionPoints().forEach(i=>n.set(i.name,i.defaultExtensionKind||[])),this._extensionPointExtensionKindsMap=n}let t=this._extensionPointExtensionKindsMap.get(e);return t||(t=this.productService.extensionPointExtensionKind?this.productService.extensionPointExtensionKind[e]:void 0,t)?t:x?["workspace","web"]:["workspace"]}getConfiguredExtensionKind(e){const t={id:r(e.publisher,e.name)};let n=this.getUserConfiguredExtensionKind(t);return typeof n<"u"?this.toArray(n):(n=this.getProductExtensionKind(e),typeof n<"u"?n:(n=e.extensionKind,typeof n<"u"?(n=this.toArray(n),n.filter(i=>["ui","workspace"].includes(i))):null))}getProductExtensionKind(e){if(this._productExtensionKindsMap===null){const n=new a;if(this.productService.extensionKind)for(const i of Object.keys(this.productService.extensionKind))n.set(i,this.productService.extensionKind[i]);this._productExtensionKindsMap=n}const t=r(e.publisher,e.name);return this._productExtensionKindsMap.get(t)}getProductVirtualWorkspaceSupport(e){if(this._productVirtualWorkspaceSupportMap===null){const n=new a;if(this.productService.extensionVirtualWorkspacesSupport)for(const i of Object.keys(this.productService.extensionVirtualWorkspacesSupport))n.set(i,this.productService.extensionVirtualWorkspacesSupport[i]);this._productVirtualWorkspaceSupportMap=n}const t=r(e.publisher,e.name);return this._productVirtualWorkspaceSupportMap.get(t)}getConfiguredVirtualWorkspaceSupport(e){if(this._configuredVirtualWorkspaceSupportMap===null){const n=new a,i=this.configurationService.getValue("extensions.supportVirtualWorkspaces")||{};for(const o of Object.keys(i))i[o]!==void 0&&n.set(o,i[o]);this._configuredVirtualWorkspaceSupportMap=n}const t=r(e.publisher,e.name);return this._configuredVirtualWorkspaceSupportMap.get(t)}getConfiguredExtensionWorkspaceTrustRequest(e){const t=r(e.publisher,e.name),n=this._configuredExtensionWorkspaceTrustRequestMap.get(t);if(n&&(n.version===void 0||n.version===e.version))return n.supported}getProductExtensionWorkspaceTrustRequest(e){const t=r(e.publisher,e.name);return this._productExtensionWorkspaceTrustRequestMap.get(t)}toArray(e){return Array.isArray(e)?e:e==="ui"?["ui","workspace"]:[e]}};c=f([d(0,S),d(1,K),d(2,m),d(3,T)],c),I(w,c,b.Delayed);export{c as ExtensionManifestPropertiesService,w as IExtensionManifestPropertiesService};
