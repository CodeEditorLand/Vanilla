var z=Object.defineProperty;var U=Object.getOwnPropertyDescriptor;var P=(h,d,e,t)=>{for(var i=t>1?void 0:t?U(d,e):d,r=h.length-1,a;r>=0;r--)(a=h[r])&&(i=(t?a(d,e,i):a(i))||i);return t&&i&&z(d,e,i),i},p=(h,d)=>(e,t)=>d(e,t,h);import*as g from"../../../../../vs/base/browser/dom.js";import{StandardKeyboardEvent as F}from"../../../../../vs/base/browser/keyboardEvent.js";import{Button as $}from"../../../../../vs/base/browser/ui/button/button.js";import{getDefaultHoverDelegate as X}from"../../../../../vs/base/browser/ui/hover/hoverDelegateFactory.js";import{SelectBox as M}from"../../../../../vs/base/browser/ui/selectBox/selectBox.js";import"../../../../../vs/base/common/cancellation.js";import{onUnexpectedError as Y}from"../../../../../vs/base/common/errors.js";import{KeyCode as b,KeyMod as j}from"../../../../../vs/base/common/keyCodes.js";import*as q from"../../../../../vs/base/common/lifecycle.js";import{URI as Z}from"../../../../../vs/base/common/uri.js";import"vs/css!./media/breakpointWidget";import"../../../../../vs/editor/browser/editorBrowser.js";import{EditorCommand as _,registerEditorCommand as w}from"../../../../../vs/editor/browser/editorExtensions.js";import{ICodeEditorService as J}from"../../../../../vs/editor/browser/services/codeEditorService.js";import{CodeEditorWidget as Q}from"../../../../../vs/editor/browser/widget/codeEditor/codeEditorWidget.js";import{EditorOption as ee}from"../../../../../vs/editor/common/config/editorOptions.js";import{Position as te}from"../../../../../vs/editor/common/core/position.js";import{Range as G}from"../../../../../vs/editor/common/core/range.js";import"../../../../../vs/editor/common/editorCommon.js";import{EditorContextKeys as ie}from"../../../../../vs/editor/common/editorContextKeys.js";import{CompletionItemKind as oe}from"../../../../../vs/editor/common/languages.js";import{PLAINTEXT_LANGUAGE_ID as ne}from"../../../../../vs/editor/common/languages/modesRegistry.js";import"../../../../../vs/editor/common/model.js";import{ILanguageFeaturesService as re}from"../../../../../vs/editor/common/services/languageFeatures.js";import{IModelService as se}from"../../../../../vs/editor/common/services/model.js";import{ITextModelService as ae}from"../../../../../vs/editor/common/services/resolverService.js";import{CompletionOptions as de,provideSuggestionItems as pe}from"../../../../../vs/editor/contrib/suggest/browser/suggest.js";import{ZoneWidget as ce}from"../../../../../vs/editor/contrib/zoneWidget/browser/zoneWidget.js";import*as c from"../../../../../vs/nls.js";import{IConfigurationService as le}from"../../../../../vs/platform/configuration/common/configuration.js";import{IContextKeyService as H}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextViewService as ue}from"../../../../../vs/platform/contextview/browser/contextView.js";import{IHoverService as he}from"../../../../../vs/platform/hover/browser/hover.js";import{createDecorator as ge,IInstantiationService as me}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{ServiceCollection as Ie}from"../../../../../vs/platform/instantiation/common/serviceCollection.js";import{IKeybindingService as ve}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{KeybindingWeight as A}from"../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{ILabelService as fe}from"../../../../../vs/platform/label/common/label.js";import{defaultButtonStyles as Ce,defaultSelectBoxStyles as T}from"../../../../../vs/platform/theme/browser/defaultStyles.js";import{editorForeground as Se}from"../../../../../vs/platform/theme/common/colorRegistry.js";import{IThemeService as be}from"../../../../../vs/platform/theme/common/themeService.js";import{getSimpleCodeEditorWidgetOptions as ke,getSimpleEditorOptions as xe}from"../../../../../vs/workbench/contrib/codeEditor/browser/simpleEditorOptions.js";import{BREAKPOINT_EDITOR_CONTRIBUTION_ID as Ee,BreakpointWidgetContext as n,CONTEXT_BREAKPOINT_WIDGET_VISIBLE as W,CONTEXT_IN_BREAKPOINT_WIDGET as R,DEBUG_SCHEME as K,IDebugService as Be}from"../../../../../vs/workbench/contrib/debug/common/debug.js";const v=g.$,y=ge("privateBreakpointWidgetService"),V="breakpointwidgetdecoration";function Me(h){return h.getModel().bracketPairs.getBracketPairsInRange(G.fromPositions(h.getPosition())).some(t=>t.openingBracketInfo.bracketText==="{")}function Te(h,d){const e=h.getColor(Se)?.transparent(.4);return[{range:{startLineNumber:0,endLineNumber:0,startColumn:0,endColumn:1},renderOptions:{after:{contentText:d,color:e?e.toString():void 0}}}]}let k=class extends ce{constructor(e,t,i,r,a,s,u,o,l,f,D,S,B,O,m,I,ye){super(e,{showFrame:!0,showArrow:!1,frameWidth:1,isAccessible:!0});this.lineNumber=t;this.column=i;this.contextViewService=a;this.debugService=s;this.themeService=u;this.contextKeyService=o;this.instantiationService=l;this.modelService=f;this.codeEditorService=D;this._configurationService=S;this.languageFeaturesService=B;this.keybindingService=O;this.labelService=m;this.textModelService=I;this.hoverService=ye;this.toDispose=[];const L=this.editor.getModel();if(L){const C=L.uri,N=this.debugService.getModel().getBreakpoints({lineNumber:this.lineNumber,column:this.column,uri:C});this.breakpoint=N.length?N[0]:void 0}r===void 0?this.breakpoint&&!this.breakpoint.condition&&!this.breakpoint.hitCondition&&this.breakpoint.logMessage?this.context=n.LOG_MESSAGE:this.breakpoint&&!this.breakpoint.condition&&this.breakpoint.hitCondition?this.context=n.HIT_COUNT:this.breakpoint&&this.breakpoint.triggeredBy?this.context=n.TRIGGER_POINT:this.context=n.CONDITION:this.context=r,this.toDispose.push(this.debugService.getModel().onDidChangeBreakpoints(C=>{this.breakpoint&&C&&C.removed&&C.removed.indexOf(this.breakpoint)>=0&&this.dispose()})),this.codeEditorService.registerDecorationType("breakpoint-widget",V,{}),this.create()}selectContainer;inputContainer;selectBreakpointContainer;input;selectBreakpointBox;selectModeBox;toDispose;conditionInput="";hitCountInput="";logMessageInput="";modeInput;breakpoint;context;heightInPx;triggeredByBreakpointInput;get placeholder(){const e=this.keybindingService.lookupKeybinding(x.ID)?.getLabel()||"Enter",t=this.keybindingService.lookupKeybinding(E.ID)?.getLabel()||"Escape";switch(this.context){case n.LOG_MESSAGE:return c.localize("breakpointWidgetLogMessagePlaceholder","Message to log when breakpoint is hit. Expressions within {} are interpolated. '{0}' to accept, '{1}' to cancel.",e,t);case n.HIT_COUNT:return c.localize("breakpointWidgetHitCountPlaceholder","Break when hit count condition is met. '{0}' to accept, '{1}' to cancel.",e,t);default:return c.localize("breakpointWidgetExpressionPlaceholder","Break when expression evaluates to true. '{0}' to accept, '{1}' to cancel.",e,t)}}getInputValue(e){switch(this.context){case n.LOG_MESSAGE:return e&&e.logMessage?e.logMessage:this.logMessageInput;case n.HIT_COUNT:return e&&e.hitCondition?e.hitCondition:this.hitCountInput;default:return e&&e.condition?e.condition:this.conditionInput}}rememberInput(){if(this.context!==n.TRIGGER_POINT){const e=this.input.getModel().getValue();switch(this.context){case n.LOG_MESSAGE:this.logMessageInput=e;break;case n.HIT_COUNT:this.hitCountInput=e;break;default:this.conditionInput=e}}}setInputMode(){if(this.editor.hasModel()){const e=this.context===n.LOG_MESSAGE?ne:this.editor.getModel().getLanguageId();this.input.getModel().setLanguage(e)}}show(e){const t=this.input.getModel().getLineCount();super.show(e,t+1)}fitHeightToContent(){const e=this.input.getModel().getLineCount();this._relayout(e+1)}_fillContainer(e){this.setCssClass("breakpoint-widget");const t=new M([{text:c.localize("expression","Expression")},{text:c.localize("hitCount","Hit Count")},{text:c.localize("logMessage","Log Message")},{text:c.localize("triggeredBy","Wait for Breakpoint")}],this.context,this.contextViewService,T,{ariaLabel:c.localize("breakpointType","Breakpoint Type")});this.selectContainer=v(".breakpoint-select-container"),t.render(g.append(e,this.selectContainer)),t.onDidSelect(i=>{this.rememberInput(),this.context=i.index,this.updateContextInput()}),this.createModesInput(e),this.inputContainer=v(".inputContainer"),this.toDispose.push(this.hoverService.setupManagedHover(X("mouse"),this.inputContainer,this.placeholder)),this.createBreakpointInput(g.append(e,this.inputContainer)),this.input.getModel().setValue(this.getInputValue(this.breakpoint)),this.toDispose.push(this.input.getModel().onDidChangeContent(()=>{this.fitHeightToContent()})),this.input.setPosition({lineNumber:1,column:this.input.getModel().getLineMaxColumn(1)}),this.createTriggerBreakpointInput(e),this.updateContextInput(),setTimeout(()=>this.focusInput(),150)}createModesInput(e){const t=this.debugService.getModel().getBreakpointModes("source");if(t.length<=1)return;const i=this.selectModeBox=new M([{text:c.localize("bpMode","Mode"),isDisabled:!0},...t.map(s=>({text:s.label,description:s.description}))],t.findIndex(s=>s.mode===this.breakpoint?.mode)+1,this.contextViewService,T);this.toDispose.push(i),this.toDispose.push(i.onDidSelect(s=>{this.modeInput=t[s.index-1]}));const r=v(".select-mode-container"),a=v(".select-box-container");g.append(r,a),i.render(a),g.append(e,r)}createTriggerBreakpointInput(e){const t=this.debugService.getModel().getBreakpoints().filter(o=>o!==this.breakpoint&&!o.logMessage),i=[{text:c.localize("noTriggerByBreakpoint","None"),isDisabled:!0},...t.map(o=>({text:`${this.labelService.getUriLabel(o.uri,{relative:!0})}: ${o.lineNumber}`,description:c.localize("triggerByLoading","Loading...")}))],r=t.findIndex(o=>this.breakpoint?.triggeredBy===o.getId());for(const[o,l]of t.entries())this.textModelService.createModelReference(l.uri).then(f=>{try{i[o+1].description=f.object.textEditorModel.getLineContent(l.lineNumber).trim()}finally{f.dispose()}}).catch(()=>{i[o+1].description=c.localize("noBpSource","Could not load source.")});const a=this.selectBreakpointBox=new M(i,r+1,this.contextViewService,T,{ariaLabel:c.localize("selectBreakpoint","Select breakpoint")});a.onDidSelect(o=>{o.index===0?this.triggeredByBreakpointInput=void 0:this.triggeredByBreakpointInput=t[o.index-1]}),this.toDispose.push(a),this.selectBreakpointContainer=v(".select-breakpoint-container"),this.toDispose.push(g.addDisposableListener(this.selectBreakpointContainer,g.EventType.KEY_DOWN,o=>{new F(o).equals(b.Escape)&&this.close(!1)}));const s=v(".select-box-container");g.append(this.selectBreakpointContainer,s),a.render(s),g.append(e,this.selectBreakpointContainer);const u=new $(this.selectBreakpointContainer,Ce);u.label=c.localize("ok","Ok"),this.toDispose.push(u.onDidClick(()=>this.close(!0))),this.toDispose.push(u)}updateContextInput(){if(this.context===n.TRIGGER_POINT)this.inputContainer.hidden=!0,this.selectBreakpointContainer.hidden=!1;else{this.inputContainer.hidden=!1,this.selectBreakpointContainer.hidden=!0,this.setInputMode();const e=this.getInputValue(this.breakpoint);this.input.getModel().setValue(e),this.focusInput()}}_doLayout(e,t){this.heightInPx=e,this.input.layout({height:e,width:t-113}),this.centerInputVertically()}_onWidth(e){typeof this.heightInPx=="number"&&this._doLayout(this.heightInPx,e)}createBreakpointInput(e){const t=this.contextKeyService.createScoped(e);this.toDispose.push(t);const i=this.instantiationService.createChild(new Ie([H,t],[y,this]));this.toDispose.push(i);const r=this.createEditorOptions(),a=ke();this.input=i.createInstance(Q,e,r,a),R.bindTo(t).set(!0);const s=this.modelService.createModel("",null,Z.parse(`${K}:${this.editor.getId()}:breakpointinput`),!0);this.editor.hasModel()&&s.setLanguage(this.editor.getModel().getLanguageId()),this.input.setModel(s),this.setInputMode(),this.toDispose.push(s);const u=()=>{const l=this.input.getModel().getValue()?[]:Te(this.themeService.getColorTheme(),this.placeholder);this.input.setDecorationsByType("breakpoint-widget",V,l)};this.input.getModel().onDidChangeContent(()=>u()),this.themeService.onDidColorThemeChange(()=>u()),this.toDispose.push(this.languageFeaturesService.completionProvider.register({scheme:K,hasAccessToAllModels:!0},{_debugDisplayName:"breakpointWidget",provideCompletionItems:(o,l,f,D)=>{let S;const B=this.editor.getModel();return B&&(this.context===n.CONDITION||this.context===n.LOG_MESSAGE&&Me(this.input))?S=pe(this.languageFeaturesService.completionProvider,B,new te(this.lineNumber,1),new de(void 0,new Set().add(oe.Snippet)),f,D).then(O=>{let m=0;if(this.context===n.CONDITION)m=l.column-1;else{const I=this.input.getModel().getValue();for(;l.column-2-m>=0&&I[l.column-2-m]!=="{"&&I[l.column-2-m]!==" ";)m++}return{suggestions:O.items.map(I=>(I.completion.range=G.fromPositions(l.delta(0,-m),l),I.completion))}}):S=Promise.resolve({suggestions:[]}),S}})),this.toDispose.push(this._configurationService.onDidChangeConfiguration(o=>{(o.affectsConfiguration("editor.fontSize")||o.affectsConfiguration("editor.lineHeight"))&&(this.input.updateOptions(this.createEditorOptions()),this.centerInputVertically())}))}createEditorOptions(){const e=this._configurationService.getValue("editor"),t=xe(this._configurationService);return t.fontSize=e.fontSize,t.fontFamily=e.fontFamily,t.lineHeight=e.lineHeight,t.fontLigatures=e.fontLigatures,t.ariaLabel=this.placeholder,t}centerInputVertically(){if(this.container&&typeof this.heightInPx=="number"){const e=this.input.getOption(ee.lineHeight),t=this.input.getModel().getLineCount(),i=(this.heightInPx-t*e)/2;this.inputContainer.style.marginTop=i+"px"}}close(e){if(e){let t,i,r,a,s,u;if(this.rememberInput(),(this.conditionInput||this.context===n.CONDITION)&&(t=this.conditionInput),(this.hitCountInput||this.context===n.HIT_COUNT)&&(i=this.hitCountInput),(this.logMessageInput||this.context===n.LOG_MESSAGE)&&(r=this.logMessageInput),this.selectModeBox&&(s=this.modeInput?.mode,u=this.modeInput?.label),this.context===n.TRIGGER_POINT&&(t=void 0,i=void 0,r=void 0,a=this.triggeredByBreakpointInput?.getId()),this.breakpoint){const o=new Map;o.set(this.breakpoint.getId(),{condition:t,hitCondition:i,logMessage:r,triggeredBy:a,mode:s,modeLabel:u}),this.debugService.updateBreakpoints(this.breakpoint.originalUri,o,!1).then(void 0,Y)}else{const o=this.editor.getModel();o&&this.debugService.addBreakpoints(o.uri,[{lineNumber:this.lineNumber,column:this.column,enabled:!0,condition:t,hitCondition:i,logMessage:r,triggeredBy:a,mode:s,modeLabel:u}])}}this.dispose()}focusInput(){this.context===n.TRIGGER_POINT?this.selectBreakpointBox.focus():this.input.focus()}dispose(){super.dispose(),this.input.dispose(),q.dispose(this.toDispose),setTimeout(()=>this.editor.focus(),0)}};k=P([p(4,ue),p(5,Be),p(6,be),p(7,H),p(8,me),p(9,se),p(10,J),p(11,le),p(12,re),p(13,ve),p(14,fe),p(15,ae),p(16,he)],k);class x extends _{static ID="breakpointWidget.action.acceptInput";constructor(){super({id:x.ID,precondition:W,kbOpts:{kbExpr:R,primary:b.Enter,weight:A.EditorContrib}})}runEditorCommand(d,e){d.get(y).close(!0)}}class E extends _{static ID="closeBreakpointWidget";constructor(){super({id:E.ID,precondition:W,kbOpts:{kbExpr:ie.textInputFocus,primary:b.Escape,secondary:[j.Shift|b.Escape],weight:A.EditorContrib}})}runEditorCommand(d,e,t){const i=e.getContribution(Ee);if(i)return i.closeBreakpointWidget();d.get(y).close(!1)}}w(new x),w(new E);export{k as BreakpointWidget};
