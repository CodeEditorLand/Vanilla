import assert from "assert";
import { URI } from "../../../../../base/common/uri.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { FileKind } from "../../../../../platform/files/common/files.js";
import { WorkspaceFolder } from "../../../../../platform/workspace/common/workspace.js";
import { Workspace } from "../../../../../platform/workspace/test/common/testWorkspace.js";
import {
  BreadcrumbsModel
} from "../../../../browser/parts/editor/breadcrumbsModel.js";
import { TestContextService } from "../../../common/workbenchTestServices.js";
suite("Breadcrumb Model", () => {
  let model;
  const workspaceService = new TestContextService(
    new Workspace("ffff", [
      new WorkspaceFolder({
        uri: URI.parse("foo:/bar/baz/ws"),
        name: "ws",
        index: 0
      })
    ])
  );
  const configService = new class extends TestConfigurationService {
    getValue(...args) {
      if (args[0] === "breadcrumbs.filePath") {
        return "on";
      }
      if (args[0] === "breadcrumbs.symbolPath") {
        return "on";
      }
      return super.getValue(...args);
    }
    updateValue() {
      return Promise.resolve();
    }
  }();
  teardown(() => {
    model.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("only uri, inside workspace", () => {
    model = new BreadcrumbsModel(
      URI.parse("foo:/bar/baz/ws/some/path/file.ts"),
      void 0,
      configService,
      workspaceService,
      new class extends mock() {
      }()
    );
    const elements = model.getElements();
    assert.strictEqual(elements.length, 3);
    const [one, two, three] = elements;
    assert.strictEqual(one.kind, FileKind.FOLDER);
    assert.strictEqual(two.kind, FileKind.FOLDER);
    assert.strictEqual(three.kind, FileKind.FILE);
    assert.strictEqual(one.uri.toString(), "foo:/bar/baz/ws/some");
    assert.strictEqual(two.uri.toString(), "foo:/bar/baz/ws/some/path");
    assert.strictEqual(
      three.uri.toString(),
      "foo:/bar/baz/ws/some/path/file.ts"
    );
  });
  test("display uri matters for FileElement", () => {
    model = new BreadcrumbsModel(
      URI.parse("foo:/bar/baz/ws/some/PATH/file.ts"),
      void 0,
      configService,
      workspaceService,
      new class extends mock() {
      }()
    );
    const elements = model.getElements();
    assert.strictEqual(elements.length, 3);
    const [one, two, three] = elements;
    assert.strictEqual(one.kind, FileKind.FOLDER);
    assert.strictEqual(two.kind, FileKind.FOLDER);
    assert.strictEqual(three.kind, FileKind.FILE);
    assert.strictEqual(one.uri.toString(), "foo:/bar/baz/ws/some");
    assert.strictEqual(two.uri.toString(), "foo:/bar/baz/ws/some/PATH");
    assert.strictEqual(
      three.uri.toString(),
      "foo:/bar/baz/ws/some/PATH/file.ts"
    );
  });
  test("only uri, outside workspace", () => {
    model = new BreadcrumbsModel(
      URI.parse("foo:/outside/file.ts"),
      void 0,
      configService,
      workspaceService,
      new class extends mock() {
      }()
    );
    const elements = model.getElements();
    assert.strictEqual(elements.length, 2);
    const [one, two] = elements;
    assert.strictEqual(one.kind, FileKind.FOLDER);
    assert.strictEqual(two.kind, FileKind.FILE);
    assert.strictEqual(one.uri.toString(), "foo:/outside");
    assert.strictEqual(two.uri.toString(), "foo:/outside/file.ts");
  });
});
