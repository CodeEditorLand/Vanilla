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
  TreeVisibility
} from "../../../../base/browser/ui/tree/tree.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import {
  createMatches
} from "../../../../base/common/filters.js";
import {
  normalizeDriveLetter,
  tildify
} from "../../../../base/common/labels.js";
import { dispose } from "../../../../base/common/lifecycle.js";
import { isAbsolute, normalize, posix } from "../../../../base/common/path.js";
import { isWindows } from "../../../../base/common/platform.js";
import { ltrim } from "../../../../base/common/strings.js";
import { URI } from "../../../../base/common/uri.js";
import * as nls from "../../../../nls.js";
import {
  MenuId,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { FileKind } from "../../../../platform/files/common/files.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { WorkbenchCompressibleObjectTree } from "../../../../platform/list/browser/listService.js";
import {
  IWorkspaceContextService
} from "../../../../platform/workspace/common/workspace.js";
import {
  ResourceLabels
} from "../../../browser/labels.js";
import { ViewAction, ViewPane } from "../../../browser/parts/views/viewPane.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import {
  CONTEXT_LOADED_SCRIPTS_ITEM_TYPE,
  IDebugService,
  LOADED_SCRIPTS_VIEW_ID
} from "../common/debug.js";
import { DebugContentProvider } from "../common/debugContentProvider.js";
import { renderViewTree } from "./baseDebugView.js";
import { TreeFindMode } from "../../../../base/browser/ui/tree/abstractTree.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IPathService } from "../../../services/path/common/pathService.js";
const NEW_STYLE_COMPRESS = true;
const URI_SCHEMA_PATTERN = /^[a-zA-Z][a-zA-Z0-9+\-.]+:/;
class BaseTreeItem {
  constructor(_parent, _label, isIncompressible = false) {
    this._parent = _parent;
    this._label = _label;
    this.isIncompressible = isIncompressible;
    this._showedMoreThanOne = false;
  }
  static {
    __name(this, "BaseTreeItem");
  }
  _showedMoreThanOne;
  _children = /* @__PURE__ */ new Map();
  _source;
  updateLabel(label) {
    this._label = label;
  }
  isLeaf() {
    return this._children.size === 0;
  }
  getSession() {
    if (this._parent) {
      return this._parent.getSession();
    }
    return void 0;
  }
  setSource(session, source) {
    this._source = source;
    this._children.clear();
    if (source.raw && source.raw.sources) {
      for (const src of source.raw.sources) {
        if (src.name && src.path) {
          const s = new BaseTreeItem(this, src.name);
          this._children.set(src.path, s);
          const ss = session.getSource(src);
          s.setSource(session, ss);
        }
      }
    }
  }
  createIfNeeded(key, factory) {
    let child = this._children.get(key);
    if (!child) {
      child = factory(this, key);
      this._children.set(key, child);
    }
    return child;
  }
  getChild(key) {
    return this._children.get(key);
  }
  remove(key) {
    this._children.delete(key);
  }
  removeFromParent() {
    if (this._parent) {
      this._parent.remove(this._label);
      if (this._parent._children.size === 0) {
        this._parent.removeFromParent();
      }
    }
  }
  getTemplateId() {
    return "id";
  }
  // a dynamic ID based on the parent chain; required for reparenting (see #55448)
  getId() {
    const parent = this.getParent();
    return parent ? `${parent.getId()}/${this.getInternalId()}` : this.getInternalId();
  }
  getInternalId() {
    return this._label;
  }
  // skips intermediate single-child nodes
  getParent() {
    if (this._parent) {
      if (this._parent.isSkipped()) {
        return this._parent.getParent();
      }
      return this._parent;
    }
    return void 0;
  }
  isSkipped() {
    if (this._parent) {
      if (this._parent.oneChild()) {
        return true;
      }
      return false;
    }
    return true;
  }
  // skips intermediate single-child nodes
  hasChildren() {
    const child = this.oneChild();
    if (child) {
      return child.hasChildren();
    }
    return this._children.size > 0;
  }
  // skips intermediate single-child nodes
  getChildren() {
    const child = this.oneChild();
    if (child) {
      return child.getChildren();
    }
    const array = [];
    for (const child2 of this._children.values()) {
      array.push(child2);
    }
    return array.sort((a, b) => this.compare(a, b));
  }
  // skips intermediate single-child nodes
  getLabel(separateRootFolder = true) {
    const child = this.oneChild();
    if (child) {
      const sep = this instanceof RootFolderTreeItem && separateRootFolder ? " \u2022 " : posix.sep;
      return `${this._label}${sep}${child.getLabel()}`;
    }
    return this._label;
  }
  // skips intermediate single-child nodes
  getHoverLabel() {
    if (this._source && this._parent && this._parent._source) {
      return this._source.raw.path || this._source.raw.name;
    }
    const label = this.getLabel(false);
    const parent = this.getParent();
    if (parent) {
      const hover = parent.getHoverLabel();
      if (hover) {
        return `${hover}/${label}`;
      }
    }
    return label;
  }
  // skips intermediate single-child nodes
  getSource() {
    const child = this.oneChild();
    if (child) {
      return child.getSource();
    }
    return this._source;
  }
  compare(a, b) {
    if (a._label && b._label) {
      return a._label.localeCompare(b._label);
    }
    return 0;
  }
  oneChild() {
    if (!this._source && !this._showedMoreThanOne && this.skipOneChild()) {
      if (this._children.size === 1) {
        return this._children.values().next().value;
      }
      if (this._children.size > 1) {
        this._showedMoreThanOne = true;
      }
    }
    return void 0;
  }
  skipOneChild() {
    if (NEW_STYLE_COMPRESS) {
      return this instanceof RootTreeItem;
    } else {
      return !(this instanceof RootFolderTreeItem) && !(this instanceof SessionTreeItem);
    }
  }
}
class RootFolderTreeItem extends BaseTreeItem {
  constructor(parent, folder) {
    super(parent, folder.name, true);
    this.folder = folder;
  }
  static {
    __name(this, "RootFolderTreeItem");
  }
}
class RootTreeItem extends BaseTreeItem {
  constructor(_pathService, _contextService, _labelService) {
    super(void 0, "Root");
    this._pathService = _pathService;
    this._contextService = _contextService;
    this._labelService = _labelService;
  }
  static {
    __name(this, "RootTreeItem");
  }
  add(session) {
    return this.createIfNeeded(
      session.getId(),
      () => new SessionTreeItem(
        this._labelService,
        this,
        session,
        this._pathService,
        this._contextService
      )
    );
  }
  find(session) {
    return this.getChild(session.getId());
  }
}
class SessionTreeItem extends BaseTreeItem {
  constructor(labelService, parent, session, _pathService, rootProvider) {
    super(parent, session.getLabel(), true);
    this._pathService = _pathService;
    this.rootProvider = rootProvider;
    this._labelService = labelService;
    this._session = session;
  }
  static {
    __name(this, "SessionTreeItem");
  }
  static URL_REGEXP = /^(https?:\/\/[^/]+)(\/.*)$/;
  _session;
  _map = /* @__PURE__ */ new Map();
  _labelService;
  getInternalId() {
    return this._session.getId();
  }
  getSession() {
    return this._session;
  }
  getHoverLabel() {
    return void 0;
  }
  hasChildren() {
    return true;
  }
  compare(a, b) {
    const acat = this.category(a);
    const bcat = this.category(b);
    if (acat !== bcat) {
      return acat - bcat;
    }
    return super.compare(a, b);
  }
  category(item) {
    if (item instanceof RootFolderTreeItem) {
      return item.folder.index;
    }
    const l = item.getLabel();
    if (l && /^<.+>$/.test(l)) {
      return 1e3;
    }
    return 999;
  }
  async addPath(source) {
    let folder;
    let url;
    let path = source.raw.path;
    if (!path) {
      return;
    }
    if (this._labelService && URI_SCHEMA_PATTERN.test(path)) {
      path = this._labelService.getUriLabel(URI.parse(path));
    }
    const match = SessionTreeItem.URL_REGEXP.exec(path);
    if (match && match.length === 3) {
      url = match[1];
      path = decodeURI(match[2]);
    } else if (isAbsolute(path)) {
      const resource = URI.file(path);
      folder = this.rootProvider ? this.rootProvider.getWorkspaceFolder(resource) : null;
      if (folder) {
        path = normalize(
          ltrim(
            resource.path.substring(folder.uri.path.length),
            posix.sep
          )
        );
        const hasMultipleRoots = this.rootProvider.getWorkspace().folders.length > 1;
        if (hasMultipleRoots) {
          path = posix.sep + path;
        } else {
          folder = null;
        }
      } else {
        path = normalize(path);
        if (isWindows) {
          path = normalizeDriveLetter(path);
        } else {
          path = tildify(
            path,
            (await this._pathService.userHome()).fsPath
          );
        }
      }
    }
    let leaf = this;
    path.split(/[/\\]/).forEach((segment, i) => {
      if (i === 0 && folder) {
        const f = folder;
        leaf = leaf.createIfNeeded(
          folder.name,
          (parent) => new RootFolderTreeItem(parent, f)
        );
      } else if (i === 0 && url) {
        leaf = leaf.createIfNeeded(
          url,
          (parent) => new BaseTreeItem(parent, url)
        );
      } else {
        leaf = leaf.createIfNeeded(
          segment,
          (parent) => new BaseTreeItem(parent, segment)
        );
      }
    });
    leaf.setSource(this._session, source);
    if (source.raw.path) {
      this._map.set(source.raw.path, leaf);
    }
  }
  removePath(source) {
    if (source.raw.path) {
      const leaf = this._map.get(source.raw.path);
      if (leaf) {
        leaf.removeFromParent();
        return true;
      }
    }
    return false;
  }
}
function asTreeElement(item, viewState) {
  const children = item.getChildren();
  const collapsed = viewState ? !viewState.expanded.has(item.getId()) : !(item instanceof SessionTreeItem);
  return {
    element: item,
    collapsed,
    collapsible: item.hasChildren(),
    children: children.map((i) => asTreeElement(i, viewState))
  };
}
__name(asTreeElement, "asTreeElement");
let LoadedScriptsView = class extends ViewPane {
  constructor(options, contextMenuService, keybindingService, instantiationService, viewDescriptorService, configurationService, editorService, contextKeyService, contextService, debugService, labelService, pathService, openerService, themeService, telemetryService, hoverService) {
    super(
      options,
      keybindingService,
      contextMenuService,
      configurationService,
      contextKeyService,
      viewDescriptorService,
      instantiationService,
      openerService,
      themeService,
      telemetryService,
      hoverService
    );
    this.editorService = editorService;
    this.contextService = contextService;
    this.debugService = debugService;
    this.labelService = labelService;
    this.pathService = pathService;
    this.loadedScriptsItemType = CONTEXT_LOADED_SCRIPTS_ITEM_TYPE.bindTo(contextKeyService);
  }
  static {
    __name(this, "LoadedScriptsView");
  }
  treeContainer;
  loadedScriptsItemType;
  tree;
  treeLabels;
  changeScheduler;
  treeNeedsRefreshOnVisible = false;
  filter;
  renderBody(container) {
    super.renderBody(container);
    this.element.classList.add("debug-pane");
    container.classList.add("debug-loaded-scripts");
    container.classList.add("show-file-icons");
    this.treeContainer = renderViewTree(container);
    this.filter = new LoadedScriptsFilter();
    const root = new RootTreeItem(
      this.pathService,
      this.contextService,
      this.labelService
    );
    this.treeLabels = this.instantiationService.createInstance(
      ResourceLabels,
      { onDidChangeVisibility: this.onDidChangeBodyVisibility }
    );
    this._register(this.treeLabels);
    this.tree = this.instantiationService.createInstance(
      WorkbenchCompressibleObjectTree,
      "LoadedScriptsView",
      this.treeContainer,
      new LoadedScriptsDelegate(),
      [new LoadedScriptsRenderer(this.treeLabels)],
      {
        compressionEnabled: NEW_STYLE_COMPRESS,
        collapseByDefault: true,
        hideTwistiesOfChildlessElements: true,
        identityProvider: {
          getId: /* @__PURE__ */ __name((element) => element.getId(), "getId")
        },
        keyboardNavigationLabelProvider: {
          getKeyboardNavigationLabel: /* @__PURE__ */ __name((element) => {
            return element.getLabel();
          }, "getKeyboardNavigationLabel"),
          getCompressedNodeKeyboardNavigationLabel: /* @__PURE__ */ __name((elements) => {
            return elements.map((e) => e.getLabel()).join("/");
          }, "getCompressedNodeKeyboardNavigationLabel")
        },
        filter: this.filter,
        accessibilityProvider: new LoadedSciptsAccessibilityProvider(),
        overrideStyles: this.getLocationBasedColors().listOverrideStyles
      }
    );
    const updateView = /* @__PURE__ */ __name((viewState2) => this.tree.setChildren(
      null,
      asTreeElement(root, viewState2).children
    ), "updateView");
    updateView();
    this.changeScheduler = new RunOnceScheduler(() => {
      this.treeNeedsRefreshOnVisible = false;
      if (this.tree) {
        updateView();
      }
    }, 300);
    this._register(this.changeScheduler);
    this._register(
      this.tree.onDidOpen((e) => {
        if (e.element instanceof BaseTreeItem) {
          const source = e.element.getSource();
          if (source && source.available) {
            const nullRange = {
              startLineNumber: 0,
              startColumn: 0,
              endLineNumber: 0,
              endColumn: 0
            };
            source.openInEditor(
              this.editorService,
              nullRange,
              e.editorOptions.preserveFocus,
              e.sideBySide,
              e.editorOptions.pinned
            );
          }
        }
      })
    );
    this._register(
      this.tree.onDidChangeFocus(() => {
        const focus = this.tree.getFocus();
        if (focus instanceof SessionTreeItem) {
          this.loadedScriptsItemType.set("session");
        } else {
          this.loadedScriptsItemType.reset();
        }
      })
    );
    const scheduleRefreshOnVisible = /* @__PURE__ */ __name(() => {
      if (this.isBodyVisible()) {
        this.changeScheduler.schedule();
      } else {
        this.treeNeedsRefreshOnVisible = true;
      }
    }, "scheduleRefreshOnVisible");
    const addSourcePathsToSession = /* @__PURE__ */ __name(async (session) => {
      if (session.capabilities.supportsLoadedSourcesRequest) {
        const sessionNode = root.add(session);
        const paths = await session.getLoadedSources();
        for (const path of paths) {
          await sessionNode.addPath(path);
        }
        scheduleRefreshOnVisible();
      }
    }, "addSourcePathsToSession");
    const registerSessionListeners = /* @__PURE__ */ __name((session) => {
      this._register(
        session.onDidChangeName(async () => {
          const sessionRoot = root.find(session);
          if (sessionRoot) {
            sessionRoot.updateLabel(session.getLabel());
            scheduleRefreshOnVisible();
          }
        })
      );
      this._register(
        session.onDidLoadedSource(async (event) => {
          let sessionRoot;
          switch (event.reason) {
            case "new":
            case "changed":
              sessionRoot = root.add(session);
              await sessionRoot.addPath(event.source);
              scheduleRefreshOnVisible();
              if (event.reason === "changed") {
                DebugContentProvider.refreshDebugContent(
                  event.source.uri
                );
              }
              break;
            case "removed":
              sessionRoot = root.find(session);
              if (sessionRoot && sessionRoot.removePath(event.source)) {
                scheduleRefreshOnVisible();
              }
              break;
            default:
              this.filter.setFilter(event.source.name);
              this.tree.refilter();
              break;
          }
        })
      );
    }, "registerSessionListeners");
    this._register(
      this.debugService.onDidNewSession(registerSessionListeners)
    );
    this.debugService.getModel().getSessions().forEach(registerSessionListeners);
    this._register(
      this.debugService.onDidEndSession(({ session }) => {
        root.remove(session.getId());
        this.changeScheduler.schedule();
      })
    );
    this.changeScheduler.schedule(0);
    this._register(
      this.onDidChangeBodyVisibility((visible) => {
        if (visible && this.treeNeedsRefreshOnVisible) {
          this.changeScheduler.schedule();
        }
      })
    );
    let viewState;
    this._register(
      this.tree.onDidChangeFindPattern((pattern) => {
        if (this.tree.findMode === TreeFindMode.Highlight) {
          return;
        }
        if (!viewState && pattern) {
          const expanded = /* @__PURE__ */ new Set();
          const visit = /* @__PURE__ */ __name((node) => {
            if (node.element && !node.collapsed) {
              expanded.add(node.element.getId());
            }
            for (const child of node.children) {
              visit(child);
            }
          }, "visit");
          visit(this.tree.getNode());
          viewState = { expanded };
          this.tree.expandAll();
        } else if (!pattern && viewState) {
          this.tree.setFocus([]);
          updateView(viewState);
          viewState = void 0;
        }
      })
    );
    this.debugService.getModel().getSessions().forEach((session) => addSourcePathsToSession(session));
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.tree.layout(height, width);
  }
  collapseAll() {
    this.tree.collapseAll();
  }
  dispose() {
    dispose(this.tree);
    dispose(this.treeLabels);
    super.dispose();
  }
};
LoadedScriptsView = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IViewDescriptorService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, IDebugService),
  __decorateParam(10, ILabelService),
  __decorateParam(11, IPathService),
  __decorateParam(12, IOpenerService),
  __decorateParam(13, IThemeService),
  __decorateParam(14, ITelemetryService),
  __decorateParam(15, IHoverService)
], LoadedScriptsView);
class LoadedScriptsDelegate {
  static {
    __name(this, "LoadedScriptsDelegate");
  }
  getHeight(element) {
    return 22;
  }
  getTemplateId(element) {
    return LoadedScriptsRenderer.ID;
  }
}
class LoadedScriptsRenderer {
  constructor(labels) {
    this.labels = labels;
  }
  static {
    __name(this, "LoadedScriptsRenderer");
  }
  static ID = "lsrenderer";
  get templateId() {
    return LoadedScriptsRenderer.ID;
  }
  renderTemplate(container) {
    const label = this.labels.create(container, {
      supportHighlights: true
    });
    return { label };
  }
  renderElement(node, index, data) {
    const element = node.element;
    const label = element.getLabel();
    this.render(element, label, data, node.filterData);
  }
  renderCompressedElements(node, index, data, height) {
    const element = node.element.elements[node.element.elements.length - 1];
    const labels = node.element.elements.map((e) => e.getLabel());
    this.render(element, labels, data, node.filterData);
  }
  render(element, labels, data, filterData) {
    const label = {
      name: labels
    };
    const options = {
      title: element.getHoverLabel()
    };
    if (element instanceof RootFolderTreeItem) {
      options.fileKind = FileKind.ROOT_FOLDER;
    } else if (element instanceof SessionTreeItem) {
      options.title = nls.localize(
        "loadedScriptsSession",
        "Debug Session"
      );
      options.hideIcon = true;
    } else if (element instanceof BaseTreeItem) {
      const src = element.getSource();
      if (src && src.uri) {
        label.resource = src.uri;
        options.fileKind = FileKind.FILE;
      } else {
        options.fileKind = FileKind.FOLDER;
      }
    }
    options.matches = createMatches(filterData);
    data.label.setResource(label, options);
  }
  disposeTemplate(templateData) {
    templateData.label.dispose();
  }
}
class LoadedSciptsAccessibilityProvider {
  static {
    __name(this, "LoadedSciptsAccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return nls.localize(
      {
        comment: ["Debug is a noun in this context, not a verb."],
        key: "loadedScriptsAriaLabel"
      },
      "Debug Loaded Scripts"
    );
  }
  getAriaLabel(element) {
    if (element instanceof RootFolderTreeItem) {
      return nls.localize(
        "loadedScriptsRootFolderAriaLabel",
        "Workspace folder {0}, loaded script, debug",
        element.getLabel()
      );
    }
    if (element instanceof SessionTreeItem) {
      return nls.localize(
        "loadedScriptsSessionAriaLabel",
        "Session {0}, loaded script, debug",
        element.getLabel()
      );
    }
    if (element.hasChildren()) {
      return nls.localize(
        "loadedScriptsFolderAriaLabel",
        "Folder {0}, loaded script, debug",
        element.getLabel()
      );
    } else {
      return nls.localize(
        "loadedScriptsSourceAriaLabel",
        "{0}, loaded script, debug",
        element.getLabel()
      );
    }
  }
}
class LoadedScriptsFilter {
  static {
    __name(this, "LoadedScriptsFilter");
  }
  filterText;
  setFilter(filterText) {
    this.filterText = filterText;
  }
  filter(element, parentVisibility) {
    if (!this.filterText) {
      return TreeVisibility.Visible;
    }
    if (element.isLeaf()) {
      const name = element.getLabel();
      if (name.indexOf(this.filterText) >= 0) {
        return TreeVisibility.Visible;
      }
      return TreeVisibility.Hidden;
    }
    return TreeVisibility.Recurse;
  }
}
registerAction2(
  class Collapse extends ViewAction {
    static {
      __name(this, "Collapse");
    }
    constructor() {
      super({
        id: "loadedScripts.collapse",
        viewId: LOADED_SCRIPTS_VIEW_ID,
        title: nls.localize("collapse", "Collapse All"),
        f1: false,
        icon: Codicon.collapseAll,
        menu: {
          id: MenuId.ViewTitle,
          order: 30,
          group: "navigation",
          when: ContextKeyExpr.equals("view", LOADED_SCRIPTS_VIEW_ID)
        }
      });
    }
    runInView(_accessor, view) {
      view.collapseAll();
    }
  }
);
export {
  LoadedScriptsView
};
//# sourceMappingURL=loadedScriptsView.js.map
