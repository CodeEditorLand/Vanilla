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
import { groupBy } from "../../../../base/common/arrays.js";
import { CharCode } from "../../../../base/common/charCode.js";
import { dispose } from "../../../../base/common/lifecycle.js";
import { getLeadingWhitespace } from "../../../../base/common/strings.js";
import "./snippetSession.css";
import { IActiveCodeEditor } from "../../../browser/editorBrowser.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { EditOperation, ISingleEditOperation } from "../../../common/core/editOperation.js";
import { IPosition } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { Selection } from "../../../common/core/selection.js";
import { TextChange } from "../../../common/core/textChange.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.js";
import { IIdentifiedSingleEditOperation, ITextModel, TrackedRangeStickiness } from "../../../common/model.js";
import { ModelDecorationOptions } from "../../../common/model/textModel.js";
import { OvertypingCapturer } from "../../suggest/browser/suggestOvertypingCapturer.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { Choice, Marker, Placeholder, SnippetParser, Text, TextmateSnippet } from "./snippetParser.js";
import { ClipboardBasedVariableResolver, CommentBasedVariableResolver, CompositeSnippetVariableResolver, ModelBasedVariableResolver, RandomBasedVariableResolver, SelectionBasedVariableResolver, TimeBasedVariableResolver, WorkspaceBasedVariableResolver } from "./snippetVariables.js";
class OneSnippet {
  constructor(_editor, _snippet, _snippetLineLeadingWhitespace) {
    this._editor = _editor;
    this._snippet = _snippet;
    this._snippetLineLeadingWhitespace = _snippetLineLeadingWhitespace;
    this._placeholderGroups = groupBy(_snippet.placeholders, Placeholder.compareByIndex);
    this._placeholderGroupsIdx = -1;
  }
  static {
    __name(this, "OneSnippet");
  }
  _placeholderDecorations;
  _placeholderGroups;
  _offset = -1;
  _placeholderGroupsIdx;
  _nestingLevel = 1;
  static _decor = {
    active: ModelDecorationOptions.register({ description: "snippet-placeholder-1", stickiness: TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges, className: "snippet-placeholder" }),
    inactive: ModelDecorationOptions.register({ description: "snippet-placeholder-2", stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges, className: "snippet-placeholder" }),
    activeFinal: ModelDecorationOptions.register({ description: "snippet-placeholder-3", stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges, className: "finish-snippet-placeholder" }),
    inactiveFinal: ModelDecorationOptions.register({ description: "snippet-placeholder-4", stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges, className: "finish-snippet-placeholder" })
  };
  initialize(textChange) {
    this._offset = textChange.newPosition;
  }
  dispose() {
    if (this._placeholderDecorations) {
      this._editor.removeDecorations([...this._placeholderDecorations.values()]);
    }
    this._placeholderGroups.length = 0;
  }
  _initDecorations() {
    if (this._offset === -1) {
      throw new Error(`Snippet not initialized!`);
    }
    if (this._placeholderDecorations) {
      return;
    }
    this._placeholderDecorations = /* @__PURE__ */ new Map();
    const model = this._editor.getModel();
    this._editor.changeDecorations((accessor) => {
      for (const placeholder of this._snippet.placeholders) {
        const placeholderOffset = this._snippet.offset(placeholder);
        const placeholderLen = this._snippet.fullLen(placeholder);
        const range = Range.fromPositions(
          model.getPositionAt(this._offset + placeholderOffset),
          model.getPositionAt(this._offset + placeholderOffset + placeholderLen)
        );
        const options = placeholder.isFinalTabstop ? OneSnippet._decor.inactiveFinal : OneSnippet._decor.inactive;
        const handle = accessor.addDecoration(range, options);
        this._placeholderDecorations.set(placeholder, handle);
      }
    });
  }
  move(fwd) {
    if (!this._editor.hasModel()) {
      return [];
    }
    this._initDecorations();
    if (this._placeholderGroupsIdx >= 0) {
      const operations = [];
      for (const placeholder of this._placeholderGroups[this._placeholderGroupsIdx]) {
        if (placeholder.transform) {
          const id = this._placeholderDecorations.get(placeholder);
          const range = this._editor.getModel().getDecorationRange(id);
          const currentValue = this._editor.getModel().getValueInRange(range);
          const transformedValueLines = placeholder.transform.resolve(currentValue).split(/\r\n|\r|\n/);
          for (let i = 1; i < transformedValueLines.length; i++) {
            transformedValueLines[i] = this._editor.getModel().normalizeIndentation(this._snippetLineLeadingWhitespace + transformedValueLines[i]);
          }
          operations.push(EditOperation.replace(range, transformedValueLines.join(this._editor.getModel().getEOL())));
        }
      }
      if (operations.length > 0) {
        this._editor.executeEdits("snippet.placeholderTransform", operations);
      }
    }
    let couldSkipThisPlaceholder = false;
    if (fwd === true && this._placeholderGroupsIdx < this._placeholderGroups.length - 1) {
      this._placeholderGroupsIdx += 1;
      couldSkipThisPlaceholder = true;
    } else if (fwd === false && this._placeholderGroupsIdx > 0) {
      this._placeholderGroupsIdx -= 1;
      couldSkipThisPlaceholder = true;
    } else {
    }
    const newSelections = this._editor.getModel().changeDecorations((accessor) => {
      const activePlaceholders = /* @__PURE__ */ new Set();
      const selections = [];
      for (const placeholder of this._placeholderGroups[this._placeholderGroupsIdx]) {
        const id = this._placeholderDecorations.get(placeholder);
        const range = this._editor.getModel().getDecorationRange(id);
        selections.push(new Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn));
        couldSkipThisPlaceholder = couldSkipThisPlaceholder && this._hasPlaceholderBeenCollapsed(placeholder);
        accessor.changeDecorationOptions(id, placeholder.isFinalTabstop ? OneSnippet._decor.activeFinal : OneSnippet._decor.active);
        activePlaceholders.add(placeholder);
        for (const enclosingPlaceholder of this._snippet.enclosingPlaceholders(placeholder)) {
          const id2 = this._placeholderDecorations.get(enclosingPlaceholder);
          accessor.changeDecorationOptions(id2, enclosingPlaceholder.isFinalTabstop ? OneSnippet._decor.activeFinal : OneSnippet._decor.active);
          activePlaceholders.add(enclosingPlaceholder);
        }
      }
      for (const [placeholder, id] of this._placeholderDecorations) {
        if (!activePlaceholders.has(placeholder)) {
          accessor.changeDecorationOptions(id, placeholder.isFinalTabstop ? OneSnippet._decor.inactiveFinal : OneSnippet._decor.inactive);
        }
      }
      return selections;
    });
    return !couldSkipThisPlaceholder ? newSelections ?? [] : this.move(fwd);
  }
  _hasPlaceholderBeenCollapsed(placeholder) {
    let marker = placeholder;
    while (marker) {
      if (marker instanceof Placeholder) {
        const id = this._placeholderDecorations.get(marker);
        const range = this._editor.getModel().getDecorationRange(id);
        if (range.isEmpty() && marker.toString().length > 0) {
          return true;
        }
      }
      marker = marker.parent;
    }
    return false;
  }
  get isAtFirstPlaceholder() {
    return this._placeholderGroupsIdx <= 0 || this._placeholderGroups.length === 0;
  }
  get isAtLastPlaceholder() {
    return this._placeholderGroupsIdx === this._placeholderGroups.length - 1;
  }
  get hasPlaceholder() {
    return this._snippet.placeholders.length > 0;
  }
  /**
   * A snippet is trivial when it has no placeholder or only a final placeholder at
   * its very end
   */
  get isTrivialSnippet() {
    if (this._snippet.placeholders.length === 0) {
      return true;
    }
    if (this._snippet.placeholders.length === 1) {
      const [placeholder] = this._snippet.placeholders;
      if (placeholder.isFinalTabstop) {
        if (this._snippet.rightMostDescendant === placeholder) {
          return true;
        }
      }
    }
    return false;
  }
  computePossibleSelections() {
    const result = /* @__PURE__ */ new Map();
    for (const placeholdersWithEqualIndex of this._placeholderGroups) {
      let ranges;
      for (const placeholder of placeholdersWithEqualIndex) {
        if (placeholder.isFinalTabstop) {
          break;
        }
        if (!ranges) {
          ranges = [];
          result.set(placeholder.index, ranges);
        }
        const id = this._placeholderDecorations.get(placeholder);
        const range = this._editor.getModel().getDecorationRange(id);
        if (!range) {
          result.delete(placeholder.index);
          break;
        }
        ranges.push(range);
      }
    }
    return result;
  }
  get activeChoice() {
    if (!this._placeholderDecorations) {
      return void 0;
    }
    const placeholder = this._placeholderGroups[this._placeholderGroupsIdx][0];
    if (!placeholder?.choice) {
      return void 0;
    }
    const id = this._placeholderDecorations.get(placeholder);
    if (!id) {
      return void 0;
    }
    const range = this._editor.getModel().getDecorationRange(id);
    if (!range) {
      return void 0;
    }
    return { range, choice: placeholder.choice };
  }
  get hasChoice() {
    let result = false;
    this._snippet.walk((marker) => {
      result = marker instanceof Choice;
      return !result;
    });
    return result;
  }
  merge(others) {
    const model = this._editor.getModel();
    this._nestingLevel *= 10;
    this._editor.changeDecorations((accessor) => {
      for (const placeholder of this._placeholderGroups[this._placeholderGroupsIdx]) {
        const nested = others.shift();
        console.assert(nested._offset !== -1);
        console.assert(!nested._placeholderDecorations);
        const indexLastPlaceholder = nested._snippet.placeholderInfo.last.index;
        for (const nestedPlaceholder of nested._snippet.placeholderInfo.all) {
          if (nestedPlaceholder.isFinalTabstop) {
            nestedPlaceholder.index = placeholder.index + (indexLastPlaceholder + 1) / this._nestingLevel;
          } else {
            nestedPlaceholder.index = placeholder.index + nestedPlaceholder.index / this._nestingLevel;
          }
        }
        this._snippet.replace(placeholder, nested._snippet.children);
        const id = this._placeholderDecorations.get(placeholder);
        accessor.removeDecoration(id);
        this._placeholderDecorations.delete(placeholder);
        for (const placeholder2 of nested._snippet.placeholders) {
          const placeholderOffset = nested._snippet.offset(placeholder2);
          const placeholderLen = nested._snippet.fullLen(placeholder2);
          const range = Range.fromPositions(
            model.getPositionAt(nested._offset + placeholderOffset),
            model.getPositionAt(nested._offset + placeholderOffset + placeholderLen)
          );
          const handle = accessor.addDecoration(range, OneSnippet._decor.inactive);
          this._placeholderDecorations.set(placeholder2, handle);
        }
      }
      this._placeholderGroups = groupBy(this._snippet.placeholders, Placeholder.compareByIndex);
    });
  }
  getEnclosingRange() {
    let result;
    const model = this._editor.getModel();
    for (const decorationId of this._placeholderDecorations.values()) {
      const placeholderRange = model.getDecorationRange(decorationId) ?? void 0;
      if (!result) {
        result = placeholderRange;
      } else {
        result = result.plusRange(placeholderRange);
      }
    }
    return result;
  }
}
const _defaultOptions = {
  overwriteBefore: 0,
  overwriteAfter: 0,
  adjustWhitespace: true,
  clipboardText: void 0,
  overtypingCapturer: void 0
};
let SnippetSession = class {
  constructor(_editor, _template, _options = _defaultOptions, _languageConfigurationService) {
    this._editor = _editor;
    this._template = _template;
    this._options = _options;
    this._languageConfigurationService = _languageConfigurationService;
  }
  static {
    __name(this, "SnippetSession");
  }
  static adjustWhitespace(model, position, adjustIndentation, snippet, filter) {
    const line = model.getLineContent(position.lineNumber);
    const lineLeadingWhitespace = getLeadingWhitespace(line, 0, position.column - 1);
    let snippetTextString;
    snippet.walk((marker) => {
      if (!(marker instanceof Text) || marker.parent instanceof Choice) {
        return true;
      }
      if (filter && !filter.has(marker)) {
        return true;
      }
      const lines = marker.value.split(/\r\n|\r|\n/);
      if (adjustIndentation) {
        const offset = snippet.offset(marker);
        if (offset === 0) {
          lines[0] = model.normalizeIndentation(lines[0]);
        } else {
          snippetTextString = snippetTextString ?? snippet.toString();
          const prevChar = snippetTextString.charCodeAt(offset - 1);
          if (prevChar === CharCode.LineFeed || prevChar === CharCode.CarriageReturn) {
            lines[0] = model.normalizeIndentation(lineLeadingWhitespace + lines[0]);
          }
        }
        for (let i = 1; i < lines.length; i++) {
          lines[i] = model.normalizeIndentation(lineLeadingWhitespace + lines[i]);
        }
      }
      const newValue = lines.join(model.getEOL());
      if (newValue !== marker.value) {
        marker.parent.replace(marker, [new Text(newValue)]);
        snippetTextString = void 0;
      }
      return true;
    });
    return lineLeadingWhitespace;
  }
  static adjustSelection(model, selection, overwriteBefore, overwriteAfter) {
    if (overwriteBefore !== 0 || overwriteAfter !== 0) {
      const { positionLineNumber, positionColumn } = selection;
      const positionColumnBefore = positionColumn - overwriteBefore;
      const positionColumnAfter = positionColumn + overwriteAfter;
      const range = model.validateRange({
        startLineNumber: positionLineNumber,
        startColumn: positionColumnBefore,
        endLineNumber: positionLineNumber,
        endColumn: positionColumnAfter
      });
      selection = Selection.createWithDirection(
        range.startLineNumber,
        range.startColumn,
        range.endLineNumber,
        range.endColumn,
        selection.getDirection()
      );
    }
    return selection;
  }
  static createEditsAndSnippetsFromSelections(editor, template, overwriteBefore, overwriteAfter, enforceFinalTabstop, adjustWhitespace, clipboardText, overtypingCapturer, languageConfigurationService) {
    const edits = [];
    const snippets = [];
    if (!editor.hasModel()) {
      return { edits, snippets };
    }
    const model = editor.getModel();
    const workspaceService = editor.invokeWithinContext((accessor) => accessor.get(IWorkspaceContextService));
    const modelBasedVariableResolver = editor.invokeWithinContext((accessor) => new ModelBasedVariableResolver(accessor.get(ILabelService), model));
    const readClipboardText = /* @__PURE__ */ __name(() => clipboardText, "readClipboardText");
    const firstBeforeText = model.getValueInRange(SnippetSession.adjustSelection(model, editor.getSelection(), overwriteBefore, 0));
    const firstAfterText = model.getValueInRange(SnippetSession.adjustSelection(model, editor.getSelection(), 0, overwriteAfter));
    const firstLineFirstNonWhitespace = model.getLineFirstNonWhitespaceColumn(editor.getSelection().positionLineNumber);
    const indexedSelections = editor.getSelections().map((selection, idx) => ({ selection, idx })).sort((a, b) => Range.compareRangesUsingStarts(a.selection, b.selection));
    for (const { selection, idx } of indexedSelections) {
      let extensionBefore = SnippetSession.adjustSelection(model, selection, overwriteBefore, 0);
      let extensionAfter = SnippetSession.adjustSelection(model, selection, 0, overwriteAfter);
      if (firstBeforeText !== model.getValueInRange(extensionBefore)) {
        extensionBefore = selection;
      }
      if (firstAfterText !== model.getValueInRange(extensionAfter)) {
        extensionAfter = selection;
      }
      const snippetSelection = selection.setStartPosition(extensionBefore.startLineNumber, extensionBefore.startColumn).setEndPosition(extensionAfter.endLineNumber, extensionAfter.endColumn);
      const snippet = new SnippetParser().parse(template, true, enforceFinalTabstop);
      const start = snippetSelection.getStartPosition();
      const snippetLineLeadingWhitespace = SnippetSession.adjustWhitespace(
        model,
        start,
        adjustWhitespace || idx > 0 && firstLineFirstNonWhitespace !== model.getLineFirstNonWhitespaceColumn(selection.positionLineNumber),
        snippet
      );
      snippet.resolveVariables(new CompositeSnippetVariableResolver([
        modelBasedVariableResolver,
        new ClipboardBasedVariableResolver(readClipboardText, idx, indexedSelections.length, editor.getOption(EditorOption.multiCursorPaste) === "spread"),
        new SelectionBasedVariableResolver(model, selection, idx, overtypingCapturer),
        new CommentBasedVariableResolver(model, selection, languageConfigurationService),
        new TimeBasedVariableResolver(),
        new WorkspaceBasedVariableResolver(workspaceService),
        new RandomBasedVariableResolver()
      ]));
      edits[idx] = EditOperation.replace(snippetSelection, snippet.toString());
      edits[idx].identifier = { major: idx, minor: 0 };
      edits[idx]._isTracked = true;
      snippets[idx] = new OneSnippet(editor, snippet, snippetLineLeadingWhitespace);
    }
    return { edits, snippets };
  }
  static createEditsAndSnippetsFromEdits(editor, snippetEdits, enforceFinalTabstop, adjustWhitespace, clipboardText, overtypingCapturer, languageConfigurationService) {
    if (!editor.hasModel() || snippetEdits.length === 0) {
      return { edits: [], snippets: [] };
    }
    const edits = [];
    const model = editor.getModel();
    const parser = new SnippetParser();
    const snippet = new TextmateSnippet();
    const resolver = new CompositeSnippetVariableResolver([
      editor.invokeWithinContext((accessor) => new ModelBasedVariableResolver(accessor.get(ILabelService), model)),
      new ClipboardBasedVariableResolver(() => clipboardText, 0, editor.getSelections().length, editor.getOption(EditorOption.multiCursorPaste) === "spread"),
      new SelectionBasedVariableResolver(model, editor.getSelection(), 0, overtypingCapturer),
      new CommentBasedVariableResolver(model, editor.getSelection(), languageConfigurationService),
      new TimeBasedVariableResolver(),
      new WorkspaceBasedVariableResolver(editor.invokeWithinContext((accessor) => accessor.get(IWorkspaceContextService))),
      new RandomBasedVariableResolver()
    ]);
    snippetEdits = snippetEdits.sort((a, b) => Range.compareRangesUsingStarts(a.range, b.range));
    let offset = 0;
    for (let i = 0; i < snippetEdits.length; i++) {
      const { range, template } = snippetEdits[i];
      if (i > 0) {
        const lastRange = snippetEdits[i - 1].range;
        const textRange = Range.fromPositions(lastRange.getEndPosition(), range.getStartPosition());
        const textNode = new Text(model.getValueInRange(textRange));
        snippet.appendChild(textNode);
        offset += textNode.value.length;
      }
      const newNodes = parser.parseFragment(template, snippet);
      SnippetSession.adjustWhitespace(model, range.getStartPosition(), true, snippet, new Set(newNodes));
      snippet.resolveVariables(resolver);
      const snippetText = snippet.toString();
      const snippetFragmentText = snippetText.slice(offset);
      offset = snippetText.length;
      const edit = EditOperation.replace(range, snippetFragmentText);
      edit.identifier = { major: i, minor: 0 };
      edit._isTracked = true;
      edits.push(edit);
    }
    parser.ensureFinalTabstop(snippet, enforceFinalTabstop, true);
    return {
      edits,
      snippets: [new OneSnippet(editor, snippet, "")]
    };
  }
  _templateMerges = [];
  _snippets = [];
  dispose() {
    dispose(this._snippets);
  }
  _logInfo() {
    return `template="${this._template}", merged_templates="${this._templateMerges.join(" -> ")}"`;
  }
  insert() {
    if (!this._editor.hasModel()) {
      return;
    }
    const { edits, snippets } = typeof this._template === "string" ? SnippetSession.createEditsAndSnippetsFromSelections(this._editor, this._template, this._options.overwriteBefore, this._options.overwriteAfter, false, this._options.adjustWhitespace, this._options.clipboardText, this._options.overtypingCapturer, this._languageConfigurationService) : SnippetSession.createEditsAndSnippetsFromEdits(this._editor, this._template, false, this._options.adjustWhitespace, this._options.clipboardText, this._options.overtypingCapturer, this._languageConfigurationService);
    this._snippets = snippets;
    this._editor.executeEdits("snippet", edits, (_undoEdits) => {
      const undoEdits = _undoEdits.filter((edit) => !!edit.identifier);
      for (let idx = 0; idx < snippets.length; idx++) {
        snippets[idx].initialize(undoEdits[idx].textChange);
      }
      if (this._snippets[0].hasPlaceholder) {
        return this._move(true);
      } else {
        return undoEdits.map((edit) => Selection.fromPositions(edit.range.getEndPosition()));
      }
    });
    this._editor.revealRange(this._editor.getSelections()[0]);
  }
  merge(template, options = _defaultOptions) {
    if (!this._editor.hasModel()) {
      return;
    }
    this._templateMerges.push([this._snippets[0]._nestingLevel, this._snippets[0]._placeholderGroupsIdx, template]);
    const { edits, snippets } = SnippetSession.createEditsAndSnippetsFromSelections(this._editor, template, options.overwriteBefore, options.overwriteAfter, true, options.adjustWhitespace, options.clipboardText, options.overtypingCapturer, this._languageConfigurationService);
    this._editor.executeEdits("snippet", edits, (_undoEdits) => {
      const undoEdits = _undoEdits.filter((edit) => !!edit.identifier);
      for (let idx = 0; idx < snippets.length; idx++) {
        snippets[idx].initialize(undoEdits[idx].textChange);
      }
      const isTrivialSnippet = snippets[0].isTrivialSnippet;
      if (!isTrivialSnippet) {
        for (const snippet of this._snippets) {
          snippet.merge(snippets);
        }
        console.assert(snippets.length === 0);
      }
      if (this._snippets[0].hasPlaceholder && !isTrivialSnippet) {
        return this._move(void 0);
      } else {
        return undoEdits.map((edit) => Selection.fromPositions(edit.range.getEndPosition()));
      }
    });
  }
  next() {
    const newSelections = this._move(true);
    this._editor.setSelections(newSelections);
    this._editor.revealPositionInCenterIfOutsideViewport(newSelections[0].getPosition());
  }
  prev() {
    const newSelections = this._move(false);
    this._editor.setSelections(newSelections);
    this._editor.revealPositionInCenterIfOutsideViewport(newSelections[0].getPosition());
  }
  _move(fwd) {
    const selections = [];
    for (const snippet of this._snippets) {
      const oneSelection = snippet.move(fwd);
      selections.push(...oneSelection);
    }
    return selections;
  }
  get isAtFirstPlaceholder() {
    return this._snippets[0].isAtFirstPlaceholder;
  }
  get isAtLastPlaceholder() {
    return this._snippets[0].isAtLastPlaceholder;
  }
  get hasPlaceholder() {
    return this._snippets[0].hasPlaceholder;
  }
  get hasChoice() {
    return this._snippets[0].hasChoice;
  }
  get activeChoice() {
    return this._snippets[0].activeChoice;
  }
  isSelectionWithinPlaceholders() {
    if (!this.hasPlaceholder) {
      return false;
    }
    const selections = this._editor.getSelections();
    if (selections.length < this._snippets.length) {
      return false;
    }
    const allPossibleSelections = /* @__PURE__ */ new Map();
    for (const snippet of this._snippets) {
      const possibleSelections = snippet.computePossibleSelections();
      if (allPossibleSelections.size === 0) {
        for (const [index, ranges] of possibleSelections) {
          ranges.sort(Range.compareRangesUsingStarts);
          for (const selection of selections) {
            if (ranges[0].containsRange(selection)) {
              allPossibleSelections.set(index, []);
              break;
            }
          }
        }
      }
      if (allPossibleSelections.size === 0) {
        return false;
      }
      allPossibleSelections.forEach((array, index) => {
        array.push(...possibleSelections.get(index));
      });
    }
    selections.sort(Range.compareRangesUsingStarts);
    for (const [index, ranges] of allPossibleSelections) {
      if (ranges.length !== selections.length) {
        allPossibleSelections.delete(index);
        continue;
      }
      ranges.sort(Range.compareRangesUsingStarts);
      for (let i = 0; i < ranges.length; i++) {
        if (!ranges[i].containsRange(selections[i])) {
          allPossibleSelections.delete(index);
          continue;
        }
      }
    }
    return allPossibleSelections.size > 0;
  }
  getEnclosingRange() {
    let result;
    for (const snippet of this._snippets) {
      const snippetRange = snippet.getEnclosingRange();
      if (!result) {
        result = snippetRange;
      } else {
        result = result.plusRange(snippetRange);
      }
    }
    return result;
  }
};
SnippetSession = __decorateClass([
  __decorateParam(3, ILanguageConfigurationService)
], SnippetSession);
export {
  OneSnippet,
  SnippetSession
};
//# sourceMappingURL=snippetSession.js.map
