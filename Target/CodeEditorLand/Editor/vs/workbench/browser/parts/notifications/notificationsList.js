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
import "./media/notificationsList.css";
import {
  getWindow,
  isAncestorOfActiveElement,
  trackFocus
} from "../../../../base/browser/dom.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { assertAllDefined } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { WorkbenchList } from "../../../../platform/list/browser/listService.js";
import { NotificationFocusedContext } from "../../../common/contextkeys.js";
import { NOTIFICATIONS_BACKGROUND } from "../../../common/theme.js";
import { CopyNotificationMessageAction } from "./notificationsActions.js";
import { NotificationActionRunner } from "./notificationsCommands.js";
import {
  NotificationRenderer,
  NotificationsListDelegate
} from "./notificationsViewer.js";
let NotificationsList = class extends Disposable {
  constructor(container, options, instantiationService, contextMenuService) {
    super();
    this.container = container;
    this.options = options;
    this.instantiationService = instantiationService;
    this.contextMenuService = contextMenuService;
  }
  listContainer;
  list;
  listDelegate;
  viewModel = [];
  isVisible;
  show() {
    if (this.isVisible) {
      return;
    }
    if (!this.list) {
      this.createNotificationsList();
    }
    this.isVisible = true;
  }
  createNotificationsList() {
    this.listContainer = document.createElement("div");
    this.listContainer.classList.add("notifications-list-container");
    const actionRunner = this._register(
      this.instantiationService.createInstance(NotificationActionRunner)
    );
    const renderer = this.instantiationService.createInstance(
      NotificationRenderer,
      actionRunner
    );
    const listDelegate = this.listDelegate = new NotificationsListDelegate(
      this.listContainer
    );
    const options = this.options;
    const list = this.list = this._register(
      this.instantiationService.createInstance(
        WorkbenchList,
        "NotificationsList",
        this.listContainer,
        listDelegate,
        [renderer],
        {
          ...options,
          setRowLineHeight: false,
          horizontalScrolling: false,
          overrideStyles: {
            listBackground: NOTIFICATIONS_BACKGROUND
          },
          accessibilityProvider: this.instantiationService.createInstance(
            NotificationAccessibilityProvider,
            options
          )
        }
      )
    );
    const copyAction = this._register(
      this.instantiationService.createInstance(
        CopyNotificationMessageAction,
        CopyNotificationMessageAction.ID,
        CopyNotificationMessageAction.LABEL
      )
    );
    this._register(
      list.onContextMenu((e) => {
        if (!e.element) {
          return;
        }
        this.contextMenuService.showContextMenu({
          getAnchor: () => e.anchor,
          getActions: () => [copyAction],
          getActionsContext: () => e.element,
          actionRunner
        });
      })
    );
    this._register(
      list.onMouseDblClick(
        (event) => event.element.toggle()
      )
    );
    const listFocusTracker = this._register(
      trackFocus(list.getHTMLElement())
    );
    this._register(
      listFocusTracker.onDidBlur(() => {
        if (getWindow(this.listContainer).document.hasFocus()) {
          list.setFocus([]);
        }
      })
    );
    NotificationFocusedContext.bindTo(list.contextKeyService);
    this._register(
      list.onDidChangeSelection((e) => {
        if (e.indexes.length > 0) {
          list.setSelection([]);
        }
      })
    );
    this.container.appendChild(this.listContainer);
  }
  updateNotificationsList(start, deleteCount, items = []) {
    const [list, listContainer] = assertAllDefined(
      this.list,
      this.listContainer
    );
    const listHasDOMFocus = isAncestorOfActiveElement(listContainer);
    const focusedIndex = list.getFocus()[0];
    const focusedItem = this.viewModel[focusedIndex];
    let focusRelativeTop = null;
    if (typeof focusedIndex === "number") {
      focusRelativeTop = list.getRelativeTop(focusedIndex);
    }
    this.viewModel.splice(start, deleteCount, ...items);
    list.splice(start, deleteCount, items);
    list.layout();
    if (this.viewModel.length === 0) {
      this.hide();
    } else if (typeof focusedIndex === "number") {
      let indexToFocus = 0;
      if (focusedItem) {
        let indexToFocusCandidate = this.viewModel.indexOf(focusedItem);
        if (indexToFocusCandidate === -1) {
          indexToFocusCandidate = focusedIndex - 1;
        }
        if (indexToFocusCandidate < this.viewModel.length && indexToFocusCandidate >= 0) {
          indexToFocus = indexToFocusCandidate;
        }
      }
      if (typeof focusRelativeTop === "number") {
        list.reveal(indexToFocus, focusRelativeTop);
      }
      list.setFocus([indexToFocus]);
    }
    if (this.isVisible && listHasDOMFocus) {
      list.domFocus();
    }
  }
  updateNotificationHeight(item) {
    const index = this.viewModel.indexOf(item);
    if (index === -1) {
      return;
    }
    const [list, listDelegate] = assertAllDefined(
      this.list,
      this.listDelegate
    );
    list.updateElementHeight(index, listDelegate.getHeight(item));
    list.layout();
  }
  hide() {
    if (!this.isVisible || !this.list) {
      return;
    }
    this.isVisible = false;
    this.list.splice(0, this.viewModel.length);
    this.viewModel = [];
  }
  focusFirst() {
    if (!this.list) {
      return;
    }
    this.list.focusFirst();
    this.list.domFocus();
  }
  hasFocus() {
    if (!this.listContainer) {
      return false;
    }
    return isAncestorOfActiveElement(this.listContainer);
  }
  layout(width, maxHeight) {
    if (this.listContainer && this.list) {
      this.listContainer.style.width = `${width}px`;
      if (typeof maxHeight === "number") {
        this.list.getHTMLElement().style.maxHeight = `${maxHeight}px`;
      }
      this.list.layout();
    }
  }
  dispose() {
    this.hide();
    super.dispose();
  }
};
NotificationsList = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextMenuService)
], NotificationsList);
let NotificationAccessibilityProvider = class {
  constructor(_options, _keybindingService, _configurationService) {
    this._options = _options;
    this._keybindingService = _keybindingService;
    this._configurationService = _configurationService;
  }
  getAriaLabel(element) {
    let accessibleViewHint;
    const keybinding = this._keybindingService.lookupKeybinding("editor.action.accessibleView")?.getAriaLabel();
    if (this._configurationService.getValue(
      "accessibility.verbosity.notification"
    )) {
      accessibleViewHint = keybinding ? localize(
        "notificationAccessibleViewHint",
        "Inspect the response in the accessible view with {0}",
        keybinding
      ) : localize(
        "notificationAccessibleViewHintNoKb",
        "Inspect the response in the accessible view via the command Open Accessible View which is currently not triggerable via keybinding"
      );
    }
    if (!element.source) {
      return accessibleViewHint ? localize(
        "notificationAriaLabelHint",
        "{0}, notification, {1}",
        element.message.raw,
        accessibleViewHint
      ) : localize(
        "notificationAriaLabel",
        "{0}, notification",
        element.message.raw
      );
    }
    return accessibleViewHint ? localize(
      "notificationWithSourceAriaLabelHint",
      "{0}, source: {1}, notification, {2}",
      element.message.raw,
      element.source,
      accessibleViewHint
    ) : localize(
      "notificationWithSourceAriaLabel",
      "{0}, source: {1}, notification",
      element.message.raw,
      element.source
    );
  }
  getWidgetAriaLabel() {
    return this._options.widgetAriaLabel ?? localize("notificationsList", "Notifications List");
  }
  getRole() {
    return "dialog";
  }
};
NotificationAccessibilityProvider = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IConfigurationService)
], NotificationAccessibilityProvider);
export {
  NotificationsList
};
