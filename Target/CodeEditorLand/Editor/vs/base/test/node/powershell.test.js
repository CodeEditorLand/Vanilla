var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import * as fs from "fs";
import * as platform from "../../common/platform.js";
import { enumeratePowerShellInstallations, getFirstAvailablePowerShellInstallation, IPowerShellExeDetails } from "../../node/powershell.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../common/utils.js";
function checkPath(exePath) {
  let pathCheckResult = false;
  try {
    const stat = fs.statSync(exePath);
    pathCheckResult = stat.isFile();
  } catch {
    try {
      pathCheckResult = fs.statSync(fs.readlinkSync(exePath)).isFile();
    } catch {
    }
  }
  assert.strictEqual(pathCheckResult, true);
}
__name(checkPath, "checkPath");
if (platform.isWindows) {
  suite("PowerShell finder", () => {
    ensureNoDisposablesAreLeakedInTestSuite();
    test("Can find first available PowerShell", async () => {
      const pwshExe = await getFirstAvailablePowerShellInstallation();
      const exePath = pwshExe?.exePath;
      assert.notStrictEqual(exePath, null);
      assert.notStrictEqual(pwshExe?.displayName, null);
      checkPath(exePath);
    });
    test("Can enumerate PowerShells", async () => {
      const pwshs = new Array();
      for await (const p of enumeratePowerShellInstallations()) {
        pwshs.push(p);
      }
      const powershellLog = "Found these PowerShells:\n" + pwshs.map((p) => `${p.displayName}: ${p.exePath}`).join("\n");
      assert.strictEqual(pwshs.length >= 1, true, powershellLog);
      for (const pwsh of pwshs) {
        checkPath(pwsh.exePath);
      }
      assert.strictEqual(pwshs[pwshs.length - 1].displayName, "Windows PowerShell", powershellLog);
    });
  });
}
//# sourceMappingURL=powershell.test.js.map
