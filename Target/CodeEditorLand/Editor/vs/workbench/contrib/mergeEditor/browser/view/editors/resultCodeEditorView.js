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
import { reset } from "../../../../../../base/browser/dom.js";
import { ActionBar } from "../../../../../../base/browser/ui/actionbar/actionbar.js";
import { renderLabelWithIcons } from "../../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { CompareResult } from "../../../../../../base/common/arrays.js";
import { BugIndicatingError } from "../../../../../../base/common/errors.js";
import { toDisposable } from "../../../../../../base/common/lifecycle.js";
import {
  autorun,
  autorunWithStore,
  derived
} from "../../../../../../base/common/observable.js";
import {
  MinimapPosition,
  OverviewRulerLane
} from "../../../../../../editor/common/model.js";
import { localize } from "../../../../../../nls.js";
import { MenuId } from "../../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../../platform/label/common/label.js";
import { ctxIsMergeResultEditor } from "../../../common/mergeEditor.js";
import { LineRange } from "../../model/lineRange.js";
import { applyObservableDecorations, join } from "../../utils.js";
import {
  handledConflictMinimapOverViewRulerColor,
  unhandledConflictMinimapOverViewRulerColor
} from "../colors.js";
import { EditorGutter } from "../editorGutter.js";
import {
  CodeEditorView,
  TitleMenu,
  createSelectionsAutorun
} from "./codeEditorView.js";
let ResultCodeEditorView = class extends CodeEditorView {
  constructor(viewModel, instantiationService, _labelService, configurationService) {
    super(instantiationService, viewModel, configurationService);
    this._labelService = _labelService;
    this.editor.invokeWithinContext((accessor) => {
      const contextKeyService = accessor.get(IContextKeyService);
      const isMergeResultEditor = ctxIsMergeResultEditor.bindTo(contextKeyService);
      isMergeResultEditor.set(true);
      this._register(toDisposable(() => isMergeResultEditor.reset()));
    });
    this.htmlElements.gutterDiv.style.width = "5px";
    this.htmlElements.root.classList.add(`result`);
    this._register(
      autorunWithStore((reader, store) => {
        if (this.checkboxesVisible.read(reader)) {
          store.add(new EditorGutter(this.editor, this.htmlElements.gutterDiv, {
            getIntersectingGutterItems: (range, reader2) => [],
            createView: (item, target) => {
              throw new BugIndicatingError();
            }
          }));
        }
      })
    );
    this._register(autorun((reader) => {
      const vm = this.viewModel.read(reader);
      if (!vm) {
        return;
      }
      this.editor.setModel(vm.model.resultTextModel);
      reset(this.htmlElements.title, ...renderLabelWithIcons(localize("result", "Result")));
      reset(this.htmlElements.description, ...renderLabelWithIcons(this._labelService.getUriLabel(vm.model.resultTextModel.uri, { relative: true })));
    }));
    const remainingConflictsActionBar = this._register(new ActionBar(this.htmlElements.detail));
    this._register(autorun((reader) => {
      const vm = this.viewModel.read(reader);
      if (!vm) {
        return;
      }
      const model = vm.model;
      if (!model) {
        return;
      }
      const count = model.unhandledConflictsCount.read(reader);
      const text = count === 1 ? localize(
        "mergeEditor.remainingConflicts",
        "{0} Conflict Remaining",
        count
      ) : localize(
        "mergeEditor.remainingConflict",
        "{0} Conflicts Remaining ",
        count
      );
      remainingConflictsActionBar.clear();
      remainingConflictsActionBar.push({
        class: void 0,
        enabled: count > 0,
        id: "nextConflict",
        label: text,
        run() {
          vm.model.telemetry.reportConflictCounterClicked();
          vm.goToNextModifiedBaseRange((m) => !model.isHandled(m).get());
        },
        tooltip: count > 0 ? localize("goToNextConflict", "Go to next conflict") : localize("allConflictHandled", "All conflicts handled, the merge can be completed now.")
      });
    }));
    this._register(applyObservableDecorations(this.editor, this.decorations));
    this._register(
      createSelectionsAutorun(
        this,
        (baseRange, viewModel2) => viewModel2.model.translateBaseRangeToResult(baseRange)
      )
    );
    this._register(
      instantiationService.createInstance(
        TitleMenu,
        MenuId.MergeInputResultToolbar,
        this.htmlElements.toolbar
      )
    );
  }
  decorations = derived(this, (reader) => {
    const viewModel = this.viewModel.read(reader);
    if (!viewModel) {
      return [];
    }
    const model = viewModel.model;
    const textModel = model.resultTextModel;
    const result = new Array();
    const baseRangeWithStoreAndTouchingDiffs = join(
      model.modifiedBaseRanges.read(reader),
      model.baseResultDiffs.read(reader),
      (baseRange, diff) => baseRange.baseRange.touches(diff.inputRange) ? CompareResult.neitherLessOrGreaterThan : LineRange.compareByStart(
        baseRange.baseRange,
        diff.inputRange
      )
    );
    const activeModifiedBaseRange = viewModel.activeModifiedBaseRange.read(reader);
    const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
    for (const m of baseRangeWithStoreAndTouchingDiffs) {
      const modifiedBaseRange = m.left;
      if (modifiedBaseRange) {
        const blockClassNames = ["merge-editor-block"];
        let blockPadding = [0, 0, 0, 0];
        const isHandled = model.isHandled(modifiedBaseRange).read(reader);
        if (isHandled) {
          blockClassNames.push("handled");
        }
        if (modifiedBaseRange === activeModifiedBaseRange) {
          blockClassNames.push("focused");
          blockPadding = [0, 2, 0, 2];
        }
        if (modifiedBaseRange.isConflicting) {
          blockClassNames.push("conflicting");
        }
        blockClassNames.push("result");
        if (!modifiedBaseRange.isConflicting && !showNonConflictingChanges && isHandled) {
          continue;
        }
        const range = model.getLineRangeInResult(
          modifiedBaseRange.baseRange,
          reader
        );
        result.push({
          range: range.toInclusiveRangeOrEmpty(),
          options: {
            showIfCollapsed: true,
            blockClassName: blockClassNames.join(" "),
            blockPadding,
            blockIsAfterEnd: range.startLineNumber > textModel.getLineCount(),
            description: "Result Diff",
            minimap: {
              position: MinimapPosition.Gutter,
              color: {
                id: isHandled ? handledConflictMinimapOverViewRulerColor : unhandledConflictMinimapOverViewRulerColor
              }
            },
            overviewRuler: modifiedBaseRange.isConflicting ? {
              position: OverviewRulerLane.Center,
              color: {
                id: isHandled ? handledConflictMinimapOverViewRulerColor : unhandledConflictMinimapOverViewRulerColor
              }
            } : void 0
          }
        });
      }
      if (!modifiedBaseRange || modifiedBaseRange.isConflicting) {
        for (const diff of m.rights) {
          const range = diff.outputRange.toInclusiveRange();
          if (range) {
            result.push({
              range,
              options: {
                className: `merge-editor-diff result`,
                description: "Merge Editor",
                isWholeLine: true
              }
            });
          }
          if (diff.rangeMappings) {
            for (const d of diff.rangeMappings) {
              result.push({
                range: d.outputRange,
                options: {
                  className: `merge-editor-diff-word result`,
                  description: "Merge Editor"
                }
              });
            }
          }
        }
      }
    }
    return result;
  });
};
ResultCodeEditorView = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILabelService),
  __decorateParam(3, IConfigurationService)
], ResultCodeEditorView);
export {
  ResultCodeEditorView
};
