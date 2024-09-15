import { workbenchCalculateActions, workbenchDynamicCalculateActions } from "../../browser/viewParts/notebookEditorToolbar.js";
import { Action, IAction, Separator } from "../../../../../base/common/actions.js";
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
suite("Workbench Toolbar calculateActions (strategy always + never)", () => {
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  const defaultSecondaryActionModels = [
    { action: new Action("secondaryAction0", "Secondary Action 0"), size: 50, visible: true, renderLabel: true },
    { action: new Action("secondaryAction1", "Secondary Action 1"), size: 50, visible: true, renderLabel: true },
    { action: new Action("secondaryAction2", "Secondary Action 2"), size: 50, visible: true, renderLabel: true }
  ];
  const defaultSecondaryActions = defaultSecondaryActionModels.map((action) => action.action);
  const separator = { action: new Separator(), size: 1, visible: true, renderLabel: true };
  setup(function() {
    defaultSecondaryActionModels.forEach((action) => disposables.add(action.action));
  });
  test("should return empty primary and secondary actions when given empty initial actions", () => {
    const result = workbenchCalculateActions([], [], 100);
    assert.deepEqual(result.primaryActions, []);
    assert.deepEqual(result.secondaryActions, []);
  });
  test("should return all primary actions when they fit within the container width", () => {
    const actions = [
      { action: disposables.add(new Action("action0", "Action 0")), size: 50, visible: true, renderLabel: true },
      { action: disposables.add(new Action("action1", "Action 1")), size: 50, visible: true, renderLabel: true },
      { action: disposables.add(new Action("action2", "Action 2")), size: 50, visible: true, renderLabel: true }
    ];
    const result = workbenchCalculateActions(actions, defaultSecondaryActions, 200);
    assert.deepEqual(result.primaryActions, actions);
    assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
  });
  test("should move actions to secondary when they do not fit within the container width", () => {
    const actions = [
      { action: disposables.add(new Action("action0", "Action 0")), size: 50, visible: true, renderLabel: true },
      { action: disposables.add(new Action("action1", "Action 1")), size: 50, visible: true, renderLabel: true },
      { action: disposables.add(new Action("action2", "Action 2")), size: 50, visible: true, renderLabel: true }
    ];
    const result = workbenchCalculateActions(actions, defaultSecondaryActions, 100);
    assert.deepEqual(result.primaryActions, [actions[0]]);
    assert.deepEqual(result.secondaryActions, [actions[1], actions[2], separator, ...defaultSecondaryActionModels].map((action) => action.action));
  });
  test("should ignore second separator when two separators are in a row", () => {
    const actions = [
      { action: disposables.add(new Action("action0", "Action 0")), size: 50, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: disposables.add(new Action("action1", "Action 1")), size: 50, visible: true, renderLabel: true }
    ];
    const result = workbenchCalculateActions(actions, defaultSecondaryActions, 125);
    assert.deepEqual(result.primaryActions, [actions[0], actions[1], actions[3]]);
    assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
  });
  test("should ignore separators when they are at the end of the resulting primary actions", () => {
    const actions = [
      { action: disposables.add(new Action("action0", "Action 0")), size: 50, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: disposables.add(new Action("action1", "Action 1")), size: 50, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true }
    ];
    const result = workbenchCalculateActions(actions, defaultSecondaryActions, 200);
    assert.deepEqual(result.primaryActions, [actions[0], actions[1], actions[2]]);
    assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
  });
  test("should keep actions with size 0 in primary actions", () => {
    const actions = [
      { action: disposables.add(new Action("action0", "Action 0")), size: 50, visible: true, renderLabel: true },
      { action: disposables.add(new Action("action1", "Action 1")), size: 50, visible: true, renderLabel: true },
      { action: disposables.add(new Action("action2", "Action 2")), size: 50, visible: true, renderLabel: true },
      { action: disposables.add(new Action("action3", "Action 3")), size: 0, visible: true, renderLabel: true }
    ];
    const result = workbenchCalculateActions(actions, defaultSecondaryActions, 116);
    assert.deepEqual(result.primaryActions, [actions[0], actions[1], actions[3]]);
    assert.deepEqual(result.secondaryActions, [actions[2], separator, ...defaultSecondaryActionModels].map((action) => action.action));
  });
  test("should not render separator if preceeded by size 0 action(s).", () => {
    const actions = [
      { action: disposables.add(new Action("action0", "Action 0")), size: 0, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: disposables.add(new Action("action1", "Action 1")), size: 50, visible: true, renderLabel: true }
    ];
    const result = workbenchCalculateActions(actions, defaultSecondaryActions, 116);
    assert.deepEqual(result.primaryActions, [actions[0], actions[2]]);
    assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
  });
  test("should not render second separator if space between is hidden (size 0) actions.", () => {
    const actions = [
      { action: disposables.add(new Action("action0", "Action 0")), size: 50, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: disposables.add(new Action("action1", "Action 1")), size: 0, visible: true, renderLabel: true },
      { action: disposables.add(new Action("action2", "Action 2")), size: 0, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: disposables.add(new Action("action3", "Action 3")), size: 50, visible: true, renderLabel: true }
    ];
    const result = workbenchCalculateActions(actions, defaultSecondaryActions, 300);
    assert.deepEqual(result.primaryActions, [actions[0], actions[1], actions[2], actions[3], actions[5]]);
    assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
  });
});
suite("Workbench Toolbar Dynamic calculateActions (strategy dynamic)", () => {
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  const actionTemplate = [
    new Action("action0", "Action 0"),
    new Action("action1", "Action 1"),
    new Action("action2", "Action 2"),
    new Action("action3", "Action 3")
  ];
  const defaultSecondaryActionModels = [
    { action: new Action("secondaryAction0", "Secondary Action 0"), size: 50, visible: true, renderLabel: true },
    { action: new Action("secondaryAction1", "Secondary Action 1"), size: 50, visible: true, renderLabel: true },
    { action: new Action("secondaryAction2", "Secondary Action 2"), size: 50, visible: true, renderLabel: true }
  ];
  const defaultSecondaryActions = defaultSecondaryActionModels.map((action) => action.action);
  setup(function() {
    defaultSecondaryActionModels.forEach((action) => disposables.add(action.action));
  });
  test("should return empty primary and secondary actions when given empty initial actions", () => {
    const result = workbenchDynamicCalculateActions([], [], 100);
    assert.deepEqual(result.primaryActions, []);
    assert.deepEqual(result.secondaryActions, []);
  });
  test("should return all primary actions as visiblewhen they fit within the container width", () => {
    const constainerSize = 200;
    const input = [
      { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
      { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
      { action: actionTemplate[2], size: 50, visible: true, renderLabel: true }
    ];
    const expected = [
      { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
      { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
      { action: actionTemplate[2], size: 50, visible: true, renderLabel: true }
    ];
    const result = workbenchDynamicCalculateActions(input, defaultSecondaryActions, constainerSize);
    assert.deepEqual(result.primaryActions, expected);
    assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
  });
  test("actions all within a group that cannot all fit, will all be icon only", () => {
    const containerSize = 150;
    const input = [
      { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
      { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
      { action: actionTemplate[2], size: 50, visible: true, renderLabel: true }
    ];
    const expected = [
      { action: actionTemplate[0], size: 50, visible: true, renderLabel: false },
      { action: actionTemplate[1], size: 50, visible: true, renderLabel: false },
      { action: actionTemplate[2], size: 50, visible: true, renderLabel: false }
    ];
    const result = workbenchDynamicCalculateActions(input, defaultSecondaryActions, containerSize);
    assert.deepEqual(result.primaryActions, expected);
    assert.deepEqual(result.secondaryActions, [...defaultSecondaryActionModels].map((action) => action.action));
  });
  test("should ignore second separator when two separators are in a row", () => {
    const containerSize = 200;
    const input = [
      { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: actionTemplate[1], size: 50, visible: true, renderLabel: true }
    ];
    const expected = [
      { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: actionTemplate[1], size: 50, visible: true, renderLabel: true }
    ];
    const result = workbenchDynamicCalculateActions(input, defaultSecondaryActions, containerSize);
    assert.deepEqual(result.primaryActions, expected);
    assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
  });
  test("check label visibility in different groupings", () => {
    const containerSize = 150;
    const actions = [
      { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
      { action: actionTemplate[2], size: 50, visible: true, renderLabel: true }
    ];
    const expectedOutputActions = [
      { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: actionTemplate[1], size: 50, visible: true, renderLabel: false },
      { action: actionTemplate[2], size: 50, visible: true, renderLabel: false }
    ];
    const result = workbenchDynamicCalculateActions(actions, defaultSecondaryActions, containerSize);
    assert.deepEqual(result.primaryActions, expectedOutputActions);
    assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
  });
  test("should ignore separators when they are at the end of the resulting primary actions", () => {
    const containerSize = 200;
    const input = [
      { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true }
    ];
    const expected = [
      { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: actionTemplate[1], size: 50, visible: true, renderLabel: true }
    ];
    const result = workbenchDynamicCalculateActions(input, defaultSecondaryActions, containerSize);
    assert.deepEqual(result.primaryActions, expected);
    assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
  });
  test("should keep actions with size 0 in primary actions", () => {
    const containerSize = 170;
    const input = [
      { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
      { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: actionTemplate[2], size: 50, visible: true, renderLabel: true },
      { action: actionTemplate[3], size: 0, visible: true, renderLabel: true }
    ];
    const expected = [
      { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
      { action: actionTemplate[1], size: 50, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: actionTemplate[2], size: 50, visible: true, renderLabel: false },
      { action: actionTemplate[3], size: 0, visible: true, renderLabel: false }
    ];
    const result = workbenchDynamicCalculateActions(input, defaultSecondaryActions, containerSize);
    assert.deepEqual(result.primaryActions, expected);
    assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
  });
  test("should not render separator if preceeded by size 0 action(s), but keep size 0 action in primary.", () => {
    const containerSize = 116;
    const input = [
      { action: actionTemplate[0], size: 0, visible: true, renderLabel: true },
      // hidden
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      // sep
      { action: actionTemplate[1], size: 50, visible: true, renderLabel: true }
      // visible
    ];
    const expected = [
      { action: actionTemplate[0], size: 0, visible: true, renderLabel: true },
      // hidden
      { action: actionTemplate[1], size: 50, visible: true, renderLabel: true }
      // visible
    ];
    const result = workbenchDynamicCalculateActions(input, defaultSecondaryActions, containerSize);
    assert.deepEqual(result.primaryActions, expected);
    assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
  });
  test("should not render second separator if space between is hidden (size 0) actions.", () => {
    const containerSize = 300;
    const input = [
      { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: actionTemplate[1], size: 0, visible: true, renderLabel: true },
      { action: actionTemplate[2], size: 0, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: actionTemplate[3], size: 50, visible: true, renderLabel: true }
    ];
    const expected = [
      { action: actionTemplate[0], size: 50, visible: true, renderLabel: true },
      { action: new Separator(), size: 1, visible: true, renderLabel: true },
      { action: actionTemplate[1], size: 0, visible: true, renderLabel: true },
      { action: actionTemplate[2], size: 0, visible: true, renderLabel: true },
      // remove separator here
      { action: actionTemplate[3], size: 50, visible: true, renderLabel: true }
    ];
    const result = workbenchDynamicCalculateActions(input, defaultSecondaryActions, containerSize);
    assert.deepEqual(result.primaryActions, expected);
    assert.deepEqual(result.secondaryActions, defaultSecondaryActions);
  });
});
//# sourceMappingURL=notebookWorkbenchToolbar.test.js.map
