var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { IIdentityProvider, IListVirtualDelegate } from "../../../../browser/ui/list/list.js";
import { CompressibleObjectTreeModel, ICompressedTreeNode } from "../../../../browser/ui/tree/compressedObjectTreeModel.js";
import { CompressibleObjectTree, ICompressibleTreeRenderer, ObjectTree } from "../../../../browser/ui/tree/objectTree.js";
import { ITreeNode, ITreeRenderer } from "../../../../browser/ui/tree/tree.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../common/utils.js";
import { ObjectTreeModel } from "../../../../browser/ui/tree/objectTreeModel.js";
function getRowsTextContent(container) {
  const rows = [...container.querySelectorAll(".monaco-list-row")];
  rows.sort((a, b) => parseInt(a.getAttribute("data-index")) - parseInt(b.getAttribute("data-index")));
  return rows.map((row) => row.querySelector(".monaco-tl-contents").textContent);
}
__name(getRowsTextContent, "getRowsTextContent");
suite("ObjectTree", function() {
  suite("TreeNavigator", function() {
    let tree;
    let filter = /* @__PURE__ */ __name((_) => true, "filter");
    teardown(() => {
      tree.dispose();
      filter = /* @__PURE__ */ __name((_) => true, "filter");
    });
    ensureNoDisposablesAreLeakedInTestSuite();
    setup(() => {
      const container = document.createElement("div");
      container.style.width = "200px";
      container.style.height = "200px";
      const delegate = new class {
        getHeight() {
          return 20;
        }
        getTemplateId() {
          return "default";
        }
      }();
      const renderer = new class {
        templateId = "default";
        renderTemplate(container2) {
          return container2;
        }
        renderElement(element, index, templateData) {
          templateData.textContent = `${element.element}`;
        }
        disposeTemplate() {
        }
      }();
      tree = new ObjectTree("test", container, delegate, [renderer], { filter: { filter: /* @__PURE__ */ __name((el) => filter(el), "filter") } });
      tree.layout(200);
    });
    test("should be able to navigate", () => {
      tree.setChildren(null, [
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
      const navigator = tree.navigate();
      assert.strictEqual(navigator.current(), null);
      assert.strictEqual(navigator.next(), 0);
      assert.strictEqual(navigator.current(), 0);
      assert.strictEqual(navigator.next(), 10);
      assert.strictEqual(navigator.current(), 10);
      assert.strictEqual(navigator.next(), 11);
      assert.strictEqual(navigator.current(), 11);
      assert.strictEqual(navigator.next(), 12);
      assert.strictEqual(navigator.current(), 12);
      assert.strictEqual(navigator.next(), 1);
      assert.strictEqual(navigator.current(), 1);
      assert.strictEqual(navigator.next(), 2);
      assert.strictEqual(navigator.current(), 2);
      assert.strictEqual(navigator.previous(), 1);
      assert.strictEqual(navigator.current(), 1);
      assert.strictEqual(navigator.previous(), 12);
      assert.strictEqual(navigator.previous(), 11);
      assert.strictEqual(navigator.previous(), 10);
      assert.strictEqual(navigator.previous(), 0);
      assert.strictEqual(navigator.previous(), null);
      assert.strictEqual(navigator.next(), 0);
      assert.strictEqual(navigator.next(), 10);
      assert.strictEqual(navigator.first(), 0);
      assert.strictEqual(navigator.last(), 2);
    });
    test("should skip collapsed nodes", () => {
      tree.setChildren(null, [
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
      ]);
      const navigator = tree.navigate();
      assert.strictEqual(navigator.current(), null);
      assert.strictEqual(navigator.next(), 0);
      assert.strictEqual(navigator.next(), 1);
      assert.strictEqual(navigator.next(), 2);
      assert.strictEqual(navigator.next(), null);
      assert.strictEqual(navigator.previous(), 2);
      assert.strictEqual(navigator.previous(), 1);
      assert.strictEqual(navigator.previous(), 0);
      assert.strictEqual(navigator.previous(), null);
      assert.strictEqual(navigator.next(), 0);
      assert.strictEqual(navigator.first(), 0);
      assert.strictEqual(navigator.last(), 2);
    });
    test("should skip filtered elements", () => {
      filter = /* @__PURE__ */ __name((el) => el % 2 === 0, "filter");
      tree.setChildren(null, [
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
      const navigator = tree.navigate();
      assert.strictEqual(navigator.current(), null);
      assert.strictEqual(navigator.next(), 0);
      assert.strictEqual(navigator.next(), 10);
      assert.strictEqual(navigator.next(), 12);
      assert.strictEqual(navigator.next(), 2);
      assert.strictEqual(navigator.next(), null);
      assert.strictEqual(navigator.previous(), 2);
      assert.strictEqual(navigator.previous(), 12);
      assert.strictEqual(navigator.previous(), 10);
      assert.strictEqual(navigator.previous(), 0);
      assert.strictEqual(navigator.previous(), null);
      assert.strictEqual(navigator.next(), 0);
      assert.strictEqual(navigator.next(), 10);
      assert.strictEqual(navigator.first(), 0);
      assert.strictEqual(navigator.last(), 2);
    });
    test("should be able to start from node", () => {
      tree.setChildren(null, [
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
      const navigator = tree.navigate(1);
      assert.strictEqual(navigator.current(), 1);
      assert.strictEqual(navigator.next(), 2);
      assert.strictEqual(navigator.current(), 2);
      assert.strictEqual(navigator.previous(), 1);
      assert.strictEqual(navigator.current(), 1);
      assert.strictEqual(navigator.previous(), 12);
      assert.strictEqual(navigator.previous(), 11);
      assert.strictEqual(navigator.previous(), 10);
      assert.strictEqual(navigator.previous(), 0);
      assert.strictEqual(navigator.previous(), null);
      assert.strictEqual(navigator.next(), 0);
      assert.strictEqual(navigator.next(), 10);
      assert.strictEqual(navigator.first(), 0);
      assert.strictEqual(navigator.last(), 2);
    });
  });
  class Delegate {
    static {
      __name(this, "Delegate");
    }
    getHeight() {
      return 20;
    }
    getTemplateId() {
      return "default";
    }
  }
  class Renderer {
    static {
      __name(this, "Renderer");
    }
    templateId = "default";
    renderTemplate(container) {
      return container;
    }
    renderElement(element, index, templateData) {
      templateData.textContent = `${element.element}`;
    }
    disposeTemplate() {
    }
  }
  class IdentityProvider {
    static {
      __name(this, "IdentityProvider");
    }
    getId(element) {
      return `${element % 100}`;
    }
  }
  test("traits are preserved according to string identity", function() {
    const container = document.createElement("div");
    container.style.width = "200px";
    container.style.height = "200px";
    const delegate = new Delegate();
    const renderer = new Renderer();
    const identityProvider = new IdentityProvider();
    const tree = new ObjectTree("test", container, delegate, [renderer], { identityProvider });
    tree.layout(200);
    tree.setChildren(null, [{ element: 0 }, { element: 1 }, { element: 2 }, { element: 3 }]);
    tree.setFocus([1]);
    assert.deepStrictEqual(tree.getFocus(), [1]);
    tree.setChildren(null, [{ element: 100 }, { element: 101 }, { element: 102 }, { element: 103 }]);
    assert.deepStrictEqual(tree.getFocus(), [101]);
  });
  test("swap model", function() {
    const container = document.createElement("div");
    container.style.width = "200px";
    container.style.height = "200px";
    const delegate = new Delegate();
    const renderer = new Renderer();
    const identityProvider = new IdentityProvider();
    const tree = new ObjectTree("test", container, delegate, [renderer], { identityProvider });
    tree.layout(200);
    tree.setChildren(null, [{ element: 1 }, { element: 2 }, { element: 3 }, { element: 4 }]);
    assert.deepStrictEqual(getRowsTextContent(container), ["1", "2", "3", "4"]);
    const oldModel = tree.getModel();
    const newModel = new ObjectTreeModel("test", {});
    tree.setModel(newModel);
    assert.deepStrictEqual(getRowsTextContent(container), []);
    newModel.setChildren(null, [
      { element: 1, children: [{ element: 11 }] },
      { element: 2 }
    ]);
    assert.deepStrictEqual(getRowsTextContent(container), ["1", "11", "2"]);
    tree.setChildren(11, [
      { element: 111, children: [{ element: 1111 }] },
      { element: 112 }
    ]);
    assert.deepStrictEqual(getRowsTextContent(container), ["1", "11", "111", "1111", "112", "2"]);
    tree.setModel(oldModel);
    assert.deepStrictEqual(getRowsTextContent(container), ["1", "2", "3", "4"]);
  });
  test("swap model events", function() {
    const container = document.createElement("div");
    container.style.width = "200px";
    container.style.height = "200px";
    const delegate = new Delegate();
    const renderer = new Renderer();
    const identityProvider = new IdentityProvider();
    const tree = new ObjectTree("test", container, delegate, [renderer], { identityProvider });
    tree.layout(200);
    tree.setChildren(null, [{ element: 1 }, { element: 2 }, { element: 3 }, { element: 4 }]);
    assert.deepStrictEqual(getRowsTextContent(container), ["1", "2", "3", "4"]);
    const newModel = new ObjectTreeModel("test", {});
    newModel.setChildren(null, [
      { element: 1, children: [{ element: 11 }] },
      { element: 2 }
    ]);
    let didChangeModel = false;
    let didChangeRenderNodeCount = false;
    let didChangeCollapseState = false;
    tree.onDidChangeModel(() => {
      didChangeModel = true;
    });
    tree.onDidChangeRenderNodeCount(() => {
      didChangeRenderNodeCount = true;
    });
    tree.onDidChangeCollapseState(() => {
      didChangeCollapseState = true;
    });
    tree.setModel(newModel);
    assert.strictEqual(didChangeModel, true);
    assert.strictEqual(didChangeRenderNodeCount, false);
    assert.strictEqual(didChangeCollapseState, false);
  });
  test.skip("swap model TreeError uses updated user", function() {
    const container = document.createElement("div");
    container.style.width = "200px";
    container.style.height = "200px";
    const delegate = new Delegate();
    const renderer = new Renderer();
    const tree = new ObjectTree("test", container, delegate, [renderer], {});
    tree.layout(200);
    tree.setChildren(null, [{ element: 1 }]);
    const newModel = new ObjectTreeModel("NEW_USER_NAME", {});
    tree.setModel(newModel);
    try {
      tree.getViewState();
    } catch (e) {
      assert.strictEqual(e.message.includes("NEW_USER_NAME"), true);
      return;
    }
    assert.fail("Expected error");
  });
});
suite("CompressibleObjectTree", function() {
  class Delegate {
    static {
      __name(this, "Delegate");
    }
    getHeight() {
      return 20;
    }
    getTemplateId() {
      return "default";
    }
  }
  class Renderer {
    static {
      __name(this, "Renderer");
    }
    templateId = "default";
    renderTemplate(container) {
      return container;
    }
    renderElement(node, _, templateData) {
      templateData.textContent = `${node.element}`;
    }
    renderCompressedElements(node, _, templateData) {
      templateData.textContent = `${node.element.elements.join("/")}`;
    }
    disposeTemplate() {
    }
  }
  const ds = ensureNoDisposablesAreLeakedInTestSuite();
  test("empty", function() {
    const container = document.createElement("div");
    container.style.width = "200px";
    container.style.height = "200px";
    const tree = ds.add(new CompressibleObjectTree("test", container, new Delegate(), [new Renderer()]));
    tree.layout(200);
    assert.strictEqual(getRowsTextContent(container).length, 0);
  });
  test("simple", function() {
    const container = document.createElement("div");
    container.style.width = "200px";
    container.style.height = "200px";
    const tree = ds.add(new CompressibleObjectTree("test", container, new Delegate(), [new Renderer()]));
    tree.layout(200);
    tree.setChildren(null, [
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
    assert.deepStrictEqual(getRowsTextContent(container), ["0", "10", "11", "12", "1", "2"]);
  });
  test("compressed", () => {
    const container = document.createElement("div");
    container.style.width = "200px";
    container.style.height = "200px";
    const tree = ds.add(new CompressibleObjectTree("test", container, new Delegate(), [new Renderer()]));
    tree.layout(200);
    tree.setChildren(null, [
      {
        element: 1,
        children: [{
          element: 11,
          children: [{
            element: 111,
            children: [
              { element: 1111 },
              { element: 1112 },
              { element: 1113 }
            ]
          }]
        }]
      }
    ]);
    assert.deepStrictEqual(getRowsTextContent(container), ["1/11/111", "1111", "1112", "1113"]);
    tree.setChildren(11, [
      { element: 111 },
      { element: 112 },
      { element: 113 }
    ]);
    assert.deepStrictEqual(getRowsTextContent(container), ["1/11", "111", "112", "113"]);
    tree.setChildren(113, [
      { element: 1131 }
    ]);
    assert.deepStrictEqual(getRowsTextContent(container), ["1/11", "111", "112", "113/1131"]);
    tree.setChildren(1131, [
      { element: 1132 }
    ]);
    assert.deepStrictEqual(getRowsTextContent(container), ["1/11", "111", "112", "113/1131/1132"]);
    tree.setChildren(1131, [
      { element: 1132 },
      { element: 1133 }
    ]);
    assert.deepStrictEqual(getRowsTextContent(container), ["1/11", "111", "112", "113/1131", "1132", "1133"]);
  });
  test("enableCompression", () => {
    const container = document.createElement("div");
    container.style.width = "200px";
    container.style.height = "200px";
    const tree = ds.add(new CompressibleObjectTree("test", container, new Delegate(), [new Renderer()]));
    tree.layout(200);
    tree.setChildren(null, [
      {
        element: 1,
        children: [{
          element: 11,
          children: [{
            element: 111,
            children: [
              { element: 1111 },
              { element: 1112 },
              { element: 1113 }
            ]
          }]
        }]
      }
    ]);
    assert.deepStrictEqual(getRowsTextContent(container), ["1/11/111", "1111", "1112", "1113"]);
    tree.updateOptions({ compressionEnabled: false });
    assert.deepStrictEqual(getRowsTextContent(container), ["1", "11", "111", "1111", "1112", "1113"]);
    tree.updateOptions({ compressionEnabled: true });
    assert.deepStrictEqual(getRowsTextContent(container), ["1/11/111", "1111", "1112", "1113"]);
  });
  test("swapModel", () => {
    const container = document.createElement("div");
    container.style.width = "200px";
    container.style.height = "200px";
    const tree = ds.add(new CompressibleObjectTree("test", container, new Delegate(), [new Renderer()]));
    tree.layout(200);
    tree.setChildren(null, [
      {
        element: 1,
        children: [{
          element: 11,
          children: [{
            element: 111,
            children: [
              { element: 1111 },
              { element: 1112 },
              { element: 1113 }
            ]
          }]
        }]
      }
    ]);
    assert.deepStrictEqual(getRowsTextContent(container), ["1/11/111", "1111", "1112", "1113"]);
    const newModel = new CompressibleObjectTreeModel("test", {});
    newModel.setChildren(null, [
      {
        element: 1,
        children: [{
          element: 11
        }]
      },
      {
        element: 2,
        children: [{
          element: 21,
          children: [
            { element: 211 },
            { element: 212 },
            { element: 213 }
          ]
        }]
      }
    ]);
    tree.setModel(newModel);
    assert.deepStrictEqual(getRowsTextContent(container), ["1/11", "2/21", "211", "212", "213"]);
    tree.setChildren(11, [
      { element: 111 },
      { element: 112 },
      { element: 113 }
    ]);
    assert.deepStrictEqual(getRowsTextContent(container), ["1/11", "111", "112", "113", "2/21", "211", "212", "213"]);
  });
});
//# sourceMappingURL=objectTree.test.js.map
