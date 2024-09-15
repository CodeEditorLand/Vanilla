var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { URI } from "../../../../base/common/uri.js";
import { mock } from "../../../../base/test/common/mock.js";
import { IEditorTabDto, IEditorTabGroupDto, MainThreadEditorTabsShape, TabInputKind, TabModelOperationKind, TextInputDto } from "../../common/extHost.protocol.js";
import { ExtHostEditorTabs } from "../../common/extHostEditorTabs.js";
import { SingleProxyRPCProtocol } from "../common/testRPCProtocol.js";
import { TextMergeTabInput, TextTabInput } from "../../common/extHostTypes.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
suite("ExtHostEditorTabs", function() {
  const defaultTabDto = {
    id: "uniquestring",
    input: { kind: TabInputKind.TextInput, uri: URI.parse("file://abc/def.txt") },
    isActive: true,
    isDirty: true,
    isPinned: true,
    isPreview: false,
    label: "label1"
  };
  function createTabDto(dto) {
    return { ...defaultTabDto, ...dto };
  }
  __name(createTabDto, "createTabDto");
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  test("Ensure empty model throws when accessing active group", function() {
    const extHostEditorTabs = new ExtHostEditorTabs(
      SingleProxyRPCProtocol(new class extends mock() {
        // override/implement $moveTab or $closeTab
      }())
    );
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 0);
    assert.throws(() => extHostEditorTabs.tabGroups.activeTabGroup);
  });
  test("single tab", function() {
    const extHostEditorTabs = new ExtHostEditorTabs(
      SingleProxyRPCProtocol(new class extends mock() {
        // override/implement $moveTab or $closeTab
      }())
    );
    const tab = createTabDto({
      id: "uniquestring",
      isActive: true,
      isDirty: true,
      isPinned: true,
      label: "label1"
    });
    extHostEditorTabs.$acceptEditorTabModel([{
      isActive: true,
      viewColumn: 0,
      groupId: 12,
      tabs: [tab]
    }]);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    const [first] = extHostEditorTabs.tabGroups.all;
    assert.ok(first.activeTab);
    assert.strictEqual(first.tabs.indexOf(first.activeTab), 0);
    {
      extHostEditorTabs.$acceptEditorTabModel([{
        isActive: true,
        viewColumn: 0,
        groupId: 12,
        tabs: [tab]
      }]);
      assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
      const [first2] = extHostEditorTabs.tabGroups.all;
      assert.ok(first2.activeTab);
      assert.strictEqual(first2.tabs.indexOf(first2.activeTab), 0);
    }
  });
  test("Empty tab group", function() {
    const extHostEditorTabs = new ExtHostEditorTabs(
      SingleProxyRPCProtocol(new class extends mock() {
        // override/implement $moveTab or $closeTab
      }())
    );
    extHostEditorTabs.$acceptEditorTabModel([{
      isActive: true,
      viewColumn: 0,
      groupId: 12,
      tabs: []
    }]);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    const [first] = extHostEditorTabs.tabGroups.all;
    assert.strictEqual(first.activeTab, void 0);
    assert.strictEqual(first.tabs.length, 0);
  });
  test("Ensure tabGroup change events fires", function() {
    const extHostEditorTabs = new ExtHostEditorTabs(
      SingleProxyRPCProtocol(new class extends mock() {
        // override/implement $moveTab or $closeTab
      }())
    );
    let count = 0;
    store.add(extHostEditorTabs.tabGroups.onDidChangeTabGroups(() => count++));
    assert.strictEqual(count, 0);
    extHostEditorTabs.$acceptEditorTabModel([{
      isActive: true,
      viewColumn: 0,
      groupId: 12,
      tabs: []
    }]);
    assert.ok(extHostEditorTabs.tabGroups.activeTabGroup);
    const activeTabGroup = extHostEditorTabs.tabGroups.activeTabGroup;
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    assert.strictEqual(activeTabGroup.tabs.length, 0);
    assert.strictEqual(count, 1);
  });
  test("Check TabGroupChangeEvent properties", function() {
    const extHostEditorTabs = new ExtHostEditorTabs(
      SingleProxyRPCProtocol(new class extends mock() {
        // override/implement $moveTab or $closeTab
      }())
    );
    const group1Data = {
      isActive: true,
      viewColumn: 0,
      groupId: 12,
      tabs: []
    };
    const group2Data = { ...group1Data, groupId: 13 };
    const events = [];
    store.add(extHostEditorTabs.tabGroups.onDidChangeTabGroups((e) => events.push(e)));
    extHostEditorTabs.$acceptEditorTabModel([group1Data]);
    assert.deepStrictEqual(events, [{
      changed: [],
      closed: [],
      opened: [extHostEditorTabs.tabGroups.activeTabGroup]
    }]);
    events.length = 0;
    extHostEditorTabs.$acceptEditorTabModel([{ ...group1Data, isActive: false }, group2Data]);
    assert.deepStrictEqual(events, [{
      changed: [extHostEditorTabs.tabGroups.all[0]],
      closed: [],
      opened: [extHostEditorTabs.tabGroups.all[1]]
    }]);
    events.length = 0;
    extHostEditorTabs.$acceptEditorTabModel([group1Data, { ...group2Data, isActive: false }]);
    assert.deepStrictEqual(events, [{
      changed: extHostEditorTabs.tabGroups.all,
      closed: [],
      opened: []
    }]);
    events.length = 0;
    const oldActiveGroup = extHostEditorTabs.tabGroups.activeTabGroup;
    extHostEditorTabs.$acceptEditorTabModel([group2Data]);
    assert.deepStrictEqual(events, [{
      changed: extHostEditorTabs.tabGroups.all,
      closed: [oldActiveGroup],
      opened: []
    }]);
  });
  test("Ensure reference equality for activeTab and activeGroup", function() {
    const extHostEditorTabs = new ExtHostEditorTabs(
      SingleProxyRPCProtocol(new class extends mock() {
        // override/implement $moveTab or $closeTab
      }())
    );
    const tab = createTabDto({
      id: "uniquestring",
      isActive: true,
      isDirty: true,
      isPinned: true,
      label: "label1",
      editorId: "default"
    });
    extHostEditorTabs.$acceptEditorTabModel([{
      isActive: true,
      viewColumn: 0,
      groupId: 12,
      tabs: [tab]
    }]);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    const [first] = extHostEditorTabs.tabGroups.all;
    assert.ok(first.activeTab);
    assert.strictEqual(first.tabs.indexOf(first.activeTab), 0);
    assert.strictEqual(first.activeTab, first.tabs[0]);
    assert.strictEqual(extHostEditorTabs.tabGroups.activeTabGroup, first);
  });
  test("TextMergeTabInput surfaces in the UI", function() {
    const extHostEditorTabs = new ExtHostEditorTabs(
      SingleProxyRPCProtocol(new class extends mock() {
        // override/implement $moveTab or $closeTab
      }())
    );
    const tab = createTabDto({
      input: {
        kind: TabInputKind.TextMergeInput,
        base: URI.from({ scheme: "test", path: "base" }),
        input1: URI.from({ scheme: "test", path: "input1" }),
        input2: URI.from({ scheme: "test", path: "input2" }),
        result: URI.from({ scheme: "test", path: "result" })
      }
    });
    extHostEditorTabs.$acceptEditorTabModel([{
      isActive: true,
      viewColumn: 0,
      groupId: 12,
      tabs: [tab]
    }]);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    const [first] = extHostEditorTabs.tabGroups.all;
    assert.ok(first.activeTab);
    assert.strictEqual(first.tabs.indexOf(first.activeTab), 0);
    assert.ok(first.activeTab.input instanceof TextMergeTabInput);
  });
  test("Ensure reference stability", function() {
    const extHostEditorTabs = new ExtHostEditorTabs(
      SingleProxyRPCProtocol(new class extends mock() {
        // override/implement $moveTab or $closeTab
      }())
    );
    const tabDto = createTabDto();
    extHostEditorTabs.$acceptEditorTabModel([{
      isActive: true,
      viewColumn: 0,
      groupId: 12,
      tabs: [tabDto]
    }]);
    let all = extHostEditorTabs.tabGroups.all.map((group) => group.tabs).flat();
    assert.strictEqual(all.length, 1);
    const apiTab1 = all[0];
    assert.ok(apiTab1.input instanceof TextTabInput);
    assert.strictEqual(tabDto.input.kind, TabInputKind.TextInput);
    const dtoResource = tabDto.input.uri;
    assert.strictEqual(apiTab1.input.uri.toString(), URI.revive(dtoResource).toString());
    assert.strictEqual(apiTab1.isDirty, true);
    const tabDto2 = { ...tabDto, isDirty: false };
    extHostEditorTabs.$acceptTabOperation({
      kind: TabModelOperationKind.TAB_UPDATE,
      index: 0,
      tabDto: tabDto2,
      groupId: 12
    });
    all = extHostEditorTabs.tabGroups.all.map((group) => group.tabs).flat();
    assert.strictEqual(all.length, 1);
    const apiTab2 = all[0];
    assert.ok(apiTab1.input instanceof TextTabInput);
    assert.strictEqual(apiTab1.input.uri.toString(), URI.revive(dtoResource).toString());
    assert.strictEqual(apiTab2.isDirty, false);
    assert.strictEqual(apiTab1 === apiTab2, true);
  });
  test("Tab.isActive working", function() {
    const extHostEditorTabs = new ExtHostEditorTabs(
      SingleProxyRPCProtocol(new class extends mock() {
        // override/implement $moveTab or $closeTab
      }())
    );
    const tabDtoAAA = createTabDto({
      id: "AAA",
      isActive: true,
      isDirty: true,
      isPinned: true,
      label: "label1",
      input: { kind: TabInputKind.TextInput, uri: URI.parse("file://abc/AAA.txt") },
      editorId: "default"
    });
    const tabDtoBBB = createTabDto({
      id: "BBB",
      isActive: false,
      isDirty: true,
      isPinned: true,
      label: "label1",
      input: { kind: TabInputKind.TextInput, uri: URI.parse("file://abc/BBB.txt") },
      editorId: "default"
    });
    extHostEditorTabs.$acceptEditorTabModel([{
      isActive: true,
      viewColumn: 0,
      groupId: 12,
      tabs: [tabDtoAAA, tabDtoBBB]
    }]);
    const all = extHostEditorTabs.tabGroups.all.map((group) => group.tabs).flat();
    assert.strictEqual(all.length, 2);
    const activeTab1 = extHostEditorTabs.tabGroups.activeTabGroup?.activeTab;
    assert.ok(activeTab1?.input instanceof TextTabInput);
    assert.strictEqual(tabDtoAAA.input.kind, TabInputKind.TextInput);
    const dtoAAAResource = tabDtoAAA.input.uri;
    assert.strictEqual(activeTab1?.input?.uri.toString(), URI.revive(dtoAAAResource)?.toString());
    assert.strictEqual(activeTab1?.isActive, true);
    extHostEditorTabs.$acceptTabOperation({
      groupId: 12,
      index: 1,
      kind: TabModelOperationKind.TAB_UPDATE,
      tabDto: { ...tabDtoBBB, isActive: true }
      /// BBB is now active
    });
    const activeTab2 = extHostEditorTabs.tabGroups.activeTabGroup?.activeTab;
    assert.ok(activeTab2?.input instanceof TextTabInput);
    assert.strictEqual(tabDtoBBB.input.kind, TabInputKind.TextInput);
    const dtoBBBResource = tabDtoBBB.input.uri;
    assert.strictEqual(activeTab2?.input?.uri.toString(), URI.revive(dtoBBBResource)?.toString());
    assert.strictEqual(activeTab2?.isActive, true);
    assert.strictEqual(activeTab1?.isActive, false);
  });
  test("vscode.window.tagGroups is immutable", function() {
    const extHostEditorTabs = new ExtHostEditorTabs(
      SingleProxyRPCProtocol(new class extends mock() {
        // override/implement $moveTab or $closeTab
      }())
    );
    assert.throws(() => {
      extHostEditorTabs.tabGroups.activeTabGroup = void 0;
    });
    assert.throws(() => {
      extHostEditorTabs.tabGroups.all.length = 0;
    });
    assert.throws(() => {
      extHostEditorTabs.tabGroups.onDidChangeActiveTabGroup = void 0;
    });
    assert.throws(() => {
      extHostEditorTabs.tabGroups.onDidChangeTabGroups = void 0;
    });
  });
  test("Ensure close is called with all tab ids", function() {
    const closedTabIds = [];
    const extHostEditorTabs = new ExtHostEditorTabs(
      SingleProxyRPCProtocol(new class extends mock() {
        // override/implement $moveTab or $closeTab
        async $closeTab(tabIds, preserveFocus) {
          closedTabIds.push(tabIds);
          return true;
        }
      }())
    );
    const tab = createTabDto({
      id: "uniquestring",
      isActive: true,
      isDirty: true,
      isPinned: true,
      label: "label1",
      editorId: "default"
    });
    extHostEditorTabs.$acceptEditorTabModel([{
      isActive: true,
      viewColumn: 0,
      groupId: 12,
      tabs: [tab]
    }]);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    const activeTab = extHostEditorTabs.tabGroups.activeTabGroup?.activeTab;
    assert.ok(activeTab);
    extHostEditorTabs.tabGroups.close(activeTab, false);
    assert.strictEqual(closedTabIds.length, 1);
    assert.deepStrictEqual(closedTabIds[0], ["uniquestring"]);
    extHostEditorTabs.tabGroups.close([activeTab], false);
    assert.strictEqual(closedTabIds.length, 2);
    assert.deepStrictEqual(closedTabIds[1], ["uniquestring"]);
  });
  test("Update tab only sends tab change event", async function() {
    const closedTabIds = [];
    const extHostEditorTabs = new ExtHostEditorTabs(
      SingleProxyRPCProtocol(new class extends mock() {
        // override/implement $moveTab or $closeTab
        async $closeTab(tabIds, preserveFocus) {
          closedTabIds.push(tabIds);
          return true;
        }
      }())
    );
    const tabDto = createTabDto({
      id: "uniquestring",
      isActive: true,
      isDirty: true,
      isPinned: true,
      label: "label1",
      editorId: "default"
    });
    extHostEditorTabs.$acceptEditorTabModel([{
      isActive: true,
      viewColumn: 0,
      groupId: 12,
      tabs: [tabDto]
    }]);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.map((g) => g.tabs).flat().length, 1);
    const tab = extHostEditorTabs.tabGroups.all[0].tabs[0];
    const p = new Promise((resolve) => store.add(extHostEditorTabs.tabGroups.onDidChangeTabs(resolve)));
    extHostEditorTabs.$acceptTabOperation({
      groupId: 12,
      index: 0,
      kind: TabModelOperationKind.TAB_UPDATE,
      tabDto: { ...tabDto, label: "NEW LABEL" }
    });
    const changedTab = (await p).changed[0];
    assert.ok(tab === changedTab);
    assert.strictEqual(changedTab.label, "NEW LABEL");
  });
  test("Active tab", function() {
    const extHostEditorTabs = new ExtHostEditorTabs(
      SingleProxyRPCProtocol(new class extends mock() {
        // override/implement $moveTab or $closeTab
      }())
    );
    const tab1 = createTabDto({
      id: "uniquestring",
      isActive: true,
      isDirty: true,
      isPinned: true,
      label: "label1"
    });
    const tab2 = createTabDto({
      isActive: false,
      id: "uniquestring2"
    });
    const tab3 = createTabDto({
      isActive: false,
      id: "uniquestring3"
    });
    extHostEditorTabs.$acceptEditorTabModel([{
      isActive: true,
      viewColumn: 0,
      groupId: 12,
      tabs: [tab1, tab2, tab3]
    }]);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.map((g) => g.tabs).flat().length, 3);
    assert.strictEqual(extHostEditorTabs.tabGroups.activeTabGroup?.activeTab, extHostEditorTabs.tabGroups.activeTabGroup?.tabs[0]);
    tab1.isActive = false;
    tab2.isActive = true;
    extHostEditorTabs.$acceptTabOperation({
      groupId: 12,
      index: 0,
      kind: TabModelOperationKind.TAB_UPDATE,
      tabDto: tab1
    });
    extHostEditorTabs.$acceptTabOperation({
      groupId: 12,
      index: 1,
      kind: TabModelOperationKind.TAB_UPDATE,
      tabDto: tab2
    });
    assert.strictEqual(extHostEditorTabs.tabGroups.activeTabGroup?.activeTab, extHostEditorTabs.tabGroups.activeTabGroup?.tabs[1]);
    tab3.isActive = true;
    extHostEditorTabs.$acceptEditorTabModel([{
      isActive: true,
      viewColumn: 0,
      groupId: 12,
      tabs: [tab3]
    }]);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.map((g) => g.tabs).flat().length, 1);
    assert.strictEqual(extHostEditorTabs.tabGroups.activeTabGroup?.activeTab, extHostEditorTabs.tabGroups.activeTabGroup?.tabs[0]);
    extHostEditorTabs.$acceptEditorTabModel([{
      isActive: true,
      viewColumn: 0,
      groupId: 12,
      tabs: []
    }]);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.map((g) => g.tabs).flat().length, 0);
    assert.strictEqual(extHostEditorTabs.tabGroups.activeTabGroup?.activeTab, void 0);
  });
  test("Tab operations patches open and close correctly", function() {
    const extHostEditorTabs = new ExtHostEditorTabs(
      SingleProxyRPCProtocol(new class extends mock() {
        // override/implement $moveTab or $closeTab
      }())
    );
    const tab1 = createTabDto({
      id: "uniquestring",
      isActive: true,
      label: "label1"
    });
    const tab2 = createTabDto({
      isActive: false,
      id: "uniquestring2",
      label: "label2"
    });
    const tab3 = createTabDto({
      isActive: false,
      id: "uniquestring3",
      label: "label3"
    });
    extHostEditorTabs.$acceptEditorTabModel([{
      isActive: true,
      viewColumn: 0,
      groupId: 12,
      tabs: [tab1, tab2, tab3]
    }]);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.map((g) => g.tabs).flat().length, 3);
    extHostEditorTabs.$acceptTabOperation({
      groupId: 12,
      index: 1,
      kind: TabModelOperationKind.TAB_CLOSE,
      tabDto: tab2
    });
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.map((g) => g.tabs).flat().length, 2);
    extHostEditorTabs.$acceptTabOperation({
      groupId: 12,
      index: 0,
      kind: TabModelOperationKind.TAB_CLOSE,
      tabDto: tab1
    });
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.map((g) => g.tabs).flat().length, 1);
    tab3.isActive = true;
    extHostEditorTabs.$acceptTabOperation({
      groupId: 12,
      index: 0,
      kind: TabModelOperationKind.TAB_UPDATE,
      tabDto: tab3
    });
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.map((g) => g.tabs).flat().length, 1);
    assert.strictEqual(extHostEditorTabs.tabGroups.all[0]?.activeTab?.label, "label3");
    extHostEditorTabs.$acceptTabOperation({
      groupId: 12,
      index: 1,
      kind: TabModelOperationKind.TAB_OPEN,
      tabDto: tab2
    });
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.map((g) => g.tabs).flat().length, 2);
    assert.strictEqual(extHostEditorTabs.tabGroups.all[0]?.tabs[1]?.label, "label2");
  });
  test("Tab operations patches move correctly", function() {
    const extHostEditorTabs = new ExtHostEditorTabs(
      SingleProxyRPCProtocol(new class extends mock() {
        // override/implement $moveTab or $closeTab
      }())
    );
    const tab1 = createTabDto({
      id: "uniquestring",
      isActive: true,
      label: "label1"
    });
    const tab2 = createTabDto({
      isActive: false,
      id: "uniquestring2",
      label: "label2"
    });
    const tab3 = createTabDto({
      isActive: false,
      id: "uniquestring3",
      label: "label3"
    });
    extHostEditorTabs.$acceptEditorTabModel([{
      isActive: true,
      viewColumn: 0,
      groupId: 12,
      tabs: [tab1, tab2, tab3]
    }]);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.map((g) => g.tabs).flat().length, 3);
    extHostEditorTabs.$acceptTabOperation({
      groupId: 12,
      index: 0,
      oldIndex: 1,
      kind: TabModelOperationKind.TAB_MOVE,
      tabDto: tab2
    });
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.map((g) => g.tabs).flat().length, 3);
    assert.strictEqual(extHostEditorTabs.tabGroups.all[0]?.tabs[0]?.label, "label2");
    extHostEditorTabs.$acceptTabOperation({
      groupId: 12,
      index: 1,
      oldIndex: 2,
      kind: TabModelOperationKind.TAB_MOVE,
      tabDto: tab3
    });
    assert.strictEqual(extHostEditorTabs.tabGroups.all.length, 1);
    assert.strictEqual(extHostEditorTabs.tabGroups.all.map((g) => g.tabs).flat().length, 3);
    assert.strictEqual(extHostEditorTabs.tabGroups.all[0]?.tabs[1]?.label, "label3");
    assert.strictEqual(extHostEditorTabs.tabGroups.all[0]?.tabs[0]?.label, "label2");
    assert.strictEqual(extHostEditorTabs.tabGroups.all[0]?.tabs[2]?.label, "label1");
  });
});
//# sourceMappingURL=extHostEditorTabs.test.js.map
