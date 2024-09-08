import * as nls from "../../../../nls.js";
import {
  Action2,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import * as Constants from "../common/constants.js";
import { TEXT_SEARCH_QUICK_ACCESS_PREFIX } from "./quickTextSearch/textSearchQuickAccess.js";
import { category } from "./searchActionsBase.js";
import { getSelectionTextFromEditor } from "./searchView.js";
registerAction2(
  class TextSearchQuickAccessAction extends Action2 {
    constructor() {
      super({
        id: Constants.SearchCommandIds.QuickTextSearchActionId,
        title: nls.localize2("quickTextSearch", "Quick Search"),
        category,
        f1: true
      });
    }
    async run(accessor, match) {
      const quickInputService = accessor.get(IQuickInputService);
      const searchText = getSearchText(accessor) ?? "";
      quickInputService.quickAccess.show(
        TEXT_SEARCH_QUICK_ACCESS_PREFIX + searchText,
        { preserveValue: !!searchText }
      );
    }
  }
);
function getSearchText(accessor) {
  const editorService = accessor.get(IEditorService);
  const configurationService = accessor.get(IConfigurationService);
  const activeEditor = editorService.activeTextEditorControl;
  if (!activeEditor) {
    return null;
  }
  if (!activeEditor.hasTextFocus()) {
    return null;
  }
  const seedSearchStringFromSelection = configurationService.getValue(
    "editor.find.seedSearchStringFromSelection"
  );
  if (!seedSearchStringFromSelection) {
    return null;
  }
  return getSelectionTextFromEditor(false, activeEditor);
}
