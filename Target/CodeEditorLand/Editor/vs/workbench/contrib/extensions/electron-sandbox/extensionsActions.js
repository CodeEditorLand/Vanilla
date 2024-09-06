import{Schemas as a}from"../../../../../vs/base/common/network.js";import{URI as p}from"../../../../../vs/base/common/uri.js";import{localize2 as i}from"../../../../../vs/nls.js";import{Categories as v}from"../../../../../vs/platform/action/common/actionCommonCategories.js";import{Action2 as s}from"../../../../../vs/platform/actions/common/actions.js";import{ExtensionsLocalizedLabel as x,IExtensionManagementService as d}from"../../../../../vs/platform/extensionManagement/common/extensionManagement.js";import{IFileService as f}from"../../../../../vs/platform/files/common/files.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{INativeHostService as S}from"../../../../../vs/platform/native/common/native.js";import{INativeWorkbenchEnvironmentService as h}from"../../../../../vs/workbench/services/environment/electron-sandbox/environmentService.js";class k extends s{constructor(){super({id:"workbench.extensions.action.openExtensionsFolder",title:i("openExtensionsFolder","Open Extensions Folder"),category:x,f1:!0})}async run(e){const t=e.get(S),l=e.get(f),m=e.get(h),r=p.file(m.extensionsPath),n=await l.resolve(r);let o;if(n.children&&n.children.length>0?o=n.children[0].resource:o=r,o.scheme===a.file)return t.showItemInFolder(o.fsPath)}}class C extends s{constructor(){super({id:"_workbench.extensions.action.cleanUpExtensionsFolder",title:i("cleanUpExtensionsFolder","Cleanup Extensions Folder"),category:v.Developer,f1:!0})}async run(e){return e.get(d).cleanUp()}}export{C as CleanUpExtensionsFolderAction,k as OpenExtensionsFolderAction};