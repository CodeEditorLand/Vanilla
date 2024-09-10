var ge=Object.defineProperty;var fe=Object.getOwnPropertyDescriptor;var x=(a,o,e,t)=>{for(var i=t>1?void 0:t?fe(o,e):o,r=a.length-1,s;r>=0;r--)(s=a[r])&&(i=(t?s(o,e,i):s(i))||i);return t&&i&&ge(o,e,i),i},n=(a,o)=>(e,t)=>o(e,t,a);import*as he from"../../../../base/browser/dom.js";import{alert as ve}from"../../../../base/browser/ui/aria/aria.js";import{Codicon as b}from"../../../../base/common/codicons.js";import{Color as G}from"../../../../base/common/color.js";import{Emitter as Ie,Event as J}from"../../../../base/common/event.js";import{stripIcons as Se}from"../../../../base/common/iconLabels.js";import{Iterable as ye}from"../../../../base/common/iterator.js";import{KeyCode as P,KeyMod as M}from"../../../../base/common/keyCodes.js";import{Lazy as be}from"../../../../base/common/lazy.js";import{Disposable as Q,MutableDisposable as ke}from"../../../../base/common/lifecycle.js";import{observableValue as xe}from"../../../../base/common/observable.js";import{count as Ce}from"../../../../base/common/strings.js";import{isCodeEditor as B}from"../../../../editor/browser/editorBrowser.js";import{EditorAction2 as Te}from"../../../../editor/browser/editorExtensions.js";import{ICodeEditorService as I}from"../../../../editor/browser/services/codeEditorService.js";import{EmbeddedCodeEditorWidget as Ee}from"../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";import{EmbeddedDiffEditorWidget as we}from"../../../../editor/browser/widget/diffEditor/embeddedDiffEditorWidget.js";import{EditorOption as Pe}from"../../../../editor/common/config/editorOptions.js";import{Range as Me}from"../../../../editor/common/core/range.js";import{ScrollType as Re}from"../../../../editor/common/editorCommon.js";import{EditorContextKeys as Ue}from"../../../../editor/common/editorContextKeys.js";import{ITextModelService as Ve}from"../../../../editor/common/services/resolverService.js";import{IPeekViewService as Fe,PeekViewWidget as Oe,peekViewTitleForeground as De,peekViewTitleInfoForeground as Ae}from"../../../../editor/contrib/peekView/browser/peekView.js";import{localize as X,localize2 as p}from"../../../../nls.js";import{Categories as C}from"../../../../platform/action/common/actionCommonCategories.js";import{createAndFillInActionBarActions as Y}from"../../../../platform/actions/browser/menuEntryActionViewItem.js";import{Action2 as T,IMenuService as He,MenuId as g}from"../../../../platform/actions/common/actions.js";import{ICommandService as _e}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as Z}from"../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as L,IContextKeyService as R}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as Be}from"../../../../platform/contextview/browser/contextView.js";import{TextEditorSelectionRevealType as Le}from"../../../../platform/editor/common/editor.js";import{IHoverService as Ke}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as K}from"../../../../platform/instantiation/common/instantiation.js";import{ServiceCollection as We}from"../../../../platform/instantiation/common/serviceCollection.js";import{IKeybindingService as Ne}from"../../../../platform/keybinding/common/keybinding.js";import{KeybindingWeight as U}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{INotificationService as je}from"../../../../platform/notification/common/notification.js";import{bindContextKey as qe}from"../../../../platform/observable/common/platformObservableUtils.js";import{IOpenerService as ze}from"../../../../platform/opener/common/opener.js";import{IStorageService as Ge,StorageScope as Je,StorageTarget as Qe}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as Xe}from"../../../../platform/telemetry/common/telemetry.js";import{editorBackground as Ye}from"../../../../platform/theme/common/colorRegistry.js";import{IThemeService as $}from"../../../../platform/theme/common/themeService.js";import{IUriIdentityService as Ze}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{ViewPane as $e}from"../../../browser/parts/views/viewPane.js";import{IViewDescriptorService as et}from"../../../common/views.js";import{renderTestMessageAsText as ee}from"./testMessageColorizer.js";import{MessageSubject as S,TaskSubject as y,TestOutputSubject as k,inspectSubjectHasStack as te,mapFindTestMessage as W}from"./testResultsView/testResultsSubject.js";import{TestResultsViewContent as ie}from"./testResultsView/testResultsViewContent.js";import{testingMessagePeekBorder as tt,testingPeekBorder as it,testingPeekHeaderBackground as rt,testingPeekMessageHeaderBackground as st}from"./theme.js";import{AutoOpenPeekViewWhen as re,TestingConfigKeys as se,getTestingConfiguration as oe}from"../common/configuration.js";import{Testing as V}from"../common/constants.js";import{MutableObservableValue as ot,staticObservableValue as nt}from"../common/observableValue.js";import{StoredValue as at}from"../common/storedValue.js";import{TestResultItemChangeReason as ne,resultItemParents as dt}from"../common/testResult.js";import{ITestResultService as N}from"../common/testResultService.js";import{ITestService as ct}from"../common/testService.js";import{ITestMessage as lt,TestMessageType as j}from"../common/testTypes.js";import{TestingContextKeys as f}from"../common/testingContextKeys.js";import{ITestingPeekOpener as q}from"../common/testingPeekOpener.js";import{isFailedState as ut}from"../common/testingStates.js";import{TestUriType as h,buildTestUri as F,parseTestUri as ae}from"../common/testingUri.js";import{IEditorService as pt}from"../../../services/editor/common/editorService.js";import{IViewsService as mt}from"../../../services/views/common/viewsService.js";function*de(a){for(const o of a)for(const e of o.tests)for(let t=0;t<e.tasks.length;t++)for(let i=0;i<e.tasks[t].messages.length;i++)yield{result:o,test:e,taskIndex:t,messageIndex:i}}let O=class extends Q{constructor(e,t,i,r,s,d,c,u,m){super();this.configuration=e;this.editorService=t;this.codeEditorService=i;this.testResults=r;this.testService=s;this.storageService=d;this.viewsService=c;this.commandService=u;this.notificationService=m;this._register(r.onTestChanged(this.openPeekOnFailure,this))}lastUri;historyVisible=this._register(ot.stored(new at({key:"testHistoryVisibleInPeek",scope:Je.PROFILE,target:Qe.USER},this.storageService),!1));async open(){let e;const t=this.editorService.activeTextEditorControl;if(B(t)&&t.getModel()?.uri){const i=t.getModel()?.uri;i&&(e=await this.getFileCandidateMessage(i,t.getPosition()))}return e||(e=this.lastUri),e||(e=this.getAnyCandidateMessage()),e?this.showPeekFromUri(e):!1}tryPeekFirstError(e,t,i){const r=this.getFailedCandidateMessage(t);return r?(this.showPeekFromUri({type:h.ResultMessage,documentUri:r.location.uri,taskIndex:r.taskId,messageIndex:r.index,resultId:e.id,testExtId:t.item.extId},void 0,{selection:r.location.range,selectionRevealType:Le.NearTopIfOutsideViewport,...i}),!0):!1}peekUri(e,t={}){const i=ae(e),r=i&&this.testResults.getResult(i.resultId);if(!i||!r||!("testExtId"in i)||!("messageIndex"in i))return!1;const s=r.getStateById(i.testExtId)?.tasks[i.taskIndex].messages[i.messageIndex];return s?.location?(this.showPeekFromUri({type:h.ResultMessage,documentUri:s.location.uri,taskIndex:i.taskIndex,messageIndex:i.messageIndex,resultId:r.id,testExtId:i.testExtId},t.inEditor,{selection:s.location.range,...t.options}),!0):!1}closeAllPeeks(){for(const e of this.codeEditorService.listCodeEditors())l.get(e)?.removePeek()}openCurrentInEditor(){const e=this.getActiveControl();if(!e)return;const t={pinned:!1,revealIfOpened:!0};if(e instanceof y||e instanceof k){this.editorService.openEditor({resource:e.outputUri,options:t});return}if(e instanceof k){this.editorService.openEditor({resource:e.outputUri,options:t});return}const i=e.message;e.isDiffable?this.editorService.openEditor({original:{resource:e.expectedUri},modified:{resource:e.actualUri},options:t}):typeof i.message=="string"?this.editorService.openEditor({resource:e.messageUri,options:t}):this.commandService.executeCommand("markdown.showPreview",e.messageUri).catch(r=>{this.notificationService.error(X("testing.markdownPeekError",`Could not open markdown preview: {0}.

Please make sure the markdown extension is enabled.`,r.message))})}getActiveControl(){const e=E(this.codeEditorService);return(e&&l.get(e))?.subject??this.viewsService.getActiveViewWithId(V.ResultsViewId)?.subject}async showPeekFromUri(e,t,i){if(B(t))return this.lastUri=e,l.get(t)?.show(F(this.lastUri)),!0;const s=(await this.editorService.openEditor({resource:e.documentUri,options:{revealIfOpened:!0,...i}}))?.getControl();return B(s)?(this.lastUri=e,l.get(s)?.show(F(this.lastUri)),!0):!1}openPeekOnFailure(e){if(e.reason!==ne.OwnStateChange||!this.getFailedCandidateMessage(e.item)||e.result.request.continuous&&!oe(this.configuration,se.AutoOpenPeekViewDuringContinuousRun))return;const i=this.codeEditorService.listCodeEditors();switch(oe(this.configuration,se.AutoOpenPeekView)){case re.FailureVisible:{const d=new Set(i.map(c=>c.getModel()?.uri.toString()));if(!ye.some(dt(e.result,e.item),c=>c.item.uri&&d.has(c.item.uri.toString())))return;break}case re.FailureAnywhere:break;default:return}i.map(l.get).some(d=>d?.subject)||this.tryPeekFirstError(e.result,e.item)}async getFileCandidateMessage(e,t){let i,r=1/0;const s=e.toString();for(const d of this.testService.collection.all){const c=this.testResults.getStateById(d.item.extId);c&&W(c[1],(u,m,w,H)=>{if(m.type!==j.Error||!m.location||m.location.uri.toString()!==s)return;const _=t?Math.abs(t.lineNumber-m.location.range.startLineNumber):0;(!i||_<=r)&&(r=_,i={type:h.ResultMessage,testExtId:c[1].item.extId,resultId:c[0].id,taskIndex:H,messageIndex:w,documentUri:e})})}return i}getAnyCandidateMessage(){const e=new Set;for(const t of this.testResults.results)for(const i of t.tests){if(e.has(i.item.extId))continue;e.add(i.item.extId);const r=W(i,(s,d,c,u)=>d.location&&{type:h.ResultMessage,testExtId:i.item.extId,resultId:t.id,taskIndex:u,messageIndex:c,documentUri:d.location.uri});if(r)return r}}getFailedCandidateMessage(e){const t=e.item.uri&&e.item.range?{uri:e.item.uri,range:e.item.range}:void 0;let i;return W(e,(r,s,d,c)=>{const u=s.location||t;!ut(r.state)||!u||i&&s.type!==j.Error||(i={taskId:c,index:d,message:s,location:u})}),i}};O=x([n(0,Z),n(1,pt),n(2,I),n(3,N),n(4,ct),n(5,Ge),n(6,mt),n(7,_e),n(8,je)],O);let l=class extends Q{constructor(e,t,i,r,s){super();this.editor=e;this.codeEditorService=t;this.instantiationService=i;this.testResults=r;this.visible=f.isPeekVisible.bindTo(s),this._register(e.onDidChangeModel(()=>this.peek.clear())),this._register(r.onResultsChanged(this.closePeekOnCertainResultEvents,this)),this._register(r.onTestChanged(this.closePeekOnTestChange,this))}static get(e){return e.getContribution(V.OutputPeekContributionId)}peek=this._register(new ke);visible;get subject(){return this.peek.value?.current}async show(e){const t=this.retrieveTest(e);t&&this.showSubject(t)}async showSubject(e){this.peek.value||(this.peek.value=this.instantiationService.createInstance(v,this.editor),this.peek.value.onDidClose(()=>{this.visible.set(!1),this.peek.value=void 0}),this.visible.set(!0),this.peek.value.create()),e instanceof S&&ve(ee(e.message.message)),this.peek.value.setModel(e)}async openAndShow(e){const t=this.retrieveTest(e);if(!t)return;if(!t.revealLocation||t.revealLocation.uri.toString()===this.editor.getModel()?.uri.toString())return this.show(e);const i=await this.codeEditorService.openCodeEditor({resource:t.revealLocation.uri,options:{pinned:!1,revealIfOpened:!0}},this.editor);if(i)return l.get(i)?.removePeek(),l.get(i)?.show(e)}removePeek(){this.peek.clear()}collapseStack(){this.peek.value?.collapseStack()}next(){const e=this.peek.value?.current;if(!e)return;let t=!1;for(const{messageIndex:i,taskIndex:r,result:s,test:d}of de(this.testResults.results)){if(e instanceof y&&s.id===e.result.id&&(t=!0),t){this.openAndShow(F({type:h.ResultMessage,messageIndex:i,taskIndex:r,resultId:s.id,testExtId:d.item.extId}));return}e instanceof k&&e.test.item.extId===d.item.extId&&e.taskIndex===r&&e.result.id===s.id&&(t=!0),e instanceof S&&e.test.extId===d.item.extId&&e.messageIndex===i&&e.taskIndex===r&&e.result.id===s.id&&(t=!0)}}previous(){const e=this.peek.value?.current;if(!e)return;let t;for(const i of de(this.testResults.results)){if(e instanceof y){if(i.result.id===e.result.id)break;continue}if(e instanceof k){if(i.test.item.extId===e.test.item.extId&&i.result.id===e.result.id&&i.taskIndex===e.taskIndex)break;continue}if(e.test.extId===i.test.item.extId&&e.messageIndex===i.messageIndex&&e.taskIndex===i.taskIndex&&e.result.id===i.result.id)break;t=i}t&&this.openAndShow(F({type:h.ResultMessage,messageIndex:t.messageIndex,taskIndex:t.taskIndex,resultId:t.result.id,testExtId:t.test.item.extId}))}removeIfPeekingForTest(e){const t=this.peek.value?.current;t&&t instanceof S&&t.test.extId===e&&this.peek.clear()}closePeekOnTestChange(e){e.reason!==ne.OwnStateChange||e.previousState===e.item.ownComputedState||this.removeIfPeekingForTest(e.item.item.extId)}closePeekOnCertainResultEvents(e){"started"in e&&this.peek.clear(),"removed"in e&&this.testResults.results.length===0&&this.peek.clear()}retrieveTest(e){const t=ae(e);if(!t)return;const i=this.testResults.results.find(u=>u.id===t.resultId);if(!i)return;if(t.type===h.TaskOutput)return new y(i,t.taskIndex);if(t.type===h.TestOutput){const u=i.getStateById(t.testExtId);return u?new k(i,t.taskIndex,u):void 0}const{testExtId:r,taskIndex:s,messageIndex:d}=t,c=i?.getStateById(r);if(!(!c||!c.tasks[t.taskIndex]))return new S(i,c,s,d)}};l=x([n(1,I),n(2,K),n(3,N),n(4,R)],l);let v=class extends Oe{constructor(e,t,i,r,s,d,c,u,m,w){super(e,{showFrame:!0,frameWidth:1,showArrow:!0,isResizeable:!0,isAccessible:!0,className:"test-output-peek"},c);this.themeService=t;this.testingPeek=r;this.contextKeyService=s;this.menuService=d;this.modelService=u;this.codeEditorService=m;this.uriIdentityService=w;this._disposables.add(t.onDidColorThemeChange(this.applyTheme,this)),this._disposables.add(this.onDidClose(()=>this.visibilityChange.fire(!1))),i.addExclusiveWidget(e,this)}static lastHeightInLines;visibilityChange=this._disposables.add(new Ie);_current=xe("testPeekCurrent",void 0);content;scopedContextKeyService;dimension;get current(){return this._current.get()}applyTheme(){const e=this.themeService.getColorTheme(),t=this.current instanceof S&&this.current.message.type===j.Error,i=(t?e.getColor(it):e.getColor(tt))||G.transparent,r=(t?e.getColor(rt):e.getColor(st))||G.transparent,s=e.getColor(Ye);this.style({arrowColor:i,frameColor:i,headerBackgroundColor:s&&r?r.makeOpaque(s):r,primaryHeadingColor:e.getColor(De),secondaryHeadingColor:e.getColor(Ae)})}_fillContainer(e){if(!this.scopedContextKeyService){this.scopedContextKeyService=this._disposables.add(this.contextKeyService.createScoped(e)),f.isInPeek.bindTo(this.scopedContextKeyService).set(!0);const t=this._disposables.add(this.instantiationService.createChild(new We([R,this.scopedContextKeyService])));this.content=this._disposables.add(t.createInstance(ie,this.editor,{historyVisible:this.testingPeek.historyVisible,showRevealLocationOnMessages:!1,locationForProgress:V.ResultsViewId})),this._disposables.add(this.content.onClose(()=>{l.get(this.editor)?.removePeek()}))}super._fillContainer(e)}_fillHead(e){super._fillHead(e);const t=this._disposables.add(this.contextKeyService.createScoped(e));this._disposables.add(qe(f.peekHasStack,t,d=>te(this._current.read(d))));const i=this.menuService.createMenu(g.TestPeekTitle,t),r=this._actionbarWidget;this._disposables.add(i.onDidChange(()=>{for(s.length=0,Y(i,void 0,s);r.getAction(1);)r.pull(0);r.push(s,{label:!1,icon:!0,index:0})}));const s=[];Y(i,void 0,s),r.push(s,{label:!1,icon:!0,index:0})}_fillBody(e){this.content.fillBody(e),this._disposables.add(this.content.onDidRequestReveal(t=>{l.get(this.editor)?.show(t instanceof S?t.messageUri:t.outputUri)}))}setModel(e){if(e instanceof y||e instanceof k)return this._current.set(e,void 0),this.showInPlace(e);const t=e.message,i=this.current,r=e.revealLocation?.range.getStartPosition();if(!r&&!i)return Promise.resolve();if(this._current.set(e,void 0),!r)return this.showInPlace(e);const s=v.lastHeightInLines||Math.max(te(e)?Math.ceil(this.getVisibleEditorLines()/2):0,gt(t));return this.show(r,s),this.editor.revealRangeNearTopIfOutsideViewport(Me.fromPositions(r),Re.Smooth),this.showInPlace(e)}collapseStack(){this.content.collapseStack()}getVisibleEditorLines(){return Math.round(this.editor.getDomNode().clientHeight/this.editor.getOption(Pe.lineHeight))}async showInPlace(e){if(e instanceof S){const t=e.message;this.setTitle(ft(ee(t.message)),Se(e.test.label))}else this.setTitle(X("testOutputTitle","Test Output"));this.applyTheme(),await this.content.reveal({subject:e,preserveFocus:!1})}_relayout(e){super._relayout(e),v.lastHeightInLines=e}_doLayoutBody(e,t){super._doLayoutBody(e,t),this.content.onLayoutBody(e,t)}_onWidth(e){super._onWidth(e),this.dimension&&(this.dimension=new he.Dimension(e,this.dimension.height)),this.content.onWidth(e)}};v=x([n(1,$),n(2,Fe),n(3,q),n(4,R),n(5,He),n(6,K),n(7,Ve),n(8,I),n(9,Ze)],v);let D=class extends $e{constructor(e,t,i,r,s,d,c,u,m,w,H,_){super(e,t,i,r,s,d,c,u,m,w,H);this.resultService=_}content=new be(()=>this._register(this.instantiationService.createInstance(ie,void 0,{historyVisible:nt(!0),showRevealLocationOnMessages:!0,locationForProgress:V.ExplorerViewId})));get subject(){return this.content.rawValue?.current}showLatestRun(e=!1){const t=this.resultService.results.find(i=>i.tasks.length);t&&this.content.rawValue?.reveal({preserveFocus:e,subject:new y(t,0)})}renderBody(e){super.renderBody(e),this.isBodyVisible()?this.renderContent(e):this._register(J.once(J.filter(this.onDidChangeBodyVisibility,Boolean))(()=>this.renderContent(e)))}layoutBody(e,t){super.layoutBody(e,t),this.content.rawValue?.onLayoutBody(e,t)}renderContent(e){const t=this.content.value;t.fillBody(e),this._register(t.onDidRequestReveal(r=>t.reveal({preserveFocus:!0,subject:r})));const[i]=this.resultService.results;i&&i.tasks.length&&t.reveal({preserveFocus:!0,subject:new y(i,0)})}};D=x([n(1,Ne),n(2,Be),n(3,Z),n(4,R),n(5,et),n(6,K),n(7,ze),n(8,$),n(9,Xe),n(10,Ke),n(11,N)],D);const gt=a=>(lt.isDiffable(a)?Math.max(z(a.actual),z(a.expected)):z(typeof a.message=="string"?a.message:a.message.value))+8,ft=a=>{const o=a.indexOf(`
`);return o===-1?a:a.slice(0,o)},z=a=>Math.min(Ce(a,`
`),24);function ht(a){const o=a.listDiffEditors();for(const e of o)if(e.hasTextFocus()&&e instanceof we)return e.getParentEditor();return null}class Xi extends Te{constructor(){super({id:"editor.closeTestPeek",title:p("close","Close"),icon:b.close,precondition:L.or(f.isInPeek,f.isPeekVisible),keybinding:{weight:U.EditorContrib-101,primary:P.Escape,when:L.not("config.editor.stablePeek")}})}runEditorCommand(o,e){const t=E(o.get(I));l.get(t??e)?.removePeek()}}const A=L.and(Ue.focus,f.isPeekVisible),E=a=>{const o=a.getFocusedCodeEditor()||a.getActiveCodeEditor();return o&&vt(a,o)},vt=(a,o)=>{if(l.get(o)?.subject)return o;if(o instanceof Ee)return o.getParentEditor();const e=ht(a);return e||o};class ce extends T{static ID="testing.goToNextMessage";constructor(){super({id:ce.ID,f1:!0,title:p("testing.goToNextMessage","Go to Next Test Failure"),metadata:{description:p("testing.goToNextMessage.description","Shows the next failure message in your file")},icon:b.arrowDown,category:C.Test,keybinding:{primary:M.Alt|P.F8,weight:U.EditorContrib+1,when:A},menu:[{id:g.TestPeekTitle,group:"navigation",order:2},{id:g.CommandPalette,when:A}]})}run(o){const e=E(o.get(I));e&&l.get(e)?.next()}}class le extends T{static ID="testing.goToPreviousMessage";constructor(){super({id:le.ID,f1:!0,title:p("testing.goToPreviousMessage","Go to Previous Test Failure"),metadata:{description:p("testing.goToPreviousMessage.description","Shows the previous failure message in your file")},icon:b.arrowUp,category:C.Test,keybinding:{primary:M.Shift|M.Alt|P.F8,weight:U.EditorContrib+1,when:A},menu:[{id:g.TestPeekTitle,group:"navigation",order:1},{id:g.CommandPalette,when:A}]})}run(o){const e=E(o.get(I));e&&l.get(e)?.previous()}}class ue extends T{static ID="testing.collapsePeekStack";constructor(){super({id:ue.ID,title:p("testing.collapsePeekStack","Collapse Stack Frames"),icon:b.collapseAll,category:C.Test,menu:[{id:g.TestPeekTitle,when:f.peekHasStack,group:"navigation",order:4}]})}run(o){const e=E(o.get(I));e&&l.get(e)?.collapseStack()}}class pe extends T{static ID="testing.openMessageInEditor";constructor(){super({id:pe.ID,f1:!1,title:p("testing.openMessageInEditor","Open in Editor"),icon:b.goToFile,category:C.Test,menu:[{id:g.TestPeekTitle}]})}run(o){o.get(q).openCurrentInEditor()}}class me extends T{static ID="testing.toggleTestingPeekHistory";constructor(){super({id:me.ID,f1:!0,title:p("testing.toggleTestingPeekHistory","Toggle Test History in Peek"),metadata:{description:p("testing.toggleTestingPeekHistory.description","Shows or hides the history of test runs in the peek view")},icon:b.history,category:C.Test,menu:[{id:g.TestPeekTitle,group:"navigation",order:3}],keybinding:{weight:U.WorkbenchContrib,primary:M.Alt|P.KeyH,when:f.isPeekVisible.isEqualTo(!0)}})}run(o){const e=o.get(q);e.historyVisible.value=!e.historyVisible.value}}export{Xi as CloseTestPeek,ue as CollapsePeekStack,ce as GoToNextMessageAction,le as GoToPreviousMessageAction,pe as OpenMessageInEditorAction,D as TestResultsView,l as TestingOutputPeekController,O as TestingPeekOpener,me as ToggleTestingPeekHistory};
