import"../../../../../vs/platform/instantiation/common/instantiation.js";import{Registry as t}from"../../../../../vs/platform/registry/common/platform.js";import"../../../../../vs/workbench/contrib/terminal/browser/terminal.js";import"../../../../../vs/workbench/contrib/terminal/browser/widgets/widgetManager.js";import"../../../../../vs/workbench/contrib/terminal/common/terminal.js";function S(r,n,i=!1){e.INSTANCE.registerTerminalContribution({id:r,ctor:n,canRunInDetachedTerminals:i})}var a;(n=>{function r(){return e.INSTANCE.getTerminalContributions()}n.getTerminalContributions=r})(a||={});class e{static INSTANCE=new e;_terminalContributions=[];constructor(){}registerTerminalContribution(n){this._terminalContributions.push(n)}getTerminalContributions(){return this._terminalContributions.slice(0)}}var o=(n=>(n.TerminalContributions="terminal.contributions",n))(o||{});t.add("terminal.contributions",e.INSTANCE);export{a as TerminalExtensionsRegistry,S as registerTerminalContribution};