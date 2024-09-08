import assert from "assert";
import { $, append, hide } from "../../../base/browser/dom.js";
import { mainWindow } from "../../../base/browser/window.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { isEmptyObject } from "../../../base/common/types.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../base/test/common/utils.js";
import {
  StorageScope,
  StorageTarget
} from "../../../platform/storage/common/storage.js";
import { TestThemeService } from "../../../platform/theme/test/common/testThemeService.js";
import { Part } from "../../browser/part.js";
import { TestStorageService } from "../common/workbenchTestServices.js";
import { TestLayoutService } from "./workbenchTestServices.js";
suite("Workbench parts", () => {
  const disposables = new DisposableStore();
  class SimplePart extends Part {
    minimumWidth = 50;
    maximumWidth = 50;
    minimumHeight = 50;
    maximumHeight = 50;
    layout(width, height) {
      throw new Error("Method not implemented.");
    }
    toJSON() {
      throw new Error("Method not implemented.");
    }
  }
  class MyPart extends SimplePart {
    constructor(expectedParent) {
      super(
        "myPart",
        { hasTitle: true },
        new TestThemeService(),
        disposables.add(new TestStorageService()),
        new TestLayoutService()
      );
      this.expectedParent = expectedParent;
    }
    createTitleArea(parent) {
      assert.strictEqual(parent, this.expectedParent);
      return super.createTitleArea(parent);
    }
    createContentArea(parent) {
      assert.strictEqual(parent, this.expectedParent);
      return super.createContentArea(parent);
    }
    testGetMemento(scope, target) {
      return super.getMemento(scope, target);
    }
    testSaveState() {
      return super.saveState();
    }
  }
  class MyPart2 extends SimplePart {
    constructor() {
      super(
        "myPart2",
        { hasTitle: true },
        new TestThemeService(),
        disposables.add(new TestStorageService()),
        new TestLayoutService()
      );
    }
    createTitleArea(parent) {
      const titleContainer = append(parent, $("div"));
      const titleLabel = append(titleContainer, $("span"));
      titleLabel.id = "myPart.title";
      titleLabel.innerText = "Title";
      return titleContainer;
    }
    createContentArea(parent) {
      const contentContainer = append(parent, $("div"));
      const contentSpan = append(contentContainer, $("span"));
      contentSpan.id = "myPart.content";
      contentSpan.innerText = "Content";
      return contentContainer;
    }
  }
  class MyPart3 extends SimplePart {
    constructor() {
      super(
        "myPart2",
        { hasTitle: false },
        new TestThemeService(),
        disposables.add(new TestStorageService()),
        new TestLayoutService()
      );
    }
    createTitleArea(parent) {
      return null;
    }
    createContentArea(parent) {
      const contentContainer = append(parent, $("div"));
      const contentSpan = append(contentContainer, $("span"));
      contentSpan.id = "myPart.content";
      contentSpan.innerText = "Content";
      return contentContainer;
    }
  }
  let fixture;
  const fixtureId = "workbench-part-fixture";
  setup(() => {
    fixture = document.createElement("div");
    fixture.id = fixtureId;
    mainWindow.document.body.appendChild(fixture);
  });
  teardown(() => {
    fixture.remove();
    disposables.clear();
  });
  test("Creation", () => {
    const b = document.createElement("div");
    mainWindow.document.getElementById(fixtureId).appendChild(b);
    hide(b);
    let part = disposables.add(new MyPart(b));
    part.create(b);
    assert.strictEqual(part.getId(), "myPart");
    let memento = part.testGetMemento(
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    assert(memento);
    memento.foo = "bar";
    memento.bar = [1, 2, 3];
    part.testSaveState();
    part = disposables.add(new MyPart(b));
    memento = part.testGetMemento(
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    assert(memento);
    assert.strictEqual(memento.foo, "bar");
    assert.strictEqual(memento.bar.length, 3);
    delete memento.foo;
    delete memento.bar;
    part.testSaveState();
    part = disposables.add(new MyPart(b));
    memento = part.testGetMemento(
      StorageScope.PROFILE,
      StorageTarget.MACHINE
    );
    assert(memento);
    assert.strictEqual(isEmptyObject(memento), true);
  });
  test("Part Layout with Title and Content", () => {
    const b = document.createElement("div");
    mainWindow.document.getElementById(fixtureId).appendChild(b);
    hide(b);
    const part = disposables.add(new MyPart2());
    part.create(b);
    assert(mainWindow.document.getElementById("myPart.title"));
    assert(mainWindow.document.getElementById("myPart.content"));
  });
  test("Part Layout with Content only", () => {
    const b = document.createElement("div");
    mainWindow.document.getElementById(fixtureId).appendChild(b);
    hide(b);
    const part = disposables.add(new MyPart3());
    part.create(b);
    assert(!mainWindow.document.getElementById("myPart.title"));
    assert(mainWindow.document.getElementById("myPart.content"));
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
