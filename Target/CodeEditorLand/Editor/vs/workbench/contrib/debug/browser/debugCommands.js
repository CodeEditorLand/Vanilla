import{List as N}from"../../../../../vs/base/browser/ui/list/listWidget.js";import{KeyCode as d,KeyMod as p}from"../../../../../vs/base/common/keyCodes.js";import{DisposableStore as ue}from"../../../../../vs/base/common/lifecycle.js";import{deepClone as Se}from"../../../../../vs/base/common/objects.js";import{isWeb as pe,isWindows as Ce}from"../../../../../vs/base/common/platform.js";import{isCodeEditor as D}from"../../../../../vs/editor/browser/editorBrowser.js";import"../../../../../vs/editor/browser/editorExtensions.js";import{EditorContextKeys as v}from"../../../../../vs/editor/common/editorContextKeys.js";import{ITextResourcePropertiesService as me}from"../../../../../vs/editor/common/services/textResourceConfiguration.js";import*as a from"../../../../../vs/nls.js";import"../../../../../vs/platform/action/common/action.js";import{Action2 as fe,MenuId as B,MenuRegistry as q,registerAction2 as be}from"../../../../../vs/platform/actions/common/actions.js";import{IClipboardService as he}from"../../../../../vs/platform/clipboard/common/clipboardService.js";import{CommandsRegistry as C,ICommandService as Ee}from"../../../../../vs/platform/commands/common/commands.js";import{IConfigurationService as R}from"../../../../../vs/platform/configuration/common/configuration.js";import{ContextKeyExpr as f,IContextKeyService as x}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{InputFocusedContext as _e}from"../../../../../vs/platform/contextkey/common/contextkeys.js";import{KeybindingsRegistry as g,KeybindingWeight as u}from"../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{IListService as T}from"../../../../../vs/platform/list/browser/listService.js";import{INotificationService as H}from"../../../../../vs/platform/notification/common/notification.js";import{IQuickInputService as y}from"../../../../../vs/platform/quickinput/common/quickInput.js";import{ActiveEditorContext as Ie,PanelFocusContext as Te,ResourceContextKey as we}from"../../../../../vs/workbench/common/contextkeys.js";import{ViewContainerLocation as Y}from"../../../../../vs/workbench/common/views.js";import{CONTEXT_IN_CHAT_SESSION as ke}from"../../../../../vs/workbench/contrib/chat/common/chatContextKeys.js";import{openBreakpointSource as Ae}from"../../../../../vs/workbench/contrib/debug/browser/breakpointsView.js";import{showDebugSessionMenu as De}from"../../../../../vs/workbench/contrib/debug/browser/debugSessionPicker.js";import{CONTEXT_BREAKPOINT_INPUT_FOCUSED as ve,CONTEXT_BREAKPOINTS_FOCUSED as F,CONTEXT_DEBUG_STATE as _,CONTEXT_DEBUGGERS_AVAILABLE as P,CONTEXT_DISASSEMBLY_VIEW_FOCUS as O,CONTEXT_EXPRESSION_SELECTED as xe,CONTEXT_FOCUSED_SESSION_IS_ATTACH as Q,CONTEXT_IN_DEBUG_MODE as A,CONTEXT_IN_DEBUG_REPL as J,CONTEXT_JUMP_TO_CURSOR_SUPPORTED as ye,CONTEXT_STEP_INTO_TARGETS_SUPPORTED as Oe,CONTEXT_VARIABLES_FOCUSED as Le,CONTEXT_WATCH_EXPRESSIONS_FOCUSED as j,EDITOR_CONTRIBUTION_ID as Ne,getStateLabel as Be,IDebugService as l,isFrameDeemphasized as Re,REPL_VIEW_ID as M,State as U,VIEWLET_ID as Fe}from"../../../../../vs/workbench/contrib/debug/common/debug.js";import{Breakpoint as $,DataBreakpoint as Pe,Expression as w,FunctionBreakpoint as Me,Variable as Z}from"../../../../../vs/workbench/contrib/debug/common/debugModel.js";import{saveAllBeforeDebugStart as Ue}from"../../../../../vs/workbench/contrib/debug/common/debugUtils.js";import{showLoadedScriptMenu as Ve}from"../../../../../vs/workbench/contrib/debug/common/loadedScriptsPicker.js";import{VIEWLET_ID as Ke}from"../../../../../vs/workbench/contrib/extensions/common/extensions.js";import{TEXT_FILE_EDITOR_ID as We}from"../../../../../vs/workbench/contrib/files/common/files.js";import{IEditorService as I}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{IPaneCompositePartService as ee}from"../../../../../vs/workbench/services/panecomposite/browser/panecomposite.js";import{IViewsService as te}from"../../../../../vs/workbench/services/views/common/viewsService.js";const ze="debug.addConfiguration",ne="editor.debug.action.toggleInlineBreakpoint",Ge="debug.copyStackTrace",Xe="workbench.action.debug.reverseContinue",qe="workbench.action.debug.stepBack",He="workbench.action.debug.restart",Ye="workbench.action.debug.terminateThread",Qe="workbench.action.debug.stepOver",Je="workbench.action.debug.stepInto",je="workbench.action.debug.stepIntoTarget",$e="workbench.action.debug.stepOut",Ze="workbench.action.debug.pause",et="workbench.action.debug.disconnect",tt="workbench.action.debug.disconnectAndSuspend",nt="workbench.action.debug.stop",ot="workbench.action.debug.restartFrame",it="workbench.action.debug.continue",rt="workbench.debug.action.focusRepl",oe="debug.jumpToCursor",st="workbench.action.debug.focusProcess",ie="workbench.action.debug.selectandstart",at="workbench.action.debug.selectDebugConsole",ct="workbench.action.debug.selectDebugSession",hn="workbench.action.debug.configure",re="workbench.action.debug.start",dt="workbench.action.debug.run",lt="debug.renameWatchExpression",gt="debug.setWatchExpression",ut="debug.removeWatchExpression",St="workbench.action.debug.nextConsole",pt="workbench.action.debug.prevConsole",Ct="workbench.action.debug.showLoadedScripts",mt="workbench.action.debug.callStackTop",ft="workbench.action.debug.callStackBottom",bt="workbench.action.debug.callStackUp",ht="workbench.action.debug.callStackDown",En="debug.addToWatchExpressions",_n="debug.copyEvaluatePath",In="workbench.debug.viewlet.action.copyValue",V=a.localize2("debug","Debug"),Tn=a.localize2("restartDebug","Restart"),wn=a.localize2("stepOverDebug","Step Over"),kn=a.localize2("stepIntoDebug","Step Into"),An=a.localize2("stepIntoTargetDebug","Step Into Target"),Dn=a.localize2("stepOutDebug","Step Out"),vn=a.localize2("pauseDebug","Pause"),xn=a.localize2("disconnect","Disconnect"),yn=a.localize2("disconnectSuspend","Disconnect and Suspend"),On=a.localize2("stop","Stop"),Ln=a.localize2("continueDebug","Continue"),Nn=a.localize2("focusSession","Focus Session"),Bn=a.localize2("selectAndStartDebugging","Select and Start Debugging"),Rn=a.localize("openLaunchJson","Open '{0}'","launch.json"),Fn=a.localize2("startDebug","Start Debugging"),Pn=a.localize2("startWithoutDebugging","Start Without Debugging"),Mn=a.localize2("nextDebugConsole","Focus Next Debug Console"),Un=a.localize2("prevDebugConsole","Focus Previous Debug Console"),Vn=a.localize2("openLoadedScript","Open Loaded Script..."),Kn=a.localize2("callStackTop","Navigate to Top of Call Stack"),Wn=a.localize2("callStackBottom","Navigate to Bottom of Call Stack"),zn=a.localize2("callStackUp","Navigate Up Call Stack"),Gn=a.localize2("callStackDown","Navigate Down Call Stack"),Xn=a.localize2("copyAsExpression","Copy as Expression"),qn=a.localize2("copyValue","Copy Value"),Hn=a.localize2("addToWatchExpressions","Add to Watch"),Yn=a.localize2("selectDebugConsole","Select Debug Console"),Qn=a.localize2("selectDebugSession","Select Debug Session"),Et="debug ",_t="debug consoles ";function It(e){return e&&typeof e.sessionId=="string"&&typeof e.threadId=="string"}async function b(e,i,t){const n=e.get(l);let o;if(It(i)){const r=n.getModel().getSession(i.sessionId);r&&(o=r.getAllThreads().find(s=>s.getId()===i.threadId))}else if(K(i)){const r=n.getModel().getSession(i.sessionId);if(r){const s=r.getAllThreads();o=s.length>0?s[0]:void 0}}if(!o&&(o=n.getViewModel().focusedThread,!o)){const r=n.getViewModel().focusedSession,s=r?r.getAllThreads():void 0;o=s&&s.length?s[0]:void 0}o&&await t(o)}function Tt(e){return e&&typeof e.sessionId=="string"&&typeof e.threadId=="string"&&typeof e.frameId=="string"}function se(e,i){if(Tt(i)){const t=e.getModel().getSession(i.sessionId);if(t){const n=t.getAllThreads().find(o=>o.getId()===i.threadId);if(n)return n.getCallStack().find(o=>o.getId()===i.frameId)}}else return e.getViewModel().focusedStackFrame}function K(e){return e&&typeof e.sessionId=="string"}async function ae(e,i){const t=e.get(l),n=e.get(te),o=t.getModel().getSessions(!0).filter(c=>c.hasSeparateRepl());let r=t.getViewModel().focusedSession,s=0;if(o.length>0&&r){for(;r&&!r.hasSeparateRepl();)r=r.parentSession;if(r){const c=o.indexOf(r);i?s=c===o.length-1?0:c+1:s=c===0?o.length-1:c-1}}await t.focusStackFrame(void 0,void 0,o[s],{explicit:!0}),n.isViewVisible(M)||await n.openView(M,!0)}async function ce(e,i){const t=e.getViewModel().focusedStackFrame;if(t){let n=t.thread.getCallStack(),o=n.findIndex(s=>s.frameId===t.frameId),r;if(i){if(o>=n.length-1)if(t.thread.reachedEndOfCallStack){le(e);return}else await e.getModel().fetchCallstack(t.thread,20),n=t.thread.getCallStack(),o=n.findIndex(s=>s.frameId===t.frameId);r=W(!0,n,o)}else{if(o<=0){de(e);return}r=W(!1,n,o)}r&&e.focusStackFrame(r,void 0,void 0,{preserveFocus:!1})}}async function de(e){const i=e.getViewModel().focusedThread;if(i){await e.getModel().fetchCallstack(i);const t=i.getCallStack();if(t.length>0){const n=W(!1,t,0);n&&e.focusStackFrame(n,void 0,void 0,{preserveFocus:!1})}}}function le(e){const i=e.getViewModel().focusedThread;i&&e.focusStackFrame(i.getTopStackFrame(),void 0,void 0,{preserveFocus:!1})}function W(e,i,t){t>=i.length?t=i.length-1:t<0&&(t=0);let n=t,o;do if(e?n===i.length-1?n=0:n++:n===0?n=i.length-1:n--,o=i[n],!Re(o))return o;while(n!==t)}C.registerCommand({id:Ge,handler:async(e,i,t)=>{const n=e.get(me),o=e.get(he),r=e.get(l),s=se(r,t);if(s){const c=n.getEOL(s.source.uri);await o.writeText(s.thread.getCallStack().map(m=>m.toString()).join(c))}}}),C.registerCommand({id:Xe,handler:async(e,i,t)=>{await b(e,t,n=>n.reverseContinue())}}),C.registerCommand({id:qe,handler:async(e,i,t)=>{const n=e.get(x);O.getValue(n)?await b(e,t,o=>o.stepBack("instruction")):await b(e,t,o=>o.stepBack())}}),C.registerCommand({id:Ye,handler:async(e,i,t)=>{await b(e,t,n=>n.terminate())}}),C.registerCommand({id:oe,handler:async e=>{const t=e.get(l).getViewModel().focusedStackFrame,o=e.get(I).activeTextEditorControl,r=e.get(H),s=e.get(y);if(t&&D(o)&&o.hasModel()){const c=o.getPosition(),m=o.getModel().uri,E=t.thread.session.getSourceForUri(m);if(E){const S=(await t.thread.session.gotoTargets(E.raw,c.lineNumber,c.column))?.body.targets;if(S&&S.length){let k=S[0].id;if(S.length>1){const L=S.map(X=>({label:X.label,_id:X.id})),G=await s.pick(L,{placeHolder:a.localize("chooseLocation","Choose the specific location")});if(!G)return;k=G._id}return await t.thread.session.goto(t.thread.threadId,k).catch(L=>r.warn(L))}}}return r.warn(a.localize("noExecutableCode","No executable code is associated at the current cursor position."))}}),C.registerCommand({id:mt,handler:async(e,i,t)=>{const n=e.get(l);le(n)}}),C.registerCommand({id:ft,handler:async(e,i,t)=>{const n=e.get(l);await de(n)}}),C.registerCommand({id:bt,handler:async(e,i,t)=>{const n=e.get(l);ce(n,!1)}}),C.registerCommand({id:ht,handler:async(e,i,t)=>{const n=e.get(l);ce(n,!0)}}),q.appendMenuItem(B.EditorContext,{command:{id:oe,title:a.localize("jumpToCursor","Jump to Cursor"),category:V},when:f.and(ye,v.editorTextFocus),group:"debug",order:3}),g.registerCommandAndKeybindingRule({id:St,weight:u.WorkbenchContrib+1,when:J,primary:p.CtrlCmd|d.PageDown,mac:{primary:p.Shift|p.CtrlCmd|d.BracketRight},handler:async(e,i,t)=>{ae(e,!0)}}),g.registerCommandAndKeybindingRule({id:pt,weight:u.WorkbenchContrib+1,when:J,primary:p.CtrlCmd|d.PageUp,mac:{primary:p.Shift|p.CtrlCmd|d.BracketLeft},handler:async(e,i,t)=>{ae(e,!1)}}),g.registerCommandAndKeybindingRule({id:He,weight:u.WorkbenchContrib,primary:p.Shift|p.CtrlCmd|d.F5,when:A,handler:async(e,i,t)=>{const n=e.get(l),o=e.get(R);let r;if(K(t)?r=n.getModel().getSession(t.sessionId):r=n.getViewModel().focusedSession,r){const s=o.getValue("debug").showSubSessionsInToolBar;for(;!s&&r.lifecycleManagedByParent&&r.parentSession;)r=r.parentSession;r.removeReplExpressions(),await n.restartSession(r)}else{const{launch:s,name:c}=n.getConfigurationManager().selectedConfiguration;await n.startDebugging(s,c,{noDebug:!1,startedByUser:!0})}}}),g.registerCommandAndKeybindingRule({id:Qe,weight:u.WorkbenchContrib,primary:d.F10,when:_.isEqualTo("stopped"),handler:async(e,i,t)=>{const n=e.get(x);O.getValue(n)?await b(e,t,o=>o.next("instruction")):await b(e,t,o=>o.next())}});const ge=pe&&Ce?p.Alt|d.F11:d.F11;g.registerCommandAndKeybindingRule({id:Je,weight:u.WorkbenchContrib+10,primary:ge,when:_.notEqualsTo("inactive"),handler:async(e,i,t)=>{const n=e.get(x);O.getValue(n)?await b(e,t,o=>o.stepIn("instruction")):await b(e,t,o=>o.stepIn())}}),g.registerCommandAndKeybindingRule({id:$e,weight:u.WorkbenchContrib,primary:p.Shift|d.F11,when:_.isEqualTo("stopped"),handler:async(e,i,t)=>{const n=e.get(x);O.getValue(n)?await b(e,t,o=>o.stepOut("instruction")):await b(e,t,o=>o.stepOut())}}),g.registerCommandAndKeybindingRule({id:Ze,weight:u.WorkbenchContrib+2,primary:d.F6,when:_.isEqualTo("running"),handler:async(e,i,t)=>{await b(e,t,n=>n.pause())}}),g.registerCommandAndKeybindingRule({id:je,primary:ge|p.CtrlCmd,when:f.and(Oe,A,_.isEqualTo("stopped")),weight:u.WorkbenchContrib,handler:async(e,i,t)=>{const n=e.get(y),o=e.get(l),r=o.getViewModel().focusedSession,s=o.getViewModel().focusedStackFrame;if(!s||!r)return;const c=await e.get(I).openEditor({resource:s.source.uri,options:{revealIfOpened:!0}});let m;if(c){const S=c?.getControl();D(S)&&(m=S)}const E=new ue,h=E.add(n.createQuickPick());h.busy=!0,h.show(),E.add(h.onDidChangeActive(([S])=>{m&&S&&S.target.line!==void 0&&(m.revealLineInCenterIfOutsideViewport(S.target.line),m.setSelection({startLineNumber:S.target.line,startColumn:S.target.column||1,endLineNumber:S.target.endLine||S.target.line,endColumn:S.target.endColumn||S.target.column||1}))})),E.add(h.onDidAccept(()=>{h.activeItems.length&&r.stepIn(s.thread.threadId,h.activeItems[0].target.id)})),E.add(h.onDidHide(()=>E.dispose())),r.stepInTargets(s.frameId).then(S=>{h.busy=!1,S?.length?h.items=S?.map(k=>({target:k,label:k.label})):h.placeholder=a.localize("editor.debug.action.stepIntoTargets.none","No step targets available")})}});async function z(e,i,t,n,o){const r=e.get(l);let s;K(t)?s=r.getModel().getSession(t.sessionId):s=r.getViewModel().focusedSession;const m=e.get(R).getValue("debug").showSubSessionsInToolBar;for(;!m&&s&&s.lifecycleManagedByParent&&s.parentSession;)s=s.parentSession;await r.stopSession(s,n,o)}g.registerCommandAndKeybindingRule({id:et,weight:u.WorkbenchContrib,primary:p.Shift|d.F5,when:f.and(Q,A),handler:(e,i,t)=>z(e,i,t,!0)}),C.registerCommand({id:tt,handler:(e,i,t)=>z(e,i,t,!0,!0)}),g.registerCommandAndKeybindingRule({id:nt,weight:u.WorkbenchContrib,primary:p.Shift|d.F5,when:f.and(Q.toNegated(),A),handler:(e,i,t)=>z(e,i,t,!1)}),C.registerCommand({id:ot,handler:async(e,i,t)=>{const n=e.get(l),o=e.get(H),r=se(n,t);if(r)try{await r.restart()}catch(s){o.error(s)}}}),g.registerCommandAndKeybindingRule({id:it,weight:u.WorkbenchContrib+10,primary:d.F5,when:_.isEqualTo("stopped"),handler:async(e,i,t)=>{await b(e,t,n=>n.continue())}}),C.registerCommand({id:Ct,handler:async e=>{await Ve(e)}}),C.registerCommand({id:rt,handler:async e=>{await e.get(te).openView(M,!0)}}),C.registerCommand({id:"debug.startFromConfig",handler:async(e,i)=>{await e.get(l).startDebugging(void 0,i)}}),C.registerCommand({id:st,handler:async(e,i)=>{const t=e.get(l),n=e.get(I),o=t.getModel().getSessions().find(s=>s.parentSession===i&&s.state===U.Stopped);o&&i.state!==U.Stopped&&(i=o),await t.focusStackFrame(void 0,void 0,i,{explicit:!0});const r=t.getViewModel().focusedStackFrame;r&&await r.openInEditor(n,!0)}}),C.registerCommand({id:ie,handler:async(e,i,t)=>{const n=e.get(y),o=e.get(l);if(i){const r=o.getConfigurationManager(),s=await r.getDynamicProviders();for(const c of s)if(c.type===i){const m=await c.pick();if(m){await r.selectConfiguration(m.launch,m.config.name,m.config,{type:c.type}),o.startDebugging(m.launch,m.config,{noDebug:t?.noDebug,startedByUser:!0});return}}}n.quickAccess.show(Et)}}),C.registerCommand({id:at,handler:async e=>{e.get(y).quickAccess.show(_t)}}),C.registerCommand({id:ct,handler:async e=>{De(e,ie)}}),g.registerCommandAndKeybindingRule({id:re,weight:u.WorkbenchContrib,primary:d.F5,when:f.and(P,_.isEqualTo("inactive")),handler:async(e,i)=>{const t=e.get(l);await Ue(e.get(R),e.get(I));const{launch:n,name:o,getConfig:r}=t.getConfigurationManager().selectedConfiguration,s=await r(),c=s?Object.assign(Se(s),i?.config):o;await t.startDebugging(n,c,{noDebug:i?.noDebug,startedByUser:!0},!1)}}),g.registerCommandAndKeybindingRule({id:dt,weight:u.WorkbenchContrib,primary:p.CtrlCmd|d.F5,mac:{primary:p.WinCtrl|d.F5},when:f.and(P,_.notEqualsTo(Be(U.Initializing))),handler:async e=>{await e.get(Ee).executeCommand(re,{noDebug:!0})}}),g.registerCommandAndKeybindingRule({id:"debug.toggleBreakpoint",weight:u.WorkbenchContrib+5,when:f.and(F,_e.toNegated()),primary:d.Space,handler:e=>{const i=e.get(T),t=e.get(l),n=i.lastFocusedList;if(n instanceof N){const o=n.getFocusedElements();o&&o.length&&t.enableOrDisableBreakpoints(!o[0].enabled,o[0])}}}),g.registerCommandAndKeybindingRule({id:"debug.enableOrDisableBreakpoint",weight:u.WorkbenchContrib,primary:void 0,when:v.editorTextFocus,handler:e=>{const i=e.get(l),n=e.get(I).activeTextEditorControl;if(D(n)){const o=n.getModel();if(o){const r=n.getPosition();if(r){const s=i.getModel().getBreakpoints({uri:o.uri,lineNumber:r.lineNumber});s.length&&i.enableOrDisableBreakpoints(!s[0].enabled,s[0])}}}}}),g.registerCommandAndKeybindingRule({id:lt,weight:u.WorkbenchContrib+5,when:j,primary:d.F2,mac:{primary:d.Enter},handler:(e,i)=>{const t=e.get(l);if(!(i instanceof w)){const o=e.get(T).lastFocusedList;if(o){const r=o.getFocus();Array.isArray(r)&&r[0]instanceof w&&(i=r[0])}}i instanceof w&&t.getViewModel().setSelectedExpression(i,!1)}}),C.registerCommand({id:gt,handler:async(e,i)=>{const t=e.get(l);(i instanceof w||i instanceof Z)&&t.getViewModel().setSelectedExpression(i,!0)}}),g.registerCommandAndKeybindingRule({id:"debug.setVariable",weight:u.WorkbenchContrib+5,when:Le,primary:d.F2,mac:{primary:d.Enter},handler:e=>{const i=e.get(T),t=e.get(l),n=i.lastFocusedList;if(n){const o=n.getFocus();Array.isArray(o)&&o[0]instanceof Z&&t.getViewModel().setSelectedExpression(o[0],!1)}}}),g.registerCommandAndKeybindingRule({id:ut,weight:u.WorkbenchContrib,when:f.and(j,xe.toNegated()),primary:d.Delete,mac:{primary:p.CtrlCmd|d.Backspace},handler:(e,i)=>{const t=e.get(l);if(i instanceof w){t.removeWatchExpressions(i.getId());return}const o=e.get(T).lastFocusedList;if(o){let r=o.getFocus();if(Array.isArray(r)&&r[0]instanceof w){const s=o.getSelection();s&&s.indexOf(r[0])>=0&&(r=s),r.forEach(c=>t.removeWatchExpressions(c.getId()))}}}}),g.registerCommandAndKeybindingRule({id:"debug.removeBreakpoint",weight:u.WorkbenchContrib,when:f.and(F,ve.toNegated()),primary:d.Delete,mac:{primary:p.CtrlCmd|d.Backspace},handler:e=>{const i=e.get(T),t=e.get(l),n=i.lastFocusedList;if(n instanceof N){const o=n.getFocusedElements(),r=o.length?o[0]:void 0;r instanceof $?t.removeBreakpoints(r.getId()):r instanceof Me?t.removeFunctionBreakpoints(r.getId()):r instanceof Pe&&t.removeDataBreakpoints(r.getId())}}}),g.registerCommandAndKeybindingRule({id:"debug.installAdditionalDebuggers",weight:u.WorkbenchContrib,when:void 0,primary:void 0,handler:async(e,i)=>{const n=(await e.get(ee).openPaneComposite(Ke,Y.Sidebar,!0))?.getViewPaneContainer();let o="@category:debuggers";typeof i=="string"&&(o+=` ${i}`),n.search(o),n.focus()}}),be(class extends fe{constructor(){super({id:ze,title:a.localize2("addConfiguration","Add Configuration..."),category:V,f1:!0,menu:{id:B.EditorContent,when:f.and(f.regex(we.Path.key,/\.vscode[/\\]launch\.json$/),Ie.isEqualTo(We))}})}async run(i,t){const n=i.get(l).getConfigurationManager(),o=n.getLaunches().find(r=>r.uri.toString()===t)||n.selectedConfiguration.launch;if(o){const{editor:r,created:s}=await o.openConfigFile({preserveFocus:!1});if(r&&!s){const c=r.getControl();c&&await c.getContribution(Ne)?.addLaunchConfiguration()}}}});const wt=e=>{const i=e.get(l),n=e.get(I).activeTextEditorControl;if(D(n)){const o=n.getPosition();if(o&&n.hasModel()&&i.canSetBreakpointsIn(n.getModel())){const r=n.getModel().uri;i.getModel().getBreakpoints({lineNumber:o.lineNumber,uri:r}).some(c=>c.sessionAgnosticData.column===o.column||!c.column&&o.column<=1)||i.addBreakpoints(r,[{lineNumber:o.lineNumber,column:o.column>1?o.column:void 0}])}}};g.registerCommandAndKeybindingRule({weight:u.WorkbenchContrib,primary:p.Shift|d.F9,when:v.editorTextFocus,id:ne,handler:wt}),q.appendMenuItem(B.EditorContext,{command:{id:ne,title:a.localize("addInlineBreakpoint","Add Inline Breakpoint"),category:V},when:f.and(A,Te.toNegated(),v.editorTextFocus,ke.toNegated()),group:"debug",order:1}),g.registerCommandAndKeybindingRule({id:"debug.openBreakpointToSide",weight:u.WorkbenchContrib,when:F,primary:p.CtrlCmd|d.Enter,secondary:[p.Alt|d.Enter],handler:e=>{const t=e.get(T).lastFocusedList;if(t instanceof N){const n=t.getFocusedElements();if(n.length&&n[0]instanceof $)return Ae(n[0],!0,!1,!0,e.get(l),e.get(I))}}}),g.registerCommandAndKeybindingRule({id:"debug.openView",weight:u.WorkbenchContrib,when:P.toNegated(),primary:d.F5,secondary:[p.CtrlCmd|d.F5],handler:async e=>{await e.get(ee).openPaneComposite(Fe,Y.Sidebar,!0)}});export{ze as ADD_CONFIGURATION_ID,En as ADD_TO_WATCH_ID,Hn as ADD_TO_WATCH_LABEL,ft as CALLSTACK_BOTTOM_ID,Wn as CALLSTACK_BOTTOM_LABEL,ht as CALLSTACK_DOWN_ID,Gn as CALLSTACK_DOWN_LABEL,mt as CALLSTACK_TOP_ID,Kn as CALLSTACK_TOP_LABEL,bt as CALLSTACK_UP_ID,zn as CALLSTACK_UP_LABEL,it as CONTINUE_ID,Ln as CONTINUE_LABEL,_n as COPY_EVALUATE_PATH_ID,Xn as COPY_EVALUATE_PATH_LABEL,Ge as COPY_STACK_TRACE_ID,In as COPY_VALUE_ID,qn as COPY_VALUE_LABEL,V as DEBUG_COMMAND_CATEGORY,hn as DEBUG_CONFIGURE_COMMAND_ID,Rn as DEBUG_CONFIGURE_LABEL,_t as DEBUG_CONSOLE_QUICK_ACCESS_PREFIX,Et as DEBUG_QUICK_ACCESS_PREFIX,dt as DEBUG_RUN_COMMAND_ID,Pn as DEBUG_RUN_LABEL,re as DEBUG_START_COMMAND_ID,Fn as DEBUG_START_LABEL,tt as DISCONNECT_AND_SUSPEND_ID,yn as DISCONNECT_AND_SUSPEND_LABEL,et as DISCONNECT_ID,xn as DISCONNECT_LABEL,lt as EDIT_EXPRESSION_COMMAND_ID,rt as FOCUS_REPL_ID,st as FOCUS_SESSION_ID,Nn as FOCUS_SESSION_LABEL,oe as JUMP_TO_CURSOR_ID,St as NEXT_DEBUG_CONSOLE_ID,Mn as NEXT_DEBUG_CONSOLE_LABEL,Vn as OPEN_LOADED_SCRIPTS_LABEL,Ze as PAUSE_ID,vn as PAUSE_LABEL,pt as PREV_DEBUG_CONSOLE_ID,Un as PREV_DEBUG_CONSOLE_LABEL,ut as REMOVE_EXPRESSION_COMMAND_ID,ot as RESTART_FRAME_ID,Tn as RESTART_LABEL,He as RESTART_SESSION_ID,Xe as REVERSE_CONTINUE_ID,ie as SELECT_AND_START_ID,Bn as SELECT_AND_START_LABEL,at as SELECT_DEBUG_CONSOLE_ID,Yn as SELECT_DEBUG_CONSOLE_LABEL,ct as SELECT_DEBUG_SESSION_ID,Qn as SELECT_DEBUG_SESSION_LABEL,gt as SET_EXPRESSION_COMMAND_ID,Ct as SHOW_LOADED_SCRIPTS_ID,qe as STEP_BACK_ID,Je as STEP_INTO_ID,kn as STEP_INTO_LABEL,je as STEP_INTO_TARGET_ID,An as STEP_INTO_TARGET_LABEL,$e as STEP_OUT_ID,Dn as STEP_OUT_LABEL,Qe as STEP_OVER_ID,wn as STEP_OVER_LABEL,nt as STOP_ID,On as STOP_LABEL,Ye as TERMINATE_THREAD_ID,ne as TOGGLE_INLINE_BREAKPOINT_ID};
