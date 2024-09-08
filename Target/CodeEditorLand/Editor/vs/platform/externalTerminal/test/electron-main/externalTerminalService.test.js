import { deepStrictEqual, strictEqual } from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import {
  DEFAULT_TERMINAL_OSX
} from "../../common/externalTerminal.js";
import {
  LinuxExternalTerminalService,
  MacExternalTerminalService,
  WindowsExternalTerminalService
} from "../../node/externalTerminalService.js";
const mockConfig = Object.freeze({
  terminal: {
    explorerKind: "external",
    external: {
      windowsExec: "testWindowsShell",
      osxExec: "testOSXShell",
      linuxExec: "testLinuxShell"
    }
  }
});
suite("ExternalTerminalService", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test(`WinTerminalService - uses terminal from configuration`, (done) => {
    const testShell = "cmd";
    const testCwd = "path/to/workspace";
    const mockSpawner = {
      spawn: (command, args, opts) => {
        strictEqual(command, testShell, "shell should equal expected");
        strictEqual(
          args[args.length - 1],
          mockConfig.terminal.external.windowsExec
        );
        strictEqual(opts.cwd, testCwd);
        done();
        return {
          on: (evt) => evt
        };
      }
    };
    const testService = new WindowsExternalTerminalService();
    testService.spawnTerminal(
      mockSpawner,
      mockConfig.terminal.external,
      testShell,
      testCwd
    );
  });
  test(`WinTerminalService - uses default terminal when configuration.terminal.external.windowsExec is undefined`, (done) => {
    const testShell = "cmd";
    const testCwd = "path/to/workspace";
    const mockSpawner = {
      spawn: (command, args, opts) => {
        strictEqual(
          args[args.length - 1],
          WindowsExternalTerminalService.getDefaultTerminalWindows()
        );
        done();
        return {
          on: (evt) => evt
        };
      }
    };
    mockConfig.terminal.external.windowsExec = void 0;
    const testService = new WindowsExternalTerminalService();
    testService.spawnTerminal(
      mockSpawner,
      mockConfig.terminal.external,
      testShell,
      testCwd
    );
  });
  test(`WinTerminalService - cwd is correct regardless of case`, (done) => {
    const testShell = "cmd";
    const testCwd = "c:/foo";
    const mockSpawner = {
      spawn: (command, args, opts) => {
        strictEqual(
          opts.cwd,
          "C:/foo",
          "cwd should be uppercase regardless of the case that's passed in"
        );
        done();
        return {
          on: (evt) => evt
        };
      }
    };
    const testService = new WindowsExternalTerminalService();
    testService.spawnTerminal(
      mockSpawner,
      mockConfig.terminal.external,
      testShell,
      testCwd
    );
  });
  test(`WinTerminalService - cmder should be spawned differently`, (done) => {
    const testShell = "cmd";
    const testCwd = "c:/foo";
    const mockSpawner = {
      spawn: (command, args, opts) => {
        deepStrictEqual(args, ["C:/foo"]);
        strictEqual(opts, void 0);
        done();
        return { on: (evt) => evt };
      }
    };
    const testService = new WindowsExternalTerminalService();
    testService.spawnTerminal(
      mockSpawner,
      { windowsExec: "cmder" },
      testShell,
      testCwd
    );
  });
  test(`WinTerminalService - windows terminal should open workspace directory`, (done) => {
    const testShell = "wt";
    const testCwd = "c:/foo";
    const mockSpawner = {
      spawn: (command, args, opts) => {
        strictEqual(opts.cwd, "C:/foo");
        done();
        return { on: (evt) => evt };
      }
    };
    const testService = new WindowsExternalTerminalService();
    testService.spawnTerminal(
      mockSpawner,
      mockConfig.terminal.external,
      testShell,
      testCwd
    );
  });
  test(`MacTerminalService - uses terminal from configuration`, (done) => {
    const testCwd = "path/to/workspace";
    const mockSpawner = {
      spawn: (command, args, opts) => {
        strictEqual(args[1], mockConfig.terminal.external.osxExec);
        done();
        return {
          on: (evt) => evt
        };
      }
    };
    const testService = new MacExternalTerminalService();
    testService.spawnTerminal(
      mockSpawner,
      mockConfig.terminal.external,
      testCwd
    );
  });
  test(`MacTerminalService - uses default terminal when configuration.terminal.external.osxExec is undefined`, (done) => {
    const testCwd = "path/to/workspace";
    const mockSpawner = {
      spawn: (command, args, opts) => {
        strictEqual(args[1], DEFAULT_TERMINAL_OSX);
        done();
        return {
          on: (evt) => evt
        };
      }
    };
    const testService = new MacExternalTerminalService();
    testService.spawnTerminal(mockSpawner, { osxExec: void 0 }, testCwd);
  });
  test(`LinuxTerminalService - uses terminal from configuration`, (done) => {
    const testCwd = "path/to/workspace";
    const mockSpawner = {
      spawn: (command, args, opts) => {
        strictEqual(command, mockConfig.terminal.external.linuxExec);
        strictEqual(opts.cwd, testCwd);
        done();
        return {
          on: (evt) => evt
        };
      }
    };
    const testService = new LinuxExternalTerminalService();
    testService.spawnTerminal(
      mockSpawner,
      mockConfig.terminal.external,
      testCwd
    );
  });
  test(`LinuxTerminalService - uses default terminal when configuration.terminal.external.linuxExec is undefined`, (done) => {
    LinuxExternalTerminalService.getDefaultTerminalLinuxReady().then(
      (defaultTerminalLinux) => {
        const testCwd = "path/to/workspace";
        const mockSpawner = {
          spawn: (command, args, opts) => {
            strictEqual(command, defaultTerminalLinux);
            done();
            return {
              on: (evt) => evt
            };
          }
        };
        mockConfig.terminal.external.linuxExec = void 0;
        const testService = new LinuxExternalTerminalService();
        testService.spawnTerminal(
          mockSpawner,
          mockConfig.terminal.external,
          testCwd
        );
      }
    );
  });
});
