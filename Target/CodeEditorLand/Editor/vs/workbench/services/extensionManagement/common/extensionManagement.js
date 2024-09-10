import"../../../../base/common/event.js";import{createDecorator as o,refineServiceDecorator as t}from"../../../../platform/instantiation/common/instantiation.js";import"../../../../platform/extensions/common/extensions.js";import{IExtensionManagementService as i}from"../../../../platform/extensionManagement/common/extensionManagement.js";import"../../../../base/common/uri.js";import{FileAccess as s}from"../../../../base/common/network.js";import{localize as a}from"../../../../nls.js";const r=t(i);var l=(n=>(n[n.Local=1]="Local",n[n.Remote=2]="Remote",n[n.Web=3]="Web",n))(l||{});const k=o("extensionManagementServerService"),O=s.asBrowserUri("vs/workbench/services/extensionManagement/common/media/defaultIcon.png").toString(!0),B=t(r),C={id:"extensions",order:30,title:a("extensionsConfigurationTitle","Extensions"),type:"object"};var x=(e=>(e[e.DisabledByTrustRequirement=0]="DisabledByTrustRequirement",e[e.DisabledByExtensionKind=1]="DisabledByExtensionKind",e[e.DisabledByEnvironment=2]="DisabledByEnvironment",e[e.EnabledByEnvironment=3]="EnabledByEnvironment",e[e.DisabledByVirtualWorkspace=4]="DisabledByVirtualWorkspace",e[e.DisabledByInvalidExtension=5]="DisabledByInvalidExtension",e[e.DisabledByExtensionDependency=6]="DisabledByExtensionDependency",e[e.DisabledGlobally=7]="DisabledGlobally",e[e.DisabledWorkspace=8]="DisabledWorkspace",e[e.EnabledGlobally=9]="EnabledGlobally",e[e.EnabledWorkspace=10]="EnabledWorkspace",e))(x||{});const w=o("extensionEnablementService"),G=o("IWebExtensionsScannerService");export{O as DefaultIconPath,x as EnablementState,l as ExtensionInstallLocation,k as IExtensionManagementServerService,r as IProfileAwareExtensionManagementService,G as IWebExtensionsScannerService,w as IWorkbenchExtensionEnablementService,B as IWorkbenchExtensionManagementService,C as extensionsConfigurationNodeBase};
