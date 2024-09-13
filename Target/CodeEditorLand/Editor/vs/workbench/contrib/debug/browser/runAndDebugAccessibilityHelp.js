var p=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var g=(c,i,a,n)=>{for(var o=n>1?void 0:n?k(i,a):i,u=c.length-1,b;u>=0;u--)(b=c[u])&&(o=(n?b(i,a,o):b(o))||o);return n&&o&&p(i,a,o),o},d=(c,i)=>(a,n)=>i(a,n,c);import"../../../../editor/browser/editorExtensions.js";import{AccessibleViewProviderId as v,AccessibleViewType as l}from"../../../../platform/accessibility/browser/accessibleView.js";import"../../../../platform/accessibility/browser/accessibleViewRegistry.js";import{ContextKeyExpr as t}from"../../../../platform/contextkey/common/contextkey.js";import{Disposable as f}from"../../../../base/common/lifecycle.js";import{AccessibilityVerbositySettingId as V}from"../../accessibility/browser/accessibilityConfiguration.js";import{localize as e}from"../../../../nls.js";import{ICommandService as w}from"../../../../platform/commands/common/commands.js";import{IViewsService as m}from"../../../services/views/common/viewsService.js";import{AccessibilityHelpNLS as h}from"../../../../editor/common/standaloneStrings.js";import{FocusedViewContext as s,SidebarFocusContext as S}from"../../../common/contextkeys.js";import{BREAKPOINTS_VIEW_ID as y,CALLSTACK_VIEW_ID as D,LOADED_SCRIPTS_VIEW_ID as I,VARIABLES_VIEW_ID as C,WATCH_VIEW_ID as _}from"../common/debug.js";class z{priority=120;name="runAndDebugHelp";when=t.or(t.and(t.equals("activeViewlet","workbench.view.debug"),S),t.equals(s.key,C),t.equals(s.key,_),t.equals(s.key,D),t.equals(s.key,I),t.equals(s.key,y));type=l.Help;getProvider(i){return new r(i.get(w),i.get(m))}}let r=class extends f{constructor(a,n){super();this._commandService=a;this._viewsService=n;this._focusedView=this._viewsService.getFocusedViewName()}id=v.RunAndDebug;verbositySettingKey=V.Debug;options={type:l.Help};_focusedView;onClose(){switch(this._focusedView){case"Watch":this._commandService.executeCommand("workbench.debug.action.focusWatchView");break;case"Variables":this._commandService.executeCommand("workbench.debug.action.focusVariablesView");break;case"Call Stack":this._commandService.executeCommand("workbench.debug.action.focusCallStackView");break;case"Breakpoints":this._commandService.executeCommand("workbench.debug.action.focusBreakpointsView");break;default:this._commandService.executeCommand("workbench.view.debug")}}provideContent(){return[e("debug.showRunAndDebug","The Show Run and Debug view command{0} will open the current view.","<keybinding:workbench.view.debug>"),e("debug.startDebugging","The Debug: Start Debugging command{0} will start a debug session.","<keybinding:workbench.action.debug.start>"),e("debug.help","Access debug output and evaluate expressions in the debug console, which can be focused with{0}.","<keybinding:workbench.panel.repl.view.focus>"),h.setBreakpoint,h.addToWatch,e("onceDebugging","Once debugging, the following commands will be available:"),e("debug.restartDebugging","- Debug: Restart Debugging command{0} will restart the current debug session.","<keybinding:workbench.action.debug.restart>"),e("debug.stopDebugging","- Debug: Stop Debugging command{0} will stop the current debugging session.","<keybinding:workbench.action.debug.stop>"),e("debug.continue","- Debug: Continue command{0} will continue execution until the next breakpoint.","<keybinding:workbench.action.debug.continue>"),e("debug.stepInto","- Debug: Step Into command{0} will step into the next function call.","<keybinding:workbench.action.debug.stepInto>"),e("debug.stepOver","- Debug: Step Over command{0} will step over the current function call.","<keybinding:workbench.action.debug.stepOver>"),e("debug.stepOut","- Debug: Step Out command{0} will step out of the current function call.","<keybinding:workbench.action.debug.stepOut>"),e("debug.views","The debug viewlet is comprised of several views that can be focused with the following commands or navigated to via tab then arrow keys:"),e("debug.focusBreakpoints","- Debug: Focus Breakpoints View command{0} will focus the breakpoints view.","<keybinding:workbench.debug.action.focusBreakpointsView>"),e("debug.focusCallStack","- Debug: Focus Call Stack View command{0} will focus the call stack view.","<keybinding:workbench.debug.action.focusCallStackView>"),e("debug.focusVariables","- Debug: Focus Variables View command{0} will focus the variables view.","<keybinding:workbench.debug.action.focusVariablesView>"),e("debug.focusWatch","- Debug: Focus Watch View command{0} will focus the watch view.","<keybinding:workbench.debug.action.focusWatchView>"),e("debug.watchSetting","The setting {0} controls whether watch variable changes are announced.","accessibility.debugWatchVariableAnnouncements")].join(`
`)}};r=g([d(0,w),d(1,m)],r);export{z as RunAndDebugAccessibilityHelp};
