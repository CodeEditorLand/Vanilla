var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ICellOutput, IOutputDto, IOutputItemDto, compressOutputItemStreams, isTextStreamMime } from "../notebookCommon.js";
class NotebookCellOutputTextModel extends Disposable {
  constructor(_rawOutput) {
    super();
    this._rawOutput = _rawOutput;
    this._alternativeOutputId = this._rawOutput.outputId;
  }
  static {
    __name(this, "NotebookCellOutputTextModel");
  }
  _onDidChangeData = this._register(new Emitter());
  onDidChangeData = this._onDidChangeData.event;
  get outputs() {
    return this._rawOutput.outputs || [];
  }
  get metadata() {
    return this._rawOutput.metadata;
  }
  get outputId() {
    return this._rawOutput.outputId;
  }
  /**
   * Alternative output id that's reused when the output is updated.
   */
  _alternativeOutputId;
  get alternativeOutputId() {
    return this._alternativeOutputId;
  }
  _versionId = 0;
  get versionId() {
    return this._versionId;
  }
  replaceData(rawData) {
    this.versionedBufferLengths = {};
    this._rawOutput = rawData;
    this.optimizeOutputItems();
    this._versionId = this._versionId + 1;
    this._onDidChangeData.fire();
  }
  appendData(items) {
    this.trackBufferLengths();
    this._rawOutput.outputs.push(...items);
    this.optimizeOutputItems();
    this._versionId = this._versionId + 1;
    this._onDidChangeData.fire();
  }
  trackBufferLengths() {
    this.outputs.forEach((output) => {
      if (isTextStreamMime(output.mime)) {
        if (!this.versionedBufferLengths[output.mime]) {
          this.versionedBufferLengths[output.mime] = {};
        }
        this.versionedBufferLengths[output.mime][this.versionId] = output.data.byteLength;
      }
    });
  }
  // mime: versionId: buffer length
  versionedBufferLengths = {};
  appendedSinceVersion(versionId, mime) {
    const bufferLength = this.versionedBufferLengths[mime]?.[versionId];
    const output = this.outputs.find((output2) => output2.mime === mime);
    if (bufferLength && output) {
      return output.data.slice(bufferLength);
    }
    return void 0;
  }
  optimizeOutputItems() {
    if (this.outputs.length > 1 && this.outputs.every((item) => isTextStreamMime(item.mime))) {
      const mimeOutputs = /* @__PURE__ */ new Map();
      const mimeTypes = [];
      this.outputs.forEach((item) => {
        let items;
        if (mimeOutputs.has(item.mime)) {
          items = mimeOutputs.get(item.mime);
        } else {
          items = [];
          mimeOutputs.set(item.mime, items);
          mimeTypes.push(item.mime);
        }
        items.push(item.data.buffer);
      });
      this.outputs.length = 0;
      mimeTypes.forEach((mime) => {
        const compressionResult = compressOutputItemStreams(mimeOutputs.get(mime));
        this.outputs.push({
          mime,
          data: compressionResult.data
        });
        if (compressionResult.didCompression) {
          this.versionedBufferLengths = {};
        }
      });
    }
  }
  asDto() {
    return {
      // data: this._data,
      metadata: this._rawOutput.metadata,
      outputs: this._rawOutput.outputs,
      outputId: this._rawOutput.outputId
    };
  }
  bumpVersion() {
    this._versionId = this._versionId + 1;
  }
}
export {
  NotebookCellOutputTextModel
};
//# sourceMappingURL=notebookCellOutputTextModel.js.map
