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
import { StandardKeyboardEvent } from "../../../../../../base/browser/keyboardEvent.js";
import { HoverPosition } from "../../../../../../base/browser/ui/hover/hoverWidget.js";
import { SimpleIconLabel } from "../../../../../../base/browser/ui/iconLabel/simpleIconLabel.js";
import { toErrorMessage } from "../../../../../../base/common/errorMessage.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { stripIcons } from "../../../../../../base/common/iconLabels.js";
import { KeyCode } from "../../../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore,
  dispose
} from "../../../../../../base/common/lifecycle.js";
import { MarshalledId } from "../../../../../../base/common/marshallingIds.js";
import { isThemeColor } from "../../../../../../editor/common/editorCommon.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../../../platform/notification/common/notification.js";
import { ITelemetryService } from "../../../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../../../platform/theme/common/themeService.js";
import {
  CellStatusbarAlignment
} from "../../../common/notebookCommon.js";
import {
  CellFocusMode
} from "../../notebookBrowser.js";
import { CodeCellViewModel } from "../../viewModel/codeCellViewModel.js";
import { CellContentPart } from "../cellPart.js";
import { ClickTargetType } from "./cellWidgets.js";
const $ = DOM.$;
let CellEditorStatusBar = class extends CellContentPart {
  constructor(_notebookEditor, _cellContainer, editorPart, _editor, _instantiationService, hoverService, configurationService, _themeService) {
    super();
    this._notebookEditor = _notebookEditor;
    this._cellContainer = _cellContainer;
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._themeService = _themeService;
    this.statusBarContainer = DOM.append(
      editorPart,
      $(".cell-statusbar-container")
    );
    this.statusBarContainer.tabIndex = -1;
    const leftItemsContainer = DOM.append(
      this.statusBarContainer,
      $(".cell-status-left")
    );
    const rightItemsContainer = DOM.append(
      this.statusBarContainer,
      $(".cell-status-right")
    );
    this.leftItemsContainer = DOM.append(
      leftItemsContainer,
      $(".cell-contributed-items.cell-contributed-items-left")
    );
    this.rightItemsContainer = DOM.append(
      rightItemsContainer,
      $(".cell-contributed-items.cell-contributed-items-right")
    );
    this.itemsDisposable = this._register(new DisposableStore());
    this.hoverDelegate = new class {
      _lastHoverHideTime = 0;
      showHover = (options) => {
        options.position = options.position ?? {};
        options.position.hoverPosition = HoverPosition.ABOVE;
        return hoverService.showHover(options);
      };
      placement = "element";
      get delay() {
        return Date.now() - this._lastHoverHideTime < 200 ? 0 : configurationService.getValue(
          "workbench.hover.delay"
        );
      }
      onDidHideHover() {
        this._lastHoverHideTime = Date.now();
      }
    }();
    this._register(
      this._themeService.onDidColorThemeChange(
        () => this.currentContext && this.updateContext(this.currentContext)
      )
    );
    this._register(
      DOM.addDisposableListener(
        this.statusBarContainer,
        DOM.EventType.CLICK,
        (e) => {
          if (e.target === leftItemsContainer || e.target === rightItemsContainer || e.target === this.statusBarContainer) {
            this._onDidClick.fire({
              type: ClickTargetType.Container,
              event: e
            });
          } else if (e.target.classList.contains(
            "cell-status-item-has-command"
          )) {
            this._onDidClick.fire({
              type: ClickTargetType.ContributedCommandItem,
              event: e
            });
          } else {
            this._onDidClick.fire({
              type: ClickTargetType.ContributedTextItem,
              event: e
            });
          }
        }
      )
    );
  }
  statusBarContainer;
  leftItemsContainer;
  rightItemsContainer;
  itemsDisposable;
  leftItems = [];
  rightItems = [];
  width = 0;
  currentContext;
  _onDidClick = this._register(
    new Emitter()
  );
  onDidClick = this._onDidClick.event;
  hoverDelegate;
  didRenderCell(element) {
    if (this._notebookEditor.hasModel()) {
      const context = {
        ui: true,
        cell: element,
        notebookEditor: this._notebookEditor,
        $mid: MarshalledId.NotebookCellActionContext
      };
      this.updateContext(context);
    }
    if (this._editor) {
      const updateFocusModeForEditorEvent = () => {
        if (this._editor && (this._editor.hasWidgetFocus() || this.statusBarContainer.ownerDocument.activeElement && this.statusBarContainer.contains(
          this.statusBarContainer.ownerDocument.activeElement
        ))) {
          element.focusMode = CellFocusMode.Editor;
        } else {
          const currentMode = element.focusMode;
          if (currentMode === CellFocusMode.ChatInput) {
            element.focusMode = CellFocusMode.ChatInput;
          } else if (currentMode === CellFocusMode.Output && this._notebookEditor.hasWebviewFocus()) {
            element.focusMode = CellFocusMode.Output;
          } else {
            element.focusMode = CellFocusMode.Container;
          }
        }
      };
      this.cellDisposables.add(
        this._editor.onDidFocusEditorWidget(() => {
          updateFocusModeForEditorEvent();
        })
      );
      this.cellDisposables.add(
        this._editor.onDidBlurEditorWidget(() => {
          if (this._notebookEditor.hasEditorFocus() && !(this.statusBarContainer.ownerDocument.activeElement && this.statusBarContainer.contains(
            this.statusBarContainer.ownerDocument.activeElement
          ))) {
            updateFocusModeForEditorEvent();
          }
        })
      );
      this.cellDisposables.add(
        this.onDidClick((e) => {
          if (this.currentCell instanceof CodeCellViewModel && e.type !== ClickTargetType.ContributedCommandItem && this._editor) {
            const target = this._editor.getTargetAtClientPoint(
              e.event.clientX,
              e.event.clientY - this._notebookEditor.notebookOptions.computeEditorStatusbarHeight(
                this.currentCell.internalMetadata,
                this.currentCell.uri
              )
            );
            if (target?.position) {
              this._editor.setPosition(target.position);
              this._editor.focus();
            }
          }
        })
      );
    }
  }
  updateInternalLayoutNow(element) {
    this._cellContainer.classList.toggle(
      "cell-statusbar-hidden",
      this._notebookEditor.notebookOptions.computeEditorStatusbarHeight(
        element.internalMetadata,
        element.uri
      ) === 0
    );
    const layoutInfo = element.layoutInfo;
    const width = layoutInfo.editorWidth;
    if (!width) {
      return;
    }
    this.width = width;
    this.statusBarContainer.style.width = `${width}px`;
    const maxItemWidth = this.getMaxItemWidth();
    this.leftItems.forEach((item) => item.maxWidth = maxItemWidth);
    this.rightItems.forEach((item) => item.maxWidth = maxItemWidth);
  }
  getMaxItemWidth() {
    return this.width / 2;
  }
  updateContext(context) {
    this.currentContext = context;
    this.itemsDisposable.clear();
    if (!this.currentContext) {
      return;
    }
    this.itemsDisposable.add(
      this.currentContext.cell.onDidChangeLayout(() => {
        if (this.currentContext) {
          this.updateInternalLayoutNow(this.currentContext.cell);
        }
      })
    );
    this.itemsDisposable.add(
      this.currentContext.cell.onDidChangeCellStatusBarItems(
        () => this.updateRenderedItems()
      )
    );
    this.itemsDisposable.add(
      this.currentContext.notebookEditor.onDidChangeActiveCell(
        () => this.updateActiveCell()
      )
    );
    this.updateInternalLayoutNow(this.currentContext.cell);
    this.updateActiveCell();
    this.updateRenderedItems();
  }
  updateActiveCell() {
    const isActiveCell = this.currentContext.notebookEditor.getActiveCell() === this.currentContext?.cell;
    this.statusBarContainer.classList.toggle(
      "is-active-cell",
      isActiveCell
    );
  }
  updateRenderedItems() {
    const items = this.currentContext.cell.getCellStatusBarItems();
    items.sort((itemA, itemB) => {
      return (itemB.priority ?? 0) - (itemA.priority ?? 0);
    });
    const maxItemWidth = this.getMaxItemWidth();
    const newLeftItems = items.filter(
      (item) => item.alignment === CellStatusbarAlignment.Left
    );
    const newRightItems = items.filter((item) => item.alignment === CellStatusbarAlignment.Right).reverse();
    const updateItems = (renderedItems, newItems, container) => {
      if (renderedItems.length > newItems.length) {
        const deleted = renderedItems.splice(
          newItems.length,
          renderedItems.length - newItems.length
        );
        for (const deletedItem of deleted) {
          deletedItem.container.remove();
          deletedItem.dispose();
        }
      }
      newItems.forEach((newLeftItem, i) => {
        const existingItem = renderedItems[i];
        if (existingItem) {
          existingItem.updateItem(newLeftItem, maxItemWidth);
        } else {
          const item = this._instantiationService.createInstance(
            CellStatusBarItem,
            this.currentContext,
            this.hoverDelegate,
            this._editor,
            newLeftItem,
            maxItemWidth
          );
          renderedItems.push(item);
          container.appendChild(item.container);
        }
      });
    };
    updateItems(this.leftItems, newLeftItems, this.leftItemsContainer);
    updateItems(this.rightItems, newRightItems, this.rightItemsContainer);
  }
  dispose() {
    super.dispose();
    dispose(this.leftItems);
    dispose(this.rightItems);
  }
};
CellEditorStatusBar = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IThemeService)
], CellEditorStatusBar);
let CellStatusBarItem = class extends Disposable {
  constructor(_context, _hoverDelegate, _editor, itemModel, maxWidth, _telemetryService, _commandService, _notificationService, _themeService, _hoverService) {
    super();
    this._context = _context;
    this._hoverDelegate = _hoverDelegate;
    this._editor = _editor;
    this._telemetryService = _telemetryService;
    this._commandService = _commandService;
    this._notificationService = _notificationService;
    this._themeService = _themeService;
    this._hoverService = _hoverService;
    this.updateItem(itemModel, maxWidth);
  }
  container = $(".cell-status-item");
  set maxWidth(v) {
    this.container.style.maxWidth = v + "px";
  }
  _currentItem;
  _itemDisposables = this._register(new DisposableStore());
  updateItem(item, maxWidth) {
    this._itemDisposables.clear();
    if (!this._currentItem || this._currentItem.text !== item.text) {
      this._itemDisposables.add(
        new SimpleIconLabel(this.container)
      ).text = item.text.replace(/\n/g, " ");
    }
    const resolveColor = (color) => {
      return isThemeColor(color) ? this._themeService.getColorTheme().getColor(color.id)?.toString() || "" : color;
    };
    this.container.style.color = item.color ? resolveColor(item.color) : "";
    this.container.style.backgroundColor = item.backgroundColor ? resolveColor(item.backgroundColor) : "";
    this.container.style.opacity = item.opacity ? item.opacity : "";
    this.container.classList.toggle(
      "cell-status-item-show-when-active",
      !!item.onlyShowWhenActive
    );
    if (typeof maxWidth === "number") {
      this.maxWidth = maxWidth;
    }
    let ariaLabel;
    let role;
    if (item.accessibilityInformation) {
      ariaLabel = item.accessibilityInformation.label;
      role = item.accessibilityInformation.role;
    } else {
      ariaLabel = item.text ? stripIcons(item.text).trim() : "";
    }
    this.container.setAttribute("aria-label", ariaLabel);
    this.container.setAttribute("role", role || "");
    if (item.tooltip) {
      const hoverContent = typeof item.tooltip === "string" ? item.tooltip : {
        markdown: item.tooltip,
        markdownNotSupportedFallback: void 0
      };
      this._itemDisposables.add(
        this._hoverService.setupManagedHover(
          this._hoverDelegate,
          this.container,
          hoverContent
        )
      );
    }
    this.container.classList.toggle(
      "cell-status-item-has-command",
      !!item.command
    );
    if (item.command) {
      this.container.tabIndex = 0;
      this._itemDisposables.add(
        DOM.addDisposableListener(
          this.container,
          DOM.EventType.CLICK,
          (_e) => {
            this.executeCommand();
          }
        )
      );
      this._itemDisposables.add(
        DOM.addDisposableListener(
          this.container,
          DOM.EventType.KEY_DOWN,
          (e) => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(KeyCode.Space) || event.equals(KeyCode.Enter)) {
              this.executeCommand();
            }
          }
        )
      );
    } else {
      this.container.removeAttribute("tabIndex");
    }
    this._currentItem = item;
  }
  async executeCommand() {
    const command = this._currentItem.command;
    if (!command) {
      return;
    }
    const id = typeof command === "string" ? command : command.id;
    const args = typeof command === "string" ? [] : command.arguments ?? [];
    if (typeof command === "string" || !command.arguments || !Array.isArray(command.arguments) || command.arguments.length === 0) {
      args.unshift(this._context);
    }
    this._telemetryService.publicLog2("workbenchActionExecuted", { id, from: "cell status bar" });
    try {
      this._editor?.focus();
      await this._commandService.executeCommand(id, ...args);
    } catch (error) {
      this._notificationService.error(toErrorMessage(error));
    }
  }
};
CellStatusBarItem = __decorateClass([
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService)
], CellStatusBarItem);
export {
  CellEditorStatusBar
};
