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
import * as DOM from "../../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../../base/browser/keyboardEvent.js";
import { KeyCode } from "../../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore
} from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import * as nls from "../../../../../nls.js";
import {
  IQuickInputService
} from "../../../../../platform/quickinput/common/quickInput.js";
import { INotebookService } from "../../common/notebookService.js";
import {
  RenderOutputType
} from "../notebookBrowser.js";
import { mimetypeIcon } from "../notebookIcons.js";
import {
  SideBySideDiffElementViewModel
} from "./diffElementViewModel.js";
import {
  DiffSide
} from "./notebookDiffEditorBrowser.js";
class OutputElement extends Disposable {
  constructor(_notebookEditor, _notebookTextModel, _notebookService, _quickInputService, _diffElementViewModel, _diffSide, _nestedCell, _outputContainer, output) {
    super();
    this._notebookEditor = _notebookEditor;
    this._notebookTextModel = _notebookTextModel;
    this._notebookService = _notebookService;
    this._quickInputService = _quickInputService;
    this._diffElementViewModel = _diffElementViewModel;
    this._diffSide = _diffSide;
    this._nestedCell = _nestedCell;
    this._outputContainer = _outputContainer;
    this.output = output;
  }
  resizeListener = this._register(new DisposableStore());
  domNode;
  renderResult;
  render(index, beforeElement) {
    const outputItemDiv = document.createElement("div");
    let result;
    const [mimeTypes, pick] = this.output.resolveMimeTypes(
      this._notebookTextModel,
      void 0
    );
    const pickedMimeTypeRenderer = this.output.pickedMimeType || mimeTypes[pick];
    if (mimeTypes.length > 1) {
      outputItemDiv.style.position = "relative";
      const mimeTypePicker = DOM.$(".multi-mimetype-output");
      mimeTypePicker.classList.add(
        ...ThemeIcon.asClassNameArray(mimetypeIcon)
      );
      mimeTypePicker.tabIndex = 0;
      mimeTypePicker.title = nls.localize(
        "mimeTypePicker",
        "Choose a different output mimetype, available mimetypes: {0}",
        mimeTypes.map((mimeType) => mimeType.mimeType).join(", ")
      );
      outputItemDiv.appendChild(mimeTypePicker);
      this.resizeListener.add(
        DOM.addStandardDisposableListener(
          mimeTypePicker,
          "mousedown",
          async (e) => {
            if (e.leftButton) {
              e.preventDefault();
              e.stopPropagation();
              await this.pickActiveMimeTypeRenderer(
                this._notebookTextModel,
                this.output
              );
            }
          }
        )
      );
      this.resizeListener.add(
        DOM.addDisposableListener(
          mimeTypePicker,
          DOM.EventType.KEY_DOWN,
          async (e) => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(KeyCode.Enter) || event.equals(KeyCode.Space)) {
              e.preventDefault();
              e.stopPropagation();
              await this.pickActiveMimeTypeRenderer(
                this._notebookTextModel,
                this.output
              );
            }
          }
        )
      );
    }
    const innerContainer = DOM.$(".output-inner-container");
    DOM.append(outputItemDiv, innerContainer);
    if (mimeTypes.length !== 0) {
      const renderer = this._notebookService.getRendererInfo(
        pickedMimeTypeRenderer.rendererId
      );
      result = renderer ? {
        type: RenderOutputType.Extension,
        renderer,
        source: this.output,
        mimeType: pickedMimeTypeRenderer.mimeType
      } : this._renderMissingRenderer(
        this.output,
        pickedMimeTypeRenderer.mimeType
      );
      this.output.pickedMimeType = pickedMimeTypeRenderer;
    }
    this.domNode = outputItemDiv;
    this.renderResult = result;
    if (!result) {
      return;
    }
    if (beforeElement) {
      this._outputContainer.insertBefore(outputItemDiv, beforeElement);
    } else {
      this._outputContainer.appendChild(outputItemDiv);
    }
    this._notebookEditor.createOutput(
      this._diffElementViewModel,
      this._nestedCell,
      result,
      () => this.getOutputOffsetInCell(index),
      this._diffElementViewModel instanceof SideBySideDiffElementViewModel ? this._diffSide : this._diffElementViewModel.type === "insert" ? DiffSide.Modified : DiffSide.Original
    );
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
  async pickActiveMimeTypeRenderer(notebookTextModel, viewModel) {
    const [mimeTypes, currIndex] = viewModel.resolveMimeTypes(
      notebookTextModel,
      void 0
    );
    const items = mimeTypes.filter((mimeType) => mimeType.isTrusted).map(
      (mimeType, index) => ({
        label: mimeType.mimeType,
        id: mimeType.mimeType,
        index,
        picked: index === currIndex,
        detail: this.generateRendererInfo(mimeType.rendererId),
        description: index === currIndex ? nls.localize(
          "curruentActiveMimeType",
          "Currently Active"
        ) : void 0
      })
    );
    const disposables = new DisposableStore();
    const picker = disposables.add(
      this._quickInputService.createQuickPick()
    );
    picker.items = items;
    picker.activeItems = items.filter((item) => !!item.picked);
    picker.placeholder = items.length !== mimeTypes.length ? nls.localize(
      "promptChooseMimeTypeInSecure.placeHolder",
      "Select mimetype to render for current output. Rich mimetypes are available only when the notebook is trusted"
    ) : nls.localize(
      "promptChooseMimeType.placeHolder",
      "Select mimetype to render for current output"
    );
    const pick = await new Promise((resolve) => {
      disposables.add(
        picker.onDidAccept(() => {
          resolve(
            picker.selectedItems.length === 1 ? picker.selectedItems[0].index : void 0
          );
          disposables.dispose();
        })
      );
      picker.show();
    });
    if (pick === void 0) {
      return;
    }
    if (pick !== currIndex) {
      const index = this._nestedCell.outputsViewModels.indexOf(viewModel);
      const nextElement = this.domNode.nextElementSibling;
      this.resizeListener.clear();
      const element = this.domNode;
      if (element) {
        element.remove();
        this._notebookEditor.removeInset(
          this._diffElementViewModel,
          this._nestedCell,
          viewModel,
          this._diffSide
        );
      }
      viewModel.pickedMimeType = mimeTypes[pick];
      this.render(index, nextElement);
    }
  }
  generateRendererInfo(renderId) {
    const renderInfo = this._notebookService.getRendererInfo(renderId);
    if (renderInfo) {
      const displayName = renderInfo.displayName !== "" ? renderInfo.displayName : renderInfo.id;
      return `${displayName} (${renderInfo.extensionId.value})`;
    }
    return nls.localize("builtinRenderInfo", "built-in");
  }
  getCellOutputCurrentIndex() {
    return this._diffElementViewModel.getNestedCellViewModel(this._diffSide).outputs.indexOf(this.output.model);
  }
  updateHeight(index, height) {
    this._diffElementViewModel.updateOutputHeight(
      this._diffSide,
      index,
      height
    );
  }
  getOutputOffsetInContainer(index) {
    return this._diffElementViewModel.getOutputOffsetInContainer(
      this._diffSide,
      index
    );
  }
  getOutputOffsetInCell(index) {
    return this._diffElementViewModel.getOutputOffsetInCell(
      this._diffSide,
      index
    );
  }
}
let OutputContainer = class extends Disposable {
  constructor(_editor, _notebookTextModel, _diffElementViewModel, _nestedCellViewModel, _diffSide, _outputContainer, _notebookService, _quickInputService) {
    super();
    this._editor = _editor;
    this._notebookTextModel = _notebookTextModel;
    this._diffElementViewModel = _diffElementViewModel;
    this._nestedCellViewModel = _nestedCellViewModel;
    this._diffSide = _diffSide;
    this._outputContainer = _outputContainer;
    this._notebookService = _notebookService;
    this._quickInputService = _quickInputService;
    this._register(this._diffElementViewModel.onDidLayoutChange(() => {
      this._outputEntries.forEach((value, key) => {
        const index = _nestedCellViewModel.outputs.indexOf(key.model);
        if (index >= 0) {
          const top = this._diffElementViewModel.getOutputOffsetInContainer(this._diffSide, index);
          value.domNode.style.top = `${top}px`;
        }
      });
    }));
    this._register(this._nestedCellViewModel.textModel.onDidChangeOutputs((splice) => {
      this._updateOutputs(splice);
    }));
  }
  _outputEntries = /* @__PURE__ */ new Map();
  _updateOutputs(splice) {
    const removedKeys = [];
    this._outputEntries.forEach((value, key) => {
      if (this._nestedCellViewModel.outputsViewModels.indexOf(key) < 0) {
        removedKeys.push(key);
        value.domNode.remove();
        this._editor.removeInset(
          this._diffElementViewModel,
          this._nestedCellViewModel,
          key,
          this._diffSide
        );
      }
    });
    removedKeys.forEach((key) => {
      this._outputEntries.get(key)?.dispose();
      this._outputEntries.delete(key);
    });
    let prevElement;
    const outputsToRender = this._nestedCellViewModel.outputsViewModels;
    outputsToRender.reverse().forEach((output) => {
      if (this._outputEntries.has(output)) {
        prevElement = this._outputEntries.get(output).domNode;
        return;
      }
      const currIndex = this._nestedCellViewModel.outputsViewModels.indexOf(output);
      this._renderOutput(output, currIndex, prevElement);
      prevElement = this._outputEntries.get(output)?.domNode;
    });
  }
  render() {
    for (let index = 0; index < this._nestedCellViewModel.outputsViewModels.length; index++) {
      const currOutput = this._nestedCellViewModel.outputsViewModels[index];
      this._renderOutput(currOutput, index, void 0);
    }
  }
  showOutputs() {
    for (let index = 0; index < this._nestedCellViewModel.outputsViewModels.length; index++) {
      const currOutput = this._nestedCellViewModel.outputsViewModels[index];
      this._editor.showInset(
        this._diffElementViewModel,
        currOutput.cellViewModel,
        currOutput,
        this._diffSide
      );
    }
  }
  hideOutputs() {
    this._outputEntries.forEach((outputElement, cellOutputViewModel) => {
      this._editor.hideInset(
        this._diffElementViewModel,
        this._nestedCellViewModel,
        cellOutputViewModel
      );
    });
  }
  _renderOutput(currOutput, index, beforeElement) {
    if (!this._outputEntries.has(currOutput)) {
      this._outputEntries.set(
        currOutput,
        new OutputElement(
          this._editor,
          this._notebookTextModel,
          this._notebookService,
          this._quickInputService,
          this._diffElementViewModel,
          this._diffSide,
          this._nestedCellViewModel,
          this._outputContainer,
          currOutput
        )
      );
    }
    const renderElement = this._outputEntries.get(currOutput);
    renderElement.render(index, beforeElement);
  }
};
OutputContainer = __decorateClass([
  __decorateParam(6, INotebookService),
  __decorateParam(7, IQuickInputService)
], OutputContainer);
export {
  OutputContainer,
  OutputElement
};
