var g=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var l=(s,n,i,t)=>{for(var e=t>1?void 0:t?v(n,i):n,r=s.length-1,a;r>=0;r--)(a=s[r])&&(e=(t?a(n,i,e):a(e))||e);return t&&e&&g(n,i,e),e},d=(s,n)=>(i,t)=>n(i,t,s);import*as p from"../../../../base/browser/dom.js";import{Button as y}from"../../../../base/browser/ui/button/button.js";import{MarkdownString as f}from"../../../../base/common/htmlContent.js";import{Disposable as A}from"../../../../base/common/lifecycle.js";import{localize as S}from"../../../../nls.js";import{IChatAgentService as k}from"../common/chatAgents.js";import{formatChatQuestion as u}from"../common/chatParserTypes.js";const L=p.$;let c=class extends A{constructor(i,t,e,r,a,m){super();this.location=e;this.options=r;this.clickHandler=a;this.chatAgentService=m;const o=p.append(i,L(".interactive-session-followups"));t.forEach(h=>this.renderFollowup(o,h))}renderFollowup(i,t){if(!this.chatAgentService.getDefaultAgent(this.location))return;const e=u(this.chatAgentService,this.location,"",t.agentId,t.subCommand);if(e===void 0)return;const r=t.kind==="reply"?t.title||t.message:t.title,a=t.kind==="reply"?t.message:t.title,m=(e+("tooltip"in t&&t.tooltip||a)).trim(),o=this._register(new y(i,{...this.options,title:m}));t.kind==="reply"?o.element.classList.add("interactive-followup-reply"):t.kind==="command"&&o.element.classList.add("interactive-followup-command"),o.element.ariaLabel=S("followUpAriaLabel","Follow up question: {0}",r),o.label=new f(r),this._register(o.onDidClick(()=>this.clickHandler(t)))}};c=l([d(5,k)],c);export{c as ChatFollowups};
