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
import { coalesce } from "../../../../base/common/arrays.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import {
  CancellationToken,
  CancellationTokenSource
} from "../../../../base/common/cancellation.js";
import {
  compareFileExtensions,
  compareFileNames,
  comparePaths
} from "../../../../base/common/comparers.js";
import { memoize } from "../../../../base/common/decorators.js";
import * as errors from "../../../../base/common/errors.js";
import {
  Emitter,
  Event,
  PauseableEmitter
} from "../../../../base/common/event.js";
import { Lazy } from "../../../../base/common/lazy.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { Schemas } from "../../../../base/common/network.js";
import { lcut } from "../../../../base/common/strings.js";
import { TernarySearchTree } from "../../../../base/common/ternarySearchTree.js";
import { URI } from "../../../../base/common/uri.js";
import { Range } from "../../../../editor/common/core/range.js";
import {
  FindMatch,
  MinimapPosition,
  OverviewRulerLane,
  TrackedRangeStickiness
} from "../../../../editor/common/model.js";
import { ModelDecorationOptions } from "../../../../editor/common/model/textModel.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  IInstantiationService,
  createDecorator
} from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import {
  IProgressService,
  ProgressLocation
} from "../../../../platform/progress/common/progress.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  minimapFindMatch,
  overviewRulerFindMatchForeground
} from "../../../../platform/theme/common/colorRegistry.js";
import { themeColorFromId } from "../../../../platform/theme/common/themeService.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { ReplacePattern } from "../../../services/search/common/replace.js";
import {
  DEFAULT_MAX_SEARCH_RESULTS,
  ISearchService,
  OneLineRange,
  QueryType,
  SearchCompletionExitCode,
  SearchSortOrder,
  resultIsMatch
} from "../../../services/search/common/search.js";
import {
  editorMatchesToTextSearchResults,
  getTextSearchMatchWithModelContext
} from "../../../services/search/common/searchHelpers.js";
import { FindMatchDecorationModel } from "../../notebook/browser/contrib/find/findMatchDecorationModel.js";
import { CellFindMatchModel } from "../../notebook/browser/contrib/find/findModel.js";
import { NotebookEditorWidget } from "../../notebook/browser/notebookEditorWidget.js";
import { INotebookEditorService } from "../../notebook/browser/services/notebookEditorService.js";
import { NotebookCellsChangeType } from "../../notebook/common/notebookCommon.js";
import { CellSearchModel } from "../common/cellSearchModel.js";
import { INotebookSearchService } from "../common/notebookSearch.js";
import {
  isINotebookFileMatchNoModel,
  rawCellPrefix
} from "../common/searchNotebookHelpers.js";
import {
  contentMatchesToTextSearchMatches,
  getIDFromINotebookCellMatch,
  isINotebookCellMatchWithModel,
  isINotebookFileMatchWithModel,
  webviewMatchesToTextSearchMatches
} from "./notebookSearch/searchNotebookHelpers.js";
import { IReplaceService } from "./replace.js";
const _Match = class _Match {
  constructor(_parent, _fullPreviewLines, _fullPreviewRange, _documentRange, aiContributed) {
    this._parent = _parent;
    this._fullPreviewLines = _fullPreviewLines;
    this.aiContributed = aiContributed;
    this._oneLinePreviewText = _fullPreviewLines[_fullPreviewRange.startLineNumber];
    const adjustedEndCol = _fullPreviewRange.startLineNumber === _fullPreviewRange.endLineNumber ? _fullPreviewRange.endColumn : this._oneLinePreviewText.length;
    this._rangeInPreviewText = new OneLineRange(
      1,
      _fullPreviewRange.startColumn + 1,
      adjustedEndCol + 1
    );
    this._range = new Range(
      _documentRange.startLineNumber + 1,
      _documentRange.startColumn + 1,
      _documentRange.endLineNumber + 1,
      _documentRange.endColumn + 1
    );
    this._fullPreviewRange = _fullPreviewRange;
    this._id = this._parent.id() + ">" + this._range + this.getMatchString();
  }
  static {
    __name(this, "Match");
  }
  static MAX_PREVIEW_CHARS = 250;
  _id;
  _range;
  _oneLinePreviewText;
  _rangeInPreviewText;
  // For replace
  _fullPreviewRange;
  id() {
    return this._id;
  }
  parent() {
    return this._parent;
  }
  text() {
    return this._oneLinePreviewText;
  }
  range() {
    return this._range;
  }
  preview() {
    const fullBefore = this._oneLinePreviewText.substring(
      0,
      this._rangeInPreviewText.startColumn - 1
    ), before = lcut(fullBefore, 26, "\u2026");
    let inside = this.getMatchString(), after = this._oneLinePreviewText.substring(
      this._rangeInPreviewText.endColumn - 1
    );
    let charsRemaining = _Match.MAX_PREVIEW_CHARS - before.length;
    inside = inside.substr(0, charsRemaining);
    charsRemaining -= inside.length;
    after = after.substr(0, charsRemaining);
    return {
      before,
      fullBefore,
      inside,
      after
    };
  }
  get replaceString() {
    const searchModel = this.parent().parent().searchModel;
    if (!searchModel.replacePattern) {
      throw new Error(
        "searchModel.replacePattern must be set before accessing replaceString"
      );
    }
    const fullMatchText = this.fullMatchText();
    let replaceString = searchModel.replacePattern.getReplaceString(
      fullMatchText,
      searchModel.preserveCase
    );
    if (replaceString !== null) {
      return replaceString;
    }
    const fullMatchTextWithoutCR = fullMatchText.replace(/\r\n/g, "\n");
    if (fullMatchTextWithoutCR !== fullMatchText) {
      replaceString = searchModel.replacePattern.getReplaceString(
        fullMatchTextWithoutCR,
        searchModel.preserveCase
      );
      if (replaceString !== null) {
        return replaceString;
      }
    }
    const contextMatchTextWithSurroundingContent = this.fullMatchText(true);
    replaceString = searchModel.replacePattern.getReplaceString(
      contextMatchTextWithSurroundingContent,
      searchModel.preserveCase
    );
    if (replaceString !== null) {
      return replaceString;
    }
    const contextMatchTextWithoutCR = contextMatchTextWithSurroundingContent.replace(/\r\n/g, "\n");
    if (contextMatchTextWithoutCR !== contextMatchTextWithSurroundingContent) {
      replaceString = searchModel.replacePattern.getReplaceString(
        contextMatchTextWithoutCR,
        searchModel.preserveCase
      );
      if (replaceString !== null) {
        return replaceString;
      }
    }
    return searchModel.replacePattern.pattern;
  }
  fullMatchText(includeSurrounding = false) {
    let thisMatchPreviewLines;
    if (includeSurrounding) {
      thisMatchPreviewLines = this._fullPreviewLines;
    } else {
      thisMatchPreviewLines = this._fullPreviewLines.slice(
        this._fullPreviewRange.startLineNumber,
        this._fullPreviewRange.endLineNumber + 1
      );
      thisMatchPreviewLines[thisMatchPreviewLines.length - 1] = thisMatchPreviewLines[thisMatchPreviewLines.length - 1].slice(
        0,
        this._fullPreviewRange.endColumn
      );
      thisMatchPreviewLines[0] = thisMatchPreviewLines[0].slice(
        this._fullPreviewRange.startColumn
      );
    }
    return thisMatchPreviewLines.join("\n");
  }
  rangeInPreview() {
    return {
      ...this._fullPreviewRange,
      startColumn: this._fullPreviewRange.startColumn + 1,
      endColumn: this._fullPreviewRange.endColumn + 1
    };
  }
  fullPreviewLines() {
    return this._fullPreviewLines.slice(
      this._fullPreviewRange.startLineNumber,
      this._fullPreviewRange.endLineNumber + 1
    );
  }
  getMatchString() {
    return this._oneLinePreviewText.substring(
      this._rangeInPreviewText.startColumn - 1,
      this._rangeInPreviewText.endColumn - 1
    );
  }
};
__decorateClass([
  memoize
], _Match.prototype, "preview", 1);
let Match = _Match;
class CellMatch {
  constructor(_parent, _cell, _cellIndex) {
    this._parent = _parent;
    this._cell = _cell;
    this._cellIndex = _cellIndex;
    this._contentMatches = /* @__PURE__ */ new Map();
    this._webviewMatches = /* @__PURE__ */ new Map();
    this._context = /* @__PURE__ */ new Map();
  }
  static {
    __name(this, "CellMatch");
  }
  _contentMatches;
  _webviewMatches;
  _context;
  hasCellViewModel() {
    return !(this._cell instanceof CellSearchModel);
  }
  get context() {
    return new Map(this._context);
  }
  matches() {
    return [
      ...this._contentMatches.values(),
      ...this._webviewMatches.values()
    ];
  }
  get contentMatches() {
    return Array.from(this._contentMatches.values());
  }
  get webviewMatches() {
    return Array.from(this._webviewMatches.values());
  }
  remove(matches) {
    if (!Array.isArray(matches)) {
      matches = [matches];
    }
    for (const match of matches) {
      this._contentMatches.delete(match.id());
      this._webviewMatches.delete(match.id());
    }
  }
  clearAllMatches() {
    this._contentMatches.clear();
    this._webviewMatches.clear();
  }
  addContentMatches(textSearchMatches) {
    const contentMatches = textSearchMatchesToNotebookMatches(
      textSearchMatches,
      this
    );
    contentMatches.forEach((match) => {
      this._contentMatches.set(match.id(), match);
    });
    this.addContext(textSearchMatches);
  }
  addContext(textSearchMatches) {
    if (!this.cell) {
      return;
    }
    this.cell.resolveTextModel().then((textModel) => {
      const textResultsWithContext = getTextSearchMatchWithModelContext(
        textSearchMatches,
        textModel,
        this.parent.parent().query
      );
      const contexts = textResultsWithContext.filter(
        (result) => !resultIsMatch(result)
      );
      contexts.map((context) => ({
        ...context,
        lineNumber: context.lineNumber + 1
      })).forEach((context) => {
        this._context.set(context.lineNumber, context.text);
      });
    });
  }
  addWebviewMatches(textSearchMatches) {
    const webviewMatches = textSearchMatchesToNotebookMatches(
      textSearchMatches,
      this
    );
    webviewMatches.forEach((match) => {
      this._webviewMatches.set(match.id(), match);
    });
  }
  setCellModel(cell) {
    this._cell = cell;
  }
  get parent() {
    return this._parent;
  }
  get id() {
    return this._cell?.id ?? `${rawCellPrefix}${this.cellIndex}`;
  }
  get cellIndex() {
    return this._cellIndex;
  }
  get cell() {
    return this._cell;
  }
}
class MatchInNotebook extends Match {
  constructor(_cellParent, _fullPreviewLines, _fullPreviewRange, _documentRange, webviewIndex) {
    super(
      _cellParent.parent,
      _fullPreviewLines,
      _fullPreviewRange,
      _documentRange,
      false
    );
    this._cellParent = _cellParent;
    this._id = this._parent.id() + ">" + this._cellParent.cellIndex + (webviewIndex ? "_" + webviewIndex : "") + "_" + this.notebookMatchTypeString() + this._range + this.getMatchString();
    this._webviewIndex = webviewIndex;
  }
  static {
    __name(this, "MatchInNotebook");
  }
  _webviewIndex;
  parent() {
    return this._cellParent.parent;
  }
  get cellParent() {
    return this._cellParent;
  }
  notebookMatchTypeString() {
    return this.isWebviewMatch() ? "webview" : "content";
  }
  isWebviewMatch() {
    return this._webviewIndex !== void 0;
  }
  isReadonly() {
    return !this._cellParent.hasCellViewModel() || this.isWebviewMatch();
  }
  get cellIndex() {
    return this._cellParent.cellIndex;
  }
  get webviewIndex() {
    return this._webviewIndex;
  }
  get cell() {
    return this._cellParent.cell;
  }
}
let FileMatch = class extends Disposable {
  // #endregion
  constructor(_query, _previewOptions, _maxResults, _parent, rawMatch, _closestRoot, searchInstanceID, modelService, replaceService, labelService, notebookEditorService) {
    super();
    this._query = _query;
    this._previewOptions = _previewOptions;
    this._maxResults = _maxResults;
    this._parent = _parent;
    this.rawMatch = rawMatch;
    this._closestRoot = _closestRoot;
    this.searchInstanceID = searchInstanceID;
    this.modelService = modelService;
    this.replaceService = replaceService;
    this.notebookEditorService = notebookEditorService;
    this._resource = this.rawMatch.resource;
    this._textMatches = /* @__PURE__ */ new Map();
    this._removedTextMatches = /* @__PURE__ */ new Set();
    this._updateScheduler = new RunOnceScheduler(
      this.updateMatchesForModel.bind(this),
      250
    );
    this._name = new Lazy(
      () => labelService.getUriBasenameLabel(this.resource)
    );
    this._cellMatches = /* @__PURE__ */ new Map();
    this._notebookUpdateScheduler = new RunOnceScheduler(
      this.updateMatchesForEditorWidget.bind(this),
      250
    );
  }
  static {
    __name(this, "FileMatch");
  }
  static _CURRENT_FIND_MATCH = ModelDecorationOptions.register({
    description: "search-current-find-match",
    stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
    zIndex: 13,
    className: "currentFindMatch",
    overviewRuler: {
      color: themeColorFromId(overviewRulerFindMatchForeground),
      position: OverviewRulerLane.Center
    },
    minimap: {
      color: themeColorFromId(minimapFindMatch),
      position: MinimapPosition.Inline
    }
  });
  static _FIND_MATCH = ModelDecorationOptions.register({
    description: "search-find-match",
    stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
    className: "findMatch",
    overviewRuler: {
      color: themeColorFromId(overviewRulerFindMatchForeground),
      position: OverviewRulerLane.Center
    },
    minimap: {
      color: themeColorFromId(minimapFindMatch),
      position: MinimapPosition.Inline
    }
  });
  static getDecorationOption(selected) {
    return selected ? FileMatch._CURRENT_FIND_MATCH : FileMatch._FIND_MATCH;
  }
  _onChange = this._register(
    new Emitter()
  );
  onChange = this._onChange.event;
  _onDispose = this._register(new Emitter());
  onDispose = this._onDispose.event;
  _resource;
  _fileStat;
  _model = null;
  _modelListener = null;
  _textMatches;
  _cellMatches;
  _removedTextMatches;
  _selectedMatch = null;
  _name;
  _updateScheduler;
  _modelDecorations = [];
  _context = /* @__PURE__ */ new Map();
  get context() {
    return new Map(this._context);
  }
  get cellContext() {
    const cellContext = /* @__PURE__ */ new Map();
    this._cellMatches.forEach((cellMatch) => {
      cellContext.set(cellMatch.id, cellMatch.context);
    });
    return cellContext;
  }
  // #region notebook fields
  _notebookEditorWidget = null;
  _editorWidgetListener = null;
  _notebookUpdateScheduler;
  _findMatchDecorationModel;
  _lastEditorWidgetIdForUpdate;
  addWebviewMatchesToCell(cellID, webviewMatches) {
    const cellMatch = this.getCellMatch(cellID);
    if (cellMatch !== void 0) {
      cellMatch.addWebviewMatches(webviewMatches);
    }
  }
  addContentMatchesToCell(cellID, contentMatches) {
    const cellMatch = this.getCellMatch(cellID);
    if (cellMatch !== void 0) {
      cellMatch.addContentMatches(contentMatches);
    }
  }
  getCellMatch(cellID) {
    return this._cellMatches.get(cellID);
  }
  addCellMatch(rawCell) {
    const cellMatch = new CellMatch(
      this,
      isINotebookCellMatchWithModel(rawCell) ? rawCell.cell : void 0,
      rawCell.index
    );
    this._cellMatches.set(cellMatch.id, cellMatch);
    this.addWebviewMatchesToCell(cellMatch.id, rawCell.webviewResults);
    this.addContentMatchesToCell(cellMatch.id, rawCell.contentResults);
  }
  get closestRoot() {
    return this._closestRoot;
  }
  hasReadonlyMatches() {
    return this.matches().some(
      (m) => m instanceof MatchInNotebook && m.isReadonly()
    );
  }
  createMatches(isAiContributed) {
    const model = this.modelService.getModel(this._resource);
    if (model && !isAiContributed) {
      this.bindModel(model);
      this.updateMatchesForModel();
    } else {
      const notebookEditorWidgetBorrow = this.notebookEditorService.retrieveExistingWidgetFromURI(
        this.resource
      );
      if (notebookEditorWidgetBorrow?.value) {
        this.bindNotebookEditorWidget(notebookEditorWidgetBorrow.value);
      }
      if (this.rawMatch.results) {
        this.rawMatch.results.filter(resultIsMatch).forEach((rawMatch) => {
          textSearchResultToMatches(
            rawMatch,
            this,
            isAiContributed
          ).forEach((m) => this.add(m));
        });
      }
      if (isINotebookFileMatchWithModel(this.rawMatch) || isINotebookFileMatchNoModel(this.rawMatch)) {
        this.rawMatch.cellResults?.forEach(
          (cell) => this.addCellMatch(cell)
        );
        this.setNotebookFindMatchDecorationsUsingCellMatches(
          this.cellMatches()
        );
        this._onChange.fire({ forceUpdateModel: true });
      }
      this.addContext(this.rawMatch.results);
    }
  }
  bindModel(model) {
    this._model = model;
    this._modelListener = this._model.onDidChangeContent(() => {
      this._updateScheduler.schedule();
    });
    this._model.onWillDispose(() => this.onModelWillDispose());
    this.updateHighlights();
  }
  onModelWillDispose() {
    this.updateMatchesForModel();
    this.unbindModel();
  }
  unbindModel() {
    if (this._model) {
      this._updateScheduler.cancel();
      this._model.changeDecorations((accessor) => {
        this._modelDecorations = accessor.deltaDecorations(
          this._modelDecorations,
          []
        );
      });
      this._model = null;
      this._modelListener.dispose();
    }
  }
  updateMatchesForModel() {
    if (!this._model) {
      return;
    }
    this._textMatches = /* @__PURE__ */ new Map();
    const wordSeparators = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
    const matches = this._model.findMatches(
      this._query.pattern,
      this._model.getFullModelRange(),
      !!this._query.isRegExp,
      !!this._query.isCaseSensitive,
      wordSeparators,
      false,
      this._maxResults ?? DEFAULT_MAX_SEARCH_RESULTS
    );
    this.updateMatches(matches, true, this._model, false);
  }
  async updatesMatchesForLineAfterReplace(lineNumber, modelChange) {
    if (!this._model) {
      return;
    }
    const range = {
      startLineNumber: lineNumber,
      startColumn: this._model.getLineMinColumn(lineNumber),
      endLineNumber: lineNumber,
      endColumn: this._model.getLineMaxColumn(lineNumber)
    };
    const oldMatches = Array.from(this._textMatches.values()).filter(
      (match) => match.range().startLineNumber === lineNumber
    );
    oldMatches.forEach((match) => this._textMatches.delete(match.id()));
    const wordSeparators = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
    const matches = this._model.findMatches(
      this._query.pattern,
      range,
      !!this._query.isRegExp,
      !!this._query.isCaseSensitive,
      wordSeparators,
      false,
      this._maxResults ?? DEFAULT_MAX_SEARCH_RESULTS
    );
    this.updateMatches(matches, modelChange, this._model, false);
  }
  updateMatches(matches, modelChange, model, isAiContributed) {
    const textSearchResults = editorMatchesToTextSearchResults(
      matches,
      model,
      this._previewOptions
    );
    textSearchResults.forEach((textSearchResult) => {
      textSearchResultToMatches(
        textSearchResult,
        this,
        isAiContributed
      ).forEach((match) => {
        if (!this._removedTextMatches.has(match.id())) {
          this.add(match);
          if (this.isMatchSelected(match)) {
            this._selectedMatch = match;
          }
        }
      });
    });
    this.addContext(
      getTextSearchMatchWithModelContext(
        textSearchResults,
        model,
        this.parent().parent().query
      )
    );
    this._onChange.fire({ forceUpdateModel: modelChange });
    this.updateHighlights();
  }
  updateHighlights() {
    if (!this._model) {
      return;
    }
    this._model.changeDecorations((accessor) => {
      const newDecorations = this.parent().showHighlights ? this.matches().map(
        (match) => ({
          range: match.range(),
          options: FileMatch.getDecorationOption(
            this.isMatchSelected(match)
          )
        })
      ) : [];
      this._modelDecorations = accessor.deltaDecorations(
        this._modelDecorations,
        newDecorations
      );
    });
  }
  id() {
    return this.resource.toString();
  }
  parent() {
    return this._parent;
  }
  matches() {
    const cellMatches = Array.from(
      this._cellMatches.values()
    ).flatMap((e) => e.matches());
    return [...this._textMatches.values(), ...cellMatches];
  }
  textMatches() {
    return Array.from(this._textMatches.values());
  }
  cellMatches() {
    return Array.from(this._cellMatches.values());
  }
  remove(matches) {
    if (!Array.isArray(matches)) {
      matches = [matches];
    }
    for (const match of matches) {
      this.removeMatch(match);
      this._removedTextMatches.add(match.id());
    }
    this._onChange.fire({ didRemove: true });
  }
  replaceQ = Promise.resolve();
  async replace(toReplace) {
    return this.replaceQ = this.replaceQ.finally(async () => {
      await this.replaceService.replace(toReplace);
      await this.updatesMatchesForLineAfterReplace(
        toReplace.range().startLineNumber,
        false
      );
    });
  }
  setSelectedMatch(match) {
    if (match) {
      if (!this.isMatchSelected(match) && match instanceof MatchInNotebook) {
        this._selectedMatch = match;
        return;
      }
      if (!this._textMatches.has(match.id())) {
        return;
      }
      if (this.isMatchSelected(match)) {
        return;
      }
    }
    this._selectedMatch = match;
    this.updateHighlights();
  }
  getSelectedMatch() {
    return this._selectedMatch;
  }
  isMatchSelected(match) {
    return !!this._selectedMatch && this._selectedMatch.id() === match.id();
  }
  count() {
    return this.matches().length;
  }
  get resource() {
    return this._resource;
  }
  name() {
    return this._name.value;
  }
  addContext(results) {
    if (!results) {
      return;
    }
    const contexts = results.filter(
      (result) => !resultIsMatch(result)
    );
    return contexts.forEach(
      (context) => this._context.set(context.lineNumber, context.text)
    );
  }
  add(match, trigger) {
    this._textMatches.set(match.id(), match);
    if (trigger) {
      this._onChange.fire({ forceUpdateModel: true });
    }
  }
  removeMatch(match) {
    if (match instanceof MatchInNotebook) {
      match.cellParent.remove(match);
      if (match.cellParent.matches().length === 0) {
        this._cellMatches.delete(match.cellParent.id);
      }
    } else {
      this._textMatches.delete(match.id());
    }
    if (this.isMatchSelected(match)) {
      this.setSelectedMatch(null);
      this._findMatchDecorationModel?.clearCurrentFindMatchDecoration();
    } else {
      this.updateHighlights();
    }
    if (match instanceof MatchInNotebook) {
      this.setNotebookFindMatchDecorationsUsingCellMatches(
        this.cellMatches()
      );
    }
  }
  async resolveFileStat(fileService) {
    this._fileStat = await fileService.stat(this.resource).catch(() => void 0);
  }
  get fileStat() {
    return this._fileStat;
  }
  set fileStat(stat) {
    this._fileStat = stat;
  }
  dispose() {
    this.setSelectedMatch(null);
    this.unbindModel();
    this.unbindNotebookEditorWidget();
    this._onDispose.fire();
    super.dispose();
  }
  hasOnlyReadOnlyMatches() {
    return this.matches().every(
      (match) => match instanceof MatchInNotebook && match.isReadonly()
    );
  }
  // #region strictly notebook methods
  bindNotebookEditorWidget(widget) {
    if (this._notebookEditorWidget === widget) {
      return;
    }
    this._notebookEditorWidget = widget;
    this._editorWidgetListener = this._notebookEditorWidget.textModel?.onDidChangeContent((e) => {
      if (!e.rawEvents.some(
        (event) => event.kind === NotebookCellsChangeType.ChangeCellContent || event.kind === NotebookCellsChangeType.ModelChange
      )) {
        return;
      }
      this._notebookUpdateScheduler.schedule();
    }) ?? null;
    this._addNotebookHighlights();
  }
  unbindNotebookEditorWidget(widget) {
    if (widget && this._notebookEditorWidget !== widget) {
      return;
    }
    if (this._notebookEditorWidget) {
      this._notebookUpdateScheduler.cancel();
      this._editorWidgetListener?.dispose();
    }
    this._removeNotebookHighlights();
    this._notebookEditorWidget = null;
  }
  updateNotebookHighlights() {
    if (this.parent().showHighlights) {
      this._addNotebookHighlights();
      this.setNotebookFindMatchDecorationsUsingCellMatches(
        Array.from(this._cellMatches.values())
      );
    } else {
      this._removeNotebookHighlights();
    }
  }
  _addNotebookHighlights() {
    if (!this._notebookEditorWidget) {
      return;
    }
    this._findMatchDecorationModel?.stopWebviewFind();
    this._findMatchDecorationModel?.dispose();
    this._findMatchDecorationModel = new FindMatchDecorationModel(
      this._notebookEditorWidget,
      this.searchInstanceID
    );
    if (this._selectedMatch instanceof MatchInNotebook) {
      this.highlightCurrentFindMatchDecoration(this._selectedMatch);
    }
  }
  _removeNotebookHighlights() {
    if (this._findMatchDecorationModel) {
      this._findMatchDecorationModel?.stopWebviewFind();
      this._findMatchDecorationModel?.dispose();
      this._findMatchDecorationModel = void 0;
    }
  }
  updateNotebookMatches(matches, modelChange) {
    if (!this._notebookEditorWidget) {
      return;
    }
    const oldCellMatches = new Map(this._cellMatches);
    if (this._notebookEditorWidget.getId() !== this._lastEditorWidgetIdForUpdate) {
      this._cellMatches.clear();
      this._lastEditorWidgetIdForUpdate = this._notebookEditorWidget.getId();
    }
    matches.forEach((match) => {
      let existingCell = this._cellMatches.get(match.cell.id);
      if (this._notebookEditorWidget && !existingCell) {
        const index = this._notebookEditorWidget.getCellIndex(
          match.cell
        );
        const existingRawCell = oldCellMatches.get(
          `${rawCellPrefix}${index}`
        );
        if (existingRawCell) {
          existingRawCell.setCellModel(match.cell);
          existingRawCell.clearAllMatches();
          existingCell = existingRawCell;
        }
      }
      existingCell?.clearAllMatches();
      const cell = existingCell ?? new CellMatch(this, match.cell, match.index);
      cell.addContentMatches(
        contentMatchesToTextSearchMatches(
          match.contentMatches,
          match.cell
        )
      );
      cell.addWebviewMatches(
        webviewMatchesToTextSearchMatches(match.webviewMatches)
      );
      this._cellMatches.set(cell.id, cell);
    });
    this._findMatchDecorationModel?.setAllFindMatchesDecorations(matches);
    if (this._selectedMatch instanceof MatchInNotebook) {
      this.highlightCurrentFindMatchDecoration(this._selectedMatch);
    }
    this._onChange.fire({ forceUpdateModel: modelChange });
  }
  setNotebookFindMatchDecorationsUsingCellMatches(cells) {
    if (!this._findMatchDecorationModel) {
      return;
    }
    const cellFindMatch = coalesce(
      cells.map((cell) => {
        const webviewMatches = coalesce(
          cell.webviewMatches.map(
            (match) => {
              if (!match.webviewIndex) {
                return void 0;
              }
              return {
                index: match.webviewIndex
              };
            }
          )
        );
        if (!cell.cell) {
          return void 0;
        }
        const findMatches = cell.contentMatches.map(
          (match) => {
            return new FindMatch(match.range(), [match.text()]);
          }
        );
        return new CellFindMatchModel(
          cell.cell,
          cell.cellIndex,
          findMatches,
          webviewMatches
        );
      })
    );
    try {
      this._findMatchDecorationModel.setAllFindMatchesDecorations(
        cellFindMatch
      );
    } catch (e) {
    }
  }
  async updateMatchesForEditorWidget() {
    if (!this._notebookEditorWidget) {
      return;
    }
    this._textMatches = /* @__PURE__ */ new Map();
    const wordSeparators = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
    const allMatches = await this._notebookEditorWidget.find(
      this._query.pattern,
      {
        regex: this._query.isRegExp,
        wholeWord: this._query.isWordMatch,
        caseSensitive: this._query.isCaseSensitive,
        wordSeparators: wordSeparators ?? void 0,
        includeMarkupInput: this._query.notebookInfo?.isInNotebookMarkdownInput,
        includeMarkupPreview: this._query.notebookInfo?.isInNotebookMarkdownPreview,
        includeCodeInput: this._query.notebookInfo?.isInNotebookCellInput,
        includeOutput: this._query.notebookInfo?.isInNotebookCellOutput
      },
      CancellationToken.None,
      false,
      true,
      this.searchInstanceID
    );
    this.updateNotebookMatches(allMatches, true);
  }
  async showMatch(match) {
    const offset = await this.highlightCurrentFindMatchDecoration(match);
    this.setSelectedMatch(match);
    this.revealCellRange(match, offset);
  }
  async highlightCurrentFindMatchDecoration(match) {
    if (!this._findMatchDecorationModel || !match.cell) {
      return null;
    }
    if (match.webviewIndex === void 0) {
      return this._findMatchDecorationModel.highlightCurrentFindMatchDecorationInCell(
        match.cell,
        match.range()
      );
    } else {
      return this._findMatchDecorationModel.highlightCurrentFindMatchDecorationInWebview(
        match.cell,
        match.webviewIndex
      );
    }
  }
  revealCellRange(match, outputOffset) {
    if (!this._notebookEditorWidget || !match.cell) {
      return;
    }
    if (match.webviewIndex !== void 0) {
      const index = this._notebookEditorWidget.getCellIndex(match.cell);
      if (index !== void 0) {
        this._notebookEditorWidget.revealCellOffsetInCenter(
          match.cell,
          outputOffset ?? 0
        );
      }
    } else {
      match.cell.updateEditState(
        match.cell.getEditState(),
        "focusNotebookCell"
      );
      this._notebookEditorWidget.setCellEditorSelection(
        match.cell,
        match.range()
      );
      this._notebookEditorWidget.revealRangeInCenterIfOutsideViewportAsync(
        match.cell,
        match.range()
      );
    }
  }
  //#endregion
};
FileMatch = __decorateClass([
  __decorateParam(7, IModelService),
  __decorateParam(8, IReplaceService),
  __decorateParam(9, ILabelService),
  __decorateParam(10, INotebookEditorService)
], FileMatch);
let FolderMatch = class extends Disposable {
  constructor(_resource, _id, _index, _query, _parent, _searchResult, _closestRoot, replaceService, instantiationService, labelService, uriIdentityService) {
    super();
    this._resource = _resource;
    this._id = _id;
    this._index = _index;
    this._query = _query;
    this._parent = _parent;
    this._searchResult = _searchResult;
    this._closestRoot = _closestRoot;
    this.replaceService = replaceService;
    this.instantiationService = instantiationService;
    this.uriIdentityService = uriIdentityService;
    this._fileMatches = new ResourceMap();
    this._folderMatches = new ResourceMap();
    this._folderMatchesMap = TernarySearchTree.forUris(
      (key) => this.uriIdentityService.extUri.ignorePathCasing(key)
    );
    this._unDisposedFileMatches = new ResourceMap();
    this._unDisposedFolderMatches = new ResourceMap();
    this._name = new Lazy(
      () => this.resource ? labelService.getUriBasenameLabel(this.resource) : ""
    );
  }
  static {
    __name(this, "FolderMatch");
  }
  _onChange = this._register(new Emitter());
  onChange = this._onChange.event;
  _onDispose = this._register(new Emitter());
  onDispose = this._onDispose.event;
  _fileMatches;
  _folderMatches;
  _folderMatchesMap;
  _unDisposedFileMatches;
  _unDisposedFolderMatches;
  _replacingAll = false;
  _name;
  get searchModel() {
    return this._searchResult.searchModel;
  }
  get showHighlights() {
    return this._parent.showHighlights;
  }
  get closestRoot() {
    return this._closestRoot;
  }
  set replacingAll(b) {
    this._replacingAll = b;
  }
  id() {
    return this._id;
  }
  get resource() {
    return this._resource;
  }
  index() {
    return this._index;
  }
  name() {
    return this._name.value;
  }
  parent() {
    return this._parent;
  }
  bindModel(model) {
    const fileMatch = this._fileMatches.get(model.uri);
    if (fileMatch) {
      fileMatch.bindModel(model);
    } else {
      const folderMatch = this.getFolderMatch(model.uri);
      const match = folderMatch?.getDownstreamFileMatch(model.uri);
      match?.bindModel(model);
    }
  }
  async bindNotebookEditorWidget(editor, resource) {
    const fileMatch = this._fileMatches.get(resource);
    if (fileMatch) {
      fileMatch.bindNotebookEditorWidget(editor);
      await fileMatch.updateMatchesForEditorWidget();
    } else {
      const folderMatches = this.folderMatchesIterator();
      for (const elem of folderMatches) {
        await elem.bindNotebookEditorWidget(editor, resource);
      }
    }
  }
  unbindNotebookEditorWidget(editor, resource) {
    const fileMatch = this._fileMatches.get(resource);
    if (fileMatch) {
      fileMatch.unbindNotebookEditorWidget(editor);
    } else {
      const folderMatches = this.folderMatchesIterator();
      for (const elem of folderMatches) {
        elem.unbindNotebookEditorWidget(editor, resource);
      }
    }
  }
  createIntermediateFolderMatch(resource, id, index, query, baseWorkspaceFolder) {
    const folderMatch = this._register(
      this.instantiationService.createInstance(
        FolderMatchWithResource,
        resource,
        id,
        index,
        query,
        this,
        this._searchResult,
        baseWorkspaceFolder
      )
    );
    this.configureIntermediateMatch(folderMatch);
    this.doAddFolder(folderMatch);
    return folderMatch;
  }
  configureIntermediateMatch(folderMatch) {
    const disposable = folderMatch.onChange(
      (event) => this.onFolderChange(folderMatch, event)
    );
    this._register(folderMatch.onDispose(() => disposable.dispose()));
  }
  clear(clearingAll = false) {
    const changed = this.allDownstreamFileMatches();
    this.disposeMatches();
    this._onChange.fire({
      elements: changed,
      removed: true,
      added: false,
      clearingAll
    });
  }
  remove(matches) {
    if (!Array.isArray(matches)) {
      matches = [matches];
    }
    const allMatches = getFileMatches(matches);
    this.doRemoveFile(allMatches);
  }
  async replace(match) {
    return this.replaceService.replace([match]).then(() => {
      this.doRemoveFile([match], true, true, true);
    });
  }
  replaceAll() {
    const matches = this.matches();
    return this.batchReplace(matches);
  }
  matches() {
    return [...this.fileMatchesIterator(), ...this.folderMatchesIterator()];
  }
  fileMatchesIterator() {
    return this._fileMatches.values();
  }
  folderMatchesIterator() {
    return this._folderMatches.values();
  }
  isEmpty() {
    return this.fileCount() + this.folderCount() === 0;
  }
  getDownstreamFileMatch(uri) {
    const directChildFileMatch = this._fileMatches.get(uri);
    if (directChildFileMatch) {
      return directChildFileMatch;
    }
    const folderMatch = this.getFolderMatch(uri);
    const match = folderMatch?.getDownstreamFileMatch(uri);
    if (match) {
      return match;
    }
    return null;
  }
  allDownstreamFileMatches() {
    let recursiveChildren = [];
    const iterator = this.folderMatchesIterator();
    for (const elem of iterator) {
      recursiveChildren = recursiveChildren.concat(
        elem.allDownstreamFileMatches()
      );
    }
    return [...this.fileMatchesIterator(), ...recursiveChildren];
  }
  fileCount() {
    return this._fileMatches.size;
  }
  folderCount() {
    return this._folderMatches.size;
  }
  count() {
    return this.fileCount() + this.folderCount();
  }
  recursiveFileCount() {
    return this.allDownstreamFileMatches().length;
  }
  recursiveMatchCount() {
    return this.allDownstreamFileMatches().reduce(
      (prev, match) => prev + match.count(),
      0
    );
  }
  get query() {
    return this._query;
  }
  addFileMatch(raw, silent, searchInstanceID, isAiContributed) {
    const added = [];
    const updated = [];
    raw.forEach((rawFileMatch) => {
      const existingFileMatch = this.getDownstreamFileMatch(
        rawFileMatch.resource
      );
      if (existingFileMatch) {
        if (rawFileMatch.results) {
          rawFileMatch.results.filter(resultIsMatch).forEach((m) => {
            textSearchResultToMatches(
              m,
              existingFileMatch,
              isAiContributed
            ).forEach((m2) => existingFileMatch.add(m2));
          });
        }
        if (isINotebookFileMatchWithModel(rawFileMatch) || isINotebookFileMatchNoModel(rawFileMatch)) {
          rawFileMatch.cellResults?.forEach((rawCellMatch) => {
            const existingCellMatch = existingFileMatch.getCellMatch(
              getIDFromINotebookCellMatch(rawCellMatch)
            );
            if (existingCellMatch) {
              existingCellMatch.addContentMatches(
                rawCellMatch.contentResults
              );
              existingCellMatch.addWebviewMatches(
                rawCellMatch.webviewResults
              );
            } else {
              existingFileMatch.addCellMatch(rawCellMatch);
            }
          });
        }
        updated.push(existingFileMatch);
        if (rawFileMatch.results && rawFileMatch.results.length > 0) {
          existingFileMatch.addContext(rawFileMatch.results);
        }
      } else if (this instanceof FolderMatchWorkspaceRoot || this instanceof FolderMatchNoRoot) {
        const fileMatch = this.createAndConfigureFileMatch(
          rawFileMatch,
          searchInstanceID
        );
        added.push(fileMatch);
      }
    });
    const elements = [...added, ...updated];
    if (!silent && elements.length) {
      this._onChange.fire({ elements, added: !!added.length });
    }
  }
  doAddFile(fileMatch) {
    this._fileMatches.set(fileMatch.resource, fileMatch);
    if (this._unDisposedFileMatches.has(fileMatch.resource)) {
      this._unDisposedFileMatches.delete(fileMatch.resource);
    }
  }
  hasOnlyReadOnlyMatches() {
    return Array.from(this._fileMatches.values()).every(
      (fm) => fm.hasOnlyReadOnlyMatches()
    );
  }
  uriHasParent(parent, child) {
    return this.uriIdentityService.extUri.isEqualOrParent(child, parent) && !this.uriIdentityService.extUri.isEqual(child, parent);
  }
  isInParentChain(folderMatch) {
    let matchItem = this;
    while (matchItem instanceof FolderMatch) {
      if (matchItem.id() === folderMatch.id()) {
        return true;
      }
      matchItem = matchItem.parent();
    }
    return false;
  }
  getFolderMatch(resource) {
    const folderMatch = this._folderMatchesMap.findSubstr(resource);
    return folderMatch;
  }
  doAddFolder(folderMatch) {
    if (this instanceof FolderMatchWithResource && !this.uriHasParent(this.resource, folderMatch.resource)) {
      throw Error(
        `${folderMatch.resource} does not belong as a child of ${this.resource}`
      );
    } else if (this.isInParentChain(folderMatch)) {
      throw Error(
        `${folderMatch.resource} is a parent of ${this.resource}`
      );
    }
    this._folderMatches.set(folderMatch.resource, folderMatch);
    this._folderMatchesMap.set(folderMatch.resource, folderMatch);
    if (this._unDisposedFolderMatches.has(folderMatch.resource)) {
      this._unDisposedFolderMatches.delete(folderMatch.resource);
    }
  }
  async batchReplace(matches) {
    const allMatches = getFileMatches(matches);
    await this.replaceService.replace(allMatches);
    this.doRemoveFile(allMatches, true, true, true);
  }
  onFileChange(fileMatch, removed = false) {
    let added = false;
    if (!this._fileMatches.has(fileMatch.resource)) {
      this.doAddFile(fileMatch);
      added = true;
    }
    if (fileMatch.count() === 0) {
      this.doRemoveFile([fileMatch], false, false);
      added = false;
      removed = true;
    }
    if (!this._replacingAll) {
      this._onChange.fire({
        elements: [fileMatch],
        added,
        removed
      });
    }
  }
  onFolderChange(folderMatch, event) {
    if (!this._folderMatches.has(folderMatch.resource)) {
      this.doAddFolder(folderMatch);
    }
    if (folderMatch.isEmpty()) {
      this._folderMatches.delete(folderMatch.resource);
      folderMatch.dispose();
    }
    this._onChange.fire(event);
  }
  doRemoveFile(fileMatches, dispose = true, trigger = true, keepReadonly = false) {
    const removed = [];
    for (const match of fileMatches) {
      if (this._fileMatches.get(match.resource)) {
        if (keepReadonly && match.hasReadonlyMatches()) {
          continue;
        }
        this._fileMatches.delete(match.resource);
        if (dispose) {
          match.dispose();
        } else {
          this._unDisposedFileMatches.set(match.resource, match);
        }
        removed.push(match);
      } else {
        const folder = this.getFolderMatch(match.resource);
        if (folder) {
          folder.doRemoveFile([match], dispose, trigger);
        } else {
          throw Error(
            `FileMatch ${match.resource} is not located within FolderMatch ${this.resource}`
          );
        }
      }
    }
    if (trigger) {
      this._onChange.fire({ elements: removed, removed: true });
    }
  }
  disposeMatches() {
    [...this._fileMatches.values()].forEach(
      (fileMatch) => fileMatch.dispose()
    );
    [...this._folderMatches.values()].forEach(
      (folderMatch) => folderMatch.disposeMatches()
    );
    [...this._unDisposedFileMatches.values()].forEach(
      (fileMatch) => fileMatch.dispose()
    );
    [...this._unDisposedFolderMatches.values()].forEach(
      (folderMatch) => folderMatch.disposeMatches()
    );
    this._fileMatches.clear();
    this._folderMatches.clear();
    this._unDisposedFileMatches.clear();
    this._unDisposedFolderMatches.clear();
  }
  dispose() {
    this.disposeMatches();
    this._onDispose.fire();
    super.dispose();
  }
};
FolderMatch = __decorateClass([
  __decorateParam(7, IReplaceService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, ILabelService),
  __decorateParam(10, IUriIdentityService)
], FolderMatch);
let FolderMatchWithResource = class extends FolderMatch {
  static {
    __name(this, "FolderMatchWithResource");
  }
  _normalizedResource;
  constructor(_resource, _id, _index, _query, _parent, _searchResult, _closestRoot, replaceService, instantiationService, labelService, uriIdentityService) {
    super(
      _resource,
      _id,
      _index,
      _query,
      _parent,
      _searchResult,
      _closestRoot,
      replaceService,
      instantiationService,
      labelService,
      uriIdentityService
    );
    this._normalizedResource = new Lazy(
      () => this.uriIdentityService.extUri.removeTrailingPathSeparator(
        this.uriIdentityService.extUri.normalizePath(this.resource)
      )
    );
  }
  get resource() {
    return this._resource;
  }
  get normalizedResource() {
    return this._normalizedResource.value;
  }
};
FolderMatchWithResource = __decorateClass([
  __decorateParam(7, IReplaceService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, ILabelService),
  __decorateParam(10, IUriIdentityService)
], FolderMatchWithResource);
let FolderMatchWorkspaceRoot = class extends FolderMatchWithResource {
  constructor(_resource, _id, _index, _query, _parent, _ai, replaceService, instantiationService, labelService, uriIdentityService) {
    super(
      _resource,
      _id,
      _index,
      _query,
      _parent,
      _parent,
      null,
      replaceService,
      instantiationService,
      labelService,
      uriIdentityService
    );
    this._ai = _ai;
  }
  static {
    __name(this, "FolderMatchWorkspaceRoot");
  }
  normalizedUriParent(uri) {
    return this.uriIdentityService.extUri.normalizePath(
      this.uriIdentityService.extUri.dirname(uri)
    );
  }
  uriEquals(uri1, ur2) {
    return this.uriIdentityService.extUri.isEqual(uri1, ur2);
  }
  createFileMatch(query, previewOptions, maxResults, parent, rawFileMatch, closestRoot, searchInstanceID) {
    const fileMatch = this.instantiationService.createInstance(
      FileMatch,
      query,
      previewOptions,
      maxResults,
      parent,
      rawFileMatch,
      closestRoot,
      searchInstanceID
    );
    fileMatch.createMatches(this._ai);
    parent.doAddFile(fileMatch);
    const disposable = fileMatch.onChange(
      ({ didRemove }) => parent.onFileChange(fileMatch, didRemove)
    );
    this._register(fileMatch.onDispose(() => disposable.dispose()));
    return fileMatch;
  }
  createAndConfigureFileMatch(rawFileMatch, searchInstanceID) {
    if (!this.uriHasParent(this.resource, rawFileMatch.resource)) {
      throw Error(
        `${rawFileMatch.resource} is not a descendant of ${this.resource}`
      );
    }
    const fileMatchParentParts = [];
    let uri = this.normalizedUriParent(rawFileMatch.resource);
    while (!this.uriEquals(this.normalizedResource, uri)) {
      fileMatchParentParts.unshift(uri);
      const prevUri = uri;
      uri = this.uriIdentityService.extUri.removeTrailingPathSeparator(
        this.normalizedUriParent(uri)
      );
      if (this.uriEquals(prevUri, uri)) {
        throw Error(
          `${rawFileMatch.resource} is not correctly configured as a child of ${this.normalizedResource}`
        );
      }
    }
    const root = this.closestRoot ?? this;
    let parent = this;
    for (let i = 0; i < fileMatchParentParts.length; i++) {
      let folderMatch = parent.getFolderMatch(fileMatchParentParts[i]);
      if (!folderMatch) {
        folderMatch = parent.createIntermediateFolderMatch(
          fileMatchParentParts[i],
          fileMatchParentParts[i].toString(),
          -1,
          this._query,
          root
        );
      }
      parent = folderMatch;
    }
    return this.createFileMatch(
      this._query.contentPattern,
      this._query.previewOptions,
      this._query.maxResults,
      parent,
      rawFileMatch,
      root,
      searchInstanceID
    );
  }
};
FolderMatchWorkspaceRoot = __decorateClass([
  __decorateParam(6, IReplaceService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, ILabelService),
  __decorateParam(9, IUriIdentityService)
], FolderMatchWorkspaceRoot);
let FolderMatchNoRoot = class extends FolderMatch {
  static {
    __name(this, "FolderMatchNoRoot");
  }
  constructor(_id, _index, _query, _parent, replaceService, instantiationService, labelService, uriIdentityService) {
    super(
      null,
      _id,
      _index,
      _query,
      _parent,
      _parent,
      null,
      replaceService,
      instantiationService,
      labelService,
      uriIdentityService
    );
  }
  createAndConfigureFileMatch(rawFileMatch, searchInstanceID) {
    const fileMatch = this._register(
      this.instantiationService.createInstance(
        FileMatch,
        this._query.contentPattern,
        this._query.previewOptions,
        this._query.maxResults,
        this,
        rawFileMatch,
        null,
        searchInstanceID
      )
    );
    fileMatch.createMatches(false);
    this.doAddFile(fileMatch);
    const disposable = fileMatch.onChange(
      ({ didRemove }) => this.onFileChange(fileMatch, didRemove)
    );
    this._register(fileMatch.onDispose(() => disposable.dispose()));
    return fileMatch;
  }
};
FolderMatchNoRoot = __decorateClass([
  __decorateParam(4, IReplaceService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ILabelService),
  __decorateParam(7, IUriIdentityService)
], FolderMatchNoRoot);
let elemAIndex = -1;
let elemBIndex = -1;
function searchMatchComparer(elementA, elementB, sortOrder = SearchSortOrder.Default) {
  if (elementA instanceof FileMatch && elementB instanceof FolderMatch) {
    return 1;
  }
  if (elementB instanceof FileMatch && elementA instanceof FolderMatch) {
    return -1;
  }
  if (elementA instanceof FolderMatch && elementB instanceof FolderMatch) {
    elemAIndex = elementA.index();
    elemBIndex = elementB.index();
    if (elemAIndex !== -1 && elemBIndex !== -1) {
      return elemAIndex - elemBIndex;
    }
    switch (sortOrder) {
      case SearchSortOrder.CountDescending:
        return elementB.count() - elementA.count();
      case SearchSortOrder.CountAscending:
        return elementA.count() - elementB.count();
      case SearchSortOrder.Type:
        return compareFileExtensions(elementA.name(), elementB.name());
      case SearchSortOrder.FileNames:
        return compareFileNames(elementA.name(), elementB.name());
      // Fall through otherwise
      default:
        if (!elementA.resource || !elementB.resource) {
          return 0;
        }
        return comparePaths(
          elementA.resource.fsPath,
          elementB.resource.fsPath
        ) || compareFileNames(elementA.name(), elementB.name());
    }
  }
  if (elementA instanceof FileMatch && elementB instanceof FileMatch) {
    switch (sortOrder) {
      case SearchSortOrder.CountDescending:
        return elementB.count() - elementA.count();
      case SearchSortOrder.CountAscending:
        return elementA.count() - elementB.count();
      case SearchSortOrder.Type:
        return compareFileExtensions(elementA.name(), elementB.name());
      case SearchSortOrder.FileNames:
        return compareFileNames(elementA.name(), elementB.name());
      case SearchSortOrder.Modified: {
        const fileStatA = elementA.fileStat;
        const fileStatB = elementB.fileStat;
        if (fileStatA && fileStatB) {
          return fileStatB.mtime - fileStatA.mtime;
        }
      }
      // Fall through otherwise
      default:
        return comparePaths(
          elementA.resource.fsPath,
          elementB.resource.fsPath
        ) || compareFileNames(elementA.name(), elementB.name());
    }
  }
  if (elementA instanceof MatchInNotebook && elementB instanceof MatchInNotebook) {
    return compareNotebookPos(elementA, elementB);
  }
  if (elementA instanceof Match && elementB instanceof Match) {
    return Range.compareRangesUsingStarts(
      elementA.range(),
      elementB.range()
    );
  }
  return 0;
}
__name(searchMatchComparer, "searchMatchComparer");
function compareNotebookPos(match1, match2) {
  if (match1.cellIndex === match2.cellIndex) {
    if (match1.webviewIndex !== void 0 && match2.webviewIndex !== void 0) {
      return match1.webviewIndex - match2.webviewIndex;
    } else if (match1.webviewIndex === void 0 && match2.webviewIndex === void 0) {
      return Range.compareRangesUsingStarts(
        match1.range(),
        match2.range()
      );
    } else {
      if (match1.webviewIndex !== void 0) {
        return 1;
      } else {
        return -1;
      }
    }
  } else if (match1.cellIndex < match2.cellIndex) {
    return -1;
  } else {
    return 1;
  }
}
__name(compareNotebookPos, "compareNotebookPos");
function searchComparer(elementA, elementB, sortOrder = SearchSortOrder.Default) {
  const elemAParents = createParentList(elementA);
  const elemBParents = createParentList(elementB);
  let i = elemAParents.length - 1;
  let j = elemBParents.length - 1;
  while (i >= 0 && j >= 0) {
    if (elemAParents[i].id() !== elemBParents[j].id()) {
      return searchMatchComparer(
        elemAParents[i],
        elemBParents[j],
        sortOrder
      );
    }
    i--;
    j--;
  }
  const elemAAtEnd = i === 0;
  const elemBAtEnd = j === 0;
  if (elemAAtEnd && !elemBAtEnd) {
    return 1;
  } else if (!elemAAtEnd && elemBAtEnd) {
    return -1;
  }
  return 0;
}
__name(searchComparer, "searchComparer");
function createParentList(element) {
  const parentArray = [];
  let currElement = element;
  while (!(currElement instanceof SearchResult)) {
    parentArray.push(currElement);
    currElement = currElement.parent();
  }
  return parentArray;
}
__name(createParentList, "createParentList");
let SearchResult = class extends Disposable {
  constructor(searchModel, replaceService, instantiationService, modelService, uriIdentityService, notebookEditorService) {
    super();
    this.searchModel = searchModel;
    this.replaceService = replaceService;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
    this.uriIdentityService = uriIdentityService;
    this.notebookEditorService = notebookEditorService;
    this._rangeHighlightDecorations = this.instantiationService.createInstance(RangeHighlightDecorations);
    this.modelService.getModels().forEach((model) => this.onModelAdded(model));
    this._register(
      this.modelService.onModelAdded((model) => this.onModelAdded(model))
    );
    this._register(
      this.notebookEditorService.onDidAddNotebookEditor((widget) => {
        if (widget instanceof NotebookEditorWidget) {
          this.onDidAddNotebookEditorWidget(
            widget
          );
        }
      })
    );
    this._register(
      this.onChange((e) => {
        if (e.removed) {
          this._isDirty = !this.isEmpty() || !this.isEmpty(true);
        }
      })
    );
  }
  static {
    __name(this, "SearchResult");
  }
  _onChange = this._register(
    new PauseableEmitter({
      merge: mergeSearchResultEvents
    })
  );
  onChange = this._onChange.event;
  _folderMatches = [];
  _aiFolderMatches = [];
  _otherFilesMatch = null;
  _folderMatchesMap = TernarySearchTree.forUris(
    (key) => this.uriIdentityService.extUri.ignorePathCasing(key)
  );
  _aiFolderMatchesMap = TernarySearchTree.forUris(
    (key) => this.uriIdentityService.extUri.ignorePathCasing(key)
  );
  _showHighlights = false;
  _query = null;
  _rangeHighlightDecorations;
  disposePastResults = /* @__PURE__ */ __name(() => Promise.resolve(), "disposePastResults");
  _isDirty = false;
  _onWillChangeModelListener;
  _onDidChangeModelListener;
  _cachedSearchComplete;
  _aiCachedSearchComplete;
  async batchReplace(elementsToReplace) {
    try {
      this._onChange.pause();
      await Promise.all(
        elementsToReplace.map(async (elem) => {
          const parent = elem.parent();
          if ((parent instanceof FolderMatch || parent instanceof FileMatch) && arrayContainsElementOrParent(parent, elementsToReplace)) {
            return;
          }
          if (elem instanceof FileMatch) {
            await elem.parent().replace(elem);
          } else if (elem instanceof Match) {
            await elem.parent().replace(elem);
          } else if (elem instanceof FolderMatch) {
            await elem.replaceAll();
          }
        })
      );
    } finally {
      this._onChange.resume();
    }
  }
  batchRemove(elementsToRemove) {
    const removedElems = [];
    try {
      this._onChange.pause();
      elementsToRemove.forEach((currentElement) => {
        if (!arrayContainsElementOrParent(currentElement, removedElems)) {
          currentElement.parent().remove(
            currentElement
          );
          removedElems.push(currentElement);
        }
      });
    } finally {
      this._onChange.resume();
    }
  }
  get isDirty() {
    return this._isDirty;
  }
  get query() {
    return this._query;
  }
  set query(query) {
    const oldFolderMatches = this.folderMatches();
    this.disposePastResults = async () => {
      oldFolderMatches.forEach((match) => match.clear());
      oldFolderMatches.forEach((match) => match.dispose());
      this._isDirty = false;
    };
    this._cachedSearchComplete = void 0;
    this._aiCachedSearchComplete = void 0;
    this._rangeHighlightDecorations.removeHighlightRange();
    this._folderMatchesMap = TernarySearchTree.forUris(
      (key) => this.uriIdentityService.extUri.ignorePathCasing(key)
    );
    this._aiFolderMatchesMap = TernarySearchTree.forUris(
      (key) => this.uriIdentityService.extUri.ignorePathCasing(key)
    );
    if (!query) {
      return;
    }
    this._folderMatches = (query && query.folderQueries || []).map((fq) => fq.folder).map(
      (resource, index) => this._createBaseFolderMatch(
        resource,
        resource.toString(),
        index,
        query,
        false
      )
    );
    this._folderMatches.forEach(
      (fm) => this._folderMatchesMap.set(fm.resource, fm)
    );
    this._aiFolderMatches = (query && query.folderQueries || []).map((fq) => fq.folder).map(
      (resource, index) => this._createBaseFolderMatch(
        resource,
        resource.toString(),
        index,
        query,
        true
      )
    );
    this._aiFolderMatches.forEach(
      (fm) => this._aiFolderMatchesMap.set(fm.resource, fm)
    );
    this._otherFilesMatch = this._createBaseFolderMatch(
      null,
      "otherFiles",
      this._folderMatches.length + this._aiFolderMatches.length + 1,
      query,
      false
    );
    this._query = query;
  }
  setCachedSearchComplete(cachedSearchComplete, ai) {
    if (ai) {
      this._aiCachedSearchComplete = cachedSearchComplete;
    } else {
      this._cachedSearchComplete = cachedSearchComplete;
    }
  }
  getCachedSearchComplete(ai) {
    return ai ? this._aiCachedSearchComplete : this._cachedSearchComplete;
  }
  onDidAddNotebookEditorWidget(widget) {
    this._onWillChangeModelListener?.dispose();
    this._onWillChangeModelListener = widget.onWillChangeModel((model) => {
      if (model) {
        this.onNotebookEditorWidgetRemoved(widget, model?.uri);
      }
    });
    this._onDidChangeModelListener?.dispose();
    this._onDidChangeModelListener = widget.onDidAttachViewModel(() => {
      if (widget.hasModel()) {
        this.onNotebookEditorWidgetAdded(widget, widget.textModel.uri);
      }
    });
  }
  onModelAdded(model) {
    const folderMatch = this._folderMatchesMap.findSubstr(model.uri);
    folderMatch?.bindModel(model);
  }
  async onNotebookEditorWidgetAdded(editor, resource) {
    const folderMatch = this._folderMatchesMap.findSubstr(resource);
    await folderMatch?.bindNotebookEditorWidget(editor, resource);
  }
  onNotebookEditorWidgetRemoved(editor, resource) {
    const folderMatch = this._folderMatchesMap.findSubstr(resource);
    folderMatch?.unbindNotebookEditorWidget(editor, resource);
  }
  _createBaseFolderMatch(resource, id, index, query, ai) {
    let folderMatch;
    if (resource) {
      folderMatch = this._register(
        this.instantiationService.createInstance(
          FolderMatchWorkspaceRoot,
          resource,
          id,
          index,
          query,
          this,
          ai
        )
      );
    } else {
      folderMatch = this._register(
        this.instantiationService.createInstance(
          FolderMatchNoRoot,
          id,
          index,
          query,
          this
        )
      );
    }
    const disposable = folderMatch.onChange(
      (event) => this._onChange.fire(event)
    );
    this._register(folderMatch.onDispose(() => disposable.dispose()));
    return folderMatch;
  }
  add(allRaw, searchInstanceID, ai, silent = false) {
    const { byFolder, other } = this.groupFilesByFolder(allRaw, ai);
    byFolder.forEach((raw) => {
      if (!raw.length) {
        return;
      }
      const folderMatch = ai ? this.getAIFolderMatch(raw[0].resource) : this.getFolderMatch(raw[0].resource);
      folderMatch?.addFileMatch(raw, silent, searchInstanceID, ai);
    });
    if (!ai) {
      this._otherFilesMatch?.addFileMatch(
        other,
        silent,
        searchInstanceID,
        false
      );
    }
    this.disposePastResults();
  }
  clear() {
    this.folderMatches().forEach((folderMatch) => folderMatch.clear(true));
    this.folderMatches(true);
    this.disposeMatches();
    this._folderMatches = [];
    this._aiFolderMatches = [];
    this._otherFilesMatch = null;
  }
  remove(matches, ai = false) {
    if (!Array.isArray(matches)) {
      matches = [matches];
    }
    matches.forEach((m) => {
      if (m instanceof FolderMatch) {
        m.clear();
      }
    });
    const fileMatches = matches.filter(
      (m) => m instanceof FileMatch
    );
    const { byFolder, other } = this.groupFilesByFolder(fileMatches, ai);
    byFolder.forEach((matches2) => {
      if (!matches2.length) {
        return;
      }
      this.getFolderMatch(matches2[0].resource).remove(
        matches2
      );
    });
    if (other.length) {
      this.getFolderMatch(other[0].resource).remove(other);
    }
  }
  replace(match) {
    return this.getFolderMatch(match.resource).replace(match);
  }
  replaceAll(progress) {
    this.replacingAll = true;
    const promise = this.replaceService.replace(this.matches(), progress);
    return promise.then(
      () => {
        this.replacingAll = false;
        this.clear();
      },
      () => {
        this.replacingAll = false;
      }
    );
  }
  folderMatches(ai = false) {
    if (ai) {
      return this._aiFolderMatches;
    }
    return this._otherFilesMatch ? [...this._folderMatches, this._otherFilesMatch] : [...this._folderMatches];
  }
  matches(ai = false) {
    const matches = [];
    this.folderMatches(ai).forEach((folderMatch) => {
      matches.push(folderMatch.allDownstreamFileMatches());
    });
    return [].concat(...matches);
  }
  isEmpty(ai = false) {
    return this.folderMatches(ai).every(
      (folderMatch) => folderMatch.isEmpty()
    );
  }
  fileCount(ai = false) {
    return this.folderMatches(ai).reduce(
      (prev, match) => prev + match.recursiveFileCount(),
      0
    );
  }
  count(ai = false) {
    return this.matches(ai).reduce(
      (prev, match) => prev + match.count(),
      0
    );
  }
  get showHighlights() {
    return this._showHighlights;
  }
  toggleHighlights(value) {
    if (this._showHighlights === value) {
      return;
    }
    this._showHighlights = value;
    let selectedMatch = null;
    this.matches().forEach((fileMatch) => {
      fileMatch.updateHighlights();
      fileMatch.updateNotebookHighlights();
      if (!selectedMatch) {
        selectedMatch = fileMatch.getSelectedMatch();
      }
    });
    if (this._showHighlights && selectedMatch) {
      this._rangeHighlightDecorations.highlightRange(
        selectedMatch.parent().resource,
        selectedMatch.range()
      );
    } else {
      this._rangeHighlightDecorations.removeHighlightRange();
    }
  }
  get rangeHighlightDecorations() {
    return this._rangeHighlightDecorations;
  }
  getFolderMatch(resource) {
    const folderMatch = this._folderMatchesMap.findSubstr(resource);
    return folderMatch ? folderMatch : this._otherFilesMatch;
  }
  getAIFolderMatch(resource) {
    const folderMatch = this._aiFolderMatchesMap.findSubstr(resource);
    return folderMatch;
  }
  set replacingAll(running) {
    this.folderMatches().forEach((folderMatch) => {
      folderMatch.replacingAll = running;
    });
  }
  groupFilesByFolder(fileMatches, ai) {
    const rawPerFolder = new ResourceMap();
    const otherFileMatches = [];
    (ai ? this._aiFolderMatches : this._folderMatches).forEach(
      (fm) => rawPerFolder.set(fm.resource, [])
    );
    fileMatches.forEach((rawFileMatch) => {
      const folderMatch = ai ? this.getAIFolderMatch(rawFileMatch.resource) : this.getFolderMatch(rawFileMatch.resource);
      if (!folderMatch) {
        return;
      }
      const resource = folderMatch.resource;
      if (resource) {
        rawPerFolder.get(resource).push(rawFileMatch);
      } else {
        otherFileMatches.push(rawFileMatch);
      }
    });
    return {
      byFolder: rawPerFolder,
      other: otherFileMatches
    };
  }
  disposeMatches() {
    this.folderMatches().forEach((folderMatch) => folderMatch.dispose());
    this.folderMatches(true).forEach(
      (folderMatch) => folderMatch.dispose()
    );
    this._folderMatches = [];
    this._aiFolderMatches = [];
    this._folderMatchesMap = TernarySearchTree.forUris(
      (key) => this.uriIdentityService.extUri.ignorePathCasing(key)
    );
    this._aiFolderMatchesMap = TernarySearchTree.forUris(
      (key) => this.uriIdentityService.extUri.ignorePathCasing(key)
    );
    this._rangeHighlightDecorations.removeHighlightRange();
  }
  async dispose() {
    this._onWillChangeModelListener?.dispose();
    this._onDidChangeModelListener?.dispose();
    this._rangeHighlightDecorations.dispose();
    this.disposeMatches();
    super.dispose();
    await this.disposePastResults();
  }
};
SearchResult = __decorateClass([
  __decorateParam(1, IReplaceService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IModelService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, INotebookEditorService)
], SearchResult);
var SearchModelLocation = /* @__PURE__ */ ((SearchModelLocation2) => {
  SearchModelLocation2[SearchModelLocation2["PANEL"] = 0] = "PANEL";
  SearchModelLocation2[SearchModelLocation2["QUICK_ACCESS"] = 1] = "QUICK_ACCESS";
  return SearchModelLocation2;
})(SearchModelLocation || {});
let SearchModel = class extends Disposable {
  constructor(searchService, telemetryService, configurationService, instantiationService, logService, notebookSearchService, progressService) {
    super();
    this.searchService = searchService;
    this.telemetryService = telemetryService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.notebookSearchService = notebookSearchService;
    this.progressService = progressService;
    this._searchResult = this.instantiationService.createInstance(
      SearchResult,
      this
    );
    this._register(
      this._searchResult.onChange(
        (e) => this._onSearchResultChanged.fire(e)
      )
    );
  }
  static {
    __name(this, "SearchModel");
  }
  _searchResult;
  _searchQuery = null;
  _replaceActive = false;
  _replaceString = null;
  _replacePattern = null;
  _preserveCase = false;
  _startStreamDelay = Promise.resolve();
  _resultQueue = [];
  _aiResultQueue = [];
  _onReplaceTermChanged = this._register(
    new Emitter()
  );
  onReplaceTermChanged = this._onReplaceTermChanged.event;
  _onSearchResultChanged = this._register(
    new PauseableEmitter({
      merge: mergeSearchResultEvents
    })
  );
  onSearchResultChanged = this._onSearchResultChanged.event;
  currentCancelTokenSource = null;
  currentAICancelTokenSource = null;
  searchCancelledForNewSearch = false;
  aiSearchCancelledForNewSearch = false;
  location = 0 /* PANEL */;
  isReplaceActive() {
    return this._replaceActive;
  }
  set replaceActive(replaceActive) {
    this._replaceActive = replaceActive;
  }
  get replacePattern() {
    return this._replacePattern;
  }
  get replaceString() {
    return this._replaceString || "";
  }
  set preserveCase(value) {
    this._preserveCase = value;
  }
  get preserveCase() {
    return this._preserveCase;
  }
  set replaceString(replaceString) {
    this._replaceString = replaceString;
    if (this._searchQuery) {
      this._replacePattern = new ReplacePattern(
        replaceString,
        this._searchQuery.contentPattern
      );
    }
    this._onReplaceTermChanged.fire();
  }
  get searchResult() {
    return this._searchResult;
  }
  async addAIResults(onProgress) {
    if (this.searchResult.count(true)) {
      return;
    } else if (this._searchQuery) {
      await this.aiSearch(
        {
          ...this._searchQuery,
          contentPattern: this._searchQuery.contentPattern.pattern,
          type: QueryType.aiText
        },
        onProgress,
        this.currentCancelTokenSource?.token
      );
    }
  }
  async doAISearchWithModal(searchQuery, searchInstanceID, token, onProgress) {
    const promise = this.searchService.aiTextSearch(
      searchQuery,
      token,
      async (p) => {
        this.onSearchProgress(p, searchInstanceID, false, true);
        onProgress?.(p);
      }
    );
    return this.progressService.withProgress(
      {
        location: ProgressLocation.Notification,
        type: "syncing",
        title: "Searching for AI results..."
      },
      async (_) => promise
    );
  }
  aiSearch(query, onProgress, callerToken) {
    const searchInstanceID = Date.now().toString();
    const tokenSource = this.currentAICancelTokenSource = new CancellationTokenSource(callerToken);
    const start = Date.now();
    const asyncAIResults = this.doAISearchWithModal(
      query,
      searchInstanceID,
      this.currentAICancelTokenSource.token,
      async (p) => {
        this.onSearchProgress(p, searchInstanceID, false, true);
        onProgress?.(p);
      }
    ).then(
      (value) => {
        this.onSearchCompleted(
          value,
          Date.now() - start,
          searchInstanceID,
          true
        );
        return value;
      },
      (e) => {
        this.onSearchError(e, Date.now() - start, true);
        throw e;
      }
    ).finally(() => tokenSource.dispose());
    return asyncAIResults;
  }
  doSearch(query, progressEmitter, searchQuery, searchInstanceID, onProgress, callerToken) {
    const asyncGenerateOnProgress = /* @__PURE__ */ __name(async (p) => {
      progressEmitter.fire();
      this.onSearchProgress(p, searchInstanceID, false, false);
      onProgress?.(p);
    }, "asyncGenerateOnProgress");
    const syncGenerateOnProgress = /* @__PURE__ */ __name((p) => {
      progressEmitter.fire();
      this.onSearchProgress(p, searchInstanceID, true);
      onProgress?.(p);
    }, "syncGenerateOnProgress");
    const tokenSource = this.currentCancelTokenSource = new CancellationTokenSource(callerToken);
    const notebookResult = this.notebookSearchService.notebookSearch(
      query,
      tokenSource.token,
      searchInstanceID,
      asyncGenerateOnProgress
    );
    const textResult = this.searchService.textSearchSplitSyncAsync(
      searchQuery,
      this.currentCancelTokenSource.token,
      asyncGenerateOnProgress,
      notebookResult.openFilesToScan,
      notebookResult.allScannedFiles
    );
    const syncResults = textResult.syncResults.results;
    syncResults.forEach((p) => {
      if (p) {
        syncGenerateOnProgress(p);
      }
    });
    const getAsyncResults = /* @__PURE__ */ __name(async () => {
      const searchStart = Date.now();
      const allClosedEditorResults = await textResult.asyncResults;
      const resolvedNotebookResults = await notebookResult.completeData;
      tokenSource.dispose();
      const searchLength = Date.now() - searchStart;
      const resolvedResult = {
        results: [
          ...allClosedEditorResults.results,
          ...resolvedNotebookResults.results
        ],
        messages: [
          ...allClosedEditorResults.messages,
          ...resolvedNotebookResults.messages
        ],
        limitHit: allClosedEditorResults.limitHit || resolvedNotebookResults.limitHit,
        exit: allClosedEditorResults.exit,
        stats: allClosedEditorResults.stats
      };
      this.logService.trace(`whole search time | ${searchLength}ms`);
      return resolvedResult;
    }, "getAsyncResults");
    return {
      asyncResults: getAsyncResults(),
      syncResults
    };
  }
  search(query, onProgress, callerToken) {
    this.cancelSearch(true);
    this._searchQuery = query;
    if (!this.searchConfig.searchOnType) {
      this.searchResult.clear();
    }
    const searchInstanceID = Date.now().toString();
    this._searchResult.query = this._searchQuery;
    const progressEmitter = this._register(new Emitter());
    this._replacePattern = new ReplacePattern(
      this.replaceString,
      this._searchQuery.contentPattern
    );
    this._startStreamDelay = new Promise(
      (resolve) => setTimeout(resolve, this.searchConfig.searchOnType ? 150 : 0)
    );
    const req = this.doSearch(
      query,
      progressEmitter,
      this._searchQuery,
      searchInstanceID,
      onProgress,
      callerToken
    );
    const asyncResults = req.asyncResults;
    const syncResults = req.syncResults;
    if (onProgress) {
      syncResults.forEach((p) => {
        if (p) {
          onProgress(p);
        }
      });
    }
    const start = Date.now();
    let event;
    const progressEmitterPromise = new Promise((resolve) => {
      event = Event.once(progressEmitter.event)(resolve);
      return event;
    });
    Promise.race([asyncResults, progressEmitterPromise]).finally(() => {
      event?.dispose();
      this.telemetryService.publicLog("searchResultsFirstRender", {
        duration: Date.now() - start
      });
    });
    try {
      return {
        asyncResults: asyncResults.then(
          (value) => {
            this.onSearchCompleted(
              value,
              Date.now() - start,
              searchInstanceID,
              false
            );
            return value;
          },
          (e) => {
            this.onSearchError(e, Date.now() - start, false);
            throw e;
          }
        ),
        syncResults
      };
    } finally {
      this.telemetryService.publicLog("searchResultsFinished", {
        duration: Date.now() - start
      });
    }
  }
  onSearchCompleted(completed, duration, searchInstanceID, ai) {
    if (!this._searchQuery) {
      throw new Error(
        "onSearchCompleted must be called after a search is started"
      );
    }
    if (ai) {
      this._searchResult.add(this._aiResultQueue, searchInstanceID, true);
      this._aiResultQueue.length = 0;
    } else {
      this._searchResult.add(this._resultQueue, searchInstanceID, false);
      this._resultQueue.length = 0;
    }
    this.searchResult.setCachedSearchComplete(completed, ai);
    const options = Object.assign(
      {},
      this._searchQuery.contentPattern
    );
    delete options.pattern;
    const stats = completed && completed.stats;
    const fileSchemeOnly = this._searchQuery.folderQueries.every(
      (fq) => fq.folder.scheme === Schemas.file
    );
    const otherSchemeOnly = this._searchQuery.folderQueries.every(
      (fq) => fq.folder.scheme !== Schemas.file
    );
    const scheme = fileSchemeOnly ? Schemas.file : otherSchemeOnly ? "other" : "mixed";
    this.telemetryService.publicLog("searchResultsShown", {
      count: this._searchResult.count(),
      fileCount: this._searchResult.fileCount(),
      options,
      duration,
      type: stats && stats.type,
      scheme,
      searchOnTypeEnabled: this.searchConfig.searchOnType
    });
    return completed;
  }
  onSearchError(e, duration, ai) {
    if (errors.isCancellationError(e)) {
      this.onSearchCompleted(
        (ai ? this.aiSearchCancelledForNewSearch : this.searchCancelledForNewSearch) ? {
          exit: SearchCompletionExitCode.NewSearchStarted,
          results: [],
          messages: []
        } : void 0,
        duration,
        "",
        ai
      );
      if (ai) {
        this.aiSearchCancelledForNewSearch = false;
      } else {
        this.searchCancelledForNewSearch = false;
      }
    }
  }
  onSearchProgress(p, searchInstanceID, sync = true, ai = false) {
    const targetQueue = ai ? this._aiResultQueue : this._resultQueue;
    if (p.resource) {
      targetQueue.push(p);
      if (sync) {
        if (targetQueue.length) {
          this._searchResult.add(
            targetQueue,
            searchInstanceID,
            false,
            true
          );
          targetQueue.length = 0;
        }
      } else {
        this._startStreamDelay.then(() => {
          if (targetQueue.length) {
            this._searchResult.add(
              targetQueue,
              searchInstanceID,
              ai,
              true
            );
            targetQueue.length = 0;
          }
        });
      }
    }
  }
  get searchConfig() {
    return this.configurationService.getValue(
      "search"
    );
  }
  cancelSearch(cancelledForNewSearch = false) {
    if (this.currentCancelTokenSource) {
      this.searchCancelledForNewSearch = cancelledForNewSearch;
      this.currentCancelTokenSource.cancel();
      return true;
    }
    return false;
  }
  cancelAISearch(cancelledForNewSearch = false) {
    if (this.currentAICancelTokenSource) {
      this.aiSearchCancelledForNewSearch = cancelledForNewSearch;
      this.currentAICancelTokenSource.cancel();
      return true;
    }
    return false;
  }
  dispose() {
    this.cancelSearch();
    this.cancelAISearch();
    this.searchResult.dispose();
    super.dispose();
  }
};
SearchModel = __decorateClass([
  __decorateParam(0, ISearchService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILogService),
  __decorateParam(5, INotebookSearchService),
  __decorateParam(6, IProgressService)
], SearchModel);
let SearchViewModelWorkbenchService = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "SearchViewModelWorkbenchService");
  }
  _searchModel = null;
  get searchModel() {
    if (!this._searchModel) {
      this._searchModel = this.instantiationService.createInstance(SearchModel);
    }
    return this._searchModel;
  }
  set searchModel(searchModel) {
    this._searchModel?.dispose();
    this._searchModel = searchModel;
  }
};
SearchViewModelWorkbenchService = __decorateClass([
  __decorateParam(0, IInstantiationService)
], SearchViewModelWorkbenchService);
const ISearchViewModelWorkbenchService = createDecorator(
  "searchViewModelWorkbenchService"
);
let RangeHighlightDecorations = class {
  constructor(_modelService) {
    this._modelService = _modelService;
  }
  static {
    __name(this, "RangeHighlightDecorations");
  }
  _decorationId = null;
  _model = null;
  _modelDisposables = new DisposableStore();
  removeHighlightRange() {
    if (this._model && this._decorationId) {
      const decorationId = this._decorationId;
      this._model.changeDecorations((accessor) => {
        accessor.removeDecoration(decorationId);
      });
    }
    this._decorationId = null;
  }
  highlightRange(resource, range, ownerId = 0) {
    let model;
    if (URI.isUri(resource)) {
      model = this._modelService.getModel(resource);
    } else {
      model = resource;
    }
    if (model) {
      this.doHighlightRange(model, range);
    }
  }
  doHighlightRange(model, range) {
    this.removeHighlightRange();
    model.changeDecorations((accessor) => {
      this._decorationId = accessor.addDecoration(
        range,
        RangeHighlightDecorations._RANGE_HIGHLIGHT_DECORATION
      );
    });
    this.setModel(model);
  }
  setModel(model) {
    if (this._model !== model) {
      this.clearModelListeners();
      this._model = model;
      this._modelDisposables.add(
        this._model.onDidChangeDecorations((e) => {
          this.clearModelListeners();
          this.removeHighlightRange();
          this._model = null;
        })
      );
      this._modelDisposables.add(
        this._model.onWillDispose(() => {
          this.clearModelListeners();
          this.removeHighlightRange();
          this._model = null;
        })
      );
    }
  }
  clearModelListeners() {
    this._modelDisposables.clear();
  }
  dispose() {
    if (this._model) {
      this.removeHighlightRange();
      this._model = null;
    }
    this._modelDisposables.dispose();
  }
  static _RANGE_HIGHLIGHT_DECORATION = ModelDecorationOptions.register({
    description: "search-range-highlight",
    stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
    className: "rangeHighlight",
    isWholeLine: true
  });
};
RangeHighlightDecorations = __decorateClass([
  __decorateParam(0, IModelService)
], RangeHighlightDecorations);
function textSearchResultToMatches(rawMatch, fileMatch, isAiContributed) {
  const previewLines = rawMatch.previewText.split("\n");
  return rawMatch.rangeLocations.map((rangeLocation) => {
    const previewRange = rangeLocation.preview;
    return new Match(
      fileMatch,
      previewLines,
      previewRange,
      rangeLocation.source,
      isAiContributed
    );
  });
}
__name(textSearchResultToMatches, "textSearchResultToMatches");
function textSearchMatchesToNotebookMatches(textSearchMatches, cell) {
  const notebookMatches = [];
  textSearchMatches.forEach((textSearchMatch) => {
    const previewLines = textSearchMatch.previewText.split("\n");
    textSearchMatch.rangeLocations.map((rangeLocation) => {
      const previewRange = rangeLocation.preview;
      const match = new MatchInNotebook(
        cell,
        previewLines,
        previewRange,
        rangeLocation.source,
        textSearchMatch.webviewIndex
      );
      notebookMatches.push(match);
    });
  });
  return notebookMatches;
}
__name(textSearchMatchesToNotebookMatches, "textSearchMatchesToNotebookMatches");
function arrayContainsElementOrParent(element, testArray) {
  do {
    if (testArray.includes(element)) {
      return true;
    }
  } while (!(element.parent() instanceof SearchResult) && (element = element.parent()));
  return false;
}
__name(arrayContainsElementOrParent, "arrayContainsElementOrParent");
function getFileMatches(matches) {
  const folderMatches = [];
  const fileMatches = [];
  matches.forEach((e) => {
    if (e instanceof FileMatch) {
      fileMatches.push(e);
    } else {
      folderMatches.push(e);
    }
  });
  return fileMatches.concat(
    folderMatches.flatMap((e) => e.allDownstreamFileMatches())
  );
}
__name(getFileMatches, "getFileMatches");
function mergeSearchResultEvents(events) {
  const retEvent = {
    elements: [],
    added: false,
    removed: false
  };
  events.forEach((e) => {
    if (e.added) {
      retEvent.added = true;
    }
    if (e.removed) {
      retEvent.removed = true;
    }
    retEvent.elements = retEvent.elements.concat(e.elements);
  });
  return retEvent;
}
__name(mergeSearchResultEvents, "mergeSearchResultEvents");
export {
  CellMatch,
  FileMatch,
  FolderMatch,
  FolderMatchNoRoot,
  FolderMatchWithResource,
  FolderMatchWorkspaceRoot,
  ISearchViewModelWorkbenchService,
  Match,
  MatchInNotebook,
  RangeHighlightDecorations,
  SearchModel,
  SearchModelLocation,
  SearchResult,
  SearchViewModelWorkbenchService,
  arrayContainsElementOrParent,
  compareNotebookPos,
  searchComparer,
  searchMatchComparer,
  textSearchMatchesToNotebookMatches
};
//# sourceMappingURL=searchModel.js.map
