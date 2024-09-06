var K=Object.defineProperty;var O=Object.getOwnPropertyDescriptor;var N=(C,i,l,n)=>{for(var r=n>1?void 0:n?O(i,l):i,s=C.length-1,a;s>=0;s--)(a=C[s])&&(r=(n?a(i,l,r):a(r))||r);return n&&r&&K(i,l,r),r},m=(C,i)=>(l,n)=>i(l,n,C);import"../../../../../../vs/base/common/cancellation.js";import{Disposable as E}from"../../../../../../vs/base/common/lifecycle.js";import"../../../../../../vs/editor/common/core/position.js";import{Range as A}from"../../../../../../vs/editor/common/core/range.js";import{getWordAtText as Q}from"../../../../../../vs/editor/common/core/wordHelper.js";import{CompletionItemKind as x}from"../../../../../../vs/editor/common/languages.js";import"../../../../../../vs/editor/common/model.js";import{ILanguageFeaturesService as L}from"../../../../../../vs/editor/common/services/languageFeatures.js";import{localize as G}from"../../../../../../vs/nls.js";import{Action2 as J,registerAction2 as X}from"../../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as Y}from"../../../../../../vs/platform/configuration/common/configuration.js";import"../../../../../../vs/platform/instantiation/common/instantiation.js";import{Registry as F}from"../../../../../../vs/platform/registry/common/platform.js";import{Extensions as q}from"../../../../../../vs/workbench/common/contributions.js";import{SubmitAction as Z}from"../../../../../../vs/workbench/contrib/chat/browser/actions/chatExecuteActions.js";import{IChatWidgetService as U}from"../../../../../../vs/workbench/contrib/chat/browser/chat.js";import{ChatInputPart as D}from"../../../../../../vs/workbench/contrib/chat/browser/chatInputPart.js";import{SelectAndInsertFileAction as z}from"../../../../../../vs/workbench/contrib/chat/browser/contrib/chatDynamicVariables.js";import{ChatAgentLocation as j,getFullyQualifiedId as ee,IChatAgentNameService as te,IChatAgentService as re}from"../../../../../../vs/workbench/contrib/chat/common/chatAgents.js";import{chatAgentLeader as ie,ChatRequestAgentPart as V,ChatRequestAgentSubcommandPart as ne,ChatRequestTextPart as ae,ChatRequestToolPart as se,ChatRequestVariablePart as oe,chatSubcommandLeader as R,chatVariableLeader as T}from"../../../../../../vs/workbench/contrib/chat/common/chatParserTypes.js";import{IChatSlashCommandService as le}from"../../../../../../vs/workbench/contrib/chat/common/chatSlashCommands.js";import{IChatVariablesService as ce}from"../../../../../../vs/workbench/contrib/chat/common/chatVariables.js";import{ILanguageModelToolsService as ue}from"../../../../../../vs/workbench/contrib/chat/common/languageModelToolsService.js";import{LifecyclePhase as H}from"../../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";let M=class extends E{constructor(l,n,r){super();this.languageFeaturesService=l;this.chatWidgetService=n;this.chatSlashCommandService=r;this._register(this.languageFeaturesService.completionProvider.register({scheme:D.INPUT_SCHEME,hasAccessToAllModels:!0},{_debugDisplayName:"globalSlashCommands",triggerCharacters:["/"],provideCompletionItems:async(s,a,f,b)=>{const p=this.chatWidgetService.getWidgetByInputUri(s.uri);if(!p||!p.viewModel||!$(s,a,/\/\w*/g))return null;if(p.parsedInput.parts.find(d=>d instanceof V))return;const h=this.chatSlashCommandService.getCommands(p.location);return h?{suggestions:h.map((d,u)=>{const e=`/${d.command}`;return{label:e,insertText:d.executeImmediately?"":`${e} `,detail:d.detail,range:new A(1,1,1,1),sortText:d.sortText??"a".repeat(u+1),kind:x.Text,command:d.executeImmediately?{id:Z.ID,title:e,arguments:[{widget:p,inputValue:`${e} `}]}:void 0}})}:null}}))}};M=N([m(0,L),m(1,U),m(2,le)],M),F.as(q.Workbench).registerWorkbenchContribution(M,H.Eventually);let _=class extends E{constructor(l,n,r,s){super();this.languageFeaturesService=l;this.chatWidgetService=n;this.chatAgentService=r;this.chatAgentNameService=s;this._register(this.languageFeaturesService.completionProvider.register({scheme:D.INPUT_SCHEME,hasAccessToAllModels:!0},{_debugDisplayName:"chatAgent",triggerCharacters:["@"],provideCompletionItems:async(a,f,b,p)=>{const o=this.chatWidgetService.getWidgetByInputUri(a.uri);if(!o||!o.viewModel)return null;const g=o.parsedInput.parts.find(u=>u instanceof V);return g&&!A.containsPosition(g.editorRange,f)?void 0:$(a,f,/@\w*/g)?{suggestions:this.chatAgentService.getAgents().filter(u=>!u.isDefault).filter(u=>u.locations.includes(o.location)).map((u,e)=>{const{label:c,isDupe:I}=this.getAgentCompletionDetails(u);return{label:I?{label:c,description:u.description,detail:` (${u.publisherDisplayName})`}:c,insertText:`${c} `,detail:u.description,range:new A(1,1,1,1),command:{id:S.ID,title:S.ID,arguments:[{agent:u,widget:o}]},kind:x.Text}})}:null}})),this._register(this.languageFeaturesService.completionProvider.register({scheme:D.INPUT_SCHEME,hasAccessToAllModels:!0},{_debugDisplayName:"chatAgentSubcommand",triggerCharacters:["/"],provideCompletionItems:async(a,f,b,p)=>{const o=this.chatWidgetService.getWidgetByInputUri(a.uri);if(!o||!o.viewModel)return;const v=$(a,f,/\/\w*/g);if(!v)return null;const g=o.parsedInput.parts,h=g.findIndex(e=>e instanceof V);if(h<0||g.find(e=>e instanceof ne))return;for(const e of g.slice(h+1))if(!(e instanceof ae)||!e.text.trim().match(/^(\/\w*)?$/))return;return{suggestions:g[h].agent.slashCommands.map((e,c)=>{const I=`/${e.name}`;return{label:I,insertText:`${I} `,detail:e.description,range:v,kind:x.Text}})}}})),this._register(this.languageFeaturesService.completionProvider.register({scheme:D.INPUT_SCHEME,hasAccessToAllModels:!0},{_debugDisplayName:"chatAgentAndSubcommand",triggerCharacters:["/"],provideCompletionItems:async(a,f,b,p)=>{const o=this.chatWidgetService.getWidgetByInputUri(a.uri),v=o?.viewModel;if(!o||!v)return;if(!$(a,f,/\/\w*/g))return null;const h=this.chatAgentService.getAgents().filter(e=>e.locations.includes(o.location)),d=(e,c)=>{const I=e.id==="github.copilot.terminalPanel"?"0000":"";return`${R}${I}${e.name}.${c}`};return{suggestions:h.filter(e=>!e.isDefault).map(e=>{const{label:c,isDupe:I}=this.getAgentCompletionDetails(e),y=e.description;return{label:I?{label:c,description:e.description,detail:` (${e.publisherDisplayName})`}:c,detail:y,filterText:`${R}${e.name}`,insertText:`${c} `,range:new A(1,1,1,1),kind:x.Text,sortText:`${R}${e.name}`,command:{id:S.ID,title:S.ID,arguments:[{agent:e,widget:o}]}}}).concat(h.flatMap(e=>e.slashCommands.map((c,I)=>{const{label:y,isDupe:B}=this.getAgentCompletionDetails(e),w=`${R}${c.name}`,t={label:{label:w,description:y,detail:B?` (${e.publisherDisplayName})`:void 0},filterText:d(e,c.name),commitCharacters:[" "],insertText:`${y} ${w} `,detail:`(${y}) ${c.description??""}`,range:new A(1,1,1,1),kind:x.Text,sortText:`${R}${e.name}${c.name}`,command:{id:S.ID,title:S.ID,arguments:[{agent:e,widget:o}]}};return e.isDefault&&(t.label=w,t.insertText=`${w} `,t.detail=c.description),t})))}}}))}getAgentCompletionDetails(l){const n=this.chatAgentNameService.getAgentNameRestriction(l),r=`${ie}${n?l.name:ee(l)}`,s=n&&this.chatAgentService.agentHasDupeName(l.id);return{label:r,isDupe:s}}};_=N([m(0,L),m(1,U),m(2,re),m(3,te)],_),F.as(q.Workbench).registerWorkbenchContribution(_,H.Eventually);class S extends J{static ID="workbench.action.chat.assignSelectedAgent";constructor(){super({id:S.ID,title:""})}async run(i,...l){const n=l[0];!n||!n.widget||!n.agent||(n.widget.lastSelectedAgent=n.agent)}}X(S);let W=class extends E{constructor(l,n){super();this.languageFeaturesService=l;this.chatWidgetService=n;this._register(this.languageFeaturesService.completionProvider.register({scheme:D.INPUT_SCHEME,hasAccessToAllModels:!0},{_debugDisplayName:"chatDynamicCompletions",triggerCharacters:[T],provideCompletionItems:async(r,s,a,f)=>{const b=this.chatWidgetService.getWidgetByInputUri(r.uri);if(!b||!b.supportsFileReferences)return null;const p=$(r,s,W.VariableNameDef,!0);if(!p)return null;const o=new A(s.lineNumber,p.replace.startColumn,s.lineNumber,p.replace.startColumn+6);return{suggestions:[{label:`${T}file`,insertText:`${T}file:`,detail:G("pickFileLabel","Pick a file"),range:p,kind:x.Text,command:{id:z.ID,title:z.ID,arguments:[{widget:b,range:o}]},sortText:"z"}]}}}))}static VariableNameDef=new RegExp(`${T}\\w*`,"g")};W=N([m(0,L),m(1,U)],W),F.as(q.Workbench).registerWorkbenchContribution(W,H.Eventually);function $(C,i,l,n=!1){const r=Q(i.column,l,C.getLineContent(i.lineNumber),0);if(!r&&C.getWordUntilPosition(i).word||r&&n&&C.getWordUntilPosition({lineNumber:i.lineNumber,column:r.startColumn}).word)return;let s,a;return r?(s=new A(i.lineNumber,r.startColumn,i.lineNumber,i.column),a=new A(i.lineNumber,r.startColumn,i.lineNumber,r.endColumn)):s=a=A.fromPositions(i),{insert:s,replace:a,varWord:r}}let P=class extends E{constructor(l,n,r,s,a){super();this.languageFeaturesService=l;this.chatWidgetService=n;this.chatVariablesService=r;this._register(this.languageFeaturesService.completionProvider.register({scheme:D.INPUT_SCHEME,hasAccessToAllModels:!0},{_debugDisplayName:"chatVariables",triggerCharacters:[T],provideCompletionItems:async(f,b,p,o)=>{const v=new Set;v.add(j.Panel);for(const t of Object.values(j))typeof t=="string"&&s.getValue(`chat.experimental.variables.${t}`)&&v.add(t);const g=this.chatWidgetService.getWidgetByInputUri(f.uri);if(!g||!v.has(g.location))return null;const h=$(f,b,P.VariableNameDef,!0);if(!h)return null;const d=g.parsedInput.parts.find(t=>t instanceof V),u=d?d.agent.metadata.supportsSlowVariables:!0,e=g.parsedInput.parts.filter(t=>t instanceof oe),c=new Set(e.map(t=>t.variableName)),I=Array.from(this.chatVariablesService.getVariables(g.location)).filter(t=>!c.has(t.name)).filter(t=>!t.isSlow||u).map(t=>{const k=`${T}${t.name}`;return{label:k,range:h,insertText:k+" ",detail:t.description,kind:x.Text,sortText:"z"}}),y=g.parsedInput.parts.filter(t=>t instanceof se),B=new Set(y.map(t=>t.toolName)),w=[];return(!d||d.agent.supportsToolReferences)&&w.push(...Array.from(a.getTools()).filter(t=>t.canBeInvokedManually).filter(t=>!B.has(t.name??"")).map(t=>{const k=`${T}${t.name}`;return{label:k,range:h,insertText:k+" ",detail:t.userDescription,kind:x.Text,sortText:"z"}})),{suggestions:[...I,...w]}}}))}static VariableNameDef=new RegExp(`${T}\\w*`,"g")};P=N([m(0,L),m(1,U),m(2,ce),m(3,Y),m(4,ue)],P),F.as(q.Workbench).registerWorkbenchContribution(P,H.Eventually);
