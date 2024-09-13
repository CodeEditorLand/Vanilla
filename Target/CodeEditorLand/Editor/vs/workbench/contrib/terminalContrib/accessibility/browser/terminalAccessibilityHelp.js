var f=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var u=(r,o,e,t)=>{for(var n=t>1?void 0:t?b(o,e):o,a=r.length-1,c;a>=0;a--)(c=r[a])&&(n=(t?c(o,e,n):c(n))||n);return t&&n&&f(o,e,n),n},s=(r,o)=>(e,t)=>o(e,t,r);import{Disposable as g}from"../../../../../base/common/lifecycle.js";import{localize as i}from"../../../../../nls.js";import{AccessibleViewProviderId as p,AccessibleViewType as y}from"../../../../../platform/accessibility/browser/accessibleView.js";import{ICommandService as v}from"../../../../../platform/commands/common/commands.js";import{IConfigurationService as I}from"../../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as h,IContextKeyService as C}from"../../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as w}from"../../../../../platform/instantiation/common/instantiation.js";import{ShellIntegrationStatus as S,TerminalSettingId as T,WindowsShellType as x}from"../../../../../platform/terminal/common/terminal.js";import{AccessibilityVerbositySettingId as A,accessibleViewCurrentProviderId as V,accessibleViewIsShown as k}from"../../../accessibility/browser/accessibilityConfiguration.js";import{AccessibilityCommandId as _}from"../../../accessibility/common/accessibilityCommands.js";import{TerminalCommandId as d}from"../../../terminal/common/terminal.js";import{TerminalLinksCommandId as P}from"../../links/common/terminal.links.js";import{TerminalAccessibilityCommandId as m}from"../common/terminal.accessibility.js";import{TerminalAccessibilitySettingId as R}from"../common/terminalAccessibilityConfiguration.js";var D=(e=>(e.Active="active",e.EditorTextArea="textarea",e))(D||{});let l=class extends g{constructor(e,t,n,a,c,F){super();this._instance=e;this._contextKeyService=a;this._commandService=c;this._configurationService=F;this._hasShellIntegration=t.shellIntegration.status===S.VSCode}id=p.TerminalHelp;_hasShellIntegration=!1;onClose(){h.and(k,h.equals(V.key,p.TerminalHelp))?.evaluate(this._contextKeyService.getContext(null))?this._commandService.executeCommand(m.FocusAccessibleBuffer):this._instance.focus(),this.dispose()}options={type:y.Help,readMoreUrl:"https://code.visualstudio.com/docs/editor/accessibility#_terminal-accessibility"};verbositySettingKey=A.Terminal;provideContent(){const e=[i("focusAccessibleTerminalView","The Focus Accessible Terminal View command<keybinding:{0}> enables screen readers to read terminal contents.",m.FocusAccessibleBuffer),i("preserveCursor","Customize the behavior of the cursor when toggling between the terminal and accessible view with `terminal.integrated.accessibleViewPreserveCursorPosition.`"),i("openDetectedLink","The Open Detected Link command<keybinding:{0}> enables screen readers to easily open links found in the terminal.",P.OpenDetectedLink),i("newWithProfile","The Create New Terminal (With Profile) command<keybinding:{0}> allows for easy terminal creation using a specific profile.",d.NewWithProfile),i("focusAfterRun","Configure what gets focused after running selected text in the terminal with `{0}`.",T.FocusAfterRun)];return this._configurationService.getValue(R.AccessibleViewFocusOnCommandExecution)||e.push(i("focusViewOnExecution","Enable `terminal.integrated.accessibleViewFocusOnCommandExecution` to automatically focus the terminal accessible view when a command is executed in the terminal.")),this._instance.shellType===x.CommandPrompt&&e.push(i("commandPromptMigration","Consider using powershell instead of command prompt for an improved experience")),this._hasShellIntegration?(e.push(i("shellIntegration","The terminal has a feature called shell integration that offers an enhanced experience and provides useful commands for screen readers such as:")),e.push("- "+i("goToNextCommand","Go to Next Command<keybinding:{0}> in the accessible view",m.AccessibleBufferGoToNextCommand)),e.push("- "+i("goToPreviousCommand","Go to Previous Command<keybinding:{0}> in the accessible view",m.AccessibleBufferGoToPreviousCommand)),e.push("- "+i("goToSymbol","Go to Symbol<keybinding:{0}>",_.GoToSymbol)),e.push("- "+i("runRecentCommand","Run Recent Command<keybinding:{0}>",d.RunRecentCommand)),e.push("- "+i("goToRecentDirectory","Go to Recent Directory<keybinding:{0}>",d.GoToRecentDirectory))):e.push(i("noShellIntegration","Shell integration is not enabled. Some accessibility features may not be available.")),e.join(`
`)}};l=u([s(2,w),s(3,C),s(4,v),s(5,I)],l);export{D as ClassName,l as TerminalAccessibilityHelpProvider};
