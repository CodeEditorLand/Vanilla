var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepStrictEqual, strictEqual } from "assert";
import { importAMDNodeModule } from "../../../../../../amdX.js";
import { isSafari } from "../../../../../../base/browser/browser.js";
import { Color, RGBA } from "../../../../../../base/common/color.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { IEditorOptions } from "../../../../../../editor/common/config/editorOptions.js";
import { TestConfigurationService } from "../../../../../../platform/configuration/test/common/testConfigurationService.js";
import { TestInstantiationService } from "../../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { TerminalCapabilityStore } from "../../../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";
import { IThemeService } from "../../../../../../platform/theme/common/themeService.js";
import { TestColorTheme, TestThemeService } from "../../../../../../platform/theme/test/common/testThemeService.js";
import { PANEL_BACKGROUND, SIDE_BAR_BACKGROUND } from "../../../../../common/theme.js";
import { IViewDescriptor, IViewDescriptorService, ViewContainerLocation } from "../../../../../common/views.js";
import { XtermTerminal } from "../../../browser/xterm/xtermTerminal.js";
import { ITerminalConfiguration, TERMINAL_VIEW_ID } from "../../../common/terminal.js";
import { registerColors, TERMINAL_BACKGROUND_COLOR, TERMINAL_CURSOR_BACKGROUND_COLOR, TERMINAL_CURSOR_FOREGROUND_COLOR, TERMINAL_FOREGROUND_COLOR, TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR, TERMINAL_SELECTION_BACKGROUND_COLOR, TERMINAL_SELECTION_FOREGROUND_COLOR } from "../../../common/terminalColorRegistry.js";
import { workbenchInstantiationService } from "../../../../../test/browser/workbenchTestServices.js";
registerColors();
class TestWebglAddon {
  static {
    __name(this, "TestWebglAddon");
  }
  static shouldThrow = false;
  static isEnabled = false;
  onChangeTextureAtlas = new Emitter().event;
  onAddTextureAtlasCanvas = new Emitter().event;
  onRemoveTextureAtlasCanvas = new Emitter().event;
  onContextLoss = new Emitter().event;
  activate() {
    TestWebglAddon.isEnabled = !TestWebglAddon.shouldThrow;
    if (TestWebglAddon.shouldThrow) {
      throw new Error("Test webgl set to throw");
    }
  }
  dispose() {
    TestWebglAddon.isEnabled = false;
  }
  clearTextureAtlas() {
  }
}
class TestXtermTerminal extends XtermTerminal {
  static {
    __name(this, "TestXtermTerminal");
  }
  webglAddonPromise = Promise.resolve(TestWebglAddon);
  // Force synchronous to avoid async when activating the addon
  _getWebglAddonConstructor() {
    return this.webglAddonPromise;
  }
}
class TestViewDescriptorService {
  static {
    __name(this, "TestViewDescriptorService");
  }
  _location = ViewContainerLocation.Panel;
  _onDidChangeLocation = new Emitter();
  onDidChangeLocation = this._onDidChangeLocation.event;
  getViewLocationById(id) {
    return this._location;
  }
  moveTerminalToLocation(to) {
    const oldLocation = this._location;
    this._location = to;
    this._onDidChangeLocation.fire({
      views: [
        { id: TERMINAL_VIEW_ID }
      ],
      from: oldLocation,
      to
    });
  }
}
const defaultTerminalConfig = {
  fontFamily: "monospace",
  fontWeight: "normal",
  fontWeightBold: "normal",
  gpuAcceleration: "off",
  scrollback: 1e3,
  fastScrollSensitivity: 2,
  mouseWheelScrollSensitivity: 1,
  unicodeVersion: "6"
};
suite("XtermTerminal", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let instantiationService;
  let configurationService;
  let themeService;
  let xterm;
  let XTermBaseCtor;
  setup(async () => {
    configurationService = new TestConfigurationService({
      editor: {
        fastScrollSensitivity: 2,
        mouseWheelScrollSensitivity: 1
      },
      files: {},
      terminal: {
        integrated: defaultTerminalConfig
      }
    });
    instantiationService = workbenchInstantiationService({
      configurationService: /* @__PURE__ */ __name(() => configurationService, "configurationService")
    }, store);
    themeService = instantiationService.get(IThemeService);
    XTermBaseCtor = (await importAMDNodeModule("@xterm/xterm", "lib/xterm.js")).Terminal;
    const capabilityStore = store.add(new TerminalCapabilityStore());
    xterm = store.add(instantiationService.createInstance(TestXtermTerminal, XTermBaseCtor, 80, 30, { getBackgroundColor: /* @__PURE__ */ __name(() => void 0, "getBackgroundColor") }, capabilityStore, "", true));
    TestWebglAddon.shouldThrow = false;
    TestWebglAddon.isEnabled = false;
  });
  test("should use fallback dimensions of 80x30", () => {
    strictEqual(xterm.raw.cols, 80);
    strictEqual(xterm.raw.rows, 30);
  });
  suite("theme", () => {
    test("should apply correct background color based on getBackgroundColor", () => {
      themeService.setTheme(new TestColorTheme({
        [PANEL_BACKGROUND]: "#ff0000",
        [SIDE_BAR_BACKGROUND]: "#00ff00"
      }));
      xterm = store.add(instantiationService.createInstance(XtermTerminal, XTermBaseCtor, 80, 30, { getBackgroundColor: /* @__PURE__ */ __name(() => new Color(new RGBA(255, 0, 0)), "getBackgroundColor") }, store.add(new TerminalCapabilityStore()), "", true));
      strictEqual(xterm.raw.options.theme?.background, "#ff0000");
    });
    test("should react to and apply theme changes", () => {
      themeService.setTheme(new TestColorTheme({
        [TERMINAL_BACKGROUND_COLOR]: "#000100",
        [TERMINAL_FOREGROUND_COLOR]: "#000200",
        [TERMINAL_CURSOR_FOREGROUND_COLOR]: "#000300",
        [TERMINAL_CURSOR_BACKGROUND_COLOR]: "#000400",
        [TERMINAL_SELECTION_BACKGROUND_COLOR]: "#000500",
        [TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR]: "#000600",
        [TERMINAL_SELECTION_FOREGROUND_COLOR]: void 0,
        "terminal.ansiBlack": "#010000",
        "terminal.ansiRed": "#020000",
        "terminal.ansiGreen": "#030000",
        "terminal.ansiYellow": "#040000",
        "terminal.ansiBlue": "#050000",
        "terminal.ansiMagenta": "#060000",
        "terminal.ansiCyan": "#070000",
        "terminal.ansiWhite": "#080000",
        "terminal.ansiBrightBlack": "#090000",
        "terminal.ansiBrightRed": "#100000",
        "terminal.ansiBrightGreen": "#110000",
        "terminal.ansiBrightYellow": "#120000",
        "terminal.ansiBrightBlue": "#130000",
        "terminal.ansiBrightMagenta": "#140000",
        "terminal.ansiBrightCyan": "#150000",
        "terminal.ansiBrightWhite": "#160000"
      }));
      xterm = store.add(instantiationService.createInstance(XtermTerminal, XTermBaseCtor, 80, 30, { getBackgroundColor: /* @__PURE__ */ __name(() => void 0, "getBackgroundColor") }, store.add(new TerminalCapabilityStore()), "", true));
      deepStrictEqual(xterm.raw.options.theme, {
        background: void 0,
        foreground: "#000200",
        cursor: "#000300",
        cursorAccent: "#000400",
        selectionBackground: "#000500",
        selectionInactiveBackground: "#000600",
        selectionForeground: void 0,
        overviewRulerBorder: void 0,
        scrollbarSliderActiveBackground: void 0,
        scrollbarSliderBackground: void 0,
        scrollbarSliderHoverBackground: void 0,
        black: "#010000",
        green: "#030000",
        red: "#020000",
        yellow: "#040000",
        blue: "#050000",
        magenta: "#060000",
        cyan: "#070000",
        white: "#080000",
        brightBlack: "#090000",
        brightRed: "#100000",
        brightGreen: "#110000",
        brightYellow: "#120000",
        brightBlue: "#130000",
        brightMagenta: "#140000",
        brightCyan: "#150000",
        brightWhite: "#160000"
      });
      themeService.setTheme(new TestColorTheme({
        [TERMINAL_BACKGROUND_COLOR]: "#00010f",
        [TERMINAL_FOREGROUND_COLOR]: "#00020f",
        [TERMINAL_CURSOR_FOREGROUND_COLOR]: "#00030f",
        [TERMINAL_CURSOR_BACKGROUND_COLOR]: "#00040f",
        [TERMINAL_SELECTION_BACKGROUND_COLOR]: "#00050f",
        [TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR]: "#00060f",
        [TERMINAL_SELECTION_FOREGROUND_COLOR]: "#00070f",
        "terminal.ansiBlack": "#01000f",
        "terminal.ansiRed": "#02000f",
        "terminal.ansiGreen": "#03000f",
        "terminal.ansiYellow": "#04000f",
        "terminal.ansiBlue": "#05000f",
        "terminal.ansiMagenta": "#06000f",
        "terminal.ansiCyan": "#07000f",
        "terminal.ansiWhite": "#08000f",
        "terminal.ansiBrightBlack": "#09000f",
        "terminal.ansiBrightRed": "#10000f",
        "terminal.ansiBrightGreen": "#11000f",
        "terminal.ansiBrightYellow": "#12000f",
        "terminal.ansiBrightBlue": "#13000f",
        "terminal.ansiBrightMagenta": "#14000f",
        "terminal.ansiBrightCyan": "#15000f",
        "terminal.ansiBrightWhite": "#16000f"
      }));
      deepStrictEqual(xterm.raw.options.theme, {
        background: void 0,
        foreground: "#00020f",
        cursor: "#00030f",
        cursorAccent: "#00040f",
        selectionBackground: "#00050f",
        selectionInactiveBackground: "#00060f",
        selectionForeground: "#00070f",
        overviewRulerBorder: void 0,
        scrollbarSliderActiveBackground: void 0,
        scrollbarSliderBackground: void 0,
        scrollbarSliderHoverBackground: void 0,
        black: "#01000f",
        green: "#03000f",
        red: "#02000f",
        yellow: "#04000f",
        blue: "#05000f",
        magenta: "#06000f",
        cyan: "#07000f",
        white: "#08000f",
        brightBlack: "#09000f",
        brightRed: "#10000f",
        brightGreen: "#11000f",
        brightYellow: "#12000f",
        brightBlue: "#13000f",
        brightMagenta: "#14000f",
        brightCyan: "#15000f",
        brightWhite: "#16000f"
      });
    });
  });
  suite("renderers", () => {
    test.skip("should re-evaluate gpu acceleration auto when the setting is changed", async () => {
      strictEqual(TestWebglAddon.isEnabled, false);
      const container = document.createElement("div");
      xterm.attachToElement(container);
      await configurationService.setUserConfiguration("terminal", { integrated: { ...defaultTerminalConfig, gpuAcceleration: "auto" } });
      configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: /* @__PURE__ */ __name(() => true, "affectsConfiguration") });
      await xterm.webglAddonPromise;
      if (isSafari) {
        strictEqual(TestWebglAddon.isEnabled, false, "The webgl renderer is always disabled on Safari");
      } else {
        strictEqual(TestWebglAddon.isEnabled, true);
      }
      await configurationService.setUserConfiguration("terminal", { integrated: { ...defaultTerminalConfig, gpuAcceleration: "off" } });
      configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: /* @__PURE__ */ __name(() => true, "affectsConfiguration") });
      await xterm.webglAddonPromise;
      strictEqual(TestWebglAddon.isEnabled, false);
      TestWebglAddon.shouldThrow = true;
      await configurationService.setUserConfiguration("terminal", { integrated: { ...defaultTerminalConfig, gpuAcceleration: "auto" } });
      configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: /* @__PURE__ */ __name(() => true, "affectsConfiguration") });
      await xterm.webglAddonPromise;
      strictEqual(TestWebglAddon.isEnabled, false);
    });
  });
});
export {
  TestViewDescriptorService
};
//# sourceMappingURL=xtermTerminal.test.js.map
