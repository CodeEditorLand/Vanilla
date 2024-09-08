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
import { BrowserFeatures } from "../../../../base/browser/canIUse.js";
import * as DOM from "../../../../base/browser/dom.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { InputBox } from "../../../../base/browser/ui/inputbox/inputBox.js";
import { SelectBox } from "../../../../base/browser/ui/selectBox/selectBox.js";
import {
  Toggle,
  unthemedToggleStyles
} from "../../../../base/browser/ui/toggle/toggle.js";
import { disposableTimeout } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { isIOS } from "../../../../base/common/platform.js";
import { isDefined, isUndefinedOrNull } from "../../../../base/common/types.js";
import "./media/settingsWidgets.css";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize } from "../../../../nls.js";
import { IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import {
  defaultButtonStyles,
  getInputBoxStyle,
  getSelectBoxStyles
} from "../../../../platform/theme/browser/defaultStyles.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import {
  settingsSelectBackground,
  settingsSelectBorder,
  settingsSelectForeground,
  settingsSelectListBorder,
  settingsTextInputBackground,
  settingsTextInputBorder,
  settingsTextInputForeground
} from "../common/settingsEditorColorRegistry.js";
import {
  settingsDiscardIcon,
  settingsEditIcon,
  settingsRemoveIcon
} from "./preferencesIcons.js";
const $ = DOM.$;
class ListSettingListModel {
  _dataItems = [];
  _editKey = null;
  _selectedIdx = null;
  _newDataItem;
  get items() {
    const items = this._dataItems.map((item, i) => {
      const editing = typeof this._editKey === "number" && this._editKey === i;
      return {
        ...item,
        editing,
        selected: i === this._selectedIdx || editing
      };
    });
    if (this._editKey === "create") {
      items.push({
        editing: true,
        selected: true,
        ...this._newDataItem
      });
    }
    return items;
  }
  constructor(newItem) {
    this._newDataItem = newItem;
  }
  setEditKey(key) {
    this._editKey = key;
  }
  setValue(listData) {
    this._dataItems = listData;
  }
  select(idx) {
    this._selectedIdx = idx;
  }
  getSelected() {
    return this._selectedIdx;
  }
  selectNext() {
    if (typeof this._selectedIdx === "number") {
      this._selectedIdx = Math.min(
        this._selectedIdx + 1,
        this._dataItems.length - 1
      );
    } else {
      this._selectedIdx = 0;
    }
  }
  selectPrevious() {
    if (typeof this._selectedIdx === "number") {
      this._selectedIdx = Math.max(this._selectedIdx - 1, 0);
    } else {
      this._selectedIdx = 0;
    }
  }
}
let AbstractListSettingWidget = class extends Disposable {
  constructor(container, themeService, contextViewService) {
    super();
    this.container = container;
    this.themeService = themeService;
    this.contextViewService = contextViewService;
    this.listElement = DOM.append(container, $("div"));
    this.listElement.setAttribute("role", "list");
    this.getContainerClasses().forEach((c) => this.listElement.classList.add(c));
    DOM.append(container, this.renderAddButton());
    this.renderList();
    this._register(DOM.addDisposableListener(this.listElement, DOM.EventType.POINTER_DOWN, (e) => this.onListClick(e)));
    this._register(DOM.addDisposableListener(this.listElement, DOM.EventType.DBLCLICK, (e) => this.onListDoubleClick(e)));
    this._register(DOM.addStandardDisposableListener(this.listElement, "keydown", (e) => {
      if (e.equals(KeyCode.UpArrow)) {
        this.selectPreviousRow();
      } else if (e.equals(KeyCode.DownArrow)) {
        this.selectNextRow();
      } else {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
    }));
  }
  listElement;
  rowElements = [];
  _onDidChangeList = this._register(
    new Emitter()
  );
  model = new ListSettingListModel(
    this.getEmptyItem()
  );
  listDisposables = this._register(new DisposableStore());
  onDidChangeList = this._onDidChangeList.event;
  get domNode() {
    return this.listElement;
  }
  get items() {
    return this.model.items;
  }
  get inReadMode() {
    return this.model.items.every((item) => !item.editing);
  }
  setValue(listData) {
    this.model.setValue(listData);
    this.renderList();
  }
  renderHeader() {
    return;
  }
  isAddButtonVisible() {
    return true;
  }
  renderList() {
    const focused = DOM.isAncestorOfActiveElement(this.listElement);
    DOM.clearNode(this.listElement);
    this.listDisposables.clear();
    const newMode = this.model.items.some(
      (item) => !!(item.editing && this.isItemNew(item))
    );
    this.container.classList.toggle(
      "setting-list-hide-add-button",
      !this.isAddButtonVisible() || newMode
    );
    if (this.model.items.length) {
      this.listElement.tabIndex = 0;
    } else {
      this.listElement.removeAttribute("tabIndex");
    }
    const header = this.renderHeader();
    if (header) {
      this.listElement.appendChild(header);
    }
    this.rowElements = this.model.items.map(
      (item, i) => this.renderDataOrEditItem(item, i, focused)
    );
    this.rowElements.forEach(
      (rowElement) => this.listElement.appendChild(rowElement)
    );
  }
  createBasicSelectBox(value) {
    const selectBoxOptions = value.options.map(
      ({ value: value2, description }) => ({ text: value2, description })
    );
    const selected = value.options.findIndex(
      (option) => value.data === option.value
    );
    const styles = getSelectBoxStyles({
      selectBackground: settingsSelectBackground,
      selectForeground: settingsSelectForeground,
      selectBorder: settingsSelectBorder,
      selectListBorder: settingsSelectListBorder
    });
    const selectBox = new SelectBox(
      selectBoxOptions,
      selected,
      this.contextViewService,
      styles,
      {
        useCustomDrawn: !(isIOS && BrowserFeatures.pointerEvents)
      }
    );
    return selectBox;
  }
  editSetting(idx) {
    this.model.setEditKey(idx);
    this.renderList();
  }
  cancelEdit() {
    this.model.setEditKey("none");
    this.renderList();
  }
  handleItemChange(originalItem, changedItem, idx) {
    this.model.setEditKey("none");
    if (this.isItemNew(originalItem)) {
      this._onDidChangeList.fire({
        type: "add",
        newItem: changedItem,
        targetIndex: idx
      });
    } else {
      this._onDidChangeList.fire({
        type: "change",
        originalItem,
        newItem: changedItem,
        targetIndex: idx
      });
    }
    this.renderList();
  }
  renderDataOrEditItem(item, idx, listFocused) {
    const rowElement = item.editing ? this.renderEdit(item, idx) : this.renderDataItem(item, idx, listFocused);
    rowElement.setAttribute("role", "listitem");
    return rowElement;
  }
  renderDataItem(item, idx, listFocused) {
    const rowElementGroup = this.renderItem(item, idx);
    const rowElement = rowElementGroup.rowElement;
    rowElement.setAttribute("data-index", idx + "");
    rowElement.setAttribute("tabindex", item.selected ? "0" : "-1");
    rowElement.classList.toggle("selected", item.selected);
    const actionBar = new ActionBar(rowElement);
    this.listDisposables.add(actionBar);
    actionBar.push(this.getActionsForItem(item, idx), {
      icon: true,
      label: true
    });
    this.addTooltipsToRow(rowElementGroup, item);
    if (item.selected && listFocused) {
      disposableTimeout(
        () => rowElement.focus(),
        void 0,
        this.listDisposables
      );
    }
    this.listDisposables.add(
      DOM.addDisposableListener(rowElement, "click", (e) => {
        e.stopPropagation();
      })
    );
    return rowElement;
  }
  renderAddButton() {
    const rowElement = $(".setting-list-new-row");
    const startAddButton = this._register(
      new Button(rowElement, defaultButtonStyles)
    );
    startAddButton.label = this.getLocalizedStrings().addButtonLabel;
    startAddButton.element.classList.add("setting-list-addButton");
    this._register(
      startAddButton.onDidClick(() => {
        this.model.setEditKey("create");
        this.renderList();
      })
    );
    return rowElement;
  }
  onListClick(e) {
    const targetIdx = this.getClickedItemIndex(e);
    if (targetIdx < 0) {
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    if (this.model.getSelected() === targetIdx) {
      return;
    }
    this.selectRow(targetIdx);
  }
  onListDoubleClick(e) {
    const targetIdx = this.getClickedItemIndex(e);
    if (targetIdx < 0) {
      return;
    }
    const item = this.model.items[targetIdx];
    if (item) {
      this.editSetting(targetIdx);
      e.preventDefault();
      e.stopPropagation();
    }
  }
  getClickedItemIndex(e) {
    if (!e.target) {
      return -1;
    }
    const actionbar = DOM.findParentWithClass(
      e.target,
      "monaco-action-bar"
    );
    if (actionbar) {
      return -1;
    }
    const element = DOM.findParentWithClass(
      e.target,
      "setting-list-row"
    );
    if (!element) {
      return -1;
    }
    const targetIdxStr = element.getAttribute("data-index");
    if (!targetIdxStr) {
      return -1;
    }
    const targetIdx = Number.parseInt(targetIdxStr);
    return targetIdx;
  }
  selectRow(idx) {
    this.model.select(idx);
    this.rowElements.forEach((row) => row.classList.remove("selected"));
    const selectedRow = this.rowElements[this.model.getSelected()];
    selectedRow.classList.add("selected");
    selectedRow.focus();
  }
  selectNextRow() {
    this.model.selectNext();
    this.selectRow(this.model.getSelected());
  }
  selectPreviousRow() {
    this.model.selectPrevious();
    this.selectRow(this.model.getSelected());
  }
};
AbstractListSettingWidget = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, IContextViewService)
], AbstractListSettingWidget);
let ListSettingWidget = class extends AbstractListSettingWidget {
  constructor(container, themeService, contextViewService, hoverService) {
    super(container, themeService, contextViewService);
    this.hoverService = hoverService;
  }
  keyValueSuggester;
  showAddButton = true;
  setValue(listData, options) {
    this.keyValueSuggester = options?.keySuggester;
    this.showAddButton = options?.showAddButton ?? true;
    super.setValue(listData);
  }
  getEmptyItem() {
    return {
      value: {
        type: "string",
        data: ""
      }
    };
  }
  isAddButtonVisible() {
    return this.showAddButton;
  }
  getContainerClasses() {
    return ["setting-list-widget"];
  }
  getActionsForItem(item, idx) {
    return [
      {
        class: ThemeIcon.asClassName(settingsEditIcon),
        enabled: true,
        id: "workbench.action.editListItem",
        tooltip: this.getLocalizedStrings().editActionTooltip,
        run: () => this.editSetting(idx)
      },
      {
        class: ThemeIcon.asClassName(settingsRemoveIcon),
        enabled: true,
        id: "workbench.action.removeListItem",
        tooltip: this.getLocalizedStrings().deleteActionTooltip,
        run: () => this._onDidChangeList.fire({
          type: "remove",
          originalItem: item,
          targetIndex: idx
        })
      }
    ];
  }
  dragDetails;
  getDragImage(item) {
    const dragImage = $(".monaco-drag-image");
    dragImage.textContent = item.value.data;
    return dragImage;
  }
  renderItem(item, idx) {
    const rowElement = $(".setting-list-row");
    const valueElement = DOM.append(rowElement, $(".setting-list-value"));
    const siblingElement = DOM.append(
      rowElement,
      $(".setting-list-sibling")
    );
    valueElement.textContent = item.value.data.toString();
    siblingElement.textContent = item.sibling ? `when: ${item.sibling}` : null;
    this.addDragAndDrop(rowElement, item, idx);
    return {
      rowElement,
      keyElement: valueElement,
      valueElement: siblingElement
    };
  }
  addDragAndDrop(rowElement, item, idx) {
    if (this.inReadMode) {
      rowElement.draggable = true;
      rowElement.classList.add("draggable");
    } else {
      rowElement.draggable = false;
      rowElement.classList.remove("draggable");
    }
    this.listDisposables.add(
      DOM.addDisposableListener(
        rowElement,
        DOM.EventType.DRAG_START,
        (ev) => {
          this.dragDetails = {
            element: rowElement,
            item,
            itemIndex: idx
          };
          if (ev.dataTransfer) {
            ev.dataTransfer.dropEffect = "move";
            const dragImage = this.getDragImage(item);
            rowElement.ownerDocument.body.appendChild(dragImage);
            ev.dataTransfer.setDragImage(dragImage, -10, -10);
            setTimeout(() => dragImage.remove(), 0);
          }
        }
      )
    );
    this.listDisposables.add(
      DOM.addDisposableListener(
        rowElement,
        DOM.EventType.DRAG_OVER,
        (ev) => {
          if (!this.dragDetails) {
            return false;
          }
          ev.preventDefault();
          if (ev.dataTransfer) {
            ev.dataTransfer.dropEffect = "move";
          }
          return true;
        }
      )
    );
    let counter = 0;
    this.listDisposables.add(
      DOM.addDisposableListener(
        rowElement,
        DOM.EventType.DRAG_ENTER,
        (ev) => {
          counter++;
          rowElement.classList.add("drag-hover");
        }
      )
    );
    this.listDisposables.add(
      DOM.addDisposableListener(
        rowElement,
        DOM.EventType.DRAG_LEAVE,
        (ev) => {
          counter--;
          if (!counter) {
            rowElement.classList.remove("drag-hover");
          }
        }
      )
    );
    this.listDisposables.add(
      DOM.addDisposableListener(rowElement, DOM.EventType.DROP, (ev) => {
        if (!this.dragDetails) {
          return false;
        }
        ev.preventDefault();
        counter = 0;
        if (this.dragDetails.element !== rowElement) {
          this._onDidChangeList.fire({
            type: "move",
            originalItem: this.dragDetails.item,
            sourceIndex: this.dragDetails.itemIndex,
            newItem: item,
            targetIndex: idx
          });
        }
        return true;
      })
    );
    this.listDisposables.add(
      DOM.addDisposableListener(
        rowElement,
        DOM.EventType.DRAG_END,
        (ev) => {
          counter = 0;
          rowElement.classList.remove("drag-hover");
          ev.dataTransfer?.clearData();
          if (this.dragDetails) {
            this.dragDetails = void 0;
          }
        }
      )
    );
  }
  renderEdit(item, idx) {
    const rowElement = $(".setting-list-edit-row");
    let valueInput;
    let currentDisplayValue;
    let currentEnumOptions;
    if (this.keyValueSuggester) {
      const enumData = this.keyValueSuggester(
        this.model.items.map(({ value: { data } }) => data),
        idx
      );
      item = {
        ...item,
        value: {
          type: "enum",
          data: item.value.data,
          options: enumData ? enumData.options : []
        }
      };
    }
    switch (item.value.type) {
      case "string":
        valueInput = this.renderInputBox(item.value, rowElement);
        break;
      case "enum":
        valueInput = this.renderDropdown(item.value, rowElement);
        currentEnumOptions = item.value.options;
        if (item.value.options.length) {
          currentDisplayValue = this.isItemNew(item) ? currentEnumOptions[0].value : item.value.data;
        }
        break;
    }
    const updatedInputBoxItem = () => {
      const inputBox = valueInput;
      return {
        value: {
          type: "string",
          data: inputBox.value
        },
        sibling: siblingInput?.value
      };
    };
    const updatedSelectBoxItem = (selectedValue) => {
      return {
        value: {
          type: "enum",
          data: selectedValue,
          options: currentEnumOptions ?? []
        }
      };
    };
    const onKeyDown = (e) => {
      if (e.equals(KeyCode.Enter)) {
        this.handleItemChange(item, updatedInputBoxItem(), idx);
      } else if (e.equals(KeyCode.Escape)) {
        this.cancelEdit();
        e.preventDefault();
      }
      rowElement?.focus();
    };
    if (item.value.type !== "string") {
      const selectBox = valueInput;
      this.listDisposables.add(
        selectBox.onDidSelect(({ selected }) => {
          currentDisplayValue = selected;
        })
      );
    } else {
      const inputBox = valueInput;
      this.listDisposables.add(
        DOM.addStandardDisposableListener(
          inputBox.inputElement,
          DOM.EventType.KEY_DOWN,
          onKeyDown
        )
      );
    }
    let siblingInput;
    if (!isUndefinedOrNull(item.sibling)) {
      siblingInput = new InputBox(rowElement, this.contextViewService, {
        placeholder: this.getLocalizedStrings().siblingInputPlaceholder,
        inputBoxStyles: getInputBoxStyle({
          inputBackground: settingsTextInputBackground,
          inputForeground: settingsTextInputForeground,
          inputBorder: settingsTextInputBorder
        })
      });
      siblingInput.element.classList.add("setting-list-siblingInput");
      this.listDisposables.add(siblingInput);
      siblingInput.value = item.sibling;
      this.listDisposables.add(
        DOM.addStandardDisposableListener(
          siblingInput.inputElement,
          DOM.EventType.KEY_DOWN,
          onKeyDown
        )
      );
    } else if (valueInput instanceof InputBox) {
      valueInput.element.classList.add("no-sibling");
    }
    const okButton = this.listDisposables.add(
      new Button(rowElement, defaultButtonStyles)
    );
    okButton.label = localize("okButton", "OK");
    okButton.element.classList.add("setting-list-ok-button");
    this.listDisposables.add(
      okButton.onDidClick(() => {
        if (item.value.type === "string") {
          this.handleItemChange(item, updatedInputBoxItem(), idx);
        } else {
          this.handleItemChange(
            item,
            updatedSelectBoxItem(currentDisplayValue),
            idx
          );
        }
      })
    );
    const cancelButton = this.listDisposables.add(
      new Button(rowElement, { secondary: true, ...defaultButtonStyles })
    );
    cancelButton.label = localize("cancelButton", "Cancel");
    cancelButton.element.classList.add("setting-list-cancel-button");
    this.listDisposables.add(
      cancelButton.onDidClick(() => this.cancelEdit())
    );
    this.listDisposables.add(
      disposableTimeout(() => {
        valueInput.focus();
        if (valueInput instanceof InputBox) {
          valueInput.select();
        }
      })
    );
    return rowElement;
  }
  isItemNew(item) {
    return item.value.data === "";
  }
  addTooltipsToRow(rowElementGroup, { value, sibling }) {
    const title = isUndefinedOrNull(sibling) ? localize("listValueHintLabel", "List item `{0}`", value.data) : localize(
      "listSiblingHintLabel",
      "List item `{0}` with sibling `${1}`",
      value.data,
      sibling
    );
    const { rowElement } = rowElementGroup;
    this.listDisposables.add(
      this.hoverService.setupManagedHover(
        getDefaultHoverDelegate("mouse"),
        rowElement,
        title
      )
    );
    rowElement.setAttribute("aria-label", title);
  }
  getLocalizedStrings() {
    return {
      deleteActionTooltip: localize("removeItem", "Remove Item"),
      editActionTooltip: localize("editItem", "Edit Item"),
      addButtonLabel: localize("addItem", "Add Item"),
      inputPlaceholder: localize("itemInputPlaceholder", "Item..."),
      siblingInputPlaceholder: localize(
        "listSiblingInputPlaceholder",
        "Sibling..."
      )
    };
  }
  renderInputBox(value, rowElement) {
    const valueInput = new InputBox(rowElement, this.contextViewService, {
      placeholder: this.getLocalizedStrings().inputPlaceholder,
      inputBoxStyles: getInputBoxStyle({
        inputBackground: settingsTextInputBackground,
        inputForeground: settingsTextInputForeground,
        inputBorder: settingsTextInputBorder
      })
    });
    valueInput.element.classList.add("setting-list-valueInput");
    this.listDisposables.add(valueInput);
    valueInput.value = value.data.toString();
    return valueInput;
  }
  renderDropdown(value, rowElement) {
    if (value.type !== "enum") {
      throw new Error("Valuetype must be enum.");
    }
    const selectBox = this.createBasicSelectBox(value);
    const wrapper = $(".setting-list-object-list-row");
    selectBox.render(wrapper);
    rowElement.appendChild(wrapper);
    return selectBox;
  }
};
ListSettingWidget = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IHoverService)
], ListSettingWidget);
class ExcludeSettingWidget extends ListSettingWidget {
  getContainerClasses() {
    return ["setting-list-include-exclude-widget"];
  }
  addDragAndDrop(rowElement, item, idx) {
    return;
  }
  addTooltipsToRow(rowElementGroup, item) {
    let title = isUndefinedOrNull(item.sibling) ? localize(
      "excludePatternHintLabel",
      "Exclude files matching `{0}`",
      item.value.data
    ) : localize(
      "excludeSiblingHintLabel",
      "Exclude files matching `{0}`, only when a file matching `{1}` is present",
      item.value.data,
      item.sibling
    );
    if (item.source) {
      title += localize(
        "excludeIncludeSource",
        ". Default value provided by `{0}`",
        item.source
      );
    }
    const markdownTitle = new MarkdownString().appendMarkdown(title);
    const { rowElement } = rowElementGroup;
    this.listDisposables.add(
      this.hoverService.setupManagedHover(
        getDefaultHoverDelegate("mouse"),
        rowElement,
        {
          markdown: markdownTitle,
          markdownNotSupportedFallback: title
        }
      )
    );
    rowElement.setAttribute("aria-label", title);
  }
  getLocalizedStrings() {
    return {
      deleteActionTooltip: localize(
        "removeExcludeItem",
        "Remove Exclude Item"
      ),
      editActionTooltip: localize("editExcludeItem", "Edit Exclude Item"),
      addButtonLabel: localize("addPattern", "Add Pattern"),
      inputPlaceholder: localize(
        "excludePatternInputPlaceholder",
        "Exclude Pattern..."
      ),
      siblingInputPlaceholder: localize(
        "excludeSiblingInputPlaceholder",
        "When Pattern Is Present..."
      )
    };
  }
}
class IncludeSettingWidget extends ListSettingWidget {
  getContainerClasses() {
    return ["setting-list-include-exclude-widget"];
  }
  addDragAndDrop(rowElement, item, idx) {
    return;
  }
  addTooltipsToRow(rowElementGroup, item) {
    let title = isUndefinedOrNull(item.sibling) ? localize(
      "includePatternHintLabel",
      "Include files matching `{0}`",
      item.value.data
    ) : localize(
      "includeSiblingHintLabel",
      "Include files matching `{0}`, only when a file matching `{1}` is present",
      item.value.data,
      item.sibling
    );
    if (item.source) {
      title += localize(
        "excludeIncludeSource",
        ". Default value provided by `{0}`",
        item.source
      );
    }
    const markdownTitle = new MarkdownString().appendMarkdown(title);
    const { rowElement } = rowElementGroup;
    this.listDisposables.add(
      this.hoverService.setupManagedHover(
        getDefaultHoverDelegate("mouse"),
        rowElement,
        {
          markdown: markdownTitle,
          markdownNotSupportedFallback: title
        }
      )
    );
    rowElement.setAttribute("aria-label", title);
  }
  getLocalizedStrings() {
    return {
      deleteActionTooltip: localize(
        "removeIncludeItem",
        "Remove Include Item"
      ),
      editActionTooltip: localize("editIncludeItem", "Edit Include Item"),
      addButtonLabel: localize("addPattern", "Add Pattern"),
      inputPlaceholder: localize(
        "includePatternInputPlaceholder",
        "Include Pattern..."
      ),
      siblingInputPlaceholder: localize(
        "includeSiblingInputPlaceholder",
        "When Pattern Is Present..."
      )
    };
  }
}
let ObjectSettingDropdownWidget = class extends AbstractListSettingWidget {
  constructor(container, themeService, contextViewService, hoverService) {
    super(container, themeService, contextViewService);
    this.hoverService = hoverService;
  }
  currentSettingKey = "";
  showAddButton = true;
  keySuggester = () => void 0;
  valueSuggester = () => void 0;
  setValue(listData, options) {
    this.showAddButton = options?.showAddButton ?? this.showAddButton;
    this.keySuggester = options?.keySuggester ?? this.keySuggester;
    this.valueSuggester = options?.valueSuggester ?? this.valueSuggester;
    if (isDefined(options) && options.settingKey !== this.currentSettingKey) {
      this.model.setEditKey("none");
      this.model.select(null);
      this.currentSettingKey = options.settingKey;
    }
    super.setValue(listData);
  }
  isItemNew(item) {
    return item.key.data === "" && item.value.data === "";
  }
  isAddButtonVisible() {
    return this.showAddButton;
  }
  getEmptyItem() {
    return {
      key: { type: "string", data: "" },
      value: { type: "string", data: "" },
      removable: true,
      resetable: false
    };
  }
  getContainerClasses() {
    return ["setting-list-object-widget"];
  }
  getActionsForItem(item, idx) {
    const actions = [
      {
        class: ThemeIcon.asClassName(settingsEditIcon),
        enabled: true,
        id: "workbench.action.editListItem",
        label: "",
        tooltip: this.getLocalizedStrings().editActionTooltip,
        run: () => this.editSetting(idx)
      }
    ];
    if (item.resetable) {
      actions.push({
        class: ThemeIcon.asClassName(settingsDiscardIcon),
        enabled: true,
        id: "workbench.action.resetListItem",
        label: "",
        tooltip: this.getLocalizedStrings().resetActionTooltip,
        run: () => this._onDidChangeList.fire({
          type: "reset",
          originalItem: item,
          targetIndex: idx
        })
      });
    }
    if (item.removable) {
      actions.push({
        class: ThemeIcon.asClassName(settingsRemoveIcon),
        enabled: true,
        id: "workbench.action.removeListItem",
        label: "",
        tooltip: this.getLocalizedStrings().deleteActionTooltip,
        run: () => this._onDidChangeList.fire({
          type: "remove",
          originalItem: item,
          targetIndex: idx
        })
      });
    }
    return actions;
  }
  renderHeader() {
    const header = $(".setting-list-row-header");
    const keyHeader = DOM.append(header, $(".setting-list-object-key"));
    const valueHeader = DOM.append(header, $(".setting-list-object-value"));
    const { keyHeaderText, valueHeaderText } = this.getLocalizedStrings();
    keyHeader.textContent = keyHeaderText;
    valueHeader.textContent = valueHeaderText;
    return header;
  }
  renderItem(item, idx) {
    const rowElement = $(".setting-list-row");
    rowElement.classList.add("setting-list-object-row");
    const keyElement = DOM.append(
      rowElement,
      $(".setting-list-object-key")
    );
    const valueElement = DOM.append(
      rowElement,
      $(".setting-list-object-value")
    );
    keyElement.textContent = item.key.data;
    valueElement.textContent = item.value.data.toString();
    return { rowElement, keyElement, valueElement };
  }
  renderEdit(item, idx) {
    const rowElement = $(".setting-list-edit-row.setting-list-object-row");
    const changedItem = { ...item };
    const onKeyChange = (key) => {
      changedItem.key = key;
      okButton.enabled = key.data !== "";
      const suggestedValue = this.valueSuggester(key.data) ?? item.value;
      if (this.shouldUseSuggestion(
        item.value,
        changedItem.value,
        suggestedValue
      )) {
        onValueChange(suggestedValue);
        renderLatestValue();
      }
    };
    const onValueChange = (value) => {
      changedItem.value = value;
    };
    let keyWidget;
    let keyElement;
    if (this.showAddButton) {
      if (this.isItemNew(item)) {
        const suggestedKey = this.keySuggester(
          this.model.items.map(({ key: { data } }) => data)
        );
        if (isDefined(suggestedKey)) {
          changedItem.key = suggestedKey;
          const suggestedValue = this.valueSuggester(
            changedItem.key.data
          );
          onValueChange(suggestedValue ?? changedItem.value);
        }
      }
      const { widget, element } = this.renderEditWidget(changedItem.key, {
        idx,
        isKey: true,
        originalItem: item,
        changedItem,
        update: onKeyChange
      });
      keyWidget = widget;
      keyElement = element;
    } else {
      keyElement = $(".setting-list-object-key");
      keyElement.textContent = item.key.data;
    }
    let valueWidget;
    const valueContainer = $(".setting-list-object-value-container");
    const renderLatestValue = () => {
      const { widget, element } = this.renderEditWidget(
        changedItem.value,
        {
          idx,
          isKey: false,
          originalItem: item,
          changedItem,
          update: onValueChange
        }
      );
      valueWidget = widget;
      DOM.clearNode(valueContainer);
      valueContainer.append(element);
    };
    renderLatestValue();
    rowElement.append(keyElement, valueContainer);
    const okButton = this.listDisposables.add(
      new Button(rowElement, defaultButtonStyles)
    );
    okButton.enabled = changedItem.key.data !== "";
    okButton.label = localize("okButton", "OK");
    okButton.element.classList.add("setting-list-ok-button");
    this.listDisposables.add(
      okButton.onDidClick(
        () => this.handleItemChange(item, changedItem, idx)
      )
    );
    const cancelButton = this.listDisposables.add(
      new Button(rowElement, { secondary: true, ...defaultButtonStyles })
    );
    cancelButton.label = localize("cancelButton", "Cancel");
    cancelButton.element.classList.add("setting-list-cancel-button");
    this.listDisposables.add(
      cancelButton.onDidClick(() => this.cancelEdit())
    );
    this.listDisposables.add(
      disposableTimeout(() => {
        const widget = keyWidget ?? valueWidget;
        widget.focus();
        if (widget instanceof InputBox) {
          widget.select();
        }
      })
    );
    return rowElement;
  }
  renderEditWidget(keyOrValue, options) {
    switch (keyOrValue.type) {
      case "string":
        return this.renderStringEditWidget(keyOrValue, options);
      case "enum":
        return this.renderEnumEditWidget(keyOrValue, options);
      case "boolean":
        return this.renderEnumEditWidget(
          {
            type: "enum",
            data: keyOrValue.data.toString(),
            options: [{ value: "true" }, { value: "false" }]
          },
          options
        );
    }
  }
  renderStringEditWidget(keyOrValue, {
    idx,
    isKey,
    originalItem,
    changedItem,
    update
  }) {
    const wrapper = $(
      isKey ? ".setting-list-object-input-key" : ".setting-list-object-input-value"
    );
    const inputBox = new InputBox(wrapper, this.contextViewService, {
      placeholder: isKey ? localize("objectKeyInputPlaceholder", "Key") : localize("objectValueInputPlaceholder", "Value"),
      inputBoxStyles: getInputBoxStyle({
        inputBackground: settingsTextInputBackground,
        inputForeground: settingsTextInputForeground,
        inputBorder: settingsTextInputBorder
      })
    });
    inputBox.element.classList.add("setting-list-object-input");
    this.listDisposables.add(inputBox);
    inputBox.value = keyOrValue.data;
    this.listDisposables.add(
      inputBox.onDidChange(
        (value) => update({ ...keyOrValue, data: value })
      )
    );
    const onKeyDown = (e) => {
      if (e.equals(KeyCode.Enter)) {
        this.handleItemChange(originalItem, changedItem, idx);
      } else if (e.equals(KeyCode.Escape)) {
        this.cancelEdit();
        e.preventDefault();
      }
    };
    this.listDisposables.add(
      DOM.addStandardDisposableListener(
        inputBox.inputElement,
        DOM.EventType.KEY_DOWN,
        onKeyDown
      )
    );
    return { widget: inputBox, element: wrapper };
  }
  renderEnumEditWidget(keyOrValue, { isKey, changedItem, update }) {
    const selectBox = this.createBasicSelectBox(keyOrValue);
    const changedKeyOrValue = isKey ? changedItem.key : changedItem.value;
    this.listDisposables.add(
      selectBox.onDidSelect(
        ({ selected: selected2 }) => update(
          changedKeyOrValue.type === "boolean" ? {
            ...changedKeyOrValue,
            data: selected2 === "true" ? true : false
          } : { ...changedKeyOrValue, data: selected2 }
        )
      )
    );
    const wrapper = $(".setting-list-object-input");
    wrapper.classList.add(
      isKey ? "setting-list-object-input-key" : "setting-list-object-input-value"
    );
    selectBox.render(wrapper);
    const selected = keyOrValue.options.findIndex(
      (option) => keyOrValue.data === option.value
    );
    if (selected === -1 && keyOrValue.options.length) {
      update(
        changedKeyOrValue.type === "boolean" ? { ...changedKeyOrValue, data: true } : {
          ...changedKeyOrValue,
          data: keyOrValue.options[0].value
        }
      );
    } else if (changedKeyOrValue.type === "boolean") {
      update({ ...changedKeyOrValue, data: keyOrValue.data === "true" });
    }
    return { widget: selectBox, element: wrapper };
  }
  shouldUseSuggestion(originalValue, previousValue, newValue) {
    if (newValue.type !== "enum" && newValue.type === previousValue.type && newValue.data === previousValue.data) {
      return false;
    }
    if (originalValue.data === "") {
      return true;
    }
    if (previousValue.type === newValue.type && newValue.type !== "enum") {
      return false;
    }
    if (previousValue.type === "enum" && newValue.type === "enum") {
      const previousEnums = new Set(
        previousValue.options.map(({ value }) => value)
      );
      newValue.options.forEach(
        ({ value }) => previousEnums.delete(value)
      );
      if (previousEnums.size === 0) {
        return false;
      }
    }
    return true;
  }
  addTooltipsToRow(rowElementGroup, item) {
    const { keyElement, valueElement, rowElement } = rowElementGroup;
    let accessibleDescription;
    if (item.source) {
      accessibleDescription = localize(
        "objectPairHintLabelWithSource",
        "The property `{0}` is set to `{1}` by `{2}`.",
        item.key.data,
        item.value.data,
        item.source
      );
    } else {
      accessibleDescription = localize(
        "objectPairHintLabel",
        "The property `{0}` is set to `{1}`.",
        item.key.data,
        item.value.data
      );
    }
    const markdownString = {
      markdown: new MarkdownString().appendMarkdown(
        accessibleDescription
      ),
      markdownNotSupportedFallback: accessibleDescription
    };
    const keyDescription = this.getEnumDescription(item.key) ?? item.keyDescription ?? markdownString;
    this.listDisposables.add(
      this.hoverService.setupManagedHover(
        getDefaultHoverDelegate("mouse"),
        keyElement,
        keyDescription
      )
    );
    const valueDescription = this.getEnumDescription(item.value) ?? markdownString;
    this.listDisposables.add(
      this.hoverService.setupManagedHover(
        getDefaultHoverDelegate("mouse"),
        valueElement,
        valueDescription
      )
    );
    rowElement.setAttribute("aria-label", accessibleDescription);
  }
  getEnumDescription(keyOrValue) {
    const enumDescription = keyOrValue.type === "enum" ? keyOrValue.options.find(
      ({ value }) => keyOrValue.data === value
    )?.description : void 0;
    return enumDescription;
  }
  getLocalizedStrings() {
    return {
      deleteActionTooltip: localize("removeItem", "Remove Item"),
      resetActionTooltip: localize("resetItem", "Reset Item"),
      editActionTooltip: localize("editItem", "Edit Item"),
      addButtonLabel: localize("addItem", "Add Item"),
      keyHeaderText: localize("objectKeyHeader", "Item"),
      valueHeaderText: localize("objectValueHeader", "Value")
    };
  }
};
ObjectSettingDropdownWidget = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IHoverService)
], ObjectSettingDropdownWidget);
let ObjectSettingCheckboxWidget = class extends AbstractListSettingWidget {
  constructor(container, themeService, contextViewService, hoverService) {
    super(container, themeService, contextViewService);
    this.hoverService = hoverService;
  }
  currentSettingKey = "";
  setValue(listData, options) {
    if (isDefined(options) && options.settingKey !== this.currentSettingKey) {
      this.model.setEditKey("none");
      this.model.select(null);
      this.currentSettingKey = options.settingKey;
    }
    super.setValue(listData);
  }
  isItemNew(item) {
    return !item.key.data && !item.value.data;
  }
  getEmptyItem() {
    return {
      key: { type: "string", data: "" },
      value: { type: "boolean", data: false },
      removable: false,
      resetable: true
    };
  }
  getContainerClasses() {
    return ["setting-list-object-widget"];
  }
  getActionsForItem(item, idx) {
    return [];
  }
  isAddButtonVisible() {
    return false;
  }
  renderHeader() {
    return void 0;
  }
  renderDataOrEditItem(item, idx, listFocused) {
    const rowElement = this.renderEdit(item, idx);
    rowElement.setAttribute("role", "listitem");
    return rowElement;
  }
  renderItem(item, idx) {
    const rowElement = $(".blank-row");
    const keyElement = $(".blank-row-key");
    return { rowElement, keyElement };
  }
  renderEdit(item, idx) {
    const rowElement = $(
      ".setting-list-edit-row.setting-list-object-row.setting-item-bool"
    );
    const changedItem = { ...item };
    const onValueChange = (newValue) => {
      changedItem.value.data = newValue;
      this.handleItemChange(item, changedItem, idx);
    };
    const checkboxDescription = item.keyDescription ? `${item.keyDescription} (${item.key.data})` : item.key.data;
    const { element, widget: checkbox } = this.renderEditWidget(
      changedItem.value.data,
      checkboxDescription,
      onValueChange
    );
    rowElement.appendChild(element);
    const valueElement = DOM.append(
      rowElement,
      $(".setting-list-object-value")
    );
    valueElement.textContent = checkboxDescription;
    const rowElementGroup = {
      rowElement,
      keyElement: valueElement,
      valueElement: checkbox.domNode
    };
    this.addTooltipsToRow(rowElementGroup, item);
    this._register(
      DOM.addDisposableListener(
        valueElement,
        DOM.EventType.MOUSE_DOWN,
        (e) => {
          const targetElement = e.target;
          if (targetElement.tagName.toLowerCase() !== "a") {
            checkbox.checked = !checkbox.checked;
            onValueChange(checkbox.checked);
          }
          DOM.EventHelper.stop(e);
        }
      )
    );
    return rowElement;
  }
  renderEditWidget(value, checkboxDescription, onValueChange) {
    const checkbox = new Toggle({
      icon: Codicon.check,
      actionClassName: "setting-value-checkbox",
      isChecked: value,
      title: checkboxDescription,
      ...unthemedToggleStyles
    });
    this.listDisposables.add(checkbox);
    const wrapper = $(".setting-list-object-input");
    wrapper.classList.add("setting-list-object-input-key-checkbox");
    checkbox.domNode.classList.add("setting-value-checkbox");
    wrapper.appendChild(checkbox.domNode);
    this._register(
      DOM.addDisposableListener(
        wrapper,
        DOM.EventType.MOUSE_DOWN,
        (e) => {
          checkbox.checked = !checkbox.checked;
          onValueChange(checkbox.checked);
          e.stopImmediatePropagation();
        }
      )
    );
    return { widget: checkbox, element: wrapper };
  }
  addTooltipsToRow(rowElementGroup, item) {
    const accessibleDescription = localize(
      "objectPairHintLabel",
      "The property `{0}` is set to `{1}`.",
      item.key.data,
      item.value.data
    );
    const title = item.keyDescription ?? accessibleDescription;
    const { rowElement, keyElement, valueElement } = rowElementGroup;
    this.listDisposables.add(
      this.hoverService.setupManagedHover(
        getDefaultHoverDelegate("mouse"),
        keyElement,
        title
      )
    );
    valueElement.setAttribute("aria-label", accessibleDescription);
    rowElement.setAttribute("aria-label", accessibleDescription);
  }
  getLocalizedStrings() {
    return {
      deleteActionTooltip: localize("removeItem", "Remove Item"),
      resetActionTooltip: localize("resetItem", "Reset Item"),
      editActionTooltip: localize("editItem", "Edit Item"),
      addButtonLabel: localize("addItem", "Add Item"),
      keyHeaderText: localize("objectKeyHeader", "Item"),
      valueHeaderText: localize("objectValueHeader", "Value")
    };
  }
};
ObjectSettingCheckboxWidget = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IHoverService)
], ObjectSettingCheckboxWidget);
export {
  AbstractListSettingWidget,
  ExcludeSettingWidget,
  IncludeSettingWidget,
  ListSettingListModel,
  ListSettingWidget,
  ObjectSettingCheckboxWidget,
  ObjectSettingDropdownWidget
};
