import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import {
  EditorAction,
  registerEditorAction
} from "../../../../editor/browser/editorExtensions.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import * as nls from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { ViewContainerLocation } from "../../../common/views.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import {
  VIEWLET_ID
} from "../../extensions/common/extensions.js";
async function showExtensionQuery(paneCompositeService, query) {
  const viewlet = await paneCompositeService.openPaneComposite(
    VIEWLET_ID,
    ViewContainerLocation.Sidebar,
    true
  );
  if (viewlet) {
    (viewlet?.getViewPaneContainer()).search(query);
  }
}
registerEditorAction(
  class FormatDocumentMultipleAction extends EditorAction {
    constructor() {
      super({
        id: "editor.action.formatDocument.none",
        label: nls.localize(
          "formatDocument.label.multiple",
          "Format Document"
        ),
        alias: "Format Document",
        precondition: ContextKeyExpr.and(
          EditorContextKeys.writable,
          EditorContextKeys.hasDocumentFormattingProvider.toNegated()
        ),
        kbOpts: {
          kbExpr: EditorContextKeys.editorTextFocus,
          primary: KeyMod.Shift | KeyMod.Alt | KeyCode.KeyF,
          linux: {
            primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyI
          },
          weight: KeybindingWeight.EditorContrib
        }
      });
    }
    async run(accessor, editor) {
      if (!editor.hasModel()) {
        return;
      }
      const commandService = accessor.get(ICommandService);
      const paneCompositeService = accessor.get(
        IPaneCompositePartService
      );
      const notificationService = accessor.get(INotificationService);
      const dialogService = accessor.get(IDialogService);
      const languageFeaturesService = accessor.get(
        ILanguageFeaturesService
      );
      const model = editor.getModel();
      const formatterCount = languageFeaturesService.documentFormattingEditProvider.all(
        model
      ).length;
      if (formatterCount > 1) {
        return commandService.executeCommand(
          "editor.action.formatDocument.multiple"
        );
      } else if (formatterCount === 1) {
        return commandService.executeCommand(
          "editor.action.formatDocument"
        );
      } else if (model.isTooLargeForSyncing()) {
        notificationService.warn(
          nls.localize(
            "too.large",
            "This file cannot be formatted because it is too large"
          )
        );
      } else {
        const langName = model.getLanguageId();
        const message = nls.localize(
          "no.provider",
          "There is no formatter for '{0}' files installed.",
          langName
        );
        const { confirmed } = await dialogService.confirm({
          message,
          primaryButton: nls.localize(
            {
              key: "install.formatter",
              comment: ["&& denotes a mnemonic"]
            },
            "&&Install Formatter..."
          )
        });
        if (confirmed) {
          showExtensionQuery(
            paneCompositeService,
            `category:formatters ${langName}`
          );
        }
      }
    }
  }
);
