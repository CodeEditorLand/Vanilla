import{CancellationToken as S}from"../../../base/common/cancellation.js";import{mnemonicButtonLabel as A}from"../../../base/common/labels.js";import{Schemas as R}from"../../../base/common/network.js";import{dirname as b}from"../../../base/common/resources.js";import{URI as l}from"../../../base/common/uri.js";import{ILanguageService as F}from"../../../editor/common/languages/language.js";import{getIconClasses as C}from"../../../editor/common/services/getIconClasses.js";import{IModelService as P}from"../../../editor/common/services/model.js";import{localize as u,localize2 as N}from"../../../nls.js";import{CommandsRegistry as i,ICommandService as O}from"../../../platform/commands/common/commands.js";import{IFileDialogService as p}from"../../../platform/dialogs/common/dialogs.js";import{FileKind as _}from"../../../platform/files/common/files.js";import{ILabelService as D}from"../../../platform/label/common/label.js";import{IQuickInputService as U}from"../../../platform/quickinput/common/quickInput.js";import{IWorkspaceContextService as I,hasWorkspaceFileExtension as L}from"../../../platform/workspace/common/workspace.js";import{IWorkspacesService as f}from"../../../platform/workspaces/common/workspaces.js";import{IPathService as E}from"../../services/path/common/pathService.js";import{IWorkspaceEditingService as W}from"../../services/workspaces/common/workspaceEditing.js";const T="addRootFolder",ie=N("addFolderToWorkspace","Add Folder to Workspace..."),x="setRootFolder",j="_workbench.pickWorkspaceFolder";i.registerCommand({id:"workbench.action.files.openFileFolderInNewWindow",handler:e=>e.get(p).pickFileFolderAndOpen({forceNewWindow:!0})}),i.registerCommand({id:"_files.pickFolderAndOpen",handler:(e,o)=>e.get(p).pickFolderAndOpen(o)}),i.registerCommand({id:"workbench.action.files.openFolderInNewWindow",handler:e=>e.get(p).pickFolderAndOpen({forceNewWindow:!0})}),i.registerCommand({id:"workbench.action.files.openFileInNewWindow",handler:e=>e.get(p).pickFileAndOpen({forceNewWindow:!0})}),i.registerCommand({id:"workbench.action.openWorkspaceInNewWindow",handler:e=>e.get(p).pickWorkspaceAndOpen({forceNewWindow:!0})}),i.registerCommand({id:T,handler:async e=>{const o=e.get(W),n=await y(e);!n||!n.length||await o.addFolders(n.map(t=>({uri:t})))}}),i.registerCommand({id:x,handler:async e=>{const o=e.get(W),n=e.get(I),t=await y(e);!t||!t.length||await o.updateFolders(0,n.getWorkspace().folders.length,t.map(r=>({uri:r})))}});async function y(e){const o=e.get(p),n=e.get(E);return await o.showOpenDialog({openLabel:A(u({key:"add",comment:["&& denotes a mnemonic"]},"&&Add")),title:u("addFolderToWorkspaceTitle","Add Folder to Workspace"),canSelectFolders:!0,canSelectMany:!0,defaultUri:await o.defaultFolderPath(),availableFileSystems:[n.defaultUriScheme]})}i.registerCommand(j,async(e,o)=>{const n=e.get(U),t=e.get(D),r=e.get(I),d=e.get(P),c=e.get(F),s=r.getWorkspace().folders;if(!s.length)return;const w=s.map(m=>{const h=m.name,g=t.getUriLabel(b(m.uri),{relative:!0});return{label:h,description:g!==h?g:void 0,folder:m,iconClasses:C(d,c,m.uri,_.ROOT_FOLDER)}}),a=(o?o[0]:void 0)||Object.create(null);a.activeItem||(a.activeItem=w[0]),a.placeHolder||(a.placeHolder=u("workspaceFolderPickerPlaceholder","Select workspace folder")),typeof a.matchOnDescription!="boolean"&&(a.matchOnDescription=!0);const v=(o?o[1]:void 0)||S.None,k=await n.pick(w,a,v);if(k)return s[w.indexOf(k)]}),i.registerCommand({id:"vscode.openFolder",handler:(e,o,n)=>{const t=e.get(O);if(typeof n=="boolean"&&(n={forceNewWindow:n}),!o){const s={forceNewWindow:n?.forceNewWindow};return n?.forceLocalWindow&&(s.remoteAuthority=null,s.availableFileSystems=["file"]),t.executeCommand("_files.pickFolderAndOpen",s)}const r=l.from(o,!0),d={forceNewWindow:n?.forceNewWindow,forceReuseWindow:n?.forceReuseWindow,noRecentEntry:n?.noRecentEntry,remoteAuthority:n?.forceLocalWindow?null:void 0,forceProfile:n?.forceProfile,forceTempProfile:n?.forceTempProfile},c=L(r)||r.scheme===R.untitled?{workspaceUri:r}:{folderUri:r};return t.executeCommand("_files.windowOpen",[c],d)},metadata:{description:"Open a folder or workspace in the current window or new window depending on the newWindow argument. Note that opening in the same window will shutdown the current extension host process and start a new one on the given folder/workspace unless the newWindow parameter is set to true.",args:[{name:"uri",description:"(optional) Uri of the folder or workspace file to open. If not provided, a native dialog will ask the user for the folder",constraint:e=>e==null||e instanceof l},{name:"options",description:"(optional) Options. Object with the following properties: `forceNewWindow`: Whether to open the folder/workspace in a new window or the same. Defaults to opening in the same window. `forceReuseWindow`: Whether to force opening the folder/workspace in the same window.  Defaults to false. `noRecentEntry`: Whether the opened URI will appear in the 'Open Recent' list. Defaults to false. Note, for backward compatibility, options can also be of type boolean, representing the `forceNewWindow` setting.",constraint:e=>e===void 0||typeof e=="object"||typeof e=="boolean"}]}}),i.registerCommand({id:"vscode.newWindow",handler:(e,o)=>{const n=e.get(O),t={forceReuseWindow:o&&o.reuseWindow,remoteAuthority:o&&o.remoteAuthority};return n.executeCommand("_files.newWindow",t)},metadata:{description:"Opens an new window depending on the newWindow argument.",args:[{name:"options",description:"(optional) Options. Object with the following properties: `reuseWindow`: Whether to open a new window or the same. Defaults to opening in a new window. ",constraint:e=>e===void 0||typeof e=="object"}]}}),i.registerCommand("_workbench.removeFromRecentlyOpened",(e,o)=>e.get(f).removeRecentlyOpened([o])),i.registerCommand({id:"vscode.removeFromRecentlyOpened",handler:(e,o)=>{const n=e.get(f);return typeof o=="string"?o=o.match(/^[^:/?#]+:\/\//)?l.parse(o):l.file(o):o=l.revive(o),n.removeRecentlyOpened([o])},metadata:{description:"Removes an entry with the given path from the recently opened list.",args:[{name:"path",description:"URI or URI string to remove from recently opened.",constraint:e=>typeof e=="string"||e instanceof l}]}}),i.registerCommand("_workbench.addToRecentlyOpened",async(e,o)=>{const n=e.get(f),t=o.uri,r=o.label,d=o.remoteAuthority;let c;return o.type==="workspace"?c={workspace:await n.getWorkspaceIdentifier(t),label:r,remoteAuthority:d}:o.type==="folder"?c={folderUri:t,label:r,remoteAuthority:d}:c={fileUri:t,label:r,remoteAuthority:d},n.addRecentlyOpened([c])}),i.registerCommand("_workbench.getRecentlyOpened",async e=>e.get(f).getRecentlyOpened());export{T as ADD_ROOT_FOLDER_COMMAND_ID,ie as ADD_ROOT_FOLDER_LABEL,j as PICK_WORKSPACE_FOLDER_COMMAND_ID,x as SET_ROOT_FOLDER_COMMAND_ID};
