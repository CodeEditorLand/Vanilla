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
import { Promises, ThrottledDelayer } from "../../../../base/common/async.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import {
  CancellationTokenSource
} from "../../../../base/common/cancellation.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import { Emitter } from "../../../../base/common/event.js";
import {
  Disposable,
  dispose,
  MutableDisposable,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import * as resources from "../../../../base/common/resources.js";
import { isNumber } from "../../../../base/common/types.js";
import {
  EditOperation
} from "../../../../editor/common/core/editOperation.js";
import { Position } from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
import { IEditorWorkerService } from "../../../../editor/common/services/editorWorker.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import {
  ILoggerService,
  ILogService
} from "../../../../platform/log/common/log.js";
import { OutputChannelUpdateMode } from "../../../services/output/common/output.js";
class OutputFileListener extends Disposable {
  constructor(file, fileService, logService) {
    super();
    this.file = file;
    this.fileService = fileService;
    this.logService = logService;
    this.syncDelayer = new ThrottledDelayer(500);
  }
  _onDidContentChange = new Emitter();
  onDidContentChange = this._onDidContentChange.event;
  watching = false;
  syncDelayer;
  etag;
  watch(eTag) {
    if (!this.watching) {
      this.etag = eTag;
      this.poll();
      this.logService.trace("Started polling", this.file.toString());
      this.watching = true;
    }
  }
  poll() {
    const loop = () => this.doWatch().then(() => this.poll());
    this.syncDelayer.trigger(loop).catch((error) => {
      if (!isCancellationError(error)) {
        throw error;
      }
    });
  }
  async doWatch() {
    const stat = await this.fileService.stat(this.file);
    if (stat.etag !== this.etag) {
      this.etag = stat.etag;
      this._onDidContentChange.fire(stat.size);
    }
  }
  unwatch() {
    if (this.watching) {
      this.syncDelayer.cancel();
      this.watching = false;
      this.logService.trace("Stopped polling", this.file.toString());
    }
  }
  dispose() {
    this.unwatch();
    super.dispose();
  }
}
let FileOutputChannelModel = class extends Disposable {
  constructor(modelUri, language, file, fileService, modelService, logService, editorWorkerService) {
    super();
    this.modelUri = modelUri;
    this.language = language;
    this.file = file;
    this.fileService = fileService;
    this.modelService = modelService;
    this.editorWorkerService = editorWorkerService;
    this.fileHandler = this._register(
      new OutputFileListener(this.file, this.fileService, logService)
    );
    this._register(
      this.fileHandler.onDidContentChange(
        (size) => this.onDidContentChange(size)
      )
    );
    this._register(toDisposable(() => this.fileHandler.unwatch()));
  }
  _onDispose = this._register(new Emitter());
  onDispose = this._onDispose.event;
  fileHandler;
  etag = "";
  loadModelPromise = null;
  model = null;
  modelUpdateInProgress = false;
  modelUpdateCancellationSource = this._register(
    new MutableDisposable()
  );
  appendThrottler = this._register(
    new ThrottledDelayer(300)
  );
  replacePromise;
  startOffset = 0;
  endOffset = 0;
  append(message) {
    throw new Error("Not supported");
  }
  replace(message) {
    throw new Error("Not supported");
  }
  clear() {
    this.update(OutputChannelUpdateMode.Clear, this.endOffset, true);
  }
  update(mode, till, immediate) {
    const loadModelPromise = this.loadModelPromise ? this.loadModelPromise : Promise.resolve();
    loadModelPromise.then(() => this.doUpdate(mode, till, immediate));
  }
  loadModel() {
    this.loadModelPromise = Promises.withAsyncBody(
      async (c, e) => {
        try {
          let content = "";
          if (await this.fileService.exists(this.file)) {
            const fileContent = await this.fileService.readFile(
              this.file,
              { position: this.startOffset }
            );
            this.endOffset = this.startOffset + fileContent.value.byteLength;
            this.etag = fileContent.etag;
            content = fileContent.value.toString();
          } else {
            this.startOffset = 0;
            this.endOffset = 0;
          }
          c(this.createModel(content));
        } catch (error) {
          e(error);
        }
      }
    );
    return this.loadModelPromise;
  }
  createModel(content) {
    if (this.model) {
      this.model.setValue(content);
    } else {
      this.model = this.modelService.createModel(
        content,
        this.language,
        this.modelUri
      );
      this.fileHandler.watch(this.etag);
      const disposable = this.model.onWillDispose(() => {
        this.cancelModelUpdate();
        this.fileHandler.unwatch();
        this.model = null;
        dispose(disposable);
      });
    }
    return this.model;
  }
  doUpdate(mode, till, immediate) {
    if (mode === OutputChannelUpdateMode.Clear || mode === OutputChannelUpdateMode.Replace) {
      this.startOffset = this.endOffset = isNumber(till) ? till : this.endOffset;
      this.cancelModelUpdate();
    }
    if (!this.model) {
      return;
    }
    this.modelUpdateInProgress = true;
    if (!this.modelUpdateCancellationSource.value) {
      this.modelUpdateCancellationSource.value = new CancellationTokenSource();
    }
    const token = this.modelUpdateCancellationSource.value.token;
    if (mode === OutputChannelUpdateMode.Clear) {
      this.clearContent(this.model);
    } else if (mode === OutputChannelUpdateMode.Replace) {
      this.replacePromise = this.replaceContent(
        this.model,
        token
      ).finally(() => this.replacePromise = void 0);
    } else {
      this.appendContent(this.model, immediate, token);
    }
  }
  clearContent(model) {
    this.doUpdateModel(
      model,
      [EditOperation.delete(model.getFullModelRange())],
      VSBuffer.fromString("")
    );
  }
  appendContent(model, immediate, token) {
    this.appendThrottler.trigger(
      async () => {
        if (token.isCancellationRequested) {
          return;
        }
        if (this.replacePromise) {
          try {
            await this.replacePromise;
          } catch (e) {
          }
          if (token.isCancellationRequested) {
            return;
          }
        }
        const contentToAppend = await this.getContentToUpdate();
        if (token.isCancellationRequested) {
          return;
        }
        const lastLine = model.getLineCount();
        const lastLineMaxColumn = model.getLineMaxColumn(lastLine);
        const edits = [
          EditOperation.insert(
            new Position(lastLine, lastLineMaxColumn),
            contentToAppend.toString()
          )
        ];
        this.doUpdateModel(model, edits, contentToAppend);
      },
      immediate ? 0 : void 0
    ).catch((error) => {
      if (!isCancellationError(error)) {
        throw error;
      }
    });
  }
  async replaceContent(model, token) {
    const contentToReplace = await this.getContentToUpdate();
    if (token.isCancellationRequested) {
      return;
    }
    const edits = await this.getReplaceEdits(
      model,
      contentToReplace.toString()
    );
    if (token.isCancellationRequested) {
      return;
    }
    this.doUpdateModel(model, edits, contentToReplace);
  }
  async getReplaceEdits(model, contentToReplace) {
    if (!contentToReplace) {
      return [EditOperation.delete(model.getFullModelRange())];
    }
    if (contentToReplace !== model.getValue()) {
      const edits = await this.editorWorkerService.computeMoreMinimalEdits(
        model.uri,
        [
          {
            text: contentToReplace.toString(),
            range: model.getFullModelRange()
          }
        ]
      );
      if (edits?.length) {
        return edits.map(
          (edit) => EditOperation.replace(Range.lift(edit.range), edit.text)
        );
      }
    }
    return [];
  }
  doUpdateModel(model, edits, content) {
    if (edits.length) {
      model.applyEdits(edits);
    }
    this.endOffset = this.endOffset + content.byteLength;
    this.modelUpdateInProgress = false;
  }
  cancelModelUpdate() {
    this.modelUpdateCancellationSource.value?.cancel();
    this.modelUpdateCancellationSource.value = void 0;
    this.appendThrottler.cancel();
    this.replacePromise = void 0;
    this.modelUpdateInProgress = false;
  }
  async getContentToUpdate() {
    const content = await this.fileService.readFile(this.file, {
      position: this.endOffset
    });
    this.etag = content.etag;
    return content.value;
  }
  onDidContentChange(size) {
    if (this.model) {
      if (!this.modelUpdateInProgress) {
        if (isNumber(size) && this.endOffset > size) {
          this.update(OutputChannelUpdateMode.Clear, 0, true);
        }
      }
      this.update(
        OutputChannelUpdateMode.Append,
        void 0,
        false
      );
    }
  }
  isVisible() {
    return !!this.model;
  }
  dispose() {
    this._onDispose.fire();
    super.dispose();
  }
};
FileOutputChannelModel = __decorateClass([
  __decorateParam(3, IFileService),
  __decorateParam(4, IModelService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IEditorWorkerService)
], FileOutputChannelModel);
let OutputChannelBackedByFile = class extends FileOutputChannelModel {
  logger;
  _offset;
  constructor(id, modelUri, language, file, fileService, modelService, loggerService, logService, editorWorkerService) {
    super(
      modelUri,
      language,
      file,
      fileService,
      modelService,
      logService,
      editorWorkerService
    );
    this.logger = loggerService.createLogger(file, {
      logLevel: "always",
      donotRotate: true,
      donotUseFormatters: true,
      hidden: true
    });
    this._offset = 0;
  }
  append(message) {
    this.write(message);
    this.update(
      OutputChannelUpdateMode.Append,
      void 0,
      this.isVisible()
    );
  }
  replace(message) {
    const till = this._offset;
    this.write(message);
    this.update(OutputChannelUpdateMode.Replace, till, true);
  }
  write(content) {
    this._offset += VSBuffer.fromString(content).byteLength;
    this.logger.info(content);
    if (this.isVisible()) {
      this.logger.flush();
    }
  }
};
OutputChannelBackedByFile = __decorateClass([
  __decorateParam(4, IFileService),
  __decorateParam(5, IModelService),
  __decorateParam(6, ILoggerService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IEditorWorkerService)
], OutputChannelBackedByFile);
let DelegatedOutputChannelModel = class extends Disposable {
  constructor(id, modelUri, language, outputDir, instantiationService, fileService) {
    super();
    this.instantiationService = instantiationService;
    this.fileService = fileService;
    this.outputChannelModel = this.createOutputChannelModel(
      id,
      modelUri,
      language,
      outputDir
    );
  }
  _onDispose = this._register(
    new Emitter()
  );
  onDispose = this._onDispose.event;
  outputChannelModel;
  async createOutputChannelModel(id, modelUri, language, outputDirPromise) {
    const outputDir = await outputDirPromise;
    const file = resources.joinPath(
      outputDir,
      `${id.replace(/[\\/:\*\?"<>\|]/g, "")}.log`
    );
    await this.fileService.createFile(file);
    const outputChannelModel = this._register(
      this.instantiationService.createInstance(
        OutputChannelBackedByFile,
        id,
        modelUri,
        language,
        file
      )
    );
    this._register(
      outputChannelModel.onDispose(() => this._onDispose.fire())
    );
    return outputChannelModel;
  }
  append(output) {
    this.outputChannelModel.then(
      (outputChannelModel) => outputChannelModel.append(output)
    );
  }
  update(mode, till, immediate) {
    this.outputChannelModel.then(
      (outputChannelModel) => outputChannelModel.update(mode, till, immediate)
    );
  }
  loadModel() {
    return this.outputChannelModel.then(
      (outputChannelModel) => outputChannelModel.loadModel()
    );
  }
  clear() {
    this.outputChannelModel.then(
      (outputChannelModel) => outputChannelModel.clear()
    );
  }
  replace(value) {
    this.outputChannelModel.then(
      (outputChannelModel) => outputChannelModel.replace(value)
    );
  }
};
DelegatedOutputChannelModel = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IFileService)
], DelegatedOutputChannelModel);
export {
  DelegatedOutputChannelModel,
  FileOutputChannelModel
};
