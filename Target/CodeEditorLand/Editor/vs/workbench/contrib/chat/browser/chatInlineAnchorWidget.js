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
import { StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { IconLabel } from "../../../../base/browser/ui/iconLabel/iconLabel.js";
import { IAction } from "../../../../base/common/actions.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { Location, SymbolKinds } from "../../../../editor/common/languages.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { getIconClasses } from "../../../../editor/common/services/getIconClasses.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { DefinitionAction } from "../../../../editor/contrib/gotoSymbol/browser/goToCommands.js";
import * as nls from "../../../../nls.js";
import { createAndFillInContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { Action2, IMenuService, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { fillEditorsDragData } from "../../../browser/dnd.js";
import { ContentRefData } from "../common/annotations.js";
let InlineAnchorWidget = class extends Disposable {
  static {
    __name(this, "InlineAnchorWidget");
  }
  constructor(element, data, hoverService, instantiationService, labelService, languageService, modelService, contextMenuService, originalContextKeyService, languageFeaturesService, menuService) {
    super();
    const contextKeyService = this._register(originalContextKeyService.createScoped(element));
    element.classList.add("chat-inline-anchor-widget", "show-file-icons");
    element.replaceChildren();
    const resourceLabel = this._register(new IconLabel(element, { supportHighlights: false, supportIcons: true }));
    let location;
    let contextMenuId;
    let contextMenuArg;
    if (data.kind === "symbol") {
      location = data.symbol.location;
      contextMenuId = MenuId.ChatInlineSymbolAnchorContext;
      contextMenuArg = location;
      const icon = SymbolKinds.toIcon(data.symbol.kind);
      resourceLabel.setLabel(`$(${icon.id}) ${data.symbol.name}`, void 0, {});
      const model = modelService.getModel(location.uri);
      if (model) {
        const hasDefinitionProvider = EditorContextKeys.hasDefinitionProvider.bindTo(contextKeyService);
        const hasReferenceProvider = EditorContextKeys.hasReferenceProvider.bindTo(contextKeyService);
        const updateContents = /* @__PURE__ */ __name(() => {
          if (model.isDisposed()) {
            return;
          }
          hasDefinitionProvider.set(languageFeaturesService.definitionProvider.has(model));
          hasReferenceProvider.set(languageFeaturesService.definitionProvider.has(model));
        }, "updateContents");
        updateContents();
        this._register(languageFeaturesService.definitionProvider.onDidChange(updateContents));
        this._register(languageFeaturesService.referenceProvider.onDidChange(updateContents));
      }
    } else {
      location = data;
      contextMenuId = MenuId.ChatInlineResourceAnchorContext;
      contextMenuArg = location.uri;
      const label = labelService.getUriBasenameLabel(location.uri);
      const title = location.range && data.kind !== "symbol" ? `${label}#${location.range.startLineNumber}-${location.range.endLineNumber}` : label;
      resourceLabel.setLabel(title, void 0, {
        extraClasses: getIconClasses(modelService, languageService, location.uri)
      });
    }
    const fragment = location.range ? `${location.range.startLineNumber}-${location.range.endLineNumber}` : "";
    element.setAttribute("data-href", location.uri.with({ fragment }).toString());
    this._register(dom.addDisposableListener(element, dom.EventType.CONTEXT_MENU, (domEvent) => {
      const event = new StandardMouseEvent(dom.getWindow(domEvent), domEvent);
      dom.EventHelper.stop(domEvent, true);
      contextMenuService.showContextMenu({
        contextKeyService,
        getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
        getActions: /* @__PURE__ */ __name(() => {
          const menu = menuService.getMenuActions(contextMenuId, contextKeyService, { arg: contextMenuArg });
          const primary = [];
          createAndFillInContextMenuActions(menu, primary);
          return primary;
        }, "getActions")
      });
    }));
    const relativeLabel = labelService.getUriLabel(location.uri, { relative: true });
    this._register(hoverService.setupManagedHover(getDefaultHoverDelegate("element"), element, relativeLabel));
    element.draggable = true;
    this._register(dom.addDisposableListener(element, "dragstart", (e) => {
      instantiationService.invokeFunction((accessor) => fillEditorsDragData(accessor, [location.uri], e));
      e.dataTransfer?.setDragImage(element, 0, 0);
    }));
  }
};
InlineAnchorWidget = __decorateClass([
  __decorateParam(2, IHoverService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILabelService),
  __decorateParam(5, ILanguageService),
  __decorateParam(6, IModelService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, ILanguageFeaturesService),
  __decorateParam(10, IMenuService)
], InlineAnchorWidget);
registerAction2(class GoToDefinitionAction extends Action2 {
  static {
    __name(this, "GoToDefinitionAction");
  }
  static id = "chat.inlineSymbolAnchor.goToDefinition";
  constructor() {
    super({
      id: GoToDefinitionAction.id,
      title: {
        ...nls.localize2("actions.goToDecl.label", "Go to Definition"),
        mnemonicTitle: nls.localize({ key: "miGotoDefinition", comment: ["&& denotes a mnemonic"] }, "Go to &&Definition")
      },
      precondition: EditorContextKeys.hasDefinitionProvider,
      menu: [{
        id: MenuId.ChatInlineSymbolAnchorContext,
        group: "navigation",
        order: 1.1
      }]
    });
  }
  async run(accessor, location) {
    const editorService = accessor.get(ICodeEditorService);
    await editorService.openCodeEditor({
      resource: location.uri,
      options: {
        selection: {
          startColumn: location.range.startColumn,
          startLineNumber: location.range.startLineNumber
        }
      }
    }, null);
    const action = new DefinitionAction({ openToSide: false, openInPeek: false, muteMessage: true }, { title: { value: "", original: "" }, id: "", precondition: void 0 });
    return action.run(accessor);
  }
});
registerAction2(class GoToReferencesAction extends Action2 {
  static {
    __name(this, "GoToReferencesAction");
  }
  static id = "chat.inlineSymbolAnchor.goToReferences";
  constructor() {
    super({
      id: GoToReferencesAction.id,
      title: {
        ...nls.localize2("goToReferences.label", "Go to References"),
        mnemonicTitle: nls.localize({ key: "miGotoReference", comment: ["&& denotes a mnemonic"] }, "Go to &&References")
      },
      precondition: EditorContextKeys.hasReferenceProvider,
      menu: [{
        id: MenuId.ChatInlineSymbolAnchorContext,
        group: "navigation",
        order: 1.1
      }]
    });
  }
  async run(accessor, location) {
    const editorService = accessor.get(ICodeEditorService);
    const commandService = accessor.get(ICommandService);
    await editorService.openCodeEditor({
      resource: location.uri,
      options: {
        selection: {
          startColumn: location.range.startColumn,
          startLineNumber: location.range.startLineNumber
        }
      }
    }, null);
    await commandService.executeCommand("editor.action.goToReferences");
  }
});
export {
  InlineAnchorWidget
};
//# sourceMappingURL=chatInlineAnchorWidget.js.map
