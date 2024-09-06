import{Codicon as e}from"../../../../../vs/base/common/codicons.js";import{localize as o}from"../../../../../vs/nls.js";import{registerIcon as t}from"../../../../../vs/platform/theme/common/iconRegistry.js";const s=t("debug-console-view-icon",e.debugConsole,o("debugConsoleViewIcon","View icon of the debug console view.")),p=t("run-view-icon",e.debugAlt,o("runViewIcon","View icon of the run view.")),g=t("variables-view-icon",e.debugAlt,o("variablesViewIcon","View icon of the variables view.")),l=t("watch-view-icon",e.debugAlt,o("watchViewIcon","View icon of the watch view.")),k=t("callstack-view-icon",e.debugAlt,o("callStackViewIcon","View icon of the call stack view.")),f=t("breakpoints-view-icon",e.debugAlt,o("breakpointsViewIcon","View icon of the breakpoints view.")),v=t("loaded-scripts-view-icon",e.debugAlt,o("loadedScriptsViewIcon","View icon of the loaded scripts view.")),n={regular:t("debug-breakpoint",e.debugBreakpoint,o("debugBreakpoint","Icon for breakpoints.")),disabled:t("debug-breakpoint-disabled",e.debugBreakpointDisabled,o("debugBreakpointDisabled","Icon for disabled breakpoints.")),unverified:t("debug-breakpoint-unverified",e.debugBreakpointUnverified,o("debugBreakpointUnverified","Icon for unverified breakpoints.")),pending:t("debug-breakpoint-pending",e.debugBreakpointPending,o("debugBreakpointPendingOnTrigger","Icon for breakpoints waiting on another breakpoint."))},i={regular:t("debug-breakpoint-function",e.debugBreakpointFunction,o("debugBreakpointFunction","Icon for function breakpoints.")),disabled:t("debug-breakpoint-function-disabled",e.debugBreakpointFunctionDisabled,o("debugBreakpointFunctionDisabled","Icon for disabled function breakpoints.")),unverified:t("debug-breakpoint-function-unverified",e.debugBreakpointFunctionUnverified,o("debugBreakpointFunctionUnverified","Icon for unverified function breakpoints."))},r={regular:t("debug-breakpoint-conditional",e.debugBreakpointConditional,o("debugBreakpointConditional","Icon for conditional breakpoints.")),disabled:t("debug-breakpoint-conditional-disabled",e.debugBreakpointConditionalDisabled,o("debugBreakpointConditionalDisabled","Icon for disabled conditional breakpoints.")),unverified:t("debug-breakpoint-conditional-unverified",e.debugBreakpointConditionalUnverified,o("debugBreakpointConditionalUnverified","Icon for unverified conditional breakpoints."))},a={regular:t("debug-breakpoint-data",e.debugBreakpointData,o("debugBreakpointData","Icon for data breakpoints.")),disabled:t("debug-breakpoint-data-disabled",e.debugBreakpointDataDisabled,o("debugBreakpointDataDisabled","Icon for disabled data breakpoints.")),unverified:t("debug-breakpoint-data-unverified",e.debugBreakpointDataUnverified,o("debugBreakpointDataUnverified","Icon for unverified data breakpoints."))},d={regular:t("debug-breakpoint-log",e.debugBreakpointLog,o("debugBreakpointLog","Icon for log breakpoints.")),disabled:t("debug-breakpoint-log-disabled",e.debugBreakpointLogDisabled,o("debugBreakpointLogDisabled","Icon for disabled log breakpoint.")),unverified:t("debug-breakpoint-log-unverified",e.debugBreakpointLogUnverified,o("debugBreakpointLogUnverified","Icon for unverified log breakpoints."))},h=t("debug-hint",e.debugHint,o("debugBreakpointHint","Icon for breakpoint hints shown on hover in editor glyph margin.")),w=t("debug-breakpoint-unsupported",e.debugBreakpointUnsupported,o("debugBreakpointUnsupported","Icon for unsupported breakpoints.")),I=[n,i,r,a,d],x=t("debug-stackframe",e.debugStackframe,o("debugStackframe","Icon for a stackframe shown in the editor glyph margin.")),m=t("debug-stackframe-focused",e.debugStackframeFocused,o("debugStackframeFocused","Icon for a focused stackframe  shown in the editor glyph margin.")),B=t("debug-gripper",e.gripper,o("debugGripper","Icon for the debug bar gripper.")),C=t("debug-restart-frame",e.debugRestartFrame,o("debugRestartFrame","Icon for the debug restart frame action.")),S=t("debug-stop",e.debugStop,o("debugStop","Icon for the debug stop action.")),A=t("debug-disconnect",e.debugDisconnect,o("debugDisconnect","Icon for the debug disconnect action.")),R=t("debug-restart",e.debugRestart,o("debugRestart","Icon for the debug restart action.")),V=t("debug-step-over",e.debugStepOver,o("debugStepOver","Icon for the debug step over action.")),D=t("debug-step-into",e.debugStepInto,o("debugStepInto","Icon for the debug step into action.")),E=t("debug-step-out",e.debugStepOut,o("debugStepOut","Icon for the debug step out action.")),F=t("debug-step-back",e.debugStepBack,o("debugStepBack","Icon for the debug step back action.")),U=t("debug-pause",e.debugPause,o("debugPause","Icon for the debug pause action.")),y=t("debug-continue",e.debugContinue,o("debugContinue","Icon for the debug continue action.")),O=t("debug-reverse-continue",e.debugReverseContinue,o("debugReverseContinue","Icon for the debug reverse continue action.")),P=t("debug-run",e.run,o("debugRun","Icon for the run or debug action.")),L=t("debug-start",e.debugStart,o("debugStart","Icon for the debug start action.")),G=t("debug-configure",e.gear,o("debugConfigure","Icon for the debug configure action.")),H=t("debug-console",e.gear,o("debugConsole","Icon for the debug console open action.")),M=t("debug-remove-config",e.trash,o("debugRemoveConfig","Icon for removing debug configurations.")),z=t("debug-collapse-all",e.collapseAll,o("debugCollapseAll","Icon for the collapse all action in the debug views.")),T=t("callstack-view-session",e.bug,o("callstackViewSession","Icon for the session icon in the call stack view.")),j=t("debug-console-clear-all",e.clearAll,o("debugConsoleClearAll","Icon for the clear all action in the debug console.")),q=t("watch-expressions-remove-all",e.closeAll,o("watchExpressionsRemoveAll","Icon for the Remove All action in the watch view.")),J=t("watch-expression-remove",e.removeClose,o("watchExpressionRemove","Icon for the Remove action in the watch view.")),K=t("watch-expressions-add",e.add,o("watchExpressionsAdd","Icon for the add action in the watch view.")),N=t("watch-expressions-add-function-breakpoint",e.add,o("watchExpressionsAddFuncBreakpoint","Icon for the add function breakpoint action in the watch view.")),Q=t("watch-expressions-add-data-breakpoint",e.variableGroup,o("watchExpressionsAddDataBreakpoint","Icon for the add data breakpoint action in the breakpoints view.")),W=t("breakpoints-remove-all",e.closeAll,o("breakpointsRemoveAll","Icon for the Remove All action in the breakpoints view.")),X=t("breakpoints-activate",e.activateBreakpoints,o("breakpointsActivate","Icon for the activate action in the breakpoints view.")),Y=t("debug-console-evaluation-input",e.arrowSmallRight,o("debugConsoleEvaluationInput","Icon for the debug evaluation input marker.")),Z=t("debug-console-evaluation-prompt",e.chevronRight,o("debugConsoleEvaluationPrompt","Icon for the debug evaluation prompt.")),_=t("debug-inspect-memory",e.fileBinary,o("debugInspectMemory","Icon for the inspect memory action."));export{I as allBreakpoints,n as breakpoint,X as breakpointsActivate,W as breakpointsRemoveAll,f as breakpointsViewIcon,k as callStackViewIcon,T as callstackViewSession,r as conditionalBreakpoint,a as dataBreakpoint,h as debugBreakpointHint,w as debugBreakpointUnsupported,z as debugCollapseAll,G as debugConfigure,H as debugConsole,j as debugConsoleClearAll,Y as debugConsoleEvaluationInput,Z as debugConsoleEvaluationPrompt,s as debugConsoleViewIcon,y as debugContinue,A as debugDisconnect,B as debugGripper,_ as debugInspectMemory,U as debugPause,M as debugRemoveConfig,R as debugRestart,C as debugRestartFrame,O as debugReverseContinue,P as debugRun,x as debugStackframe,m as debugStackframeFocused,L as debugStart,F as debugStepBack,D as debugStepInto,E as debugStepOut,V as debugStepOver,S as debugStop,i as functionBreakpoint,v as loadedScriptsViewIcon,d as logBreakpoint,p as runViewIcon,g as variablesViewIcon,J as watchExpressionRemove,K as watchExpressionsAdd,Q as watchExpressionsAddDataBreakpoint,N as watchExpressionsAddFuncBreakpoint,q as watchExpressionsRemoveAll,l as watchViewIcon};