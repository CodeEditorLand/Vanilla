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
import {
  DataTransfers
} from "../../../../base/browser/dnd.js";
import * as DOM from "../../../../base/browser/dom.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { HoverPosition } from "../../../../base/browser/ui/hover/hoverWidget.js";
import {
  InputBox,
  MessageType
} from "../../../../base/browser/ui/inputbox/inputBox.js";
import {
  ListDragOverEffectPosition,
  ListDragOverEffectType
} from "../../../../base/browser/ui/list/list.js";
import {
  ElementsDragAndDropData,
  NativeDragAndDropData
} from "../../../../base/browser/ui/list/listView.js";
import { Action } from "../../../../base/common/actions.js";
import { disposableTimeout } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import { createSingleCallFunction } from "../../../../base/common/functional.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore,
  dispose,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import Severity from "../../../../base/common/severity.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { MenuEntryActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import {
  CodeDataTransfers,
  containsDragType
} from "../../../../platform/dnd/browser/dnd.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import {
  IListService,
  WorkbenchList
} from "../../../../platform/list/browser/listService.js";
import {
  TerminalLocation,
  TerminalSettingId
} from "../../../../platform/terminal/common/terminal.js";
import { defaultInputBoxStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import {
  DEFAULT_LABELS_CONTAINER,
  ResourceLabels
} from "../../../browser/labels.js";
import {
  IDecorationsService
} from "../../../services/decorations/common/decorations.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { TerminalCommandId } from "../common/terminal.js";
import { TerminalContextKeys } from "../common/terminalContextKey.js";
import { terminalStrings } from "../common/terminalStrings.js";
import {
  ITerminalConfigurationService,
  ITerminalGroupService,
  ITerminalService,
  TerminalDataTransfers
} from "./terminal.js";
import { TerminalContextActionRunner } from "./terminalContextMenu.js";
import { getColorClass, getIconId, getUriClasses } from "./terminalIcon.js";
import { getColorForSeverity } from "./terminalStatusList.js";
import { getInstanceHoverInfo } from "./terminalTooltip.js";
import {
  getTerminalResourcesFromDragEvent,
  parseTerminalUri
} from "./terminalUri.js";
const $ = DOM.$;
var TerminalTabsListSizes = /* @__PURE__ */ ((TerminalTabsListSizes2) => {
  TerminalTabsListSizes2[TerminalTabsListSizes2["TabHeight"] = 22] = "TabHeight";
  TerminalTabsListSizes2[TerminalTabsListSizes2["NarrowViewWidth"] = 46] = "NarrowViewWidth";
  TerminalTabsListSizes2[TerminalTabsListSizes2["WideViewMinimumWidth"] = 80] = "WideViewMinimumWidth";
  TerminalTabsListSizes2[TerminalTabsListSizes2["DefaultWidth"] = 120] = "DefaultWidth";
  TerminalTabsListSizes2[TerminalTabsListSizes2["MidpointViewWidth"] = 63] = "MidpointViewWidth";
  TerminalTabsListSizes2[TerminalTabsListSizes2["ActionbarMinimumWidth"] = 105] = "ActionbarMinimumWidth";
  TerminalTabsListSizes2[TerminalTabsListSizes2["MaximumWidth"] = 500] = "MaximumWidth";
  return TerminalTabsListSizes2;
})(TerminalTabsListSizes || {});
let TerminalTabList = class extends WorkbenchList {
  constructor(container, contextKeyService, listService, themeService, _configurationService, _terminalService, _terminalGroupService, instantiationService, decorationsService, _themeService, lifecycleService, _hoverService) {
    super(
      "TerminalTabsList",
      container,
      {
        getHeight: () => 22 /* TabHeight */,
        getTemplateId: () => "terminal.tabs"
      },
      [
        instantiationService.createInstance(
          TerminalTabsRenderer,
          container,
          instantiationService.createInstance(
            ResourceLabels,
            DEFAULT_LABELS_CONTAINER
          ),
          () => this.getSelectedElements()
        )
      ],
      {
        horizontalScrolling: false,
        supportDynamicHeights: false,
        selectionNavigation: true,
        identityProvider: {
          getId: (e) => e?.instanceId
        },
        accessibilityProvider: instantiationService.createInstance(
          TerminalTabsAccessibilityProvider
        ),
        smoothScrolling: _configurationService.getValue(
          "workbench.list.smoothScrolling"
        ),
        multipleSelectionSupport: true,
        paddingBottom: 22 /* TabHeight */,
        dnd: instantiationService.createInstance(
          TerminalTabsDragAndDrop
        ),
        openOnSingleClick: true
      },
      contextKeyService,
      listService,
      _configurationService,
      instantiationService
    );
    this._configurationService = _configurationService;
    this._terminalService = _terminalService;
    this._terminalGroupService = _terminalGroupService;
    this._themeService = _themeService;
    this._hoverService = _hoverService;
    const instanceDisposables = [
      this._terminalGroupService.onDidChangeInstances(
        () => this.refresh()
      ),
      this._terminalGroupService.onDidChangeGroups(() => this.refresh()),
      this._terminalGroupService.onDidShow(() => this.refresh()),
      this._terminalGroupService.onDidChangeInstanceCapability(
        () => this.refresh()
      ),
      this._terminalService.onAnyInstanceTitleChange(
        () => this.refresh()
      ),
      this._terminalService.onAnyInstanceIconChange(() => this.refresh()),
      this._terminalService.onAnyInstancePrimaryStatusChange(
        () => this.refresh()
      ),
      this._terminalService.onDidChangeConnectionState(
        () => this.refresh()
      ),
      this._themeService.onDidColorThemeChange(() => this.refresh()),
      this._terminalGroupService.onDidChangeActiveInstance((e) => {
        if (e) {
          const i = this._terminalGroupService.instances.indexOf(e);
          this.setSelection([i]);
          this.reveal(i);
        }
        this.refresh();
      })
    ];
    this.disposables.add(
      lifecycleService.onWillShutdown((e) => {
        dispose(instanceDisposables);
        instanceDisposables.length = 0;
      })
    );
    this.disposables.add(
      toDisposable(() => {
        dispose(instanceDisposables);
        instanceDisposables.length = 0;
      })
    );
    this.disposables.add(
      this.onMouseDblClick(async (e) => {
        const focus = this.getFocus();
        if (focus.length === 0) {
          const instance = await this._terminalService.createTerminal(
            { location: TerminalLocation.Panel }
          );
          this._terminalGroupService.setActiveInstance(instance);
          await instance.focusWhenReady();
        }
        if (this._terminalService.getEditingTerminal()?.instanceId === e.element?.instanceId) {
          return;
        }
        if (this._getFocusMode() === "doubleClick" && this.getFocus().length === 1) {
          e.element?.focus(true);
        }
      })
    );
    this.disposables.add(
      this.onMouseClick(async (e) => {
        if (this._terminalService.getEditingTerminal()?.instanceId === e.element?.instanceId) {
          return;
        }
        if (e.browserEvent.altKey && e.element) {
          await this._terminalService.createTerminal({
            location: { parentTerminal: e.element }
          });
        } else if (this._getFocusMode() === "singleClick") {
          if (this.getSelection().length <= 1) {
            e.element?.focus(true);
          }
        }
      })
    );
    this.disposables.add(
      this.onContextMenu((e) => {
        if (!e.element) {
          this.setSelection([]);
          return;
        }
        const selection = this.getSelectedElements();
        if (!selection || !selection.find((s) => e.element === s)) {
          this.setFocus(e.index !== void 0 ? [e.index] : []);
        }
      })
    );
    this._terminalTabsSingleSelectedContextKey = TerminalContextKeys.tabsSingularSelection.bindTo(contextKeyService);
    this._isSplitContextKey = TerminalContextKeys.splitTerminal.bindTo(contextKeyService);
    this.disposables.add(
      this.onDidChangeSelection((e) => this._updateContextKey())
    );
    this.disposables.add(
      this.onDidChangeFocus(() => this._updateContextKey())
    );
    this.disposables.add(
      this.onDidOpen(async (e) => {
        const instance = e.element;
        if (!instance) {
          return;
        }
        this._terminalGroupService.setActiveInstance(instance);
        if (!e.editorOptions.preserveFocus) {
          await instance.focusWhenReady();
        }
      })
    );
    if (!this._decorationsProvider) {
      this._decorationsProvider = this.disposables.add(
        instantiationService.createInstance(TabDecorationsProvider)
      );
      this.disposables.add(
        decorationsService.registerDecorationsProvider(
          this._decorationsProvider
        )
      );
    }
    this.refresh();
  }
  _decorationsProvider;
  _terminalTabsSingleSelectedContextKey;
  _isSplitContextKey;
  _getFocusMode() {
    return this._configurationService.getValue(TerminalSettingId.TabsFocusMode);
  }
  refresh(cancelEditing = true) {
    if (cancelEditing && this._terminalService.isEditable(void 0)) {
      this.domFocus();
    }
    this.splice(
      0,
      this.length,
      this._terminalGroupService.instances.slice()
    );
  }
  focusHover() {
    const instance = this.getSelectedElements()[0];
    if (!instance) {
      return;
    }
    this._hoverService.showHover(
      {
        ...getInstanceHoverInfo(instance),
        target: this.getHTMLElement(),
        trapFocus: true
      },
      true
    );
  }
  _updateContextKey() {
    this._terminalTabsSingleSelectedContextKey.set(
      this.getSelectedElements().length === 1
    );
    const instance = this.getFocusedElements();
    this._isSplitContextKey.set(
      instance.length > 0 && this._terminalGroupService.instanceIsSplit(instance[0])
    );
  }
};
TerminalTabList = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IListService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, ITerminalService),
  __decorateParam(6, ITerminalGroupService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IDecorationsService),
  __decorateParam(9, IThemeService),
  __decorateParam(10, ILifecycleService),
  __decorateParam(11, IHoverService)
], TerminalTabList);
let TerminalTabsRenderer = class {
  constructor(_container, _labels, _getSelection, _instantiationService, _terminalConfigurationService, _terminalService, _terminalGroupService, _hoverService, _configurationService, _keybindingService, _listService, _themeService, _contextViewService) {
    this._container = _container;
    this._labels = _labels;
    this._getSelection = _getSelection;
    this._instantiationService = _instantiationService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._terminalService = _terminalService;
    this._terminalGroupService = _terminalGroupService;
    this._hoverService = _hoverService;
    this._configurationService = _configurationService;
    this._keybindingService = _keybindingService;
    this._listService = _listService;
    this._themeService = _themeService;
    this._contextViewService = _contextViewService;
  }
  templateId = "terminal.tabs";
  renderTemplate(container) {
    const element = DOM.append(container, $(".terminal-tabs-entry"));
    const context = {};
    const label = this._labels.create(element, {
      supportHighlights: true,
      supportDescriptionHighlights: true,
      supportIcons: true,
      hoverDelegate: {
        delay: this._configurationService.getValue(
          "workbench.hover.delay"
        ),
        showHover: (options) => {
          return this._hoverService.showHover({
            ...options,
            actions: context.hoverActions,
            target: element,
            persistence: {
              hideOnHover: true
            },
            appearance: {
              showPointer: true
            },
            position: {
              hoverPosition: this._terminalConfigurationService.config.tabs.location === "left" ? HoverPosition.RIGHT : HoverPosition.LEFT
            }
          });
        }
      }
    });
    const actionsContainer = DOM.append(label.element, $(".actions"));
    const actionBar = new ActionBar(actionsContainer, {
      actionRunner: new TerminalContextActionRunner(),
      actionViewItemProvider: (action, options) => action instanceof MenuItemAction ? this._instantiationService.createInstance(
        MenuEntryActionViewItem,
        action,
        { hoverDelegate: options.hoverDelegate }
      ) : void 0
    });
    return {
      element,
      label,
      actionBar,
      context,
      elementDisposables: new DisposableStore()
    };
  }
  shouldHideText() {
    return this._container ? this._container.clientWidth < 63 /* MidpointViewWidth */ : false;
  }
  shouldHideActionBar() {
    return this._container ? this._container.clientWidth <= 105 /* ActionbarMinimumWidth */ : false;
  }
  renderElement(instance, index, template) {
    const hasText = !this.shouldHideText();
    const group = this._terminalGroupService.getGroupForInstance(instance);
    if (!group) {
      throw new Error(
        `Could not find group for instance "${instance.instanceId}"`
      );
    }
    template.element.classList.toggle("has-text", hasText);
    template.element.classList.toggle(
      "is-active",
      this._terminalGroupService.activeInstance === instance
    );
    let prefix = "";
    if (group.terminalInstances.length > 1) {
      const terminalIndex = group.terminalInstances.indexOf(instance);
      if (terminalIndex === 0) {
        prefix = `\u250C `;
      } else if (terminalIndex === group.terminalInstances.length - 1) {
        prefix = `\u2514 `;
      } else {
        prefix = `\u251C `;
      }
    }
    const hoverInfo = getInstanceHoverInfo(instance);
    template.context.hoverActions = hoverInfo.actions;
    const iconId = this._instantiationService.invokeFunction(
      getIconId,
      instance
    );
    const hasActionbar = !this.shouldHideActionBar();
    let label = "";
    if (hasText) {
      this.fillActionBar(instance, template);
      label = prefix;
      if (instance.icon) {
        label += `$(${iconId}) ${instance.title}`;
      }
    } else {
      const primaryStatus = instance.statusList.primary;
      if (primaryStatus && primaryStatus.severity > Severity.Ignore) {
        label = `${prefix}$(${primaryStatus.icon?.id || iconId})`;
      } else {
        label = `${prefix}$(${iconId})`;
      }
    }
    if (!hasActionbar) {
      template.actionBar.clear();
    }
    template.elementDisposables.add(
      DOM.addDisposableListener(
        template.element,
        DOM.EventType.AUXCLICK,
        (e) => {
          e.stopImmediatePropagation();
          if (e.button === 1) {
            this._terminalService.safeDisposeTerminal(instance);
          }
        }
      )
    );
    const extraClasses = [];
    const colorClass = getColorClass(instance);
    if (colorClass) {
      extraClasses.push(colorClass);
    }
    const uriClasses = getUriClasses(
      instance,
      this._themeService.getColorTheme().type
    );
    if (uriClasses) {
      extraClasses.push(...uriClasses);
    }
    template.label.setResource(
      {
        resource: instance.resource,
        name: label,
        description: hasText ? instance.description : void 0
      },
      {
        fileDecorations: {
          colors: true,
          badges: hasText
        },
        title: {
          markdown: hoverInfo.content,
          markdownNotSupportedFallback: void 0
        },
        extraClasses
      }
    );
    const editableData = this._terminalService.getEditableData(instance);
    template.label.element.classList.toggle("editable-tab", !!editableData);
    if (editableData) {
      template.elementDisposables.add(
        this._renderInputBox(
          template.label.element.querySelector(
            ".monaco-icon-label-container"
          ),
          instance,
          editableData
        )
      );
      template.actionBar.clear();
    }
  }
  _renderInputBox(container, instance, editableData) {
    const value = instance.title || "";
    const inputBox = new InputBox(container, this._contextViewService, {
      validationOptions: {
        validation: (value2) => {
          const message = editableData.validationMessage(value2);
          if (!message || message.severity !== Severity.Error) {
            return null;
          }
          return {
            content: message.content,
            formatContent: true,
            type: MessageType.ERROR
          };
        }
      },
      ariaLabel: localize(
        "terminalInputAriaLabel",
        "Type terminal name. Press Enter to confirm or Escape to cancel."
      ),
      inputBoxStyles: defaultInputBoxStyles
    });
    inputBox.element.style.height = "22px";
    inputBox.value = value;
    inputBox.focus();
    inputBox.select({ start: 0, end: value.length });
    const done = createSingleCallFunction(
      (success, finishEditing) => {
        inputBox.element.style.display = "none";
        const value2 = inputBox.value;
        dispose(toDispose);
        inputBox.element.remove();
        if (finishEditing) {
          editableData.onFinish(value2, success);
        }
      }
    );
    const showInputBoxNotification = () => {
      if (inputBox.isInputValid()) {
        const message = editableData.validationMessage(inputBox.value);
        if (message) {
          inputBox.showMessage({
            content: message.content,
            formatContent: true,
            type: message.severity === Severity.Info ? MessageType.INFO : message.severity === Severity.Warning ? MessageType.WARNING : MessageType.ERROR
          });
        } else {
          inputBox.hideMessage();
        }
      }
    };
    showInputBoxNotification();
    const toDispose = [
      inputBox,
      DOM.addStandardDisposableListener(
        inputBox.inputElement,
        DOM.EventType.KEY_DOWN,
        (e) => {
          e.stopPropagation();
          if (e.equals(KeyCode.Enter)) {
            done(inputBox.isInputValid(), true);
          } else if (e.equals(KeyCode.Escape)) {
            done(false, true);
          }
        }
      ),
      DOM.addStandardDisposableListener(
        inputBox.inputElement,
        DOM.EventType.KEY_UP,
        (e) => {
          showInputBoxNotification();
        }
      ),
      DOM.addDisposableListener(
        inputBox.inputElement,
        DOM.EventType.BLUR,
        () => {
          done(inputBox.isInputValid(), true);
        }
      )
    ];
    return toDisposable(() => {
      done(false, false);
    });
  }
  disposeElement(instance, index, templateData) {
    templateData.elementDisposables.clear();
    templateData.actionBar.clear();
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.label.dispose();
    templateData.actionBar.dispose();
  }
  fillActionBar(instance, template) {
    const actions = [
      new Action(
        TerminalCommandId.SplitActiveTab,
        terminalStrings.split.short,
        ThemeIcon.asClassName(Codicon.splitHorizontal),
        true,
        async () => {
          this._runForSelectionOrInstance(instance, async (e) => {
            this._terminalService.createTerminal({
              location: { parentTerminal: e }
            });
          });
        }
      ),
      new Action(
        TerminalCommandId.KillActiveTab,
        terminalStrings.kill.short,
        ThemeIcon.asClassName(Codicon.trashcan),
        true,
        async () => {
          this._runForSelectionOrInstance(
            instance,
            (e) => this._terminalService.safeDisposeTerminal(e)
          );
        }
      )
    ];
    template.actionBar.clear();
    for (const action of actions) {
      template.actionBar.push(action, {
        icon: true,
        label: false,
        keybinding: this._keybindingService.lookupKeybinding(action.id)?.getLabel()
      });
    }
  }
  _runForSelectionOrInstance(instance, callback) {
    const selection = this._getSelection();
    if (selection.includes(instance)) {
      for (const s of selection) {
        if (s) {
          callback(s);
        }
      }
    } else {
      callback(instance);
    }
    this._terminalGroupService.focusTabs();
    this._listService.lastFocusedList?.focusNext();
  }
};
TerminalTabsRenderer = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ITerminalConfigurationService),
  __decorateParam(5, ITerminalService),
  __decorateParam(6, ITerminalGroupService),
  __decorateParam(7, IHoverService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IKeybindingService),
  __decorateParam(10, IListService),
  __decorateParam(11, IThemeService),
  __decorateParam(12, IContextViewService)
], TerminalTabsRenderer);
let TerminalTabsAccessibilityProvider = class {
  constructor(_terminalGroupService) {
    this._terminalGroupService = _terminalGroupService;
  }
  getWidgetAriaLabel() {
    return localize("terminal.tabs", "Terminal tabs");
  }
  getAriaLabel(instance) {
    let ariaLabel = "";
    const tab = this._terminalGroupService.getGroupForInstance(instance);
    if (tab && tab.terminalInstances?.length > 1) {
      const terminalIndex = tab.terminalInstances.indexOf(instance);
      ariaLabel = localize(
        {
          key: "splitTerminalAriaLabel",
          comment: [
            `The terminal's ID`,
            `The terminal's title`,
            `The terminal's split number`,
            `The terminal group's total split number`
          ]
        },
        "Terminal {0} {1}, split {2} of {3}",
        instance.instanceId,
        instance.title,
        terminalIndex + 1,
        tab.terminalInstances.length
      );
    } else {
      ariaLabel = localize(
        {
          key: "terminalAriaLabel",
          comment: [`The terminal's ID`, `The terminal's title`]
        },
        "Terminal {0} {1}",
        instance.instanceId,
        instance.title
      );
    }
    return ariaLabel;
  }
};
TerminalTabsAccessibilityProvider = __decorateClass([
  __decorateParam(0, ITerminalGroupService)
], TerminalTabsAccessibilityProvider);
let TerminalTabsDragAndDrop = class extends Disposable {
  constructor(_terminalService, _terminalGroupService, _hostService) {
    super();
    this._terminalService = _terminalService;
    this._terminalGroupService = _terminalGroupService;
    this._hostService = _hostService;
    this._primaryBackend = this._terminalService.getPrimaryBackend();
  }
  _autoFocusInstance;
  _autoFocusDisposable = Disposable.None;
  _primaryBackend;
  getDragURI(instance) {
    if (this._terminalService.getEditingTerminal()?.instanceId === instance.instanceId) {
      return null;
    }
    return instance.resource.toString();
  }
  getDragLabel(elements, originalEvent) {
    return elements.length === 1 ? elements[0].title : void 0;
  }
  onDragLeave() {
    this._autoFocusInstance = void 0;
    this._autoFocusDisposable.dispose();
    this._autoFocusDisposable = Disposable.None;
  }
  onDragStart(data, originalEvent) {
    if (!originalEvent.dataTransfer) {
      return;
    }
    const dndData = data.getData();
    if (!Array.isArray(dndData)) {
      return;
    }
    const terminals = dndData.filter(
      (e) => "instanceId" in e
    );
    if (terminals.length > 0) {
      originalEvent.dataTransfer.setData(
        TerminalDataTransfers.Terminals,
        JSON.stringify(terminals.map((e) => e.resource.toString()))
      );
    }
  }
  onDragOver(data, targetInstance, targetIndex, targetSector, originalEvent) {
    if (data instanceof NativeDragAndDropData) {
      if (!containsDragType(
        originalEvent,
        DataTransfers.FILES,
        DataTransfers.RESOURCES,
        TerminalDataTransfers.Terminals,
        CodeDataTransfers.FILES
      )) {
        return false;
      }
    }
    const didChangeAutoFocusInstance = this._autoFocusInstance !== targetInstance;
    if (didChangeAutoFocusInstance) {
      this._autoFocusDisposable.dispose();
      this._autoFocusInstance = targetInstance;
    }
    if (!targetInstance && !containsDragType(originalEvent, TerminalDataTransfers.Terminals)) {
      return data instanceof ElementsDragAndDropData;
    }
    if (didChangeAutoFocusInstance && targetInstance) {
      this._autoFocusDisposable = disposableTimeout(
        () => {
          this._terminalService.setActiveInstance(targetInstance);
          this._autoFocusInstance = void 0;
        },
        500,
        this._store
      );
    }
    return {
      feedback: targetIndex ? [targetIndex] : void 0,
      accept: true,
      effect: {
        type: ListDragOverEffectType.Move,
        position: ListDragOverEffectPosition.Over
      }
    };
  }
  async drop(data, targetInstance, targetIndex, targetSector, originalEvent) {
    this._autoFocusDisposable.dispose();
    this._autoFocusInstance = void 0;
    let sourceInstances;
    const promises = [];
    const resources = getTerminalResourcesFromDragEvent(originalEvent);
    if (resources) {
      for (const uri of resources) {
        const instance = this._terminalService.getInstanceFromResource(uri);
        if (instance) {
          if (Array.isArray(sourceInstances)) {
            sourceInstances.push(instance);
          } else {
            sourceInstances = [instance];
          }
          this._terminalService.moveToTerminalView(instance);
        } else if (this._primaryBackend) {
          const terminalIdentifier = parseTerminalUri(uri);
          if (terminalIdentifier.instanceId) {
            promises.push(
              this._primaryBackend.requestDetachInstance(
                terminalIdentifier.workspaceId,
                terminalIdentifier.instanceId
              )
            );
          }
        }
      }
    }
    if (promises.length) {
      let processes = await Promise.all(promises);
      processes = processes.filter((p) => p !== void 0);
      let lastInstance;
      for (const attachPersistentProcess of processes) {
        lastInstance = await this._terminalService.createTerminal({
          config: { attachPersistentProcess }
        });
      }
      if (lastInstance) {
        this._terminalService.setActiveInstance(lastInstance);
      }
      return;
    }
    if (sourceInstances === void 0) {
      if (!(data instanceof ElementsDragAndDropData)) {
        this._handleExternalDrop(targetInstance, originalEvent);
        return;
      }
      const draggedElement = data.getData();
      if (!draggedElement || !Array.isArray(draggedElement)) {
        return;
      }
      sourceInstances = [];
      for (const e of draggedElement) {
        if ("instanceId" in e) {
          sourceInstances.push(e);
        }
      }
    }
    if (!targetInstance) {
      this._terminalGroupService.moveGroupToEnd(sourceInstances);
      this._terminalService.setActiveInstance(sourceInstances[0]);
      return;
    }
    this._terminalGroupService.moveGroup(sourceInstances, targetInstance);
    this._terminalService.setActiveInstance(sourceInstances[0]);
  }
  async _handleExternalDrop(instance, e) {
    if (!instance || !e.dataTransfer) {
      return;
    }
    let resource;
    const rawResources = e.dataTransfer.getData(DataTransfers.RESOURCES);
    if (rawResources) {
      resource = URI.parse(JSON.parse(rawResources)[0]);
    }
    const rawCodeFiles = e.dataTransfer.getData(CodeDataTransfers.FILES);
    if (!resource && rawCodeFiles) {
      resource = URI.file(JSON.parse(rawCodeFiles)[0]);
    }
    if (!resource && e.dataTransfer.files.length > 0 && this._hostService.getPathForFile(e.dataTransfer.files[0])) {
      resource = URI.file(
        this._hostService.getPathForFile(e.dataTransfer.files[0])
      );
    }
    if (!resource) {
      return;
    }
    this._terminalService.setActiveInstance(instance);
    instance.focus();
    await instance.sendPath(resource, false);
  }
};
TerminalTabsDragAndDrop = __decorateClass([
  __decorateParam(0, ITerminalService),
  __decorateParam(1, ITerminalGroupService),
  __decorateParam(2, IHostService)
], TerminalTabsDragAndDrop);
let TabDecorationsProvider = class extends Disposable {
  constructor(_terminalService) {
    super();
    this._terminalService = _terminalService;
    this._register(
      this._terminalService.onAnyInstancePrimaryStatusChange(
        (e) => this._onDidChange.fire([e.resource])
      )
    );
  }
  label = localize("label", "Terminal");
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  provideDecorations(resource) {
    if (resource.scheme !== Schemas.vscodeTerminal) {
      return void 0;
    }
    const instance = this._terminalService.getInstanceFromResource(resource);
    if (!instance) {
      return void 0;
    }
    const primaryStatus = instance?.statusList?.primary;
    if (!primaryStatus?.icon) {
      return void 0;
    }
    return {
      color: getColorForSeverity(primaryStatus.severity),
      letter: primaryStatus.icon,
      tooltip: primaryStatus.tooltip
    };
  }
};
TabDecorationsProvider = __decorateClass([
  __decorateParam(0, ITerminalService)
], TabDecorationsProvider);
export {
  TerminalTabList,
  TerminalTabsListSizes
};
