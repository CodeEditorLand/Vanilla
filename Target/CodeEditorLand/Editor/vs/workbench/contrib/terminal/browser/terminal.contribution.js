import{KeyCode as r,KeyMod as e}from"../../../../base/common/keyCodes.js";import{Schemas as q}from"../../../../base/common/network.js";import{isIOS as O,isWindows as I}from"../../../../base/common/platform.js";import{URI as N}from"../../../../base/common/uri.js";import"./media/terminal.css";import"./media/terminalVoice.css";import"./media/widgets.css";import"./media/xterm.css";import*as C from"../../../../nls.js";import{CONTEXT_ACCESSIBILITY_MODE_ENABLED as m}from"../../../../platform/accessibility/common/accessibility.js";import{CommandsRegistry as w}from"../../../../platform/commands/common/commands.js";import{ContextKeyExpr as i}from"../../../../platform/contextkey/common/contextkey.js";import{Extensions as L}from"../../../../platform/dnd/browser/dnd.js";import{SyncDescriptor as u}from"../../../../platform/instantiation/common/descriptors.js";import{InstantiationType as l,registerSingleton as s}from"../../../../platform/instantiation/common/extensions.js";import{KeybindingWeight as B,KeybindingsRegistry as Q}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{Extensions as z}from"../../../../platform/quickinput/common/quickAccess.js";import{Registry as p}from"../../../../platform/registry/common/platform.js";import{GeneralShellType as c,ITerminalLogService as M,WindowsShellType as _}from"../../../../platform/terminal/common/terminal.js";import{TerminalLogService as F}from"../../../../platform/terminal/common/terminalLogService.js";import{registerTerminalPlatformConfiguration as G}from"../../../../platform/terminal/common/terminalPlatformConfiguration.js";import{EditorPaneDescriptor as H}from"../../../browser/editor.js";import{ViewPaneContainer as J}from"../../../browser/parts/views/viewPaneContainer.js";import{getQuickNavigateHandler as E}from"../../../browser/quickaccess.js";import{WorkbenchPhase as h,registerWorkbenchContribution2 as S}from"../../../common/contributions.js";import{EditorExtensions as A}from"../../../common/editor.js";import{Extensions as D,ViewContainerLocation as X}from"../../../common/views.js";import{RemoteTerminalBackendContribution as k}from"./remoteTerminalBackend.js";import{ITerminalConfigurationService as U,ITerminalEditorService as Y,ITerminalGroupService as $,ITerminalInstanceService as j,ITerminalService as Z,TerminalDataTransfers as b,terminalEditorId as ee}from"./terminal.js";import{registerTerminalActions as re,terminalSendSequenceCommand as ie}from"./terminalActions.js";import{setupTerminalCommands as te}from"./terminalCommands.js";import{TerminalConfigurationService as ne}from"./terminalConfigurationService.js";import{TerminalEditor as oe}from"./terminalEditor.js";import{TerminalEditorInput as R}from"./terminalEditorInput.js";import{TerminalInputSerializer as ae}from"./terminalEditorSerializer.js";import{TerminalEditorService as me}from"./terminalEditorService.js";import{TerminalGroupService as le}from"./terminalGroupService.js";import{terminalViewIcon as P}from"./terminalIcons.js";import{TerminalInstanceService as se}from"./terminalInstanceService.js";import{TerminalMainContribution as x}from"./terminalMainContribution.js";import{setupTerminalMenus as ce}from"./terminalMenus.js";import{TerminalProfileService as pe}from"./terminalProfileService.js";import{TerminalQuickAccessProvider as v}from"./terminalQuickAccess.js";import{TerminalService as de}from"./terminalService.js";import{TerminalViewPane as fe}from"./terminalView.js";import{TerminalWslRecommendationContribution as K}from"./terminalWslRecommendationContribution.js";import{ITerminalProfileService as ge,TERMINAL_VIEW_ID as y,TerminalCommandId as T}from"../common/terminal.js";import{registerColors as Ce}from"../common/terminalColorRegistry.js";import{registerTerminalConfiguration as ye}from"../common/terminalConfiguration.js";import{TerminalContextKeyStrings as a,TerminalContextKeys as n}from"../common/terminalContextKey.js";import{terminalStrings as ue}from"../common/terminalStrings.js";import{TerminalSuggestSettingId as he}from"../../terminalContrib/suggest/common/terminalSuggestConfiguration.js";s(M,F,l.Delayed),s(U,ne,l.Delayed),s(Z,de,l.Delayed),s(Y,me,l.Delayed),s($,le,l.Delayed),s(j,se,l.Delayed),s(ge,pe,l.Delayed);const Se=p.as(z.Quickaccess),Te="inTerminalPicker";Se.registerQuickAccessProvider({ctor:v,prefix:v.PREFIX,contextKey:Te,placeholder:C.localize("tasksQuickAccessPlaceholder","Type the name of a terminal to open."),helpEntries:[{description:C.localize("tasksQuickAccessHelp","Show All Opened Terminals"),commandId:T.QuickOpenTerm}]});const V="workbench.action.quickOpenNavigateNextInTerminalPicker";w.registerCommand({id:V,handler:E(V,!0)});const W="workbench.action.quickOpenNavigatePreviousInTerminalPicker";w.registerCommand({id:W,handler:E(W,!1)}),S(x.ID,x,h.BlockStartup),S(k.ID,k,h.AfterRestored),S(K.ID,K,h.Eventually),G(),ye(),p.as(A.EditorFactory).registerEditorSerializer(R.ID,ae),p.as(A.EditorPane).registerEditorPane(H.create(oe,ee,ue.terminal),[new u(R)]),p.as(L.DragAndDropContribution).register({dataFormatKey:b.Terminals,getEditorInputs(d){const o=[];try{const f=JSON.parse(d);for(const g of f)o.push({resource:N.parse(g)})}catch{}return o},setData(d,o){const f=d.filter(({resource:g})=>g.scheme===q.vscodeTerminal);f.length&&o.dataTransfer?.setData(b.Terminals,JSON.stringify(f.map(({resource:g})=>g.toString())))}});const Ie=p.as(D.ViewContainersRegistry).registerViewContainer({id:y,title:C.localize2("terminal","Terminal"),icon:P,ctorDescriptor:new u(J,[y,{mergeViewWithContainerWhenSingleView:!0}]),storageId:y,hideIfEmpty:!0,order:3},X.Panel,{doNotRegisterOpenCommand:!0,isDefault:!0});p.as(D.ViewsRegistry).registerViews([{id:y,name:C.localize2("terminal","Terminal"),containerIcon:P,canToggleVisibility:!1,canMoveView:!0,ctorDescriptor:new u(fe),openCommandActionDescriptor:{id:T.Toggle,mnemonicTitle:C.localize({key:"miToggleIntegratedTerminal",comment:["&& denotes a mnemonic"]},"&&Terminal"),keybindings:{primary:e.CtrlCmd|r.Backquote,mac:{primary:e.WinCtrl|r.Backquote}},order:3}}],Ie),re();function t(d,o){Q.registerCommandAndKeybindingRule({id:T.SendSequence,weight:B.WorkbenchContrib,when:o.when||n.focus,primary:o.primary,mac:o.mac,linux:o.linux,win:o.win,handler:ie,args:{text:d}})}var we=(o=>(o[o.CtrlLetterOffset=64]="CtrlLetterOffset",o))(we||{});I&&t(String.fromCharCode("V".charCodeAt(0)-64),{when:i.and(n.focus,i.equals(a.ShellType,c.PowerShell),m.negate()),primary:e.CtrlCmd|r.KeyV}),t("\x1B[24~a",{when:i.and(n.focus,i.equals(a.ShellType,c.PowerShell),n.terminalShellIntegrationEnabled,m.negate()),primary:e.CtrlCmd|r.Space,mac:{primary:e.WinCtrl|r.Space}}),t("\x1B[24~b",{when:i.and(n.focus,i.equals(a.ShellType,c.PowerShell),n.terminalShellIntegrationEnabled,m.negate()),primary:e.Alt|r.Space}),t("\x1B[24~c",{when:i.and(n.focus,i.equals(a.ShellType,c.PowerShell),n.terminalShellIntegrationEnabled,m.negate()),primary:e.Shift|r.Enter}),t("\x1B[24~d",{when:i.and(n.focus,i.equals(a.ShellType,c.PowerShell),n.terminalShellIntegrationEnabled,m.negate()),mac:{primary:e.Shift|e.CtrlCmd|r.RightArrow}}),t("\x1B[24~e",{when:i.and(n.focus,i.equals(a.ShellType,c.PowerShell),n.terminalShellIntegrationEnabled,m.negate(),i.equals(`config.${he.Enabled}`,!0)),primary:e.CtrlCmd|r.Space,mac:{primary:e.WinCtrl|r.Space}}),t("\x1B[1;2H",{when:i.and(n.focus,i.equals(a.ShellType,c.PowerShell)),mac:{primary:e.Shift|e.CtrlCmd|r.LeftArrow}}),t("",{when:i.and(n.focus,m),primary:e.CtrlCmd|e.Alt|r.KeyR,mac:{primary:e.WinCtrl|e.Alt|r.KeyR}}),t("\x07",{when:n.focus,primary:e.CtrlCmd|e.Alt|r.KeyG,mac:{primary:e.WinCtrl|e.Alt|r.KeyG}}),O&&t(String.fromCharCode("C".charCodeAt(0)-64),{when:i.and(n.focus),primary:e.WinCtrl|r.KeyC}),t(String.fromCharCode("W".charCodeAt(0)-64),{primary:e.CtrlCmd|r.Backspace,mac:{primary:e.Alt|r.Backspace}}),I&&t(String.fromCharCode("H".charCodeAt(0)-64),{when:i.and(n.focus,i.equals(a.ShellType,_.CommandPrompt)),primary:e.CtrlCmd|r.Backspace}),t("\x1Bd",{primary:e.CtrlCmd|r.Delete,mac:{primary:e.Alt|r.Delete}}),t("",{mac:{primary:e.CtrlCmd|r.Backspace}}),t(String.fromCharCode("A".charCodeAt(0)-64),{mac:{primary:e.CtrlCmd|r.LeftArrow}}),t(String.fromCharCode("E".charCodeAt(0)-64),{mac:{primary:e.CtrlCmd|r.RightArrow}}),t("\0",{primary:e.CtrlCmd|e.Shift|r.Digit2,mac:{primary:e.WinCtrl|e.Shift|r.Digit2}}),t("",{primary:e.CtrlCmd|e.Shift|r.Digit6,mac:{primary:e.WinCtrl|e.Shift|r.Digit6}}),t("",{primary:e.CtrlCmd|r.Slash,mac:{primary:e.WinCtrl|r.Slash}}),te(),ce(),Ce();
