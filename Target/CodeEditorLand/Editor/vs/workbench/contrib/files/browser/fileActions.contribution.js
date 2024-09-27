import*as n from"../../../../nls.js";import{ToggleAutoSaveAction as $,FocusFilesExplorer as Ae,GlobalCompareResourcesAction as Oe,ShowActiveFileInExplorer as xe,CompareWithClipboardAction as ye,NEW_FILE_COMMAND_ID as j,NEW_FILE_LABEL as J,NEW_FOLDER_COMMAND_ID as Q,NEW_FOLDER_LABEL as Z,TRIGGER_RENAME_LABEL as Fe,MOVE_FILE_TO_TRASH_LABEL as Re,COPY_FILE_LABEL as Se,PASTE_FILE_LABEL as Ne,FileCopiedContext as De,renameHandler as ve,moveFileToTrashHandler as we,copyFileHandler as Le,pasteFileHandler as Te,deleteFileHandler as ee,cutFileHandler as fe,DOWNLOAD_COMMAND_ID as be,openFilePreserveFocusHandler as We,DOWNLOAD_LABEL as ke,OpenActiveFileInEmptyWorkspace as ze,UPLOAD_COMMAND_ID as Pe,UPLOAD_LABEL as He,CompareNewUntitledTextFilesAction as Ke,SetActiveEditorReadonlyInSession as Ve,SetActiveEditorWriteableInSession as Be,ToggleActiveEditorReadonlyInSession as Ge,ResetActiveEditorReadonlyInSession as Ue}from"./fileActions.js";import{revertLocalChangesCommand as qe,acceptLocalChangesCommand as Xe,CONFLICT_RESOLUTION_CONTEXT as Ye}from"./editors/textFileSaveErrorHandler.js";import{MenuId as o,MenuRegistry as t,registerAction2 as c}from"../../../../platform/actions/common/actions.js";import"../../../../platform/action/common/action.js";import{KeyMod as I,KeyCode as a}from"../../../../base/common/keyCodes.js";import{openWindowCommand as $e,newWindowCommand as je}from"./fileCommands.js";import{COPY_PATH_COMMAND_ID as f,REVEAL_IN_EXPLORER_COMMAND_ID as Je,OPEN_TO_SIDE_COMMAND_ID as Qe,REVERT_FILE_COMMAND_ID as b,SAVE_FILE_COMMAND_ID as W,SAVE_FILE_LABEL as oe,SAVE_FILE_AS_COMMAND_ID as te,SAVE_FILE_AS_LABEL as Ze,SAVE_ALL_IN_GROUP_COMMAND_ID as ne,OpenEditorsGroupContext as A,COMPARE_WITH_SAVED_COMMAND_ID as re,COMPARE_RESOURCE_COMMAND_ID as eo,SELECT_FOR_COMPARE_COMMAND_ID as oo,ResourceSelectedForCompareContext as ie,OpenEditorsDirtyEditorContext as k,COMPARE_SELECTED_COMMAND_ID as to,REMOVE_ROOT_FOLDER_COMMAND_ID as no,REMOVE_ROOT_FOLDER_LABEL as ro,SAVE_FILES_COMMAND_ID as io,COPY_RELATIVE_PATH_COMMAND_ID as z,SAVE_FILE_WITHOUT_FORMATTING_COMMAND_ID as ao,SAVE_FILE_WITHOUT_FORMATTING_LABEL as lo,OpenEditorsReadonlyEditorContext as ae,OPEN_WITH_EXPLORER_COMMAND_ID as po,NEW_UNTITLED_FILE_COMMAND_ID as P,NEW_UNTITLED_FILE_LABEL as mo,SAVE_ALL_COMMAND_ID as co,OpenEditorsSelectedFileOrUntitledContext as so}from"./fileConstants.js";import{CommandsRegistry as R}from"../../../../platform/commands/common/commands.js";import{ContextKeyExpr as e}from"../../../../platform/contextkey/common/contextkey.js";import{KeybindingsRegistry as C,KeybindingWeight as E}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{FilesExplorerFocusCondition as _,ExplorerRootContext as s,ExplorerFolderContext as d,ExplorerResourceNotReadonlyContext as i,ExplorerResourceCut as uo,ExplorerResourceMoveableToTrash as S,ExplorerResourceAvailableEditorIdsContext as Co,FoldersViewVisibleContext as N}from"../common/files.js";import{ADD_ROOT_FOLDER_COMMAND_ID as Eo,ADD_ROOT_FOLDER_LABEL as _o}from"../../../browser/actions/workspaceCommands.js";import{CLOSE_SAVED_EDITORS_COMMAND_ID as go,CLOSE_EDITORS_IN_GROUP_COMMAND_ID as Io,CLOSE_EDITOR_COMMAND_ID as de,CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID as Mo,REOPEN_WITH_COMMAND_ID as ho}from"../../../browser/parts/editor/editorCommands.js";import{AutoSaveAfterShortDelayContext as H}from"../../../services/filesConfiguration/common/filesConfigurationService.js";import{WorkbenchListDoubleSelection as M,WorkbenchTreeFindOpen as u}from"../../../../platform/list/browser/listService.js";import{Schemas as F}from"../../../../base/common/network.js";import{DirtyWorkingCopiesContext as le,EnterMultiRootWorkspaceSupportContext as pe,HasWebFileSystemAccess as Ao,WorkbenchStateContext as me,WorkspaceFolderCountContext as K,SidebarFocusContext as D,ActiveEditorCanRevertContext as Oo,ActiveEditorContext as V,ResourceContextKey as r,ActiveEditorAvailableEditorIdsContext as xo,MultipleEditorsSelectedInGroupContext as yo,TwoEditorsSelectedInGroupContext as Fo,SelectedEditorsInGroupFileOrUntitledResourceContextKey as Ro}from"../../../common/contextkeys.js";import{IsWebContext as v}from"../../../../platform/contextkey/common/contextkeys.js";import"../../../../platform/instantiation/common/instantiation.js";import"../../../../base/common/themables.js";import{IExplorerService as So}from"./files.js";import{Codicon as ce}from"../../../../base/common/codicons.js";import{Categories as l}from"../../../../platform/action/common/actionCommonCategories.js";c(Oe),c(Ae),c(xe),c(ye),c(Ke),c($),c(ze),c(Ve),c(Be),c(Ge),c(Ue),R.registerCommand("_files.windowOpen",$e),R.registerCommand("_files.newWindow",je);const g=10,se="renameFile";C.registerCommandAndKeybindingRule({id:se,weight:E.WorkbenchContrib+g,when:e.and(_,s.toNegated(),i),primary:a.F2,mac:{primary:a.Enter},handler:ve});const ue="moveFileToTrash";C.registerCommandAndKeybindingRule({id:ue,weight:E.WorkbenchContrib+g,when:e.and(_,i,S,u.toNegated()),primary:a.Delete,mac:{primary:I.CtrlCmd|a.Backspace,secondary:[a.Delete]},handler:we});const w="deleteFile";C.registerCommandAndKeybindingRule({id:w,weight:E.WorkbenchContrib+g,when:e.and(_,i,u.toNegated()),primary:I.Shift|a.Delete,mac:{primary:I.CtrlCmd|I.Alt|a.Backspace},handler:ee}),C.registerCommandAndKeybindingRule({id:w,weight:E.WorkbenchContrib+g,when:e.and(_,i,S.toNegated(),u.toNegated()),primary:a.Delete,mac:{primary:I.CtrlCmd|a.Backspace},handler:ee});const Ce="filesExplorer.cut";C.registerCommandAndKeybindingRule({id:Ce,weight:E.WorkbenchContrib+g,when:e.and(_,s.toNegated(),i),primary:I.CtrlCmd|a.KeyX,handler:fe});const Ee="filesExplorer.copy";C.registerCommandAndKeybindingRule({id:Ee,weight:E.WorkbenchContrib+g,when:e.and(_,s.toNegated()),primary:I.CtrlCmd|a.KeyC,handler:Le});const B="filesExplorer.paste";R.registerCommand(B,Te),C.registerKeybindingRule({id:`^${B}`,weight:E.WorkbenchContrib+g,when:e.and(_,i),primary:I.CtrlCmd|a.KeyV}),C.registerCommandAndKeybindingRule({id:"filesExplorer.cancelCut",weight:E.WorkbenchContrib+g,when:e.and(_,uo),primary:a.Escape,handler:async m=>{await m.get(So).setToCopy([],!0)}}),C.registerCommandAndKeybindingRule({id:"filesExplorer.openFilePreserveFocus",weight:E.WorkbenchContrib+g,when:e.and(_,d.toNegated()),primary:a.Space,handler:We});const L={id:f,title:n.localize("copyPath","Copy Path")},T={id:z,title:n.localize("copyRelativePath","Copy Relative Path")},G={id:Je,title:n.localize("revealInSideBar","Reveal in Explorer View")};U(f,L.title,r.IsFileSystemResource,"1_cutcopypaste",!0),U(z,T.title,r.IsFileSystemResource,"1_cutcopypaste",!0),U(G.id,G.title,r.IsFileSystemResource,"2_files",!1,1);function U(m,h,O,x,y,Me){const he=y!==!0?yo.negate():void 0;t.appendMenuItem(o.EditorTitleContext,{command:{id:m,title:h,precondition:he},when:O,group:x,order:Me})}_e("workbench.files.action.acceptLocalChanges",n.localize("acceptLocalChanges","Use your changes and overwrite file contents"),ce.check,-10,Xe),_e("workbench.files.action.revertLocalChanges",n.localize("revertLocalChanges","Discard your changes and revert to file contents"),ce.discard,-9,qe);function _e(m,h,O,x,y){R.registerCommand(m,y),t.appendMenuItem(o.EditorTitle,{command:{id:m,title:h,icon:O},when:e.equals(Ye,!0),group:"navigation",order:x})}function p({id:m,title:h,category:O,metadata:x},y){t.appendMenuItem(o.CommandPalette,{command:{id:m,title:h,category:O,metadata:x},when:y})}p({id:f,title:n.localize2("copyPathOfActive","Copy Path of Active File"),category:l.File}),p({id:z,title:n.localize2("copyRelativePathOfActive","Copy Relative Path of Active File"),category:l.File}),p({id:W,title:oe,category:l.File}),p({id:ao,title:lo,category:l.File}),p({id:ne,title:n.localize2("saveAllInGroup","Save All in Group"),category:l.File}),p({id:io,title:n.localize2("saveFiles","Save All Files"),category:l.File}),p({id:b,title:n.localize2("revert","Revert File"),category:l.File}),p({id:re,title:n.localize2("compareActiveWithSaved","Compare Active File with Saved"),category:l.File,metadata:{description:n.localize2("compareActiveWithSavedMeta","Opens a new diff editor to compare the active file with the version on disk.")}}),p({id:te,title:Ze,category:l.File}),p({id:j,title:J,category:l.File},K.notEqualsTo("0")),p({id:Q,title:Z,category:l.File,metadata:{description:n.localize2("newFolderDescription","Create a new folder or directory")}},K.notEqualsTo("0")),p({id:P,title:mo,category:l.File});const q=e.or(r.IsFileSystemResource,r.Scheme.isEqualTo(F.untitled)),X={id:Qe,title:n.localize("openToSide","Open to the Side")};t.appendMenuItem(o.OpenEditorsContext,{group:"navigation",order:10,command:X,when:q}),t.appendMenuItem(o.OpenEditorsContext,{group:"1_open",order:10,command:{id:ho,title:n.localize("reopenWith","Reopen Editor With...")},when:e.and(xo,A.toNegated())}),t.appendMenuItem(o.OpenEditorsContext,{group:"1_cutcopypaste",order:10,command:L,when:r.IsFileSystemResource}),t.appendMenuItem(o.OpenEditorsContext,{group:"1_cutcopypaste",order:20,command:T,when:r.IsFileSystemResource}),t.appendMenuItem(o.OpenEditorsContext,{group:"2_save",order:10,command:{id:W,title:oe,precondition:k},when:e.or(r.Scheme.isEqualTo(F.untitled),e.and(A.toNegated(),ae.toNegated(),H.toNegated()))}),t.appendMenuItem(o.OpenEditorsContext,{group:"2_save",order:20,command:{id:b,title:n.localize("revert","Revert File"),precondition:k},when:e.and(A.toNegated(),ae.toNegated(),r.Scheme.notEqualsTo(F.untitled),H.toNegated())}),t.appendMenuItem(o.OpenEditorsContext,{group:"2_save",order:30,command:{id:ne,title:n.localize("saveAll","Save All"),precondition:le},when:A}),t.appendMenuItem(o.OpenEditorsContext,{group:"3_compare",order:10,command:{id:re,title:n.localize("compareWithSaved","Compare with Saved"),precondition:k},when:e.and(r.IsFileSystemResource,H.toNegated(),M.toNegated())});const ge={id:eo,title:n.localize("compareWithSelected","Compare with Selected")};t.appendMenuItem(o.OpenEditorsContext,{group:"3_compare",order:20,command:ge,when:e.and(r.HasResource,ie,q,M.toNegated())});const Ie={id:oo,title:n.localize("compareSource","Select for Compare")};t.appendMenuItem(o.OpenEditorsContext,{group:"3_compare",order:30,command:Ie,when:e.and(r.HasResource,q,M.toNegated())});const Y={id:to,title:n.localize("compareSelected","Compare Selected")};t.appendMenuItem(o.OpenEditorsContext,{group:"3_compare",order:30,command:Y,when:e.and(r.HasResource,M,so)}),t.appendMenuItem(o.EditorTitleContext,{group:"1_compare",order:30,command:Y,when:e.and(r.HasResource,Fo,Ro)}),t.appendMenuItem(o.OpenEditorsContext,{group:"4_close",order:10,command:{id:de,title:n.localize("close","Close")},when:A.toNegated()}),t.appendMenuItem(o.OpenEditorsContext,{group:"4_close",order:20,command:{id:Mo,title:n.localize("closeOthers","Close Others")},when:A.toNegated()}),t.appendMenuItem(o.OpenEditorsContext,{group:"4_close",order:30,command:{id:go,title:n.localize("closeSaved","Close Saved")}}),t.appendMenuItem(o.OpenEditorsContext,{group:"4_close",order:40,command:{id:Io,title:n.localize("closeAll","Close All")}}),t.appendMenuItem(o.ExplorerContext,{group:"navigation",order:4,command:{id:j,title:J,precondition:e.and(i,u.toNegated())},when:d}),t.appendMenuItem(o.ExplorerContext,{group:"navigation",order:6,command:{id:Q,title:Z,precondition:e.and(i,u.toNegated())},when:d}),t.appendMenuItem(o.ExplorerContext,{group:"navigation",order:10,command:X,when:e.and(d.toNegated(),r.HasResource)}),t.appendMenuItem(o.ExplorerContext,{group:"navigation",order:20,command:{id:po,title:n.localize("explorerOpenWith","Open With...")},when:e.and(d.toNegated(),Co)}),t.appendMenuItem(o.ExplorerContext,{group:"3_compare",order:20,command:ge,when:e.and(d.toNegated(),r.HasResource,ie,M.toNegated())}),t.appendMenuItem(o.ExplorerContext,{group:"3_compare",order:30,command:Ie,when:e.and(d.toNegated(),r.HasResource,M.toNegated())}),t.appendMenuItem(o.ExplorerContext,{group:"3_compare",order:30,command:Y,when:e.and(d.toNegated(),r.HasResource,M)}),t.appendMenuItem(o.ExplorerContext,{group:"5_cutcopypaste",order:8,command:{id:Ce,title:n.localize("cut","Cut")},when:e.and(s.toNegated(),i)}),t.appendMenuItem(o.ExplorerContext,{group:"5_cutcopypaste",order:10,command:{id:Ee,title:Se},when:s.toNegated()}),t.appendMenuItem(o.ExplorerContext,{group:"5_cutcopypaste",order:20,command:{id:B,title:Ne,precondition:e.and(i,De)},when:d}),t.appendMenuItem(o.ExplorerContext,{group:"5b_importexport",order:10,command:{id:be,title:ke},when:e.or(e.and(v.toNegated(),r.Scheme.notEqualsTo(F.file)),e.and(v,d.toNegated(),s.toNegated()),e.and(v,Ao))}),t.appendMenuItem(o.ExplorerContext,{group:"5b_importexport",order:20,command:{id:Pe,title:He},when:e.and(v,d,i)}),t.appendMenuItem(o.ExplorerContext,{group:"6_copypath",order:10,command:L,when:r.IsFileSystemResource}),t.appendMenuItem(o.ExplorerContext,{group:"6_copypath",order:20,command:T,when:r.IsFileSystemResource}),t.appendMenuItem(o.ExplorerContext,{group:"2_workspace",order:10,command:{id:Eo,title:_o,precondition:u.toNegated()},when:e.and(s,e.or(pe,me.isEqualTo("workspace")))}),t.appendMenuItem(o.ExplorerContext,{group:"2_workspace",order:30,command:{id:no,title:ro,precondition:u.toNegated()},when:e.and(s,d,e.and(K.notEqualsTo("0"),e.or(pe,me.isEqualTo("workspace"))))}),t.appendMenuItem(o.ExplorerContext,{group:"7_modification",order:10,command:{id:se,title:Fe,precondition:e.and(i,u.toNegated())},when:s.toNegated()}),t.appendMenuItem(o.ExplorerContext,{group:"7_modification",order:20,command:{id:ue,title:Re,precondition:e.and(i,u.toNegated())},alt:{id:w,title:n.localize("deleteFile","Delete Permanently"),precondition:e.and(i,u.toNegated())},when:e.and(s.toNegated(),S)}),t.appendMenuItem(o.ExplorerContext,{group:"7_modification",order:20,command:{id:w,title:n.localize("deleteFile","Delete Permanently"),precondition:e.and(i,u.toNegated())},when:e.and(s.toNegated(),S.toNegated())});for(const m of[o.EmptyEditorGroupContext,o.EditorTabsBarContext])t.appendMenuItem(m,{command:{id:P,title:n.localize("newFile","New Text File")},group:"1_file",order:10}),t.appendMenuItem(m,{command:{id:"workbench.action.quickOpen",title:n.localize("openFile","Open File...")},group:"1_file",order:20});t.appendMenuItem(o.MenubarFileMenu,{group:"1_new",command:{id:P,title:n.localize({key:"miNewFile",comment:["&& denotes a mnemonic"]},"&&New Text File")},order:1}),t.appendMenuItem(o.MenubarFileMenu,{group:"4_save",command:{id:W,title:n.localize({key:"miSave",comment:["&& denotes a mnemonic"]},"&&Save"),precondition:e.or(V,e.and(N,D))},order:1}),t.appendMenuItem(o.MenubarFileMenu,{group:"4_save",command:{id:te,title:n.localize({key:"miSaveAs",comment:["&& denotes a mnemonic"]},"Save &&As..."),precondition:e.or(V,e.and(N,D))},order:2}),t.appendMenuItem(o.MenubarFileMenu,{group:"4_save",command:{id:co,title:n.localize({key:"miSaveAll",comment:["&& denotes a mnemonic"]},"Save A&&ll"),precondition:le},order:3}),t.appendMenuItem(o.MenubarFileMenu,{group:"5_autosave",command:{id:$.ID,title:n.localize({key:"miAutoSave",comment:["&& denotes a mnemonic"]},"A&&uto Save"),toggled:e.notEquals("config.files.autoSave","off")},order:1}),t.appendMenuItem(o.MenubarFileMenu,{group:"6_close",command:{id:b,title:n.localize({key:"miRevert",comment:["&& denotes a mnemonic"]},"Re&&vert File"),precondition:e.or(e.and(Oo),e.and(r.Scheme.notEqualsTo(F.untitled),N,D))},order:1}),t.appendMenuItem(o.MenubarFileMenu,{group:"6_close",command:{id:de,title:n.localize({key:"miCloseEditor",comment:["&& denotes a mnemonic"]},"&&Close Editor"),precondition:e.or(V,e.and(N,D))},order:2}),t.appendMenuItem(o.MenubarGoMenu,{group:"3_global_nav",command:{id:"workbench.action.quickOpen",title:n.localize({key:"miGotoFile",comment:["&& denotes a mnemonic"]},"Go to &&File...")},order:1}),t.appendMenuItem(o.ChatInlineResourceAnchorContext,{group:"navigation",order:10,command:X,when:e.and(r.HasResource,d.toNegated())}),t.appendMenuItem(o.ChatInlineResourceAnchorContext,{group:"navigation",order:20,command:G,when:r.IsFileSystemResource}),t.appendMenuItem(o.ChatInlineResourceAnchorContext,{group:"1_cutcopypaste",order:10,command:L,when:r.IsFileSystemResource}),t.appendMenuItem(o.ChatInlineResourceAnchorContext,{group:"1_cutcopypaste",order:20,command:T,when:r.IsFileSystemResource});export{U as appendEditorTitleContextMenuItem,p as appendToCommandPalette,G as revealInsideBarCommand};
