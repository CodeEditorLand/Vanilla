import {
  LcsDiff
} from "../../../../../base/common/diff/diff.js";
import { doHash, hash, numberHash } from "../../../../../base/common/hash.js";
import { URI } from "../../../../../base/common/uri.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { DefaultEndOfLine } from "../../../../../editor/common/model.js";
import { PieceTreeTextBufferBuilder } from "../../../../../editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder.js";
import { SearchParams } from "../../../../../editor/common/model/textModelSearch.js";
import { MirrorModel } from "../../../../../editor/common/services/textModelSync/textModelSync.impl.js";
import {
  CellKind,
  NotebookCellsChangeType
} from "../notebookCommon.js";
function bufferHash(buffer) {
  let initialHashVal = numberHash(104579, 0);
  for (let k = 0; k < buffer.buffer.length; k++) {
    initialHashVal = doHash(buffer.buffer[k], initialHashVal);
  }
  return initialHashVal;
}
class MirrorCell {
  constructor(handle, uri, source, _eol, versionId, language, cellKind, outputs, metadata, internalMetadata) {
    this.handle = handle;
    this._eol = _eol;
    this.language = language;
    this.cellKind = cellKind;
    this.outputs = outputs;
    this.metadata = metadata;
    this.internalMetadata = internalMetadata;
    this.textModel = new MirrorModel(uri, source, _eol, versionId);
  }
  textModel;
  _hash = null;
  get eol() {
    return this._eol === "\r\n" ? DefaultEndOfLine.CRLF : DefaultEndOfLine.LF;
  }
  onEvents(e) {
    this.textModel.onEvents(e);
    this._hash = null;
  }
  getValue() {
    return this.textModel.getValue();
  }
  getComparisonValue() {
    this._hash = hash([
      hash(this.language),
      hash(this.getValue()),
      this.metadata,
      this.internalMetadata,
      this.outputs.map((op) => ({
        outputs: op.outputs.map((output) => ({
          mime: output.mime,
          data: bufferHash(output.data)
        })),
        metadata: op.metadata
      }))
    ]);
    return this._hash;
  }
}
class MirrorNotebookDocument {
  constructor(uri, cells, metadata) {
    this.uri = uri;
    this.cells = cells;
    this.metadata = metadata;
  }
  acceptModelChanged(event) {
    event.rawEvents.forEach((e) => {
      if (e.kind === NotebookCellsChangeType.ModelChange) {
        this._spliceNotebookCells(e.changes);
      } else if (e.kind === NotebookCellsChangeType.Move) {
        const cells = this.cells.splice(e.index, 1);
        this.cells.splice(e.newIdx, 0, ...cells);
      } else if (e.kind === NotebookCellsChangeType.Output) {
        const cell = this.cells[e.index];
        cell.outputs = e.outputs;
      } else if (e.kind === NotebookCellsChangeType.ChangeCellLanguage) {
        this._assertIndex(e.index);
        const cell = this.cells[e.index];
        cell.language = e.language;
      } else if (e.kind === NotebookCellsChangeType.ChangeCellMetadata) {
        this._assertIndex(e.index);
        const cell = this.cells[e.index];
        cell.metadata = e.metadata;
      } else if (e.kind === NotebookCellsChangeType.ChangeCellInternalMetadata) {
        this._assertIndex(e.index);
        const cell = this.cells[e.index];
        cell.internalMetadata = e.internalMetadata;
      }
    });
  }
  _assertIndex(index) {
    if (index < 0 || index >= this.cells.length) {
      throw new Error(
        `Illegal index ${index}. Cells length: ${this.cells.length}`
      );
    }
  }
  _spliceNotebookCells(splices) {
    splices.reverse().forEach((splice) => {
      const cellDtos = splice[2];
      const newCells = cellDtos.map((cell) => {
        return new MirrorCell(
          cell.handle,
          URI.parse(cell.url),
          cell.source,
          cell.eol,
          cell.versionId,
          cell.language,
          cell.cellKind,
          cell.outputs,
          cell.metadata
        );
      });
      this.cells.splice(splice[0], splice[1], ...newCells);
    });
  }
}
class CellSequence {
  constructor(textModel) {
    this.textModel = textModel;
  }
  getElements() {
    const hashValue = new Int32Array(this.textModel.cells.length);
    for (let i = 0; i < this.textModel.cells.length; i++) {
      hashValue[i] = this.textModel.cells[i].getComparisonValue();
    }
    return hashValue;
  }
  getCellHash(cell) {
    const source = Array.isArray(cell.source) ? cell.source.join("\n") : cell.source;
    const hashVal = hash([hash(source), cell.metadata]);
    return hashVal;
  }
}
class NotebookEditorSimpleWorker {
  _requestHandlerBrand;
  _models;
  constructor() {
    this._models = /* @__PURE__ */ Object.create(null);
  }
  dispose() {
  }
  $acceptNewModel(uri, metadata, cells) {
    this._models[uri] = new MirrorNotebookDocument(
      URI.parse(uri),
      cells.map(
        (dto) => new MirrorCell(
          dto.handle,
          URI.parse(dto.url),
          dto.source,
          dto.eol,
          dto.versionId,
          dto.language,
          dto.cellKind,
          dto.outputs,
          dto.metadata
        )
      ),
      metadata
    );
  }
  $acceptModelChanged(strURL, event) {
    const model = this._models[strURL];
    model?.acceptModelChanged(event);
  }
  $acceptCellModelChanged(strURL, handle, event) {
    const model = this._models[strURL];
    model.cells.find((cell) => cell.handle === handle)?.onEvents(event);
  }
  $acceptRemovedModel(strURL) {
    if (!this._models[strURL]) {
      return;
    }
    delete this._models[strURL];
  }
  $computeDiff(originalUrl, modifiedUrl) {
    const original = this._getModel(originalUrl);
    const modified = this._getModel(modifiedUrl);
    const diff = new LcsDiff(
      new CellSequence(original),
      new CellSequence(modified)
    );
    const diffResult = diff.ComputeDiff(false);
    return {
      cellsDiff: diffResult
      // linesDiff: cellLineChanges
    };
  }
  $canPromptRecommendation(modelUrl) {
    const model = this._getModel(modelUrl);
    const cells = model.cells;
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (cell.cellKind === CellKind.Markup) {
        continue;
      }
      if (cell.language !== "python") {
        continue;
      }
      const searchParams = new SearchParams(
        "import\\s*pandas|from\\s*pandas",
        true,
        false,
        null
      );
      const searchData = searchParams.parseSearchRequest();
      if (!searchData) {
        continue;
      }
      const builder = new PieceTreeTextBufferBuilder();
      builder.acceptChunk(cell.getValue());
      const bufferFactory = builder.finish(true);
      const textBuffer = bufferFactory.create(cell.eol).textBuffer;
      const lineCount = textBuffer.getLineCount();
      const maxLineCount = Math.min(lineCount, 20);
      const range = new Range(
        1,
        1,
        maxLineCount,
        textBuffer.getLineLength(maxLineCount) + 1
      );
      const cellMatches = textBuffer.findMatchesLineByLine(
        range,
        searchData,
        true,
        1
      );
      if (cellMatches.length > 0) {
        return true;
      }
    }
    return false;
  }
  _getModel(uri) {
    return this._models[uri];
  }
}
function create(workerServer) {
  return new NotebookEditorSimpleWorker();
}
export {
  NotebookEditorSimpleWorker,
  create
};
