import{asArray as d}from"../../../vs/base/common/arrays.js";import{DeferredPromise as u}from"../../../vs/base/common/async.js";import{toDisposable as w}from"../../../vs/base/common/lifecycle.js";import{mark as f}from"vs/base/common/performance";import"../../../vs/base/common/uri.js";import{MenuId as c,MenuRegistry as h}from"../../../vs/platform/actions/common/actions.js";import{CommandsRegistry as l}from"../../../vs/platform/commands/common/commands.js";import"../../../vs/platform/log/common/log.js";import"../../../vs/platform/progress/common/progress.js";import{Menu as a}from"../../../vs/workbench/browser/web.api.js";import{BrowserMain as g}from"../../../vs/workbench/browser/web.main.js";import"../../../vs/workbench/services/terminal/common/embedderTerminalService.js";let m=!1;const r=new u;function _(t,s){if(f("code/didLoadWorkbenchMain"),m)throw new Error("Unable to create the VSCode workbench more than once.");if(m=!0,Array.isArray(s.commands)){for(const e of s.commands)if(l.registerCommand(e.id,(o,...i)=>e.handler(...i)),e.label)for(const o of d(e.menu??a.CommandPalette))h.appendMenuItem(I(o),{command:{id:e.id,title:e.label}})}let n;return new g(t,s).open().then(e=>{n=e,r.complete(e)}),w(()=>{n?n.shutdown():r.p.then(e=>e.shutdown())})}function I(t){switch(t){case a.CommandPalette:return c.CommandPalette;case a.StatusBarWindowIndicatorMenu:return c.StatusBarWindowIndicatorMenu}}var b;(s=>{async function t(n,...e){return(await r.p).commands.executeCommand(n,...e)}s.executeCommand=t})(b||={});var k;(s=>{function t(n,e){r.p.then(o=>o.logger.log(n,e))}s.log=t})(k||={});var P;(e=>{async function t(){return(await r.p).env.retrievePerformanceMarks()}e.retrievePerformanceMarks=t;async function s(){return(await r.p).env.getUriScheme()}e.getUriScheme=s;async function n(o){return(await r.p).env.openUri(o)}e.openUri=n})(P||={});var x;(e=>{async function t(o,i){return(await r.p).window.withProgress(o,i)}e.withProgress=t;async function s(o){(await r.p).window.createTerminal(o)}e.createTerminal=s;async function n(o,...i){return await(await r.p).window.showInformationMessage(o,...i)}e.showInformationMessage=n})(x||={});var y;(n=>{async function t(){await(await r.p).workspace.didResolveRemoteAuthority()}n.didResolveRemoteAuthority=t;async function s(e){return(await r.p).workspace.openTunnel(e)}n.openTunnel=s})(y||={});export{b as commands,_ as create,P as env,k as logger,x as window,y as workspace};