import assert from "assert";
import {
  IndexTreeModel
} from "../../../../browser/ui/tree/indexTreeModel.js";
import {
  TreeVisibility
} from "../../../../browser/ui/tree/tree.js";
import { timeout } from "../../../../common/async.js";
import {
  DisposableStore
} from "../../../../common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../common/utils.js";
function bindListToModel(list, model) {
  return model.onDidSpliceRenderedNodes(
    ({ start, deleteCount, elements }) => {
      list.splice(start, deleteCount, ...elements);
    }
  );
}
function toArray(list) {
  return list.map((i) => i.element);
}
function toElements(node) {
  return node.children?.length ? { e: node.element, children: node.children.map(toElements) } : node.element;
}
const diffIdentityProvider = { getId: (n) => String(n) };
function withSmartSplice(fn) {
  fn({});
  fn({ diffIdentityProvider });
}
suite("IndexTreeModel", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const disposables = new DisposableStore();
  teardown(() => {
    disposables.clear();
  });
  test("ctor", () => {
    const list = [];
    const model = new IndexTreeModel("test", -1);
    assert(model);
    assert.strictEqual(list.length, 0);
  });
  test("insert", () => withSmartSplice((options) => {
    const list = [];
    const model = new IndexTreeModel("test", -1);
    const disposable = bindListToModel(list, model);
    model.splice(
      [0],
      0,
      [{ element: 0 }, { element: 1 }, { element: 2 }],
      options
    );
    assert.deepStrictEqual(list.length, 3);
    assert.deepStrictEqual(list[0].element, 0);
    assert.deepStrictEqual(list[0].collapsed, false);
    assert.deepStrictEqual(list[0].depth, 1);
    assert.deepStrictEqual(list[1].element, 1);
    assert.deepStrictEqual(list[1].collapsed, false);
    assert.deepStrictEqual(list[1].depth, 1);
    assert.deepStrictEqual(list[2].element, 2);
    assert.deepStrictEqual(list[2].collapsed, false);
    assert.deepStrictEqual(list[2].depth, 1);
    disposable.dispose();
  }));
  test("deep insert", () => withSmartSplice((options) => {
    const list = [];
    const model = new IndexTreeModel("test", -1);
    const disposable = bindListToModel(list, model);
    model.splice([0], 0, [
      {
        element: 0,
        children: [
          { element: 10 },
          { element: 11 },
          { element: 12 }
        ]
      },
      { element: 1 },
      { element: 2 }
    ]);
    assert.deepStrictEqual(list.length, 6);
    assert.deepStrictEqual(list[0].element, 0);
    assert.deepStrictEqual(list[0].collapsed, false);
    assert.deepStrictEqual(list[0].depth, 1);
    assert.deepStrictEqual(list[1].element, 10);
    assert.deepStrictEqual(list[1].collapsed, false);
    assert.deepStrictEqual(list[1].depth, 2);
    assert.deepStrictEqual(list[2].element, 11);
    assert.deepStrictEqual(list[2].collapsed, false);
    assert.deepStrictEqual(list[2].depth, 2);
    assert.deepStrictEqual(list[3].element, 12);
    assert.deepStrictEqual(list[3].collapsed, false);
    assert.deepStrictEqual(list[3].depth, 2);
    assert.deepStrictEqual(list[4].element, 1);
    assert.deepStrictEqual(list[4].collapsed, false);
    assert.deepStrictEqual(list[4].depth, 1);
    assert.deepStrictEqual(list[5].element, 2);
    assert.deepStrictEqual(list[5].collapsed, false);
    assert.deepStrictEqual(list[5].depth, 1);
    disposable.dispose();
  }));
  test("deep insert collapsed", () => withSmartSplice((options) => {
    const list = [];
    const model = new IndexTreeModel("test", -1);
    const disposable = bindListToModel(list, model);
    model.splice(
      [0],
      0,
      [
        {
          element: 0,
          collapsed: true,
          children: [
            { element: 10 },
            { element: 11 },
            { element: 12 }
          ]
        },
        { element: 1 },
        { element: 2 }
      ],
      options
    );
    assert.deepStrictEqual(list.length, 3);
    assert.deepStrictEqual(list[0].element, 0);
    assert.deepStrictEqual(list[0].collapsed, true);
    assert.deepStrictEqual(list[0].depth, 1);
    assert.deepStrictEqual(list[1].element, 1);
    assert.deepStrictEqual(list[1].collapsed, false);
    assert.deepStrictEqual(list[1].depth, 1);
    assert.deepStrictEqual(list[2].element, 2);
    assert.deepStrictEqual(list[2].collapsed, false);
    assert.deepStrictEqual(list[2].depth, 1);
    disposable.dispose();
  }));
  test("delete", () => withSmartSplice((options) => {
    const list = [];
    const model = new IndexTreeModel("test", -1);
    const disposable = bindListToModel(list, model);
    model.splice(
      [0],
      0,
      [{ element: 0 }, { element: 1 }, { element: 2 }],
      options
    );
    assert.deepStrictEqual(list.length, 3);
    model.splice([1], 1, void 0, options);
    assert.deepStrictEqual(list.length, 2);
    assert.deepStrictEqual(list[0].element, 0);
    assert.deepStrictEqual(list[0].collapsed, false);
    assert.deepStrictEqual(list[0].depth, 1);
    assert.deepStrictEqual(list[1].element, 2);
    assert.deepStrictEqual(list[1].collapsed, false);
    assert.deepStrictEqual(list[1].depth, 1);
    model.splice([0], 2, void 0, options);
    assert.deepStrictEqual(list.length, 0);
    disposable.dispose();
  }));
  test("nested delete", () => withSmartSplice((options) => {
    const list = [];
    const model = new IndexTreeModel("test", -1);
    const disposable = bindListToModel(list, model);
    model.splice(
      [0],
      0,
      [
        {
          element: 0,
          children: [
            { element: 10 },
            { element: 11 },
            { element: 12 }
          ]
        },
        { element: 1 },
        { element: 2 }
      ],
      options
    );
    assert.deepStrictEqual(list.length, 6);
    model.splice([1], 2, void 0, options);
    assert.deepStrictEqual(list.length, 4);
    assert.deepStrictEqual(list[0].element, 0);
    assert.deepStrictEqual(list[0].collapsed, false);
    assert.deepStrictEqual(list[0].depth, 1);
    assert.deepStrictEqual(list[1].element, 10);
    assert.deepStrictEqual(list[1].collapsed, false);
    assert.deepStrictEqual(list[1].depth, 2);
    assert.deepStrictEqual(list[2].element, 11);
    assert.deepStrictEqual(list[2].collapsed, false);
    assert.deepStrictEqual(list[2].depth, 2);
    assert.deepStrictEqual(list[3].element, 12);
    assert.deepStrictEqual(list[3].collapsed, false);
    assert.deepStrictEqual(list[3].depth, 2);
    disposable.dispose();
  }));
  test("deep delete", () => withSmartSplice((options) => {
    const list = [];
    const model = new IndexTreeModel("test", -1);
    const disposable = bindListToModel(list, model);
    model.splice(
      [0],
      0,
      [
        {
          element: 0,
          children: [
            { element: 10 },
            { element: 11 },
            { element: 12 }
          ]
        },
        { element: 1 },
        { element: 2 }
      ],
      options
    );
    assert.deepStrictEqual(list.length, 6);
    model.splice([0], 1, void 0, options);
    assert.deepStrictEqual(list.length, 2);
    assert.deepStrictEqual(list[0].element, 1);
    assert.deepStrictEqual(list[0].collapsed, false);
    assert.deepStrictEqual(list[0].depth, 1);
    assert.deepStrictEqual(list[1].element, 2);
    assert.deepStrictEqual(list[1].collapsed, false);
    assert.deepStrictEqual(list[1].depth, 1);
    disposable.dispose();
  }));
  test("smart splice deep", () => {
    const list = [];
    const model = new IndexTreeModel("test", -1);
    const disposable = bindListToModel(list, model);
    model.splice(
      [0],
      0,
      [{ element: 0 }, { element: 1 }, { element: 2 }, { element: 3 }],
      { diffIdentityProvider }
    );
    assert.deepStrictEqual(
      list.filter((l) => l.depth === 1).map(toElements),
      [0, 1, 2, 3]
    );
    model.splice(
      [0],
      3,
      [
        { element: -0.5 },
        { element: 0, children: [{ element: 0.1 }] },
        { element: 1 },
        {
          element: 2,
          children: [
            { element: 2.1 },
            { element: 2.2, children: [{ element: 2.21 }] }
          ]
        }
      ],
      { diffIdentityProvider, diffDepth: Number.POSITIVE_INFINITY }
    );
    assert.deepStrictEqual(
      list.filter((l) => l.depth === 1).map(toElements),
      [
        -0.5,
        { e: 0, children: [0.1] },
        1,
        { e: 2, children: [2.1, { e: 2.2, children: [2.21] }] },
        3
      ]
    );
    disposable.dispose();
  });
  test("hidden delete", () => withSmartSplice((options) => {
    const list = [];
    const model = new IndexTreeModel("test", -1);
    const disposable = bindListToModel(list, model);
    model.splice(
      [0],
      0,
      [
        {
          element: 0,
          collapsed: true,
          children: [
            { element: 10 },
            { element: 11 },
            { element: 12 }
          ]
        },
        { element: 1 },
        { element: 2 }
      ],
      options
    );
    assert.deepStrictEqual(list.length, 3);
    model.splice([0, 1], 1, void 0, options);
    assert.deepStrictEqual(list.length, 3);
    model.splice([0, 0], 2, void 0, options);
    assert.deepStrictEqual(list.length, 3);
    disposable.dispose();
  }));
  test("collapse", () => withSmartSplice((options) => {
    const list = [];
    const model = new IndexTreeModel("test", -1);
    const disposable = bindListToModel(list, model);
    model.splice(
      [0],
      0,
      [
        {
          element: 0,
          children: [
            { element: 10 },
            { element: 11 },
            { element: 12 }
          ]
        },
        { element: 1 },
        { element: 2 }
      ],
      options
    );
    assert.deepStrictEqual(list.length, 6);
    model.setCollapsed([0], true);
    assert.deepStrictEqual(list.length, 3);
    assert.deepStrictEqual(list[0].element, 0);
    assert.deepStrictEqual(list[0].collapsed, true);
    assert.deepStrictEqual(list[0].depth, 1);
    assert.deepStrictEqual(list[1].element, 1);
    assert.deepStrictEqual(list[1].collapsed, false);
    assert.deepStrictEqual(list[1].depth, 1);
    assert.deepStrictEqual(list[2].element, 2);
    assert.deepStrictEqual(list[2].collapsed, false);
    assert.deepStrictEqual(list[2].depth, 1);
    disposable.dispose();
  }));
  test("expand", () => withSmartSplice((options) => {
    const list = [];
    const model = new IndexTreeModel("test", -1);
    const disposable = bindListToModel(list, model);
    model.splice(
      [0],
      0,
      [
        {
          element: 0,
          collapsed: true,
          children: [
            { element: 10 },
            { element: 11 },
            { element: 12 }
          ]
        },
        { element: 1 },
        { element: 2 }
      ],
      options
    );
    assert.deepStrictEqual(list.length, 3);
    model.expandTo([0, 1]);
    assert.deepStrictEqual(list.length, 6);
    assert.deepStrictEqual(list[0].element, 0);
    assert.deepStrictEqual(list[0].collapsed, false);
    assert.deepStrictEqual(list[0].depth, 1);
    assert.deepStrictEqual(list[1].element, 10);
    assert.deepStrictEqual(list[1].collapsed, false);
    assert.deepStrictEqual(list[1].depth, 2);
    assert.deepStrictEqual(list[2].element, 11);
    assert.deepStrictEqual(list[2].collapsed, false);
    assert.deepStrictEqual(list[2].depth, 2);
    assert.deepStrictEqual(list[3].element, 12);
    assert.deepStrictEqual(list[3].collapsed, false);
    assert.deepStrictEqual(list[3].depth, 2);
    assert.deepStrictEqual(list[4].element, 1);
    assert.deepStrictEqual(list[4].collapsed, false);
    assert.deepStrictEqual(list[4].depth, 1);
    assert.deepStrictEqual(list[5].element, 2);
    assert.deepStrictEqual(list[5].collapsed, false);
    assert.deepStrictEqual(list[5].depth, 1);
    disposable.dispose();
  }));
  test("smart diff consistency", () => {
    const times = 500;
    const minEdits = 1;
    const maxEdits = 10;
    const maxInserts = 5;
    for (let i = 0; i < times; i++) {
      const list = [];
      const options = {
        diffIdentityProvider: { getId: (n) => String(n) }
      };
      const model = new IndexTreeModel("test", -1);
      const disposable = bindListToModel(list, model);
      const changes = [];
      const expected = [];
      let elementCounter = 0;
      for (let edits = Math.random() * (maxEdits - minEdits) + minEdits; edits > 0; edits--) {
        const spliceIndex = Math.floor(Math.random() * list.length);
        const deleteCount = Math.ceil(
          Math.random() * (list.length - spliceIndex)
        );
        const insertCount = Math.floor(Math.random() * maxInserts + 1);
        const inserts = [];
        for (let i2 = 0; i2 < insertCount; i2++) {
          const element = elementCounter++;
          inserts.push({ element, children: [] });
        }
        if (Math.random() < 0.5) {
          const elements = list.slice(
            spliceIndex,
            spliceIndex + Math.floor(deleteCount / 2)
          );
          inserts.push(
            ...elements.map(({ element }) => ({
              element,
              children: []
            }))
          );
        }
        model.splice([spliceIndex], deleteCount, inserts, options);
        expected.splice(
          spliceIndex,
          deleteCount,
          ...inserts.map((i2) => i2.element)
        );
        const listElements = list.map((l) => l.element);
        changes.push(
          `splice(${spliceIndex}, ${deleteCount}, [${inserts.map((e) => e.element).join(", ")}]) -> ${listElements.join(", ")}`
        );
        assert.deepStrictEqual(
          expected,
          listElements,
          `Expected ${listElements.join(", ")} to equal ${expected.join(", ")}. Steps:

${changes.join("\n")}`
        );
      }
      disposable.dispose();
    }
  });
  test("collapse should recursively adjust visible count", () => {
    const list = [];
    const model = new IndexTreeModel("test", -1);
    const disposable = bindListToModel(list, model);
    model.splice([0], 0, [
      {
        element: 1,
        children: [
          {
            element: 11,
            children: [{ element: 111 }]
          }
        ]
      },
      {
        element: 2,
        children: [{ element: 21 }]
      }
    ]);
    assert.deepStrictEqual(list.length, 5);
    assert.deepStrictEqual(toArray(list), [1, 11, 111, 2, 21]);
    model.setCollapsed([0, 0], true);
    assert.deepStrictEqual(list.length, 4);
    assert.deepStrictEqual(toArray(list), [1, 11, 2, 21]);
    model.setCollapsed([1], true);
    assert.deepStrictEqual(list.length, 3);
    assert.deepStrictEqual(toArray(list), [1, 11, 2]);
    disposable.dispose();
  });
  test("setCollapsible", () => {
    const list = [];
    const model = new IndexTreeModel("test", -1);
    const disposable = bindListToModel(list, model);
    model.splice([0], 0, [
      {
        element: 0,
        children: [{ element: 10 }]
      }
    ]);
    assert.deepStrictEqual(list.length, 2);
    model.setCollapsible([0], false);
    assert.deepStrictEqual(list.length, 2);
    assert.deepStrictEqual(list[0].element, 0);
    assert.deepStrictEqual(list[0].collapsible, false);
    assert.deepStrictEqual(list[0].collapsed, false);
    assert.deepStrictEqual(list[1].element, 10);
    assert.deepStrictEqual(list[1].collapsible, false);
    assert.deepStrictEqual(list[1].collapsed, false);
    assert.deepStrictEqual(model.setCollapsed([0], true), false);
    assert.deepStrictEqual(list[0].element, 0);
    assert.deepStrictEqual(list[0].collapsible, false);
    assert.deepStrictEqual(list[0].collapsed, false);
    assert.deepStrictEqual(list[1].element, 10);
    assert.deepStrictEqual(list[1].collapsible, false);
    assert.deepStrictEqual(list[1].collapsed, false);
    assert.deepStrictEqual(model.setCollapsed([0], false), false);
    assert.deepStrictEqual(list[0].element, 0);
    assert.deepStrictEqual(list[0].collapsible, false);
    assert.deepStrictEqual(list[0].collapsed, false);
    assert.deepStrictEqual(list[1].element, 10);
    assert.deepStrictEqual(list[1].collapsible, false);
    assert.deepStrictEqual(list[1].collapsed, false);
    model.setCollapsible([0], true);
    assert.deepStrictEqual(list.length, 2);
    assert.deepStrictEqual(list[0].element, 0);
    assert.deepStrictEqual(list[0].collapsible, true);
    assert.deepStrictEqual(list[0].collapsed, false);
    assert.deepStrictEqual(list[1].element, 10);
    assert.deepStrictEqual(list[1].collapsible, false);
    assert.deepStrictEqual(list[1].collapsed, false);
    assert.deepStrictEqual(model.setCollapsed([0], true), true);
    assert.deepStrictEqual(list.length, 1);
    assert.deepStrictEqual(list[0].element, 0);
    assert.deepStrictEqual(list[0].collapsible, true);
    assert.deepStrictEqual(list[0].collapsed, true);
    assert.deepStrictEqual(model.setCollapsed([0], false), true);
    assert.deepStrictEqual(list[0].element, 0);
    assert.deepStrictEqual(list[0].collapsible, true);
    assert.deepStrictEqual(list[0].collapsed, false);
    assert.deepStrictEqual(list[1].element, 10);
    assert.deepStrictEqual(list[1].collapsible, false);
    assert.deepStrictEqual(list[1].collapsed, false);
    disposable.dispose();
  });
  test("simple filter", () => {
    const list = [];
    const filter = new class {
      filter(element) {
        return element % 2 === 0 ? TreeVisibility.Visible : TreeVisibility.Hidden;
      }
    }();
    const model = new IndexTreeModel("test", -1, { filter });
    const disposable = bindListToModel(list, model);
    model.splice([0], 0, [
      {
        element: 0,
        children: [
          { element: 1 },
          { element: 2 },
          { element: 3 },
          { element: 4 },
          { element: 5 },
          { element: 6 },
          { element: 7 }
        ]
      }
    ]);
    assert.deepStrictEqual(list.length, 4);
    assert.deepStrictEqual(toArray(list), [0, 2, 4, 6]);
    model.setCollapsed([0], true);
    assert.deepStrictEqual(toArray(list), [0]);
    model.setCollapsed([0], false);
    assert.deepStrictEqual(toArray(list), [0, 2, 4, 6]);
    disposable.dispose();
  });
  test("recursive filter on initial model", () => {
    const list = [];
    const filter = new class {
      filter(element) {
        return element === 0 ? TreeVisibility.Recurse : TreeVisibility.Hidden;
      }
    }();
    const model = new IndexTreeModel("test", -1, { filter });
    const disposable = bindListToModel(list, model);
    model.splice([0], 0, [
      {
        element: 0,
        children: [{ element: 1 }, { element: 2 }]
      }
    ]);
    assert.deepStrictEqual(toArray(list), []);
    disposable.dispose();
  });
  test("refilter", () => {
    const list = [];
    let shouldFilter = false;
    const filter = new class {
      filter(element) {
        return !shouldFilter || element % 2 === 0 ? TreeVisibility.Visible : TreeVisibility.Hidden;
      }
    }();
    const model = new IndexTreeModel("test", -1, { filter });
    const disposable = bindListToModel(list, model);
    model.splice([0], 0, [
      {
        element: 0,
        children: [
          { element: 1 },
          { element: 2 },
          { element: 3 },
          { element: 4 },
          { element: 5 },
          { element: 6 },
          { element: 7 }
        ]
      }
    ]);
    assert.deepStrictEqual(toArray(list), [0, 1, 2, 3, 4, 5, 6, 7]);
    model.refilter();
    assert.deepStrictEqual(toArray(list), [0, 1, 2, 3, 4, 5, 6, 7]);
    shouldFilter = true;
    model.refilter();
    assert.deepStrictEqual(toArray(list), [0, 2, 4, 6]);
    shouldFilter = false;
    model.refilter();
    assert.deepStrictEqual(toArray(list), [0, 1, 2, 3, 4, 5, 6, 7]);
    disposable.dispose();
  });
  test("recursive filter", () => {
    const list = [];
    let query = /(?:)/;
    const filter = new class {
      filter(element) {
        return query.test(element) ? TreeVisibility.Visible : TreeVisibility.Recurse;
      }
    }();
    const model = new IndexTreeModel("test", "root", { filter });
    const disposable = bindListToModel(list, model);
    model.splice([0], 0, [
      {
        element: "vscode",
        children: [
          { element: ".build" },
          { element: "git" },
          {
            element: "github",
            children: [
              { element: "calendar.yml" },
              { element: "endgame" },
              { element: "build.js" }
            ]
          },
          {
            element: "build",
            children: [
              { element: "lib" },
              { element: "gulpfile.js" }
            ]
          }
        ]
      }
    ]);
    assert.deepStrictEqual(list.length, 10);
    query = /build/;
    model.refilter();
    assert.deepStrictEqual(toArray(list), [
      "vscode",
      ".build",
      "github",
      "build.js",
      "build"
    ]);
    model.setCollapsed([0], true);
    assert.deepStrictEqual(toArray(list), ["vscode"]);
    model.setCollapsed([0], false);
    assert.deepStrictEqual(toArray(list), [
      "vscode",
      ".build",
      "github",
      "build.js",
      "build"
    ]);
    disposable.dispose();
  });
  test("recursive filter updates when children change (#133272)", async () => {
    const list = [];
    let query = "";
    const filter = new class {
      filter(element) {
        return element.includes(query) ? TreeVisibility.Visible : TreeVisibility.Recurse;
      }
    }();
    const model = new IndexTreeModel("test", "root", { filter });
    const disposable = bindListToModel(list, model);
    model.splice([0], 0, [
      {
        element: "a",
        children: [{ element: "b" }]
      }
    ]);
    assert.deepStrictEqual(toArray(list), ["a", "b"]);
    query = "visible";
    model.refilter();
    assert.deepStrictEqual(toArray(list), []);
    model.splice([0, 0, 0], 0, [
      {
        element: "visible",
        children: []
      }
    ]);
    await timeout(0);
    assert.deepStrictEqual(toArray(list), ["a", "b", "visible"]);
    disposable.dispose();
  });
  test("recursive filter with collapse", () => {
    const list = [];
    let query = /(?:)/;
    const filter = new class {
      filter(element) {
        return query.test(element) ? TreeVisibility.Visible : TreeVisibility.Recurse;
      }
    }();
    const model = new IndexTreeModel("test", "root", { filter });
    const disposable = bindListToModel(list, model);
    model.splice([0], 0, [
      {
        element: "vscode",
        children: [
          { element: ".build" },
          { element: "git" },
          {
            element: "github",
            children: [
              { element: "calendar.yml" },
              { element: "endgame" },
              { element: "build.js" }
            ]
          },
          {
            element: "build",
            children: [
              { element: "lib" },
              { element: "gulpfile.js" }
            ]
          }
        ]
      }
    ]);
    assert.deepStrictEqual(list.length, 10);
    query = /gulp/;
    model.refilter();
    assert.deepStrictEqual(toArray(list), [
      "vscode",
      "build",
      "gulpfile.js"
    ]);
    model.setCollapsed([0, 3], true);
    assert.deepStrictEqual(toArray(list), ["vscode", "build"]);
    model.setCollapsed([0], true);
    assert.deepStrictEqual(toArray(list), ["vscode"]);
    disposable.dispose();
  });
  test("recursive filter while collapsed", () => {
    const list = [];
    let query = /(?:)/;
    const filter = new class {
      filter(element) {
        return query.test(element) ? TreeVisibility.Visible : TreeVisibility.Recurse;
      }
    }();
    const model = new IndexTreeModel("test", "root", { filter });
    const disposable = bindListToModel(list, model);
    model.splice([0], 0, [
      {
        element: "vscode",
        collapsed: true,
        children: [
          { element: ".build" },
          { element: "git" },
          {
            element: "github",
            children: [
              { element: "calendar.yml" },
              { element: "endgame" },
              { element: "build.js" }
            ]
          },
          {
            element: "build",
            children: [
              { element: "lib" },
              { element: "gulpfile.js" }
            ]
          }
        ]
      }
    ]);
    assert.deepStrictEqual(toArray(list), ["vscode"]);
    query = /gulp/;
    model.refilter();
    assert.deepStrictEqual(toArray(list), ["vscode"]);
    model.setCollapsed([0], false);
    assert.deepStrictEqual(toArray(list), [
      "vscode",
      "build",
      "gulpfile.js"
    ]);
    model.setCollapsed([0], true);
    assert.deepStrictEqual(toArray(list), ["vscode"]);
    query = /(?:)/;
    model.refilter();
    assert.deepStrictEqual(toArray(list), ["vscode"]);
    model.setCollapsed([0], false);
    assert.deepStrictEqual(list.length, 10);
    disposable.dispose();
  });
  suite("getNodeLocation", () => {
    test("simple", () => {
      const list = [];
      const model = new IndexTreeModel("test", -1);
      const disposable = bindListToModel(list, model);
      model.splice([0], 0, [
        {
          element: 0,
          children: [
            { element: 10 },
            { element: 11 },
            { element: 12 }
          ]
        },
        { element: 1 },
        { element: 2 }
      ]);
      assert.deepStrictEqual(model.getNodeLocation(list[0]), [0]);
      assert.deepStrictEqual(model.getNodeLocation(list[1]), [0, 0]);
      assert.deepStrictEqual(model.getNodeLocation(list[2]), [0, 1]);
      assert.deepStrictEqual(model.getNodeLocation(list[3]), [0, 2]);
      assert.deepStrictEqual(model.getNodeLocation(list[4]), [1]);
      assert.deepStrictEqual(model.getNodeLocation(list[5]), [2]);
      disposable.dispose();
    });
    test("with filter", () => {
      const list = [];
      const filter = new class {
        filter(element) {
          return element % 2 === 0 ? TreeVisibility.Visible : TreeVisibility.Hidden;
        }
      }();
      const model = new IndexTreeModel("test", -1, { filter });
      const disposable = bindListToModel(list, model);
      model.splice([0], 0, [
        {
          element: 0,
          children: [
            { element: 1 },
            { element: 2 },
            { element: 3 },
            { element: 4 },
            { element: 5 },
            { element: 6 },
            { element: 7 }
          ]
        }
      ]);
      assert.deepStrictEqual(model.getNodeLocation(list[0]), [0]);
      assert.deepStrictEqual(model.getNodeLocation(list[1]), [0, 1]);
      assert.deepStrictEqual(model.getNodeLocation(list[2]), [0, 3]);
      assert.deepStrictEqual(model.getNodeLocation(list[3]), [0, 5]);
      disposable.dispose();
    });
  });
  test("refilter with filtered out nodes", () => {
    const list = [];
    let query = /(?:)/;
    const filter = new class {
      filter(element) {
        return query.test(element);
      }
    }();
    const model = new IndexTreeModel("test", "root", { filter });
    const disposable = bindListToModel(list, model);
    model.splice([0], 0, [
      { element: "silver" },
      { element: "gold" },
      { element: "platinum" }
    ]);
    assert.deepStrictEqual(toArray(list), ["silver", "gold", "platinum"]);
    query = /platinum/;
    model.refilter();
    assert.deepStrictEqual(toArray(list), ["platinum"]);
    model.splice([0], Number.POSITIVE_INFINITY, [
      { element: "silver" },
      { element: "gold" },
      { element: "platinum" }
    ]);
    assert.deepStrictEqual(toArray(list), ["platinum"]);
    model.refilter();
    assert.deepStrictEqual(toArray(list), ["platinum"]);
    disposable.dispose();
  });
  test("explicit hidden nodes should have renderNodeCount == 0, issue #83211", () => {
    const list = [];
    let query = /(?:)/;
    const filter = new class {
      filter(element) {
        return query.test(element);
      }
    }();
    const model = new IndexTreeModel("test", "root", { filter });
    const disposable = bindListToModel(list, model);
    model.splice([0], 0, [
      { element: "a", children: [{ element: "aa" }] },
      { element: "b", children: [{ element: "bb" }] }
    ]);
    assert.deepStrictEqual(toArray(list), ["a", "aa", "b", "bb"]);
    assert.deepStrictEqual(model.getListIndex([0]), 0);
    assert.deepStrictEqual(model.getListIndex([0, 0]), 1);
    assert.deepStrictEqual(model.getListIndex([1]), 2);
    assert.deepStrictEqual(model.getListIndex([1, 0]), 3);
    query = /b/;
    model.refilter();
    assert.deepStrictEqual(toArray(list), ["b", "bb"]);
    assert.deepStrictEqual(model.getListIndex([0]), -1);
    assert.deepStrictEqual(model.getListIndex([0, 0]), -1);
    assert.deepStrictEqual(model.getListIndex([1]), 0);
    assert.deepStrictEqual(model.getListIndex([1, 0]), 1);
    disposable.dispose();
  });
});
