var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepStrictEqual } from "assert";
import { DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { TerminalCapability } from "../../../../../../platform/terminal/common/capabilities/capabilities.js";
import { TerminalCapabilityStore, TerminalCapabilityStoreMultiplexer } from "../../../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";
suite("TerminalCapabilityStore", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let capabilityStore;
  let addEvents;
  let removeEvents;
  setup(() => {
    capabilityStore = store.add(new TerminalCapabilityStore());
    store.add(capabilityStore.onDidAddCapabilityType((e) => addEvents.push(e)));
    store.add(capabilityStore.onDidRemoveCapabilityType((e) => removeEvents.push(e)));
    addEvents = [];
    removeEvents = [];
  });
  teardown(() => capabilityStore.dispose());
  test("should fire events when capabilities are added", () => {
    assertEvents(addEvents, []);
    capabilityStore.add(TerminalCapability.CwdDetection, {});
    assertEvents(addEvents, [TerminalCapability.CwdDetection]);
  });
  test("should fire events when capabilities are removed", async () => {
    assertEvents(removeEvents, []);
    capabilityStore.add(TerminalCapability.CwdDetection, {});
    assertEvents(removeEvents, []);
    capabilityStore.remove(TerminalCapability.CwdDetection);
    assertEvents(removeEvents, [TerminalCapability.CwdDetection]);
  });
  test("has should return whether a capability is present", () => {
    deepStrictEqual(capabilityStore.has(TerminalCapability.CwdDetection), false);
    capabilityStore.add(TerminalCapability.CwdDetection, {});
    deepStrictEqual(capabilityStore.has(TerminalCapability.CwdDetection), true);
    capabilityStore.remove(TerminalCapability.CwdDetection);
    deepStrictEqual(capabilityStore.has(TerminalCapability.CwdDetection), false);
  });
  test("items should reflect current state", () => {
    deepStrictEqual(Array.from(capabilityStore.items), []);
    capabilityStore.add(TerminalCapability.CwdDetection, {});
    deepStrictEqual(Array.from(capabilityStore.items), [TerminalCapability.CwdDetection]);
    capabilityStore.add(TerminalCapability.NaiveCwdDetection, {});
    deepStrictEqual(Array.from(capabilityStore.items), [TerminalCapability.CwdDetection, TerminalCapability.NaiveCwdDetection]);
    capabilityStore.remove(TerminalCapability.CwdDetection);
    deepStrictEqual(Array.from(capabilityStore.items), [TerminalCapability.NaiveCwdDetection]);
  });
});
suite("TerminalCapabilityStoreMultiplexer", () => {
  let store;
  let multiplexer;
  let store1;
  let store2;
  let addEvents;
  let removeEvents;
  setup(() => {
    store = new DisposableStore();
    multiplexer = store.add(new TerminalCapabilityStoreMultiplexer());
    multiplexer.onDidAddCapabilityType((e) => addEvents.push(e));
    multiplexer.onDidRemoveCapabilityType((e) => removeEvents.push(e));
    store1 = store.add(new TerminalCapabilityStore());
    store2 = store.add(new TerminalCapabilityStore());
    addEvents = [];
    removeEvents = [];
  });
  teardown(() => store.dispose());
  ensureNoDisposablesAreLeakedInTestSuite();
  test("should fire events when capabilities are enabled", async () => {
    assertEvents(addEvents, []);
    multiplexer.add(store1);
    multiplexer.add(store2);
    store1.add(TerminalCapability.CwdDetection, {});
    assertEvents(addEvents, [TerminalCapability.CwdDetection]);
    store2.add(TerminalCapability.NaiveCwdDetection, {});
    assertEvents(addEvents, [TerminalCapability.NaiveCwdDetection]);
  });
  test("should fire events when capabilities are disabled", async () => {
    assertEvents(removeEvents, []);
    multiplexer.add(store1);
    multiplexer.add(store2);
    store1.add(TerminalCapability.CwdDetection, {});
    store2.add(TerminalCapability.NaiveCwdDetection, {});
    assertEvents(removeEvents, []);
    store1.remove(TerminalCapability.CwdDetection);
    assertEvents(removeEvents, [TerminalCapability.CwdDetection]);
    store2.remove(TerminalCapability.NaiveCwdDetection);
    assertEvents(removeEvents, [TerminalCapability.NaiveCwdDetection]);
  });
  test("should fire events when stores are added", async () => {
    assertEvents(addEvents, []);
    store1.add(TerminalCapability.CwdDetection, {});
    assertEvents(addEvents, []);
    store2.add(TerminalCapability.NaiveCwdDetection, {});
    multiplexer.add(store1);
    multiplexer.add(store2);
    assertEvents(addEvents, [TerminalCapability.CwdDetection, TerminalCapability.NaiveCwdDetection]);
  });
  test("items should return items from all stores", () => {
    deepStrictEqual(Array.from(multiplexer.items).sort(), [].sort());
    multiplexer.add(store1);
    multiplexer.add(store2);
    store1.add(TerminalCapability.CwdDetection, {});
    deepStrictEqual(Array.from(multiplexer.items).sort(), [TerminalCapability.CwdDetection].sort());
    store1.add(TerminalCapability.CommandDetection, {});
    store2.add(TerminalCapability.NaiveCwdDetection, {});
    deepStrictEqual(Array.from(multiplexer.items).sort(), [TerminalCapability.CwdDetection, TerminalCapability.CommandDetection, TerminalCapability.NaiveCwdDetection].sort());
    store2.remove(TerminalCapability.NaiveCwdDetection);
    deepStrictEqual(Array.from(multiplexer.items).sort(), [TerminalCapability.CwdDetection, TerminalCapability.CommandDetection].sort());
  });
  test("has should return whether a capability is present", () => {
    deepStrictEqual(multiplexer.has(TerminalCapability.CwdDetection), false);
    multiplexer.add(store1);
    store1.add(TerminalCapability.CwdDetection, {});
    deepStrictEqual(multiplexer.has(TerminalCapability.CwdDetection), true);
    store1.remove(TerminalCapability.CwdDetection);
    deepStrictEqual(multiplexer.has(TerminalCapability.CwdDetection), false);
  });
});
function assertEvents(actual, expected) {
  deepStrictEqual(actual, expected);
  actual.length = 0;
}
__name(assertEvents, "assertEvents");
//# sourceMappingURL=terminalCapabilityStore.test.js.map
