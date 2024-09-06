import{revive as y}from"../../../../../vs/base/common/marshalling.js";import{OffsetRange as r}from"../../../../../vs/editor/common/core/offsetRange.js";import"../../../../../vs/editor/common/core/range.js";import{reviveSerializedAgent as C}from"../../../../../vs/workbench/contrib/chat/common/chatAgents.js";import"../../../../../vs/workbench/contrib/chat/common/chatSlashCommands.js";import"../../../../../vs/workbench/contrib/chat/common/chatVariables.js";function O(a){const e=a.parts.map(n=>n.promptText).join("").trimStart(),t=a.text.length-e.length;return{message:e,diff:t}}class l{constructor(e,t,n){this.range=e;this.editorRange=t;this.text=n}static Kind="text";kind=l.Kind;get promptText(){return this.text}}const f="#",x="@",g="/";class m{constructor(e,t,n,s,i){this.range=e;this.editorRange=t;this.variableName=n;this.variableArg=s;this.variableId=i}static Kind="var";kind=m.Kind;get text(){const e=this.variableArg?`:${this.variableArg}`:"";return`${f}${this.variableName}${e}`}get promptText(){return this.text}}class u{constructor(e,t,n,s){this.range=e;this.editorRange=t;this.toolName=n;this.toolId=s}static Kind="tool";kind=u.Kind;get text(){return`${f}${this.toolName}`}get promptText(){return this.text}}class o{constructor(e,t,n){this.range=e;this.editorRange=t;this.agent=n}static Kind="agent";kind=o.Kind;get text(){return`${x}${this.agent.name}`}get promptText(){return""}}class d{constructor(e,t,n){this.range=e;this.editorRange=t;this.command=n}static Kind="subcommand";kind=d.Kind;get text(){return`${g}${this.command.name}`}get promptText(){return""}}class c{constructor(e,t,n){this.range=e;this.editorRange=t;this.slashCommand=n}static Kind="slash";kind=c.Kind;get text(){return`${g}${this.slashCommand.command}`}get promptText(){return`${g}${this.slashCommand.command}`}}class h{constructor(e,t,n,s,i,R){this.range=e;this.editorRange=t;this.text=n;this.id=s;this.modelDescription=i;this.data=R}static Kind="dynamic";kind=h.Kind;get referenceText(){return this.text.replace(f,"")}get promptText(){return this.text}}function S(a){return{text:a.text,parts:a.parts.map(e=>{if(e.kind===l.Kind)return new l(new r(e.range.start,e.range.endExclusive),e.editorRange,e.text);if(e.kind===m.Kind)return new m(new r(e.range.start,e.range.endExclusive),e.editorRange,e.variableName,e.variableArg,e.variableId||"");if(e.kind===u.Kind)return new u(new r(e.range.start,e.range.endExclusive),e.editorRange,e.toolName,e.toolId);if(e.kind===o.Kind){let t=e.agent;return t=C(t),new o(new r(e.range.start,e.range.endExclusive),e.editorRange,t)}else{if(e.kind===d.Kind)return new d(new r(e.range.start,e.range.endExclusive),e.editorRange,e.command);if(e.kind===c.Kind)return new c(new r(e.range.start,e.range.endExclusive),e.editorRange,e.slashCommand);if(e.kind===h.Kind)return new h(new r(e.range.start,e.range.endExclusive),e.editorRange,e.text,e.id,e.modelDescription,y(e.data));throw new Error(`Unknown chat request part: ${e.kind}`)}})}}function E(a){const e=a.parts.find(n=>n instanceof o),t=a.parts.find(n=>n instanceof d);return{agentPart:e,commandPart:t}}function N(a,e,t,n=null,s=null){let i="";if(n&&n!==a.getDefaultAgent(e)?.id){const R=a.getAgent(n);if(!R)return;i+=`${x}${R.name} `,s&&(i+=`${g}${s} `)}return i+t}export{o as ChatRequestAgentPart,d as ChatRequestAgentSubcommandPart,h as ChatRequestDynamicVariablePart,c as ChatRequestSlashCommandPart,l as ChatRequestTextPart,u as ChatRequestToolPart,m as ChatRequestVariablePart,x as chatAgentLeader,g as chatSubcommandLeader,f as chatVariableLeader,E as extractAgentAndCommand,N as formatChatQuestion,O as getPromptText,S as reviveParsedChatRequest};
