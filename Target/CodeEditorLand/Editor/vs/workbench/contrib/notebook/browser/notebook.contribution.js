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
import { Event } from "../../../../base/common/event.js";
import { toFormattedString } from "../../../../base/common/jsonFormatter.js";
import {
  Disposable,
  DisposableStore,
  dispose
} from "../../../../base/common/lifecycle.js";
import { parse } from "../../../../base/common/marshalling.js";
import { Schemas } from "../../../../base/common/network.js";
import { extname, isEqual } from "../../../../base/common/resources.js";
import { assertType } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import {
  ILanguageService
} from "../../../../editor/common/languages/language.js";
import {
  DefaultEndOfLine
} from "../../../../editor/common/model.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import {
  ITextModelService
} from "../../../../editor/common/services/resolverService.js";
import * as nls from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  Extensions
} from "../../../../platform/configuration/common/configurationRegistry.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import {
  Extensions as JSONExtensions
} from "../../../../platform/jsonschemas/common/jsonContributionRegistry.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IUndoRedoService } from "../../../../platform/undoRedo/common/undoRedo.js";
import {
  EditorPaneDescriptor
} from "../../../browser/editor.js";
import {
  Extensions as WorkbenchExtensions,
  WorkbenchPhase,
  registerWorkbenchContribution2
} from "../../../common/contributions.js";
import {
  EditorExtensions
} from "../../../common/editor.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import {
  IWorkingCopyEditorService
} from "../../../services/workingCopy/common/workingCopyEditorService.js";
import { INotebookCellStatusBarService } from "../common/notebookCellStatusBarService.js";
import {
  CellKind,
  CellUri,
  NotebookCellsChangeType,
  NotebookMetadataUri,
  NotebookSetting,
  NotebookWorkingCopyTypeIdentifier
} from "../common/notebookCommon.js";
import { NotebookDiffEditorInput } from "../common/notebookDiffEditorInput.js";
import {
  NotebookEditorInput
} from "../common/notebookEditorInput.js";
import { INotebookEditorModelResolverService } from "../common/notebookEditorModelResolverService.js";
import { NotebookModelResolverServiceImpl } from "../common/notebookEditorModelResolverServiceImpl.js";
import {
  INotebookKernelHistoryService,
  INotebookKernelService
} from "../common/notebookKernelService.js";
import { INotebookRendererMessagingService } from "../common/notebookRendererMessagingService.js";
import { INotebookService } from "../common/notebookService.js";
import { INotebookEditorWorkerService } from "../common/services/notebookWorkerService.js";
import {
  getFormattedOutputJSON,
  getStreamOutputData
} from "./diff/diffElementViewModel.js";
import { NotebookTextDiffEditor } from "./diff/notebookDiffEditor.js";
import { NotebookEditor } from "./notebookEditor.js";
import { NotebookCellStatusBarService } from "./services/notebookCellStatusBarServiceImpl.js";
import { INotebookEditorService } from "./services/notebookEditorService.js";
import { NotebookEditorWidgetService } from "./services/notebookEditorServiceImpl.js";
import { NotebookKernelService } from "./services/notebookKernelServiceImpl.js";
import { NotebookRendererMessagingService } from "./services/notebookRendererMessagingServiceImpl.js";
import { NotebookService } from "./services/notebookServiceImpl.js";
import { NotebookEditorWorkerServiceImpl } from "./services/notebookWorkerServiceImpl.js";
import {
  INotebookCellOutlineDataSourceFactory,
  NotebookCellOutlineDataSourceFactory
} from "./viewModel/notebookOutlineDataSourceFactory.js";
import "./controller/coreActions.js";
import "./controller/insertCellActions.js";
import "./controller/executeActions.js";
import "./controller/sectionActions.js";
import "./controller/layoutActions.js";
import "./controller/editActions.js";
import "./controller/cellOutputActions.js";
import "./controller/apiActions.js";
import "./controller/foldingController.js";
import "./controller/chat/notebook.chat.contribution.js";
import "./contrib/editorHint/emptyCellEditorHint.js";
import "./contrib/clipboard/notebookClipboard.js";
import "./contrib/find/notebookFind.js";
import "./contrib/format/formatting.js";
import "./contrib/saveParticipants/saveParticipants.js";
import "./contrib/gettingStarted/notebookGettingStarted.js";
import "./contrib/layout/layoutActions.js";
import "./contrib/marker/markerProvider.js";
import "./contrib/navigation/arrow.js";
import "./contrib/outline/notebookOutline.js";
import "./contrib/profile/notebookProfile.js";
import "./contrib/cellStatusBar/statusBarProviders.js";
import "./contrib/cellStatusBar/contributedStatusBarItemController.js";
import "./contrib/cellStatusBar/executionStatusBarItemController.js";
import "./contrib/editorStatusBar/editorStatusBar.js";
import "./contrib/undoRedo/notebookUndoRedo.js";
import "./contrib/cellCommands/cellCommands.js";
import "./contrib/viewportWarmup/viewportWarmup.js";
import "./contrib/troubleshoot/layout.js";
import "./contrib/debug/notebookBreakpoints.js";
import "./contrib/debug/notebookCellPausing.js";
import "./contrib/debug/notebookDebugDecorations.js";
import "./contrib/execute/executionEditorProgress.js";
import "./contrib/kernelDetection/notebookKernelDetection.js";
import "./contrib/cellDiagnostics/cellDiagnostics.js";
import "./contrib/multicursor/notebookMulticursor.js";
import "./diff/notebookDiffActions.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { editorOptionsRegistry } from "../../../../editor/common/config/editorOptions.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../editor/common/languages/modesRegistry.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { AccessibleViewRegistry } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import product from "../../../../platform/product/common/product.js";
import { COMMENTEDITOR_DECORATION_KEY } from "../../comments/browser/commentReply.js";
import { DefaultFormatter } from "../../format/browser/formatActionsMultiple.js";
import { getFormattedMetadataJSON } from "../common/model/notebookCellTextModel.js";
import { getFormattedNotebookMetadataJSON } from "../common/model/notebookMetadataTextModel.js";
import { INotebookExecutionService } from "../common/notebookExecutionService.js";
import { INotebookExecutionStateService } from "../common/notebookExecutionStateService.js";
import { INotebookKeymapService } from "../common/notebookKeymapService.js";
import { INotebookLoggingService } from "../common/notebookLoggingService.js";
import { NotebookVariables } from "./contrib/notebookVariables/notebookVariables.js";
import { NotebookMultiTextDiffEditor } from "./diff/notebookMultiDiffEditor.js";
import { NotebookMultiDiffEditorInput } from "./diff/notebookMultiDiffEditorInput.js";
import { NotebookAccessibilityHelp } from "./notebookAccessibilityHelp.js";
import { NotebookAccessibleView } from "./notebookAccessibleView.js";
import { NotebookExecutionService } from "./services/notebookExecutionServiceImpl.js";
import { NotebookExecutionStateService } from "./services/notebookExecutionStateServiceImpl.js";
import { NotebookKernelHistoryService } from "./services/notebookKernelHistoryServiceImpl.js";
import { NotebookKeymapService } from "./services/notebookKeymapServiceImpl.js";
import { NotebookLoggingService } from "./services/notebookLoggingServiceImpl.js";
import {
  INotebookOutlineEntryFactory,
  NotebookOutlineEntryFactory
} from "./viewModel/notebookOutlineEntryFactory.js";
Registry.as(
  EditorExtensions.EditorPane
).registerEditorPane(
  EditorPaneDescriptor.create(
    NotebookEditor,
    NotebookEditor.ID,
    "Notebook Editor"
  ),
  [new SyncDescriptor(NotebookEditorInput)]
);
Registry.as(
  EditorExtensions.EditorPane
).registerEditorPane(
  EditorPaneDescriptor.create(
    NotebookTextDiffEditor,
    NotebookTextDiffEditor.ID,
    "Notebook Diff Editor"
  ),
  [new SyncDescriptor(NotebookDiffEditorInput)]
);
Registry.as(
  EditorExtensions.EditorPane
).registerEditorPane(
  EditorPaneDescriptor.create(
    NotebookMultiTextDiffEditor,
    NotebookMultiTextDiffEditor.ID,
    "Notebook Diff Editor"
  ),
  [new SyncDescriptor(NotebookMultiDiffEditorInput)]
);
let NotebookDiffEditorSerializer = class {
  constructor(_configurationService) {
    this._configurationService = _configurationService;
  }
  static {
    __name(this, "NotebookDiffEditorSerializer");
  }
  canSerialize() {
    return true;
  }
  serialize(input) {
    assertType(input instanceof NotebookDiffEditorInput);
    return JSON.stringify({
      resource: input.resource,
      originalResource: input.original.resource,
      name: input.getName(),
      originalName: input.original.getName(),
      textDiffName: input.getName(),
      viewType: input.viewType
    });
  }
  deserialize(instantiationService, raw) {
    const data = parse(raw);
    if (!data) {
      return void 0;
    }
    const { resource, originalResource, name, viewType } = data;
    if (!data || !URI.isUri(resource) || !URI.isUri(originalResource) || typeof name !== "string" || typeof viewType !== "string") {
      return void 0;
    }
    if (this._configurationService.getValue(
      "notebook.experimental.enableNewDiffEditor"
    )) {
      return NotebookMultiDiffEditorInput.create(
        instantiationService,
        resource,
        name,
        void 0,
        originalResource,
        viewType
      );
    } else {
      return NotebookDiffEditorInput.create(
        instantiationService,
        resource,
        name,
        void 0,
        originalResource,
        viewType
      );
    }
  }
  static canResolveBackup(editorInput, backupResource) {
    return false;
  }
};
NotebookDiffEditorSerializer = __decorateClass([
  __decorateParam(0, IConfigurationService)
], NotebookDiffEditorSerializer);
class NotebookEditorSerializer {
  static {
    __name(this, "NotebookEditorSerializer");
  }
  canSerialize(input) {
    return input.typeId === NotebookEditorInput.ID;
  }
  serialize(input) {
    assertType(input instanceof NotebookEditorInput);
    const data = {
      resource: input.resource,
      preferredResource: input.preferredResource,
      viewType: input.viewType,
      options: input.options
    };
    return JSON.stringify(data);
  }
  deserialize(instantiationService, raw) {
    const data = parse(raw);
    if (!data) {
      return void 0;
    }
    const { resource, preferredResource, viewType, options } = data;
    if (!data || !URI.isUri(resource) || typeof viewType !== "string") {
      return void 0;
    }
    const input = NotebookEditorInput.getOrCreate(
      instantiationService,
      resource,
      preferredResource,
      viewType,
      options
    );
    return input;
  }
}
Registry.as(
  EditorExtensions.EditorFactory
).registerEditorSerializer(NotebookEditorInput.ID, NotebookEditorSerializer);
Registry.as(
  EditorExtensions.EditorFactory
).registerEditorSerializer(
  NotebookDiffEditorInput.ID,
  NotebookDiffEditorSerializer
);
let NotebookContribution = class extends Disposable {
  constructor(undoRedoService, configurationService, codeEditorService) {
    super();
    this.codeEditorService = codeEditorService;
    this.updateCellUndoRedoComparisonKey(configurationService, undoRedoService);
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(NotebookSetting.undoRedoPerCell)) {
        this.updateCellUndoRedoComparisonKey(configurationService, undoRedoService);
      }
    }));
    this.codeEditorService.registerDecorationType("comment-controller", COMMENTEDITOR_DECORATION_KEY, {});
  }
  static {
    __name(this, "NotebookContribution");
  }
  static ID = "workbench.contrib.notebook";
  _uriComparisonKeyComputer;
  // Add or remove the cell undo redo comparison key based on the user setting
  updateCellUndoRedoComparisonKey(configurationService, undoRedoService) {
    const undoRedoPerCell = configurationService.getValue(
      NotebookSetting.undoRedoPerCell
    );
    if (undoRedoPerCell) {
      this._uriComparisonKeyComputer?.dispose();
      this._uriComparisonKeyComputer = void 0;
    } else {
      if (!this._uriComparisonKeyComputer) {
        this._uriComparisonKeyComputer = undoRedoService.registerUriComparisonKeyComputer(
          CellUri.scheme,
          {
            getComparisonKey: /* @__PURE__ */ __name((uri) => {
              if (undoRedoPerCell) {
                return uri.toString();
              }
              return NotebookContribution._getCellUndoRedoComparisonKey(
                uri
              );
            }, "getComparisonKey")
          }
        );
      }
    }
  }
  static _getCellUndoRedoComparisonKey(uri) {
    const data = CellUri.parse(uri);
    if (!data) {
      return uri.toString();
    }
    return data.notebook.toString();
  }
  dispose() {
    super.dispose();
    this._uriComparisonKeyComputer?.dispose();
  }
};
NotebookContribution = __decorateClass([
  __decorateParam(0, IUndoRedoService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ICodeEditorService)
], NotebookContribution);
let CellContentProvider = class {
  constructor(textModelService, _modelService, _languageService, _notebookModelResolverService) {
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._notebookModelResolverService = _notebookModelResolverService;
    this._registration = textModelService.registerTextModelContentProvider(CellUri.scheme, this);
  }
  static {
    __name(this, "CellContentProvider");
  }
  static ID = "workbench.contrib.cellContentProvider";
  _registration;
  dispose() {
    this._registration.dispose();
  }
  async provideTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing) {
      return existing;
    }
    const data = CellUri.parse(resource);
    if (!data) {
      return null;
    }
    const ref = await this._notebookModelResolverService.resolve(
      data.notebook
    );
    let result = null;
    if (!ref.object.isResolved()) {
      return null;
    }
    for (const cell of ref.object.notebook.cells) {
      if (cell.uri.toString() === resource.toString()) {
        const bufferFactory = {
          create: /* @__PURE__ */ __name((defaultEOL) => {
            const newEOL = defaultEOL === DefaultEndOfLine.CRLF ? "\r\n" : "\n";
            cell.textBuffer.setEOL(newEOL);
            return {
              textBuffer: cell.textBuffer,
              disposable: Disposable.None
            };
          }, "create"),
          getFirstLineText: /* @__PURE__ */ __name((limit) => {
            return cell.textBuffer.getLineContent(1).substring(0, limit);
          }, "getFirstLineText")
        };
        const languageId = this._languageService.getLanguageIdByLanguageName(
          cell.language
        );
        const languageSelection = languageId ? this._languageService.createById(languageId) : cell.cellKind === CellKind.Markup ? this._languageService.createById("markdown") : this._languageService.createByFilepathOrFirstLine(
          resource,
          cell.textBuffer.getLineContent(1)
        );
        result = this._modelService.createModel(
          bufferFactory,
          languageSelection,
          resource
        );
        break;
      }
    }
    if (!result) {
      ref.dispose();
      return null;
    }
    const once = Event.any(
      result.onWillDispose,
      ref.object.notebook.onWillDispose
    )(() => {
      once.dispose();
      ref.dispose();
    });
    return result;
  }
};
CellContentProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, INotebookEditorModelResolverService)
], CellContentProvider);
let CellInfoContentProvider = class {
  constructor(textModelService, _modelService, _languageService, _labelService, _notebookModelResolverService) {
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._labelService = _labelService;
    this._notebookModelResolverService = _notebookModelResolverService;
    this._disposables.push(textModelService.registerTextModelContentProvider(Schemas.vscodeNotebookCellMetadata, {
      provideTextContent: this.provideMetadataTextContent.bind(this)
    }));
    this._disposables.push(textModelService.registerTextModelContentProvider(Schemas.vscodeNotebookCellOutput, {
      provideTextContent: this.provideOutputTextContent.bind(this)
    }));
    this._disposables.push(this._labelService.registerFormatter({
      scheme: Schemas.vscodeNotebookCellMetadata,
      formatting: {
        label: "${path} (metadata)",
        separator: "/"
      }
    }));
    this._disposables.push(this._labelService.registerFormatter({
      scheme: Schemas.vscodeNotebookCellOutput,
      formatting: {
        label: "${path} (output)",
        separator: "/"
      }
    }));
  }
  static {
    __name(this, "CellInfoContentProvider");
  }
  static ID = "workbench.contrib.cellInfoContentProvider";
  _disposables = [];
  dispose() {
    dispose(this._disposables);
  }
  async provideMetadataTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing) {
      return existing;
    }
    const data = CellUri.parseCellPropertyUri(
      resource,
      Schemas.vscodeNotebookCellMetadata
    );
    if (!data) {
      return null;
    }
    const ref = await this._notebookModelResolverService.resolve(
      data.notebook
    );
    let result = null;
    const mode = this._languageService.createById("json");
    const disposables = new DisposableStore();
    for (const cell of ref.object.notebook.cells) {
      if (cell.handle === data.handle) {
        const cellIndex = ref.object.notebook.cells.indexOf(cell);
        const metadataSource = getFormattedMetadataJSON(
          ref.object.notebook.transientOptions.transientCellMetadata,
          cell.metadata,
          cell.language
        );
        result = this._modelService.createModel(
          metadataSource,
          mode,
          resource
        );
        this._disposables.push(
          disposables.add(
            ref.object.notebook.onDidChangeContent((e) => {
              if (result && e.rawEvents.some(
                (event) => (event.kind === NotebookCellsChangeType.ChangeCellMetadata || event.kind === NotebookCellsChangeType.ChangeCellLanguage) && event.index === cellIndex
              )) {
                const value = getFormattedMetadataJSON(
                  ref.object.notebook.transientOptions.transientCellMetadata,
                  cell.metadata,
                  cell.language
                );
                if (result.getValue() !== value) {
                  result.setValue(
                    getFormattedMetadataJSON(
                      ref.object.notebook.transientOptions.transientCellMetadata,
                      cell.metadata,
                      cell.language
                    )
                  );
                }
              }
            })
          )
        );
        break;
      }
    }
    if (!result) {
      ref.dispose();
      return null;
    }
    const once = result.onWillDispose(() => {
      disposables.dispose();
      once.dispose();
      ref.dispose();
    });
    return result;
  }
  parseStreamOutput(op) {
    if (!op) {
      return;
    }
    const streamOutputData = getStreamOutputData(op.outputs);
    if (streamOutputData) {
      return {
        content: streamOutputData,
        mode: this._languageService.createById(PLAINTEXT_LANGUAGE_ID)
      };
    }
    return;
  }
  _getResult(data, cell) {
    let result;
    const mode = this._languageService.createById("json");
    const op = cell.outputs.find(
      (op2) => op2.outputId === data.outputId || op2.alternativeOutputId === data.outputId
    );
    const streamOutputData = this.parseStreamOutput(op);
    if (streamOutputData) {
      result = streamOutputData;
      return result;
    }
    const obj = cell.outputs.map((output) => ({
      metadata: output.metadata,
      outputItems: output.outputs.map((opit) => ({
        mimeType: opit.mime,
        data: opit.data.toString()
      }))
    }));
    const outputSource = toFormattedString(obj, {});
    result = {
      content: outputSource,
      mode
    };
    return result;
  }
  async provideOutputsTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing) {
      return existing;
    }
    const data = CellUri.parseCellPropertyUri(
      resource,
      Schemas.vscodeNotebookCellOutput
    );
    if (!data) {
      return null;
    }
    const ref = await this._notebookModelResolverService.resolve(
      data.notebook
    );
    const cell = ref.object.notebook.cells.find(
      (cell2) => cell2.handle === data.handle
    );
    if (!cell) {
      ref.dispose();
      return null;
    }
    const mode = this._languageService.createById("json");
    const model = this._modelService.createModel(
      getFormattedOutputJSON(cell.outputs || []),
      mode,
      resource,
      true
    );
    const cellModelListener = Event.any(
      cell.onDidChangeOutputs ?? Event.None,
      cell.onDidChangeOutputItems ?? Event.None
    )(() => {
      model.setValue(getFormattedOutputJSON(cell.outputs || []));
    });
    const once = model.onWillDispose(() => {
      once.dispose();
      cellModelListener.dispose();
      ref.dispose();
    });
    return model;
  }
  async provideOutputTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing) {
      return existing;
    }
    const data = CellUri.parseCellOutputUri(resource);
    if (!data) {
      return this.provideOutputsTextContent(resource);
    }
    const ref = await this._notebookModelResolverService.resolve(
      data.notebook
    );
    const cell = ref.object.notebook.cells.find(
      (cell2) => !!cell2.outputs.find(
        (op) => op.outputId === data.outputId || op.alternativeOutputId === data.outputId
      )
    );
    if (!cell) {
      ref.dispose();
      return null;
    }
    const result = this._getResult(data, cell);
    if (!result) {
      ref.dispose();
      return null;
    }
    const model = this._modelService.createModel(
      result.content,
      result.mode,
      resource
    );
    const cellModelListener = Event.any(
      cell.onDidChangeOutputs ?? Event.None,
      cell.onDidChangeOutputItems ?? Event.None
    )(() => {
      const newResult = this._getResult(data, cell);
      if (!newResult) {
        return;
      }
      model.setValue(newResult.content);
      model.setLanguage(newResult.mode.languageId);
    });
    const once = model.onWillDispose(() => {
      once.dispose();
      cellModelListener.dispose();
      ref.dispose();
    });
    return model;
  }
};
CellInfoContentProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, INotebookEditorModelResolverService)
], CellInfoContentProvider);
let NotebookMetadataContentProvider = class {
  constructor(textModelService, _modelService, _languageService, _labelService, _notebookModelResolverService) {
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._labelService = _labelService;
    this._notebookModelResolverService = _notebookModelResolverService;
    this._disposables.push(textModelService.registerTextModelContentProvider(Schemas.vscodeNotebookMetadata, {
      provideTextContent: this.provideMetadataTextContent.bind(this)
    }));
    this._disposables.push(this._labelService.registerFormatter({
      scheme: Schemas.vscodeNotebookMetadata,
      formatting: {
        label: "${path} (metadata)",
        separator: "/"
      }
    }));
  }
  static {
    __name(this, "NotebookMetadataContentProvider");
  }
  static ID = "workbench.contrib.notebookMetadataContentProvider";
  _disposables = [];
  dispose() {
    dispose(this._disposables);
  }
  async provideMetadataTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing) {
      return existing;
    }
    const data = NotebookMetadataUri.parse(resource);
    if (!data) {
      return null;
    }
    const ref = await this._notebookModelResolverService.resolve(data);
    let result = null;
    const mode = this._languageService.createById("json");
    const disposables = new DisposableStore();
    const metadataSource = getFormattedNotebookMetadataJSON(
      ref.object.notebook.transientOptions.transientDocumentMetadata,
      ref.object.notebook.metadata
    );
    result = this._modelService.createModel(metadataSource, mode, resource);
    if (!result) {
      ref.dispose();
      return null;
    }
    this._disposables.push(
      disposables.add(
        ref.object.notebook.onDidChangeContent((e) => {
          if (result && e.rawEvents.some(
            (event) => event.kind === NotebookCellsChangeType.ChangeCellContent || event.kind === NotebookCellsChangeType.ChangeDocumentMetadata || event.kind === NotebookCellsChangeType.ModelChange
          )) {
            const value = getFormattedNotebookMetadataJSON(
              ref.object.notebook.transientOptions.transientDocumentMetadata,
              ref.object.notebook.metadata
            );
            if (result.getValue() !== value) {
              result.setValue(value);
            }
          }
        })
      )
    );
    const once = result.onWillDispose(() => {
      disposables.dispose();
      once.dispose();
      ref.dispose();
    });
    return result;
  }
};
NotebookMetadataContentProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, INotebookEditorModelResolverService)
], NotebookMetadataContentProvider);
class RegisterSchemasContribution extends Disposable {
  static {
    __name(this, "RegisterSchemasContribution");
  }
  static ID = "workbench.contrib.registerCellSchemas";
  constructor() {
    super();
    this.registerMetadataSchemas();
  }
  registerMetadataSchemas() {
    const jsonRegistry = Registry.as(
      JSONExtensions.JSONContribution
    );
    const metadataSchema = {
      properties: {
        ["language"]: {
          type: "string",
          description: "The language for the cell"
        }
      },
      // patternProperties: allSettings.patternProperties,
      additionalProperties: true,
      allowTrailingCommas: true,
      allowComments: true
    };
    jsonRegistry.registerSchema(
      "vscode://schemas/notebook/cellmetadata",
      metadataSchema
    );
  }
}
let NotebookEditorManager = class {
  constructor(_editorService, _notebookEditorModelService, editorGroups) {
    this._editorService = _editorService;
    this._notebookEditorModelService = _notebookEditorModelService;
    this._disposables.add(Event.debounce(
      this._notebookEditorModelService.onDidChangeDirty,
      (last, current) => last ? [...last, current] : [current],
      100
    )(this._openMissingDirtyNotebookEditors, this));
    this._disposables.add(_notebookEditorModelService.onWillFailWithConflict((e) => {
      for (const group of editorGroups.groups) {
        const conflictInputs = group.editors.filter((input) => input instanceof NotebookEditorInput && input.viewType !== e.viewType && isEqual(input.resource, e.resource));
        const p = group.closeEditors(conflictInputs);
        e.waitUntil(p);
      }
    }));
  }
  static {
    __name(this, "NotebookEditorManager");
  }
  static ID = "workbench.contrib.notebookEditorManager";
  _disposables = new DisposableStore();
  dispose() {
    this._disposables.dispose();
  }
  _openMissingDirtyNotebookEditors(models) {
    const result = [];
    for (const model of models) {
      if (model.isDirty() && !this._editorService.isOpened({
        resource: model.resource,
        typeId: NotebookEditorInput.ID,
        editorId: model.viewType
      }) && extname(model.resource) !== ".interactive") {
        result.push({
          resource: model.resource,
          options: {
            inactive: true,
            preserveFocus: true,
            pinned: true,
            override: model.viewType
          }
        });
      }
    }
    if (result.length > 0) {
      this._editorService.openEditors(result);
    }
  }
};
NotebookEditorManager = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, INotebookEditorModelResolverService),
  __decorateParam(2, IEditorGroupsService)
], NotebookEditorManager);
let SimpleNotebookWorkingCopyEditorHandler = class extends Disposable {
  constructor(_instantiationService, _workingCopyEditorService, _extensionService, _notebookService) {
    super();
    this._instantiationService = _instantiationService;
    this._workingCopyEditorService = _workingCopyEditorService;
    this._extensionService = _extensionService;
    this._notebookService = _notebookService;
    this._installHandler();
  }
  static {
    __name(this, "SimpleNotebookWorkingCopyEditorHandler");
  }
  static ID = "workbench.contrib.simpleNotebookWorkingCopyEditorHandler";
  async handles(workingCopy) {
    const viewType = this.handlesSync(workingCopy);
    if (!viewType) {
      return false;
    }
    return this._notebookService.canResolve(viewType);
  }
  handlesSync(workingCopy) {
    const viewType = this._getViewType(workingCopy);
    if (!viewType || viewType === "interactive" || extname(workingCopy.resource) === ".replNotebook") {
      return void 0;
    }
    return viewType;
  }
  isOpen(workingCopy, editor) {
    if (!this.handlesSync(workingCopy)) {
      return false;
    }
    return editor instanceof NotebookEditorInput && editor.viewType === this._getViewType(workingCopy) && isEqual(workingCopy.resource, editor.resource);
  }
  createEditor(workingCopy) {
    return NotebookEditorInput.getOrCreate(
      this._instantiationService,
      workingCopy.resource,
      void 0,
      this._getViewType(workingCopy)
    );
  }
  async _installHandler() {
    await this._extensionService.whenInstalledExtensionsRegistered();
    this._register(this._workingCopyEditorService.registerHandler(this));
  }
  _getViewType(workingCopy) {
    return NotebookWorkingCopyTypeIdentifier.parse(workingCopy.typeId);
  }
};
SimpleNotebookWorkingCopyEditorHandler = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IWorkingCopyEditorService),
  __decorateParam(2, IExtensionService),
  __decorateParam(3, INotebookService)
], SimpleNotebookWorkingCopyEditorHandler);
let NotebookLanguageSelectorScoreRefine = class {
  constructor(_notebookService, languageFeaturesService) {
    this._notebookService = _notebookService;
    languageFeaturesService.setNotebookTypeResolver(this._getNotebookInfo.bind(this));
  }
  static {
    __name(this, "NotebookLanguageSelectorScoreRefine");
  }
  static ID = "workbench.contrib.notebookLanguageSelectorScoreRefine";
  _getNotebookInfo(uri) {
    const cellUri = CellUri.parse(uri);
    if (!cellUri) {
      return void 0;
    }
    const notebook = this._notebookService.getNotebookTextModel(
      cellUri.notebook
    );
    if (!notebook) {
      return void 0;
    }
    return {
      uri: notebook.uri,
      type: notebook.viewType
    };
  }
};
NotebookLanguageSelectorScoreRefine = __decorateClass([
  __decorateParam(0, INotebookService),
  __decorateParam(1, ILanguageFeaturesService)
], NotebookLanguageSelectorScoreRefine);
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
registerWorkbenchContribution2(
  NotebookContribution.ID,
  NotebookContribution,
  WorkbenchPhase.BlockStartup
);
registerWorkbenchContribution2(
  CellContentProvider.ID,
  CellContentProvider,
  WorkbenchPhase.BlockStartup
);
registerWorkbenchContribution2(
  CellInfoContentProvider.ID,
  CellInfoContentProvider,
  WorkbenchPhase.BlockStartup
);
registerWorkbenchContribution2(
  NotebookMetadataContentProvider.ID,
  NotebookMetadataContentProvider,
  WorkbenchPhase.BlockStartup
);
registerWorkbenchContribution2(
  RegisterSchemasContribution.ID,
  RegisterSchemasContribution,
  WorkbenchPhase.BlockStartup
);
registerWorkbenchContribution2(
  NotebookEditorManager.ID,
  NotebookEditorManager,
  WorkbenchPhase.BlockRestore
);
registerWorkbenchContribution2(
  NotebookLanguageSelectorScoreRefine.ID,
  NotebookLanguageSelectorScoreRefine,
  WorkbenchPhase.BlockRestore
);
registerWorkbenchContribution2(
  SimpleNotebookWorkingCopyEditorHandler.ID,
  SimpleNotebookWorkingCopyEditorHandler,
  WorkbenchPhase.BlockRestore
);
workbenchContributionsRegistry.registerWorkbenchContribution(
  NotebookVariables,
  LifecyclePhase.Eventually
);
AccessibleViewRegistry.register(new NotebookAccessibleView());
AccessibleViewRegistry.register(new NotebookAccessibilityHelp());
registerSingleton(INotebookService, NotebookService, InstantiationType.Delayed);
registerSingleton(
  INotebookEditorWorkerService,
  NotebookEditorWorkerServiceImpl,
  InstantiationType.Delayed
);
registerSingleton(
  INotebookEditorModelResolverService,
  NotebookModelResolverServiceImpl,
  InstantiationType.Delayed
);
registerSingleton(
  INotebookCellStatusBarService,
  NotebookCellStatusBarService,
  InstantiationType.Delayed
);
registerSingleton(
  INotebookEditorService,
  NotebookEditorWidgetService,
  InstantiationType.Delayed
);
registerSingleton(
  INotebookKernelService,
  NotebookKernelService,
  InstantiationType.Delayed
);
registerSingleton(
  INotebookKernelHistoryService,
  NotebookKernelHistoryService,
  InstantiationType.Delayed
);
registerSingleton(
  INotebookExecutionService,
  NotebookExecutionService,
  InstantiationType.Delayed
);
registerSingleton(
  INotebookExecutionStateService,
  NotebookExecutionStateService,
  InstantiationType.Delayed
);
registerSingleton(
  INotebookRendererMessagingService,
  NotebookRendererMessagingService,
  InstantiationType.Delayed
);
registerSingleton(
  INotebookKeymapService,
  NotebookKeymapService,
  InstantiationType.Delayed
);
registerSingleton(
  INotebookLoggingService,
  NotebookLoggingService,
  InstantiationType.Delayed
);
registerSingleton(
  INotebookCellOutlineDataSourceFactory,
  NotebookCellOutlineDataSourceFactory,
  InstantiationType.Delayed
);
registerSingleton(
  INotebookOutlineEntryFactory,
  NotebookOutlineEntryFactory,
  InstantiationType.Delayed
);
const schemas = {};
function isConfigurationPropertySchema(x) {
  return typeof x.type !== "undefined" || typeof x.anyOf !== "undefined";
}
__name(isConfigurationPropertySchema, "isConfigurationPropertySchema");
for (const editorOption of editorOptionsRegistry) {
  const schema = editorOption.schema;
  if (schema) {
    if (isConfigurationPropertySchema(schema)) {
      schemas[`editor.${editorOption.name}`] = schema;
    } else {
      for (const key in schema) {
        if (Object.hasOwnProperty.call(schema, key)) {
          schemas[key] = schema[key];
        }
      }
    }
  }
}
const editorOptionsCustomizationSchema = {
  description: nls.localize(
    "notebook.editorOptions.experimentalCustomization",
    "Settings for code editors used in notebooks. This can be used to customize most editor.* settings."
  ),
  default: {},
  allOf: [
    {
      properties: schemas
    }
    // , {
    // 	patternProperties: {
    // 		'^\\[.*\\]$': {
    // 			type: 'object',
    // 			default: {},
    // 			properties: schemas
    // 		}
    // 	}
    // }
  ],
  tags: ["notebookLayout"]
};
const configurationRegistry = Registry.as(
  Extensions.Configuration
);
configurationRegistry.registerConfiguration({
  id: "notebook",
  order: 100,
  title: nls.localize("notebookConfigurationTitle", "Notebook"),
  type: "object",
  properties: {
    [NotebookSetting.displayOrder]: {
      description: nls.localize(
        "notebook.displayOrder.description",
        "Priority list for output mime types"
      ),
      type: "array",
      items: {
        type: "string"
      },
      default: []
    },
    [NotebookSetting.cellToolbarLocation]: {
      description: nls.localize(
        "notebook.cellToolbarLocation.description",
        "Where the cell toolbar should be shown, or whether it should be hidden."
      ),
      type: "object",
      additionalProperties: {
        markdownDescription: nls.localize(
          "notebook.cellToolbarLocation.viewType",
          "Configure the cell toolbar position for for specific file types"
        ),
        type: "string",
        enum: ["left", "right", "hidden"]
      },
      default: {
        default: "right"
      },
      tags: ["notebookLayout"]
    },
    [NotebookSetting.showCellStatusBar]: {
      description: nls.localize(
        "notebook.showCellStatusbar.description",
        "Whether the cell status bar should be shown."
      ),
      type: "string",
      enum: ["hidden", "visible", "visibleAfterExecute"],
      enumDescriptions: [
        nls.localize(
          "notebook.showCellStatusbar.hidden.description",
          "The cell Status bar is always hidden."
        ),
        nls.localize(
          "notebook.showCellStatusbar.visible.description",
          "The cell Status bar is always visible."
        ),
        nls.localize(
          "notebook.showCellStatusbar.visibleAfterExecute.description",
          "The cell Status bar is hidden until the cell has executed. Then it becomes visible to show the execution status."
        )
      ],
      default: "visible",
      tags: ["notebookLayout"]
    },
    [NotebookSetting.textDiffEditorPreview]: {
      description: nls.localize(
        "notebook.diff.enablePreview.description",
        "Whether to use the enhanced text diff editor for notebook."
      ),
      type: "boolean",
      default: true,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.diffOverviewRuler]: {
      description: nls.localize(
        "notebook.diff.enableOverviewRuler.description",
        "Whether to render the overview ruler in the diff editor for notebook."
      ),
      type: "boolean",
      default: false,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.cellToolbarVisibility]: {
      markdownDescription: nls.localize(
        "notebook.cellToolbarVisibility.description",
        "Whether the cell toolbar should appear on hover or click."
      ),
      type: "string",
      enum: ["hover", "click"],
      default: "click",
      tags: ["notebookLayout"]
    },
    [NotebookSetting.undoRedoPerCell]: {
      description: nls.localize(
        "notebook.undoRedoPerCell.description",
        "Whether to use separate undo/redo stack for each cell."
      ),
      type: "boolean",
      default: true,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.compactView]: {
      description: nls.localize(
        "notebook.compactView.description",
        "Control whether the notebook editor should be rendered in a compact form. For example, when turned on, it will decrease the left margin width."
      ),
      type: "boolean",
      default: true,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.focusIndicator]: {
      description: nls.localize(
        "notebook.focusIndicator.description",
        "Controls where the focus indicator is rendered, either along the cell borders or on the left gutter."
      ),
      type: "string",
      enum: ["border", "gutter"],
      default: "gutter",
      tags: ["notebookLayout"]
    },
    [NotebookSetting.insertToolbarLocation]: {
      description: nls.localize(
        "notebook.insertToolbarPosition.description",
        "Control where the insert cell actions should appear."
      ),
      type: "string",
      enum: ["betweenCells", "notebookToolbar", "both", "hidden"],
      enumDescriptions: [
        nls.localize(
          "insertToolbarLocation.betweenCells",
          "A toolbar that appears on hover between cells."
        ),
        nls.localize(
          "insertToolbarLocation.notebookToolbar",
          "The toolbar at the top of the notebook editor."
        ),
        nls.localize("insertToolbarLocation.both", "Both toolbars."),
        nls.localize(
          "insertToolbarLocation.hidden",
          "The insert actions don't appear anywhere."
        )
      ],
      default: "both",
      tags: ["notebookLayout"]
    },
    [NotebookSetting.globalToolbar]: {
      description: nls.localize(
        "notebook.globalToolbar.description",
        "Control whether to render a global toolbar inside the notebook editor."
      ),
      type: "boolean",
      default: true,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.stickyScrollEnabled]: {
      description: nls.localize(
        "notebook.stickyScrollEnabled.description",
        "Experimental. Control whether to render notebook Sticky Scroll headers in the notebook editor."
      ),
      type: "boolean",
      default: false,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.stickyScrollMode]: {
      description: nls.localize(
        "notebook.stickyScrollMode.description",
        "Control whether nested sticky lines appear to stack flat or indented."
      ),
      type: "string",
      enum: ["flat", "indented"],
      enumDescriptions: [
        nls.localize(
          "notebook.stickyScrollMode.flat",
          "Nested sticky lines appear flat."
        ),
        nls.localize(
          "notebook.stickyScrollMode.indented",
          "Nested sticky lines appear indented."
        )
      ],
      default: "indented",
      tags: ["notebookLayout"]
    },
    [NotebookSetting.consolidatedOutputButton]: {
      description: nls.localize(
        "notebook.consolidatedOutputButton.description",
        "Control whether outputs action should be rendered in the output toolbar."
      ),
      type: "boolean",
      default: true,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.showFoldingControls]: {
      description: nls.localize(
        "notebook.showFoldingControls.description",
        "Controls when the Markdown header folding arrow is shown."
      ),
      type: "string",
      enum: ["always", "never", "mouseover"],
      enumDescriptions: [
        nls.localize(
          "showFoldingControls.always",
          "The folding controls are always visible."
        ),
        nls.localize(
          "showFoldingControls.never",
          "Never show the folding controls and reduce the gutter size."
        ),
        nls.localize(
          "showFoldingControls.mouseover",
          "The folding controls are visible only on mouseover."
        )
      ],
      default: "mouseover",
      tags: ["notebookLayout"]
    },
    [NotebookSetting.dragAndDropEnabled]: {
      description: nls.localize(
        "notebook.dragAndDrop.description",
        "Control whether the notebook editor should allow moving cells through drag and drop."
      ),
      type: "boolean",
      default: true,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.consolidatedRunButton]: {
      description: nls.localize(
        "notebook.consolidatedRunButton.description",
        "Control whether extra actions are shown in a dropdown next to the run button."
      ),
      type: "boolean",
      default: false,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.globalToolbarShowLabel]: {
      description: nls.localize(
        "notebook.globalToolbarShowLabel",
        "Control whether the actions on the notebook toolbar should render label or not."
      ),
      type: "string",
      enum: ["always", "never", "dynamic"],
      default: "always",
      tags: ["notebookLayout"]
    },
    [NotebookSetting.textOutputLineLimit]: {
      markdownDescription: nls.localize(
        "notebook.textOutputLineLimit",
        "Controls how many lines of text are displayed in a text output. If {0} is enabled, this setting is used to determine the scroll height of the output.",
        "`#notebook.output.scrolling#`"
      ),
      type: "number",
      default: 30,
      tags: ["notebookLayout", "notebookOutputLayout"],
      minimum: 1
    },
    [NotebookSetting.LinkifyOutputFilePaths]: {
      description: nls.localize(
        "notebook.disableOutputFilePathLinks",
        "Control whether to disable filepath links in the output of notebook cells."
      ),
      type: "boolean",
      default: true,
      tags: ["notebookOutputLayout"]
    },
    [NotebookSetting.minimalErrorRendering]: {
      description: nls.localize(
        "notebook.minimalErrorRendering",
        "Control whether to render error output in a minimal style."
      ),
      type: "boolean",
      default: false,
      tags: ["notebookOutputLayout"]
    },
    [NotebookSetting.markupFontSize]: {
      markdownDescription: nls.localize(
        "notebook.markup.fontSize",
        "Controls the font size in pixels of rendered markup in notebooks. When set to {0}, 120% of {1} is used.",
        "`0`",
        "`#editor.fontSize#`"
      ),
      type: "number",
      default: 0,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.markdownLineHeight]: {
      markdownDescription: nls.localize(
        "notebook.markdown.lineHeight",
        "Controls the line height in pixels of markdown cells in notebooks. When set to {0}, {1} will be used",
        "`0`",
        "`normal`"
      ),
      type: "number",
      default: 0,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.cellEditorOptionsCustomizations]: editorOptionsCustomizationSchema,
    [NotebookSetting.interactiveWindowCollapseCodeCells]: {
      markdownDescription: nls.localize(
        "notebook.interactiveWindow.collapseCodeCells",
        "Controls whether code cells in the interactive window are collapsed by default."
      ),
      type: "string",
      enum: ["always", "never", "fromEditor"],
      default: "fromEditor"
    },
    [NotebookSetting.outputLineHeight]: {
      markdownDescription: nls.localize(
        "notebook.outputLineHeight",
        "Line height of the output text within notebook cells.\n - When set to 0, editor line height is used.\n - Values between 0 and 8 will be used as a multiplier with the font size.\n - Values greater than or equal to 8 will be used as effective values."
      ),
      type: "number",
      default: 0,
      tags: ["notebookLayout", "notebookOutputLayout"]
    },
    [NotebookSetting.outputFontSize]: {
      markdownDescription: nls.localize(
        "notebook.outputFontSize",
        "Font size for the output text within notebook cells. When set to 0, {0} is used.",
        "`#editor.fontSize#`"
      ),
      type: "number",
      default: 0,
      tags: ["notebookLayout", "notebookOutputLayout"]
    },
    [NotebookSetting.outputFontFamily]: {
      markdownDescription: nls.localize(
        "notebook.outputFontFamily",
        "The font family of the output text within notebook cells. When set to empty, the {0} is used.",
        "`#editor.fontFamily#`"
      ),
      type: "string",
      tags: ["notebookLayout", "notebookOutputLayout"]
    },
    [NotebookSetting.outputScrolling]: {
      markdownDescription: nls.localize(
        "notebook.outputScrolling",
        "Initially render notebook outputs in a scrollable region when longer than the limit."
      ),
      type: "boolean",
      tags: ["notebookLayout", "notebookOutputLayout"],
      default: typeof product.quality === "string" && product.quality !== "stable"
      // only enable as default in insiders
    },
    [NotebookSetting.outputWordWrap]: {
      markdownDescription: nls.localize(
        "notebook.outputWordWrap",
        "Controls whether the lines in output should wrap."
      ),
      type: "boolean",
      tags: ["notebookLayout", "notebookOutputLayout"],
      default: false
    },
    [NotebookSetting.defaultFormatter]: {
      description: nls.localize(
        "notebookFormatter.default",
        "Defines a default notebook formatter which takes precedence over all other formatter settings. Must be the identifier of an extension contributing a formatter."
      ),
      type: ["string", "null"],
      default: null,
      enum: DefaultFormatter.extensionIds,
      enumItemLabels: DefaultFormatter.extensionItemLabels,
      markdownEnumDescriptions: DefaultFormatter.extensionDescriptions
    },
    [NotebookSetting.formatOnSave]: {
      markdownDescription: nls.localize(
        "notebook.formatOnSave",
        "Format a notebook on save. A formatter must be available, the file must not be saved after delay, and the editor must not be shutting down."
      ),
      type: "boolean",
      tags: ["notebookLayout"],
      default: false
    },
    [NotebookSetting.insertFinalNewline]: {
      markdownDescription: nls.localize(
        "notebook.insertFinalNewline",
        "When enabled, insert a final new line into the end of code cells when saving a notebook."
      ),
      type: "boolean",
      tags: ["notebookLayout"],
      default: false
    },
    [NotebookSetting.formatOnCellExecution]: {
      markdownDescription: nls.localize(
        "notebook.formatOnCellExecution",
        "Format a notebook cell upon execution. A formatter must be available."
      ),
      type: "boolean",
      default: false
    },
    [NotebookSetting.confirmDeleteRunningCell]: {
      markdownDescription: nls.localize(
        "notebook.confirmDeleteRunningCell",
        "Control whether a confirmation prompt is required to delete a running cell."
      ),
      type: "boolean",
      default: true
    },
    [NotebookSetting.findFilters]: {
      markdownDescription: nls.localize(
        "notebook.findFilters",
        "Customize the Find Widget behavior for searching within notebook cells. When both markup source and markup preview are enabled, the Find Widget will search either the source code or preview based on the current state of the cell."
      ),
      type: "object",
      properties: {
        markupSource: {
          type: "boolean",
          default: true
        },
        markupPreview: {
          type: "boolean",
          default: true
        },
        codeSource: {
          type: "boolean",
          default: true
        },
        codeOutput: {
          type: "boolean",
          default: true
        }
      },
      default: {
        markupSource: true,
        markupPreview: true,
        codeSource: true,
        codeOutput: true
      },
      tags: ["notebookLayout"]
    },
    [NotebookSetting.remoteSaving]: {
      markdownDescription: nls.localize(
        "notebook.remoteSaving",
        "Enables the incremental saving of notebooks between processes and across Remote connections. When enabled, only the changes to the notebook are sent to the extension host, improving performance for large notebooks and slow network connections."
      ),
      type: "boolean",
      default: typeof product.quality === "string" && product.quality !== "stable",
      // only enable as default in insiders
      tags: ["experimental"]
    },
    [NotebookSetting.scrollToRevealCell]: {
      markdownDescription: nls.localize(
        "notebook.scrolling.revealNextCellOnExecute.description",
        "How far to scroll when revealing the next cell upon running {0}.",
        "notebook.cell.executeAndSelectBelow"
      ),
      type: "string",
      enum: ["fullCell", "firstLine", "none"],
      markdownEnumDescriptions: [
        nls.localize(
          "notebook.scrolling.revealNextCellOnExecute.fullCell.description",
          "Scroll to fully reveal the next cell."
        ),
        nls.localize(
          "notebook.scrolling.revealNextCellOnExecute.firstLine.description",
          "Scroll to reveal the first line of the next cell."
        ),
        nls.localize(
          "notebook.scrolling.revealNextCellOnExecute.none.description",
          "Do not scroll."
        )
      ],
      default: "fullCell"
    },
    [NotebookSetting.cellGenerate]: {
      markdownDescription: nls.localize(
        "notebook.cellGenerate",
        "Enable experimental generate action to create code cell with inline chat enabled."
      ),
      type: "boolean",
      default: typeof product.quality === "string" && product.quality !== "stable",
      tags: ["experimental"]
    },
    [NotebookSetting.notebookVariablesView]: {
      markdownDescription: nls.localize(
        "notebook.VariablesView.description",
        "Enable the experimental notebook variables view within the debug panel."
      ),
      type: "boolean",
      default: false
    },
    [NotebookSetting.cellFailureDiagnostics]: {
      markdownDescription: nls.localize(
        "notebook.cellFailureDiagnostics",
        "Show available diagnostics for cell failures."
      ),
      type: "boolean",
      default: true
    },
    [NotebookSetting.outputBackupSizeLimit]: {
      markdownDescription: nls.localize(
        "notebook.backup.sizeLimit",
        "The limit of notebook output size in kilobytes (KB) where notebook files will no longer be backed up for hot reload. Use 0 for unlimited."
      ),
      type: "number",
      default: 1e4
    }
  }
});
export {
  NotebookContribution
};
//# sourceMappingURL=notebook.contribution.js.map
