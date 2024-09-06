var _=Object.defineProperty;var U=Object.getOwnPropertyDescriptor;var I=(n,o,e,t)=>{for(var i=t>1?void 0:t?U(o,e):o,s=n.length-1,r;s>=0;s--)(r=n[s])&&(i=(t?r(o,e,i):r(i))||i);return t&&i&&_(o,e,i),i},d=(n,o)=>(e,t)=>o(e,t,n);import*as l from"../../../../../base/browser/dom.js";import{StandardKeyboardEvent as N}from"../../../../../base/browser/keyboardEvent.js";import{renderLabelWithIcons as H}from"../../../../../base/browser/ui/iconLabel/iconLabels.js";import{Orientation as j,Sizing as L,SplitView as q}from"../../../../../base/browser/ui/splitview/splitview.js";import{findAsync as z}from"../../../../../base/common/arrays.js";import{Limiter as B}from"../../../../../base/common/async.js";import{CancellationTokenSource as $}from"../../../../../base/common/cancellation.js";import{Emitter as D,Event as C,Relay as Q}from"../../../../../base/common/event.js";import{KeyCode as M}from"../../../../../base/common/keyCodes.js";import{Disposable as F,DisposableStore as k,toDisposable as b}from"../../../../../base/common/lifecycle.js";import{observableValue as X}from"../../../../../base/common/observable.js";import"./testResultsViewContent.css";import"../../../../../editor/browser/editorBrowser.js";import{ITextModelService as Z}from"../../../../../editor/common/services/resolverService.js";import{localize as T}from"../../../../../nls.js";import{FloatingClickMenu as G}from"../../../../../platform/actions/browser/floatingMenu.js";import{createActionViewItem as J}from"../../../../../platform/actions/browser/menuEntryActionViewItem.js";import{MenuWorkbenchToolBar as Y}from"../../../../../platform/actions/browser/toolbar.js";import{Action2 as R,MenuId as y,registerAction2 as K}from"../../../../../platform/actions/common/actions.js";import{ICommandService as ee}from"../../../../../platform/commands/common/commands.js";import{IContextKeyService as w}from"../../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as V}from"../../../../../platform/instantiation/common/instantiation.js";import{ServiceCollection as P}from"../../../../../platform/instantiation/common/serviceCollection.js";import{IQuickInputService as te}from"../../../../../platform/quickinput/common/quickInput.js";import{IUriIdentityService as ie}from"../../../../../platform/uriIdentity/common/uriIdentity.js";import{CustomStackFrame as se}from"../../../debug/browser/callStackWidget.js";import{TestCommandId as O}from"../../common/constants.js";import"../../common/observableValue.js";import{TestingContextKeys as m}from"../../common/testingContextKeys.js";import{capabilityContextKeys as re,ITestProfileService as oe}from"../../common/testProfileService.js";import{LiveTestResult as E}from"../../common/testResult.js";import{ITestService as W}from"../../common/testService.js";import{TestRunProfileBitset as v}from"../../common/testTypes.js";import*as x from"../icons.js";import{TestResultStackWidget as ne}from"./testMessageStack.js";import{DiffContentProvider as ae,MarkdownTestMessagePeek as le,PlainTextMessagePeek as ce,TerminalMessagePeek as de}from"./testResultsOutput.js";import{equalsSubject as ue,getSubjectTestItem as pe,MessageSubject as g,TaskSubject as me,TestOutputSubject as he}from"./testResultsSubject.js";import{OutputPeekTree as ve}from"./testResultsTree.js";var ge=(e=>(e[e.Diff=0]="Diff",e[e.History=1]="History",e))(ge||{});let S=class extends se{constructor(e,t,i,s,r,c){super();this.message=e;this.followup=t;this.subject=i;this.instantiationService=s;this.contextKeyService=r;this.profileService=c;this.label=i instanceof g?i.test.label:i instanceof he?i.test.item.label:i.result.name}height=X("MessageStackFrame.height",100);label;icon=x.testingViewIcon;render(e){return this.message.style.visibility="visible",e.appendChild(this.message),b(()=>this.message.remove())}renderActions(e){const t=new k;e.appendChild(this.followup.domNode),t.add(b(()=>this.followup.domNode.remove()));const i=pe(this.subject),s=i&&this.profileService.capabilitiesForTest(i);let r;if(s)r=this.contextKeyService.createOverlay(re(s));else{const u=this.profileService.getControllerProfiles(this.subject.controllerId);r=this.contextKeyService.createOverlay([[m.hasRunnableTests.key,u.some(a=>a.group&v.Run)],[m.hasDebuggableTests.key,u.some(a=>a.group&v.Debug)]])}const c=t.add(this.instantiationService.createChild(new P([w,r]))),h=t.add(c.createInstance(Y,e,y.TestCallStack,{menuOptions:{shouldForwardArgs:!0},actionViewItemProvider:(u,a)=>J(this.instantiationService,u,a)}));return h.context=this.subject,t.add(h),t}};S=I([d(3,V),d(4,w),d(5,oe)],S);function A(n,o,e){if(e instanceof me)return n.get(ee).executeCommand(o===v.Debug?O.DebugLastRun:O.ReRunLastRun,e.result.id);const t=n.get(W),i=e instanceof g?e.test:e.test.item,s=t.collection.getNodeById(i.extId);if(s)return t.runTests({group:o,tests:[s]})}K(class extends R{constructor(){super({id:"testing.callStack.run",title:T("testing.callStack.run","Rerun Test"),icon:x.testingRunIcon,menu:{id:y.TestCallStack,when:m.hasRunnableTests,group:"navigation"}})}run(n,o){A(n,v.Run,o)}}),K(class extends R{constructor(){super({id:"testing.callStack.debug",title:T("testing.callStack.debug","Debug Test"),icon:x.testingDebugIcon,menu:{id:y.TestCallStack,when:m.hasDebuggableTests,group:"navigation"}})}run(n,o){A(n,v.Debug,o)}});let p=class extends F{constructor(e,t,i,s,r,c){super();this.editor=e;this.options=t;this.instantiationService=i;this.modelService=s;this.contextKeyService=r;this.uriIdentityService=c}static lastSplitWidth;didReveal=this._register(new D);currentSubjectStore=this._register(new k);onCloseEmitter=this._register(new Q);followupWidget;messageContextKeyService;contextKeyTestMessage;contextKeyResultOutdated;stackContainer;callStackWidget;currentTopFrame;isDoingLayoutUpdate;dimension;splitView;messageContainer;contentProviders;contentProvidersUpdateLimiter=this._register(new B(1));current;onDidRequestReveal;onClose=this.onCloseEmitter.event;get uiState(){return{splitViewWidths:Array.from({length:this.splitView.length},(e,t)=>this.splitView.getViewSize(t))}}fillBody(e){const t=p.lastSplitWidth;this.splitView=new q(e,{orientation:j.HORIZONTAL});const{historyVisible:i,showRevealLocationOnMessages:s}=this.options,r=this.editor!==void 0,c=this.messageContainer=l.$(".test-output-peek-message-container");this.stackContainer=l.append(e,l.$(".test-output-call-stack-container")),this.callStackWidget=this._register(this.instantiationService.createInstance(ne,this.stackContainer,this.editor)),this.followupWidget=this._register(this.instantiationService.createInstance(f,this.editor)),this.onCloseEmitter.input=this.followupWidget.onClose,this.contentProviders=[this._register(this.instantiationService.createInstance(ae,this.editor,c)),this._register(this.instantiationService.createInstance(le,c)),this._register(this.instantiationService.createInstance(de,c,r)),this._register(this.instantiationService.createInstance(ce,this.editor,c))],this.messageContextKeyService=this._register(this.contextKeyService.createScoped(e)),this.contextKeyTestMessage=m.testMessageContext.bindTo(this.messageContextKeyService),this.contextKeyResultOutdated=m.testResultOutdated.bindTo(this.messageContextKeyService);const h=l.append(e,l.$(".test-output-peek-tree")),u=this._register(this.instantiationService.createInstance(ve,h,this.didReveal.event,{showRevealLocationOnMessages:s,locationForProgress:this.options.locationForProgress}));this.onDidRequestReveal=u.onDidRequestReview,this.splitView.addView({onDidChange:C.None,element:this.stackContainer,minimumSize:200,maximumSize:Number.MAX_VALUE,layout:a=>{p.lastSplitWidth=a,this.dimension&&(this.callStackWidget?.layout(this.dimension.height,a),this.layoutContentWidgets(this.dimension,a))}},L.Distribute),this.splitView.addView({onDidChange:C.None,element:h,minimumSize:100,maximumSize:Number.MAX_VALUE,layout:a=>{this.dimension&&u.layout(this.dimension.height,a)}},L.Distribute),this.splitView.setViewVisible(1,i.value),this._register(i.onDidChange(a=>{this.splitView.setViewVisible(1,a)})),t&&queueMicrotask(()=>this.splitView.resizeView(0,t))}reveal(e){return this.didReveal.fire(e),this.current&&ue(this.current,e.subject)?Promise.resolve():(this.current=e.subject,this.contentProvidersUpdateLimiter.queue(async()=>{this.currentSubjectStore.clear();const t=this.getCallFrames(e.subject)||[],i=await this.prepareTopFrame(e.subject,t);this.callStackWidget.update(i,t),this.followupWidget.show(e.subject),this.populateFloatingClick(e.subject)}))}collapseStack(){this.callStackWidget.collapseAll()}getCallFrames(e){if(!(e instanceof g))return;const t=e.stack;if(!t?.length||!this.editor)return t;const i=t[0],s=e.revealLocation;return s&&i.position&&i.uri&&i.position.lineNumber===s.range.startLineNumber&&i.position.column===s.range.startColumn&&this.uriIdentityService.extUri.isEqual(i.uri,s.uri)?t.slice(1):t}async prepareTopFrame(e,t){this.messageContainer.style.visibility="hidden",this.stackContainer.appendChild(this.messageContainer);const i=this.currentTopFrame=this.instantiationService.createInstance(S,this.messageContainer,this.followupWidget,e),s=t.length>0;i.showHeader.set(s,void 0);const r=await z(this.contentProviders,c=>c.update(e));return r&&(this.dimension&&i.height.set(r.layout(this.dimension,s),void 0),r.onDidContentSizeChange&&this.currentSubjectStore.add(r.onDidContentSizeChange(()=>{this.dimension&&!this.isDoingLayoutUpdate&&(this.isDoingLayoutUpdate=!0,i.height.set(r.layout(this.dimension,s),void 0),this.isDoingLayoutUpdate=!1)}))),i}layoutContentWidgets(e,t=this.splitView.getViewSize(0)){this.isDoingLayoutUpdate=!0;for(const i of this.contentProviders){const s=i.layout({height:e.height,width:t},!!this.currentTopFrame?.showHeader.get());s&&this.currentTopFrame?.height.set(s,void 0)}this.isDoingLayoutUpdate=!1}populateFloatingClick(e){if(!(e instanceof g))return;this.currentSubjectStore.add(b(()=>{this.contextKeyResultOutdated.reset(),this.contextKeyTestMessage.reset()})),this.contextKeyTestMessage.set(e.contextValue||""),e.result instanceof E?(this.contextKeyResultOutdated.set(e.result.getStateById(e.test.extId)?.retired??!1),this.currentSubjectStore.add(e.result.onChange(i=>{i.item.item.extId===e.test.extId&&this.contextKeyResultOutdated.set(i.item.retired??!1)}))):this.contextKeyResultOutdated.set(!0);const t=this.currentSubjectStore.add(this.instantiationService.createChild(new P([w,this.messageContextKeyService])));this.currentSubjectStore.add(t.createInstance(G,{container:this.messageContainer,menuId:y.TestMessageContent,getActionArg:()=>e.context}))}onLayoutBody(e,t){this.dimension=new l.Dimension(t,e),this.splitView.layout(t)}onWidth(e){this.splitView.layout(e)}};p=I([d(2,V),d(3,Z),d(4,w),d(5,ie)],p);const Se=500;let f=class extends F{constructor(e,t,i){super();this.editor=e;this.testService=t;this.quickInput=i}el=l.h("div.testing-followup-action",[]);visibleStore=this._register(new k);onCloseEmitter=this._register(new D);onClose=this.onCloseEmitter.event;get domNode(){return this.el.root}show(e){this.visibleStore.clear(),e instanceof g&&this.showMessage(e)}async showMessage(e){const t=this.visibleStore.add(new $),i=Date.now();e.result instanceof E&&!e.result.completedAt&&await new Promise(r=>C.once(e.result.onComplete)(r));const s=await this.testService.provideTestFollowups({extId:e.test.extId,messageIndex:e.messageIndex,resultId:e.result.id,taskIndex:e.taskIndex},t.token);if(!s.followups.length||t.token.isCancellationRequested){s.dispose();return}this.visibleStore.add(s),l.clearNode(this.el.root),this.el.root.classList.toggle("animated",Date.now()-i>Se),this.el.root.appendChild(this.makeFollowupLink(s.followups[0])),s.followups.length>1&&this.el.root.appendChild(this.makeMoreLink(s.followups)),this.visibleStore.add(b(()=>{this.el.root.remove()}))}makeFollowupLink(e){const t=this.makeLink(()=>this.actionFollowup(t,e));return l.reset(t,...H(e.message)),t}makeMoreLink(e){const t=this.makeLink(()=>this.quickInput.pick(e.map((i,s)=>({label:i.message,index:s}))).then(i=>{i?.length&&e[i[0].index].execute()}));return t.innerText=T("testFollowup.more","+{0} More...",e.length-1),t}makeLink(e){const t=document.createElement("a");return t.tabIndex=0,this.visibleStore.add(l.addDisposableListener(t,"click",e)),this.visibleStore.add(l.addDisposableListener(t,"keydown",i=>{const s=new N(i);(s.equals(M.Space)||s.equals(M.Enter))&&e()})),t}actionFollowup(e,t){e.ariaDisabled!=="true"&&(e.ariaDisabled="true",t.execute(),this.editor&&this.onCloseEmitter.fire())}};f=I([d(1,W),d(2,te)],f);export{p as TestResultsViewContent};
