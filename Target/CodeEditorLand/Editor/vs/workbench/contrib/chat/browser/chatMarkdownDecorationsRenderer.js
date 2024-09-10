var U=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var S=(c,a,e,t)=>{for(var i=t>1?void 0:t?x(a,e):a,r=c.length-1,n;r>=0;r--)(n=c[r])&&(i=(t?n(a,e,i):n(i))||i);return t&&i&&U(a,e,i),i},s=(c,a)=>(e,t)=>a(e,t,c);import{applyDragImage as E}from"../../../../base/browser/dnd.js";import*as m from"../../../../base/browser/dom.js";import{Button as R}from"../../../../base/browser/ui/button/button.js";import{getDefaultHoverDelegate as f}from"../../../../base/browser/ui/hover/hoverDelegateFactory.js";import{IconLabel as P}from"../../../../base/browser/ui/iconLabel/iconLabel.js";import{toErrorMessage as I}from"../../../../base/common/errorMessage.js";import{Lazy as O}from"../../../../base/common/lazy.js";import{Disposable as W,DisposableStore as J}from"../../../../base/common/lifecycle.js";import{revive as _}from"../../../../base/common/marshalling.js";import{URI as C}from"../../../../base/common/uri.js";import{ILanguageService as F}from"../../../../editor/common/languages/language.js";import{getIconClasses as V}from"../../../../editor/common/services/getIconClasses.js";import{IModelService as B}from"../../../../editor/common/services/model.js";import{ICommandService as K}from"../../../../platform/commands/common/commands.js";import{IHoverService as D}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as $}from"../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as j}from"../../../../platform/keybinding/common/keybinding.js";import{ILabelService as H}from"../../../../platform/label/common/label.js";import{ILogService as z}from"../../../../platform/log/common/log.js";import{listActiveSelectionBackground as Q,listActiveSelectionForeground as G}from"../../../../platform/theme/common/colors/listColors.js";import{asCssVariable as v}from"../../../../platform/theme/common/colorUtils.js";import{IThemeService as X}from"../../../../platform/theme/common/themeService.js";import{fillEditorsDragData as Y}from"../../../browser/dnd.js";import{contentRefUrl as Z}from"../common/annotations.js";import{getFullyQualifiedId as ee,IChatAgentNameService as te,IChatAgentService as w}from"../common/chatAgents.js";import{chatSlashCommandBackground as T,chatSlashCommandForeground as N}from"../common/chatColors.js";import{chatAgentLeader as re,ChatRequestAgentPart as ie,ChatRequestAgentSubcommandPart as ne,ChatRequestDynamicVariablePart as ae,ChatRequestSlashCommandPart as oe,ChatRequestTextPart as se,ChatRequestToolPart as ce,ChatRequestVariablePart as de,chatSubcommandLeader as ge}from"../common/chatParserTypes.js";import{IChatService as le}from"../common/chatService.js";import{IChatVariablesService as me}from"../common/chatVariables.js";import{ILanguageModelToolsService as he}from"../common/languageModelToolsService.js";import{IChatWidgetService as ve}from"./chat.js";import{ChatAgentHover as ue,getChatAgentHoverOptions as pe}from"./chatAgentHover.js";import"./media/chatInlineFileLinkWidget.css";const b="http://_vscodedecoration_",u="http://_chatagent_",M="http://_chatslash_";function Se(c,a,e){const t=e.get(te),i=e.get(w),r=t.getAgentNameRestriction(c);let n=`${r?c.name:ee(c)}`;r&&i.agentHasDupeName(c.id)&&(n+=` (${c.publisherDisplayName})`);const d={agentId:c.id,name:n,isClickable:a};return`[${c.name}](${u}?${encodeURIComponent(JSON.stringify(d))})`}function at(c,a){const e=`${ge}${a.name}`,t={agentId:c.id,command:a.name};return`[${e}](${M}?${encodeURIComponent(JSON.stringify(t))})`}let p=class extends W{constructor(e,t,i,r,n,o,d,l,g,A,k){super();this.keybindingService=e;this.logService=t;this.chatAgentService=i;this.instantiationService=r;this.hoverService=n;this.chatService=o;this.chatWidgetService=d;this.commandService=l;this.chatVariablesService=g;this.labelService=A;this.toolsService=k}convertParsedRequestToMarkdown(e){let t="";for(const i of e.parts)i instanceof se?t+=i.text:i instanceof ie?t+=this.instantiationService.invokeFunction(r=>Se(i.agent,!1,r)):t+=this.genericDecorationToMarkdown(i);return t}genericDecorationToMarkdown(e){const t=e instanceof ae&&e.data instanceof C?e.data:void 0,r={title:t?this.labelService.getUriLabel(t,{relative:!0}):e instanceof oe?e.slashCommand.detail:e instanceof ne?e.command.description:e instanceof de?this.chatVariablesService.getVariable(e.variableName)?.description:e instanceof ce?this.toolsService.getTool(e.toolId)?.userDescription:""};return`[${e.text}](${b}?${encodeURIComponent(JSON.stringify(r))})`}walkTreeAndAnnotateReferenceLinks(e){const t=new J;return e.querySelectorAll("a").forEach(i=>{const r=i.getAttribute("data-href");if(r)if(r.startsWith(u)){let n;try{n=JSON.parse(decodeURIComponent(r.slice(u.length+1)))}catch(o){this.logService.error("Invalid chat widget render data JSON",I(o))}n&&i.parentElement.replaceChild(this.renderAgentWidget(n,t),i)}else if(r.startsWith(M)){let n;try{n=JSON.parse(decodeURIComponent(r.slice(u.length+1)))}catch(o){this.logService.error("Invalid chat slash command render data JSON",I(o))}n&&i.parentElement.replaceChild(this.renderSlashCommandWidget(i.textContent,n,t),i)}else if(r.startsWith(b)){let n;try{n=JSON.parse(decodeURIComponent(r.slice(b.length+1)))}catch{}i.parentElement.replaceChild(this.renderResourceWidget(i.textContent,n,t),i)}else r.startsWith(Z)?this.renderFileWidget(r,i,t):r.startsWith("command:")&&this.injectKeybindingHint(i,r,this.keybindingService)}),t}renderAgentWidget(e,t){const i=`${re}${e.name}`;let r;if(e.isClickable){r=m.$("span.chat-agent-widget");const d=t.add(new R(r,{buttonBackground:v(T),buttonForeground:v(N),buttonHoverBackground:void 0}));d.label=i,t.add(d.onDidClick(()=>{const l=this.chatAgentService.getAgent(e.agentId),g=this.chatWidgetService.lastFocusedWidget;!g||!l||this.chatService.sendRequest(g.viewModel.sessionId,l.metadata.sampleRequest??"",{location:g.location,agentId:l.id})}))}else r=this.renderResourceWidget(i,void 0,t);const n=this.chatAgentService.getAgent(e.agentId),o=new O(()=>t.add(this.instantiationService.createInstance(ue)));return t.add(this.hoverService.setupManagedHover(f("element"),r,()=>(o.value.setAgent(e.agentId),o.value.domNode),n&&pe(()=>n,this.commandService))),r}renderSlashCommandWidget(e,t,i){const r=m.$("span.chat-agent-widget.chat-command-widget"),n=this.chatAgentService.getAgent(t.agentId),o=i.add(new R(r,{buttonBackground:v(T),buttonForeground:v(N),buttonHoverBackground:void 0}));return o.label=e,i.add(o.onDidClick(()=>{const d=this.chatWidgetService.lastFocusedWidget;if(!d||!n)return;const l=n.slashCommands.find(g=>g.name===t.command);this.chatService.sendRequest(d.viewModel.sessionId,l?.sampleRequest??"",{location:d.location,agentId:n.id,slashCommand:t.command})})),r}renderFileWidget(e,t,i){const r=C.parse(e);let n;try{n=_(JSON.parse(r.fragment))}catch(o){this.logService.error("Invalid chat widget render data JSON",I(o));return}if(!n.uri||!C.isUri(n.uri)){this.logService.error(`Invalid chat widget render data: ${r.fragment}`);return}i.add(this.instantiationService.createInstance(h,t,n))}renderResourceWidget(e,t,i){const r=m.$("span.chat-resource-widget"),n=m.$("span",void 0,e);return t?.title&&i.add(this.hoverService.setupManagedHover(f("element"),r,t.title)),r.appendChild(n),r}injectKeybindingHint(e,t,i){const r=t.match(/command:([^\)]+)/)?.[1];if(r){const n=i.lookupKeybinding(r);if(n){const o=n.getLabel();o&&(e.textContent=`${e.textContent} (${o})`)}}}};p=S([s(0,j),s(1,z),s(2,w),s(3,$),s(4,D),s(5,le),s(6,ve),s(7,K),s(8,me),s(9,H),s(10,he)],p);let h=class extends W{constructor(a,e,t,i,r,n,o,d){super(),a.classList.add("chat-inline-file-link-widget");const l=e.range?`${e.range.startLineNumber}-${e.range.endLineNumber}`:"";a.setAttribute("data-href",e.uri.with({fragment:l}).toString());const g=r.getUriLabel(e.uri,{relative:!0}),A=e.range?`${g}#${e.range.startLineNumber}-${e.range.endLineNumber}`:g;a.replaceChildren(),this._register(new P(a,{supportHighlights:!1,supportIcons:!0})).setLabel(g,void 0,{extraClasses:V(o,n,e.uri)}),this._register(t.setupManagedHover(f("element"),a,A)),a.draggable=!0,this._register(m.addDisposableListener(a,"dragstart",L=>{i.invokeFunction(q=>Y(q,[e.uri],L));const y=d.getColorTheme();E(L,g,"monaco-drag-image",y.getColor(Q)?.toString(),y.getColor(G)?.toString())}))}};h=S([s(2,D),s(3,$),s(4,H),s(5,F),s(6,B),s(7,X)],h);export{p as ChatMarkdownDecorationsRenderer,at as agentSlashCommandToMarkdown,Se as agentToMarkdown};
