var U=Object.defineProperty;var z=Object.getOwnPropertyDescriptor;var P=(c,s,i,o)=>{for(var t=o>1?void 0:o?z(s,i):s,d=c.length-1,n;d>=0;d--)(n=c[d])&&(t=(o?n(s,i,t):n(t))||t);return o&&t&&U(s,i,t),t},m=(c,s)=>(i,o)=>s(i,o,c);import{MarkdownString as K}from"../../../../../../vs/base/common/htmlContent.js";import{Disposable as I,MutableDisposable as j}from"../../../../../../vs/base/common/lifecycle.js";import{ICodeEditorService as G}from"../../../../../../vs/editor/browser/services/codeEditorService.js";import{Range as b}from"../../../../../../vs/editor/common/core/range.js";import"../../../../../../vs/editor/common/editorCommon.js";import{IInstantiationService as H}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{inputPlaceholderForeground as J}from"../../../../../../vs/platform/theme/common/colorRegistry.js";import{IThemeService as Q}from"../../../../../../vs/platform/theme/common/themeService.js";import"../../../../../../vs/workbench/contrib/chat/browser/chat.js";import{ChatWidget as O}from"../../../../../../vs/workbench/contrib/chat/browser/chatWidget.js";import{dynamicVariableDecorationType as L}from"../../../../../../vs/workbench/contrib/chat/browser/contrib/chatDynamicVariables.js";import{IChatAgentService as X}from"../../../../../../vs/workbench/contrib/chat/common/chatAgents.js";import{chatSlashCommandBackground as T,chatSlashCommandForeground as E}from"../../../../../../vs/workbench/contrib/chat/common/chatColors.js";import{chatAgentLeader as _,ChatRequestAgentPart as w,ChatRequestAgentSubcommandPart as A,ChatRequestSlashCommandPart as F,ChatRequestTextPart as D,ChatRequestToolPart as N,ChatRequestVariablePart as W,chatSubcommandLeader as Y}from"../../../../../../vs/workbench/contrib/chat/common/chatParserTypes.js";import{ChatRequestParser as Z}from"../../../../../../vs/workbench/contrib/chat/common/chatRequestParser.js";const g="chat",x="chat-session-detail",M="chat-session-text",q="chat-variable-text";function V(c,s){return s?`${c.id}__${s}`:c.id}let C=class extends I{constructor(i,o,t,d){super();this.widget=i;this.codeEditorService=o;this.themeService=t;this.chatAgentService=d;this.codeEditorService.registerDecorationType(g,x,{}),this._register(this.themeService.onDidColorThemeChange(()=>this.updateRegisteredDecorationTypes())),this.updateRegisteredDecorationTypes(),this.updateInputEditorDecorations(),this._register(this.widget.inputEditor.onDidChangeModelContent(()=>this.updateInputEditorDecorations())),this._register(this.widget.onDidChangeParsedInput(()=>this.updateInputEditorDecorations())),this._register(this.widget.onDidChangeViewModel(()=>{this.registerViewModelListeners(),this.previouslyUsedAgents.clear(),this.updateInputEditorDecorations()})),this._register(this.widget.onDidSubmitAgent(n=>{this.previouslyUsedAgents.add(V(n.agent,n.slashCommand?.name))})),this._register(this.chatAgentService.onDidChangeAgents(()=>this.updateInputEditorDecorations())),this.registerViewModelListeners()}id="inputEditorDecorations";previouslyUsedAgents=new Set;viewModelDisposables=this._register(new j);registerViewModelListeners(){this.viewModelDisposables.value=this.widget.viewModel?.onDidChange(i=>{(i?.kind==="changePlaceholder"||i?.kind==="initialize")&&this.updateInputEditorDecorations()})}updateRegisteredDecorationTypes(){this.codeEditorService.removeDecorationType(q),this.codeEditorService.removeDecorationType(L),this.codeEditorService.removeDecorationType(M);const i=this.themeService.getColorTheme();this.codeEditorService.registerDecorationType(g,M,{color:i.getColor(E)?.toString(),backgroundColor:i.getColor(T)?.toString(),borderRadius:"3px"}),this.codeEditorService.registerDecorationType(g,q,{color:i.getColor(E)?.toString(),backgroundColor:i.getColor(T)?.toString(),borderRadius:"3px"}),this.codeEditorService.registerDecorationType(g,L,{color:i.getColor(E)?.toString(),backgroundColor:i.getColor(T)?.toString(),borderRadius:"3px"}),this.updateInputEditorDecorations()}getPlaceholderColor(){return this.themeService.getColorTheme().getColor(J)?.toString()}async updateInputEditorDecorations(){const i=this.widget.inputEditor.getValue(),o=this.widget.viewModel;if(!o)return;if(!i){const e=this.chatAgentService.getDefaultAgent(this.widget.location),l=[{range:{startLineNumber:1,endLineNumber:1,startColumn:1,endColumn:1e3},renderOptions:{after:{contentText:o.inputPlaceholder||(e?.description??""),color:this.getPlaceholderColor()}}}];this.widget.inputEditor.setDecorationsByType(g,x,l);return}const t=this.widget.parsedInput.parts;let d;const n=t.find(e=>e instanceof w),r=t.find(e=>e instanceof A),v=t.find(e=>e instanceof F),h=e=>{const l=t.indexOf(e);if(t.length>l+2)return!1;const R=t[l+1];return R&&R instanceof D&&R.text===" "},S=e=>({startLineNumber:e.editorRange.startLineNumber,endLineNumber:e.editorRange.endLineNumber,startColumn:e.editorRange.endColumn+1,endColumn:1e3});if(n&&t.every(e=>e instanceof D&&!e.text.trim().length||e instanceof w)){const l=this.previouslyUsedAgents.has(V(n.agent,void 0))&&n.agent.metadata.followupPlaceholder;n.agent.description&&h(n)&&(d=[{range:S(n),renderOptions:{after:{contentText:l?n.agent.metadata.followupPlaceholder:n.agent.description,color:this.getPlaceholderColor()}}}])}if(n&&r&&t.every(e=>e instanceof D&&!e.text.trim().length||e instanceof w||e instanceof A)){const l=this.previouslyUsedAgents.has(V(n.agent,r.command.name))&&r.command.followupPlaceholder;r?.command.description&&h(r)&&(d=[{range:S(r),renderOptions:{after:{contentText:l?r.command.followupPlaceholder:r.command.description,color:this.getPlaceholderColor()}}}])}r&&t.every(e=>e instanceof D&&!e.text.trim().length||e instanceof A)&&r?.command.description&&h(r)&&(d=[{range:S(r),renderOptions:{after:{contentText:r.command.description,color:this.getPlaceholderColor()}}}]),this.widget.inputEditor.setDecorationsByType(g,x,d??[]);const u=[];n&&u.push({range:n.editorRange}),r&&u.push({range:r.editorRange,hoverMessage:new K(r.command.description)}),v&&u.push({range:v.editorRange}),this.widget.inputEditor.setDecorationsByType(g,M,u);const p=[],k=t.filter(e=>e instanceof W);for(const e of k)p.push({range:e.editorRange});const B=t.filter(e=>e instanceof N);for(const e of B)p.push({range:e.editorRange});this.widget.inputEditor.setDecorationsByType(g,q,p)}};C=P([m(1,G),m(2,Q),m(3,X)],C);class ee extends I{constructor(i){super();this.widget=i;this._register(this.widget.onDidChangeAgent(o=>{(o.slashCommand&&o.slashCommand.isSticky||!o.slashCommand&&o.agent.metadata.isSticky)&&this.repopulateAgentCommand(o.agent,o.slashCommand)})),this._register(this.widget.onDidSubmitAgent(o=>{this.repopulateAgentCommand(o.agent,o.slashCommand)}))}id="InputEditorSlashCommandMode";async repopulateAgentCommand(i,o){if(this.widget.inputEditor.getValue().trim())return;let t;o&&o.isSticky?t=`${_}${i.name} ${Y}${o.name} `:i.metadata.isSticky&&(t=`${_}${i.name} `),t&&(this.widget.inputEditor.setValue(t),this.widget.inputEditor.setPosition({lineNumber:1,column:t.length+1}))}}O.CONTRIBS.push(C,ee);let f=class extends I{constructor(i,o){super();this.widget=i;this.instantiationService=o;const t=this.instantiationService.createInstance(Z),d=this.widget.inputEditor.getValue();let n,r;this._register(this.widget.inputEditor.onDidChangeModelContent(v=>{n||(n=d,r=this.widget.lastSelectedAgent);const h=v.changes[0];!h.text&&this.widget.viewModel&&t.parseChatRequest(this.widget.viewModel.sessionId,n,i.location,{selectedAgent:r}).parts.filter(a=>a instanceof w||a instanceof A||a instanceof F||a instanceof W||a instanceof N).forEach(a=>{const y=b.intersectRanges(a.editorRange,h.range);if(y&&b.compareRangesUsingStarts(a.editorRange,h.range)<0){const u=y.endColumn-y.startColumn,p=new b(a.editorRange.startLineNumber,a.editorRange.startColumn,a.editorRange.endLineNumber,a.editorRange.endColumn-u);this.widget.inputEditor.executeEdits(this.id,[{range:p,text:""}])}}),n=this.widget.inputEditor.getValue(),r=this.widget.lastSelectedAgent}))}id="chatTokenDeleter"};f=P([m(1,H)],f),O.CONTRIBS.push(f);