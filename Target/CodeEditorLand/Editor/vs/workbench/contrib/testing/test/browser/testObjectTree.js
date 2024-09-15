var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ObjectTree } from "../../../../../base/browser/ui/tree/objectTree.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { IWorkspaceFoldersChangeEvent } from "../../../../../platform/workspace/common/workspace.js";
import { ITestTreeProjection, TestExplorerTreeElement, TestItemTreeElement, TestTreeErrorMessage } from "../../browser/explorerProjections/index.js";
import { MainThreadTestCollection } from "../../common/mainThreadTestCollection.js";
import { TestsDiff, TestsDiffOp } from "../../common/testTypes.js";
import { ITestService } from "../../common/testService.js";
import { testStubs } from "../common/testStubs.js";
import { ITreeRenderer, ITreeSorter } from "../../../../../base/browser/ui/tree/tree.js";
const element = document.createElement("div");
element.style.height = "1000px";
element.style.width = "200px";
class TestObjectTree extends ObjectTree {
  static {
    __name(this, "TestObjectTree");
  }
  constructor(serializer, sorter) {
    super(
      "test",
      element,
      {
        getHeight: /* @__PURE__ */ __name(() => 20, "getHeight"),
        getTemplateId: /* @__PURE__ */ __name(() => "default", "getTemplateId")
      },
      [
        {
          disposeTemplate: /* @__PURE__ */ __name(({ store }) => store.dispose(), "disposeTemplate"),
          renderElement: /* @__PURE__ */ __name(({ depth, element: element2 }, _index, { container, store }) => {
            const render = /* @__PURE__ */ __name(() => {
              container.textContent = `${depth}:${serializer(element2)}`;
              Object.assign(container.dataset, element2);
            }, "render");
            render();
            if (element2 instanceof TestItemTreeElement) {
              store.add(element2.onChange(render));
            }
          }, "renderElement"),
          disposeElement: /* @__PURE__ */ __name((_el, _index, { store }) => store.clear(), "disposeElement"),
          renderTemplate: /* @__PURE__ */ __name((container) => ({ container, store: new DisposableStore() }), "renderTemplate"),
          templateId: "default"
        }
      ],
      {
        sorter: sorter ?? {
          compare: /* @__PURE__ */ __name((a, b) => serializer(a).localeCompare(serializer(b)), "compare")
        }
      }
    );
    this.layout(1e3, 200);
  }
  getRendered(getProperty) {
    const elements = element.querySelectorAll(".monaco-tl-contents");
    const sorted = [...elements].sort((a, b) => pos(a) - pos(b));
    const chain = [{ e: "", children: [] }];
    for (const element2 of sorted) {
      const [depthStr, label] = element2.textContent.split(":");
      const depth = Number(depthStr);
      const parent = chain[depth - 1];
      const child = { e: label };
      if (getProperty) {
        child.data = element2.dataset[getProperty];
      }
      parent.children = parent.children?.concat(child) ?? [child];
      chain[depth] = child;
    }
    return chain[0].children;
  }
}
const pos = /* @__PURE__ */ __name((element2) => Number(element2.parentElement.parentElement.getAttribute("aria-posinset")), "pos");
class ByLabelTreeSorter {
  static {
    __name(this, "ByLabelTreeSorter");
  }
  compare(a, b) {
    if (a instanceof TestTreeErrorMessage || b instanceof TestTreeErrorMessage) {
      return (a instanceof TestTreeErrorMessage ? -1 : 0) + (b instanceof TestTreeErrorMessage ? 1 : 0);
    }
    if (a instanceof TestItemTreeElement && b instanceof TestItemTreeElement && a.test.item.uri && b.test.item.uri && a.test.item.uri.toString() === b.test.item.uri.toString() && a.test.item.range && b.test.item.range) {
      const delta = a.test.item.range.startLineNumber - b.test.item.range.startLineNumber;
      if (delta !== 0) {
        return delta;
      }
    }
    return (a.test.item.sortText || a.test.item.label).localeCompare(b.test.item.sortText || b.test.item.label);
  }
}
class TestTreeTestHarness extends Disposable {
  constructor(makeTree, c = testStubs.nested()) {
    super();
    this.c = c;
    this._register(c);
    this._register(this.c.onDidGenerateDiff((d) => this.c.setDiff(
      d
      /* don't clear during testing */
    )));
    const collection = new MainThreadTestCollection({ asCanonicalUri: /* @__PURE__ */ __name((u) => u, "asCanonicalUri") }, (testId, levels) => {
      this.c.expand(testId, levels);
      if (!this.isProcessingDiff) {
        this.onDiff.fire(this.c.collectDiff());
      }
      return Promise.resolve();
    });
    this._register(this.onDiff.event((diff) => collection.apply(diff)));
    this.projection = this._register(makeTree({
      collection,
      onDidProcessDiff: this.onDiff.event
    }));
    const sorter = new ByLabelTreeSorter();
    this.tree = this._register(new TestObjectTree((t) => "test" in t ? t.test.item.label : t.message.toString(), sorter));
    this._register(this.tree.onDidChangeCollapseState((evt) => {
      if (evt.node.element instanceof TestItemTreeElement) {
        this.projection.expandElement(evt.node.element, evt.deep ? Infinity : 0);
      }
    }));
  }
  static {
    __name(this, "TestTreeTestHarness");
  }
  onDiff = this._register(new Emitter());
  onFolderChange = this._register(new Emitter());
  isProcessingDiff = false;
  projection;
  tree;
  pushDiff(...diff) {
    this.onDiff.fire(diff);
  }
  flush() {
    this.isProcessingDiff = true;
    while (this.c.currentDiff.length) {
      this.onDiff.fire(this.c.collectDiff());
    }
    this.isProcessingDiff = false;
    this.projection.applyTo(this.tree);
    return this.tree.getRendered();
  }
}
export {
  TestTreeTestHarness
};
//# sourceMappingURL=testObjectTree.js.map
