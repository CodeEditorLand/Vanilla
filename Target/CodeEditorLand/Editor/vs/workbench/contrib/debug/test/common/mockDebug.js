import { DeferredPromise } from "../../../../../base/common/async.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import { AbstractDebugAdapter } from "../../common/abstractDebugAdapter.js";
import {
  State
} from "../../common/debug.js";
import { DebugStorage } from "../../common/debugStorage.js";
class MockDebugService {
  _serviceBrand;
  get state() {
    throw new Error("not implemented");
  }
  get onWillNewSession() {
    throw new Error("not implemented");
  }
  get onDidNewSession() {
    throw new Error("not implemented");
  }
  get onDidEndSession() {
    throw new Error("not implemented");
  }
  get onDidChangeState() {
    throw new Error("not implemented");
  }
  getConfigurationManager() {
    throw new Error("not implemented");
  }
  getAdapterManager() {
    throw new Error("Method not implemented.");
  }
  canSetBreakpointsIn(model) {
    throw new Error("Method not implemented.");
  }
  focusStackFrame(focusedStackFrame) {
    throw new Error("not implemented");
  }
  sendAllBreakpoints(session) {
    throw new Error("not implemented");
  }
  sendBreakpoints(modelUri, sourceModified, session) {
    throw new Error("not implemented");
  }
  addBreakpoints(uri, rawBreakpoints) {
    throw new Error("not implemented");
  }
  updateBreakpoints(uri, data, sendOnResourceSaved) {
    throw new Error("not implemented");
  }
  enableOrDisableBreakpoints(enabled) {
    throw new Error("not implemented");
  }
  setBreakpointsActivated() {
    throw new Error("not implemented");
  }
  removeBreakpoints() {
    throw new Error("not implemented");
  }
  addInstructionBreakpoint(opts) {
    throw new Error("Method not implemented.");
  }
  removeInstructionBreakpoints(address) {
    throw new Error("Method not implemented.");
  }
  setExceptionBreakpointCondition(breakpoint, condition) {
    throw new Error("Method not implemented.");
  }
  setExceptionBreakpointsForSession(session, data) {
    throw new Error("Method not implemented.");
  }
  addFunctionBreakpoint() {
  }
  moveWatchExpression(id, position) {
  }
  updateFunctionBreakpoint(id, update) {
    throw new Error("not implemented");
  }
  removeFunctionBreakpoints(id) {
    throw new Error("not implemented");
  }
  addDataBreakpoint() {
    throw new Error("Method not implemented.");
  }
  updateDataBreakpoint(id, update) {
    throw new Error("not implemented");
  }
  removeDataBreakpoints(id) {
    throw new Error("Method not implemented.");
  }
  addReplExpression(name) {
    throw new Error("not implemented");
  }
  removeReplExpressions() {
  }
  addWatchExpression(name) {
    throw new Error("not implemented");
  }
  renameWatchExpression(id, newName) {
    throw new Error("not implemented");
  }
  removeWatchExpressions(id) {
  }
  startDebugging(launch, configOrName, options) {
    return Promise.resolve(true);
  }
  restartSession() {
    throw new Error("not implemented");
  }
  stopSession() {
    throw new Error("not implemented");
  }
  getModel() {
    throw new Error("not implemented");
  }
  getViewModel() {
    throw new Error("not implemented");
  }
  sourceIsNotAvailable(uri) {
  }
  tryToAutoFocusStackFrame(thread) {
    throw new Error("not implemented");
  }
  runTo(uri, lineNumber, column) {
    throw new Error("Method not implemented.");
  }
}
class MockSession {
  suppressDebugToolbar = false;
  suppressDebugStatusbar = false;
  suppressDebugView = false;
  autoExpandLazyVariables = false;
  getMemory(memoryReference) {
    throw new Error("Method not implemented.");
  }
  get onDidInvalidateMemory() {
    throw new Error("Not implemented");
  }
  readMemory(memoryReference, offset, count) {
    throw new Error("Method not implemented.");
  }
  writeMemory(memoryReference, offset, data, allowPartial) {
    throw new Error("Method not implemented.");
  }
  get compoundRoot() {
    return void 0;
  }
  get saveBeforeRestart() {
    return true;
  }
  get isSimpleUI() {
    return false;
  }
  get lifecycleManagedByParent() {
    return false;
  }
  stepInTargets(frameId) {
    throw new Error("Method not implemented.");
  }
  cancel(_progressId) {
    throw new Error("Method not implemented.");
  }
  breakpointsLocations(uri, lineNumber) {
    throw new Error("Method not implemented.");
  }
  dataBytesBreakpointInfo(address, bytes) {
    throw new Error("Method not implemented.");
  }
  dataBreakpointInfo(name, variablesReference) {
    throw new Error("Method not implemented.");
  }
  sendDataBreakpoints(dbps) {
    throw new Error("Method not implemented.");
  }
  subId;
  get compact() {
    return false;
  }
  setSubId(subId) {
    throw new Error("Method not implemented.");
  }
  get parentSession() {
    return void 0;
  }
  getReplElements() {
    return [];
  }
  hasSeparateRepl() {
    return true;
  }
  removeReplExpressions() {
  }
  get onDidChangeReplElements() {
    throw new Error("not implemented");
  }
  addReplExpression(stackFrame, name) {
    return Promise.resolve(void 0);
  }
  appendToRepl(data) {
  }
  configuration = { type: "mock", name: "mock", request: "launch" };
  unresolvedConfiguration = {
    type: "mock",
    name: "mock",
    request: "launch"
  };
  state = State.Stopped;
  root;
  capabilities = {};
  getId() {
    return "mock";
  }
  getLabel() {
    return "mockname";
  }
  get name() {
    return "mockname";
  }
  setName(name) {
    throw new Error("not implemented");
  }
  getSourceForUri(modelUri) {
    throw new Error("not implemented");
  }
  getThread(threadId) {
    throw new Error("not implemented");
  }
  getStoppedDetails() {
    throw new Error("not implemented");
  }
  get onDidCustomEvent() {
    throw new Error("not implemented");
  }
  get onDidLoadedSource() {
    throw new Error("not implemented");
  }
  get onDidChangeState() {
    throw new Error("not implemented");
  }
  get onDidEndAdapter() {
    throw new Error("not implemented");
  }
  get onDidChangeName() {
    throw new Error("not implemented");
  }
  get onDidProgressStart() {
    throw new Error("not implemented");
  }
  get onDidProgressUpdate() {
    throw new Error("not implemented");
  }
  get onDidProgressEnd() {
    throw new Error("not implemented");
  }
  setConfiguration(configuration) {
  }
  getAllThreads() {
    return [];
  }
  getSource(raw) {
    throw new Error("not implemented");
  }
  getLoadedSources() {
    return Promise.resolve([]);
  }
  completions(frameId, threadId, text, position, overwriteBefore) {
    throw new Error("not implemented");
  }
  clearThreads(removeThreads, reference) {
  }
  rawUpdate(data) {
  }
  initialize(dbgr) {
    throw new Error("Method not implemented.");
  }
  launchOrAttach(config) {
    throw new Error("Method not implemented.");
  }
  restart() {
    throw new Error("Method not implemented.");
  }
  sendBreakpoints(modelUri, bpts, sourceModified) {
    throw new Error("Method not implemented.");
  }
  sendFunctionBreakpoints(fbps) {
    throw new Error("Method not implemented.");
  }
  sendExceptionBreakpoints(exbpts) {
    throw new Error("Method not implemented.");
  }
  sendInstructionBreakpoints(dbps) {
    throw new Error("Method not implemented.");
  }
  getDebugProtocolBreakpoint(breakpointId) {
    throw new Error("Method not implemented.");
  }
  customRequest(request, args) {
    throw new Error("Method not implemented.");
  }
  stackTrace(threadId, startFrame, levels, token) {
    throw new Error("Method not implemented.");
  }
  exceptionInfo(threadId) {
    throw new Error("Method not implemented.");
  }
  scopes(frameId) {
    throw new Error("Method not implemented.");
  }
  variables(variablesReference, threadId, filter, start, count) {
    throw new Error("Method not implemented.");
  }
  evaluate(expression, frameId, context) {
    throw new Error("Method not implemented.");
  }
  restartFrame(frameId, threadId) {
    throw new Error("Method not implemented.");
  }
  next(threadId, granularity) {
    throw new Error("Method not implemented.");
  }
  stepIn(threadId, targetId, granularity) {
    throw new Error("Method not implemented.");
  }
  stepOut(threadId, granularity) {
    throw new Error("Method not implemented.");
  }
  stepBack(threadId, granularity) {
    throw new Error("Method not implemented.");
  }
  continue(threadId) {
    throw new Error("Method not implemented.");
  }
  reverseContinue(threadId) {
    throw new Error("Method not implemented.");
  }
  pause(threadId) {
    throw new Error("Method not implemented.");
  }
  terminateThreads(threadIds) {
    throw new Error("Method not implemented.");
  }
  setVariable(variablesReference, name, value) {
    throw new Error("Method not implemented.");
  }
  setExpression(frameId, expression, value) {
    throw new Error("Method not implemented.");
  }
  loadSource(resource) {
    throw new Error("Method not implemented.");
  }
  disassemble(memoryReference, offset, instructionOffset, instructionCount) {
    throw new Error("Method not implemented.");
  }
  terminate(restart = false) {
    throw new Error("Method not implemented.");
  }
  disconnect(restart = false) {
    throw new Error("Method not implemented.");
  }
  gotoTargets(source, line, column) {
    throw new Error("Method not implemented.");
  }
  goto(threadId, targetId) {
    throw new Error("Method not implemented.");
  }
  resolveLocationReference(locationReference) {
    throw new Error("Method not implemented.");
  }
}
class MockRawSession {
  capabilities = {};
  disconnected = false;
  sessionLengthInSeconds = 0;
  readyForBreakpoints = true;
  emittedStopped = true;
  getLengthInSeconds() {
    return 100;
  }
  stackTrace(args) {
    return Promise.resolve({
      seq: 1,
      type: "response",
      request_seq: 1,
      success: true,
      command: "stackTrace",
      body: {
        stackFrames: [
          {
            id: 1,
            name: "mock",
            line: 5,
            column: 6
          }
        ]
      }
    });
  }
  exceptionInfo(args) {
    throw new Error("not implemented");
  }
  launchOrAttach(args) {
    throw new Error("not implemented");
  }
  scopes(args) {
    throw new Error("not implemented");
  }
  variables(args) {
    throw new Error("not implemented");
  }
  evaluate(args) {
    return Promise.resolve(null);
  }
  custom(request, args) {
    throw new Error("not implemented");
  }
  terminate(restart = false) {
    throw new Error("not implemented");
  }
  disconnect(restart) {
    throw new Error("not implemented");
  }
  threads() {
    throw new Error("not implemented");
  }
  stepIn(args) {
    throw new Error("not implemented");
  }
  stepOut(args) {
    throw new Error("not implemented");
  }
  stepBack(args) {
    throw new Error("not implemented");
  }
  continue(args) {
    throw new Error("not implemented");
  }
  reverseContinue(args) {
    throw new Error("not implemented");
  }
  pause(args) {
    throw new Error("not implemented");
  }
  terminateThreads(args) {
    throw new Error("not implemented");
  }
  setVariable(args) {
    throw new Error("not implemented");
  }
  restartFrame(args) {
    throw new Error("not implemented");
  }
  completions(args) {
    throw new Error("not implemented");
  }
  next(args) {
    throw new Error("not implemented");
  }
  source(args) {
    throw new Error("not implemented");
  }
  loadedSources(args) {
    throw new Error("not implemented");
  }
  setBreakpoints(args) {
    throw new Error("not implemented");
  }
  setFunctionBreakpoints(args) {
    throw new Error("not implemented");
  }
  setExceptionBreakpoints(args) {
    throw new Error("not implemented");
  }
  onDidStop = null;
}
class MockDebugAdapter extends AbstractDebugAdapter {
  seq = 0;
  pendingResponses = /* @__PURE__ */ new Map();
  startSession() {
    return Promise.resolve();
  }
  stopSession() {
    return Promise.resolve();
  }
  sendMessage(message) {
    if (message.type === "request") {
      setTimeout(() => {
        const request = message;
        switch (request.command) {
          case "evaluate":
            this.evaluate(request, request.arguments);
            return;
        }
        this.sendResponseBody(request, {});
        return;
      }, 0);
    } else if (message.type === "response") {
      const response = message;
      if (this.pendingResponses.has(response.command)) {
        this.pendingResponses.get(response.command).complete(response);
      }
    }
  }
  sendResponseBody(request, body) {
    const response = {
      seq: ++this.seq,
      type: "response",
      request_seq: request.seq,
      command: request.command,
      success: true,
      body
    };
    this.acceptMessage(response);
  }
  sendEventBody(event, body) {
    const response = {
      seq: ++this.seq,
      type: "event",
      event,
      body
    };
    this.acceptMessage(response);
  }
  waitForResponseFromClient(command) {
    const deferred = new DeferredPromise();
    if (this.pendingResponses.has(command)) {
      return this.pendingResponses.get(command).p;
    }
    this.pendingResponses.set(command, deferred);
    return deferred.p;
  }
  sendRequestBody(command, args) {
    const response = {
      seq: ++this.seq,
      type: "request",
      command,
      arguments: args
    };
    this.acceptMessage(response);
  }
  evaluate(request, args) {
    if (args.expression.indexOf("before.") === 0) {
      this.sendEventBody("output", { output: args.expression });
    }
    this.sendResponseBody(request, {
      result: "=" + args.expression,
      variablesReference: 0
    });
    if (args.expression.indexOf("after.") === 0) {
      this.sendEventBody("output", { output: args.expression });
    }
  }
}
class MockDebugStorage extends DebugStorage {
  constructor(storageService) {
    super(
      storageService,
      void 0,
      void 0,
      new NullLogService()
    );
  }
}
export {
  MockDebugAdapter,
  MockDebugService,
  MockDebugStorage,
  MockRawSession,
  MockSession
};
