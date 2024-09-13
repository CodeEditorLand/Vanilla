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
import { TaskSequentializer, timeout } from "../../../../base/common/async.js";
import {
  CancellationToken,
  CancellationTokenSource
} from "../../../../base/common/cancellation.js";
import { Emitter } from "../../../../base/common/event.js";
import { basename } from "../../../../base/common/path.js";
import { mark } from "../../../../base/common/performance.js";
import { extUri } from "../../../../base/common/resources.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../editor/common/languages/modesRegistry.js";
import { createTextBufferFactoryFromStream } from "../../../../editor/common/model/textModel.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { localize } from "../../../../nls.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import {
  ETAG_DISABLED,
  FileChangeType,
  FileOperationResult,
  IFileService,
  NotModifiedSinceFileOperationError
} from "../../../../platform/files/common/files.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import {
  IProgressService,
  ProgressLocation
} from "../../../../platform/progress/common/progress.js";
import {
  SaveReason,
  SaveSourceRegistry
} from "../../../common/editor.js";
import { BaseTextEditorModel } from "../../../common/editor/textEditorModel.js";
import { IExtensionService } from "../../extensions/common/extensions.js";
import { IFilesConfigurationService } from "../../filesConfiguration/common/filesConfigurationService.js";
import { ILanguageDetectionService } from "../../languageDetection/common/languageDetectionWorkerService.js";
import { IPathService } from "../../path/common/pathService.js";
import {
  NO_TYPE_ID,
  WorkingCopyCapabilities
} from "../../workingCopy/common/workingCopy.js";
import {
  IWorkingCopyBackupService
} from "../../workingCopy/common/workingCopyBackup.js";
import { IWorkingCopyService } from "../../workingCopy/common/workingCopyService.js";
import { UTF8, UTF8_with_bom, UTF16be, UTF16le } from "./encoding.js";
import {
  EncodingMode,
  ITextFileService,
  TextFileEditorModelState,
  TextFileResolveReason
} from "./textfiles.js";
let TextFileEditorModel = class extends BaseTextEditorModel {
  constructor(resource, preferredEncoding, preferredLanguageId, languageService, modelService, fileService, textFileService, workingCopyBackupService, logService, workingCopyService, filesConfigurationService, labelService, languageDetectionService, accessibilityService, pathService, extensionService, progressService) {
    super(modelService, languageService, languageDetectionService, accessibilityService);
    this.resource = resource;
    this.preferredEncoding = preferredEncoding;
    this.preferredLanguageId = preferredLanguageId;
    this.fileService = fileService;
    this.textFileService = textFileService;
    this.workingCopyBackupService = workingCopyBackupService;
    this.logService = logService;
    this.workingCopyService = workingCopyService;
    this.filesConfigurationService = filesConfigurationService;
    this.labelService = labelService;
    this.pathService = pathService;
    this.extensionService = extensionService;
    this.progressService = progressService;
    this._register(this.workingCopyService.registerWorkingCopy(this));
    this.registerListeners();
  }
  static {
    __name(this, "TextFileEditorModel");
  }
  static TEXTFILE_SAVE_ENCODING_SOURCE = SaveSourceRegistry.registerSource(
    "textFileEncoding.source",
    localize("textFileCreate.source", "File Encoding Changed")
  );
  //#region Events
  _onDidChangeContent = this._register(new Emitter());
  onDidChangeContent = this._onDidChangeContent.event;
  _onDidResolve = this._register(
    new Emitter()
  );
  onDidResolve = this._onDidResolve.event;
  _onDidChangeDirty = this._register(new Emitter());
  onDidChangeDirty = this._onDidChangeDirty.event;
  _onDidSaveError = this._register(new Emitter());
  onDidSaveError = this._onDidSaveError.event;
  _onDidSave = this._register(
    new Emitter()
  );
  onDidSave = this._onDidSave.event;
  _onDidRevert = this._register(new Emitter());
  onDidRevert = this._onDidRevert.event;
  _onDidChangeEncoding = this._register(new Emitter());
  onDidChangeEncoding = this._onDidChangeEncoding.event;
  _onDidChangeOrphaned = this._register(new Emitter());
  onDidChangeOrphaned = this._onDidChangeOrphaned.event;
  _onDidChangeReadonly = this._register(new Emitter());
  onDidChangeReadonly = this._onDidChangeReadonly.event;
  //#endregion
  typeId = NO_TYPE_ID;
  // IMPORTANT: never change this to not break existing assumptions (e.g. backups)
  capabilities = WorkingCopyCapabilities.None;
  name = basename(this.labelService.getUriLabel(this.resource));
  resourceHasExtension = !!extUri.extname(this.resource);
  contentEncoding;
  // encoding as reported from disk
  versionId = 0;
  bufferSavedVersionId;
  ignoreDirtyOnModelContentChange = false;
  ignoreSaveFromSaveParticipants = false;
  static UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD = 500;
  lastModelContentChangeFromUndoRedo = void 0;
  lastResolvedFileStat;
  // !!! DO NOT MARK PRIVATE! USED IN TESTS !!!
  saveSequentializer = new TaskSequentializer();
  dirty = false;
  inConflictMode = false;
  inOrphanMode = false;
  inErrorMode = false;
  registerListeners() {
    this._register(
      this.fileService.onDidFilesChange((e) => this.onDidFilesChange(e))
    );
    this._register(
      this.filesConfigurationService.onDidChangeFilesAssociation(
        () => this.onDidChangeFilesAssociation()
      )
    );
    this._register(
      this.filesConfigurationService.onDidChangeReadonly(
        () => this._onDidChangeReadonly.fire()
      )
    );
  }
  async onDidFilesChange(e) {
    let fileEventImpactsModel = false;
    let newInOrphanModeGuess;
    if (this.inOrphanMode) {
      const modelFileAdded = e.contains(
        this.resource,
        FileChangeType.ADDED
      );
      if (modelFileAdded) {
        newInOrphanModeGuess = false;
        fileEventImpactsModel = true;
      }
    } else {
      const modelFileDeleted = e.contains(
        this.resource,
        FileChangeType.DELETED
      );
      if (modelFileDeleted) {
        newInOrphanModeGuess = true;
        fileEventImpactsModel = true;
      }
    }
    if (fileEventImpactsModel && this.inOrphanMode !== newInOrphanModeGuess) {
      let newInOrphanModeValidated = false;
      if (newInOrphanModeGuess) {
        await timeout(100, CancellationToken.None);
        if (this.isDisposed()) {
          newInOrphanModeValidated = true;
        } else {
          const exists = await this.fileService.exists(this.resource);
          newInOrphanModeValidated = !exists;
        }
      }
      if (this.inOrphanMode !== newInOrphanModeValidated && !this.isDisposed()) {
        this.setOrphaned(newInOrphanModeValidated);
      }
    }
  }
  setOrphaned(orphaned) {
    if (this.inOrphanMode !== orphaned) {
      this.inOrphanMode = orphaned;
      this._onDidChangeOrphaned.fire();
    }
  }
  onDidChangeFilesAssociation() {
    if (!this.isResolved()) {
      return;
    }
    const firstLineText = this.getFirstLineText(this.textEditorModel);
    const languageSelection = this.getOrCreateLanguage(
      this.resource,
      this.languageService,
      this.preferredLanguageId,
      firstLineText
    );
    this.textEditorModel.setLanguage(languageSelection);
  }
  setLanguageId(languageId, source) {
    super.setLanguageId(languageId, source);
    this.preferredLanguageId = languageId;
  }
  //#region Backup
  async backup(token) {
    let meta;
    if (this.lastResolvedFileStat) {
      meta = {
        mtime: this.lastResolvedFileStat.mtime,
        ctime: this.lastResolvedFileStat.ctime,
        size: this.lastResolvedFileStat.size,
        etag: this.lastResolvedFileStat.etag,
        orphaned: this.inOrphanMode
      };
    }
    const content = await this.textFileService.getEncodedReadable(
      this.resource,
      this.createSnapshot() ?? void 0,
      { encoding: UTF8 }
    );
    return { meta, content };
  }
  //#endregion
  //#region Revert
  async revert(options) {
    if (!this.isResolved()) {
      return;
    }
    const wasDirty = this.dirty;
    const undo = this.doSetDirty(false);
    const softUndo = options?.soft;
    if (!softUndo) {
      try {
        await this.forceResolveFromFile();
      } catch (error) {
        if (error.fileOperationResult !== FileOperationResult.FILE_NOT_FOUND) {
          undo();
          throw error;
        }
      }
    }
    this._onDidRevert.fire();
    if (wasDirty) {
      this._onDidChangeDirty.fire();
    }
  }
  //#endregion
  //#region Resolve
  async resolve(options) {
    this.trace("resolve() - enter");
    mark("code/willResolveTextFileEditorModel");
    if (this.isDisposed()) {
      this.trace(
        "resolve() - exit - without resolving because model is disposed"
      );
      return;
    }
    if (!options?.contents && (this.dirty || this.saveSequentializer.isRunning())) {
      this.trace(
        "resolve() - exit - without resolving because model is dirty or being saved"
      );
      return;
    }
    await this.doResolve(options);
    mark("code/didResolveTextFileEditorModel");
  }
  async doResolve(options) {
    if (options?.contents) {
      return this.resolveFromBuffer(options.contents, options);
    }
    const isNewModel = !this.isResolved();
    if (isNewModel) {
      const resolvedFromBackup = await this.resolveFromBackup(options);
      if (resolvedFromBackup) {
        return;
      }
    }
    return this.resolveFromFile(options);
  }
  async resolveFromBuffer(buffer, options) {
    this.trace("resolveFromBuffer()");
    let mtime;
    let ctime;
    let size;
    let etag;
    try {
      const metadata = await this.fileService.stat(this.resource);
      mtime = metadata.mtime;
      ctime = metadata.ctime;
      size = metadata.size;
      etag = metadata.etag;
      this.setOrphaned(false);
    } catch (error) {
      mtime = Date.now();
      ctime = Date.now();
      size = 0;
      etag = ETAG_DISABLED;
      this.setOrphaned(
        error.fileOperationResult === FileOperationResult.FILE_NOT_FOUND
      );
    }
    const preferredEncoding = await this.textFileService.encoding.getPreferredWriteEncoding(
      this.resource,
      this.preferredEncoding
    );
    this.resolveFromContent(
      {
        resource: this.resource,
        name: this.name,
        mtime,
        ctime,
        size,
        etag,
        value: buffer,
        encoding: preferredEncoding.encoding,
        readonly: false,
        locked: false
      },
      true,
      options
    );
  }
  async resolveFromBackup(options) {
    const backup = await this.workingCopyBackupService.resolve(this);
    let encoding = UTF8;
    if (backup) {
      encoding = (await this.textFileService.encoding.getPreferredWriteEncoding(
        this.resource,
        this.preferredEncoding
      )).encoding;
    }
    const isNewModel = !this.isResolved();
    if (!isNewModel) {
      this.trace(
        "resolveFromBackup() - exit - without resolving because previously new model got created meanwhile"
      );
      return true;
    }
    if (backup) {
      await this.doResolveFromBackup(backup, encoding, options);
      return true;
    }
    return false;
  }
  async doResolveFromBackup(backup, encoding, options) {
    this.trace("doResolveFromBackup()");
    this.resolveFromContent(
      {
        resource: this.resource,
        name: this.name,
        mtime: backup.meta ? backup.meta.mtime : Date.now(),
        ctime: backup.meta ? backup.meta.ctime : Date.now(),
        size: backup.meta ? backup.meta.size : 0,
        etag: backup.meta ? backup.meta.etag : ETAG_DISABLED,
        // etag disabled if unknown!
        value: await createTextBufferFactoryFromStream(
          await this.textFileService.getDecodedStream(
            this.resource,
            backup.value,
            { encoding: UTF8 }
          )
        ),
        encoding,
        readonly: false,
        locked: false
      },
      true,
      options
    );
    if (backup.meta?.orphaned) {
      this.setOrphaned(true);
    }
  }
  async resolveFromFile(options) {
    this.trace("resolveFromFile()");
    const forceReadFromFile = options?.forceReadFromFile;
    const allowBinary = this.isResolved() || options?.allowBinary;
    let etag;
    if (forceReadFromFile) {
      etag = ETAG_DISABLED;
    } else if (this.lastResolvedFileStat) {
      etag = this.lastResolvedFileStat.etag;
    }
    const currentVersionId = this.versionId;
    try {
      const content = await this.textFileService.readStream(
        this.resource,
        {
          acceptTextOnly: !allowBinary,
          etag,
          encoding: this.preferredEncoding,
          limits: options?.limits
        }
      );
      this.setOrphaned(false);
      if (currentVersionId !== this.versionId) {
        this.trace(
          "resolveFromFile() - exit - without resolving because model content changed"
        );
        return;
      }
      return this.resolveFromContent(
        content,
        false,
        options
      );
    } catch (error) {
      const result = error.fileOperationResult;
      this.setOrphaned(result === FileOperationResult.FILE_NOT_FOUND);
      if (this.isResolved() && result === FileOperationResult.FILE_NOT_MODIFIED_SINCE) {
        if (error instanceof NotModifiedSinceFileOperationError) {
          this.updateLastResolvedFileStat(error.stat);
        }
        return;
      }
      if (this.isResolved() && result === FileOperationResult.FILE_NOT_FOUND && !forceReadFromFile) {
        return;
      }
      throw error;
    }
  }
  resolveFromContent(content, dirty, options) {
    this.trace("resolveFromContent() - enter");
    if (this.isDisposed()) {
      this.trace(
        "resolveFromContent() - exit - because model is disposed"
      );
      return;
    }
    this.updateLastResolvedFileStat({
      resource: this.resource,
      name: content.name,
      mtime: content.mtime,
      ctime: content.ctime,
      size: content.size,
      etag: content.etag,
      readonly: content.readonly,
      locked: content.locked,
      isFile: true,
      isDirectory: false,
      isSymbolicLink: false,
      children: void 0
    });
    const oldEncoding = this.contentEncoding;
    this.contentEncoding = content.encoding;
    if (this.preferredEncoding) {
      this.updatePreferredEncoding(this.contentEncoding);
    } else if (oldEncoding !== this.contentEncoding) {
      this._onDidChangeEncoding.fire();
    }
    if (this.textEditorModel) {
      this.doUpdateTextModel(content.value);
    } else {
      this.doCreateTextModel(content.resource, content.value);
    }
    this.setDirty(!!dirty);
    this._onDidResolve.fire(options?.reason ?? TextFileResolveReason.OTHER);
  }
  doCreateTextModel(resource, value) {
    this.trace("doCreateTextModel()");
    const textModel = this.createTextEditorModel(
      value,
      resource,
      this.preferredLanguageId
    );
    this.installModelListeners(textModel);
    this.autoDetectLanguage();
  }
  doUpdateTextModel(value) {
    this.trace("doUpdateTextModel()");
    this.ignoreDirtyOnModelContentChange = true;
    try {
      this.updateTextEditorModel(value, this.preferredLanguageId);
    } finally {
      this.ignoreDirtyOnModelContentChange = false;
    }
  }
  installModelListeners(model) {
    this._register(
      model.onDidChangeContent(
        (e) => this.onModelContentChanged(model, e.isUndoing || e.isRedoing)
      )
    );
    this._register(
      model.onDidChangeLanguage(() => this.onMaybeShouldChangeEncoding())
    );
    super.installModelListeners(model);
  }
  onModelContentChanged(model, isUndoingOrRedoing) {
    this.trace(`onModelContentChanged() - enter`);
    this.versionId++;
    this.trace(`onModelContentChanged() - new versionId ${this.versionId}`);
    if (isUndoingOrRedoing) {
      this.lastModelContentChangeFromUndoRedo = Date.now();
    }
    if (!this.ignoreDirtyOnModelContentChange && !this.isReadonly()) {
      if (model.getAlternativeVersionId() === this.bufferSavedVersionId) {
        this.trace(
          "onModelContentChanged() - model content changed back to last saved version"
        );
        const wasDirty = this.dirty;
        this.setDirty(false);
        if (wasDirty) {
          this._onDidRevert.fire();
        }
      } else {
        this.trace(
          "onModelContentChanged() - model content changed and marked as dirty"
        );
        this.setDirty(true);
      }
    }
    this._onDidChangeContent.fire();
    this.autoDetectLanguage();
  }
  async autoDetectLanguage() {
    await this.extensionService?.whenInstalledExtensionsRegistered();
    const languageId = this.getLanguageId();
    if (this.resource.scheme === this.pathService.defaultUriScheme && // make sure to not detect language for non-user visible documents
    (!languageId || languageId === PLAINTEXT_LANGUAGE_ID) && // only run on files with plaintext language set or no language set at all
    !this.resourceHasExtension) {
      return super.autoDetectLanguage();
    }
  }
  async forceResolveFromFile() {
    if (this.isDisposed()) {
      return;
    }
    await this.textFileService.files.resolve(this.resource, {
      reload: { async: false },
      forceReadFromFile: true
    });
  }
  //#endregion
  //#region Dirty
  isDirty() {
    return this.dirty;
  }
  isModified() {
    return this.isDirty();
  }
  setDirty(dirty) {
    if (!this.isResolved()) {
      return;
    }
    const wasDirty = this.dirty;
    this.doSetDirty(dirty);
    if (dirty !== wasDirty) {
      this._onDidChangeDirty.fire();
    }
  }
  doSetDirty(dirty) {
    const wasDirty = this.dirty;
    const wasInConflictMode = this.inConflictMode;
    const wasInErrorMode = this.inErrorMode;
    const oldBufferSavedVersionId = this.bufferSavedVersionId;
    if (dirty) {
      this.dirty = true;
    } else {
      this.dirty = false;
      this.inConflictMode = false;
      this.inErrorMode = false;
      this.updateSavedVersionId();
    }
    return () => {
      this.dirty = wasDirty;
      this.inConflictMode = wasInConflictMode;
      this.inErrorMode = wasInErrorMode;
      this.bufferSavedVersionId = oldBufferSavedVersionId;
    };
  }
  //#endregion
  //#region Save
  async save(options = /* @__PURE__ */ Object.create(null)) {
    if (!this.isResolved()) {
      return false;
    }
    if (this.isReadonly()) {
      this.trace("save() - ignoring request for readonly resource");
      return false;
    }
    if ((this.hasState(TextFileEditorModelState.CONFLICT) || this.hasState(TextFileEditorModelState.ERROR)) && (options.reason === SaveReason.AUTO || options.reason === SaveReason.FOCUS_CHANGE || options.reason === SaveReason.WINDOW_CHANGE)) {
      this.trace(
        "save() - ignoring auto save request for model that is in conflict or error"
      );
      return false;
    }
    this.trace("save() - enter");
    await this.doSave(options);
    this.trace("save() - exit");
    return this.hasState(TextFileEditorModelState.SAVED);
  }
  async doSave(options) {
    if (typeof options.reason !== "number") {
      options.reason = SaveReason.EXPLICIT;
    }
    const versionId = this.versionId;
    this.trace(`doSave(${versionId}) - enter with versionId ${versionId}`);
    if (this.ignoreSaveFromSaveParticipants) {
      this.trace(
        `doSave(${versionId}) - exit - refusing to save() recursively from save participant`
      );
      return;
    }
    if (this.saveSequentializer.isRunning(versionId)) {
      this.trace(
        `doSave(${versionId}) - exit - found a running save for versionId ${versionId}`
      );
      return this.saveSequentializer.running;
    }
    if (!options.force && !this.dirty) {
      this.trace(
        `doSave(${versionId}) - exit - because not dirty and/or versionId is different (this.isDirty: ${this.dirty}, this.versionId: ${this.versionId})`
      );
      return;
    }
    if (this.saveSequentializer.isRunning()) {
      this.trace(`doSave(${versionId}) - exit - because busy saving`);
      this.saveSequentializer.cancelRunning();
      return this.saveSequentializer.queue(() => this.doSave(options));
    }
    if (this.isResolved()) {
      this.textEditorModel.pushStackElement();
    }
    const saveCancellation = new CancellationTokenSource();
    return this.progressService.withProgress(
      {
        title: localize(
          "saveParticipants",
          "Saving '{0}'",
          this.name
        ),
        location: ProgressLocation.Window,
        cancellable: true,
        delay: this.isDirty() ? 3e3 : 5e3
      },
      (progress) => {
        return this.doSaveSequential(
          versionId,
          options,
          progress,
          saveCancellation
        );
      },
      () => {
        saveCancellation.cancel();
      }
    ).finally(() => {
      saveCancellation.dispose();
    });
  }
  doSaveSequential(versionId, options, progress, saveCancellation) {
    return this.saveSequentializer.run(
      versionId,
      (async () => {
        if (this.isResolved() && !options.skipSaveParticipants) {
          try {
            if (options.reason === SaveReason.AUTO && typeof this.lastModelContentChangeFromUndoRedo === "number") {
              const timeFromUndoRedoToSave = Date.now() - this.lastModelContentChangeFromUndoRedo;
              if (timeFromUndoRedoToSave < TextFileEditorModel.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD) {
                await timeout(
                  TextFileEditorModel.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD - timeFromUndoRedoToSave
                );
              }
            }
            if (!saveCancellation.token.isCancellationRequested) {
              this.ignoreSaveFromSaveParticipants = true;
              try {
                await this.textFileService.files.runSaveParticipants(
                  this,
                  {
                    reason: options.reason ?? SaveReason.EXPLICIT,
                    savedFrom: options.from
                  },
                  progress,
                  saveCancellation.token
                );
              } finally {
                this.ignoreSaveFromSaveParticipants = false;
              }
            }
          } catch (error) {
            this.logService.error(
              `[text file model] runSaveParticipants(${versionId}) - resulted in an error: ${error.toString()}`,
              this.resource.toString()
            );
          }
        }
        if (saveCancellation.token.isCancellationRequested) {
          return;
        } else {
          saveCancellation.dispose();
        }
        if (this.isDisposed()) {
          return;
        }
        if (!this.isResolved()) {
          return;
        }
        versionId = this.versionId;
        this.inErrorMode = false;
        progress.report({
          message: localize("saveTextFile", "Writing into file...")
        });
        this.trace(`doSave(${versionId}) - before write()`);
        const lastResolvedFileStat = assertIsDefined(
          this.lastResolvedFileStat
        );
        const resolvedTextFileEditorModel = this;
        return this.saveSequentializer.run(
          versionId,
          (async () => {
            try {
              const stat = await this.textFileService.write(
                lastResolvedFileStat.resource,
                resolvedTextFileEditorModel.createSnapshot(),
                {
                  mtime: lastResolvedFileStat.mtime,
                  encoding: this.getEncoding(),
                  etag: options.ignoreModifiedSince || !this.filesConfigurationService.preventSaveConflicts(
                    lastResolvedFileStat.resource,
                    resolvedTextFileEditorModel.getLanguageId()
                  ) ? ETAG_DISABLED : lastResolvedFileStat.etag,
                  unlock: options.writeUnlock,
                  writeElevated: options.writeElevated
                }
              );
              this.handleSaveSuccess(stat, versionId, options);
            } catch (error) {
              this.handleSaveError(error, versionId, options);
            }
          })()
        );
      })(),
      () => saveCancellation.cancel()
    );
  }
  handleSaveSuccess(stat, versionId, options) {
    this.updateLastResolvedFileStat(stat);
    if (versionId === this.versionId) {
      this.trace(
        `handleSaveSuccess(${versionId}) - setting dirty to false because versionId did not change`
      );
      this.setDirty(false);
    } else {
      this.trace(
        `handleSaveSuccess(${versionId}) - not setting dirty to false because versionId did change meanwhile`
      );
    }
    this.setOrphaned(false);
    this._onDidSave.fire({
      reason: options.reason,
      stat,
      source: options.source
    });
  }
  handleSaveError(error, versionId, options) {
    (options.ignoreErrorHandler ? this.logService.trace : this.logService.error).apply(this.logService, [
      `[text file model] handleSaveError(${versionId}) - exit - resulted in a save error: ${error.toString()}`,
      this.resource.toString()
    ]);
    if (options.ignoreErrorHandler) {
      throw error;
    }
    this.setDirty(true);
    this.inErrorMode = true;
    if (error.fileOperationResult === FileOperationResult.FILE_MODIFIED_SINCE) {
      this.inConflictMode = true;
    }
    this.textFileService.files.saveErrorHandler.onSaveError(
      error,
      this,
      options
    );
    this._onDidSaveError.fire();
  }
  updateSavedVersionId() {
    if (this.isResolved()) {
      this.bufferSavedVersionId = this.textEditorModel.getAlternativeVersionId();
    }
  }
  updateLastResolvedFileStat(newFileStat) {
    const oldReadonly = this.isReadonly();
    if (!this.lastResolvedFileStat) {
      this.lastResolvedFileStat = newFileStat;
    } else if (this.lastResolvedFileStat.mtime <= newFileStat.mtime) {
      this.lastResolvedFileStat = newFileStat;
    } else {
      this.lastResolvedFileStat = {
        ...this.lastResolvedFileStat,
        readonly: newFileStat.readonly,
        locked: newFileStat.locked
      };
    }
    if (this.isReadonly() !== oldReadonly) {
      this._onDidChangeReadonly.fire();
    }
  }
  //#endregion
  hasState(state) {
    switch (state) {
      case TextFileEditorModelState.CONFLICT:
        return this.inConflictMode;
      case TextFileEditorModelState.DIRTY:
        return this.dirty;
      case TextFileEditorModelState.ERROR:
        return this.inErrorMode;
      case TextFileEditorModelState.ORPHAN:
        return this.inOrphanMode;
      case TextFileEditorModelState.PENDING_SAVE:
        return this.saveSequentializer.isRunning();
      case TextFileEditorModelState.SAVED:
        return !this.dirty;
    }
  }
  async joinState(state) {
    return this.saveSequentializer.running;
  }
  getLanguageId() {
    if (this.textEditorModel) {
      return this.textEditorModel.getLanguageId();
    }
    return this.preferredLanguageId;
  }
  //#region Encoding
  async onMaybeShouldChangeEncoding() {
    if (this.hasEncodingSetExplicitly) {
      this.trace(
        "onMaybeShouldChangeEncoding() - ignoring because encoding was set explicitly"
      );
      return;
    }
    if (this.contentEncoding === UTF8_with_bom || this.contentEncoding === UTF16be || this.contentEncoding === UTF16le) {
      this.trace(
        "onMaybeShouldChangeEncoding() - ignoring because content encoding has a BOM"
      );
      return;
    }
    const { encoding } = await this.textFileService.encoding.getPreferredReadEncoding(
      this.resource
    );
    if (typeof encoding !== "string" || !this.isNewEncoding(encoding)) {
      this.trace(
        `onMaybeShouldChangeEncoding() - ignoring because preferred encoding ${encoding} is not new`
      );
      return;
    }
    if (this.isDirty()) {
      this.trace(
        "onMaybeShouldChangeEncoding() - ignoring because model is dirty"
      );
      return;
    }
    this.logService.info(
      `Adjusting encoding based on configured language override to '${encoding}' for ${this.resource.toString(true)}.`
    );
    return this.forceResolveFromFile();
  }
  hasEncodingSetExplicitly = false;
  setEncoding(encoding, mode) {
    this.hasEncodingSetExplicitly = true;
    return this.setEncodingInternal(encoding, mode);
  }
  async setEncodingInternal(encoding, mode) {
    if (mode === EncodingMode.Encode) {
      this.updatePreferredEncoding(encoding);
      if (!this.isDirty()) {
        this.versionId++;
        this.setDirty(true);
      }
      if (!this.inConflictMode) {
        await this.save({
          source: TextFileEditorModel.TEXTFILE_SAVE_ENCODING_SOURCE
        });
      }
    } else {
      if (!this.isNewEncoding(encoding)) {
        return;
      }
      if (this.isDirty() && !this.inConflictMode) {
        await this.save();
      }
      this.updatePreferredEncoding(encoding);
      await this.forceResolveFromFile();
    }
  }
  updatePreferredEncoding(encoding) {
    if (!this.isNewEncoding(encoding)) {
      return;
    }
    this.preferredEncoding = encoding;
    this._onDidChangeEncoding.fire();
  }
  isNewEncoding(encoding) {
    if (this.preferredEncoding === encoding) {
      return false;
    }
    if (!this.preferredEncoding && this.contentEncoding === encoding) {
      return false;
    }
    return true;
  }
  getEncoding() {
    return this.preferredEncoding || this.contentEncoding;
  }
  //#endregion
  trace(msg) {
    this.logService.trace(
      `[text file model] ${msg}`,
      this.resource.toString()
    );
  }
  isResolved() {
    return !!this.textEditorModel;
  }
  isReadonly() {
    return this.filesConfigurationService.isReadonly(
      this.resource,
      this.lastResolvedFileStat
    );
  }
  dispose() {
    this.trace("dispose()");
    this.inConflictMode = false;
    this.inOrphanMode = false;
    this.inErrorMode = false;
    super.dispose();
  }
};
TextFileEditorModel = __decorateClass([
  __decorateParam(3, ILanguageService),
  __decorateParam(4, IModelService),
  __decorateParam(5, IFileService),
  __decorateParam(6, ITextFileService),
  __decorateParam(7, IWorkingCopyBackupService),
  __decorateParam(8, ILogService),
  __decorateParam(9, IWorkingCopyService),
  __decorateParam(10, IFilesConfigurationService),
  __decorateParam(11, ILabelService),
  __decorateParam(12, ILanguageDetectionService),
  __decorateParam(13, IAccessibilityService),
  __decorateParam(14, IPathService),
  __decorateParam(15, IExtensionService),
  __decorateParam(16, IProgressService)
], TextFileEditorModel);
export {
  TextFileEditorModel
};
//# sourceMappingURL=textFileEditorModel.js.map
