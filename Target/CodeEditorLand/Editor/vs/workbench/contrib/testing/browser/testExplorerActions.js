import{distinct as Ee}from"../../../../base/common/arrays.js";import"../../../../base/common/cancellation.js";import{Codicon as O}from"../../../../base/common/codicons.js";import{Iterable as Pe}from"../../../../base/common/iterator.js";import{KeyChord as A,KeyCode as d,KeyMod as p}from"../../../../base/common/keyCodes.js";import{DisposableStore as ke}from"../../../../base/common/lifecycle.js";import{isDefined as W}from"../../../../base/common/types.js";import"../../../../base/common/uri.js";import"../../../../editor/browser/editorBrowser.js";import{ICodeEditorService as oe}from"../../../../editor/browser/services/codeEditorService.js";import{EmbeddedCodeEditorWidget as se}from"../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";import{EditorOption as re}from"../../../../editor/common/config/editorOptions.js";import{Position as Ve}from"../../../../editor/common/core/position.js";import{Range as N}from"../../../../editor/common/core/range.js";import{EditorContextKeys as k}from"../../../../editor/common/editorContextKeys.js";import"../../../../editor/common/model.js";import{SymbolNavigationAction as De}from"../../../../editor/contrib/gotoSymbol/browser/goToCommands.js";import{ReferencesModel as ie}from"../../../../editor/contrib/gotoSymbol/browser/referencesModel.js";import{MessageController as ne}from"../../../../editor/contrib/message/browser/messageController.js";import{PeekContext as ue}from"../../../../editor/contrib/peekView/browser/peekView.js";import{localize as E,localize2 as c}from"../../../../nls.js";import{Categories as qe}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as I,MenuId as a}from"../../../../platform/actions/common/actions.js";import{ICommandService as L}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as Fe}from"../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as f,ContextKeyGreaterExpr as Me}from"../../../../platform/contextkey/common/contextkey.js";import"../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as h}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{INotificationService as M,Severity as Be}from"../../../../platform/notification/common/notification.js";import{IProgressService as G,ProgressLocation as Oe}from"../../../../platform/progress/common/progress.js";import{IQuickInputService as le}from"../../../../platform/quickinput/common/quickInput.js";import{widgetClose as Le}from"../../../../platform/theme/common/iconRegistry.js";import{IUriIdentityService as _}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{ViewAction as P}from"../../../browser/parts/views/viewPane.js";import{FocusedViewContext as Ge}from"../../../common/contextkeys.js";import{ViewContainerLocation as Ue}from"../../../common/views.js";import{IEditorService as Ke}from"../../../services/editor/common/editorService.js";import{IPaneCompositePartService as We}from"../../../services/panecomposite/browser/panecomposite.js";import{IViewsService as ce}from"../../../services/views/common/viewsService.js";import{VIEWLET_ID as Ne}from"../../extensions/common/extensions.js";import{getTestingConfiguration as _e,TestingConfigKeys as He}from"../common/configuration.js";import{TestCommandId as u,testConfigurationGroupNames as Qe,TestExplorerViewMode as U,TestExplorerViewSorting as D,Testing as R}from"../common/constants.js";import{ITestCoverageService as ae}from"../common/testCoverageService.js";import{TestId as de}from"../common/testId.js";import{TestingContextKeys as l}from"../common/testingContextKeys.js";import{ITestingContinuousRunService as K}from"../common/testingContinuousRunService.js";import{ITestingPeekOpener as ze}from"../common/testingPeekOpener.js";import{isFailedState as Ye}from"../common/testingStates.js";import{canUseProfileWithTest as Xe,ITestProfileService as V}from"../common/testProfileService.js";import"../common/testResult.js";import{ITestResultService as q}from"../common/testResultService.js";import{expandAndGetTestById as je,ITestService as y,testsInFile as Je,testsUnderUri as Ze}from"../common/testService.js";import{ExtTestRunProfileKind as H,TestItemExpandState as ge,TestRunProfileBitset as T}from"../common/testTypes.js";import{TestItemTreeElement as pe}from"./explorerProjections/index.js";import*as b from"./icons.js";import"./testingExplorerView.js";import"./testingOutputPeek.js";const m=qe.Test;var $e=(v=>(v[v.Refresh=10]="Refresh",v[v.Run=11]="Run",v[v.Debug=12]="Debug",v[v.Coverage=13]="Coverage",v[v.RunContinuous=14]="RunContinuous",v[v.RunUsing=15]="RunUsing",v[v.Collapse=16]="Collapse",v[v.ClearResults=17]="ClearResults",v[v.DisplayMode=18]="DisplayMode",v[v.Sort=19]="Sort",v[v.GoToTest=20]="GoToTest",v[v.HideTest=21]="HideTest",v[v.ContinuousRunTest=2147483647]="ContinuousRunTest",v))($e||{});const Q=Me.create(l.providerCount.key,0),Te=c("runSelectedTests","Run Tests"),me=c("debugSelectedTests","Debug Tests"),fe=c("coverageSelectedTests","Run Tests with Coverage");class et extends I{constructor(){super({id:u.HideTestAction,title:c("hideTest","Hide Test"),menu:{id:a.TestItem,group:"builtin@2",when:l.testItemIsHidden.isEqualTo(!1)}})}run(t,...e){const o=t.get(y);for(const n of e)o.excluded.toggle(n.test,!0);return Promise.resolve()}}class tt extends I{constructor(){super({id:u.UnhideTestAction,title:c("unhideTest","Unhide Test"),menu:{id:a.TestItem,order:21,when:l.testItemIsHidden.isEqualTo(!0)}})}run(t,...e){const o=t.get(y);for(const n of e)n instanceof pe&&o.excluded.toggle(n.test,!1);return Promise.resolve()}}class ot extends I{constructor(){super({id:u.UnhideAllTestsAction,title:c("unhideAllTests","Unhide All Tests")})}run(t){return t.get(y).excluded.clear(),Promise.resolve()}}const B=(s,t)=>[{id:a.TestItem,group:"inline",order:s,when:t},{id:a.TestItem,group:"builtin@1",order:s,when:t}];class z extends P{constructor(e,o){super({...o,viewId:R.ExplorerViewId});this.bitset=e}runInView(e,o,...n){const{include:r,exclude:i}=o.getTreeIncludeExclude(n.map(S=>S.test));return e.get(y).runTests({tests:r,exclude:i,group:this.bitset})}}class st extends z{constructor(){super(T.Debug,{id:u.DebugAction,title:c("debug test","Debug Test"),icon:b.testingDebugIcon,menu:B(12,l.hasDebuggableTests.isEqualTo(!0))})}}class rt extends z{constructor(){super(T.Coverage,{id:u.RunWithCoverageAction,title:c("run with cover test","Run Test with Coverage"),icon:b.testingCoverageIcon,menu:B(13,l.hasCoverableTests.isEqualTo(!0))})}}class it extends I{constructor(){super({id:u.RunUsingProfileAction,title:c("testing.runUsing","Execute Using Profile..."),icon:b.testingDebugIcon,menu:{id:a.TestItem,order:15,group:"builtin@2",when:l.hasNonDefaultProfile.isEqualTo(!0)}})}async run(t,...e){const o=t.get(L),n=t.get(y),r=await o.executeCommand("vscode.pickTestProfile",{onlyForTest:e[0].test});r&&n.runResolvedTests({group:r.group,targets:[{profileId:r.profileId,controllerId:r.controllerId,testIds:e.filter(i=>Xe(r,i.test)).map(i=>i.test.item.extId)}]})}}class nt extends z{constructor(){super(T.Run,{id:u.RunAction,title:c("run test","Run Test"),icon:b.testingRunIcon,menu:B(11,l.hasRunnableTests.isEqualTo(!0))})}}class ut extends I{constructor(){super({id:u.SelectDefaultTestProfiles,title:c("testing.selectDefaultTestProfiles","Select Default Profile"),icon:b.testingUpdateProfiles,category:m})}async run(t,e){const o=t.get(L),n=t.get(V),r=await o.executeCommand("vscode.pickMultipleTestProfiles",{showConfigureButtons:!1,selected:n.getGroupDefaultProfiles(e),onlyGroup:e});r?.length&&n.setGroupDefaultProfiles(e,r)}}class lt extends I{constructor(){super({id:u.ToggleContinousRunForTest,title:c("testing.toggleContinuousRunOn","Turn on Continuous Run"),icon:b.testingTurnContinuousRunOn,precondition:f.or(l.isContinuousModeOn.isEqualTo(!0),l.isParentRunningContinuously.isEqualTo(!1)),toggled:{condition:l.isContinuousModeOn.isEqualTo(!0),icon:b.testingContinuousIsOn,title:E("testing.toggleContinuousRunOff","Turn off Continuous Run")},menu:B(2147483647,l.supportsContinuousRun.isEqualTo(!0))})}async run(t,...e){const o=t.get(K);for(const n of e){const r=n.test.item.extId;if(o.isSpecificallyEnabledFor(r)){o.stop(r);continue}o.start(T.Run,r)}}}class ct extends I{constructor(){super({id:u.ContinousRunUsingForTest,title:c("testing.startContinuousRunUsing","Start Continous Run Using..."),icon:b.testingDebugIcon,menu:[{id:a.TestItem,order:14,group:"builtin@2",when:f.and(l.supportsContinuousRun.isEqualTo(!0),l.isContinuousModeOn.isEqualTo(!1))}]})}async run(t,...e){const o=t.get(K),n=t.get(V),r=t.get(M),i=t.get(le);for(const S of e){const w=await ve(o,r,i,[{profiles:n.getControllerProfiles(S.test.controllerId)}]);w.length&&o.start(w,S.test.item.extId)}}}class at extends I{constructor(){super({id:u.ConfigureTestProfilesAction,title:c("testing.configureProfile","Configure Test Profiles"),icon:b.testingUpdateProfiles,f1:!0,category:m,menu:{id:a.CommandPalette,when:l.hasConfigurableProfile.isEqualTo(!0)}})}async run(t,e){const o=t.get(L),n=t.get(V),r=await o.executeCommand("vscode.pickTestProfile",{placeholder:E("configureProfile","Select a profile to update"),showConfigureButtons:!1,onlyConfigurable:!0,onlyGroup:e});r&&n.configure(r.controllerId,r.profileId)}}const Ce=s=>[{id:a.ViewTitle,group:"navigation",order:15,when:f.and(f.equals("view",R.ExplorerViewId),l.supportsContinuousRun.isEqualTo(!0),l.isContinuousModeOn.isEqualTo(s))},{id:a.CommandPalette,when:l.supportsContinuousRun.isEqualTo(!0)}];class dt extends I{constructor(){super({id:u.StopContinousRun,title:c("testing.stopContinuous","Stop Continuous Run"),category:m,icon:b.testingTurnContinuousRunOff,menu:Ce(!0)})}run(t){t.get(K).stop()}}function ve(s,t,e,o){const n=[];for(const{controller:C,profiles:x}of o)for(const F of x)F.supportsContinuousRun&&n.push({label:F.label||C?.label.get()||"",description:C?.label.get(),profile:F});if(n.length===0)return t.info(E("testing.noProfiles","No test continuous run-enabled profiles were found")),Promise.resolve([]);if(n.length===1)return Promise.resolve([n[0].profile]);const r=[],i=[],S=s.lastRunProfileIds;n.sort((C,x)=>C.profile.group-x.profile.group||C.profile.controllerId.localeCompare(x.profile.controllerId)||C.label.localeCompare(x.label));for(let C=0;C<n.length;C++){const x=n[C];(C===0||n[C-1].profile.group!==x.profile.group)&&r.push({type:"separator",label:Qe[x.profile.group]}),r.push(x),S.has(x.profile.profileId)&&i.push(x)}const w=new ke,g=w.add(e.createQuickPick({useSeparators:!0}));return g.title=E("testing.selectContinuousProfiles","Select profiles to run when files change:"),g.canSelectMany=!0,g.items=r,g.selectedItems=i,g.show(),new Promise(C=>{w.add(g.onDidAccept(()=>{C(g.selectedItems.map(x=>x.profile)),w.dispose()})),w.add(g.onDidHide(()=>{C([]),w.dispose()}))})}class gt extends I{constructor(){super({id:u.StartContinousRun,title:c("testing.startContinuous","Start Continuous Run"),category:m,icon:b.testingTurnContinuousRunOn,menu:Ce(!1)})}async run(t,...e){const o=t.get(K),n=await ve(o,t.get(M),t.get(le),t.get(V).all());n.length&&o.start(n)}}class Y extends P{constructor(e,o){super({...e,menu:[{id:a.ViewTitle,order:o===T.Run?11:o===T.Debug?12:13,group:"navigation",when:f.and(f.equals("view",R.ExplorerViewId),l.isRunning.isEqualTo(!1),l.capabilityToContextKey[o].isEqualTo(!0))}],category:m,viewId:R.ExplorerViewId});this.group=o}runInView(e,o){const{include:n,exclude:r}=o.getTreeIncludeExclude();return e.get(y).runTests({tests:n,exclude:r,group:this.group})}}class pt extends I{constructor(){super({id:u.GetSelectedProfiles,title:c("getSelectedProfiles","Get Selected Profiles")})}run(t){const e=t.get(V);return[...e.getGroupDefaultProfiles(T.Run),...e.getGroupDefaultProfiles(T.Debug),...e.getGroupDefaultProfiles(T.Coverage)].map(o=>({controllerId:o.controllerId,label:o.label,kind:o.group&T.Coverage?H.Coverage:o.group&T.Debug?H.Debug:H.Run}))}}class Tt extends P{constructor(){super({id:u.GetExplorerSelection,title:c("getExplorerSelection","Get Explorer Selection"),viewId:R.ExplorerViewId})}runInView(t,e){const{include:o,exclude:n}=e.getTreeIncludeExclude(void 0,void 0,"selected"),r=i=>i.item.extId;return{include:o.map(r),exclude:n.map(r)}}}class mt extends Y{constructor(){super({id:u.RunSelectedAction,title:Te,icon:b.testingRunAllIcon},T.Run)}}class ft extends Y{constructor(){super({id:u.DebugSelectedAction,title:me,icon:b.testingDebugAllIcon},T.Debug)}}class Ct extends Y{constructor(){super({id:u.CoverageSelectedAction,title:fe,icon:b.testingCoverageAllIcon},T.Coverage)}}const Ie=(s,t)=>s.withProgress({location:Oe.Window,title:E("discoveringTests","Discovering Tests")},()=>t);class X extends I{constructor(e,o,n){super({...e,category:m,menu:[{id:a.CommandPalette,when:l.capabilityToContextKey[o].isEqualTo(!0)}]});this.group=o;this.noTestsFoundError=n}async run(e){const o=e.get(y),n=e.get(M),r=[...o.collection.rootItems].filter(i=>i.children.size||i.expand===ge.Expandable||i.expand===ge.BusyExpanding);if(!r.length){n.info(this.noTestsFoundError);return}await o.runTests({tests:r,group:this.group})}}class vt extends X{constructor(){super({id:u.RunAllAction,title:c("runAllTests","Run All Tests"),icon:b.testingRunAllIcon,keybinding:{weight:h.WorkbenchContrib,primary:A(p.CtrlCmd|d.Semicolon,d.KeyA)}},T.Run,E("noTestProvider","No tests found in this workspace. You may need to install a test provider extension"))}}class It extends X{constructor(){super({id:u.DebugAllAction,title:c("debugAllTests","Debug All Tests"),icon:b.testingDebugIcon,keybinding:{weight:h.WorkbenchContrib,primary:A(p.CtrlCmd|d.Semicolon,p.CtrlCmd|d.KeyA)}},T.Debug,E("noDebugTestProvider","No debuggable tests found in this workspace. You may need to install a test provider extension"))}}class Rt extends X{constructor(){super({id:u.RunAllWithCoverageAction,title:c("runAllWithCoverage","Run All Tests with Coverage"),icon:b.testingCoverageIcon,keybinding:{weight:h.WorkbenchContrib,primary:A(p.CtrlCmd|d.Semicolon,p.CtrlCmd|p.Shift|d.KeyA)}},T.Coverage,E("noCoverageTestProvider","No tests with coverage runners found in this workspace. You may need to install a test provider extension"))}}class wt extends I{constructor(){super({id:u.CancelTestRunAction,title:c("testing.cancelRun","Cancel Test Run"),icon:b.testingCancelIcon,keybinding:{weight:h.WorkbenchContrib,primary:A(p.CtrlCmd|d.Semicolon,p.CtrlCmd|d.KeyX)},menu:[{id:a.ViewTitle,order:11,group:"navigation",when:f.and(f.equals("view",R.ExplorerViewId),f.equals(l.isRunning.serialize(),!0))}]})}async run(t,e,o){const n=t.get(q),r=t.get(y);if(e)r.cancelTestRun(e,o);else for(const i of n.results)i.completedAt||r.cancelTestRun(i.id)}}class xt extends P{constructor(){super({id:u.TestingViewAsListAction,viewId:R.ExplorerViewId,title:c("testing.viewAsList","View as List"),toggled:l.viewMode.isEqualTo(U.List),menu:{id:a.ViewTitle,order:18,group:"viewAs",when:f.equals("view",R.ExplorerViewId)}})}runInView(t,e){e.viewModel.viewMode=U.List}}class St extends P{constructor(){super({id:u.TestingViewAsTreeAction,viewId:R.ExplorerViewId,title:c("testing.viewAsTree","View as Tree"),toggled:l.viewMode.isEqualTo(U.Tree),menu:{id:a.ViewTitle,order:18,group:"viewAs",when:f.equals("view",R.ExplorerViewId)}})}runInView(t,e){e.viewModel.viewMode=U.Tree}}class ht extends P{constructor(){super({id:u.TestingSortByStatusAction,viewId:R.ExplorerViewId,title:c("testing.sortByStatus","Sort by Status"),toggled:l.viewSorting.isEqualTo(D.ByStatus),menu:{id:a.ViewTitle,order:19,group:"sortBy",when:f.equals("view",R.ExplorerViewId)}})}runInView(t,e){e.viewModel.viewSorting=D.ByStatus}}class bt extends P{constructor(){super({id:u.TestingSortByLocationAction,viewId:R.ExplorerViewId,title:c("testing.sortByLocation","Sort by Location"),toggled:l.viewSorting.isEqualTo(D.ByLocation),menu:{id:a.ViewTitle,order:19,group:"sortBy",when:f.equals("view",R.ExplorerViewId)}})}runInView(t,e){e.viewModel.viewSorting=D.ByLocation}}class At extends P{constructor(){super({id:u.TestingSortByDurationAction,viewId:R.ExplorerViewId,title:c("testing.sortByDuration","Sort by Duration"),toggled:l.viewSorting.isEqualTo(D.ByDuration),menu:{id:a.ViewTitle,order:19,group:"sortBy",when:f.equals("view",R.ExplorerViewId)}})}runInView(t,e){e.viewModel.viewSorting=D.ByDuration}}class yt extends I{constructor(){super({id:u.ShowMostRecentOutputAction,title:c("testing.showMostRecentOutput","Show Output"),category:m,icon:O.terminal,keybinding:{weight:h.WorkbenchContrib,primary:A(p.CtrlCmd|d.Semicolon,p.CtrlCmd|d.KeyO)},precondition:l.hasAnyResults.isEqualTo(!0),menu:[{id:a.ViewTitle,order:16,group:"navigation",when:f.equals("view",R.ExplorerViewId)},{id:a.CommandPalette,when:l.hasAnyResults.isEqualTo(!0)}]})}async run(t){(await t.get(ce).openView(R.ResultsViewId,!0))?.showLatestRun()}}class Et extends P{constructor(){super({id:u.CollapseAllAction,viewId:R.ExplorerViewId,title:c("testing.collapseAll","Collapse All Tests"),icon:O.collapseAll,menu:{id:a.ViewTitle,order:16,group:"displayAction",when:f.equals("view",R.ExplorerViewId)}})}runInView(t,e){e.viewModel.collapseAll()}}class Pt extends I{constructor(){super({id:u.ClearTestResultsAction,title:c("testing.clearResults","Clear All Results"),category:m,icon:O.clearAll,menu:[{id:a.TestPeekTitle},{id:a.CommandPalette,when:l.hasAnyResults.isEqualTo(!0)},{id:a.ViewTitle,order:17,group:"displayAction",when:f.equals("view",R.ExplorerViewId)},{id:a.ViewTitle,order:17,group:"navigation",when:f.equals("view",R.ResultsViewId)}]})}run(t){t.get(q).clear()}}class kt extends I{constructor(){super({id:u.GoToTest,title:c("testing.editFocusedTest","Go to Test"),icon:O.goToFile,menu:B(20,l.testItemHasUri.isEqualTo(!0)),keybinding:{weight:h.EditorContrib-10,when:Ge.isEqualTo(R.ExplorerViewId),primary:d.Enter|p.Alt}})}async run(t,e,o){e||(e=t.get(ce).getActiveViewWithId(R.ExplorerViewId)?.focusedTreeElements[0]),e&&e instanceof pe&&t.get(L).executeCommand("vscode.revealTest",e.test.item.extId,o)}}async function Re(s,t,e,o,n){let r=[],i,S=[],w;for await(const g of Je(s,t,e)){if(!g.item.range||n?.(g)===!1)continue;const C=N.lift(g.item.range);C.containsPosition(o)?i&&N.equalsRange(g.item.range,i)?r.some(x=>de.isChild(x.item.extId,g.item.extId))||r.push(g):(i=C,r=[g]):Ve.isBefore(C.getStartPosition(),o)&&(!w||w.getStartPosition().isBefore(C.getStartPosition())?(w=C,S=[g]):C.equalsRange(w)&&!S.some(x=>de.isChild(x.item.extId,g.item.extId))&&S.push(g))}return r.length?r:S}var Vt=(i=>(i[i.RunAtCursor=0]="RunAtCursor",i[i.DebugAtCursor=1]="DebugAtCursor",i[i.RunInFile=2]="RunInFile",i[i.DebugInFile=3]="DebugInFile",i[i.GoToRelated=4]="GoToRelated",i[i.PeekRelated=5]="PeekRelated",i))(Vt||{});class j extends I{constructor(e,o){super({...e,menu:[{id:a.CommandPalette,when:Q},{id:a.EditorContext,group:"testing",order:o===T.Run?0:1,when:f.and(l.activeEditorHasTests,l.capabilityToContextKey[o])}]});this.group=o}async run(e){const o=e.get(oe),n=e.get(Ke),r=n.activeEditorPane;let i=o.getActiveCodeEditor();if(!r||!i)return;i instanceof se&&(i=i.getParentEditor());const S=i?.getPosition(),w=i?.getModel();if(!S||!w||!("uri"in w))return;const g=e.get(y),C=e.get(V),x=e.get(_),F=e.get(G),v=e.get(Fe);_e(v,He.SaveBeforeTest)&&(await n.save({editor:r.input,groupId:r.group.id}),await g.syncTests());const ee=await Ie(F,Re(g,x,w.uri,S,ye=>!!(C.capabilitiesForTest(ye.item)&this.group)));if(ee.length){await g.runTests({group:this.group,tests:ee});return}const te=await g.getTestsRelatedToCode(w.uri,S);if(te.length){await g.runTests({group:this.group,tests:te});return}i&&ne.get(i)?.showMessage(E("noTestsAtCursor","No tests found here"),S)}}class Dt extends j{constructor(){super({id:u.RunAtCursor,title:c("testing.runAtCursor","Run Test at Cursor"),category:m,keybinding:{weight:h.WorkbenchContrib,when:k.editorTextFocus,primary:A(p.CtrlCmd|d.Semicolon,d.KeyC)}},T.Run)}}class qt extends j{constructor(){super({id:u.DebugAtCursor,title:c("testing.debugAtCursor","Debug Test at Cursor"),category:m,keybinding:{weight:h.WorkbenchContrib,when:k.editorTextFocus,primary:A(p.CtrlCmd|d.Semicolon,p.CtrlCmd|d.KeyC)}},T.Debug)}}class Ft extends j{constructor(){super({id:u.CoverageAtCursor,title:c("testing.coverageAtCursor","Run Test at Cursor with Coverage"),category:m,keybinding:{weight:h.WorkbenchContrib,when:k.editorTextFocus,primary:A(p.CtrlCmd|d.Semicolon,p.CtrlCmd|p.Shift|d.KeyC)}},T.Coverage)}}class J extends I{constructor(e,o){super({...e,menu:[{id:a.ExplorerContext,when:l.capabilityToContextKey[o].isEqualTo(!0),group:"6.5_testing",order:(o===T.Run?11:12)+.1}]});this.group=o}async run(e,o){const n=e.get(y),r=e.get(M),i=await Pe.asyncToArray(Ze(n,e.get(_),o));if(!i.length){r.notify({message:E("noTests","No tests found in the selected file or folder"),severity:Be.Info});return}return n.runTests({tests:i,group:this.group})}}class Mt extends J{constructor(){super({id:u.RunByUri,title:Te,category:m},T.Run)}}class Bt extends J{constructor(){super({id:u.DebugByUri,title:me,category:m},T.Debug)}}class Ot extends J{constructor(){super({id:u.CoverageByUri,title:fe,category:m},T.Coverage)}}class Z extends I{constructor(e,o){super({...e,menu:[{id:a.CommandPalette,when:l.capabilityToContextKey[o].isEqualTo(!0)},{id:a.EditorContext,group:"testing",order:o===T.Run?2:3,when:f.and(l.activeEditorHasTests,l.capabilityToContextKey[o])}]});this.group=o}run(e){let o=e.get(oe).getActiveCodeEditor();if(!o)return;o instanceof se&&(o=o.getParentEditor());const n=o?.getPosition(),r=o?.getModel();if(!n||!r||!("uri"in r))return;const i=e.get(y),S=r.uri.toString(),w=[i.collection.rootIds],g=[];for(;w.length;)for(const C of w.pop()){const x=i.collection.getNodeById(C);x.item.uri?.toString()===S?g.push(x):w.push(x.children)}if(g.length)return i.runTests({tests:g,group:this.group});o&&ne.get(o)?.showMessage(E("noTestsInFile","No tests found in this file"),n)}}class Lt extends Z{constructor(){super({id:u.RunCurrentFile,title:c("testing.runCurrentFile","Run Tests in Current File"),category:m,keybinding:{weight:h.WorkbenchContrib,when:k.editorTextFocus,primary:A(p.CtrlCmd|d.Semicolon,d.KeyF)}},T.Run)}}class Gt extends Z{constructor(){super({id:u.DebugCurrentFile,title:c("testing.debugCurrentFile","Debug Tests in Current File"),category:m,keybinding:{weight:h.WorkbenchContrib,when:k.editorTextFocus,primary:A(p.CtrlCmd|d.Semicolon,p.CtrlCmd|d.KeyF)}},T.Debug)}}class Ut extends Z{constructor(){super({id:u.CoverageCurrentFile,title:c("testing.coverageCurrentFile","Run Tests with Coverage in Current File"),category:m,keybinding:{weight:h.WorkbenchContrib,when:k.editorTextFocus,primary:A(p.CtrlCmd|d.Semicolon,p.CtrlCmd|p.Shift|d.KeyF)}},T.Coverage)}}const we=async(s,t,e,o)=>{const n=Promise.all(e.map(i=>je(s,i))),r=(await Ie(t,n)).filter(W);return r.length?await o(r):void 0};class Kt extends I{async run(t,...e){const o=t.get(y);await we(t.get(y).collection,t.get(G),[...this.getTestExtIdsToRun(t,...e)],n=>this.runTest(o,n))}}class xe extends Kt{constructor(t){super({...t,menu:{id:a.CommandPalette,when:Q}})}getTestExtIdsToRun(t){const{results:e}=t.get(q),o=new Set;for(let n=e.length-1;n>=0;n--){const r=e[n];for(const i of r.tests)Ye(i.ownComputedState)?o.add(i.item.extId):o.delete(i.item.extId)}return o}}class $ extends I{constructor(t){super({...t,menu:{id:a.CommandPalette,when:f.and(Q,l.hasAnyResults.isEqualTo(!0))}})}getLastTestRunRequest(t,e){const o=t.get(q);return(e?o.results.find(r=>r.id===e):o.results[0])?.request}async run(t,e){const o=t.get(q),n=e?o.results.find(g=>g.id===e):o.results[0];if(!n)return;const r=n.request,i=t.get(y),S=t.get(V),w=g=>S.getControllerProfiles(g.controllerId).some(C=>C.profileId===g.profileId);await we(i.collection,t.get(G),r.targets.flatMap(g=>g.testIds),g=>this.getGroup()&r.group&&r.targets.every(w)?i.runResolvedTests({targets:r.targets,group:r.group,exclude:r.exclude}):i.runTests({tests:g,group:this.getGroup()}))}}class Wt extends xe{constructor(){super({id:u.ReRunFailedTests,title:c("testing.reRunFailTests","Rerun Failed Tests"),category:m,keybinding:{weight:h.WorkbenchContrib,primary:A(p.CtrlCmd|d.Semicolon,d.KeyE)}})}runTest(t,e){return t.runTests({group:T.Run,tests:e})}}class Nt extends xe{constructor(){super({id:u.DebugFailedTests,title:c("testing.debugFailTests","Debug Failed Tests"),category:m,keybinding:{weight:h.WorkbenchContrib,primary:A(p.CtrlCmd|d.Semicolon,p.CtrlCmd|d.KeyE)}})}runTest(t,e){return t.runTests({group:T.Debug,tests:e})}}class _t extends ${constructor(){super({id:u.ReRunLastRun,title:c("testing.reRunLastRun","Rerun Last Run"),category:m,keybinding:{weight:h.WorkbenchContrib,primary:A(p.CtrlCmd|d.Semicolon,d.KeyL)}})}getGroup(){return T.Run}}class Ht extends ${constructor(){super({id:u.DebugLastRun,title:c("testing.debugLastRun","Debug Last Run"),category:m,keybinding:{weight:h.WorkbenchContrib,primary:A(p.CtrlCmd|d.Semicolon,p.CtrlCmd|d.KeyL)}})}getGroup(){return T.Debug}}class Qt extends ${constructor(){super({id:u.CoverageLastRun,title:c("testing.coverageLastRun","Rerun Last Run with Coverage"),category:m,keybinding:{weight:h.WorkbenchContrib,primary:A(p.CtrlCmd|d.Semicolon,p.CtrlCmd|p.Shift|d.KeyL)}})}getGroup(){return T.Coverage}}class zt extends I{constructor(){super({id:u.SearchForTestExtension,title:c("testing.searchForTestExtension","Search for Test Extension")})}async run(t){const o=(await t.get(We).openPaneComposite(Ne,Ue.Sidebar,!0))?.getViewPaneContainer();o.search('@category:"testing"'),o.focus()}}class Yt extends I{constructor(){super({id:u.OpenOutputPeek,title:c("testing.openOutputPeek","Peek Output"),category:m,keybinding:{weight:h.WorkbenchContrib,primary:A(p.CtrlCmd|d.Semicolon,p.CtrlCmd|d.KeyM)},menu:{id:a.CommandPalette,when:l.hasAnyResults.isEqualTo(!0)}})}async run(t){t.get(ze).open()}}class Xt extends I{constructor(){super({id:u.ToggleInlineTestOutput,title:c("testing.toggleInlineTestOutput","Toggle Inline Test Output"),category:m,keybinding:{weight:h.WorkbenchContrib,primary:A(p.CtrlCmd|d.Semicolon,p.CtrlCmd|d.KeyI)},menu:{id:a.CommandPalette,when:l.hasAnyResults.isEqualTo(!0)}})}async run(t){const e=t.get(y);e.showInlineOutput.value=!e.showInlineOutput.value}}const Se=s=>[{id:a.TestItem,group:"inline",order:10,when:f.and(l.canRefreshTests.isEqualTo(!0),l.isRefreshingTests.isEqualTo(s))},{id:a.ViewTitle,group:"navigation",order:10,when:f.and(f.equals("view",R.ExplorerViewId),l.canRefreshTests.isEqualTo(!0),l.isRefreshingTests.isEqualTo(s))},{id:a.CommandPalette,when:l.canRefreshTests.isEqualTo(!0)}];class jt extends I{constructor(){super({id:u.RefreshTestsAction,title:c("testing.refreshTests","Refresh Tests"),category:m,icon:b.testingRefreshTests,keybinding:{weight:h.WorkbenchContrib,primary:A(p.CtrlCmd|d.Semicolon,p.CtrlCmd|d.KeyR),when:l.canRefreshTests.isEqualTo(!0)},menu:Se(!1)})}async run(t,...e){const o=t.get(y),n=t.get(G),r=Ee(e.filter(W).map(i=>i.test.controllerId));return n.withProgress({location:R.ViewletId},async()=>{r.length?await Promise.all(r.map(i=>o.refreshTests(i))):await o.refreshTests()})}}class Jt extends I{constructor(){super({id:u.CancelTestRefreshAction,title:c("testing.cancelTestRefresh","Cancel Test Refresh"),category:m,icon:b.testingCancelRefreshTests,menu:Se(!0)})}async run(t){t.get(y).cancelRefreshTests()}}class Zt extends I{constructor(){super({id:u.CoverageClear,title:c("testing.clearCoverage","Clear Coverage"),icon:Le,category:m,menu:[{id:a.ViewTitle,group:"navigation",order:10,when:f.equals("view",R.CoverageViewId)},{id:a.CommandPalette,when:l.isTestCoverageOpen.isEqualTo(!0)}]})}run(t){t.get(ae).closeCoverage()}}class $t extends I{constructor(){super({id:u.OpenCoverage,title:c("testing.openCoverage","Open Coverage"),category:m,menu:[{id:a.CommandPalette,when:l.hasAnyResults.isEqualTo(!0)}]})}run(t){const e=t.get(q).results,o=e.length&&e[0].tasks.find(n=>n.coverage);if(!o){t.get(M).info(E("testing.noCoverage","No coverage information available on the last test run."));return}t.get(ae).openCoverage(o,!0)}}class he extends De{testService;uriIdentityService;runEditorCommand(t,e,...o){return this.testService=t.get(y),this.uriIdentityService=t.get(_),super.runEditorCommand(t,e,...o)}_getAlternativeCommand(t){return t.getOption(re.gotoLocation).alternativeTestsCommand}_getGoToPreference(t){return t.getOption(re.gotoLocation).multipleTests||"peek"}}class be extends he{async _getLocationModel(t,e,o,n){const r=await this.testService.getTestsRelatedToCode(e.uri,o,n);return new ie(r.map(i=>i.item.uri&&{uri:i.item.uri,range:i.item.range||new N(1,1,1,1)}).filter(W),E("relatedTests","Related Tests"))}_getNoResultFoundMessage(){return E("noTestFound","No related tests found.")}}class eo extends be{constructor(){super({openToSide:!1,openInPeek:!1,muteMessage:!1},{id:u.GoToRelatedTest,title:c("testing.goToRelatedTest","Go to Related Test"),category:m,precondition:f.and(f.not(l.activeEditorHasTests.key),l.canGoToRelatedTest),menu:[{id:a.EditorContext,group:"testing",order:4}]})}}class to extends be{constructor(){super({openToSide:!1,openInPeek:!0,muteMessage:!1},{id:u.PeekRelatedTest,title:c("testing.peekToRelatedTest","Peek Related Test"),category:m,precondition:f.and(l.canGoToRelatedTest,f.not(l.activeEditorHasTests.key),ue.notInPeekEditor,k.isInEmbeddedEditor.toNegated()),menu:[{id:a.EditorContext,group:"testing",order:5}]})}}class Ae extends he{async _getLocationModel(t,e,o,n){const r=await Re(this.testService,this.uriIdentityService,e.uri,o),i=await Promise.all(r.map(S=>this.testService.getCodeRelatedToTest(S)));return new ie(i.flat(),E("relatedCode","Related Code"))}_getNoResultFoundMessage(){return E("noRelatedCode","No related code found.")}}class oo extends Ae{constructor(){super({openToSide:!1,openInPeek:!1,muteMessage:!1},{id:u.GoToRelatedCode,title:c("testing.goToRelatedCode","Go to Related Code"),category:m,precondition:f.and(l.activeEditorHasTests,l.canGoToRelatedCode),menu:[{id:a.EditorContext,group:"testing",order:4}]})}}class so extends Ae{constructor(){super({openToSide:!1,openInPeek:!0,muteMessage:!1},{id:u.PeekRelatedCode,title:c("testing.peekToRelatedCode","Peek Related Code"),category:m,precondition:f.and(l.activeEditorHasTests,l.canGoToRelatedCode,ue.notInPeekEditor,k.isInEmbeddedEditor.toNegated()),menu:[{id:a.EditorContext,group:"testing",order:5}]})}}const Es=[Jt,wt,Zt,Pt,Et,at,lt,ct,rt,Rt,Ft,Ut,Qt,Ct,Ot,st,It,qt,Gt,Nt,Ht,ft,Bt,Tt,pt,oo,eo,kt,et,$t,Yt,so,to,jt,Wt,_t,nt,vt,Dt,Lt,mt,Mt,it,zt,ut,yt,gt,dt,At,bt,ht,xt,St,Xt,ot,tt];export{Jt as CancelTestRefreshAction,wt as CancelTestRunAction,Pt as ClearTestResultsAction,Zt as CleareCoverage,Et as CollapseAllAction,at as ConfigureTestProfilesAction,lt as ContinuousRunTestAction,ct as ContinuousRunUsingProfileTestAction,rt as CoverageAction,Rt as CoverageAllAction,Ft as CoverageAtCursor,Ut as CoverageCurrentFile,Qt as CoverageLastRun,Ct as CoverageSelectedAction,st as DebugAction,It as DebugAllAction,qt as DebugAtCursor,Gt as DebugCurrentFile,Nt as DebugFailedTests,Ht as DebugLastRun,ft as DebugSelectedAction,Tt as GetExplorerSelection,pt as GetSelectedProfiles,kt as GoToTest,et as HideTestAction,$t as OpenCoverage,Yt as OpenOutputPeek,Wt as ReRunFailedTests,_t as ReRunLastRun,jt as RefreshTestsAction,nt as RunAction,vt as RunAllAction,Dt as RunAtCursor,Lt as RunCurrentFile,mt as RunSelectedAction,it as RunUsingProfileAction,zt as SearchForTestExtension,ut as SelectDefaultTestProfiles,yt as ShowMostRecentOutputAction,At as TestingSortByDurationAction,bt as TestingSortByLocationAction,ht as TestingSortByStatusAction,xt as TestingViewAsListAction,St as TestingViewAsTreeAction,Xt as ToggleInlineTestOutput,ot as UnhideAllTestsAction,tt as UnhideTestAction,Es as allTestActions,we as discoverAndRunTests};
