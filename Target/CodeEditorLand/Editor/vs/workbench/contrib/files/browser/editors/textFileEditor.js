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
import { toAction } from "../../../../../base/common/actions.js";
import { mark } from "../../../../../base/common/performance.js";
import { assertIsDefined } from "../../../../../base/common/types.js";
import {
  ScrollType
} from "../../../../../editor/common/editorCommon.js";
import { ITextResourceConfigurationService } from "../../../../../editor/common/services/textResourceConfiguration.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import {
  EditorActivation
} from "../../../../../platform/editor/common/editor.js";
import {
  ByteSize,
  FileOperation,
  FileOperationError,
  FileOperationResult,
  IFileService,
  TooLargeFileOperationError
} from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { IUriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentity.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { AbstractTextCodeEditor } from "../../../../browser/parts/editor/textCodeEditor.js";
import {
  DEFAULT_EDITOR_ASSOCIATION,
  createEditorOpenError,
  createTooLargeFileError,
  isTextEditorViewState
} from "../../../../common/editor.js";
import { BinaryEditorModel } from "../../../../common/editor/binaryEditorModel.js";
import { applyTextEditorOptions } from "../../../../common/editor/editorOptions.js";
import { ViewContainerLocation } from "../../../../common/views.js";
import {
  IEditorGroupsService
} from "../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IFilesConfigurationService } from "../../../../services/filesConfiguration/common/filesConfigurationService.js";
import { IHostService } from "../../../../services/host/browser/host.js";
import { IPaneCompositePartService } from "../../../../services/panecomposite/browser/panecomposite.js";
import { IPathService } from "../../../../services/path/common/pathService.js";
import { IPreferencesService } from "../../../../services/preferences/common/preferences.js";
import {
  ITextFileService,
  TextFileOperationResult
} from "../../../../services/textfile/common/textfiles.js";
import {
  BINARY_TEXT_FILE_MODE,
  TEXT_FILE_EDITOR_ID,
  VIEWLET_ID
} from "../../common/files.js";
import { IExplorerService } from "../files.js";
import { FileEditorInput } from "./fileEditorInput.js";
let TextFileEditor = class extends AbstractTextCodeEditor {
  constructor(group, telemetryService, fileService, paneCompositeService, instantiationService, contextService, storageService, textResourceConfigurationService, editorService, themeService, editorGroupService, textFileService, explorerService, uriIdentityService, pathService, configurationService, preferencesService, hostService, filesConfigurationService) {
    super(TextFileEditor.ID, group, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService);
    this.paneCompositeService = paneCompositeService;
    this.contextService = contextService;
    this.textFileService = textFileService;
    this.explorerService = explorerService;
    this.uriIdentityService = uriIdentityService;
    this.pathService = pathService;
    this.configurationService = configurationService;
    this.preferencesService = preferencesService;
    this.hostService = hostService;
    this.filesConfigurationService = filesConfigurationService;
    this._register(this.fileService.onDidFilesChange((e) => this.onDidFilesChange(e)));
    this._register(this.fileService.onDidRunOperation((e) => this.onDidRunOperation(e)));
  }
  static ID = TEXT_FILE_EDITOR_ID;
  onDidFilesChange(e) {
    for (const resource of e.rawDeleted) {
      this.clearEditorViewState(resource);
    }
  }
  onDidRunOperation(e) {
    if (e.operation === FileOperation.MOVE && e.target) {
      this.moveEditorViewState(
        e.resource,
        e.target.resource,
        this.uriIdentityService.extUri
      );
    }
  }
  getTitle() {
    if (this.input) {
      return this.input.getName();
    }
    return localize("textFileEditor", "Text File Editor");
  }
  get input() {
    return this._input;
  }
  async setInput(input, options, context, token) {
    mark("code/willSetInputToTextFileEditor");
    await super.setInput(input, options, context, token);
    try {
      const resolvedModel = await input.resolve(options);
      if (token.isCancellationRequested) {
        return;
      }
      if (resolvedModel instanceof BinaryEditorModel) {
        return this.openAsBinary(input, options);
      }
      const textFileModel = resolvedModel;
      const control = assertIsDefined(this.editorControl);
      control.setModel(textFileModel.textEditorModel);
      if (!isTextEditorViewState(options?.viewState)) {
        const editorViewState = this.loadEditorViewState(
          input,
          context
        );
        if (editorViewState) {
          if (options?.selection) {
            editorViewState.cursorState = [];
          }
          control.restoreViewState(editorViewState);
        }
      }
      if (options) {
        applyTextEditorOptions(options, control, ScrollType.Immediate);
      }
      control.updateOptions(
        this.getReadonlyConfiguration(textFileModel.isReadonly())
      );
      if (control.handleInitialized) {
        control.handleInitialized();
      }
    } catch (error) {
      await this.handleSetInputError(error, input, options);
    }
    mark("code/didSetInputToTextFileEditor");
  }
  async handleSetInputError(error, input, options) {
    if (error.textFileOperationResult === TextFileOperationResult.FILE_IS_BINARY) {
      return this.openAsBinary(input, options);
    }
    if (error.fileOperationResult === FileOperationResult.FILE_IS_DIRECTORY) {
      const actions = [];
      actions.push(
        toAction({
          id: "workbench.files.action.openFolder",
          label: localize("openFolder", "Open Folder"),
          run: async () => {
            return this.hostService.openWindow(
              [{ folderUri: input.resource }],
              { forceNewWindow: true }
            );
          }
        })
      );
      if (this.contextService.isInsideWorkspace(input.preferredResource)) {
        actions.push(
          toAction({
            id: "workbench.files.action.reveal",
            label: localize("reveal", "Reveal Folder"),
            run: async () => {
              await this.paneCompositeService.openPaneComposite(
                VIEWLET_ID,
                ViewContainerLocation.Sidebar,
                true
              );
              return this.explorerService.select(
                input.preferredResource,
                true
              );
            }
          })
        );
      }
      throw createEditorOpenError(
        localize(
          "fileIsDirectory",
          "The file is not displayed in the text editor because it is a directory."
        ),
        actions,
        { forceMessage: true }
      );
    }
    if (error.fileOperationResult === FileOperationResult.FILE_TOO_LARGE) {
      let message;
      if (error instanceof TooLargeFileOperationError) {
        message = localize(
          "fileTooLargeForHeapErrorWithSize",
          "The file is not displayed in the text editor because it is very large ({0}).",
          ByteSize.formatSize(error.size)
        );
      } else {
        message = localize(
          "fileTooLargeForHeapErrorWithoutSize",
          "The file is not displayed in the text editor because it is very large."
        );
      }
      throw createTooLargeFileError(
        this.group,
        input,
        options,
        message,
        this.preferencesService
      );
    }
    if (error.fileOperationResult === FileOperationResult.FILE_NOT_FOUND && !this.filesConfigurationService.isReadonly(
      input.preferredResource
    ) && await this.pathService.hasValidBasename(input.preferredResource)) {
      const fileNotFoundError = createEditorOpenError(
        new FileOperationError(
          localize(
            "unavailableResourceErrorEditorText",
            "The editor could not be opened because the file was not found."
          ),
          FileOperationResult.FILE_NOT_FOUND
        ),
        [
          toAction({
            id: "workbench.files.action.createMissingFile",
            label: localize("createFile", "Create File"),
            run: async () => {
              await this.textFileService.create([
                { resource: input.preferredResource }
              ]);
              return this.editorService.openEditor({
                resource: input.preferredResource,
                options: {
                  pinned: true
                  // new file gets pinned by default
                }
              });
            }
          })
        ],
        {
          // Support the flow of directly pressing `Enter` on the dialog to
          // create the file on the go. This is nice when for example following
          // a link to a file that does not exist to scaffold it quickly.
          allowDialog: true
        }
      );
      throw fileNotFoundError;
    }
    throw error;
  }
  openAsBinary(input, options) {
    const defaultBinaryEditor = this.configurationService.getValue("workbench.editor.defaultBinaryEditor");
    const editorOptions = {
      ...options,
      // Make sure to not steal away the currently active group
      // because we are triggering another openEditor() call
      // and do not control the initial intent that resulted
      // in us now opening as binary.
      activation: EditorActivation.PRESERVE
    };
    if (defaultBinaryEditor && defaultBinaryEditor !== "" && defaultBinaryEditor !== DEFAULT_EDITOR_ASSOCIATION.id) {
      this.doOpenAsBinaryInDifferentEditor(
        this.group,
        defaultBinaryEditor,
        input,
        editorOptions
      );
    } else {
      this.doOpenAsBinaryInSameEditor(
        this.group,
        defaultBinaryEditor,
        input,
        editorOptions
      );
    }
  }
  doOpenAsBinaryInDifferentEditor(group, editorId, editor, editorOptions) {
    this.editorService.replaceEditors(
      [
        {
          editor,
          replacement: {
            resource: editor.resource,
            options: { ...editorOptions, override: editorId }
          }
        }
      ],
      group
    );
  }
  doOpenAsBinaryInSameEditor(group, editorId, editor, editorOptions) {
    if (editorId === DEFAULT_EDITOR_ASSOCIATION.id) {
      editor.setForceOpenAsText();
      editor.setPreferredLanguageId(BINARY_TEXT_FILE_MODE);
      editorOptions = { ...editorOptions, forceReload: true };
    } else {
      editor.setForceOpenAsBinary();
    }
    group.openEditor(editor, editorOptions);
  }
  clearInput() {
    super.clearInput();
    this.editorControl?.setModel(null);
  }
  createEditorControl(parent, initialOptions) {
    mark("code/willCreateTextFileEditorControl");
    super.createEditorControl(parent, initialOptions);
    mark("code/didCreateTextFileEditorControl");
  }
  tracksEditorViewState(input) {
    return input instanceof FileEditorInput;
  }
  tracksDisposedEditorViewState() {
    return true;
  }
};
TextFileEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IPaneCompositePartService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, ITextResourceConfigurationService),
  __decorateParam(8, IEditorService),
  __decorateParam(9, IThemeService),
  __decorateParam(10, IEditorGroupsService),
  __decorateParam(11, ITextFileService),
  __decorateParam(12, IExplorerService),
  __decorateParam(13, IUriIdentityService),
  __decorateParam(14, IPathService),
  __decorateParam(15, IConfigurationService),
  __decorateParam(16, IPreferencesService),
  __decorateParam(17, IHostService),
  __decorateParam(18, IFilesConfigurationService)
], TextFileEditor);
export {
  TextFileEditor
};
