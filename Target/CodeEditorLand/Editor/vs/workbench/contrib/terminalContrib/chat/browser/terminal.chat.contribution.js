import{registerTerminalContribution as t}from"../../../../../../vs/workbench/contrib/terminal/browser/terminalExtensions.js";import{TerminalInlineChatAccessibleView as o}from"../../../../../../vs/workbench/contrib/terminalContrib/chat/browser/terminalChatAccessibleView.js";import{TerminalChatController as r}from"../../../../../../vs/workbench/contrib/terminalContrib/chat/browser/terminalChatController.js";import"../../../../../../vs/workbench/contrib/terminalContrib/chat/browser/terminalChatActions.js";import{AccessibleViewRegistry as e}from"../../../../../../vs/platform/accessibility/browser/accessibleViewRegistry.js";import{registerWorkbenchContribution2 as m,WorkbenchPhase as n}from"../../../../../../vs/workbench/common/contributions.js";import{TerminalChatAccessibilityHelp as l}from"../../../../../../vs/workbench/contrib/terminalContrib/chat/browser/terminalChatAccessibilityHelp.js";import{TerminalChatEnabler as i}from"../../../../../../vs/workbench/contrib/terminalContrib/chat/browser/terminalChatEnabler.js";t(r.ID,r,!1),e.register(new o),e.register(new l),m(i.Id,i,n.AfterRestored);