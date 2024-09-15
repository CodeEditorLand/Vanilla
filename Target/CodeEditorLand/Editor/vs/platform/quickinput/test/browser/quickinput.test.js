var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { unthemedInboxStyles } from "../../../../base/browser/ui/inputbox/inputBox.js";
import { unthemedButtonStyles } from "../../../../base/browser/ui/button/button.js";
import { unthemedListStyles } from "../../../../base/browser/ui/list/listWidget.js";
import { unthemedToggleStyles } from "../../../../base/browser/ui/toggle/toggle.js";
import { Event } from "../../../../base/common/event.js";
import { raceTimeout } from "../../../../base/common/async.js";
import { unthemedCountStyles } from "../../../../base/browser/ui/countBadge/countBadge.js";
import { unthemedKeybindingLabelOptions } from "../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { unthemedProgressBarOptions } from "../../../../base/browser/ui/progressbar/progressbar.js";
import { QuickInputController } from "../../browser/quickInputController.js";
import { TestThemeService } from "../../../theme/test/common/testThemeService.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { toDisposable } from "../../../../base/common/lifecycle.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { QuickPick } from "../../browser/quickInput.js";
import { IQuickPickItem, ItemActivation } from "../../common/quickInput.js";
import { TestInstantiationService } from "../../../instantiation/test/common/instantiationServiceMock.js";
import { IThemeService } from "../../../theme/common/themeService.js";
import { IConfigurationService } from "../../../configuration/common/configuration.js";
import { TestConfigurationService } from "../../../configuration/test/common/testConfigurationService.js";
import { ILayoutService } from "../../../layout/browser/layoutService.js";
import { IContextViewService } from "../../../contextview/browser/contextView.js";
import { IListService, ListService } from "../../../list/browser/listService.js";
import { IContextKeyService } from "../../../contextkey/common/contextkey.js";
import { ContextKeyService } from "../../../contextkey/browser/contextKeyService.js";
import { NoMatchingKb } from "../../../keybinding/common/keybindingResolver.js";
import { IKeybindingService } from "../../../keybinding/common/keybinding.js";
import { ContextViewService } from "../../../contextview/browser/contextViewService.js";
import { IAccessibilityService } from "../../../accessibility/common/accessibility.js";
import { TestAccessibilityService } from "../../../accessibility/test/common/testAccessibilityService.js";
async function setupWaitTilShownListener(controller) {
  const result = await raceTimeout(new Promise((resolve) => {
    const event = controller.onShow((_) => {
      event.dispose();
      resolve(true);
    });
  }), 2e3);
  if (!result) {
    throw new Error("Cancelled");
  }
}
__name(setupWaitTilShownListener, "setupWaitTilShownListener");
suite("QuickInput", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let controller;
  setup(() => {
    const fixture = document.createElement("div");
    mainWindow.document.body.appendChild(fixture);
    store.add(toDisposable(() => fixture.remove()));
    const instantiationService = new TestInstantiationService();
    instantiationService.stub(IThemeService, new TestThemeService());
    instantiationService.stub(IConfigurationService, new TestConfigurationService());
    instantiationService.stub(IAccessibilityService, new TestAccessibilityService());
    instantiationService.stub(IListService, store.add(new ListService()));
    instantiationService.stub(ILayoutService, { activeContainer: fixture, onDidLayoutContainer: Event.None });
    instantiationService.stub(IContextViewService, store.add(instantiationService.createInstance(ContextViewService)));
    instantiationService.stub(IContextKeyService, store.add(instantiationService.createInstance(ContextKeyService)));
    instantiationService.stub(IKeybindingService, {
      mightProducePrintableCharacter() {
        return false;
      },
      softDispatch() {
        return NoMatchingKb;
      }
    });
    controller = store.add(instantiationService.createInstance(
      QuickInputController,
      {
        container: fixture,
        idPrefix: "testQuickInput",
        ignoreFocusOut() {
          return true;
        },
        returnFocus() {
        },
        backKeybindingLabel() {
          return void 0;
        },
        setContextKey() {
          return void 0;
        },
        linkOpenerDelegate(content) {
        },
        hoverDelegate: {
          showHover(options, focus) {
            return void 0;
          },
          delay: 200
        },
        styles: {
          button: unthemedButtonStyles,
          countBadge: unthemedCountStyles,
          inputBox: unthemedInboxStyles,
          toggle: unthemedToggleStyles,
          keybindingLabel: unthemedKeybindingLabelOptions,
          list: unthemedListStyles,
          progressBar: unthemedProgressBarOptions,
          widget: {
            quickInputBackground: void 0,
            quickInputForeground: void 0,
            quickInputTitleBackground: void 0,
            widgetBorder: void 0,
            widgetShadow: void 0
          },
          pickerGroup: {
            pickerGroupBorder: void 0,
            pickerGroupForeground: void 0
          }
        }
      }
    ));
    controller.layout({ height: 20, width: 40 }, 0);
  });
  test("pick - basecase", async () => {
    const item = { label: "foo" };
    const wait = setupWaitTilShownListener(controller);
    const pickPromise = controller.pick([item, { label: "bar" }]);
    await wait;
    controller.accept();
    const pick = await raceTimeout(pickPromise, 2e3);
    assert.strictEqual(pick, item);
  });
  test("pick - activeItem is honored", async () => {
    const item = { label: "foo" };
    const wait = setupWaitTilShownListener(controller);
    const pickPromise = controller.pick([{ label: "bar" }, item], { activeItem: item });
    await wait;
    controller.accept();
    const pick = await pickPromise;
    assert.strictEqual(pick, item);
  });
  test("input - basecase", async () => {
    const wait = setupWaitTilShownListener(controller);
    const inputPromise = controller.input({ value: "foo" });
    await wait;
    controller.accept();
    const value = await raceTimeout(inputPromise, 2e3);
    assert.strictEqual(value, "foo");
  });
  test("onDidChangeValue - gets triggered when .value is set", async () => {
    const quickpick = store.add(controller.createQuickPick());
    let value = void 0;
    store.add(quickpick.onDidChangeValue((e) => value = e));
    quickpick.value = "changed";
    try {
      assert.strictEqual(value, quickpick.value);
    } finally {
      quickpick.dispose();
    }
  });
  test("keepScrollPosition - works with activeItems", async () => {
    const quickpick = store.add(controller.createQuickPick());
    const items = [];
    for (let i = 0; i < 1e3; i++) {
      items.push({ label: `item ${i}` });
    }
    quickpick.items = items;
    quickpick.activeItems = [items[items.length - 1]];
    quickpick.show();
    const cursorTop = quickpick.scrollTop;
    assert.notStrictEqual(cursorTop, 0);
    quickpick.keepScrollPosition = true;
    quickpick.activeItems = [items[0]];
    assert.strictEqual(cursorTop, quickpick.scrollTop);
    quickpick.keepScrollPosition = false;
    quickpick.activeItems = [items[0]];
    assert.strictEqual(quickpick.scrollTop, 0);
  });
  test("keepScrollPosition - works with items", async () => {
    const quickpick = store.add(controller.createQuickPick());
    const items = [];
    for (let i = 0; i < 1e3; i++) {
      items.push({ label: `item ${i}` });
    }
    quickpick.items = items;
    quickpick.activeItems = [items[items.length - 1]];
    quickpick.show();
    const cursorTop = quickpick.scrollTop;
    assert.notStrictEqual(cursorTop, 0);
    quickpick.keepScrollPosition = true;
    quickpick.items = items;
    assert.strictEqual(cursorTop, quickpick.scrollTop);
    quickpick.keepScrollPosition = false;
    quickpick.items = items;
    assert.strictEqual(quickpick.scrollTop, 0);
  });
  test("selectedItems - verify previous selectedItems does not hang over to next set of items", async () => {
    const quickpick = store.add(controller.createQuickPick());
    quickpick.items = [{ label: "step 1" }];
    quickpick.show();
    void await new Promise((resolve) => {
      store.add(quickpick.onDidAccept(() => {
        quickpick.canSelectMany = true;
        quickpick.items = [{ label: "a" }, { label: "b" }, { label: "c" }];
        resolve();
      }));
      controller.accept();
    });
    controller.accept();
    assert.strictEqual(quickpick.selectedItems.length, 0);
  });
  test("activeItems - verify onDidChangeActive is triggered after setting items", async () => {
    const quickpick = store.add(controller.createQuickPick());
    const activeItemsFromEvent = [];
    store.add(quickpick.onDidChangeActive((items) => activeItemsFromEvent.push(...items)));
    quickpick.show();
    const item = { label: "step 1" };
    quickpick.items = [item];
    assert.strictEqual(activeItemsFromEvent.length, 1);
    assert.strictEqual(activeItemsFromEvent[0], item);
    assert.strictEqual(quickpick.activeItems.length, 1);
    assert.strictEqual(quickpick.activeItems[0], item);
  });
  test("activeItems - verify setting itemActivation to None still triggers onDidChangeActive after selection #207832", async () => {
    const quickpick = store.add(controller.createQuickPick());
    const item = { label: "step 1" };
    quickpick.items = [item];
    quickpick.show();
    assert.strictEqual(quickpick.activeItems[0], item);
    const activeItemsFromEvent = [];
    store.add(quickpick.onDidChangeActive((items) => activeItemsFromEvent.push(...items)));
    quickpick.itemActivation = ItemActivation.NONE;
    quickpick.items = [item];
    assert.strictEqual(activeItemsFromEvent.length, 0);
    assert.strictEqual(quickpick.activeItems.length, 0);
  });
});
//# sourceMappingURL=quickinput.test.js.map
