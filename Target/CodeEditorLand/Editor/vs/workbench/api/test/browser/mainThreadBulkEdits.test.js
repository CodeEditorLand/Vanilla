import assert from "assert";
import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { mock } from "../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { UriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentityService.js";
import { reviveWorkspaceEditDto } from "../../browser/mainThreadBulkEdits.js";
suite("MainThreadBulkEdits", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test('"Rename failed to apply edits" in monorepo with pnpm #158845', () => {
    const fileService = new class extends mock() {
      onDidChangeFileSystemProviderCapabilities = Event.None;
      onDidChangeFileSystemProviderRegistrations = Event.None;
      hasProvider(uri) {
        return true;
      }
      hasCapability(resource, capability) {
        return false;
      }
    }();
    const uriIdentityService = new UriIdentityService(fileService);
    const edits = [
      {
        resource: URI.from({
          scheme: "case",
          path: "/hello/WORLD/foo.txt"
        }),
        textEdit: {
          range: {
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1
          },
          text: "sss"
        },
        versionId: void 0
      },
      {
        resource: URI.from({
          scheme: "case",
          path: "/heLLO/world/fOO.txt"
        }),
        textEdit: {
          range: {
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1
          },
          text: "sss"
        },
        versionId: void 0
      },
      {
        resource: URI.from({ scheme: "case", path: "/other/path.txt" }),
        textEdit: {
          range: {
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1
          },
          text: "sss"
        },
        versionId: void 0
      },
      {
        resource: URI.from({ scheme: "foo", path: "/other/path.txt" }),
        textEdit: {
          range: {
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1
          },
          text: "sss"
        },
        versionId: void 0
      }
    ];
    const out = reviveWorkspaceEditDto({ edits }, uriIdentityService);
    assert.strictEqual(
      out.edits[0].resource.path,
      "/hello/WORLD/foo.txt"
    );
    assert.strictEqual(
      out.edits[1].resource.path,
      "/hello/WORLD/foo.txt"
    );
    assert.strictEqual(
      out.edits[2].resource.path,
      "/other/path.txt"
    );
    assert.strictEqual(
      out.edits[3].resource.path,
      "/other/path.txt"
    );
    uriIdentityService.dispose();
  });
});
