import assert from "assert";
import { URI } from "../../../../base/common/uri.js";
import { mock } from "../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { NullLogService } from "../../../../platform/log/common/log.js";
import { nullExtensionDescription } from "../../../services/extensions/common/extensions.js";
import {
  MainContext
} from "../../common/extHost.protocol.js";
import { ExtHostBulkEdits } from "../../common/extHostBulkEdits.js";
import { ExtHostDocumentsAndEditors } from "../../common/extHostDocumentsAndEditors.js";
import * as extHostTypes from "../../common/extHostTypes.js";
import {
  SingleProxyRPCProtocol,
  TestRPCProtocol
} from "../common/testRPCProtocol.js";
suite("ExtHostBulkEdits.applyWorkspaceEdit", () => {
  const resource = URI.parse("foo:bar");
  let bulkEdits;
  let workspaceResourceEdits;
  setup(() => {
    workspaceResourceEdits = null;
    const rpcProtocol = new TestRPCProtocol();
    rpcProtocol.set(
      MainContext.MainThreadBulkEdits,
      new class extends mock() {
        $tryApplyWorkspaceEdit(_workspaceResourceEdits) {
          workspaceResourceEdits = _workspaceResourceEdits.value;
          return Promise.resolve(true);
        }
      }()
    );
    const documentsAndEditors = new ExtHostDocumentsAndEditors(
      SingleProxyRPCProtocol(null),
      new NullLogService()
    );
    documentsAndEditors.$acceptDocumentsAndEditorsDelta({
      addedDocuments: [
        {
          isDirty: false,
          languageId: "foo",
          uri: resource,
          versionId: 1337,
          lines: ["foo"],
          EOL: "\n"
        }
      ]
    });
    bulkEdits = new ExtHostBulkEdits(rpcProtocol, documentsAndEditors);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("uses version id if document available", async () => {
    const edit = new extHostTypes.WorkspaceEdit();
    edit.replace(resource, new extHostTypes.Range(0, 0, 0, 0), "hello");
    await bulkEdits.applyWorkspaceEdit(
      edit,
      nullExtensionDescription,
      void 0
    );
    assert.strictEqual(workspaceResourceEdits.edits.length, 1);
    const [first] = workspaceResourceEdits.edits;
    assert.strictEqual(first.versionId, 1337);
  });
  test("does not use version id if document is not available", async () => {
    const edit = new extHostTypes.WorkspaceEdit();
    edit.replace(
      URI.parse("foo:bar2"),
      new extHostTypes.Range(0, 0, 0, 0),
      "hello"
    );
    await bulkEdits.applyWorkspaceEdit(
      edit,
      nullExtensionDescription,
      void 0
    );
    assert.strictEqual(workspaceResourceEdits.edits.length, 1);
    const [first] = workspaceResourceEdits.edits;
    assert.ok(
      typeof first.versionId === "undefined"
    );
  });
});
