import{coalesce as ie,firstOrDefault as K}from"../../../../../vs/base/common/arrays.js";import{CancellationToken as H,CancellationTokenSource as Q}from"../../../../../vs/base/common/cancellation.js";import{toErrorMessage as ne}from"../../../../../vs/base/common/errorMessage.js";import{Event as se}from"../../../../../vs/base/common/event.js";import{DisposableStore as R}from"../../../../../vs/base/common/lifecycle.js";import{ResourceSet as q}from"../../../../../vs/base/common/map.js";import{Schemas as ce}from"../../../../../vs/base/common/network.js";import{basename as $,basenameOrAuthority as z,dirname as ae}from"../../../../../vs/base/common/resources.js";import{URI as le}from"../../../../../vs/base/common/uri.js";import"../../../../../vs/editor/browser/editorExtensions.js";import{ILanguageService as me}from"../../../../../vs/editor/common/languages/language.js";import{getIconClasses as ue}from"../../../../../vs/editor/common/services/getIconClasses.js";import{IModelService as de}from"../../../../../vs/editor/common/services/model.js";import{localize as a,localize2 as m}from"../../../../../vs/nls.js";import{Action2 as u,MenuId as S,MenuRegistry as ye,registerAction2 as d}from"../../../../../vs/platform/actions/common/actions.js";import{ICommandService as T}from"../../../../../vs/platform/commands/common/commands.js";import{ContextKeyExpr as W,IContextKeyService as pe,RawContextKey as ge}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IDialogService as B}from"../../../../../vs/platform/dialogs/common/dialogs.js";import"../../../../../vs/platform/editor/common/editor.js";import{IFileService as X}from"../../../../../vs/platform/files/common/files.js";import{ILabelService as G}from"../../../../../vs/platform/label/common/label.js";import{IQuickInputService as U}from"../../../../../vs/platform/quickinput/common/quickInput.js";import{API_OPEN_DIFF_EDITOR_COMMAND_ID as x}from"../../../../../vs/workbench/browser/parts/editor/editorCommands.js";import{ActiveEditorContext as fe,ResourceContextKey as we}from"../../../../../vs/workbench/common/contextkeys.js";import{EditorResourceAccessor as Se,SaveSourceRegistry as h,SideBySideEditor as j}from"../../../../../vs/workbench/common/editor.js";import{getLocalHistoryDateFormatter as ve,LOCAL_HISTORY_ICON_RESTORE as Ce,LOCAL_HISTORY_MENU_CONTEXT_KEY as k}from"../../../../../vs/workbench/contrib/localHistory/browser/localHistory.js";import{LocalHistoryFileSystemProvider as E}from"../../../../../vs/workbench/contrib/localHistory/browser/localHistoryFileSystemProvider.js";import{IEditorService as A}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{IHistoryService as ke}from"../../../../../vs/workbench/services/history/common/history.js";import{IPathService as Ie}from"../../../../../vs/workbench/services/path/common/pathService.js";import{IWorkingCopyHistoryService as g}from"../../../../../vs/workbench/services/workingCopy/common/workingCopyHistory.js";import{IWorkingCopyService as he}from"../../../../../vs/workbench/services/workingCopy/common/workingCopyService.js";const M=m("localHistory.category","Local History"),D=W.has("config.workbench.localHistory.enabled"),He=m("localHistory.compareWithFile","Compare with File");d(class extends u{constructor(){super({id:"workbench.action.localHistory.compareWithFile",title:He,menu:{id:S.TimelineItemContext,group:"1_compare",order:1,when:k}})}async run(e,o){const t=e.get(T),r=e.get(g),{entry:n}=await v(r,o);if(n)return t.executeCommand(x,...O(n,n.workingCopy.resource))}}),d(class extends u{constructor(){super({id:"workbench.action.localHistory.compareWithPrevious",title:m("localHistory.compareWithPrevious","Compare with Previous"),menu:{id:S.TimelineItemContext,group:"1_compare",order:2,when:k}})}async run(e,o){const t=e.get(T),r=e.get(g),n=e.get(A),{entry:s,previous:i}=await v(r,o);if(s)return i?t.executeCommand(x,...O(i,s)):Y(s,n)}});let N;const J=new ge("localHistoryItemSelectedForCompare",!1,!0);d(class extends u{constructor(){super({id:"workbench.action.localHistory.selectForCompare",title:m("localHistory.selectForCompare","Select for Compare"),menu:{id:S.TimelineItemContext,group:"2_compare_with",order:2,when:k}})}async run(e,o){const t=e.get(g),r=e.get(pe),{entry:n}=await v(t,o);n&&(N=o,J.bindTo(r).set(!0))}}),d(class extends u{constructor(){super({id:"workbench.action.localHistory.compareWithSelected",title:m("localHistory.compareWithSelected","Compare with Selected"),menu:{id:S.TimelineItemContext,group:"2_compare_with",order:1,when:W.and(k,J)}})}async run(e,o){const t=e.get(g),r=e.get(T);if(!N)return;const n=(await v(t,N)).entry;if(!n)return;const{entry:s}=await v(t,o);if(s)return r.executeCommand(x,...O(n,s))}}),d(class extends u{constructor(){super({id:"workbench.action.localHistory.open",title:m("localHistory.open","Show Contents"),menu:{id:S.TimelineItemContext,group:"3_contents",order:1,when:k}})}async run(e,o){const t=e.get(g),r=e.get(A),{entry:n}=await v(t,o);if(n)return Y(n,r)}});const Z=m("localHistory.restore","Restore Contents");d(class extends u{constructor(){super({id:"workbench.action.localHistory.restoreViaEditor",title:Z,menu:{id:S.EditorTitle,group:"navigation",order:-10,when:we.Scheme.isEqualTo(E.SCHEMA)},icon:Ce})}async run(e,o){const{associatedResource:t,location:r}=E.fromLocalHistoryFileSystem(o);return ee(e,{uri:t,handle:z(r)})}}),d(class extends u{constructor(){super({id:"workbench.action.localHistory.restore",title:Z,menu:{id:S.TimelineItemContext,group:"3_contents",order:2,when:k}})}async run(e,o){return ee(e,o)}});const Ee=h.registerSource("localHistoryRestore.source",a("localHistoryRestore.source","File Restored"));async function ee(e,o){const t=e.get(X),r=e.get(B),n=e.get(he),s=e.get(g),i=e.get(A),{entry:l}=await v(s,o);if(l){const{confirmed:y}=await r.confirm({type:"warning",message:a("confirmRestoreMessage","Do you want to restore the contents of '{0}'?",$(l.workingCopy.resource)),detail:a("confirmRestoreDetail","Restoring will discard any unsaved changes."),primaryButton:a({key:"restoreButtonLabel",comment:["&& denotes a mnemonic"]},"&&Restore")});if(!y)return;const C=n.getAll(l.workingCopy.resource);if(C)for(const f of C)f.isDirty()&&await f.revert({soft:!0});try{await t.cloneFile(l.location,l.workingCopy.resource)}catch(f){await r.error(a("unableToRestore","Unable to restore '{0}'.",$(l.workingCopy.resource)),ne(f));return}if(C)for(const f of C)await f.revert({force:!0});await i.openEditor({resource:l.workingCopy.resource}),await s.addEntry({resource:l.workingCopy.resource,source:Ee},H.None),await oe(l,i)}}d(class extends u{constructor(){super({id:"workbench.action.localHistory.restoreViaPicker",title:m("localHistory.restoreViaPicker","Find Entry to Restore"),f1:!0,category:M,precondition:D})}async run(e){const o=e.get(g),t=e.get(U),r=e.get(de),n=e.get(me),s=e.get(G),i=e.get(A),l=e.get(X),y=e.get(T),C=e.get(ke),f=new R,w=f.add(t.createQuickPick());let L=new Q;f.add(w.onDidHide(()=>L.dispose(!0))),w.busy=!0,w.show();const _=new q(await o.getAll(L.token)),te=new q(ie(C.getHistory().map(({resource:c})=>c))),F=[];for(const c of te)_.has(c)&&(F.push(c),_.delete(c));F.push(...[..._].sort((c,I)=>c.fsPath<I.fsPath?-1:1)),w.busy=!1,w.placeholder=a("restoreViaPicker.filePlaceholder","Select the file to show local history for"),w.matchOnLabel=!0,w.matchOnDescription=!0,w.items=[...F].map(c=>({resource:c,label:z(c),description:s.getUriLabel(ae(c),{relative:!0}),iconClasses:ue(r,n,c)})),await se.toPromise(w.onDidAccept),f.dispose();const V=K(w.selectedItems)?.resource;if(!V)return;const P=new R,p=P.add(t.createQuickPick());L=new Q,P.add(p.onDidHide(()=>L.dispose(!0))),p.busy=!0,p.show();const re=await o.getEntries(V,L.token);p.busy=!1,p.canAcceptInBackground=!0,p.placeholder=a("restoreViaPicker.entryPlaceholder","Select the local history entry to open"),p.matchOnLabel=!0,p.matchOnDescription=!0,p.items=Array.from(re).reverse().map(c=>({entry:c,label:`$(circle-outline) ${h.getSourceLabel(c.source)}`,description:b(c.timestamp)})),P.add(p.onDidAccept(async c=>{c.inBackground||P.dispose();const I=K(p.selectedItems);return I?await l.exists(I.entry.workingCopy.resource)?y.executeCommand(x,...O(I.entry,I.entry.workingCopy.resource,{preserveFocus:c.inBackground})):Y(I.entry,i,{preserveFocus:c.inBackground}):void 0}))}}),ye.appendMenuItem(S.TimelineTitle,{command:{id:"workbench.action.localHistory.restoreViaPicker",title:m("localHistory.restoreViaPickerMenu","Local History: Find Entry to Restore...")},group:"submenu",order:1,when:D}),d(class extends u{constructor(){super({id:"workbench.action.localHistory.rename",title:m("localHistory.rename","Rename"),menu:{id:S.TimelineItemContext,group:"5_edit",order:1,when:k}})}async run(e,o){const t=e.get(g),r=e.get(U),{entry:n}=await v(t,o);if(n){const s=new R,i=s.add(r.createInputBox());i.title=a("renameLocalHistoryEntryTitle","Rename Local History Entry"),i.ignoreFocusOut=!0,i.placeholder=a("renameLocalHistoryPlaceholder","Enter the new name of the local history entry"),i.value=h.getSourceLabel(n.source),i.show(),s.add(i.onDidAccept(()=>{i.value&&t.updateEntry(n,{source:i.value},H.None),s.dispose()}))}}}),d(class extends u{constructor(){super({id:"workbench.action.localHistory.delete",title:m("localHistory.delete","Delete"),menu:{id:S.TimelineItemContext,group:"5_edit",order:2,when:k}})}async run(e,o){const t=e.get(g),r=e.get(A),n=e.get(B),{entry:s}=await v(t,o);if(s){const{confirmed:i}=await n.confirm({type:"warning",message:a("confirmDeleteMessage","Do you want to delete the local history entry of '{0}' from {1}?",s.workingCopy.name,b(s.timestamp)),detail:a("confirmDeleteDetail","This action is irreversible!"),primaryButton:a({key:"deleteButtonLabel",comment:["&& denotes a mnemonic"]},"&&Delete")});if(!i)return;await t.removeEntry(s,H.None),await oe(s,r)}}}),d(class extends u{constructor(){super({id:"workbench.action.localHistory.deleteAll",title:m("localHistory.deleteAll","Delete All"),f1:!0,category:M,precondition:D})}async run(e){const o=e.get(B),t=e.get(g),{confirmed:r}=await o.confirm({type:"warning",message:a("confirmDeleteAllMessage","Do you want to delete all entries of all files in local history?"),detail:a("confirmDeleteAllDetail","This action is irreversible!"),primaryButton:a({key:"deleteAllButtonLabel",comment:["&& denotes a mnemonic"]},"&&Delete All")});r&&await t.removeAll(H.None)}}),d(class extends u{constructor(){super({id:"workbench.action.localHistory.create",title:m("localHistory.create","Create Entry"),f1:!0,category:M,precondition:W.and(D,fe)})}async run(e){const o=e.get(g),t=e.get(U),r=e.get(A),n=e.get(G),s=e.get(Ie),i=Se.getOriginalUri(r.activeEditor,{supportSideBySide:j.PRIMARY});if(i?.scheme!==s.defaultUriScheme&&i?.scheme!==ce.vscodeUserData)return;const l=new R,y=l.add(t.createInputBox());y.title=a("createLocalHistoryEntryTitle","Create Local History Entry"),y.ignoreFocusOut=!0,y.placeholder=a("createLocalHistoryPlaceholder","Enter the new name of the local history entry for '{0}'",n.getUriBasenameLabel(i)),y.show(),l.add(y.onDidAccept(async()=>{const C=y.value;l.dispose(),C&&await o.addEntry({resource:i,source:y.value},H.None)}))}});async function Y(e,o,t){const r=E.toLocalHistoryFileSystem({location:e.location,associatedResource:e.workingCopy.resource});await o.openEditor({resource:r,label:a("localHistoryEditorLabel","{0} ({1} \u2022 {2})",e.workingCopy.name,h.getSourceLabel(e.source),b(e.timestamp)),options:t})}async function oe(e,o){const t=E.toLocalHistoryFileSystem({location:e.location,associatedResource:e.workingCopy.resource}),r=o.findEditors(t,{supportSideBySide:j.ANY});await o.closeEditors(r,{preserveFocus:!0})}function O(e,o,t){const r=E.toLocalHistoryFileSystem({location:e.location,associatedResource:e.workingCopy.resource});let n,s;if(le.isUri(o))s=o,n=a("localHistoryCompareToFileEditorLabel","{0} ({1} \u2022 {2}) \u2194 {3}",e.workingCopy.name,h.getSourceLabel(e.source),b(e.timestamp),e.workingCopy.name);else{const i=o;s=E.toLocalHistoryFileSystem({location:i.location,associatedResource:i.workingCopy.resource}),n=a("localHistoryCompareToPreviousEditorLabel","{0} ({1} \u2022 {2}) \u2194 {3} ({4} \u2022 {5})",e.workingCopy.name,h.getSourceLabel(e.source),b(e.timestamp),i.workingCopy.name,h.getSourceLabel(i.source),b(i.timestamp))}return[r,s,n,t?[void 0,t]:void 0]}async function v(e,o){const t=await e.getEntries(o.uri,H.None);let r,n;for(let s=0;s<t.length;s++){const i=t[s];if(i.id===o.handle){r=i,n=t[s-1];break}}return{entry:r,previous:n}}const Ae=/\//g;function b(e){return`${ve().format(e).replace(Ae,"-")}`}export{He as COMPARE_WITH_FILE_LABEL,v as findLocalHistoryEntry,O as toDiffEditorArguments};
