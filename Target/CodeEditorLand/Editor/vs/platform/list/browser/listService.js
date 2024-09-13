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
import {
  createStyleSheet,
  isActiveElement,
  isKeyboardEvent
} from "../../../base/browser/dom.js";
import {
  PagedList
} from "../../../base/browser/ui/list/listPaging.js";
import {
  DefaultStyleController,
  List,
  TypeNavigationMode,
  isSelectionRangeChangeEvent,
  isSelectionSingleChangeEvent
} from "../../../base/browser/ui/list/listWidget.js";
import {
  Table
} from "../../../base/browser/ui/table/tableWidget.js";
import {
  TreeFindMatchType,
  TreeFindMode
} from "../../../base/browser/ui/tree/abstractTree.js";
import {
  AsyncDataTree,
  CompressibleAsyncDataTree
} from "../../../base/browser/ui/tree/asyncDataTree.js";
import {
  DataTree
} from "../../../base/browser/ui/tree/dataTree.js";
import {
  CompressibleObjectTree,
  ObjectTree
} from "../../../base/browser/ui/tree/objectTree.js";
import { Emitter, Event } from "../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  combinedDisposable,
  dispose,
  toDisposable
} from "../../../base/common/lifecycle.js";
import { localize } from "../../../nls.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import {
  Extensions as ConfigurationExtensions
} from "../../configuration/common/configurationRegistry.js";
import {
  ContextKeyExpr,
  IContextKeyService,
  RawContextKey
} from "../../contextkey/common/contextkey.js";
import { InputFocusedContextKey } from "../../contextkey/common/contextkeys.js";
import { IContextViewService } from "../../contextview/browser/contextView.js";
import {
  IInstantiationService,
  createDecorator
} from "../../instantiation/common/instantiation.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { ResultKind } from "../../keybinding/common/keybindingResolver.js";
import { Registry } from "../../registry/common/platform.js";
import {
  defaultFindWidgetStyles,
  defaultListStyles,
  getListStyles
} from "../../theme/browser/defaultStyles.js";
const IListService = createDecorator("listService");
class ListService {
  static {
    __name(this, "ListService");
  }
  disposables = new DisposableStore();
  lists = [];
  _lastFocusedWidget = void 0;
  _hasCreatedStyleController = false;
  get lastFocusedList() {
    return this._lastFocusedWidget;
  }
  constructor() {
  }
  setLastFocusedList(widget) {
    if (widget === this._lastFocusedWidget) {
      return;
    }
    this._lastFocusedWidget?.getHTMLElement().classList.remove("last-focused");
    this._lastFocusedWidget = widget;
    this._lastFocusedWidget?.getHTMLElement().classList.add("last-focused");
  }
  register(widget, extraContextKeys) {
    if (!this._hasCreatedStyleController) {
      this._hasCreatedStyleController = true;
      const styleController = new DefaultStyleController(
        createStyleSheet(),
        ""
      );
      styleController.style(defaultListStyles);
    }
    if (this.lists.some((l) => l.widget === widget)) {
      throw new Error("Cannot register the same widget multiple times");
    }
    const registeredList = { widget, extraContextKeys };
    this.lists.push(registeredList);
    if (isActiveElement(widget.getHTMLElement())) {
      this.setLastFocusedList(widget);
    }
    return combinedDisposable(
      widget.onDidFocus(() => this.setLastFocusedList(widget)),
      toDisposable(
        () => this.lists.splice(this.lists.indexOf(registeredList), 1)
      ),
      widget.onDidDispose(() => {
        this.lists = this.lists.filter((l) => l !== registeredList);
        if (this._lastFocusedWidget === widget) {
          this.setLastFocusedList(void 0);
        }
      })
    );
  }
  dispose() {
    this.disposables.dispose();
  }
}
const RawWorkbenchListScrollAtBoundaryContextKey = new RawContextKey("listScrollAtBoundary", "none");
const WorkbenchListScrollAtTopContextKey = ContextKeyExpr.or(
  RawWorkbenchListScrollAtBoundaryContextKey.isEqualTo("top"),
  RawWorkbenchListScrollAtBoundaryContextKey.isEqualTo("both")
);
const WorkbenchListScrollAtBottomContextKey = ContextKeyExpr.or(
  RawWorkbenchListScrollAtBoundaryContextKey.isEqualTo("bottom"),
  RawWorkbenchListScrollAtBoundaryContextKey.isEqualTo("both")
);
const RawWorkbenchListFocusContextKey = new RawContextKey(
  "listFocus",
  true
);
const WorkbenchTreeStickyScrollFocused = new RawContextKey(
  "treestickyScrollFocused",
  false
);
const WorkbenchListSupportsMultiSelectContextKey = new RawContextKey("listSupportsMultiselect", true);
const WorkbenchListFocusContextKey = ContextKeyExpr.and(
  RawWorkbenchListFocusContextKey,
  ContextKeyExpr.not(InputFocusedContextKey),
  WorkbenchTreeStickyScrollFocused.negate()
);
const WorkbenchListHasSelectionOrFocus = new RawContextKey(
  "listHasSelectionOrFocus",
  false
);
const WorkbenchListDoubleSelection = new RawContextKey(
  "listDoubleSelection",
  false
);
const WorkbenchListMultiSelection = new RawContextKey(
  "listMultiSelection",
  false
);
const WorkbenchListSelectionNavigation = new RawContextKey(
  "listSelectionNavigation",
  false
);
const WorkbenchListSupportsFind = new RawContextKey(
  "listSupportsFind",
  true
);
const WorkbenchTreeElementCanCollapse = new RawContextKey(
  "treeElementCanCollapse",
  false
);
const WorkbenchTreeElementHasParent = new RawContextKey(
  "treeElementHasParent",
  false
);
const WorkbenchTreeElementCanExpand = new RawContextKey(
  "treeElementCanExpand",
  false
);
const WorkbenchTreeElementHasChild = new RawContextKey(
  "treeElementHasChild",
  false
);
const WorkbenchTreeFindOpen = new RawContextKey(
  "treeFindOpen",
  false
);
const WorkbenchListTypeNavigationModeKey = "listTypeNavigationMode";
const WorkbenchListAutomaticKeyboardNavigationLegacyKey = "listAutomaticKeyboardNavigation";
function createScopedContextKeyService(contextKeyService, widget) {
  const result = contextKeyService.createScoped(widget.getHTMLElement());
  RawWorkbenchListFocusContextKey.bindTo(result);
  return result;
}
__name(createScopedContextKeyService, "createScopedContextKeyService");
function createScrollObserver(contextKeyService, widget) {
  const listScrollAt = RawWorkbenchListScrollAtBoundaryContextKey.bindTo(contextKeyService);
  const update = /* @__PURE__ */ __name(() => {
    const atTop = widget.scrollTop === 0;
    const atBottom = widget.scrollHeight - widget.renderHeight - widget.scrollTop < 1;
    if (atTop && atBottom) {
      listScrollAt.set("both");
    } else if (atTop) {
      listScrollAt.set("top");
    } else if (atBottom) {
      listScrollAt.set("bottom");
    } else {
      listScrollAt.set("none");
    }
  }, "update");
  update();
  return widget.onDidScroll(update);
}
__name(createScrollObserver, "createScrollObserver");
const multiSelectModifierSettingKey = "workbench.list.multiSelectModifier";
const openModeSettingKey = "workbench.list.openMode";
const horizontalScrollingKey = "workbench.list.horizontalScrolling";
const defaultFindModeSettingKey = "workbench.list.defaultFindMode";
const typeNavigationModeSettingKey = "workbench.list.typeNavigationMode";
const keyboardNavigationSettingKey = "workbench.list.keyboardNavigation";
const scrollByPageKey = "workbench.list.scrollByPage";
const defaultFindMatchTypeSettingKey = "workbench.list.defaultFindMatchType";
const treeIndentKey = "workbench.tree.indent";
const treeRenderIndentGuidesKey = "workbench.tree.renderIndentGuides";
const listSmoothScrolling = "workbench.list.smoothScrolling";
const mouseWheelScrollSensitivityKey = "workbench.list.mouseWheelScrollSensitivity";
const fastScrollSensitivityKey = "workbench.list.fastScrollSensitivity";
const treeExpandMode = "workbench.tree.expandMode";
const treeStickyScroll = "workbench.tree.enableStickyScroll";
const treeStickyScrollMaxElements = "workbench.tree.stickyScrollMaxItemCount";
function useAltAsMultipleSelectionModifier(configurationService) {
  return configurationService.getValue(multiSelectModifierSettingKey) === "alt";
}
__name(useAltAsMultipleSelectionModifier, "useAltAsMultipleSelectionModifier");
class MultipleSelectionController extends Disposable {
  constructor(configurationService) {
    super();
    this.configurationService = configurationService;
    this.useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
    this.registerListeners();
  }
  static {
    __name(this, "MultipleSelectionController");
  }
  useAltAsMultipleSelectionModifier;
  registerListeners() {
    this._register(
      this.configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
          this.useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(
            this.configurationService
          );
        }
      })
    );
  }
  isSelectionSingleChangeEvent(event) {
    if (this.useAltAsMultipleSelectionModifier) {
      return event.browserEvent.altKey;
    }
    return isSelectionSingleChangeEvent(event);
  }
  isSelectionRangeChangeEvent(event) {
    return isSelectionRangeChangeEvent(event);
  }
}
function toWorkbenchListOptions(accessor, options) {
  const configurationService = accessor.get(IConfigurationService);
  const keybindingService = accessor.get(IKeybindingService);
  const disposables = new DisposableStore();
  const result = {
    ...options,
    keyboardNavigationDelegate: {
      mightProducePrintableCharacter(e) {
        return keybindingService.mightProducePrintableCharacter(e);
      }
    },
    smoothScrolling: Boolean(
      configurationService.getValue(listSmoothScrolling)
    ),
    mouseWheelScrollSensitivity: configurationService.getValue(
      mouseWheelScrollSensitivityKey
    ),
    fastScrollSensitivity: configurationService.getValue(
      fastScrollSensitivityKey
    ),
    multipleSelectionController: options.multipleSelectionController ?? disposables.add(
      new MultipleSelectionController(configurationService)
    ),
    keyboardNavigationEventFilter: createKeyboardNavigationEventFilter(keybindingService),
    scrollByPage: Boolean(configurationService.getValue(scrollByPageKey))
  };
  return [result, disposables];
}
__name(toWorkbenchListOptions, "toWorkbenchListOptions");
let WorkbenchList = class extends List {
  static {
    __name(this, "WorkbenchList");
  }
  contextKeyService;
  listSupportsMultiSelect;
  listHasSelectionOrFocus;
  listDoubleSelection;
  listMultiSelection;
  horizontalScrolling;
  _useAltAsMultipleSelectionModifier;
  navigator;
  get onDidOpen() {
    return this.navigator.onDidOpen;
  }
  constructor(user, container, delegate, renderers, options, contextKeyService, listService, configurationService, instantiationService) {
    const horizontalScrolling = typeof options.horizontalScrolling !== "undefined" ? options.horizontalScrolling : Boolean(
      configurationService.getValue(horizontalScrollingKey)
    );
    const [workbenchListOptions, workbenchListOptionsDisposable] = instantiationService.invokeFunction(
      toWorkbenchListOptions,
      options
    );
    super(user, container, delegate, renderers, {
      keyboardSupport: false,
      ...workbenchListOptions,
      horizontalScrolling
    });
    this.disposables.add(workbenchListOptionsDisposable);
    this.contextKeyService = createScopedContextKeyService(
      contextKeyService,
      this
    );
    this.disposables.add(
      createScrollObserver(this.contextKeyService, this)
    );
    this.listSupportsMultiSelect = WorkbenchListSupportsMultiSelectContextKey.bindTo(
      this.contextKeyService
    );
    this.listSupportsMultiSelect.set(
      options.multipleSelectionSupport !== false
    );
    const listSelectionNavigation = WorkbenchListSelectionNavigation.bindTo(
      this.contextKeyService
    );
    listSelectionNavigation.set(Boolean(options.selectionNavigation));
    this.listHasSelectionOrFocus = WorkbenchListHasSelectionOrFocus.bindTo(
      this.contextKeyService
    );
    this.listDoubleSelection = WorkbenchListDoubleSelection.bindTo(
      this.contextKeyService
    );
    this.listMultiSelection = WorkbenchListMultiSelection.bindTo(
      this.contextKeyService
    );
    this.horizontalScrolling = options.horizontalScrolling;
    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
    this.disposables.add(this.contextKeyService);
    this.disposables.add(listService.register(this));
    this.updateStyles(options.overrideStyles);
    this.disposables.add(
      this.onDidChangeSelection(() => {
        const selection = this.getSelection();
        const focus = this.getFocus();
        this.contextKeyService.bufferChangeEvents(() => {
          this.listHasSelectionOrFocus.set(
            selection.length > 0 || focus.length > 0
          );
          this.listMultiSelection.set(selection.length > 1);
          this.listDoubleSelection.set(selection.length === 2);
        });
      })
    );
    this.disposables.add(
      this.onDidChangeFocus(() => {
        const selection = this.getSelection();
        const focus = this.getFocus();
        this.listHasSelectionOrFocus.set(
          selection.length > 0 || focus.length > 0
        );
      })
    );
    this.disposables.add(
      configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
          this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
        }
        let options2 = {};
        if (e.affectsConfiguration(horizontalScrollingKey) && this.horizontalScrolling === void 0) {
          const horizontalScrolling2 = Boolean(
            configurationService.getValue(horizontalScrollingKey)
          );
          options2 = { ...options2, horizontalScrolling: horizontalScrolling2 };
        }
        if (e.affectsConfiguration(scrollByPageKey)) {
          const scrollByPage = Boolean(
            configurationService.getValue(scrollByPageKey)
          );
          options2 = { ...options2, scrollByPage };
        }
        if (e.affectsConfiguration(listSmoothScrolling)) {
          const smoothScrolling = Boolean(
            configurationService.getValue(listSmoothScrolling)
          );
          options2 = { ...options2, smoothScrolling };
        }
        if (e.affectsConfiguration(mouseWheelScrollSensitivityKey)) {
          const mouseWheelScrollSensitivity = configurationService.getValue(
            mouseWheelScrollSensitivityKey
          );
          options2 = { ...options2, mouseWheelScrollSensitivity };
        }
        if (e.affectsConfiguration(fastScrollSensitivityKey)) {
          const fastScrollSensitivity = configurationService.getValue(
            fastScrollSensitivityKey
          );
          options2 = { ...options2, fastScrollSensitivity };
        }
        if (Object.keys(options2).length > 0) {
          this.updateOptions(options2);
        }
      })
    );
    this.navigator = new ListResourceNavigator(this, {
      configurationService,
      ...options
    });
    this.disposables.add(this.navigator);
  }
  updateOptions(options) {
    super.updateOptions(options);
    if (options.overrideStyles !== void 0) {
      this.updateStyles(options.overrideStyles);
    }
    if (options.multipleSelectionSupport !== void 0) {
      this.listSupportsMultiSelect.set(
        !!options.multipleSelectionSupport
      );
    }
  }
  updateStyles(styles) {
    this.style(styles ? getListStyles(styles) : defaultListStyles);
  }
  get useAltAsMultipleSelectionModifier() {
    return this._useAltAsMultipleSelectionModifier;
  }
};
WorkbenchList = __decorateClass([
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IListService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IInstantiationService)
], WorkbenchList);
let WorkbenchPagedList = class extends PagedList {
  static {
    __name(this, "WorkbenchPagedList");
  }
  contextKeyService;
  disposables;
  listSupportsMultiSelect;
  _useAltAsMultipleSelectionModifier;
  horizontalScrolling;
  navigator;
  get onDidOpen() {
    return this.navigator.onDidOpen;
  }
  constructor(user, container, delegate, renderers, options, contextKeyService, listService, configurationService, instantiationService) {
    const horizontalScrolling = typeof options.horizontalScrolling !== "undefined" ? options.horizontalScrolling : Boolean(
      configurationService.getValue(horizontalScrollingKey)
    );
    const [workbenchListOptions, workbenchListOptionsDisposable] = instantiationService.invokeFunction(
      toWorkbenchListOptions,
      options
    );
    super(user, container, delegate, renderers, {
      keyboardSupport: false,
      ...workbenchListOptions,
      horizontalScrolling
    });
    this.disposables = new DisposableStore();
    this.disposables.add(workbenchListOptionsDisposable);
    this.contextKeyService = createScopedContextKeyService(
      contextKeyService,
      this
    );
    this.disposables.add(
      createScrollObserver(this.contextKeyService, this.widget)
    );
    this.horizontalScrolling = options.horizontalScrolling;
    this.listSupportsMultiSelect = WorkbenchListSupportsMultiSelectContextKey.bindTo(
      this.contextKeyService
    );
    this.listSupportsMultiSelect.set(
      options.multipleSelectionSupport !== false
    );
    const listSelectionNavigation = WorkbenchListSelectionNavigation.bindTo(
      this.contextKeyService
    );
    listSelectionNavigation.set(Boolean(options.selectionNavigation));
    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
    this.disposables.add(this.contextKeyService);
    this.disposables.add(listService.register(this));
    this.updateStyles(options.overrideStyles);
    this.disposables.add(
      configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
          this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
        }
        let options2 = {};
        if (e.affectsConfiguration(horizontalScrollingKey) && this.horizontalScrolling === void 0) {
          const horizontalScrolling2 = Boolean(
            configurationService.getValue(horizontalScrollingKey)
          );
          options2 = { ...options2, horizontalScrolling: horizontalScrolling2 };
        }
        if (e.affectsConfiguration(scrollByPageKey)) {
          const scrollByPage = Boolean(
            configurationService.getValue(scrollByPageKey)
          );
          options2 = { ...options2, scrollByPage };
        }
        if (e.affectsConfiguration(listSmoothScrolling)) {
          const smoothScrolling = Boolean(
            configurationService.getValue(listSmoothScrolling)
          );
          options2 = { ...options2, smoothScrolling };
        }
        if (e.affectsConfiguration(mouseWheelScrollSensitivityKey)) {
          const mouseWheelScrollSensitivity = configurationService.getValue(
            mouseWheelScrollSensitivityKey
          );
          options2 = { ...options2, mouseWheelScrollSensitivity };
        }
        if (e.affectsConfiguration(fastScrollSensitivityKey)) {
          const fastScrollSensitivity = configurationService.getValue(
            fastScrollSensitivityKey
          );
          options2 = { ...options2, fastScrollSensitivity };
        }
        if (Object.keys(options2).length > 0) {
          this.updateOptions(options2);
        }
      })
    );
    this.navigator = new ListResourceNavigator(this, {
      configurationService,
      ...options
    });
    this.disposables.add(this.navigator);
  }
  updateOptions(options) {
    super.updateOptions(options);
    if (options.overrideStyles !== void 0) {
      this.updateStyles(options.overrideStyles);
    }
    if (options.multipleSelectionSupport !== void 0) {
      this.listSupportsMultiSelect.set(
        !!options.multipleSelectionSupport
      );
    }
  }
  updateStyles(styles) {
    this.style(styles ? getListStyles(styles) : defaultListStyles);
  }
  get useAltAsMultipleSelectionModifier() {
    return this._useAltAsMultipleSelectionModifier;
  }
  dispose() {
    this.disposables.dispose();
    super.dispose();
  }
};
WorkbenchPagedList = __decorateClass([
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IListService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IInstantiationService)
], WorkbenchPagedList);
let WorkbenchTable = class extends Table {
  static {
    __name(this, "WorkbenchTable");
  }
  contextKeyService;
  listSupportsMultiSelect;
  listHasSelectionOrFocus;
  listDoubleSelection;
  listMultiSelection;
  horizontalScrolling;
  _useAltAsMultipleSelectionModifier;
  navigator;
  get onDidOpen() {
    return this.navigator.onDidOpen;
  }
  constructor(user, container, delegate, columns, renderers, options, contextKeyService, listService, configurationService, instantiationService) {
    const horizontalScrolling = typeof options.horizontalScrolling !== "undefined" ? options.horizontalScrolling : Boolean(
      configurationService.getValue(horizontalScrollingKey)
    );
    const [workbenchListOptions, workbenchListOptionsDisposable] = instantiationService.invokeFunction(
      toWorkbenchListOptions,
      options
    );
    super(user, container, delegate, columns, renderers, {
      keyboardSupport: false,
      ...workbenchListOptions,
      horizontalScrolling
    });
    this.disposables.add(workbenchListOptionsDisposable);
    this.contextKeyService = createScopedContextKeyService(
      contextKeyService,
      this
    );
    this.disposables.add(
      createScrollObserver(this.contextKeyService, this)
    );
    this.listSupportsMultiSelect = WorkbenchListSupportsMultiSelectContextKey.bindTo(
      this.contextKeyService
    );
    this.listSupportsMultiSelect.set(
      options.multipleSelectionSupport !== false
    );
    const listSelectionNavigation = WorkbenchListSelectionNavigation.bindTo(
      this.contextKeyService
    );
    listSelectionNavigation.set(Boolean(options.selectionNavigation));
    this.listHasSelectionOrFocus = WorkbenchListHasSelectionOrFocus.bindTo(
      this.contextKeyService
    );
    this.listDoubleSelection = WorkbenchListDoubleSelection.bindTo(
      this.contextKeyService
    );
    this.listMultiSelection = WorkbenchListMultiSelection.bindTo(
      this.contextKeyService
    );
    this.horizontalScrolling = options.horizontalScrolling;
    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
    this.disposables.add(this.contextKeyService);
    this.disposables.add(listService.register(this));
    this.updateStyles(options.overrideStyles);
    this.disposables.add(
      this.onDidChangeSelection(() => {
        const selection = this.getSelection();
        const focus = this.getFocus();
        this.contextKeyService.bufferChangeEvents(() => {
          this.listHasSelectionOrFocus.set(
            selection.length > 0 || focus.length > 0
          );
          this.listMultiSelection.set(selection.length > 1);
          this.listDoubleSelection.set(selection.length === 2);
        });
      })
    );
    this.disposables.add(
      this.onDidChangeFocus(() => {
        const selection = this.getSelection();
        const focus = this.getFocus();
        this.listHasSelectionOrFocus.set(
          selection.length > 0 || focus.length > 0
        );
      })
    );
    this.disposables.add(
      configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
          this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
        }
        let options2 = {};
        if (e.affectsConfiguration(horizontalScrollingKey) && this.horizontalScrolling === void 0) {
          const horizontalScrolling2 = Boolean(
            configurationService.getValue(horizontalScrollingKey)
          );
          options2 = { ...options2, horizontalScrolling: horizontalScrolling2 };
        }
        if (e.affectsConfiguration(scrollByPageKey)) {
          const scrollByPage = Boolean(
            configurationService.getValue(scrollByPageKey)
          );
          options2 = { ...options2, scrollByPage };
        }
        if (e.affectsConfiguration(listSmoothScrolling)) {
          const smoothScrolling = Boolean(
            configurationService.getValue(listSmoothScrolling)
          );
          options2 = { ...options2, smoothScrolling };
        }
        if (e.affectsConfiguration(mouseWheelScrollSensitivityKey)) {
          const mouseWheelScrollSensitivity = configurationService.getValue(
            mouseWheelScrollSensitivityKey
          );
          options2 = { ...options2, mouseWheelScrollSensitivity };
        }
        if (e.affectsConfiguration(fastScrollSensitivityKey)) {
          const fastScrollSensitivity = configurationService.getValue(
            fastScrollSensitivityKey
          );
          options2 = { ...options2, fastScrollSensitivity };
        }
        if (Object.keys(options2).length > 0) {
          this.updateOptions(options2);
        }
      })
    );
    this.navigator = new TableResourceNavigator(this, {
      configurationService,
      ...options
    });
    this.disposables.add(this.navigator);
  }
  updateOptions(options) {
    super.updateOptions(options);
    if (options.overrideStyles !== void 0) {
      this.updateStyles(options.overrideStyles);
    }
    if (options.multipleSelectionSupport !== void 0) {
      this.listSupportsMultiSelect.set(
        !!options.multipleSelectionSupport
      );
    }
  }
  updateStyles(styles) {
    this.style(styles ? getListStyles(styles) : defaultListStyles);
  }
  get useAltAsMultipleSelectionModifier() {
    return this._useAltAsMultipleSelectionModifier;
  }
  dispose() {
    this.disposables.dispose();
    super.dispose();
  }
};
WorkbenchTable = __decorateClass([
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IListService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IInstantiationService)
], WorkbenchTable);
function getSelectionKeyboardEvent(typeArg = "keydown", preserveFocus, pinned) {
  const e = new KeyboardEvent(typeArg);
  e.preserveFocus = preserveFocus;
  e.pinned = pinned;
  e.__forceEvent = true;
  return e;
}
__name(getSelectionKeyboardEvent, "getSelectionKeyboardEvent");
class ResourceNavigator extends Disposable {
  constructor(widget, options) {
    super();
    this.widget = widget;
    this._register(
      Event.filter(
        this.widget.onDidChangeSelection,
        (e) => isKeyboardEvent(e.browserEvent)
      )((e) => this.onSelectionFromKeyboard(e))
    );
    this._register(
      this.widget.onPointer(
        (e) => this.onPointer(e.element, e.browserEvent)
      )
    );
    this._register(
      this.widget.onMouseDblClick(
        (e) => this.onMouseDblClick(e.element, e.browserEvent)
      )
    );
    if (typeof options?.openOnSingleClick !== "boolean" && options?.configurationService) {
      this.openOnSingleClick = options?.configurationService.getValue(openModeSettingKey) !== "doubleClick";
      this._register(
        options?.configurationService.onDidChangeConfiguration((e) => {
          if (e.affectsConfiguration(openModeSettingKey)) {
            this.openOnSingleClick = options?.configurationService.getValue(
              openModeSettingKey
            ) !== "doubleClick";
          }
        })
      );
    } else {
      this.openOnSingleClick = options?.openOnSingleClick ?? true;
    }
  }
  static {
    __name(this, "ResourceNavigator");
  }
  openOnSingleClick;
  _onDidOpen = this._register(
    new Emitter()
  );
  onDidOpen = this._onDidOpen.event;
  onSelectionFromKeyboard(event) {
    if (event.elements.length !== 1) {
      return;
    }
    const selectionKeyboardEvent = event.browserEvent;
    const preserveFocus = typeof selectionKeyboardEvent.preserveFocus === "boolean" ? selectionKeyboardEvent.preserveFocus : true;
    const pinned = typeof selectionKeyboardEvent.pinned === "boolean" ? selectionKeyboardEvent.pinned : !preserveFocus;
    const sideBySide = false;
    this._open(
      this.getSelectedElement(),
      preserveFocus,
      pinned,
      sideBySide,
      event.browserEvent
    );
  }
  onPointer(element, browserEvent) {
    if (!this.openOnSingleClick) {
      return;
    }
    const isDoubleClick = browserEvent.detail === 2;
    if (isDoubleClick) {
      return;
    }
    const isMiddleClick = browserEvent.button === 1;
    const preserveFocus = true;
    const pinned = isMiddleClick;
    const sideBySide = browserEvent.ctrlKey || browserEvent.metaKey || browserEvent.altKey;
    this._open(element, preserveFocus, pinned, sideBySide, browserEvent);
  }
  onMouseDblClick(element, browserEvent) {
    if (!browserEvent) {
      return;
    }
    const target = browserEvent.target;
    const onTwistie = target.classList.contains("monaco-tl-twistie") || target.classList.contains("monaco-icon-label") && target.classList.contains("folder-icon") && browserEvent.offsetX < 16;
    if (onTwistie) {
      return;
    }
    const preserveFocus = false;
    const pinned = true;
    const sideBySide = browserEvent.ctrlKey || browserEvent.metaKey || browserEvent.altKey;
    this._open(element, preserveFocus, pinned, sideBySide, browserEvent);
  }
  _open(element, preserveFocus, pinned, sideBySide, browserEvent) {
    if (!element) {
      return;
    }
    this._onDidOpen.fire({
      editorOptions: {
        preserveFocus,
        pinned,
        revealIfVisible: true
      },
      sideBySide,
      element,
      browserEvent
    });
  }
}
class ListResourceNavigator extends ResourceNavigator {
  static {
    __name(this, "ListResourceNavigator");
  }
  widget;
  constructor(widget, options) {
    super(widget, options);
    this.widget = widget;
  }
  getSelectedElement() {
    return this.widget.getSelectedElements()[0];
  }
}
class TableResourceNavigator extends ResourceNavigator {
  static {
    __name(this, "TableResourceNavigator");
  }
  constructor(widget, options) {
    super(widget, options);
  }
  getSelectedElement() {
    return this.widget.getSelectedElements()[0];
  }
}
class TreeResourceNavigator extends ResourceNavigator {
  static {
    __name(this, "TreeResourceNavigator");
  }
  constructor(widget, options) {
    super(widget, options);
  }
  getSelectedElement() {
    return this.widget.getSelection()[0] ?? void 0;
  }
}
function createKeyboardNavigationEventFilter(keybindingService) {
  let inMultiChord = false;
  return (event) => {
    if (event.toKeyCodeChord().isModifierKey()) {
      return false;
    }
    if (inMultiChord) {
      inMultiChord = false;
      return false;
    }
    const result = keybindingService.softDispatch(event, event.target);
    if (result.kind === ResultKind.MoreChordsNeeded) {
      inMultiChord = true;
      return false;
    }
    inMultiChord = false;
    return result.kind === ResultKind.NoMatchingKb;
  };
}
__name(createKeyboardNavigationEventFilter, "createKeyboardNavigationEventFilter");
let WorkbenchObjectTree = class extends ObjectTree {
  static {
    __name(this, "WorkbenchObjectTree");
  }
  internals;
  get contextKeyService() {
    return this.internals.contextKeyService;
  }
  get useAltAsMultipleSelectionModifier() {
    return this.internals.useAltAsMultipleSelectionModifier;
  }
  get onDidOpen() {
    return this.internals.onDidOpen;
  }
  constructor(user, container, delegate, renderers, options, instantiationService, contextKeyService, listService, configurationService) {
    const {
      options: treeOptions,
      getTypeNavigationMode,
      disposable
    } = instantiationService.invokeFunction(
      workbenchTreeDataPreamble,
      options
    );
    super(user, container, delegate, renderers, treeOptions);
    this.disposables.add(disposable);
    this.internals = new WorkbenchTreeInternals(
      this,
      options,
      getTypeNavigationMode,
      options.overrideStyles,
      contextKeyService,
      listService,
      configurationService
    );
    this.disposables.add(this.internals);
  }
  updateOptions(options) {
    super.updateOptions(options);
    this.internals.updateOptions(options);
  }
};
WorkbenchObjectTree = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IListService),
  __decorateParam(8, IConfigurationService)
], WorkbenchObjectTree);
let WorkbenchCompressibleObjectTree = class extends CompressibleObjectTree {
  static {
    __name(this, "WorkbenchCompressibleObjectTree");
  }
  internals;
  get contextKeyService() {
    return this.internals.contextKeyService;
  }
  get useAltAsMultipleSelectionModifier() {
    return this.internals.useAltAsMultipleSelectionModifier;
  }
  get onDidOpen() {
    return this.internals.onDidOpen;
  }
  constructor(user, container, delegate, renderers, options, instantiationService, contextKeyService, listService, configurationService) {
    const {
      options: treeOptions,
      getTypeNavigationMode,
      disposable
    } = instantiationService.invokeFunction(
      workbenchTreeDataPreamble,
      options
    );
    super(user, container, delegate, renderers, treeOptions);
    this.disposables.add(disposable);
    this.internals = new WorkbenchTreeInternals(
      this,
      options,
      getTypeNavigationMode,
      options.overrideStyles,
      contextKeyService,
      listService,
      configurationService
    );
    this.disposables.add(this.internals);
  }
  updateOptions(options = {}) {
    super.updateOptions(options);
    if (options.overrideStyles) {
      this.internals.updateStyleOverrides(options.overrideStyles);
    }
    this.internals.updateOptions(options);
  }
};
WorkbenchCompressibleObjectTree = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IListService),
  __decorateParam(8, IConfigurationService)
], WorkbenchCompressibleObjectTree);
let WorkbenchDataTree = class extends DataTree {
  static {
    __name(this, "WorkbenchDataTree");
  }
  internals;
  get contextKeyService() {
    return this.internals.contextKeyService;
  }
  get useAltAsMultipleSelectionModifier() {
    return this.internals.useAltAsMultipleSelectionModifier;
  }
  get onDidOpen() {
    return this.internals.onDidOpen;
  }
  constructor(user, container, delegate, renderers, dataSource, options, instantiationService, contextKeyService, listService, configurationService) {
    const {
      options: treeOptions,
      getTypeNavigationMode,
      disposable
    } = instantiationService.invokeFunction(
      workbenchTreeDataPreamble,
      options
    );
    super(user, container, delegate, renderers, dataSource, treeOptions);
    this.disposables.add(disposable);
    this.internals = new WorkbenchTreeInternals(
      this,
      options,
      getTypeNavigationMode,
      options.overrideStyles,
      contextKeyService,
      listService,
      configurationService
    );
    this.disposables.add(this.internals);
  }
  updateOptions(options = {}) {
    super.updateOptions(options);
    if (options.overrideStyles !== void 0) {
      this.internals.updateStyleOverrides(options.overrideStyles);
    }
    this.internals.updateOptions(options);
  }
};
WorkbenchDataTree = __decorateClass([
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IListService),
  __decorateParam(9, IConfigurationService)
], WorkbenchDataTree);
let WorkbenchAsyncDataTree = class extends AsyncDataTree {
  static {
    __name(this, "WorkbenchAsyncDataTree");
  }
  internals;
  get contextKeyService() {
    return this.internals.contextKeyService;
  }
  get useAltAsMultipleSelectionModifier() {
    return this.internals.useAltAsMultipleSelectionModifier;
  }
  get onDidOpen() {
    return this.internals.onDidOpen;
  }
  constructor(user, container, delegate, renderers, dataSource, options, instantiationService, contextKeyService, listService, configurationService) {
    const {
      options: treeOptions,
      getTypeNavigationMode,
      disposable
    } = instantiationService.invokeFunction(
      workbenchTreeDataPreamble,
      options
    );
    super(user, container, delegate, renderers, dataSource, treeOptions);
    this.disposables.add(disposable);
    this.internals = new WorkbenchTreeInternals(
      this,
      options,
      getTypeNavigationMode,
      options.overrideStyles,
      contextKeyService,
      listService,
      configurationService
    );
    this.disposables.add(this.internals);
  }
  updateOptions(options = {}) {
    super.updateOptions(options);
    if (options.overrideStyles) {
      this.internals.updateStyleOverrides(options.overrideStyles);
    }
    this.internals.updateOptions(options);
  }
};
WorkbenchAsyncDataTree = __decorateClass([
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IListService),
  __decorateParam(9, IConfigurationService)
], WorkbenchAsyncDataTree);
let WorkbenchCompressibleAsyncDataTree = class extends CompressibleAsyncDataTree {
  static {
    __name(this, "WorkbenchCompressibleAsyncDataTree");
  }
  internals;
  get contextKeyService() {
    return this.internals.contextKeyService;
  }
  get useAltAsMultipleSelectionModifier() {
    return this.internals.useAltAsMultipleSelectionModifier;
  }
  get onDidOpen() {
    return this.internals.onDidOpen;
  }
  constructor(user, container, virtualDelegate, compressionDelegate, renderers, dataSource, options, instantiationService, contextKeyService, listService, configurationService) {
    const {
      options: treeOptions,
      getTypeNavigationMode,
      disposable
    } = instantiationService.invokeFunction(
      workbenchTreeDataPreamble,
      options
    );
    super(
      user,
      container,
      virtualDelegate,
      compressionDelegate,
      renderers,
      dataSource,
      treeOptions
    );
    this.disposables.add(disposable);
    this.internals = new WorkbenchTreeInternals(
      this,
      options,
      getTypeNavigationMode,
      options.overrideStyles,
      contextKeyService,
      listService,
      configurationService
    );
    this.disposables.add(this.internals);
  }
  updateOptions(options) {
    super.updateOptions(options);
    this.internals.updateOptions(options);
  }
};
WorkbenchCompressibleAsyncDataTree = __decorateClass([
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IListService),
  __decorateParam(10, IConfigurationService)
], WorkbenchCompressibleAsyncDataTree);
function getDefaultTreeFindMode(configurationService) {
  const value = configurationService.getValue(
    defaultFindModeSettingKey
  );
  if (value === "highlight") {
    return TreeFindMode.Highlight;
  } else if (value === "filter") {
    return TreeFindMode.Filter;
  }
  const deprecatedValue = configurationService.getValue(keyboardNavigationSettingKey);
  if (deprecatedValue === "simple" || deprecatedValue === "highlight") {
    return TreeFindMode.Highlight;
  } else if (deprecatedValue === "filter") {
    return TreeFindMode.Filter;
  }
  return void 0;
}
__name(getDefaultTreeFindMode, "getDefaultTreeFindMode");
function getDefaultTreeFindMatchType(configurationService) {
  const value = configurationService.getValue(
    defaultFindMatchTypeSettingKey
  );
  if (value === "fuzzy") {
    return TreeFindMatchType.Fuzzy;
  } else if (value === "contiguous") {
    return TreeFindMatchType.Contiguous;
  }
  return void 0;
}
__name(getDefaultTreeFindMatchType, "getDefaultTreeFindMatchType");
function workbenchTreeDataPreamble(accessor, options) {
  const configurationService = accessor.get(IConfigurationService);
  const contextViewService = accessor.get(IContextViewService);
  const contextKeyService = accessor.get(IContextKeyService);
  const instantiationService = accessor.get(IInstantiationService);
  const getTypeNavigationMode = /* @__PURE__ */ __name(() => {
    const modeString = contextKeyService.getContextKeyValue(WorkbenchListTypeNavigationModeKey);
    if (modeString === "automatic") {
      return TypeNavigationMode.Automatic;
    } else if (modeString === "trigger") {
      return TypeNavigationMode.Trigger;
    }
    const modeBoolean = contextKeyService.getContextKeyValue(
      WorkbenchListAutomaticKeyboardNavigationLegacyKey
    );
    if (modeBoolean === false) {
      return TypeNavigationMode.Trigger;
    }
    const configString = configurationService.getValue(typeNavigationModeSettingKey);
    if (configString === "automatic") {
      return TypeNavigationMode.Automatic;
    } else if (configString === "trigger") {
      return TypeNavigationMode.Trigger;
    }
    return void 0;
  }, "getTypeNavigationMode");
  const horizontalScrolling = options.horizontalScrolling !== void 0 ? options.horizontalScrolling : Boolean(configurationService.getValue(horizontalScrollingKey));
  const [workbenchListOptions, disposable] = instantiationService.invokeFunction(toWorkbenchListOptions, options);
  const paddingBottom = options.paddingBottom;
  const renderIndentGuides = options.renderIndentGuides !== void 0 ? options.renderIndentGuides : configurationService.getValue(
    treeRenderIndentGuidesKey
  );
  return {
    getTypeNavigationMode,
    disposable,
    options: {
      // ...options, // TODO@Joao why is this not splatted here?
      keyboardSupport: false,
      ...workbenchListOptions,
      indent: typeof configurationService.getValue(treeIndentKey) === "number" ? configurationService.getValue(treeIndentKey) : void 0,
      renderIndentGuides,
      smoothScrolling: Boolean(
        configurationService.getValue(listSmoothScrolling)
      ),
      defaultFindMode: getDefaultTreeFindMode(configurationService),
      defaultFindMatchType: getDefaultTreeFindMatchType(configurationService),
      horizontalScrolling,
      scrollByPage: Boolean(
        configurationService.getValue(scrollByPageKey)
      ),
      paddingBottom,
      hideTwistiesOfChildlessElements: options.hideTwistiesOfChildlessElements,
      expandOnlyOnTwistieClick: options.expandOnlyOnTwistieClick ?? configurationService.getValue(
        treeExpandMode
      ) === "doubleClick",
      contextViewProvider: contextViewService,
      findWidgetStyles: defaultFindWidgetStyles,
      enableStickyScroll: Boolean(
        configurationService.getValue(treeStickyScroll)
      ),
      stickyScrollMaxItemCount: Number(
        configurationService.getValue(treeStickyScrollMaxElements)
      )
    }
  };
}
__name(workbenchTreeDataPreamble, "workbenchTreeDataPreamble");
let WorkbenchTreeInternals = class {
  constructor(tree, options, getTypeNavigationMode, overrideStyles, contextKeyService, listService, configurationService) {
    this.tree = tree;
    this.contextKeyService = createScopedContextKeyService(
      contextKeyService,
      tree
    );
    this.disposables.push(
      createScrollObserver(this.contextKeyService, tree)
    );
    this.listSupportsMultiSelect = WorkbenchListSupportsMultiSelectContextKey.bindTo(
      this.contextKeyService
    );
    this.listSupportsMultiSelect.set(
      options.multipleSelectionSupport !== false
    );
    const listSelectionNavigation = WorkbenchListSelectionNavigation.bindTo(
      this.contextKeyService
    );
    listSelectionNavigation.set(Boolean(options.selectionNavigation));
    this.listSupportFindWidget = WorkbenchListSupportsFind.bindTo(
      this.contextKeyService
    );
    this.listSupportFindWidget.set(options.findWidgetEnabled ?? true);
    this.hasSelectionOrFocus = WorkbenchListHasSelectionOrFocus.bindTo(
      this.contextKeyService
    );
    this.hasDoubleSelection = WorkbenchListDoubleSelection.bindTo(
      this.contextKeyService
    );
    this.hasMultiSelection = WorkbenchListMultiSelection.bindTo(
      this.contextKeyService
    );
    this.treeElementCanCollapse = WorkbenchTreeElementCanCollapse.bindTo(
      this.contextKeyService
    );
    this.treeElementHasParent = WorkbenchTreeElementHasParent.bindTo(
      this.contextKeyService
    );
    this.treeElementCanExpand = WorkbenchTreeElementCanExpand.bindTo(
      this.contextKeyService
    );
    this.treeElementHasChild = WorkbenchTreeElementHasChild.bindTo(
      this.contextKeyService
    );
    this.treeFindOpen = WorkbenchTreeFindOpen.bindTo(
      this.contextKeyService
    );
    this.treeStickyScrollFocused = WorkbenchTreeStickyScrollFocused.bindTo(
      this.contextKeyService
    );
    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
    this.updateStyleOverrides(overrideStyles);
    const updateCollapseContextKeys = /* @__PURE__ */ __name(() => {
      const focus = tree.getFocus()[0];
      if (!focus) {
        return;
      }
      const node = tree.getNode(focus);
      this.treeElementCanCollapse.set(
        node.collapsible && !node.collapsed
      );
      this.treeElementHasParent.set(!!tree.getParentElement(focus));
      this.treeElementCanExpand.set(node.collapsible && node.collapsed);
      this.treeElementHasChild.set(!!tree.getFirstElementChild(focus));
    }, "updateCollapseContextKeys");
    const interestingContextKeys = /* @__PURE__ */ new Set();
    interestingContextKeys.add(WorkbenchListTypeNavigationModeKey);
    interestingContextKeys.add(
      WorkbenchListAutomaticKeyboardNavigationLegacyKey
    );
    this.disposables.push(
      this.contextKeyService,
      listService.register(tree),
      tree.onDidChangeSelection(() => {
        const selection = tree.getSelection();
        const focus = tree.getFocus();
        this.contextKeyService.bufferChangeEvents(() => {
          this.hasSelectionOrFocus.set(
            selection.length > 0 || focus.length > 0
          );
          this.hasMultiSelection.set(selection.length > 1);
          this.hasDoubleSelection.set(selection.length === 2);
        });
      }),
      tree.onDidChangeFocus(() => {
        const selection = tree.getSelection();
        const focus = tree.getFocus();
        this.hasSelectionOrFocus.set(
          selection.length > 0 || focus.length > 0
        );
        updateCollapseContextKeys();
      }),
      tree.onDidChangeCollapseState(updateCollapseContextKeys),
      tree.onDidChangeModel(updateCollapseContextKeys),
      tree.onDidChangeFindOpenState(
        (enabled) => this.treeFindOpen.set(enabled)
      ),
      tree.onDidChangeStickyScrollFocused(
        (focused) => this.treeStickyScrollFocused.set(focused)
      ),
      configurationService.onDidChangeConfiguration((e) => {
        let newOptions = {};
        if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
          this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
        }
        if (e.affectsConfiguration(treeIndentKey)) {
          const indent = configurationService.getValue(treeIndentKey);
          newOptions = { ...newOptions, indent };
        }
        if (e.affectsConfiguration(treeRenderIndentGuidesKey) && options.renderIndentGuides === void 0) {
          const renderIndentGuides = configurationService.getValue(
            treeRenderIndentGuidesKey
          );
          newOptions = { ...newOptions, renderIndentGuides };
        }
        if (e.affectsConfiguration(listSmoothScrolling)) {
          const smoothScrolling = Boolean(
            configurationService.getValue(listSmoothScrolling)
          );
          newOptions = { ...newOptions, smoothScrolling };
        }
        if (e.affectsConfiguration(defaultFindModeSettingKey) || e.affectsConfiguration(keyboardNavigationSettingKey)) {
          const defaultFindMode = getDefaultTreeFindMode(configurationService);
          newOptions = { ...newOptions, defaultFindMode };
        }
        if (e.affectsConfiguration(typeNavigationModeSettingKey) || e.affectsConfiguration(keyboardNavigationSettingKey)) {
          const typeNavigationMode = getTypeNavigationMode();
          newOptions = { ...newOptions, typeNavigationMode };
        }
        if (e.affectsConfiguration(defaultFindMatchTypeSettingKey)) {
          const defaultFindMatchType = getDefaultTreeFindMatchType(configurationService);
          newOptions = { ...newOptions, defaultFindMatchType };
        }
        if (e.affectsConfiguration(horizontalScrollingKey) && options.horizontalScrolling === void 0) {
          const horizontalScrolling = Boolean(
            configurationService.getValue(horizontalScrollingKey)
          );
          newOptions = { ...newOptions, horizontalScrolling };
        }
        if (e.affectsConfiguration(scrollByPageKey)) {
          const scrollByPage = Boolean(
            configurationService.getValue(scrollByPageKey)
          );
          newOptions = { ...newOptions, scrollByPage };
        }
        if (e.affectsConfiguration(treeExpandMode) && options.expandOnlyOnTwistieClick === void 0) {
          newOptions = {
            ...newOptions,
            expandOnlyOnTwistieClick: configurationService.getValue(treeExpandMode) === "doubleClick"
          };
        }
        if (e.affectsConfiguration(treeStickyScroll)) {
          const enableStickyScroll = configurationService.getValue(
            treeStickyScroll
          );
          newOptions = { ...newOptions, enableStickyScroll };
        }
        if (e.affectsConfiguration(treeStickyScrollMaxElements)) {
          const stickyScrollMaxItemCount = Math.max(
            1,
            configurationService.getValue(
              treeStickyScrollMaxElements
            )
          );
          newOptions = { ...newOptions, stickyScrollMaxItemCount };
        }
        if (e.affectsConfiguration(mouseWheelScrollSensitivityKey)) {
          const mouseWheelScrollSensitivity = configurationService.getValue(
            mouseWheelScrollSensitivityKey
          );
          newOptions = { ...newOptions, mouseWheelScrollSensitivity };
        }
        if (e.affectsConfiguration(fastScrollSensitivityKey)) {
          const fastScrollSensitivity = configurationService.getValue(
            fastScrollSensitivityKey
          );
          newOptions = { ...newOptions, fastScrollSensitivity };
        }
        if (Object.keys(newOptions).length > 0) {
          tree.updateOptions(newOptions);
        }
      }),
      this.contextKeyService.onDidChangeContext((e) => {
        if (e.affectsSome(interestingContextKeys)) {
          tree.updateOptions({
            typeNavigationMode: getTypeNavigationMode()
          });
        }
      })
    );
    this.navigator = new TreeResourceNavigator(tree, {
      configurationService,
      ...options
    });
    this.disposables.push(this.navigator);
  }
  static {
    __name(this, "WorkbenchTreeInternals");
  }
  contextKeyService;
  listSupportsMultiSelect;
  listSupportFindWidget;
  hasSelectionOrFocus;
  hasDoubleSelection;
  hasMultiSelection;
  treeElementCanCollapse;
  treeElementHasParent;
  treeElementCanExpand;
  treeElementHasChild;
  treeFindOpen;
  treeStickyScrollFocused;
  _useAltAsMultipleSelectionModifier;
  disposables = [];
  navigator;
  get onDidOpen() {
    return this.navigator.onDidOpen;
  }
  get useAltAsMultipleSelectionModifier() {
    return this._useAltAsMultipleSelectionModifier;
  }
  updateOptions(options) {
    if (options.multipleSelectionSupport !== void 0) {
      this.listSupportsMultiSelect.set(
        !!options.multipleSelectionSupport
      );
    }
  }
  updateStyleOverrides(overrideStyles) {
    this.tree.style(
      overrideStyles ? getListStyles(overrideStyles) : defaultListStyles
    );
  }
  dispose() {
    this.disposables = dispose(this.disposables);
  }
};
WorkbenchTreeInternals = __decorateClass([
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IListService),
  __decorateParam(6, IConfigurationService)
], WorkbenchTreeInternals);
const configurationRegistry = Registry.as(
  ConfigurationExtensions.Configuration
);
configurationRegistry.registerConfiguration({
  id: "workbench",
  order: 7,
  title: localize("workbenchConfigurationTitle", "Workbench"),
  type: "object",
  properties: {
    [multiSelectModifierSettingKey]: {
      type: "string",
      enum: ["ctrlCmd", "alt"],
      markdownEnumDescriptions: [
        localize(
          "multiSelectModifier.ctrlCmd",
          "Maps to `Control` on Windows and Linux and to `Command` on macOS."
        ),
        localize(
          "multiSelectModifier.alt",
          "Maps to `Alt` on Windows and Linux and to `Option` on macOS."
        )
      ],
      default: "ctrlCmd",
      description: localize(
        {
          key: "multiSelectModifier",
          comment: [
            "- `ctrlCmd` refers to a value the setting can take and should not be localized.",
            "- `Control` and `Command` refer to the modifier keys Ctrl or Cmd on the keyboard and can be localized."
          ]
        },
        "The modifier to be used to add an item in trees and lists to a multi-selection with the mouse (for example in the explorer, open editors and scm view). The 'Open to Side' mouse gestures - if supported - will adapt such that they do not conflict with the multiselect modifier."
      )
    },
    [openModeSettingKey]: {
      type: "string",
      enum: ["singleClick", "doubleClick"],
      default: "singleClick",
      description: localize(
        {
          key: "openModeModifier",
          comment: [
            "`singleClick` and `doubleClick` refers to a value the setting can take and should not be localized."
          ]
        },
        "Controls how to open items in trees and lists using the mouse (if supported). Note that some trees and lists might choose to ignore this setting if it is not applicable."
      )
    },
    [horizontalScrollingKey]: {
      type: "boolean",
      default: false,
      description: localize(
        "horizontalScrolling setting",
        "Controls whether lists and trees support horizontal scrolling in the workbench. Warning: turning on this setting has a performance implication."
      )
    },
    [scrollByPageKey]: {
      type: "boolean",
      default: false,
      description: localize(
        "list.scrollByPage",
        "Controls whether clicks in the scrollbar scroll page by page."
      )
    },
    [treeIndentKey]: {
      type: "number",
      default: 8,
      minimum: 4,
      maximum: 40,
      description: localize(
        "tree indent setting",
        "Controls tree indentation in pixels."
      )
    },
    [treeRenderIndentGuidesKey]: {
      type: "string",
      enum: ["none", "onHover", "always"],
      default: "onHover",
      description: localize(
        "render tree indent guides",
        "Controls whether the tree should render indent guides."
      )
    },
    [listSmoothScrolling]: {
      type: "boolean",
      default: false,
      description: localize(
        "list smoothScrolling setting",
        "Controls whether lists and trees have smooth scrolling."
      )
    },
    [mouseWheelScrollSensitivityKey]: {
      type: "number",
      default: 1,
      markdownDescription: localize(
        "Mouse Wheel Scroll Sensitivity",
        "A multiplier to be used on the `deltaX` and `deltaY` of mouse wheel scroll events."
      )
    },
    [fastScrollSensitivityKey]: {
      type: "number",
      default: 5,
      markdownDescription: localize(
        "Fast Scroll Sensitivity",
        "Scrolling speed multiplier when pressing `Alt`."
      )
    },
    [defaultFindModeSettingKey]: {
      type: "string",
      enum: ["highlight", "filter"],
      enumDescriptions: [
        localize(
          "defaultFindModeSettingKey.highlight",
          "Highlight elements when searching. Further up and down navigation will traverse only the highlighted elements."
        ),
        localize(
          "defaultFindModeSettingKey.filter",
          "Filter elements when searching."
        )
      ],
      default: "highlight",
      description: localize(
        "defaultFindModeSettingKey",
        "Controls the default find mode for lists and trees in the workbench."
      )
    },
    [keyboardNavigationSettingKey]: {
      type: "string",
      enum: ["simple", "highlight", "filter"],
      enumDescriptions: [
        localize(
          "keyboardNavigationSettingKey.simple",
          "Simple keyboard navigation focuses elements which match the keyboard input. Matching is done only on prefixes."
        ),
        localize(
          "keyboardNavigationSettingKey.highlight",
          "Highlight keyboard navigation highlights elements which match the keyboard input. Further up and down navigation will traverse only the highlighted elements."
        ),
        localize(
          "keyboardNavigationSettingKey.filter",
          "Filter keyboard navigation will filter out and hide all the elements which do not match the keyboard input."
        )
      ],
      default: "highlight",
      description: localize(
        "keyboardNavigationSettingKey",
        "Controls the keyboard navigation style for lists and trees in the workbench. Can be simple, highlight and filter."
      ),
      deprecated: true,
      deprecationMessage: localize(
        "keyboardNavigationSettingKeyDeprecated",
        "Please use 'workbench.list.defaultFindMode' and	'workbench.list.typeNavigationMode' instead."
      )
    },
    [defaultFindMatchTypeSettingKey]: {
      type: "string",
      enum: ["fuzzy", "contiguous"],
      enumDescriptions: [
        localize(
          "defaultFindMatchTypeSettingKey.fuzzy",
          "Use fuzzy matching when searching."
        ),
        localize(
          "defaultFindMatchTypeSettingKey.contiguous",
          "Use contiguous matching when searching."
        )
      ],
      default: "fuzzy",
      description: localize(
        "defaultFindMatchTypeSettingKey",
        "Controls the type of matching used when searching lists and trees in the workbench."
      )
    },
    [treeExpandMode]: {
      type: "string",
      enum: ["singleClick", "doubleClick"],
      default: "singleClick",
      description: localize(
        "expand mode",
        "Controls how tree folders are expanded when clicking the folder names. Note that some trees and lists might choose to ignore this setting if it is not applicable."
      )
    },
    [treeStickyScroll]: {
      type: "boolean",
      default: true,
      description: localize(
        "sticky scroll",
        "Controls whether sticky scrolling is enabled in trees."
      )
    },
    [treeStickyScrollMaxElements]: {
      type: "number",
      minimum: 1,
      default: 7,
      markdownDescription: localize(
        "sticky scroll maximum items",
        "Controls the number of sticky elements displayed in the tree when {0} is enabled.",
        "`#workbench.tree.enableStickyScroll#`"
      )
    },
    [typeNavigationModeSettingKey]: {
      type: "string",
      enum: ["automatic", "trigger"],
      default: "automatic",
      markdownDescription: localize(
        "typeNavigationMode2",
        "Controls how type navigation works in lists and trees in the workbench. When set to `trigger`, type navigation begins once the `list.triggerTypeNavigation` command is run."
      )
    }
  }
});
export {
  IListService,
  ListService,
  RawWorkbenchListFocusContextKey,
  RawWorkbenchListScrollAtBoundaryContextKey,
  WorkbenchAsyncDataTree,
  WorkbenchCompressibleAsyncDataTree,
  WorkbenchCompressibleObjectTree,
  WorkbenchDataTree,
  WorkbenchList,
  WorkbenchListDoubleSelection,
  WorkbenchListFocusContextKey,
  WorkbenchListHasSelectionOrFocus,
  WorkbenchListMultiSelection,
  WorkbenchListScrollAtBottomContextKey,
  WorkbenchListScrollAtTopContextKey,
  WorkbenchListSelectionNavigation,
  WorkbenchListSupportsFind,
  WorkbenchListSupportsMultiSelectContextKey,
  WorkbenchObjectTree,
  WorkbenchPagedList,
  WorkbenchTable,
  WorkbenchTreeElementCanCollapse,
  WorkbenchTreeElementCanExpand,
  WorkbenchTreeElementHasChild,
  WorkbenchTreeElementHasParent,
  WorkbenchTreeFindOpen,
  WorkbenchTreeStickyScrollFocused,
  getSelectionKeyboardEvent
};
//# sourceMappingURL=listService.js.map
