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
import * as DOM from "../../../../../base/browser/dom.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { DiffElementCellViewModelBase, getFormattedOutputJSON, OutputComparison, outputEqual, OUTPUT_EDITOR_HEIGHT_MAGIC, PropertyFoldingState, SideBySideDiffElementViewModel, SingleSideDiffElementViewModel, DiffElementPlaceholderViewModel } from "./diffElementViewModel.js";
import { CellDiffSideBySideRenderTemplate, CellDiffSingleSideRenderTemplate, DiffSide, DIFF_CELL_MARGIN, INotebookTextDiffEditor, NOTEBOOK_DIFF_CELL_INPUT, NOTEBOOK_DIFF_CELL_PROPERTY, NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED, CellDiffPlaceholderRenderTemplate, IDiffCellMarginOverlay, NOTEBOOK_DIFF_CELL_IGNORE_WHITESPACE } from "./notebookDiffEditorBrowser.js";
import { CodeEditorWidget, ICodeEditorWidgetOptions } from "../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { CellEditType, CellUri, NotebookCellMetadata } from "../../common/notebookCommon.js";
import { ToolBar } from "../../../../../base/browser/ui/toolbar/toolbar.js";
import { IContextMenuService } from "../../../../../platform/contextview/browser/contextView.js";
import { IMenu, IMenuService, MenuId, MenuItemAction } from "../../../../../platform/actions/common/actions.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { IAction } from "../../../../../base/common/actions.js";
import { createAndFillInActionBarActions } from "../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IContextKey, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { CodiconActionViewItem } from "../view/cellParts/cellActionView.js";
import { collapsedIcon, expandedIcon } from "../notebookIcons.js";
import { OutputContainer } from "./diffElementOutputs.js";
import { EditorExtensionsRegistry } from "../../../../../editor/browser/editorExtensions.js";
import { ContextMenuController } from "../../../../../editor/contrib/contextmenu/browser/contextmenu.js";
import { SnippetController2 } from "../../../../../editor/contrib/snippet/browser/snippetController2.js";
import { SuggestController } from "../../../../../editor/contrib/suggest/browser/suggestController.js";
import { MenuPreventer } from "../../../codeEditor/browser/menuPreventer.js";
import { SelectionClipboardContributionID } from "../../../codeEditor/browser/selectionClipboard.js";
import { TabCompletionController } from "../../../snippets/browser/tabCompletion.js";
import { renderIcon, renderLabelWithIcons } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import * as editorCommon from "../../../../../editor/common/editorCommon.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { WorkbenchToolBar } from "../../../../../platform/actions/browser/toolbar.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { fixedDiffEditorOptions, fixedEditorOptions, getEditorPadding } from "./diffCellEditorOptions.js";
import { AccessibilityVerbositySettingId } from "../../../accessibility/browser/accessibilityConfiguration.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.js";
import { DiffEditorWidget } from "../../../../../editor/browser/widget/diffEditor/diffEditorWidget.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { DiffNestedCellViewModel } from "./diffNestedCellViewModel.js";
import { localize } from "../../../../../nls.js";
import { Emitter } from "../../../../../base/common/event.js";
import { ITextResourceConfigurationService } from "../../../../../editor/common/services/textResourceConfiguration.js";
import { getFormattedMetadataJSON } from "../../common/model/notebookCellTextModel.js";
import { IDiffEditorOptions } from "../../../../../editor/common/config/editorOptions.js";
function getOptimizedNestedCodeEditorWidgetOptions() {
  return {
    isSimpleWidget: false,
    contributions: EditorExtensionsRegistry.getSomeEditorContributions([
      MenuPreventer.ID,
      SelectionClipboardContributionID,
      ContextMenuController.ID,
      SuggestController.ID,
      SnippetController2.ID,
      TabCompletionController.ID
    ])
  };
}
__name(getOptimizedNestedCodeEditorWidgetOptions, "getOptimizedNestedCodeEditorWidgetOptions");
class CellDiffPlaceholderElement extends Disposable {
  static {
    __name(this, "CellDiffPlaceholderElement");
  }
  constructor(placeholder, templateData) {
    super();
    templateData.body.classList.remove("left", "right", "full");
    const text = placeholder.hiddenCells.length === 1 ? localize("hiddenCell", "{0} hidden cell", placeholder.hiddenCells.length) : localize("hiddenCells", "{0} hidden cells", placeholder.hiddenCells.length);
    templateData.placeholder.innerText = text;
    this._register(DOM.addDisposableListener(templateData.placeholder, "dblclick", (e) => {
      if (e.button !== 0) {
        return;
      }
      e.preventDefault();
      placeholder.showHiddenCells();
    }));
    this._register(templateData.marginOverlay.onAction(() => placeholder.showHiddenCells()));
    templateData.marginOverlay.show();
  }
}
let PropertyHeader = class extends Disposable {
  constructor(cell, propertyHeaderContainer, notebookEditor, accessor, contextMenuService, keybindingService, commandService, notificationService, menuService, contextKeyService, themeService, telemetryService, accessibilityService) {
    super();
    this.cell = cell;
    this.propertyHeaderContainer = propertyHeaderContainer;
    this.notebookEditor = notebookEditor;
    this.accessor = accessor;
    this.contextMenuService = contextMenuService;
    this.keybindingService = keybindingService;
    this.commandService = commandService;
    this.notificationService = notificationService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.themeService = themeService;
    this.telemetryService = telemetryService;
    this.accessibilityService = accessibilityService;
  }
  static {
    __name(this, "PropertyHeader");
  }
  _foldingIndicator;
  _statusSpan;
  _description;
  _toolbar;
  _menu;
  _propertyExpanded;
  _propertyChanged;
  buildHeader() {
    this._foldingIndicator = DOM.append(this.propertyHeaderContainer, DOM.$(".property-folding-indicator"));
    this._foldingIndicator.classList.add(this.accessor.prefix);
    const metadataStatus = DOM.append(this.propertyHeaderContainer, DOM.$("div.property-status"));
    this._statusSpan = DOM.append(metadataStatus, DOM.$("span"));
    this._description = DOM.append(metadataStatus, DOM.$("span.property-description"));
    const cellToolbarContainer = DOM.append(this.propertyHeaderContainer, DOM.$("div.property-toolbar"));
    this._toolbar = this._register(new WorkbenchToolBar(cellToolbarContainer, {
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action instanceof MenuItemAction) {
          const item = new CodiconActionViewItem(action, { hoverDelegate: options.hoverDelegate }, this.keybindingService, this.notificationService, this.contextKeyService, this.themeService, this.contextMenuService, this.accessibilityService);
          return item;
        }
        return void 0;
      }, "actionViewItemProvider")
    }, this.menuService, this.contextKeyService, this.contextMenuService, this.keybindingService, this.commandService, this.telemetryService));
    this._toolbar.context = this.cell;
    const scopedContextKeyService = this.contextKeyService.createScoped(cellToolbarContainer);
    this._register(scopedContextKeyService);
    this._propertyChanged = NOTEBOOK_DIFF_CELL_PROPERTY.bindTo(scopedContextKeyService);
    this._propertyExpanded = NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED.bindTo(scopedContextKeyService);
    this._menu = this._register(this.menuService.createMenu(this.accessor.menuId, scopedContextKeyService));
    this._register(this._menu.onDidChange(() => this.updateMenu()));
    this._register(this.notebookEditor.onMouseUp((e) => {
      if (!e.event.target || e.target !== this.cell) {
        return;
      }
      const target = e.event.target;
      if (target === this.propertyHeaderContainer || target === this._foldingIndicator || this._foldingIndicator.contains(target) || target === metadataStatus || metadataStatus.contains(target)) {
        const oldFoldingState = this.accessor.getFoldingState();
        this.accessor.updateFoldingState(oldFoldingState === PropertyFoldingState.Expanded ? PropertyFoldingState.Collapsed : PropertyFoldingState.Expanded);
        this._updateFoldingIcon();
        this.accessor.updateInfoRendering(this.cell.renderOutput);
      }
    }));
    this.refresh();
    this.accessor.updateInfoRendering(this.cell.renderOutput);
  }
  refresh() {
    this.updateMenu();
    this._updateFoldingIcon();
    const metadataChanged = this.accessor.checkIfModified();
    if (this._propertyChanged) {
      this._propertyChanged.set(!!metadataChanged);
    }
    if (metadataChanged) {
      this._statusSpan.textContent = this.accessor.changedLabel;
      this._statusSpan.style.fontWeight = "bold";
      if (metadataChanged.reason) {
        this._description.textContent = metadataChanged.reason;
      }
      this.propertyHeaderContainer.classList.add("modified");
    } else {
      this._statusSpan.textContent = this.accessor.unChangedLabel;
      this._statusSpan.style.fontWeight = "normal";
      this._description.textContent = "";
      this.propertyHeaderContainer.classList.remove("modified");
    }
  }
  updateMenu() {
    const metadataChanged = this.accessor.checkIfModified();
    if (metadataChanged) {
      const actions = [];
      createAndFillInActionBarActions(this._menu, { shouldForwardArgs: true }, actions);
      this._toolbar.setActions(actions);
    } else {
      this._toolbar.setActions([]);
    }
  }
  _updateFoldingIcon() {
    if (this.accessor.getFoldingState() === PropertyFoldingState.Collapsed) {
      DOM.reset(this._foldingIndicator, renderIcon(collapsedIcon));
      this._propertyExpanded?.set(false);
    } else {
      DOM.reset(this._foldingIndicator, renderIcon(expandedIcon));
      this._propertyExpanded?.set(true);
    }
  }
};
PropertyHeader = __decorateClass([
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, IMenuService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IThemeService),
  __decorateParam(11, ITelemetryService),
  __decorateParam(12, IAccessibilityService)
], PropertyHeader);
class AbstractElementRenderer extends Disposable {
  constructor(notebookEditor, cell, templateData, style, instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService, textConfigurationService) {
    super();
    this.notebookEditor = notebookEditor;
    this.cell = cell;
    this.templateData = templateData;
    this.style = style;
    this.instantiationService = instantiationService;
    this.languageService = languageService;
    this.modelService = modelService;
    this.textModelService = textModelService;
    this.contextMenuService = contextMenuService;
    this.keybindingService = keybindingService;
    this.notificationService = notificationService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.textConfigurationService = textConfigurationService;
    this._isDisposed = false;
    this._metadataEditorDisposeStore = this._register(new DisposableStore());
    this._outputEditorDisposeStore = this._register(new DisposableStore());
    this._register(cell.onDidLayoutChange((e) => {
      this.layout(e);
    }));
    this._register(cell.onDidLayoutChange((e) => this.updateBorders()));
    this.init();
    this.buildBody();
    this._register(cell.onDidStateChange(() => {
      this.updateOutputRendering(this.cell.renderOutput);
    }));
  }
  static {
    __name(this, "AbstractElementRenderer");
  }
  _metadataLocalDisposable = this._register(new DisposableStore());
  _outputLocalDisposable = this._register(new DisposableStore());
  _ignoreMetadata = false;
  _ignoreOutputs = false;
  _cellHeaderContainer;
  _editorContainer;
  _cellHeader;
  _metadataHeaderContainer;
  _metadataHeader;
  _metadataInfoContainer;
  _metadataEditorContainer;
  _metadataEditorDisposeStore;
  _metadataEditor;
  _outputHeaderContainer;
  _outputHeader;
  _outputInfoContainer;
  _outputEditorContainer;
  _outputViewContainer;
  _outputLeftContainer;
  _outputRightContainer;
  _outputMetadataContainer;
  _outputEmptyElement;
  _outputLeftView;
  _outputRightView;
  _outputEditorDisposeStore;
  _outputEditor;
  _outputMetadataEditor;
  _diffEditorContainer;
  _diagonalFill;
  _isDisposed;
  buildBody() {
    const body = this.templateData.body;
    this._diffEditorContainer = this.templateData.diffEditorContainer;
    body.classList.remove("left", "right", "full");
    switch (this.style) {
      case "left":
        body.classList.add("left");
        break;
      case "right":
        body.classList.add("right");
        break;
      default:
        body.classList.add("full");
        break;
    }
    this.styleContainer(this._diffEditorContainer);
    this.updateSourceEditor();
    if (this.cell.modified) {
      this._register(this.cell.modified.textModel.onDidChangeContent(() => this._cellHeader.refresh()));
    }
    this._ignoreMetadata = this.configurationService.getValue("notebook.diff.ignoreMetadata");
    if (this._ignoreMetadata) {
      this._disposeMetadata();
    } else {
      this._buildMetadata();
    }
    this._ignoreOutputs = this.configurationService.getValue("notebook.diff.ignoreOutputs") || !!this.notebookEditor.textModel?.transientOptions.transientOutputs;
    if (this._ignoreOutputs) {
      this._disposeOutput();
    } else {
      this._buildOutput();
    }
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      let metadataLayoutChange = false;
      let outputLayoutChange = false;
      if (e.affectsConfiguration("notebook.diff.ignoreMetadata")) {
        const newValue = this.configurationService.getValue("notebook.diff.ignoreMetadata");
        if (newValue !== void 0 && this._ignoreMetadata !== newValue) {
          this._ignoreMetadata = newValue;
          this._metadataLocalDisposable.clear();
          if (this.configurationService.getValue("notebook.diff.ignoreMetadata")) {
            this._disposeMetadata();
          } else {
            this.cell.metadataStatusHeight = 25;
            this._buildMetadata();
            this.updateMetadataRendering();
            metadataLayoutChange = true;
          }
        }
      }
      if (e.affectsConfiguration("notebook.diff.ignoreOutputs")) {
        const newValue = this.configurationService.getValue("notebook.diff.ignoreOutputs");
        if (newValue !== void 0 && this._ignoreOutputs !== (newValue || this.notebookEditor.textModel?.transientOptions.transientOutputs)) {
          this._ignoreOutputs = newValue || !!this.notebookEditor.textModel?.transientOptions.transientOutputs;
          this._outputLocalDisposable.clear();
          if (this._ignoreOutputs) {
            this._disposeOutput();
            this.cell.layoutChange();
          } else {
            this.cell.outputStatusHeight = 25;
            this._buildOutput();
            outputLayoutChange = true;
          }
        }
      }
      if (metadataLayoutChange || outputLayoutChange) {
        this.layout({ metadataHeight: metadataLayoutChange, outputTotalHeight: outputLayoutChange });
      }
    }));
  }
  updateMetadataRendering() {
    if (this.cell.metadataFoldingState === PropertyFoldingState.Expanded) {
      this._metadataInfoContainer.style.display = "block";
      if (!this._metadataEditorContainer || !this._metadataEditor) {
        this._metadataEditorContainer = DOM.append(this._metadataInfoContainer, DOM.$(".metadata-editor-container"));
        this._buildMetadataEditor();
      } else {
        this.cell.metadataHeight = this._metadataEditor.getContentHeight();
      }
    } else {
      this._metadataInfoContainer.style.display = "none";
      this.cell.metadataHeight = 0;
    }
  }
  updateOutputRendering(renderRichOutput) {
    if (this.cell.outputFoldingState === PropertyFoldingState.Expanded) {
      this._outputInfoContainer.style.display = "block";
      if (renderRichOutput) {
        this._hideOutputsRaw();
        this._buildOutputRendererContainer();
        this._showOutputsRenderer();
        this._showOutputsEmptyView();
      } else {
        this._hideOutputsRenderer();
        this._buildOutputRawContainer();
        this._showOutputsRaw();
      }
    } else {
      this._outputInfoContainer.style.display = "none";
      this._hideOutputsRaw();
      this._hideOutputsRenderer();
      this._hideOutputsEmptyView();
    }
  }
  _buildOutputRawContainer() {
    if (!this._outputEditorContainer) {
      this._outputEditorContainer = DOM.append(this._outputInfoContainer, DOM.$(".output-editor-container"));
      this._buildOutputEditor();
    }
  }
  _showOutputsRaw() {
    if (this._outputEditorContainer) {
      this._outputEditorContainer.style.display = "block";
      this.cell.rawOutputHeight = this._outputEditor.getContentHeight();
    }
  }
  _showOutputsEmptyView() {
    this.cell.layoutChange();
  }
  _hideOutputsRaw() {
    if (this._outputEditorContainer) {
      this._outputEditorContainer.style.display = "none";
      this.cell.rawOutputHeight = 0;
    }
  }
  _hideOutputsEmptyView() {
    this.cell.layoutChange();
  }
  _applySanitizedMetadataChanges(currentMetadata, newMetadata) {
    const result = {};
    try {
      const newMetadataObj = JSON.parse(newMetadata);
      const keys = /* @__PURE__ */ new Set([...Object.keys(newMetadataObj)]);
      for (const key of keys) {
        switch (key) {
          case "inputCollapsed":
          case "outputCollapsed":
            if (typeof newMetadataObj[key] === "boolean") {
              result[key] = newMetadataObj[key];
            } else {
              result[key] = currentMetadata[key];
            }
            break;
          default:
            result[key] = newMetadataObj[key];
            break;
        }
      }
      const index = this.notebookEditor.textModel.cells.indexOf(this.cell.modified.textModel);
      if (index < 0) {
        return;
      }
      this.notebookEditor.textModel.applyEdits([
        { editType: CellEditType.Metadata, index, metadata: result }
      ], true, void 0, () => void 0, void 0, true);
    } catch {
    }
  }
  async _buildMetadataEditor() {
    this._metadataEditorDisposeStore.clear();
    if (this.cell instanceof SideBySideDiffElementViewModel) {
      this._metadataEditor = this.instantiationService.createInstance(DiffEditorWidget, this._metadataEditorContainer, {
        ...fixedDiffEditorOptions,
        overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode(),
        readOnly: false,
        originalEditable: false,
        ignoreTrimWhitespace: false,
        automaticLayout: false,
        dimension: {
          height: this.cell.layoutInfo.metadataHeight,
          width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), true, true)
        }
      }, {
        originalEditor: getOptimizedNestedCodeEditorWidgetOptions(),
        modifiedEditor: getOptimizedNestedCodeEditorWidgetOptions()
      });
      if (this.cell.unchangedRegionsService.options.enabled) {
        this._metadataEditor.updateOptions({ hideUnchangedRegions: this.cell.unchangedRegionsService.options });
      }
      this._metadataEditorDisposeStore.add(this.cell.unchangedRegionsService.options.onDidChangeEnablement(() => {
        if (this._metadataEditor) {
          this._metadataEditor.updateOptions({ hideUnchangedRegions: this.cell.unchangedRegionsService.options });
        }
      }));
      this.layout({ metadataHeight: true });
      this._metadataEditorDisposeStore.add(this._metadataEditor);
      this._metadataEditorContainer?.classList.add("diff");
      const [originalMetadataModel, modifiedMetadataModel] = await Promise.all([
        this.textModelService.createModelReference(CellUri.generateCellPropertyUri(this.cell.originalDocument.uri, this.cell.original.handle, Schemas.vscodeNotebookCellMetadata)),
        this.textModelService.createModelReference(CellUri.generateCellPropertyUri(this.cell.modifiedDocument.uri, this.cell.modified.handle, Schemas.vscodeNotebookCellMetadata))
      ]);
      this._metadataEditorDisposeStore.add(originalMetadataModel);
      this._metadataEditorDisposeStore.add(modifiedMetadataModel);
      const vm = this._metadataEditor.createViewModel({
        original: originalMetadataModel.object.textEditorModel,
        modified: modifiedMetadataModel.object.textEditorModel
      });
      await vm.waitForDiff();
      this._metadataEditor.setModel(vm);
      this.cell.metadataHeight = this._metadataEditor.getContentHeight();
      this._metadataEditorDisposeStore.add(this._metadataEditor.onDidContentSizeChange((e) => {
        if (e.contentHeightChanged && this.cell.metadataFoldingState === PropertyFoldingState.Expanded) {
          this.cell.metadataHeight = e.contentHeight;
        }
      }));
      let respondingToContentChange = false;
      this._metadataEditorDisposeStore.add(modifiedMetadataModel.object.textEditorModel.onDidChangeContent(() => {
        respondingToContentChange = true;
        const value = modifiedMetadataModel.object.textEditorModel.getValue();
        this._applySanitizedMetadataChanges(this.cell.modified.metadata, value);
        this._metadataHeader.refresh();
        respondingToContentChange = false;
      }));
      this._metadataEditorDisposeStore.add(this.cell.modified.textModel.onDidChangeMetadata(() => {
        if (respondingToContentChange) {
          return;
        }
        const modifiedMetadataSource = getFormattedMetadataJSON(this.notebookEditor.textModel?.transientOptions.transientCellMetadata, this.cell.modified?.metadata || {}, this.cell.modified?.language);
        modifiedMetadataModel.object.textEditorModel.setValue(modifiedMetadataSource);
      }));
      return;
    } else {
      this._metadataEditor = this.instantiationService.createInstance(CodeEditorWidget, this._metadataEditorContainer, {
        ...fixedEditorOptions,
        dimension: {
          width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, true),
          height: this.cell.layoutInfo.metadataHeight
        },
        overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode(),
        readOnly: false
      }, {});
      this.layout({ metadataHeight: true });
      this._metadataEditorDisposeStore.add(this._metadataEditor);
      const mode = this.languageService.createById("jsonc");
      const originalMetadataSource = getFormattedMetadataJSON(
        this.notebookEditor.textModel?.transientOptions.transientCellMetadata,
        this.cell.type === "insert" ? this.cell.modified.metadata || {} : this.cell.original.metadata || {}
      );
      const uri = this.cell.type === "insert" ? this.cell.modified.uri : this.cell.original.uri;
      const handle = this.cell.type === "insert" ? this.cell.modified.handle : this.cell.original.handle;
      const modelUri = CellUri.generateCellPropertyUri(uri, handle, Schemas.vscodeNotebookCellMetadata);
      const metadataModel = this.modelService.createModel(originalMetadataSource, mode, modelUri, false);
      this._metadataEditor.setModel(metadataModel);
      this._metadataEditorDisposeStore.add(metadataModel);
      this.cell.metadataHeight = this._metadataEditor.getContentHeight();
      this._metadataEditorDisposeStore.add(this._metadataEditor.onDidContentSizeChange((e) => {
        if (e.contentHeightChanged && this.cell.metadataFoldingState === PropertyFoldingState.Expanded) {
          this.cell.metadataHeight = e.contentHeight;
        }
      }));
    }
  }
  _buildOutputEditor() {
    this._outputEditorDisposeStore.clear();
    if ((this.cell.type === "modified" || this.cell.type === "unchanged") && !this.notebookEditor.textModel.transientOptions.transientOutputs) {
      const originalOutputsSource = getFormattedOutputJSON(this.cell.original?.outputs || []);
      const modifiedOutputsSource = getFormattedOutputJSON(this.cell.modified?.outputs || []);
      if (originalOutputsSource !== modifiedOutputsSource) {
        const mode2 = this.languageService.createById("json");
        const originalModel = this.modelService.createModel(originalOutputsSource, mode2, void 0, true);
        const modifiedModel = this.modelService.createModel(modifiedOutputsSource, mode2, void 0, true);
        this._outputEditorDisposeStore.add(originalModel);
        this._outputEditorDisposeStore.add(modifiedModel);
        const lineHeight = this.notebookEditor.getLayoutInfo().fontInfo.lineHeight || 17;
        const lineCount = Math.max(originalModel.getLineCount(), modifiedModel.getLineCount());
        this._outputEditor = this.instantiationService.createInstance(DiffEditorWidget, this._outputEditorContainer, {
          ...fixedDiffEditorOptions,
          overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode(),
          readOnly: true,
          ignoreTrimWhitespace: false,
          automaticLayout: false,
          dimension: {
            height: Math.min(OUTPUT_EDITOR_HEIGHT_MAGIC, this.cell.layoutInfo.rawOutputHeight || lineHeight * lineCount),
            width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, true)
          },
          accessibilityVerbose: this.configurationService.getValue(AccessibilityVerbositySettingId.DiffEditor) ?? false
        }, {
          originalEditor: getOptimizedNestedCodeEditorWidgetOptions(),
          modifiedEditor: getOptimizedNestedCodeEditorWidgetOptions()
        });
        this._outputEditorDisposeStore.add(this._outputEditor);
        this._outputEditorContainer?.classList.add("diff");
        this._outputEditor.setModel({
          original: originalModel,
          modified: modifiedModel
        });
        this._outputEditor.restoreViewState(this.cell.getOutputEditorViewState());
        this.cell.rawOutputHeight = this._outputEditor.getContentHeight();
        this._outputEditorDisposeStore.add(this._outputEditor.onDidContentSizeChange((e) => {
          if (e.contentHeightChanged && this.cell.outputFoldingState === PropertyFoldingState.Expanded) {
            this.cell.rawOutputHeight = e.contentHeight;
          }
        }));
        this._outputEditorDisposeStore.add(this.cell.modified.textModel.onDidChangeOutputs(() => {
          const modifiedOutputsSource2 = getFormattedOutputJSON(this.cell.modified?.outputs || []);
          modifiedModel.setValue(modifiedOutputsSource2);
          this._outputHeader.refresh();
        }));
        return;
      }
    }
    this._outputEditor = this.instantiationService.createInstance(CodeEditorWidget, this._outputEditorContainer, {
      ...fixedEditorOptions,
      dimension: {
        width: Math.min(OUTPUT_EDITOR_HEIGHT_MAGIC, this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, this.cell.type === "unchanged" || this.cell.type === "modified") - 32),
        height: this.cell.layoutInfo.rawOutputHeight
      },
      overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode()
    }, {});
    this._outputEditorDisposeStore.add(this._outputEditor);
    const mode = this.languageService.createById("json");
    const originaloutputSource = getFormattedOutputJSON(
      this.notebookEditor.textModel.transientOptions.transientOutputs ? [] : this.cell.type === "insert" ? this.cell.modified?.outputs || [] : this.cell.original?.outputs || []
    );
    const outputModel = this.modelService.createModel(originaloutputSource, mode, void 0, true);
    this._outputEditorDisposeStore.add(outputModel);
    this._outputEditor.setModel(outputModel);
    this._outputEditor.restoreViewState(this.cell.getOutputEditorViewState());
    this.cell.rawOutputHeight = this._outputEditor.getContentHeight();
    this._outputEditorDisposeStore.add(this._outputEditor.onDidContentSizeChange((e) => {
      if (e.contentHeightChanged && this.cell.outputFoldingState === PropertyFoldingState.Expanded) {
        this.cell.rawOutputHeight = e.contentHeight;
      }
    }));
  }
  layoutNotebookCell() {
    this.notebookEditor.layoutNotebookCell(
      this.cell,
      this.cell.layoutInfo.totalHeight
    );
  }
  updateBorders() {
    this.templateData.leftBorder.style.height = `${this.cell.layoutInfo.totalHeight - 32}px`;
    this.templateData.rightBorder.style.height = `${this.cell.layoutInfo.totalHeight - 32}px`;
    this.templateData.bottomBorder.style.top = `${this.cell.layoutInfo.totalHeight - 32}px`;
  }
  dispose() {
    if (this._outputEditor) {
      this.cell.saveOutputEditorViewState(this._outputEditor.saveViewState());
    }
    if (this._metadataEditor) {
      this.cell.saveMetadataEditorViewState(this._metadataEditor.saveViewState());
    }
    this._metadataEditorDisposeStore.dispose();
    this._outputEditorDisposeStore.dispose();
    this._isDisposed = true;
    super.dispose();
  }
}
class SingleSideDiffElement extends AbstractElementRenderer {
  static {
    __name(this, "SingleSideDiffElement");
  }
  _editor;
  cell;
  templateData;
  constructor(notebookEditor, cell, templateData, style, instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService, textConfigurationService) {
    super(
      notebookEditor,
      cell,
      templateData,
      style,
      instantiationService,
      languageService,
      modelService,
      textModelService,
      contextMenuService,
      keybindingService,
      notificationService,
      menuService,
      contextKeyService,
      configurationService,
      textConfigurationService
    );
    this.cell = cell;
    this.templateData = templateData;
    this.updateBorders();
  }
  init() {
    this._diagonalFill = this.templateData.diagonalFill;
  }
  buildBody() {
    const body = this.templateData.body;
    this._diffEditorContainer = this.templateData.diffEditorContainer;
    body.classList.remove("left", "right", "full");
    switch (this.style) {
      case "left":
        body.classList.add("left");
        break;
      case "right":
        body.classList.add("right");
        break;
      default:
        body.classList.add("full");
        break;
    }
    this.styleContainer(this._diffEditorContainer);
    this.updateSourceEditor();
    if (this.configurationService.getValue("notebook.diff.ignoreMetadata")) {
      this._disposeMetadata();
    } else {
      this._buildMetadata();
    }
    if (this.configurationService.getValue("notebook.diff.ignoreOutputs") || this.notebookEditor.textModel?.transientOptions.transientOutputs) {
      this._disposeOutput();
    } else {
      this._buildOutput();
    }
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      let metadataLayoutChange = false;
      let outputLayoutChange = false;
      if (e.affectsConfiguration("notebook.diff.ignoreMetadata")) {
        this._metadataLocalDisposable.clear();
        if (this.configurationService.getValue("notebook.diff.ignoreMetadata")) {
          this._disposeMetadata();
        } else {
          this.cell.metadataStatusHeight = 25;
          this._buildMetadata();
          this.updateMetadataRendering();
          metadataLayoutChange = true;
        }
      }
      if (e.affectsConfiguration("notebook.diff.ignoreOutputs")) {
        this._outputLocalDisposable.clear();
        if (this.configurationService.getValue("notebook.diff.ignoreOutputs") || this.notebookEditor.textModel?.transientOptions.transientOutputs) {
          this._disposeOutput();
        } else {
          this.cell.outputStatusHeight = 25;
          this._buildOutput();
          outputLayoutChange = true;
        }
      }
      if (metadataLayoutChange || outputLayoutChange) {
        this.layout({ metadataHeight: metadataLayoutChange, outputTotalHeight: outputLayoutChange });
      }
    }));
  }
  updateSourceEditor() {
    this._cellHeaderContainer = this.templateData.cellHeaderContainer;
    this._cellHeaderContainer.style.display = "flex";
    this._cellHeaderContainer.innerText = "";
    this._editorContainer = this.templateData.editorContainer;
    this._editorContainer.classList.add("diff");
    const renderSourceEditor = /* @__PURE__ */ __name(() => {
      if (this.cell.cellFoldingState === PropertyFoldingState.Collapsed) {
        this._editorContainer.style.display = "none";
        this.cell.editorHeight = 0;
        return;
      }
      const lineHeight = this.notebookEditor.getLayoutInfo().fontInfo.lineHeight || 17;
      const editorHeight = this.cell.computeInputEditorHeight(lineHeight);
      this._editorContainer.style.height = `${editorHeight}px`;
      this._editorContainer.style.display = "block";
      if (this._editor) {
        const contentHeight = this._editor.getContentHeight();
        if (contentHeight >= 0) {
          this.cell.editorHeight = contentHeight;
        }
        return;
      }
      this._editor = this.templateData.sourceEditor;
      this._editor.layout(
        {
          width: (this.notebookEditor.getLayoutInfo().width - 2 * DIFF_CELL_MARGIN) / 2 - 18,
          height: editorHeight
        }
      );
      this._editor.updateOptions({ readOnly: this.readonly });
      this.cell.editorHeight = editorHeight;
      this._register(this._editor.onDidContentSizeChange((e) => {
        if (this.cell.cellFoldingState === PropertyFoldingState.Expanded && e.contentHeightChanged && this.cell.layoutInfo.editorHeight !== e.contentHeight) {
          this.cell.editorHeight = e.contentHeight;
        }
      }));
      this._initializeSourceDiffEditor(this.nestedCellViewModel);
    }, "renderSourceEditor");
    this._cellHeader = this._register(this.instantiationService.createInstance(
      PropertyHeader,
      this.cell,
      this._cellHeaderContainer,
      this.notebookEditor,
      {
        updateInfoRendering: /* @__PURE__ */ __name(() => renderSourceEditor(), "updateInfoRendering"),
        checkIfModified: /* @__PURE__ */ __name(() => ({ reason: void 0 }), "checkIfModified"),
        getFoldingState: /* @__PURE__ */ __name(() => this.cell.cellFoldingState, "getFoldingState"),
        updateFoldingState: /* @__PURE__ */ __name((state) => this.cell.cellFoldingState = state, "updateFoldingState"),
        unChangedLabel: "Input",
        changedLabel: "Input",
        prefix: "input",
        menuId: MenuId.NotebookDiffCellInputTitle
      }
    ));
    this._cellHeader.buildHeader();
    renderSourceEditor();
    this._initializeSourceDiffEditor(this.nestedCellViewModel);
  }
  calculateDiagonalFillHeight() {
    return this.cell.layoutInfo.cellStatusHeight + this.cell.layoutInfo.editorHeight + this.cell.layoutInfo.editorMargin + this.cell.layoutInfo.metadataStatusHeight + this.cell.layoutInfo.metadataHeight + this.cell.layoutInfo.outputTotalHeight + this.cell.layoutInfo.outputStatusHeight;
  }
  async _initializeSourceDiffEditor(modifiedCell) {
    const modifiedRef = await this.textModelService.createModelReference(modifiedCell.uri);
    if (this._isDisposed) {
      return;
    }
    const modifiedTextModel = modifiedRef.object.textEditorModel;
    this._register(modifiedRef);
    this._editor.setModel(modifiedTextModel);
    const editorViewState = this.cell.getSourceEditorViewState();
    if (editorViewState) {
      this._editor.restoreViewState(editorViewState);
    }
    const contentHeight = this._editor.getContentHeight();
    this.cell.editorHeight = contentHeight;
    const height = `${this.calculateDiagonalFillHeight()}px`;
    if (this._diagonalFill.style.height !== height) {
      this._diagonalFill.style.height = height;
    }
  }
  _disposeMetadata() {
    this.cell.metadataStatusHeight = 0;
    this.cell.metadataHeight = 0;
    this.templateData.cellHeaderContainer.style.display = "none";
    this.templateData.metadataHeaderContainer.style.display = "none";
    this.templateData.metadataInfoContainer.style.display = "none";
    this._metadataEditor = void 0;
  }
  _buildMetadata() {
    this._metadataHeaderContainer = this.templateData.metadataHeaderContainer;
    this._metadataInfoContainer = this.templateData.metadataInfoContainer;
    this._metadataHeaderContainer.style.display = "flex";
    this._metadataInfoContainer.style.display = "block";
    this._metadataHeaderContainer.innerText = "";
    this._metadataInfoContainer.innerText = "";
    this._metadataHeader = this.instantiationService.createInstance(
      PropertyHeader,
      this.cell,
      this._metadataHeaderContainer,
      this.notebookEditor,
      {
        updateInfoRendering: this.updateMetadataRendering.bind(this),
        checkIfModified: /* @__PURE__ */ __name(() => {
          return this.cell.checkMetadataIfModified();
        }, "checkIfModified"),
        getFoldingState: /* @__PURE__ */ __name(() => {
          return this.cell.metadataFoldingState;
        }, "getFoldingState"),
        updateFoldingState: /* @__PURE__ */ __name((state) => {
          this.cell.metadataFoldingState = state;
        }, "updateFoldingState"),
        unChangedLabel: "Metadata",
        changedLabel: "Metadata changed",
        prefix: "metadata",
        menuId: MenuId.NotebookDiffCellMetadataTitle
      }
    );
    this._metadataLocalDisposable.add(this._metadataHeader);
    this._metadataHeader.buildHeader();
  }
  _buildOutput() {
    this.templateData.outputHeaderContainer.style.display = "flex";
    this.templateData.outputInfoContainer.style.display = "block";
    this._outputHeaderContainer = this.templateData.outputHeaderContainer;
    this._outputInfoContainer = this.templateData.outputInfoContainer;
    this._outputHeaderContainer.innerText = "";
    this._outputInfoContainer.innerText = "";
    this._outputHeader = this.instantiationService.createInstance(
      PropertyHeader,
      this.cell,
      this._outputHeaderContainer,
      this.notebookEditor,
      {
        updateInfoRendering: this.updateOutputRendering.bind(this),
        checkIfModified: /* @__PURE__ */ __name(() => {
          return this.cell.checkIfOutputsModified();
        }, "checkIfModified"),
        getFoldingState: /* @__PURE__ */ __name(() => {
          return this.cell.outputFoldingState;
        }, "getFoldingState"),
        updateFoldingState: /* @__PURE__ */ __name((state) => {
          this.cell.outputFoldingState = state;
        }, "updateFoldingState"),
        unChangedLabel: "Outputs",
        changedLabel: "Outputs changed",
        prefix: "output",
        menuId: MenuId.NotebookDiffCellOutputsTitle
      }
    );
    this._outputLocalDisposable.add(this._outputHeader);
    this._outputHeader.buildHeader();
  }
  _disposeOutput() {
    this._hideOutputsRaw();
    this._hideOutputsRenderer();
    this._hideOutputsEmptyView();
    this.cell.rawOutputHeight = 0;
    this.cell.outputMetadataHeight = 0;
    this.cell.outputStatusHeight = 0;
    this.templateData.outputHeaderContainer.style.display = "none";
    this.templateData.outputInfoContainer.style.display = "none";
    this._outputViewContainer = void 0;
  }
}
let DeletedElement = class extends SingleSideDiffElement {
  static {
    __name(this, "DeletedElement");
  }
  constructor(notebookEditor, cell, templateData, languageService, modelService, textModelService, instantiationService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService, textConfigurationService) {
    super(notebookEditor, cell, templateData, "left", instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService, textConfigurationService);
  }
  get nestedCellViewModel() {
    return this.cell.original;
  }
  get readonly() {
    return true;
  }
  styleContainer(container) {
    container.classList.remove("inserted");
    container.classList.add("removed");
  }
  layout(state) {
    DOM.scheduleAtNextAnimationFrame(DOM.getWindow(this._diffEditorContainer), () => {
      if ((state.editorHeight || state.outerWidth) && this._editor) {
        this._editorContainer.style.height = `${this.cell.layoutInfo.editorHeight}px`;
        this._editor.layout({
          width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, false),
          height: this.cell.layoutInfo.editorHeight
        });
      }
      if (state.outerWidth && this._editor) {
        this._editorContainer.style.height = `${this.cell.layoutInfo.editorHeight}px`;
        this._editor.layout();
      }
      if (state.metadataHeight || state.outerWidth) {
        this._metadataEditor?.layout({
          width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, false),
          height: this.cell.layoutInfo.metadataHeight
        });
      }
      if (state.outputTotalHeight || state.outerWidth) {
        this._outputEditor?.layout({
          width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, false),
          height: this.cell.layoutInfo.outputTotalHeight
        });
      }
      if (this._diagonalFill) {
        this._diagonalFill.style.height = `${this.calculateDiagonalFillHeight()}px`;
      }
      this.layoutNotebookCell();
    });
  }
  _buildOutputRendererContainer() {
    if (!this._outputViewContainer) {
      this._outputViewContainer = DOM.append(this._outputInfoContainer, DOM.$(".output-view-container"));
      this._outputEmptyElement = DOM.append(this._outputViewContainer, DOM.$(".output-empty-view"));
      const span = DOM.append(this._outputEmptyElement, DOM.$("span"));
      span.innerText = "No outputs to render";
      if (!this.cell.original?.outputs.length) {
        this._outputEmptyElement.style.display = "block";
      } else {
        this._outputEmptyElement.style.display = "none";
      }
      this.cell.layoutChange();
      this._outputLeftView = this.instantiationService.createInstance(OutputContainer, this.notebookEditor, this.notebookEditor.textModel, this.cell, this.cell.original, DiffSide.Original, this._outputViewContainer);
      this._register(this._outputLeftView);
      this._outputLeftView.render();
      const removedOutputRenderListener = this.notebookEditor.onDidDynamicOutputRendered((e) => {
        if (e.cell.uri.toString() === this.cell.original.uri.toString()) {
          this.notebookEditor.deltaCellOutputContainerClassNames(DiffSide.Original, this.cell.original.id, ["nb-cellDeleted"], []);
          removedOutputRenderListener.dispose();
        }
      });
      this._register(removedOutputRenderListener);
    }
    this._outputViewContainer.style.display = "block";
  }
  _decorate() {
    this.notebookEditor.deltaCellOutputContainerClassNames(DiffSide.Original, this.cell.original.id, ["nb-cellDeleted"], []);
  }
  _showOutputsRenderer() {
    if (this._outputViewContainer) {
      this._outputViewContainer.style.display = "block";
      this._outputLeftView?.showOutputs();
      this._decorate();
    }
  }
  _hideOutputsRenderer() {
    if (this._outputViewContainer) {
      this._outputViewContainer.style.display = "none";
      this._outputLeftView?.hideOutputs();
    }
  }
  dispose() {
    if (this._editor) {
      this.cell.saveSpirceEditorViewState(this._editor.saveViewState());
    }
    super.dispose();
  }
};
DeletedElement = __decorateClass([
  __decorateParam(3, ILanguageService),
  __decorateParam(4, IModelService),
  __decorateParam(5, ITextModelService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IKeybindingService),
  __decorateParam(9, INotificationService),
  __decorateParam(10, IMenuService),
  __decorateParam(11, IContextKeyService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, ITextResourceConfigurationService)
], DeletedElement);
let InsertElement = class extends SingleSideDiffElement {
  static {
    __name(this, "InsertElement");
  }
  constructor(notebookEditor, cell, templateData, instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService, textConfigurationService) {
    super(notebookEditor, cell, templateData, "right", instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService, textConfigurationService);
  }
  get nestedCellViewModel() {
    return this.cell.modified;
  }
  get readonly() {
    return false;
  }
  styleContainer(container) {
    container.classList.remove("removed");
    container.classList.add("inserted");
  }
  _buildOutputRendererContainer() {
    if (!this._outputViewContainer) {
      this._outputViewContainer = DOM.append(this._outputInfoContainer, DOM.$(".output-view-container"));
      this._outputEmptyElement = DOM.append(this._outputViewContainer, DOM.$(".output-empty-view"));
      this._outputEmptyElement.innerText = "No outputs to render";
      if (!this.cell.modified?.outputs.length) {
        this._outputEmptyElement.style.display = "block";
      } else {
        this._outputEmptyElement.style.display = "none";
      }
      this.cell.layoutChange();
      this._outputRightView = this.instantiationService.createInstance(OutputContainer, this.notebookEditor, this.notebookEditor.textModel, this.cell, this.cell.modified, DiffSide.Modified, this._outputViewContainer);
      this._register(this._outputRightView);
      this._outputRightView.render();
      const insertOutputRenderListener = this.notebookEditor.onDidDynamicOutputRendered((e) => {
        if (e.cell.uri.toString() === this.cell.modified.uri.toString()) {
          this.notebookEditor.deltaCellOutputContainerClassNames(DiffSide.Modified, this.cell.modified.id, ["nb-cellAdded"], []);
          insertOutputRenderListener.dispose();
        }
      });
      this._register(insertOutputRenderListener);
    }
    this._outputViewContainer.style.display = "block";
  }
  _decorate() {
    this.notebookEditor.deltaCellOutputContainerClassNames(DiffSide.Modified, this.cell.modified.id, ["nb-cellAdded"], []);
  }
  _showOutputsRenderer() {
    if (this._outputViewContainer) {
      this._outputViewContainer.style.display = "block";
      this._outputRightView?.showOutputs();
      this._decorate();
    }
  }
  _hideOutputsRenderer() {
    if (this._outputViewContainer) {
      this._outputViewContainer.style.display = "none";
      this._outputRightView?.hideOutputs();
    }
  }
  layout(state) {
    DOM.scheduleAtNextAnimationFrame(DOM.getWindow(this._diffEditorContainer), () => {
      if ((state.editorHeight || state.outerWidth) && this._editor) {
        this._editorContainer.style.height = `${this.cell.layoutInfo.editorHeight}px`;
        this._editor.layout({
          width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, false),
          height: this.cell.layoutInfo.editorHeight
        });
      }
      if (state.outerWidth && this._editor) {
        this._editorContainer.style.height = `${this.cell.layoutInfo.editorHeight}px`;
        this._editor.layout();
      }
      if (state.metadataHeight || state.outerWidth) {
        this._metadataEditor?.layout({
          width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, true),
          height: this.cell.layoutInfo.metadataHeight
        });
      }
      if (state.outputTotalHeight || state.outerWidth) {
        this._outputEditor?.layout({
          width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, false),
          height: this.cell.layoutInfo.outputTotalHeight
        });
      }
      this.layoutNotebookCell();
      if (this._diagonalFill) {
        this._diagonalFill.style.height = `${this.calculateDiagonalFillHeight()}px`;
      }
    });
  }
  dispose() {
    if (this._editor) {
      this.cell.saveSpirceEditorViewState(this._editor.saveViewState());
    }
    super.dispose();
  }
};
InsertElement = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILanguageService),
  __decorateParam(5, IModelService),
  __decorateParam(6, ITextModelService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IKeybindingService),
  __decorateParam(9, INotificationService),
  __decorateParam(10, IMenuService),
  __decorateParam(11, IContextKeyService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, ITextResourceConfigurationService)
], InsertElement);
let ModifiedElement = class extends AbstractElementRenderer {
  static {
    __name(this, "ModifiedElement");
  }
  _editor;
  _editorViewStateChanged;
  _toolbar;
  _menu;
  cell;
  templateData;
  constructor(notebookEditor, cell, templateData, instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService, textConfigurationService) {
    super(notebookEditor, cell, templateData, "full", instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService, textConfigurationService);
    this.cell = cell;
    this.templateData = templateData;
    this._editorViewStateChanged = false;
    this.updateBorders();
  }
  init() {
  }
  styleContainer(container) {
    container.classList.remove("inserted", "removed");
  }
  buildBody() {
    super.buildBody();
    if (this.cell.displayIconToHideUnmodifiedCells) {
      this._register(this.templateData.marginOverlay.onAction(() => this.cell.hideUnchangedCells()));
      this.templateData.marginOverlay.show();
    } else {
      this.templateData.marginOverlay.hide();
    }
  }
  _disposeMetadata() {
    this.cell.metadataStatusHeight = 0;
    this.cell.metadataHeight = 0;
    this.templateData.metadataHeaderContainer.style.display = "none";
    this.templateData.metadataInfoContainer.style.display = "none";
    this._metadataEditor = void 0;
  }
  _buildMetadata() {
    this._metadataHeaderContainer = this.templateData.metadataHeaderContainer;
    this._metadataInfoContainer = this.templateData.metadataInfoContainer;
    this._metadataHeaderContainer.style.display = "flex";
    this._metadataInfoContainer.style.display = "block";
    this._metadataHeaderContainer.innerText = "";
    this._metadataInfoContainer.innerText = "";
    this._metadataHeader = this.instantiationService.createInstance(
      PropertyHeader,
      this.cell,
      this._metadataHeaderContainer,
      this.notebookEditor,
      {
        updateInfoRendering: this.updateMetadataRendering.bind(this),
        checkIfModified: /* @__PURE__ */ __name(() => {
          return this.cell.checkMetadataIfModified();
        }, "checkIfModified"),
        getFoldingState: /* @__PURE__ */ __name(() => {
          return this.cell.metadataFoldingState;
        }, "getFoldingState"),
        updateFoldingState: /* @__PURE__ */ __name((state) => {
          this.cell.metadataFoldingState = state;
        }, "updateFoldingState"),
        unChangedLabel: "Metadata",
        changedLabel: "Metadata changed",
        prefix: "metadata",
        menuId: MenuId.NotebookDiffCellMetadataTitle
      }
    );
    this._metadataLocalDisposable.add(this._metadataHeader);
    this._metadataHeader.buildHeader();
  }
  _disposeOutput() {
    this._hideOutputsRaw();
    this._hideOutputsRenderer();
    this._hideOutputsEmptyView();
    this.cell.rawOutputHeight = 0;
    this.cell.outputMetadataHeight = 0;
    this.cell.outputStatusHeight = 0;
    this.templateData.outputHeaderContainer.style.display = "none";
    this.templateData.outputInfoContainer.style.display = "none";
    this._outputViewContainer = void 0;
  }
  _buildOutput() {
    this.templateData.outputHeaderContainer.style.display = "flex";
    this.templateData.outputInfoContainer.style.display = "block";
    this._outputHeaderContainer = this.templateData.outputHeaderContainer;
    this._outputInfoContainer = this.templateData.outputInfoContainer;
    this._outputHeaderContainer.innerText = "";
    this._outputInfoContainer.innerText = "";
    if (this.cell.checkIfOutputsModified()) {
      this._outputInfoContainer.classList.add("modified");
    } else {
      this._outputInfoContainer.classList.remove("modified");
    }
    this._outputHeader = this.instantiationService.createInstance(
      PropertyHeader,
      this.cell,
      this._outputHeaderContainer,
      this.notebookEditor,
      {
        updateInfoRendering: this.updateOutputRendering.bind(this),
        checkIfModified: /* @__PURE__ */ __name(() => {
          return this.cell.checkIfOutputsModified();
        }, "checkIfModified"),
        getFoldingState: /* @__PURE__ */ __name(() => {
          return this.cell.outputFoldingState;
        }, "getFoldingState"),
        updateFoldingState: /* @__PURE__ */ __name((state) => {
          this.cell.outputFoldingState = state;
        }, "updateFoldingState"),
        unChangedLabel: "Outputs",
        changedLabel: "Outputs changed",
        prefix: "output",
        menuId: MenuId.NotebookDiffCellOutputsTitle
      }
    );
    this._outputLocalDisposable.add(this._outputHeader);
    this._outputHeader.buildHeader();
  }
  _buildOutputRendererContainer() {
    if (!this._outputViewContainer) {
      this._outputViewContainer = DOM.append(this._outputInfoContainer, DOM.$(".output-view-container"));
      this._outputEmptyElement = DOM.append(this._outputViewContainer, DOM.$(".output-empty-view"));
      this._outputEmptyElement.innerText = "No outputs to render";
      if (!this.cell.checkIfOutputsModified() && this.cell.modified.outputs.length === 0) {
        this._outputEmptyElement.style.display = "block";
      } else {
        this._outputEmptyElement.style.display = "none";
      }
      this.cell.layoutChange();
      this._register(this.cell.modified.textModel.onDidChangeOutputs(() => {
        if (!this.cell.checkIfOutputsModified() && this.cell.modified.outputs.length === 0) {
          this._outputEmptyElement.style.display = "block";
        } else {
          this._outputEmptyElement.style.display = "none";
        }
        this._decorate();
      }));
      this._outputLeftContainer = DOM.append(this._outputViewContainer, DOM.$(".output-view-container-left"));
      this._outputRightContainer = DOM.append(this._outputViewContainer, DOM.$(".output-view-container-right"));
      this._outputMetadataContainer = DOM.append(this._outputViewContainer, DOM.$(".output-view-container-metadata"));
      const outputModified = this.cell.checkIfOutputsModified();
      const outputMetadataChangeOnly = outputModified && outputModified.kind === OutputComparison.Metadata && this.cell.original.outputs.length === 1 && this.cell.modified.outputs.length === 1 && outputEqual(this.cell.original.outputs[0], this.cell.modified.outputs[0]) === OutputComparison.Metadata;
      if (outputModified && !outputMetadataChangeOnly) {
        const originalOutputRenderListener = this.notebookEditor.onDidDynamicOutputRendered((e) => {
          if (e.cell.uri.toString() === this.cell.original.uri.toString() && this.cell.checkIfOutputsModified()) {
            this.notebookEditor.deltaCellOutputContainerClassNames(DiffSide.Original, this.cell.original.id, ["nb-cellDeleted"], []);
            originalOutputRenderListener.dispose();
          }
        });
        const modifiedOutputRenderListener = this.notebookEditor.onDidDynamicOutputRendered((e) => {
          if (e.cell.uri.toString() === this.cell.modified.uri.toString() && this.cell.checkIfOutputsModified()) {
            this.notebookEditor.deltaCellOutputContainerClassNames(DiffSide.Modified, this.cell.modified.id, ["nb-cellAdded"], []);
            modifiedOutputRenderListener.dispose();
          }
        });
        this._register(originalOutputRenderListener);
        this._register(modifiedOutputRenderListener);
      }
      this._outputLeftView = this.instantiationService.createInstance(OutputContainer, this.notebookEditor, this.notebookEditor.textModel, this.cell, this.cell.original, DiffSide.Original, this._outputLeftContainer);
      this._outputLeftView.render();
      this._register(this._outputLeftView);
      this._outputRightView = this.instantiationService.createInstance(OutputContainer, this.notebookEditor, this.notebookEditor.textModel, this.cell, this.cell.modified, DiffSide.Modified, this._outputRightContainer);
      this._outputRightView.render();
      this._register(this._outputRightView);
      if (outputModified && !outputMetadataChangeOnly) {
        this._decorate();
      }
      if (outputMetadataChangeOnly) {
        this._outputMetadataContainer.style.top = `${this.cell.layoutInfo.rawOutputHeight}px`;
        this._outputMetadataEditor = this.instantiationService.createInstance(DiffEditorWidget, this._outputMetadataContainer, {
          ...fixedDiffEditorOptions,
          overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode(),
          readOnly: true,
          ignoreTrimWhitespace: false,
          automaticLayout: false,
          dimension: {
            height: OUTPUT_EDITOR_HEIGHT_MAGIC,
            width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, true)
          }
        }, {
          originalEditor: getOptimizedNestedCodeEditorWidgetOptions(),
          modifiedEditor: getOptimizedNestedCodeEditorWidgetOptions()
        });
        this._register(this._outputMetadataEditor);
        const originalOutputMetadataSource = JSON.stringify(this.cell.original.outputs[0].metadata ?? {}, void 0, "	");
        const modifiedOutputMetadataSource = JSON.stringify(this.cell.modified.outputs[0].metadata ?? {}, void 0, "	");
        const mode = this.languageService.createById("json");
        const originalModel = this.modelService.createModel(originalOutputMetadataSource, mode, void 0, true);
        const modifiedModel = this.modelService.createModel(modifiedOutputMetadataSource, mode, void 0, true);
        this._outputMetadataEditor.setModel({
          original: originalModel,
          modified: modifiedModel
        });
        this.cell.outputMetadataHeight = this._outputMetadataEditor.getContentHeight();
        this._register(this._outputMetadataEditor.onDidContentSizeChange((e) => {
          this.cell.outputMetadataHeight = e.contentHeight;
        }));
      }
    }
    this._outputViewContainer.style.display = "block";
  }
  _decorate() {
    if (this.cell.checkIfOutputsModified()) {
      this.notebookEditor.deltaCellOutputContainerClassNames(DiffSide.Original, this.cell.original.id, ["nb-cellDeleted"], []);
      this.notebookEditor.deltaCellOutputContainerClassNames(DiffSide.Modified, this.cell.modified.id, ["nb-cellAdded"], []);
    } else {
      this.notebookEditor.deltaCellOutputContainerClassNames(DiffSide.Original, this.cell.original.id, [], ["nb-cellDeleted"]);
      this.notebookEditor.deltaCellOutputContainerClassNames(DiffSide.Modified, this.cell.modified.id, [], ["nb-cellAdded"]);
    }
  }
  _showOutputsRenderer() {
    if (this._outputViewContainer) {
      this._outputViewContainer.style.display = "block";
      this._outputLeftView?.showOutputs();
      this._outputRightView?.showOutputs();
      this._outputMetadataEditor?.layout({
        width: this._editor?.getViewWidth() || this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, true),
        height: this.cell.layoutInfo.outputMetadataHeight
      });
      this._decorate();
    }
  }
  _hideOutputsRenderer() {
    if (this._outputViewContainer) {
      this._outputViewContainer.style.display = "none";
      this._outputLeftView?.hideOutputs();
      this._outputRightView?.hideOutputs();
    }
  }
  updateSourceEditor() {
    this._cellHeaderContainer = this.templateData.cellHeaderContainer;
    this._cellHeaderContainer.style.display = "flex";
    this._cellHeaderContainer.innerText = "";
    const modifiedCell = this.cell.modified;
    this._editorContainer = this.templateData.editorContainer;
    this._editorContainer.classList.add("diff");
    const renderSourceEditor = /* @__PURE__ */ __name(() => {
      if (this.cell.cellFoldingState === PropertyFoldingState.Collapsed) {
        this._editorContainer.style.display = "none";
        this.cell.editorHeight = 0;
        return;
      }
      const lineCount = modifiedCell.textModel.textBuffer.getLineCount();
      const lineHeight = this.notebookEditor.getLayoutInfo().fontInfo.lineHeight || 17;
      const editorHeight = this.cell.layoutInfo.editorHeight !== 0 ? this.cell.layoutInfo.editorHeight : this.cell.computeInputEditorHeight(lineHeight);
      this._editorContainer.style.height = `${editorHeight}px`;
      this._editorContainer.style.display = "block";
      if (this._editor) {
        const contentHeight = this._editor.getContentHeight();
        if (contentHeight >= 0) {
          this.cell.editorHeight = contentHeight;
        }
        return;
      }
      this._editor = this.templateData.sourceEditor;
      const options = {
        padding: getEditorPadding(lineCount)
      };
      if (this.cell.unchangedRegionsService.options.enabled) {
        options.hideUnchangedRegions = this.cell.unchangedRegionsService.options;
      }
      this._editor.updateOptions(options);
      this._register(this.cell.unchangedRegionsService.options.onDidChangeEnablement(() => {
        options.hideUnchangedRegions = this.cell.unchangedRegionsService.options;
        this._editor?.updateOptions(options);
      }));
      this._editor.layout({
        width: this.notebookEditor.getLayoutInfo().width - 2 * DIFF_CELL_MARGIN,
        height: editorHeight
      });
      this._register(this._editor.onDidContentSizeChange((e) => {
        if (this.cell.cellFoldingState === PropertyFoldingState.Expanded && e.contentHeightChanged && this.cell.layoutInfo.editorHeight !== e.contentHeight) {
          this.cell.editorHeight = e.contentHeight;
        }
      }));
      this._initializeSourceDiffEditor();
    }, "renderSourceEditor");
    this._cellHeader = this._register(this.instantiationService.createInstance(
      PropertyHeader,
      this.cell,
      this._cellHeaderContainer,
      this.notebookEditor,
      {
        updateInfoRendering: /* @__PURE__ */ __name(() => renderSourceEditor(), "updateInfoRendering"),
        checkIfModified: /* @__PURE__ */ __name(() => {
          return this.cell.modified?.textModel.getTextBufferHash() !== this.cell.original?.textModel.getTextBufferHash() ? { reason: void 0 } : false;
        }, "checkIfModified"),
        getFoldingState: /* @__PURE__ */ __name(() => this.cell.cellFoldingState, "getFoldingState"),
        updateFoldingState: /* @__PURE__ */ __name((state) => this.cell.cellFoldingState = state, "updateFoldingState"),
        unChangedLabel: "Input",
        changedLabel: "Input changed",
        prefix: "input",
        menuId: MenuId.NotebookDiffCellInputTitle
      }
    ));
    this._cellHeader.buildHeader();
    renderSourceEditor();
    const scopedContextKeyService = this.contextKeyService.createScoped(this.templateData.inputToolbarContainer);
    this._register(scopedContextKeyService);
    const inputChanged = NOTEBOOK_DIFF_CELL_INPUT.bindTo(scopedContextKeyService);
    inputChanged.set(this.cell.modified.textModel.getTextBufferHash() !== this.cell.original.textModel.getTextBufferHash());
    const ignoreWhitespace = NOTEBOOK_DIFF_CELL_IGNORE_WHITESPACE.bindTo(scopedContextKeyService);
    const ignore = this.textConfigurationService.getValue(this.cell.modified.uri, "diffEditor.ignoreTrimWhitespace");
    ignoreWhitespace.set(ignore);
    this._toolbar = this.templateData.toolbar;
    this._toolbar.context = this.cell;
    const refreshToolbar = /* @__PURE__ */ __name(() => {
      const ignore2 = this.textConfigurationService.getValue(this.cell.modified.uri, "diffEditor.ignoreTrimWhitespace");
      ignoreWhitespace.set(ignore2);
      const hasChanges = this.cell.modified.textModel.getTextBufferHash() !== this.cell.original.textModel.getTextBufferHash();
      inputChanged.set(hasChanges);
      if (hasChanges) {
        const actions = [];
        const menu = this.menuService.getMenuActions(MenuId.NotebookDiffCellInputTitle, scopedContextKeyService, { shouldForwardArgs: true });
        createAndFillInActionBarActions(menu, actions);
        this._toolbar.setActions(actions);
      } else {
        this._toolbar.setActions([]);
      }
    }, "refreshToolbar");
    this._register(this.cell.modified.textModel.onDidChangeContent(() => refreshToolbar()));
    this._register(this.textConfigurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(this.cell.modified.uri, "diffEditor") && e.affectedKeys.has("diffEditor.ignoreTrimWhitespace")) {
        refreshToolbar();
      }
    }));
    refreshToolbar();
  }
  async _initializeSourceDiffEditor() {
    const [originalRef, modifiedRef] = await Promise.all([
      this.textModelService.createModelReference(this.cell.original.uri),
      this.textModelService.createModelReference(this.cell.modified.uri)
    ]);
    this._register(originalRef);
    this._register(modifiedRef);
    if (this._isDisposed) {
      originalRef.dispose();
      modifiedRef.dispose();
      return;
    }
    const vm = this._register(this._editor.createViewModel({
      original: originalRef.object.textEditorModel,
      modified: modifiedRef.object.textEditorModel
    }));
    await vm.waitForDiff();
    this._editor.setModel(vm);
    const handleViewStateChange = /* @__PURE__ */ __name(() => {
      this._editorViewStateChanged = true;
    }, "handleViewStateChange");
    const handleScrollChange = /* @__PURE__ */ __name((e) => {
      if (e.scrollTopChanged || e.scrollLeftChanged) {
        this._editorViewStateChanged = true;
      }
    }, "handleScrollChange");
    this.updateEditorOptionsForWhitespace();
    this._register(this._editor.getOriginalEditor().onDidChangeCursorSelection(handleViewStateChange));
    this._register(this._editor.getOriginalEditor().onDidScrollChange(handleScrollChange));
    this._register(this._editor.getModifiedEditor().onDidChangeCursorSelection(handleViewStateChange));
    this._register(this._editor.getModifiedEditor().onDidScrollChange(handleScrollChange));
    const editorViewState = this.cell.getSourceEditorViewState();
    if (editorViewState) {
      this._editor.restoreViewState(editorViewState);
    }
    const contentHeight = this._editor.getContentHeight();
    this.cell.editorHeight = contentHeight;
  }
  updateEditorOptionsForWhitespace() {
    const editor = this._editor;
    if (!editor) {
      return;
    }
    const uri = editor.getModel()?.modified.uri || editor.getModel()?.original.uri;
    if (!uri) {
      return;
    }
    const ignoreTrimWhitespace = this.textConfigurationService.getValue(uri, "diffEditor.ignoreTrimWhitespace");
    editor.updateOptions({ ignoreTrimWhitespace });
    this._register(this.textConfigurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(uri, "diffEditor") && e.affectedKeys.has("diffEditor.ignoreTrimWhitespace")) {
        const ignoreTrimWhitespace2 = this.textConfigurationService.getValue(uri, "diffEditor.ignoreTrimWhitespace");
        editor.updateOptions({ ignoreTrimWhitespace: ignoreTrimWhitespace2 });
      }
    }));
  }
  layout(state) {
    DOM.scheduleAtNextAnimationFrame(DOM.getWindow(this._diffEditorContainer), () => {
      if (state.editorHeight && this._editor) {
        this._editorContainer.style.height = `${this.cell.layoutInfo.editorHeight}px`;
        this._editor.layout({
          width: this._editor.getViewWidth(),
          height: this.cell.layoutInfo.editorHeight
        });
      }
      if (state.outerWidth && this._editor) {
        this._editorContainer.style.height = `${this.cell.layoutInfo.editorHeight}px`;
        this._editor.layout();
      }
      if (state.metadataHeight || state.outerWidth) {
        if (this._metadataEditorContainer) {
          this._metadataEditorContainer.style.height = `${this.cell.layoutInfo.metadataHeight}px`;
          this._metadataEditor?.layout({
            width: this._editor?.getViewWidth() || this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, true),
            height: this.cell.layoutInfo.metadataHeight
          });
        }
      }
      if (state.outputTotalHeight || state.outerWidth) {
        if (this._outputEditorContainer) {
          this._outputEditorContainer.style.height = `${this.cell.layoutInfo.outputTotalHeight}px`;
          this._outputEditor?.layout({
            width: this._editor?.getViewWidth() || this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, true),
            height: this.cell.layoutInfo.outputTotalHeight
          });
        }
        if (this._outputMetadataContainer) {
          this._outputMetadataContainer.style.height = `${this.cell.layoutInfo.outputMetadataHeight}px`;
          this._outputMetadataContainer.style.top = `${this.cell.layoutInfo.outputTotalHeight - this.cell.layoutInfo.outputMetadataHeight}px`;
          this._outputMetadataEditor?.layout({
            width: this._editor?.getViewWidth() || this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, true),
            height: this.cell.layoutInfo.outputMetadataHeight
          });
        }
      }
      this.layoutNotebookCell();
    });
  }
  dispose() {
    if (this._editor) {
      this._editor.setModel(null);
    }
    if (this._editor && this._editorViewStateChanged) {
      this.cell.saveSpirceEditorViewState(this._editor.saveViewState());
    }
    super.dispose();
  }
};
ModifiedElement = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILanguageService),
  __decorateParam(5, IModelService),
  __decorateParam(6, ITextModelService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IKeybindingService),
  __decorateParam(9, INotificationService),
  __decorateParam(10, IMenuService),
  __decorateParam(11, IContextKeyService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, ITextResourceConfigurationService)
], ModifiedElement);
class CollapsedCellOverlayWidget extends Disposable {
  constructor(container) {
    super();
    this.container = container;
    this._nodes.root.style.display = "none";
    container.appendChild(this._nodes.root);
  }
  static {
    __name(this, "CollapsedCellOverlayWidget");
  }
  _nodes = DOM.h("div.diff-hidden-cells", [
    DOM.h(
      "div.center@content",
      { style: { display: "flex" } },
      [
        DOM.$(
          "a",
          {
            title: localize("showUnchangedCells", "Show Unchanged Cells"),
            role: "button",
            onclick: /* @__PURE__ */ __name(() => {
              this._action.fire();
            }, "onclick")
          },
          ...renderLabelWithIcons("$(unfold)")
        )
      ]
    )
  ]);
  _action = this._register(new Emitter());
  onAction = this._action.event;
  show() {
    this._nodes.root.style.display = "block";
  }
  hide() {
    this._nodes.root.style.display = "none";
  }
  dispose() {
    this.hide();
    this.container.removeChild(this._nodes.root);
    DOM.reset(this._nodes.root);
    super.dispose();
  }
}
class UnchangedCellOverlayWidget extends Disposable {
  constructor(container) {
    super();
    this.container = container;
    this._nodes.root.style.display = "none";
    container.appendChild(this._nodes.root);
  }
  static {
    __name(this, "UnchangedCellOverlayWidget");
  }
  _nodes = DOM.h("div.diff-hidden-cells", [
    DOM.h(
      "div.center@content",
      { style: { display: "flex" } },
      [
        DOM.$(
          "a",
          {
            title: localize("hideUnchangedCells", "Hide Unchanged Cells"),
            role: "button",
            onclick: /* @__PURE__ */ __name(() => {
              this._action.fire();
            }, "onclick")
          },
          ...renderLabelWithIcons("$(fold)")
        )
      ]
    )
  ]);
  _action = this._register(new Emitter());
  onAction = this._action.event;
  show() {
    this._nodes.root.style.display = "block";
  }
  hide() {
    this._nodes.root.style.display = "none";
  }
  dispose() {
    this.hide();
    this.container.removeChild(this._nodes.root);
    DOM.reset(this._nodes.root);
    super.dispose();
  }
}
export {
  CellDiffPlaceholderElement,
  CollapsedCellOverlayWidget,
  DeletedElement,
  InsertElement,
  ModifiedElement,
  UnchangedCellOverlayWidget,
  getOptimizedNestedCodeEditorWidgetOptions
};
//# sourceMappingURL=diffComponents.js.map
