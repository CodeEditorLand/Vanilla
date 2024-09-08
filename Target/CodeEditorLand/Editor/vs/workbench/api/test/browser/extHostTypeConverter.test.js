import assert from "assert";
import { isEmptyObject } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import {
  LanguageSelector,
  MarkdownString,
  NotebookCellOutputItem,
  NotebookData,
  WorkspaceEdit
} from "../../common/extHostTypeConverters.js";
import * as extHostTypes from "../../common/extHostTypes.js";
suite("ExtHostTypeConverter", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  function size(from) {
    let count = 0;
    for (const key in from) {
      if (Object.prototype.hasOwnProperty.call(from, key)) {
        count += 1;
      }
    }
    return count;
  }
  test("MarkdownConvert - uris", () => {
    let data = MarkdownString.from("Hello");
    assert.strictEqual(isEmptyObject(data.uris), true);
    assert.strictEqual(data.value, "Hello");
    data = MarkdownString.from("Hello [link](foo)");
    assert.strictEqual(data.value, "Hello [link](foo)");
    assert.strictEqual(isEmptyObject(data.uris), true);
    data = MarkdownString.from("Hello [link](www.noscheme.bad)");
    assert.strictEqual(data.value, "Hello [link](www.noscheme.bad)");
    assert.strictEqual(isEmptyObject(data.uris), true);
    data = MarkdownString.from("Hello [link](foo:path)");
    assert.strictEqual(data.value, "Hello [link](foo:path)");
    assert.strictEqual(size(data.uris), 1);
    assert.ok(!!data.uris["foo:path"]);
    data = MarkdownString.from("hello@foo.bar");
    assert.strictEqual(data.value, "hello@foo.bar");
    assert.strictEqual(size(data.uris), 1);
    data = MarkdownString.from("*hello* [click](command:me)");
    assert.strictEqual(data.value, "*hello* [click](command:me)");
    assert.strictEqual(size(data.uris), 1);
    assert.ok(!!data.uris["command:me"]);
    data = MarkdownString.from(
      "*hello* [click](file:///somepath/here). [click](file:///somepath/here)"
    );
    assert.strictEqual(
      data.value,
      "*hello* [click](file:///somepath/here). [click](file:///somepath/here)"
    );
    assert.strictEqual(size(data.uris), 1);
    assert.ok(!!data.uris["file:///somepath/here"]);
    data = MarkdownString.from(
      "*hello* [click](file:///somepath/here). [click](file:///somepath/here)"
    );
    assert.strictEqual(
      data.value,
      "*hello* [click](file:///somepath/here). [click](file:///somepath/here)"
    );
    assert.strictEqual(size(data.uris), 1);
    assert.ok(!!data.uris["file:///somepath/here"]);
    data = MarkdownString.from(
      "*hello* [click](file:///somepath/here). [click](file:///somepath/here2)"
    );
    assert.strictEqual(
      data.value,
      "*hello* [click](file:///somepath/here). [click](file:///somepath/here2)"
    );
    assert.strictEqual(size(data.uris), 2);
    assert.ok(!!data.uris["file:///somepath/here"]);
    assert.ok(!!data.uris["file:///somepath/here2"]);
  });
  test("NPM script explorer running a script from the hover does not work #65561", () => {
    const data = MarkdownString.from(
      "*hello* [click](command:npm.runScriptFromHover?%7B%22documentUri%22%3A%7B%22%24mid%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fc%253A%2Ffoo%2Fbaz.ex%22%2C%22path%22%3A%22%2Fc%3A%2Ffoo%2Fbaz.ex%22%2C%22scheme%22%3A%22file%22%7D%2C%22script%22%3A%22dev%22%7D)"
    );
    assert.strictEqual(size(data.uris), 2);
    for (const value of Object.values(data.uris)) {
      if (value.scheme === "file") {
        assert.ok(
          URI.revive(value).toString().indexOf("file:///c%3A") === 0
        );
      } else {
        assert.strictEqual(value.scheme, "command");
      }
    }
  });
  test("Notebook metadata is ignored when using Notebook Serializer #125716", () => {
    const d = new extHostTypes.NotebookData([]);
    d.cells.push(
      new extHostTypes.NotebookCellData(
        extHostTypes.NotebookCellKind.Code,
        "hello",
        "fooLang"
      )
    );
    d.metadata = { foo: "bar", bar: 123 };
    const dto = NotebookData.from(d);
    assert.strictEqual(dto.cells.length, 1);
    assert.strictEqual(dto.cells[0].language, "fooLang");
    assert.strictEqual(dto.cells[0].source, "hello");
    assert.deepStrictEqual(dto.metadata, d.metadata);
  });
  test("NotebookCellOutputItem", () => {
    const item = extHostTypes.NotebookCellOutputItem.text(
      "Hello",
      "foo/bar"
    );
    const dto = NotebookCellOutputItem.from(item);
    assert.strictEqual(dto.mime, "foo/bar");
    assert.deepStrictEqual(
      Array.from(dto.valueBytes.buffer),
      Array.from(new TextEncoder().encode("Hello"))
    );
    const item2 = NotebookCellOutputItem.to(dto);
    assert.strictEqual(item2.mime, item.mime);
    assert.deepStrictEqual(Array.from(item2.data), Array.from(item.data));
  });
  test("LanguageSelector", () => {
    const out = LanguageSelector.from({
      language: "bat",
      notebookType: "xxx"
    });
    assert.ok(typeof out === "object");
    assert.deepStrictEqual(out, {
      language: "bat",
      notebookType: "xxx",
      scheme: void 0,
      pattern: void 0,
      exclusive: void 0
    });
  });
  test("JS/TS Surround With Code Actions provide bad Workspace Edits when obtained by VSCode Command API #178654", () => {
    const uri = URI.parse("file:///foo/bar");
    const ws = new extHostTypes.WorkspaceEdit();
    ws.set(uri, [
      extHostTypes.SnippetTextEdit.insert(
        new extHostTypes.Position(1, 1),
        new extHostTypes.SnippetString("foo$0bar")
      )
    ]);
    const dto = WorkspaceEdit.from(ws);
    const first = dto.edits[0];
    assert.strictEqual(first.textEdit.insertAsSnippet, true);
    const ws2 = WorkspaceEdit.to(dto);
    const dto2 = WorkspaceEdit.from(ws2);
    const first2 = dto2.edits[0];
    assert.strictEqual(first2.textEdit.insertAsSnippet, true);
  });
});
