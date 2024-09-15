var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import {
  Delayer,
  RunOnceScheduler,
  createCancelablePromise
} from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import {
  illegalArgument,
  onUnexpectedError
} from "../../../../base/common/errors.js";
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { escapeRegExpCharacters } from "../../../../base/common/strings.js";
import * as types from "../../../../base/common/types.js";
import "./folding.css";
import { Emitter } from "../../../../base/common/event.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { URI } from "../../../../base/common/uri.js";
import * as nls from "../../../../nls.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import {
  MouseTargetType
} from "../../../browser/editorBrowser.js";
import {
  EditorAction,
  EditorContributionInstantiation,
  registerEditorAction,
  registerEditorContribution,
  registerInstantiatedEditorAction
} from "../../../browser/editorExtensions.js";
import { StableEditorScrollState } from "../../../browser/stableEditorScroll.js";
import {
  EditorOption
} from "../../../common/config/editorOptions.js";
import {
  ScrollType
} from "../../../common/editorCommon.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import {
  FoldingRangeKind
} from "../../../common/languages.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.js";
import {
  ILanguageFeatureDebounceService
} from "../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { IModelService } from "../../../common/services/model.js";
import { FoldingDecorationProvider } from "./foldingDecorations.js";
import {
  FoldingModel,
  getNextFoldLine,
  getParentFoldLine,
  getPreviousFoldLine,
  setCollapseStateAtLevel,
  setCollapseStateForMatchingLines,
  setCollapseStateForRest,
  setCollapseStateForType,
  setCollapseStateLevelsDown,
  setCollapseStateLevelsUp,
  setCollapseStateUp,
  toggleCollapseState
} from "./foldingModel.js";
import {
  FoldSource,
  FoldingRegions
} from "./foldingRanges.js";
import { HiddenRangeModel } from "./hiddenRangeModel.js";
import { IndentRangeProvider } from "./indentRangeProvider.js";
import { SyntaxRangeProvider } from "./syntaxRangeProvider.js";
const CONTEXT_FOLDING_ENABLED = new RawContextKey(
  "foldingEnabled",
  false
);
let FoldingController = class extends Disposable {
  constructor(editor, contextKeyService, languageConfigurationService, notificationService, languageFeatureDebounceService, languageFeaturesService) {
    super();
    this.contextKeyService = contextKeyService;
    this.languageConfigurationService = languageConfigurationService;
    this.languageFeaturesService = languageFeaturesService;
    this.editor = editor;
    this._foldingLimitReporter = new RangesLimitReporter(editor);
    const options = this.editor.getOptions();
    this._isEnabled = options.get(EditorOption.folding);
    this._useFoldingProviders = options.get(EditorOption.foldingStrategy) !== "indentation";
    this._unfoldOnClickAfterEndOfLine = options.get(
      EditorOption.unfoldOnClickAfterEndOfLine
    );
    this._restoringViewState = false;
    this._currentModelHasFoldedImports = false;
    this._foldingImportsByDefault = options.get(
      EditorOption.foldingImportsByDefault
    );
    this.updateDebounceInfo = languageFeatureDebounceService.for(
      languageFeaturesService.foldingRangeProvider,
      "Folding",
      { min: 200 }
    );
    this.foldingModel = null;
    this.hiddenRangeModel = null;
    this.rangeProvider = null;
    this.foldingRegionPromise = null;
    this.foldingModelPromise = null;
    this.updateScheduler = null;
    this.cursorChangedScheduler = null;
    this.mouseDownInfo = null;
    this.foldingDecorationProvider = new FoldingDecorationProvider(editor);
    this.foldingDecorationProvider.showFoldingControls = options.get(
      EditorOption.showFoldingControls
    );
    this.foldingDecorationProvider.showFoldingHighlights = options.get(
      EditorOption.foldingHighlight
    );
    this.foldingEnabled = CONTEXT_FOLDING_ENABLED.bindTo(
      this.contextKeyService
    );
    this.foldingEnabled.set(this._isEnabled);
    this._register(
      this.editor.onDidChangeModel(() => this.onModelChanged())
    );
    this._register(
      this.editor.onDidChangeConfiguration(
        (e) => {
          if (e.hasChanged(EditorOption.folding)) {
            this._isEnabled = this.editor.getOptions().get(EditorOption.folding);
            this.foldingEnabled.set(this._isEnabled);
            this.onModelChanged();
          }
          if (e.hasChanged(EditorOption.foldingMaximumRegions)) {
            this.onModelChanged();
          }
          if (e.hasChanged(EditorOption.showFoldingControls) || e.hasChanged(EditorOption.foldingHighlight)) {
            const options2 = this.editor.getOptions();
            this.foldingDecorationProvider.showFoldingControls = options2.get(EditorOption.showFoldingControls);
            this.foldingDecorationProvider.showFoldingHighlights = options2.get(EditorOption.foldingHighlight);
            this.triggerFoldingModelChanged();
          }
          if (e.hasChanged(EditorOption.foldingStrategy)) {
            this._useFoldingProviders = this.editor.getOptions().get(EditorOption.foldingStrategy) !== "indentation";
            this.onFoldingStrategyChanged();
          }
          if (e.hasChanged(EditorOption.unfoldOnClickAfterEndOfLine)) {
            this._unfoldOnClickAfterEndOfLine = this.editor.getOptions().get(EditorOption.unfoldOnClickAfterEndOfLine);
          }
          if (e.hasChanged(EditorOption.foldingImportsByDefault)) {
            this._foldingImportsByDefault = this.editor.getOptions().get(EditorOption.foldingImportsByDefault);
          }
        }
      )
    );
    this.onModelChanged();
  }
  static {
    __name(this, "FoldingController");
  }
  static ID = "editor.contrib.folding";
  static get(editor) {
    return editor.getContribution(FoldingController.ID);
  }
  static _foldingRangeSelector;
  static getFoldingRangeProviders(languageFeaturesService, model) {
    const foldingRangeProviders = languageFeaturesService.foldingRangeProvider.ordered(model);
    return FoldingController._foldingRangeSelector?.(
      foldingRangeProviders,
      model
    ) ?? foldingRangeProviders;
  }
  static setFoldingRangeProviderSelector(foldingRangeSelector) {
    FoldingController._foldingRangeSelector = foldingRangeSelector;
    return {
      dispose: /* @__PURE__ */ __name(() => {
        FoldingController._foldingRangeSelector = void 0;
      }, "dispose")
    };
  }
  editor;
  _isEnabled;
  _useFoldingProviders;
  _unfoldOnClickAfterEndOfLine;
  _restoringViewState;
  _foldingImportsByDefault;
  _currentModelHasFoldedImports;
  foldingDecorationProvider;
  foldingModel;
  hiddenRangeModel;
  rangeProvider;
  foldingRegionPromise;
  foldingModelPromise;
  updateScheduler;
  updateDebounceInfo;
  foldingEnabled;
  cursorChangedScheduler;
  localToDispose = this._register(new DisposableStore());
  mouseDownInfo;
  _foldingLimitReporter;
  get limitReporter() {
    return this._foldingLimitReporter;
  }
  /**
   * Store view state.
   */
  saveViewState() {
    const model = this.editor.getModel();
    if (!model || !this._isEnabled || model.isTooLargeForTokenization()) {
      return {};
    }
    if (this.foldingModel) {
      const collapsedRegions = this.foldingModel.getMemento();
      const provider = this.rangeProvider ? this.rangeProvider.id : void 0;
      return {
        collapsedRegions,
        lineCount: model.getLineCount(),
        provider,
        foldedImports: this._currentModelHasFoldedImports
      };
    }
    return void 0;
  }
  /**
   * Restore view state.
   */
  restoreViewState(state) {
    const model = this.editor.getModel();
    if (!model || !this._isEnabled || model.isTooLargeForTokenization() || !this.hiddenRangeModel) {
      return;
    }
    if (!state) {
      return;
    }
    this._currentModelHasFoldedImports = !!state.foldedImports;
    if (state.collapsedRegions && state.collapsedRegions.length > 0 && this.foldingModel) {
      this._restoringViewState = true;
      try {
        this.foldingModel.applyMemento(state.collapsedRegions);
      } finally {
        this._restoringViewState = false;
      }
    }
  }
  onModelChanged() {
    this.localToDispose.clear();
    const model = this.editor.getModel();
    if (!this._isEnabled || !model || model.isTooLargeForTokenization()) {
      return;
    }
    this._currentModelHasFoldedImports = false;
    this.foldingModel = new FoldingModel(
      model,
      this.foldingDecorationProvider
    );
    this.localToDispose.add(this.foldingModel);
    this.hiddenRangeModel = new HiddenRangeModel(this.foldingModel);
    this.localToDispose.add(this.hiddenRangeModel);
    this.localToDispose.add(
      this.hiddenRangeModel.onDidChange(
        (hr) => this.onHiddenRangesChanges(hr)
      )
    );
    this.updateScheduler = new Delayer(
      this.updateDebounceInfo.get(model)
    );
    this.cursorChangedScheduler = new RunOnceScheduler(
      () => this.revealCursor(),
      200
    );
    this.localToDispose.add(this.cursorChangedScheduler);
    this.localToDispose.add(
      this.languageFeaturesService.foldingRangeProvider.onDidChange(
        () => this.onFoldingStrategyChanged()
      )
    );
    this.localToDispose.add(
      this.editor.onDidChangeModelLanguageConfiguration(
        () => this.onFoldingStrategyChanged()
      )
    );
    this.localToDispose.add(
      this.editor.onDidChangeModelContent(
        (e) => this.onDidChangeModelContent(e)
      )
    );
    this.localToDispose.add(
      this.editor.onDidChangeCursorPosition(
        () => this.onCursorPositionChanged()
      )
    );
    this.localToDispose.add(
      this.editor.onMouseDown((e) => this.onEditorMouseDown(e))
    );
    this.localToDispose.add(
      this.editor.onMouseUp((e) => this.onEditorMouseUp(e))
    );
    this.localToDispose.add({
      dispose: /* @__PURE__ */ __name(() => {
        if (this.foldingRegionPromise) {
          this.foldingRegionPromise.cancel();
          this.foldingRegionPromise = null;
        }
        this.updateScheduler?.cancel();
        this.updateScheduler = null;
        this.foldingModel = null;
        this.foldingModelPromise = null;
        this.hiddenRangeModel = null;
        this.cursorChangedScheduler = null;
        this.rangeProvider?.dispose();
        this.rangeProvider = null;
      }, "dispose")
    });
    this.triggerFoldingModelChanged();
  }
  onFoldingStrategyChanged() {
    this.rangeProvider?.dispose();
    this.rangeProvider = null;
    this.triggerFoldingModelChanged();
  }
  getRangeProvider(editorModel) {
    if (this.rangeProvider) {
      return this.rangeProvider;
    }
    const indentRangeProvider = new IndentRangeProvider(
      editorModel,
      this.languageConfigurationService,
      this._foldingLimitReporter
    );
    this.rangeProvider = indentRangeProvider;
    if (this._useFoldingProviders && this.foldingModel) {
      const selectedProviders = FoldingController.getFoldingRangeProviders(
        this.languageFeaturesService,
        editorModel
      );
      if (selectedProviders.length > 0) {
        this.rangeProvider = new SyntaxRangeProvider(
          editorModel,
          selectedProviders,
          () => this.triggerFoldingModelChanged(),
          this._foldingLimitReporter,
          indentRangeProvider
        );
      }
    }
    return this.rangeProvider;
  }
  getFoldingModel() {
    return this.foldingModelPromise;
  }
  onDidChangeModelContent(e) {
    this.hiddenRangeModel?.notifyChangeModelContent(e);
    this.triggerFoldingModelChanged();
  }
  triggerFoldingModelChanged() {
    if (this.updateScheduler) {
      if (this.foldingRegionPromise) {
        this.foldingRegionPromise.cancel();
        this.foldingRegionPromise = null;
      }
      this.foldingModelPromise = this.updateScheduler.trigger(() => {
        const foldingModel = this.foldingModel;
        if (!foldingModel) {
          return null;
        }
        const sw = new StopWatch();
        const provider = this.getRangeProvider(
          foldingModel.textModel
        );
        const foldingRegionPromise = this.foldingRegionPromise = createCancelablePromise(
          (token) => provider.compute(token)
        );
        return foldingRegionPromise.then((foldingRanges) => {
          if (foldingRanges && foldingRegionPromise === this.foldingRegionPromise) {
            let scrollState;
            if (this._foldingImportsByDefault && !this._currentModelHasFoldedImports) {
              const hasChanges = foldingRanges.setCollapsedAllOfType(
                FoldingRangeKind.Imports.value,
                true
              );
              if (hasChanges) {
                scrollState = StableEditorScrollState.capture(
                  this.editor
                );
                this._currentModelHasFoldedImports = hasChanges;
              }
            }
            const selections = this.editor.getSelections();
            foldingModel.update(
              foldingRanges,
              toSelectedLines(selections)
            );
            scrollState?.restore(this.editor);
            const newValue = this.updateDebounceInfo.update(
              foldingModel.textModel,
              sw.elapsed()
            );
            if (this.updateScheduler) {
              this.updateScheduler.defaultDelay = newValue;
            }
          }
          return foldingModel;
        });
      }).then(void 0, (err) => {
        onUnexpectedError(err);
        return null;
      });
    }
  }
  onHiddenRangesChanges(hiddenRanges) {
    if (this.hiddenRangeModel && hiddenRanges.length && !this._restoringViewState) {
      const selections = this.editor.getSelections();
      if (selections) {
        if (this.hiddenRangeModel.adjustSelections(selections)) {
          this.editor.setSelections(selections);
        }
      }
    }
    this.editor.setHiddenAreas(hiddenRanges, this);
  }
  onCursorPositionChanged() {
    if (this.hiddenRangeModel && this.hiddenRangeModel.hasRanges()) {
      this.cursorChangedScheduler.schedule();
    }
  }
  revealCursor() {
    const foldingModel = this.getFoldingModel();
    if (!foldingModel) {
      return;
    }
    foldingModel.then((foldingModel2) => {
      if (foldingModel2) {
        const selections = this.editor.getSelections();
        if (selections && selections.length > 0) {
          const toToggle = [];
          for (const selection of selections) {
            const lineNumber = selection.selectionStartLineNumber;
            if (this.hiddenRangeModel && this.hiddenRangeModel.isHidden(lineNumber)) {
              toToggle.push(
                ...foldingModel2.getAllRegionsAtLine(
                  lineNumber,
                  (r) => r.isCollapsed && lineNumber > r.startLineNumber
                )
              );
            }
          }
          if (toToggle.length) {
            foldingModel2.toggleCollapseState(toToggle);
            this.reveal(selections[0].getPosition());
          }
        }
      }
    }).then(void 0, onUnexpectedError);
  }
  onEditorMouseDown(e) {
    this.mouseDownInfo = null;
    if (!this.hiddenRangeModel || !e.target || !e.target.range) {
      return;
    }
    if (!e.event.leftButton && !e.event.middleButton) {
      return;
    }
    const range = e.target.range;
    let iconClicked = false;
    switch (e.target.type) {
      case MouseTargetType.GUTTER_LINE_DECORATIONS: {
        const data = e.target.detail;
        const offsetLeftInGutter = e.target.element.offsetLeft;
        const gutterOffsetX = data.offsetX - offsetLeftInGutter;
        if (gutterOffsetX < 4) {
          return;
        }
        iconClicked = true;
        break;
      }
      case MouseTargetType.CONTENT_EMPTY: {
        if (this._unfoldOnClickAfterEndOfLine && this.hiddenRangeModel.hasRanges()) {
          const data = e.target.detail;
          if (!data.isAfterLines) {
            break;
          }
        }
        return;
      }
      case MouseTargetType.CONTENT_TEXT: {
        if (this.hiddenRangeModel.hasRanges()) {
          const model = this.editor.getModel();
          if (model && range.startColumn === model.getLineMaxColumn(range.startLineNumber)) {
            break;
          }
        }
        return;
      }
      default:
        return;
    }
    this.mouseDownInfo = { lineNumber: range.startLineNumber, iconClicked };
  }
  onEditorMouseUp(e) {
    const foldingModel = this.foldingModel;
    if (!foldingModel || !this.mouseDownInfo || !e.target) {
      return;
    }
    const lineNumber = this.mouseDownInfo.lineNumber;
    const iconClicked = this.mouseDownInfo.iconClicked;
    const range = e.target.range;
    if (!range || range.startLineNumber !== lineNumber) {
      return;
    }
    if (iconClicked) {
      if (e.target.type !== MouseTargetType.GUTTER_LINE_DECORATIONS) {
        return;
      }
    } else {
      const model = this.editor.getModel();
      if (!model || range.startColumn !== model.getLineMaxColumn(lineNumber)) {
        return;
      }
    }
    const region = foldingModel.getRegionAtLine(lineNumber);
    if (region && region.startLineNumber === lineNumber) {
      const isCollapsed = region.isCollapsed;
      if (iconClicked || isCollapsed) {
        const surrounding = e.event.altKey;
        let toToggle = [];
        if (surrounding) {
          const filter = /* @__PURE__ */ __name((otherRegion) => !otherRegion.containedBy(region) && !region.containedBy(otherRegion), "filter");
          const toMaybeToggle = foldingModel.getRegionsInside(
            null,
            filter
          );
          for (const r of toMaybeToggle) {
            if (r.isCollapsed) {
              toToggle.push(r);
            }
          }
          if (toToggle.length === 0) {
            toToggle = toMaybeToggle;
          }
        } else {
          const recursive = e.event.middleButton || e.event.shiftKey;
          if (recursive) {
            for (const r of foldingModel.getRegionsInside(region)) {
              if (r.isCollapsed === isCollapsed) {
                toToggle.push(r);
              }
            }
          }
          if (isCollapsed || !recursive || toToggle.length === 0) {
            toToggle.push(region);
          }
        }
        foldingModel.toggleCollapseState(toToggle);
        this.reveal({ lineNumber, column: 1 });
      }
    }
  }
  reveal(position) {
    this.editor.revealPositionInCenterIfOutsideViewport(
      position,
      ScrollType.Smooth
    );
  }
};
FoldingController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ILanguageConfigurationService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, ILanguageFeatureDebounceService),
  __decorateParam(5, ILanguageFeaturesService)
], FoldingController);
class RangesLimitReporter {
  constructor(editor) {
    this.editor = editor;
  }
  static {
    __name(this, "RangesLimitReporter");
  }
  get limit() {
    return this.editor.getOptions().get(EditorOption.foldingMaximumRegions);
  }
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  _computed = 0;
  _limited = false;
  get computed() {
    return this._computed;
  }
  get limited() {
    return this._limited;
  }
  update(computed, limited) {
    if (computed !== this._computed || limited !== this._limited) {
      this._computed = computed;
      this._limited = limited;
      this._onDidChange.fire();
    }
  }
}
class FoldingAction extends EditorAction {
  static {
    __name(this, "FoldingAction");
  }
  runEditorCommand(accessor, editor, args) {
    const languageConfigurationService = accessor.get(
      ILanguageConfigurationService
    );
    const foldingController = FoldingController.get(editor);
    if (!foldingController) {
      return;
    }
    const foldingModelPromise = foldingController.getFoldingModel();
    if (foldingModelPromise) {
      this.reportTelemetry(accessor, editor);
      return foldingModelPromise.then((foldingModel) => {
        if (foldingModel) {
          this.invoke(
            foldingController,
            foldingModel,
            editor,
            args,
            languageConfigurationService
          );
          const selection = editor.getSelection();
          if (selection) {
            foldingController.reveal(selection.getStartPosition());
          }
        }
      });
    }
  }
  getSelectedLines(editor) {
    const selections = editor.getSelections();
    return selections ? selections.map((s) => s.startLineNumber) : [];
  }
  getLineNumbers(args, editor) {
    if (args && args.selectionLines) {
      return args.selectionLines.map((l) => l + 1);
    }
    return this.getSelectedLines(editor);
  }
  run(_accessor, _editor) {
  }
}
function toSelectedLines(selections) {
  if (!selections || selections.length === 0) {
    return {
      startsInside: /* @__PURE__ */ __name(() => false, "startsInside")
    };
  }
  return {
    startsInside(startLine, endLine) {
      for (const s of selections) {
        const line = s.startLineNumber;
        if (line >= startLine && line <= endLine) {
          return true;
        }
      }
      return false;
    }
  };
}
__name(toSelectedLines, "toSelectedLines");
function foldingArgumentsConstraint(args) {
  if (!types.isUndefined(args)) {
    if (!types.isObject(args)) {
      return false;
    }
    const foldingArgs = args;
    if (!types.isUndefined(foldingArgs.levels) && !types.isNumber(foldingArgs.levels)) {
      return false;
    }
    if (!types.isUndefined(foldingArgs.direction) && !types.isString(foldingArgs.direction)) {
      return false;
    }
    if (!types.isUndefined(foldingArgs.selectionLines) && (!Array.isArray(foldingArgs.selectionLines) || !foldingArgs.selectionLines.every(types.isNumber))) {
      return false;
    }
  }
  return true;
}
__name(foldingArgumentsConstraint, "foldingArgumentsConstraint");
class UnfoldAction extends FoldingAction {
  static {
    __name(this, "UnfoldAction");
  }
  constructor() {
    super({
      id: "editor.unfold",
      label: nls.localize("unfoldAction.label", "Unfold"),
      alias: "Unfold",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.BracketRight,
        mac: {
          primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.BracketRight
        },
        weight: KeybindingWeight.EditorContrib
      },
      metadata: {
        description: "Unfold the content in the editor",
        args: [
          {
            name: "Unfold editor argument",
            description: `Property-value pairs that can be passed through this argument:
						* 'levels': Number of levels to unfold. If not set, defaults to 1.
						* 'direction': If 'up', unfold given number of levels up otherwise unfolds down.
						* 'selectionLines': Array of the start lines (0-based) of the editor selections to apply the unfold action to. If not set, the active selection(s) will be used.
						`,
            constraint: foldingArgumentsConstraint,
            schema: {
              type: "object",
              properties: {
                levels: {
                  type: "number",
                  default: 1
                },
                direction: {
                  type: "string",
                  enum: ["up", "down"],
                  default: "down"
                },
                selectionLines: {
                  type: "array",
                  items: {
                    type: "number"
                  }
                }
              }
            }
          }
        ]
      }
    });
  }
  invoke(_foldingController, foldingModel, editor, args) {
    const levels = args && args.levels || 1;
    const lineNumbers = this.getLineNumbers(args, editor);
    if (args && args.direction === "up") {
      setCollapseStateLevelsUp(foldingModel, false, levels, lineNumbers);
    } else {
      setCollapseStateLevelsDown(
        foldingModel,
        false,
        levels,
        lineNumbers
      );
    }
  }
}
class UnFoldRecursivelyAction extends FoldingAction {
  static {
    __name(this, "UnFoldRecursivelyAction");
  }
  constructor() {
    super({
      id: "editor.unfoldRecursively",
      label: nls.localize(
        "unFoldRecursivelyAction.label",
        "Unfold Recursively"
      ),
      alias: "Unfold Recursively",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.BracketRight
        ),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  invoke(_foldingController, foldingModel, editor, _args) {
    setCollapseStateLevelsDown(
      foldingModel,
      false,
      Number.MAX_VALUE,
      this.getSelectedLines(editor)
    );
  }
}
class FoldAction extends FoldingAction {
  static {
    __name(this, "FoldAction");
  }
  constructor() {
    super({
      id: "editor.fold",
      label: nls.localize("foldAction.label", "Fold"),
      alias: "Fold",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.BracketLeft,
        mac: {
          primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.BracketLeft
        },
        weight: KeybindingWeight.EditorContrib
      },
      metadata: {
        description: "Fold the content in the editor",
        args: [
          {
            name: "Fold editor argument",
            description: `Property-value pairs that can be passed through this argument:
							* 'levels': Number of levels to fold.
							* 'direction': If 'up', folds given number of levels up otherwise folds down.
							* 'selectionLines': Array of the start lines (0-based) of the editor selections to apply the fold action to. If not set, the active selection(s) will be used.
							If no levels or direction is set, folds the region at the locations or if already collapsed, the first uncollapsed parent instead.
						`,
            constraint: foldingArgumentsConstraint,
            schema: {
              type: "object",
              properties: {
                levels: {
                  type: "number"
                },
                direction: {
                  type: "string",
                  enum: ["up", "down"]
                },
                selectionLines: {
                  type: "array",
                  items: {
                    type: "number"
                  }
                }
              }
            }
          }
        ]
      }
    });
  }
  invoke(_foldingController, foldingModel, editor, args) {
    const lineNumbers = this.getLineNumbers(args, editor);
    const levels = args && args.levels;
    const direction = args && args.direction;
    if (typeof levels !== "number" && typeof direction !== "string") {
      setCollapseStateUp(foldingModel, true, lineNumbers);
    } else if (direction === "up") {
      setCollapseStateLevelsUp(
        foldingModel,
        true,
        levels || 1,
        lineNumbers
      );
    } else {
      setCollapseStateLevelsDown(
        foldingModel,
        true,
        levels || 1,
        lineNumbers
      );
    }
  }
}
class ToggleFoldAction extends FoldingAction {
  static {
    __name(this, "ToggleFoldAction");
  }
  constructor() {
    super({
      id: "editor.toggleFold",
      label: nls.localize("toggleFoldAction.label", "Toggle Fold"),
      alias: "Toggle Fold",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.KeyL
        ),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const selectedLines = this.getSelectedLines(editor);
    toggleCollapseState(foldingModel, 1, selectedLines);
  }
}
class FoldRecursivelyAction extends FoldingAction {
  static {
    __name(this, "FoldRecursivelyAction");
  }
  constructor() {
    super({
      id: "editor.foldRecursively",
      label: nls.localize(
        "foldRecursivelyAction.label",
        "Fold Recursively"
      ),
      alias: "Fold Recursively",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.BracketLeft
        ),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const selectedLines = this.getSelectedLines(editor);
    setCollapseStateLevelsDown(
      foldingModel,
      true,
      Number.MAX_VALUE,
      selectedLines
    );
  }
}
class ToggleFoldRecursivelyAction extends FoldingAction {
  static {
    __name(this, "ToggleFoldRecursivelyAction");
  }
  constructor() {
    super({
      id: "editor.toggleFoldRecursively",
      label: nls.localize(
        "toggleFoldRecursivelyAction.label",
        "Toggle Fold Recursively"
      ),
      alias: "Toggle Fold Recursively",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyL
        ),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const selectedLines = this.getSelectedLines(editor);
    toggleCollapseState(foldingModel, Number.MAX_VALUE, selectedLines);
  }
}
class FoldAllBlockCommentsAction extends FoldingAction {
  static {
    __name(this, "FoldAllBlockCommentsAction");
  }
  constructor() {
    super({
      id: "editor.foldAllBlockComments",
      label: nls.localize(
        "foldAllBlockComments.label",
        "Fold All Block Comments"
      ),
      alias: "Fold All Block Comments",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.Slash
        ),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  invoke(_foldingController, foldingModel, editor, args, languageConfigurationService) {
    if (foldingModel.regions.hasTypes()) {
      setCollapseStateForType(
        foldingModel,
        FoldingRangeKind.Comment.value,
        true
      );
    } else {
      const editorModel = editor.getModel();
      if (!editorModel) {
        return;
      }
      const comments = languageConfigurationService.getLanguageConfiguration(
        editorModel.getLanguageId()
      ).comments;
      if (comments && comments.blockCommentStartToken) {
        const regExp = new RegExp(
          "^\\s*" + escapeRegExpCharacters(comments.blockCommentStartToken)
        );
        setCollapseStateForMatchingLines(foldingModel, regExp, true);
      }
    }
  }
}
class FoldAllRegionsAction extends FoldingAction {
  static {
    __name(this, "FoldAllRegionsAction");
  }
  constructor() {
    super({
      id: "editor.foldAllMarkerRegions",
      label: nls.localize(
        "foldAllMarkerRegions.label",
        "Fold All Regions"
      ),
      alias: "Fold All Regions",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.Digit8
        ),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  invoke(_foldingController, foldingModel, editor, args, languageConfigurationService) {
    if (foldingModel.regions.hasTypes()) {
      setCollapseStateForType(
        foldingModel,
        FoldingRangeKind.Region.value,
        true
      );
    } else {
      const editorModel = editor.getModel();
      if (!editorModel) {
        return;
      }
      const foldingRules = languageConfigurationService.getLanguageConfiguration(
        editorModel.getLanguageId()
      ).foldingRules;
      if (foldingRules && foldingRules.markers && foldingRules.markers.start) {
        const regExp = new RegExp(foldingRules.markers.start);
        setCollapseStateForMatchingLines(foldingModel, regExp, true);
      }
    }
  }
}
class UnfoldAllRegionsAction extends FoldingAction {
  static {
    __name(this, "UnfoldAllRegionsAction");
  }
  constructor() {
    super({
      id: "editor.unfoldAllMarkerRegions",
      label: nls.localize(
        "unfoldAllMarkerRegions.label",
        "Unfold All Regions"
      ),
      alias: "Unfold All Regions",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.Digit9
        ),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  invoke(_foldingController, foldingModel, editor, args, languageConfigurationService) {
    if (foldingModel.regions.hasTypes()) {
      setCollapseStateForType(
        foldingModel,
        FoldingRangeKind.Region.value,
        false
      );
    } else {
      const editorModel = editor.getModel();
      if (!editorModel) {
        return;
      }
      const foldingRules = languageConfigurationService.getLanguageConfiguration(
        editorModel.getLanguageId()
      ).foldingRules;
      if (foldingRules && foldingRules.markers && foldingRules.markers.start) {
        const regExp = new RegExp(foldingRules.markers.start);
        setCollapseStateForMatchingLines(foldingModel, regExp, false);
      }
    }
  }
}
class FoldAllExceptAction extends FoldingAction {
  static {
    __name(this, "FoldAllExceptAction");
  }
  constructor() {
    super({
      id: "editor.foldAllExcept",
      label: nls.localize(
        "foldAllExcept.label",
        "Fold All Except Selected"
      ),
      alias: "Fold All Except Selected",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.Minus
        ),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const selectedLines = this.getSelectedLines(editor);
    setCollapseStateForRest(foldingModel, true, selectedLines);
  }
}
class UnfoldAllExceptAction extends FoldingAction {
  static {
    __name(this, "UnfoldAllExceptAction");
  }
  constructor() {
    super({
      id: "editor.unfoldAllExcept",
      label: nls.localize(
        "unfoldAllExcept.label",
        "Unfold All Except Selected"
      ),
      alias: "Unfold All Except Selected",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.Equal
        ),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const selectedLines = this.getSelectedLines(editor);
    setCollapseStateForRest(foldingModel, false, selectedLines);
  }
}
class FoldAllAction extends FoldingAction {
  static {
    __name(this, "FoldAllAction");
  }
  constructor() {
    super({
      id: "editor.foldAll",
      label: nls.localize("foldAllAction.label", "Fold All"),
      alias: "Fold All",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.Digit0
        ),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  invoke(_foldingController, foldingModel, _editor) {
    setCollapseStateLevelsDown(foldingModel, true);
  }
}
class UnfoldAllAction extends FoldingAction {
  static {
    __name(this, "UnfoldAllAction");
  }
  constructor() {
    super({
      id: "editor.unfoldAll",
      label: nls.localize("unfoldAllAction.label", "Unfold All"),
      alias: "Unfold All",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.KeyJ
        ),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  invoke(_foldingController, foldingModel, _editor) {
    setCollapseStateLevelsDown(foldingModel, false);
  }
}
class FoldLevelAction extends FoldingAction {
  static {
    __name(this, "FoldLevelAction");
  }
  static ID_PREFIX = "editor.foldLevel";
  static ID = /* @__PURE__ */ __name((level) => FoldLevelAction.ID_PREFIX + level, "ID");
  getFoldingLevel() {
    return Number.parseInt(
      this.id.substr(FoldLevelAction.ID_PREFIX.length)
    );
  }
  invoke(_foldingController, foldingModel, editor) {
    setCollapseStateAtLevel(
      foldingModel,
      this.getFoldingLevel(),
      true,
      this.getSelectedLines(editor)
    );
  }
}
class GotoParentFoldAction extends FoldingAction {
  static {
    __name(this, "GotoParentFoldAction");
  }
  constructor() {
    super({
      id: "editor.gotoParentFold",
      label: nls.localize("gotoParentFold.label", "Go to Parent Fold"),
      alias: "Go to Parent Fold",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const selectedLines = this.getSelectedLines(editor);
    if (selectedLines.length > 0) {
      const startLineNumber = getParentFoldLine(
        selectedLines[0],
        foldingModel
      );
      if (startLineNumber !== null) {
        editor.setSelection({
          startLineNumber,
          startColumn: 1,
          endLineNumber: startLineNumber,
          endColumn: 1
        });
      }
    }
  }
}
class GotoPreviousFoldAction extends FoldingAction {
  static {
    __name(this, "GotoPreviousFoldAction");
  }
  constructor() {
    super({
      id: "editor.gotoPreviousFold",
      label: nls.localize(
        "gotoPreviousFold.label",
        "Go to Previous Folding Range"
      ),
      alias: "Go to Previous Folding Range",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const selectedLines = this.getSelectedLines(editor);
    if (selectedLines.length > 0) {
      const startLineNumber = getPreviousFoldLine(
        selectedLines[0],
        foldingModel
      );
      if (startLineNumber !== null) {
        editor.setSelection({
          startLineNumber,
          startColumn: 1,
          endLineNumber: startLineNumber,
          endColumn: 1
        });
      }
    }
  }
}
class GotoNextFoldAction extends FoldingAction {
  static {
    __name(this, "GotoNextFoldAction");
  }
  constructor() {
    super({
      id: "editor.gotoNextFold",
      label: nls.localize(
        "gotoNextFold.label",
        "Go to Next Folding Range"
      ),
      alias: "Go to Next Folding Range",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const selectedLines = this.getSelectedLines(editor);
    if (selectedLines.length > 0) {
      const startLineNumber = getNextFoldLine(
        selectedLines[0],
        foldingModel
      );
      if (startLineNumber !== null) {
        editor.setSelection({
          startLineNumber,
          startColumn: 1,
          endLineNumber: startLineNumber,
          endColumn: 1
        });
      }
    }
  }
}
class FoldRangeFromSelectionAction extends FoldingAction {
  static {
    __name(this, "FoldRangeFromSelectionAction");
  }
  constructor() {
    super({
      id: "editor.createFoldingRangeFromSelection",
      label: nls.localize(
        "createManualFoldRange.label",
        "Create Folding Range from Selection"
      ),
      alias: "Create Folding Range from Selection",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.Comma
        ),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  invoke(_foldingController, foldingModel, editor) {
    const collapseRanges = [];
    const selections = editor.getSelections();
    if (selections) {
      for (const selection of selections) {
        let endLineNumber = selection.endLineNumber;
        if (selection.endColumn === 1) {
          --endLineNumber;
        }
        if (endLineNumber > selection.startLineNumber) {
          collapseRanges.push({
            startLineNumber: selection.startLineNumber,
            endLineNumber,
            type: void 0,
            isCollapsed: true,
            source: FoldSource.userDefined
          });
          editor.setSelection({
            startLineNumber: selection.startLineNumber,
            startColumn: 1,
            endLineNumber: selection.startLineNumber,
            endColumn: 1
          });
        }
      }
      if (collapseRanges.length > 0) {
        collapseRanges.sort((a, b) => {
          return a.startLineNumber - b.startLineNumber;
        });
        const newRanges = FoldingRegions.sanitizeAndMerge(
          foldingModel.regions,
          collapseRanges,
          editor.getModel()?.getLineCount()
        );
        foldingModel.updatePost(
          FoldingRegions.fromFoldRanges(newRanges)
        );
      }
    }
  }
}
class RemoveFoldRangeFromSelectionAction extends FoldingAction {
  static {
    __name(this, "RemoveFoldRangeFromSelectionAction");
  }
  constructor() {
    super({
      id: "editor.removeManualFoldingRanges",
      label: nls.localize(
        "removeManualFoldingRanges.label",
        "Remove Manual Folding Ranges"
      ),
      alias: "Remove Manual Folding Ranges",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.Period
        ),
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  invoke(foldingController, foldingModel, editor) {
    const selections = editor.getSelections();
    if (selections) {
      const ranges = [];
      for (const selection of selections) {
        const { startLineNumber, endLineNumber } = selection;
        ranges.push(
          endLineNumber >= startLineNumber ? { startLineNumber, endLineNumber } : { endLineNumber, startLineNumber }
        );
      }
      foldingModel.removeManualRanges(ranges);
      foldingController.triggerFoldingModelChanged();
    }
  }
}
class ToggleImportFoldAction extends FoldingAction {
  static {
    __name(this, "ToggleImportFoldAction");
  }
  constructor() {
    super({
      id: "editor.toggleImportFold",
      label: nls.localize("toggleImportFold.label", "Toggle Import Fold"),
      alias: "Toggle Import Fold",
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  async invoke(foldingController, foldingModel) {
    const regionsToToggle = [];
    const regions = foldingModel.regions;
    for (let i = regions.length - 1; i >= 0; i--) {
      if (regions.getType(i) === FoldingRangeKind.Imports.value) {
        regionsToToggle.push(regions.toRegion(i));
      }
    }
    foldingModel.toggleCollapseState(regionsToToggle);
    foldingController.triggerFoldingModelChanged();
  }
}
registerEditorContribution(
  FoldingController.ID,
  FoldingController,
  EditorContributionInstantiation.Eager
);
registerEditorAction(UnfoldAction);
registerEditorAction(UnFoldRecursivelyAction);
registerEditorAction(FoldAction);
registerEditorAction(FoldRecursivelyAction);
registerEditorAction(ToggleFoldRecursivelyAction);
registerEditorAction(FoldAllAction);
registerEditorAction(UnfoldAllAction);
registerEditorAction(FoldAllBlockCommentsAction);
registerEditorAction(FoldAllRegionsAction);
registerEditorAction(UnfoldAllRegionsAction);
registerEditorAction(FoldAllExceptAction);
registerEditorAction(UnfoldAllExceptAction);
registerEditorAction(ToggleFoldAction);
registerEditorAction(GotoParentFoldAction);
registerEditorAction(GotoPreviousFoldAction);
registerEditorAction(GotoNextFoldAction);
registerEditorAction(FoldRangeFromSelectionAction);
registerEditorAction(RemoveFoldRangeFromSelectionAction);
registerEditorAction(ToggleImportFoldAction);
for (let i = 1; i <= 7; i++) {
  registerInstantiatedEditorAction(
    new FoldLevelAction({
      id: FoldLevelAction.ID(i),
      label: nls.localize("foldLevelAction.label", "Fold Level {0}", i),
      alias: `Fold Level ${i}`,
      precondition: CONTEXT_FOLDING_ENABLED,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.Digit0 + i
        ),
        weight: KeybindingWeight.EditorContrib
      }
    })
  );
}
CommandsRegistry.registerCommand(
  "_executeFoldingRangeProvider",
  async (accessor, ...args) => {
    const [resource] = args;
    if (!(resource instanceof URI)) {
      throw illegalArgument();
    }
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const model = accessor.get(IModelService).getModel(resource);
    if (!model) {
      throw illegalArgument();
    }
    const configurationService = accessor.get(IConfigurationService);
    if (!configurationService.getValue("editor.folding", { resource })) {
      return [];
    }
    const languageConfigurationService = accessor.get(
      ILanguageConfigurationService
    );
    const strategy = configurationService.getValue(
      "editor.foldingStrategy",
      { resource }
    );
    const foldingLimitReporter = {
      get limit() {
        return configurationService.getValue(
          "editor.foldingMaximumRegions",
          { resource }
        );
      },
      update: /* @__PURE__ */ __name((computed, limited) => {
      }, "update")
    };
    const indentRangeProvider = new IndentRangeProvider(
      model,
      languageConfigurationService,
      foldingLimitReporter
    );
    let rangeProvider = indentRangeProvider;
    if (strategy !== "indentation") {
      const providers = FoldingController.getFoldingRangeProviders(
        languageFeaturesService,
        model
      );
      if (providers.length) {
        rangeProvider = new SyntaxRangeProvider(
          model,
          providers,
          () => {
          },
          foldingLimitReporter,
          indentRangeProvider
        );
      }
    }
    const ranges = await rangeProvider.compute(CancellationToken.None);
    const result = [];
    try {
      if (ranges) {
        for (let i = 0; i < ranges.length; i++) {
          const type = ranges.getType(i);
          result.push({
            start: ranges.getStartLineNumber(i),
            end: ranges.getEndLineNumber(i),
            kind: type ? FoldingRangeKind.fromValue(type) : void 0
          });
        }
      }
      return result;
    } finally {
      rangeProvider.dispose();
    }
  }
);
export {
  FoldingController,
  RangesLimitReporter,
  toSelectedLines
};
//# sourceMappingURL=folding.js.map
