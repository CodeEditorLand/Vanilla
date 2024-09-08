import assert from "assert";
import { isLinux } from "../../../../base/common/platform.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import product from "../../../product/common/product.js";
import { EnvironmentMainService } from "../../electron-main/environmentMainService.js";
suite("EnvironmentMainService", () => {
  test("can unset and restore snap env variables", () => {
    const service = new EnvironmentMainService(
      { _: [] },
      { _serviceBrand: void 0, ...product }
    );
    process.env["TEST_ARG1_VSCODE_SNAP_ORIG"] = "original";
    process.env["TEST_ARG1"] = "modified";
    process.env["TEST_ARG2_SNAP"] = "test_arg2";
    process.env["TEST_ARG3_VSCODE_SNAP_ORIG"] = "";
    process.env["TEST_ARG3"] = "test_arg3_non_empty";
    service.unsetSnapExportedVariables();
    if (isLinux) {
      assert.strictEqual(process.env["TEST_ARG1"], "original");
      assert.strictEqual(process.env["TEST_ARG2"], void 0);
      assert.strictEqual(
        process.env["TEST_ARG1_VSCODE_SNAP_ORIG"],
        "original"
      );
      assert.strictEqual(process.env["TEST_ARG2_SNAP"], "test_arg2");
      assert.strictEqual(process.env["TEST_ARG3_VSCODE_SNAP_ORIG"], "");
      assert.strictEqual(process.env["TEST_ARG3"], void 0);
    } else {
      assert.strictEqual(process.env["TEST_ARG1"], "modified");
      assert.strictEqual(process.env["TEST_ARG2"], void 0);
      assert.strictEqual(
        process.env["TEST_ARG1_VSCODE_SNAP_ORIG"],
        "original"
      );
      assert.strictEqual(process.env["TEST_ARG2_SNAP"], "test_arg2");
      assert.strictEqual(process.env["TEST_ARG3_VSCODE_SNAP_ORIG"], "");
      assert.strictEqual(process.env["TEST_ARG3"], "test_arg3_non_empty");
    }
    service.restoreSnapExportedVariables();
    if (isLinux) {
      assert.strictEqual(process.env["TEST_ARG1"], "modified");
      assert.strictEqual(
        process.env["TEST_ARG1_VSCODE_SNAP_ORIG"],
        "original"
      );
      assert.strictEqual(process.env["TEST_ARG2_SNAP"], "test_arg2");
      assert.strictEqual(process.env["TEST_ARG2"], void 0);
      assert.strictEqual(process.env["TEST_ARG3_VSCODE_SNAP_ORIG"], "");
      assert.strictEqual(process.env["TEST_ARG3"], "test_arg3_non_empty");
    } else {
      assert.strictEqual(process.env["TEST_ARG1"], "modified");
      assert.strictEqual(
        process.env["TEST_ARG1_VSCODE_SNAP_ORIG"],
        "original"
      );
      assert.strictEqual(process.env["TEST_ARG2_SNAP"], "test_arg2");
      assert.strictEqual(process.env["TEST_ARG2"], void 0);
      assert.strictEqual(process.env["TEST_ARG3_VSCODE_SNAP_ORIG"], "");
      assert.strictEqual(process.env["TEST_ARG3"], "test_arg3_non_empty");
    }
  });
  test("can invoke unsetSnapExportedVariables and restoreSnapExportedVariables multiple times", () => {
    const service = new EnvironmentMainService(
      { _: [] },
      { _serviceBrand: void 0, ...product }
    );
    process.env["SNAP"] = "1";
    process.env["SNAP_REVISION"] = "test_revision";
    process.env["TEST_ARG1_VSCODE_SNAP_ORIG"] = "original";
    process.env["TEST_ARG1"] = "modified";
    process.env["TEST_ARG2_SNAP"] = "test_arg2";
    process.env["TEST_ARG3_VSCODE_SNAP_ORIG"] = "";
    process.env["TEST_ARG3"] = "test_arg3_non_empty";
    service.unsetSnapExportedVariables();
    service.unsetSnapExportedVariables();
    service.unsetSnapExportedVariables();
    if (isLinux) {
      assert.strictEqual(process.env["TEST_ARG1"], "original");
      assert.strictEqual(process.env["TEST_ARG2"], void 0);
      assert.strictEqual(
        process.env["TEST_ARG1_VSCODE_SNAP_ORIG"],
        "original"
      );
      assert.strictEqual(process.env["TEST_ARG2_SNAP"], "test_arg2");
      assert.strictEqual(process.env["TEST_ARG3_VSCODE_SNAP_ORIG"], "");
      assert.strictEqual(process.env["TEST_ARG3"], void 0);
    } else {
      assert.strictEqual(process.env["TEST_ARG1"], "modified");
      assert.strictEqual(process.env["TEST_ARG2"], void 0);
      assert.strictEqual(
        process.env["TEST_ARG1_VSCODE_SNAP_ORIG"],
        "original"
      );
      assert.strictEqual(process.env["TEST_ARG2_SNAP"], "test_arg2");
      assert.strictEqual(process.env["TEST_ARG3_VSCODE_SNAP_ORIG"], "");
      assert.strictEqual(process.env["TEST_ARG3"], "test_arg3_non_empty");
    }
    service.restoreSnapExportedVariables();
    service.restoreSnapExportedVariables();
    if (isLinux) {
      assert.strictEqual(process.env["TEST_ARG1"], "modified");
      assert.strictEqual(
        process.env["TEST_ARG1_VSCODE_SNAP_ORIG"],
        "original"
      );
      assert.strictEqual(process.env["TEST_ARG2_SNAP"], "test_arg2");
      assert.strictEqual(process.env["TEST_ARG2"], void 0);
      assert.strictEqual(process.env["TEST_ARG3_VSCODE_SNAP_ORIG"], "");
      assert.strictEqual(process.env["TEST_ARG3"], "test_arg3_non_empty");
    } else {
      assert.strictEqual(process.env["TEST_ARG1"], "modified");
      assert.strictEqual(
        process.env["TEST_ARG1_VSCODE_SNAP_ORIG"],
        "original"
      );
      assert.strictEqual(process.env["TEST_ARG2_SNAP"], "test_arg2");
      assert.strictEqual(process.env["TEST_ARG2"], void 0);
      assert.strictEqual(process.env["TEST_ARG3_VSCODE_SNAP_ORIG"], "");
      assert.strictEqual(process.env["TEST_ARG3"], "test_arg3_non_empty");
    }
    service.unsetSnapExportedVariables();
    if (isLinux) {
      assert.strictEqual(process.env["TEST_ARG1"], "original");
      assert.strictEqual(process.env["TEST_ARG2"], void 0);
      assert.strictEqual(
        process.env["TEST_ARG1_VSCODE_SNAP_ORIG"],
        "original"
      );
      assert.strictEqual(process.env["TEST_ARG2_SNAP"], "test_arg2");
      assert.strictEqual(process.env["TEST_ARG3_VSCODE_SNAP_ORIG"], "");
      assert.strictEqual(process.env["TEST_ARG3"], void 0);
    } else {
      assert.strictEqual(process.env["TEST_ARG1"], "modified");
      assert.strictEqual(process.env["TEST_ARG2"], void 0);
      assert.strictEqual(
        process.env["TEST_ARG1_VSCODE_SNAP_ORIG"],
        "original"
      );
      assert.strictEqual(process.env["TEST_ARG2_SNAP"], "test_arg2");
      assert.strictEqual(process.env["TEST_ARG3_VSCODE_SNAP_ORIG"], "");
      assert.strictEqual(process.env["TEST_ARG3"], "test_arg3_non_empty");
    }
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
