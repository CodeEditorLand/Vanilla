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
import "./media/interactive.css";
import * as DOM from "../../../../base/browser/dom.js";
import { ToolBar } from "../../../../base/browser/ui/toolbar/toolbar.js";
import { Emitter } from "../../../../base/common/event.js";
import {
  DisposableStore,
  MutableDisposable
} from "../../../../base/common/lifecycle.js";
import { isEqual } from "../../../../base/common/resources.js";
import { EditorExtensionsRegistry } from "../../../../editor/browser/editorExtensions.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { CodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../editor/common/languages/modesRegistry.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { ContextMenuController } from "../../../../editor/contrib/contextmenu/browser/contextmenu.js";
import { MarkerController } from "../../../../editor/contrib/gotoError/browser/gotoError.js";
import { ParameterHintsController } from "../../../../editor/contrib/parameterHints/browser/parameterHints.js";
import { SnippetController2 } from "../../../../editor/contrib/snippet/browser/snippetController2.js";
import { SuggestController } from "../../../../editor/contrib/suggest/browser/suggestController.js";
import {
  createActionViewItem,
  createAndFillInActionBarActions
} from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import {
  IMenuService,
  MenuId
} from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import {
  TextEditorSelectionSource
} from "../../../../platform/editor/common/editor.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import {
  EditorPaneSelectionChangeReason
} from "../../../common/editor.js";
import {
  GroupsOrder,
  IEditorGroupsService
} from "../../../services/editor/common/editorGroupsService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { MenuPreventer } from "../../codeEditor/browser/menuPreventer.js";
import { SelectionClipboardContributionID } from "../../codeEditor/browser/selectionClipboard.js";
import { getSimpleEditorOptions } from "../../codeEditor/browser/simpleEditorOptions.js";
import {
  ExecutionStateCellStatusBarContrib,
  TimerCellStatusBarContrib
} from "../../notebook/browser/contrib/cellStatusBar/executionStatusBarItemController.js";
import { NotebookFindContrib } from "../../notebook/browser/contrib/find/notebookFindWidget.js";
import { NotebookEditorExtensionsRegistry } from "../../notebook/browser/notebookEditorExtensions.js";
import { NotebookOptions } from "../../notebook/browser/notebookOptions.js";
import {
  INotebookEditorService
} from "../../notebook/browser/services/notebookEditorService.js";
import { INTERACTIVE_WINDOW_EDITOR_ID } from "../../notebook/common/notebookCommon.js";
import { NOTEBOOK_KERNEL } from "../../notebook/common/notebookContextKeys.js";
import {
  INotebookExecutionStateService,
  NotebookExecutionType
} from "../../notebook/common/notebookExecutionStateService.js";
import { INotebookKernelService } from "../../notebook/common/notebookKernelService.js";
import { TabCompletionController } from "../../snippets/browser/tabCompletion.js";
import {
  INTERACTIVE_INPUT_CURSOR_BOUNDARY,
  InteractiveWindowSetting
} from "./interactiveCommon.js";
import { InteractiveEditorInput } from "./interactiveEditorInput.js";
import "./interactiveEditor.css";
import { deepClone } from "../../../../base/common/objects.js";
import { ContentHoverController } from "../../../../editor/contrib/hover/browser/contentHoverController.js";
import { GlyphHoverController } from "../../../../editor/contrib/hover/browser/glyphHoverController.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { ReplInputHintContentWidget } from "./replInputHintContentWidget.js";
const DECORATION_KEY = "interactiveInputDecoration";
const INTERACTIVE_EDITOR_VIEW_STATE_PREFERENCE_KEY = "InteractiveEditorViewState";
const INPUT_CELL_VERTICAL_PADDING = 8;
const INPUT_CELL_HORIZONTAL_PADDING_RIGHT = 10;
const INPUT_EDITOR_PADDING = 8;
let InteractiveEditor = class extends EditorPane {
  static {
    __name(this, "InteractiveEditor");
  }
  _rootElement;
  _styleElement;
  _notebookEditorContainer;
  _notebookWidget = {
    value: void 0
  };
  _inputCellContainer;
  _inputFocusIndicator;
  _inputRunButtonContainer;
  _inputEditorContainer;
  _codeEditorWidget;
  _notebookWidgetService;
  _instantiationService;
  _languageService;
  _contextKeyService;
  _configurationService;
  _notebookKernelService;
  _keybindingService;
  _menuService;
  _contextMenuService;
  _editorGroupService;
  _notebookExecutionStateService;
  _extensionService;
  _widgetDisposableStore = this._register(
    new DisposableStore()
  );
  _lastLayoutDimensions;
  _editorOptions;
  _notebookOptions;
  _editorMemento;
  _groupListener = this._register(new MutableDisposable());
  _runbuttonToolbar;
  _hintElement;
  _onDidFocusWidget = this._register(new Emitter());
  get onDidFocus() {
    return this._onDidFocusWidget.event;
  }
  _onDidChangeSelection = this._register(
    new Emitter()
  );
  onDidChangeSelection = this._onDidChangeSelection.event;
  _onDidChangeScroll = this._register(new Emitter());
  onDidChangeScroll = this._onDidChangeScroll.event;
  constructor(group, telemetryService, themeService, storageService, instantiationService, notebookWidgetService, contextKeyService, codeEditorService, notebookKernelService, languageService, keybindingService, configurationService, menuService, contextMenuService, editorGroupService, textResourceConfigurationService, notebookExecutionStateService, extensionService) {
    super(
      INTERACTIVE_WINDOW_EDITOR_ID,
      group,
      telemetryService,
      themeService,
      storageService
    );
    this._notebookWidgetService = notebookWidgetService;
    this._configurationService = configurationService;
    this._notebookKernelService = notebookKernelService;
    this._languageService = languageService;
    this._keybindingService = keybindingService;
    this._menuService = menuService;
    this._contextMenuService = contextMenuService;
    this._editorGroupService = editorGroupService;
    this._notebookExecutionStateService = notebookExecutionStateService;
    this._extensionService = extensionService;
    this._rootElement = DOM.$(".interactive-editor");
    this._contextKeyService = this._register(
      contextKeyService.createScoped(this._rootElement)
    );
    this._contextKeyService.createKey("isCompositeNotebook", true);
    this._instantiationService = this._register(
      instantiationService.createChild(
        new ServiceCollection([
          IContextKeyService,
          this._contextKeyService
        ])
      )
    );
    this._editorOptions = this._computeEditorOptions();
    this._register(
      this._configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("editor") || e.affectsConfiguration("notebook")) {
          this._editorOptions = this._computeEditorOptions();
        }
      })
    );
    this._notebookOptions = instantiationService.createInstance(
      NotebookOptions,
      this.window,
      true,
      {
        cellToolbarInteraction: "hover",
        globalToolbar: true,
        stickyScrollEnabled: false,
        dragAndDropEnabled: false
      }
    );
    this._editorMemento = this.getEditorMemento(
      editorGroupService,
      textResourceConfigurationService,
      INTERACTIVE_EDITOR_VIEW_STATE_PREFERENCE_KEY
    );
    codeEditorService.registerDecorationType(
      "interactive-decoration",
      DECORATION_KEY,
      {}
    );
    this._register(
      this._keybindingService.onDidUpdateKeybindings(
        this._updateInputHint,
        this
      )
    );
    this._register(
      this._notebookExecutionStateService.onDidChangeExecution((e) => {
        if (e.type === NotebookExecutionType.cell && isEqual(
          e.notebook,
          this._notebookWidget.value?.viewModel?.notebookDocument.uri
        )) {
          const cell = this._notebookWidget.value?.getCellByHandle(
            e.cellHandle
          );
          if (cell && e.changed?.state) {
            this._scrollIfNecessary(cell);
          }
        }
      })
    );
  }
  get inputCellContainerHeight() {
    return 19 + 2 + INPUT_CELL_VERTICAL_PADDING * 2 + INPUT_EDITOR_PADDING * 2;
  }
  get inputCellEditorHeight() {
    return 19 + INPUT_EDITOR_PADDING * 2;
  }
  createEditor(parent) {
    DOM.append(parent, this._rootElement);
    this._rootElement.style.position = "relative";
    this._notebookEditorContainer = DOM.append(
      this._rootElement,
      DOM.$(".notebook-editor-container")
    );
    this._inputCellContainer = DOM.append(
      this._rootElement,
      DOM.$(".input-cell-container")
    );
    this._inputCellContainer.style.position = "absolute";
    this._inputCellContainer.style.height = `${this.inputCellContainerHeight}px`;
    this._inputFocusIndicator = DOM.append(
      this._inputCellContainer,
      DOM.$(".input-focus-indicator")
    );
    this._inputRunButtonContainer = DOM.append(
      this._inputCellContainer,
      DOM.$(".run-button-container")
    );
    this._setupRunButtonToolbar(this._inputRunButtonContainer);
    this._inputEditorContainer = DOM.append(
      this._inputCellContainer,
      DOM.$(".input-editor-container")
    );
    this._createLayoutStyles();
  }
  _setupRunButtonToolbar(runButtonContainer) {
    const menu = this._register(
      this._menuService.createMenu(
        MenuId.InteractiveInputExecute,
        this._contextKeyService
      )
    );
    this._runbuttonToolbar = this._register(
      new ToolBar(runButtonContainer, this._contextMenuService, {
        getKeyBinding: /* @__PURE__ */ __name((action) => this._keybindingService.lookupKeybinding(action.id), "getKeyBinding"),
        actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
          return createActionViewItem(
            this._instantiationService,
            action,
            options
          );
        }, "actionViewItemProvider"),
        renderDropdownAsChildElement: true
      })
    );
    const primary = [];
    const secondary = [];
    const result = { primary, secondary };
    createAndFillInActionBarActions(
      menu,
      { shouldForwardArgs: true },
      result
    );
    this._runbuttonToolbar.setActions([...primary, ...secondary]);
  }
  _createLayoutStyles() {
    this._styleElement = DOM.createStyleSheet(this._rootElement);
    const styleSheets = [];
    const { codeCellLeftMargin, cellRunGutter } = this._notebookOptions.getLayoutConfiguration();
    const { focusIndicator } = this._notebookOptions.getDisplayOptions();
    const leftMargin = this._notebookOptions.getCellEditorContainerLeftMargin();
    styleSheets.push(`
			.interactive-editor .input-cell-container {
				padding: ${INPUT_CELL_VERTICAL_PADDING}px ${INPUT_CELL_HORIZONTAL_PADDING_RIGHT}px ${INPUT_CELL_VERTICAL_PADDING}px ${leftMargin}px;
			}
		`);
    if (focusIndicator === "gutter") {
      styleSheets.push(`
				.interactive-editor .input-cell-container:focus-within .input-focus-indicator::before {
					border-color: var(--vscode-notebook-focusedCellBorder) !important;
				}
				.interactive-editor .input-focus-indicator::before {
					border-color: var(--vscode-notebook-inactiveFocusedCellBorder) !important;
				}
				.interactive-editor .input-cell-container .input-focus-indicator {
					display: block;
					top: ${INPUT_CELL_VERTICAL_PADDING}px;
				}
				.interactive-editor .input-cell-container {
					border-top: 1px solid var(--vscode-notebook-inactiveFocusedCellBorder);
				}
			`);
    } else {
      styleSheets.push(`
				.interactive-editor .input-cell-container {
					border-top: 1px solid var(--vscode-notebook-inactiveFocusedCellBorder);
				}
				.interactive-editor .input-cell-container .input-focus-indicator {
					display: none;
				}
			`);
    }
    styleSheets.push(`
			.interactive-editor .input-cell-container .run-button-container {
				width: ${cellRunGutter}px;
				left: ${codeCellLeftMargin}px;
				margin-top: ${INPUT_EDITOR_PADDING - 2}px;
			}
		`);
    this._styleElement.textContent = styleSheets.join("\n");
  }
  _computeEditorOptions() {
    let overrideIdentifier;
    if (this._codeEditorWidget) {
      overrideIdentifier = this._codeEditorWidget.getModel()?.getLanguageId();
    }
    const editorOptions = deepClone(
      this._configurationService.getValue("editor", {
        overrideIdentifier
      })
    );
    const editorOptionsOverride = getSimpleEditorOptions(
      this._configurationService
    );
    const computed = Object.freeze({
      ...editorOptions,
      ...editorOptionsOverride,
      ...{
        glyphMargin: true,
        padding: {
          top: INPUT_EDITOR_PADDING,
          bottom: INPUT_EDITOR_PADDING
        },
        hover: {
          enabled: true
        }
      }
    });
    return computed;
  }
  saveState() {
    this._saveEditorViewState(this.input);
    super.saveState();
  }
  getViewState() {
    const input = this.input;
    if (!(input instanceof InteractiveEditorInput)) {
      return void 0;
    }
    this._saveEditorViewState(input);
    return this._loadNotebookEditorViewState(input);
  }
  _saveEditorViewState(input) {
    if (this._notebookWidget.value && input instanceof InteractiveEditorInput) {
      if (this._notebookWidget.value.isDisposed) {
        return;
      }
      const state = this._notebookWidget.value.getEditorViewState();
      const editorState = this._codeEditorWidget.saveViewState();
      this._editorMemento.saveEditorState(
        this.group,
        input.notebookEditorInput.resource,
        {
          notebook: state,
          input: editorState
        }
      );
    }
  }
  _loadNotebookEditorViewState(input) {
    const result = this._editorMemento.loadEditorState(
      this.group,
      input.notebookEditorInput.resource
    );
    if (result) {
      return result;
    }
    for (const group of this._editorGroupService.getGroups(
      GroupsOrder.MOST_RECENTLY_ACTIVE
    )) {
      if (group.activeEditorPane !== this && group.activeEditorPane === this && group.activeEditor?.matches(input)) {
        const notebook = this._notebookWidget.value?.getEditorViewState();
        const input2 = this._codeEditorWidget.saveViewState();
        return {
          notebook,
          input: input2
        };
      }
    }
    return;
  }
  async setInput(input, options, context, token) {
    const notebookInput = input.notebookEditorInput;
    this._notebookWidget.value?.onWillHide();
    this._codeEditorWidget?.dispose();
    this._widgetDisposableStore.clear();
    this._notebookWidget = this._instantiationService.invokeFunction(
      this._notebookWidgetService.retrieveWidget,
      this.group.id,
      notebookInput,
      {
        isEmbedded: true,
        isReadOnly: true,
        contributions: NotebookEditorExtensionsRegistry.getSomeEditorContributions(
          [
            ExecutionStateCellStatusBarContrib.id,
            TimerCellStatusBarContrib.id,
            NotebookFindContrib.id
          ]
        ),
        menuIds: {
          notebookToolbar: MenuId.InteractiveToolbar,
          cellTitleToolbar: MenuId.InteractiveCellTitle,
          cellDeleteToolbar: MenuId.InteractiveCellDelete,
          cellInsertToolbar: MenuId.NotebookCellBetween,
          cellTopInsertToolbar: MenuId.NotebookCellListTop,
          cellExecuteToolbar: MenuId.InteractiveCellExecute,
          cellExecutePrimary: void 0
        },
        cellEditorContributions: EditorExtensionsRegistry.getSomeEditorContributions([
          SelectionClipboardContributionID,
          ContextMenuController.ID,
          ContentHoverController.ID,
          GlyphHoverController.ID,
          MarkerController.ID
        ]),
        options: this._notebookOptions,
        codeWindow: this.window
      },
      void 0,
      this.window
    );
    this._codeEditorWidget = this._instantiationService.createInstance(
      CodeEditorWidget,
      this._inputEditorContainer,
      this._editorOptions,
      {
        ...{
          isSimpleWidget: false,
          contributions: EditorExtensionsRegistry.getSomeEditorContributions([
            MenuPreventer.ID,
            SelectionClipboardContributionID,
            ContextMenuController.ID,
            SuggestController.ID,
            ParameterHintsController.ID,
            SnippetController2.ID,
            TabCompletionController.ID,
            ContentHoverController.ID,
            GlyphHoverController.ID,
            MarkerController.ID
          ])
        }
      }
    );
    if (this._lastLayoutDimensions) {
      this._notebookEditorContainer.style.height = `${this._lastLayoutDimensions.dimension.height - this.inputCellContainerHeight}px`;
      this._notebookWidget.value.layout(
        new DOM.Dimension(
          this._lastLayoutDimensions.dimension.width,
          this._lastLayoutDimensions.dimension.height - this.inputCellContainerHeight
        ),
        this._notebookEditorContainer
      );
      const leftMargin = this._notebookOptions.getCellEditorContainerLeftMargin();
      const maxHeight = Math.min(
        this._lastLayoutDimensions.dimension.height / 2,
        this.inputCellEditorHeight
      );
      this._codeEditorWidget.layout(
        this._validateDimension(
          this._lastLayoutDimensions.dimension.width - leftMargin - INPUT_CELL_HORIZONTAL_PADDING_RIGHT,
          maxHeight
        )
      );
      this._inputFocusIndicator.style.height = `${this.inputCellEditorHeight}px`;
      this._inputCellContainer.style.top = `${this._lastLayoutDimensions.dimension.height - this.inputCellContainerHeight}px`;
      this._inputCellContainer.style.width = `${this._lastLayoutDimensions.dimension.width}px`;
    }
    await super.setInput(input, options, context, token);
    const model = await input.resolve();
    if (this._runbuttonToolbar) {
      this._runbuttonToolbar.context = input.resource;
    }
    if (model === null) {
      throw new Error(
        "The Interactive Window model could not be resolved"
      );
    }
    this._notebookWidget.value?.setParentContextKeyService(
      this._contextKeyService
    );
    const viewState = options?.viewState ?? this._loadNotebookEditorViewState(input);
    await this._extensionService.whenInstalledExtensionsRegistered();
    await this._notebookWidget.value.setModel(
      model.notebook,
      viewState?.notebook
    );
    model.notebook.setCellCollapseDefault(
      this._notebookOptions.getCellCollapseDefault()
    );
    this._notebookWidget.value.setOptions({
      isReadOnly: true
    });
    this._widgetDisposableStore.add(
      this._notebookWidget.value.onDidResizeOutput((cvm) => {
        this._scrollIfNecessary(cvm);
      })
    );
    this._widgetDisposableStore.add(
      this._notebookWidget.value.onDidFocusWidget(
        () => this._onDidFocusWidget.fire()
      )
    );
    this._widgetDisposableStore.add(
      this._notebookOptions.onDidChangeOptions((e) => {
        if (e.compactView || e.focusIndicator) {
          this._styleElement?.remove();
          this._createLayoutStyles();
        }
        if (this._lastLayoutDimensions && this.isVisible()) {
          this.layout(
            this._lastLayoutDimensions.dimension,
            this._lastLayoutDimensions.position
          );
        }
        if (e.interactiveWindowCollapseCodeCells) {
          model.notebook.setCellCollapseDefault(
            this._notebookOptions.getCellCollapseDefault()
          );
        }
      })
    );
    const languageId = this._notebookWidget.value?.activeKernel?.supportedLanguages[0] ?? input.language ?? PLAINTEXT_LANGUAGE_ID;
    const editorModel = await input.resolveInput(languageId);
    editorModel.setLanguage(languageId);
    this._codeEditorWidget.setModel(editorModel);
    if (viewState?.input) {
      this._codeEditorWidget.restoreViewState(viewState.input);
    }
    this._editorOptions = this._computeEditorOptions();
    this._codeEditorWidget.updateOptions(this._editorOptions);
    this._widgetDisposableStore.add(
      this._codeEditorWidget.onDidFocusEditorWidget(
        () => this._onDidFocusWidget.fire()
      )
    );
    this._widgetDisposableStore.add(
      this._codeEditorWidget.onDidContentSizeChange((e) => {
        if (!e.contentHeightChanged) {
          return;
        }
        if (this._lastLayoutDimensions) {
          this._layoutWidgets(
            this._lastLayoutDimensions.dimension,
            this._lastLayoutDimensions.position
          );
        }
      })
    );
    this._widgetDisposableStore.add(
      this._codeEditorWidget.onDidChangeCursorPosition(
        (e) => this._onDidChangeSelection.fire({
          reason: this._toEditorPaneSelectionChangeReason(e)
        })
      )
    );
    this._widgetDisposableStore.add(
      this._codeEditorWidget.onDidChangeModelContent(
        () => this._onDidChangeSelection.fire({
          reason: EditorPaneSelectionChangeReason.EDIT
        })
      )
    );
    this._widgetDisposableStore.add(
      this._notebookKernelService.onDidChangeNotebookAffinity(
        this._syncWithKernel,
        this
      )
    );
    this._widgetDisposableStore.add(
      this._notebookKernelService.onDidChangeSelectedNotebooks(
        this._syncWithKernel,
        this
      )
    );
    this._widgetDisposableStore.add(
      this.themeService.onDidColorThemeChange(() => {
        if (this.isVisible()) {
          this._updateInputHint();
        }
      })
    );
    this._widgetDisposableStore.add(
      this._codeEditorWidget.onDidChangeModelContent(() => {
        if (this.isVisible()) {
          this._updateInputHint();
        }
      })
    );
    this._widgetDisposableStore.add(
      this._codeEditorWidget.onDidChangeModel(() => {
        this._updateInputHint();
      })
    );
    this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(
        InteractiveWindowSetting.showExecutionHint
      )) {
        this._updateInputHint();
      }
    });
    const cursorAtBoundaryContext = INTERACTIVE_INPUT_CURSOR_BOUNDARY.bindTo(this._contextKeyService);
    if (input.resource && input.historyService.has(input.resource)) {
      cursorAtBoundaryContext.set("top");
    } else {
      cursorAtBoundaryContext.set("none");
    }
    this._widgetDisposableStore.add(
      this._codeEditorWidget.onDidChangeCursorPosition(({ position }) => {
        const viewModel = this._codeEditorWidget._getViewModel();
        const lastLineNumber = viewModel.getLineCount();
        const lastLineCol = viewModel.getLineLength(lastLineNumber) + 1;
        const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(
          position
        );
        const firstLine = viewPosition.lineNumber === 1 && viewPosition.column === 1;
        const lastLine = viewPosition.lineNumber === lastLineNumber && viewPosition.column === lastLineCol;
        if (firstLine) {
          if (lastLine) {
            cursorAtBoundaryContext.set("both");
          } else {
            cursorAtBoundaryContext.set("top");
          }
        } else if (lastLine) {
          cursorAtBoundaryContext.set("bottom");
        } else {
          cursorAtBoundaryContext.set("none");
        }
      })
    );
    this._widgetDisposableStore.add(
      editorModel.onDidChangeContent(() => {
        const value = editorModel.getValue();
        if (this.input?.resource) {
          const historyService = this.input.historyService;
          if (!historyService.matchesCurrent(
            this.input.resource,
            value
          )) {
            historyService.replaceLast(this.input.resource, value);
          }
        }
      })
    );
    this._widgetDisposableStore.add(
      this._notebookWidget.value.onDidScroll(
        () => this._onDidChangeScroll.fire()
      )
    );
    this._syncWithKernel();
    this._updateInputHint();
  }
  setOptions(options) {
    this._notebookWidget.value?.setOptions(options);
    super.setOptions(options);
  }
  _toEditorPaneSelectionChangeReason(e) {
    switch (e.source) {
      case TextEditorSelectionSource.PROGRAMMATIC:
        return EditorPaneSelectionChangeReason.PROGRAMMATIC;
      case TextEditorSelectionSource.NAVIGATION:
        return EditorPaneSelectionChangeReason.NAVIGATION;
      case TextEditorSelectionSource.JUMP:
        return EditorPaneSelectionChangeReason.JUMP;
      default:
        return EditorPaneSelectionChangeReason.USER;
    }
  }
  _cellAtBottom(cell) {
    const visibleRanges = this._notebookWidget.value?.visibleRanges || [];
    const cellIndex = this._notebookWidget.value?.getCellIndex(cell);
    if (cellIndex === Math.max(...visibleRanges.map((range) => range.end - 1))) {
      return true;
    }
    return false;
  }
  _scrollIfNecessary(cvm) {
    const index = this._notebookWidget.value.getCellIndex(cvm);
    if (index === this._notebookWidget.value.getLength() - 1) {
      if (this._configurationService.getValue(
        InteractiveWindowSetting.interactiveWindowAlwaysScrollOnNewCell
      ) || this._cellAtBottom(cvm)) {
        this._notebookWidget.value.scrollToBottom();
      }
    }
  }
  _syncWithKernel() {
    const notebook = this._notebookWidget.value?.textModel;
    const textModel = this._codeEditorWidget.getModel();
    if (notebook && textModel) {
      const info = this._notebookKernelService.getMatchingKernel(notebook);
      const selectedOrSuggested = info.selected ?? (info.suggestions.length === 1 ? info.suggestions[0] : void 0) ?? (info.all.length === 1 ? info.all[0] : void 0);
      if (selectedOrSuggested) {
        const language = selectedOrSuggested.supportedLanguages[0];
        if (language && language !== "plaintext") {
          const newMode = this._languageService.createById(language).languageId;
          textModel.setLanguage(newMode);
        }
        NOTEBOOK_KERNEL.bindTo(this._contextKeyService).set(
          selectedOrSuggested.id
        );
      }
    }
  }
  layout(dimension, position) {
    this._rootElement.classList.toggle(
      "mid-width",
      dimension.width < 1e3 && dimension.width >= 600
    );
    this._rootElement.classList.toggle(
      "narrow-width",
      dimension.width < 600
    );
    const editorHeightChanged = dimension.height !== this._lastLayoutDimensions?.dimension.height;
    this._lastLayoutDimensions = { dimension, position };
    if (!this._notebookWidget.value) {
      return;
    }
    if (editorHeightChanged && this._codeEditorWidget) {
      SuggestController.get(
        this._codeEditorWidget
      )?.cancelSuggestWidget();
    }
    this._notebookEditorContainer.style.height = `${this._lastLayoutDimensions.dimension.height - this.inputCellContainerHeight}px`;
    this._layoutWidgets(dimension, position);
  }
  _layoutWidgets(dimension, position) {
    const contentHeight = this._codeEditorWidget.hasModel() ? this._codeEditorWidget.getContentHeight() : this.inputCellEditorHeight;
    const maxHeight = Math.min(dimension.height / 2, contentHeight);
    const leftMargin = this._notebookOptions.getCellEditorContainerLeftMargin();
    const inputCellContainerHeight = maxHeight + INPUT_CELL_VERTICAL_PADDING * 2;
    this._notebookEditorContainer.style.height = `${dimension.height - inputCellContainerHeight}px`;
    this._notebookWidget.value.layout(
      dimension.with(
        dimension.width,
        dimension.height - inputCellContainerHeight
      ),
      this._notebookEditorContainer,
      position
    );
    this._codeEditorWidget.layout(
      this._validateDimension(
        dimension.width - leftMargin - INPUT_CELL_HORIZONTAL_PADDING_RIGHT,
        maxHeight
      )
    );
    this._inputFocusIndicator.style.height = `${contentHeight}px`;
    this._inputCellContainer.style.top = `${dimension.height - inputCellContainerHeight}px`;
    this._inputCellContainer.style.width = `${dimension.width}px`;
  }
  _validateDimension(width, height) {
    return new DOM.Dimension(Math.max(0, width), Math.max(0, height));
  }
  _updateInputHint() {
    if (!this._codeEditorWidget) {
      return;
    }
    const shouldHide = !this._codeEditorWidget.hasModel() || this._configurationService.getValue(
      InteractiveWindowSetting.showExecutionHint
    ) === false || this._codeEditorWidget.getModel().getValueLength() !== 0;
    if (!this._hintElement && !shouldHide) {
      this._hintElement = this._instantiationService.createInstance(
        ReplInputHintContentWidget,
        this._codeEditorWidget
      );
    } else if (this._hintElement && shouldHide) {
      this._hintElement.dispose();
      this._hintElement = void 0;
    }
  }
  getScrollPosition() {
    return {
      scrollTop: this._notebookWidget.value?.scrollTop ?? 0,
      scrollLeft: 0
    };
  }
  setScrollPosition(position) {
    this._notebookWidget.value?.setScrollTop(position.scrollTop);
  }
  focus() {
    super.focus();
    this._notebookWidget.value?.onShow();
    this._codeEditorWidget.focus();
  }
  focusHistory() {
    this._notebookWidget.value.focus();
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    this._groupListener.value = this.group.onWillCloseEditor(
      (e) => this._saveEditorViewState(e.editor)
    );
    if (!visible) {
      this._saveEditorViewState(this.input);
      if (this.input && this._notebookWidget.value) {
        this._notebookWidget.value.onWillHide();
      }
    }
    this._updateInputHint();
  }
  clearInput() {
    if (this._notebookWidget.value) {
      this._saveEditorViewState(this.input);
      this._notebookWidget.value.onWillHide();
    }
    this._codeEditorWidget?.dispose();
    this._notebookWidget = { value: void 0 };
    this._widgetDisposableStore.clear();
    super.clearInput();
  }
  getControl() {
    return {
      notebookEditor: this._notebookWidget.value,
      codeEditor: this._codeEditorWidget
    };
  }
};
InteractiveEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, INotebookEditorService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, ICodeEditorService),
  __decorateParam(8, INotebookKernelService),
  __decorateParam(9, ILanguageService),
  __decorateParam(10, IKeybindingService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, IMenuService),
  __decorateParam(13, IContextMenuService),
  __decorateParam(14, IEditorGroupsService),
  __decorateParam(15, ITextResourceConfigurationService),
  __decorateParam(16, INotebookExecutionStateService),
  __decorateParam(17, IExtensionService)
], InteractiveEditor);
export {
  InteractiveEditor
};
//# sourceMappingURL=interactiveEditor.js.map
