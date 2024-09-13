var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../base/browser/dom.js";
import {
  Action,
  Separator
} from "../../../../base/common/actions.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import {
  MenuId,
  MenuItemAction,
  MenuRegistry,
  isIMenuItem
} from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import {
  INotificationService,
  Severity
} from "../../../../platform/notification/common/notification.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { Range } from "../../../common/core/range.js";
import { ITextModelService } from "../../../common/services/resolverService.js";
import {
  DefinitionAction,
  SymbolNavigationAction,
  SymbolNavigationAnchor
} from "../../gotoSymbol/browser/goToCommands.js";
import { PeekContext } from "../../peekView/browser/peekView.js";
async function showGoToContextMenu(accessor, editor, anchor, part) {
  const resolverService = accessor.get(ITextModelService);
  const contextMenuService = accessor.get(IContextMenuService);
  const commandService = accessor.get(ICommandService);
  const instaService = accessor.get(IInstantiationService);
  const notificationService = accessor.get(INotificationService);
  await part.item.resolve(CancellationToken.None);
  if (!part.part.location) {
    return;
  }
  const location = part.part.location;
  const menuActions = [];
  const filter = new Set(
    MenuRegistry.getMenuItems(MenuId.EditorContext).map(
      (item) => isIMenuItem(item) ? item.command.id : generateUuid()
    )
  );
  for (const delegate of SymbolNavigationAction.all()) {
    if (filter.has(delegate.desc.id)) {
      menuActions.push(
        new Action(
          delegate.desc.id,
          MenuItemAction.label(delegate.desc, {
            renderShortTitle: true
          }),
          void 0,
          true,
          async () => {
            const ref = await resolverService.createModelReference(
              location.uri
            );
            try {
              const symbolAnchor = new SymbolNavigationAnchor(
                ref.object.textEditorModel,
                Range.getStartPosition(location.range)
              );
              const range = part.item.anchor.range;
              await instaService.invokeFunction(
                delegate.runEditorCommand.bind(delegate),
                editor,
                symbolAnchor,
                range
              );
            } finally {
              ref.dispose();
            }
          }
        )
      );
    }
  }
  if (part.part.command) {
    const { command } = part.part;
    menuActions.push(new Separator());
    menuActions.push(
      new Action(command.id, command.title, void 0, true, async () => {
        try {
          await commandService.executeCommand(
            command.id,
            ...command.arguments ?? []
          );
        } catch (err) {
          notificationService.notify({
            severity: Severity.Error,
            source: part.item.provider.displayName,
            message: err
          });
        }
      })
    );
  }
  const useShadowDOM = editor.getOption(EditorOption.useShadowDOM);
  contextMenuService.showContextMenu({
    domForShadowRoot: useShadowDOM ? editor.getDomNode() ?? void 0 : void 0,
    getAnchor: /* @__PURE__ */ __name(() => {
      const box = dom.getDomNodePagePosition(anchor);
      return { x: box.left, y: box.top + box.height + 8 };
    }, "getAnchor"),
    getActions: /* @__PURE__ */ __name(() => menuActions, "getActions"),
    onHide: /* @__PURE__ */ __name(() => {
      editor.focus();
    }, "onHide"),
    autoSelectFirstItem: true
  });
}
__name(showGoToContextMenu, "showGoToContextMenu");
async function goToDefinitionWithLocation(accessor, event, editor, location) {
  const resolverService = accessor.get(ITextModelService);
  const ref = await resolverService.createModelReference(location.uri);
  await editor.invokeWithinContext(async (accessor2) => {
    const openToSide = event.hasSideBySideModifier;
    const contextKeyService = accessor2.get(IContextKeyService);
    const isInPeek = PeekContext.inPeekEditor.getValue(contextKeyService);
    const canPeek = !openToSide && editor.getOption(EditorOption.definitionLinkOpensInPeek) && !isInPeek;
    const action = new DefinitionAction(
      { openToSide, openInPeek: canPeek, muteMessage: true },
      {
        title: { value: "", original: "" },
        id: "",
        precondition: void 0
      }
    );
    return action.run(
      accessor2,
      new SymbolNavigationAnchor(
        ref.object.textEditorModel,
        Range.getStartPosition(location.range)
      ),
      Range.lift(location.range)
    );
  });
  ref.dispose();
}
__name(goToDefinitionWithLocation, "goToDefinitionWithLocation");
export {
  goToDefinitionWithLocation,
  showGoToContextMenu
};
//# sourceMappingURL=inlayHintsLocations.js.map
