var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import "../../browser/keyboardLayouts/en.darwin.js";
import "../../browser/keyboardLayouts/de.darwin.js";
import { KeyboardLayoutContribution } from "../../browser/keyboardLayouts/_.contribution.js";
import { BrowserKeyboardMapperFactoryBase } from "../../browser/keyboardLayoutService.js";
import { KeymapInfo, IKeymapInfo } from "../../common/keymapInfo.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { TestNotificationService } from "../../../../../platform/notification/test/common/testNotificationService.js";
import { TestStorageService } from "../../../../test/common/workbenchTestServices.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
class TestKeyboardMapperFactory extends BrowserKeyboardMapperFactoryBase {
  static {
    __name(this, "TestKeyboardMapperFactory");
  }
  constructor(configurationService, notificationService, storageService, commandService) {
    super(configurationService);
    const keymapInfos = KeyboardLayoutContribution.INSTANCE.layoutInfos;
    this._keymapInfos.push(...keymapInfos.map((info) => new KeymapInfo(info.layout, info.secondaryLayouts, info.mapping, info.isUserKeyboardLayout)));
    this._mru = this._keymapInfos;
    this._initialized = true;
    this.setLayoutFromBrowserAPI();
    const usLayout = this.getUSStandardLayout();
    if (usLayout) {
      this.setActiveKeyMapping(usLayout.mapping);
    }
  }
}
suite("keyboard layout loader", () => {
  const ds = ensureNoDisposablesAreLeakedInTestSuite();
  let instantiationService;
  let instance;
  setup(() => {
    instantiationService = new TestInstantiationService();
    const storageService = new TestStorageService();
    const notitifcationService = instantiationService.stub(INotificationService, new TestNotificationService());
    const configurationService = instantiationService.stub(IConfigurationService, new TestConfigurationService());
    const commandService = instantiationService.stub(ICommandService, {});
    ds.add(instantiationService);
    ds.add(storageService);
    instance = new TestKeyboardMapperFactory(configurationService, notitifcationService, storageService, commandService);
    ds.add(instance);
  });
  teardown(() => {
    instantiationService.dispose();
  });
  test("load default US keyboard layout", () => {
    assert.notStrictEqual(instance.activeKeyboardLayout, null);
  });
  test("isKeyMappingActive", () => {
    instance.setUSKeyboardLayout();
    assert.strictEqual(instance.isKeyMappingActive({
      KeyA: {
        value: "a",
        valueIsDeadKey: false,
        withShift: "A",
        withShiftIsDeadKey: false,
        withAltGr: "\xE5",
        withAltGrIsDeadKey: false,
        withShiftAltGr: "\xC5",
        withShiftAltGrIsDeadKey: false
      }
    }), true);
    assert.strictEqual(instance.isKeyMappingActive({
      KeyA: {
        value: "a",
        valueIsDeadKey: false,
        withShift: "A",
        withShiftIsDeadKey: false,
        withAltGr: "\xE5",
        withAltGrIsDeadKey: false,
        withShiftAltGr: "\xC5",
        withShiftAltGrIsDeadKey: false
      },
      KeyZ: {
        value: "z",
        valueIsDeadKey: false,
        withShift: "Z",
        withShiftIsDeadKey: false,
        withAltGr: "\u03A9",
        withAltGrIsDeadKey: false,
        withShiftAltGr: "\xB8",
        withShiftAltGrIsDeadKey: false
      }
    }), true);
    assert.strictEqual(instance.isKeyMappingActive({
      KeyZ: {
        value: "y",
        valueIsDeadKey: false,
        withShift: "Y",
        withShiftIsDeadKey: false,
        withAltGr: "\xA5",
        withAltGrIsDeadKey: false,
        withShiftAltGr: "\u0178",
        withShiftAltGrIsDeadKey: false
      }
    }), false);
  });
  test("Switch keymapping", () => {
    instance.setActiveKeyMapping({
      KeyZ: {
        value: "y",
        valueIsDeadKey: false,
        withShift: "Y",
        withShiftIsDeadKey: false,
        withAltGr: "\xA5",
        withAltGrIsDeadKey: false,
        withShiftAltGr: "\u0178",
        withShiftAltGrIsDeadKey: false
      }
    });
    assert.strictEqual(!!instance.activeKeyboardLayout.isUSStandard, false);
    assert.strictEqual(instance.isKeyMappingActive({
      KeyZ: {
        value: "y",
        valueIsDeadKey: false,
        withShift: "Y",
        withShiftIsDeadKey: false,
        withAltGr: "\xA5",
        withAltGrIsDeadKey: false,
        withShiftAltGr: "\u0178",
        withShiftAltGrIsDeadKey: false
      }
    }), true);
    instance.setUSKeyboardLayout();
    assert.strictEqual(instance.activeKeyboardLayout.isUSStandard, true);
  });
  test("Switch keyboard layout info", () => {
    instance.setKeyboardLayout("com.apple.keylayout.German");
    assert.strictEqual(!!instance.activeKeyboardLayout.isUSStandard, false);
    assert.strictEqual(instance.isKeyMappingActive({
      KeyZ: {
        value: "y",
        valueIsDeadKey: false,
        withShift: "Y",
        withShiftIsDeadKey: false,
        withAltGr: "\xA5",
        withAltGrIsDeadKey: false,
        withShiftAltGr: "\u0178",
        withShiftAltGrIsDeadKey: false
      }
    }), true);
    instance.setUSKeyboardLayout();
    assert.strictEqual(instance.activeKeyboardLayout.isUSStandard, true);
  });
});
//# sourceMappingURL=browserKeyboardMapper.test.js.map
