import { notStrictEqual, ok, strictEqual } from "assert";
import { getActiveWindow } from "../../../../../base/browser/dom.js";
import { mainWindow } from "../../../../../base/browser/window.js";
import { isLinux } from "../../../../../base/common/platform.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { EDITOR_FONT_DEFAULTS } from "../../../../../editor/common/config/editorOptions.js";
import {
  ConfigurationTarget,
  IConfigurationService
} from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import {
  TestTerminalConfigurationService,
  workbenchInstantiationService
} from "../../../../test/browser/workbenchTestServices.js";
import {
  ITerminalConfigurationService,
  LinuxDistro
} from "../../browser/terminal.js";
suite("Workbench - TerminalConfigurationService", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let configurationService;
  let terminalConfigurationService;
  setup(() => {
    const instantiationService = workbenchInstantiationService(
      void 0,
      store
    );
    configurationService = instantiationService.get(
      IConfigurationService
    );
    terminalConfigurationService = instantiationService.get(
      ITerminalConfigurationService
    );
  });
  suite("config", () => {
    test("should update on any change to terminal.integrated", () => {
      const originalConfig = terminalConfigurationService.config;
      configurationService.onDidChangeConfigurationEmitter.fire({
        affectsConfiguration: (configuration) => configuration.startsWith("terminal.integrated"),
        affectedKeys: /* @__PURE__ */ new Set(["terminal.integrated.fontWeight"]),
        change: null,
        source: ConfigurationTarget.USER
      });
      notStrictEqual(
        terminalConfigurationService.config,
        originalConfig,
        "Object reference must change"
      );
    });
    suite("onConfigChanged", () => {
      test("should fire on any change to terminal.integrated", async () => {
        await new Promise((r) => {
          store.add(
            terminalConfigurationService.onConfigChanged(() => r())
          );
          configurationService.onDidChangeConfigurationEmitter.fire({
            affectsConfiguration: (configuration) => configuration.startsWith("terminal.integrated"),
            affectedKeys: /* @__PURE__ */ new Set([
              "terminal.integrated.fontWeight"
            ]),
            change: null,
            source: ConfigurationTarget.USER
          });
        });
      });
    });
  });
  function createTerminalConfigationService(config, linuxDistro) {
    const instantiationService = new TestInstantiationService();
    instantiationService.set(
      IConfigurationService,
      new TestConfigurationService(config)
    );
    const terminalConfigurationService2 = store.add(
      instantiationService.createInstance(
        TestTerminalConfigurationService
      )
    );
    instantiationService.set(
      ITerminalConfigurationService,
      terminalConfigurationService2
    );
    terminalConfigurationService2.setPanelContainer(
      mainWindow.document.body
    );
    if (linuxDistro) {
      terminalConfigurationService2.fontMetrics.linuxDistro = linuxDistro;
    }
    return terminalConfigurationService2;
  }
  suite("getFont", () => {
    test("fontFamily", () => {
      const terminalConfigurationService2 = createTerminalConfigationService({
        editor: { fontFamily: "foo" },
        terminal: { integrated: { fontFamily: "bar" } }
      });
      ok(
        terminalConfigurationService2.getFont(getActiveWindow()).fontFamily.startsWith("bar"),
        "terminal.integrated.fontFamily should be selected over editor.fontFamily"
      );
    });
    test("fontFamily (Linux Fedora)", () => {
      const terminalConfigurationService2 = createTerminalConfigationService(
        {
          editor: { fontFamily: "foo" },
          terminal: { integrated: { fontFamily: null } }
        },
        LinuxDistro.Fedora
      );
      ok(
        terminalConfigurationService2.getFont(getActiveWindow()).fontFamily.startsWith("'DejaVu Sans Mono'"),
        "Fedora should have its font overridden when terminal.integrated.fontFamily not set"
      );
    });
    test("fontFamily (Linux Ubuntu)", () => {
      const terminalConfigurationService2 = createTerminalConfigationService(
        {
          editor: { fontFamily: "foo" },
          terminal: { integrated: { fontFamily: null } }
        },
        LinuxDistro.Ubuntu
      );
      ok(
        terminalConfigurationService2.getFont(getActiveWindow()).fontFamily.startsWith("'Ubuntu Mono'"),
        "Ubuntu should have its font overridden when terminal.integrated.fontFamily not set"
      );
    });
    test("fontFamily (Linux Unknown)", () => {
      const terminalConfigurationService2 = createTerminalConfigationService({
        editor: { fontFamily: "foo" },
        terminal: { integrated: { fontFamily: null } }
      });
      ok(
        terminalConfigurationService2.getFont(getActiveWindow()).fontFamily.startsWith("foo"),
        "editor.fontFamily should be the fallback when terminal.integrated.fontFamily not set"
      );
    });
    test("fontSize 10", () => {
      const terminalConfigurationService2 = createTerminalConfigationService({
        editor: {
          fontFamily: "foo",
          fontSize: 9
        },
        terminal: {
          integrated: {
            fontFamily: "bar",
            fontSize: 10
          }
        }
      });
      strictEqual(
        terminalConfigurationService2.getFont(getActiveWindow()).fontSize,
        10,
        "terminal.integrated.fontSize should be selected over editor.fontSize"
      );
    });
    test("fontSize 0", () => {
      let terminalConfigurationService2 = createTerminalConfigationService(
        {
          editor: {
            fontFamily: "foo"
          },
          terminal: {
            integrated: {
              fontFamily: null,
              fontSize: 0
            }
          }
        },
        LinuxDistro.Ubuntu
      );
      strictEqual(
        terminalConfigurationService2.getFont(getActiveWindow()).fontSize,
        8,
        "The minimum terminal font size (with adjustment) should be used when terminal.integrated.fontSize less than it"
      );
      terminalConfigurationService2 = createTerminalConfigationService({
        editor: {
          fontFamily: "foo"
        },
        terminal: {
          integrated: {
            fontFamily: null,
            fontSize: 0
          }
        }
      });
      strictEqual(
        terminalConfigurationService2.getFont(getActiveWindow()).fontSize,
        6,
        "The minimum terminal font size should be used when terminal.integrated.fontSize less than it"
      );
    });
    test("fontSize 1500", () => {
      const terminalConfigurationService2 = createTerminalConfigationService({
        editor: {
          fontFamily: "foo"
        },
        terminal: {
          integrated: {
            fontFamily: 0,
            fontSize: 1500
          }
        }
      });
      strictEqual(
        terminalConfigurationService2.getFont(getActiveWindow()).fontSize,
        100,
        "The maximum terminal font size should be used when terminal.integrated.fontSize more than it"
      );
    });
    test("fontSize null", () => {
      let terminalConfigurationService2 = createTerminalConfigationService(
        {
          editor: {
            fontFamily: "foo"
          },
          terminal: {
            integrated: {
              fontFamily: 0,
              fontSize: null
            }
          }
        },
        LinuxDistro.Ubuntu
      );
      strictEqual(
        terminalConfigurationService2.getFont(getActiveWindow()).fontSize,
        EDITOR_FONT_DEFAULTS.fontSize + 2,
        "The default editor font size (with adjustment) should be used when terminal.integrated.fontSize is not set"
      );
      terminalConfigurationService2 = createTerminalConfigationService({
        editor: {
          fontFamily: "foo"
        },
        terminal: {
          integrated: {
            fontFamily: 0,
            fontSize: null
          }
        }
      });
      strictEqual(
        terminalConfigurationService2.getFont(getActiveWindow()).fontSize,
        EDITOR_FONT_DEFAULTS.fontSize,
        "The default editor font size should be used when terminal.integrated.fontSize is not set"
      );
    });
    test("lineHeight 2", () => {
      const terminalConfigurationService2 = createTerminalConfigationService({
        editor: {
          fontFamily: "foo",
          lineHeight: 1
        },
        terminal: {
          integrated: {
            fontFamily: 0,
            lineHeight: 2
          }
        }
      });
      strictEqual(
        terminalConfigurationService2.getFont(getActiveWindow()).lineHeight,
        2,
        "terminal.integrated.lineHeight should be selected over editor.lineHeight"
      );
    });
    test("lineHeight 0", () => {
      const terminalConfigurationService2 = createTerminalConfigationService({
        editor: {
          fontFamily: "foo",
          lineHeight: 1
        },
        terminal: {
          integrated: {
            fontFamily: 0,
            lineHeight: 0
          }
        }
      });
      strictEqual(
        terminalConfigurationService2.getFont(getActiveWindow()).lineHeight,
        isLinux ? 1.1 : 1,
        "editor.lineHeight should be the default when terminal.integrated.lineHeight not set"
      );
    });
  });
  suite("configFontIsMonospace", () => {
    test("isMonospace monospace", () => {
      const terminalConfigurationService2 = createTerminalConfigationService({
        terminal: {
          integrated: {
            fontFamily: "monospace"
          }
        }
      });
      strictEqual(
        terminalConfigurationService2.configFontIsMonospace(),
        true,
        "monospace is monospaced"
      );
    });
    test("isMonospace sans-serif", () => {
      const terminalConfigurationService2 = createTerminalConfigationService({
        terminal: {
          integrated: {
            fontFamily: "sans-serif"
          }
        }
      });
      strictEqual(
        terminalConfigurationService2.configFontIsMonospace(),
        false,
        "sans-serif is not monospaced"
      );
    });
    test("isMonospace serif", () => {
      const terminalConfigurationService2 = createTerminalConfigationService({
        terminal: {
          integrated: {
            fontFamily: "serif"
          }
        }
      });
      strictEqual(
        terminalConfigurationService2.configFontIsMonospace(),
        false,
        "serif is not monospaced"
      );
    });
    test("isMonospace monospace falls back to editor.fontFamily", () => {
      const terminalConfigurationService2 = createTerminalConfigationService({
        editor: {
          fontFamily: "monospace"
        },
        terminal: {
          integrated: {
            fontFamily: null
          }
        }
      });
      strictEqual(
        terminalConfigurationService2.configFontIsMonospace(),
        true,
        "monospace is monospaced"
      );
    });
    test("isMonospace sans-serif falls back to editor.fontFamily", () => {
      const terminalConfigurationService2 = createTerminalConfigationService({
        editor: {
          fontFamily: "sans-serif"
        },
        terminal: {
          integrated: {
            fontFamily: null
          }
        }
      });
      strictEqual(
        terminalConfigurationService2.configFontIsMonospace(),
        false,
        "sans-serif is not monospaced"
      );
    });
    test("isMonospace serif falls back to editor.fontFamily", () => {
      const terminalConfigurationService2 = createTerminalConfigationService({
        editor: {
          fontFamily: "serif"
        },
        terminal: {
          integrated: {
            fontFamily: null
          }
        }
      });
      strictEqual(
        terminalConfigurationService2.configFontIsMonospace(),
        false,
        "serif is not monospaced"
      );
    });
  });
});
