var V=Object.defineProperty;var q=Object.getOwnPropertyDescriptor;var L=(g,e,t,i)=>{for(var n=i>1?void 0:i?q(e,t):e,a=g.length-1,r;a>=0;a--)(r=g[a])&&(n=(i?r(e,t,n):r(n))||n);return i&&n&&V(e,t,n),n},C=(g,e)=>(t,i)=>e(t,i,g);import{isSafari as j}from"../../../../base/browser/browser.js";import{BrowserFeatures as X}from"../../../../base/browser/canIUse.js";import*as B from"../../../../base/browser/dom.js";import{StandardMouseEvent as Y}from"../../../../base/browser/mouseEvent.js";import{Action as v,Separator as J,SubmenuAction as N}from"../../../../base/common/actions.js";import{distinct as Q}from"../../../../base/common/arrays.js";import{RunOnceScheduler as Z,timeout as ee}from"../../../../base/common/async.js";import{memoize as te}from"../../../../base/common/decorators.js";import{onUnexpectedError as ie}from"../../../../base/common/errors.js";import{MarkdownString as A}from"../../../../base/common/htmlContent.js";import{dispose as P,disposeIfDisposable as oe}from"../../../../base/common/lifecycle.js";import*as $ from"../../../../base/common/platform.js";import ne from"../../../../base/common/severity.js";import{noBreakWhitespace as G}from"../../../../base/common/strings.js";import{ThemeIcon as m}from"../../../../base/common/themables.js";import"../../../../base/common/uri.js";import{generateUuid as re}from"../../../../base/common/uuid.js";import{ContentWidgetPositionPreference as ae,MouseTargetType as R}from"../../../../editor/browser/editorBrowser.js";import{EditorOption as W}from"../../../../editor/common/config/editorOptions.js";import"../../../../editor/common/core/position.js";import{Range as T}from"../../../../editor/common/core/range.js";import{ILanguageService as se}from"../../../../editor/common/languages/language.js";import{GlyphMarginLane as H,OverviewRulerLane as de,TrackedRangeStickiness as O}from"../../../../editor/common/model.js";import*as s from"../../../../nls.js";import{IConfigurationService as ce}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as le}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as ge}from"../../../../platform/contextview/browser/contextView.js";import{IDialogService as ue}from"../../../../platform/dialogs/common/dialogs.js";import{IInstantiationService as pe}from"../../../../platform/instantiation/common/instantiation.js";import{ILabelService as U}from"../../../../platform/label/common/label.js";import{registerColor as w}from"../../../../platform/theme/common/colorRegistry.js";import{registerThemingParticipant as he,themeColorFromId as me}from"../../../../platform/theme/common/themeService.js";import{GutterActionsRegistry as be}from"../../codeEditor/browser/editorLineNumberMenu.js";import{BREAKPOINT_EDITOR_CONTRIBUTION_ID as ke,BreakpointWidgetContext as D,CONTEXT_BREAKPOINT_WIDGET_VISIBLE as fe,DebuggerString as ve,IDebugService as z,State as Ie}from"../common/debug.js";import{getBreakpointMessageAndIcon as _}from"./breakpointsView.js";import{BreakpointWidget as Se}from"./breakpointWidget.js";import*as b from"./debugIcons.js";const Ce=B.$,Be={description:"breakpoint-helper-decoration",glyphMarginClassName:m.asClassName(b.debugBreakpointHint),glyphMargin:{position:H.Right},glyphMarginHoverMessage:new A().appendText(s.localize("breakpointHelper","Click to add a breakpoint")),stickiness:O.NeverGrowsWhenTypingAtEdges};function De(g,e,t,i,n,a){const r=[];return t.forEach(o=>{if(o.lineNumber>e.getLineCount())return;const d=t.some(p=>p!==o&&p.lineNumber===o.lineNumber),c=e.getLineFirstNonWhitespaceColumn(o.lineNumber),l=e.validateRange(o.column?new T(o.lineNumber,o.column,o.lineNumber,o.column+1):new T(o.lineNumber,c,o.lineNumber,c+1));r.push({options:Me(g,e,o,i,n,a,d),range:l})}),r}function Me(g,e,t,i,n,a,r){const o=g.get(z),d=g.get(se),c=g.get(U),{icon:l,message:p,showAdapterUnverifiedMessage:k}=_(i,n,t,c,o.getModel());let u,h;if(k){let S;h=o.getModel().getSessions().map(M=>{const E=o.getAdapterManager().getDebugger(M.configuration.type),F=E?.strings?.[ve.UnverifiedBreakpoints];if(F)return S||(S=d.guessLanguageIdByFilepathOrFirstLine(t.uri)??void 0),S&&E.interestedInLanguage(S)?F:void 0}).find(M=>!!M)}if(p)if(u=new A(void 0,{isTrusted:!0,supportThemeIcons:!0}),t.condition||t.hitCondition){const S=e.getLanguageId();u.appendCodeblock(S,p),h&&u.appendMarkdown("$(warning) "+h)}else u.appendText(p),h&&u.appendMarkdown(`

$(warning) `+h);else h&&(u=new A(void 0,{isTrusted:!0,supportThemeIcons:!0}).appendMarkdown(h));let I=null;a&&(I={color:me(K),position:de.Left});const f=t.column&&(r||t.column>e.getLineFirstNonWhitespaceColumn(t.lineNumber));return{description:"breakpoint-decoration",glyphMargin:{position:H.Right},glyphMarginClassName:m.asClassName(l),glyphMarginHoverMessage:u,stickiness:O.NeverGrowsWhenTypingAtEdges,before:f?{content:G,inlineClassName:"debug-breakpoint-placeholder",inlineClassNameAffectsLetterSpacing:!0}:void 0,overviewRuler:I,zIndex:9999}}async function we(g,e,t){return t.capabilities.supportsBreakpointLocationsRequest?await Promise.all(Q(e,i=>i).map(async i=>{try{return{lineNumber:i,positions:await t.breakpointsLocations(g.uri,i)}}catch{return{lineNumber:i,positions:[]}}})):[]}function Ee(g,e,t){const i=[];for(const{positions:n,lineNumber:a}of t){if(n.length===0)continue;const r=g.getLineFirstNonWhitespaceColumn(a),o=g.getLineLastNonWhitespaceColumn(a);n.forEach(d=>{const c=new T(d.lineNumber,d.column,d.lineNumber,d.column+1);if(d.column<=r&&!e.some(p=>p.range.startColumn>r&&p.range.startLineNumber===d.lineNumber)||d.column>o)return;const l=e.find(p=>p.range.equalsRange(c));l&&l.inlineWidget||i.push({range:c,options:{description:"breakpoint-placeholder-decoration",stickiness:O.NeverGrowsWhenTypingAtEdges,before:l?void 0:{content:G,inlineClassName:"debug-breakpoint-placeholder",inlineClassNameAffectsLetterSpacing:!0}},breakpoint:l?l.breakpoint:void 0})})}return i}let y=class{constructor(e,t,i,n,a,r,o,d){this.editor=e;this.debugService=t;this.contextMenuService=i;this.instantiationService=n;this.dialogService=r;this.configurationService=o;this.labelService=d;this.breakpointWidgetVisible=fe.bindTo(a),this.setDecorationsScheduler=new Z(()=>this.setDecorations(),30),this.setDecorationsScheduler.schedule(),this.registerListeners()}breakpointHintDecoration=null;breakpointWidget;breakpointWidgetVisible;toDispose=[];ignoreDecorationsChangedEvent=!1;ignoreBreakpointsChangeEvent=!1;breakpointDecorations=[];candidateDecorations=[];setDecorationsScheduler;getContextMenuActionsAtPosition(e,t){if(!this.debugService.getAdapterManager().hasEnabledDebuggers())return[];if(!this.debugService.canSetBreakpointsIn(t))return[];const i=this.debugService.getModel().getBreakpoints({lineNumber:e,uri:t.uri});return this.getContextMenuActions(i,t.uri,e)}registerListeners(){this.toDispose.push(this.editor.onMouseDown(async e=>{if(!this.debugService.getAdapterManager().hasEnabledDebuggers())return;const t=this.editor.getModel();if(!e.target.position||!t||e.target.type!==R.GUTTER_GLYPH_MARGIN||e.target.detail.isAfterLines||!this.marginFreeFromNonDebugDecorations(e.target.position.lineNumber)&&!e.target.element?.className.includes("breakpoint"))return;const i=this.debugService.canSetBreakpointsIn(t),n=e.target.position.lineNumber,a=t.uri;if(!(e.event.rightButton||$.isMacintosh&&e.event.leftButton&&e.event.ctrlKey)){const r=this.debugService.getModel().getBreakpoints({uri:a,lineNumber:n});if(r.length){const o=e.event.shiftKey,d=r.some(c=>c.enabled);if(o)r.forEach(c=>this.debugService.enableOrDisableBreakpoints(!d,c));else if(!$.isLinux&&r.some(c=>!!c.condition||!!c.logMessage||!!c.hitCondition||!!c.triggeredBy)){const c=r.every(u=>!!u.logMessage),l=c?s.localize("logPoint","Logpoint"):s.localize("breakpoint","Breakpoint"),p=s.localize("breakpointHasConditionDisabled","This {0} has a {1} that will get lost on remove. Consider enabling the {0} instead.",l.toLowerCase(),c?s.localize("message","message"):s.localize("condition","condition")),k=s.localize("breakpointHasConditionEnabled","This {0} has a {1} that will get lost on remove. Consider disabling the {0} instead.",l.toLowerCase(),c?s.localize("message","message"):s.localize("condition","condition"));await this.dialogService.prompt({type:ne.Info,message:d?k:p,buttons:[{label:s.localize({key:"removeLogPoint",comment:["&& denotes a mnemonic"]},"&&Remove {0}",l),run:()=>r.forEach(u=>this.debugService.removeBreakpoints(u.getId()))},{label:s.localize("disableLogPoint","{0} {1}",d?s.localize({key:"disable",comment:["&& denotes a mnemonic"]},"&&Disable"):s.localize({key:"enable",comment:["&& denotes a mnemonic"]},"&&Enable"),l),run:()=>r.forEach(u=>this.debugService.enableOrDisableBreakpoints(!d,u))}],cancelButton:!0})}else d?r.forEach(c=>this.debugService.removeBreakpoints(c.getId())):r.forEach(c=>this.debugService.enableOrDisableBreakpoints(!d,c))}else if(i)if(e.event.middleButton){const o=this.configurationService.getValue("debug").gutterMiddleClickAction;if(o!=="none"){let d;switch(o){case"logpoint":d=D.LOG_MESSAGE;break;case"conditionalBreakpoint":d=D.CONDITION;break;case"triggeredBreakpoint":d=D.TRIGGER_POINT}this.showBreakpointWidget(n,void 0,d)}}else this.debugService.addBreakpoints(a,[{lineNumber:n}])}})),X.pointerEvents&&j||(this.toDispose.push(this.editor.onMouseMove(e=>{if(!this.debugService.getAdapterManager().hasEnabledDebuggers())return;let t=-1;const i=this.editor.getModel();i&&e.target.position&&(e.target.type===R.GUTTER_GLYPH_MARGIN||e.target.type===R.GUTTER_LINE_NUMBERS)&&this.debugService.canSetBreakpointsIn(i)&&this.marginFreeFromNonDebugDecorations(e.target.position.lineNumber)&&(e.target.detail.isAfterLines||(t=e.target.position.lineNumber)),this.ensureBreakpointHintDecoration(t)})),this.toDispose.push(this.editor.onMouseLeave(()=>{this.ensureBreakpointHintDecoration(-1)}))),this.toDispose.push(this.editor.onDidChangeModel(async()=>{this.closeBreakpointWidget(),await this.setDecorations()})),this.toDispose.push(this.debugService.getModel().onDidChangeBreakpoints(()=>{!this.ignoreBreakpointsChangeEvent&&!this.setDecorationsScheduler.isScheduled()&&this.setDecorationsScheduler.schedule()})),this.toDispose.push(this.debugService.onDidChangeState(()=>{this.setDecorationsScheduler.isScheduled()||this.setDecorationsScheduler.schedule()})),this.toDispose.push(this.editor.onDidChangeModelDecorations(()=>this.onModelDecorationsChanged())),this.toDispose.push(this.configurationService.onDidChangeConfiguration(async e=>{(e.affectsConfiguration("debug.showBreakpointsInOverviewRuler")||e.affectsConfiguration("debug.showInlineBreakpointCandidates"))&&await this.setDecorations()}))}getContextMenuActions(e,t,i,n){const a=[];if(e.length===1){const r=e[0].logMessage?s.localize("logPoint","Logpoint"):s.localize("breakpoint","Breakpoint");a.push(new v("debug.removeBreakpoint",s.localize("removeBreakpoint","Remove {0}",r),void 0,!0,async()=>{await this.debugService.removeBreakpoints(e[0].getId())})),a.push(new v("workbench.debug.action.editBreakpointAction",s.localize("editBreakpoint","Edit {0}...",r),void 0,!0,()=>Promise.resolve(this.showBreakpointWidget(e[0].lineNumber,e[0].column)))),a.push(new v("workbench.debug.viewlet.action.toggleBreakpoint",e[0].enabled?s.localize("disableBreakpoint","Disable {0}",r):s.localize("enableBreakpoint","Enable {0}",r),void 0,!0,()=>this.debugService.enableOrDisableBreakpoints(!e[0].enabled,e[0])))}else if(e.length>1){const r=e.slice().sort((o,d)=>o.column&&d.column?o.column-d.column:1);a.push(new N("debug.removeBreakpoints",s.localize("removeBreakpoints","Remove Breakpoints"),r.map(o=>new v("removeInlineBreakpoint",o.column?s.localize("removeInlineBreakpointOnColumn","Remove Inline Breakpoint on Column {0}",o.column):s.localize("removeLineBreakpoint","Remove Line Breakpoint"),void 0,!0,()=>this.debugService.removeBreakpoints(o.getId()))))),a.push(new N("debug.editBreakpoints",s.localize("editBreakpoints","Edit Breakpoints"),r.map(o=>new v("editBreakpoint",o.column?s.localize("editInlineBreakpointOnColumn","Edit Inline Breakpoint on Column {0}",o.column):s.localize("editLineBreakpoint","Edit Line Breakpoint"),void 0,!0,()=>Promise.resolve(this.showBreakpointWidget(o.lineNumber,o.column)))))),a.push(new N("debug.enableDisableBreakpoints",s.localize("enableDisableBreakpoints","Enable/Disable Breakpoints"),r.map(o=>new v(o.enabled?"disableColumnBreakpoint":"enableColumnBreakpoint",o.enabled?o.column?s.localize("disableInlineColumnBreakpoint","Disable Inline Breakpoint on Column {0}",o.column):s.localize("disableBreakpointOnLine","Disable Line Breakpoint"):o.column?s.localize("enableBreakpoints","Enable Inline Breakpoint on Column {0}",o.column):s.localize("enableBreakpointOnLine","Enable Line Breakpoint"),void 0,!0,()=>this.debugService.enableOrDisableBreakpoints(!o.enabled,o)))))}else a.push(new v("addBreakpoint",s.localize("addBreakpoint","Add Breakpoint"),void 0,!0,()=>this.debugService.addBreakpoints(t,[{lineNumber:i,column:n}]))),a.push(new v("addConditionalBreakpoint",s.localize("addConditionalBreakpoint","Add Conditional Breakpoint..."),void 0,!0,()=>Promise.resolve(this.showBreakpointWidget(i,n,D.CONDITION)))),a.push(new v("addLogPoint",s.localize("addLogPoint","Add Logpoint..."),void 0,!0,()=>Promise.resolve(this.showBreakpointWidget(i,n,D.LOG_MESSAGE)))),a.push(new v("addTriggeredBreakpoint",s.localize("addTriggeredBreakpoint","Add Triggered Breakpoint..."),void 0,!0,()=>Promise.resolve(this.showBreakpointWidget(i,n,D.TRIGGER_POINT))));return this.debugService.state===Ie.Stopped&&(a.push(new J),a.push(new v("runToLine",s.localize("runToLine","Run to Line"),void 0,!0,()=>this.debugService.runTo(t,i).catch(ie)))),a}marginFreeFromNonDebugDecorations(e){const t=this.editor.getLineDecorations(e);if(t)for(const{options:i}of t){const n=i.glyphMarginClassName;if(!n)continue;if(!(n.includes("codicon-")||n.startsWith("coverage-deco-"))||n.includes("codicon-testing-")||n.includes("codicon-merge-")||n.includes("codicon-arrow-")||n.includes("codicon-loading")||n.includes("codicon-fold")||n.includes("codicon-gutter-lightbulb")||n.includes("codicon-lightbulb-sparkle"))return!1}return!0}ensureBreakpointHintDecoration(e){this.editor.changeDecorations(t=>{this.breakpointHintDecoration&&(t.removeDecoration(this.breakpointHintDecoration),this.breakpointHintDecoration=null),e!==-1&&(this.breakpointHintDecoration=t.addDecoration({startLineNumber:e,startColumn:1,endLineNumber:e,endColumn:1},Be))})}async setDecorations(){if(!this.editor.hasModel())return;const e=(l,p)=>{const k=Ee(i,this.breakpointDecorations,p),u=l.deltaDecorations(this.candidateDecorations.map(h=>h.decorationId),k);this.candidateDecorations.forEach(h=>{h.inlineWidget.dispose()}),this.candidateDecorations=u.map((h,I)=>{const f=k[I],S=f.breakpoint?_(this.debugService.state,this.debugService.getModel().areBreakpointsActivated(),f.breakpoint,this.labelService,this.debugService.getModel()).icon:b.breakpoint.disabled,M=()=>this.getContextMenuActions(f.breakpoint?[f.breakpoint]:[],t.getModel().uri,f.range.startLineNumber,f.range.startColumn),E=new x(t,h,m.asClassName(S),f.breakpoint,this.debugService,this.contextMenuService,M);return{decorationId:h,inlineWidget:E}})},t=this.editor,i=t.getModel(),n=this.debugService.getModel().getBreakpoints({uri:i.uri}),a=this.configurationService.getValue("debug"),r=this.instantiationService.invokeFunction(l=>De(l,i,n,this.debugService.state,this.debugService.getModel().areBreakpointsActivated(),a.showBreakpointsInOverviewRuler)),o=this.debugService.getViewModel().focusedSession,d=a.showInlineBreakpointCandidates&&o?we(this.editor.getModel(),r.map(l=>l.range.startLineNumber),o):Promise.resolve([]),c=await Promise.race([d,ee(500).then(()=>{})]);c===void 0&&d.then(l=>t.changeDecorations(p=>e(p,l)));try{this.ignoreDecorationsChangedEvent=!0,t.changeDecorations(l=>{const p=l.deltaDecorations(this.breakpointDecorations.map(k=>k.decorationId),r);this.breakpointDecorations.forEach(k=>{k.inlineWidget?.dispose()}),this.breakpointDecorations=p.map((k,u)=>{let h;const I=n[u];if(r[u].options.before){const f=()=>this.getContextMenuActions([I],t.getModel().uri,I.lineNumber,I.column);h=new x(t,k,r[u].options.glyphMarginClassName,I,this.debugService,this.contextMenuService,f)}return{decorationId:k,breakpoint:I,range:r[u].range,inlineWidget:h}}),c&&e(l,c)})}finally{this.ignoreDecorationsChangedEvent=!1}for(const l of this.breakpointDecorations)l.inlineWidget&&this.editor.layoutContentWidget(l.inlineWidget)}async onModelDecorationsChanged(){if(this.breakpointDecorations.length===0||this.ignoreDecorationsChangedEvent||!this.editor.hasModel())return;let e=!1;const t=this.editor.getModel();if(this.breakpointDecorations.forEach(n=>{if(e)return;const a=t.getDecorationRange(n.decorationId);a&&!n.range.equalsRange(a)&&(e=!0,n.range=a)}),!e)return;const i=new Map;for(let n=0,a=this.breakpointDecorations.length;n<a;n++){const r=this.breakpointDecorations[n],o=t.getDecorationRange(r.decorationId);o&&r.breakpoint&&i.set(r.breakpoint.getId(),{lineNumber:o.startLineNumber,column:r.breakpoint.column?o.startColumn:void 0})}try{this.ignoreBreakpointsChangeEvent=!0,await this.debugService.updateBreakpoints(t.uri,i,!0)}finally{this.ignoreBreakpointsChangeEvent=!1}}showBreakpointWidget(e,t,i){this.breakpointWidget?.dispose(),this.breakpointWidget=this.instantiationService.createInstance(Se,this.editor,e,t,i),this.breakpointWidget.show({lineNumber:e,column:1}),this.breakpointWidgetVisible.set(!0)}closeBreakpointWidget(){this.breakpointWidget&&(this.breakpointWidget.dispose(),this.breakpointWidget=void 0,this.breakpointWidgetVisible.reset(),this.editor.focus())}dispose(){this.breakpointWidget?.dispose(),this.editor.removeDecorations(this.breakpointDecorations.map(e=>e.decorationId)),P(this.toDispose)}};y=L([C(1,z),C(2,ge),C(3,pe),C(4,le),C(5,ue),C(6,ce),C(7,U)],y),be.registerGutterActionsGenerator(({lineNumber:g,editor:e,accessor:t},i)=>{const n=e.getModel(),a=t.get(z);if(!n||!a.getAdapterManager().hasEnabledDebuggers()||!a.canSetBreakpointsIn(n))return;const r=e.getContribution(ke);if(!r)return;const o=r.getContextMenuActionsAtPosition(g,n);for(const d of o)i.push(d,"2_debug")});class x{constructor(e,t,i,n,a,r,o){this.editor=e;this.decorationId=t;this.breakpoint=n;this.debugService=a;this.contextMenuService=r;this.getContextMenuActions=o;this.range=this.editor.getModel().getDecorationRange(t),this.toDispose.push(this.editor.onDidChangeModelDecorations(()=>{const c=this.editor.getModel().getDecorationRange(this.decorationId);this.range&&!this.range.equalsRange(c)&&(this.range=c,this.editor.layoutContentWidget(this))})),this.create(i),this.editor.addContentWidget(this),this.editor.layoutContentWidget(this)}allowEditorOverflow=!1;suppressMouseDown=!0;domNode;range;toDispose=[];create(e){this.domNode=Ce(".inline-breakpoint-widget"),e&&this.domNode.classList.add(...e.split(" ")),this.toDispose.push(B.addDisposableListener(this.domNode,B.EventType.CLICK,async i=>{switch(this.breakpoint?.enabled){case void 0:await this.debugService.addBreakpoints(this.editor.getModel().uri,[{lineNumber:this.range.startLineNumber,column:this.range.startColumn}]);break;case!0:await this.debugService.removeBreakpoints(this.breakpoint.getId());break;case!1:this.debugService.enableOrDisableBreakpoints(!0,this.breakpoint);break}})),this.toDispose.push(B.addDisposableListener(this.domNode,B.EventType.CONTEXT_MENU,i=>{const n=new Y(B.getWindow(this.domNode),i),a=this.getContextMenuActions();this.contextMenuService.showContextMenu({getAnchor:()=>n,getActions:()=>a,getActionsContext:()=>this.breakpoint,onHide:()=>oe(a)})}));const t=()=>{const i=this.editor.getOption(W.lineHeight);this.domNode.style.height=`${i}px`,this.domNode.style.width=`${Math.ceil(.8*i)}px`,this.domNode.style.marginLeft="4px"};t(),this.toDispose.push(this.editor.onDidChangeConfiguration(i=>{(i.hasChanged(W.fontSize)||i.hasChanged(W.lineHeight))&&t()}))}getId(){return re()}getDomNode(){return this.domNode}getPosition(){return this.range?(this.domNode.classList.toggle("line-start",this.range.startColumn===1),{position:{lineNumber:this.range.startLineNumber,column:this.range.startColumn-1},preference:[ae.EXACT]}):null}dispose(){this.editor.removeContentWidget(this),P(this.toDispose)}}L([te],x.prototype,"getId",1),he((g,e)=>{const t=".monaco-editor .glyph-margin-widgets, .monaco-workbench .debug-breakpoints, .monaco-workbench .disassembly-view, .monaco-editor .contentWidgets",i=g.getColor(K);i&&(e.addRule(`${t} {
			${b.allBreakpoints.map(d=>`${m.asCSSSelector(d.regular)}`).join(`,
		`)},
			${m.asCSSSelector(b.debugBreakpointUnsupported)},
			${m.asCSSSelector(b.debugBreakpointHint)}:not([class*='codicon-debug-breakpoint']):not([class*='codicon-debug-stackframe']),
			${m.asCSSSelector(b.breakpoint.regular)}${m.asCSSSelector(b.debugStackframeFocused)}::after,
			${m.asCSSSelector(b.breakpoint.regular)}${m.asCSSSelector(b.debugStackframe)}::after {
				color: ${i} !important;
			}
		}`),e.addRule(`${t} {
			${m.asCSSSelector(b.breakpoint.pending)} {
				color: ${i} !important;
				font-size: 12px !important;
			}
		}`));const n=g.getColor(ye);n&&e.addRule(`${t} {
			${b.allBreakpoints.map(d=>m.asCSSSelector(d.disabled)).join(`,
		`)} {
				color: ${n};
			}
		}`);const a=g.getColor(Le);a&&e.addRule(`${t} {
			${b.allBreakpoints.map(d=>m.asCSSSelector(d.unverified)).join(`,
		`)} {
				color: ${a};
			}
		}`);const r=g.getColor(Ne);r&&e.addRule(`
		.monaco-editor .debug-top-stack-frame-column {
			color: ${r} !important;
		}
		${t} {
			${m.asCSSSelector(b.debugStackframe)} {
				color: ${r} !important;
			}
		}
		`);const o=g.getColor(Ae);o&&e.addRule(`${t} {
			${m.asCSSSelector(b.debugStackframeFocused)} {
				color: ${o} !important;
			}
		}`)});const K=w("debugIcon.breakpointForeground","#E51400",s.localize("debugIcon.breakpointForeground","Icon color for breakpoints.")),ye=w("debugIcon.breakpointDisabledForeground","#848484",s.localize("debugIcon.breakpointDisabledForeground","Icon color for disabled breakpoints.")),Le=w("debugIcon.breakpointUnverifiedForeground","#848484",s.localize("debugIcon.breakpointUnverifiedForeground","Icon color for unverified breakpoints.")),Ne=w("debugIcon.breakpointCurrentStackframeForeground",{dark:"#FFCC00",light:"#BE8700",hcDark:"#FFCC00",hcLight:"#BE8700"},s.localize("debugIcon.breakpointCurrentStackframeForeground","Icon color for the current breakpoint stack frame.")),Ae=w("debugIcon.breakpointStackframeForeground","#89D185",s.localize("debugIcon.breakpointStackframeForeground","Icon color for all breakpoint stack frames."));export{y as BreakpointEditorContribution,De as createBreakpointDecorations,K as debugIconBreakpointForeground};
