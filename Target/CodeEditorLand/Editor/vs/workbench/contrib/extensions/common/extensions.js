var p=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var l=(i,s,t,e)=>{for(var n=e>1?void 0:e?I(s,t):s,o=i.length-1,a;o>=0;o--)(a=i[o])&&(n=(e?a(s,t,n):a(n))||n);return e&&n&&p(s,t,n),n},d=(i,s)=>(t,e)=>s(t,e,i);import{createDecorator as c}from"../../../../platform/instantiation/common/instantiation.js";import"../../../../base/common/event.js";import"../../../../base/common/paging.js";import"../../../../platform/extensionManagement/common/extensionManagement.js";import"../../../services/extensionManagement/common/extensionManagement.js";import"../../../../base/common/cancellation.js";import{Disposable as E}from"../../../../base/common/lifecycle.js";import{areSameExtensions as u}from"../../../../platform/extensionManagement/common/extensionManagementUtil.js";import"../../../../platform/extensions/common/extensions.js";import"../../../../base/common/uri.js";import"../../../common/views.js";import{RawContextKey as x}from"../../../../platform/contextkey/common/contextkey.js";import"../../../services/extensions/common/extensions.js";import"./extensionsInput.js";import{MenuId as g}from"../../../../platform/actions/common/actions.js";import"../../../../platform/progress/common/progress.js";const le="workbench.view.extensions";var m=(n=>(n[n.Installing=0]="Installing",n[n.Installed=1]="Installed",n[n.Uninstalling=2]="Uninstalling",n[n.Uninstalled=3]="Uninstalled",n))(m||{}),y=(o=>(o.ReloadWindow="reloadWindow",o.RestartExtensions="restartExtensions",o.DownloadUpdate="downloadUpdate",o.ApplyUpdate="applyUpdate",o.QuitAndInstall="quitAndInstall",o))(y||{});const f=c("extensionsWorkbenchService");var b=(o=>(o.Readme="readme",o.Features="features",o.Changelog="changelog",o.Dependencies="dependencies",o.ExtensionPack="extensionPack",o))(b||{});const de="extensions",xe="extensions.autoUpdate",pe="extensions.autoCheckUpdates",Ie="extensions.closeExtensionDetailsOnViewChange",ce="extensions.autoRestart";let r=class extends E{constructor(t,e){super();this.containers=t;this._register(e.onChange(this.update,this))}set extension(t){this.containers.forEach(e=>e.extension=t)}update(t){for(const e of this.containers)t&&e.extension?u(e.extension.identifier,t.identifier)&&(e.extension.server&&t.server&&e.extension.server!==t.server?e.updateWhenCounterExtensionChanges&&e.update():e.extension=t):e.update()}};r=l([d(1,f)],r);const Ee="workbench.views.extensions.workspaceRecommendations",ue="workbench.views.extensions.searchOutdated",ge="workbench.extensions.action.toggleIgnoreExtension",me="workbench.extensions.action.installVSIX",ye="workbench.extensions.command.installFromVSIX",fe="workbench.extensions.action.listWorkspaceUnsupportedExtensions",be=new x("hasOutdatedExtensions",!1),Pe=new x("hasGallery",!1),he="_theme_",ve="0_install",Ce="0_update",Oe=new g("extensionsSearchActionsMenu");export{pe as AutoCheckUpdatesConfigurationKey,ce as AutoRestartConfigurationKey,xe as AutoUpdateConfigurationKey,Pe as CONTEXT_HAS_GALLERY,Ie as CloseExtensionDetailsOnViewChangeKey,de as ConfigurationKey,r as ExtensionContainers,b as ExtensionEditorTab,y as ExtensionRuntimeActionType,m as ExtensionState,be as HasOutdatedExtensionsContext,f as IExtensionsWorkbenchService,ve as INSTALL_ACTIONS_GROUP,ye as INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID,fe as LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID,ue as OUTDATED_EXTENSIONS_VIEW_ID,me as SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID,he as THEME_ACTIONS_GROUP,ge as TOGGLE_IGNORE_EXTENSION_ACTION_ID,Ce as UPDATE_ACTIONS_GROUP,le as VIEWLET_ID,Ee as WORKSPACE_RECOMMENDATIONS_VIEW_ID,Oe as extensionsSearchActionsMenu};
