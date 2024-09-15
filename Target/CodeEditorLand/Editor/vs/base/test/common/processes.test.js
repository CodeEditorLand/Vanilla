import assert from "assert";
import * as processes from "../../common/processes.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("Processes", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("sanitizeProcessEnvironment", () => {
    const env = {
      FOO: "bar",
      ELECTRON_ENABLE_STACK_DUMPING: "x",
      ELECTRON_ENABLE_LOGGING: "x",
      ELECTRON_NO_ASAR: "x",
      ELECTRON_NO_ATTACH_CONSOLE: "x",
      ELECTRON_RUN_AS_NODE: "x",
      VSCODE_CLI: "x",
      VSCODE_DEV: "x",
      VSCODE_IPC_HOOK: "x",
      VSCODE_NLS_CONFIG: "x",
      VSCODE_PORTABLE: "3",
      VSCODE_PID: "x",
      VSCODE_SHELL_LOGIN: "1",
      VSCODE_CODE_CACHE_PATH: "x",
      VSCODE_NEW_VAR: "x",
      GDK_PIXBUF_MODULE_FILE: "x",
      GDK_PIXBUF_MODULEDIR: "x"
    };
    processes.sanitizeProcessEnvironment(env);
    assert.strictEqual(env["FOO"], "bar");
    assert.strictEqual(env["VSCODE_SHELL_LOGIN"], "1");
    assert.strictEqual(env["VSCODE_PORTABLE"], "3");
    assert.strictEqual(Object.keys(env).length, 3);
  });
});
//# sourceMappingURL=processes.test.js.map
