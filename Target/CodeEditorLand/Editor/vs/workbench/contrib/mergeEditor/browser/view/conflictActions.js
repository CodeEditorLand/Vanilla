var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { $, createStyleSheet, h, isInShadowDOM, reset } from "../../../../../base/browser/dom.js";
import { renderLabelWithIcons } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { hash } from "../../../../../base/common/hash.js";
import { Disposable, IDisposable } from "../../../../../base/common/lifecycle.js";
import { autorun, derived, IObservable, transaction } from "../../../../../base/common/observable.js";
import { ICodeEditor, IViewZoneChangeAccessor } from "../../../../../editor/browser/editorBrowser.js";
import { EditorOption, EDITOR_FONT_DEFAULTS } from "../../../../../editor/common/config/editorOptions.js";
import { localize } from "../../../../../nls.js";
import { ModifiedBaseRange, ModifiedBaseRangeState, ModifiedBaseRangeStateKind } from "../model/modifiedBaseRange.js";
import { FixedZoneWidget } from "./fixedZoneWidget.js";
import { MergeEditorViewModel } from "./viewModel.js";
class ConflictActionsFactory extends Disposable {
  constructor(_editor) {
    super();
    this._editor = _editor;
    this._register(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.fontInfo) || e.hasChanged(EditorOption.codeLensFontSize) || e.hasChanged(EditorOption.codeLensFontFamily)) {
        this._updateLensStyle();
      }
    }));
    this._styleClassName = "_conflictActionsFactory_" + hash(this._editor.getId()).toString(16);
    this._styleElement = createStyleSheet(
      isInShadowDOM(this._editor.getContainerDomNode()) ? this._editor.getContainerDomNode() : void 0,
      void 0,
      this._store
    );
    this._updateLensStyle();
  }
  static {
    __name(this, "ConflictActionsFactory");
  }
  _styleClassName;
  _styleElement;
  _updateLensStyle() {
    const { codeLensHeight, fontSize } = this._getLayoutInfo();
    const fontFamily = this._editor.getOption(EditorOption.codeLensFontFamily);
    const editorFontInfo = this._editor.getOption(EditorOption.fontInfo);
    const fontFamilyVar = `--codelens-font-family${this._styleClassName}`;
    const fontFeaturesVar = `--codelens-font-features${this._styleClassName}`;
    let newStyle = `
		.${this._styleClassName} { line-height: ${codeLensHeight}px; font-size: ${fontSize}px; padding-right: ${Math.round(fontSize * 0.5)}px; font-feature-settings: var(${fontFeaturesVar}) }
		.monaco-workbench .${this._styleClassName} span.codicon { line-height: ${codeLensHeight}px; font-size: ${fontSize}px; }
		`;
    if (fontFamily) {
      newStyle += `${this._styleClassName} { font-family: var(${fontFamilyVar}), ${EDITOR_FONT_DEFAULTS.fontFamily}}`;
    }
    this._styleElement.textContent = newStyle;
    this._editor.getContainerDomNode().style?.setProperty(fontFamilyVar, fontFamily ?? "inherit");
    this._editor.getContainerDomNode().style?.setProperty(fontFeaturesVar, editorFontInfo.fontFeatureSettings);
  }
  _getLayoutInfo() {
    const lineHeightFactor = Math.max(1.3, this._editor.getOption(EditorOption.lineHeight) / this._editor.getOption(EditorOption.fontSize));
    let fontSize = this._editor.getOption(EditorOption.codeLensFontSize);
    if (!fontSize || fontSize < 5) {
      fontSize = this._editor.getOption(EditorOption.fontSize) * 0.9 | 0;
    }
    return {
      fontSize,
      codeLensHeight: fontSize * lineHeightFactor | 0
    };
  }
  createWidget(viewZoneChangeAccessor, lineNumber, items, viewZoneIdsToCleanUp) {
    const layoutInfo = this._getLayoutInfo();
    return new ActionsContentWidget(
      this._editor,
      viewZoneChangeAccessor,
      lineNumber,
      layoutInfo.codeLensHeight + 2,
      this._styleClassName,
      items,
      viewZoneIdsToCleanUp
    );
  }
}
class ActionsSource {
  constructor(viewModel, modifiedBaseRange) {
    this.viewModel = viewModel;
    this.modifiedBaseRange = modifiedBaseRange;
  }
  static {
    __name(this, "ActionsSource");
  }
  getItemsInput(inputNumber) {
    return derived((reader) => {
      const viewModel = this.viewModel;
      const modifiedBaseRange = this.modifiedBaseRange;
      if (!viewModel.model.hasBaseRange(modifiedBaseRange)) {
        return [];
      }
      const state = viewModel.model.getState(modifiedBaseRange).read(reader);
      const handled = viewModel.model.isHandled(modifiedBaseRange).read(reader);
      const model = viewModel.model;
      const result = [];
      const inputData = inputNumber === 1 ? viewModel.model.input1 : viewModel.model.input2;
      const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
      if (!modifiedBaseRange.isConflicting && handled && !showNonConflictingChanges) {
        return [];
      }
      const otherInputNumber = inputNumber === 1 ? 2 : 1;
      if (state.kind !== ModifiedBaseRangeStateKind.unrecognized && !state.isInputIncluded(inputNumber)) {
        if (!state.isInputIncluded(otherInputNumber) || !this.viewModel.shouldUseAppendInsteadOfAccept.read(reader)) {
          result.push(
            command(localize("accept", "Accept {0}", inputData.title), async () => {
              transaction((tx) => {
                model.setState(
                  modifiedBaseRange,
                  state.withInputValue(inputNumber, true, false),
                  inputNumber,
                  tx
                );
                model.telemetry.reportAcceptInvoked(inputNumber, state.includesInput(otherInputNumber));
              });
            }, localize("acceptTooltip", "Accept {0} in the result document.", inputData.title))
          );
          if (modifiedBaseRange.canBeCombined) {
            const commandName = modifiedBaseRange.isOrderRelevant ? localize("acceptBoth0First", "Accept Combination ({0} First)", inputData.title) : localize("acceptBoth", "Accept Combination");
            result.push(
              command(commandName, async () => {
                transaction((tx) => {
                  model.setState(
                    modifiedBaseRange,
                    ModifiedBaseRangeState.base.withInputValue(inputNumber, true).withInputValue(otherInputNumber, true, true),
                    true,
                    tx
                  );
                  model.telemetry.reportSmartCombinationInvoked(state.includesInput(otherInputNumber));
                });
              }, localize("acceptBothTooltip", "Accept an automatic combination of both sides in the result document."))
            );
          }
        } else {
          result.push(
            command(localize("append", "Append {0}", inputData.title), async () => {
              transaction((tx) => {
                model.setState(
                  modifiedBaseRange,
                  state.withInputValue(inputNumber, true, false),
                  inputNumber,
                  tx
                );
                model.telemetry.reportAcceptInvoked(inputNumber, state.includesInput(otherInputNumber));
              });
            }, localize("appendTooltip", "Append {0} to the result document.", inputData.title))
          );
          if (modifiedBaseRange.canBeCombined) {
            result.push(
              command(localize("combine", "Accept Combination", inputData.title), async () => {
                transaction((tx) => {
                  model.setState(
                    modifiedBaseRange,
                    state.withInputValue(inputNumber, true, true),
                    inputNumber,
                    tx
                  );
                  model.telemetry.reportSmartCombinationInvoked(state.includesInput(otherInputNumber));
                });
              }, localize("acceptBothTooltip", "Accept an automatic combination of both sides in the result document."))
            );
          }
        }
        if (!model.isInputHandled(modifiedBaseRange, inputNumber).read(reader)) {
          result.push(
            command(
              localize("ignore", "Ignore"),
              async () => {
                transaction((tx) => {
                  model.setInputHandled(modifiedBaseRange, inputNumber, true, tx);
                });
              },
              localize("markAsHandledTooltip", "Don't take this side of the conflict.")
            )
          );
        }
      }
      return result;
    });
  }
  itemsInput1 = this.getItemsInput(1);
  itemsInput2 = this.getItemsInput(2);
  resultItems = derived(this, (reader) => {
    const viewModel = this.viewModel;
    const modifiedBaseRange = this.modifiedBaseRange;
    const state = viewModel.model.getState(modifiedBaseRange).read(reader);
    const model = viewModel.model;
    const result = [];
    if (state.kind === ModifiedBaseRangeStateKind.unrecognized) {
      result.push({
        text: localize("manualResolution", "Manual Resolution"),
        tooltip: localize("manualResolutionTooltip", "This conflict has been resolved manually.")
      });
    } else if (state.kind === ModifiedBaseRangeStateKind.base) {
      result.push({
        text: localize("noChangesAccepted", "No Changes Accepted"),
        tooltip: localize(
          "noChangesAcceptedTooltip",
          "The current resolution of this conflict equals the common ancestor of both the right and left changes."
        )
      });
    } else {
      const labels = [];
      if (state.includesInput1) {
        labels.push(model.input1.title);
      }
      if (state.includesInput2) {
        labels.push(model.input2.title);
      }
      if (state.kind === ModifiedBaseRangeStateKind.both && state.firstInput === 2) {
        labels.reverse();
      }
      result.push({
        text: `${labels.join(" + ")}`
      });
    }
    const stateToggles = [];
    if (state.includesInput1) {
      stateToggles.push(
        command(
          localize("remove", "Remove {0}", model.input1.title),
          async () => {
            transaction((tx) => {
              model.setState(
                modifiedBaseRange,
                state.withInputValue(1, false),
                true,
                tx
              );
              model.telemetry.reportRemoveInvoked(1, state.includesInput(2));
            });
          },
          localize("removeTooltip", "Remove {0} from the result document.", model.input1.title)
        )
      );
    }
    if (state.includesInput2) {
      stateToggles.push(
        command(
          localize("remove", "Remove {0}", model.input2.title),
          async () => {
            transaction((tx) => {
              model.setState(
                modifiedBaseRange,
                state.withInputValue(2, false),
                true,
                tx
              );
              model.telemetry.reportRemoveInvoked(2, state.includesInput(1));
            });
          },
          localize("removeTooltip", "Remove {0} from the result document.", model.input2.title)
        )
      );
    }
    if (state.kind === ModifiedBaseRangeStateKind.both && state.firstInput === 2) {
      stateToggles.reverse();
    }
    result.push(...stateToggles);
    if (state.kind === ModifiedBaseRangeStateKind.unrecognized) {
      result.push(
        command(
          localize("resetToBase", "Reset to base"),
          async () => {
            transaction((tx) => {
              model.setState(
                modifiedBaseRange,
                ModifiedBaseRangeState.base,
                true,
                tx
              );
              model.telemetry.reportResetToBaseInvoked();
            });
          },
          localize("resetToBaseTooltip", "Reset this conflict to the common ancestor of both the right and left changes.")
        )
      );
    }
    return result;
  });
  isEmpty = derived(this, (reader) => {
    return this.itemsInput1.read(reader).length + this.itemsInput2.read(reader).length + this.resultItems.read(reader).length === 0;
  });
  inputIsEmpty = derived(this, (reader) => {
    return this.itemsInput1.read(reader).length + this.itemsInput2.read(reader).length === 0;
  });
}
function command(title, action, tooltip) {
  return {
    text: title,
    action,
    tooltip
  };
}
__name(command, "command");
class ActionsContentWidget extends FixedZoneWidget {
  static {
    __name(this, "ActionsContentWidget");
  }
  _domNode = h("div.merge-editor-conflict-actions").root;
  constructor(editor, viewZoneAccessor, afterLineNumber, height, className, items, viewZoneIdsToCleanUp) {
    super(editor, viewZoneAccessor, afterLineNumber, height, viewZoneIdsToCleanUp);
    this.widgetDomNode.appendChild(this._domNode);
    this._domNode.classList.add(className);
    this._register(autorun((reader) => {
      const i = items.read(reader);
      this.setState(i);
    }));
  }
  setState(items) {
    const children = [];
    let isFirst = true;
    for (const item of items) {
      if (isFirst) {
        isFirst = false;
      } else {
        children.push($("span", void 0, "\xA0|\xA0"));
      }
      const title = renderLabelWithIcons(item.text);
      if (item.action) {
        children.push($("a", { title: item.tooltip, role: "button", onclick: /* @__PURE__ */ __name(() => item.action(), "onclick") }, ...title));
      } else {
        children.push($("span", { title: item.tooltip }, ...title));
      }
    }
    reset(this._domNode, ...children);
  }
}
export {
  ActionsSource,
  ConflictActionsFactory
};
//# sourceMappingURL=conflictActions.js.map
