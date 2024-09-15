var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals } from "../../../../base/common/arrays.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import * as nls from "../../../../nls.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  getSelectionKeyboardEvent
} from "../../../../platform/list/browser/listService.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import * as Constants from "../common/constants.js";
import { IReplaceService } from "./replace.js";
import {
  category,
  getElementsToOperateOn,
  getSearchView,
  shouldRefocus
} from "./searchActionsBase.js";
import { searchRemoveIcon, searchReplaceIcon } from "./searchIcons.js";
import {
  FileMatch,
  FolderMatch,
  Match,
  MatchInNotebook,
  SearchResult,
  arrayContainsElementOrParent
} from "./searchModel.js";
registerAction2(
  class RemoveAction extends Action2 {
    static {
      __name(this, "RemoveAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.RemoveActionId,
        title: nls.localize2("RemoveAction.label", "Dismiss"),
        category,
        icon: searchRemoveIcon,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          when: ContextKeyExpr.and(
            Constants.SearchContext.SearchViewVisibleKey,
            Constants.SearchContext.FileMatchOrMatchFocusKey
          ),
          primary: KeyCode.Delete,
          mac: {
            primary: KeyMod.CtrlCmd | KeyCode.Backspace
          }
        },
        menu: [
          {
            id: MenuId.SearchContext,
            group: "search",
            order: 2
          },
          {
            id: MenuId.SearchActionMenu,
            group: "inline",
            order: 2
          }
        ]
      });
    }
    run(accessor, context) {
      const viewsService = accessor.get(IViewsService);
      const configurationService = accessor.get(IConfigurationService);
      const searchView = getSearchView(viewsService);
      if (!searchView) {
        return;
      }
      let element = context?.element;
      let viewer = context?.viewer;
      if (!viewer) {
        viewer = searchView.getControl();
      }
      if (!element) {
        element = viewer.getFocus()[0] ?? void 0;
      }
      const elementsToRemove = getElementsToOperateOn(
        viewer,
        element,
        configurationService.getValue(
          "search"
        )
      );
      let focusElement = viewer.getFocus()[0] ?? void 0;
      if (elementsToRemove.length === 0) {
        return;
      }
      if (!focusElement || focusElement instanceof SearchResult) {
        focusElement = element;
      }
      let nextFocusElement;
      const shouldRefocusMatch = shouldRefocus(
        elementsToRemove,
        focusElement
      );
      if (focusElement && shouldRefocusMatch) {
        nextFocusElement = getElementToFocusAfterRemoved(
          viewer,
          focusElement,
          elementsToRemove
        );
      }
      const searchResult = searchView.searchResult;
      if (searchResult) {
        searchResult.batchRemove(elementsToRemove);
      }
      if (focusElement && shouldRefocusMatch) {
        if (!nextFocusElement) {
          nextFocusElement = getLastNodeFromSameType(
            viewer,
            focusElement
          );
        }
        if (nextFocusElement && !arrayContainsElementOrParent(
          nextFocusElement,
          elementsToRemove
        )) {
          viewer.reveal(nextFocusElement);
          viewer.setFocus(
            [nextFocusElement],
            getSelectionKeyboardEvent()
          );
          viewer.setSelection(
            [nextFocusElement],
            getSelectionKeyboardEvent()
          );
        }
      } else if (!equals(viewer.getFocus(), viewer.getSelection())) {
        viewer.setSelection(viewer.getFocus());
      }
      viewer.domFocus();
      return;
    }
  }
);
registerAction2(
  class ReplaceAction extends Action2 {
    static {
      __name(this, "ReplaceAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.ReplaceActionId,
        title: nls.localize2("match.replace.label", "Replace"),
        category,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          when: ContextKeyExpr.and(
            Constants.SearchContext.SearchViewVisibleKey,
            Constants.SearchContext.ReplaceActiveKey,
            Constants.SearchContext.MatchFocusKey,
            Constants.SearchContext.IsEditableItemKey
          ),
          primary: KeyMod.Shift | KeyMod.CtrlCmd | KeyCode.Digit1
        },
        icon: searchReplaceIcon,
        menu: [
          {
            id: MenuId.SearchContext,
            when: ContextKeyExpr.and(
              Constants.SearchContext.ReplaceActiveKey,
              Constants.SearchContext.MatchFocusKey,
              Constants.SearchContext.IsEditableItemKey
            ),
            group: "search",
            order: 1
          },
          {
            id: MenuId.SearchActionMenu,
            when: ContextKeyExpr.and(
              Constants.SearchContext.ReplaceActiveKey,
              Constants.SearchContext.MatchFocusKey,
              Constants.SearchContext.IsEditableItemKey
            ),
            group: "inline",
            order: 1
          }
        ]
      });
    }
    async run(accessor, context) {
      return performReplace(accessor, context);
    }
  }
);
registerAction2(
  class ReplaceAllAction extends Action2 {
    static {
      __name(this, "ReplaceAllAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.ReplaceAllInFileActionId,
        title: nls.localize2("file.replaceAll.label", "Replace All"),
        category,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          when: ContextKeyExpr.and(
            Constants.SearchContext.SearchViewVisibleKey,
            Constants.SearchContext.ReplaceActiveKey,
            Constants.SearchContext.FileFocusKey,
            Constants.SearchContext.IsEditableItemKey
          ),
          primary: KeyMod.Shift | KeyMod.CtrlCmd | KeyCode.Digit1,
          secondary: [KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Enter]
        },
        icon: searchReplaceIcon,
        menu: [
          {
            id: MenuId.SearchContext,
            when: ContextKeyExpr.and(
              Constants.SearchContext.ReplaceActiveKey,
              Constants.SearchContext.FileFocusKey,
              Constants.SearchContext.IsEditableItemKey
            ),
            group: "search",
            order: 1
          },
          {
            id: MenuId.SearchActionMenu,
            when: ContextKeyExpr.and(
              Constants.SearchContext.ReplaceActiveKey,
              Constants.SearchContext.FileFocusKey,
              Constants.SearchContext.IsEditableItemKey
            ),
            group: "inline",
            order: 1
          }
        ]
      });
    }
    async run(accessor, context) {
      return performReplace(accessor, context);
    }
  }
);
registerAction2(
  class ReplaceAllInFolderAction extends Action2 {
    static {
      __name(this, "ReplaceAllInFolderAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.ReplaceAllInFolderActionId,
        title: nls.localize2("file.replaceAll.label", "Replace All"),
        category,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          when: ContextKeyExpr.and(
            Constants.SearchContext.SearchViewVisibleKey,
            Constants.SearchContext.ReplaceActiveKey,
            Constants.SearchContext.FolderFocusKey,
            Constants.SearchContext.IsEditableItemKey
          ),
          primary: KeyMod.Shift | KeyMod.CtrlCmd | KeyCode.Digit1,
          secondary: [KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Enter]
        },
        icon: searchReplaceIcon,
        menu: [
          {
            id: MenuId.SearchContext,
            when: ContextKeyExpr.and(
              Constants.SearchContext.ReplaceActiveKey,
              Constants.SearchContext.FolderFocusKey,
              Constants.SearchContext.IsEditableItemKey
            ),
            group: "search",
            order: 1
          },
          {
            id: MenuId.SearchActionMenu,
            when: ContextKeyExpr.and(
              Constants.SearchContext.ReplaceActiveKey,
              Constants.SearchContext.FolderFocusKey,
              Constants.SearchContext.IsEditableItemKey
            ),
            group: "inline",
            order: 1
          }
        ]
      });
    }
    async run(accessor, context) {
      return performReplace(accessor, context);
    }
  }
);
function performReplace(accessor, context) {
  const configurationService = accessor.get(IConfigurationService);
  const viewsService = accessor.get(IViewsService);
  const viewlet = getSearchView(viewsService);
  const viewer = context?.viewer ?? viewlet?.getControl();
  if (!viewer) {
    return;
  }
  const element = context?.element ?? viewer.getFocus()[0];
  const elementsToReplace = getElementsToOperateOn(
    viewer,
    element ?? void 0,
    configurationService.getValue("search")
  );
  let focusElement = viewer.getFocus()[0];
  if (!focusElement || focusElement && !arrayContainsElementOrParent(focusElement, elementsToReplace) || focusElement instanceof SearchResult) {
    focusElement = element;
  }
  if (elementsToReplace.length === 0) {
    return;
  }
  let nextFocusElement;
  if (focusElement) {
    nextFocusElement = getElementToFocusAfterRemoved(
      viewer,
      focusElement,
      elementsToReplace
    );
  }
  const searchResult = viewlet?.searchResult;
  if (searchResult) {
    searchResult.batchReplace(elementsToReplace);
  }
  if (focusElement) {
    if (!nextFocusElement) {
      nextFocusElement = getLastNodeFromSameType(viewer, focusElement);
    }
    if (nextFocusElement) {
      viewer.reveal(nextFocusElement);
      viewer.setFocus([nextFocusElement], getSelectionKeyboardEvent());
      viewer.setSelection(
        [nextFocusElement],
        getSelectionKeyboardEvent()
      );
      if (nextFocusElement instanceof Match) {
        const useReplacePreview = configurationService.getValue().search.useReplacePreview;
        if (!useReplacePreview || hasToOpenFile(accessor, nextFocusElement) || nextFocusElement instanceof MatchInNotebook) {
          viewlet?.open(nextFocusElement, true);
        } else {
          accessor.get(IReplaceService).openReplacePreview(nextFocusElement, true);
        }
      } else if (nextFocusElement instanceof FileMatch) {
        viewlet?.open(nextFocusElement, true);
      }
    }
  }
  viewer.domFocus();
}
__name(performReplace, "performReplace");
function hasToOpenFile(accessor, currBottomElem) {
  if (!(currBottomElem instanceof Match)) {
    return false;
  }
  const activeEditor = accessor.get(IEditorService).activeEditor;
  const file = activeEditor?.resource;
  if (file) {
    return accessor.get(IUriIdentityService).extUri.isEqual(file, currBottomElem.parent().resource);
  }
  return false;
}
__name(hasToOpenFile, "hasToOpenFile");
function compareLevels(elem1, elem2) {
  if (elem1 instanceof Match) {
    if (elem2 instanceof Match) {
      return 0;
    } else {
      return -1;
    }
  } else if (elem1 instanceof FileMatch) {
    if (elem2 instanceof Match) {
      return 1;
    } else if (elem2 instanceof FileMatch) {
      return 0;
    } else {
      return -1;
    }
  } else {
    if (elem2 instanceof FolderMatch) {
      return 0;
    } else {
      return 1;
    }
  }
}
__name(compareLevels, "compareLevels");
function getElementToFocusAfterRemoved(viewer, element, elementsToRemove) {
  const navigator = viewer.navigate(element);
  if (element instanceof FolderMatch) {
    while (!!navigator.next() && (!(navigator.current() instanceof FolderMatch) || arrayContainsElementOrParent(
      navigator.current(),
      elementsToRemove
    ))) {
    }
  } else if (element instanceof FileMatch) {
    while (!!navigator.next() && (!(navigator.current() instanceof FileMatch) || arrayContainsElementOrParent(
      navigator.current(),
      elementsToRemove
    ))) {
      viewer.expand(navigator.current());
    }
  } else {
    while (navigator.next() && (!(navigator.current() instanceof Match) || arrayContainsElementOrParent(
      navigator.current(),
      elementsToRemove
    ))) {
      viewer.expand(navigator.current());
    }
  }
  return navigator.current();
}
__name(getElementToFocusAfterRemoved, "getElementToFocusAfterRemoved");
function getLastNodeFromSameType(viewer, element) {
  let lastElem = viewer.lastVisibleElement ?? null;
  while (lastElem) {
    const compareVal = compareLevels(element, lastElem);
    if (compareVal === -1) {
      viewer.expand(lastElem);
      lastElem = viewer.lastVisibleElement;
    } else if (compareVal === 1) {
      lastElem = viewer.getParentElement(lastElem);
    } else {
      return lastElem;
    }
  }
  return void 0;
}
__name(getLastNodeFromSameType, "getLastNodeFromSameType");
export {
  getElementToFocusAfterRemoved,
  getLastNodeFromSameType
};
//# sourceMappingURL=searchActionsRemoveReplace.js.map
