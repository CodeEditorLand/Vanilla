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
import * as dom from "../../../../base/browser/dom.js";
import { findLast } from "../../../../base/common/arraysFind.js";
import { assertNever } from "../../../../base/common/assert.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { memoize } from "../../../../base/common/decorators.js";
import {
  createMatches
} from "../../../../base/common/filters.js";
import { Iterable } from "../../../../base/common/iterator.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable
} from "../../../../base/common/lifecycle.js";
import {
  autorun,
  observableValue
} from "../../../../base/common/observable.js";
import { basenameOrAuthority } from "../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Position } from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
import { localize, localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import {
  EditorOpenSource,
  TextEditorSelectionRevealType
} from "../../../../platform/editor/common/editor.js";
import { FileKind } from "../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { WorkbenchCompressibleObjectTree } from "../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import {
  IQuickInputService
} from "../../../../platform/quickinput/common/quickInput.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import {
  ResourceLabels
} from "../../../browser/labels.js";
import {
  ViewAction,
  ViewPane
} from "../../../browser/parts/views/viewPane.js";
import { IViewDescriptorService } from "../../../common/views.js";
import {
  ACTIVE_GROUP,
  IEditorService,
  SIDE_GROUP
} from "../../../services/editor/common/editorService.js";
import { TestCommandId, Testing } from "../common/constants.js";
import { onObservableChange } from "../common/observableUtils.js";
import {
  BypassedFileCoverage,
  FileCoverage,
  getTotalCoveragePercent
} from "../common/testCoverage.js";
import { ITestCoverageService } from "../common/testCoverageService.js";
import { TestId } from "../common/testId.js";
import {
  DetailType,
  TestResultState
} from "../common/testTypes.js";
import { TestingContextKeys } from "../common/testingContextKeys.js";
import * as coverUtils from "./codeCoverageDisplayUtils.js";
import { testingStatesToIcons, testingWasCovered } from "./icons.js";
import {
  ManagedTestCoverageBars
} from "./testCoverageBars.js";
var CoverageSortOrder = /* @__PURE__ */ ((CoverageSortOrder2) => {
  CoverageSortOrder2[CoverageSortOrder2["Coverage"] = 0] = "Coverage";
  CoverageSortOrder2[CoverageSortOrder2["Location"] = 1] = "Location";
  CoverageSortOrder2[CoverageSortOrder2["Name"] = 2] = "Name";
  return CoverageSortOrder2;
})(CoverageSortOrder || {});
let TestCoverageView = class extends ViewPane {
  constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService, coverageService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
    this.coverageService = coverageService;
  }
  static {
    __name(this, "TestCoverageView");
  }
  tree = new MutableDisposable();
  sortOrder = observableValue(
    "sortOrder",
    1 /* Location */
  );
  renderBody(container) {
    super.renderBody(container);
    const labels = this._register(
      this.instantiationService.createInstance(ResourceLabels, {
        onDidChangeVisibility: this.onDidChangeBodyVisibility
      })
    );
    this._register(
      autorun((reader) => {
        const coverage = this.coverageService.selected.read(reader);
        if (coverage) {
          const t = this.tree.value ??= this.instantiationService.createInstance(
            TestCoverageTree,
            container,
            labels,
            this.sortOrder
          );
          t.setInput(
            coverage,
            this.coverageService.filterToTest.read(reader)
          );
        } else {
          this.tree.clear();
        }
      })
    );
    this._register(
      autorun((reader) => {
        this.element.classList.toggle(
          "coverage-view-is-filtered",
          !!this.coverageService.filterToTest.read(reader)
        );
      })
    );
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.tree.value?.layout(height, width);
  }
};
TestCoverageView = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, IHoverService),
  __decorateParam(11, ITestCoverageService)
], TestCoverageView);
let fnNodeId = 0;
class DeclarationCoverageNode {
  constructor(uri, data, details) {
    this.uri = uri;
    this.data = data;
    if (data.location instanceof Range) {
      for (const detail of details) {
        if (this.contains(detail.location)) {
          this.containedDetails.add(detail);
        }
      }
    }
  }
  static {
    __name(this, "DeclarationCoverageNode");
  }
  id = String(fnNodeId++);
  containedDetails = /* @__PURE__ */ new Set();
  children = [];
  get hits() {
    return this.data.count;
  }
  get label() {
    return this.data.name;
  }
  get location() {
    return this.data.location;
  }
  get tpc() {
    const attr = this.attributableCoverage();
    return attr && getTotalCoveragePercent(attr.statement, attr.branch, void 0);
  }
  /** Gets whether this function has a defined range and contains the given range. */
  contains(location) {
    const own = this.data.location;
    return own instanceof Range && (location instanceof Range ? own.containsRange(location) : own.containsPosition(location));
  }
  attributableCoverage() {
    const { location, count } = this.data;
    if (!(location instanceof Range) || !count) {
      return;
    }
    const statement = { covered: 0, total: 0 };
    const branch = { covered: 0, total: 0 };
    for (const detail of this.containedDetails) {
      if (detail.type !== DetailType.Statement) {
        continue;
      }
      statement.covered += detail.count ? 1 : 0;
      statement.total++;
      if (detail.branches) {
        for (const { count: count2 } of detail.branches) {
          branch.covered += count2 ? 1 : 0;
          branch.total++;
        }
      }
    }
    return { statement, branch };
  }
}
__decorateClass([
  memoize
], DeclarationCoverageNode.prototype, "attributableCoverage", 1);
class RevealUncoveredDeclarations {
  constructor(n) {
    this.n = n;
  }
  static {
    __name(this, "RevealUncoveredDeclarations");
  }
  id = String(fnNodeId++);
  get label() {
    return localize(
      "functionsWithoutCoverage",
      "{0} declarations without coverage...",
      this.n
    );
  }
}
class LoadingDetails {
  static {
    __name(this, "LoadingDetails");
  }
  id = String(fnNodeId++);
  label = localize(
    "loadingCoverageDetails",
    "Loading Coverage Details..."
  );
}
const isFileCoverage = /* @__PURE__ */ __name((c) => typeof c === "object" && "value" in c, "isFileCoverage");
const isDeclarationCoverage = /* @__PURE__ */ __name((c) => c instanceof DeclarationCoverageNode, "isDeclarationCoverage");
const shouldShowDeclDetailsOnExpand = /* @__PURE__ */ __name((c) => isFileCoverage(c) && c.value instanceof FileCoverage && !!c.value.declaration?.total, "shouldShowDeclDetailsOnExpand");
let TestCoverageTree = class extends Disposable {
  static {
    __name(this, "TestCoverageTree");
  }
  tree;
  inputDisposables = this._register(new DisposableStore());
  constructor(container, labels, sortOrder, instantiationService, editorService) {
    super();
    this.tree = instantiationService.createInstance(
      WorkbenchCompressibleObjectTree,
      "TestCoverageView",
      container,
      new TestCoverageTreeListDelegate(),
      [
        instantiationService.createInstance(
          FileCoverageRenderer,
          labels
        ),
        instantiationService.createInstance(
          DeclarationCoverageRenderer
        ),
        instantiationService.createInstance(BasicRenderer)
      ],
      {
        expandOnlyOnTwistieClick: true,
        sorter: new Sorter(sortOrder),
        keyboardNavigationLabelProvider: {
          getCompressedNodeKeyboardNavigationLabel(elements) {
            return elements.map((e) => this.getKeyboardNavigationLabel(e)).join("/");
          },
          getKeyboardNavigationLabel(e) {
            return isFileCoverage(e) ? basenameOrAuthority(e.value.uri) : e.label;
          }
        },
        accessibilityProvider: {
          getAriaLabel(element) {
            if (isFileCoverage(element)) {
              const name = basenameOrAuthority(
                element.value.uri
              );
              return localize(
                "testCoverageItemLabel",
                "{0} coverage: {0}%",
                name,
                (element.value.tpc * 100).toFixed(2)
              );
            } else {
              return element.label;
            }
          },
          getWidgetAriaLabel() {
            return localize(
              "testCoverageTreeLabel",
              "Test Coverage Explorer"
            );
          }
        },
        identityProvider: new TestCoverageIdentityProvider()
      }
    );
    this._register(
      autorun((reader) => {
        sortOrder.read(reader);
        this.tree.resort(null, true);
      })
    );
    this._register(this.tree);
    this._register(
      this.tree.onDidChangeCollapseState((e) => {
        const el = e.node.element;
        if (!e.node.collapsed && !e.node.children.length && el && shouldShowDeclDetailsOnExpand(el)) {
          if (el.value.hasSynchronousDetails) {
            this.tree.setChildren(el, [
              {
                element: new LoadingDetails(),
                incompressible: true
              }
            ]);
          }
          el.value.details().then(
            (details) => this.updateWithDetails(el, details)
          );
        }
      })
    );
    this._register(
      this.tree.onDidOpen((e) => {
        let resource;
        let selection;
        if (e.element) {
          if (isFileCoverage(e.element) && !e.element.children?.size) {
            resource = e.element.value.uri;
          } else if (isDeclarationCoverage(e.element)) {
            resource = e.element.uri;
            selection = e.element.location;
          }
        }
        if (!resource) {
          return;
        }
        editorService.openEditor(
          {
            resource,
            options: {
              selection: selection instanceof Position ? Range.fromPositions(selection, selection) : selection,
              revealIfOpened: true,
              selectionRevealType: TextEditorSelectionRevealType.NearTopIfOutsideViewport,
              preserveFocus: e.editorOptions.preserveFocus,
              pinned: e.editorOptions.pinned,
              source: EditorOpenSource.USER
            }
          },
          e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP
        );
      })
    );
  }
  setInput(coverage, showOnlyTest) {
    this.inputDisposables.clear();
    let tree = coverage.tree;
    if (showOnlyTest) {
      tree = coverage.filterTreeForTest(showOnlyTest);
    }
    const files = [];
    for (let node of tree.nodes) {
      while (!(node.value instanceof FileCoverage) && node.children?.size === 1) {
        node = Iterable.first(node.children.values());
      }
      files.push(node);
    }
    const toChild = /* @__PURE__ */ __name((value) => {
      const isFile = !value.children?.size;
      return {
        element: value,
        incompressible: isFile,
        collapsed: isFile,
        // directories can be expanded, and items with function info can be expanded
        collapsible: !isFile || !!value.value?.declaration?.total,
        children: value.children && Iterable.map(value.children?.values(), toChild)
      };
    }, "toChild");
    this.inputDisposables.add(
      onObservableChange(coverage.didAddCoverage, (nodes) => {
        const toRender = findLast(
          nodes,
          (n) => this.tree.hasElement(n)
        );
        if (toRender) {
          this.tree.setChildren(
            toRender,
            Iterable.map(
              toRender.children?.values() || [],
              toChild
            ),
            {
              diffIdentityProvider: {
                getId: /* @__PURE__ */ __name((el) => el.value.id, "getId")
              }
            }
          );
        }
      })
    );
    this.tree.setChildren(null, Iterable.map(files, toChild));
  }
  layout(height, width) {
    this.tree.layout(height, width);
  }
  updateWithDetails(el, details) {
    if (!this.tree.hasElement(el)) {
      return;
    }
    const decl = [];
    for (const fn of details) {
      if (fn.type !== DetailType.Declaration) {
        continue;
      }
      let arr = decl;
      while (true) {
        const parent = arr.find((p) => p.containedDetails.has(fn));
        if (parent) {
          arr = parent.children;
        } else {
          break;
        }
      }
      arr.push(new DeclarationCoverageNode(el.value.uri, fn, details));
    }
    const makeChild = /* @__PURE__ */ __name((fn) => ({
      element: fn,
      incompressible: true,
      collapsed: true,
      collapsible: fn.children.length > 0,
      children: fn.children.map(makeChild)
    }), "makeChild");
    this.tree.setChildren(el, decl.map(makeChild));
  }
};
TestCoverageTree = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IEditorService)
], TestCoverageTree);
class TestCoverageTreeListDelegate {
  static {
    __name(this, "TestCoverageTreeListDelegate");
  }
  getHeight(element) {
    return 22;
  }
  getTemplateId(element) {
    if (isFileCoverage(element)) {
      return FileCoverageRenderer.ID;
    }
    if (isDeclarationCoverage(element)) {
      return DeclarationCoverageRenderer.ID;
    }
    if (element instanceof LoadingDetails || element instanceof RevealUncoveredDeclarations) {
      return BasicRenderer.ID;
    }
    assertNever(element);
  }
}
class Sorter {
  constructor(order) {
    this.order = order;
  }
  static {
    __name(this, "Sorter");
  }
  compare(a, b) {
    const order = this.order.get();
    if (isFileCoverage(a) && isFileCoverage(b)) {
      switch (order) {
        case 1 /* Location */:
        case 2 /* Name */:
          return a.value.uri.toString().localeCompare(b.value.uri.toString());
        case 0 /* Coverage */:
          return b.value.tpc - a.value.tpc;
      }
    } else if (isDeclarationCoverage(a) && isDeclarationCoverage(b)) {
      switch (order) {
        case 1 /* Location */:
          return Position.compare(
            a.location instanceof Range ? a.location.getStartPosition() : a.location,
            b.location instanceof Range ? b.location.getStartPosition() : b.location
          );
        case 2 /* Name */:
          return a.label.localeCompare(b.label);
        case 0 /* Coverage */: {
          const attrA = a.tpc;
          const attrB = b.tpc;
          return attrA !== void 0 && attrB !== void 0 && attrB - attrA || +b.hits - +a.hits || a.label.localeCompare(b.label);
        }
      }
    } else {
      return 0;
    }
  }
}
let FileCoverageRenderer = class {
  constructor(labels, labelService, instantiationService) {
    this.labels = labels;
    this.labelService = labelService;
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "FileCoverageRenderer");
  }
  static ID = "F";
  templateId = FileCoverageRenderer.ID;
  /** @inheritdoc */
  renderTemplate(container) {
    const templateDisposables = new DisposableStore();
    container.classList.add("test-coverage-list-item");
    return {
      container,
      bars: templateDisposables.add(
        this.instantiationService.createInstance(
          ManagedTestCoverageBars,
          { compact: false, container }
        )
      ),
      label: templateDisposables.add(
        this.labels.create(container, {
          supportHighlights: true
        })
      ),
      elementsDisposables: templateDisposables.add(new DisposableStore()),
      templateDisposables
    };
  }
  /** @inheritdoc */
  renderElement(node, _index, templateData) {
    this.doRender(
      node.element,
      templateData,
      node.filterData
    );
  }
  /** @inheritdoc */
  renderCompressedElements(node, _index, templateData) {
    this.doRender(node.element.elements, templateData, node.filterData);
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
  /** @inheritdoc */
  doRender(element, templateData, filterData) {
    templateData.elementsDisposables.clear();
    const stat = element instanceof Array ? element[element.length - 1] : element;
    const file = stat.value;
    const name = element instanceof Array ? element.map(
      (e) => basenameOrAuthority(
        e.value.uri
      )
    ) : basenameOrAuthority(file.uri);
    if (file instanceof BypassedFileCoverage) {
      templateData.bars.setCoverageInfo(void 0);
    } else {
      templateData.elementsDisposables.add(
        autorun((reader) => {
          stat.value?.didChange.read(reader);
          templateData.bars.setCoverageInfo(file);
        })
      );
      templateData.bars.setCoverageInfo(file);
    }
    templateData.label.setResource(
      { resource: file.uri, name },
      {
        fileKind: stat.children?.size ? FileKind.FOLDER : FileKind.FILE,
        matches: createMatches(filterData),
        separator: this.labelService.getSeparator(
          file.uri.scheme,
          file.uri.authority
        ),
        extraClasses: ["test-coverage-list-item-label"]
      }
    );
  }
};
FileCoverageRenderer = __decorateClass([
  __decorateParam(1, ILabelService),
  __decorateParam(2, IInstantiationService)
], FileCoverageRenderer);
let DeclarationCoverageRenderer = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "DeclarationCoverageRenderer");
  }
  static ID = "N";
  templateId = DeclarationCoverageRenderer.ID;
  /** @inheritdoc */
  renderTemplate(container) {
    const templateDisposables = new DisposableStore();
    container.classList.add("test-coverage-list-item");
    const icon = dom.append(container, dom.$(".state"));
    const label = dom.append(container, dom.$(".name"));
    return {
      container,
      bars: templateDisposables.add(
        this.instantiationService.createInstance(
          ManagedTestCoverageBars,
          { compact: false, container }
        )
      ),
      templateDisposables,
      icon,
      label
    };
  }
  /** @inheritdoc */
  renderElement(node, _index, templateData) {
    this.doRender(
      node.element,
      templateData,
      node.filterData
    );
  }
  /** @inheritdoc */
  renderCompressedElements(node, _index, templateData) {
    this.doRender(
      node.element.elements[node.element.elements.length - 1],
      templateData,
      node.filterData
    );
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
  /** @inheritdoc */
  doRender(element, templateData, _filterData) {
    const covered = !!element.hits;
    const icon = covered ? testingWasCovered : testingStatesToIcons.get(TestResultState.Unset);
    templateData.container.classList.toggle("not-covered", !covered);
    templateData.icon.className = `computed-state ${ThemeIcon.asClassName(icon)}`;
    templateData.label.innerText = element.label;
    templateData.bars.setCoverageInfo(element.attributableCoverage());
  }
};
DeclarationCoverageRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], DeclarationCoverageRenderer);
class BasicRenderer {
  static {
    __name(this, "BasicRenderer");
  }
  static ID = "B";
  templateId = BasicRenderer.ID;
  renderCompressedElements(node, _index, container) {
    this.renderInner(
      node.element.elements[node.element.elements.length - 1],
      container
    );
  }
  renderTemplate(container) {
    return container;
  }
  renderElement(node, index, container) {
    this.renderInner(node.element, container);
  }
  disposeTemplate() {
  }
  renderInner(element, container) {
    container.innerText = element.label;
  }
}
class TestCoverageIdentityProvider {
  static {
    __name(this, "TestCoverageIdentityProvider");
  }
  getId(element) {
    return isFileCoverage(element) ? element.value.uri.toString() : element.id;
  }
}
registerAction2(
  class TestCoverageChangePerTestFilterAction extends Action2 {
    static {
      __name(this, "TestCoverageChangePerTestFilterAction");
    }
    constructor() {
      super({
        id: TestCommandId.CoverageFilterToTest,
        category: Categories.Test,
        title: localize2(
          "testing.changeCoverageFilter",
          "Filter Coverage by Test"
        ),
        icon: Codicon.filter,
        toggled: {
          icon: Codicon.filterFilled,
          condition: TestingContextKeys.isCoverageFilteredToTest
        },
        menu: [
          {
            id: MenuId.CommandPalette,
            when: TestingContextKeys.hasPerTestCoverage
          },
          {
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.and(
              TestingContextKeys.hasPerTestCoverage,
              ContextKeyExpr.equals(
                "view",
                Testing.CoverageViewId
              )
            ),
            group: "navigation"
          }
        ]
      });
    }
    run(accessor) {
      const coverageService = accessor.get(ITestCoverageService);
      const quickInputService = accessor.get(IQuickInputService);
      const coverage = coverageService.selected.get();
      if (!coverage) {
        return;
      }
      const tests = [...coverage.allPerTestIDs()].map(TestId.fromString);
      const commonPrefix = TestId.getLengthOfCommonPrefix(
        tests.length,
        (i) => tests[i]
      );
      const result = coverage.result;
      const previousSelection = coverageService.filterToTest.get();
      const previousSelectionStr = previousSelection?.toString();
      const items = [
        { label: coverUtils.labels.allTests, id: void 0 },
        { type: "separator" },
        ...tests.map((testId) => ({
          label: coverUtils.getLabelForItem(
            result,
            testId,
            commonPrefix
          ),
          testId
        }))
      ];
      quickInputService.pick(items, {
        activeItem: items.find(
          (item) => "testId" in item && item.testId?.toString() === previousSelectionStr
        ),
        placeHolder: coverUtils.labels.pickShowCoverage,
        onDidFocus: /* @__PURE__ */ __name((entry) => {
          coverageService.filterToTest.set(
            entry.testId,
            void 0
          );
        }, "onDidFocus")
      }).then((selected) => {
        coverageService.filterToTest.set(
          selected ? selected.testId : previousSelection,
          void 0
        );
      });
    }
  }
);
registerAction2(
  class TestCoverageChangeSortingAction extends ViewAction {
    static {
      __name(this, "TestCoverageChangeSortingAction");
    }
    constructor() {
      super({
        id: TestCommandId.CoverageViewChangeSorting,
        viewId: Testing.CoverageViewId,
        title: localize2(
          "testing.changeCoverageSort",
          "Change Sort Order"
        ),
        icon: Codicon.sortPrecedence,
        menu: {
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.equals("view", Testing.CoverageViewId),
          group: "navigation"
        }
      });
    }
    runInView(accessor, view) {
      const disposables = new DisposableStore();
      const quickInput = disposables.add(
        accessor.get(IQuickInputService).createQuickPick()
      );
      const items = [
        {
          label: localize(
            "testing.coverageSortByLocation",
            "Sort by Location"
          ),
          value: 1 /* Location */,
          description: localize(
            "testing.coverageSortByLocationDescription",
            "Files are sorted alphabetically, declarations are sorted by position"
          )
        },
        {
          label: localize(
            "testing.coverageSortByCoverage",
            "Sort by Coverage"
          ),
          value: 0 /* Coverage */,
          description: localize(
            "testing.coverageSortByCoverageDescription",
            "Files and declarations are sorted by total coverage"
          )
        },
        {
          label: localize(
            "testing.coverageSortByName",
            "Sort by Name"
          ),
          value: 2 /* Name */,
          description: localize(
            "testing.coverageSortByNameDescription",
            "Files and declarations are sorted alphabetically"
          )
        }
      ];
      quickInput.placeholder = localize(
        "testing.coverageSortPlaceholder",
        "Sort the Test Coverage view..."
      );
      quickInput.items = items;
      quickInput.show();
      disposables.add(quickInput.onDidHide(() => disposables.dispose()));
      disposables.add(
        quickInput.onDidAccept(() => {
          const picked = quickInput.selectedItems[0]?.value;
          if (picked !== void 0) {
            view.sortOrder.set(picked, void 0);
            quickInput.dispose();
          }
        })
      );
    }
  }
);
export {
  TestCoverageView
};
//# sourceMappingURL=testCoverageView.js.map
