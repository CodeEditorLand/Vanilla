var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getActiveElement } from "../../../../base/browser/dom.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { isMacintosh } from "../../../../base/common/platform.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import {
  ToggleCaseSensitiveKeybinding,
  TogglePreserveCaseKeybinding,
  ToggleRegexKeybinding,
  ToggleWholeWordKeybinding
} from "../../../../editor/contrib/find/browser/findModel.js";
import * as nls from "../../../../nls.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../platform/accessibility/common/accessibility.js";
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
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import * as SearchEditorConstants from "../../searchEditor/browser/constants.js";
import { SearchEditorInput } from "../../searchEditor/browser/searchEditorInput.js";
import * as Constants from "../common/constants.js";
import {
  category,
  getSearchView,
  openSearchView
} from "./searchActionsBase.js";
import {
  FolderMatch
} from "./searchModel.js";
registerAction2(
  class ToggleQueryDetailsAction extends Action2 {
    static {
      __name(this, "ToggleQueryDetailsAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.ToggleQueryDetailsActionId,
        title: nls.localize2(
          "ToggleQueryDetailsAction.label",
          "Toggle Query Details"
        ),
        category,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          when: ContextKeyExpr.or(
            Constants.SearchContext.SearchViewFocusedKey,
            SearchEditorConstants.InSearchEditor
          ),
          primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyJ
        }
      });
    }
    run(accessor, ...args) {
      const contextService = accessor.get(IContextKeyService).getContext(getActiveElement());
      if (contextService.getValue(
        SearchEditorConstants.InSearchEditor.serialize()
      )) {
        accessor.get(IEditorService).activeEditorPane.toggleQueryDetails(args[0]?.show);
      } else if (contextService.getValue(
        Constants.SearchContext.SearchViewFocusedKey.serialize()
      )) {
        const searchView = getSearchView(accessor.get(IViewsService));
        assertIsDefined(searchView).toggleQueryDetails(
          void 0,
          args[0]?.show
        );
      }
    }
  }
);
registerAction2(
  class CloseReplaceAction extends Action2 {
    static {
      __name(this, "CloseReplaceAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.CloseReplaceWidgetActionId,
        title: nls.localize2(
          "CloseReplaceWidget.label",
          "Close Replace Widget"
        ),
        category,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          when: ContextKeyExpr.and(
            Constants.SearchContext.SearchViewVisibleKey,
            Constants.SearchContext.ReplaceInputBoxFocusedKey
          ),
          primary: KeyCode.Escape
        }
      });
    }
    run(accessor) {
      const searchView = getSearchView(accessor.get(IViewsService));
      if (searchView) {
        searchView.searchAndReplaceWidget.toggleReplace(false);
        searchView.searchAndReplaceWidget.focus();
      }
      return Promise.resolve(null);
    }
  }
);
registerAction2(
  class ToggleCaseSensitiveCommandAction extends Action2 {
    static {
      __name(this, "ToggleCaseSensitiveCommandAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.ToggleCaseSensitiveCommandId,
        title: nls.localize2(
          "ToggleCaseSensitiveCommandId.label",
          "Toggle Case Sensitive"
        ),
        category,
        keybinding: Object.assign(
          {
            weight: KeybindingWeight.WorkbenchContrib,
            when: isMacintosh ? ContextKeyExpr.and(
              Constants.SearchContext.SearchViewFocusedKey,
              Constants.SearchContext.FileMatchOrFolderMatchFocusKey.toNegated()
            ) : Constants.SearchContext.SearchViewFocusedKey
          },
          ToggleCaseSensitiveKeybinding
        )
      });
    }
    async run(accessor) {
      toggleCaseSensitiveCommand(accessor);
    }
  }
);
registerAction2(
  class ToggleWholeWordCommandAction extends Action2 {
    static {
      __name(this, "ToggleWholeWordCommandAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.ToggleWholeWordCommandId,
        title: nls.localize2(
          "ToggleWholeWordCommandId.label",
          "Toggle Whole Word"
        ),
        keybinding: Object.assign(
          {
            weight: KeybindingWeight.WorkbenchContrib,
            when: Constants.SearchContext.SearchViewFocusedKey
          },
          ToggleWholeWordKeybinding
        ),
        category
      });
    }
    async run(accessor) {
      return toggleWholeWordCommand(accessor);
    }
  }
);
registerAction2(
  class ToggleRegexCommandAction extends Action2 {
    static {
      __name(this, "ToggleRegexCommandAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.ToggleRegexCommandId,
        title: nls.localize2(
          "ToggleRegexCommandId.label",
          "Toggle Regex"
        ),
        keybinding: Object.assign(
          {
            weight: KeybindingWeight.WorkbenchContrib,
            when: Constants.SearchContext.SearchViewFocusedKey
          },
          ToggleRegexKeybinding
        ),
        category
      });
    }
    async run(accessor) {
      return toggleRegexCommand(accessor);
    }
  }
);
registerAction2(
  class TogglePreserveCaseAction extends Action2 {
    static {
      __name(this, "TogglePreserveCaseAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.TogglePreserveCaseId,
        title: nls.localize2(
          "TogglePreserveCaseId.label",
          "Toggle Preserve Case"
        ),
        keybinding: Object.assign(
          {
            weight: KeybindingWeight.WorkbenchContrib,
            when: Constants.SearchContext.SearchViewFocusedKey
          },
          TogglePreserveCaseKeybinding
        ),
        category
      });
    }
    async run(accessor) {
      return togglePreserveCaseCommand(accessor);
    }
  }
);
registerAction2(
  class OpenMatchAction extends Action2 {
    static {
      __name(this, "OpenMatchAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.OpenMatch,
        title: nls.localize2("OpenMatch.label", "Open Match"),
        category,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          when: ContextKeyExpr.and(
            Constants.SearchContext.SearchViewVisibleKey,
            Constants.SearchContext.FileMatchOrMatchFocusKey
          ),
          primary: KeyCode.Enter,
          mac: {
            primary: KeyCode.Enter,
            secondary: [KeyMod.CtrlCmd | KeyCode.DownArrow]
          }
        }
      });
    }
    run(accessor) {
      const searchView = getSearchView(accessor.get(IViewsService));
      if (searchView) {
        const tree = searchView.getControl();
        const viewer = searchView.getControl();
        const focus = tree.getFocus()[0];
        if (focus instanceof FolderMatch) {
          viewer.toggleCollapsed(focus);
        } else {
          searchView.open(
            tree.getFocus()[0],
            false,
            false,
            true
          );
        }
      }
    }
  }
);
registerAction2(
  class OpenMatchToSideAction extends Action2 {
    static {
      __name(this, "OpenMatchToSideAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.OpenMatchToSide,
        title: nls.localize2(
          "OpenMatchToSide.label",
          "Open Match To Side"
        ),
        category,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          when: ContextKeyExpr.and(
            Constants.SearchContext.SearchViewVisibleKey,
            Constants.SearchContext.FileMatchOrMatchFocusKey
          ),
          primary: KeyMod.CtrlCmd | KeyCode.Enter,
          mac: {
            primary: KeyMod.WinCtrl | KeyCode.Enter
          }
        }
      });
    }
    run(accessor) {
      const searchView = getSearchView(accessor.get(IViewsService));
      if (searchView) {
        const tree = searchView.getControl();
        searchView.open(
          tree.getFocus()[0],
          false,
          true,
          true
        );
      }
    }
  }
);
registerAction2(
  class AddCursorsAtSearchResultsAction extends Action2 {
    static {
      __name(this, "AddCursorsAtSearchResultsAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.AddCursorsAtSearchResults,
        title: nls.localize2(
          "AddCursorsAtSearchResults.label",
          "Add Cursors at Search Results"
        ),
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          when: ContextKeyExpr.and(
            Constants.SearchContext.SearchViewVisibleKey,
            Constants.SearchContext.FileMatchOrMatchFocusKey
          ),
          primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyL
        },
        category
      });
    }
    async run(accessor) {
      const searchView = getSearchView(accessor.get(IViewsService));
      if (searchView) {
        const tree = searchView.getControl();
        searchView.openEditorWithMultiCursor(
          tree.getFocus()[0]
        );
      }
    }
  }
);
registerAction2(
  class FocusNextInputAction extends Action2 {
    static {
      __name(this, "FocusNextInputAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.FocusNextInputActionId,
        title: nls.localize2(
          "FocusNextInputAction.label",
          "Focus Next Input"
        ),
        category,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          when: ContextKeyExpr.or(
            ContextKeyExpr.and(
              SearchEditorConstants.InSearchEditor,
              Constants.SearchContext.InputBoxFocusedKey
            ),
            ContextKeyExpr.and(
              Constants.SearchContext.SearchViewVisibleKey,
              Constants.SearchContext.InputBoxFocusedKey
            )
          ),
          primary: KeyMod.CtrlCmd | KeyCode.DownArrow
        }
      });
    }
    async run(accessor) {
      const editorService = accessor.get(IEditorService);
      const input = editorService.activeEditor;
      if (input instanceof SearchEditorInput) {
        editorService.activeEditorPane.focusNextInput();
      }
      const searchView = getSearchView(accessor.get(IViewsService));
      searchView?.focusNextInputBox();
    }
  }
);
registerAction2(
  class FocusPreviousInputAction extends Action2 {
    static {
      __name(this, "FocusPreviousInputAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.FocusPreviousInputActionId,
        title: nls.localize2(
          "FocusPreviousInputAction.label",
          "Focus Previous Input"
        ),
        category,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          when: ContextKeyExpr.or(
            ContextKeyExpr.and(
              SearchEditorConstants.InSearchEditor,
              Constants.SearchContext.InputBoxFocusedKey
            ),
            ContextKeyExpr.and(
              Constants.SearchContext.SearchViewVisibleKey,
              Constants.SearchContext.InputBoxFocusedKey,
              Constants.SearchContext.SearchInputBoxFocusedKey.toNegated()
            )
          ),
          primary: KeyMod.CtrlCmd | KeyCode.UpArrow
        }
      });
    }
    async run(accessor) {
      const editorService = accessor.get(IEditorService);
      const input = editorService.activeEditor;
      if (input instanceof SearchEditorInput) {
        editorService.activeEditorPane.focusPrevInput();
      }
      const searchView = getSearchView(accessor.get(IViewsService));
      searchView?.focusPreviousInputBox();
    }
  }
);
registerAction2(
  class FocusSearchFromResultsAction extends Action2 {
    static {
      __name(this, "FocusSearchFromResultsAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.FocusSearchFromResults,
        title: nls.localize2(
          "FocusSearchFromResults.label",
          "Focus Search From Results"
        ),
        category,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          when: ContextKeyExpr.and(
            Constants.SearchContext.SearchViewVisibleKey,
            ContextKeyExpr.or(
              Constants.SearchContext.FirstMatchFocusKey,
              CONTEXT_ACCESSIBILITY_MODE_ENABLED
            )
          ),
          primary: KeyMod.CtrlCmd | KeyCode.UpArrow
        }
      });
    }
    run(accessor) {
      const searchView = getSearchView(accessor.get(IViewsService));
      searchView?.focusPreviousInputBox();
    }
  }
);
registerAction2(
  class ToggleSearchOnTypeAction extends Action2 {
    static {
      __name(this, "ToggleSearchOnTypeAction");
    }
    static searchOnTypeKey = "search.searchOnType";
    constructor() {
      super({
        id: Constants.SearchCommandIds.ToggleSearchOnTypeActionId,
        title: nls.localize2("toggleTabs", "Toggle Search on Type"),
        category
      });
    }
    async run(accessor) {
      const configurationService = accessor.get(IConfigurationService);
      const searchOnType = configurationService.getValue(
        ToggleSearchOnTypeAction.searchOnTypeKey
      );
      return configurationService.updateValue(
        ToggleSearchOnTypeAction.searchOnTypeKey,
        !searchOnType
      );
    }
  }
);
registerAction2(
  class FocusSearchListCommandAction extends Action2 {
    static {
      __name(this, "FocusSearchListCommandAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.FocusSearchListCommandID,
        title: nls.localize2(
          "focusSearchListCommandLabel",
          "Focus List"
        ),
        category,
        f1: true
      });
    }
    async run(accessor) {
      focusSearchListCommand(accessor);
    }
  }
);
registerAction2(
  class FocusNextSearchResultAction extends Action2 {
    static {
      __name(this, "FocusNextSearchResultAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.FocusNextSearchResultActionId,
        title: nls.localize2(
          "FocusNextSearchResult.label",
          "Focus Next Search Result"
        ),
        keybinding: [
          {
            primary: KeyCode.F4,
            weight: KeybindingWeight.WorkbenchContrib
          }
        ],
        category,
        f1: true,
        precondition: ContextKeyExpr.or(
          Constants.SearchContext.HasSearchResults,
          SearchEditorConstants.InSearchEditor
        )
      });
    }
    async run(accessor) {
      return await focusNextSearchResult(accessor);
    }
  }
);
registerAction2(
  class FocusPreviousSearchResultAction extends Action2 {
    static {
      __name(this, "FocusPreviousSearchResultAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.FocusPreviousSearchResultActionId,
        title: nls.localize2(
          "FocusPreviousSearchResult.label",
          "Focus Previous Search Result"
        ),
        keybinding: [
          {
            primary: KeyMod.Shift | KeyCode.F4,
            weight: KeybindingWeight.WorkbenchContrib
          }
        ],
        category,
        f1: true,
        precondition: ContextKeyExpr.or(
          Constants.SearchContext.HasSearchResults,
          SearchEditorConstants.InSearchEditor
        )
      });
    }
    async run(accessor) {
      return await focusPreviousSearchResult(accessor);
    }
  }
);
registerAction2(
  class ReplaceInFilesAction extends Action2 {
    static {
      __name(this, "ReplaceInFilesAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.ReplaceInFilesActionId,
        title: nls.localize2("replaceInFiles", "Replace in Files"),
        keybinding: [
          {
            primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyH,
            weight: KeybindingWeight.WorkbenchContrib
          }
        ],
        category,
        f1: true,
        menu: [
          {
            id: MenuId.MenubarEditMenu,
            group: "4_find_global",
            order: 2
          }
        ]
      });
    }
    async run(accessor) {
      return await findOrReplaceInFiles(accessor, true);
    }
  }
);
function toggleCaseSensitiveCommand(accessor) {
  const searchView = getSearchView(accessor.get(IViewsService));
  searchView?.toggleCaseSensitive();
}
__name(toggleCaseSensitiveCommand, "toggleCaseSensitiveCommand");
function toggleWholeWordCommand(accessor) {
  const searchView = getSearchView(accessor.get(IViewsService));
  searchView?.toggleWholeWords();
}
__name(toggleWholeWordCommand, "toggleWholeWordCommand");
function toggleRegexCommand(accessor) {
  const searchView = getSearchView(accessor.get(IViewsService));
  searchView?.toggleRegex();
}
__name(toggleRegexCommand, "toggleRegexCommand");
function togglePreserveCaseCommand(accessor) {
  const searchView = getSearchView(accessor.get(IViewsService));
  searchView?.togglePreserveCase();
}
__name(togglePreserveCaseCommand, "togglePreserveCaseCommand");
const focusSearchListCommand = /* @__PURE__ */ __name((accessor) => {
  const viewsService = accessor.get(IViewsService);
  openSearchView(viewsService).then((searchView) => {
    searchView?.moveFocusToResults();
  });
}, "focusSearchListCommand");
async function focusNextSearchResult(accessor) {
  const editorService = accessor.get(IEditorService);
  const input = editorService.activeEditor;
  if (input instanceof SearchEditorInput) {
    return editorService.activeEditorPane.focusNextResult();
  }
  return openSearchView(accessor.get(IViewsService)).then((searchView) => {
    searchView?.selectNextMatch();
  });
}
__name(focusNextSearchResult, "focusNextSearchResult");
async function focusPreviousSearchResult(accessor) {
  const editorService = accessor.get(IEditorService);
  const input = editorService.activeEditor;
  if (input instanceof SearchEditorInput) {
    return editorService.activeEditorPane.focusPreviousResult();
  }
  return openSearchView(accessor.get(IViewsService)).then((searchView) => {
    searchView?.selectPreviousMatch();
  });
}
__name(focusPreviousSearchResult, "focusPreviousSearchResult");
async function findOrReplaceInFiles(accessor, expandSearchReplaceWidget) {
  return openSearchView(accessor.get(IViewsService), false).then(
    (openedView) => {
      if (openedView) {
        const searchAndReplaceWidget = openedView.searchAndReplaceWidget;
        searchAndReplaceWidget.toggleReplace(expandSearchReplaceWidget);
        const updatedText = openedView.updateTextFromFindWidgetOrSelection({
          allowUnselectedWord: !expandSearchReplaceWidget
        });
        openedView.searchAndReplaceWidget.focus(
          void 0,
          updatedText,
          updatedText
        );
      }
    }
  );
}
__name(findOrReplaceInFiles, "findOrReplaceInFiles");
//# sourceMappingURL=searchActionsNav.js.map
