import { isActiveElement } from "../../../base/browser/dom.js";
import { PagedList } from "../../../base/browser/ui/list/listPaging.js";
import { List } from "../../../base/browser/ui/list/listWidget.js";
import { Table } from "../../../base/browser/ui/table/tableWidget.js";
import {
  AbstractTree,
  TreeFindMatchType,
  TreeFindMode
} from "../../../base/browser/ui/tree/abstractTree.js";
import { AsyncDataTree } from "../../../base/browser/ui/tree/asyncDataTree.js";
import { DataTree } from "../../../base/browser/ui/tree/dataTree.js";
import { ObjectTree } from "../../../base/browser/ui/tree/objectTree.js";
import { equals, range } from "../../../base/common/arrays.js";
import { KeyChord, KeyCode, KeyMod } from "../../../base/common/keyCodes.js";
import { localize, localize2 } from "../../../nls.js";
import {
  Action2,
  registerAction2
} from "../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../platform/contextkey/common/contextkey.js";
import { IHoverService } from "../../../platform/hover/browser/hover.js";
import {
  KeybindingsRegistry,
  KeybindingWeight
} from "../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  getSelectionKeyboardEvent,
  IListService,
  RawWorkbenchListFocusContextKey,
  WorkbenchListFocusContextKey,
  WorkbenchListHasSelectionOrFocus,
  WorkbenchListScrollAtBottomContextKey,
  WorkbenchListScrollAtTopContextKey,
  WorkbenchListSelectionNavigation,
  WorkbenchListSupportsFind,
  WorkbenchListSupportsMultiSelectContextKey,
  WorkbenchTreeElementCanCollapse,
  WorkbenchTreeElementCanExpand,
  WorkbenchTreeElementHasChild,
  WorkbenchTreeElementHasParent,
  WorkbenchTreeFindOpen,
  WorkbenchTreeStickyScrollFocused
} from "../../../platform/list/browser/listService.js";
function ensureDOMFocus(widget) {
  const element = widget?.getHTMLElement();
  if (element && !isActiveElement(element)) {
    widget?.domFocus();
  }
}
async function updateFocus(widget, updateFocusFn) {
  if (!WorkbenchListSelectionNavigation.getValue(widget.contextKeyService)) {
    return updateFocusFn(widget);
  }
  const focus = widget.getFocus();
  const selection = widget.getSelection();
  await updateFocusFn(widget);
  const newFocus = widget.getFocus();
  if (selection.length > 1 || !equals(focus, selection) || equals(focus, newFocus)) {
    return;
  }
  const fakeKeyboardEvent = new KeyboardEvent("keydown");
  widget.setSelection(newFocus, fakeKeyboardEvent);
}
async function navigate(widget, updateFocusFn) {
  if (!widget) {
    return;
  }
  await updateFocus(widget, updateFocusFn);
  const listFocus = widget.getFocus();
  if (listFocus.length) {
    widget.reveal(listFocus[0]);
  }
  widget.setAnchor(listFocus[0]);
  ensureDOMFocus(widget);
}
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusDown",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  primary: KeyCode.DownArrow,
  mac: {
    primary: KeyCode.DownArrow,
    secondary: [KeyMod.WinCtrl | KeyCode.KeyN]
  },
  handler: (accessor, arg2) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      await widget.focusNext(
        typeof arg2 === "number" ? arg2 : 1,
        false,
        fakeKeyboardEvent
      );
    });
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusUp",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  primary: KeyCode.UpArrow,
  mac: {
    primary: KeyCode.UpArrow,
    secondary: [KeyMod.WinCtrl | KeyCode.KeyP]
  },
  handler: (accessor, arg2) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      await widget.focusPrevious(
        typeof arg2 === "number" ? arg2 : 1,
        false,
        fakeKeyboardEvent
      );
    });
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusAnyDown",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  primary: KeyMod.Alt | KeyCode.DownArrow,
  mac: {
    primary: KeyMod.Alt | KeyCode.DownArrow,
    secondary: [KeyMod.WinCtrl | KeyMod.Alt | KeyCode.KeyN]
  },
  handler: (accessor, arg2) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown", {
        altKey: true
      });
      await widget.focusNext(
        typeof arg2 === "number" ? arg2 : 1,
        false,
        fakeKeyboardEvent
      );
    });
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusAnyUp",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  primary: KeyMod.Alt | KeyCode.UpArrow,
  mac: {
    primary: KeyMod.Alt | KeyCode.UpArrow,
    secondary: [KeyMod.WinCtrl | KeyMod.Alt | KeyCode.KeyP]
  },
  handler: (accessor, arg2) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown", {
        altKey: true
      });
      await widget.focusPrevious(
        typeof arg2 === "number" ? arg2 : 1,
        false,
        fakeKeyboardEvent
      );
    });
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusPageDown",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  primary: KeyCode.PageDown,
  handler: (accessor) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      await widget.focusNextPage(fakeKeyboardEvent);
    });
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusPageUp",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  primary: KeyCode.PageUp,
  handler: (accessor) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      await widget.focusPreviousPage(fakeKeyboardEvent);
    });
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusFirst",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  primary: KeyCode.Home,
  handler: (accessor) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      await widget.focusFirst(fakeKeyboardEvent);
    });
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusLast",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  primary: KeyCode.End,
  handler: (accessor) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      await widget.focusLast(fakeKeyboardEvent);
    });
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusAnyFirst",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  primary: KeyMod.Alt | KeyCode.Home,
  handler: (accessor) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown", {
        altKey: true
      });
      await widget.focusFirst(fakeKeyboardEvent);
    });
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusAnyLast",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  primary: KeyMod.Alt | KeyCode.End,
  handler: (accessor) => {
    navigate(accessor.get(IListService).lastFocusedList, async (widget) => {
      const fakeKeyboardEvent = new KeyboardEvent("keydown", {
        altKey: true
      });
      await widget.focusLast(fakeKeyboardEvent);
    });
  }
});
function expandMultiSelection(focused, previousFocus) {
  if (focused instanceof List || focused instanceof PagedList || focused instanceof Table) {
    const list = focused;
    const focus = list.getFocus() ? list.getFocus()[0] : void 0;
    const selection = list.getSelection();
    if (selection && typeof focus === "number" && selection.indexOf(focus) >= 0) {
      list.setSelection(selection.filter((s) => s !== previousFocus));
    } else if (typeof focus === "number") {
      list.setSelection(selection.concat(focus));
    }
  } else if (focused instanceof ObjectTree || focused instanceof DataTree || focused instanceof AsyncDataTree) {
    const list = focused;
    const focus = list.getFocus() ? list.getFocus()[0] : void 0;
    if (previousFocus === focus) {
      return;
    }
    const selection = list.getSelection();
    const fakeKeyboardEvent = new KeyboardEvent("keydown", {
      shiftKey: true
    });
    if (selection && selection.indexOf(focus) >= 0) {
      list.setSelection(
        selection.filter((s) => s !== previousFocus),
        fakeKeyboardEvent
      );
    } else {
      list.setSelection(selection.concat(focus), fakeKeyboardEvent);
    }
  }
}
function revealFocusedStickyScroll(tree, postRevealAction) {
  const focus = tree.getStickyScrollFocus();
  if (focus.length === 0) {
    throw new Error(`StickyScroll has no focus`);
  }
  if (focus.length > 1) {
    throw new Error(`StickyScroll can only have a single focused item`);
  }
  tree.reveal(focus[0]);
  tree.getHTMLElement().focus();
  tree.setFocus(focus);
  postRevealAction?.(focus[0]);
}
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.expandSelectionDown",
  weight: KeybindingWeight.WorkbenchContrib,
  when: ContextKeyExpr.and(
    WorkbenchListFocusContextKey,
    WorkbenchListSupportsMultiSelectContextKey
  ),
  primary: KeyMod.Shift | KeyCode.DownArrow,
  handler: (accessor, arg2) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget) {
      return;
    }
    const previousFocus = widget.getFocus() ? widget.getFocus()[0] : void 0;
    const fakeKeyboardEvent = new KeyboardEvent("keydown");
    widget.focusNext(
      typeof arg2 === "number" ? arg2 : 1,
      false,
      fakeKeyboardEvent
    );
    expandMultiSelection(widget, previousFocus);
    const focus = widget.getFocus();
    if (focus.length) {
      widget.reveal(focus[0]);
    }
    ensureDOMFocus(widget);
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.expandSelectionUp",
  weight: KeybindingWeight.WorkbenchContrib,
  when: ContextKeyExpr.and(
    WorkbenchListFocusContextKey,
    WorkbenchListSupportsMultiSelectContextKey
  ),
  primary: KeyMod.Shift | KeyCode.UpArrow,
  handler: (accessor, arg2) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget) {
      return;
    }
    const previousFocus = widget.getFocus() ? widget.getFocus()[0] : void 0;
    const fakeKeyboardEvent = new KeyboardEvent("keydown");
    widget.focusPrevious(
      typeof arg2 === "number" ? arg2 : 1,
      false,
      fakeKeyboardEvent
    );
    expandMultiSelection(widget, previousFocus);
    const focus = widget.getFocus();
    if (focus.length) {
      widget.reveal(focus[0]);
    }
    ensureDOMFocus(widget);
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.collapse",
  weight: KeybindingWeight.WorkbenchContrib,
  when: ContextKeyExpr.and(
    WorkbenchListFocusContextKey,
    ContextKeyExpr.or(
      WorkbenchTreeElementCanCollapse,
      WorkbenchTreeElementHasParent
    )
  ),
  primary: KeyCode.LeftArrow,
  mac: {
    primary: KeyCode.LeftArrow,
    secondary: [KeyMod.CtrlCmd | KeyCode.UpArrow]
  },
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget || !(widget instanceof ObjectTree || widget instanceof DataTree || widget instanceof AsyncDataTree)) {
      return;
    }
    const tree = widget;
    const focusedElements = tree.getFocus();
    if (focusedElements.length === 0) {
      return;
    }
    const focus = focusedElements[0];
    if (!tree.collapse(focus)) {
      const parent = tree.getParentElement(focus);
      if (parent) {
        navigate(widget, (widget2) => {
          const fakeKeyboardEvent = new KeyboardEvent("keydown");
          widget2.setFocus([parent], fakeKeyboardEvent);
        });
      }
    }
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.stickyScroll.collapse",
  weight: KeybindingWeight.WorkbenchContrib + 50,
  when: WorkbenchTreeStickyScrollFocused,
  primary: KeyCode.LeftArrow,
  mac: {
    primary: KeyCode.LeftArrow,
    secondary: [KeyMod.CtrlCmd | KeyCode.UpArrow]
  },
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget || !(widget instanceof ObjectTree || widget instanceof DataTree || widget instanceof AsyncDataTree)) {
      return;
    }
    revealFocusedStickyScroll(widget, (focus) => widget.collapse(focus));
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.collapseAll",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  primary: KeyMod.CtrlCmd | KeyCode.LeftArrow,
  mac: {
    primary: KeyMod.CtrlCmd | KeyCode.LeftArrow,
    secondary: [KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.UpArrow]
  },
  handler: (accessor) => {
    const focused = accessor.get(IListService).lastFocusedList;
    if (focused && !(focused instanceof List || focused instanceof PagedList || focused instanceof Table)) {
      focused.collapseAll();
    }
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.collapseAllToFocus",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  handler: (accessor) => {
    const focused = accessor.get(IListService).lastFocusedList;
    const fakeKeyboardEvent = getSelectionKeyboardEvent("keydown", true);
    if (focused instanceof ObjectTree || focused instanceof DataTree || focused instanceof AsyncDataTree) {
      const tree = focused;
      const focus = tree.getFocus();
      if (focus.length > 0) {
        tree.collapse(focus[0], true);
      }
      tree.setSelection(focus, fakeKeyboardEvent);
      tree.setAnchor(focus[0]);
    }
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.focusParent",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget || !(widget instanceof ObjectTree || widget instanceof DataTree || widget instanceof AsyncDataTree)) {
      return;
    }
    const tree = widget;
    const focusedElements = tree.getFocus();
    if (focusedElements.length === 0) {
      return;
    }
    const focus = focusedElements[0];
    const parent = tree.getParentElement(focus);
    if (parent) {
      navigate(widget, (widget2) => {
        const fakeKeyboardEvent = new KeyboardEvent("keydown");
        widget2.setFocus([parent], fakeKeyboardEvent);
      });
    }
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.expand",
  weight: KeybindingWeight.WorkbenchContrib,
  when: ContextKeyExpr.and(
    WorkbenchListFocusContextKey,
    ContextKeyExpr.or(
      WorkbenchTreeElementCanExpand,
      WorkbenchTreeElementHasChild
    )
  ),
  primary: KeyCode.RightArrow,
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget) {
      return;
    }
    if (widget instanceof ObjectTree || widget instanceof DataTree) {
      const focusedElements = widget.getFocus();
      if (focusedElements.length === 0) {
        return;
      }
      const focus = focusedElements[0];
      if (!widget.expand(focus)) {
        const child = widget.getFirstElementChild(focus);
        if (child) {
          const node = widget.getNode(child);
          if (node.visible) {
            navigate(widget, (widget2) => {
              const fakeKeyboardEvent = new KeyboardEvent(
                "keydown"
              );
              widget2.setFocus([child], fakeKeyboardEvent);
            });
          }
        }
      }
    } else if (widget instanceof AsyncDataTree) {
      const focusedElements = widget.getFocus();
      if (focusedElements.length === 0) {
        return;
      }
      const focus = focusedElements[0];
      widget.expand(focus).then((didExpand) => {
        if (focus && !didExpand) {
          const child = widget.getFirstElementChild(focus);
          if (child) {
            const node = widget.getNode(child);
            if (node.visible) {
              navigate(widget, (widget2) => {
                const fakeKeyboardEvent = new KeyboardEvent(
                  "keydown"
                );
                widget2.setFocus([child], fakeKeyboardEvent);
              });
            }
          }
        }
      });
    }
  }
});
function selectElement(accessor, retainCurrentFocus) {
  const focused = accessor.get(IListService).lastFocusedList;
  const fakeKeyboardEvent = getSelectionKeyboardEvent(
    "keydown",
    retainCurrentFocus
  );
  if (focused instanceof List || focused instanceof PagedList || focused instanceof Table) {
    const list = focused;
    list.setAnchor(list.getFocus()[0]);
    list.setSelection(list.getFocus(), fakeKeyboardEvent);
  } else if (focused instanceof ObjectTree || focused instanceof DataTree || focused instanceof AsyncDataTree) {
    const tree = focused;
    const focus = tree.getFocus();
    if (focus.length > 0) {
      let toggleCollapsed = true;
      if (tree.expandOnlyOnTwistieClick === true) {
        toggleCollapsed = false;
      } else if (typeof tree.expandOnlyOnTwistieClick !== "boolean" && tree.expandOnlyOnTwistieClick(focus[0])) {
        toggleCollapsed = false;
      }
      if (toggleCollapsed) {
        tree.toggleCollapsed(focus[0]);
      }
    }
    tree.setAnchor(focus[0]);
    tree.setSelection(focus, fakeKeyboardEvent);
  }
}
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.select",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  primary: KeyCode.Enter,
  mac: {
    primary: KeyCode.Enter,
    secondary: [KeyMod.CtrlCmd | KeyCode.DownArrow]
  },
  handler: (accessor) => {
    selectElement(accessor, false);
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.stickyScrollselect",
  weight: KeybindingWeight.WorkbenchContrib + 50,
  // priorities over file explorer
  when: WorkbenchTreeStickyScrollFocused,
  primary: KeyCode.Enter,
  mac: {
    primary: KeyCode.Enter,
    secondary: [KeyMod.CtrlCmd | KeyCode.DownArrow]
  },
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget || !(widget instanceof ObjectTree || widget instanceof DataTree || widget instanceof AsyncDataTree)) {
      return;
    }
    revealFocusedStickyScroll(
      widget,
      (focus) => widget.setSelection([focus])
    );
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.selectAndPreserveFocus",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  handler: (accessor) => {
    selectElement(accessor, true);
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.selectAll",
  weight: KeybindingWeight.WorkbenchContrib,
  when: ContextKeyExpr.and(
    WorkbenchListFocusContextKey,
    WorkbenchListSupportsMultiSelectContextKey
  ),
  primary: KeyMod.CtrlCmd | KeyCode.KeyA,
  handler: (accessor) => {
    const focused = accessor.get(IListService).lastFocusedList;
    if (focused instanceof List || focused instanceof PagedList || focused instanceof Table) {
      const list = focused;
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      list.setSelection(range(list.length), fakeKeyboardEvent);
    } else if (focused instanceof ObjectTree || focused instanceof DataTree || focused instanceof AsyncDataTree) {
      const tree = focused;
      const focus = tree.getFocus();
      const selection = tree.getSelection();
      let start;
      if (focus.length > 0 && (selection.length === 0 || !selection.includes(focus[0]))) {
        start = focus[0];
      }
      if (!start && selection.length > 0) {
        start = selection[0];
      }
      let scope;
      if (start) {
        scope = tree.getParentElement(start);
      } else {
        scope = void 0;
      }
      const newSelection = [];
      const visit = (node) => {
        for (const child of node.children) {
          if (child.visible) {
            newSelection.push(child.element);
            if (!child.collapsed) {
              visit(child);
            }
          }
        }
      };
      visit(tree.getNode(scope));
      if (scope && selection.length === newSelection.length) {
        newSelection.unshift(scope);
      }
      const fakeKeyboardEvent = new KeyboardEvent("keydown");
      tree.setSelection(newSelection, fakeKeyboardEvent);
    }
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.toggleSelection",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Enter,
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget) {
      return;
    }
    const focus = widget.getFocus();
    if (focus.length === 0) {
      return;
    }
    const selection = widget.getSelection();
    const index = selection.indexOf(focus[0]);
    if (index > -1) {
      widget.setSelection([
        ...selection.slice(0, index),
        ...selection.slice(index + 1)
      ]);
    } else {
      widget.setSelection([...selection, focus[0]]);
    }
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.showHover",
  weight: KeybindingWeight.WorkbenchContrib,
  primary: KeyChord(
    KeyMod.CtrlCmd | KeyCode.KeyK,
    KeyMod.CtrlCmd | KeyCode.KeyI
  ),
  when: WorkbenchListFocusContextKey,
  handler: async (accessor, ...args) => {
    const listService = accessor.get(IListService);
    const lastFocusedList = listService.lastFocusedList;
    if (!lastFocusedList) {
      return;
    }
    const focus = lastFocusedList.getFocus();
    if (!focus || focus.length === 0) {
      return;
    }
    const treeDOM = lastFocusedList.getHTMLElement();
    const scrollableElement = treeDOM.querySelector(
      ".monaco-scrollable-element"
    );
    const listRows = scrollableElement?.querySelector(".monaco-list-rows");
    const focusedElement = listRows?.querySelector(".focused");
    if (!focusedElement) {
      return;
    }
    const elementWithHover = getCustomHoverForElement(
      focusedElement
    );
    if (elementWithHover) {
      accessor.get(IHoverService).showManagedHover(elementWithHover);
    }
  }
});
function getCustomHoverForElement(element) {
  if (element.matches('[custom-hover="true"]')) {
    return element;
  }
  const noneFocusableElementWithHover = element.querySelector(
    '[custom-hover="true"]:not([tabindex]):not(.action-item)'
  );
  if (noneFocusableElementWithHover) {
    return noneFocusableElementWithHover;
  }
  return void 0;
}
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.toggleExpand",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  primary: KeyCode.Space,
  handler: (accessor) => {
    const focused = accessor.get(IListService).lastFocusedList;
    if (focused instanceof ObjectTree || focused instanceof DataTree || focused instanceof AsyncDataTree) {
      const tree = focused;
      const focus = tree.getFocus();
      if (focus.length > 0 && tree.isCollapsible(focus[0])) {
        tree.toggleCollapsed(focus[0]);
        return;
      }
    }
    selectElement(accessor, true);
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.stickyScrolltoggleExpand",
  weight: KeybindingWeight.WorkbenchContrib + 50,
  // priorities over file explorer
  when: WorkbenchTreeStickyScrollFocused,
  primary: KeyCode.Space,
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget || !(widget instanceof ObjectTree || widget instanceof DataTree || widget instanceof AsyncDataTree)) {
      return;
    }
    revealFocusedStickyScroll(widget);
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.clear",
  weight: KeybindingWeight.WorkbenchContrib,
  when: ContextKeyExpr.and(
    WorkbenchListFocusContextKey,
    WorkbenchListHasSelectionOrFocus
  ),
  primary: KeyCode.Escape,
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (!widget) {
      return;
    }
    const selection = widget.getSelection();
    const fakeKeyboardEvent = new KeyboardEvent("keydown");
    if (selection.length > 1) {
      const useSelectionNavigation = WorkbenchListSelectionNavigation.getValue(
        widget.contextKeyService
      );
      if (useSelectionNavigation) {
        const focus = widget.getFocus();
        widget.setSelection([focus[0]], fakeKeyboardEvent);
      } else {
        widget.setSelection([], fakeKeyboardEvent);
      }
    } else {
      widget.setSelection([], fakeKeyboardEvent);
      widget.setFocus([], fakeKeyboardEvent);
    }
    widget.setAnchor(void 0);
  }
});
CommandsRegistry.registerCommand({
  id: "list.triggerTypeNavigation",
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    widget?.triggerTypeNavigation();
  }
});
CommandsRegistry.registerCommand({
  id: "list.toggleFindMode",
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (widget instanceof AbstractTree || widget instanceof AsyncDataTree) {
      const tree = widget;
      tree.findMode = tree.findMode === TreeFindMode.Filter ? TreeFindMode.Highlight : TreeFindMode.Filter;
    }
  }
});
CommandsRegistry.registerCommand({
  id: "list.toggleFindMatchType",
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (widget instanceof AbstractTree || widget instanceof AsyncDataTree) {
      const tree = widget;
      tree.findMatchType = tree.findMatchType === TreeFindMatchType.Contiguous ? TreeFindMatchType.Fuzzy : TreeFindMatchType.Contiguous;
    }
  }
});
CommandsRegistry.registerCommandAlias(
  "list.toggleKeyboardNavigation",
  "list.triggerTypeNavigation"
);
CommandsRegistry.registerCommandAlias(
  "list.toggleFilterOnType",
  "list.toggleFindMode"
);
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.find",
  weight: KeybindingWeight.WorkbenchContrib,
  when: ContextKeyExpr.and(
    RawWorkbenchListFocusContextKey,
    WorkbenchListSupportsFind
  ),
  primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyF,
  secondary: [KeyCode.F3],
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (widget instanceof List || widget instanceof PagedList || widget instanceof Table) {
    } else if (widget instanceof AbstractTree || widget instanceof AsyncDataTree) {
      const tree = widget;
      tree.openFind();
    }
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.closeFind",
  weight: KeybindingWeight.WorkbenchContrib,
  when: ContextKeyExpr.and(
    RawWorkbenchListFocusContextKey,
    WorkbenchTreeFindOpen
  ),
  primary: KeyCode.Escape,
  handler: (accessor) => {
    const widget = accessor.get(IListService).lastFocusedList;
    if (widget instanceof AbstractTree || widget instanceof AsyncDataTree) {
      const tree = widget;
      tree.closeFind();
    }
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.scrollUp",
  weight: KeybindingWeight.WorkbenchContrib,
  // Since the default keybindings for list.scrollUp and widgetNavigation.focusPrevious
  // are both Ctrl+UpArrow, we disable this command when the scrollbar is at
  // top-most position. This will give chance for widgetNavigation.focusPrevious to execute
  when: ContextKeyExpr.and(
    WorkbenchListFocusContextKey,
    WorkbenchListScrollAtTopContextKey?.negate()
  ),
  primary: KeyMod.CtrlCmd | KeyCode.UpArrow,
  handler: (accessor) => {
    const focused = accessor.get(IListService).lastFocusedList;
    if (!focused) {
      return;
    }
    focused.scrollTop -= 10;
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.scrollDown",
  weight: KeybindingWeight.WorkbenchContrib,
  // same as above
  when: ContextKeyExpr.and(
    WorkbenchListFocusContextKey,
    WorkbenchListScrollAtBottomContextKey?.negate()
  ),
  primary: KeyMod.CtrlCmd | KeyCode.DownArrow,
  handler: (accessor) => {
    const focused = accessor.get(IListService).lastFocusedList;
    if (!focused) {
      return;
    }
    focused.scrollTop += 10;
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.scrollLeft",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  handler: (accessor) => {
    const focused = accessor.get(IListService).lastFocusedList;
    if (!focused) {
      return;
    }
    focused.scrollLeft -= 10;
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.scrollRight",
  weight: KeybindingWeight.WorkbenchContrib,
  when: WorkbenchListFocusContextKey,
  handler: (accessor) => {
    const focused = accessor.get(IListService).lastFocusedList;
    if (!focused) {
      return;
    }
    focused.scrollLeft += 10;
  }
});
registerAction2(
  class ToggleStickyScroll extends Action2 {
    constructor() {
      super({
        id: "tree.toggleStickyScroll",
        title: {
          ...localize2(
            "toggleTreeStickyScroll",
            "Toggle Tree Sticky Scroll"
          ),
          mnemonicTitle: localize(
            {
              key: "mitoggleTreeStickyScroll",
              comment: ["&& denotes a mnemonic"]
            },
            "&&Toggle Tree Sticky Scroll"
          )
        },
        category: "View",
        metadata: {
          description: localize(
            "toggleTreeStickyScrollDescription",
            "Toggles Sticky Scroll widget at the top of tree structures such as the File Explorer and Debug variables View."
          )
        },
        f1: true
      });
    }
    run(accessor) {
      const configurationService = accessor.get(IConfigurationService);
      const newValue = !configurationService.getValue(
        "workbench.tree.enableStickyScroll"
      );
      configurationService.updateValue(
        "workbench.tree.enableStickyScroll",
        newValue
      );
    }
  }
);
