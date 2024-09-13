import{coalesce as re}from"../../../../../base/common/arrays.js";import{AsyncIterableObject as ie}from"../../../../../base/common/async.js";import{CancellationTokenSource as H}from"../../../../../base/common/cancellation.js";import{CharCode as z}from"../../../../../base/common/charCode.js";import{Codicon as S}from"../../../../../base/common/codicons.js";import{KeyCode as C,KeyMod as p}from"../../../../../base/common/keyCodes.js";import{ResourceMap as ce}from"../../../../../base/common/map.js";import{isEqual as se}from"../../../../../base/common/resources.js";import*as ae from"../../../../../base/common/strings.js";import{URI as de}from"../../../../../base/common/uri.js";import{isCodeEditor as le,isDiffEditor as ue}from"../../../../../editor/browser/editorBrowser.js";import"../../../../../editor/browser/editorExtensions.js";import{IBulkEditService as me,ResourceTextEdit as L}from"../../../../../editor/browser/services/bulkEditService.js";import{ICodeEditorService as R}from"../../../../../editor/browser/services/codeEditorService.js";import{Range as pe}from"../../../../../editor/common/core/range.js";import{EditorContextKeys as B}from"../../../../../editor/common/editorContextKeys.js";import{isLocation as ge}from"../../../../../editor/common/languages.js";import{ILanguageService as Ce}from"../../../../../editor/common/languages/language.js";import"../../../../../editor/common/model.js";import{ILanguageFeaturesService as fe}from"../../../../../editor/common/services/languageFeatures.js";import{CopyAction as Ie}from"../../../../../editor/contrib/clipboard/browser/clipboard.js";import{localize as X,localize2 as I}from"../../../../../nls.js";import{Action2 as x,MenuId as y,registerAction2 as v}from"../../../../../platform/actions/common/actions.js";import{IClipboardService as j}from"../../../../../platform/clipboard/common/clipboardService.js";import{ContextKeyExpr as g}from"../../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as G}from"../../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as b}from"../../../../../platform/keybinding/common/keybindingsRegistry.js";import{INotificationService as ve,Severity as he}from"../../../../../platform/notification/common/notification.js";import{IProgressService as ke,ProgressLocation as Ee}from"../../../../../platform/progress/common/progress.js";import{TerminalLocation as ye}from"../../../../../platform/terminal/common/terminal.js";import"../../../../common/editor.js";import{IEditorService as F}from"../../../../services/editor/common/editorService.js";import{ITextFileService as Se}from"../../../../services/textfile/common/textfiles.js";import{accessibleViewInCodeBlock as D}from"../../../accessibility/browser/accessibilityConfiguration.js";import{InlineChatController as Ae}from"../../../inlineChat/browser/inlineChatController.js";import{insertCell as we}from"../../../notebook/browser/controller/cellOperations.js";import"../../../notebook/browser/notebookBrowser.js";import{CellKind as Be,NOTEBOOK_EDITOR_ID as xe}from"../../../notebook/common/notebookCommon.js";import{ITerminalEditorService as be,ITerminalGroupService as Te,ITerminalService as Me}from"../../../terminal/browser/terminal.js";import{CONTEXT_CHAT_EDIT_APPLIED as Y,CONTEXT_CHAT_ENABLED as w,CONTEXT_IN_CHAT_INPUT as J,CONTEXT_IN_CHAT_SESSION as h}from"../../common/chatContextKeys.js";import{ChatCopyKind as Q,IChatService as T}from"../../common/chatService.js";import{isRequestVM as Re,isResponseVM as f}from"../../common/chatViewModel.js";import{IChatCodeBlockContextProviderService as Fe,IChatWidgetService as Z}from"../chat.js";import{DefaultChatTextEditor as $}from"../codeBlockPart.js";import{CHAT_CATEGORY as k}from"./chatActions.js";const U=["fish","ps1","pwsh","powershell","sh","shellscript","zsh"];function q(c){return typeof c=="object"&&c!==null&&"code"in c&&"element"in c}function Pe(c){return typeof c=="object"&&c!==null&&"element"in c}function P(c){return f(c.element)&&c.element.errorDetails?.responseIsFiltered}function We(c){return f(c.element)?c.element.usedContext?.documents:void 0}function Ne(c){const r=new ce;for(const t of c){let e,o;if(de.isUri(t.reference)?e=t.reference:ge(t.reference)&&(e=t.reference.uri,o=t.reference.range),e){const i=r.get(e);i?o&&i.ranges.push(o):r.set(e,{uri:e,version:-1,ranges:o?[o]:[]})}}return[...r.values()]}function Le(c){return f(c.element)?[{type:"response",message:c.element.response.toMarkdown(),references:Ne(c.element.contentReferences)}]:Re(c.element)?[{type:"request",message:c.element.messageText}]:[]}class O extends x{run(r,...t){let e=t[0];if(!q(e)){const o=r.get(R),i=o.getFocusedCodeEditor()||o.getActiveCodeEditor();if(!i||(e=oe(i,r),!q(e)))return}return this.runWithContext(r,e)}}class ee extends O{async runWithContext(r,t){const e=r.get(F),o=r.get(Se),i=r.get(me),d=r.get(R),a=r.get(T),s=r.get(fe),n=r.get(ve),m=r.get(ke),l=r.get(Ce);if(P(t))return;if(t.codemapperUri&&await e.openEditor({resource:t.codemapperUri}),e.activeEditorPane?.getId()===xe)return this.handleNotebookEditor(l,m,n,s,i,d,a,e.activeEditorPane.getControl(),t);let u=e.activeTextEditorControl;if(ue(u)&&(u=u.getOriginalEditor().hasTextFocus()?u.getOriginalEditor():u.getModifiedEditor()),!le(u)||!u.hasModel())return;const E=u.getModel().uri,A=o.files.get(E)??o.untitled.get(E);!A||A.isReadonly()||await this.handleTextEditor(m,n,s,i,d,a,u,t)}async handleNotebookEditor(r,t,e,o,i,d,a,s,n){if(!s.hasModel()||s.isReadOnly)return;if(s.activeCodeEditor?.hasTextFocus()){const u=s.activeCodeEditor;if(u.hasModel())return this.handleTextEditor(t,e,o,i,d,a,u,n)}const m=s.getFocus(),l=Math.max(m.end-1,0);we(r,s,l,Be.Code,"below",n.code,!0),this.notifyUserAction(a,n)}async computeEdits(r,t,e,o,i,d,a,s){const n=a.getModel(),m=a.getSelection()??new pe(n.getLineCount(),1,n.getLineCount(),1),l=De(s.code,n,m.startLineNumber);if(l!==void 0)return{edits:[new L(n.uri,{range:m,text:l})]}}get showPreview(){return!1}async handleTextEditor(r,t,e,o,i,d,a,s){const n=await this.computeEdits(r,t,e,o,i,d,a,s);if(this.notifyUserAction(d,s,n),!!n)if(this.showPreview){if(!await this.applyWithInlinePreview(i,n.edits,a)){await o.apply(n.edits,{showPreview:!0});const l=a.getModel();i.listCodeEditors().find(u=>u.getModel()?.uri.toString()===l.uri.toString())?.focus()}}else{await o.apply(n.edits);const m=a.getModel();i.listCodeEditors().find(l=>l.getModel()?.uri.toString()===m.uri.toString())?.focus()}}async applyWithInlinePreview(r,t,e){const o=t[0];if(!L.is(o))return!1;const i=o.resource,d=re(t.map(s=>L.is(s)&&se(i,s.resource)?s.textEdit:void 0));if(d.length!==t.length)return!1;const a=await r.openCodeEditor({resource:i},e);if(a){const s=Ae.get(a);if(s){const n=new H;try{return await s.reviewEdits(d[0].range,ie.fromArray(d),n.token)}finally{n.dispose()}}}return!1}notifyUserAction(r,t,e){f(t.element)&&r.notifyUserAction({agentId:t.element.agent?.id,command:t.element.slashCommand?.name,sessionId:t.element.sessionId,requestId:t.element.requestId,result:t.element.result,action:{kind:"insert",codeBlockIndex:t.codeBlockIndex,totalCharacters:t.code.length,userAction:this.desc.id,codeMapper:e?.codeMapper}})}}function De(c,r,t){const e=ae.splitLines(c);if(e.length===0)return;const o=r.getFormattingOptions(),i=te(r.getLineContent(t),o.tabSize).level,d=e.map(n=>te(n,o.tabSize)),a=d.reduce((n,m,l)=>m.length!==e[l].length?Math.min(m.level,n):n,Number.MAX_VALUE);if(a===Number.MAX_VALUE||a===i)return;const s=[];for(let n=0;n<e.length;n++){const{level:m,length:l}=d[n],u=Math.max(0,i+m-a),E=o.insertSpaces?" ".repeat(o.tabSize*u):"	".repeat(u);s.push(E+e[n].substring(l))}return s.join(`
`)}function te(c,r){let t=0,e=0,o=0,i=0;const d=c.length;for(;o<d;){const a=c.charCodeAt(o);if(a===z.Space)t++,t===r&&(e++,t=0,i=o+1);else if(a===z.Tab)e++,t=0,i=o+1;else break;o++}return{level:e,length:i}}function Qt(){v(class extends x{constructor(){super({id:"workbench.action.chat.copyCodeBlock",title:I("interactive.copyCodeBlock.label","Copy"),f1:!1,category:k,icon:S.copy,menu:{id:y.ChatCodeBlock,group:"navigation",order:30}})}run(t,...e){const o=e[0];if(!q(o)||P(o))return;t.get(j).writeText(o.code),f(o.element)&&t.get(T).notifyUserAction({agentId:o.element.agent?.id,command:o.element.slashCommand?.name,sessionId:o.element.sessionId,requestId:o.element.requestId,result:o.element.result,action:{kind:"copy",codeBlockIndex:o.codeBlockIndex,copyKind:Q.Toolbar,copiedCharacters:o.code.length,totalCharacters:o.code.length,copiedText:o.code}})}}),Ie?.addImplementation(5e4,"chat-codeblock",r=>{const t=r.get(R).getFocusedCodeEditor();if(!t)return!1;const e=t.getModel();if(!e)return!1;const o=oe(t,r);if(!o)return!1;const i=t.getSelections()?.length===1&&t.getSelection()?.isEmpty(),d=i?e.getValue():t.getSelections()?.reduce((m,l)=>m+e.getValueInRange(l),"")??"",a=e.getValueLength(),s=r.get(T),n=o.element;return n&&s.notifyUserAction({agentId:n.agent?.id,command:n.slashCommand?.name,sessionId:n.sessionId,requestId:n.requestId,result:n.result,action:{kind:"copy",codeBlockIndex:o.codeBlockIndex,copyKind:Q.Action,copiedText:d,copiedCharacters:d.length,totalCharacters:a}}),i?(r.get(j).writeText(o.code),!0):!1}),v(class extends ee{constructor(){super({id:"workbench.action.chat.applyInEditor",title:I("interactive.applyInEditor.label","Apply in Editor"),precondition:w,f1:!0,category:k,icon:S.sparkle,menu:{id:y.ChatCodeBlock,group:"navigation",when:g.and(h,...U.map(t=>g.notEquals(B.languageId.key,t))),order:10},keybinding:{when:g.or(g.and(h,J.negate()),D),primary:p.CtrlCmd|C.Enter,mac:{primary:p.WinCtrl|C.Enter},weight:b.ExternalExtension+1}})}async computeEdits(t,e,o,i,d,a,s,n){const m=s.getModel(),l=o.mappedEditsProvider.ordered(m);if(l.length>0){const u=[],E=m.uri,A=m.getVersionId(),V=s.getSelections();V.length>0&&u.push([{uri:E,version:A,ranges:V}]);const _=We(n);_&&u.push(_);const W=new H;try{const M=await t.withProgress({location:Ee.Notification,delay:500,sticky:!0,cancellable:!0},async ne=>{for(const N of l){ne.report({message:X("applyCodeBlock.progress","Applying code block using {0}...",N.displayName)});const K=await N.provideMappedEdits(m,[n.code],{documents:u,conversation:Le(n)},W.token);if(K)return{edits:K.edits,codeMapper:N.displayName}}},()=>W.cancel());if(M)return M}catch(M){e.notify({severity:he.Error,message:X("applyCodeBlock.error","Failed to apply code block: {0}",M.message)})}finally{W.dispose()}}}get showPreview(){return!0}}),v(class extends ee{constructor(){super({id:"workbench.action.chat.insertCodeBlock",title:I("interactive.insertCodeBlock.label","Insert At Cursor"),precondition:w,f1:!0,category:k,icon:S.insert,menu:{id:y.ChatCodeBlock,group:"navigation",when:h,order:20},keybinding:{when:g.or(g.and(h,J.negate()),D),primary:p.CtrlCmd|C.Enter,mac:{primary:p.WinCtrl|C.Enter},weight:b.ExternalExtension+1}})}}),v(class extends O{constructor(){super({id:"workbench.action.chat.insertIntoNewFile",title:I("interactive.insertIntoNewFile.label","Insert into New File"),precondition:w,f1:!0,category:k,icon:S.newFile,menu:{id:y.ChatCodeBlock,group:"navigation",isHiddenByDefault:!0,order:40}})}async runWithContext(t,e){if(P(e))return;const o=t.get(F),i=t.get(T);o.openEditor({contents:e.code,languageId:e.languageId,resource:void 0}),f(e.element)&&i.notifyUserAction({agentId:e.element.agent?.id,command:e.element.slashCommand?.name,sessionId:e.element.sessionId,requestId:e.element.requestId,result:e.element.result,action:{kind:"insert",codeBlockIndex:e.codeBlockIndex,totalCharacters:e.code.length,newFile:!0,userAction:this.desc.id}})}}),v(class extends O{constructor(){super({id:"workbench.action.chat.runInTerminal",title:I("interactive.runInTerminal.label","Insert into Terminal"),precondition:w,f1:!0,category:k,icon:S.terminal,menu:[{id:y.ChatCodeBlock,group:"navigation",when:g.and(h,g.or(...U.map(t=>g.equals(B.languageId.key,t))))},{id:y.ChatCodeBlock,group:"navigation",isHiddenByDefault:!0,when:g.and(h,...U.map(t=>g.notEquals(B.languageId.key,t)))}],keybinding:[{primary:p.CtrlCmd|p.Alt|C.Enter,mac:{primary:p.WinCtrl|p.Alt|C.Enter},weight:b.EditorContrib,when:g.or(h,D)}]})}async runWithContext(t,e){if(P(e))return;const o=t.get(T),i=t.get(Me),d=t.get(F),a=t.get(be),s=t.get(Te);let n=await i.getActiveOrCreateInstance();if(n=n.xterm?.isStdinDisabled||n.shellLaunchConfig.isFeatureTerminal?await i.createTerminal():n,i.setActiveInstance(n),await n.focusWhenReady(!0),n.target===ye.Editor){const l=d.findEditors(n.resource);a.openEditor(n,{viewColumn:l?.[0].groupId})}else s.showPanel(!0);n.runCommand(e.code,!1),f(e.element)&&o.notifyUserAction({agentId:e.element.agent?.id,command:e.element.slashCommand?.name,sessionId:e.element.sessionId,requestId:e.element.requestId,result:e.element.result,action:{kind:"runInTerminal",codeBlockIndex:e.codeBlockIndex,languageId:e.languageId}})}});function c(r,t){const e=r.get(R),i=r.get(Z).lastFocusedWidget;if(!i)return;const a=e.getFocusedCodeEditor()?.getModel()?.uri,s=a?i.getCodeBlockInfoForEditor(a):void 0,n=!i.inputEditor.hasWidgetFocus()&&i.getFocus(),m=f(n)?n:void 0,l=s?s.element:m??i.viewModel?.getItems().reverse().find(A=>f(A));if(!l||!f(l))return;i.reveal(l);const u=i.getCodeBlockInfosForResponse(l),E=s?(s.codeBlockIndex+(t?-1:1)+u.length)%u.length:t?u.length-1:0;u[E]?.focus()}v(class extends x{constructor(){super({id:"workbench.action.chat.nextCodeBlock",title:I("interactive.nextCodeBlock.label","Next Code Block"),keybinding:{primary:p.CtrlCmd|p.Alt|C.PageDown,mac:{primary:p.CtrlCmd|p.Alt|C.PageDown},weight:b.WorkbenchContrib,when:h},precondition:w,f1:!0,category:k})}run(t,...e){c(t)}}),v(class extends x{constructor(){super({id:"workbench.action.chat.previousCodeBlock",title:I("interactive.previousCodeBlock.label","Previous Code Block"),keybinding:{primary:p.CtrlCmd|p.Alt|C.PageUp,mac:{primary:p.CtrlCmd|p.Alt|C.PageUp},weight:b.WorkbenchContrib,when:h},precondition:w,f1:!0,category:k})}run(t,...e){c(t,!0)}})}function oe(c,r){const t=r.get(Z),e=r.get(Fe),o=c.getModel();if(!o)return;const d=t.lastFocusedWidget?.getCodeBlockInfoForEditor(o.uri);if(!d){for(const a of e.providers){const s=a.getCodeBlockContext(c);if(s)return s}return}return{element:d.element,codeBlockIndex:d.codeBlockIndex,code:c.getValue(),languageId:c.getModel().getLanguageId(),codemapperUri:d.codemapperUri}}function eo(){class c extends x{run(t,...e){const o=e[0];if(Pe(o))return this.runWithContext(t,o)}}v(class extends c{constructor(){super({id:"workbench.action.chat.applyCompareEdits",title:I("interactive.compare.apply","Apply Edits"),f1:!1,category:k,icon:S.check,precondition:g.and(B.hasChanges,Y.negate()),menu:{id:y.ChatCompareBlock,group:"navigation",order:1}})}async runWithContext(t,e){const o=t.get(F);await t.get(G).createInstance($).apply(e.element,e.edit,e.diffEditor),await o.openEditor({resource:e.edit.uri,options:{revealIfVisible:!0}})}}),v(class extends c{constructor(){super({id:"workbench.action.chat.discardCompareEdits",title:I("interactive.compare.discard","Discard Edits"),f1:!1,category:k,icon:S.trash,precondition:g.and(B.hasChanges,Y.negate()),menu:{id:y.ChatCompareBlock,group:"navigation",order:2}})}async runWithContext(t,e){t.get(G).createInstance($).discard(e.element,e.edit)}})}export{q as isCodeBlockActionContext,Pe as isCodeCompareBlockActionContext,Qt as registerChatCodeBlockActions,eo as registerChatCodeCompareBlockActions};
