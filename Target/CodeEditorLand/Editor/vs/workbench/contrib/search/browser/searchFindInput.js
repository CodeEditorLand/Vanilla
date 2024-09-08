import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { Toggle } from "../../../../base/browser/ui/toggle/toggle.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import * as nls from "../../../../nls.js";
import { ContextScopedFindInput } from "../../../../platform/history/browser/contextScopedHistoryWidget.js";
import { NotebookFindInputFilterButton } from "../../notebook/browser/contrib/find/notebookFindReplaceWidget.js";
const NLS_AI_TOGGLE_LABEL = nls.localize("aiDescription", "Use AI");
class SearchFindInput extends ContextScopedFindInput {
  // followed, but overriden by the whether aiToggle is visible
  constructor(container, contextViewProvider, options, contextKeyService, contextMenuService, instantiationService, filters, shouldShowAIButton, filterStartVisiblitity) {
    super(container, contextViewProvider, options, contextKeyService);
    this.contextMenuService = contextMenuService;
    this.instantiationService = instantiationService;
    this.filters = filters;
    this._findFilter = this._register(
      new NotebookFindInputFilterButton(
        filters,
        contextMenuService,
        instantiationService,
        options,
        nls.localize(
          "searchFindInputNotebookFilter.label",
          "Notebook Find Filters"
        )
      )
    );
    this._aiButton = this._register(
      new AIToggle({
        appendTitle: "",
        isChecked: false,
        ...options.toggleStyles
      })
    );
    this.setAdditionalToggles([this._aiButton]);
    this._updatePadding();
    this.controls.appendChild(this._findFilter.container);
    this._findFilter.container.classList.add("monaco-custom-toggle");
    this.filterVisible = filterStartVisiblitity;
    this.sparkleVisible = shouldShowAIButton;
    this._register(
      this._aiButton.onChange(() => {
        if (this.regex) {
          this.regex.visible = !this._aiButton.checked;
        }
        if (this.wholeWords) {
          this.wholeWords.visible = !this._aiButton.checked;
        }
        if (this.caseSensitive) {
          this.caseSensitive.visible = !this._aiButton.checked;
        }
        if (this._aiButton.checked) {
          this._findFilter.visible = false;
        } else {
          this.filterVisible = this.shouldNotebookFilterBeVisible;
        }
        this._updatePadding();
      })
    );
  }
  _findFilter;
  _aiButton;
  _filterChecked = false;
  _onDidChangeAIToggle = this._register(
    new Emitter()
  );
  onDidChangeAIToggle = this._onDidChangeAIToggle.event;
  shouldNotebookFilterBeVisible = false;
  _updatePadding() {
    this.inputBox.paddingRight = (this.caseSensitive?.visible ? this.caseSensitive.width() : 0) + (this.wholeWords?.visible ? this.wholeWords.width() : 0) + (this.regex?.visible ? this.regex.width() : 0) + (this._findFilter.visible ? this._findFilter.width() : 0) + (this._aiButton.visible ? this._aiButton.width() : 0);
  }
  set sparkleVisible(visible) {
    this._aiButton.visible = visible;
    this._updatePadding();
  }
  set filterVisible(visible) {
    this.shouldNotebookFilterBeVisible = visible;
    if (this._aiButton.visible && this._aiButton.checked) {
      return;
    }
    this._findFilter.visible = visible;
    this.updateFilterStyles();
    this._updatePadding();
  }
  setEnabled(enabled) {
    super.setEnabled(enabled);
    if (enabled && (!this._filterChecked || !this._findFilter.visible)) {
      this.regex?.enable();
    } else {
      this.regex?.disable();
    }
  }
  updateFilterStyles() {
    this._filterChecked = !this.filters.markupInput || !this.filters.markupPreview || !this.filters.codeInput || !this.filters.codeOutput;
    this._findFilter.applyStyles(this._filterChecked);
  }
  get isAIEnabled() {
    return this._aiButton.checked;
  }
}
class AIToggle extends Toggle {
  constructor(opts) {
    super({
      icon: Codicon.sparkle,
      title: NLS_AI_TOGGLE_LABEL + opts.appendTitle,
      isChecked: opts.isChecked,
      hoverDelegate: opts.hoverDelegate ?? getDefaultHoverDelegate("element"),
      inputActiveOptionBorder: opts.inputActiveOptionBorder,
      inputActiveOptionForeground: opts.inputActiveOptionForeground,
      inputActiveOptionBackground: opts.inputActiveOptionBackground
    });
  }
}
export {
  SearchFindInput
};
