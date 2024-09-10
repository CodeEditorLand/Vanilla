import*as y from"../../../../nls.js";import{EditorResourceAccessor as L,SideBySideEditor as W,SaveReason as w,EditorsOrder as ue,EditorInputCapabilities as O}from"../../../common/editor.js";import{SideBySideEditorInput as ve}from"../../../common/editor/sideBySideEditorInput.js";import{isWorkspaceToOpen as fe}from"../../../../platform/window/common/window.js";import{IHostService as q}from"../../../services/host/browser/host.js";import{IInstantiationService as J}from"../../../../platform/instantiation/common/instantiation.js";import{IWorkspaceContextService as Q,UNTITLED_WORKSPACE_NAME as Ee}from"../../../../platform/workspace/common/workspace.js";import{ExplorerFocusCondition as Se,TextFileContentProvider as Z,VIEWLET_ID as D,ExplorerCompressedFocusContext as x,ExplorerCompressedFirstFocusContext as $,ExplorerCompressedLastFocusContext as ee,FilesExplorerFocusCondition as A,ExplorerFolderContext as Ie,VIEW_ID as ye}from"../common/files.js";import{IClipboardService as N}from"../../../../platform/clipboard/common/clipboardService.js";import{toErrorMessage as te}from"../../../../base/common/errorMessage.js";import{CommandsRegistry as f,ICommandService as he}from"../../../../platform/commands/common/commands.js";import{IContextKeyService as we,ContextKeyExpr as R}from"../../../../platform/contextkey/common/contextkey.js";import{IFileService as F}from"../../../../platform/files/common/files.js";import{KeybindingsRegistry as p,KeybindingWeight as g}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{KeyMod as d,KeyCode as a,KeyChord as E}from"../../../../base/common/keyCodes.js";import{isWeb as re,isWindows as ie}from"../../../../base/common/platform.js";import{ITextModelService as Ae}from"../../../../editor/common/services/resolverService.js";import{getResourceForCommand as b,getMultiSelectedResources as _,getOpenEditorsViewMultiSelection as oe,IExplorerService as h}from"./files.js";import{IWorkspaceEditingService as Re}from"../../../services/workspaces/common/workspaceEditing.js";import{resolveCommandsContext as be}from"../../../browser/parts/editor/editorCommandsContext.js";import{Schemas as U}from"../../../../base/common/network.js";import{INotificationService as ne,Severity as _e}from"../../../../platform/notification/common/notification.js";import{EditorContextKeys as K}from"../../../../editor/common/editorContextKeys.js";import{IEditorService as c,SIDE_GROUP as Oe}from"../../../services/editor/common/editorService.js";import{IEditorGroupsService as S,GroupsOrder as de}from"../../../services/editor/common/editorGroupsService.js";import{ILabelService as V}from"../../../../platform/label/common/label.js";import{basename as De,joinPath as ae,isEqual as xe}from"../../../../base/common/resources.js";import{dispose as se}from"../../../../base/common/lifecycle.js";import{IEnvironmentService as Ke}from"../../../../platform/environment/common/environment.js";import{ICodeEditorService as Me}from"../../../../editor/browser/services/codeEditorService.js";import{EmbeddedCodeEditorWidget as Pe}from"../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";import{ITextFileService as Te}from"../../../services/textfile/common/textfiles.js";import{IUriIdentityService as Le}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{isCancellationError as We}from"../../../../base/common/errors.js";import{toAction as me}from"../../../../base/common/actions.js";import{EditorOpenSource as Ne,EditorResolution as Fe}from"../../../../platform/editor/common/editor.js";import{hash as Ue}from"../../../../base/common/hash.js";import{IConfigurationService as k}from"../../../../platform/configuration/common/configuration.js";import{IPaneCompositePartService as M}from"../../../services/panecomposite/browser/panecomposite.js";import{ViewContainerLocation as P}from"../../../common/views.js";import{IViewsService as Ve}from"../../../services/views/common/viewsService.js";import{OPEN_TO_SIDE_COMMAND_ID as ke,COMPARE_WITH_SAVED_COMMAND_ID as je,SELECT_FOR_COMPARE_COMMAND_ID as Ge,ResourceSelectedForCompareContext as He,COMPARE_SELECTED_COMMAND_ID as Xe,COMPARE_RESOURCE_COMMAND_ID as ze,COPY_PATH_COMMAND_ID as le,COPY_RELATIVE_PATH_COMMAND_ID as ce,REVEAL_IN_EXPLORER_COMMAND_ID as Ye,OPEN_WITH_EXPLORER_COMMAND_ID as Be,SAVE_FILE_COMMAND_ID as qe,SAVE_FILE_WITHOUT_FORMATTING_COMMAND_ID as Je,SAVE_FILE_AS_COMMAND_ID as Qe,SAVE_ALL_COMMAND_ID as Ze,SAVE_ALL_IN_GROUP_COMMAND_ID as $e,SAVE_FILES_COMMAND_ID as et,REVERT_FILE_COMMAND_ID as tt,REMOVE_ROOT_FOLDER_COMMAND_ID as rt,PREVIOUS_COMPRESSED_FOLDER as it,NEXT_COMPRESSED_FOLDER as ot,FIRST_COMPRESSED_FOLDER as nt,LAST_COMPRESSED_FOLDER as dt,NEW_UNTITLED_FILE_COMMAND_ID as at,NEW_UNTITLED_FILE_LABEL as st,NEW_FILE_COMMAND_ID as mt}from"./fileConstants.js";import{IFileDialogService as lt}from"../../../../platform/dialogs/common/dialogs.js";import{RemoveRootFolderAction as ct}from"../../../browser/actions/workspaceActions.js";import{OpenEditorsView as pt}from"./views/openEditorsView.js";import{IListService as v}from"../../../../platform/list/browser/listService.js";const hr=(e,t,r)=>{if(Array.isArray(t)){const i=e.get(q),o=e.get(Ke);t=t.map(n=>fe(n)&&n.workspaceUri.scheme===U.untitled?{workspaceUri:ae(o.untitledWorkspacesHome,n.workspaceUri.path,Ee)}:n),i.openWindow(t,r)}},wr=(e,t)=>{e.get(q).openWindow(t)};p.registerCommandAndKeybindingRule({weight:g.WorkbenchContrib,when:Se,primary:d.CtrlCmd|a.Enter,mac:{primary:d.WinCtrl|a.Enter},id:ke,handler:async(e,t)=>{const r=e.get(c),i=e.get(F),o=e.get(h),n=_(t,e.get(v),r,e.get(S),o);if(n.length){const l=n.filter(u=>u.scheme===U.untitled),s=n.filter(u=>u.scheme!==U.untitled),T=(await Promise.all(s.map(async u=>{const B=o.findClosest(u);return B||await i.stat(u)}))).filter(u=>!u.isDirectory).map(u=>({resource:u.resource,options:{pinned:!0}})).concat(...l.map(u=>({resource:u,options:{pinned:!0}})));await r.openEditors(T,Oe)}}}),p.registerCommandAndKeybindingRule({weight:g.WorkbenchContrib+10,when:R.and(A,Ie.toNegated()),primary:a.Enter,mac:{primary:d.CtrlCmd|a.DownArrow},id:"explorer.openAndPassFocus",handler:async(e,t)=>{const r=e.get(c),o=e.get(h).getContext(!0);o.length&&await r.openEditors(o.map(n=>({resource:n.resource,options:{preserveFocus:!1,pinned:!0}})))}});const j="showModifications";let I=[];p.registerCommandAndKeybindingRule({id:je,when:void 0,weight:g.WorkbenchContrib,primary:E(d.CtrlCmd|a.KeyK,a.KeyD),handler:async(e,t)=>{const r=e.get(J),i=e.get(Ae),o=e.get(c),n=e.get(F),l=e.get(v);let s=!1;if(I.length===0){s=!0;const C=r.createInstance(Z);I.push(C),I.push(i.registerTextModelContentProvider(j,C))}const m=b(t,o,l);if(m&&n.hasProvider(m)){const C=De(m),T=y.localize("modifiedLabel","{0} (in file) \u2194 {1}",C,C);try{await Z.open(m,j,T,o,{pinned:!0}),s&&I.push(o.onDidVisibleEditorsChange(()=>{o.editors.some(u=>!!L.getCanonicalUri(u,{supportSideBySide:W.SECONDARY,filterByScheme:j}))||(I=se(I))}))}catch{I=se(I)}}}});let G,H;f.registerCommand({id:Ge,handler:(e,t)=>{G=b(t,e.get(c),e.get(v)),H||(H=He.bindTo(e.get(we))),H.set(!0)}}),f.registerCommand({id:Xe,handler:async(e,t)=>{const r=e.get(c),i=_(t,e.get(v),r,e.get(S),e.get(h));return i.length===2?r.openEditor({original:{resource:i[0]},modified:{resource:i[1]},options:{pinned:!0}}):!0}}),f.registerCommand({id:ze,handler:(e,t)=>{const r=e.get(c),i=b(t,r,e.get(v));G&&i&&r.openEditor({original:{resource:G},modified:{resource:i},options:{pinned:!0}})}});async function X(e,t,r,i,o){if(e.length){const n=ie?`\r
`:`
`;let l;if(t){const m=o.getValue("explorer.copyRelativePathSeparator");(m==="/"||m==="\\")&&(l=m)}const s=e.map(m=>i.getUriLabel(m,{relative:t,noPrefix:!0,separator:l})).join(n);await r.writeText(s)}}const pe=async(e,t)=>{const r=_(t,e.get(v),e.get(c),e.get(S),e.get(h));await X(r,!1,e.get(N),e.get(V),e.get(k))};p.registerCommandAndKeybindingRule({weight:g.WorkbenchContrib,when:K.focus.toNegated(),primary:d.CtrlCmd|d.Alt|a.KeyC,win:{primary:d.Shift|d.Alt|a.KeyC},id:le,handler:pe}),p.registerCommandAndKeybindingRule({weight:g.WorkbenchContrib,when:K.focus,primary:E(d.CtrlCmd|a.KeyK,d.CtrlCmd|d.Alt|a.KeyC),win:{primary:d.Shift|d.Alt|a.KeyC},id:le,handler:pe});const ge=async(e,t)=>{const r=_(t,e.get(v),e.get(c),e.get(S),e.get(h));await X(r,!0,e.get(N),e.get(V),e.get(k))};p.registerCommandAndKeybindingRule({weight:g.WorkbenchContrib,when:K.focus.toNegated(),primary:d.CtrlCmd|d.Shift|d.Alt|a.KeyC,win:{primary:E(d.CtrlCmd|a.KeyK,d.CtrlCmd|d.Shift|a.KeyC)},id:ce,handler:ge}),p.registerCommandAndKeybindingRule({weight:g.WorkbenchContrib,when:K.focus,primary:E(d.CtrlCmd|a.KeyK,d.CtrlCmd|d.Shift|d.Alt|a.KeyC),win:{primary:E(d.CtrlCmd|a.KeyK,d.CtrlCmd|d.Shift|a.KeyC)},id:ce,handler:ge}),p.registerCommandAndKeybindingRule({weight:g.WorkbenchContrib,when:void 0,primary:E(d.CtrlCmd|a.KeyK,a.KeyP),id:"workbench.action.files.copyPathOfActiveFile",handler:async e=>{const r=e.get(c).activeEditor,i=L.getOriginalUri(r,{supportSideBySide:W.PRIMARY});await X(i?[i]:[],!1,e.get(N),e.get(V),e.get(k))}}),f.registerCommand({id:Ye,handler:async(e,t)=>{const r=e.get(Ve),i=e.get(Q),o=e.get(h),n=e.get(c),l=e.get(v),s=b(t,n,l);if(s&&i.isInsideWorkspace(s)){const m=await r.openView(ye,!1);if(m){const C=m.autoReveal;m.autoReveal=!1,m.setExpanded(!0),await o.select(s,"force"),m.focus(),m.autoReveal=C}}else{const m=r.getViewWithId(pt.ID);m&&(m.setExpanded(!0),m.focus())}}}),f.registerCommand({id:Be,handler:async(e,t)=>{const r=e.get(c),i=e.get(v),o=b(t,r,i);if(o)return r.openEditor({resource:o,options:{override:Fe.PICK,source:Ne.USER}})}});async function z(e,t){const r=e.get(S),i=e.get(Me),o=e.get(Te);let n=oe(e);if(!n){const s=r.activeGroup;s.activeEditor&&(n=[],s.activeEditor instanceof ve&&!t?.saveAs&&!(s.activeEditor.primary.hasCapability(O.Untitled)||s.activeEditor.secondary.hasCapability(O.Untitled))&&s.activeEditor.secondary.isModified()?(n.push({groupId:s.id,editor:s.activeEditor.primary}),n.push({groupId:s.id,editor:s.activeEditor.secondary})):n.push({groupId:s.id,editor:s.activeEditor}))}if(!n||n.length===0)return;await Y(e,n,t);const l=i.getFocusedCodeEditor();if(l instanceof Pe&&!l.isSimpleWidget){const s=l.getModel()?.uri;s&&!n.some(({editor:m})=>xe(L.getCanonicalUri(m,{supportSideBySide:W.PRIMARY}),s))&&(o.files.get(s)?.isReadonly()||await o.save(s,t))}}function Ce(e,t,r){const i=[];for(const o of t)for(const n of o.getEditors(ue.MOST_RECENTLY_ACTIVE))n.isDirty()&&i.push({groupId:o.id,editor:n});return Y(e,i,r)}async function Y(e,t,r){const i=e.get(c),o=e.get(ne),n=e.get(J);try{await i.save(t,r)}catch(l){if(!We(l)){const s=[me({id:"workbench.action.files.saveEditors",label:y.localize("retry","Retry"),run:()=>n.invokeFunction(C=>Y(C,t,r))})],m=t.filter(({editor:C})=>!C.hasCapability(O.Untitled));m.length>0&&s.push(me({id:"workbench.action.files.revertEditors",label:m.length>1?y.localize("revertAll","Revert All"):y.localize("revert","Revert"),run:()=>i.revert(m)})),o.notify({id:t.map(({editor:C})=>Ue(C.resource?.toString())).join(),severity:_e.Error,message:y.localize({key:"genericSaveError",comment:["{0} is the resource that failed to save and {1} the error message"]},"Failed to save '{0}': {1}",t.map(({editor:C})=>C.getName()).join(", "),te(l,!1)),actions:{primary:s}})}}}p.registerCommandAndKeybindingRule({when:void 0,weight:g.WorkbenchContrib,primary:d.CtrlCmd|a.KeyS,id:qe,handler:e=>z(e,{reason:w.EXPLICIT,force:!0})}),p.registerCommandAndKeybindingRule({when:void 0,weight:g.WorkbenchContrib,primary:E(d.CtrlCmd|a.KeyK,a.KeyS),win:{primary:E(d.CtrlCmd|a.KeyK,d.CtrlCmd|d.Shift|a.KeyS)},id:Je,handler:e=>z(e,{reason:w.EXPLICIT,force:!0,skipSaveParticipants:!0})}),p.registerCommandAndKeybindingRule({id:Qe,weight:g.WorkbenchContrib,when:void 0,primary:d.CtrlCmd|d.Shift|a.KeyS,handler:e=>z(e,{reason:w.EXPLICIT,saveAs:!0})}),p.registerCommandAndKeybindingRule({when:void 0,weight:g.WorkbenchContrib,primary:void 0,mac:{primary:d.CtrlCmd|d.Alt|a.KeyS},win:{primary:E(d.CtrlCmd|a.KeyK,a.KeyS)},id:Ze,handler:e=>Ce(e,e.get(S).getGroups(de.MOST_RECENTLY_ACTIVE),{reason:w.EXPLICIT})}),f.registerCommand({id:$e,handler:(e,t,r)=>{const i=e.get(S),o=be([r],e.get(c),i,e.get(v));let n;return o.groupedEditors.length?n=o.groupedEditors.map(({group:l})=>l):n=i.getGroups(de.MOST_RECENTLY_ACTIVE),Ce(e,n,{reason:w.EXPLICIT})}}),f.registerCommand({id:et,handler:async e=>(await e.get(c).saveAll({includeUntitled:!1,reason:w.EXPLICIT})).success}),f.registerCommand({id:tt,handler:async e=>{const t=e.get(S),r=e.get(c);let i=oe(e);if(!i){const o=t.activeGroup;o.activeEditor&&(i=[{groupId:o.id,editor:o.activeEditor}])}if(!(!i||i.length===0))try{await r.revert(i.filter(({editor:o})=>!o.hasCapability(O.Untitled)),{force:!0})}catch(o){e.get(ne).error(y.localize("genericRevertError","Failed to revert '{0}': {1}",i.map(({editor:l})=>l.getName()).join(", "),te(o,!1)))}}}),f.registerCommand({id:rt,handler:(e,t)=>{const r=e.get(Q),i=e.get(Le),o=r.getWorkspace(),n=_(t,e.get(v),e.get(c),e.get(S),e.get(h)).filter(s=>o.folders.some(m=>i.extUri.isEqual(m.uri,s)));return n.length===0?e.get(he).executeCommand(ct.ID):e.get(Re).removeFolders(n)}}),p.registerCommandAndKeybindingRule({weight:g.WorkbenchContrib+10,when:R.and(A,x,$.negate()),primary:a.LeftArrow,id:it,handler:e=>{const r=e.get(M).getActivePaneComposite(P.Sidebar);if(r?.getId()!==D)return;r.getViewPaneContainer().getExplorerView().previousCompressedStat()}}),p.registerCommandAndKeybindingRule({weight:g.WorkbenchContrib+10,when:R.and(A,x,ee.negate()),primary:a.RightArrow,id:ot,handler:e=>{const r=e.get(M).getActivePaneComposite(P.Sidebar);if(r?.getId()!==D)return;r.getViewPaneContainer().getExplorerView().nextCompressedStat()}}),p.registerCommandAndKeybindingRule({weight:g.WorkbenchContrib+10,when:R.and(A,x,$.negate()),primary:a.Home,id:nt,handler:e=>{const r=e.get(M).getActivePaneComposite(P.Sidebar);if(r?.getId()!==D)return;r.getViewPaneContainer().getExplorerView().firstCompressedStat()}}),p.registerCommandAndKeybindingRule({weight:g.WorkbenchContrib+10,when:R.and(A,x,ee.negate()),primary:a.End,id:dt,handler:e=>{const r=e.get(M).getActivePaneComposite(P.Sidebar);if(r?.getId()!==D)return;r.getViewPaneContainer().getExplorerView().lastCompressedStat()}}),p.registerCommandAndKeybindingRule({weight:g.WorkbenchContrib,when:null,primary:re?ie?E(d.CtrlCmd|a.KeyK,a.KeyN):d.CtrlCmd|d.Alt|a.KeyN:d.CtrlCmd|a.KeyN,secondary:re?[d.CtrlCmd|a.KeyN]:void 0,id:at,metadata:{description:st,args:[{isOptional:!0,name:"New Untitled Text File arguments",description:"The editor view type or language ID if known",schema:{type:"object",properties:{viewType:{type:"string"},languageId:{type:"string"}}}}]},handler:async(e,t)=>{await e.get(c).openEditor({resource:void 0,options:{override:t?.viewType,pinned:!0},languageId:t?.languageId})}}),f.registerCommand({id:mt,handler:async(e,t)=>{const r=e.get(c),i=e.get(lt),o=e.get(F),n=y.localize("newFileCommand.saveLabel","Create File"),l=ae(await i.defaultFilePath(),t?.fileName??"Untitled.txt"),s=await i.showSaveDialog({saveLabel:n,title:n,defaultUri:l});s&&(await o.createFile(s,void 0,{overwrite:!0}),await r.openEditor({resource:s,options:{override:t?.viewType,pinned:!0},languageId:t?.languageId}))}});export{wr as newWindowCommand,hr as openWindowCommand};
