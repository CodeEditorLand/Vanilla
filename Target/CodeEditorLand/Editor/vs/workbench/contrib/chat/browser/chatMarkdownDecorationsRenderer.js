var $=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var b=(o,i,e,r)=>{for(var t=r>1?void 0:r?D(i,e):i,n=o.length-1,a;n>=0;n--)(a=o[n])&&(t=(r?a(i,e,t):a(t))||t);return r&&t&&$(i,e,t),t},c=(o,i)=>(e,r)=>i(e,r,o);import{applyDragImage as k}from"../../../../base/browser/dnd.js";import*as l from"../../../../base/browser/dom.js";import{Button as A}from"../../../../base/browser/ui/button/button.js";import{getDefaultHoverDelegate as S}from"../../../../base/browser/ui/hover/hoverDelegateFactory.js";import{toErrorMessage as f}from"../../../../base/common/errorMessage.js";import{Lazy as H}from"../../../../base/common/lazy.js";import{DisposableStore as N}from"../../../../base/common/lifecycle.js";import{revive as T}from"../../../../base/common/marshalling.js";import{URI as p}from"../../../../base/common/uri.js";import"../../../../editor/common/languages.js";import{ICommandService as w}from"../../../../platform/commands/common/commands.js";import{IHoverService as q}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as M}from"../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as U}from"../../../../platform/keybinding/common/keybinding.js";import{ILabelService as P}from"../../../../platform/label/common/label.js";import{ILogService as x}from"../../../../platform/log/common/log.js";import{listActiveSelectionBackground as E,listActiveSelectionForeground as F}from"../../../../platform/theme/common/colorRegistry.js";import{asCssVariable as m}from"../../../../platform/theme/common/colorUtils.js";import{IThemeService as O}from"../../../../platform/theme/common/themeService.js";import{fillEditorsDragData as J}from"../../../browser/dnd.js";import{contentRefUrl as V}from"../common/annotations.js";import{getFullyQualifiedId as B,IChatAgentNameService as K,IChatAgentService as y}from"../common/chatAgents.js";import{chatSlashCommandBackground as W,chatSlashCommandForeground as R}from"../common/chatColors.js";import{chatAgentLeader as _,ChatRequestAgentPart as j,ChatRequestAgentSubcommandPart as z,ChatRequestDynamicVariablePart as Q,ChatRequestSlashCommandPart as G,ChatRequestTextPart as X,ChatRequestToolPart as Y,ChatRequestVariablePart as Z,chatSubcommandLeader as ee}from"../common/chatParserTypes.js";import{IChatService as te}from"../common/chatService.js";import{IChatVariablesService as ie}from"../common/chatVariables.js";import{ILanguageModelToolsService as ne}from"../common/languageModelToolsService.js";import{IChatWidgetService as re}from"./chat.js";import{ChatAgentHover as ae,getChatAgentHoverOptions as oe}from"./chatAgentHover.js";const I="http://_vscodedecoration_",h="http://_chatagent_",L="http://_chatslash_";function se(o,i,e){const r=e.get(K),t=e.get(y),n=r.getAgentNameRestriction(o);let a=`${n?o.name:B(o)}`;n&&t.agentHasDupeName(o.id)&&(a+=` (${o.publisherDisplayName})`);const g={agentId:o.id,name:a,isClickable:i};return`[${o.name}](${h}?${encodeURIComponent(JSON.stringify(g))})`}function Ke(o,i){const e=`${ee}${i.name}`,r={agentId:o.id,command:i.name};return`[${e}](${L}?${encodeURIComponent(JSON.stringify(r))})`}let v=class{constructor(i,e,r,t,n,a,s,g,d,u,C,ce){this.keybindingService=i;this.labelService=e;this.logService=r;this.chatAgentService=t;this.instantiationService=n;this.hoverService=a;this.chatService=s;this.chatWidgetService=g;this.commandService=d;this.chatVariablesService=u;this.toolsService=C;this.themeService=ce}convertParsedRequestToMarkdown(i){let e="";for(const r of i.parts)r instanceof X?e+=r.text:r instanceof j?e+=this.instantiationService.invokeFunction(t=>se(r.agent,!1,t)):e+=this.genericDecorationToMarkdown(r);return e}genericDecorationToMarkdown(i){const e=i instanceof Q&&i.data instanceof p?i.data:void 0,t={title:e?this.labelService.getUriLabel(e,{relative:!0}):i instanceof G?i.slashCommand.detail:i instanceof z?i.command.description:i instanceof Z?this.chatVariablesService.getVariable(i.variableName)?.description:i instanceof Y?this.toolsService.getTool(i.toolId)?.userDescription:""};return`[${i.text}](${I}?${encodeURIComponent(JSON.stringify(t))})`}walkTreeAndAnnotateReferenceLinks(i){const e=new N;return i.querySelectorAll("a").forEach(r=>{const t=r.getAttribute("data-href");if(t)if(t.startsWith(h)){let n;try{n=JSON.parse(decodeURIComponent(t.slice(h.length+1)))}catch(a){this.logService.error("Invalid chat widget render data JSON",f(a))}n&&r.parentElement.replaceChild(this.renderAgentWidget(n,e),r)}else if(t.startsWith(L)){let n;try{n=JSON.parse(decodeURIComponent(t.slice(h.length+1)))}catch(a){this.logService.error("Invalid chat slash command render data JSON",f(a))}n&&r.parentElement.replaceChild(this.renderSlashCommandWidget(r.textContent,n,e),r)}else if(t.startsWith(I)){let n;try{n=JSON.parse(decodeURIComponent(t.slice(I.length+1)))}catch{}r.parentElement.replaceChild(this.renderResourceWidget(r.textContent,n,e),r)}else t.startsWith(V)?this.renderFileWidget(t,r,e):t.startsWith("command:")&&this.injectKeybindingHint(r,t,this.keybindingService)}),e}renderAgentWidget(i,e){const r=`${_}${i.name}`;let t;if(i.isClickable){t=l.$("span.chat-agent-widget");const s=e.add(new A(t,{buttonBackground:m(W),buttonForeground:m(R),buttonHoverBackground:void 0}));s.label=r,e.add(s.onDidClick(()=>{const g=this.chatAgentService.getAgent(i.agentId),d=this.chatWidgetService.lastFocusedWidget;!d||!g||this.chatService.sendRequest(d.viewModel.sessionId,g.metadata.sampleRequest??"",{location:d.location,agentId:g.id})}))}else t=this.renderResourceWidget(r,void 0,e);const n=this.chatAgentService.getAgent(i.agentId),a=new H(()=>e.add(this.instantiationService.createInstance(ae)));return e.add(this.hoverService.setupManagedHover(S("element"),t,()=>(a.value.setAgent(i.agentId),a.value.domNode),n&&oe(()=>n,this.commandService))),t}renderSlashCommandWidget(i,e,r){const t=l.$("span.chat-agent-widget.chat-command-widget"),n=this.chatAgentService.getAgent(e.agentId),a=r.add(new A(t,{buttonBackground:m(W),buttonForeground:m(R),buttonHoverBackground:void 0}));return a.label=i,r.add(a.onDidClick(()=>{const s=this.chatWidgetService.lastFocusedWidget;if(!s||!n)return;const g=n.slashCommands.find(d=>d.name===e.command);this.chatService.sendRequest(s.viewModel.sessionId,g?.sampleRequest??"",{location:s.location,agentId:n.id,slashCommand:e.command})})),t}renderFileWidget(i,e,r){const t=p.parse(i);let n;try{n=T(JSON.parse(t.fragment))}catch(d){this.logService.error("Invalid chat widget render data JSON",f(d));return}if(!n.uri||!p.isUri(n.uri)){this.logService.error(`Invalid chat widget render data: ${t.fragment}`);return}const a=n.range?`${n.range.startLineNumber}-${n.range.endLineNumber}`:"";e.setAttribute("data-href",n.uri.with({fragment:a}).toString());const s=this.labelService.getUriLabel(n.uri,{relative:!0});e.replaceChildren(l.$("code",void 0,s));const g=n.range?`${s}#${n.range.startLineNumber}-${n.range.endLineNumber}`:s;r.add(this.hoverService.setupManagedHover(S("element"),e,g)),e.draggable=!0,r.add(l.addDisposableListener(e,"dragstart",d=>{this.instantiationService.invokeFunction(C=>J(C,[n.uri],d));const u=this.themeService.getColorTheme();k(d,s,"monaco-drag-image",u.getColor(E)?.toString(),u.getColor(F)?.toString())}))}renderResourceWidget(i,e,r){const t=l.$("span.chat-resource-widget"),n=l.$("span",void 0,i);return e?.title&&r.add(this.hoverService.setupManagedHover(S("element"),t,e.title)),t.appendChild(n),t}injectKeybindingHint(i,e,r){const t=e.match(/command:([^\)]+)/)?.[1];if(t){const n=r.lookupKeybinding(t);if(n){const a=n.getLabel();a&&(i.textContent=`${i.textContent} (${a})`)}}}};v=b([c(0,U),c(1,P),c(2,x),c(3,y),c(4,M),c(5,q),c(6,te),c(7,re),c(8,w),c(9,ie),c(10,ne),c(11,O)],v);export{v as ChatMarkdownDecorationsRenderer,Ke as agentSlashCommandToMarkdown,se as agentToMarkdown};
