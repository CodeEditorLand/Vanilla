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
import * as DOM from "../../../../base/browser/dom.js";
import { CountBadge } from "../../../../base/browser/ui/countBadge/countBadge.js";
import { IListVirtualDelegate } from "../../../../base/browser/ui/list/list.js";
import { IListAccessibilityProvider } from "../../../../base/browser/ui/list/listWidget.js";
import { ITreeNode } from "../../../../base/browser/ui/tree/tree.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import * as paths from "../../../../base/common/path.js";
import * as nls from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { FileKind } from "../../../../platform/files/common/files.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { ISearchConfigurationProperties } from "../../../services/search/common/search.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IResourceLabel, ResourceLabels } from "../../../browser/labels.js";
import { SearchView } from "./searchView.js";
import { FileMatch, Match, RenderableMatch, SearchModel, FolderMatch, FolderMatchNoRoot, FolderMatchWorkspaceRoot, MatchInNotebook } from "./searchModel.js";
import { isEqual } from "../../../../base/common/resources.js";
import { ICompressibleTreeRenderer } from "../../../../base/browser/ui/tree/objectTree.js";
import { ICompressedTreeNode } from "../../../../base/browser/ui/tree/compressedObjectTreeModel.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { HiddenItemStrategy, MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { ISearchActionContext } from "./searchActionsRemoveReplace.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { defaultCountBadgeStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { SearchContext } from "../common/constants.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
class SearchDelegate {
  static {
    __name(this, "SearchDelegate");
  }
  static ITEM_HEIGHT = 22;
  getHeight(element) {
    return SearchDelegate.ITEM_HEIGHT;
  }
  getTemplateId(element) {
    if (element instanceof FolderMatch) {
      return FolderMatchRenderer.TEMPLATE_ID;
    } else if (element instanceof FileMatch) {
      return FileMatchRenderer.TEMPLATE_ID;
    } else if (element instanceof Match) {
      return MatchRenderer.TEMPLATE_ID;
    }
    console.error("Invalid search tree element", element);
    throw new Error("Invalid search tree element");
  }
}
let FolderMatchRenderer = class extends Disposable {
  constructor(searchView, labels, contextService, labelService, instantiationService, contextKeyService) {
    super();
    this.searchView = searchView;
    this.labels = labels;
    this.contextService = contextService;
    this.labelService = labelService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
  }
  static {
    __name(this, "FolderMatchRenderer");
  }
  static TEMPLATE_ID = "folderMatch";
  templateId = FolderMatchRenderer.TEMPLATE_ID;
  renderCompressedElements(node, index, templateData, height) {
    const compressed = node.element;
    const folder = compressed.elements[compressed.elements.length - 1];
    const label = compressed.elements.map((e) => e.name());
    if (folder.resource) {
      const fileKind = folder instanceof FolderMatchWorkspaceRoot ? FileKind.ROOT_FOLDER : FileKind.FOLDER;
      templateData.label.setResource({ resource: folder.resource, name: label }, {
        fileKind,
        separator: this.labelService.getSeparator(folder.resource.scheme)
      });
    } else {
      templateData.label.setLabel(nls.localize("searchFolderMatch.other.label", "Other files"));
    }
    this.renderFolderDetails(folder, templateData);
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const folderMatchElement = DOM.append(container, DOM.$(".foldermatch"));
    const label = this.labels.create(folderMatchElement, { supportDescriptionHighlights: true, supportHighlights: true });
    disposables.add(label);
    const badge = new CountBadge(DOM.append(folderMatchElement, DOM.$(".badge")), {}, defaultCountBadgeStyles);
    const actionBarContainer = DOM.append(folderMatchElement, DOM.$(".actionBarContainer"));
    const elementDisposables = new DisposableStore();
    disposables.add(elementDisposables);
    const contextKeyServiceMain = disposables.add(this.contextKeyService.createScoped(container));
    SearchContext.MatchFocusKey.bindTo(contextKeyServiceMain).set(false);
    SearchContext.FileFocusKey.bindTo(contextKeyServiceMain).set(false);
    SearchContext.FolderFocusKey.bindTo(contextKeyServiceMain).set(true);
    const instantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyServiceMain])));
    const actions = disposables.add(instantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, MenuId.SearchActionMenu, {
      menuOptions: {
        shouldForwardArgs: true
      },
      hiddenItemStrategy: HiddenItemStrategy.Ignore,
      toolbarOptions: {
        primaryGroup: /* @__PURE__ */ __name((g) => /^inline/.test(g), "primaryGroup")
      }
    }));
    return {
      label,
      badge,
      actions,
      disposables,
      elementDisposables,
      contextKeyService: contextKeyServiceMain
    };
  }
  renderElement(node, index, templateData) {
    const folderMatch = node.element;
    if (folderMatch.resource) {
      const workspaceFolder = this.contextService.getWorkspaceFolder(folderMatch.resource);
      if (workspaceFolder && isEqual(workspaceFolder.uri, folderMatch.resource)) {
        templateData.label.setFile(folderMatch.resource, { fileKind: FileKind.ROOT_FOLDER, hidePath: true });
      } else {
        templateData.label.setFile(folderMatch.resource, { fileKind: FileKind.FOLDER, hidePath: this.searchView.isTreeLayoutViewVisible });
      }
    } else {
      templateData.label.setLabel(nls.localize("searchFolderMatch.other.label", "Other files"));
    }
    SearchContext.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!folderMatch.hasOnlyReadOnlyMatches());
    templateData.elementDisposables.add(folderMatch.onChange(() => {
      SearchContext.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!folderMatch.hasOnlyReadOnlyMatches());
    }));
    this.renderFolderDetails(folderMatch, templateData);
  }
  disposeElement(element, index, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeCompressedElements(node, index, templateData, height) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
  renderFolderDetails(folder, templateData) {
    const count = folder.recursiveMatchCount();
    templateData.badge.setCount(count);
    templateData.badge.setTitleFormat(count > 1 ? nls.localize("searchFileMatches", "{0} files found", count) : nls.localize("searchFileMatch", "{0} file found", count));
    templateData.actions.context = { viewer: this.searchView.getControl(), element: folder };
  }
};
FolderMatchRenderer = __decorateClass([
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextKeyService)
], FolderMatchRenderer);
let FileMatchRenderer = class extends Disposable {
  constructor(searchView, labels, contextService, configurationService, instantiationService, contextKeyService) {
    super();
    this.searchView = searchView;
    this.labels = labels;
    this.contextService = contextService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
  }
  static {
    __name(this, "FileMatchRenderer");
  }
  static TEMPLATE_ID = "fileMatch";
  templateId = FileMatchRenderer.TEMPLATE_ID;
  renderCompressedElements(node, index, templateData, height) {
    throw new Error("Should never happen since node is incompressible.");
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    disposables.add(elementDisposables);
    const fileMatchElement = DOM.append(container, DOM.$(".filematch"));
    const label = this.labels.create(fileMatchElement);
    disposables.add(label);
    const badge = new CountBadge(DOM.append(fileMatchElement, DOM.$(".badge")), {}, defaultCountBadgeStyles);
    const actionBarContainer = DOM.append(fileMatchElement, DOM.$(".actionBarContainer"));
    const contextKeyServiceMain = disposables.add(this.contextKeyService.createScoped(container));
    SearchContext.MatchFocusKey.bindTo(contextKeyServiceMain).set(false);
    SearchContext.FileFocusKey.bindTo(contextKeyServiceMain).set(true);
    SearchContext.FolderFocusKey.bindTo(contextKeyServiceMain).set(false);
    const instantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyServiceMain])));
    const actions = disposables.add(instantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, MenuId.SearchActionMenu, {
      menuOptions: {
        shouldForwardArgs: true
      },
      hiddenItemStrategy: HiddenItemStrategy.Ignore,
      toolbarOptions: {
        primaryGroup: /* @__PURE__ */ __name((g) => /^inline/.test(g), "primaryGroup")
      }
    }));
    return {
      el: fileMatchElement,
      label,
      badge,
      actions,
      disposables,
      elementDisposables,
      contextKeyService: contextKeyServiceMain
    };
  }
  renderElement(node, index, templateData) {
    const fileMatch = node.element;
    templateData.el.setAttribute("data-resource", fileMatch.resource.toString());
    const decorationConfig = this.configurationService.getValue("search").decorations;
    templateData.label.setFile(fileMatch.resource, { hidePath: this.searchView.isTreeLayoutViewVisible && !(fileMatch.parent() instanceof FolderMatchNoRoot), hideIcon: false, fileDecorations: { colors: decorationConfig.colors, badges: decorationConfig.badges } });
    const count = fileMatch.count();
    templateData.badge.setCount(count);
    templateData.badge.setTitleFormat(count > 1 ? nls.localize("searchMatches", "{0} matches found", count) : nls.localize("searchMatch", "{0} match found", count));
    templateData.actions.context = { viewer: this.searchView.getControl(), element: fileMatch };
    SearchContext.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!fileMatch.hasOnlyReadOnlyMatches());
    templateData.elementDisposables.add(fileMatch.onChange(() => {
      SearchContext.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!fileMatch.hasOnlyReadOnlyMatches());
    }));
    const twistieContainer = templateData.el.parentElement?.parentElement?.querySelector(".monaco-tl-twistie");
    twistieContainer?.classList.add("force-twistie");
  }
  disposeElement(element, index, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};
FileMatchRenderer = __decorateClass([
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextKeyService)
], FileMatchRenderer);
let MatchRenderer = class extends Disposable {
  constructor(searchView, contextService, configurationService, instantiationService, contextKeyService, hoverService) {
    super();
    this.searchView = searchView;
    this.contextService = contextService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.hoverService = hoverService;
  }
  static {
    __name(this, "MatchRenderer");
  }
  static TEMPLATE_ID = "match";
  templateId = MatchRenderer.TEMPLATE_ID;
  renderCompressedElements(node, index, templateData, height) {
    throw new Error("Should never happen since node is incompressible.");
  }
  renderTemplate(container) {
    container.classList.add("linematch");
    const lineNumber = DOM.append(container, DOM.$("span.matchLineNum"));
    const parent = DOM.append(container, DOM.$("a.plain.match"));
    const before = DOM.append(parent, DOM.$("span"));
    const match = DOM.append(parent, DOM.$("span.findInFileMatch"));
    const replace = DOM.append(parent, DOM.$("span.replaceMatch"));
    const after = DOM.append(parent, DOM.$("span"));
    const actionBarContainer = DOM.append(container, DOM.$("span.actionBarContainer"));
    const disposables = new DisposableStore();
    const contextKeyServiceMain = disposables.add(this.contextKeyService.createScoped(container));
    SearchContext.MatchFocusKey.bindTo(contextKeyServiceMain).set(true);
    SearchContext.FileFocusKey.bindTo(contextKeyServiceMain).set(false);
    SearchContext.FolderFocusKey.bindTo(contextKeyServiceMain).set(false);
    const instantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyServiceMain])));
    const actions = disposables.add(instantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, MenuId.SearchActionMenu, {
      menuOptions: {
        shouldForwardArgs: true
      },
      hiddenItemStrategy: HiddenItemStrategy.Ignore,
      toolbarOptions: {
        primaryGroup: /* @__PURE__ */ __name((g) => /^inline/.test(g), "primaryGroup")
      }
    }));
    return {
      parent,
      before,
      match,
      replace,
      after,
      lineNumber,
      actions,
      disposables,
      contextKeyService: contextKeyServiceMain
    };
  }
  renderElement(node, index, templateData) {
    const match = node.element;
    const preview = match.preview();
    const replace = this.searchView.model.isReplaceActive() && !!this.searchView.model.replaceString && !(match instanceof MatchInNotebook && match.isReadonly());
    templateData.before.textContent = preview.before;
    templateData.match.textContent = preview.inside;
    templateData.match.classList.toggle("replace", replace);
    templateData.replace.textContent = replace ? match.replaceString : "";
    templateData.after.textContent = preview.after;
    const title = (preview.fullBefore + (replace ? match.replaceString : preview.inside) + preview.after).trim().substr(0, 999);
    templateData.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), templateData.parent, title));
    SearchContext.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!(match instanceof MatchInNotebook && match.isReadonly()));
    const numLines = match.range().endLineNumber - match.range().startLineNumber;
    const extraLinesStr = numLines > 0 ? `+${numLines}` : "";
    const showLineNumbers = this.configurationService.getValue("search").showLineNumbers;
    const lineNumberStr = showLineNumbers ? `${match.range().startLineNumber}:` : "";
    templateData.lineNumber.classList.toggle("show", numLines > 0 || showLineNumbers);
    templateData.lineNumber.textContent = lineNumberStr + extraLinesStr;
    templateData.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), templateData.lineNumber, this.getMatchTitle(match, showLineNumbers)));
    templateData.actions.context = { viewer: this.searchView.getControl(), element: match };
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
  getMatchTitle(match, showLineNumbers) {
    const startLine = match.range().startLineNumber;
    const numLines = match.range().endLineNumber - match.range().startLineNumber;
    const lineNumStr = showLineNumbers ? nls.localize("lineNumStr", "From line {0}", startLine, numLines) + " " : "";
    const numLinesStr = numLines > 0 ? "+ " + nls.localize("numLinesStr", "{0} more lines", numLines) : "";
    return lineNumStr + numLinesStr;
  }
};
MatchRenderer = __decorateClass([
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IHoverService)
], MatchRenderer);
let SearchAccessibilityProvider = class {
  constructor(searchView, labelService) {
    this.searchView = searchView;
    this.labelService = labelService;
  }
  static {
    __name(this, "SearchAccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return nls.localize("search", "Search");
  }
  getAriaLabel(element) {
    if (element instanceof FolderMatch) {
      const count = element.allDownstreamFileMatches().reduce((total, current) => total + current.count(), 0);
      return element.resource ? nls.localize("folderMatchAriaLabel", "{0} matches in folder root {1}, Search result", count, element.name()) : nls.localize("otherFilesAriaLabel", "{0} matches outside of the workspace, Search result", count);
    }
    if (element instanceof FileMatch) {
      const path = this.labelService.getUriLabel(element.resource, { relative: true }) || element.resource.fsPath;
      return nls.localize("fileMatchAriaLabel", "{0} matches in file {1} of folder {2}, Search result", element.count(), element.name(), paths.dirname(path));
    }
    if (element instanceof Match) {
      const match = element;
      const searchModel = this.searchView.model;
      const replace = searchModel.isReplaceActive() && !!searchModel.replaceString;
      const matchString = match.getMatchString();
      const range = match.range();
      const matchText = match.text().substr(0, range.endColumn + 150);
      if (replace) {
        return nls.localize("replacePreviewResultAria", "'{0}' at column {1} replace {2} with {3}", matchText, range.startColumn, matchString, match.replaceString);
      }
      return nls.localize("searchResultAria", "'{0}' at column {1} found {2}", matchText, range.startColumn, matchString);
    }
    return null;
  }
};
SearchAccessibilityProvider = __decorateClass([
  __decorateParam(1, ILabelService)
], SearchAccessibilityProvider);
export {
  FileMatchRenderer,
  FolderMatchRenderer,
  MatchRenderer,
  SearchAccessibilityProvider,
  SearchDelegate
};
//# sourceMappingURL=searchResultsView.js.map
