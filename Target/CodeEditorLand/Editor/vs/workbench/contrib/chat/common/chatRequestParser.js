var V=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var q=(R,u,t,a)=>{for(var r=a>1?void 0:a?T(u,t):u,e=R.length-1,s;e>=0;e--)(s=R[e])&&(r=(a?s(u,t,r):s(r))||r);return a&&r&&V(u,t,r),r},A=(R,u)=>(t,a)=>u(t,a,R);import{OffsetRange as v}from"../../../../../vs/editor/common/core/offsetRange.js";import{Position as y}from"../../../../../vs/editor/common/core/position.js";import{Range as S}from"../../../../../vs/editor/common/core/range.js";import{ChatAgentLocation as E,IChatAgentService as L}from"../../../../../vs/workbench/contrib/chat/common/chatAgents.js";import{chatAgentLeader as N,ChatRequestAgentPart as b,ChatRequestAgentSubcommandPart as p,ChatRequestDynamicVariablePart as D,ChatRequestSlashCommandPart as x,ChatRequestTextPart as w,ChatRequestToolPart as M,ChatRequestVariablePart as B,chatSubcommandLeader as _,chatVariableLeader as $}from"../../../../../vs/workbench/contrib/chat/common/chatParserTypes.js";import{IChatSlashCommandService as k}from"../../../../../vs/workbench/contrib/chat/common/chatSlashCommands.js";import{IChatVariablesService as F}from"../../../../../vs/workbench/contrib/chat/common/chatVariables.js";import{ILanguageModelToolsService as O}from"../../../../../vs/workbench/contrib/chat/common/languageModelToolsService.js";const Q=/^@([\w_\-\.]+)(?=(\s|$|\b))/i,j=/^#([\w_\-]+)(:\d+)?(?=(\s|$|\b))/i,z=/\/([\w_\-]+)(?=(\s|$|\b))/i;let I=class{constructor(u,t,a,r){this.agentService=u;this.variableService=t;this.slashCommandService=a;this.toolsService=r}parseChatRequest(u,t,a=E.Panel,r){const e=[],s=this.variableService.getDynamicVariables(u);let i=1,c=1;for(let n=0;n<t.length;n++){const f=t.charAt(n-1),o=t.charAt(n);let l;if((f.match(/\s/)||n===0)&&(o===$?l=this.tryToParseVariable(t.slice(n),n,new y(i,c),e):o===N?l=this.tryToParseAgent(t.slice(n),t,n,new y(i,c),e,a,r):o===_&&(l=this.tryToParseSlashCommand(t.slice(n),t,n,new y(i,c),e,a)),l||(l=this.tryToParseDynamicVariable(t.slice(n),n,new y(i,c),s))),l){if(n!==0){const P=e.at(-1),C=P?.range.endExclusive??0,g=P?.editorRange.endLineNumber??1,h=P?.editorRange.endColumn??1;e.push(new w(new v(C,n),new S(g,h,i,c),t.slice(C,n)))}e.push(l)}o===`
`?(i++,c=1):c++}const d=e.at(-1),m=d?.range.endExclusive??0;return m<t.length&&e.push(new w(new v(m,t.length),new S(d?.editorRange.endLineNumber??1,d?.editorRange.endColumn??1,i,c),t.slice(m,t.length))),{parts:e,text:t}}tryToParseAgent(u,t,a,r,e,s,i){const c=u.match(Q);if(!c)return;const[d,m]=c,n=new v(a,a+d.length),f=new S(r.lineNumber,r.column,r.lineNumber,r.column+d.length);let o=this.agentService.getAgentsByName(m);if(!o.length){const h=this.agentService.getAgentByFullyQualifiedId(m);h&&(o=[h])}const l=o.length>1&&i?.selectedAgent?i.selectedAgent:o.find(h=>h.locations.includes(s));if(!l||e.some(h=>h instanceof b)||e.some(h=>h instanceof w&&h.text.trim()!==""||!(h instanceof b)))return;const C=e.at(-1)?.range.endExclusive??0;if(t.slice(C,a).trim()==="")return new b(n,f,l)}tryToParseVariable(u,t,a,r){const e=u.match(j);if(!e)return;const[s,i]=e,c=e[2]??"",d=new v(t,t+s.length),m=new S(a.lineNumber,a.column,a.lineNumber,a.column+s.length),n=r.find(P=>P instanceof b),f=!n||n.agent.metadata.supportsSlowVariables,o=this.variableService.getVariable(i);if(o&&(!o.isSlow||f))return new B(d,m,i,c,o.id);const l=this.toolsService.getToolByName(i);if(l&&l.canBeInvokedManually&&(!n||n.agent.supportsToolReferences))return new M(d,m,i,l.id)}tryToParseSlashCommand(u,t,a,r,e,s){const i=u.match(z);if(!i||e.some(o=>o instanceof x))return;const[c,d]=i,m=new v(a,a+c.length),n=new S(r.lineNumber,r.column,r.lineNumber,r.column+c.length),f=e.find(o=>o instanceof b);if(f){if(e.some(g=>g instanceof w&&g.text.trim()!==""||!(g instanceof b)&&!(g instanceof w)))return;const l=e.at(-1)?.range.endExclusive??0;if(t.slice(l,a).trim()!=="")return;const C=f.agent.slashCommands.find(g=>g.name===d);if(C)return new p(m,n,C)}else{const l=this.slashCommandService.getCommands(s).find(P=>P.command===d);if(l)return new x(m,n,l);{const C=this.agentService.getDefaultAgent(s)?.slashCommands.find(g=>g.name===d);if(C)return new p(m,n,C)}}}tryToParseDynamicVariable(u,t,a,r){const e=r.find(s=>s.range.startLineNumber===a.lineNumber&&s.range.startColumn===a.column);if(e){const s=e.range.endColumn-e.range.startColumn,i=u.substring(0,s),c=new v(t,t+s);return new D(c,e.range,i,e.id,e.modelDescription,e.data)}}};I=q([A(0,L),A(1,F),A(2,k),A(3,O)],I);export{I as ChatRequestParser};