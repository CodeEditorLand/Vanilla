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
import * as DOM from "../../../../../../base/browser/dom.js";
import { renderMarkdown } from "../../../../../../base/browser/markdownRenderer.js";
import { Action } from "../../../../../../base/common/actions.js";
import {
  Disposable,
  DisposableStore
} from "../../../../../../base/common/lifecycle.js";
import { MarshalledId } from "../../../../../../base/common/marshallingIds.js";
import {
  autorun,
  observableValue
} from "../../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import * as nls from "../../../../../../nls.js";
import { createAndFillInActionBarActions } from "../../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { WorkbenchToolBar } from "../../../../../../platform/actions/browser/toolbar.js";
import {
  IMenuService,
  MenuId
} from "../../../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IOpenerService } from "../../../../../../platform/opener/common/opener.js";
import {
  IQuickInputService
} from "../../../../../../platform/quickinput/common/quickInput.js";
import { ViewContainerLocation } from "../../../../../common/views.js";
import { IPaneCompositePartService } from "../../../../../services/panecomposite/browser/panecomposite.js";
import {
  VIEWLET_ID as EXTENSION_VIEWLET_ID
} from "../../../../extensions/common/extensions.js";
import {
  CellUri,
  isTextStreamMime,
  NotebookCellExecutionState,
  RENDERER_NOT_AVAILABLE
} from "../../../common/notebookCommon.js";
import {
  NOTEBOOK_CELL_HAS_HIDDEN_OUTPUTS,
  NOTEBOOK_CELL_IS_FIRST_OUTPUT
} from "../../../common/notebookContextKeys.js";
import { INotebookExecutionStateService } from "../../../common/notebookExecutionStateService.js";
import { INotebookService } from "../../../common/notebookService.js";
import { TEXT_BASED_MIMETYPES } from "../../contrib/clipboard/cellOutputClipboard.js";
import { COPY_OUTPUT_COMMAND_ID } from "../../controller/cellOutputActions.js";
import {
  JUPYTER_EXTENSION_ID,
  RenderOutputType
} from "../../notebookBrowser.js";
import { mimetypeIcon } from "../../notebookIcons.js";
import { CellContentPart } from "../cellPart.js";
let CellOutputElement = class extends Disposable {
  constructor(notebookEditor, viewCell, cellOutputContainer, outputContainer, output, notebookService, quickInputService, parentContextKeyService, menuService, paneCompositeService, instantiationService) {
    super();
    this.notebookEditor = notebookEditor;
    this.viewCell = viewCell;
    this.cellOutputContainer = cellOutputContainer;
    this.outputContainer = outputContainer;
    this.output = output;
    this.notebookService = notebookService;
    this.quickInputService = quickInputService;
    this.menuService = menuService;
    this.paneCompositeService = paneCompositeService;
    this.instantiationService = instantiationService;
    this.contextKeyService = parentContextKeyService;
    this._register(
      this.output.model.onDidChangeData(() => {
        this.rerender();
      })
    );
    this._register(
      this.output.onDidResetRenderer(() => {
        this.rerender();
      })
    );
  }
  toolbarDisposables = this._register(new DisposableStore());
  innerContainer;
  renderedOutputContainer;
  renderResult;
  contextKeyService;
  toolbarAttached = false;
  detach() {
    this.renderedOutputContainer?.remove();
    let count = 0;
    if (this.innerContainer) {
      for (let i = 0; i < this.innerContainer.childNodes.length; i++) {
        if (this.innerContainer.childNodes[i].className === "rendered-output") {
          count++;
        }
        if (count > 1) {
          break;
        }
      }
      if (count === 0) {
        this.innerContainer.remove();
      }
    }
    this.notebookEditor.removeInset(this.output);
  }
  updateDOMTop(top) {
    if (this.innerContainer) {
      this.innerContainer.style.top = `${top}px`;
    }
  }
  rerender() {
    if (this.notebookEditor.hasModel() && this.innerContainer && this.renderResult && this.renderResult.type === RenderOutputType.Extension) {
      const [mimeTypes, pick] = this.output.resolveMimeTypes(
        this.notebookEditor.textModel,
        this.notebookEditor.activeKernel?.preloadProvides
      );
      const pickedMimeType = mimeTypes[pick];
      if (pickedMimeType.mimeType === this.renderResult.mimeType && pickedMimeType.rendererId === this.renderResult.renderer.id) {
        const index = this.viewCell.outputsViewModels.indexOf(
          this.output
        );
        this.notebookEditor.updateOutput(
          this.viewCell,
          this.renderResult,
          this.viewCell.getOutputOffset(index)
        );
        return;
      }
    }
    if (this.innerContainer) {
      const nextElement = this.innerContainer.nextElementSibling;
      this.toolbarDisposables.clear();
      const element = this.innerContainer;
      if (element) {
        element.remove();
        this.notebookEditor.removeInset(this.output);
      }
      this.render(nextElement);
    } else {
      const currOutputIndex = this.cellOutputContainer.renderedOutputEntries.findIndex(
        (entry) => entry.element === this
      );
      const previousSibling = currOutputIndex > 0 && !!this.cellOutputContainer.renderedOutputEntries[currOutputIndex - 1].element.innerContainer?.parentElement ? this.cellOutputContainer.renderedOutputEntries[currOutputIndex - 1].element.innerContainer : void 0;
      this.render(previousSibling);
    }
    this._relayoutCell();
  }
  // insert after previousSibling
  _generateInnerOutputContainer(previousSibling, pickedMimeTypeRenderer) {
    this.innerContainer = DOM.$(".output-inner-container");
    if (previousSibling && previousSibling.nextElementSibling) {
      this.outputContainer.domNode.insertBefore(
        this.innerContainer,
        previousSibling.nextElementSibling
      );
    } else {
      this.outputContainer.domNode.appendChild(this.innerContainer);
    }
    this.innerContainer.setAttribute(
      "output-mime-type",
      pickedMimeTypeRenderer.mimeType
    );
    return this.innerContainer;
  }
  render(previousSibling) {
    const index = this.viewCell.outputsViewModels.indexOf(this.output);
    if (this.viewCell.isOutputCollapsed || !this.notebookEditor.hasModel()) {
      this.cellOutputContainer.flagAsStale();
      return void 0;
    }
    const notebookUri = CellUri.parse(this.viewCell.uri)?.notebook;
    if (!notebookUri) {
      return void 0;
    }
    const notebookTextModel = this.notebookEditor.textModel;
    const [mimeTypes, pick] = this.output.resolveMimeTypes(
      notebookTextModel,
      this.notebookEditor.activeKernel?.preloadProvides
    );
    if (!mimeTypes.find((mimeType) => mimeType.isTrusted) || mimeTypes.length === 0) {
      this.viewCell.updateOutputHeight(
        index,
        0,
        "CellOutputElement#noMimeType"
      );
      return void 0;
    }
    const selectedPresentation = mimeTypes[pick];
    let renderer = this.notebookService.getRendererInfo(
      selectedPresentation.rendererId
    );
    if (!renderer && selectedPresentation.mimeType.indexOf("text/") > -1) {
      renderer = this.notebookService.getRendererInfo(
        "vscode.builtin-renderer"
      );
    }
    const innerContainer = this._generateInnerOutputContainer(
      previousSibling,
      selectedPresentation
    );
    if (index === 0 || this.output.visible.get()) {
      this._attachToolbar(
        innerContainer,
        notebookTextModel,
        this.notebookEditor.activeKernel,
        index,
        mimeTypes
      );
    } else {
      this._register(
        autorun((reader) => {
          const visible = reader.readObservable(this.output.visible);
          if (visible && !this.toolbarAttached) {
            this._attachToolbar(
              innerContainer,
              notebookTextModel,
              this.notebookEditor.activeKernel,
              index,
              mimeTypes
            );
          } else if (!visible) {
            this.toolbarDisposables.clear();
          }
          this.cellOutputContainer.checkForHiddenOutputs();
        })
      );
      this.cellOutputContainer.hasHiddenOutputs.set(true, void 0);
    }
    this.renderedOutputContainer = DOM.append(
      innerContainer,
      DOM.$(".rendered-output")
    );
    this.renderResult = renderer ? {
      type: RenderOutputType.Extension,
      renderer,
      source: this.output,
      mimeType: selectedPresentation.mimeType
    } : this._renderMissingRenderer(
      this.output,
      selectedPresentation.mimeType
    );
    this.output.pickedMimeType = selectedPresentation;
    if (!this.renderResult) {
      this.viewCell.updateOutputHeight(
        index,
        0,
        "CellOutputElement#renderResultUndefined"
      );
      return void 0;
    }
    this.notebookEditor.createOutput(
      this.viewCell,
      this.renderResult,
      this.viewCell.getOutputOffset(index),
      false
    );
    innerContainer.classList.add("background");
    return { initRenderIsSynchronous: false };
  }
  _renderMissingRenderer(viewModel, preferredMimeType) {
    if (!viewModel.model.outputs.length) {
      return this._renderMessage(
        viewModel,
        nls.localize("empty", "Cell has no output")
      );
    }
    if (!preferredMimeType) {
      const mimeTypes = viewModel.model.outputs.map((op) => op.mime);
      const mimeTypesMessage = mimeTypes.join(", ");
      return this._renderMessage(
        viewModel,
        nls.localize(
          "noRenderer.2",
          "No renderer could be found for output. It has the following mimetypes: {0}",
          mimeTypesMessage
        )
      );
    }
    return this._renderSearchForMimetype(viewModel, preferredMimeType);
  }
  _renderSearchForMimetype(viewModel, mimeType) {
    const query = `@tag:notebookRenderer ${mimeType}`;
    const p = DOM.$(
      "p",
      void 0,
      `No renderer could be found for mimetype "${mimeType}", but one might be available on the Marketplace.`
    );
    const a = DOM.$(
      "a",
      {
        href: `command:workbench.extensions.search?%22${query}%22`,
        class: "monaco-button monaco-text-button",
        tabindex: 0,
        role: "button",
        style: "padding: 8px; text-decoration: none; color: rgb(255, 255, 255); background-color: rgb(14, 99, 156); max-width: 200px;"
      },
      `Search Marketplace`
    );
    return {
      type: RenderOutputType.Html,
      source: viewModel,
      htmlContent: p.outerHTML + a.outerHTML
    };
  }
  _renderMessage(viewModel, message) {
    const el = DOM.$("p", void 0, message);
    return {
      type: RenderOutputType.Html,
      source: viewModel,
      htmlContent: el.outerHTML
    };
  }
  shouldEnableCopy(mimeTypes) {
    if (!mimeTypes.find(
      (mimeType) => TEXT_BASED_MIMETYPES.indexOf(mimeType.mimeType) || mimeType.mimeType.startsWith("image/")
    )) {
      return false;
    }
    if (isTextStreamMime(mimeTypes[0].mimeType)) {
      const cellViewModel = this.output.cellViewModel;
      const index = cellViewModel.outputsViewModels.indexOf(this.output);
      if (index > 0) {
        const previousOutput = cellViewModel.model.outputs[index - 1];
        return !isTextStreamMime(previousOutput.outputs[0].mime);
      }
    }
    return true;
  }
  async _attachToolbar(outputItemDiv, notebookTextModel, kernel, index, mimeTypes) {
    const hasMultipleMimeTypes = mimeTypes.filter((mimeType) => mimeType.isTrusted).length > 1;
    const isCopyEnabled = this.shouldEnableCopy(mimeTypes);
    if (index > 0 && !hasMultipleMimeTypes && !isCopyEnabled) {
      return;
    }
    if (!this.notebookEditor.hasModel()) {
      return;
    }
    outputItemDiv.style.position = "relative";
    const mimeTypePicker = DOM.$(".cell-output-toolbar");
    outputItemDiv.appendChild(mimeTypePicker);
    const toolbar = this.toolbarDisposables.add(
      this.instantiationService.createInstance(
        WorkbenchToolBar,
        mimeTypePicker,
        {
          renderDropdownAsChildElement: false
        }
      )
    );
    toolbar.context = {
      ui: true,
      cell: this.output.cellViewModel,
      outputViewModel: this.output,
      notebookEditor: this.notebookEditor,
      $mid: MarshalledId.NotebookCellActionContext
    };
    const pickAction = this.toolbarDisposables.add(
      new Action(
        "notebook.output.pickMimetype",
        nls.localize("pickMimeType", "Change Presentation"),
        ThemeIcon.asClassName(mimetypeIcon),
        void 0,
        async (_context) => this._pickActiveMimeTypeRenderer(
          outputItemDiv,
          notebookTextModel,
          kernel,
          this.output
        )
      )
    );
    const menuContextKeyService = this.toolbarDisposables.add(
      this.contextKeyService.createScoped(outputItemDiv)
    );
    const hasHiddenOutputs = NOTEBOOK_CELL_HAS_HIDDEN_OUTPUTS.bindTo(
      menuContextKeyService
    );
    const isFirstCellOutput = NOTEBOOK_CELL_IS_FIRST_OUTPUT.bindTo(
      menuContextKeyService
    );
    isFirstCellOutput.set(index === 0);
    this.toolbarDisposables.add(
      autorun((reader) => {
        hasHiddenOutputs.set(
          reader.readObservable(
            this.cellOutputContainer.hasHiddenOutputs
          )
        );
      })
    );
    const menu = this.toolbarDisposables.add(
      this.menuService.createMenu(
        MenuId.NotebookOutputToolbar,
        menuContextKeyService
      )
    );
    const updateMenuToolbar = () => {
      const primary = [];
      let secondary = [];
      const result = { primary, secondary };
      createAndFillInActionBarActions(
        menu,
        { shouldForwardArgs: true },
        result,
        () => false
      );
      if (!isCopyEnabled) {
        secondary = secondary.filter(
          (action) => action.id !== COPY_OUTPUT_COMMAND_ID
        );
      }
      if (hasMultipleMimeTypes) {
        secondary = [pickAction, ...secondary];
      }
      toolbar.setActions([], secondary);
    };
    updateMenuToolbar();
    this.toolbarDisposables.add(menu.onDidChange(updateMenuToolbar));
  }
  async _pickActiveMimeTypeRenderer(outputItemDiv, notebookTextModel, kernel, viewModel) {
    const [mimeTypes, currIndex] = viewModel.resolveMimeTypes(
      notebookTextModel,
      kernel?.preloadProvides
    );
    const items = [];
    const unsupportedItems = [];
    mimeTypes.forEach((mimeType2, index) => {
      if (mimeType2.isTrusted) {
        const arr = mimeType2.rendererId === RENDERER_NOT_AVAILABLE ? unsupportedItems : items;
        arr.push({
          label: mimeType2.mimeType,
          id: mimeType2.mimeType,
          index,
          picked: index === currIndex,
          detail: this._generateRendererInfo(mimeType2.rendererId),
          description: index === currIndex ? nls.localize(
            "curruentActiveMimeType",
            "Currently Active"
          ) : void 0
        });
      }
    });
    if (unsupportedItems.some(
      (m) => JUPYTER_RENDERER_MIMETYPES.includes(m.id)
    )) {
      unsupportedItems.push({
        label: nls.localize(
          "installJupyterPrompt",
          "Install additional renderers from the marketplace"
        ),
        id: "installRenderers",
        index: mimeTypes.length
      });
    }
    const disposables = new DisposableStore();
    const picker = disposables.add(
      this.quickInputService.createQuickPick({ useSeparators: true })
    );
    picker.items = [...items, { type: "separator" }, ...unsupportedItems];
    picker.activeItems = items.filter((item) => !!item.picked);
    picker.placeholder = items.length !== mimeTypes.length ? nls.localize(
      "promptChooseMimeTypeInSecure.placeHolder",
      "Select mimetype to render for current output"
    ) : nls.localize(
      "promptChooseMimeType.placeHolder",
      "Select mimetype to render for current output"
    );
    const pick = await new Promise(
      (resolve) => {
        disposables.add(
          picker.onDidAccept(() => {
            resolve(
              picker.selectedItems.length === 1 ? picker.selectedItems[0] : void 0
            );
            disposables.dispose();
          })
        );
        picker.show();
      }
    );
    if (pick === void 0 || pick.index === currIndex) {
      return;
    }
    if (pick.id === "installRenderers") {
      this._showJupyterExtension();
      return;
    }
    const nextElement = outputItemDiv.nextElementSibling;
    this.toolbarDisposables.clear();
    const element = this.innerContainer;
    if (element) {
      element.remove();
      this.notebookEditor.removeInset(viewModel);
    }
    viewModel.pickedMimeType = mimeTypes[pick.index];
    this.viewCell.updateOutputMinHeight(
      this.viewCell.layoutInfo.outputTotalHeight
    );
    const { mimeType, rendererId } = mimeTypes[pick.index];
    this.notebookService.updateMimePreferredRenderer(
      notebookTextModel.viewType,
      mimeType,
      rendererId,
      mimeTypes.map((m) => m.mimeType)
    );
    this.render(nextElement);
    this._validateFinalOutputHeight(false);
    this._relayoutCell();
  }
  async _showJupyterExtension() {
    const viewlet = await this.paneCompositeService.openPaneComposite(
      EXTENSION_VIEWLET_ID,
      ViewContainerLocation.Sidebar,
      true
    );
    const view = viewlet?.getViewPaneContainer();
    view?.search(`@id:${JUPYTER_EXTENSION_ID}`);
  }
  _generateRendererInfo(renderId) {
    const renderInfo = this.notebookService.getRendererInfo(renderId);
    if (renderInfo) {
      const displayName = renderInfo.displayName !== "" ? renderInfo.displayName : renderInfo.id;
      return `${displayName} (${renderInfo.extensionId.value})`;
    }
    return nls.localize("unavailableRenderInfo", "renderer not available");
  }
  _outputHeightTimer = null;
  _validateFinalOutputHeight(synchronous) {
    if (this._outputHeightTimer !== null) {
      clearTimeout(this._outputHeightTimer);
    }
    if (synchronous) {
      this.viewCell.unlockOutputHeight();
    } else {
      this._outputHeightTimer = setTimeout(() => {
        this.viewCell.unlockOutputHeight();
      }, 1e3);
    }
  }
  _relayoutCell() {
    this.notebookEditor.layoutNotebookCell(
      this.viewCell,
      this.viewCell.layoutInfo.totalHeight
    );
  }
  dispose() {
    if (this._outputHeightTimer) {
      this.viewCell.unlockOutputHeight();
      clearTimeout(this._outputHeightTimer);
    }
    super.dispose();
  }
};
CellOutputElement = __decorateClass([
  __decorateParam(5, INotebookService),
  __decorateParam(6, IQuickInputService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IMenuService),
  __decorateParam(9, IPaneCompositePartService),
  __decorateParam(10, IInstantiationService)
], CellOutputElement);
class OutputEntryViewHandler {
  constructor(model, element) {
    this.model = model;
    this.element = element;
  }
}
var CellOutputUpdateContext = /* @__PURE__ */ ((CellOutputUpdateContext2) => {
  CellOutputUpdateContext2[CellOutputUpdateContext2["Execution"] = 1] = "Execution";
  CellOutputUpdateContext2[CellOutputUpdateContext2["Other"] = 2] = "Other";
  return CellOutputUpdateContext2;
})(CellOutputUpdateContext || {});
let CellOutputContainer = class extends CellContentPart {
  constructor(notebookEditor, viewCell, templateData, options, openerService, _notebookExecutionStateService, instantiationService) {
    super();
    this.notebookEditor = notebookEditor;
    this.viewCell = viewCell;
    this.templateData = templateData;
    this.options = options;
    this.openerService = openerService;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this.instantiationService = instantiationService;
    this._register(
      viewCell.onDidStartExecution(() => {
        viewCell.updateOutputMinHeight(
          viewCell.layoutInfo.outputTotalHeight
        );
      })
    );
    this._register(
      viewCell.onDidStopExecution(() => {
        this._validateFinalOutputHeight(false);
      })
    );
    this._register(
      viewCell.onDidChangeOutputs((splice) => {
        const executionState = this._notebookExecutionStateService.getCellExecution(
          viewCell.uri
        );
        const context = executionState ? 1 /* Execution */ : 2 /* Other */;
        this._updateOutputs(splice, context);
      })
    );
    this._register(
      viewCell.onDidChangeLayout(() => {
        this.updateInternalLayoutNow(viewCell);
      })
    );
  }
  _outputEntries = [];
  _hasStaleOutputs = false;
  hasHiddenOutputs = observableValue("hasHiddenOutputs", false);
  checkForHiddenOutputs() {
    if (this._outputEntries.find((entry) => {
      return entry.model.visible;
    })) {
      this.hasHiddenOutputs.set(true, void 0);
    } else {
      this.hasHiddenOutputs.set(false, void 0);
    }
  }
  get renderedOutputEntries() {
    return this._outputEntries;
  }
  updateInternalLayoutNow(viewCell) {
    this.templateData.outputContainer.setTop(
      viewCell.layoutInfo.outputContainerOffset
    );
    this.templateData.outputShowMoreContainer.setTop(
      viewCell.layoutInfo.outputShowMoreContainerOffset
    );
    this._outputEntries.forEach((entry) => {
      const index = this.viewCell.outputsViewModels.indexOf(entry.model);
      if (index >= 0) {
        const top = this.viewCell.getOutputOffsetInContainer(index);
        entry.element.updateDOMTop(top);
      }
    });
  }
  render() {
    try {
      this._doRender();
    } finally {
      this._relayoutCell();
    }
  }
  /**
   * Notify that an output may have been swapped out without the model getting rendered.
   */
  flagAsStale() {
    this._hasStaleOutputs = true;
  }
  _doRender() {
    if (this.viewCell.outputsViewModels.length > 0) {
      if (this.viewCell.layoutInfo.outputTotalHeight !== 0) {
        this.viewCell.updateOutputMinHeight(
          this.viewCell.layoutInfo.outputTotalHeight
        );
      }
      DOM.show(this.templateData.outputContainer.domNode);
      for (let index = 0; index < Math.min(
        this.options.limit,
        this.viewCell.outputsViewModels.length
      ); index++) {
        const currOutput = this.viewCell.outputsViewModels[index];
        const entry = this.instantiationService.createInstance(
          CellOutputElement,
          this.notebookEditor,
          this.viewCell,
          this,
          this.templateData.outputContainer,
          currOutput
        );
        this._outputEntries.push(
          new OutputEntryViewHandler(currOutput, entry)
        );
        entry.render(void 0);
      }
      if (this.viewCell.outputsViewModels.length > this.options.limit) {
        DOM.show(this.templateData.outputShowMoreContainer.domNode);
        this.viewCell.updateOutputShowMoreContainerHeight(46);
      }
      this._validateFinalOutputHeight(false);
    } else {
      DOM.hide(this.templateData.outputContainer.domNode);
    }
    this.templateData.outputShowMoreContainer.domNode.innerText = "";
    if (this.viewCell.outputsViewModels.length > this.options.limit) {
      this.templateData.outputShowMoreContainer.domNode.appendChild(
        this._generateShowMoreElement(
          this.templateData.templateDisposables
        )
      );
    } else {
      DOM.hide(this.templateData.outputShowMoreContainer.domNode);
      this.viewCell.updateOutputShowMoreContainerHeight(0);
    }
  }
  viewUpdateShowOutputs(initRendering) {
    if (this._hasStaleOutputs) {
      this._hasStaleOutputs = false;
      this._outputEntries.forEach((entry) => {
        entry.element.rerender();
      });
    }
    for (let index = 0; index < this._outputEntries.length; index++) {
      const viewHandler = this._outputEntries[index];
      const outputEntry = viewHandler.element;
      if (outputEntry.renderResult) {
        this.notebookEditor.createOutput(
          this.viewCell,
          outputEntry.renderResult,
          this.viewCell.getOutputOffset(index),
          false
        );
      } else {
        outputEntry.render(void 0);
      }
    }
    this._relayoutCell();
  }
  viewUpdateHideOuputs() {
    for (let index = 0; index < this._outputEntries.length; index++) {
      this.notebookEditor.hideInset(this._outputEntries[index].model);
    }
  }
  _outputHeightTimer = null;
  _validateFinalOutputHeight(synchronous) {
    if (this._outputHeightTimer !== null) {
      clearTimeout(this._outputHeightTimer);
    }
    const executionState = this._notebookExecutionStateService.getCellExecution(
      this.viewCell.uri
    );
    if (synchronous) {
      this.viewCell.unlockOutputHeight();
    } else if (executionState?.state !== NotebookCellExecutionState.Executing) {
      this._outputHeightTimer = setTimeout(() => {
        this.viewCell.unlockOutputHeight();
      }, 200);
    }
  }
  _updateOutputs(splice, context = 2 /* Other */) {
    const previousOutputHeight = this.viewCell.layoutInfo.outputTotalHeight;
    this.viewCell.updateOutputMinHeight(previousOutputHeight);
    if (this.viewCell.outputsViewModels.length) {
      DOM.show(this.templateData.outputContainer.domNode);
    } else {
      DOM.hide(this.templateData.outputContainer.domNode);
    }
    this.viewCell.spliceOutputHeights(
      splice.start,
      splice.deleteCount,
      splice.newOutputs.map((_) => 0)
    );
    this._renderNow(splice, context);
  }
  _renderNow(splice, context) {
    if (splice.start >= this.options.limit) {
      return;
    }
    const firstGroupEntries = this._outputEntries.slice(0, splice.start);
    const deletedEntries = this._outputEntries.slice(
      splice.start,
      splice.start + splice.deleteCount
    );
    const secondGroupEntries = this._outputEntries.slice(
      splice.start + splice.deleteCount
    );
    let newlyInserted = this.viewCell.outputsViewModels.slice(
      splice.start,
      splice.start + splice.newOutputs.length
    );
    if (firstGroupEntries.length + newlyInserted.length + secondGroupEntries.length > this.options.limit) {
      if (firstGroupEntries.length + newlyInserted.length > this.options.limit) {
        [...deletedEntries, ...secondGroupEntries].forEach((entry) => {
          entry.element.detach();
          entry.element.dispose();
        });
        newlyInserted = newlyInserted.slice(
          0,
          this.options.limit - firstGroupEntries.length
        );
        const newlyInsertedEntries = newlyInserted.map((insert) => {
          return new OutputEntryViewHandler(
            insert,
            this.instantiationService.createInstance(
              CellOutputElement,
              this.notebookEditor,
              this.viewCell,
              this,
              this.templateData.outputContainer,
              insert
            )
          );
        });
        this._outputEntries = [
          ...firstGroupEntries,
          ...newlyInsertedEntries
        ];
        for (let i = firstGroupEntries.length; i < this._outputEntries.length; i++) {
          this._outputEntries[i].element.render(void 0);
        }
      } else {
        const elementsPushedOutOfView = secondGroupEntries.slice(
          this.options.limit - firstGroupEntries.length - newlyInserted.length
        );
        [...deletedEntries, ...elementsPushedOutOfView].forEach(
          (entry) => {
            entry.element.detach();
            entry.element.dispose();
          }
        );
        const reRenderRightBoundary = firstGroupEntries.length + newlyInserted.length;
        const newlyInsertedEntries = newlyInserted.map((insert) => {
          return new OutputEntryViewHandler(
            insert,
            this.instantiationService.createInstance(
              CellOutputElement,
              this.notebookEditor,
              this.viewCell,
              this,
              this.templateData.outputContainer,
              insert
            )
          );
        });
        this._outputEntries = [
          ...firstGroupEntries,
          ...newlyInsertedEntries,
          ...secondGroupEntries.slice(
            0,
            this.options.limit - firstGroupEntries.length - newlyInserted.length
          )
        ];
        for (let i = firstGroupEntries.length; i < reRenderRightBoundary; i++) {
          const previousSibling = i - 1 >= 0 && this._outputEntries[i - 1] && !!this._outputEntries[i - 1].element.innerContainer?.parentElement ? this._outputEntries[i - 1].element.innerContainer : void 0;
          this._outputEntries[i].element.render(previousSibling);
        }
      }
    } else {
      deletedEntries.forEach((entry) => {
        entry.element.detach();
        entry.element.dispose();
      });
      const reRenderRightBoundary = firstGroupEntries.length + newlyInserted.length;
      const newlyInsertedEntries = newlyInserted.map((insert) => {
        return new OutputEntryViewHandler(
          insert,
          this.instantiationService.createInstance(
            CellOutputElement,
            this.notebookEditor,
            this.viewCell,
            this,
            this.templateData.outputContainer,
            insert
          )
        );
      });
      let outputsNewlyAvailable = [];
      if (firstGroupEntries.length + newlyInsertedEntries.length + secondGroupEntries.length < this.viewCell.outputsViewModels.length) {
        const last = Math.min(
          this.options.limit,
          this.viewCell.outputsViewModels.length
        );
        outputsNewlyAvailable = this.viewCell.outputsViewModels.slice(
          firstGroupEntries.length + newlyInsertedEntries.length + secondGroupEntries.length,
          last
        ).map((output) => {
          return new OutputEntryViewHandler(
            output,
            this.instantiationService.createInstance(
              CellOutputElement,
              this.notebookEditor,
              this.viewCell,
              this,
              this.templateData.outputContainer,
              output
            )
          );
        });
      }
      this._outputEntries = [
        ...firstGroupEntries,
        ...newlyInsertedEntries,
        ...secondGroupEntries,
        ...outputsNewlyAvailable
      ];
      for (let i = firstGroupEntries.length; i < reRenderRightBoundary; i++) {
        const previousSibling = i - 1 >= 0 && this._outputEntries[i - 1] && !!this._outputEntries[i - 1].element.innerContainer?.parentElement ? this._outputEntries[i - 1].element.innerContainer : void 0;
        this._outputEntries[i].element.render(previousSibling);
      }
      for (let i = 0; i < outputsNewlyAvailable.length; i++) {
        this._outputEntries[firstGroupEntries.length + newlyInserted.length + secondGroupEntries.length + i].element.render(void 0);
      }
    }
    if (this.viewCell.outputsViewModels.length > this.options.limit) {
      DOM.show(this.templateData.outputShowMoreContainer.domNode);
      if (!this.templateData.outputShowMoreContainer.domNode.hasChildNodes()) {
        this.templateData.outputShowMoreContainer.domNode.appendChild(
          this._generateShowMoreElement(
            this.templateData.templateDisposables
          )
        );
      }
      this.viewCell.updateOutputShowMoreContainerHeight(46);
    } else {
      DOM.hide(this.templateData.outputShowMoreContainer.domNode);
    }
    this._relayoutCell();
    this._validateFinalOutputHeight(
      context === 2 /* Other */ && this.viewCell.outputsViewModels.length === 0
    );
  }
  _generateShowMoreElement(disposables) {
    const md = {
      value: `There are more than ${this.options.limit} outputs, [show more (open the raw output data in a text editor) ...](command:workbench.action.openLargeOutput)`,
      isTrusted: true,
      supportThemeIcons: true
    };
    const rendered = renderMarkdown(md, {
      actionHandler: {
        callback: (content) => {
          if (content === "command:workbench.action.openLargeOutput") {
            this.openerService.open(
              CellUri.generateCellOutputUri(
                this.notebookEditor.textModel.uri
              )
            );
          }
          return;
        },
        disposables
      }
    });
    disposables.add(rendered);
    rendered.element.classList.add("output-show-more");
    return rendered.element;
  }
  _relayoutCell() {
    this.notebookEditor.layoutNotebookCell(
      this.viewCell,
      this.viewCell.layoutInfo.totalHeight
    );
  }
  dispose() {
    this.viewCell.updateOutputMinHeight(0);
    if (this._outputHeightTimer) {
      clearTimeout(this._outputHeightTimer);
    }
    this._outputEntries.forEach((entry) => {
      entry.element.dispose();
    });
    super.dispose();
  }
};
CellOutputContainer = __decorateClass([
  __decorateParam(4, IOpenerService),
  __decorateParam(5, INotebookExecutionStateService),
  __decorateParam(6, IInstantiationService)
], CellOutputContainer);
const JUPYTER_RENDERER_MIMETYPES = [
  "application/geo+json",
  "application/vdom.v1+json",
  "application/vnd.dataresource+json",
  "application/vnd.plotly.v1+json",
  "application/vnd.vega.v2+json",
  "application/vnd.vega.v3+json",
  "application/vnd.vega.v4+json",
  "application/vnd.vega.v5+json",
  "application/vnd.vegalite.v1+json",
  "application/vnd.vegalite.v2+json",
  "application/vnd.vegalite.v3+json",
  "application/vnd.vegalite.v4+json",
  "application/x-nteract-model-debug+json",
  "image/svg+xml",
  "text/latex",
  "text/vnd.plotly.v1+html",
  "application/vnd.jupyter.widget-view+json",
  "application/vnd.code.notebook.error"
];
export {
  CellOutputContainer
};
