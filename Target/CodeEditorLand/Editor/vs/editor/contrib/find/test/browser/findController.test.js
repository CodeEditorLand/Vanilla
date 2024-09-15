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
import assert from "assert";
import { Delayer } from "../../../../../base/common/async.js";
import * as platform from "../../../../../base/common/platform.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { EditorAction } from "../../../../browser/editorExtensions.js";
import { EditOperation } from "../../../../common/core/editOperation.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { Selection } from "../../../../common/core/selection.js";
import { CommonFindController, FindStartFocusAction, IFindStartOptions, NextMatchFindAction, NextSelectionMatchFindAction, StartFindAction, StartFindReplaceAction, StartFindWithSelectionAction } from "../../browser/findController.js";
import { CONTEXT_FIND_INPUT_FOCUSED } from "../../browser/findModel.js";
import { withAsyncTestCodeEditor } from "../../../../test/browser/testCodeEditor.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { IContextKey, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { IStorageService, InMemoryStorageService, StorageScope, StorageTarget } from "../../../../../platform/storage/common/storage.js";
let TestFindController = class extends CommonFindController {
  static {
    __name(this, "TestFindController");
  }
  hasFocus;
  delayUpdateHistory = false;
  _findInputFocused;
  constructor(editor, contextKeyService, storageService, clipboardService, notificationService, hoverService) {
    super(editor, contextKeyService, storageService, clipboardService, notificationService, hoverService);
    this._findInputFocused = CONTEXT_FIND_INPUT_FOCUSED.bindTo(contextKeyService);
    this._updateHistoryDelayer = new Delayer(50);
    this.hasFocus = false;
  }
  async _start(opts) {
    await super._start(opts);
    if (opts.shouldFocus !== FindStartFocusAction.NoFocusChange) {
      this.hasFocus = true;
    }
    const inputFocused = opts.shouldFocus === FindStartFocusAction.FocusFindInput;
    this._findInputFocused.set(inputFocused);
  }
};
TestFindController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IClipboardService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IHoverService)
], TestFindController);
function fromSelection(slc) {
  return [slc.startLineNumber, slc.startColumn, slc.endLineNumber, slc.endColumn];
}
__name(fromSelection, "fromSelection");
function executeAction(instantiationService, editor, action, args) {
  return instantiationService.invokeFunction((accessor) => {
    return Promise.resolve(action.runEditorCommand(accessor, editor, args));
  });
}
__name(executeAction, "executeAction");
suite("FindController", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  let clipboardState = "";
  const serviceCollection = new ServiceCollection();
  serviceCollection.set(IStorageService, new InMemoryStorageService());
  if (platform.isMacintosh) {
    serviceCollection.set(IClipboardService, {
      readFindText: /* @__PURE__ */ __name(() => clipboardState, "readFindText"),
      writeFindText: /* @__PURE__ */ __name((value) => {
        clipboardState = value;
      }, "writeFindText")
    });
  }
  test('issue #1857: F3, Find Next, acts like "Find Under Cursor"', async () => {
    await withAsyncTestCodeEditor([
      "ABC",
      "ABC",
      "XYZ",
      "ABC"
    ], { serviceCollection }, async (editor, _, instantiationService) => {
      clipboardState = "";
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      const findState = findController.getState();
      const nextMatchFindAction = new NextMatchFindAction();
      await executeAction(instantiationService, editor, StartFindAction);
      findState.change({ searchString: "A" }, true);
      findState.change({ searchString: "AB" }, true);
      findState.change({ searchString: "ABC" }, true);
      assert.deepStrictEqual(fromSelection(editor.getSelection()), [1, 1, 1, 4]);
      findController.closeFindWidget();
      findController.hasFocus = false;
      assert.deepStrictEqual(fromSelection(editor.getSelection()), [1, 1, 1, 4]);
      editor.pushUndoStop();
      editor.executeEdits("test", [EditOperation.delete(new Range(1, 1, 1, 4))]);
      editor.executeEdits("test", [EditOperation.insert(new Position(1, 1), "XYZ")]);
      editor.pushUndoStop();
      assert.strictEqual(editor.getModel().getLineContent(1), "XYZ");
      assert.deepStrictEqual(fromSelection(editor.getSelection()), [1, 4, 1, 4]);
      await nextMatchFindAction.run(null, editor);
      assert.strictEqual(findState.searchString, "ABC");
      assert.strictEqual(findController.hasFocus, false);
      findController.dispose();
    });
  });
  test("issue #3090: F3 does not loop with two matches on a single line", async () => {
    await withAsyncTestCodeEditor([
      "import nls = require('../../../../../../vs/nls.js');"
    ], { serviceCollection }, async (editor) => {
      clipboardState = "";
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      const nextMatchFindAction = new NextMatchFindAction();
      editor.setPosition({
        lineNumber: 1,
        column: 9
      });
      await nextMatchFindAction.run(null, editor);
      assert.deepStrictEqual(fromSelection(editor.getSelection()), [1, 26, 1, 29]);
      await nextMatchFindAction.run(null, editor);
      assert.deepStrictEqual(fromSelection(editor.getSelection()), [1, 8, 1, 11]);
      findController.dispose();
    });
  });
  test("issue #6149: Auto-escape highlighted text for search and replace regex mode", async () => {
    await withAsyncTestCodeEditor([
      "var x = (3 * 5)",
      "var y = (3 * 5)",
      "var z = (3  * 5)"
    ], { serviceCollection }, async (editor, _, instantiationService) => {
      clipboardState = "";
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      const nextMatchFindAction = new NextMatchFindAction();
      editor.setSelection(new Selection(1, 9, 1, 13));
      findController.toggleRegex();
      await executeAction(instantiationService, editor, StartFindAction);
      await nextMatchFindAction.run(null, editor);
      assert.deepStrictEqual(fromSelection(editor.getSelection()), [2, 9, 2, 13]);
      await nextMatchFindAction.run(null, editor);
      assert.deepStrictEqual(fromSelection(editor.getSelection()), [1, 9, 1, 13]);
      findController.dispose();
    });
  });
  test("issue #41027: Don't replace find input value on replace action if find input is active", async () => {
    await withAsyncTestCodeEditor([
      "test"
    ], { serviceCollection }, async (editor, _, instantiationService) => {
      const testRegexString = "tes.";
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      const nextMatchFindAction = new NextMatchFindAction();
      findController.toggleRegex();
      findController.setSearchString(testRegexString);
      await findController.start({
        forceRevealReplace: false,
        seedSearchStringFromSelection: "none",
        seedSearchStringFromNonEmptySelection: false,
        seedSearchStringFromGlobalClipboard: false,
        shouldFocus: FindStartFocusAction.FocusFindInput,
        shouldAnimate: false,
        updateSearchScope: false,
        loop: true
      });
      await nextMatchFindAction.run(null, editor);
      await executeAction(instantiationService, editor, StartFindReplaceAction);
      assert.strictEqual(findController.getState().searchString, testRegexString);
      findController.dispose();
    });
  });
  test("issue #9043: Clear search scope when find widget is hidden", async () => {
    await withAsyncTestCodeEditor([
      "var x = (3 * 5)",
      "var y = (3 * 5)",
      "var z = (3 * 5)"
    ], { serviceCollection }, async (editor) => {
      clipboardState = "";
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      await findController.start({
        forceRevealReplace: false,
        seedSearchStringFromSelection: "none",
        seedSearchStringFromNonEmptySelection: false,
        seedSearchStringFromGlobalClipboard: false,
        shouldFocus: FindStartFocusAction.NoFocusChange,
        shouldAnimate: false,
        updateSearchScope: false,
        loop: true
      });
      assert.strictEqual(findController.getState().searchScope, null);
      findController.getState().change({
        searchScope: [new Range(1, 1, 1, 5)]
      }, false);
      assert.deepStrictEqual(findController.getState().searchScope, [new Range(1, 1, 1, 5)]);
      findController.closeFindWidget();
      assert.strictEqual(findController.getState().searchScope, null);
    });
  });
  test("issue #18111: Regex replace with single space replaces with no space", async () => {
    await withAsyncTestCodeEditor([
      "HRESULT OnAmbientPropertyChange(DISPID   dispid);"
    ], { serviceCollection }, async (editor, _, instantiationService) => {
      clipboardState = "";
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      await executeAction(instantiationService, editor, StartFindAction);
      findController.getState().change({ searchString: "\\b\\s{3}\\b", replaceString: " ", isRegex: true }, false);
      findController.moveToNextMatch();
      assert.deepStrictEqual(editor.getSelections().map(fromSelection), [
        [1, 39, 1, 42]
      ]);
      findController.replace();
      assert.deepStrictEqual(editor.getValue(), "HRESULT OnAmbientPropertyChange(DISPID dispid);");
      findController.dispose();
    });
  });
  test("issue #24714: Regular expression with ^ in search & replace", async () => {
    await withAsyncTestCodeEditor([
      "",
      "line2",
      "line3"
    ], { serviceCollection }, async (editor, _, instantiationService) => {
      clipboardState = "";
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      await executeAction(instantiationService, editor, StartFindAction);
      findController.getState().change({ searchString: "^", replaceString: "x", isRegex: true }, false);
      findController.moveToNextMatch();
      assert.deepStrictEqual(editor.getSelections().map(fromSelection), [
        [2, 1, 2, 1]
      ]);
      findController.replace();
      assert.deepStrictEqual(editor.getValue(), "\nxline2\nline3");
      findController.dispose();
    });
  });
  test("issue #38232: Find Next Selection, regex enabled", async () => {
    await withAsyncTestCodeEditor([
      "([funny]",
      "",
      "([funny]"
    ], { serviceCollection }, async (editor) => {
      clipboardState = "";
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      const nextSelectionMatchFindAction = new NextSelectionMatchFindAction();
      findController.getState().change({ isRegex: true }, false);
      editor.setSelection(new Selection(1, 1, 1, 9));
      await nextSelectionMatchFindAction.run(null, editor);
      assert.deepStrictEqual(editor.getSelections().map(fromSelection), [
        [3, 1, 3, 9]
      ]);
      findController.dispose();
    });
  });
  test("issue #38232: Find Next Selection, regex enabled, find widget open", async () => {
    await withAsyncTestCodeEditor([
      "([funny]",
      "",
      "([funny]"
    ], { serviceCollection }, async (editor, _, instantiationService) => {
      clipboardState = "";
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      const nextSelectionMatchFindAction = new NextSelectionMatchFindAction();
      await executeAction(instantiationService, editor, StartFindAction);
      findController.getState().change({ isRegex: true }, false);
      editor.setSelection(new Selection(1, 1, 1, 9));
      await nextSelectionMatchFindAction.run(null, editor);
      assert.deepStrictEqual(editor.getSelections().map(fromSelection), [
        [3, 1, 3, 9]
      ]);
      findController.dispose();
    });
  });
  test("issue #47400, CMD+E supports feeding multiple line of text into the find widget", async () => {
    await withAsyncTestCodeEditor([
      "ABC",
      "ABC",
      "XYZ",
      "ABC",
      "ABC"
    ], { serviceCollection }, async (editor, _, instantiationService) => {
      clipboardState = "";
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      editor.setSelection(new Selection(1, 1, 1, 1));
      await executeAction(instantiationService, editor, StartFindAction);
      editor.setSelection(new Selection(1, 1, 2, 4));
      const startFindWithSelectionAction = new StartFindWithSelectionAction();
      await startFindWithSelectionAction.run(null, editor);
      const findState = findController.getState();
      assert.deepStrictEqual(findState.searchString.split(/\r\n|\r|\n/g), ["ABC", "ABC"]);
      editor.setSelection(new Selection(3, 1, 3, 1));
      await startFindWithSelectionAction.run(null, editor);
      findController.dispose();
    });
  });
  test("issue #109756, CMD+E with empty cursor should always work", async () => {
    await withAsyncTestCodeEditor([
      "ABC",
      "ABC",
      "XYZ",
      "ABC",
      "ABC"
    ], { serviceCollection }, async (editor) => {
      clipboardState = "";
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      editor.setSelection(new Selection(1, 2, 1, 2));
      const startFindWithSelectionAction = new StartFindWithSelectionAction();
      startFindWithSelectionAction.run(null, editor);
      const findState = findController.getState();
      assert.deepStrictEqual(findState.searchString, "ABC");
      findController.dispose();
    });
  });
});
suite("FindController query options persistence", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const serviceCollection = new ServiceCollection();
  const storageService = new InMemoryStorageService();
  storageService.store("editor.isRegex", false, StorageScope.WORKSPACE, StorageTarget.USER);
  storageService.store("editor.matchCase", false, StorageScope.WORKSPACE, StorageTarget.USER);
  storageService.store("editor.wholeWord", false, StorageScope.WORKSPACE, StorageTarget.USER);
  serviceCollection.set(IStorageService, storageService);
  test("matchCase", async () => {
    await withAsyncTestCodeEditor([
      "abc",
      "ABC",
      "XYZ",
      "ABC"
    ], { serviceCollection }, async (editor, _, instantiationService) => {
      storageService.store("editor.matchCase", true, StorageScope.WORKSPACE, StorageTarget.USER);
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      const findState = findController.getState();
      await executeAction(instantiationService, editor, StartFindAction);
      findState.change({ searchString: "ABC" }, true);
      assert.deepStrictEqual(fromSelection(editor.getSelection()), [2, 1, 2, 4]);
      findController.dispose();
    });
  });
  storageService.store("editor.matchCase", false, StorageScope.WORKSPACE, StorageTarget.USER);
  storageService.store("editor.wholeWord", true, StorageScope.WORKSPACE, StorageTarget.USER);
  test("wholeWord", async () => {
    await withAsyncTestCodeEditor([
      "ABC",
      "AB",
      "XYZ",
      "ABC"
    ], { serviceCollection }, async (editor, _, instantiationService) => {
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      const findState = findController.getState();
      await executeAction(instantiationService, editor, StartFindAction);
      findState.change({ searchString: "AB" }, true);
      assert.deepStrictEqual(fromSelection(editor.getSelection()), [2, 1, 2, 3]);
      findController.dispose();
    });
  });
  test("toggling options is saved", async () => {
    await withAsyncTestCodeEditor([
      "ABC",
      "AB",
      "XYZ",
      "ABC"
    ], { serviceCollection }, async (editor) => {
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      findController.toggleRegex();
      assert.strictEqual(storageService.getBoolean("editor.isRegex", StorageScope.WORKSPACE), true);
      findController.dispose();
    });
  });
  test("issue #27083: Update search scope once find widget becomes visible", async () => {
    await withAsyncTestCodeEditor([
      "var x = (3 * 5)",
      "var y = (3 * 5)",
      "var z = (3 * 5)"
    ], { serviceCollection, find: { autoFindInSelection: "always", globalFindClipboard: false } }, async (editor) => {
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      const findConfig = {
        forceRevealReplace: false,
        seedSearchStringFromSelection: "none",
        seedSearchStringFromNonEmptySelection: false,
        seedSearchStringFromGlobalClipboard: false,
        shouldFocus: FindStartFocusAction.NoFocusChange,
        shouldAnimate: false,
        updateSearchScope: true,
        loop: true
      };
      editor.setSelection(new Range(1, 1, 2, 1));
      findController.start(findConfig);
      assert.deepStrictEqual(findController.getState().searchScope, [new Selection(1, 1, 2, 1)]);
      findController.closeFindWidget();
      editor.setSelections([new Selection(1, 1, 2, 1), new Selection(2, 1, 2, 5)]);
      findController.start(findConfig);
      assert.deepStrictEqual(findController.getState().searchScope, [new Selection(1, 1, 2, 1), new Selection(2, 1, 2, 5)]);
    });
  });
  test("issue #58604: Do not update searchScope if it is empty", async () => {
    await withAsyncTestCodeEditor([
      "var x = (3 * 5)",
      "var y = (3 * 5)",
      "var z = (3 * 5)"
    ], { serviceCollection, find: { autoFindInSelection: "always", globalFindClipboard: false } }, async (editor) => {
      editor.setSelection(new Range(1, 2, 1, 2));
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      await findController.start({
        forceRevealReplace: false,
        seedSearchStringFromSelection: "none",
        seedSearchStringFromNonEmptySelection: false,
        seedSearchStringFromGlobalClipboard: false,
        shouldFocus: FindStartFocusAction.NoFocusChange,
        shouldAnimate: false,
        updateSearchScope: true,
        loop: true
      });
      assert.deepStrictEqual(findController.getState().searchScope, null);
    });
  });
  test("issue #58604: Update searchScope if it is not empty", async () => {
    await withAsyncTestCodeEditor([
      "var x = (3 * 5)",
      "var y = (3 * 5)",
      "var z = (3 * 5)"
    ], { serviceCollection, find: { autoFindInSelection: "always", globalFindClipboard: false } }, async (editor) => {
      editor.setSelection(new Range(1, 2, 1, 3));
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      await findController.start({
        forceRevealReplace: false,
        seedSearchStringFromSelection: "none",
        seedSearchStringFromNonEmptySelection: false,
        seedSearchStringFromGlobalClipboard: false,
        shouldFocus: FindStartFocusAction.NoFocusChange,
        shouldAnimate: false,
        updateSearchScope: true,
        loop: true
      });
      assert.deepStrictEqual(findController.getState().searchScope, [new Selection(1, 2, 1, 3)]);
    });
  });
  test("issue #27083: Find in selection when multiple lines are selected", async () => {
    await withAsyncTestCodeEditor([
      "var x = (3 * 5)",
      "var y = (3 * 5)",
      "var z = (3 * 5)"
    ], { serviceCollection, find: { autoFindInSelection: "multiline", globalFindClipboard: false } }, async (editor) => {
      editor.setSelection(new Range(1, 6, 2, 1));
      const findController = editor.registerAndInstantiateContribution(TestFindController.ID, TestFindController);
      await findController.start({
        forceRevealReplace: false,
        seedSearchStringFromSelection: "none",
        seedSearchStringFromNonEmptySelection: false,
        seedSearchStringFromGlobalClipboard: false,
        shouldFocus: FindStartFocusAction.NoFocusChange,
        shouldAnimate: false,
        updateSearchScope: true,
        loop: true
      });
      assert.deepStrictEqual(findController.getState().searchScope, [new Selection(1, 6, 2, 1)]);
    });
  });
});
//# sourceMappingURL=findController.test.js.map
