import assert from "assert";
import * as sinon from "sinon";
import { Emitter } from "../../../../base/common/event.js";
import { mock } from "../../../../base/test/common/mock.js";
import { runWithFakedTimers } from "../../../../base/test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { NullLogService } from "../../../../platform/log/common/log.js";
import {
  TreeItemCollapsibleState
} from "../../../common/views.js";
import { nullExtensionDescription as extensionsDescription } from "../../../services/extensions/common/extensions.js";
import {
  MainContext
} from "../../common/extHost.protocol.js";
import { ExtHostCommands } from "../../common/extHostCommands.js";
import { ExtHostTreeViews } from "../../common/extHostTreeViews.js";
import { TestRPCProtocol } from "../common/testRPCProtocol.js";
suite("ExtHostTreeView", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  class RecordingShape extends mock() {
    onRefresh = new Emitter();
    async $registerTreeViewDataProvider(treeViewId) {
    }
    $refresh(viewId, itemsToRefresh) {
      return Promise.resolve(null).then(() => {
        this.onRefresh.fire(itemsToRefresh);
      });
    }
    $reveal(treeViewId, itemInfo, options) {
      return Promise.resolve();
    }
    $disposeTree(treeViewId) {
      return Promise.resolve();
    }
  }
  let testObject;
  let target;
  let onDidChangeTreeNode;
  let onDidChangeTreeNodeWithId;
  let tree;
  let labels;
  let nodes;
  setup(() => {
    tree = {
      a: {
        aa: {},
        ab: {}
      },
      b: {
        ba: {},
        bb: {}
      }
    };
    labels = {};
    nodes = {};
    const rpcProtocol = new TestRPCProtocol();
    rpcProtocol.set(
      MainContext.MainThreadCommands,
      new class extends mock() {
        $registerCommand() {
        }
      }()
    );
    target = new RecordingShape();
    testObject = store.add(
      new ExtHostTreeViews(
        target,
        new ExtHostCommands(
          rpcProtocol,
          new NullLogService(),
          new class extends mock() {
            onExtensionError() {
              return true;
            }
          }()
        ),
        new NullLogService()
      )
    );
    onDidChangeTreeNode = new Emitter();
    onDidChangeTreeNodeWithId = new Emitter();
    testObject.createTreeView(
      "testNodeTreeProvider",
      { treeDataProvider: aNodeTreeDataProvider() },
      extensionsDescription
    );
    testObject.createTreeView(
      "testNodeWithIdTreeProvider",
      { treeDataProvider: aNodeWithIdTreeDataProvider() },
      extensionsDescription
    );
    testObject.createTreeView(
      "testNodeWithHighlightsTreeProvider",
      { treeDataProvider: aNodeWithHighlightedLabelTreeDataProvider() },
      extensionsDescription
    );
    return loadCompleteTree("testNodeTreeProvider");
  });
  test("construct node tree", () => {
    return testObject.$getChildren("testNodeTreeProvider").then((elements) => {
      const actuals = elements?.map((e) => e.handle);
      assert.deepStrictEqual(actuals, ["0/0:a", "0/0:b"]);
      return Promise.all([
        testObject.$getChildren("testNodeTreeProvider", "0/0:a").then((children) => {
          const actuals2 = children?.map((e) => e.handle);
          assert.deepStrictEqual(actuals2, [
            "0/0:a/0:aa",
            "0/0:a/0:ab"
          ]);
          return Promise.all([
            testObject.$getChildren(
              "testNodeTreeProvider",
              "0/0:a/0:aa"
            ).then(
              (children2) => assert.strictEqual(children2?.length, 0)
            ),
            testObject.$getChildren(
              "testNodeTreeProvider",
              "0/0:a/0:ab"
            ).then(
              (children2) => assert.strictEqual(children2?.length, 0)
            )
          ]);
        }),
        testObject.$getChildren("testNodeTreeProvider", "0/0:b").then((children) => {
          const actuals2 = children?.map((e) => e.handle);
          assert.deepStrictEqual(actuals2, [
            "0/0:b/0:ba",
            "0/0:b/0:bb"
          ]);
          return Promise.all([
            testObject.$getChildren(
              "testNodeTreeProvider",
              "0/0:b/0:ba"
            ).then(
              (children2) => assert.strictEqual(children2?.length, 0)
            ),
            testObject.$getChildren(
              "testNodeTreeProvider",
              "0/0:b/0:bb"
            ).then(
              (children2) => assert.strictEqual(children2?.length, 0)
            )
          ]);
        })
      ]);
    });
  });
  test("construct id tree", () => {
    return testObject.$getChildren("testNodeWithIdTreeProvider").then((elements) => {
      const actuals = elements?.map((e) => e.handle);
      assert.deepStrictEqual(actuals, ["1/a", "1/b"]);
      return Promise.all([
        testObject.$getChildren("testNodeWithIdTreeProvider", "1/a").then((children) => {
          const actuals2 = children?.map((e) => e.handle);
          assert.deepStrictEqual(actuals2, ["1/aa", "1/ab"]);
          return Promise.all([
            testObject.$getChildren(
              "testNodeWithIdTreeProvider",
              "1/aa"
            ).then(
              (children2) => assert.strictEqual(children2?.length, 0)
            ),
            testObject.$getChildren(
              "testNodeWithIdTreeProvider",
              "1/ab"
            ).then(
              (children2) => assert.strictEqual(children2?.length, 0)
            )
          ]);
        }),
        testObject.$getChildren("testNodeWithIdTreeProvider", "1/b").then((children) => {
          const actuals2 = children?.map((e) => e.handle);
          assert.deepStrictEqual(actuals2, ["1/ba", "1/bb"]);
          return Promise.all([
            testObject.$getChildren(
              "testNodeWithIdTreeProvider",
              "1/ba"
            ).then(
              (children2) => assert.strictEqual(children2?.length, 0)
            ),
            testObject.$getChildren(
              "testNodeWithIdTreeProvider",
              "1/bb"
            ).then(
              (children2) => assert.strictEqual(children2?.length, 0)
            )
          ]);
        })
      ]);
    });
  });
  test("construct highlights tree", () => {
    return testObject.$getChildren("testNodeWithHighlightsTreeProvider").then((elements) => {
      assert.deepStrictEqual(removeUnsetKeys(elements), [
        {
          handle: "1/a",
          label: {
            label: "a",
            highlights: [
              [0, 2],
              [3, 5]
            ]
          },
          collapsibleState: TreeItemCollapsibleState.Collapsed
        },
        {
          handle: "1/b",
          label: {
            label: "b",
            highlights: [
              [0, 2],
              [3, 5]
            ]
          },
          collapsibleState: TreeItemCollapsibleState.Collapsed
        }
      ]);
      return Promise.all([
        testObject.$getChildren(
          "testNodeWithHighlightsTreeProvider",
          "1/a"
        ).then((children) => {
          assert.deepStrictEqual(removeUnsetKeys(children), [
            {
              handle: "1/aa",
              parentHandle: "1/a",
              label: {
                label: "aa",
                highlights: [
                  [0, 2],
                  [3, 5]
                ]
              },
              collapsibleState: TreeItemCollapsibleState.None
            },
            {
              handle: "1/ab",
              parentHandle: "1/a",
              label: {
                label: "ab",
                highlights: [
                  [0, 2],
                  [3, 5]
                ]
              },
              collapsibleState: TreeItemCollapsibleState.None
            }
          ]);
        }),
        testObject.$getChildren(
          "testNodeWithHighlightsTreeProvider",
          "1/b"
        ).then((children) => {
          assert.deepStrictEqual(removeUnsetKeys(children), [
            {
              handle: "1/ba",
              parentHandle: "1/b",
              label: {
                label: "ba",
                highlights: [
                  [0, 2],
                  [3, 5]
                ]
              },
              collapsibleState: TreeItemCollapsibleState.None
            },
            {
              handle: "1/bb",
              parentHandle: "1/b",
              label: {
                label: "bb",
                highlights: [
                  [0, 2],
                  [3, 5]
                ]
              },
              collapsibleState: TreeItemCollapsibleState.None
            }
          ]);
        })
      ]);
    });
  });
  test("error is thrown if id is not unique", (done) => {
    tree["a"] = {
      aa: {}
    };
    tree["b"] = {
      aa: {},
      ba: {}
    };
    let caughtExpectedError = false;
    store.add(
      target.onRefresh.event(() => {
        testObject.$getChildren("testNodeWithIdTreeProvider").then((elements) => {
          const actuals = elements?.map((e) => e.handle);
          assert.deepStrictEqual(actuals, ["1/a", "1/b"]);
          return testObject.$getChildren("testNodeWithIdTreeProvider", "1/a").then(
            () => testObject.$getChildren(
              "testNodeWithIdTreeProvider",
              "1/b"
            )
          ).then(
            () => assert.fail("Should fail with duplicate id")
          ).catch(() => caughtExpectedError = true).finally(
            () => caughtExpectedError ? done() : assert.fail(
              "Expected duplicate id error not thrown."
            )
          );
        });
      })
    );
    onDidChangeTreeNode.fire(void 0);
  });
  test("refresh root", (done) => {
    store.add(
      target.onRefresh.event((actuals) => {
        assert.strictEqual(void 0, actuals);
        done();
      })
    );
    onDidChangeTreeNode.fire(void 0);
  });
  test("refresh a parent node", () => {
    return new Promise((c, e) => {
      store.add(
        target.onRefresh.event((actuals) => {
          assert.deepStrictEqual(["0/0:b"], Object.keys(actuals));
          assert.deepStrictEqual(removeUnsetKeys(actuals["0/0:b"]), {
            handle: "0/0:b",
            label: { label: "b" },
            collapsibleState: TreeItemCollapsibleState.Collapsed
          });
          c(void 0);
        })
      );
      onDidChangeTreeNode.fire(getNode("b"));
    });
  });
  test("refresh a leaf node", (done) => {
    store.add(
      target.onRefresh.event((actuals) => {
        assert.deepStrictEqual(["0/0:b/0:bb"], Object.keys(actuals));
        assert.deepStrictEqual(removeUnsetKeys(actuals["0/0:b/0:bb"]), {
          handle: "0/0:b/0:bb",
          parentHandle: "0/0:b",
          label: { label: "bb" },
          collapsibleState: TreeItemCollapsibleState.None
        });
        done();
      })
    );
    onDidChangeTreeNode.fire(getNode("bb"));
  });
  async function runWithEventMerging(action) {
    await runWithFakedTimers({}, async () => {
      await new Promise((resolve) => {
        let subscription;
        subscription = target.onRefresh.event(() => {
          subscription.dispose();
          resolve();
        });
        onDidChangeTreeNode.fire(getNode("b"));
      });
      await new Promise(action);
    });
  }
  test("refresh parent and child node trigger refresh only on parent - scenario 1", async () => {
    return runWithEventMerging((resolve) => {
      store.add(
        target.onRefresh.event((actuals) => {
          assert.deepStrictEqual(
            ["0/0:b", "0/0:a/0:aa"],
            Object.keys(actuals)
          );
          assert.deepStrictEqual(removeUnsetKeys(actuals["0/0:b"]), {
            handle: "0/0:b",
            label: { label: "b" },
            collapsibleState: TreeItemCollapsibleState.Collapsed
          });
          assert.deepStrictEqual(
            removeUnsetKeys(actuals["0/0:a/0:aa"]),
            {
              handle: "0/0:a/0:aa",
              parentHandle: "0/0:a",
              label: { label: "aa" },
              collapsibleState: TreeItemCollapsibleState.None
            }
          );
          resolve();
        })
      );
      onDidChangeTreeNode.fire(getNode("b"));
      onDidChangeTreeNode.fire(getNode("aa"));
      onDidChangeTreeNode.fire(getNode("bb"));
    });
  });
  test("refresh parent and child node trigger refresh only on parent - scenario 2", async () => {
    return runWithEventMerging((resolve) => {
      store.add(
        target.onRefresh.event((actuals) => {
          assert.deepStrictEqual(
            ["0/0:a/0:aa", "0/0:b"],
            Object.keys(actuals)
          );
          assert.deepStrictEqual(removeUnsetKeys(actuals["0/0:b"]), {
            handle: "0/0:b",
            label: { label: "b" },
            collapsibleState: TreeItemCollapsibleState.Collapsed
          });
          assert.deepStrictEqual(
            removeUnsetKeys(actuals["0/0:a/0:aa"]),
            {
              handle: "0/0:a/0:aa",
              parentHandle: "0/0:a",
              label: { label: "aa" },
              collapsibleState: TreeItemCollapsibleState.None
            }
          );
          resolve();
        })
      );
      onDidChangeTreeNode.fire(getNode("bb"));
      onDidChangeTreeNode.fire(getNode("aa"));
      onDidChangeTreeNode.fire(getNode("b"));
    });
  });
  test("refresh an element for label change", (done) => {
    labels["a"] = "aa";
    store.add(
      target.onRefresh.event((actuals) => {
        assert.deepStrictEqual(["0/0:a"], Object.keys(actuals));
        assert.deepStrictEqual(removeUnsetKeys(actuals["0/0:a"]), {
          handle: "0/0:aa",
          label: { label: "aa" },
          collapsibleState: TreeItemCollapsibleState.Collapsed
        });
        done();
      })
    );
    onDidChangeTreeNode.fire(getNode("a"));
  });
  test("refresh calls are throttled on roots", () => {
    return runWithEventMerging((resolve) => {
      store.add(
        target.onRefresh.event((actuals) => {
          assert.strictEqual(void 0, actuals);
          resolve();
        })
      );
      onDidChangeTreeNode.fire(void 0);
      onDidChangeTreeNode.fire(void 0);
      onDidChangeTreeNode.fire(void 0);
      onDidChangeTreeNode.fire(void 0);
    });
  });
  test("refresh calls are throttled on elements", () => {
    return runWithEventMerging((resolve) => {
      store.add(
        target.onRefresh.event((actuals) => {
          assert.deepStrictEqual(
            ["0/0:a", "0/0:b"],
            Object.keys(actuals)
          );
          resolve();
        })
      );
      onDidChangeTreeNode.fire(getNode("a"));
      onDidChangeTreeNode.fire(getNode("b"));
      onDidChangeTreeNode.fire(getNode("b"));
      onDidChangeTreeNode.fire(getNode("a"));
    });
  });
  test("refresh calls are throttled on unknown elements", () => {
    return runWithEventMerging((resolve) => {
      store.add(
        target.onRefresh.event((actuals) => {
          assert.deepStrictEqual(
            ["0/0:a", "0/0:b"],
            Object.keys(actuals)
          );
          resolve();
        })
      );
      onDidChangeTreeNode.fire(getNode("a"));
      onDidChangeTreeNode.fire(getNode("b"));
      onDidChangeTreeNode.fire(getNode("g"));
      onDidChangeTreeNode.fire(getNode("a"));
    });
  });
  test("refresh calls are throttled on unknown elements and root", () => {
    return runWithEventMerging((resolve) => {
      store.add(
        target.onRefresh.event((actuals) => {
          assert.strictEqual(void 0, actuals);
          resolve();
        })
      );
      onDidChangeTreeNode.fire(getNode("a"));
      onDidChangeTreeNode.fire(getNode("b"));
      onDidChangeTreeNode.fire(getNode("g"));
      onDidChangeTreeNode.fire(void 0);
    });
  });
  test("refresh calls are throttled on elements and root", () => {
    return runWithEventMerging((resolve) => {
      store.add(
        target.onRefresh.event((actuals) => {
          assert.strictEqual(void 0, actuals);
          resolve();
        })
      );
      onDidChangeTreeNode.fire(getNode("a"));
      onDidChangeTreeNode.fire(getNode("b"));
      onDidChangeTreeNode.fire(void 0);
      onDidChangeTreeNode.fire(getNode("a"));
    });
  });
  test("generate unique handles from labels by escaping them", (done) => {
    tree = {
      "a/0:b": {}
    };
    store.add(
      target.onRefresh.event(() => {
        testObject.$getChildren("testNodeTreeProvider").then((elements) => {
          assert.deepStrictEqual(
            elements?.map((e) => e.handle),
            ["0/0:a//0:b"]
          );
          done();
        });
      })
    );
    onDidChangeTreeNode.fire(void 0);
  });
  test("tree with duplicate labels", (done) => {
    const dupItems = {
      adup1: "c",
      adup2: "g",
      bdup1: "e",
      hdup1: "i",
      hdup2: "l",
      jdup1: "k"
    };
    labels["c"] = "a";
    labels["e"] = "b";
    labels["g"] = "a";
    labels["i"] = "h";
    labels["l"] = "h";
    labels["k"] = "j";
    tree[dupItems["adup1"]] = {};
    tree["d"] = {};
    const bdup1Tree = {};
    bdup1Tree["h"] = {};
    bdup1Tree[dupItems["hdup1"]] = {};
    bdup1Tree["j"] = {};
    bdup1Tree[dupItems["jdup1"]] = {};
    bdup1Tree[dupItems["hdup2"]] = {};
    tree[dupItems["bdup1"]] = bdup1Tree;
    tree["f"] = {};
    tree[dupItems["adup2"]] = {};
    store.add(
      target.onRefresh.event(() => {
        testObject.$getChildren("testNodeTreeProvider").then((elements) => {
          const actuals = elements?.map((e) => e.handle);
          assert.deepStrictEqual(actuals, [
            "0/0:a",
            "0/0:b",
            "0/1:a",
            "0/0:d",
            "0/1:b",
            "0/0:f",
            "0/2:a"
          ]);
          return testObject.$getChildren("testNodeTreeProvider", "0/1:b").then((elements2) => {
            const actuals2 = elements2?.map((e) => e.handle);
            assert.deepStrictEqual(actuals2, [
              "0/1:b/0:h",
              "0/1:b/1:h",
              "0/1:b/0:j",
              "0/1:b/1:j",
              "0/1:b/2:h"
            ]);
            done();
          });
        });
      })
    );
    onDidChangeTreeNode.fire(void 0);
  });
  test("getChildren is not returned from cache if refreshed", (done) => {
    tree = {
      c: {}
    };
    store.add(
      target.onRefresh.event(() => {
        testObject.$getChildren("testNodeTreeProvider").then((elements) => {
          assert.deepStrictEqual(
            elements?.map((e) => e.handle),
            ["0/0:c"]
          );
          done();
        });
      })
    );
    onDidChangeTreeNode.fire(void 0);
  });
  test("getChildren is returned from cache if not refreshed", () => {
    tree = {
      c: {}
    };
    return testObject.$getChildren("testNodeTreeProvider").then((elements) => {
      assert.deepStrictEqual(
        elements?.map((e) => e.handle),
        ["0/0:a", "0/0:b"]
      );
    });
  });
  test("reveal will throw an error if getParent is not implemented", () => {
    const treeView = testObject.createTreeView(
      "treeDataProvider",
      { treeDataProvider: aNodeTreeDataProvider() },
      extensionsDescription
    );
    return treeView.reveal({ key: "a" }).then(
      () => assert.fail(
        "Reveal should throw an error as getParent is not implemented"
      ),
      () => null
    );
  });
  test("reveal will return empty array for root element", () => {
    const revealTarget = sinon.spy(target, "$reveal");
    const treeView = testObject.createTreeView(
      "treeDataProvider",
      { treeDataProvider: aCompleteNodeTreeDataProvider() },
      extensionsDescription
    );
    const expected = {
      item: {
        handle: "0/0:a",
        label: { label: "a" },
        collapsibleState: TreeItemCollapsibleState.Collapsed
      },
      parentChain: []
    };
    return treeView.reveal({ key: "a" }).then(() => {
      assert.ok(revealTarget.calledOnce);
      assert.deepStrictEqual("treeDataProvider", revealTarget.args[0][0]);
      assert.deepStrictEqual(
        expected,
        removeUnsetKeys(revealTarget.args[0][1])
      );
      assert.deepStrictEqual(
        { select: true, focus: false, expand: false },
        revealTarget.args[0][2]
      );
    });
  });
  test("reveal will return parents array for an element when hierarchy is not loaded", () => {
    const revealTarget = sinon.spy(target, "$reveal");
    const treeView = testObject.createTreeView(
      "treeDataProvider",
      { treeDataProvider: aCompleteNodeTreeDataProvider() },
      extensionsDescription
    );
    const expected = {
      item: {
        handle: "0/0:a/0:aa",
        label: { label: "aa" },
        collapsibleState: TreeItemCollapsibleState.None,
        parentHandle: "0/0:a"
      },
      parentChain: [
        {
          handle: "0/0:a",
          label: { label: "a" },
          collapsibleState: TreeItemCollapsibleState.Collapsed
        }
      ]
    };
    return treeView.reveal({ key: "aa" }).then(() => {
      assert.ok(revealTarget.calledOnce);
      assert.deepStrictEqual("treeDataProvider", revealTarget.args[0][0]);
      assert.deepStrictEqual(
        expected.item,
        removeUnsetKeys(revealTarget.args[0][1].item)
      );
      assert.deepStrictEqual(
        expected.parentChain,
        revealTarget.args[0][1].parentChain.map(
          (arg) => removeUnsetKeys(arg)
        )
      );
      assert.deepStrictEqual(
        { select: true, focus: false, expand: false },
        revealTarget.args[0][2]
      );
    });
  });
  test("reveal will return parents array for an element when hierarchy is loaded", () => {
    const revealTarget = sinon.spy(target, "$reveal");
    const treeView = testObject.createTreeView(
      "treeDataProvider",
      { treeDataProvider: aCompleteNodeTreeDataProvider() },
      extensionsDescription
    );
    const expected = {
      item: {
        handle: "0/0:a/0:aa",
        label: { label: "aa" },
        collapsibleState: TreeItemCollapsibleState.None,
        parentHandle: "0/0:a"
      },
      parentChain: [
        {
          handle: "0/0:a",
          label: { label: "a" },
          collapsibleState: TreeItemCollapsibleState.Collapsed
        }
      ]
    };
    return testObject.$getChildren("treeDataProvider").then(() => testObject.$getChildren("treeDataProvider", "0/0:a")).then(
      () => treeView.reveal({ key: "aa" }).then(() => {
        assert.ok(revealTarget.calledOnce);
        assert.deepStrictEqual(
          "treeDataProvider",
          revealTarget.args[0][0]
        );
        assert.deepStrictEqual(
          expected.item,
          removeUnsetKeys(revealTarget.args[0][1].item)
        );
        assert.deepStrictEqual(
          expected.parentChain,
          revealTarget.args[0][1].parentChain.map(
            (arg) => removeUnsetKeys(arg)
          )
        );
        assert.deepStrictEqual(
          { select: true, focus: false, expand: false },
          revealTarget.args[0][2]
        );
      })
    );
  });
  test("reveal will return parents array for deeper element with no selection", () => {
    tree = {
      b: {
        ba: {
          bac: {}
        }
      }
    };
    const revealTarget = sinon.spy(target, "$reveal");
    const treeView = testObject.createTreeView(
      "treeDataProvider",
      { treeDataProvider: aCompleteNodeTreeDataProvider() },
      extensionsDescription
    );
    const expected = {
      item: {
        handle: "0/0:b/0:ba/0:bac",
        label: { label: "bac" },
        collapsibleState: TreeItemCollapsibleState.None,
        parentHandle: "0/0:b/0:ba"
      },
      parentChain: [
        {
          handle: "0/0:b",
          label: { label: "b" },
          collapsibleState: TreeItemCollapsibleState.Collapsed
        },
        {
          handle: "0/0:b/0:ba",
          label: { label: "ba" },
          collapsibleState: TreeItemCollapsibleState.Collapsed,
          parentHandle: "0/0:b"
        }
      ]
    };
    return treeView.reveal(
      { key: "bac" },
      { select: false, focus: false, expand: false }
    ).then(() => {
      assert.ok(revealTarget.calledOnce);
      assert.deepStrictEqual(
        "treeDataProvider",
        revealTarget.args[0][0]
      );
      assert.deepStrictEqual(
        expected.item,
        removeUnsetKeys(revealTarget.args[0][1].item)
      );
      assert.deepStrictEqual(
        expected.parentChain,
        revealTarget.args[0][1].parentChain.map(
          (arg) => removeUnsetKeys(arg)
        )
      );
      assert.deepStrictEqual(
        { select: false, focus: false, expand: false },
        revealTarget.args[0][2]
      );
    });
  });
  test("reveal after first udpate", () => {
    const revealTarget = sinon.spy(target, "$reveal");
    const treeView = testObject.createTreeView(
      "treeDataProvider",
      { treeDataProvider: aCompleteNodeTreeDataProvider() },
      extensionsDescription
    );
    const expected = {
      item: {
        handle: "0/0:a/0:ac",
        label: { label: "ac" },
        collapsibleState: TreeItemCollapsibleState.None,
        parentHandle: "0/0:a"
      },
      parentChain: [
        {
          handle: "0/0:a",
          label: { label: "a" },
          collapsibleState: TreeItemCollapsibleState.Collapsed
        }
      ]
    };
    return loadCompleteTree("treeDataProvider").then(() => {
      tree = {
        a: {
          aa: {},
          ac: {}
        },
        b: {
          ba: {},
          bb: {}
        }
      };
      onDidChangeTreeNode.fire(getNode("a"));
      return treeView.reveal({ key: "ac" }).then(() => {
        assert.ok(revealTarget.calledOnce);
        assert.deepStrictEqual(
          "treeDataProvider",
          revealTarget.args[0][0]
        );
        assert.deepStrictEqual(
          expected.item,
          removeUnsetKeys(revealTarget.args[0][1].item)
        );
        assert.deepStrictEqual(
          expected.parentChain,
          revealTarget.args[0][1].parentChain.map(
            (arg) => removeUnsetKeys(arg)
          )
        );
        assert.deepStrictEqual(
          { select: true, focus: false, expand: false },
          revealTarget.args[0][2]
        );
      });
    });
  });
  test("reveal after second udpate", () => {
    const revealTarget = sinon.spy(target, "$reveal");
    const treeView = testObject.createTreeView(
      "treeDataProvider",
      { treeDataProvider: aCompleteNodeTreeDataProvider() },
      extensionsDescription
    );
    return loadCompleteTree("treeDataProvider").then(() => {
      return runWithEventMerging((resolve) => {
        tree = {
          a: {
            aa: {},
            ac: {}
          },
          b: {
            ba: {},
            bb: {}
          }
        };
        onDidChangeTreeNode.fire(getNode("a"));
        tree = {
          a: {
            aa: {},
            ac: {}
          },
          b: {
            ba: {},
            bc: {}
          }
        };
        onDidChangeTreeNode.fire(getNode("b"));
        resolve();
      }).then(() => {
        return treeView.reveal({ key: "bc" }).then(() => {
          assert.ok(revealTarget.calledOnce);
          assert.deepStrictEqual(
            "treeDataProvider",
            revealTarget.args[0][0]
          );
          assert.deepStrictEqual(
            {
              handle: "0/0:b/0:bc",
              label: { label: "bc" },
              collapsibleState: TreeItemCollapsibleState.None,
              parentHandle: "0/0:b"
            },
            removeUnsetKeys(revealTarget.args[0][1].item)
          );
          assert.deepStrictEqual(
            [
              {
                handle: "0/0:b",
                label: { label: "b" },
                collapsibleState: TreeItemCollapsibleState.Collapsed
              }
            ],
            revealTarget.args[0][1].parentChain.map(
              (arg) => removeUnsetKeys(arg)
            )
          );
          assert.deepStrictEqual(
            { select: true, focus: false, expand: false },
            revealTarget.args[0][2]
          );
        });
      });
    });
  });
  function loadCompleteTree(treeId, element) {
    return testObject.$getChildren(treeId, element).then(
      (elements) => elements?.map((e) => loadCompleteTree(treeId, e.handle))
    ).then(() => null);
  }
  function removeUnsetKeys(obj) {
    if (Array.isArray(obj)) {
      return obj.map((o) => removeUnsetKeys(o));
    }
    if (typeof obj === "object") {
      const result = {};
      for (const key of Object.keys(obj)) {
        if (obj[key] !== void 0) {
          result[key] = removeUnsetKeys(obj[key]);
        }
      }
      return result;
    }
    return obj;
  }
  function aNodeTreeDataProvider() {
    return {
      getChildren: (element) => {
        return getChildren(element ? element.key : void 0).map(
          (key) => getNode(key)
        );
      },
      getTreeItem: (element) => {
        return getTreeItem(element.key);
      },
      onDidChangeTreeData: onDidChangeTreeNode.event
    };
  }
  function aCompleteNodeTreeDataProvider() {
    return {
      getChildren: (element) => {
        return getChildren(element ? element.key : void 0).map(
          (key) => getNode(key)
        );
      },
      getTreeItem: (element) => {
        return getTreeItem(element.key);
      },
      getParent: ({
        key
      }) => {
        const parentKey = key.substring(0, key.length - 1);
        return parentKey ? new Key(parentKey) : void 0;
      },
      onDidChangeTreeData: onDidChangeTreeNode.event
    };
  }
  function aNodeWithIdTreeDataProvider() {
    return {
      getChildren: (element) => {
        return getChildren(element ? element.key : void 0).map(
          (key) => getNode(key)
        );
      },
      getTreeItem: (element) => {
        const treeItem = getTreeItem(element.key);
        treeItem.id = element.key;
        return treeItem;
      },
      onDidChangeTreeData: onDidChangeTreeNodeWithId.event
    };
  }
  function aNodeWithHighlightedLabelTreeDataProvider() {
    return {
      getChildren: (element) => {
        return getChildren(element ? element.key : void 0).map(
          (key) => getNode(key)
        );
      },
      getTreeItem: (element) => {
        const treeItem = getTreeItem(element.key, [
          [0, 2],
          [3, 5]
        ]);
        treeItem.id = element.key;
        return treeItem;
      },
      onDidChangeTreeData: onDidChangeTreeNodeWithId.event
    };
  }
  function getTreeElement(element) {
    let parent = tree;
    for (let i = 0; i < element.length; i++) {
      parent = parent[element.substring(0, i + 1)];
      if (!parent) {
        return null;
      }
    }
    return parent;
  }
  function getChildren(key) {
    if (!key) {
      return Object.keys(tree);
    }
    const treeElement = getTreeElement(key);
    if (treeElement) {
      return Object.keys(treeElement);
    }
    return [];
  }
  function getTreeItem(key, highlights) {
    const treeElement = getTreeElement(key);
    return {
      label: { label: labels[key] || key, highlights },
      collapsibleState: treeElement && Object.keys(treeElement).length ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None
    };
  }
  function getNode(key) {
    if (!nodes[key]) {
      nodes[key] = new Key(key);
    }
    return nodes[key];
  }
  class Key {
    constructor(key) {
      this.key = key;
    }
  }
});
