var h=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var c=(s,t,e,o)=>{for(var r=o>1?void 0:o?p(t,e):t,n=s.length-1,a;n>=0;n--)(a=s[n])&&(r=(o?a(t,e,r):a(r))||r);return o&&r&&h(t,e,r),r},d=(s,t)=>(e,o)=>t(e,o,s);import{DisposableStore as x}from"../../../../../../vs/base/common/lifecycle.js";import{IContextKeyService as m}from"../../../../../../vs/platform/contextkey/common/contextkey.js";import{ChatAgentLocation as v,IChatAgentService as C}from"../../../../../../vs/workbench/contrib/chat/common/chatAgents.js";import{TerminalChatContextKeys as g}from"../../../../../../vs/workbench/contrib/terminal/browser/terminalContribExports.js";let i=class{static Id="terminalChat.enabler";_ctxHasProvider;_store=new x;constructor(t,e){this._ctxHasProvider=g.hasChatAgent.bindTo(t),this._store.add(e.onDidChangeAgents(()=>{const o=!!e.getDefaultAgent(v.Terminal);this._ctxHasProvider.set(o)}))}dispose(){this._ctxHasProvider.reset(),this._store.dispose()}};i=c([d(0,m),d(1,C)],i);export{i as TerminalChatEnabler};
