import"../../../../../../vs/base/common/actions.js";import"../../../../../../vs/base/common/cancellation.js";import"../../../../../../vs/base/common/event.js";import"../../../../../../vs/base/common/lifecycle.js";import"../../../../../../vs/base/common/uri.js";import{createDecorator as i}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import"../../../../../../vs/platform/terminal/common/capabilities/capabilities.js";import"../../../../../../vs/platform/terminal/common/terminal.js";const v=i("terminalQuickFixService");var n=(e=>(e[e.TerminalCommand=0]="TerminalCommand",e[e.Opener=1]="Opener",e[e.Port=2]="Port",e[e.VscodeCommand=3]="VscodeCommand",e))(n||{});export{v as ITerminalQuickFixService,n as TerminalQuickFixType};