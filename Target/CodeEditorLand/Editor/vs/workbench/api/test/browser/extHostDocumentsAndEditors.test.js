import assert from "assert";
import { URI } from "../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { NullLogService } from "../../../../platform/log/common/log.js";
import { ExtHostDocumentsAndEditors } from "../../common/extHostDocumentsAndEditors.js";
import { TestRPCProtocol } from "../common/testRPCProtocol.js";
suite("ExtHostDocumentsAndEditors", () => {
  let editors;
  setup(() => {
    editors = new ExtHostDocumentsAndEditors(
      new TestRPCProtocol(),
      new NullLogService()
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("The value of TextDocument.isClosed is incorrect when a text document is closed, #27949", () => {
    editors.$acceptDocumentsAndEditorsDelta({
      addedDocuments: [
        {
          EOL: "\n",
          isDirty: true,
          languageId: "fooLang",
          uri: URI.parse("foo:bar"),
          versionId: 1,
          lines: ["first", "second"]
        }
      ]
    });
    return new Promise((resolve, reject) => {
      const d = editors.onDidRemoveDocuments((e) => {
        try {
          for (const data of e) {
            assert.strictEqual(data.document.isClosed, true);
          }
          resolve(void 0);
        } catch (e2) {
          reject(e2);
        } finally {
          d.dispose();
        }
      });
      editors.$acceptDocumentsAndEditorsDelta({
        removedDocuments: [URI.parse("foo:bar")]
      });
    });
  });
});
