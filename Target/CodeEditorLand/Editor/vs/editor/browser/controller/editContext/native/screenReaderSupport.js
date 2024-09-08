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
import { getActiveWindow } from "../../../../../base/browser/dom.js";
import { AccessibilitySupport } from "../../../../../platform/accessibility/common/accessibility.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { EditorOption } from "../../../../common/config/editorOptions.js";
import { Selection } from "../../../../common/core/selection.js";
import { applyFontInfo } from "../../../config/domFontInfo.js";
import {
  PagedScreenReaderStrategy,
  ariaLabelForScreenReaderContent,
  newlinecount
} from "../screenReaderUtils.js";
let ScreenReaderSupport = class {
  constructor(_domNode, _context, _keybindingService) {
    this._domNode = _domNode;
    this._context = _context;
    this._keybindingService = _keybindingService;
    this._updateConfigurationSettings();
    this._updateDomAttributes();
  }
  // Configuration values
  _contentLeft = 1;
  _contentWidth = 1;
  _lineHeight = 1;
  _fontInfo;
  _accessibilitySupport = AccessibilitySupport.Unknown;
  _accessibilityPageSize = 1;
  _primarySelection = new Selection(1, 1, 1, 1);
  _screenReaderContentState;
  onConfigurationChanged(e) {
    this._updateConfigurationSettings();
    this._updateDomAttributes();
    if (e.hasChanged(EditorOption.accessibilitySupport)) {
      this.writeScreenReaderContent();
    }
  }
  _updateConfigurationSettings() {
    const options = this._context.configuration.options;
    const layoutInfo = options.get(EditorOption.layoutInfo);
    this._contentLeft = layoutInfo.contentLeft;
    this._contentWidth = layoutInfo.contentWidth;
    this._fontInfo = options.get(EditorOption.fontInfo);
    this._lineHeight = options.get(EditorOption.lineHeight);
    this._accessibilitySupport = options.get(
      EditorOption.accessibilitySupport
    );
    this._accessibilityPageSize = options.get(
      EditorOption.accessibilityPageSize
    );
  }
  _updateDomAttributes() {
    const options = this._context.configuration.options;
    this._domNode.domNode.setAttribute(
      "aria-label",
      ariaLabelForScreenReaderContent(options, this._keybindingService)
    );
    const tabSize = this._context.viewModel.model.getOptions().tabSize;
    const spaceWidth = options.get(EditorOption.fontInfo).spaceWidth;
    this._domNode.domNode.style.tabSize = `${tabSize * spaceWidth}px`;
  }
  onCursorStateChanged(e) {
    this._primarySelection = e.selections[0] ?? new Selection(1, 1, 1, 1);
  }
  prepareRender(ctx) {
    this.writeScreenReaderContent();
  }
  render(ctx) {
    if (!this._screenReaderContentState) {
      return;
    }
    applyFontInfo(this._domNode, this._fontInfo);
    const verticalOffsetForPrimaryLineNumber = this._context.viewLayout.getVerticalOffsetForLineNumber(
      this._primarySelection.positionLineNumber
    );
    const editorScrollTop = this._context.viewLayout.getCurrentScrollTop();
    const top = verticalOffsetForPrimaryLineNumber - editorScrollTop;
    this._domNode.setTop(top);
    this._domNode.setLeft(this._contentLeft);
    this._domNode.setWidth(this._contentWidth);
    this._domNode.setHeight(this._lineHeight);
    const textContentBeforeSelection = this._screenReaderContentState.value.substring(
      0,
      this._screenReaderContentState.selectionStart
    );
    const numberOfLinesOfContentBeforeSelection = newlinecount(
      textContentBeforeSelection
    );
    this._domNode.domNode.scrollTop = numberOfLinesOfContentBeforeSelection * this._lineHeight;
  }
  setAriaOptions() {
  }
  writeScreenReaderContent() {
    this._screenReaderContentState = this._getScreenReaderContentState();
    if (!this._screenReaderContentState) {
      return;
    }
    if (this._domNode.domNode.textContent !== this._screenReaderContentState.value) {
      this._domNode.domNode.textContent = this._screenReaderContentState.value;
    }
    this._setSelectionOfScreenReaderContent(
      this._screenReaderContentState.selectionStart,
      this._screenReaderContentState.selectionEnd
    );
  }
  _getScreenReaderContentState() {
    const accessibilityPageSize = this._accessibilitySupport === AccessibilitySupport.Disabled ? 1 : this._accessibilityPageSize;
    const simpleModel = {
      getLineCount: () => {
        return this._context.viewModel.getLineCount();
      },
      getLineMaxColumn: (lineNumber) => {
        return this._context.viewModel.getLineMaxColumn(lineNumber);
      },
      getValueInRange: (range, eol) => {
        return this._context.viewModel.getValueInRange(range, eol);
      },
      getValueLengthInRange: (range, eol) => {
        return this._context.viewModel.getValueLengthInRange(
          range,
          eol
        );
      },
      modifyPosition: (position, offset) => {
        return this._context.viewModel.modifyPosition(position, offset);
      }
    };
    return PagedScreenReaderStrategy.fromEditorSelection(
      simpleModel,
      this._primarySelection,
      accessibilityPageSize,
      this._accessibilitySupport === AccessibilitySupport.Unknown
    );
  }
  _setSelectionOfScreenReaderContent(selectionOffsetStart, selectionOffsetEnd) {
    const activeDocument = getActiveWindow().document;
    const activeDocumentSelection = activeDocument.getSelection();
    if (!activeDocumentSelection) {
      return;
    }
    const textContent = this._domNode.domNode.firstChild;
    if (!textContent) {
      return;
    }
    const range = new globalThis.Range();
    range.setStart(textContent, selectionOffsetStart);
    range.setEnd(textContent, selectionOffsetEnd);
    activeDocumentSelection.removeAllRanges();
    activeDocumentSelection.addRange(range);
  }
};
ScreenReaderSupport = __decorateClass([
  __decorateParam(2, IKeybindingService)
], ScreenReaderSupport);
export {
  ScreenReaderSupport
};
