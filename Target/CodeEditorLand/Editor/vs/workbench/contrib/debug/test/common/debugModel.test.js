import assert from "assert";
import { DeferredPromise } from "../../../../../base/common/async.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { mockObject } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import { TestStorageService } from "../../../../test/common/workbenchTestServices.js";
import {
  DebugModel,
  ExceptionBreakpoint,
  FunctionBreakpoint
} from "../../common/debugModel.js";
import { MockDebugStorage } from "./mockDebug.js";
suite("DebugModel", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  suite("FunctionBreakpoint", () => {
    test("Id is saved", () => {
      const fbp = new FunctionBreakpoint({
        name: "function",
        enabled: true,
        hitCondition: "hit condition",
        condition: "condition",
        logMessage: "log message"
      });
      const strigified = JSON.stringify(fbp);
      const parsed = JSON.parse(strigified);
      assert.equal(parsed.id, fbp.getId());
    });
  });
  suite("ExceptionBreakpoint", () => {
    test("Restored matches new", () => {
      const ebp = new ExceptionBreakpoint(
        {
          conditionDescription: "condition description",
          description: "description",
          filter: "condition",
          label: "label",
          supportsCondition: true,
          enabled: true
        },
        "id"
      );
      const strigified = JSON.stringify(ebp);
      const parsed = JSON.parse(strigified);
      const newEbp = new ExceptionBreakpoint(parsed);
      assert.ok(ebp.matches(newEbp));
    });
  });
  suite("DebugModel", () => {
    test("refreshTopOfCallstack resolves all returned promises when called multiple times", async () => {
      const topFrameDeferred = new DeferredPromise();
      const wholeStackDeferred = new DeferredPromise();
      const fakeThread = mockObject()({
        session: {
          capabilities: { supportsDelayedStackTraceLoading: true }
        },
        getCallStack: () => [],
        getStaleCallStack: () => []
      });
      fakeThread.fetchCallStack.callsFake((levels) => {
        return levels === 1 ? topFrameDeferred.p : wholeStackDeferred.p;
      });
      fakeThread.getId.returns(1);
      const disposable = new DisposableStore();
      const storage = disposable.add(new TestStorageService());
      const model = new DebugModel(
        disposable.add(new MockDebugStorage(storage)),
        { isDirty: (e) => false },
        void 0,
        new NullLogService()
      );
      disposable.add(model);
      let top1Resolved = false;
      let whole1Resolved = false;
      let top2Resolved = false;
      let whole2Resolved = false;
      const result1 = model.refreshTopOfCallstack(fakeThread);
      result1.topCallStack.then(() => top1Resolved = true);
      result1.wholeCallStack.then(() => whole1Resolved = true);
      const result2 = model.refreshTopOfCallstack(fakeThread);
      result2.topCallStack.then(() => top2Resolved = true);
      result2.wholeCallStack.then(() => whole2Resolved = true);
      assert.ok(!top1Resolved);
      assert.ok(!whole1Resolved);
      assert.ok(!top2Resolved);
      assert.ok(!whole2Resolved);
      await topFrameDeferred.complete();
      await result1.topCallStack;
      await result2.topCallStack;
      assert.ok(!whole1Resolved);
      assert.ok(!whole2Resolved);
      await wholeStackDeferred.complete();
      await result1.wholeCallStack;
      await result2.wholeCallStack;
      disposable.dispose();
    });
  });
});
