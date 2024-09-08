import { notEqual, strictEqual, throws } from "assert";
import { importAMDNodeModule } from "../../../../../../amdX.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { TestConfigurationService } from "../../../../../../platform/configuration/test/common/testConfigurationService.js";
import {
  TerminalCapability
} from "../../../../../../platform/terminal/common/capabilities/capabilities.js";
import { CommandDetectionCapability } from "../../../../../../platform/terminal/common/capabilities/commandDetectionCapability.js";
import { TerminalCapabilityStore } from "../../../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";
import { workbenchInstantiationService } from "../../../../../test/browser/workbenchTestServices.js";
import { DecorationAddon } from "../../../browser/xterm/decorationAddon.js";
suite("DecorationAddon", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let decorationAddon;
  let xterm;
  setup(async () => {
    const TerminalCtor = (await importAMDNodeModule(
      "@xterm/xterm",
      "lib/xterm.js"
    )).Terminal;
    class TestTerminal extends TerminalCtor {
      registerDecoration(decorationOptions) {
        if (decorationOptions.marker.isDisposed) {
          return void 0;
        }
        const element = document.createElement("div");
        return {
          marker: decorationOptions.marker,
          element,
          onDispose: () => {
          },
          isDisposed: false,
          dispose: () => {
          },
          onRender: (element2) => {
            return element2;
          }
        };
      }
    }
    const instantiationService = workbenchInstantiationService(
      {
        configurationService: () => new TestConfigurationService({
          files: {},
          workbench: {
            hover: { delay: 5 }
          },
          terminal: {
            integrated: {
              shellIntegration: {
                decorationsEnabled: "both"
              }
            }
          }
        })
      },
      store
    );
    xterm = store.add(
      new TestTerminal({
        allowProposedApi: true,
        cols: 80,
        rows: 30
      })
    );
    const capabilities = store.add(new TerminalCapabilityStore());
    capabilities.add(
      TerminalCapability.CommandDetection,
      store.add(
        instantiationService.createInstance(
          CommandDetectionCapability,
          xterm
        )
      )
    );
    decorationAddon = store.add(
      instantiationService.createInstance(DecorationAddon, capabilities)
    );
    xterm.loadAddon(decorationAddon);
  });
  suite("registerDecoration", () => {
    test("should throw when command has no marker", async () => {
      throws(
        () => decorationAddon.registerCommandDecoration({
          command: "cd src",
          timestamp: Date.now(),
          hasOutput: () => false
        })
      );
    });
    test("should return undefined when marker has been disposed of", async () => {
      const marker = xterm.registerMarker(1);
      marker?.dispose();
      strictEqual(
        decorationAddon.registerCommandDecoration({
          command: "cd src",
          marker,
          timestamp: Date.now(),
          hasOutput: () => false
        }),
        void 0
      );
    });
    test("should return decoration when marker has not been disposed of", async () => {
      const marker = xterm.registerMarker(2);
      notEqual(
        decorationAddon.registerCommandDecoration({
          command: "cd src",
          marker,
          timestamp: Date.now(),
          hasOutput: () => false
        }),
        void 0
      );
    });
    test("should return decoration with mark properties", async () => {
      const marker = xterm.registerMarker(2);
      notEqual(
        decorationAddon.registerCommandDecoration(
          void 0,
          void 0,
          { marker }
        ),
        void 0
      );
    });
  });
});
