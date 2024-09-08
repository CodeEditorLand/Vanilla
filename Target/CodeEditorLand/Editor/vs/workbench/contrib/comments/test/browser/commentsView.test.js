import assert from "assert";
import { Emitter } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { IContextViewService } from "../../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { NullHoverService } from "../../../../../platform/hover/test/browser/nullHoverService.js";
import {
  IViewDescriptorService,
  ViewContainerLocation
} from "../../../../common/views.js";
import { workbenchInstantiationService } from "../../../../test/browser/workbenchTestServices.js";
import {
  CommentService,
  ICommentService
} from "../../browser/commentService.js";
import { CommentsPanel } from "../../browser/commentsView.js";
class TestCommentThread {
  constructor(commentThreadHandle, controllerHandle, threadId, resource, range, comments) {
    this.commentThreadHandle = commentThreadHandle;
    this.controllerHandle = controllerHandle;
    this.threadId = threadId;
    this.resource = resource;
    this.range = range;
    this.comments = comments;
  }
  isDocumentCommentThread() {
    return true;
  }
  onDidChangeComments = new Emitter().event;
  onDidChangeInitialCollapsibleState = new Emitter().event;
  canReply = false;
  onDidChangeInput = new Emitter().event;
  onDidChangeRange = new Emitter().event;
  onDidChangeLabel = new Emitter().event;
  onDidChangeCollapsibleState = new Emitter().event;
  onDidChangeState = new Emitter().event;
  onDidChangeCanReply = new Emitter().event;
  isDisposed = false;
  isTemplate = false;
  label = void 0;
  contextValue = void 0;
}
class TestCommentController {
  id = "test";
  label = "Test Comments";
  owner = "test";
  features = {};
  createCommentThreadTemplate(resource, range) {
    throw new Error("Method not implemented.");
  }
  updateCommentThreadTemplate(threadHandle, range) {
    throw new Error("Method not implemented.");
  }
  deleteCommentThreadMain(commentThreadId) {
    throw new Error("Method not implemented.");
  }
  toggleReaction(uri, thread, comment, reaction, token) {
    throw new Error("Method not implemented.");
  }
  getDocumentComments(resource, token) {
    throw new Error("Method not implemented.");
  }
  getNotebookComments(resource, token) {
    throw new Error("Method not implemented.");
  }
  setActiveCommentAndThread(commentInfo) {
    throw new Error("Method not implemented.");
  }
}
class TestViewDescriptorService {
  getViewLocationById(id) {
    return ViewContainerLocation.Panel;
  }
  onDidChangeLocation = new Emitter().event;
  getViewDescriptorById(id) {
    return null;
  }
  getViewContainerByViewId(id) {
    return {
      id: "comments",
      title: { value: "Comments", original: "Comments" },
      ctorDescriptor: {}
    };
  }
  getViewContainerModel(viewContainer) {
    const partialViewContainerModel = {
      onDidChangeContainerInfo: new Emitter().event
    };
    return partialViewContainerModel;
  }
  getDefaultContainerById(id) {
    return null;
  }
}
suite("Comments View", () => {
  teardown(() => {
    instantiationService.dispose();
    commentService.dispose();
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  let disposables;
  let instantiationService;
  let commentService;
  setup(() => {
    disposables = new DisposableStore();
    instantiationService = workbenchInstantiationService({}, disposables);
    instantiationService.stub(
      IConfigurationService,
      new TestConfigurationService()
    );
    instantiationService.stub(IHoverService, NullHoverService);
    instantiationService.stub(IContextViewService, {});
    instantiationService.stub(
      IViewDescriptorService,
      new TestViewDescriptorService()
    );
    commentService = instantiationService.createInstance(CommentService);
    instantiationService.stub(ICommentService, commentService);
    commentService.registerCommentController(
      "test",
      new TestCommentController()
    );
  });
  test("collapse all", async () => {
    const view = instantiationService.createInstance(CommentsPanel, {
      id: "comments",
      title: "Comments"
    });
    view.render();
    commentService.setWorkspaceComments("test", [
      new TestCommentThread(1, 1, "1", "test1", new Range(1, 1, 1, 1), [
        { body: "test", uniqueIdInThread: 1, userName: "alex" }
      ]),
      new TestCommentThread(2, 1, "1", "test2", new Range(1, 1, 1, 1), [
        { body: "test", uniqueIdInThread: 1, userName: "alex" }
      ])
    ]);
    assert.strictEqual(view.getFilterStats().total, 2);
    assert.strictEqual(view.areAllCommentsExpanded(), true);
    view.collapseAll();
    assert.strictEqual(view.isSomeCommentsExpanded(), false);
    view.dispose();
  });
  test("expand all", async () => {
    const view = instantiationService.createInstance(CommentsPanel, {
      id: "comments",
      title: "Comments"
    });
    view.render();
    commentService.setWorkspaceComments("test", [
      new TestCommentThread(1, 1, "1", "test1", new Range(1, 1, 1, 1), [
        { body: "test", uniqueIdInThread: 1, userName: "alex" }
      ]),
      new TestCommentThread(2, 1, "1", "test2", new Range(1, 1, 1, 1), [
        { body: "test", uniqueIdInThread: 1, userName: "alex" }
      ])
    ]);
    assert.strictEqual(view.getFilterStats().total, 2);
    view.collapseAll();
    assert.strictEqual(view.isSomeCommentsExpanded(), false);
    view.expandAll();
    assert.strictEqual(view.areAllCommentsExpanded(), true);
    view.dispose();
  });
  test("filter by text", async () => {
    const view = instantiationService.createInstance(CommentsPanel, {
      id: "comments",
      title: "Comments"
    });
    view.setVisible(true);
    view.render();
    commentService.setWorkspaceComments("test", [
      new TestCommentThread(1, 1, "1", "test1", new Range(1, 1, 1, 1), [
        {
          body: "This comment is a cat.",
          uniqueIdInThread: 1,
          userName: "alex"
        }
      ]),
      new TestCommentThread(2, 1, "1", "test2", new Range(1, 1, 1, 1), [
        {
          body: "This comment is a dog.",
          uniqueIdInThread: 1,
          userName: "alex"
        }
      ])
    ]);
    assert.strictEqual(view.getFilterStats().total, 2);
    assert.strictEqual(view.getFilterStats().filtered, 2);
    view.getFilterWidget().setFilterText("cat");
    view.filters.showResolved = false;
    assert.strictEqual(view.getFilterStats().total, 2);
    assert.strictEqual(view.getFilterStats().filtered, 1);
    view.clearFilterText();
    view.filters.showResolved = true;
    assert.strictEqual(view.getFilterStats().total, 2);
    assert.strictEqual(view.getFilterStats().filtered, 2);
    view.dispose();
  });
});
export {
  TestViewDescriptorService
};
