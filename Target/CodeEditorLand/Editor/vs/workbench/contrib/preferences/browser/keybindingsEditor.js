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
import "./media/keybindingsEditor.css";
import * as DOM from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { HighlightedLabel } from "../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { KeybindingLabel } from "../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { ToggleActionViewItem } from "../../../../base/browser/ui/toggle/toggle.js";
import { ToolBar } from "../../../../base/browser/ui/toolbar/toolbar.js";
import {
  Action,
  Separator
} from "../../../../base/common/actions.js";
import { Delayer } from "../../../../base/common/async.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { OS, isIOS } from "../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { isString } from "../../../../base/common/types.js";
import { EditorExtensionsRegistry } from "../../../../editor/browser/editorExtensions.js";
import { CompletionItemKind } from "../../../../editor/common/languages.js";
import { localize } from "../../../../nls.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import {
  MenuRegistry,
  isIMenuItem
} from "../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import {
  IKeybindingService
} from "../../../../platform/keybinding/common/keybinding.js";
import { WorkbenchTable } from "../../../../platform/list/browser/listService.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  defaultKeybindingLabelStyles,
  defaultToggleStyles,
  getInputBoxStyle
} from "../../../../platform/theme/browser/defaultStyles.js";
import {
  asCssVariable,
  badgeBackground,
  badgeForeground,
  contrastBorder,
  editorBackground,
  foreground,
  listActiveSelectionBackground,
  listActiveSelectionForeground,
  listFocusBackground,
  listFocusForeground,
  listHoverBackground,
  listHoverForeground,
  listInactiveSelectionBackground,
  listInactiveSelectionForeground,
  registerColor,
  tableOddRowsBackgroundColor
} from "../../../../platform/theme/common/colorRegistry.js";
import {
  IThemeService,
  registerThemingParticipant
} from "../../../../platform/theme/common/themeService.js";
import { registerNavigableContainer } from "../../../browser/actions/widgetNavigationCommands.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { WORKBENCH_BACKGROUND } from "../../../common/theme.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IKeybindingEditingService } from "../../../services/keybinding/common/keybindingEditing.js";
import {
  KEYBINDING_ENTRY_TEMPLATE_ID
} from "../../../services/preferences/browser/keybindingsEditorModel.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { SuggestEnabledInput } from "../../codeEditor/browser/suggestEnabledInput/suggestEnabledInput.js";
import { IExtensionsWorkbenchService } from "../../extensions/common/extensions.js";
import {
  CONTEXT_KEYBINDINGS_EDITOR,
  CONTEXT_KEYBINDINGS_SEARCH_FOCUS,
  CONTEXT_KEYBINDING_FOCUS,
  CONTEXT_WHEN_FOCUS,
  KEYBINDINGS_EDITOR_COMMAND_ADD,
  KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
  KEYBINDINGS_EDITOR_COMMAND_COPY,
  KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
  KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE,
  KEYBINDINGS_EDITOR_COMMAND_DEFINE,
  KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN,
  KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS,
  KEYBINDINGS_EDITOR_COMMAND_REMOVE,
  KEYBINDINGS_EDITOR_COMMAND_RESET,
  KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
  KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE
} from "../common/preferences.js";
import { settingsTextInputBorder } from "../common/settingsEditorColorRegistry.js";
import {
  DefineKeybindingWidget,
  KeybindingsSearchWidget
} from "./keybindingWidgets.js";
import {
  keybindingsAddIcon,
  keybindingsEditIcon,
  keybindingsRecordKeysIcon,
  keybindingsSortIcon,
  preferencesClearInputIcon
} from "./preferencesIcons.js";
const $ = DOM.$;
let KeybindingsEditor = class extends EditorPane {
  constructor(group, telemetryService, themeService, keybindingsService, contextMenuService, keybindingEditingService, contextKeyService, notificationService, clipboardService, instantiationService, editorService, storageService, configurationService, accessibilityService) {
    super(
      KeybindingsEditor.ID,
      group,
      telemetryService,
      themeService,
      storageService
    );
    this.keybindingsService = keybindingsService;
    this.contextMenuService = contextMenuService;
    this.keybindingEditingService = keybindingEditingService;
    this.contextKeyService = contextKeyService;
    this.notificationService = notificationService;
    this.clipboardService = clipboardService;
    this.instantiationService = instantiationService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.accessibilityService = accessibilityService;
    this.delayedFiltering = new Delayer(300);
    this._register(
      keybindingsService.onDidUpdateKeybindings(
        () => this.render(!!this.keybindingFocusContextKey.get())
      )
    );
    this.keybindingsEditorContextKey = CONTEXT_KEYBINDINGS_EDITOR.bindTo(
      this.contextKeyService
    );
    this.searchFocusContextKey = CONTEXT_KEYBINDINGS_SEARCH_FOCUS.bindTo(
      this.contextKeyService
    );
    this.keybindingFocusContextKey = CONTEXT_KEYBINDING_FOCUS.bindTo(
      this.contextKeyService
    );
    this.searchHistoryDelayer = new Delayer(500);
    this.recordKeysAction = new Action(
      KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS,
      localize("recordKeysLabel", "Record Keys"),
      ThemeIcon.asClassName(keybindingsRecordKeysIcon)
    );
    this.recordKeysAction.checked = false;
    this.sortByPrecedenceAction = new Action(
      KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE,
      localize(
        "sortByPrecedeneLabel",
        "Sort by Precedence (Highest first)"
      ),
      ThemeIcon.asClassName(keybindingsSortIcon)
    );
    this.sortByPrecedenceAction.checked = false;
    this.overflowWidgetsDomNode = $(
      ".keybindings-overflow-widgets-container.monaco-editor"
    );
  }
  static {
    __name(this, "KeybindingsEditor");
  }
  static ID = "workbench.editor.keybindings";
  _onDefineWhenExpression = this._register(new Emitter());
  onDefineWhenExpression = this._onDefineWhenExpression.event;
  _onRejectWhenExpression = this._register(
    new Emitter()
  );
  onRejectWhenExpression = this._onRejectWhenExpression.event;
  _onAcceptWhenExpression = this._register(
    new Emitter()
  );
  onAcceptWhenExpression = this._onAcceptWhenExpression.event;
  _onLayout = this._register(new Emitter());
  onLayout = this._onLayout.event;
  keybindingsEditorModel = null;
  headerContainer;
  actionsContainer;
  searchWidget;
  searchHistoryDelayer;
  overlayContainer;
  defineKeybindingWidget;
  unAssignedKeybindingItemToRevealAndFocus = null;
  tableEntries = [];
  keybindingsTableContainer;
  keybindingsTable;
  dimension = null;
  delayedFiltering;
  latestEmptyFilters = [];
  keybindingsEditorContextKey;
  keybindingFocusContextKey;
  searchFocusContextKey;
  sortByPrecedenceAction;
  recordKeysAction;
  ariaLabelElement;
  overflowWidgetsDomNode;
  create(parent) {
    super.create(parent);
    this._register(
      registerNavigableContainer({
        name: "keybindingsEditor",
        focusNotifiers: [this],
        focusNextWidget: /* @__PURE__ */ __name(() => {
          if (this.searchWidget.hasFocus()) {
            this.focusKeybindings();
          }
        }, "focusNextWidget"),
        focusPreviousWidget: /* @__PURE__ */ __name(() => {
          if (!this.searchWidget.hasFocus()) {
            this.focusSearch();
          }
        }, "focusPreviousWidget")
      })
    );
  }
  createEditor(parent) {
    const keybindingsEditorElement = DOM.append(
      parent,
      $("div", { class: "keybindings-editor" })
    );
    this.createAriaLabelElement(keybindingsEditorElement);
    this.createOverlayContainer(keybindingsEditorElement);
    this.createHeader(keybindingsEditorElement);
    this.createBody(keybindingsEditorElement);
  }
  setInput(input, options, context, token) {
    this.keybindingsEditorContextKey.set(true);
    return super.setInput(input, options, context, token).then(() => this.render(!!(options && options.preserveFocus)));
  }
  clearInput() {
    super.clearInput();
    this.keybindingsEditorContextKey.reset();
    this.keybindingFocusContextKey.reset();
  }
  layout(dimension) {
    this.dimension = dimension;
    this.layoutSearchWidget(dimension);
    this.overlayContainer.style.width = dimension.width + "px";
    this.overlayContainer.style.height = dimension.height + "px";
    this.defineKeybindingWidget.layout(this.dimension);
    this.layoutKeybindingsTable();
    this._onLayout.fire();
  }
  focus() {
    super.focus();
    const activeKeybindingEntry = this.activeKeybindingEntry;
    if (activeKeybindingEntry) {
      this.selectEntry(activeKeybindingEntry);
    } else if (!isIOS) {
      this.searchWidget.focus();
    }
  }
  get activeKeybindingEntry() {
    const focusedElement = this.keybindingsTable.getFocusedElements()[0];
    return focusedElement && focusedElement.templateId === KEYBINDING_ENTRY_TEMPLATE_ID ? focusedElement : null;
  }
  async defineKeybinding(keybindingEntry, add) {
    this.selectEntry(keybindingEntry);
    this.showOverlayContainer();
    try {
      const key = await this.defineKeybindingWidget.define();
      if (key) {
        await this.updateKeybinding(
          keybindingEntry,
          key,
          keybindingEntry.keybindingItem.when,
          add
        );
      }
    } catch (error) {
      this.onKeybindingEditingError(error);
    } finally {
      this.hideOverlayContainer();
      this.selectEntry(keybindingEntry);
    }
  }
  defineWhenExpression(keybindingEntry) {
    if (keybindingEntry.keybindingItem.keybinding) {
      this.selectEntry(keybindingEntry);
      this._onDefineWhenExpression.fire(keybindingEntry);
    }
  }
  rejectWhenExpression(keybindingEntry) {
    this._onRejectWhenExpression.fire(keybindingEntry);
  }
  acceptWhenExpression(keybindingEntry) {
    this._onAcceptWhenExpression.fire(keybindingEntry);
  }
  async updateKeybinding(keybindingEntry, key, when, add) {
    const currentKey = keybindingEntry.keybindingItem.keybinding ? keybindingEntry.keybindingItem.keybinding.getUserSettingsLabel() : "";
    if (currentKey !== key || keybindingEntry.keybindingItem.when !== when) {
      if (add) {
        await this.keybindingEditingService.addKeybinding(
          keybindingEntry.keybindingItem.keybindingItem,
          key,
          when || void 0
        );
      } else {
        await this.keybindingEditingService.editKeybinding(
          keybindingEntry.keybindingItem.keybindingItem,
          key,
          when || void 0
        );
      }
      if (!keybindingEntry.keybindingItem.keybinding) {
        this.unAssignedKeybindingItemToRevealAndFocus = keybindingEntry;
      }
    }
  }
  async removeKeybinding(keybindingEntry) {
    this.selectEntry(keybindingEntry);
    if (keybindingEntry.keybindingItem.keybinding) {
      try {
        await this.keybindingEditingService.removeKeybinding(
          keybindingEntry.keybindingItem.keybindingItem
        );
        this.focus();
      } catch (error) {
        this.onKeybindingEditingError(error);
        this.selectEntry(keybindingEntry);
      }
    }
  }
  async resetKeybinding(keybindingEntry) {
    this.selectEntry(keybindingEntry);
    try {
      await this.keybindingEditingService.resetKeybinding(
        keybindingEntry.keybindingItem.keybindingItem
      );
      if (!keybindingEntry.keybindingItem.keybinding) {
        this.unAssignedKeybindingItemToRevealAndFocus = keybindingEntry;
      }
      this.selectEntry(keybindingEntry);
    } catch (error) {
      this.onKeybindingEditingError(error);
      this.selectEntry(keybindingEntry);
    }
  }
  async copyKeybinding(keybinding) {
    this.selectEntry(keybinding);
    const userFriendlyKeybinding = {
      key: keybinding.keybindingItem.keybinding ? keybinding.keybindingItem.keybinding.getUserSettingsLabel() || "" : "",
      command: keybinding.keybindingItem.command
    };
    if (keybinding.keybindingItem.when) {
      userFriendlyKeybinding.when = keybinding.keybindingItem.when;
    }
    await this.clipboardService.writeText(
      JSON.stringify(userFriendlyKeybinding, null, "  ")
    );
  }
  async copyKeybindingCommand(keybinding) {
    this.selectEntry(keybinding);
    await this.clipboardService.writeText(
      keybinding.keybindingItem.command
    );
  }
  async copyKeybindingCommandTitle(keybinding) {
    this.selectEntry(keybinding);
    await this.clipboardService.writeText(
      keybinding.keybindingItem.commandLabel
    );
  }
  focusSearch() {
    this.searchWidget.focus();
  }
  search(filter) {
    this.focusSearch();
    this.searchWidget.setValue(filter);
    this.selectEntry(0);
  }
  clearSearchResults() {
    this.searchWidget.clear();
  }
  showSimilarKeybindings(keybindingEntry) {
    const value = `"${keybindingEntry.keybindingItem.keybinding.getAriaLabel()}"`;
    if (value !== this.searchWidget.getValue()) {
      this.searchWidget.setValue(value);
    }
  }
  createAriaLabelElement(parent) {
    this.ariaLabelElement = DOM.append(parent, DOM.$(""));
    this.ariaLabelElement.setAttribute(
      "id",
      "keybindings-editor-aria-label-element"
    );
    this.ariaLabelElement.setAttribute("aria-live", "assertive");
  }
  createOverlayContainer(parent) {
    this.overlayContainer = DOM.append(parent, $(".overlay-container"));
    this.overlayContainer.style.position = "absolute";
    this.overlayContainer.style.zIndex = "40";
    this.defineKeybindingWidget = this._register(
      this.instantiationService.createInstance(
        DefineKeybindingWidget,
        this.overlayContainer
      )
    );
    this._register(
      this.defineKeybindingWidget.onDidChange(
        (keybindingStr) => this.defineKeybindingWidget.printExisting(
          this.keybindingsEditorModel.fetch(`"${keybindingStr}"`).length
        )
      )
    );
    this._register(
      this.defineKeybindingWidget.onShowExistingKeybidings(
        (keybindingStr) => this.searchWidget.setValue(`"${keybindingStr}"`)
      )
    );
    this.hideOverlayContainer();
  }
  showOverlayContainer() {
    this.overlayContainer.style.display = "block";
  }
  hideOverlayContainer() {
    this.overlayContainer.style.display = "none";
  }
  createHeader(parent) {
    this.headerContainer = DOM.append(parent, $(".keybindings-header"));
    const fullTextSearchPlaceholder = localize(
      "SearchKeybindings.FullTextSearchPlaceholder",
      "Type to search in keybindings"
    );
    const keybindingsSearchPlaceholder = localize(
      "SearchKeybindings.KeybindingsSearchPlaceholder",
      "Recording Keys. Press Escape to exit"
    );
    const clearInputAction = new Action(
      KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
      localize("clearInput", "Clear Keybindings Search Input"),
      ThemeIcon.asClassName(preferencesClearInputIcon),
      false,
      async () => this.clearSearchResults()
    );
    const searchContainer = DOM.append(
      this.headerContainer,
      $(".search-container")
    );
    this.searchWidget = this._register(
      this.instantiationService.createInstance(
        KeybindingsSearchWidget,
        searchContainer,
        {
          ariaLabel: fullTextSearchPlaceholder,
          placeholder: fullTextSearchPlaceholder,
          focusKey: this.searchFocusContextKey,
          ariaLabelledBy: "keybindings-editor-aria-label-element",
          recordEnter: true,
          quoteRecordedKeys: true,
          history: this.getMemento(
            StorageScope.PROFILE,
            StorageTarget.USER
          )["searchHistory"] || [],
          inputBoxStyles: getInputBoxStyle({
            inputBorder: settingsTextInputBorder
          })
        }
      )
    );
    this._register(
      this.searchWidget.onDidChange((searchValue) => {
        clearInputAction.enabled = !!searchValue;
        this.delayedFiltering.trigger(() => this.filterKeybindings());
        this.updateSearchOptions();
      })
    );
    this._register(
      this.searchWidget.onEscape(
        () => this.recordKeysAction.checked = false
      )
    );
    this.actionsContainer = DOM.append(
      searchContainer,
      DOM.$(".keybindings-search-actions-container")
    );
    const recordingBadge = this.createRecordingBadge(this.actionsContainer);
    this._register(
      this.sortByPrecedenceAction.onDidChange((e) => {
        if (e.checked !== void 0) {
          this.renderKeybindingsEntries(false);
        }
        this.updateSearchOptions();
      })
    );
    this._register(
      this.recordKeysAction.onDidChange((e) => {
        if (e.checked !== void 0) {
          recordingBadge.classList.toggle("disabled", !e.checked);
          if (e.checked) {
            this.searchWidget.inputBox.setPlaceHolder(
              keybindingsSearchPlaceholder
            );
            this.searchWidget.inputBox.setAriaLabel(
              keybindingsSearchPlaceholder
            );
            this.searchWidget.startRecordingKeys();
            this.searchWidget.focus();
          } else {
            this.searchWidget.inputBox.setPlaceHolder(
              fullTextSearchPlaceholder
            );
            this.searchWidget.inputBox.setAriaLabel(
              fullTextSearchPlaceholder
            );
            this.searchWidget.stopRecordingKeys();
            this.searchWidget.focus();
          }
          this.updateSearchOptions();
        }
      })
    );
    const actions = [
      this.recordKeysAction,
      this.sortByPrecedenceAction,
      clearInputAction
    ];
    const toolBar = this._register(
      new ToolBar(this.actionsContainer, this.contextMenuService, {
        actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
          if (action.id === this.sortByPrecedenceAction.id || action.id === this.recordKeysAction.id) {
            return new ToggleActionViewItem(null, action, {
              ...options,
              keybinding: this.keybindingsService.lookupKeybinding(action.id)?.getLabel(),
              toggleStyles: defaultToggleStyles
            });
          }
          return void 0;
        }, "actionViewItemProvider"),
        getKeyBinding: /* @__PURE__ */ __name((action) => this.keybindingsService.lookupKeybinding(action.id), "getKeyBinding")
      })
    );
    toolBar.setActions(actions);
    this._register(
      this.keybindingsService.onDidUpdateKeybindings(
        () => toolBar.setActions(actions)
      )
    );
  }
  updateSearchOptions() {
    const keybindingsEditorInput = this.input;
    if (keybindingsEditorInput) {
      keybindingsEditorInput.searchOptions = {
        searchValue: this.searchWidget.getValue(),
        recordKeybindings: !!this.recordKeysAction.checked,
        sortByPrecedence: !!this.sortByPrecedenceAction.checked
      };
    }
  }
  createRecordingBadge(container) {
    const recordingBadge = DOM.append(
      container,
      DOM.$(".recording-badge.monaco-count-badge.long.disabled")
    );
    recordingBadge.textContent = localize("recording", "Recording Keys");
    recordingBadge.style.backgroundColor = asCssVariable(badgeBackground);
    recordingBadge.style.color = asCssVariable(badgeForeground);
    recordingBadge.style.border = `1px solid ${asCssVariable(contrastBorder)}`;
    return recordingBadge;
  }
  layoutSearchWidget(dimension) {
    this.searchWidget.layout(dimension);
    this.headerContainer.classList.toggle("small", dimension.width < 400);
    this.searchWidget.inputBox.inputElement.style.paddingRight = `${DOM.getTotalWidth(this.actionsContainer) + 12}px`;
  }
  createBody(parent) {
    const bodyContainer = DOM.append(parent, $(".keybindings-body"));
    this.createTable(bodyContainer);
  }
  createTable(parent) {
    this.keybindingsTableContainer = DOM.append(
      parent,
      $(".keybindings-table-container")
    );
    this.keybindingsTable = this._register(
      this.instantiationService.createInstance(
        WorkbenchTable,
        "KeybindingsEditor",
        this.keybindingsTableContainer,
        new Delegate(),
        [
          {
            label: "",
            tooltip: "",
            weight: 0,
            minimumWidth: 40,
            maximumWidth: 40,
            templateId: ActionsColumnRenderer.TEMPLATE_ID,
            project(row) {
              return row;
            }
          },
          {
            label: localize("command", "Command"),
            tooltip: "",
            weight: 0.3,
            templateId: CommandColumnRenderer.TEMPLATE_ID,
            project(row) {
              return row;
            }
          },
          {
            label: localize("keybinding", "Keybinding"),
            tooltip: "",
            weight: 0.2,
            templateId: KeybindingColumnRenderer.TEMPLATE_ID,
            project(row) {
              return row;
            }
          },
          {
            label: localize("when", "When"),
            tooltip: "",
            weight: 0.35,
            templateId: WhenColumnRenderer.TEMPLATE_ID,
            project(row) {
              return row;
            }
          },
          {
            label: localize("source", "Source"),
            tooltip: "",
            weight: 0.15,
            templateId: SourceColumnRenderer.TEMPLATE_ID,
            project(row) {
              return row;
            }
          }
        ],
        [
          this.instantiationService.createInstance(
            ActionsColumnRenderer,
            this
          ),
          this.instantiationService.createInstance(
            CommandColumnRenderer
          ),
          this.instantiationService.createInstance(
            KeybindingColumnRenderer
          ),
          this.instantiationService.createInstance(
            WhenColumnRenderer,
            this
          ),
          this.instantiationService.createInstance(
            SourceColumnRenderer
          )
        ],
        {
          identityProvider: {
            getId: /* @__PURE__ */ __name((e) => e.id, "getId")
          },
          horizontalScrolling: false,
          accessibilityProvider: new AccessibilityProvider(
            this.configurationService
          ),
          keyboardNavigationLabelProvider: {
            getKeyboardNavigationLabel: /* @__PURE__ */ __name((e) => e.keybindingItem.commandLabel || e.keybindingItem.command, "getKeyboardNavigationLabel")
          },
          overrideStyles: {
            listBackground: editorBackground
          },
          multipleSelectionSupport: false,
          setRowLineHeight: false,
          openOnSingleClick: false,
          transformOptimization: false
          // disable transform optimization as it causes the editor overflow widgets to be mispositioned
        }
      )
    );
    this._register(
      this.keybindingsTable.onContextMenu((e) => this.onContextMenu(e))
    );
    this._register(
      this.keybindingsTable.onDidChangeFocus((e) => this.onFocusChange())
    );
    this._register(
      this.keybindingsTable.onDidFocus(() => {
        this.keybindingsTable.getHTMLElement().classList.add("focused");
        this.onFocusChange();
      })
    );
    this._register(
      this.keybindingsTable.onDidBlur(() => {
        this.keybindingsTable.getHTMLElement().classList.remove("focused");
        this.keybindingFocusContextKey.reset();
      })
    );
    this._register(
      this.keybindingsTable.onDidOpen((e) => {
        if (e.browserEvent?.defaultPrevented) {
          return;
        }
        const activeKeybindingEntry = this.activeKeybindingEntry;
        if (activeKeybindingEntry) {
          this.defineKeybinding(activeKeybindingEntry, false);
        }
      })
    );
    DOM.append(this.keybindingsTableContainer, this.overflowWidgetsDomNode);
  }
  async render(preserveFocus) {
    if (this.input) {
      const input = this.input;
      this.keybindingsEditorModel = await input.resolve();
      await this.keybindingsEditorModel.resolve(this.getActionsLabels());
      this.renderKeybindingsEntries(false, preserveFocus);
      if (input.searchOptions) {
        this.recordKeysAction.checked = input.searchOptions.recordKeybindings;
        this.sortByPrecedenceAction.checked = input.searchOptions.sortByPrecedence;
        this.searchWidget.setValue(input.searchOptions.searchValue);
      } else {
        this.updateSearchOptions();
      }
    }
  }
  getActionsLabels() {
    const actionsLabels = /* @__PURE__ */ new Map();
    for (const editorAction of EditorExtensionsRegistry.getEditorActions()) {
      actionsLabels.set(editorAction.id, editorAction.label);
    }
    for (const menuItem of MenuRegistry.getMenuItems(
      void 0
    )) {
      if (isIMenuItem(menuItem)) {
        const title = typeof menuItem.command.title === "string" ? menuItem.command.title : menuItem.command.title.value;
        const category = menuItem.command.category ? typeof menuItem.command.category === "string" ? menuItem.command.category : menuItem.command.category.value : void 0;
        actionsLabels.set(
          menuItem.command.id,
          category ? `${category}: ${title}` : title
        );
      }
    }
    return actionsLabels;
  }
  filterKeybindings() {
    this.renderKeybindingsEntries(this.searchWidget.hasFocus());
    this.searchHistoryDelayer.trigger(() => {
      this.searchWidget.inputBox.addToHistory();
      this.getMemento(StorageScope.PROFILE, StorageTarget.USER)["searchHistory"] = this.searchWidget.inputBox.getHistory();
      this.saveState();
    });
  }
  clearKeyboardShortcutSearchHistory() {
    this.searchWidget.inputBox.clearHistory();
    this.getMemento(StorageScope.PROFILE, StorageTarget.USER)["searchHistory"] = this.searchWidget.inputBox.getHistory();
    this.saveState();
  }
  renderKeybindingsEntries(reset, preserveFocus) {
    if (this.keybindingsEditorModel) {
      const filter = this.searchWidget.getValue();
      const keybindingsEntries = this.keybindingsEditorModel.fetch(
        filter,
        this.sortByPrecedenceAction.checked
      );
      this.accessibilityService.alert(
        localize(
          "foundResults",
          "{0} results",
          keybindingsEntries.length
        )
      );
      this.ariaLabelElement.setAttribute(
        "aria-label",
        this.getAriaLabel(keybindingsEntries)
      );
      if (keybindingsEntries.length === 0) {
        this.latestEmptyFilters.push(filter);
      }
      const currentSelectedIndex = this.keybindingsTable.getSelection()[0];
      this.tableEntries = keybindingsEntries;
      this.keybindingsTable.splice(
        0,
        this.keybindingsTable.length,
        this.tableEntries
      );
      this.layoutKeybindingsTable();
      if (reset) {
        this.keybindingsTable.setSelection([]);
        this.keybindingsTable.setFocus([]);
      } else if (this.unAssignedKeybindingItemToRevealAndFocus) {
        const index = this.getNewIndexOfUnassignedKeybinding(
          this.unAssignedKeybindingItemToRevealAndFocus
        );
        if (index !== -1) {
          this.keybindingsTable.reveal(index, 0.2);
          this.selectEntry(index);
        }
        this.unAssignedKeybindingItemToRevealAndFocus = null;
      } else if (currentSelectedIndex !== -1 && currentSelectedIndex < this.tableEntries.length) {
        this.selectEntry(currentSelectedIndex, preserveFocus);
      } else if (this.editorService.activeEditorPane === this && !preserveFocus) {
        this.focus();
      }
    }
  }
  getAriaLabel(keybindingsEntries) {
    if (this.sortByPrecedenceAction.checked) {
      return localize(
        "show sorted keybindings",
        "Showing {0} Keybindings in precedence order",
        keybindingsEntries.length
      );
    } else {
      return localize(
        "show keybindings",
        "Showing {0} Keybindings in alphabetical order",
        keybindingsEntries.length
      );
    }
  }
  layoutKeybindingsTable() {
    if (!this.dimension) {
      return;
    }
    const tableHeight = this.dimension.height - (DOM.getDomNodePagePosition(this.headerContainer).height + 12);
    this.keybindingsTableContainer.style.height = `${tableHeight}px`;
    this.keybindingsTable.layout(tableHeight);
  }
  getIndexOf(listEntry) {
    const index = this.tableEntries.indexOf(listEntry);
    if (index === -1) {
      for (let i = 0; i < this.tableEntries.length; i++) {
        if (this.tableEntries[i].id === listEntry.id) {
          return i;
        }
      }
    }
    return index;
  }
  getNewIndexOfUnassignedKeybinding(unassignedKeybinding) {
    for (let index = 0; index < this.tableEntries.length; index++) {
      const entry = this.tableEntries[index];
      if (entry.templateId === KEYBINDING_ENTRY_TEMPLATE_ID) {
        const keybindingItemEntry = entry;
        if (keybindingItemEntry.keybindingItem.command === unassignedKeybinding.keybindingItem.command) {
          return index;
        }
      }
    }
    return -1;
  }
  selectEntry(keybindingItemEntry, focus = true) {
    const index = typeof keybindingItemEntry === "number" ? keybindingItemEntry : this.getIndexOf(keybindingItemEntry);
    if (index !== -1 && index < this.keybindingsTable.length) {
      if (focus) {
        this.keybindingsTable.domFocus();
        this.keybindingsTable.setFocus([index]);
      }
      this.keybindingsTable.setSelection([index]);
    }
  }
  focusKeybindings() {
    this.keybindingsTable.domFocus();
    const currentFocusIndices = this.keybindingsTable.getFocus();
    this.keybindingsTable.setFocus([
      currentFocusIndices.length ? currentFocusIndices[0] : 0
    ]);
  }
  selectKeybinding(keybindingItemEntry) {
    this.selectEntry(keybindingItemEntry);
  }
  recordSearchKeys() {
    this.recordKeysAction.checked = true;
  }
  toggleSortByPrecedence() {
    this.sortByPrecedenceAction.checked = !this.sortByPrecedenceAction.checked;
  }
  onContextMenu(e) {
    if (!e.element) {
      return;
    }
    if (e.element.templateId === KEYBINDING_ENTRY_TEMPLATE_ID) {
      const keybindingItemEntry = e.element;
      this.selectEntry(keybindingItemEntry);
      this.contextMenuService.showContextMenu({
        getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
        getActions: /* @__PURE__ */ __name(() => [
          this.createCopyAction(keybindingItemEntry),
          this.createCopyCommandAction(keybindingItemEntry),
          this.createCopyCommandTitleAction(keybindingItemEntry),
          new Separator(),
          ...keybindingItemEntry.keybindingItem.keybinding ? [
            this.createDefineKeybindingAction(
              keybindingItemEntry
            ),
            this.createAddKeybindingAction(
              keybindingItemEntry
            )
          ] : [
            this.createDefineKeybindingAction(
              keybindingItemEntry
            )
          ],
          new Separator(),
          this.createRemoveAction(keybindingItemEntry),
          this.createResetAction(keybindingItemEntry),
          new Separator(),
          this.createDefineWhenExpressionAction(keybindingItemEntry),
          new Separator(),
          this.createShowConflictsAction(keybindingItemEntry)
        ], "getActions")
      });
    }
  }
  onFocusChange() {
    this.keybindingFocusContextKey.reset();
    const element = this.keybindingsTable.getFocusedElements()[0];
    if (!element) {
      return;
    }
    if (element.templateId === KEYBINDING_ENTRY_TEMPLATE_ID) {
      this.keybindingFocusContextKey.set(true);
    }
  }
  createDefineKeybindingAction(keybindingItemEntry) {
    return {
      label: keybindingItemEntry.keybindingItem.keybinding ? localize("changeLabel", "Change Keybinding...") : localize("addLabel", "Add Keybinding..."),
      enabled: true,
      id: KEYBINDINGS_EDITOR_COMMAND_DEFINE,
      run: /* @__PURE__ */ __name(() => this.defineKeybinding(keybindingItemEntry, false), "run")
    };
  }
  createAddKeybindingAction(keybindingItemEntry) {
    return {
      label: localize("addLabel", "Add Keybinding..."),
      enabled: true,
      id: KEYBINDINGS_EDITOR_COMMAND_ADD,
      run: /* @__PURE__ */ __name(() => this.defineKeybinding(keybindingItemEntry, true), "run")
    };
  }
  createDefineWhenExpressionAction(keybindingItemEntry) {
    return {
      label: localize("editWhen", "Change When Expression"),
      enabled: !!keybindingItemEntry.keybindingItem.keybinding,
      id: KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN,
      run: /* @__PURE__ */ __name(() => this.defineWhenExpression(keybindingItemEntry), "run")
    };
  }
  createRemoveAction(keybindingItem) {
    return {
      label: localize("removeLabel", "Remove Keybinding"),
      enabled: !!keybindingItem.keybindingItem.keybinding,
      id: KEYBINDINGS_EDITOR_COMMAND_REMOVE,
      run: /* @__PURE__ */ __name(() => this.removeKeybinding(keybindingItem), "run")
    };
  }
  createResetAction(keybindingItem) {
    return {
      label: localize("resetLabel", "Reset Keybinding"),
      enabled: !keybindingItem.keybindingItem.keybindingItem.isDefault,
      id: KEYBINDINGS_EDITOR_COMMAND_RESET,
      run: /* @__PURE__ */ __name(() => this.resetKeybinding(keybindingItem), "run")
    };
  }
  createShowConflictsAction(keybindingItem) {
    return {
      label: localize("showSameKeybindings", "Show Same Keybindings"),
      enabled: !!keybindingItem.keybindingItem.keybinding,
      id: KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
      run: /* @__PURE__ */ __name(() => this.showSimilarKeybindings(keybindingItem), "run")
    };
  }
  createCopyAction(keybindingItem) {
    return {
      label: localize("copyLabel", "Copy"),
      enabled: true,
      id: KEYBINDINGS_EDITOR_COMMAND_COPY,
      run: /* @__PURE__ */ __name(() => this.copyKeybinding(keybindingItem), "run")
    };
  }
  createCopyCommandAction(keybinding) {
    return {
      label: localize("copyCommandLabel", "Copy Command ID"),
      enabled: true,
      id: KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
      run: /* @__PURE__ */ __name(() => this.copyKeybindingCommand(keybinding), "run")
    };
  }
  createCopyCommandTitleAction(keybinding) {
    return {
      label: localize("copyCommandTitleLabel", "Copy Command Title"),
      enabled: !!keybinding.keybindingItem.commandLabel,
      id: KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE,
      run: /* @__PURE__ */ __name(() => this.copyKeybindingCommandTitle(keybinding), "run")
    };
  }
  onKeybindingEditingError(error) {
    this.notificationService.error(
      typeof error === "string" ? error : localize(
        "error",
        "Error '{0}' while editing the keybinding. Please open 'keybindings.json' file and check for errors.",
        `${error}`
      )
    );
  }
};
KeybindingsEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IKeybindingEditingService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, IClipboardService),
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, IEditorService),
  __decorateParam(11, IStorageService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, IAccessibilityService)
], KeybindingsEditor);
class Delegate {
  static {
    __name(this, "Delegate");
  }
  headerRowHeight = 30;
  getHeight(element) {
    if (element.templateId === KEYBINDING_ENTRY_TEMPLATE_ID) {
      const commandIdMatched = element.keybindingItem.commandLabel && element.commandIdMatches;
      const commandDefaultLabelMatched = !!element.commandDefaultLabelMatches;
      const extensionIdMatched = !!element.extensionIdMatches;
      if (commandIdMatched && commandDefaultLabelMatched) {
        return 60;
      }
      if (extensionIdMatched || commandIdMatched || commandDefaultLabelMatched) {
        return 40;
      }
    }
    return 24;
  }
}
let ActionsColumnRenderer = class {
  constructor(keybindingsEditor, keybindingsService) {
    this.keybindingsEditor = keybindingsEditor;
    this.keybindingsService = keybindingsService;
  }
  static {
    __name(this, "ActionsColumnRenderer");
  }
  static TEMPLATE_ID = "actions";
  templateId = ActionsColumnRenderer.TEMPLATE_ID;
  renderTemplate(container) {
    const element = DOM.append(container, $(".actions"));
    const actionBar = new ActionBar(element);
    return { actionBar };
  }
  renderElement(keybindingItemEntry, index, templateData, height) {
    templateData.actionBar.clear();
    const actions = [];
    if (keybindingItemEntry.keybindingItem.keybinding) {
      actions.push(this.createEditAction(keybindingItemEntry));
    } else {
      actions.push(this.createAddAction(keybindingItemEntry));
    }
    templateData.actionBar.push(actions, { icon: true });
  }
  createEditAction(keybindingItemEntry) {
    const keybinding = this.keybindingsService.lookupKeybinding(
      KEYBINDINGS_EDITOR_COMMAND_DEFINE
    );
    return {
      class: ThemeIcon.asClassName(keybindingsEditIcon),
      enabled: true,
      id: "editKeybinding",
      tooltip: keybinding ? localize(
        "editKeybindingLabelWithKey",
        "Change Keybinding {0}",
        `(${keybinding.getLabel()})`
      ) : localize("editKeybindingLabel", "Change Keybinding"),
      run: /* @__PURE__ */ __name(() => this.keybindingsEditor.defineKeybinding(
        keybindingItemEntry,
        false
      ), "run")
    };
  }
  createAddAction(keybindingItemEntry) {
    const keybinding = this.keybindingsService.lookupKeybinding(
      KEYBINDINGS_EDITOR_COMMAND_DEFINE
    );
    return {
      class: ThemeIcon.asClassName(keybindingsAddIcon),
      enabled: true,
      id: "addKeybinding",
      tooltip: keybinding ? localize(
        "addKeybindingLabelWithKey",
        "Add Keybinding {0}",
        `(${keybinding.getLabel()})`
      ) : localize("addKeybindingLabel", "Add Keybinding"),
      run: /* @__PURE__ */ __name(() => this.keybindingsEditor.defineKeybinding(
        keybindingItemEntry,
        false
      ), "run")
    };
  }
  disposeTemplate(templateData) {
    templateData.actionBar.dispose();
  }
};
ActionsColumnRenderer = __decorateClass([
  __decorateParam(1, IKeybindingService)
], ActionsColumnRenderer);
let CommandColumnRenderer = class {
  constructor(_hoverService) {
    this._hoverService = _hoverService;
  }
  static {
    __name(this, "CommandColumnRenderer");
  }
  static TEMPLATE_ID = "commands";
  templateId = CommandColumnRenderer.TEMPLATE_ID;
  renderTemplate(container) {
    const commandColumn = DOM.append(container, $(".command"));
    const commandColumnHover = this._hoverService.setupManagedHover(
      getDefaultHoverDelegate("mouse"),
      commandColumn,
      ""
    );
    const commandLabelContainer = DOM.append(
      commandColumn,
      $(".command-label")
    );
    const commandLabel = new HighlightedLabel(commandLabelContainer);
    const commandDefaultLabelContainer = DOM.append(
      commandColumn,
      $(".command-default-label")
    );
    const commandDefaultLabel = new HighlightedLabel(
      commandDefaultLabelContainer
    );
    const commandIdLabelContainer = DOM.append(
      commandColumn,
      $(".command-id.code")
    );
    const commandIdLabel = new HighlightedLabel(commandIdLabelContainer);
    return {
      commandColumn,
      commandColumnHover,
      commandLabelContainer,
      commandLabel,
      commandDefaultLabelContainer,
      commandDefaultLabel,
      commandIdLabelContainer,
      commandIdLabel
    };
  }
  renderElement(keybindingItemEntry, index, templateData, height) {
    const keybindingItem = keybindingItemEntry.keybindingItem;
    const commandIdMatched = !!(keybindingItem.commandLabel && keybindingItemEntry.commandIdMatches);
    const commandDefaultLabelMatched = !!keybindingItemEntry.commandDefaultLabelMatches;
    templateData.commandColumn.classList.toggle(
      "vertical-align-column",
      commandIdMatched || commandDefaultLabelMatched
    );
    const title = keybindingItem.commandLabel ? localize(
      "title",
      "{0} ({1})",
      keybindingItem.commandLabel,
      keybindingItem.command
    ) : keybindingItem.command;
    templateData.commandColumn.setAttribute("aria-label", title);
    templateData.commandColumnHover.update(title);
    if (keybindingItem.commandLabel) {
      templateData.commandLabelContainer.classList.remove("hide");
      templateData.commandLabel.set(
        keybindingItem.commandLabel,
        keybindingItemEntry.commandLabelMatches
      );
    } else {
      templateData.commandLabelContainer.classList.add("hide");
      templateData.commandLabel.set(void 0);
    }
    if (keybindingItemEntry.commandDefaultLabelMatches) {
      templateData.commandDefaultLabelContainer.classList.remove("hide");
      templateData.commandDefaultLabel.set(
        keybindingItem.commandDefaultLabel,
        keybindingItemEntry.commandDefaultLabelMatches
      );
    } else {
      templateData.commandDefaultLabelContainer.classList.add("hide");
      templateData.commandDefaultLabel.set(void 0);
    }
    if (keybindingItemEntry.commandIdMatches || !keybindingItem.commandLabel) {
      templateData.commandIdLabelContainer.classList.remove("hide");
      templateData.commandIdLabel.set(
        keybindingItem.command,
        keybindingItemEntry.commandIdMatches
      );
    } else {
      templateData.commandIdLabelContainer.classList.add("hide");
      templateData.commandIdLabel.set(void 0);
    }
  }
  disposeTemplate(templateData) {
    templateData.commandColumnHover.dispose();
    templateData.commandDefaultLabel.dispose();
    templateData.commandIdLabel.dispose();
    templateData.commandLabel.dispose();
  }
};
CommandColumnRenderer = __decorateClass([
  __decorateParam(0, IHoverService)
], CommandColumnRenderer);
class KeybindingColumnRenderer {
  static {
    __name(this, "KeybindingColumnRenderer");
  }
  static TEMPLATE_ID = "keybindings";
  templateId = KeybindingColumnRenderer.TEMPLATE_ID;
  constructor() {
  }
  renderTemplate(container) {
    const element = DOM.append(container, $(".keybinding"));
    const keybindingLabel = new KeybindingLabel(
      DOM.append(element, $("div.keybinding-label")),
      OS,
      defaultKeybindingLabelStyles
    );
    return { keybindingLabel };
  }
  renderElement(keybindingItemEntry, index, templateData, height) {
    if (keybindingItemEntry.keybindingItem.keybinding) {
      templateData.keybindingLabel.set(
        keybindingItemEntry.keybindingItem.keybinding,
        keybindingItemEntry.keybindingMatches
      );
    } else {
      templateData.keybindingLabel.set(void 0, void 0);
    }
  }
  disposeTemplate(templateData) {
    templateData.keybindingLabel.dispose();
  }
}
function onClick(element, callback) {
  const disposables = new DisposableStore();
  disposables.add(
    DOM.addDisposableListener(
      element,
      DOM.EventType.CLICK,
      DOM.finalHandler(callback)
    )
  );
  disposables.add(
    DOM.addDisposableListener(element, DOM.EventType.KEY_UP, (e) => {
      const keyboardEvent = new StandardKeyboardEvent(e);
      if (keyboardEvent.equals(KeyCode.Space) || keyboardEvent.equals(KeyCode.Enter)) {
        e.preventDefault();
        e.stopPropagation();
        callback();
      }
    })
  );
  return disposables;
}
__name(onClick, "onClick");
let SourceColumnRenderer = class {
  constructor(extensionsWorkbenchService, hoverService) {
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.hoverService = hoverService;
  }
  static {
    __name(this, "SourceColumnRenderer");
  }
  static TEMPLATE_ID = "source";
  templateId = SourceColumnRenderer.TEMPLATE_ID;
  renderTemplate(container) {
    const sourceColumn = DOM.append(container, $(".source"));
    const sourceColumnHover = this.hoverService.setupManagedHover(
      getDefaultHoverDelegate("mouse"),
      sourceColumn,
      ""
    );
    const sourceLabel = new HighlightedLabel(
      DOM.append(sourceColumn, $(".source-label"))
    );
    const extensionContainer = DOM.append(
      sourceColumn,
      $(".extension-container")
    );
    const extensionLabel = DOM.append(
      extensionContainer,
      $("a.extension-label", { tabindex: 0 })
    );
    const extensionId = new HighlightedLabel(
      DOM.append(extensionContainer, $(".extension-id-container.code"))
    );
    return {
      sourceColumn,
      sourceColumnHover,
      sourceLabel,
      extensionLabel,
      extensionContainer,
      extensionId,
      disposables: new DisposableStore()
    };
  }
  renderElement(keybindingItemEntry, index, templateData, height) {
    templateData.disposables.clear();
    if (isString(keybindingItemEntry.keybindingItem.source)) {
      templateData.extensionContainer.classList.add("hide");
      templateData.sourceLabel.element.classList.remove("hide");
      templateData.sourceColumnHover.update("");
      templateData.sourceLabel.set(
        keybindingItemEntry.keybindingItem.source || "-",
        keybindingItemEntry.sourceMatches
      );
    } else {
      templateData.extensionContainer.classList.remove("hide");
      templateData.sourceLabel.element.classList.add("hide");
      const extension = keybindingItemEntry.keybindingItem.source;
      const extensionLabel = extension.displayName ?? extension.identifier.value;
      templateData.sourceColumnHover.update(
        localize("extension label", "Extension ({0})", extensionLabel)
      );
      templateData.extensionLabel.textContent = extensionLabel;
      templateData.disposables.add(
        onClick(templateData.extensionLabel, () => {
          this.extensionsWorkbenchService.open(
            extension.identifier.value
          );
        })
      );
      if (keybindingItemEntry.extensionIdMatches) {
        templateData.extensionId.element.classList.remove("hide");
        templateData.extensionId.set(
          extension.identifier.value,
          keybindingItemEntry.extensionIdMatches
        );
      } else {
        templateData.extensionId.element.classList.add("hide");
        templateData.extensionId.set(void 0);
      }
    }
  }
  disposeTemplate(templateData) {
    templateData.sourceColumnHover.dispose();
    templateData.disposables.dispose();
    templateData.sourceLabel.dispose();
    templateData.extensionId.dispose();
  }
};
SourceColumnRenderer = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IHoverService)
], SourceColumnRenderer);
let WhenInputWidget = class extends Disposable {
  static {
    __name(this, "WhenInputWidget");
  }
  input;
  _onDidAccept = this._register(new Emitter());
  onDidAccept = this._onDidAccept.event;
  _onDidReject = this._register(new Emitter());
  onDidReject = this._onDidReject.event;
  constructor(parent, keybindingsEditor, instantiationService, contextKeyService) {
    super();
    const focusContextKey = CONTEXT_WHEN_FOCUS.bindTo(contextKeyService);
    this.input = this._register(
      instantiationService.createInstance(
        SuggestEnabledInput,
        "keyboardshortcutseditor#wheninput",
        parent,
        {
          provideResults: /* @__PURE__ */ __name(() => {
            const result = [];
            for (const contextKey of RawContextKey.all()) {
              result.push({
                label: contextKey.key,
                documentation: contextKey.description,
                detail: contextKey.type,
                kind: CompletionItemKind.Constant
              });
            }
            return result;
          }, "provideResults"),
          triggerCharacters: ["!", " "],
          wordDefinition: /[a-zA-Z.]+/,
          alwaysShowSuggestions: true
        },
        "",
        `keyboardshortcutseditor#wheninput`,
        {
          focusContextKey,
          overflowWidgetsDomNode: keybindingsEditor.overflowWidgetsDomNode
        }
      )
    );
    this._register(
      DOM.addDisposableListener(
        this.input.element,
        DOM.EventType.DBLCLICK,
        (e) => DOM.EventHelper.stop(e)
      )
    );
    this._register(toDisposable(() => focusContextKey.reset()));
    this._register(
      keybindingsEditor.onAcceptWhenExpression(
        () => this._onDidAccept.fire(this.input.getValue())
      )
    );
    this._register(
      Event.any(
        keybindingsEditor.onRejectWhenExpression,
        this.input.onDidBlur
      )(() => this._onDidReject.fire())
    );
  }
  layout(dimension) {
    this.input.layout(dimension);
  }
  show(value) {
    this.input.setValue(value);
    this.input.focus(true);
  }
};
WhenInputWidget = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextKeyService)
], WhenInputWidget);
let WhenColumnRenderer = class {
  constructor(keybindingsEditor, hoverService, instantiationService) {
    this.keybindingsEditor = keybindingsEditor;
    this.hoverService = hoverService;
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "WhenColumnRenderer");
  }
  static TEMPLATE_ID = "when";
  templateId = WhenColumnRenderer.TEMPLATE_ID;
  renderTemplate(container) {
    const element = DOM.append(container, $(".when"));
    const whenLabelContainer = DOM.append(element, $("div.when-label"));
    const whenLabel = new HighlightedLabel(whenLabelContainer);
    const whenInputContainer = DOM.append(
      element,
      $("div.when-input-container")
    );
    return {
      element,
      whenLabelContainer,
      whenLabel,
      whenInputContainer,
      disposables: new DisposableStore()
    };
  }
  renderElement(keybindingItemEntry, index, templateData, height) {
    templateData.disposables.clear();
    const whenInputDisposables = templateData.disposables.add(
      new DisposableStore()
    );
    templateData.disposables.add(
      this.keybindingsEditor.onDefineWhenExpression((e) => {
        if (keybindingItemEntry === e) {
          templateData.element.classList.add("input-mode");
          const inputWidget = whenInputDisposables.add(
            this.instantiationService.createInstance(
              WhenInputWidget,
              templateData.whenInputContainer,
              this.keybindingsEditor
            )
          );
          inputWidget.layout(
            new DOM.Dimension(
              templateData.element.parentElement.clientWidth,
              18
            )
          );
          inputWidget.show(
            keybindingItemEntry.keybindingItem.when || ""
          );
          const hideInputWidget = /* @__PURE__ */ __name(() => {
            whenInputDisposables.clear();
            templateData.element.classList.remove("input-mode");
            templateData.element.parentElement.style.paddingLeft = "10px";
            DOM.clearNode(templateData.whenInputContainer);
          }, "hideInputWidget");
          whenInputDisposables.add(
            inputWidget.onDidAccept((value) => {
              hideInputWidget();
              this.keybindingsEditor.updateKeybinding(
                keybindingItemEntry,
                keybindingItemEntry.keybindingItem.keybinding ? keybindingItemEntry.keybindingItem.keybinding.getUserSettingsLabel() || "" : "",
                value
              );
              this.keybindingsEditor.selectKeybinding(
                keybindingItemEntry
              );
            })
          );
          whenInputDisposables.add(
            inputWidget.onDidReject(() => {
              hideInputWidget();
              this.keybindingsEditor.selectKeybinding(
                keybindingItemEntry
              );
            })
          );
          templateData.element.parentElement.style.paddingLeft = "0px";
        }
      })
    );
    templateData.whenLabelContainer.classList.toggle(
      "code",
      !!keybindingItemEntry.keybindingItem.when
    );
    templateData.whenLabelContainer.classList.toggle(
      "empty",
      !keybindingItemEntry.keybindingItem.when
    );
    if (keybindingItemEntry.keybindingItem.when) {
      templateData.whenLabel.set(
        keybindingItemEntry.keybindingItem.when,
        keybindingItemEntry.whenMatches,
        keybindingItemEntry.keybindingItem.when
      );
      templateData.disposables.add(
        this.hoverService.setupManagedHover(
          getDefaultHoverDelegate("mouse"),
          templateData.element,
          keybindingItemEntry.keybindingItem.when
        )
      );
    } else {
      templateData.whenLabel.set("-");
    }
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
    templateData.whenLabel.dispose();
  }
};
WhenColumnRenderer = __decorateClass([
  __decorateParam(1, IHoverService),
  __decorateParam(2, IInstantiationService)
], WhenColumnRenderer);
class AccessibilityProvider {
  constructor(configurationService) {
    this.configurationService = configurationService;
  }
  static {
    __name(this, "AccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return localize("keybindingsLabel", "Keybindings");
  }
  getAriaLabel({ keybindingItem }) {
    const ariaLabel = [
      keybindingItem.commandLabel ? keybindingItem.commandLabel : keybindingItem.command,
      keybindingItem.keybinding?.getAriaLabel() || localize("noKeybinding", "No keybinding assigned"),
      keybindingItem.when ? keybindingItem.when : localize("noWhen", "No when context"),
      isString(keybindingItem.source) ? keybindingItem.source : keybindingItem.source.description ?? keybindingItem.source.identifier.value
    ];
    if (this.configurationService.getValue(
      AccessibilityVerbositySettingId.KeybindingsEditor
    )) {
      const kbEditorAriaLabel = localize(
        "keyboard shortcuts aria label",
        "use space or enter to change the keybinding."
      );
      ariaLabel.push(kbEditorAriaLabel);
    }
    return ariaLabel.join(", ");
  }
}
registerColor(
  "keybindingTable.headerBackground",
  tableOddRowsBackgroundColor,
  "Background color for the keyboard shortcuts table header."
);
registerColor(
  "keybindingTable.rowsBackground",
  tableOddRowsBackgroundColor,
  "Background color for the keyboard shortcuts table alternating rows."
);
registerThemingParticipant(
  (theme, collector) => {
    const foregroundColor = theme.getColor(foreground);
    if (foregroundColor) {
      const whenForegroundColor = foregroundColor.transparent(0.8).makeOpaque(WORKBENCH_BACKGROUND(theme));
      collector.addRule(
        `.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`
      );
    }
    const listActiveSelectionForegroundColor = theme.getColor(
      listActiveSelectionForeground
    );
    const listActiveSelectionBackgroundColor = theme.getColor(
      listActiveSelectionBackground
    );
    if (listActiveSelectionForegroundColor && listActiveSelectionBackgroundColor) {
      const whenForegroundColor = listActiveSelectionForegroundColor.transparent(0.8).makeOpaque(listActiveSelectionBackgroundColor);
      collector.addRule(
        `.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row.selected .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`
      );
    }
    const listInactiveSelectionForegroundColor = theme.getColor(
      listInactiveSelectionForeground
    );
    const listInactiveSelectionBackgroundColor = theme.getColor(
      listInactiveSelectionBackground
    );
    if (listInactiveSelectionForegroundColor && listInactiveSelectionBackgroundColor) {
      const whenForegroundColor = listInactiveSelectionForegroundColor.transparent(0.8).makeOpaque(listInactiveSelectionBackgroundColor);
      collector.addRule(
        `.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table .monaco-list-row.selected .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`
      );
    }
    const listFocusForegroundColor = theme.getColor(listFocusForeground);
    const listFocusBackgroundColor = theme.getColor(listFocusBackground);
    if (listFocusForegroundColor && listFocusBackgroundColor) {
      const whenForegroundColor = listFocusForegroundColor.transparent(0.8).makeOpaque(listFocusBackgroundColor);
      collector.addRule(
        `.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row.focused .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`
      );
    }
    const listHoverForegroundColor = theme.getColor(listHoverForeground);
    const listHoverBackgroundColor = theme.getColor(listHoverBackground);
    if (listHoverForegroundColor && listHoverBackgroundColor) {
      const whenForegroundColor = listHoverForegroundColor.transparent(0.8).makeOpaque(listHoverBackgroundColor);
      collector.addRule(
        `.keybindings-editor > .keybindings-body > .keybindings-table-container .monaco-table.focused .monaco-list-row:hover:not(.focused):not(.selected) .monaco-table-tr .monaco-table-td .code { color: ${whenForegroundColor}; }`
      );
    }
  }
);
export {
  KeybindingsEditor
};
//# sourceMappingURL=keybindingsEditor.js.map
