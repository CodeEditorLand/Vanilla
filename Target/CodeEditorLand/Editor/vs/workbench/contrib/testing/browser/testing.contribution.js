import {
  EditorContributionInstantiation,
  registerEditorContribution
} from "../../../../editor/browser/editorExtensions.js";
import { localize, localize2 } from "../../../../nls.js";
import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import {
  CommandsRegistry,
  ICommandService
} from "../../../../platform/commands/common/commands.js";
import {
  Extensions as ConfigurationExtensions
} from "../../../../platform/configuration/common/configurationRegistry.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { ViewPaneContainer } from "../../../browser/parts/views/viewPaneContainer.js";
import {
  Extensions as WorkbenchExtensions
} from "../../../common/contributions.js";
import {
  Extensions as ViewContainerExtensions,
  ViewContainerLocation
} from "../../../common/views.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { REVEAL_IN_EXPLORER_COMMAND_ID } from "../../files/browser/fileConstants.js";
import { testingConfiguration } from "../common/configuration.js";
import { TestCommandId, Testing } from "../common/constants.js";
import {
  ITestCoverageService,
  TestCoverageService
} from "../common/testCoverageService.js";
import {
  ITestExplorerFilterState,
  TestExplorerFilterState
} from "../common/testExplorerFilterState.js";
import { TestId, TestPosition } from "../common/testId.js";
import { TestingContentProvider } from "../common/testingContentProvider.js";
import { TestingContextKeys } from "../common/testingContextKeys.js";
import {
  ITestingContinuousRunService,
  TestingContinuousRunService
} from "../common/testingContinuousRunService.js";
import { ITestingDecorationsService } from "../common/testingDecorations.js";
import { ITestingPeekOpener } from "../common/testingPeekOpener.js";
import {
  ITestProfileService,
  TestProfileService
} from "../common/testProfileService.js";
import {
  ITestResultService,
  TestResultService
} from "../common/testResultService.js";
import {
  ITestResultStorage,
  TestResultStorage
} from "../common/testResultStorage.js";
import { ITestService } from "../common/testService.js";
import { TestService } from "../common/testServiceImpl.js";
import { CodeCoverageDecorations } from "./codeCoverageDecorations.js";
import { testingResultsIcon, testingViewIcon } from "./icons.js";
import { TestCoverageView } from "./testCoverageView.js";
import { allTestActions, discoverAndRunTests } from "./testExplorerActions.js";
import {
  TestingDecorations,
  TestingDecorationService
} from "./testingDecorations.js";
import { TestingExplorerView } from "./testingExplorerView.js";
import {
  CloseTestPeek,
  CollapsePeekStack,
  GoToNextMessageAction,
  GoToPreviousMessageAction,
  OpenMessageInEditorAction,
  TestingOutputPeekController,
  TestingPeekOpener,
  TestResultsView,
  ToggleTestingPeekHistory
} from "./testingOutputPeek.js";
import { TestingProgressTrigger } from "./testingProgressUiService.js";
import { TestingViewPaneContainer } from "./testingViewPaneContainer.js";
import "./testingConfigurationUi.js";
registerSingleton(ITestService, TestService, InstantiationType.Delayed);
registerSingleton(
  ITestResultStorage,
  TestResultStorage,
  InstantiationType.Delayed
);
registerSingleton(
  ITestProfileService,
  TestProfileService,
  InstantiationType.Delayed
);
registerSingleton(
  ITestCoverageService,
  TestCoverageService,
  InstantiationType.Delayed
);
registerSingleton(
  ITestingContinuousRunService,
  TestingContinuousRunService,
  InstantiationType.Delayed
);
registerSingleton(
  ITestResultService,
  TestResultService,
  InstantiationType.Delayed
);
registerSingleton(
  ITestExplorerFilterState,
  TestExplorerFilterState,
  InstantiationType.Delayed
);
registerSingleton(
  ITestingPeekOpener,
  TestingPeekOpener,
  InstantiationType.Delayed
);
registerSingleton(
  ITestingDecorationsService,
  TestingDecorationService,
  InstantiationType.Delayed
);
const viewContainer = Registry.as(
  ViewContainerExtensions.ViewContainersRegistry
).registerViewContainer(
  {
    id: Testing.ViewletId,
    title: localize2("test", "Testing"),
    ctorDescriptor: new SyncDescriptor(TestingViewPaneContainer),
    icon: testingViewIcon,
    alwaysUseContainerInfo: true,
    order: 6,
    openCommandActionDescriptor: {
      id: Testing.ViewletId,
      mnemonicTitle: localize(
        { key: "miViewTesting", comment: ["&& denotes a mnemonic"] },
        "T&&esting"
      ),
      // todo: coordinate with joh whether this is available
      // keybindings: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.US_SEMICOLON },
      order: 4
    },
    hideIfEmpty: true
  },
  ViewContainerLocation.Sidebar
);
const testResultsViewContainer = Registry.as(
  ViewContainerExtensions.ViewContainersRegistry
).registerViewContainer(
  {
    id: Testing.ResultsPanelId,
    title: localize2("testResultsPanelName", "Test Results"),
    icon: testingResultsIcon,
    ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [
      Testing.ResultsPanelId,
      { mergeViewWithContainerWhenSingleView: true }
    ]),
    hideIfEmpty: true,
    order: 3
  },
  ViewContainerLocation.Panel,
  { doNotRegisterOpenCommand: true }
);
const viewsRegistry = Registry.as(
  ViewContainerExtensions.ViewsRegistry
);
viewsRegistry.registerViews(
  [
    {
      id: Testing.ResultsViewId,
      name: localize2("testResultsPanelName", "Test Results"),
      containerIcon: testingResultsIcon,
      canToggleVisibility: false,
      canMoveView: true,
      when: TestingContextKeys.hasAnyResults.isEqualTo(true),
      ctorDescriptor: new SyncDescriptor(TestResultsView)
    }
  ],
  testResultsViewContainer
);
viewsRegistry.registerViewWelcomeContent(Testing.ExplorerViewId, {
  content: localize(
    "noTestProvidersRegistered",
    "No tests have been found in this workspace yet."
  )
});
viewsRegistry.registerViewWelcomeContent(Testing.ExplorerViewId, {
  content: "[" + localize(
    "searchForAdditionalTestExtensions",
    "Install Additional Test Extensions..."
  ) + `](command:${TestCommandId.SearchForTestExtension})`,
  order: 10
});
viewsRegistry.registerViews(
  [
    {
      id: Testing.ExplorerViewId,
      name: localize2("testExplorer", "Test Explorer"),
      ctorDescriptor: new SyncDescriptor(TestingExplorerView),
      canToggleVisibility: true,
      canMoveView: true,
      weight: 80,
      order: -999,
      containerIcon: testingViewIcon,
      when: ContextKeyExpr.greater(
        TestingContextKeys.providerCount.key,
        0
      )
    },
    {
      id: Testing.CoverageViewId,
      name: localize2("testCoverage", "Test Coverage"),
      ctorDescriptor: new SyncDescriptor(TestCoverageView),
      canToggleVisibility: true,
      canMoveView: true,
      weight: 80,
      order: -998,
      containerIcon: testingViewIcon,
      when: TestingContextKeys.isTestCoverageOpen
    }
  ],
  viewContainer
);
allTestActions.forEach(registerAction2);
registerAction2(OpenMessageInEditorAction);
registerAction2(GoToPreviousMessageAction);
registerAction2(GoToNextMessageAction);
registerAction2(CloseTestPeek);
registerAction2(ToggleTestingPeekHistory);
registerAction2(CollapsePeekStack);
Registry.as(
  WorkbenchExtensions.Workbench
).registerWorkbenchContribution(
  TestingContentProvider,
  LifecyclePhase.Restored
);
Registry.as(
  WorkbenchExtensions.Workbench
).registerWorkbenchContribution(TestingPeekOpener, LifecyclePhase.Eventually);
Registry.as(
  WorkbenchExtensions.Workbench
).registerWorkbenchContribution(
  TestingProgressTrigger,
  LifecyclePhase.Eventually
);
registerEditorContribution(
  Testing.OutputPeekContributionId,
  TestingOutputPeekController,
  EditorContributionInstantiation.AfterFirstRender
);
registerEditorContribution(
  Testing.DecorationsContributionId,
  TestingDecorations,
  EditorContributionInstantiation.AfterFirstRender
);
registerEditorContribution(
  Testing.CoverageDecorationsContributionId,
  CodeCoverageDecorations,
  EditorContributionInstantiation.Eventually
);
CommandsRegistry.registerCommand({
  id: "_revealTestInExplorer",
  handler: async (accessor, testId, focus) => {
    accessor.get(ITestExplorerFilterState).reveal.value = typeof testId === "string" ? testId : testId.extId;
    accessor.get(IViewsService).openView(Testing.ExplorerViewId, focus);
  }
});
CommandsRegistry.registerCommand({
  id: "vscode.peekTestError",
  handler: async (accessor, extId) => {
    const lookup = accessor.get(ITestResultService).getStateById(extId);
    if (!lookup) {
      return false;
    }
    const [result, ownState] = lookup;
    const opener = accessor.get(ITestingPeekOpener);
    if (opener.tryPeekFirstError(result, ownState)) {
      return true;
    }
    for (const test of result.tests) {
      if (TestId.compare(ownState.item.extId, test.item.extId) === TestPosition.IsChild && opener.tryPeekFirstError(result, test)) {
        return true;
      }
    }
    return false;
  }
});
CommandsRegistry.registerCommand({
  id: "vscode.revealTest",
  handler: async (accessor, extId) => {
    const test = accessor.get(ITestService).collection.getNodeById(extId);
    if (!test) {
      return;
    }
    const commandService = accessor.get(ICommandService);
    const fileService = accessor.get(IFileService);
    const openerService = accessor.get(IOpenerService);
    const { range, uri } = test.item;
    if (!uri) {
      return;
    }
    const position = accessor.get(ITestingDecorationsService).getDecoratedTestPosition(uri, extId) || range?.getStartPosition();
    accessor.get(ITestExplorerFilterState).reveal.value = extId;
    accessor.get(ITestingPeekOpener).closeAllPeeks();
    let isFile = true;
    try {
      if (!(await fileService.stat(uri)).isFile) {
        isFile = false;
      }
    } catch {
    }
    if (!isFile) {
      await commandService.executeCommand(
        REVEAL_IN_EXPLORER_COMMAND_ID,
        uri
      );
      return;
    }
    await openerService.open(
      position ? uri.with({
        fragment: `L${position.lineNumber}:${position.column}`
      }) : uri
    );
  }
});
CommandsRegistry.registerCommand({
  id: "vscode.runTestsById",
  handler: async (accessor, group, ...testIds) => {
    const testService = accessor.get(ITestService);
    await discoverAndRunTests(
      accessor.get(ITestService).collection,
      accessor.get(IProgressService),
      testIds,
      (tests) => testService.runTests({ group, tests })
    );
  }
});
Registry.as(
  ConfigurationExtensions.Configuration
).registerConfiguration(testingConfiguration);
