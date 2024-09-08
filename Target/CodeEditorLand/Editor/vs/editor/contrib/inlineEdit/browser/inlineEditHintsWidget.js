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
import { h } from "../../../../base/browser/dom.js";
import {
  KeybindingLabel,
  unthemedKeybindingLabelOptions
} from "../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { Separator } from "../../../../base/common/actions.js";
import { equals } from "../../../../base/common/arrays.js";
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import {
  autorun,
  autorunWithStore,
  derived,
  observableFromEvent
} from "../../../../base/common/observable.js";
import { OS } from "../../../../base/common/platform.js";
import "./inlineEditHintsWidget.css";
import {
  MenuEntryActionViewItem,
  createAndFillInActionBarActions
} from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import {
  WorkbenchToolBar
} from "../../../../platform/actions/browser/toolbar.js";
import {
  IMenuService,
  MenuId,
  MenuItemAction
} from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  ContentWidgetPositionPreference
} from "../../../browser/editorBrowser.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { Position } from "../../../common/core/position.js";
import { PositionAffinity } from "../../../common/model.js";
let InlineEditHintsWidget = class extends Disposable {
  constructor(editor, model, instantiationService) {
    super();
    this.editor = editor;
    this.model = model;
    this.instantiationService = instantiationService;
    this._register(autorunWithStore((reader, store) => {
      const model2 = this.model.read(reader);
      if (!model2 || !this.alwaysShowToolbar.read(reader)) {
        return;
      }
      const contentWidget = store.add(this.instantiationService.createInstance(
        InlineEditHintsContentWidget,
        this.editor,
        true,
        this.position
      ));
      editor.addContentWidget(contentWidget);
      store.add(toDisposable(() => editor.removeContentWidget(contentWidget)));
    }));
  }
  alwaysShowToolbar = observableFromEvent(
    this,
    this.editor.onDidChangeConfiguration,
    () => this.editor.getOption(EditorOption.inlineEdit).showToolbar === "always"
  );
  sessionPosition = void 0;
  position = derived(this, (reader) => {
    const ghostText = this.model.read(reader)?.model.ghostText.read(reader);
    if (!this.alwaysShowToolbar.read(reader) || !ghostText || ghostText.parts.length === 0) {
      this.sessionPosition = void 0;
      return null;
    }
    const firstColumn = ghostText.parts[0].column;
    if (this.sessionPosition && this.sessionPosition.lineNumber !== ghostText.lineNumber) {
      this.sessionPosition = void 0;
    }
    const position = new Position(
      ghostText.lineNumber,
      Math.min(
        firstColumn,
        this.sessionPosition?.column ?? Number.MAX_SAFE_INTEGER
      )
    );
    this.sessionPosition = position;
    return position;
  });
};
InlineEditHintsWidget = __decorateClass([
  __decorateParam(2, IInstantiationService)
], InlineEditHintsWidget);
let InlineEditHintsContentWidget = class extends Disposable {
  constructor(editor, withBorder, _position, instantiationService, _contextKeyService, _menuService) {
    super();
    this.editor = editor;
    this.withBorder = withBorder;
    this._position = _position;
    this._contextKeyService = _contextKeyService;
    this._menuService = _menuService;
    this.toolBar = this._register(instantiationService.createInstance(CustomizedMenuWorkbenchToolBar, this.nodes.toolBar, this.editor, MenuId.InlineEditToolbar, {
      menuOptions: { renderShortTitle: true },
      toolbarOptions: { primaryGroup: (g) => g.startsWith("primary") },
      actionViewItemProvider: (action, options) => {
        if (action instanceof MenuItemAction) {
          return instantiationService.createInstance(StatusBarViewItem, action, void 0);
        }
        return void 0;
      },
      telemetrySource: "InlineEditToolbar"
    }));
    this._register(this.toolBar.onDidChangeDropdownVisibility((e) => {
      InlineEditHintsContentWidget._dropDownVisible = e;
    }));
    this._register(autorun((reader) => {
      this._position.read(reader);
      this.editor.layoutContentWidget(this);
    }));
    this._register(autorun((reader) => {
      const extraActions = [];
      for (const [_, group] of this.inlineCompletionsActionsMenus.getActions()) {
        for (const action of group) {
          if (action instanceof MenuItemAction) {
            extraActions.push(action);
          }
        }
      }
      if (extraActions.length > 0) {
        extraActions.unshift(new Separator());
      }
      this.toolBar.setAdditionalSecondaryActions(extraActions);
    }));
  }
  static _dropDownVisible = false;
  static get dropDownVisible() {
    return this._dropDownVisible;
  }
  static id = 0;
  id = `InlineEditHintsContentWidget${InlineEditHintsContentWidget.id++}`;
  allowEditorOverflow = true;
  suppressMouseDown = false;
  nodes = h(
    "div.inlineEditHints",
    { className: this.withBorder ? ".withBorder" : "" },
    [h("div@toolBar")]
  );
  toolBar;
  inlineCompletionsActionsMenus = this._register(
    this._menuService.createMenu(
      MenuId.InlineEditActions,
      this._contextKeyService
    )
  );
  getId() {
    return this.id;
  }
  getDomNode() {
    return this.nodes.root;
  }
  getPosition() {
    return {
      position: this._position.get(),
      preference: [
        ContentWidgetPositionPreference.ABOVE,
        ContentWidgetPositionPreference.BELOW
      ],
      positionAffinity: PositionAffinity.LeftOfInjectedText
    };
  }
};
InlineEditHintsContentWidget = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IMenuService)
], InlineEditHintsContentWidget);
class StatusBarViewItem extends MenuEntryActionViewItem {
  updateLabel() {
    const kb = this._keybindingService.lookupKeybinding(
      this._action.id,
      this._contextKeyService
    );
    if (!kb) {
      return super.updateLabel();
    }
    if (this.label) {
      const div = h("div.keybinding").root;
      const k = this._register(
        new KeybindingLabel(div, OS, {
          disableTitle: true,
          ...unthemedKeybindingLabelOptions
        })
      );
      k.set(kb);
      this.label.textContent = this._action.label;
      this.label.appendChild(div);
      this.label.classList.add("inlineEditStatusBarItemLabel");
    }
  }
  updateTooltip() {
  }
}
let CustomizedMenuWorkbenchToolBar = class extends WorkbenchToolBar {
  constructor(container, editor, menuId, options2, menuService, contextKeyService, contextMenuService, keybindingService, commandService, telemetryService) {
    super(container, { resetMenu: menuId, ...options2 }, menuService, contextKeyService, contextMenuService, keybindingService, commandService, telemetryService);
    this.editor = editor;
    this.menuId = menuId;
    this.options2 = options2;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this._store.add(this.menu.onDidChange(() => this.updateToolbar()));
    this._store.add(this.editor.onDidChangeCursorPosition(() => this.updateToolbar()));
    this.updateToolbar();
  }
  menu = this._store.add(
    this.menuService.createMenu(this.menuId, this.contextKeyService, {
      emitEventsForSubmenuChanges: true
    })
  );
  additionalActions = [];
  prependedPrimaryActions = [];
  updateToolbar() {
    const primary = [];
    const secondary = [];
    createAndFillInActionBarActions(
      this.menu,
      this.options2?.menuOptions,
      { primary, secondary },
      this.options2?.toolbarOptions?.primaryGroup,
      this.options2?.toolbarOptions?.shouldInlineSubmenu,
      this.options2?.toolbarOptions?.useSeparatorsInPrimaryActions
    );
    secondary.push(...this.additionalActions);
    primary.unshift(...this.prependedPrimaryActions);
    this.setActions(primary, secondary);
  }
  setPrependedPrimaryActions(actions) {
    if (equals(this.prependedPrimaryActions, actions, (a, b) => a === b)) {
      return;
    }
    this.prependedPrimaryActions = actions;
    this.updateToolbar();
  }
  setAdditionalSecondaryActions(actions) {
    if (equals(this.additionalActions, actions, (a, b) => a === b)) {
      return;
    }
    this.additionalActions = actions;
    this.updateToolbar();
  }
};
CustomizedMenuWorkbenchToolBar = __decorateClass([
  __decorateParam(4, IMenuService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IKeybindingService),
  __decorateParam(8, ICommandService),
  __decorateParam(9, ITelemetryService)
], CustomizedMenuWorkbenchToolBar);
export {
  CustomizedMenuWorkbenchToolBar,
  InlineEditHintsContentWidget,
  InlineEditHintsWidget
};
