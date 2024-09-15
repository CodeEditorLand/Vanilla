import { deepStrictEqual } from "assert";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ITerminalProfile } from "../../../../../platform/terminal/common/terminal.js";
import { ITerminalInstanceService } from "../../browser/terminal.js";
import { TerminalInstanceService } from "../../browser/terminalInstanceService.js";
import { workbenchInstantiationService } from "../../../../test/browser/workbenchTestServices.js";
suite("Workbench - TerminalInstanceService", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let terminalInstanceService;
  setup(async () => {
    const instantiationService = workbenchInstantiationService(void 0, store);
    terminalInstanceService = store.add(instantiationService.createInstance(TerminalInstanceService));
  });
  suite("convertProfileToShellLaunchConfig", () => {
    test("should return an empty shell launch config when undefined is provided", () => {
      deepStrictEqual(terminalInstanceService.convertProfileToShellLaunchConfig(), {});
      deepStrictEqual(terminalInstanceService.convertProfileToShellLaunchConfig(void 0), {});
    });
    test("should return the same shell launch config when provided", () => {
      deepStrictEqual(
        terminalInstanceService.convertProfileToShellLaunchConfig({}),
        {}
      );
      deepStrictEqual(
        terminalInstanceService.convertProfileToShellLaunchConfig({ executable: "/foo" }),
        { executable: "/foo" }
      );
      deepStrictEqual(
        terminalInstanceService.convertProfileToShellLaunchConfig({ executable: "/foo", cwd: "/bar", args: ["a", "b"] }),
        { executable: "/foo", cwd: "/bar", args: ["a", "b"] }
      );
      deepStrictEqual(
        terminalInstanceService.convertProfileToShellLaunchConfig({ executable: "/foo" }, "/bar"),
        { executable: "/foo", cwd: "/bar" }
      );
      deepStrictEqual(
        terminalInstanceService.convertProfileToShellLaunchConfig({ executable: "/foo", cwd: "/bar" }, "/baz"),
        { executable: "/foo", cwd: "/baz" }
      );
    });
    test("should convert a provided profile to a shell launch config", () => {
      deepStrictEqual(
        terminalInstanceService.convertProfileToShellLaunchConfig({
          profileName: "abc",
          path: "/foo",
          isDefault: true
        }),
        {
          args: void 0,
          color: void 0,
          cwd: void 0,
          env: void 0,
          executable: "/foo",
          icon: void 0,
          name: void 0
        }
      );
      const icon = URI.file("/icon");
      deepStrictEqual(
        terminalInstanceService.convertProfileToShellLaunchConfig({
          profileName: "abc",
          path: "/foo",
          isDefault: true,
          args: ["a", "b"],
          color: "color",
          env: { test: "TEST" },
          icon
        }, "/bar"),
        {
          args: ["a", "b"],
          color: "color",
          cwd: "/bar",
          env: { test: "TEST" },
          executable: "/foo",
          icon,
          name: void 0
        }
      );
    });
    test("should respect overrideName in profile", () => {
      deepStrictEqual(
        terminalInstanceService.convertProfileToShellLaunchConfig({
          profileName: "abc",
          path: "/foo",
          isDefault: true,
          overrideName: true
        }),
        {
          args: void 0,
          color: void 0,
          cwd: void 0,
          env: void 0,
          executable: "/foo",
          icon: void 0,
          name: "abc"
        }
      );
    });
  });
});
//# sourceMappingURL=terminalInstanceService.test.js.map
