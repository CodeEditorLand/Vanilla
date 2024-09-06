import{Codicon as q}from"../../../../../vs/base/common/codicons.js";import{KeyCode as a,KeyMod as g}from"../../../../../vs/base/common/keyCodes.js";import{Schemas as y}from"../../../../../vs/base/common/network.js";import"../../../../../vs/base/common/themables.js";import*as n from"../../../../../vs/nls.js";import"../../../../../vs/platform/action/common/action.js";import{Categories as d}from"../../../../../vs/platform/action/common/actionCommonCategories.js";import{MenuId as o,MenuRegistry as t,registerAction2 as c}from"../../../../../vs/platform/actions/common/actions.js";import{CommandsRegistry as F}from"../../../../../vs/platform/commands/common/commands.js";import{ContextKeyExpr as e}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IsWebContext as R}from"../../../../../vs/platform/contextkey/common/contextkeys.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{KeybindingsRegistry as u,KeybindingWeight as E}from"../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{WorkbenchListDoubleSelection as I}from"../../../../../vs/platform/list/browser/listService.js";import{ADD_ROOT_FOLDER_COMMAND_ID as Me,ADD_ROOT_FOLDER_LABEL as Ae}from"../../../../../vs/workbench/browser/actions/workspaceCommands.js";import{CLOSE_EDITOR_COMMAND_ID as X,CLOSE_EDITORS_IN_GROUP_COMMAND_ID as he,CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID as Oe,CLOSE_SAVED_EDITORS_COMMAND_ID as xe,REOPEN_WITH_COMMAND_ID as ye}from"../../../../../vs/workbench/browser/parts/editor/editorCommands.js";import{ActiveEditorAvailableEditorIdsContext as Fe,ActiveEditorCanRevertContext as Re,ActiveEditorContext as w,DirtyWorkingCopiesContext as Y,EnterMultiRootWorkspaceSupportContext as $,HasWebFileSystemAccess as Se,MultipleEditorsSelectedInGroupContext as De,ResourceContextKey as r,SelectedEditorsInGroupFileOrUntitledResourceContextKey as ve,SidebarFocusContext as S,TwoEditorsSelectedInGroupContext as Ne,WorkbenchStateContext as j,WorkspaceFolderCountContext as L}from"../../../../../vs/workbench/common/contextkeys.js";import{acceptLocalChangesCommand as we,CONFLICT_RESOLUTION_CONTEXT as Le,revertLocalChangesCommand as Te}from"../../../../../vs/workbench/contrib/files/browser/editors/textFileSaveErrorHandler.js";import{CompareNewUntitledTextFilesAction as fe,CompareWithClipboardAction as be,COPY_FILE_LABEL as We,copyFileHandler as ze,cutFileHandler as ke,deleteFileHandler as J,DOWNLOAD_COMMAND_ID as Pe,DOWNLOAD_LABEL as He,FileCopiedContext as Ke,FocusFilesExplorer as Ve,GlobalCompareResourcesAction as Be,MOVE_FILE_TO_TRASH_LABEL as Ge,moveFileToTrashHandler as Ue,NEW_FILE_COMMAND_ID as Q,NEW_FILE_LABEL as Z,NEW_FOLDER_COMMAND_ID as ee,NEW_FOLDER_LABEL as oe,OpenActiveFileInEmptyWorkspace as qe,openFilePreserveFocusHandler as Xe,PASTE_FILE_LABEL as Ye,pasteFileHandler as $e,renameHandler as je,ResetActiveEditorReadonlyInSession as Je,SetActiveEditorReadonlyInSession as Qe,SetActiveEditorWriteableInSession as Ze,ShowActiveFileInExplorer as eo,ToggleActiveEditorReadonlyInSession as oo,ToggleAutoSaveAction as te,TRIGGER_RENAME_LABEL as to,UPLOAD_COMMAND_ID as no,UPLOAD_LABEL as ro}from"../../../../../vs/workbench/contrib/files/browser/fileActions.js";import{newWindowCommand as io,openWindowCommand as ao}from"../../../../../vs/workbench/contrib/files/browser/fileCommands.js";import{COMPARE_RESOURCE_COMMAND_ID as lo,COMPARE_SELECTED_COMMAND_ID as po,COMPARE_WITH_SAVED_COMMAND_ID as ne,COPY_PATH_COMMAND_ID as T,COPY_RELATIVE_PATH_COMMAND_ID as f,NEW_UNTITLED_FILE_COMMAND_ID as b,NEW_UNTITLED_FILE_LABEL as mo,OPEN_TO_SIDE_COMMAND_ID as co,OPEN_WITH_EXPLORER_COMMAND_ID as so,OpenEditorsDirtyEditorContext as W,OpenEditorsGroupContext as A,OpenEditorsReadonlyEditorContext as re,OpenEditorsSelectedFileOrUntitledContext as uo,REMOVE_ROOT_FOLDER_COMMAND_ID as Eo,REMOVE_ROOT_FOLDER_LABEL as Co,ResourceSelectedForCompareContext as ie,REVEAL_IN_EXPLORER_COMMAND_ID as _o,REVERT_FILE_COMMAND_ID as z,SAVE_ALL_COMMAND_ID as go,SAVE_ALL_IN_GROUP_COMMAND_ID as ae,SAVE_FILE_AS_COMMAND_ID as de,SAVE_FILE_AS_LABEL as Io,SAVE_FILE_COMMAND_ID as k,SAVE_FILE_LABEL as le,SAVE_FILE_WITHOUT_FORMATTING_COMMAND_ID as Mo,SAVE_FILE_WITHOUT_FORMATTING_LABEL as Ao,SAVE_FILES_COMMAND_ID as ho,SELECT_FOR_COMPARE_COMMAND_ID as Oo}from"../../../../../vs/workbench/contrib/files/browser/fileConstants.js";import{IExplorerService as xo}from"../../../../../vs/workbench/contrib/files/browser/files.js";import{ExplorerFolderContext as l,ExplorerResourceAvailableEditorIdsContext as yo,ExplorerResourceCut as Fo,ExplorerResourceMoveableToTrash as D,ExplorerResourceNotReadonlyContext as i,ExplorerRootContext as s,FilesExplorerFocusCondition as C,FoldersViewVisibleContext as v}from"../../../../../vs/workbench/contrib/files/common/files.js";import{AutoSaveAfterShortDelayContext as P}from"../../../../../vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";c(Be),c(Ve),c(eo),c(be),c(fe),c(te),c(qe),c(Qe),c(Ze),c(oo),c(Je),F.registerCommand("_files.windowOpen",ao),F.registerCommand("_files.newWindow",io);const _=10,pe="renameFile";u.registerCommandAndKeybindingRule({id:pe,weight:E.WorkbenchContrib+_,when:e.and(C,s.toNegated(),i),primary:a.F2,mac:{primary:a.Enter},handler:je});const me="moveFileToTrash";u.registerCommandAndKeybindingRule({id:me,weight:E.WorkbenchContrib+_,when:e.and(C,i,D),primary:a.Delete,mac:{primary:g.CtrlCmd|a.Backspace,secondary:[a.Delete]},handler:Ue});const N="deleteFile";u.registerCommandAndKeybindingRule({id:N,weight:E.WorkbenchContrib+_,when:e.and(C,i),primary:g.Shift|a.Delete,mac:{primary:g.CtrlCmd|g.Alt|a.Backspace},handler:J}),u.registerCommandAndKeybindingRule({id:N,weight:E.WorkbenchContrib+_,when:e.and(C,i,D.toNegated()),primary:a.Delete,mac:{primary:g.CtrlCmd|a.Backspace},handler:J});const ce="filesExplorer.cut";u.registerCommandAndKeybindingRule({id:ce,weight:E.WorkbenchContrib+_,when:e.and(C,s.toNegated(),i),primary:g.CtrlCmd|a.KeyX,handler:ke});const se="filesExplorer.copy";u.registerCommandAndKeybindingRule({id:se,weight:E.WorkbenchContrib+_,when:e.and(C,s.toNegated()),primary:g.CtrlCmd|a.KeyC,handler:ze});const H="filesExplorer.paste";F.registerCommand(H,$e),u.registerKeybindingRule({id:`^${H}`,weight:E.WorkbenchContrib+_,when:e.and(C,i),primary:g.CtrlCmd|a.KeyV}),u.registerCommandAndKeybindingRule({id:"filesExplorer.cancelCut",weight:E.WorkbenchContrib+_,when:e.and(C,Fo),primary:a.Escape,handler:async m=>{await m.get(xo).setToCopy([],!0)}}),u.registerCommandAndKeybindingRule({id:"filesExplorer.openFilePreserveFocus",weight:E.WorkbenchContrib+_,when:e.and(C,l.toNegated()),primary:a.Space,handler:Xe});const K={id:T,title:n.localize("copyPath","Copy Path")},V={id:f,title:n.localize("copyRelativePath","Copy Relative Path")};B(T,K.title,r.IsFileSystemResource,"1_cutcopypaste",!0),B(f,V.title,r.IsFileSystemResource,"1_cutcopypaste",!0),B(_o,n.localize("revealInSideBar","Reveal in Explorer View"),r.IsFileSystemResource,"2_files",!1,1);function B(m,M,h,O,x,ge){const Ie=x!==!0?De.negate():void 0;t.appendMenuItem(o.EditorTitleContext,{command:{id:m,title:M,precondition:Ie},when:h,group:O,order:ge})}ue("workbench.files.action.acceptLocalChanges",n.localize("acceptLocalChanges","Use your changes and overwrite file contents"),q.check,-10,we),ue("workbench.files.action.revertLocalChanges",n.localize("revertLocalChanges","Discard your changes and revert to file contents"),q.discard,-9,Te);function ue(m,M,h,O,x){F.registerCommand(m,x),t.appendMenuItem(o.EditorTitle,{command:{id:m,title:M,icon:h},when:e.equals(Le,!0),group:"navigation",order:O})}function p({id:m,title:M,category:h,metadata:O},x){t.appendMenuItem(o.CommandPalette,{command:{id:m,title:M,category:h,metadata:O},when:x})}p({id:T,title:n.localize2("copyPathOfActive","Copy Path of Active File"),category:d.File}),p({id:f,title:n.localize2("copyRelativePathOfActive","Copy Relative Path of Active File"),category:d.File}),p({id:k,title:le,category:d.File}),p({id:Mo,title:Ao,category:d.File}),p({id:ae,title:n.localize2("saveAllInGroup","Save All in Group"),category:d.File}),p({id:ho,title:n.localize2("saveFiles","Save All Files"),category:d.File}),p({id:z,title:n.localize2("revert","Revert File"),category:d.File}),p({id:ne,title:n.localize2("compareActiveWithSaved","Compare Active File with Saved"),category:d.File,metadata:{description:n.localize2("compareActiveWithSavedMeta","Opens a new diff editor to compare the active file with the version on disk.")}}),p({id:de,title:Io,category:d.File}),p({id:Q,title:Z,category:d.File},L.notEqualsTo("0")),p({id:ee,title:oe,category:d.File,metadata:{description:n.localize2("newFolderDescription","Create a new folder or directory")}},L.notEqualsTo("0")),p({id:b,title:mo,category:d.File});const G=e.or(r.IsFileSystemResource,r.Scheme.isEqualTo(y.untitled)),Ee={id:co,title:n.localize("openToSide","Open to the Side")};t.appendMenuItem(o.OpenEditorsContext,{group:"navigation",order:10,command:Ee,when:G}),t.appendMenuItem(o.OpenEditorsContext,{group:"1_open",order:10,command:{id:ye,title:n.localize("reopenWith","Reopen Editor With...")},when:e.and(Fe,A.toNegated())}),t.appendMenuItem(o.OpenEditorsContext,{group:"1_cutcopypaste",order:10,command:K,when:r.IsFileSystemResource}),t.appendMenuItem(o.OpenEditorsContext,{group:"1_cutcopypaste",order:20,command:V,when:r.IsFileSystemResource}),t.appendMenuItem(o.OpenEditorsContext,{group:"2_save",order:10,command:{id:k,title:le,precondition:W},when:e.or(r.Scheme.isEqualTo(y.untitled),e.and(A.toNegated(),re.toNegated(),P.toNegated()))}),t.appendMenuItem(o.OpenEditorsContext,{group:"2_save",order:20,command:{id:z,title:n.localize("revert","Revert File"),precondition:W},when:e.and(A.toNegated(),re.toNegated(),r.Scheme.notEqualsTo(y.untitled),P.toNegated())}),t.appendMenuItem(o.OpenEditorsContext,{group:"2_save",order:30,command:{id:ae,title:n.localize("saveAll","Save All"),precondition:Y},when:A}),t.appendMenuItem(o.OpenEditorsContext,{group:"3_compare",order:10,command:{id:ne,title:n.localize("compareWithSaved","Compare with Saved"),precondition:W},when:e.and(r.IsFileSystemResource,P.toNegated(),I.toNegated())});const Ce={id:lo,title:n.localize("compareWithSelected","Compare with Selected")};t.appendMenuItem(o.OpenEditorsContext,{group:"3_compare",order:20,command:Ce,when:e.and(r.HasResource,ie,G,I.toNegated())});const _e={id:Oo,title:n.localize("compareSource","Select for Compare")};t.appendMenuItem(o.OpenEditorsContext,{group:"3_compare",order:30,command:_e,when:e.and(r.HasResource,G,I.toNegated())});const U={id:po,title:n.localize("compareSelected","Compare Selected")};t.appendMenuItem(o.OpenEditorsContext,{group:"3_compare",order:30,command:U,when:e.and(r.HasResource,I,uo)}),t.appendMenuItem(o.EditorTitleContext,{group:"1_compare",order:30,command:U,when:e.and(r.HasResource,Ne,ve)}),t.appendMenuItem(o.OpenEditorsContext,{group:"4_close",order:10,command:{id:X,title:n.localize("close","Close")},when:A.toNegated()}),t.appendMenuItem(o.OpenEditorsContext,{group:"4_close",order:20,command:{id:Oe,title:n.localize("closeOthers","Close Others")},when:A.toNegated()}),t.appendMenuItem(o.OpenEditorsContext,{group:"4_close",order:30,command:{id:xe,title:n.localize("closeSaved","Close Saved")}}),t.appendMenuItem(o.OpenEditorsContext,{group:"4_close",order:40,command:{id:he,title:n.localize("closeAll","Close All")}}),t.appendMenuItem(o.ExplorerContext,{group:"navigation",order:4,command:{id:Q,title:Z,precondition:i},when:l}),t.appendMenuItem(o.ExplorerContext,{group:"navigation",order:6,command:{id:ee,title:oe,precondition:i},when:l}),t.appendMenuItem(o.ExplorerContext,{group:"navigation",order:10,command:Ee,when:e.and(l.toNegated(),r.HasResource)}),t.appendMenuItem(o.ExplorerContext,{group:"navigation",order:20,command:{id:so,title:n.localize("explorerOpenWith","Open With...")},when:e.and(l.toNegated(),yo)}),t.appendMenuItem(o.ExplorerContext,{group:"3_compare",order:20,command:Ce,when:e.and(l.toNegated(),r.HasResource,ie,I.toNegated())}),t.appendMenuItem(o.ExplorerContext,{group:"3_compare",order:30,command:_e,when:e.and(l.toNegated(),r.HasResource,I.toNegated())}),t.appendMenuItem(o.ExplorerContext,{group:"3_compare",order:30,command:U,when:e.and(l.toNegated(),r.HasResource,I)}),t.appendMenuItem(o.ExplorerContext,{group:"5_cutcopypaste",order:8,command:{id:ce,title:n.localize("cut","Cut")},when:e.and(s.toNegated(),i)}),t.appendMenuItem(o.ExplorerContext,{group:"5_cutcopypaste",order:10,command:{id:se,title:We},when:s.toNegated()}),t.appendMenuItem(o.ExplorerContext,{group:"5_cutcopypaste",order:20,command:{id:H,title:Ye,precondition:e.and(i,Ke)},when:l}),t.appendMenuItem(o.ExplorerContext,{group:"5b_importexport",order:10,command:{id:Pe,title:He},when:e.or(e.and(R.toNegated(),r.Scheme.notEqualsTo(y.file)),e.and(R,l.toNegated(),s.toNegated()),e.and(R,Se))}),t.appendMenuItem(o.ExplorerContext,{group:"5b_importexport",order:20,command:{id:no,title:ro},when:e.and(R,l,i)}),t.appendMenuItem(o.ExplorerContext,{group:"6_copypath",order:10,command:K,when:r.IsFileSystemResource}),t.appendMenuItem(o.ExplorerContext,{group:"6_copypath",order:20,command:V,when:r.IsFileSystemResource}),t.appendMenuItem(o.ExplorerContext,{group:"2_workspace",order:10,command:{id:Me,title:Ae},when:e.and(s,e.or($,j.isEqualTo("workspace")))}),t.appendMenuItem(o.ExplorerContext,{group:"2_workspace",order:30,command:{id:Eo,title:Co},when:e.and(s,l,e.and(L.notEqualsTo("0"),e.or($,j.isEqualTo("workspace"))))}),t.appendMenuItem(o.ExplorerContext,{group:"7_modification",order:10,command:{id:pe,title:to,precondition:i},when:s.toNegated()}),t.appendMenuItem(o.ExplorerContext,{group:"7_modification",order:20,command:{id:me,title:Ge,precondition:i},alt:{id:N,title:n.localize("deleteFile","Delete Permanently"),precondition:i},when:e.and(s.toNegated(),D)}),t.appendMenuItem(o.ExplorerContext,{group:"7_modification",order:20,command:{id:N,title:n.localize("deleteFile","Delete Permanently"),precondition:i},when:e.and(s.toNegated(),D.toNegated())});for(const m of[o.EmptyEditorGroupContext,o.EditorTabsBarContext])t.appendMenuItem(m,{command:{id:b,title:n.localize("newFile","New Text File")},group:"1_file",order:10}),t.appendMenuItem(m,{command:{id:"workbench.action.quickOpen",title:n.localize("openFile","Open File...")},group:"1_file",order:20});t.appendMenuItem(o.MenubarFileMenu,{group:"1_new",command:{id:b,title:n.localize({key:"miNewFile",comment:["&& denotes a mnemonic"]},"&&New Text File")},order:1}),t.appendMenuItem(o.MenubarFileMenu,{group:"4_save",command:{id:k,title:n.localize({key:"miSave",comment:["&& denotes a mnemonic"]},"&&Save"),precondition:e.or(w,e.and(v,S))},order:1}),t.appendMenuItem(o.MenubarFileMenu,{group:"4_save",command:{id:de,title:n.localize({key:"miSaveAs",comment:["&& denotes a mnemonic"]},"Save &&As..."),precondition:e.or(w,e.and(v,S))},order:2}),t.appendMenuItem(o.MenubarFileMenu,{group:"4_save",command:{id:go,title:n.localize({key:"miSaveAll",comment:["&& denotes a mnemonic"]},"Save A&&ll"),precondition:Y},order:3}),t.appendMenuItem(o.MenubarFileMenu,{group:"5_autosave",command:{id:te.ID,title:n.localize({key:"miAutoSave",comment:["&& denotes a mnemonic"]},"A&&uto Save"),toggled:e.notEquals("config.files.autoSave","off")},order:1}),t.appendMenuItem(o.MenubarFileMenu,{group:"6_close",command:{id:z,title:n.localize({key:"miRevert",comment:["&& denotes a mnemonic"]},"Re&&vert File"),precondition:e.or(e.and(Re),e.and(r.Scheme.notEqualsTo(y.untitled),v,S))},order:1}),t.appendMenuItem(o.MenubarFileMenu,{group:"6_close",command:{id:X,title:n.localize({key:"miCloseEditor",comment:["&& denotes a mnemonic"]},"&&Close Editor"),precondition:e.or(w,e.and(v,S))},order:2}),t.appendMenuItem(o.MenubarGoMenu,{group:"3_global_nav",command:{id:"workbench.action.quickOpen",title:n.localize({key:"miGotoFile",comment:["&& denotes a mnemonic"]},"Go to &&File...")},order:1});export{B as appendEditorTitleContextMenuItem,p as appendToCommandPalette};
