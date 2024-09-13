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
import * as arrays from "../../../../base/common/arrays.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { onUnexpectedExternalError } from "../../../../base/common/errors.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { assertType } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import * as nls from "../../../../nls.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  EditorAction,
  EditorContributionInstantiation,
  registerEditorAction,
  registerEditorContribution
} from "../../../browser/editorExtensions.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { Selection } from "../../../common/core/selection.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { ITextModelService } from "../../../common/services/resolverService.js";
import { BracketSelectionRangeProvider } from "./bracketSelections.js";
import { WordSelectionRangeProvider } from "./wordSelections.js";
class SelectionRanges {
  constructor(index, ranges) {
    this.index = index;
    this.ranges = ranges;
  }
  static {
    __name(this, "SelectionRanges");
  }
  mov(fwd) {
    const index = this.index + (fwd ? 1 : -1);
    if (index < 0 || index >= this.ranges.length) {
      return this;
    }
    const res = new SelectionRanges(index, this.ranges);
    if (res.ranges[index].equalsRange(this.ranges[this.index])) {
      return res.mov(fwd);
    }
    return res;
  }
}
let SmartSelectController = class {
  constructor(_editor, _languageFeaturesService) {
    this._editor = _editor;
    this._languageFeaturesService = _languageFeaturesService;
  }
  static {
    __name(this, "SmartSelectController");
  }
  static ID = "editor.contrib.smartSelectController";
  static get(editor) {
    return editor.getContribution(
      SmartSelectController.ID
    );
  }
  _state;
  _selectionListener;
  _ignoreSelection = false;
  dispose() {
    this._selectionListener?.dispose();
  }
  async run(forward) {
    if (!this._editor.hasModel()) {
      return;
    }
    const selections = this._editor.getSelections();
    const model = this._editor.getModel();
    if (!this._state) {
      await provideSelectionRanges(
        this._languageFeaturesService.selectionRangeProvider,
        model,
        selections.map((s) => s.getPosition()),
        this._editor.getOption(EditorOption.smartSelect),
        CancellationToken.None
      ).then((ranges) => {
        if (!arrays.isNonEmptyArray(ranges) || ranges.length !== selections.length) {
          return;
        }
        if (!this._editor.hasModel() || !arrays.equals(
          this._editor.getSelections(),
          selections,
          (a, b) => a.equalsSelection(b)
        )) {
          return;
        }
        for (let i = 0; i < ranges.length; i++) {
          ranges[i] = ranges[i].filter((range) => {
            return range.containsPosition(
              selections[i].getStartPosition()
            ) && range.containsPosition(
              selections[i].getEndPosition()
            );
          });
          ranges[i].unshift(selections[i]);
        }
        this._state = ranges.map(
          (ranges2) => new SelectionRanges(0, ranges2)
        );
        this._selectionListener?.dispose();
        this._selectionListener = this._editor.onDidChangeCursorPosition(() => {
          if (!this._ignoreSelection) {
            this._selectionListener?.dispose();
            this._state = void 0;
          }
        });
      });
    }
    if (!this._state) {
      return;
    }
    this._state = this._state.map((state) => state.mov(forward));
    const newSelections = this._state.map(
      (state) => Selection.fromPositions(
        state.ranges[state.index].getStartPosition(),
        state.ranges[state.index].getEndPosition()
      )
    );
    this._ignoreSelection = true;
    try {
      this._editor.setSelections(newSelections);
    } finally {
      this._ignoreSelection = false;
    }
  }
};
SmartSelectController = __decorateClass([
  __decorateParam(1, ILanguageFeaturesService)
], SmartSelectController);
class AbstractSmartSelect extends EditorAction {
  static {
    __name(this, "AbstractSmartSelect");
  }
  _forward;
  constructor(forward, opts) {
    super(opts);
    this._forward = forward;
  }
  async run(_accessor, editor) {
    const controller = SmartSelectController.get(editor);
    if (controller) {
      await controller.run(this._forward);
    }
  }
}
class GrowSelectionAction extends AbstractSmartSelect {
  static {
    __name(this, "GrowSelectionAction");
  }
  constructor() {
    super(true, {
      id: "editor.action.smartSelect.expand",
      label: nls.localize("smartSelect.expand", "Expand Selection"),
      alias: "Expand Selection",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.Shift | KeyMod.Alt | KeyCode.RightArrow,
        mac: {
          primary: KeyMod.CtrlCmd | KeyMod.WinCtrl | KeyMod.Shift | KeyCode.RightArrow,
          secondary: [
            KeyMod.WinCtrl | KeyMod.Shift | KeyCode.RightArrow
          ]
        },
        weight: KeybindingWeight.EditorContrib
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "1_basic",
        title: nls.localize(
          {
            key: "miSmartSelectGrow",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Expand Selection"
        ),
        order: 2
      }
    });
  }
}
CommandsRegistry.registerCommandAlias(
  "editor.action.smartSelect.grow",
  "editor.action.smartSelect.expand"
);
class ShrinkSelectionAction extends AbstractSmartSelect {
  static {
    __name(this, "ShrinkSelectionAction");
  }
  constructor() {
    super(false, {
      id: "editor.action.smartSelect.shrink",
      label: nls.localize("smartSelect.shrink", "Shrink Selection"),
      alias: "Shrink Selection",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyMod.Shift | KeyMod.Alt | KeyCode.LeftArrow,
        mac: {
          primary: KeyMod.CtrlCmd | KeyMod.WinCtrl | KeyMod.Shift | KeyCode.LeftArrow,
          secondary: [
            KeyMod.WinCtrl | KeyMod.Shift | KeyCode.LeftArrow
          ]
        },
        weight: KeybindingWeight.EditorContrib
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "1_basic",
        title: nls.localize(
          {
            key: "miSmartSelectShrink",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Shrink Selection"
        ),
        order: 3
      }
    });
  }
}
registerEditorContribution(
  SmartSelectController.ID,
  SmartSelectController,
  EditorContributionInstantiation.Lazy
);
registerEditorAction(GrowSelectionAction);
registerEditorAction(ShrinkSelectionAction);
async function provideSelectionRanges(registry, model, positions, options, token) {
  const providers = registry.all(model).concat(new WordSelectionRangeProvider(options.selectSubwords));
  if (providers.length === 1) {
    providers.unshift(new BracketSelectionRangeProvider());
  }
  const work = [];
  const allRawRanges = [];
  for (const provider of providers) {
    work.push(
      Promise.resolve(
        provider.provideSelectionRanges(model, positions, token)
      ).then((allProviderRanges) => {
        if (arrays.isNonEmptyArray(allProviderRanges) && allProviderRanges.length === positions.length) {
          for (let i = 0; i < positions.length; i++) {
            if (!allRawRanges[i]) {
              allRawRanges[i] = [];
            }
            for (const oneProviderRanges of allProviderRanges[i]) {
              if (Range.isIRange(oneProviderRanges.range) && Range.containsPosition(
                oneProviderRanges.range,
                positions[i]
              )) {
                allRawRanges[i].push(
                  Range.lift(oneProviderRanges.range)
                );
              }
            }
          }
        }
      }, onUnexpectedExternalError)
    );
  }
  await Promise.all(work);
  return allRawRanges.map((oneRawRanges) => {
    if (oneRawRanges.length === 0) {
      return [];
    }
    oneRawRanges.sort((a, b) => {
      if (Position.isBefore(a.getStartPosition(), b.getStartPosition())) {
        return 1;
      } else if (Position.isBefore(b.getStartPosition(), a.getStartPosition())) {
        return -1;
      } else if (Position.isBefore(a.getEndPosition(), b.getEndPosition())) {
        return -1;
      } else if (Position.isBefore(b.getEndPosition(), a.getEndPosition())) {
        return 1;
      } else {
        return 0;
      }
    });
    const oneRanges = [];
    let last;
    for (const range of oneRawRanges) {
      if (!last || Range.containsRange(range, last) && !Range.equalsRange(range, last)) {
        oneRanges.push(range);
        last = range;
      }
    }
    if (!options.selectLeadingAndTrailingWhitespace) {
      return oneRanges;
    }
    const oneRangesWithTrivia = [oneRanges[0]];
    for (let i = 1; i < oneRanges.length; i++) {
      const prev = oneRanges[i - 1];
      const cur = oneRanges[i];
      if (cur.startLineNumber !== prev.startLineNumber || cur.endLineNumber !== prev.endLineNumber) {
        const rangeNoWhitespace = new Range(
          prev.startLineNumber,
          model.getLineFirstNonWhitespaceColumn(prev.startLineNumber),
          prev.endLineNumber,
          model.getLineLastNonWhitespaceColumn(prev.endLineNumber)
        );
        if (rangeNoWhitespace.containsRange(prev) && !rangeNoWhitespace.equalsRange(prev) && cur.containsRange(rangeNoWhitespace) && !cur.equalsRange(rangeNoWhitespace)) {
          oneRangesWithTrivia.push(rangeNoWhitespace);
        }
        const rangeFull = new Range(
          prev.startLineNumber,
          1,
          prev.endLineNumber,
          model.getLineMaxColumn(prev.endLineNumber)
        );
        if (rangeFull.containsRange(prev) && !rangeFull.equalsRange(rangeNoWhitespace) && cur.containsRange(rangeFull) && !cur.equalsRange(rangeFull)) {
          oneRangesWithTrivia.push(rangeFull);
        }
      }
      oneRangesWithTrivia.push(cur);
    }
    return oneRangesWithTrivia;
  });
}
__name(provideSelectionRanges, "provideSelectionRanges");
CommandsRegistry.registerCommand(
  "_executeSelectionRangeProvider",
  async (accessor, ...args) => {
    const [resource, positions] = args;
    assertType(URI.isUri(resource));
    const registry = accessor.get(
      ILanguageFeaturesService
    ).selectionRangeProvider;
    const reference = await accessor.get(ITextModelService).createModelReference(resource);
    try {
      return provideSelectionRanges(
        registry,
        reference.object.textEditorModel,
        positions,
        {
          selectLeadingAndTrailingWhitespace: true,
          selectSubwords: true
        },
        CancellationToken.None
      );
    } finally {
      reference.dispose();
    }
  }
);
export {
  SmartSelectController,
  provideSelectionRanges
};
//# sourceMappingURL=smartSelect.js.map
