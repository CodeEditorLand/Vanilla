import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { Mimes } from "../../../../../base/common/mime.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import {
  CellKind,
  CellUri,
  MimeTypeDisplayOrder,
  NotebookWorkingCopyTypeIdentifier,
  diff
} from "../../common/notebookCommon.js";
import {
  cellIndexesToRanges,
  cellRangesToIndexes,
  reduceCellRanges
} from "../../common/notebookRange.js";
import { TestCell, setupInstantiationService } from "./testNotebookEditor.js";
suite("NotebookCommon", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  let disposables;
  let instantiationService;
  let languageService;
  setup(() => {
    disposables = new DisposableStore();
    instantiationService = setupInstantiationService(disposables);
    languageService = instantiationService.get(ILanguageService);
  });
  test("sortMimeTypes default orders", () => {
    assert.deepStrictEqual(
      new MimeTypeDisplayOrder().sort([
        "application/json",
        "application/javascript",
        "text/html",
        "image/svg+xml",
        Mimes.latex,
        Mimes.markdown,
        "image/png",
        "image/jpeg",
        Mimes.text
      ]),
      [
        "application/json",
        "application/javascript",
        "text/html",
        "image/svg+xml",
        Mimes.latex,
        Mimes.markdown,
        "image/png",
        "image/jpeg",
        Mimes.text
      ]
    );
    assert.deepStrictEqual(
      new MimeTypeDisplayOrder().sort([
        "application/json",
        Mimes.latex,
        Mimes.markdown,
        "application/javascript",
        "text/html",
        Mimes.text,
        "image/png",
        "image/jpeg",
        "image/svg+xml"
      ]),
      [
        "application/json",
        "application/javascript",
        "text/html",
        "image/svg+xml",
        Mimes.latex,
        Mimes.markdown,
        "image/png",
        "image/jpeg",
        Mimes.text
      ]
    );
    assert.deepStrictEqual(
      new MimeTypeDisplayOrder().sort([
        Mimes.markdown,
        "application/json",
        Mimes.text,
        "image/jpeg",
        "application/javascript",
        "text/html",
        "image/png",
        "image/svg+xml"
      ]),
      [
        "application/json",
        "application/javascript",
        "text/html",
        "image/svg+xml",
        Mimes.markdown,
        "image/png",
        "image/jpeg",
        Mimes.text
      ]
    );
    disposables.dispose();
  });
  test("sortMimeTypes user orders", () => {
    assert.deepStrictEqual(
      new MimeTypeDisplayOrder([
        "image/png",
        Mimes.text,
        Mimes.markdown,
        "text/html",
        "application/json"
      ]).sort([
        "application/json",
        "application/javascript",
        "text/html",
        "image/svg+xml",
        Mimes.markdown,
        "image/png",
        "image/jpeg",
        Mimes.text
      ]),
      [
        "image/png",
        Mimes.text,
        Mimes.markdown,
        "text/html",
        "application/json",
        "application/javascript",
        "image/svg+xml",
        "image/jpeg"
      ]
    );
    assert.deepStrictEqual(
      new MimeTypeDisplayOrder([
        "application/json",
        "text/html",
        "text/html",
        Mimes.markdown,
        "application/json"
      ]).sort([
        Mimes.markdown,
        "application/json",
        Mimes.text,
        "application/javascript",
        "text/html",
        "image/svg+xml",
        "image/jpeg",
        "image/png"
      ]),
      [
        "application/json",
        "text/html",
        Mimes.markdown,
        "application/javascript",
        "image/svg+xml",
        "image/png",
        "image/jpeg",
        Mimes.text
      ]
    );
    disposables.dispose();
  });
  test("prioritizes mimetypes", () => {
    const m = new MimeTypeDisplayOrder([
      Mimes.markdown,
      "text/html",
      "application/json"
    ]);
    assert.deepStrictEqual(m.toArray(), [
      Mimes.markdown,
      "text/html",
      "application/json"
    ]);
    m.prioritize("text/html", ["application/json"]);
    assert.deepStrictEqual(m.toArray(), [
      Mimes.markdown,
      "text/html",
      "application/json"
    ]);
    m.prioritize("text/html", ["application/json", Mimes.markdown]);
    assert.deepStrictEqual(m.toArray(), [
      "text/html",
      Mimes.markdown,
      "application/json"
    ]);
    m.prioritize("text/plain", ["application/json", Mimes.markdown]);
    assert.deepStrictEqual(m.toArray(), [
      "text/plain",
      "text/html",
      Mimes.markdown,
      "application/json"
    ]);
    m.prioritize(Mimes.markdown, [
      "text/plain",
      "application/json",
      Mimes.markdown
    ]);
    assert.deepStrictEqual(m.toArray(), [
      "text/html",
      Mimes.markdown,
      "text/plain",
      "application/json"
    ]);
    m.prioritize("text/plain", ["text/plain", "text/html", Mimes.markdown]);
    assert.deepStrictEqual(m.toArray(), [
      "text/plain",
      "text/html",
      Mimes.markdown,
      "application/json"
    ]);
    const m2 = new MimeTypeDisplayOrder(["a", "b"]);
    m2.prioritize("b", ["a", "b", "a", "q"]);
    assert.deepStrictEqual(m2.toArray(), ["b", "a"]);
    disposables.dispose();
  });
  test("sortMimeTypes glob", () => {
    assert.deepStrictEqual(
      new MimeTypeDisplayOrder([
        "application/vnd-vega*",
        Mimes.markdown,
        "text/html",
        "application/json"
      ]).sort([
        "application/json",
        "application/javascript",
        "text/html",
        "application/vnd-plot.json",
        "application/vnd-vega.json"
      ]),
      [
        "application/vnd-vega.json",
        "text/html",
        "application/json",
        "application/vnd-plot.json",
        "application/javascript"
      ],
      "glob *"
    );
    disposables.dispose();
  });
  test("diff cells", () => {
    const cells = [];
    for (let i = 0; i < 5; i++) {
      cells.push(
        disposables.add(
          new TestCell(
            "notebook",
            i,
            `var a = ${i};`,
            "javascript",
            CellKind.Code,
            [],
            languageService
          )
        )
      );
    }
    assert.deepStrictEqual(
      diff(cells, [], (cell) => {
        return cells.indexOf(cell) > -1;
      }),
      [
        {
          start: 0,
          deleteCount: 5,
          toInsert: []
        }
      ]
    );
    assert.deepStrictEqual(
      diff([], cells, (cell) => {
        return false;
      }),
      [
        {
          start: 0,
          deleteCount: 0,
          toInsert: cells
        }
      ]
    );
    const cellA = disposables.add(
      new TestCell(
        "notebook",
        6,
        "var a = 6;",
        "javascript",
        CellKind.Code,
        [],
        languageService
      )
    );
    const cellB = disposables.add(
      new TestCell(
        "notebook",
        7,
        "var a = 7;",
        "javascript",
        CellKind.Code,
        [],
        languageService
      )
    );
    const modifiedCells = [
      cells[0],
      cells[1],
      cellA,
      cells[3],
      cellB,
      cells[4]
    ];
    const splices = diff(cells, modifiedCells, (cell) => {
      return cells.indexOf(cell) > -1;
    });
    assert.deepStrictEqual(splices, [
      {
        start: 2,
        deleteCount: 1,
        toInsert: [cellA]
      },
      {
        start: 4,
        deleteCount: 0,
        toInsert: [cellB]
      }
    ]);
    disposables.dispose();
  });
});
suite("CellUri", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("parse, generate (file-scheme)", () => {
    const nb = URI.parse("file:///bar/f\xF8lder/file.nb");
    const id = 17;
    const data = CellUri.generate(nb, id);
    const actual = CellUri.parse(data);
    assert.ok(Boolean(actual));
    assert.strictEqual(actual?.handle, id);
    assert.strictEqual(actual?.notebook.toString(), nb.toString());
  });
  test("parse, generate (foo-scheme)", () => {
    const nb = URI.parse("foo:///bar/f\xF8lder/file.nb");
    const id = 17;
    const data = CellUri.generate(nb, id);
    const actual = CellUri.parse(data);
    assert.ok(Boolean(actual));
    assert.strictEqual(actual?.handle, id);
    assert.strictEqual(actual?.notebook.toString(), nb.toString());
  });
  test("stable order", () => {
    const nb = URI.parse("foo:///bar/f\xF8lder/file.nb");
    const handles = [1, 2, 9, 10, 88, 100, 666666, 7777777];
    const uris = handles.map((h) => CellUri.generate(nb, h)).sort();
    const strUris = uris.map(String).sort();
    const parsedUris = strUris.map((s) => URI.parse(s));
    const actual = parsedUris.map((u) => CellUri.parse(u)?.handle);
    assert.deepStrictEqual(actual, handles);
  });
});
suite("CellRange", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("Cell range to index", () => {
    assert.deepStrictEqual(cellRangesToIndexes([]), []);
    assert.deepStrictEqual(cellRangesToIndexes([{ start: 0, end: 0 }]), []);
    assert.deepStrictEqual(
      cellRangesToIndexes([{ start: 0, end: 1 }]),
      [0]
    );
    assert.deepStrictEqual(
      cellRangesToIndexes([{ start: 0, end: 2 }]),
      [0, 1]
    );
    assert.deepStrictEqual(
      cellRangesToIndexes([
        { start: 0, end: 2 },
        { start: 2, end: 3 }
      ]),
      [0, 1, 2]
    );
    assert.deepStrictEqual(
      cellRangesToIndexes([
        { start: 0, end: 2 },
        { start: 3, end: 4 }
      ]),
      [0, 1, 3]
    );
  });
  test("Cell index to range", () => {
    assert.deepStrictEqual(cellIndexesToRanges([]), []);
    assert.deepStrictEqual(cellIndexesToRanges([0]), [
      { start: 0, end: 1 }
    ]);
    assert.deepStrictEqual(cellIndexesToRanges([0, 1]), [
      { start: 0, end: 2 }
    ]);
    assert.deepStrictEqual(cellIndexesToRanges([0, 1, 2]), [
      { start: 0, end: 3 }
    ]);
    assert.deepStrictEqual(cellIndexesToRanges([0, 1, 3]), [
      { start: 0, end: 2 },
      { start: 3, end: 4 }
    ]);
    assert.deepStrictEqual(cellIndexesToRanges([1, 0]), [
      { start: 0, end: 2 }
    ]);
    assert.deepStrictEqual(cellIndexesToRanges([1, 2, 0]), [
      { start: 0, end: 3 }
    ]);
    assert.deepStrictEqual(cellIndexesToRanges([3, 1, 0]), [
      { start: 0, end: 2 },
      { start: 3, end: 4 }
    ]);
    assert.deepStrictEqual(cellIndexesToRanges([9, 10]), [
      { start: 9, end: 11 }
    ]);
    assert.deepStrictEqual(cellIndexesToRanges([10, 9]), [
      { start: 9, end: 11 }
    ]);
  });
  test("Reduce ranges", () => {
    assert.deepStrictEqual(
      reduceCellRanges([
        { start: 0, end: 1 },
        { start: 1, end: 2 }
      ]),
      [{ start: 0, end: 2 }]
    );
    assert.deepStrictEqual(
      reduceCellRanges([
        { start: 0, end: 2 },
        { start: 1, end: 3 }
      ]),
      [{ start: 0, end: 3 }]
    );
    assert.deepStrictEqual(
      reduceCellRanges([
        { start: 1, end: 3 },
        { start: 0, end: 2 }
      ]),
      [{ start: 0, end: 3 }]
    );
    assert.deepStrictEqual(
      reduceCellRanges([
        { start: 0, end: 2 },
        { start: 4, end: 5 }
      ]),
      [
        { start: 0, end: 2 },
        { start: 4, end: 5 }
      ]
    );
    assert.deepStrictEqual(
      reduceCellRanges([
        { start: 0, end: 1 },
        { start: 1, end: 2 },
        { start: 4, end: 6 }
      ]),
      [
        { start: 0, end: 2 },
        { start: 4, end: 6 }
      ]
    );
    assert.deepStrictEqual(
      reduceCellRanges([
        { start: 0, end: 1 },
        { start: 1, end: 3 },
        { start: 3, end: 4 }
      ]),
      [{ start: 0, end: 4 }]
    );
  });
  test("Reduce ranges 2, empty ranges", () => {
    assert.deepStrictEqual(
      reduceCellRanges([
        { start: 0, end: 0 },
        { start: 0, end: 0 }
      ]),
      [{ start: 0, end: 0 }]
    );
    assert.deepStrictEqual(
      reduceCellRanges([
        { start: 0, end: 0 },
        { start: 1, end: 2 }
      ]),
      [{ start: 1, end: 2 }]
    );
    assert.deepStrictEqual(reduceCellRanges([{ start: 2, end: 2 }]), [
      { start: 2, end: 2 }
    ]);
  });
});
suite("NotebookWorkingCopyTypeIdentifier", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("works", () => {
    const viewType = "testViewType";
    const type = NotebookWorkingCopyTypeIdentifier.create("testViewType");
    assert.strictEqual(
      NotebookWorkingCopyTypeIdentifier.parse(type),
      viewType
    );
    assert.strictEqual(
      NotebookWorkingCopyTypeIdentifier.parse("something"),
      void 0
    );
  });
});
