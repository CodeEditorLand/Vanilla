var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ThrottledDelayer } from "../../../../../base/common/async.js";
import { Emitter } from "../../../../../base/common/event.js";
import { StringSHA1, hash } from "../../../../../base/common/hash.js";
import { toFormattedString } from "../../../../../base/common/jsonFormatter.js";
import {
  Disposable,
  DisposableStore,
  dispose
} from "../../../../../base/common/lifecycle.js";
import * as UUID from "../../../../../base/common/uuid.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../../editor/common/languages/modesRegistry.js";
import * as model from "../../../../../editor/common/model.js";
import { PieceTreeTextBuffer } from "../../../../../editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer.js";
import {
  createTextBuffer
} from "../../../../../editor/common/model/textModel.js";
import { NotebookCellOutputTextModel } from "./notebookCellOutputTextModel.js";
class NotebookCellTextModel extends Disposable {
  constructor(uri, handle, _source, _language, _mime, cellKind, outputs, metadata, internalMetadata, collapseState, transientOptions, _languageService, _languageDetectionService = void 0) {
    super();
    this.uri = uri;
    this.handle = handle;
    this._source = _source;
    this._language = _language;
    this._mime = _mime;
    this.cellKind = cellKind;
    this.collapseState = collapseState;
    this.transientOptions = transientOptions;
    this._languageService = _languageService;
    this._languageDetectionService = _languageDetectionService;
    this._outputs = outputs.map(
      (op) => new NotebookCellOutputTextModel(op)
    );
    this._metadata = metadata ?? {};
    this._internalMetadata = internalMetadata ?? {};
  }
  static {
    __name(this, "NotebookCellTextModel");
  }
  _onDidChangeOutputs = this._register(
    new Emitter()
  );
  onDidChangeOutputs = this._onDidChangeOutputs.event;
  _onDidChangeOutputItems = this._register(
    new Emitter()
  );
  onDidChangeOutputItems = this._onDidChangeOutputItems.event;
  _onDidChangeContent = this._register(
    new Emitter()
  );
  onDidChangeContent = this._onDidChangeContent.event;
  _onDidChangeMetadata = this._register(new Emitter());
  onDidChangeMetadata = this._onDidChangeMetadata.event;
  _onDidChangeInternalMetadata = this._register(
    new Emitter()
  );
  onDidChangeInternalMetadata = this._onDidChangeInternalMetadata.event;
  _onDidChangeLanguage = this._register(
    new Emitter()
  );
  onDidChangeLanguage = this._onDidChangeLanguage.event;
  _outputs;
  get outputs() {
    return this._outputs;
  }
  _metadata;
  get metadata() {
    return this._metadata;
  }
  set metadata(newMetadata) {
    this._metadata = newMetadata;
    this._hash = null;
    this._onDidChangeMetadata.fire();
  }
  _internalMetadata;
  get internalMetadata() {
    return this._internalMetadata;
  }
  set internalMetadata(newInternalMetadata) {
    const lastRunSuccessChanged = this._internalMetadata.lastRunSuccess !== newInternalMetadata.lastRunSuccess;
    newInternalMetadata = {
      ...newInternalMetadata,
      ...{
        runStartTimeAdjustment: computeRunStartTimeAdjustment(
          this._internalMetadata,
          newInternalMetadata
        )
      }
    };
    this._internalMetadata = newInternalMetadata;
    this._hash = null;
    this._onDidChangeInternalMetadata.fire({ lastRunSuccessChanged });
  }
  get language() {
    return this._language;
  }
  set language(newLanguage) {
    if (this._textModel && // 1. the language update is from workspace edit, checking if it's the same as text model's mode
    this._textModel.getLanguageId() === this._languageService.getLanguageIdByLanguageName(
      newLanguage
    ) && // 2. the text model's mode might be the same as the `this.language`, even if the language friendly name is not the same, we should not trigger an update
    this._textModel.getLanguageId() === this._languageService.getLanguageIdByLanguageName(this.language)) {
      return;
    }
    this._hasLanguageSetExplicitly = true;
    this._setLanguageInternal(newLanguage);
  }
  get mime() {
    return this._mime;
  }
  set mime(newMime) {
    if (this._mime === newMime) {
      return;
    }
    this._mime = newMime;
    this._hash = null;
    this._onDidChangeContent.fire("mime");
  }
  _textBuffer;
  get textBuffer() {
    if (this._textBuffer) {
      return this._textBuffer;
    }
    this._textBuffer = this._register(
      createTextBuffer(this._source, model.DefaultEndOfLine.LF).textBuffer
    );
    this._register(
      this._textBuffer.onDidChangeContent(() => {
        this._hash = null;
        if (!this._textModel) {
          this._onDidChangeContent.fire("content");
        }
        this.autoDetectLanguage();
      })
    );
    return this._textBuffer;
  }
  _textBufferHash = null;
  _hash = null;
  _versionId = 1;
  _alternativeId = 1;
  get alternativeId() {
    return this._alternativeId;
  }
  _textModelDisposables = this._register(
    new DisposableStore()
  );
  _textModel = void 0;
  get textModel() {
    return this._textModel;
  }
  set textModel(m) {
    if (this._textModel === m) {
      return;
    }
    this._textModelDisposables.clear();
    this._textModel = m;
    if (this._textModel) {
      this.setRegisteredLanguage(
        this._languageService,
        this._textModel.getLanguageId(),
        this.language
      );
      this._textModelDisposables.add(
        this._textModel.onDidChangeLanguage(
          (e) => this.setRegisteredLanguage(
            this._languageService,
            e.newLanguage,
            this.language
          )
        )
      );
      this._textModelDisposables.add(
        this._textModel.onWillDispose(
          () => this.textModel = void 0
        )
      );
      this._textModelDisposables.add(
        this._textModel.onDidChangeContent(() => {
          if (this._textModel) {
            this._versionId = this._textModel.getVersionId();
            this._alternativeId = this._textModel.getAlternativeVersionId();
          }
          this._textBufferHash = null;
          this._onDidChangeContent.fire("content");
        })
      );
      this._textModel._overwriteVersionId(this._versionId);
      this._textModel._overwriteAlternativeVersionId(this._versionId);
    }
  }
  setRegisteredLanguage(languageService, newLanguage, currentLanguage) {
    const isFallBackLanguage = newLanguage === PLAINTEXT_LANGUAGE_ID || newLanguage === "jupyter";
    if (!languageService.isRegisteredLanguageId(currentLanguage) && isFallBackLanguage) {
      this._onDidChangeLanguage.fire(currentLanguage);
    } else {
      this.language = newLanguage;
    }
  }
  static AUTO_DETECT_LANGUAGE_THROTTLE_DELAY = 600;
  autoDetectLanguageThrottler = this._register(
    new ThrottledDelayer(
      NotebookCellTextModel.AUTO_DETECT_LANGUAGE_THROTTLE_DELAY
    )
  );
  _autoLanguageDetectionEnabled = false;
  _hasLanguageSetExplicitly = false;
  get hasLanguageSetExplicitly() {
    return this._hasLanguageSetExplicitly;
  }
  enableAutoLanguageDetection() {
    this._autoLanguageDetectionEnabled = true;
    this.autoDetectLanguage();
  }
  async autoDetectLanguage() {
    if (this._autoLanguageDetectionEnabled) {
      this.autoDetectLanguageThrottler.trigger(
        () => this._doAutoDetectLanguage()
      );
    }
  }
  async _doAutoDetectLanguage() {
    if (this.hasLanguageSetExplicitly) {
      return;
    }
    const newLanguage = await this._languageDetectionService?.detectLanguage(this.uri);
    if (!newLanguage) {
      return;
    }
    if (this._textModel && this._textModel.getLanguageId() === this._languageService.getLanguageIdByLanguageName(
      newLanguage
    ) && this._textModel.getLanguageId() === this._languageService.getLanguageIdByLanguageName(this.language)) {
      return;
    }
    this._setLanguageInternal(newLanguage);
  }
  _setLanguageInternal(newLanguage) {
    const newLanguageId = this._languageService.getLanguageIdByLanguageName(newLanguage);
    if (newLanguageId === null) {
      return;
    }
    if (this._textModel) {
      const languageId = this._languageService.createById(newLanguageId);
      this._textModel.setLanguage(languageId.languageId);
    }
    if (this._language === newLanguage) {
      return;
    }
    this._language = newLanguage;
    this._hash = null;
    this._onDidChangeLanguage.fire(newLanguage);
    this._onDidChangeContent.fire("language");
  }
  resetTextBuffer(textBuffer) {
    this._textBuffer = textBuffer;
  }
  getValue() {
    const fullRange = this.getFullModelRange();
    const eol = this.textBuffer.getEOL();
    if (eol === "\n") {
      return this.textBuffer.getValueInRange(
        fullRange,
        model.EndOfLinePreference.LF
      );
    } else {
      return this.textBuffer.getValueInRange(
        fullRange,
        model.EndOfLinePreference.CRLF
      );
    }
  }
  getTextBufferHash() {
    if (this._textBufferHash !== null) {
      return this._textBufferHash;
    }
    const shaComputer = new StringSHA1();
    const snapshot = this.textBuffer.createSnapshot(false);
    let text;
    while (text = snapshot.read()) {
      shaComputer.update(text);
    }
    this._textBufferHash = shaComputer.digest();
    return this._textBufferHash;
  }
  getHashValue() {
    if (this._hash !== null) {
      return this._hash;
    }
    this._hash = hash([
      hash(this.language),
      this.getTextBufferHash(),
      this._getPersisentMetadata(),
      this.transientOptions.transientOutputs ? [] : this._outputs.map((op) => ({
        outputs: op.outputs.map((output) => ({
          mime: output.mime,
          data: Array.from(output.data.buffer)
        })),
        metadata: op.metadata
      }))
    ]);
    return this._hash;
  }
  _getPersisentMetadata() {
    return getFormattedMetadataJSON(
      this.transientOptions.transientCellMetadata,
      this.metadata,
      this.language
    );
  }
  getTextLength() {
    return this.textBuffer.getLength();
  }
  getFullModelRange() {
    const lineCount = this.textBuffer.getLineCount();
    return new Range(
      1,
      1,
      lineCount,
      this.textBuffer.getLineLength(lineCount) + 1
    );
  }
  spliceNotebookCellOutputs(splice) {
    if (splice.deleteCount > 0 && splice.newOutputs.length > 0) {
      const commonLen = Math.min(
        splice.deleteCount,
        splice.newOutputs.length
      );
      for (let i = 0; i < commonLen; i++) {
        const currentOutput = this.outputs[splice.start + i];
        const newOutput = splice.newOutputs[i];
        this.replaceOutput(currentOutput.outputId, newOutput);
      }
      const removed = this.outputs.splice(
        splice.start + commonLen,
        splice.deleteCount - commonLen,
        ...splice.newOutputs.slice(commonLen)
      );
      removed.forEach((output) => output.dispose());
      this._onDidChangeOutputs.fire({
        start: splice.start + commonLen,
        deleteCount: splice.deleteCount - commonLen,
        newOutputs: splice.newOutputs.slice(commonLen)
      });
    } else {
      const removed = this.outputs.splice(
        splice.start,
        splice.deleteCount,
        ...splice.newOutputs
      );
      removed.forEach((output) => output.dispose());
      this._onDidChangeOutputs.fire(splice);
    }
  }
  replaceOutput(outputId, newOutputItem) {
    const outputIndex = this.outputs.findIndex(
      (output2) => output2.outputId === outputId
    );
    if (outputIndex < 0) {
      return false;
    }
    const output = this.outputs[outputIndex];
    output.replaceData({
      outputs: newOutputItem.outputs,
      outputId: newOutputItem.outputId,
      metadata: newOutputItem.metadata
    });
    newOutputItem.dispose();
    this._onDidChangeOutputItems.fire();
    return true;
  }
  changeOutputItems(outputId, append, items) {
    const outputIndex = this.outputs.findIndex(
      (output2) => output2.outputId === outputId
    );
    if (outputIndex < 0) {
      return false;
    }
    const output = this.outputs[outputIndex];
    if (append) {
      output.appendData(items);
    } else {
      output.replaceData({
        outputId,
        outputs: items,
        metadata: output.metadata
      });
    }
    this._onDidChangeOutputItems.fire();
    return true;
  }
  _outputNotEqualFastCheck(left, right) {
    if (left.length !== right.length) {
      return false;
    }
    for (let i = 0; i < this.outputs.length; i++) {
      const l = left[i];
      const r = right[i];
      if (l.outputs.length !== r.outputs.length) {
        return false;
      }
      for (let k = 0; k < l.outputs.length; k++) {
        if (l.outputs[k].mime !== r.outputs[k].mime) {
          return false;
        }
        if (l.outputs[k].data.byteLength !== r.outputs[k].data.byteLength) {
          return false;
        }
      }
    }
    return true;
  }
  equal(b) {
    if (this.language !== b.language) {
      return false;
    }
    if (this.outputs.length !== b.outputs.length) {
      return false;
    }
    if (this.getTextLength() !== b.getTextLength()) {
      return false;
    }
    if (!this.transientOptions.transientOutputs) {
      if (!this._outputNotEqualFastCheck(this.outputs, b.outputs)) {
        return false;
      }
    }
    return this.getHashValue() === b.getHashValue();
  }
  /**
   * Only compares
   * - language
   * - mime
   * - cellKind
   * - internal metadata
   * - source
   */
  fastEqual(b) {
    if (this.language !== b.language) {
      return false;
    }
    if (this.mime !== b.mime) {
      return false;
    }
    if (this.cellKind !== b.cellKind) {
      return false;
    }
    if (this.internalMetadata?.executionOrder !== b.internalMetadata?.executionOrder || this.internalMetadata?.lastRunSuccess !== b.internalMetadata?.lastRunSuccess || this.internalMetadata?.runStartTime !== b.internalMetadata?.runStartTime || this.internalMetadata?.runStartTimeAdjustment !== b.internalMetadata?.runStartTimeAdjustment || this.internalMetadata?.runEndTime !== b.internalMetadata?.runEndTime) {
      return false;
    }
    if (this._textBuffer && this.getValue() !== b.source) {
      return false;
    } else if (this._source !== b.source) {
      return false;
    }
    return true;
  }
  dispose() {
    dispose(this._outputs);
    const emptyDisposedTextBuffer = new PieceTreeTextBuffer(
      [],
      "",
      "\n",
      false,
      false,
      true,
      true
    );
    emptyDisposedTextBuffer.dispose();
    this._textBuffer = emptyDisposedTextBuffer;
    super.dispose();
  }
}
function cloneNotebookCellTextModel(cell) {
  return {
    source: cell.getValue(),
    language: cell.language,
    mime: cell.mime,
    cellKind: cell.cellKind,
    outputs: cell.outputs.map((output) => ({
      outputs: output.outputs,
      /* paste should generate new outputId */
      outputId: UUID.generateUuid()
    })),
    metadata: {}
  };
}
__name(cloneNotebookCellTextModel, "cloneNotebookCellTextModel");
function computeRunStartTimeAdjustment(oldMetadata, newMetadata) {
  if (oldMetadata.runStartTime !== newMetadata.runStartTime && typeof newMetadata.runStartTime === "number") {
    const offset = Date.now() - newMetadata.runStartTime;
    return offset < 0 ? Math.abs(offset) : 0;
  } else {
    return newMetadata.runStartTimeAdjustment;
  }
}
__name(computeRunStartTimeAdjustment, "computeRunStartTimeAdjustment");
function getFormattedMetadataJSON(transientCellMetadata, metadata, language) {
  let filteredMetadata = {};
  if (transientCellMetadata) {
    const keys = /* @__PURE__ */ new Set([...Object.keys(metadata)]);
    for (const key of keys) {
      if (!transientCellMetadata[key]) {
        filteredMetadata[key] = metadata[key];
      }
    }
  } else {
    filteredMetadata = metadata;
  }
  const obj = {
    language,
    ...filteredMetadata
  };
  if (language) {
    obj.language = language;
  }
  const metadataSource = toFormattedString(obj, {});
  return metadataSource;
}
__name(getFormattedMetadataJSON, "getFormattedMetadataJSON");
export {
  NotebookCellTextModel,
  cloneNotebookCellTextModel,
  getFormattedMetadataJSON
};
//# sourceMappingURL=notebookCellTextModel.js.map
