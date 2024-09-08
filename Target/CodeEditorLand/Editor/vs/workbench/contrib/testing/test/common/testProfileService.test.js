import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { MockContextKeyService } from "../../../../../platform/keybinding/test/common/mockKeybindingService.js";
import { TestStorageService } from "../../../../test/common/workbenchTestServices.js";
import { TestProfileService } from "../../common/testProfileService.js";
import {
  TestRunProfileBitset
} from "../../common/testTypes.js";
suite("Workbench - TestProfileService", () => {
  let t;
  let ds;
  let idCounter = 0;
  teardown(() => {
    ds.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    idCounter = 0;
    ds = new DisposableStore();
    t = ds.add(
      new TestProfileService(
        new MockContextKeyService(),
        ds.add(new TestStorageService())
      )
    );
  });
  const addProfile = (profile) => {
    const p = {
      controllerId: "ctrlId",
      group: TestRunProfileBitset.Run,
      isDefault: true,
      label: "profile",
      profileId: idCounter++,
      hasConfigurationHandler: false,
      tag: null,
      supportsContinuousRun: false,
      ...profile
    };
    t.addProfile({ id: "ctrlId" }, p);
    return p;
  };
  const assertGroupDefaults = (group, expected) => {
    assert.deepStrictEqual(
      t.getGroupDefaultProfiles(group).map((p) => p.label),
      expected.map((e) => e.label)
    );
  };
  const expectProfiles = (expected, actual) => {
    const e = expected.map((e2) => e2.label).sort();
    const a = actual.sort();
    assert.deepStrictEqual(e, a);
  };
  test("getGroupDefaultProfiles", () => {
    addProfile({
      isDefault: true,
      group: TestRunProfileBitset.Debug,
      label: "a"
    });
    addProfile({
      isDefault: false,
      group: TestRunProfileBitset.Debug,
      label: "b"
    });
    addProfile({
      isDefault: true,
      group: TestRunProfileBitset.Run,
      label: "c"
    });
    addProfile({
      isDefault: true,
      group: TestRunProfileBitset.Run,
      label: "d",
      controllerId: "2"
    });
    addProfile({
      isDefault: false,
      group: TestRunProfileBitset.Run,
      label: "e",
      controllerId: "2"
    });
    expectProfiles(t.getGroupDefaultProfiles(TestRunProfileBitset.Run), [
      "c",
      "d"
    ]);
    expectProfiles(t.getGroupDefaultProfiles(TestRunProfileBitset.Debug), [
      "a"
    ]);
  });
  suite("setGroupDefaultProfiles", () => {
    test("applies simple changes", () => {
      const p1 = addProfile({
        isDefault: false,
        group: TestRunProfileBitset.Debug,
        label: "a"
      });
      addProfile({
        isDefault: false,
        group: TestRunProfileBitset.Debug,
        label: "b"
      });
      const p3 = addProfile({
        isDefault: false,
        group: TestRunProfileBitset.Run,
        label: "c"
      });
      addProfile({
        isDefault: false,
        group: TestRunProfileBitset.Run,
        label: "d"
      });
      t.setGroupDefaultProfiles(TestRunProfileBitset.Run, [p3]);
      assertGroupDefaults(TestRunProfileBitset.Run, [p3]);
      assertGroupDefaults(TestRunProfileBitset.Debug, [p1]);
    });
    test("syncs labels if same", () => {
      const p1 = addProfile({
        isDefault: false,
        group: TestRunProfileBitset.Debug,
        label: "a"
      });
      const p2 = addProfile({
        isDefault: false,
        group: TestRunProfileBitset.Debug,
        label: "b"
      });
      const p3 = addProfile({
        isDefault: false,
        group: TestRunProfileBitset.Run,
        label: "a"
      });
      const p4 = addProfile({
        isDefault: false,
        group: TestRunProfileBitset.Run,
        label: "b"
      });
      t.setGroupDefaultProfiles(TestRunProfileBitset.Run, [p3]);
      assertGroupDefaults(TestRunProfileBitset.Run, [p3]);
      assertGroupDefaults(TestRunProfileBitset.Debug, [p1]);
      t.setGroupDefaultProfiles(TestRunProfileBitset.Debug, [p2]);
      assertGroupDefaults(TestRunProfileBitset.Run, [p4]);
      assertGroupDefaults(TestRunProfileBitset.Debug, [p2]);
    });
    test("does not mess up sync for multiple controllers", () => {
      const p1 = addProfile({
        isDefault: false,
        controllerId: "a",
        group: TestRunProfileBitset.Debug,
        label: "a"
      });
      const p2 = addProfile({
        isDefault: false,
        controllerId: "b",
        group: TestRunProfileBitset.Debug,
        label: "b1"
      });
      const p3 = addProfile({
        isDefault: false,
        controllerId: "b",
        group: TestRunProfileBitset.Debug,
        label: "b2"
      });
      const p4 = addProfile({
        isDefault: false,
        controllerId: "c",
        group: TestRunProfileBitset.Debug,
        label: "c1"
      });
      const p5 = addProfile({
        isDefault: false,
        controllerId: "a",
        group: TestRunProfileBitset.Run,
        label: "a"
      });
      const p6 = addProfile({
        isDefault: false,
        controllerId: "b",
        group: TestRunProfileBitset.Run,
        label: "b1"
      });
      const p7 = addProfile({
        isDefault: false,
        controllerId: "b",
        group: TestRunProfileBitset.Run,
        label: "b2"
      });
      const p8 = addProfile({
        isDefault: false,
        controllerId: "b",
        group: TestRunProfileBitset.Run,
        label: "b3"
      });
      t.setGroupDefaultProfiles(TestRunProfileBitset.Debug, [p3]);
      assertGroupDefaults(TestRunProfileBitset.Run, [p7]);
      assertGroupDefaults(TestRunProfileBitset.Debug, [p3]);
      t.setGroupDefaultProfiles(TestRunProfileBitset.Run, [p8]);
      assertGroupDefaults(TestRunProfileBitset.Run, [p8]);
      assertGroupDefaults(TestRunProfileBitset.Debug, [p5]);
      t.setGroupDefaultProfiles(TestRunProfileBitset.Debug, [p1, p2, p4]);
      assertGroupDefaults(TestRunProfileBitset.Run, [p5, p6, p8]);
      assertGroupDefaults(TestRunProfileBitset.Debug, [p1, p2, p4]);
      t.setGroupDefaultProfiles(TestRunProfileBitset.Run, [p5, p6, p8]);
      assertGroupDefaults(TestRunProfileBitset.Run, [p5, p6, p8]);
      assertGroupDefaults(TestRunProfileBitset.Debug, [p1, p2, p4]);
    });
  });
});
