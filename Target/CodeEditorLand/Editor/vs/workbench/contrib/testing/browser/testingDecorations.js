var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as dom from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import {
  Action,
  Separator,
  SubmenuAction
} from "../../../../base/common/actions.js";
import { equals } from "../../../../base/common/arrays.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import {
  MarkdownString
} from "../../../../base/common/htmlContent.js";
import { stripIcons } from "../../../../base/common/iconLabels.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable
} from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { isMacintosh } from "../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Constants } from "../../../../base/common/uint.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import {
  ContentWidgetPositionPreference,
  MouseTargetType
} from "../../../../editor/browser/editorBrowser.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { EditorOption } from "../../../../editor/common/config/editorOptions.js";
import {
  overviewRulerError,
  overviewRulerInfo
} from "../../../../editor/common/core/editorColorRegistry.js";
import {
  GlyphMarginLane,
  OverviewRulerLane,
  TrackedRangeStickiness
} from "../../../../editor/common/model.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { localize } from "../../../../nls.js";
import { createAndFillInContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import {
  IMenuService,
  MenuId
} from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import {
  IQuickInputService
} from "../../../../platform/quickinput/common/quickInput.js";
import { themeColorFromId } from "../../../../platform/theme/common/themeService.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import {
  EditorLineNumberContextMenu,
  GutterActionsRegistry
} from "../../codeEditor/browser/editorLineNumberMenu.js";
import {
  DefaultGutterClickAction,
  TestingConfigKeys,
  getTestingConfiguration
} from "../common/configuration.js";
import { Testing, labelForTestInState } from "../common/constants.js";
import { TestId } from "../common/testId.js";
import { ITestProfileService } from "../common/testProfileService.js";
import { LiveTestResult } from "../common/testResult.js";
import { ITestResultService } from "../common/testResultService.js";
import {
  ITestService,
  getContextForTestItem,
  simplifyTestsToExecute,
  testsInFile
} from "../common/testService.js";
import {
  TestDiffOpType,
  TestMessageType,
  TestResultState,
  TestRunProfileBitset
} from "../common/testTypes.js";
import {
  ITestingDecorationsService,
  TestDecorations
} from "../common/testingDecorations.js";
import { ITestingPeekOpener } from "../common/testingPeekOpener.js";
import { isFailedState, maxPriority } from "../common/testingStates.js";
import {
  TestUriType,
  buildTestUri,
  parseTestUri
} from "../common/testingUri.js";
import { getTestItemContextOverlay } from "./explorerProjections/testItemContextOverlay.js";
import {
  testingDebugAllIcon,
  testingDebugIcon,
  testingRunAllIcon,
  testingRunIcon,
  testingStatesToIcons
} from "./icons.js";
import { renderTestMessageAsText } from "./testMessageColorizer.js";
const MAX_INLINE_MESSAGE_LENGTH = 128;
const MAX_TESTS_IN_SUBMENU = 30;
const GLYPH_MARGIN_LANE = GlyphMarginLane.Center;
function isOriginalInDiffEditor(codeEditorService, codeEditor) {
  const diffEditors = codeEditorService.listDiffEditors();
  for (const diffEditor of diffEditors) {
    if (diffEditor.getOriginalEditor() === codeEditor) {
      return true;
    }
  }
  return false;
}
class CachedDecorations {
  runByIdKey = /* @__PURE__ */ new Map();
  messages = /* @__PURE__ */ new Map();
  get size() {
    return this.runByIdKey.size + this.messages.size;
  }
  /** Gets a test run decoration that contains exactly the given test IDs */
  getForExactTests(testIds) {
    const key = testIds.sort().join("\0\0");
    return this.runByIdKey.get(key);
  }
  /** Gets the decoration that corresponds to the given test message */
  getMessage(message) {
    return this.messages.get(message);
  }
  /** Removes the decoration for the given test messsage */
  removeMessage(message) {
    this.messages.delete(message);
  }
  /** Adds a new test message decoration */
  addMessage(d) {
    this.messages.set(d.testMessage, d);
  }
  /** Adds a new test run decroation */
  addTest(d) {
    const key = d.testIds.sort().join("\0\0");
    this.runByIdKey.set(key, d);
  }
  /** Finds an extension by VS Code event ID */
  getById(decorationId) {
    for (const d of this.runByIdKey.values()) {
      if (d.id === decorationId) {
        return d;
      }
    }
    for (const d of this.messages.values()) {
      if (d.id === decorationId) {
        return d;
      }
    }
    return void 0;
  }
  /** Iterate over all decorations */
  *[Symbol.iterator]() {
    for (const d of this.runByIdKey.values()) {
      yield d;
    }
    for (const d of this.messages.values()) {
      yield d;
    }
  }
}
let TestingDecorationService = class extends Disposable {
  constructor(codeEditorService, configurationService, testService, results, instantiationService, modelService) {
    super();
    this.configurationService = configurationService;
    this.testService = testService;
    this.results = results;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
    codeEditorService.registerDecorationType("test-message-decoration", TestMessageDecoration.decorationId, {}, void 0);
    this._register(modelService.onModelRemoved((e) => this.decorationCache.delete(e.uri)));
    const debounceInvalidate = this._register(new RunOnceScheduler(() => this.invalidate(), 100));
    this._register(this.testService.onWillProcessDiff((diff) => {
      for (const entry of diff) {
        if (entry.op !== TestDiffOpType.DocumentSynced) {
          continue;
        }
        const rec = this.decorationCache.get(entry.uri);
        if (rec) {
          rec.rangeUpdateVersionId = entry.docv;
        }
      }
      if (!debounceInvalidate.isScheduled()) {
        debounceInvalidate.schedule();
      }
    }));
    this._register(Event.any(
      this.results.onResultsChanged,
      this.results.onTestChanged,
      this.testService.excluded.onTestExclusionsChanged,
      this.testService.showInlineOutput.onDidChange,
      Event.filter(configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration(TestingConfigKeys.GutterEnabled))
    )(() => {
      if (!debounceInvalidate.isScheduled()) {
        debounceInvalidate.schedule();
      }
    }));
    this._register(GutterActionsRegistry.registerGutterActionsGenerator((context, result) => {
      const model = context.editor.getModel();
      const testingDecorations = TestingDecorations.get(context.editor);
      if (!model || !testingDecorations?.currentUri) {
        return;
      }
      const currentDecorations = this.syncDecorations(testingDecorations.currentUri);
      if (!currentDecorations.size) {
        return;
      }
      const modelDecorations = model.getLinesDecorations(context.lineNumber, context.lineNumber);
      for (const { id } of modelDecorations) {
        const decoration = currentDecorations.getById(id);
        if (decoration) {
          const { object: actions } = decoration.getContextMenuActions();
          for (const action of actions) {
            result.push(action, "1_testing");
          }
        }
      }
    }));
  }
  generation = 0;
  changeEmitter = new Emitter();
  decorationCache = new ResourceMap();
  /**
   * List of messages that should be hidden because an editor changed their
   * underlying ranges. I think this is good enough, because:
   *  - Message decorations are never shown across reloads; this does not
   *    need to persist
   *  - Message instances are stable for any completed test results for
   *    the duration of the session.
   */
  invalidatedMessages = /* @__PURE__ */ new WeakSet();
  /** @inheritdoc */
  onDidChange = this.changeEmitter.event;
  /** @inheritdoc */
  invalidateResultMessage(message) {
    this.invalidatedMessages.add(message);
    this.invalidate();
  }
  /** @inheritdoc */
  syncDecorations(resource) {
    const model = this.modelService.getModel(resource);
    if (!model) {
      return new CachedDecorations();
    }
    const cached = this.decorationCache.get(resource);
    if (cached && cached.generation === this.generation && (cached.rangeUpdateVersionId === void 0 || cached.rangeUpdateVersionId !== model.getVersionId())) {
      return cached.value;
    }
    return this.applyDecorations(model);
  }
  /** @inheritdoc */
  getDecoratedTestPosition(resource, testId) {
    const model = this.modelService.getModel(resource);
    if (!model) {
      return void 0;
    }
    const decoration = Iterable.find(
      this.syncDecorations(resource),
      (v) => v instanceof RunTestDecoration && v.isForTest(testId)
    );
    if (!decoration) {
      return void 0;
    }
    return model.getDecorationRange(decoration.id)?.getStartPosition();
  }
  invalidate() {
    this.generation++;
    this.changeEmitter.fire();
  }
  /**
   * Sets whether alternate actions are shown for the model.
   */
  updateDecorationsAlternateAction(resource, isAlt) {
    const model = this.modelService.getModel(resource);
    const cached = this.decorationCache.get(resource);
    if (!model || !cached || cached.isAlt === isAlt) {
      return;
    }
    cached.isAlt = isAlt;
    model.changeDecorations((accessor) => {
      for (const decoration of cached.value) {
        if (decoration instanceof RunTestDecoration && decoration.editorDecoration.alternate) {
          accessor.changeDecorationOptions(
            decoration.id,
            isAlt ? decoration.editorDecoration.alternate : decoration.editorDecoration.options
          );
        }
      }
    });
  }
  /**
   * Applies the current set of test decorations to the given text model.
   */
  applyDecorations(model) {
    const gutterEnabled = getTestingConfiguration(
      this.configurationService,
      TestingConfigKeys.GutterEnabled
    );
    const uriStr = model.uri.toString();
    const cached = this.decorationCache.get(model.uri);
    const testRangesUpdated = cached?.rangeUpdateVersionId === model.getVersionId();
    const lastDecorations = cached?.value ?? new CachedDecorations();
    const newDecorations = model.changeDecorations((accessor) => {
      const newDecorations2 = new CachedDecorations();
      const runDecorations = new TestDecorations();
      for (const test of this.testService.collection.getNodeByUrl(
        model.uri
      )) {
        if (!test.item.range) {
          continue;
        }
        const stateLookup = this.results.getStateById(test.item.extId);
        const line = test.item.range.startLineNumber;
        runDecorations.push({
          line,
          id: "",
          test,
          resultItem: stateLookup?.[1]
        });
      }
      for (const [line, tests] of runDecorations.lines()) {
        const multi = tests.length > 1;
        let existing = lastDecorations.getForExactTests(
          tests.map((t) => t.test.item.extId)
        );
        if (existing && testRangesUpdated && model.getDecorationRange(existing.id)?.startLineNumber !== line) {
          existing = void 0;
        }
        if (existing) {
          if (existing.replaceOptions(tests, gutterEnabled)) {
            accessor.changeDecorationOptions(
              existing.id,
              existing.editorDecoration.options
            );
          }
          newDecorations2.addTest(existing);
        } else {
          newDecorations2.addTest(
            multi ? this.instantiationService.createInstance(
              MultiRunTestDecoration,
              tests,
              gutterEnabled,
              model
            ) : this.instantiationService.createInstance(
              RunSingleTestDecoration,
              tests[0].test,
              tests[0].resultItem,
              model,
              gutterEnabled
            )
          );
        }
      }
      const messageLines = /* @__PURE__ */ new Set();
      if (getTestingConfiguration(
        this.configurationService,
        TestingConfigKeys.ShowAllMessages
      )) {
        this.results.results.forEach(
          (lastResult) => this.applyDecorationsFromResult(
            lastResult,
            messageLines,
            uriStr,
            lastDecorations,
            model,
            newDecorations2
          )
        );
      } else {
        this.applyDecorationsFromResult(
          this.results.results[0],
          messageLines,
          uriStr,
          lastDecorations,
          model,
          newDecorations2
        );
      }
      const saveFromRemoval = /* @__PURE__ */ new Set();
      for (const decoration of newDecorations2) {
        if (decoration.id === "") {
          decoration.id = accessor.addDecoration(
            decoration.editorDecoration.range,
            decoration.editorDecoration.options
          );
        } else {
          saveFromRemoval.add(decoration.id);
        }
      }
      for (const decoration of lastDecorations) {
        if (!saveFromRemoval.has(decoration.id)) {
          accessor.removeDecoration(decoration.id);
        }
      }
      this.decorationCache.set(model.uri, {
        generation: this.generation,
        rangeUpdateVersionId: cached?.rangeUpdateVersionId,
        value: newDecorations2
      });
      return newDecorations2;
    });
    return newDecorations || lastDecorations;
  }
  applyDecorationsFromResult(lastResult, messageLines, uriStr, lastDecorations, model, newDecorations) {
    if (this.testService.showInlineOutput.value && lastResult instanceof LiveTestResult) {
      for (const task of lastResult.tasks) {
        for (const m of task.otherMessages) {
          if (!this.invalidatedMessages.has(m) && m.location?.uri.toString() === uriStr) {
            const decoration = lastDecorations.getMessage(m) || this.instantiationService.createInstance(
              TestMessageDecoration,
              m,
              void 0,
              model
            );
            newDecorations.addMessage(decoration);
          }
        }
      }
      for (const test of lastResult.tests) {
        for (let taskId = 0; taskId < test.tasks.length; taskId++) {
          const state = test.tasks[taskId];
          for (const kind of [
            TestMessageType.Error,
            TestMessageType.Output
          ]) {
            for (let i = 0; i < state.messages.length; i++) {
              const m = state.messages[i];
              if (m.type !== kind || this.invalidatedMessages.has(m) || m.location?.uri.toString() !== uriStr) {
                continue;
              }
              const line = m.location.range.startLineNumber;
              if (!messageLines.has(line)) {
                const decoration = lastDecorations.getMessage(m) || this.instantiationService.createInstance(
                  TestMessageDecoration,
                  m,
                  buildTestUri({
                    type: TestUriType.ResultActualOutput,
                    messageIndex: i,
                    taskIndex: taskId,
                    resultId: lastResult.id,
                    testExtId: test.item.extId
                  }),
                  model
                );
                newDecorations.addMessage(decoration);
                messageLines.add(line);
              }
            }
          }
        }
      }
    }
  }
};
TestingDecorationService = __decorateClass([
  __decorateParam(0, ICodeEditorService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ITestService),
  __decorateParam(3, ITestResultService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IModelService)
], TestingDecorationService);
let TestingDecorations = class extends Disposable {
  constructor(editor, codeEditorService, testService, decorations, uriIdentityService) {
    super();
    this.editor = editor;
    this.codeEditorService = codeEditorService;
    this.testService = testService;
    this.decorations = decorations;
    this.uriIdentityService = uriIdentityService;
    codeEditorService.registerDecorationType("test-message-decoration", TestMessageDecoration.decorationId, {}, void 0, editor);
    this.attachModel(editor.getModel()?.uri);
    this._register(decorations.onDidChange(() => {
      if (this._currentUri) {
        decorations.syncDecorations(this._currentUri);
      }
    }));
    const win = dom.getWindow(editor.getDomNode());
    this._register(dom.addDisposableListener(win, "keydown", (e) => {
      if (new StandardKeyboardEvent(e).keyCode === KeyCode.Alt && this._currentUri) {
        decorations.updateDecorationsAlternateAction(this._currentUri, true);
      }
    }));
    this._register(dom.addDisposableListener(win, "keyup", (e) => {
      if (new StandardKeyboardEvent(e).keyCode === KeyCode.Alt && this._currentUri) {
        decorations.updateDecorationsAlternateAction(this._currentUri, false);
      }
    }));
    this._register(dom.addDisposableListener(win, "blur", () => {
      if (this._currentUri) {
        decorations.updateDecorationsAlternateAction(this._currentUri, false);
      }
    }));
    this._register(this.editor.onKeyUp((e) => {
      if (e.keyCode === KeyCode.Alt && this._currentUri) {
        decorations.updateDecorationsAlternateAction(this._currentUri, false);
      }
    }));
    this._register(this.editor.onDidChangeModel((e) => this.attachModel(e.newModelUrl || void 0)));
    this._register(this.editor.onMouseDown((e) => {
      if (e.target.position && this.currentUri) {
        const modelDecorations = editor.getModel()?.getLineDecorations(e.target.position.lineNumber) ?? [];
        if (!modelDecorations.length) {
          return;
        }
        const cache = decorations.syncDecorations(this.currentUri);
        for (const { id } of modelDecorations) {
          if (cache.getById(id)?.click(e)) {
            e.event.stopPropagation();
            return;
          }
        }
      }
    }));
    this._register(Event.accumulate(this.editor.onDidChangeModelContent, 0, this._store)((evts) => {
      const model = editor.getModel();
      if (!this._currentUri || !model) {
        return;
      }
      const currentDecorations = decorations.syncDecorations(this._currentUri);
      if (!currentDecorations.size) {
        return;
      }
      for (const e of evts) {
        for (const change of e.changes) {
          const modelDecorations = model.getLinesDecorations(change.range.startLineNumber, change.range.endLineNumber);
          for (const { id } of modelDecorations) {
            const decoration = currentDecorations.getById(id);
            if (decoration instanceof TestMessageDecoration) {
              decorations.invalidateResultMessage(decoration.testMessage);
            }
          }
        }
      }
    }));
    const updateFontFamilyVar = () => {
      this.editor.getContainerDomNode().style.setProperty("--testMessageDecorationFontFamily", editor.getOption(EditorOption.fontFamily));
      this.editor.getContainerDomNode().style.setProperty("--testMessageDecorationFontSize", `${editor.getOption(EditorOption.fontSize)}px`);
    };
    this._register(this.editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.fontFamily)) {
        updateFontFamilyVar();
      }
    }));
    updateFontFamilyVar();
  }
  /**
   * Gets the decorations associated with the given code editor.
   */
  static get(editor) {
    return editor.getContribution(
      Testing.DecorationsContributionId
    );
  }
  get currentUri() {
    return this._currentUri;
  }
  _currentUri;
  expectedWidget = new MutableDisposable();
  actualWidget = new MutableDisposable();
  attachModel(uri) {
    switch (uri && parseTestUri(uri)?.type) {
      case TestUriType.ResultExpectedOutput:
        this.expectedWidget.value = new ExpectedLensContentWidget(
          this.editor
        );
        this.actualWidget.clear();
        break;
      case TestUriType.ResultActualOutput:
        this.expectedWidget.clear();
        this.actualWidget.value = new ActualLensContentWidget(
          this.editor
        );
        break;
      default:
        this.expectedWidget.clear();
        this.actualWidget.clear();
    }
    if (isOriginalInDiffEditor(this.codeEditorService, this.editor)) {
      uri = void 0;
    }
    this._currentUri = uri;
    if (!uri) {
      return;
    }
    this.decorations.syncDecorations(uri);
    (async () => {
      for await (const _test of testsInFile(
        this.testService,
        this.uriIdentityService,
        uri,
        false
      )) {
        if (this._currentUri !== uri) {
          break;
        }
      }
    })();
  }
};
TestingDecorations = __decorateClass([
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, ITestService),
  __decorateParam(3, ITestingDecorationsService),
  __decorateParam(4, IUriIdentityService)
], TestingDecorations);
const collapseRange = (originalRange) => ({
  startLineNumber: originalRange.startLineNumber,
  endLineNumber: originalRange.startLineNumber,
  startColumn: originalRange.startColumn,
  endColumn: originalRange.startColumn
});
const createRunTestDecoration = (tests, states, visible, defaultGutterAction) => {
  const range = tests[0]?.item.range;
  if (!range) {
    throw new Error(
      "Test decorations can only be created for tests with a range"
    );
  }
  if (!visible) {
    return {
      range: collapseRange(range),
      options: { isWholeLine: true, description: "run-test-decoration" }
    };
  }
  let computedState = TestResultState.Unset;
  const hoverMessageParts = [];
  let testIdWithMessages;
  let retired = false;
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const resultItem = states[i];
    const state = resultItem?.computedState ?? TestResultState.Unset;
    if (hoverMessageParts.length < 10) {
      hoverMessageParts.push(labelForTestInState(test.item.label, state));
    }
    computedState = maxPriority(computedState, state);
    retired = retired || !!resultItem?.retired;
    if (!testIdWithMessages && resultItem?.tasks.some((t) => t.messages.length)) {
      testIdWithMessages = test.item.extId;
    }
  }
  const hasMultipleTests = tests.length > 1 || tests[0].children.size > 0;
  const primaryIcon = computedState === TestResultState.Unset ? hasMultipleTests ? testingRunAllIcon : testingRunIcon : testingStatesToIcons.get(computedState);
  const alternateIcon = defaultGutterAction === DefaultGutterClickAction.Debug ? hasMultipleTests ? testingRunAllIcon : testingRunIcon : hasMultipleTests ? testingDebugAllIcon : testingDebugIcon;
  let hoverMessage;
  let glyphMarginClassName = "testing-run-glyph";
  if (retired) {
    glyphMarginClassName += " retired";
  }
  const defaultOptions = {
    description: "run-test-decoration",
    showIfCollapsed: true,
    get hoverMessage() {
      if (!hoverMessage) {
        const building = hoverMessage = new MarkdownString(
          "",
          true
        ).appendText(hoverMessageParts.join(", ") + ".");
        if (testIdWithMessages) {
          const args = encodeURIComponent(
            JSON.stringify([testIdWithMessages])
          );
          building.appendMarkdown(
            ` [${localize("peekTestOutout", "Peek Test Output")}](command:vscode.peekTestError?${args})`
          );
        }
      }
      return hoverMessage;
    },
    glyphMargin: { position: GLYPH_MARGIN_LANE },
    glyphMarginClassName: `${ThemeIcon.asClassName(primaryIcon)} ${glyphMarginClassName}`,
    stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
    zIndex: 1e4
  };
  const alternateOptions = {
    ...defaultOptions,
    glyphMarginClassName: `${ThemeIcon.asClassName(alternateIcon)} ${glyphMarginClassName}`
  };
  return {
    range: collapseRange(range),
    options: defaultOptions,
    alternate: alternateOptions
  };
};
var LensContentWidgetVars = /* @__PURE__ */ ((LensContentWidgetVars2) => {
  LensContentWidgetVars2["FontFamily"] = "testingDiffLensFontFamily";
  LensContentWidgetVars2["FontFeatures"] = "testingDiffLensFontFeatures";
  return LensContentWidgetVars2;
})(LensContentWidgetVars || {});
class TitleLensContentWidget {
  constructor(editor) {
    this.editor = editor;
    queueMicrotask(() => {
      this.applyStyling();
      this.editor.addContentWidget(this);
    });
  }
  /** @inheritdoc */
  allowEditorOverflow = false;
  /** @inheritdoc */
  suppressMouseDown = true;
  _domNode = dom.$("span");
  viewZoneId;
  applyStyling() {
    let fontSize = this.editor.getOption(EditorOption.codeLensFontSize);
    let height;
    if (!fontSize || fontSize < 5) {
      fontSize = this.editor.getOption(EditorOption.fontSize) * 0.9 | 0;
      height = this.editor.getOption(EditorOption.lineHeight);
    } else {
      height = fontSize * Math.max(
        1.3,
        this.editor.getOption(EditorOption.lineHeight) / this.editor.getOption(EditorOption.fontSize)
      ) | 0;
    }
    const editorFontInfo = this.editor.getOption(EditorOption.fontInfo);
    const node = this._domNode;
    node.classList.add("testing-diff-lens-widget");
    node.textContent = this.getText();
    node.style.lineHeight = `${height}px`;
    node.style.fontSize = `${fontSize}px`;
    node.style.fontFamily = `var(--${"testingDiffLensFontFamily" /* FontFamily */})`;
    node.style.fontFeatureSettings = `var(--${"testingDiffLensFontFeatures" /* FontFeatures */})`;
    const containerStyle = this.editor.getContainerDomNode().style;
    containerStyle.setProperty(
      "testingDiffLensFontFamily" /* FontFamily */,
      this.editor.getOption(EditorOption.codeLensFontFamily) ?? "inherit"
    );
    containerStyle.setProperty(
      "testingDiffLensFontFeatures" /* FontFeatures */,
      editorFontInfo.fontFeatureSettings
    );
    this.editor.changeViewZones((accessor) => {
      if (this.viewZoneId) {
        accessor.removeZone(this.viewZoneId);
      }
      this.viewZoneId = accessor.addZone({
        afterLineNumber: 0,
        afterColumn: Constants.MAX_SAFE_SMALL_INTEGER,
        domNode: document.createElement("div"),
        heightInPx: 20
      });
    });
  }
  /** @inheritdoc */
  getDomNode() {
    return this._domNode;
  }
  /** @inheritdoc */
  dispose() {
    this.editor.changeViewZones((accessor) => {
      if (this.viewZoneId) {
        accessor.removeZone(this.viewZoneId);
      }
    });
    this.editor.removeContentWidget(this);
  }
  /** @inheritdoc */
  getPosition() {
    return {
      position: { column: 0, lineNumber: 0 },
      preference: [ContentWidgetPositionPreference.ABOVE]
    };
  }
}
class ExpectedLensContentWidget extends TitleLensContentWidget {
  getId() {
    return "expectedTestingLens";
  }
  getText() {
    return localize("expected.title", "Expected");
  }
}
class ActualLensContentWidget extends TitleLensContentWidget {
  getId() {
    return "actualTestingLens";
  }
  getText() {
    return localize("actual.title", "Actual");
  }
}
let RunTestDecoration = class {
  constructor(tests, visible, model, codeEditorService, testService, contextMenuService, commandService, configurationService, testProfileService, contextKeyService, menuService) {
    this.tests = tests;
    this.visible = visible;
    this.model = model;
    this.codeEditorService = codeEditorService;
    this.testService = testService;
    this.contextMenuService = contextMenuService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.testProfileService = testProfileService;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this.displayedStates = tests.map((t) => t.resultItem?.computedState);
    this.editorDecoration = createRunTestDecoration(
      tests.map((t) => t.test),
      tests.map((t) => t.resultItem),
      visible,
      getTestingConfiguration(this.configurationService, TestingConfigKeys.DefaultGutterClickAction)
    );
    this.editorDecoration.options.glyphMarginHoverMessage = new MarkdownString().appendText(this.getGutterLabel());
  }
  /** @inheritdoc */
  id = "";
  get line() {
    return this.editorDecoration.range.startLineNumber;
  }
  get testIds() {
    return this.tests.map((t) => t.test.item.extId);
  }
  editorDecoration;
  displayedStates;
  /** @inheritdoc */
  click(e) {
    if (e.target.type !== MouseTargetType.GUTTER_GLYPH_MARGIN || e.target.detail.glyphMarginLane !== GLYPH_MARGIN_LANE || // handled by editor gutter context menu
    e.event.rightButton || isMacintosh && e.event.leftButton && e.event.ctrlKey) {
      return false;
    }
    const alternateAction = e.event.altKey;
    switch (getTestingConfiguration(
      this.configurationService,
      TestingConfigKeys.DefaultGutterClickAction
    )) {
      case DefaultGutterClickAction.ContextMenu:
        this.showContextMenu(e);
        break;
      case DefaultGutterClickAction.Debug:
        this.runWith(
          alternateAction ? TestRunProfileBitset.Run : TestRunProfileBitset.Debug
        );
        break;
      case DefaultGutterClickAction.Coverage:
        this.runWith(
          alternateAction ? TestRunProfileBitset.Debug : TestRunProfileBitset.Coverage
        );
        break;
      case DefaultGutterClickAction.Run:
      default:
        this.runWith(
          alternateAction ? TestRunProfileBitset.Debug : TestRunProfileBitset.Run
        );
        break;
    }
    return true;
  }
  /**
   * Updates the decoration to match the new set of tests.
   * @returns true if options were changed, false otherwise
   */
  replaceOptions(newTests, visible) {
    const displayedStates = newTests.map(
      (t) => t.resultItem?.computedState
    );
    if (visible === this.visible && equals(this.displayedStates, displayedStates)) {
      return false;
    }
    this.tests = newTests;
    this.displayedStates = displayedStates;
    this.visible = visible;
    const { options, alternate } = createRunTestDecoration(
      newTests.map((t) => t.test),
      newTests.map((t) => t.resultItem),
      visible,
      getTestingConfiguration(
        this.configurationService,
        TestingConfigKeys.DefaultGutterClickAction
      )
    );
    this.editorDecoration.options = options;
    this.editorDecoration.alternate = alternate;
    this.editorDecoration.options.glyphMarginHoverMessage = new MarkdownString().appendText(this.getGutterLabel());
    return true;
  }
  /**
   * Gets whether this decoration serves as the run button for the given test ID.
   */
  isForTest(testId) {
    return this.tests.some((t) => t.test.item.extId === testId);
  }
  runWith(profile) {
    return this.testService.runTests({
      tests: simplifyTestsToExecute(
        this.testService.collection,
        this.tests.map(({ test }) => test)
      ),
      group: profile
    });
  }
  showContextMenu(e) {
    const editor = this.codeEditorService.listCodeEditors().find((e2) => e2.getModel() === this.model);
    editor?.getContribution(
      EditorLineNumberContextMenu.ID
    )?.show(e);
  }
  getGutterLabel() {
    switch (getTestingConfiguration(
      this.configurationService,
      TestingConfigKeys.DefaultGutterClickAction
    )) {
      case DefaultGutterClickAction.ContextMenu:
        return localize(
          "testing.gutterMsg.contextMenu",
          "Click for test options"
        );
      case DefaultGutterClickAction.Debug:
        return localize(
          "testing.gutterMsg.debug",
          "Click to debug tests, right click for more options"
        );
      case DefaultGutterClickAction.Coverage:
        return localize(
          "testing.gutterMsg.coverage",
          "Click to run tests with coverage, right click for more options"
        );
      case DefaultGutterClickAction.Run:
      default:
        return localize(
          "testing.gutterMsg.run",
          "Click to run tests, right click for more options"
        );
    }
  }
  /**
   * Gets context menu actions relevant for a singel test.
   */
  getTestContextMenuActions(test, resultItem) {
    const testActions = [];
    const capabilities = this.testProfileService.capabilitiesForTest(
      test.item
    );
    [
      {
        bitset: TestRunProfileBitset.Run,
        label: localize("run test", "Run Test")
      },
      {
        bitset: TestRunProfileBitset.Debug,
        label: localize("debug test", "Debug Test")
      },
      {
        bitset: TestRunProfileBitset.Coverage,
        label: localize("coverage test", "Run with Coverage")
      }
    ].forEach(({ bitset, label }) => {
      if (capabilities & bitset) {
        testActions.push(
          new Action(
            `testing.gutter.${bitset}`,
            label,
            void 0,
            void 0,
            () => this.testService.runTests({
              group: bitset,
              tests: [test]
            })
          )
        );
      }
    });
    if (capabilities & TestRunProfileBitset.HasNonDefaultProfile) {
      testActions.push(
        new Action(
          "testing.runUsing",
          localize("testing.runUsing", "Execute Using Profile..."),
          void 0,
          void 0,
          async () => {
            const profile = await this.commandService.executeCommand(
              "vscode.pickTestProfile",
              { onlyForTest: test }
            );
            if (!profile) {
              return;
            }
            this.testService.runResolvedTests({
              group: profile.group,
              targets: [
                {
                  profileId: profile.profileId,
                  controllerId: profile.controllerId,
                  testIds: [test.item.extId]
                }
              ]
            });
          }
        )
      );
    }
    if (resultItem && isFailedState(resultItem.computedState)) {
      testActions.push(
        new Action(
          "testing.gutter.peekFailure",
          localize("peek failure", "Peek Error"),
          void 0,
          void 0,
          () => this.commandService.executeCommand(
            "vscode.peekTestError",
            test.item.extId
          )
        )
      );
    }
    testActions.push(
      new Action(
        "testing.gutter.reveal",
        localize("reveal test", "Reveal in Test Explorer"),
        void 0,
        void 0,
        () => this.commandService.executeCommand(
          "_revealTestInExplorer",
          test.item.extId
        )
      )
    );
    const contributed = this.getContributedTestActions(test, capabilities);
    return {
      object: Separator.join(testActions, contributed),
      dispose() {
      }
    };
  }
  getContributedTestActions(test, capabilities) {
    const contextOverlay = this.contextKeyService.createOverlay(
      getTestItemContextOverlay(test, capabilities)
    );
    const target = [];
    const arg = getContextForTestItem(
      this.testService.collection,
      test.item.extId
    );
    const menu = this.menuService.getMenuActions(
      MenuId.TestItemGutter,
      contextOverlay,
      { shouldForwardArgs: true, arg }
    );
    createAndFillInContextMenuActions(menu, target);
    return target;
  }
};
RunTestDecoration = __decorateClass([
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, ITestService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, ITestProfileService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IMenuService)
], RunTestDecoration);
let MultiRunTestDecoration = class extends RunTestDecoration {
  constructor(tests, visible, model, codeEditorService, testService, contextMenuService, commandService, configurationService, testProfileService, contextKeyService, menuService, quickInputService) {
    super(tests, visible, model, codeEditorService, testService, contextMenuService, commandService, configurationService, testProfileService, contextKeyService, menuService);
    this.quickInputService = quickInputService;
  }
  getContextMenuActions() {
    const allActions = [];
    [
      {
        bitset: TestRunProfileBitset.Run,
        label: localize("run all test", "Run All Tests")
      },
      {
        bitset: TestRunProfileBitset.Coverage,
        label: localize(
          "run all test with coverage",
          "Run All Tests with Coverage"
        )
      },
      {
        bitset: TestRunProfileBitset.Debug,
        label: localize("debug all test", "Debug All Tests")
      }
    ].forEach(({ bitset, label }, i) => {
      const canRun = this.tests.some(
        ({ test }) => this.testProfileService.capabilitiesForTest(test.item) & bitset
      );
      if (canRun) {
        allActions.push(
          new Action(
            `testing.gutter.run${i}`,
            label,
            void 0,
            void 0,
            () => this.runWith(bitset)
          )
        );
      }
    });
    const testItems = this.tests.map(
      (testItem) => ({
        currentLabel: testItem.test.item.label,
        testItem,
        parent: TestId.fromString(testItem.test.item.extId).parentId
      })
    );
    const getLabelConflicts = (tests) => {
      const labelCount = /* @__PURE__ */ new Map();
      for (const test of tests) {
        labelCount.set(
          test.currentLabel,
          (labelCount.get(test.currentLabel) || 0) + 1
        );
      }
      return tests.filter((e) => labelCount.get(e.currentLabel) > 1);
    };
    let conflicts, hasParent = true;
    while ((conflicts = getLabelConflicts(testItems)).length && hasParent) {
      for (const conflict of conflicts) {
        if (conflict.parent) {
          const parent = this.testService.collection.getNodeById(
            conflict.parent.toString()
          );
          conflict.currentLabel = parent?.item.label + " > " + conflict.currentLabel;
          conflict.parent = conflict.parent.parentId;
        } else {
          hasParent = false;
        }
      }
    }
    testItems.sort((a, b) => {
      const ai = a.testItem.test.item;
      const bi = b.testItem.test.item;
      return (ai.sortText || ai.label).localeCompare(
        bi.sortText || bi.label
      );
    });
    const disposable = new DisposableStore();
    let testSubmenus = testItems.map(
      ({ currentLabel, testItem }) => {
        const actions = this.getTestContextMenuActions(
          testItem.test,
          testItem.resultItem
        );
        disposable.add(actions);
        let label = stripIcons(currentLabel);
        const lf = label.indexOf("\n");
        if (lf !== -1) {
          label = label.slice(0, lf);
        }
        return new SubmenuAction(
          testItem.test.item.extId,
          label,
          actions.object
        );
      }
    );
    const overflow = testSubmenus.length - MAX_TESTS_IN_SUBMENU;
    if (overflow > 0) {
      testSubmenus = testSubmenus.slice(0, MAX_TESTS_IN_SUBMENU);
      testSubmenus.push(
        new Action(
          "testing.gutter.overflow",
          localize(
            "testOverflowItems",
            "{0} more tests...",
            overflow
          ),
          void 0,
          void 0,
          () => this.pickAndRun(testItems)
        )
      );
    }
    return {
      object: Separator.join(allActions, testSubmenus),
      dispose: () => disposable.dispose()
    };
  }
  async pickAndRun(testItems) {
    const doPick = (items, title) => new Promise((resolve) => {
      const disposables = new DisposableStore();
      const pick = disposables.add(
        this.quickInputService.createQuickPick()
      );
      pick.placeholder = title;
      pick.items = items;
      disposables.add(
        pick.onDidHide(() => {
          resolve(void 0);
          disposables.dispose();
        })
      );
      disposables.add(
        pick.onDidAccept(() => {
          resolve(pick.selectedItems[0]);
          disposables.dispose();
        })
      );
      pick.show();
    });
    const item = await doPick(
      testItems.map(({ currentLabel, testItem }) => ({
        label: currentLabel,
        test: testItem.test,
        result: testItem.resultItem
      })),
      localize("selectTestToRun", "Select a test to run")
    );
    if (!item) {
      return;
    }
    const actions = this.getTestContextMenuActions(item.test, item.result);
    try {
      (await doPick(actions.object, item.label))?.run();
    } finally {
      actions.dispose();
    }
  }
};
MultiRunTestDecoration = __decorateClass([
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, ITestService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, ITestProfileService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IMenuService),
  __decorateParam(11, IQuickInputService)
], MultiRunTestDecoration);
let RunSingleTestDecoration = class extends RunTestDecoration {
  constructor(test, resultItem, model, visible, codeEditorService, testService, commandService, contextMenuService, configurationService, testProfiles, contextKeyService, menuService) {
    super(
      [{ test, resultItem }],
      visible,
      model,
      codeEditorService,
      testService,
      contextMenuService,
      commandService,
      configurationService,
      testProfiles,
      contextKeyService,
      menuService
    );
  }
  getContextMenuActions() {
    return this.getTestContextMenuActions(
      this.tests[0].test,
      this.tests[0].resultItem
    );
  }
};
RunSingleTestDecoration = __decorateClass([
  __decorateParam(4, ICodeEditorService),
  __decorateParam(5, ITestService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, ITestProfileService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IMenuService)
], RunSingleTestDecoration);
const lineBreakRe = /\r?\n\s*/g;
let TestMessageDecoration = class {
  constructor(testMessage, messageUri, textModel, peekOpener, editorService) {
    this.testMessage = testMessage;
    this.messageUri = messageUri;
    this.peekOpener = peekOpener;
    this.location = testMessage.location;
    this.line = this.location.range.startLineNumber;
    const severity = testMessage.type;
    const message = testMessage.message;
    const options = editorService.resolveDecorationOptions(TestMessageDecoration.decorationId, true);
    options.hoverMessage = typeof message === "string" ? new MarkdownString().appendText(message) : message;
    options.zIndex = 10;
    options.className = `testing-inline-message-severity-${severity}`;
    options.isWholeLine = true;
    options.stickiness = TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges;
    options.collapseOnReplaceEdit = true;
    let inlineText = renderTestMessageAsText(message).replace(lineBreakRe, " ");
    if (inlineText.length > MAX_INLINE_MESSAGE_LENGTH) {
      inlineText = inlineText.slice(0, MAX_INLINE_MESSAGE_LENGTH - 1) + "\u2026";
    }
    options.after = {
      content: " ".repeat(4) + inlineText,
      inlineClassName: `test-message-inline-content test-message-inline-content-s${severity} ${this.contentIdClass} ${messageUri ? "test-message-inline-content-clickable" : ""}`
    };
    options.showIfCollapsed = true;
    const rulerColor = severity === TestMessageType.Error ? overviewRulerError : overviewRulerInfo;
    if (rulerColor) {
      options.overviewRuler = { color: themeColorFromId(rulerColor), position: OverviewRulerLane.Right };
    }
    const lineLength = textModel.getLineLength(this.location.range.startLineNumber);
    const column = lineLength ? lineLength + 1 : this.location.range.endColumn;
    this.editorDecoration = {
      options,
      range: {
        startLineNumber: this.location.range.startLineNumber,
        startColumn: column,
        endColumn: column,
        endLineNumber: this.location.range.startLineNumber
      }
    };
  }
  static inlineClassName = "test-message-inline-content";
  static decorationId = `testmessage-${generateUuid()}`;
  id = "";
  editorDecoration;
  location;
  line;
  contentIdClass = `test-message-inline-content-id${generateUuid()}`;
  click(e) {
    if (e.event.rightButton) {
      return false;
    }
    if (!this.messageUri) {
      return false;
    }
    if (e.target.element?.className.includes(this.contentIdClass)) {
      this.peekOpener.peekUri(this.messageUri);
    }
    return false;
  }
  getContextMenuActions() {
    return { object: [], dispose: () => {
    } };
  }
};
TestMessageDecoration = __decorateClass([
  __decorateParam(3, ITestingPeekOpener),
  __decorateParam(4, ICodeEditorService)
], TestMessageDecoration);
export {
  TestingDecorationService,
  TestingDecorations
};
