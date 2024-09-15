var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { URI } from "../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { ISerializedSingleFolderWorkspaceIdentifier, ISerializedWorkspaceIdentifier, reviveIdentifier, hasWorkspaceFileExtension, isWorkspaceIdentifier, isSingleFolderWorkspaceIdentifier, IEmptyWorkspaceIdentifier, toWorkspaceIdentifier, isEmptyWorkspaceIdentifier } from "../../../workspace/common/workspace.js";
suite("Workspaces", () => {
  test("reviveIdentifier", () => {
    const serializedWorkspaceIdentifier = { id: "id", configPath: URI.file("foo").toJSON() };
    assert.strictEqual(isWorkspaceIdentifier(reviveIdentifier(serializedWorkspaceIdentifier)), true);
    const serializedSingleFolderWorkspaceIdentifier = { id: "id", uri: URI.file("foo").toJSON() };
    assert.strictEqual(isSingleFolderWorkspaceIdentifier(reviveIdentifier(serializedSingleFolderWorkspaceIdentifier)), true);
    const serializedEmptyWorkspaceIdentifier = { id: "id" };
    assert.strictEqual(reviveIdentifier(serializedEmptyWorkspaceIdentifier).id, serializedEmptyWorkspaceIdentifier.id);
    assert.strictEqual(isWorkspaceIdentifier(serializedEmptyWorkspaceIdentifier), false);
    assert.strictEqual(isSingleFolderWorkspaceIdentifier(serializedEmptyWorkspaceIdentifier), false);
    assert.strictEqual(reviveIdentifier(void 0), void 0);
  });
  test("hasWorkspaceFileExtension", () => {
    assert.strictEqual(hasWorkspaceFileExtension("something"), false);
    assert.strictEqual(hasWorkspaceFileExtension("something.code-workspace"), true);
  });
  test("toWorkspaceIdentifier", () => {
    let identifier = toWorkspaceIdentifier({ id: "id", folders: [] });
    assert.ok(identifier);
    assert.ok(isEmptyWorkspaceIdentifier(identifier));
    assert.ok(!isWorkspaceIdentifier(identifier));
    assert.ok(!isWorkspaceIdentifier(identifier));
    identifier = toWorkspaceIdentifier({ id: "id", folders: [{ index: 0, name: "test", toResource: /* @__PURE__ */ __name(() => URI.file("test"), "toResource"), uri: URI.file("test") }] });
    assert.ok(identifier);
    assert.ok(isSingleFolderWorkspaceIdentifier(identifier));
    assert.ok(!isWorkspaceIdentifier(identifier));
    identifier = toWorkspaceIdentifier({ id: "id", configuration: URI.file("test.code-workspace"), folders: [] });
    assert.ok(identifier);
    assert.ok(!isSingleFolderWorkspaceIdentifier(identifier));
    assert.ok(isWorkspaceIdentifier(identifier));
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=workspaces.test.js.map
