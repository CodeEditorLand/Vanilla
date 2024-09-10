import{CancellationToken as V}from"../../../../../base/common/cancellation.js";import{Codicon as v}from"../../../../../base/common/codicons.js";import{KeyCode as L,KeyMod as O}from"../../../../../base/common/keyCodes.js";import{Schemas as m}from"../../../../../base/common/network.js";import{compare as W}from"../../../../../base/common/strings.js";import{ThemeIcon as u}from"../../../../../base/common/themables.js";import{URI as M}from"../../../../../base/common/uri.js";import{EditorType as E}from"../../../../../editor/common/editorCommon.js";import{AbstractGotoSymbolQuickAccessProvider as X}from"../../../../../editor/contrib/quickAccess/browser/gotoSymbolQuickAccess.js";import{localize as N,localize2 as b}from"../../../../../nls.js";import{Action2 as y,MenuId as $,registerAction2 as x}from"../../../../../platform/actions/common/actions.js";import{ICommandService as j}from"../../../../../platform/commands/common/commands.js";import{ContextKeyExpr as d}from"../../../../../platform/contextkey/common/contextkey.js";import{KeybindingWeight as G}from"../../../../../platform/keybinding/common/keybindingsRegistry.js";import{IQuickInputService as K}from"../../../../../platform/quickinput/common/quickInput.js";import{CHAT_CATEGORY as P}from"./chatActions.js";import{IChatWidgetService as H,IQuickChatService as z}from"../chat.js";import{isQuickChat as B}from"../chatWidget.js";import{ChatContextAttachments as w}from"../contrib/chatContextAttachments.js";import{ChatAgentLocation as h,IChatAgentService as Y}from"../../common/chatAgents.js";import{CONTEXT_CHAT_LOCATION as C,CONTEXT_IN_CHAT_INPUT as J}from"../../common/chatContextKeys.js";import{ChatRequestAgentPart as R}from"../../common/chatParserTypes.js";import{IChatVariablesService as S}from"../../common/chatVariables.js";import{ILanguageModelToolsService as Z}from"../../common/languageModelToolsService.js";import{AnythingQuickAccessProvider as ee}from"../../../search/browser/anythingQuickAccess.js";import{SymbolsQuickAccessProvider as F}from"../../../search/browser/symbolsQuickAccess.js";import{IEditorService as D}from"../../../../services/editor/common/editorService.js";function $e(){x(g),x(Q),x(T)}class Q extends y{static ID="workbench.action.chat.attachFile";constructor(){super({id:Q.ID,title:b("workbench.action.chat.attachFile.label","Attach File"),category:P,f1:!1})}async run(o,...l){const r=o.get(S),n=o.get(D),e=n.activeEditor?.resource;n.activeTextEditorControl?.getEditorType()===E.ICodeEditor&&e&&[m.file,m.vscodeRemote,m.untitled].includes(e.scheme)&&r.attachContext("file",e,h.Panel)}}class T extends y{static ID="workbench.action.chat.attachSelection";constructor(){super({id:T.ID,title:b("workbench.action.chat.attachSelection.label","Add Selection to Chat"),category:P,f1:!1})}async run(o,...l){const r=o.get(S),n=o.get(D),e=n.activeTextEditorControl,c=n.activeEditor?.resource;if(n.activeTextEditorControl?.getEditorType()===E.ICodeEditor&&c&&[m.file,m.vscodeRemote,m.untitled].includes(c.scheme)){const i=e?.getSelection();i&&r.attachContext("file",{uri:c,range:i},h.Panel)}}}class g extends y{static ID="workbench.action.chat.attachContext";static _cdt=d.or(d.and(C.isEqualTo(h.Panel)),d.and(C.isEqualTo(h.Editor),d.equals("config.chat.experimental.variables.editor",!0)),d.and(C.isEqualTo(h.Notebook),d.equals("config.chat.experimental.variables.notebook",!0)),d.and(C.isEqualTo(h.Terminal),d.equals("config.chat.experimental.variables.terminal",!0)));constructor(){super({id:g.ID,title:b("workbench.action.chat.attachContext.label","Attach Context"),icon:v.attach,category:P,precondition:g._cdt,keybinding:{when:J,primary:O.CtrlCmd|L.Slash,weight:G.EditorContrib},menu:[{when:g._cdt,id:$.ChatExecute,group:"navigation"}]})}_getFileContextId(o){return"resource"in o?o.resource.toString():o.uri.toString()+(o.range.startLineNumber!==o.range.endLineNumber?`:${o.range.startLineNumber}-${o.range.endLineNumber}`:`:${o.range.startLineNumber}`)}async _attachContext(o,l,...r){const n=[];for(const e of r)if(e&&typeof e=="object"&&"command"in e&&e.command){const c=await l.executeCommand(e.command.id,...e.command.arguments??[]);if(!c)continue;n.push({...e,isDynamic:e.isDynamic,value:e.value,name:`${typeof e.value=="string"&&e.value.startsWith("#")?e.value.slice(1):""}${c}`,fullName:c})}else"symbol"in e&&e.symbol?n.push({...e,id:this._getFileContextId(e.symbol.location),value:e.symbol.location,fullName:e.label,name:e.symbol.name,isDynamic:!0}):e&&typeof e=="object"&&"resource"in e&&e.resource?n.push({...e,id:this._getFileContextId({resource:e.resource}),value:e.resource,name:e.label,isFile:!0,isDynamic:!0}):"symbolName"in e&&e.uri&&e.range?n.push({...e,range:void 0,id:this._getFileContextId({uri:e.uri,range:e.range.decoration}),value:{uri:e.uri,range:e.range.decoration},fullName:e.label,name:e.symbolName,isDynamic:!0}):"kind"in e&&e.kind==="tool"?n.push({id:e.id,name:e.label,fullName:e.label,value:void 0,icon:e.icon,isTool:!0}):n.push({...e,range:void 0,id:e.id??"",value:"value"in e?e.value:void 0,fullName:e.label,name:"name"in e&&typeof e.name=="string"?e.name:e.label,icon:"icon"in e&&u.isThemeIcon(e.icon)?e.icon:void 0});o.getContrib(w.ID)?.setContext(!1,...n)}async run(o,...l){const r=o.get(K),n=o.get(Y),e=o.get(S),c=o.get(j),i=o.get(H),f=o.get(Z),_=o.get(z),I=l[0]?.widget??i.lastFocusedWidget;if(!I)return;const k=I.parsedInput.parts.find(t=>t instanceof R),q=k?k.agent.metadata.supportsSlowVariables:!0,p=[];for(const t of e.getVariables(I.location))t.fullName&&(!t.isSlow||q)&&p.push({label:t.fullName,name:t.name,id:t.id,iconClass:t.icon?u.asClassName(t.icon):void 0,icon:t.icon});if(I.viewModel?.sessionId){const t=I.parsedInput.parts.find(a=>a instanceof R);if(t){const a=await n.getAgentCompletionItems(t.agent.id,"",V.None);for(const s of a)s.fullName&&p.push({label:s.fullName,id:s.id,command:s.command,icon:s.icon,iconClass:s.icon?u.asClassName(s.icon):void 0,value:s.value,isDynamic:!0,name:s.name})}}if(!k||k.agent.supportsToolReferences){for(const t of f.getTools())if(t.canBeInvokedManually){const a={kind:"tool",label:t.displayName??t.name??"",id:t.id,icon:u.isThemeIcon(t.icon)?t.icon:void 0};u.isThemeIcon(t.icon)?a.iconClass=u.asClassName(t.icon):t.icon&&(a.iconPath=t.icon),p.push(a)}}p.push({label:N("chatContext.symbol","Symbol..."),icon:u.fromId(v.symbolField.id),iconClass:u.asClassName(v.symbolField),prefix:F.PREFIX});function A(t){if(!t)return"";const a=t.match(/\$\([^\)]+\)\s*(.+)/);return a?a[1]:t}this._show(r,c,I,_,p.sort(function(t,a){const s=A(t.label).toUpperCase(),U=A(a.label).toUpperCase();return W(s,U)}))}_show(o,l,r,n,e,c=""){o.quickAccess.show(c,{enabledProviderPrefixes:[ee.PREFIX,F.PREFIX,X.PREFIX],placeholder:N("chatContext.attach.placeholder","Search attachments"),providerOptions:{handleAccept:i=>{"prefix"in i?this._show(o,l,r,n,e,i.prefix):(this._attachContext(r,l,i),B(r)&&n.open())},additionPicks:e,filter:i=>{const f=r.getContrib(w.ID)?.getContext()??new Set;return"symbol"in i&&i.symbol?!f.has(this._getFileContextId(i.symbol.location)):i&&typeof i=="object"&&"resource"in i&&M.isUri(i.resource)?[m.file,m.vscodeRemote].includes(i.resource.scheme)&&!f.has(this._getFileContextId({resource:i.resource})):i&&typeof i=="object"&&"uri"in i&&i.uri&&i.range?!f.has(this._getFileContextId({uri:i.uri,range:i.range.decoration})):!("command"in i)&&i.id?!f.has(i.id):!0}}})}}export{$e as registerChatContextActions};
