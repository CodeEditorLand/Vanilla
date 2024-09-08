import assert from "assert";
import * as sinon from "sinon";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { Constants } from "../../../../../base/common/uint.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { TestAccessibilityService } from "../../../../../platform/accessibility/test/common/testAccessibilityService.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import { createDecorationsForStackFrame } from "../../browser/callStackEditorContribution.js";
import {
  getContext,
  getContextForContributedActions,
  getSpecificSourceName
} from "../../browser/callStackView.js";
import {
  debugStackframe,
  debugStackframeFocused
} from "../../browser/debugIcons.js";
import { getStackFrameThreadAndSessionToFocus } from "../../browser/debugService.js";
import { DebugSession } from "../../browser/debugSession.js";
import {
  State
} from "../../common/debug.js";
import {
  StackFrame,
  Thread
} from "../../common/debugModel.js";
import { Source } from "../../common/debugSource.js";
import { MockRawSession } from "../common/mockDebug.js";
import {
  createMockDebugModel,
  mockUriIdentityService
} from "./mockDebugModel.js";
const mockWorkspaceContextService = {
  getWorkspace: () => {
    return {
      folders: []
    };
  }
};
function createTestSession(model, name = "mockSession", options) {
  return new DebugSession(
    generateUuid(),
    {
      resolved: { name, type: "node", request: "launch" },
      unresolved: void 0
    },
    void 0,
    model,
    options,
    {
      getViewModel() {
        return {
          updateViews() {
          }
        };
      }
    },
    void 0,
    void 0,
    new TestConfigurationService({
      debug: { console: { collapseIdenticalLines: true } }
    }),
    void 0,
    mockWorkspaceContextService,
    void 0,
    void 0,
    void 0,
    mockUriIdentityService,
    new TestInstantiationService(),
    void 0,
    void 0,
    new NullLogService(),
    void 0,
    void 0,
    new TestAccessibilityService()
  );
}
function createTwoStackFrames(session) {
  const thread = new class extends Thread {
    getCallStack() {
      return [firstStackFrame, secondStackFrame];
    }
  }(session, "mockthread", 1);
  const firstSource = new Source(
    {
      name: "internalModule.js",
      path: "a/b/c/d/internalModule.js",
      sourceReference: 10
    },
    "aDebugSessionId",
    mockUriIdentityService,
    new NullLogService()
  );
  const secondSource = new Source(
    {
      name: "internalModule.js",
      path: "z/x/c/d/internalModule.js",
      sourceReference: 11
    },
    "aDebugSessionId",
    mockUriIdentityService,
    new NullLogService()
  );
  const firstStackFrame = new StackFrame(
    thread,
    0,
    firstSource,
    "app.js",
    "normal",
    { startLineNumber: 1, startColumn: 2, endLineNumber: 1, endColumn: 10 },
    0,
    true
  );
  const secondStackFrame = new StackFrame(
    thread,
    1,
    secondSource,
    "app2.js",
    "normal",
    { startLineNumber: 1, startColumn: 2, endLineNumber: 1, endColumn: 10 },
    1,
    true
  );
  return { firstStackFrame, secondStackFrame };
}
suite("Debug - CallStack", () => {
  let model;
  let mockRawSession;
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    model = createMockDebugModel(disposables);
    mockRawSession = new MockRawSession();
  });
  teardown(() => {
    sinon.restore();
  });
  test("threads simple", () => {
    const threadId = 1;
    const threadName = "firstThread";
    const session = createTestSession(model);
    disposables.add(session);
    model.addSession(session);
    assert.strictEqual(model.getSessions(true).length, 1);
    model.rawUpdate({
      sessionId: session.getId(),
      threads: [
        {
          id: threadId,
          name: threadName
        }
      ]
    });
    assert.strictEqual(session.getThread(threadId).name, threadName);
    model.clearThreads(session.getId(), true);
    assert.strictEqual(session.getThread(threadId), void 0);
    assert.strictEqual(model.getSessions(true).length, 1);
  });
  test("threads multiple with allThreadsStopped", async () => {
    const threadId1 = 1;
    const threadName1 = "firstThread";
    const threadId2 = 2;
    const threadName2 = "secondThread";
    const stoppedReason = "breakpoint";
    const session = createTestSession(model);
    disposables.add(session);
    model.addSession(session);
    session["raw"] = mockRawSession;
    model.rawUpdate({
      sessionId: session.getId(),
      threads: [
        {
          id: threadId1,
          name: threadName1
        }
      ]
    });
    model.rawUpdate({
      sessionId: session.getId(),
      threads: [
        {
          id: threadId1,
          name: threadName1
        },
        {
          id: threadId2,
          name: threadName2
        }
      ],
      stoppedDetails: {
        reason: stoppedReason,
        threadId: 1,
        allThreadsStopped: true
      }
    });
    const thread1 = session.getThread(threadId1);
    const thread2 = session.getThread(threadId2);
    assert.strictEqual(session.getAllThreads().length, 2);
    assert.strictEqual(thread1.name, threadName1);
    assert.strictEqual(thread1.stopped, true);
    assert.strictEqual(thread1.getCallStack().length, 0);
    assert.strictEqual(thread1.stoppedDetails.reason, stoppedReason);
    assert.strictEqual(thread2.name, threadName2);
    assert.strictEqual(thread2.stopped, true);
    assert.strictEqual(thread2.getCallStack().length, 0);
    assert.strictEqual(thread2.stoppedDetails.reason, void 0);
    await thread1.fetchCallStack();
    assert.notStrictEqual(thread1.getCallStack().length, 0);
    await thread2.fetchCallStack();
    assert.notStrictEqual(thread2.getCallStack().length, 0);
    await thread1.fetchCallStack();
    await thread2.fetchCallStack();
    thread1.clearCallStack();
    assert.strictEqual(thread1.stopped, true);
    assert.strictEqual(thread1.getCallStack().length, 0);
    thread2.clearCallStack();
    assert.strictEqual(thread2.stopped, true);
    assert.strictEqual(thread2.getCallStack().length, 0);
    model.clearThreads(session.getId(), true);
    assert.strictEqual(session.getThread(threadId1), void 0);
    assert.strictEqual(session.getThread(threadId2), void 0);
    assert.strictEqual(session.getAllThreads().length, 0);
  });
  test("allThreadsStopped in multiple events", async () => {
    const threadId1 = 1;
    const threadName1 = "firstThread";
    const threadId2 = 2;
    const threadName2 = "secondThread";
    const stoppedReason = "breakpoint";
    const session = createTestSession(model);
    disposables.add(session);
    model.addSession(session);
    session["raw"] = mockRawSession;
    model.rawUpdate({
      sessionId: session.getId(),
      threads: [
        {
          id: threadId1,
          name: threadName1
        },
        {
          id: threadId2,
          name: threadName2
        }
      ],
      stoppedDetails: {
        reason: stoppedReason,
        threadId: threadId1,
        allThreadsStopped: true
      }
    });
    model.rawUpdate({
      sessionId: session.getId(),
      threads: [
        {
          id: threadId1,
          name: threadName1
        },
        {
          id: threadId2,
          name: threadName2
        }
      ],
      stoppedDetails: {
        reason: stoppedReason,
        threadId: threadId2,
        allThreadsStopped: true
      }
    });
    const thread1 = session.getThread(threadId1);
    const thread2 = session.getThread(threadId2);
    assert.strictEqual(thread1.stoppedDetails?.reason, stoppedReason);
    assert.strictEqual(thread2.stoppedDetails?.reason, stoppedReason);
  });
  test("threads multiple without allThreadsStopped", async () => {
    const sessionStub = sinon.spy(mockRawSession, "stackTrace");
    const stoppedThreadId = 1;
    const stoppedThreadName = "stoppedThread";
    const runningThreadId = 2;
    const runningThreadName = "runningThread";
    const stoppedReason = "breakpoint";
    const session = createTestSession(model);
    disposables.add(session);
    model.addSession(session);
    session["raw"] = mockRawSession;
    model.rawUpdate({
      sessionId: session.getId(),
      threads: [
        {
          id: stoppedThreadId,
          name: stoppedThreadName
        }
      ]
    });
    model.rawUpdate({
      sessionId: session.getId(),
      threads: [
        {
          id: 1,
          name: stoppedThreadName
        },
        {
          id: runningThreadId,
          name: runningThreadName
        }
      ],
      stoppedDetails: {
        reason: stoppedReason,
        threadId: 1,
        allThreadsStopped: false
      }
    });
    const stoppedThread = session.getThread(stoppedThreadId);
    const runningThread = session.getThread(runningThreadId);
    assert.strictEqual(stoppedThread.name, stoppedThreadName);
    assert.strictEqual(stoppedThread.stopped, true);
    assert.strictEqual(session.getAllThreads().length, 2);
    assert.strictEqual(stoppedThread.getCallStack().length, 0);
    assert.strictEqual(stoppedThread.stoppedDetails.reason, stoppedReason);
    assert.strictEqual(runningThread.name, runningThreadName);
    assert.strictEqual(runningThread.stopped, false);
    assert.strictEqual(runningThread.getCallStack().length, 0);
    assert.strictEqual(runningThread.stoppedDetails, void 0);
    await stoppedThread.fetchCallStack();
    assert.notStrictEqual(stoppedThread.getCallStack().length, 0);
    assert.strictEqual(runningThread.getCallStack().length, 0);
    assert.strictEqual(sessionStub.callCount, 1);
    await runningThread.fetchCallStack();
    assert.strictEqual(runningThread.getCallStack().length, 0);
    assert.strictEqual(sessionStub.callCount, 1);
    stoppedThread.clearCallStack();
    assert.strictEqual(stoppedThread.stopped, true);
    assert.strictEqual(stoppedThread.getCallStack().length, 0);
    model.clearThreads(session.getId(), true);
    assert.strictEqual(session.getThread(stoppedThreadId), void 0);
    assert.strictEqual(session.getThread(runningThreadId), void 0);
    assert.strictEqual(session.getAllThreads().length, 0);
  });
  test("stack frame get specific source name", () => {
    const session = createTestSession(model);
    disposables.add(session);
    model.addSession(session);
    const { firstStackFrame, secondStackFrame } = createTwoStackFrames(session);
    assert.strictEqual(
      getSpecificSourceName(firstStackFrame),
      ".../b/c/d/internalModule.js"
    );
    assert.strictEqual(
      getSpecificSourceName(secondStackFrame),
      ".../x/c/d/internalModule.js"
    );
  });
  test("stack frame toString()", () => {
    const session = createTestSession(model);
    disposables.add(session);
    const thread = new Thread(session, "mockthread", 1);
    const firstSource = new Source(
      {
        name: "internalModule.js",
        path: "a/b/c/d/internalModule.js",
        sourceReference: 10
      },
      "aDebugSessionId",
      mockUriIdentityService,
      new NullLogService()
    );
    const stackFrame = new StackFrame(
      thread,
      1,
      firstSource,
      "app",
      "normal",
      {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 10
      },
      1,
      true
    );
    assert.strictEqual(stackFrame.toString(), "app (internalModule.js:1)");
    const secondSource = new Source(
      void 0,
      "aDebugSessionId",
      mockUriIdentityService,
      new NullLogService()
    );
    const stackFrame2 = new StackFrame(
      thread,
      2,
      secondSource,
      "module",
      "normal",
      {
        startLineNumber: void 0,
        startColumn: void 0,
        endLineNumber: void 0,
        endColumn: void 0
      },
      2,
      true
    );
    assert.strictEqual(stackFrame2.toString(), "module");
  });
  test("debug child sessions are added in correct order", () => {
    const session = disposables.add(createTestSession(model));
    model.addSession(session);
    const secondSession = disposables.add(
      createTestSession(model, "mockSession2")
    );
    model.addSession(secondSession);
    const firstChild = disposables.add(
      createTestSession(model, "firstChild", { parentSession: session })
    );
    model.addSession(firstChild);
    const secondChild = disposables.add(
      createTestSession(model, "secondChild", { parentSession: session })
    );
    model.addSession(secondChild);
    const thirdSession = disposables.add(
      createTestSession(model, "mockSession3")
    );
    model.addSession(thirdSession);
    const anotherChild = disposables.add(
      createTestSession(model, "secondChild", {
        parentSession: secondSession
      })
    );
    model.addSession(anotherChild);
    const sessions = model.getSessions();
    assert.strictEqual(sessions[0].getId(), session.getId());
    assert.strictEqual(sessions[1].getId(), firstChild.getId());
    assert.strictEqual(sessions[2].getId(), secondChild.getId());
    assert.strictEqual(sessions[3].getId(), secondSession.getId());
    assert.strictEqual(sessions[4].getId(), anotherChild.getId());
    assert.strictEqual(sessions[5].getId(), thirdSession.getId());
  });
  test("decorations", () => {
    const session = createTestSession(model);
    disposables.add(session);
    model.addSession(session);
    const { firstStackFrame, secondStackFrame } = createTwoStackFrames(session);
    let decorations = createDecorationsForStackFrame(
      firstStackFrame,
      true,
      false
    );
    assert.strictEqual(decorations.length, 3);
    assert.deepStrictEqual(decorations[0].range, new Range(1, 2, 1, 3));
    assert.strictEqual(
      decorations[0].options.glyphMarginClassName,
      ThemeIcon.asClassName(debugStackframe)
    );
    assert.deepStrictEqual(
      decorations[1].range,
      new Range(1, 2, 1, Constants.MAX_SAFE_SMALL_INTEGER)
    );
    assert.strictEqual(
      decorations[1].options.className,
      "debug-top-stack-frame-line"
    );
    assert.strictEqual(decorations[1].options.isWholeLine, true);
    decorations = createDecorationsForStackFrame(
      secondStackFrame,
      true,
      false
    );
    assert.strictEqual(decorations.length, 2);
    assert.deepStrictEqual(decorations[0].range, new Range(1, 2, 1, 3));
    assert.strictEqual(
      decorations[0].options.glyphMarginClassName,
      ThemeIcon.asClassName(debugStackframeFocused)
    );
    assert.deepStrictEqual(
      decorations[1].range,
      new Range(1, 2, 1, Constants.MAX_SAFE_SMALL_INTEGER)
    );
    assert.strictEqual(
      decorations[1].options.className,
      "debug-focused-stack-frame-line"
    );
    assert.strictEqual(decorations[1].options.isWholeLine, true);
    decorations = createDecorationsForStackFrame(
      firstStackFrame,
      true,
      false
    );
    assert.strictEqual(decorations.length, 3);
    assert.deepStrictEqual(decorations[0].range, new Range(1, 2, 1, 3));
    assert.strictEqual(
      decorations[0].options.glyphMarginClassName,
      ThemeIcon.asClassName(debugStackframe)
    );
    assert.deepStrictEqual(
      decorations[1].range,
      new Range(1, 2, 1, Constants.MAX_SAFE_SMALL_INTEGER)
    );
    assert.strictEqual(
      decorations[1].options.className,
      "debug-top-stack-frame-line"
    );
    assert.strictEqual(decorations[1].options.isWholeLine, true);
    assert.strictEqual(
      decorations[2].options.before?.inlineClassName,
      "debug-top-stack-frame-column"
    );
    assert.deepStrictEqual(
      decorations[2].range,
      new Range(1, 2, 1, Constants.MAX_SAFE_SMALL_INTEGER)
    );
  });
  test("contexts", () => {
    const session = createTestSession(model);
    disposables.add(session);
    model.addSession(session);
    const { firstStackFrame, secondStackFrame } = createTwoStackFrames(session);
    let context = getContext(firstStackFrame);
    assert.strictEqual(
      context.sessionId,
      firstStackFrame.thread.session.getId()
    );
    assert.strictEqual(context.threadId, firstStackFrame.thread.getId());
    assert.strictEqual(context.frameId, firstStackFrame.getId());
    context = getContext(secondStackFrame.thread);
    assert.strictEqual(
      context.sessionId,
      secondStackFrame.thread.session.getId()
    );
    assert.strictEqual(context.threadId, secondStackFrame.thread.getId());
    assert.strictEqual(context.frameId, void 0);
    context = getContext(session);
    assert.strictEqual(context.sessionId, session.getId());
    assert.strictEqual(context.threadId, void 0);
    assert.strictEqual(context.frameId, void 0);
    let contributedContext = getContextForContributedActions(firstStackFrame);
    assert.strictEqual(contributedContext, firstStackFrame.source.raw.path);
    contributedContext = getContextForContributedActions(
      firstStackFrame.thread
    );
    assert.strictEqual(contributedContext, firstStackFrame.thread.threadId);
    contributedContext = getContextForContributedActions(session);
    assert.strictEqual(contributedContext, session.getId());
  });
  test("focusStackFrameThreadAndSession", () => {
    const threadId1 = 1;
    const threadName1 = "firstThread";
    const threadId2 = 2;
    const threadName2 = "secondThread";
    const stoppedReason = "breakpoint";
    const session = new class extends DebugSession {
      get state() {
        return State.Stopped;
      }
    }(
      generateUuid(),
      {
        resolved: {
          name: "stoppedSession",
          type: "node",
          request: "launch"
        },
        unresolved: void 0
      },
      void 0,
      model,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      mockWorkspaceContextService,
      void 0,
      void 0,
      void 0,
      mockUriIdentityService,
      new TestInstantiationService(),
      void 0,
      void 0,
      new NullLogService(),
      void 0,
      void 0,
      new TestAccessibilityService()
    );
    disposables.add(session);
    const runningSession = createTestSession(model);
    disposables.add(runningSession);
    model.addSession(runningSession);
    model.addSession(session);
    session["raw"] = mockRawSession;
    model.rawUpdate({
      sessionId: session.getId(),
      threads: [
        {
          id: threadId1,
          name: threadName1
        }
      ]
    });
    model.rawUpdate({
      sessionId: session.getId(),
      threads: [
        {
          id: threadId1,
          name: threadName1
        },
        {
          id: threadId2,
          name: threadName2
        }
      ],
      stoppedDetails: {
        reason: stoppedReason,
        threadId: 1,
        allThreadsStopped: true
      }
    });
    const thread = session.getThread(threadId1);
    const runningThread = session.getThread(threadId2);
    let toFocus = getStackFrameThreadAndSessionToFocus(model, void 0);
    assert.deepStrictEqual(toFocus, {
      stackFrame: void 0,
      thread,
      session
    });
    toFocus = getStackFrameThreadAndSessionToFocus(
      model,
      void 0,
      void 0,
      runningSession
    );
    assert.deepStrictEqual(toFocus, {
      stackFrame: void 0,
      thread: void 0,
      session: runningSession
    });
    toFocus = getStackFrameThreadAndSessionToFocus(
      model,
      void 0,
      thread
    );
    assert.deepStrictEqual(toFocus, {
      stackFrame: void 0,
      thread,
      session
    });
    toFocus = getStackFrameThreadAndSessionToFocus(
      model,
      void 0,
      runningThread
    );
    assert.deepStrictEqual(toFocus, {
      stackFrame: void 0,
      thread: runningThread,
      session
    });
    const stackFrame = new StackFrame(
      thread,
      5,
      void 0,
      "stackframename2",
      void 0,
      void 0,
      1,
      true
    );
    toFocus = getStackFrameThreadAndSessionToFocus(model, stackFrame);
    assert.deepStrictEqual(toFocus, {
      stackFrame,
      thread,
      session
    });
  });
});
export {
  createTestSession
};
