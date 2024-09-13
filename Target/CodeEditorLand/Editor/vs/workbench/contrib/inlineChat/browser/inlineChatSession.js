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
import { coalesceInPlace } from "../../../../base/common/arrays.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import {
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import {
  EditOperation
} from "../../../../editor/common/core/editOperation.js";
import { Range } from "../../../../editor/common/core/range.js";
import {
  DetailedLineRangeMapping
} from "../../../../editor/common/diff/rangeMapping.js";
import {
  TrackedRangeStickiness
} from "../../../../editor/common/model.js";
import { ModelDecorationOptions } from "../../../../editor/common/model/textModel.js";
import { IEditorWorkerService } from "../../../../editor/common/services/editorWorker.js";
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import {
  CTX_INLINE_CHAT_HAS_STASHED_SESSION
} from "../common/inlineChat.js";
import { IInlineChatSessionService } from "./inlineChatSessionService.js";
class SessionWholeRange {
  constructor(_textModel, wholeRange) {
    this._textModel = _textModel;
    this._decorationIds = _textModel.deltaDecorations(
      [],
      [{ range: wholeRange, options: SessionWholeRange._options }]
    );
  }
  static {
    __name(this, "SessionWholeRange");
  }
  static _options = ModelDecorationOptions.register({
    description: "inlineChat/session/wholeRange"
  });
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  _decorationIds = [];
  dispose() {
    this._onDidChange.dispose();
    if (!this._textModel.isDisposed()) {
      this._textModel.deltaDecorations(this._decorationIds, []);
    }
  }
  fixup(changes) {
    const newDeco = [];
    for (const { modified } of changes) {
      const modifiedRange = modified.isEmpty ? new Range(
        modified.startLineNumber,
        1,
        modified.startLineNumber,
        this._textModel.getLineLength(modified.startLineNumber)
      ) : new Range(
        modified.startLineNumber,
        1,
        modified.endLineNumberExclusive - 1,
        this._textModel.getLineLength(
          modified.endLineNumberExclusive - 1
        )
      );
      newDeco.push({
        range: modifiedRange,
        options: SessionWholeRange._options
      });
    }
    const [first, ...rest] = this._decorationIds;
    const newIds = this._textModel.deltaDecorations(rest, newDeco);
    this._decorationIds = [first].concat(newIds);
    this._onDidChange.fire(this);
  }
  get trackedInitialRange() {
    const [first] = this._decorationIds;
    return this._textModel.getDecorationRange(first) ?? new Range(1, 1, 1, 1);
  }
  get value() {
    let result;
    for (const id of this._decorationIds) {
      const range = this._textModel.getDecorationRange(id);
      if (range) {
        if (result) {
          result = Range.plusRange(result, range);
        } else {
          result = range;
        }
      }
    }
    return result;
  }
}
class Session {
  constructor(editMode, headless, targetUri, textModel0, textModelN, agent, wholeRange, hunkData, chatModel, versionsByRequest) {
    this.editMode = editMode;
    this.headless = headless;
    this.targetUri = targetUri;
    this.textModel0 = textModel0;
    this.textModelN = textModelN;
    this.agent = agent;
    this.wholeRange = wholeRange;
    this.hunkData = hunkData;
    this.chatModel = chatModel;
    this._teldata = {
      extension: ExtensionIdentifier.toKey(agent.extensionId),
      startTime: this._startTime.toISOString(),
      endTime: this._startTime.toISOString(),
      edits: 0,
      finishedByEdit: false,
      rounds: "",
      undos: "",
      editMode,
      unstashed: 0,
      acceptedHunks: 0,
      discardedHunks: 0,
      responseTypes: ""
    };
    if (versionsByRequest) {
      this._versionByRequest = new Map(versionsByRequest);
    }
  }
  static {
    __name(this, "Session");
  }
  _isUnstashed = false;
  _startTime = /* @__PURE__ */ new Date();
  _teldata;
  _versionByRequest = /* @__PURE__ */ new Map();
  get isUnstashed() {
    return this._isUnstashed;
  }
  markUnstashed() {
    this._teldata.unstashed += 1;
    this._isUnstashed = true;
  }
  markModelVersion(request) {
    this._versionByRequest.set(
      request.id,
      this.textModelN.getAlternativeVersionId()
    );
  }
  get versionsByRequest() {
    return Array.from(this._versionByRequest);
  }
  async undoChangesUntil(requestId) {
    const targetAltVersion = this._versionByRequest.get(requestId);
    if (targetAltVersion === void 0) {
      return false;
    }
    this.hunkData.ignoreTextModelNChanges = true;
    try {
      while (targetAltVersion < this.textModelN.getAlternativeVersionId() && this.textModelN.canUndo()) {
        await this.textModelN.undo();
      }
    } finally {
      this.hunkData.ignoreTextModelNChanges = false;
    }
    return true;
  }
  get hasChangedText() {
    return !this.textModel0.equalsTextBuffer(
      this.textModelN.getTextBuffer()
    );
  }
  asChangedText(changes) {
    if (changes.length === 0) {
      return void 0;
    }
    let startLine = Number.MAX_VALUE;
    let endLine = Number.MIN_VALUE;
    for (const change of changes) {
      startLine = Math.min(startLine, change.modified.startLineNumber);
      endLine = Math.max(endLine, change.modified.endLineNumberExclusive);
    }
    return this.textModelN.getValueInRange(
      new Range(startLine, 1, endLine, Number.MAX_VALUE)
    );
  }
  recordExternalEditOccurred(didFinish) {
    this._teldata.edits += 1;
    this._teldata.finishedByEdit = didFinish;
  }
  asTelemetryData() {
    for (const item of this.hunkData.getInfo()) {
      switch (item.getState()) {
        case 1 /* Accepted */:
          this._teldata.acceptedHunks += 1;
          break;
        case 2 /* Rejected */:
          this._teldata.discardedHunks += 1;
          break;
      }
    }
    this._teldata.endTime = (/* @__PURE__ */ new Date()).toISOString();
    return this._teldata;
  }
}
let StashedSession = class {
  constructor(editor, session, _undoCancelEdits, contextKeyService, _sessionService, _logService) {
    this._undoCancelEdits = _undoCancelEdits;
    this._sessionService = _sessionService;
    this._logService = _logService;
    this._ctxHasStashedSession = CTX_INLINE_CHAT_HAS_STASHED_SESSION.bindTo(contextKeyService);
    this._session = session;
    this._ctxHasStashedSession.set(true);
    this._listener = Event.once(Event.any(editor.onDidChangeCursorSelection, editor.onDidChangeModelContent, editor.onDidChangeModel, editor.onDidBlurEditorWidget))(() => {
      this._session = void 0;
      this._sessionService.releaseSession(session);
      this._ctxHasStashedSession.reset();
    });
  }
  static {
    __name(this, "StashedSession");
  }
  _listener;
  _ctxHasStashedSession;
  _session;
  dispose() {
    this._listener.dispose();
    this._ctxHasStashedSession.reset();
    if (this._session) {
      this._sessionService.releaseSession(this._session);
    }
  }
  unstash() {
    if (!this._session) {
      return void 0;
    }
    this._listener.dispose();
    const result = this._session;
    result.markUnstashed();
    result.hunkData.ignoreTextModelNChanges = true;
    result.textModelN.pushEditOperations(
      null,
      this._undoCancelEdits,
      () => null
    );
    result.hunkData.ignoreTextModelNChanges = false;
    this._session = void 0;
    this._logService.debug("[IE] Unstashed session");
    return result;
  }
};
StashedSession = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IInlineChatSessionService),
  __decorateParam(5, ILogService)
], StashedSession);
function lineRangeAsRange(lineRange, model) {
  return lineRange.isEmpty ? new Range(
    lineRange.startLineNumber,
    1,
    lineRange.startLineNumber,
    model.getLineLength(lineRange.startLineNumber)
  ) : new Range(
    lineRange.startLineNumber,
    1,
    lineRange.endLineNumberExclusive - 1,
    model.getLineLength(lineRange.endLineNumberExclusive - 1)
  );
}
__name(lineRangeAsRange, "lineRangeAsRange");
let HunkData = class {
  constructor(_editorWorkerService, _textModel0, _textModelN) {
    this._editorWorkerService = _editorWorkerService;
    this._textModel0 = _textModel0;
    this._textModelN = _textModelN;
    this._store.add(_textModelN.onDidChangeContent((e) => {
      if (!this._ignoreChanges) {
        this._mirrorChanges(e);
      }
    }));
  }
  static {
    __name(this, "HunkData");
  }
  static _HUNK_TRACKED_RANGE = ModelDecorationOptions.register({
    description: "inline-chat-hunk-tracked-range",
    stickiness: TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges
  });
  static _HUNK_THRESHOLD = 8;
  _store = new DisposableStore();
  _data = /* @__PURE__ */ new Map();
  _ignoreChanges = false;
  dispose() {
    if (!this._textModelN.isDisposed()) {
      this._textModelN.changeDecorations((accessor) => {
        for (const { textModelNDecorations } of this._data.values()) {
          textModelNDecorations.forEach(
            accessor.removeDecoration,
            accessor
          );
        }
      });
    }
    if (!this._textModel0.isDisposed()) {
      this._textModel0.changeDecorations((accessor) => {
        for (const { textModel0Decorations } of this._data.values()) {
          textModel0Decorations.forEach(
            accessor.removeDecoration,
            accessor
          );
        }
      });
    }
    this._data.clear();
    this._store.dispose();
  }
  set ignoreTextModelNChanges(value) {
    this._ignoreChanges = value;
  }
  get ignoreTextModelNChanges() {
    return this._ignoreChanges;
  }
  _mirrorChanges(event) {
    const hunkRanges = [];
    const ranges0 = [];
    for (const entry of this._data.values()) {
      if (entry.state === 0 /* Pending */) {
        for (let i = 1; i < entry.textModelNDecorations.length; i++) {
          const rangeN = this._textModelN.getDecorationRange(
            entry.textModelNDecorations[i]
          );
          const range0 = this._textModel0.getDecorationRange(
            entry.textModel0Decorations[i]
          );
          if (rangeN && range0) {
            hunkRanges.push({
              rangeN,
              range0,
              markAccepted: /* @__PURE__ */ __name(() => entry.state = 1 /* Accepted */, "markAccepted")
            });
          }
        }
      } else if (entry.state === 1 /* Accepted */) {
        for (let i = 1; i < entry.textModel0Decorations.length; i++) {
          const range = this._textModel0.getDecorationRange(
            entry.textModel0Decorations[i]
          );
          if (range) {
            ranges0.push(range);
          }
        }
      }
    }
    hunkRanges.sort(
      (a, b) => Range.compareRangesUsingStarts(a.rangeN, b.rangeN)
    );
    ranges0.sort(Range.compareRangesUsingStarts);
    const edits = [];
    for (const change of event.changes) {
      let isOverlapping = false;
      let pendingChangesLen = 0;
      for (const entry of hunkRanges) {
        if (entry.rangeN.getEndPosition().isBefore(Range.getStartPosition(change.range))) {
          pendingChangesLen += this._textModelN.getValueLengthInRange(
            entry.rangeN
          );
          pendingChangesLen -= this._textModel0.getValueLengthInRange(
            entry.range0
          );
        } else if (Range.areIntersectingOrTouching(entry.rangeN, change.range)) {
          entry.markAccepted();
          isOverlapping = true;
          break;
        } else {
          break;
        }
      }
      if (isOverlapping) {
        continue;
      }
      const offset0 = change.rangeOffset - pendingChangesLen;
      const start0 = this._textModel0.getPositionAt(offset0);
      let acceptedChangesLen = 0;
      for (const range of ranges0) {
        if (range.getEndPosition().isBefore(start0)) {
          acceptedChangesLen += this._textModel0.getValueLengthInRange(range);
        }
      }
      const start = this._textModel0.getPositionAt(
        offset0 + acceptedChangesLen
      );
      const end = this._textModel0.getPositionAt(
        offset0 + acceptedChangesLen + change.rangeLength
      );
      edits.push(
        EditOperation.replace(
          Range.fromPositions(start, end),
          change.text
        )
      );
    }
    this._textModel0.pushEditOperations(null, edits, () => null);
  }
  async recompute(editState, diff) {
    diff ??= await this._editorWorkerService.computeDiff(
      this._textModel0.uri,
      this._textModelN.uri,
      {
        ignoreTrimWhitespace: false,
        maxComputationTimeMs: Number.MAX_SAFE_INTEGER,
        computeMoves: false
      },
      "advanced"
    );
    let mergedChanges = [];
    if (diff && diff.changes.length > 0) {
      mergedChanges = [diff.changes[0]];
      for (let i = 1; i < diff.changes.length; i++) {
        const lastChange = mergedChanges[mergedChanges.length - 1];
        const thisChange = diff.changes[i];
        if (thisChange.modified.startLineNumber - lastChange.modified.endLineNumberExclusive <= HunkData._HUNK_THRESHOLD) {
          mergedChanges[mergedChanges.length - 1] = new DetailedLineRangeMapping(
            lastChange.original.join(thisChange.original),
            lastChange.modified.join(thisChange.modified),
            (lastChange.innerChanges ?? []).concat(
              thisChange.innerChanges ?? []
            )
          );
        } else {
          mergedChanges.push(thisChange);
        }
      }
    }
    const hunks = mergedChanges.map(
      (change) => new RawHunk(
        change.original,
        change.modified,
        change.innerChanges ?? []
      )
    );
    editState.applied = hunks.length;
    this._textModelN.changeDecorations((accessorN) => {
      this._textModel0.changeDecorations((accessor0) => {
        for (const {
          textModelNDecorations,
          textModel0Decorations
        } of this._data.values()) {
          textModelNDecorations.forEach(
            accessorN.removeDecoration,
            accessorN
          );
          textModel0Decorations.forEach(
            accessor0.removeDecoration,
            accessor0
          );
        }
        this._data.clear();
        for (const hunk of hunks) {
          const textModelNDecorations = [];
          const textModel0Decorations = [];
          textModelNDecorations.push(
            accessorN.addDecoration(
              lineRangeAsRange(hunk.modified, this._textModelN),
              HunkData._HUNK_TRACKED_RANGE
            )
          );
          textModel0Decorations.push(
            accessor0.addDecoration(
              lineRangeAsRange(hunk.original, this._textModel0),
              HunkData._HUNK_TRACKED_RANGE
            )
          );
          for (const change of hunk.changes) {
            textModelNDecorations.push(
              accessorN.addDecoration(
                change.modifiedRange,
                HunkData._HUNK_TRACKED_RANGE
              )
            );
            textModel0Decorations.push(
              accessor0.addDecoration(
                change.originalRange,
                HunkData._HUNK_TRACKED_RANGE
              )
            );
          }
          this._data.set(hunk, {
            editState,
            textModelNDecorations,
            textModel0Decorations,
            state: 0 /* Pending */
          });
        }
      });
    });
  }
  get size() {
    return this._data.size;
  }
  get pending() {
    return Iterable.reduce(
      this._data.values(),
      (r, { state }) => r + (state === 0 /* Pending */ ? 1 : 0),
      0
    );
  }
  _discardEdits(item) {
    const edits = [];
    const rangesN = item.getRangesN();
    const ranges0 = item.getRanges0();
    for (let i = 1; i < rangesN.length; i++) {
      const modifiedRange = rangesN[i];
      const originalValue = this._textModel0.getValueInRange(ranges0[i]);
      edits.push(EditOperation.replace(modifiedRange, originalValue));
    }
    return edits;
  }
  discardAll() {
    const edits = [];
    for (const item of this.getInfo()) {
      if (item.getState() === 0 /* Pending */) {
        edits.push(this._discardEdits(item));
      }
    }
    const undoEdits = [];
    this._textModelN.pushEditOperations(
      null,
      edits.flat(),
      (_undoEdits) => {
        undoEdits.push(_undoEdits);
        return null;
      }
    );
    return undoEdits.flat();
  }
  getInfo() {
    const result = [];
    for (const [hunk, data] of this._data.entries()) {
      const item = {
        getState: /* @__PURE__ */ __name(() => {
          return data.state;
        }, "getState"),
        isInsertion: /* @__PURE__ */ __name(() => {
          return hunk.original.isEmpty;
        }, "isInsertion"),
        getRangesN: /* @__PURE__ */ __name(() => {
          const ranges = data.textModelNDecorations.map(
            (id) => this._textModelN.getDecorationRange(id)
          );
          coalesceInPlace(ranges);
          return ranges;
        }, "getRangesN"),
        getRanges0: /* @__PURE__ */ __name(() => {
          const ranges = data.textModel0Decorations.map(
            (id) => this._textModel0.getDecorationRange(id)
          );
          coalesceInPlace(ranges);
          return ranges;
        }, "getRanges0"),
        discardChanges: /* @__PURE__ */ __name(() => {
          if (data.state === 0 /* Pending */) {
            const edits = this._discardEdits(item);
            this._textModelN.pushEditOperations(
              null,
              edits,
              () => null
            );
            data.state = 2 /* Rejected */;
            if (data.editState.applied > 0) {
              data.editState.applied -= 1;
            }
          }
        }, "discardChanges"),
        acceptChanges: /* @__PURE__ */ __name(() => {
          if (data.state === 0 /* Pending */) {
            const edits = [];
            const rangesN = item.getRangesN();
            const ranges0 = item.getRanges0();
            for (let i = 1; i < ranges0.length; i++) {
              const originalRange = ranges0[i];
              const modifiedValue = this._textModelN.getValueInRange(rangesN[i]);
              edits.push(
                EditOperation.replace(
                  originalRange,
                  modifiedValue
                )
              );
            }
            this._textModel0.pushEditOperations(
              null,
              edits,
              () => null
            );
            data.state = 1 /* Accepted */;
          }
        }, "acceptChanges")
      };
      result.push(item);
    }
    return result;
  }
};
HunkData = __decorateClass([
  __decorateParam(0, IEditorWorkerService)
], HunkData);
class RawHunk {
  constructor(original, modified, changes) {
    this.original = original;
    this.modified = modified;
    this.changes = changes;
  }
  static {
    __name(this, "RawHunk");
  }
}
var HunkState = /* @__PURE__ */ ((HunkState2) => {
  HunkState2[HunkState2["Pending"] = 0] = "Pending";
  HunkState2[HunkState2["Accepted"] = 1] = "Accepted";
  HunkState2[HunkState2["Rejected"] = 2] = "Rejected";
  return HunkState2;
})(HunkState || {});
export {
  HunkData,
  HunkState,
  Session,
  SessionWholeRange,
  StashedSession
};
//# sourceMappingURL=inlineChatSession.js.map
