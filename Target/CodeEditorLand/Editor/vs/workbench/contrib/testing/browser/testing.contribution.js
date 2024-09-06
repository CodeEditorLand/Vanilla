import{EditorContributionInstantiation as w,registerEditorContribution as v}from"../../../../editor/browser/editorExtensions.js";import{localize as y,localize2 as l}from"../../../../nls.js";import{registerAction2 as a}from"../../../../platform/actions/common/actions.js";import{CommandsRegistry as f,ICommandService as O}from"../../../../platform/commands/common/commands.js";import{Extensions as N}from"../../../../platform/configuration/common/configurationRegistry.js";import{ContextKeyExpr as M}from"../../../../platform/contextkey/common/contextkey.js";import{IFileService as B}from"../../../../platform/files/common/files.js";import{SyncDescriptor as d}from"../../../../platform/instantiation/common/descriptors.js";import{InstantiationType as o,registerSingleton as n}from"../../../../platform/instantiation/common/extensions.js";import"../../../../platform/instantiation/common/instantiation.js";import{IOpenerService as L}from"../../../../platform/opener/common/opener.js";import{IProgressService as _}from"../../../../platform/progress/common/progress.js";import{Registry as m}from"../../../../platform/registry/common/platform.js";import{ViewPaneContainer as $}from"../../../browser/parts/views/viewPaneContainer.js";import{Extensions as R}from"../../../common/contributions.js";import{Extensions as V,ViewContainerLocation as x}from"../../../common/views.js";import{REVEAL_IN_EXPLORER_COMMAND_ID as z}from"../../files/browser/fileConstants.js";import{CodeCoverageDecorations as G}from"./codeCoverageDecorations.js";import{testingResultsIcon as D,testingViewIcon as S}from"./icons.js";import{TestCoverageView as K}from"./testCoverageView.js";import{TestingDecorationService as q,TestingDecorations as H}from"./testingDecorations.js";import{TestingExplorerView as U}from"./testingExplorerView.js";import{CloseTestPeek as X,CollapsePeekStack as j,GoToNextMessageAction as J,GoToPreviousMessageAction as Q,OpenMessageInEditorAction as Y,TestResultsView as Z,TestingOutputPeekController as ee,TestingPeekOpener as A,ToggleTestingPeekHistory as te}from"./testingOutputPeek.js";import{TestingProgressTrigger as re}from"./testingProgressUiService.js";import{TestingViewPaneContainer as ie}from"./testingViewPaneContainer.js";import{testingConfiguration as oe}from"../common/configuration.js";import{TestCommandId as ne,Testing as t}from"../common/constants.js";import{ITestCoverageService as se,TestCoverageService as ae}from"../common/testCoverageService.js";import{ITestExplorerFilterState as E,TestExplorerFilterState as me}from"../common/testExplorerFilterState.js";import{TestId as ce,TestPosition as ge}from"../common/testId.js";import{ITestProfileService as le,TestProfileService as de}from"../common/testProfileService.js";import{ITestResultService as W,TestResultService as pe}from"../common/testResultService.js";import{ITestResultStorage as ue,TestResultStorage as fe}from"../common/testResultStorage.js";import{ITestService as T}from"../common/testService.js";import{TestService as Te}from"../common/testServiceImpl.js";import"../common/testTypes.js";import{TestingContentProvider as Ce}from"../common/testingContentProvider.js";import{TestingContextKeys as h}from"../common/testingContextKeys.js";import{ITestingContinuousRunService as Ie,TestingContinuousRunService as we}from"../common/testingContinuousRunService.js";import{ITestingDecorationsService as F}from"../common/testingDecorations.js";import{ITestingPeekOpener as P}from"../common/testingPeekOpener.js";import{LifecyclePhase as b}from"../../../services/lifecycle/common/lifecycle.js";import{IViewsService as ve}from"../../../services/views/common/viewsService.js";import{allTestActions as ye,discoverAndRunTests as Re}from"./testExplorerActions.js";import"./testingConfigurationUi.js";n(T,Te,o.Delayed),n(ue,fe,o.Delayed),n(le,de,o.Delayed),n(se,ae,o.Delayed),n(Ie,we,o.Delayed),n(W,pe,o.Delayed),n(E,me,o.Delayed),n(P,A,o.Delayed),n(F,q,o.Delayed);const Ve=m.as(V.ViewContainersRegistry).registerViewContainer({id:t.ViewletId,title:l("test","Testing"),ctorDescriptor:new d(ie),icon:S,alwaysUseContainerInfo:!0,order:6,openCommandActionDescriptor:{id:t.ViewletId,mnemonicTitle:y({key:"miViewTesting",comment:["&& denotes a mnemonic"]},"T&&esting"),order:4},hideIfEmpty:!0},x.Sidebar),Se=m.as(V.ViewContainersRegistry).registerViewContainer({id:t.ResultsPanelId,title:l("testResultsPanelName","Test Results"),icon:D,ctorDescriptor:new d($,[t.ResultsPanelId,{mergeViewWithContainerWhenSingleView:!0}]),hideIfEmpty:!0,order:3},x.Panel,{doNotRegisterOpenCommand:!0}),C=m.as(V.ViewsRegistry);C.registerViews([{id:t.ResultsViewId,name:l("testResultsPanelName","Test Results"),containerIcon:D,canToggleVisibility:!1,canMoveView:!0,when:h.hasAnyResults.isEqualTo(!0),ctorDescriptor:new d(Z)}],Se),C.registerViewWelcomeContent(t.ExplorerViewId,{content:y("noTestProvidersRegistered","No tests have been found in this workspace yet.")}),C.registerViewWelcomeContent(t.ExplorerViewId,{content:"["+y("searchForAdditionalTestExtensions","Install Additional Test Extensions...")+`](command:${ne.SearchForTestExtension})`,order:10}),C.registerViews([{id:t.ExplorerViewId,name:l("testExplorer","Test Explorer"),ctorDescriptor:new d(U),canToggleVisibility:!0,canMoveView:!0,weight:80,order:-999,containerIcon:S,when:M.greater(h.providerCount.key,0)},{id:t.CoverageViewId,name:l("testCoverage","Test Coverage"),ctorDescriptor:new d(K),canToggleVisibility:!0,canMoveView:!0,weight:80,order:-998,containerIcon:S,when:h.isTestCoverageOpen}],Ve),ye.forEach(a),a(Y),a(Q),a(J),a(X),a(te),a(j),m.as(R.Workbench).registerWorkbenchContribution(Ce,b.Restored),m.as(R.Workbench).registerWorkbenchContribution(A,b.Eventually),m.as(R.Workbench).registerWorkbenchContribution(re,b.Eventually),v(t.OutputPeekContributionId,ee,w.AfterFirstRender),v(t.DecorationsContributionId,H,w.AfterFirstRender),v(t.CoverageDecorationsContributionId,G,w.Eventually),f.registerCommand({id:"_revealTestInExplorer",handler:async(e,r,i)=>{e.get(E).reveal.value=typeof r=="string"?r:r.extId,e.get(ve).openView(t.ExplorerViewId,i)}}),f.registerCommand({id:"vscode.peekTestError",handler:async(e,r)=>{const i=e.get(W).getStateById(r);if(!i)return!1;const[s,c]=i,p=e.get(P);if(p.tryPeekFirstError(s,c))return!0;for(const u of s.tests)if(ce.compare(c.item.extId,u.item.extId)===ge.IsChild&&p.tryPeekFirstError(s,u))return!0;return!1}}),f.registerCommand({id:"vscode.revealTest",handler:async(e,r)=>{const i=e.get(T).collection.getNodeById(r);if(!i)return;const s=e.get(O),c=e.get(B),p=e.get(L),{range:u,uri:g}=i.item;if(!g)return;const I=e.get(F).getDecoratedTestPosition(g,r)||u?.getStartPosition();e.get(E).reveal.value=r,e.get(P).closeAllPeeks();let k=!0;try{(await c.stat(g)).isFile||(k=!1)}catch{}if(!k){await s.executeCommand(z,g);return}await p.open(I?g.with({fragment:`L${I.lineNumber}:${I.column}`}):g)}}),f.registerCommand({id:"vscode.runTestsById",handler:async(e,r,...i)=>{const s=e.get(T);await Re(e.get(T).collection,e.get(_),i,c=>s.runTests({group:r,tests:c}))}}),m.as(N.Configuration).registerConfiguration(oe);
