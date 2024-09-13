var _=Object.defineProperty;var O=Object.getOwnPropertyDescriptor;var A=(y,e,t,o)=>{for(var r=o>1?void 0:o?O(e,t):e,c=y.length-1,a;c>=0;c--)(a=y[c])&&(r=(o?a(e,t,r):a(r))||r);return o&&r&&_(e,t,r),r},l=(y,e)=>(t,o)=>e(t,o,y);import"./emptyTextEditorHint.css";import*as p from"../../../../../base/browser/dom.js";import{renderFormattedText as L}from"../../../../../base/browser/formattedTextRenderer.js";import{StandardMouseEvent as P}from"../../../../../base/browser/mouseEvent.js";import{status as G}from"../../../../../base/browser/ui/aria/aria.js";import{getDefaultHoverDelegate as F}from"../../../../../base/browser/ui/hover/hoverDelegateFactory.js";import{KeybindingLabel as U}from"../../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";import{Event as K}from"../../../../../base/common/event.js";import{DisposableStore as V,dispose as w}from"../../../../../base/common/lifecycle.js";import{Schemas as T}from"../../../../../base/common/network.js";import{OS as R}from"../../../../../base/common/platform.js";import{ContentWidgetPositionPreference as X}from"../../../../../editor/browser/editorBrowser.js";import{EditorContributionInstantiation as q,registerEditorContribution as $}from"../../../../../editor/browser/editorExtensions.js";import{EditorOption as C}from"../../../../../editor/common/config/editorOptions.js";import{PLAINTEXT_LANGUAGE_ID as j}from"../../../../../editor/common/languages/modesRegistry.js";import{localize as u}from"../../../../../nls.js";import{ICommandService as B}from"../../../../../platform/commands/common/commands.js";import{IConfigurationService as z}from"../../../../../platform/configuration/common/configuration.js";import{IContextMenuService as J}from"../../../../../platform/contextview/browser/contextView.js";import{IHoverService as Q}from"../../../../../platform/hover/browser/hover.js";import{IKeybindingService as Y}from"../../../../../platform/keybinding/common/keybinding.js";import{IProductService as Z}from"../../../../../platform/product/common/productService.js";import{ITelemetryService as ee}from"../../../../../platform/telemetry/common/telemetry.js";import{ChangeLanguageAction as E}from"../../../../browser/parts/editor/editorStatus.js";import{IEditorGroupsService as te}from"../../../../services/editor/common/editorGroupsService.js";import{LOG_MODE_ID as ie,OUTPUT_MODE_ID as oe}from"../../../../services/output/common/output.js";import{SEARCH_RESULT_LANGUAGE_ID as ne}from"../../../../services/search/common/search.js";import{AccessibilityVerbositySettingId as W}from"../../../accessibility/browser/accessibilityConfiguration.js";import{ChatAgentLocation as N,IChatAgentService as re}from"../../../chat/common/chatAgents.js";import{IInlineChatSessionService as se}from"../../../inlineChat/browser/inlineChatSessionService.js";import{ApplyFileSnippetAction as I}from"../../../snippets/browser/commands/fileTemplateSnippets.js";const b=p.$,D="workbench.editor.empty.hint";let f=class{constructor(e,t,o,r,c,a,n,g,v,i,s){this.editor=e;this.editorGroupsService=t;this.commandService=o;this.configurationService=r;this.hoverService=c;this.keybindingService=a;this.inlineChatSessionService=n;this.chatAgentService=g;this.telemetryService=v;this.productService=i;this.contextMenuService=s;this.toDispose=[],this.toDispose.push(this.editor.onDidChangeModel(()=>this.update())),this.toDispose.push(this.editor.onDidChangeModelLanguage(()=>this.update())),this.toDispose.push(this.editor.onDidChangeModelContent(()=>this.update())),this.toDispose.push(this.chatAgentService.onDidChangeAgents(()=>this.update())),this.toDispose.push(this.editor.onDidChangeModelDecorations(()=>this.update())),this.toDispose.push(this.editor.onDidChangeConfiguration(d=>{d.hasChanged(C.readOnly)&&this.update()})),this.toDispose.push(this.configurationService.onDidChangeConfiguration(d=>{d.affectsConfiguration(D)&&this.update()})),this.toDispose.push(n.onWillStartSession(d=>{this.editor===d&&this.textHintContentWidget?.dispose()})),this.toDispose.push(n.onDidEndSession(d=>{this.editor===d.editor&&this.update()}))}static ID="editor.contrib.emptyTextEditorHint";toDispose;textHintContentWidget;_getOptions(){return{clickable:!0}}_shouldRenderHint(){if(this.configurationService.getValue(D)==="hidden"||this.editor.getOption(C.readOnly))return!1;const t=this.editor.getModel(),o=t?.getLanguageId();if(!t||o===oe||o===ie||o===ne||this.inlineChatSessionService.getSession(this.editor,t.uri)||this.editor.getModel()?.getValueLength()||!!this.editor.getLineDecorations(1)?.find(n=>n.options.beforeContentClassName||n.options.afterContentClassName||n.options.before?.content||n.options.after?.content))return!1;const c=!!this.chatAgentService.getDefaultAgent(N.Editor),a=t?.uri.scheme===T.untitled&&o===j;return c||a}update(){const e=this._shouldRenderHint();e&&!this.textHintContentWidget?this.textHintContentWidget=new H(this.editor,this._getOptions(),this.editorGroupsService,this.commandService,this.configurationService,this.hoverService,this.keybindingService,this.chatAgentService,this.telemetryService,this.productService,this.contextMenuService):!e&&this.textHintContentWidget&&(this.textHintContentWidget.dispose(),this.textHintContentWidget=void 0)}dispose(){w(this.toDispose),this.textHintContentWidget?.dispose()}};f=A([l(1,te),l(2,B),l(3,z),l(4,Q),l(5,Y),l(6,se),l(7,re),l(8,ee),l(9,Z),l(10,J)],f);class H{constructor(e,t,o,r,c,a,n,g,v,i,s){this.editor=e;this.options=t;this.editorGroupsService=o;this.commandService=r;this.configurationService=c;this.hoverService=a;this.keybindingService=n;this.chatAgentService=g;this.telemetryService=v;this.productService=i;this.contextMenuService=s;this.toDispose=new V,this.toDispose.add(this.editor.onDidChangeConfiguration(h=>{this.domNode&&h.hasChanged(C.fontInfo)&&this.editor.applyFontInfo(this.domNode)}));const d=K.debounce(this.editor.onDidFocusEditorText,()=>{},500);this.toDispose.add(d(()=>{this.editor.hasTextFocus()&&this.isVisible&&this.ariaLabel&&this.configurationService.getValue(W.EmptyEditorHint)&&G(this.ariaLabel)})),this.editor.addContentWidget(this)}static ID="editor.widget.emptyHint";domNode;toDispose;isVisible=!1;ariaLabel="";getId(){return H.ID}_disableHint(e){const t=()=>{this.configurationService.updateValue(D,"hidden"),this.dispose(),this.editor.focus()};if(!e){t();return}this.contextMenuService.showContextMenu({getAnchor:()=>new P(p.getActiveWindow(),e),getActions:()=>[{id:"workench.action.disableEmptyEditorHint",label:u("disableEditorEmptyHint","Disable Empty Editor Hint"),tooltip:u("disableEditorEmptyHint","Disable Empty Editor Hint"),enabled:!0,class:void 0,run:()=>{t()}}]})}_getHintInlineChat(e){const t=(e.length===1?e[0].fullName:void 0)??this.productService.nameShort,o="inlineChat.start";let r=`Ask ${t} something or start typing to dismiss.`;const c=()=>{this.telemetryService.publicLog2("workbenchActionExecuted",{id:"inlineChat.hintAction",from:"hint"}),this.commandService.executeCommand(o,{from:"hint"})},a={disposables:this.toDispose,callback:(i,s)=>{switch(i){case"0":c();break}}},n=b("empty-hint-text");n.style.display="block";const g=this.keybindingService.lookupKeybinding(o),v=g?.getLabel();if(g&&v){const i=u("emptyHintText","Press {0} to ask {1} to do something. ",v,t),[s,d]=i.split(v).map(S=>{if(this.options.clickable){const m=b("a",void 0,S);return m.style.fontStyle="italic",m.style.cursor="pointer",this.toDispose.add(p.addDisposableListener(m,p.EventType.CONTEXT_MENU,M=>this._disableHint(M))),this.toDispose.add(p.addDisposableListener(m,p.EventType.CLICK,c)),m}else{const m=b("span",void 0,S);return m.style.fontStyle="italic",m}});n.appendChild(s);const h=a.disposables.add(new U(n,R));h.set(g),h.element.style.width="min-content",h.element.style.display="inline",this.options.clickable&&(h.element.style.cursor="pointer",this.toDispose.add(p.addDisposableListener(h.element,p.EventType.CONTEXT_MENU,S=>this._disableHint(S))),this.toDispose.add(p.addDisposableListener(h.element,p.EventType.CLICK,c))),n.appendChild(d);const k=u("emptyHintTextDismiss","Start typing to dismiss."),x=b("span",void 0,k);x.style.fontStyle="italic",n.appendChild(x),r=i.concat(k)}else{const i=u({key:"inlineChatHint",comment:["Preserve double-square brackets and their order"]},"[[Ask {0} to do something]] or start typing to dismiss.",t),s=L(i,{actionHandler:a});n.appendChild(s)}return{ariaLabel:r,hintElement:n}}_getHintDefault(){const e={disposables:this.toDispose,callback:(i,s)=>{switch(i){case"0":t(s.browserEvent);break;case"1":o(s.browserEvent);break;case"2":r(s.browserEvent);break;case"3":this._disableHint();break}}},t=async i=>{i.stopPropagation(),this.editor.focus(),this.telemetryService.publicLog2("workbenchActionExecuted",{id:E.ID,from:"hint"}),await this.commandService.executeCommand(E.ID),this.editor.focus()},o=async i=>{i.stopPropagation(),this.telemetryService.publicLog2("workbenchActionExecuted",{id:I.Id,from:"hint"}),await this.commandService.executeCommand(I.Id)},r=async i=>{i.stopPropagation();const s=this.editorGroupsService.activeGroup.activeEditor;this.telemetryService.publicLog2("workbenchActionExecuted",{id:"welcome.showNewFileEntries",from:"hint"}),await this.commandService.executeCommand("welcome.showNewFileEntries",{from:"hint"})&&s!==null&&s.resource?.scheme===T.untitled&&this.editorGroupsService.activeGroup.closeEditor(s,{preserveFocus:!0})},c=u({key:"message",comment:["Preserve double-square brackets and their order","language refers to a programming language"]},`[[Select a language]], or [[fill with template]], or [[open a different editor]] to get started.
Start typing to dismiss or [[don't show]] this again.`),a=L(c,{actionHandler:e,renderCodeSegments:!1});a.style.fontStyle="italic";const n=[E.ID,I.Id,"welcome.showNewFileEntries"],g=n.map(i=>this.keybindingService.lookupKeybinding(i)?.getLabel()??i),v=u("defaultHintAriaLabel","Execute {0} to select a language, execute {1} to fill with template, or execute {2} to open a different editor and get started. Start typing to dismiss.",...g);for(const i of a.querySelectorAll("a")){i.style.cursor="pointer";const s=n.shift(),d=s&&this.keybindingService.lookupKeybinding(s)?.getLabel();e.disposables.add(this.hoverService.setupManagedHover(F("mouse"),i,d??""))}return{hintElement:a,ariaLabel:v}}getDomNode(){if(!this.domNode){this.domNode=b(".empty-editor-hint"),this.domNode.style.width="max-content",this.domNode.style.paddingLeft="4px";const e=this.chatAgentService.getActivatedAgents().filter(r=>r.locations.includes(N.Editor)),{hintElement:t,ariaLabel:o}=e.length?this._getHintInlineChat(e):this._getHintDefault();this.domNode.append(t),this.ariaLabel=o.concat(u("disableHint"," Toggle {0} in settings to disable this hint.",W.EmptyEditorHint)),this.toDispose.add(p.addDisposableListener(this.domNode,"click",()=>{this.editor.focus()})),this.editor.applyFontInfo(this.domNode)}return this.domNode}getPosition(){return{position:{lineNumber:1,column:1},preference:[X.EXACT]}}dispose(){this.editor.removeContentWidget(this),w(this.toDispose)}}$(f.ID,f,q.Eager);export{f as EmptyTextEditorHintContribution,D as emptyTextEditorHintSetting};
