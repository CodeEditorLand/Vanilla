var Ae=Object.defineProperty;var Pe=Object.getOwnPropertyDescriptor;var ae=(r,e,i,n)=>{for(var t=n>1?void 0:n?Pe(e,i):e,a=r.length-1,l;a>=0;a--)(l=r[a])&&(t=(n?l(e,i,t):l(t))||t);return n&&t&&Ae(e,i,t),t},ce=(r,e)=>(i,n)=>e(i,n,r);import{BrowserFeatures as J}from"../../../../base/browser/canIUse.js";import{isKeyboardEvent as We,isMouseEvent as Y,isPointerEvent as xe}from"../../../../base/browser/dom.js";import{Action as Re}from"../../../../base/common/actions.js";import{CancellationToken as Ee}from"../../../../base/common/cancellation.js";import{Codicon as U}from"../../../../base/common/codicons.js";import{Iterable as De}from"../../../../base/common/iterator.js";import{KeyChord as Fe,KeyCode as s,KeyMod as o}from"../../../../base/common/keyCodes.js";import"../../../../base/common/lifecycle.js";import{Schemas as N}from"../../../../base/common/network.js";import{isAbsolute as Ne}from"../../../../base/common/path.js";import{isLinux as Le,isWindows as _e}from"../../../../base/common/platform.js";import{dirname as Ke}from"../../../../base/common/resources.js";import{isObject as W,isString as M}from"../../../../base/common/types.js";import{URI as G}from"../../../../base/common/uri.js";import{ICodeEditorService as le}from"../../../../editor/browser/services/codeEditorService.js";import{ILanguageService as Oe}from"../../../../editor/common/languages/language.js";import{EndOfLinePreference as se}from"../../../../editor/common/model.js";import{getIconClasses as Ue}from"../../../../editor/common/services/getIconClasses.js";import{IModelService as Me}from"../../../../editor/common/services/model.js";import{localize as k,localize2 as u}from"../../../../nls.js";import{AccessibleViewProviderId as Z}from"../../../../platform/accessibility/browser/accessibleView.js";import{CONTEXT_ACCESSIBILITY_MODE_ENABLED as E}from"../../../../platform/accessibility/common/accessibility.js";import{Action2 as me,MenuId as de,registerAction2 as ue}from"../../../../platform/actions/common/actions.js";import{IClipboardService as ee}from"../../../../platform/clipboard/common/clipboardService.js";import{ICommandService as B}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as pe}from"../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as h}from"../../../../platform/contextkey/common/contextkey.js";import{FileKind as Ge}from"../../../../platform/files/common/files.js";import"../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as g}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{ILabelService as fe}from"../../../../platform/label/common/label.js";import{IListService as Be}from"../../../../platform/list/browser/listService.js";import{INotificationService as L,Severity as qe}from"../../../../platform/notification/common/notification.js";import{IOpenerService as He}from"../../../../platform/opener/common/opener.js";import{IQuickInputService as _}from"../../../../platform/quickinput/common/quickInput.js";import{TerminalCapability as q}from"../../../../platform/terminal/common/capabilities/capabilities.js";import{TerminalExitReason as ze,TerminalLocation as x,TerminalSettingId as ve}from"../../../../platform/terminal/common/terminal.js";import{createProfileSchemaEnums as Ve}from"../../../../platform/terminal/common/terminalProfiles.js";import{IThemeService as Qe}from"../../../../platform/theme/common/themeService.js";import{IWorkspaceContextService as K}from"../../../../platform/workspace/common/workspace.js";import{PICK_WORKSPACE_FOLDER_COMMAND_ID as we}from"../../../browser/actions/workspaceCommands.js";import{CLOSE_EDITOR_COMMAND_ID as je}from"../../../browser/parts/editor/editorCommands.js";import{IConfigurationResolverService as he}from"../../../services/configurationResolver/common/configurationResolver.js";import{AbstractVariableResolverService as $e}from"../../../services/configurationResolver/common/variableResolver.js";import{editorGroupToColumn as Xe}from"../../../services/editor/common/editorGroupColumn.js";import{IEditorGroupsService as Je}from"../../../services/editor/common/editorGroupsService.js";import{SIDE_GROUP as Ye}from"../../../services/editor/common/editorService.js";import{IWorkbenchEnvironmentService as Ze}from"../../../services/environment/common/environmentService.js";import{IHistoryService as ei}from"../../../services/history/common/history.js";import{IPreferencesService as ii}from"../../../services/preferences/common/preferences.js";import{IRemoteAgentService as ni}from"../../../services/remote/common/remoteAgentService.js";import{accessibleViewCurrentProviderId as ie,accessibleViewIsShown as ge,accessibleViewOnLastLine as ti}from"../../accessibility/browser/accessibilityConfiguration.js";import{clearShellFileHistory as ri,getCommandHistory as oi}from"../common/history.js";import{ITerminalProfileResolverService as ai,ITerminalProfileService as ci,TERMINAL_VIEW_ID as be,TerminalCommandId as c}from"../common/terminal.js";import{TerminalContextKeys as m}from"../common/terminalContextKey.js";import{terminalStrings as C}from"../common/terminalStrings.js";import{Direction as H,ITerminalConfigurationService as li,ITerminalEditorService as si,ITerminalGroupService as ne,ITerminalInstanceService as Ce,ITerminalService as z}from"./terminal.js";import{InstanceContext as Se}from"./terminalContextMenu.js";import{getColorClass as mi,getIconId as di,getUriClasses as ui}from"./terminalIcon.js";import{killTerminalIcon as pi,newTerminalIcon as fi}from"./terminalIcons.js";import"./terminalProfileQuickpick.js";import{TerminalQuickAccessProvider as vi}from"./terminalQuickAccess.js";const wi="\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",hi=k("showTerminalTabs","Show Tabs"),V=C.actionCategory,d=(()=>{const r=h.or(m.processSupported,m.terminalHasBeenCreated);return{terminalAvailable:r,terminalAvailable_and_opened:h.and(r,m.isOpen),terminalAvailable_and_editorActive:h.and(r,m.terminalEditorActive),terminalAvailable_and_singularSelection:h.and(r,m.tabsSingularSelection),focusInAny_and_normalBuffer:h.and(m.focusInAny,m.altBufferActive.negate())}})();async function gi(r,e,i,n){switch(n.config.splitCwd){case"workspaceRoot":if(e!==void 0&&i!==void 0){if(e.length===1)return e[0].uri;if(e.length>1){const t={placeHolder:k("workbench.action.terminal.newWorkspacePlaceholder","Select current working directory for new terminal")},a=await i.executeCommand(we,[t]);return a?Promise.resolve(a.uri):void 0}}return"";case"initial":return r.getInitialCwd();case"inherited":return r.getCwd()}}const bi=async(r,e)=>{const i=r.get(z).activeInstance;if(i){const n=W(e)&&"text"in e?$(e.text):void 0;if(!n)return;const t=r.get(he),a=r.get(K),p=r.get(ei).getLastActiveWorkspaceRoot(i.isRemote?N.vscodeRemote:N.file),w=p?a.getWorkspaceFolder(p)??void 0:void 0,f=await t.resolveAsync(w,n);i.sendText(f,!1)}};let Q=class extends Re{constructor(i){super("workbench.action.terminal.launchHelp",k("terminalLaunchHelp","Open Help"));this._openerService=i}async run(){this._openerService.open("https://aka.ms/vscode-troubleshoot-terminal-launch")}};Q=ae([ce(0,He)],Q);function v(r){r.f1=r.f1??!0,r.category=r.category??V,r.precondition=r.precondition??m.processSupported;const e=r.run,i=r;return delete i.run,ue(class extends me{constructor(){super(i)}run(n,t,a){return e(ke(n),n,t,a)}})}function Ci(r){if(Array.isArray(r)){if(r.every(e=>e instanceof Se))return r}else if(r instanceof Se)return[r]}function j(r){const e=r.run;return v({...r,run:async(i,n,t,a)=>{let l=Si(n,a);if(!l){const w=(r.activeInstanceType==="view"?i.groupService:r.activeInstanceType==="editor"?i.editorService:i.service).activeInstance;if(!w)return;l=[w]}const p=[];for(const w of l)p.push(e(w,i,n,t));await Promise.all(p),r.runAfter&&r.runAfter(l,i,n,t)}})}function I(r){const e=r.run;return v({...r,run:(i,n,t)=>{const a=i.service.activeInstance;if(a)return e(a,i,n,t)}})}function y(r){const e=r.run;return v({...r,run:(i,n,t)=>{const a=De.find(i.service.detachedInstances,p=>p.xterm.isFocused);if(a)return e(a.xterm,n,a,t);const l=i.service.activeInstance;if(l?.xterm)return e(l.xterm,n,l,t)}})}function ke(r){return{service:r.get(z),configService:r.get(li),groupService:r.get(ne),instanceService:r.get(Ce),editorService:r.get(si),profileService:r.get(ci),profileResolverService:r.get(ai)}}function Jn(){v({id:c.NewInActiveWorkspace,title:u("workbench.action.terminal.newInActiveWorkspace","Create New Terminal (In Active Workspace)"),run:async e=>{if(e.service.isProcessSupportRegistered){const i=await e.service.createTerminal({location:e.service.defaultLocation});if(!i)return;e.service.setActiveInstance(i)}await e.groupService.showPanel(!0)}}),Ii([]),v({id:c.CreateTerminalEditor,title:u("workbench.action.terminal.createTerminalEditor","Create New Terminal in Editor Area"),run:async(e,i,n)=>{const t=W(n)&&"location"in n?n:{location:x.Editor};await(await e.service.createTerminal(t)).focusWhenReady()}}),v({id:c.CreateTerminalEditorSameGroup,title:u("workbench.action.terminal.createTerminalEditor","Create New Terminal in Editor Area"),f1:!1,run:async(e,i,n)=>{const t=i.get(Je);await(await e.service.createTerminal({location:{viewColumn:Xe(t,t.activeGroup)}})).focusWhenReady()}}),v({id:c.CreateTerminalEditorSide,title:u("workbench.action.terminal.createTerminalEditorSide","Create New Terminal in Editor Area to the Side"),run:async e=>{await(await e.service.createTerminal({location:{viewColumn:Ye}})).focusWhenReady()}}),j({id:c.MoveToEditor,title:C.moveToEditor,precondition:d.terminalAvailable_and_opened,activeInstanceType:"view",run:(e,i)=>i.service.moveToEditor(e),runAfter:e=>e.at(-1)?.focus()}),j({id:c.MoveIntoNewWindow,title:C.moveIntoNewWindow,precondition:d.terminalAvailable_and_opened,run:(e,i)=>i.service.moveIntoNewEditor(e),runAfter:e=>e.at(-1)?.focus()}),v({id:c.MoveToTerminalPanel,title:C.moveToTerminalPanel,precondition:d.terminalAvailable_and_editorActive,run:(e,i,n)=>{const t=Te(n)??e.editorService.activeInstance;t&&e.service.moveToTerminalView(t)}}),v({id:c.FocusPreviousPane,title:u("workbench.action.terminal.focusPreviousPane","Focus Previous Terminal in Terminal Group"),keybinding:{primary:o.Alt|s.LeftArrow,secondary:[o.Alt|s.UpArrow],mac:{primary:o.Alt|o.CtrlCmd|s.LeftArrow,secondary:[o.Alt|o.CtrlCmd|s.UpArrow]},when:m.focus,weight:g.WorkbenchContrib},precondition:d.terminalAvailable,run:async e=>{e.groupService.activeGroup?.focusPreviousPane(),await e.groupService.showPanel(!0)}}),v({id:c.FocusNextPane,title:u("workbench.action.terminal.focusNextPane","Focus Next Terminal in Terminal Group"),keybinding:{primary:o.Alt|s.RightArrow,secondary:[o.Alt|s.DownArrow],mac:{primary:o.Alt|o.CtrlCmd|s.RightArrow,secondary:[o.Alt|o.CtrlCmd|s.DownArrow]},when:m.focus,weight:g.WorkbenchContrib},precondition:d.terminalAvailable,run:async e=>{e.groupService.activeGroup?.focusNextPane(),await e.groupService.showPanel(!0)}}),I({id:c.RunRecentCommand,title:u("workbench.action.terminal.runRecentCommand","Run Recent Command..."),precondition:d.terminalAvailable,keybinding:[{primary:o.CtrlCmd|s.KeyR,when:h.and(E,h.or(m.focus,h.and(ge,ie.isEqualTo(Z.Terminal)))),weight:g.WorkbenchContrib},{primary:o.CtrlCmd|o.Alt|s.KeyR,mac:{primary:o.WinCtrl|o.Alt|s.KeyR},when:h.and(m.focus,E.negate()),weight:g.WorkbenchContrib}],run:async(e,i)=>{await e.runRecent("command"),e?.target===x.Editor?await i.editorService.revealActiveEditor():await i.groupService.showPanel(!1)}}),I({id:c.CopyLastCommand,title:u("workbench.action.terminal.copyLastCommand","Copy Last Command"),precondition:d.terminalAvailable,run:async(e,i,n)=>{const t=n.get(ee),a=e.capabilities.get(q.CommandDetection)?.commands;if(!a||a.length===0)return;const l=a[a.length-1];l.command&&await t.writeText(l.command)}}),I({id:c.CopyLastCommandOutput,title:u("workbench.action.terminal.copyLastCommandOutput","Copy Last Command Output"),precondition:d.terminalAvailable,run:async(e,i,n)=>{const t=n.get(ee),a=e.capabilities.get(q.CommandDetection)?.commands;if(!a||a.length===0)return;const l=a[a.length-1];if(!l?.hasOutput())return;const p=l.getOutput();M(p)&&await t.writeText(p)}}),I({id:c.CopyLastCommandAndLastCommandOutput,title:u("workbench.action.terminal.copyLastCommandAndOutput","Copy Last Command and Output"),precondition:d.terminalAvailable,run:async(e,i,n)=>{const t=n.get(ee),a=e.capabilities.get(q.CommandDetection)?.commands;if(!a||a.length===0)return;const l=a[a.length-1];if(!l?.hasOutput())return;const p=l.getOutput();M(p)&&await t.writeText(`${l.command!==""?l.command+`
`:""}${p}`)}}),I({id:c.GoToRecentDirectory,title:u("workbench.action.terminal.goToRecentDirectory","Go to Recent Directory..."),metadata:{description:u("goToRecentDirectory.metadata","Goes to a recent folder")},precondition:d.terminalAvailable,keybinding:{primary:o.CtrlCmd|s.KeyG,when:m.focus,weight:g.WorkbenchContrib},run:async(e,i)=>{await e.runRecent("cwd"),e?.target===x.Editor?await i.editorService.revealActiveEditor():await i.groupService.showPanel(!1)}}),v({id:c.ResizePaneLeft,title:u("workbench.action.terminal.resizePaneLeft","Resize Terminal Left"),keybinding:{linux:{primary:o.CtrlCmd|o.Shift|s.LeftArrow},mac:{primary:o.CtrlCmd|o.WinCtrl|s.LeftArrow},when:m.focus,weight:g.WorkbenchContrib},precondition:d.terminalAvailable,run:e=>e.groupService.activeGroup?.resizePane(H.Left)}),v({id:c.ResizePaneRight,title:u("workbench.action.terminal.resizePaneRight","Resize Terminal Right"),keybinding:{linux:{primary:o.CtrlCmd|o.Shift|s.RightArrow},mac:{primary:o.CtrlCmd|o.WinCtrl|s.RightArrow},when:m.focus,weight:g.WorkbenchContrib},precondition:d.terminalAvailable,run:e=>e.groupService.activeGroup?.resizePane(H.Right)}),v({id:c.ResizePaneUp,title:u("workbench.action.terminal.resizePaneUp","Resize Terminal Up"),keybinding:{mac:{primary:o.CtrlCmd|o.WinCtrl|s.UpArrow},when:m.focus,weight:g.WorkbenchContrib},precondition:d.terminalAvailable,run:e=>e.groupService.activeGroup?.resizePane(H.Up)}),v({id:c.ResizePaneDown,title:u("workbench.action.terminal.resizePaneDown","Resize Terminal Down"),keybinding:{mac:{primary:o.CtrlCmd|o.WinCtrl|s.DownArrow},when:m.focus,weight:g.WorkbenchContrib},precondition:d.terminalAvailable,run:e=>e.groupService.activeGroup?.resizePane(H.Down)}),v({id:c.Focus,title:C.focus,keybinding:{when:h.and(E,ti,ie.isEqualTo(Z.Terminal)),primary:o.CtrlCmd|s.DownArrow,weight:g.WorkbenchContrib},precondition:d.terminalAvailable,run:async e=>{const i=e.service.activeInstance||await e.service.createTerminal({location:x.Panel});i&&(e.service.setActiveInstance(i),F(i,e))}}),v({id:c.FocusTabs,title:u("workbench.action.terminal.focus.tabsView","Focus Terminal Tabs View"),keybinding:{primary:o.CtrlCmd|o.Shift|s.Backslash,weight:g.WorkbenchContrib,when:h.or(m.tabsFocus,m.focus)},precondition:d.terminalAvailable,run:e=>e.groupService.focusTabs()}),v({id:c.FocusNext,title:u("workbench.action.terminal.focusNext","Focus Next Terminal Group"),precondition:d.terminalAvailable,keybinding:{primary:o.CtrlCmd|s.PageDown,mac:{primary:o.CtrlCmd|o.Shift|s.BracketRight},when:h.and(m.focus,m.editorFocus.negate()),weight:g.WorkbenchContrib},run:async e=>{e.groupService.setActiveGroupToNext(),await e.groupService.showPanel(!0)}}),v({id:c.FocusPrevious,title:u("workbench.action.terminal.focusPrevious","Focus Previous Terminal Group"),precondition:d.terminalAvailable,keybinding:{primary:o.CtrlCmd|s.PageUp,mac:{primary:o.CtrlCmd|o.Shift|s.BracketLeft},when:h.and(m.focus,m.editorFocus.negate()),weight:g.WorkbenchContrib},run:async e=>{e.groupService.setActiveGroupToPrevious(),await e.groupService.showPanel(!0)}}),v({id:c.RunSelectedText,title:u("workbench.action.terminal.runSelectedText","Run Selected Text In Active Terminal"),run:async(e,i)=>{const t=i.get(le).getActiveCodeEditor();if(!t||!t.hasModel())return;const a=await e.service.getActiveOrCreateInstance({acceptsInput:!0}),l=t.getSelection();let p;if(l.isEmpty())p=t.getModel().getLineContent(l.selectionStartLineNumber).trim();else{const w=_e?se.LF:se.CRLF;p=t.getModel().getValueInRange(l,w)}a.sendText(p,!0,!0),await e.service.revealActiveTerminal(!0)}}),v({id:c.RunActiveFile,title:u("workbench.action.terminal.runActiveFile","Run Active File In Active Terminal"),precondition:d.terminalAvailable,run:async(e,i)=>{const n=i.get(le),t=i.get(L),a=i.get(Ze),l=n.getActiveCodeEditor();if(!l||!l.hasModel())return;const p=await e.service.getActiveOrCreateInstance({acceptsInput:!0}),w=p?p.isRemote:!!a.remoteAuthority,f=l.getModel().uri;if(!w&&f.scheme!==N.file&&f.scheme!==N.vscodeUserData||w&&f.scheme!==N.vscodeRemote){t.warn(k("workbench.action.terminal.runActiveFile.noFile","Only files on disk can be run in the terminal"));return}return await p.sendPath(f,!0),e.groupService.showPanel()}}),y({id:c.ScrollDownLine,title:u("workbench.action.terminal.scrollDown","Scroll Down (Line)"),keybinding:{primary:o.CtrlCmd|o.Alt|s.PageDown,linux:{primary:o.CtrlCmd|o.Shift|s.DownArrow},when:d.focusInAny_and_normalBuffer,weight:g.WorkbenchContrib},precondition:d.terminalAvailable,run:e=>e.scrollDownLine()}),y({id:c.ScrollDownPage,title:u("workbench.action.terminal.scrollDownPage","Scroll Down (Page)"),keybinding:{primary:o.Shift|s.PageDown,mac:{primary:s.PageDown},when:d.focusInAny_and_normalBuffer,weight:g.WorkbenchContrib},precondition:d.terminalAvailable,run:e=>e.scrollDownPage()}),y({id:c.ScrollToBottom,title:u("workbench.action.terminal.scrollToBottom","Scroll to Bottom"),keybinding:{primary:o.CtrlCmd|s.End,linux:{primary:o.Shift|s.End},when:d.focusInAny_and_normalBuffer,weight:g.WorkbenchContrib},precondition:d.terminalAvailable,run:e=>e.scrollToBottom()}),y({id:c.ScrollUpLine,title:u("workbench.action.terminal.scrollUp","Scroll Up (Line)"),keybinding:{primary:o.CtrlCmd|o.Alt|s.PageUp,linux:{primary:o.CtrlCmd|o.Shift|s.UpArrow},when:d.focusInAny_and_normalBuffer,weight:g.WorkbenchContrib},precondition:d.terminalAvailable,run:e=>e.scrollUpLine()}),y({id:c.ScrollUpPage,title:u("workbench.action.terminal.scrollUpPage","Scroll Up (Page)"),f1:!0,category:V,keybinding:{primary:o.Shift|s.PageUp,mac:{primary:s.PageUp},when:d.focusInAny_and_normalBuffer,weight:g.WorkbenchContrib},precondition:d.terminalAvailable,run:e=>e.scrollUpPage()}),y({id:c.ScrollToTop,title:u("workbench.action.terminal.scrollToTop","Scroll to Top"),keybinding:{primary:o.CtrlCmd|s.Home,linux:{primary:o.Shift|s.Home},when:d.focusInAny_and_normalBuffer,weight:g.WorkbenchContrib},precondition:d.terminalAvailable,run:e=>e.scrollToTop()}),y({id:c.ClearSelection,title:u("workbench.action.terminal.clearSelection","Clear Selection"),keybinding:{primary:s.Escape,when:h.and(m.focusInAny,m.textSelected,m.notFindVisible),weight:g.WorkbenchContrib},precondition:d.terminalAvailable,run:e=>{e.hasSelection()&&e.clearSelection()}}),v({id:c.ChangeIcon,title:C.changeIcon,precondition:d.terminalAvailable,run:(e,i,n)=>O(e,n)?.changeIcon()}),v({id:c.ChangeIconActiveTab,title:C.changeIcon,f1:!1,precondition:d.terminalAvailable_and_singularSelection,run:async(e,i,n)=>{let t;if(e.groupService.lastAccessedMenu==="inline-tab"){O(e,n)?.changeIcon();return}for(const a of D(i)??[])t=await a.changeIcon(t)}}),v({id:c.ChangeColor,title:C.changeColor,precondition:d.terminalAvailable,run:(e,i,n)=>O(e,n)?.changeColor()}),v({id:c.ChangeColorActiveTab,title:C.changeColor,f1:!1,precondition:d.terminalAvailable_and_singularSelection,run:async(e,i,n)=>{let t,a=0;if(e.groupService.lastAccessedMenu==="inline-tab"){O(e,n)?.changeColor();return}for(const l of D(i)??[]){const p=a!==0;t=await l.changeColor(t,p),a++}}}),v({id:c.Rename,title:C.rename,precondition:d.terminalAvailable,run:(e,i,n)=>ye(e,i,n)}),v({id:c.RenameActiveTab,title:C.rename,f1:!1,keybinding:{primary:s.F2,mac:{primary:s.Enter},when:h.and(m.tabsFocus),weight:g.WorkbenchContrib},precondition:d.terminalAvailable_and_singularSelection,run:async(e,i)=>{const n=i.get(ne),t=i.get(L),a=D(i),l=a?.[0];if(l){if(n.lastAccessedMenu==="inline-tab")return ye(e,i,l);e.service.setEditingTerminal(l),e.service.setEditable(l,{validationMessage:p=>ki(p),onFinish:async(p,w)=>{if(e.service.setEditable(l,null),e.service.setEditingTerminal(void 0),w){const f=[];for(const S of a)f.push((async()=>{await S.rename(p)})());try{await Promise.all(f)}catch(S){t.error(S)}}}})}}}),I({id:c.DetachSession,title:u("workbench.action.terminal.detachSession","Detach Session"),run:e=>e.detachProcessAndDispose(ze.User)}),v({id:c.AttachToSession,title:u("workbench.action.terminal.attachToSession","Attach to Session"),run:async(e,i)=>{const n=i.get(_),t=i.get(fe),a=i.get(ni),l=i.get(L),p=a.getConnection()?.remoteAuthority??void 0,w=await i.get(Ce).getBackend(p);if(!w)throw new Error(`No backend registered for remote authority '${p}'`);const f=await w.listProcesses();w.reduceConnectionGraceTime();const A=f.filter(b=>!e.service.isAttachedToTerminal(b)).map(b=>{const T=t.getUriLabel(G.file(b.cwd));return{label:b.title,detail:b.workspaceName?`${b.workspaceName} \u2E31 ${T}`:T,description:b.pid?String(b.pid):"",term:b}});if(A.length===0){l.info(k("noUnattachedTerminals","There are no unattached terminals to attach to"));return}const R=await n.pick(A,{canPickMany:!1});if(R){const b=await e.service.createTerminal({config:{attachPersistentProcess:R.term}});e.service.setActiveInstance(b),await F(b,e)}}}),v({id:c.QuickOpenTerm,title:u("quickAccessTerminal","Switch Active Terminal"),precondition:d.terminalAvailable,run:(e,i)=>i.get(_).quickAccess.show(vi.PREFIX)}),I({id:c.ScrollToPreviousCommand,title:C.scrollToPreviousCommand,keybinding:{primary:o.CtrlCmd|s.UpArrow,when:h.and(m.focus,E.negate()),weight:g.WorkbenchContrib},precondition:d.terminalAvailable,icon:U.arrowUp,menu:[{id:de.ViewTitle,group:"navigation",order:4,when:h.equals("view",be),isHiddenByDefault:!0}],run:e=>e.xterm?.markTracker.scrollToPreviousMark(void 0,void 0,e.capabilities.has(q.CommandDetection))}),I({id:c.ScrollToNextCommand,title:C.scrollToNextCommand,keybinding:{primary:o.CtrlCmd|s.DownArrow,when:h.and(m.focus,E.negate()),weight:g.WorkbenchContrib},precondition:d.terminalAvailable,icon:U.arrowDown,menu:[{id:de.ViewTitle,group:"navigation",order:4,when:h.equals("view",be),isHiddenByDefault:!0}],run:e=>{e.xterm?.markTracker.scrollToNextMark(),e.focus()}}),I({id:c.SelectToPreviousCommand,title:u("workbench.action.terminal.selectToPreviousCommand","Select To Previous Command"),keybinding:{primary:o.CtrlCmd|o.Shift|s.UpArrow,when:m.focus,weight:g.WorkbenchContrib},precondition:d.terminalAvailable,run:e=>{e.xterm?.markTracker.selectToPreviousMark(),e.focus()}}),I({id:c.SelectToNextCommand,title:u("workbench.action.terminal.selectToNextCommand","Select To Next Command"),keybinding:{primary:o.CtrlCmd|o.Shift|s.DownArrow,when:m.focus,weight:g.WorkbenchContrib},precondition:d.terminalAvailable,run:e=>{e.xterm?.markTracker.selectToNextMark(),e.focus()}}),y({id:c.SelectToPreviousLine,title:u("workbench.action.terminal.selectToPreviousLine","Select To Previous Line"),precondition:d.terminalAvailable,run:async(e,i,n)=>{e.markTracker.selectToPreviousLine(),(n||e).focus()}}),y({id:c.SelectToNextLine,title:u("workbench.action.terminal.selectToNextLine","Select To Next Line"),precondition:d.terminalAvailable,run:async(e,i,n)=>{e.markTracker.selectToNextLine(),(n||e).focus()}}),v({id:c.SendSequence,title:C.sendSequence,f1:!1,metadata:{description:C.sendSequence.value,args:[{name:"args",schema:{type:"object",required:["text"],properties:{text:{description:k("sendSequence","The sequence of text to send to the terminal"),type:"string"}}}}]},run:(e,i,n)=>bi(i,n)}),v({id:c.NewWithCwd,title:C.newWithCwd,metadata:{description:C.newWithCwd.value,args:[{name:"args",schema:{type:"object",required:["cwd"],properties:{cwd:{description:k("workbench.action.terminal.newWithCwd.cwd","The directory to start the terminal at"),type:"string"}}}}]},run:async(e,i,n)=>{const t=W(n)&&"cwd"in n?$(n.cwd):void 0,a=await e.service.createTerminal({cwd:t});a&&(e.service.setActiveInstance(a),await F(a,e))}}),I({id:c.RenameWithArgs,title:C.renameWithArgs,metadata:{description:C.renameWithArgs.value,args:[{name:"args",schema:{type:"object",required:["name"],properties:{name:{description:k("workbench.action.terminal.renameWithArg.name","The new name for the terminal"),type:"string",minLength:1}}}}]},precondition:d.terminalAvailable,run:async(e,i,n,t)=>{const a=n.get(L),l=W(t)&&"name"in t?$(t.name):void 0;if(!l){a.warn(k("workbench.action.terminal.renameWithArg.noName","No name argument provided"));return}e.rename(l)}}),I({id:c.Relaunch,title:u("workbench.action.terminal.relaunch","Relaunch Active Terminal"),run:e=>e.relaunch()}),v({id:c.Split,title:C.split,precondition:h.or(m.processSupported,m.webExtensionContributedProfile),keybinding:{primary:o.CtrlCmd|o.Shift|s.Digit5,weight:g.WorkbenchContrib,mac:{primary:o.CtrlCmd|s.Backslash,secondary:[o.WinCtrl|o.Shift|s.Digit5]},when:m.focus},icon:U.splitHorizontal,run:async(e,i,n)=>{const t=W(n)?n:void 0,a=i.get(B),l=i.get(K),p=Ie(t),w=(await e.service.getInstanceHost(p?.location)).activeInstance;if(!w)return;const f=await gi(w,l.getWorkspace().folders,a,e.configService);if(f===void 0)return;const S=await e.service.createTerminal({location:{parentTerminal:w},config:p?.config,cwd:f});await F(S,e)}}),v({id:c.SplitActiveTab,title:C.split,f1:!1,keybinding:{primary:o.CtrlCmd|o.Shift|s.Digit5,mac:{primary:o.CtrlCmd|s.Backslash,secondary:[o.WinCtrl|o.Shift|s.Digit5]},weight:g.WorkbenchContrib,when:m.tabsFocus},run:async(e,i)=>{const n=D(i);if(n){const t=[];for(const a of n)t.push((async()=>{await e.service.createTerminal({location:{parentTerminal:a}}),await e.groupService.showPanel(!0)})());await Promise.all(t)}}}),j({id:c.Unsplit,title:C.unsplit,precondition:d.terminalAvailable,run:async(e,i)=>{const n=i.groupService.getGroupForInstance(e);n&&n?.terminalInstances.length>1&&i.groupService.unsplitInstance(e)}}),v({id:c.JoinActiveTab,title:u("workbench.action.terminal.joinInstance","Join Terminals"),precondition:h.and(d.terminalAvailable,m.tabsSingularSelection.toNegated()),run:async(e,i)=>{const n=D(i);n&&n.length>1&&e.groupService.joinInstances(n)}}),v({id:c.Join,title:u("workbench.action.terminal.join","Join Terminals..."),precondition:d.terminalAvailable,run:async(e,i)=>{const n=i.get(Qe),t=i.get(L),a=i.get(_),l=[];if(e.groupService.instances.length<=1){t.warn(k("workbench.action.terminal.join.insufficientTerminals","Insufficient terminals for the join action"));return}const p=e.groupService.instances.filter(f=>f.instanceId!==e.groupService.activeInstance?.instanceId);for(const f of p)if(e.groupService.getGroupForInstance(f)?.terminalInstances.length===1){const R=`$(${di(i,f)}): ${f.title}`,b=[],T=mi(f);T&&b.push(T);const X=ui(f,n.getColorTheme().type);X&&b.push(...X),l.push({terminal:f,label:R,iconClasses:b})}if(l.length===0){t.warn(k("workbench.action.terminal.join.onlySplits","All terminals are joined already"));return}const w=await a.pick(l,{});w&&e.groupService.joinInstances([w.terminal,e.groupService.activeInstance])}}),I({id:c.SplitInActiveWorkspace,title:u("workbench.action.terminal.splitInActiveWorkspace","Split Terminal (In Active Workspace)"),run:async(e,i)=>{(await i.service.createTerminal({location:{parentTerminal:e}}))?.target!==x.Editor&&await i.groupService.showPanel(!0)}}),y({id:c.SelectAll,title:u("workbench.action.terminal.selectAll","Select All"),precondition:d.terminalAvailable,keybinding:[{primary:0,mac:{primary:o.CtrlCmd|s.KeyA},weight:g.WorkbenchContrib,when:m.focusInAny}],run:e=>e.selectAll()}),v({id:c.New,title:u("workbench.action.terminal.new","Create New Terminal"),precondition:h.or(m.processSupported,m.webExtensionContributedProfile),icon:fi,keybinding:{primary:o.CtrlCmd|o.Shift|s.Backquote,mac:{primary:o.WinCtrl|o.Shift|s.Backquote},weight:g.WorkbenchContrib},run:async(e,i,n)=>{let t=W(n)?n:void 0;const a=i.get(K),l=i.get(B),p=a.getWorkspace().folders;if(t&&Y(t)&&(t.altKey||t.ctrlKey)){await e.service.createTerminal({location:{splitActiveTerminal:!0}});return}if(e.service.isProcessSupportRegistered){t=!t||Y(t)?{}:t;let w;if(p.length<=1)w=await e.service.createTerminal(t);else{const f=(await yi(i))?.cwd;if(!f)return;t.cwd=f,w=await e.service.createTerminal(t)}e.service.setActiveInstance(w),await F(w,e)}else e.profileService.contributedProfiles.length>0?l.executeCommand(c.NewWithProfile):l.executeCommand(c.Toggle)}});async function r(e,i){i&&(await e.service.safeDisposeTerminal(i),e.groupService.instances.length>0&&await e.groupService.showPanel(!0))}v({id:c.Kill,title:u("workbench.action.terminal.kill","Kill the Active Terminal Instance"),precondition:h.or(d.terminalAvailable,m.isOpen),icon:pi,run:async e=>r(e,e.groupService.activeInstance)}),v({id:c.KillViewOrEditor,title:C.kill,f1:!1,precondition:h.or(d.terminalAvailable,m.isOpen),run:async e=>r(e,e.service.activeInstance)}),v({id:c.KillAll,title:u("workbench.action.terminal.killAll","Kill All Terminals"),precondition:h.or(d.terminalAvailable,m.isOpen),icon:U.trash,run:async e=>{const i=[];for(const n of e.service.instances)i.push(e.service.safeDisposeTerminal(n));await Promise.all(i)}}),v({id:c.KillEditor,title:u("workbench.action.terminal.killEditor","Kill the Active Terminal in Editor Area"),precondition:d.terminalAvailable,keybinding:{primary:o.CtrlCmd|s.KeyW,win:{primary:o.CtrlCmd|s.F4,secondary:[o.CtrlCmd|s.KeyW]},weight:g.WorkbenchContrib,when:h.and(m.focus,m.editorFocus)},run:(e,i)=>i.get(B).executeCommand(je)}),v({id:c.KillActiveTab,title:C.kill,f1:!1,precondition:h.or(d.terminalAvailable,m.isOpen),keybinding:{primary:s.Delete,mac:{primary:o.CtrlCmd|s.Backspace,secondary:[s.Delete]},weight:g.WorkbenchContrib,when:m.tabsFocus},run:async(e,i)=>{const n=[];for(const t of D(i,!0)??[])n.push(e.service.safeDisposeTerminal(t));await Promise.all(n),e.groupService.focusTabs()}}),v({id:c.FocusHover,title:C.focusHover,precondition:h.or(d.terminalAvailable,m.isOpen),keybinding:{primary:Fe(o.CtrlCmd|s.KeyK,o.CtrlCmd|s.KeyI),weight:g.WorkbenchContrib,when:h.or(m.tabsFocus,m.focus)},run:e=>e.groupService.focusHover()}),I({id:c.Clear,title:u("workbench.action.terminal.clear","Clear"),precondition:d.terminalAvailable,keybinding:[{primary:0,mac:{primary:o.CtrlCmd|s.KeyK},weight:g.WorkbenchContrib+1,when:h.or(h.and(m.focus,E.negate()),h.and(E,ge,ie.isEqualTo(Z.Terminal)))}],run:e=>e.clearBuffer()}),v({id:c.SelectDefaultProfile,title:u("workbench.action.terminal.selectDefaultShell","Select Default Profile"),run:e=>e.service.showProfileQuickPick("setDefault")}),v({id:c.ConfigureTerminalSettings,title:u("workbench.action.terminal.openSettings","Configure Terminal Settings"),precondition:d.terminalAvailable,run:(e,i)=>i.get(ii).openSettings({jsonEditor:!1,query:"@feature:terminal"})}),I({id:c.SetDimensions,title:u("workbench.action.terminal.setFixedDimensions","Set Fixed Dimensions"),precondition:d.terminalAvailable_and_opened,run:e=>e.setFixedDimensions()}),j({id:c.SizeToContentWidth,title:C.toggleSizeToContentWidth,precondition:d.terminalAvailable_and_opened,keybinding:{primary:o.Alt|s.KeyZ,weight:g.WorkbenchContrib,when:m.focus},run:e=>e.toggleSizeToContentWidth()}),v({id:c.ClearPreviousSessionHistory,title:u("workbench.action.terminal.clearPreviousSessionHistory","Clear Previous Session History"),precondition:d.terminalAvailable,run:async(e,i)=>{oi(i).clear(),ri()}}),J.clipboard.writeText&&(y({id:c.CopySelection,title:u("workbench.action.terminal.copySelection","Copy Selection"),precondition:h.or(m.textSelectedInFocused,h.and(d.terminalAvailable,m.textSelected)),keybinding:[{primary:o.CtrlCmd|o.Shift|s.KeyC,mac:{primary:o.CtrlCmd|s.KeyC},weight:g.WorkbenchContrib,when:h.or(h.and(m.textSelected,m.focus),m.textSelectedInFocused)}],run:e=>e.copySelection()}),y({id:c.CopyAndClearSelection,title:u("workbench.action.terminal.copyAndClearSelection","Copy and Clear Selection"),precondition:h.or(m.textSelectedInFocused,h.and(d.terminalAvailable,m.textSelected)),keybinding:[{win:{primary:o.CtrlCmd|s.KeyC},weight:g.WorkbenchContrib,when:h.or(h.and(m.textSelected,m.focus),m.textSelectedInFocused)}],run:async e=>{await e.copySelection(),e.clearSelection()}}),y({id:c.CopySelectionAsHtml,title:u("workbench.action.terminal.copySelectionAsHtml","Copy Selection as HTML"),f1:!0,category:V,precondition:h.or(m.textSelectedInFocused,h.and(d.terminalAvailable,m.textSelected)),run:e=>e.copySelection(!0)})),J.clipboard.readText&&I({id:c.Paste,title:u("workbench.action.terminal.paste","Paste into Active Terminal"),precondition:d.terminalAvailable,keybinding:[{primary:o.CtrlCmd|s.KeyV,win:{primary:o.CtrlCmd|s.KeyV,secondary:[o.CtrlCmd|o.Shift|s.KeyV]},linux:{primary:o.CtrlCmd|o.Shift|s.KeyV},weight:g.WorkbenchContrib,when:m.focus}],run:e=>e.paste()}),J.clipboard.readText&&Le&&I({id:c.PasteSelection,title:u("workbench.action.terminal.pasteSelection","Paste Selection into Active Terminal"),precondition:d.terminalAvailable,keybinding:[{linux:{primary:o.Shift|s.Insert},weight:g.WorkbenchContrib,when:m.focus}],run:e=>e.pasteSelection()}),v({id:c.SwitchTerminal,title:u("workbench.action.terminal.switchTerminal","Switch Terminal"),precondition:d.terminalAvailable,run:async(e,i,n)=>{const t=$(n);if(!t)return;if(t===wi){e.service.refreshActiveGroup();return}if(t===hi){i.get(pe).updateValue(ve.TabsEnabled,!0);return}const l=/^([0-9]+): /.exec(t);if(l)return e.groupService.setActiveGroupByIndex(Number(l[1])-1),e.groupService.showPanel(!0);const p=e.profileService.availableProfiles,w=t.substring(4);if(p){const f=p.find(S=>S.profileName===w);if(f){const S=await e.service.createTerminal({config:f});e.service.setActiveInstance(S)}else console.warn(`No profile with name "${w}"`)}else console.warn(`Unmatched terminal item: "${t}"`)}})}function Si(r,e){const i=r.get(z),n=[],t=Ci(e);if(t&&t.length>0){for(const a of t){const l=i.getInstanceFromId(a.instanceId);l&&n.push(l)}if(n.length>0)return n}}function D(r,e,i){const n=r.get(Be),t=r.get(z),a=r.get(ne),l=[],p=n.lastFocusedList,w=p?.getSelection();if(a.lastAccessedMenu==="inline-tab"&&!w?.length)return a.activeInstance?[a.activeInstance]:void 0;if(!p||!w)return;const f=p.getFocus();if(f.length===1&&!w.includes(f[0]))return l.push(t.getInstanceFromIndex(f[0])),l;for(const S of w)l.push(t.getInstanceFromIndex(S));return l.filter(S=>!!S)}function ki(r){return!r||r.trim().length===0?{content:k("emptyTerminalNameInfo","Providing no name will reset it to the default value"),severity:qe.Info}:null}function Ie(r){return W(r)&&"profileName"in r?{config:r,location:r.location}:r}let te;function Ii(r){const e=Ve(r);return te?.dispose(),te=ue(class extends me{constructor(){super({id:c.NewWithProfile,title:u("workbench.action.terminal.newWithProfile","Create New Terminal (With Profile)"),f1:!0,category:V,precondition:h.or(m.processSupported,m.webExtensionContributedProfile),metadata:{description:c.NewWithProfile,args:[{name:"args",schema:{type:"object",required:["profileName"],properties:{profileName:{description:k("workbench.action.terminal.newWithProfile.profileName","The name of the profile to create"),type:"string",enum:e.values,markdownEnumDescriptions:e.markdownDescriptions},location:{description:k("newWithProfile.location","Where to create the terminal"),type:"string",enum:["view","editor"],enumDescriptions:[k("newWithProfile.location.view","Create the terminal in the terminal view"),k("newWithProfile.location.editor","Create the terminal in the editor")]}}}}]}})}async run(i,n,t){const a=ke(i),l=i.get(K),p=i.get(B);let w,f,S,A;if(W(n)&&n&&"profileName"in n){const b=a.profileService.availableProfiles.find(T=>T.profileName===n.profileName);if(!b)throw new Error(`Could not find terminal profile "${n.profileName}"`);if(f={config:b},"location"in n)switch(n.location){case"editor":f.location=x.Editor;break;case"view":f.location=x.Panel;break}}else Y(n)||xe(n)||We(n)?(w=n,f=t?{config:t}:void 0):f=Ie(n);if(w&&(w.altKey||w.ctrlKey)){const b=a.service.activeInstance;if(b){await a.service.createTerminal({location:{parentTerminal:b},config:f?.config});return}}if(l.getWorkspace().folders.length>1){const b={placeHolder:k("workbench.action.terminal.newWorkspacePlaceholder","Select current working directory for new terminal")},T=await p.executeCommand(we,[b]);if(!T)return;A=T.uri}f?(f.cwd=A,S=await a.service.createTerminal(f)):S=await a.service.showProfileQuickPick("createInstance",A),S&&(a.service.setActiveInstance(S),await F(S,a))}}),te}function O(r,e){return r.service.getInstanceFromResource(Te(e))||r.service.activeInstance}async function yi(r,e){const i=r.get(_),n=r.get(fe),t=r.get(K),a=r.get(Me),l=r.get(Oe),p=r.get(pe),w=r.get(he),f=t.getWorkspace().folders;if(!f.length)return;const S=await Promise.all(f.map(P=>Ti(P,p,w))),A=Ai(S);if(A.length===1)return A[0];const R=A.map(P=>{const re=P.folder.name,oe=P.isOverridden?k("workbench.action.terminal.overriddenCwdDescription","(Overriden) {0}",n.getUriLabel(P.cwd,{relative:!P.isAbsolute})):n.getUriLabel(Ke(P.cwd),{relative:!0});return{label:re,description:oe!==re?oe:void 0,pair:P,iconClasses:Ue(a,l,P.cwd,Ge.ROOT_FOLDER)}}),b={placeHolder:k("workbench.action.terminal.newWorkspacePlaceholder","Select current working directory for new terminal"),matchOnDescription:!0,canPickMany:!1},T=e||Ee.None;return(await i.pick(R,b,T))?.pair}async function Ti(r,e,i){const n=e.getValue(ve.Cwd,{resource:r.uri});if(!M(n)||n.length===0)return{folder:r,cwd:r.uri,isAbsolute:!1,isOverridden:!1};const t=await i.resolveAsync(r,n);return Ne(t)||t.startsWith($e.VARIABLE_LHS)?{folder:r,isAbsolute:!0,isOverridden:!0,cwd:G.from({...r.uri,path:t})}:{folder:r,isAbsolute:!1,isOverridden:!0,cwd:G.joinPath(r.uri,t)}}function Ai(r){const e=new Map;for(const t of r){const a=t.cwd.toString();(!e.get(a)||a===t.folder.uri.toString())&&e.set(a,t)}const i=new Set(e.values());return r.filter(t=>i.has(t))}async function F(r,e){r.target===x.Editor?(await e.editorService.revealActiveEditor(),await r.focusWhenReady(!0)):await e.groupService.showPanel(!0)}async function ye(r,e,i){let n=i;if((!n||!n?.rename)&&(n=O(r,i)),n){const t=await e.get(_).input({value:n.title,prompt:k("workbench.action.terminal.rename.prompt","Enter terminal name")});n.rename(t)}}function Te(r){return G.isUri(r)?r:void 0}function $(r){return M(r)?r:void 0}export{Q as TerminalLaunchHelpAction,gi as getCwdForSplit,Ii as refreshTerminalActions,I as registerActiveInstanceAction,y as registerActiveXtermAction,j as registerContextualInstanceAction,v as registerTerminalAction,Jn as registerTerminalActions,Ai as shrinkWorkspaceFolderCwdPairs,wi as switchTerminalActionViewItemSeparator,hi as switchTerminalShowTabsTitle,bi as terminalSendSequenceCommand,ki as validateTerminalName};
