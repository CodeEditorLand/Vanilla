import{localize2 as r}from"../../../nls.js";import{INativeHostService as m}from"../../../platform/native/common/native.js";import{IEditorService as g}from"../../services/editor/common/editorService.js";import{Action2 as t,MenuId as p}from"../../../platform/actions/common/actions.js";import{Categories as i}from"../../../platform/action/common/actionCommonCategories.js";import"../../../platform/instantiation/common/instantiation.js";import{IWorkbenchEnvironmentService as f}from"../../services/environment/common/environmentService.js";import{KeybindingWeight as h}from"../../../platform/keybinding/common/keybindingsRegistry.js";import{IsDevelopmentContext as D}from"../../../platform/contextkey/common/contextkeys.js";import{KeyCode as u,KeyMod as n}from"../../../base/common/keyCodes.js";import{IFileService as S}from"../../../platform/files/common/files.js";import{INativeWorkbenchEnvironmentService as b}from"../../services/environment/electron-sandbox/environmentService.js";import{URI as w}from"../../../base/common/uri.js";import{getActiveWindow as y}from"../../../base/browser/dom.js";class N extends t{constructor(){super({id:"workbench.action.toggleDevTools",title:r("toggleDevTools","Toggle Developer Tools"),category:i.Developer,f1:!0,keybinding:{weight:h.WorkbenchContrib+50,when:D,primary:n.CtrlCmd|n.Shift|u.KeyI,mac:{primary:n.CtrlCmd|n.Alt|u.KeyI}},menu:{id:p.MenubarHelpMenu,group:"5_tools",order:1}})}async run(e){return e.get(m).toggleDevTools({targetWindowId:y().vscodeWindowId})}}class O extends t{constructor(){super({id:"workbench.action.configureRuntimeArguments",title:r("configureRuntimeArguments","Configure Runtime Arguments"),category:i.Preferences,f1:!0})}async run(e){const o=e.get(g),c=e.get(f);await o.openEditor({resource:c.argvResource,options:{pinned:!0}})}}class z extends t{constructor(){super({id:"workbench.action.reloadWindowWithExtensionsDisabled",title:r("reloadWindowWithExtensionsDisabled","Reload With Extensions Disabled"),category:i.Developer,f1:!0})}async run(e){return e.get(m).reload({disableExtensions:!0})}}class _ extends t{constructor(){super({id:"workbench.action.openUserDataFolder",title:r("openUserDataFolder","Open User Data Folder"),category:i.Developer,f1:!0})}async run(e){const o=e.get(m),c=e.get(S),v=e.get(b),d=w.file(v.userDataPath),l=await c.resolve(d);let a;return l.children&&l.children.length>0?a=l.children[0].resource:a=d,o.showItemInFolder(a.fsPath)}}export{O as ConfigureRuntimeArgumentsAction,_ as OpenUserDataFolderAction,z as ReloadWindowWithExtensionsDisabledAction,N as ToggleDevToolsAction};
