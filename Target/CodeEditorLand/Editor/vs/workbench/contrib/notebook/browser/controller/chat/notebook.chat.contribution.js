var b=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var m=(i,o,r,e)=>{for(var t=e>1?void 0:e?h(o,r):o,s=i.length-1,c;s>=0;s--)(c=i[s])&&(t=(e?c(o,r,t):c(t))||t);return e&&t&&b(o,r,t),t},a=(i,o)=>(r,e)=>o(r,e,i);import{Disposable as p}from"../../../../../../base/common/lifecycle.js";import{IContextKeyService as g}from"../../../../../../platform/contextkey/common/contextkey.js";import{registerWorkbenchContribution2 as I,WorkbenchPhase as d}from"../../../../../common/contributions.js";import{ChatAgentLocation as l,IChatAgentService as A}from"../../../../chat/common/chatAgents.js";import"./cellChatActions.js";import{CTX_NOTEBOOK_CHAT_HAS_AGENT as C}from"./notebookChatContext.js";let n=class extends p{static ID="workbench.contrib.notebookChatContribution";_ctxHasProvider;constructor(o,r){super(),this._ctxHasProvider=C.bindTo(o);const e=()=>{const t=!!r.getDefaultAgent(l.Notebook);this._ctxHasProvider.set(t)};e(),this._register(r.onDidChangeAgents(e))}};n=m([a(0,g),a(1,A)],n),I(n.ID,n,d.BlockRestore);
