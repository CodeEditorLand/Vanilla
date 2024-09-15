var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { strictEqual } from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { TestDialogService } from "../../../../../platform/dialogs/test/common/testDialogService.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { TerminalSettingId } from "../../../../../platform/terminal/common/terminal.js";
import { shouldPasteTerminalText } from "../../common/terminalClipboard.js";
suite("TerminalClipboard", function() {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  suite("shouldPasteTerminalText", () => {
    let instantiationService;
    let configurationService;
    setup(async () => {
      instantiationService = store.add(new TestInstantiationService());
      configurationService = new TestConfigurationService({
        [TerminalSettingId.EnableMultiLinePasteWarning]: "auto"
      });
      instantiationService.stub(IConfigurationService, configurationService);
      instantiationService.stub(IDialogService, new TestDialogService(void 0, { result: { confirmed: false } }));
    });
    function setConfigValue(value) {
      configurationService = new TestConfigurationService({
        [TerminalSettingId.EnableMultiLinePasteWarning]: value
      });
      instantiationService.stub(IConfigurationService, configurationService);
    }
    __name(setConfigValue, "setConfigValue");
    test("Single line string", async () => {
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo", void 0), true);
      setConfigValue("always");
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo", void 0), true);
      setConfigValue("never");
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo", void 0), true);
    });
    test("Single line string with trailing new line", async () => {
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo\n", void 0), true);
      setConfigValue("always");
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo\n", void 0), false);
      setConfigValue("never");
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo\n", void 0), true);
    });
    test("Multi-line string", async () => {
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo\nbar", void 0), false);
      setConfigValue("always");
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo\nbar", void 0), false);
      setConfigValue("never");
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo\nbar", void 0), true);
    });
    test("Bracketed paste mode", async () => {
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo\nbar", true), true);
      setConfigValue("always");
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo\nbar", true), false);
      setConfigValue("never");
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo\nbar", true), true);
    });
    test("Legacy config", async () => {
      setConfigValue(true);
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo\nbar", void 0), false);
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo\nbar", true), true);
      setConfigValue(false);
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo\nbar", true), true);
    });
    test("Invalid config", async () => {
      setConfigValue(123);
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo\nbar", void 0), false);
      strictEqual(await instantiationService.invokeFunction(shouldPasteTerminalText, "foo\nbar", true), true);
    });
  });
});
//# sourceMappingURL=terminalClipboard.test.js.map
