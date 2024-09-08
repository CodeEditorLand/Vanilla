var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { distinct } from "../../../../base/common/arrays.js";
import { findLastIdx } from "../../../../base/common/arraysFind.js";
import {
  DeferredPromise,
  RunOnceScheduler
} from "../../../../base/common/async.js";
import {
  decodeBase64,
  encodeBase64,
  VSBuffer
} from "../../../../base/common/buffer.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Emitter } from "../../../../base/common/event.js";
import { stringHash } from "../../../../base/common/hash.js";
import {
  Disposable,
  DisposableMap
} from "../../../../base/common/lifecycle.js";
import { mixin } from "../../../../base/common/objects.js";
import { autorun } from "../../../../base/common/observable.js";
import * as resources from "../../../../base/common/resources.js";
import { isString, isUndefinedOrNull } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { Range } from "../../../../editor/common/core/range.js";
import * as nls from "../../../../nls.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { ITextFileService } from "../../../services/textfile/common/textfiles.js";
import {
  DataBreakpointSetType,
  DEBUG_MEMORY_SCHEME,
  DebugTreeItemCollapsibleState,
  isFrameDeemphasized,
  MemoryRangeType,
  State
} from "./debug.js";
import {
  getUriFromSource,
  UNKNOWN_SOURCE_LABEL
} from "./debugSource.js";
import { DisassemblyViewInput } from "./disassemblyViewInput.js";
class ExpressionContainer {
  constructor(session, threadId, _reference, id, namedVariables = 0, indexedVariables = 0, memoryReference = void 0, startOfVariables = 0, presentationHint = void 0, valueLocationReference = void 0) {
    this.session = session;
    this.threadId = threadId;
    this._reference = _reference;
    this.id = id;
    this.namedVariables = namedVariables;
    this.indexedVariables = indexedVariables;
    this.memoryReference = memoryReference;
    this.startOfVariables = startOfVariables;
    this.presentationHint = presentationHint;
    this.valueLocationReference = valueLocationReference;
  }
  static allValues = /* @__PURE__ */ new Map();
  // Use chunks to support variable paging #9537
  static BASE_CHUNK_SIZE = 100;
  type;
  valueChanged = false;
  _value = "";
  children;
  get reference() {
    return this._reference;
  }
  set reference(value) {
    this._reference = value;
    this.children = void 0;
  }
  async evaluateLazy() {
    if (typeof this.reference === "undefined") {
      return;
    }
    const response = await this.session.variables(
      this.reference,
      this.threadId,
      void 0,
      void 0,
      void 0
    );
    if (!response || !response.body || !response.body.variables || response.body.variables.length !== 1) {
      return;
    }
    const dummyVar = response.body.variables[0];
    this.reference = dummyVar.variablesReference;
    this._value = dummyVar.value;
    this.namedVariables = dummyVar.namedVariables;
    this.indexedVariables = dummyVar.indexedVariables;
    this.memoryReference = dummyVar.memoryReference;
    this.presentationHint = dummyVar.presentationHint;
    this.valueLocationReference = dummyVar.valueLocationReference;
    this.adoptLazyResponse(dummyVar);
  }
  adoptLazyResponse(response) {
  }
  getChildren() {
    if (!this.children) {
      this.children = this.doGetChildren();
    }
    return this.children;
  }
  async doGetChildren() {
    if (!this.hasChildren) {
      return [];
    }
    if (!this.getChildrenInChunks) {
      return this.fetchVariables(void 0, void 0, void 0);
    }
    const children = this.namedVariables ? await this.fetchVariables(void 0, void 0, "named") : [];
    let chunkSize = ExpressionContainer.BASE_CHUNK_SIZE;
    while (!!this.indexedVariables && this.indexedVariables > chunkSize * ExpressionContainer.BASE_CHUNK_SIZE) {
      chunkSize *= ExpressionContainer.BASE_CHUNK_SIZE;
    }
    if (!!this.indexedVariables && this.indexedVariables > chunkSize) {
      const numberOfChunks = Math.ceil(this.indexedVariables / chunkSize);
      for (let i = 0; i < numberOfChunks; i++) {
        const start = (this.startOfVariables || 0) + i * chunkSize;
        const count = Math.min(
          chunkSize,
          this.indexedVariables - i * chunkSize
        );
        children.push(
          new Variable(
            this.session,
            this.threadId,
            this,
            this.reference,
            `[${start}..${start + count - 1}]`,
            "",
            "",
            void 0,
            count,
            void 0,
            { kind: "virtual" },
            void 0,
            void 0,
            true,
            start
          )
        );
      }
      return children;
    }
    const variables = await this.fetchVariables(
      this.startOfVariables,
      this.indexedVariables,
      "indexed"
    );
    return children.concat(variables);
  }
  getId() {
    return this.id;
  }
  getSession() {
    return this.session;
  }
  get value() {
    return this._value;
  }
  get hasChildren() {
    return !!this.reference && this.reference > 0 && !this.presentationHint?.lazy;
  }
  async fetchVariables(start, count, filter) {
    try {
      const response = await this.session.variables(
        this.reference || 0,
        this.threadId,
        filter,
        start,
        count
      );
      if (!response || !response.body || !response.body.variables) {
        return [];
      }
      const nameCount = /* @__PURE__ */ new Map();
      const vars = response.body.variables.filter((v) => !!v).map((v) => {
        if (isString(v.value) && isString(v.name) && typeof v.variablesReference === "number") {
          const count2 = nameCount.get(v.name) || 0;
          const idDuplicationIndex = count2 > 0 ? count2.toString() : "";
          nameCount.set(v.name, count2 + 1);
          return new Variable(
            this.session,
            this.threadId,
            this,
            v.variablesReference,
            v.name,
            v.evaluateName,
            v.value,
            v.namedVariables,
            v.indexedVariables,
            v.memoryReference,
            v.presentationHint,
            v.type,
            v.__vscodeVariableMenuContext,
            true,
            0,
            idDuplicationIndex,
            v.declarationLocationReference,
            v.valueLocationReference
          );
        }
        return new Variable(
          this.session,
          this.threadId,
          this,
          0,
          "",
          void 0,
          nls.localize(
            "invalidVariableAttributes",
            "Invalid variable attributes"
          ),
          0,
          0,
          void 0,
          { kind: "virtual" },
          void 0,
          void 0,
          false
        );
      });
      if (this.session.autoExpandLazyVariables) {
        await Promise.all(
          vars.map(
            (v) => v.presentationHint?.lazy && v.evaluateLazy()
          )
        );
      }
      return vars;
    } catch (e) {
      return [
        new Variable(
          this.session,
          this.threadId,
          this,
          0,
          "",
          void 0,
          e.message,
          0,
          0,
          void 0,
          { kind: "virtual" },
          void 0,
          void 0,
          false
        )
      ];
    }
  }
  // The adapter explicitly sents the children count of an expression only if there are lots of children which should be chunked.
  get getChildrenInChunks() {
    return !!this.indexedVariables;
  }
  set value(value) {
    this._value = value;
    this.valueChanged = !!ExpressionContainer.allValues.get(this.getId()) && ExpressionContainer.allValues.get(this.getId()) !== Expression.DEFAULT_VALUE && ExpressionContainer.allValues.get(this.getId()) !== value;
    ExpressionContainer.allValues.set(this.getId(), value);
  }
  toString() {
    return this.value;
  }
  async evaluateExpression(expression, session, stackFrame, context, keepLazyVars = false, location) {
    if (!session || !stackFrame && context !== "repl") {
      this.value = context === "repl" ? nls.localize(
        "startDebugFirst",
        "Please start a debug session to evaluate expressions"
      ) : Expression.DEFAULT_VALUE;
      this.reference = 0;
      return false;
    }
    this.session = session;
    try {
      const response = await session.evaluate(
        expression,
        stackFrame ? stackFrame.frameId : void 0,
        context,
        location
      );
      if (response && response.body) {
        this.value = response.body.result || "";
        this.reference = response.body.variablesReference;
        this.namedVariables = response.body.namedVariables;
        this.indexedVariables = response.body.indexedVariables;
        this.memoryReference = response.body.memoryReference;
        this.type = response.body.type || this.type;
        this.presentationHint = response.body.presentationHint;
        this.valueLocationReference = response.body.valueLocationReference;
        if (!keepLazyVars && response.body.presentationHint?.lazy) {
          await this.evaluateLazy();
        }
        return true;
      }
      return false;
    } catch (e) {
      this.value = e.message || "";
      this.reference = 0;
      return false;
    }
  }
}
function handleSetResponse(expression, response) {
  if (response && response.body) {
    expression.value = response.body.value || "";
    expression.type = response.body.type || expression.type;
    expression.reference = response.body.variablesReference;
    expression.namedVariables = response.body.namedVariables;
    expression.indexedVariables = response.body.indexedVariables;
  }
}
class VisualizedExpression {
  constructor(visualizer, treeId, treeItem, original) {
    this.visualizer = visualizer;
    this.treeId = treeId;
    this.treeItem = treeItem;
    this.original = original;
  }
  errorMessage;
  id = generateUuid();
  evaluateLazy() {
    return Promise.resolve();
  }
  getChildren() {
    return this.visualizer.getVisualizedChildren(
      this.treeId,
      this.treeItem.id
    );
  }
  getId() {
    return this.id;
  }
  get name() {
    return this.treeItem.label;
  }
  get value() {
    return this.treeItem.description || "";
  }
  get hasChildren() {
    return this.treeItem.collapsibleState !== DebugTreeItemCollapsibleState.None;
  }
  /** Edits the value, sets the {@link errorMessage} and returns false if unsuccessful */
  async edit(newValue) {
    try {
      await this.visualizer.editTreeItem(
        this.treeId,
        this.treeItem,
        newValue
      );
      return true;
    } catch (e) {
      this.errorMessage = e.message;
      return false;
    }
  }
}
class Expression extends ExpressionContainer {
  constructor(name, id = generateUuid()) {
    super(void 0, void 0, 0, id);
    this.name = name;
    this.available = false;
    if (name) {
      this.value = Expression.DEFAULT_VALUE;
    }
  }
  static DEFAULT_VALUE = nls.localize(
    "notAvailable",
    "not available"
  );
  available;
  _onDidChangeValue = new Emitter();
  onDidChangeValue = this._onDidChangeValue.event;
  async evaluate(session, stackFrame, context, keepLazyVars, location) {
    const hadDefaultValue = this.value === Expression.DEFAULT_VALUE;
    this.available = await this.evaluateExpression(
      this.name,
      session,
      stackFrame,
      context,
      keepLazyVars,
      location
    );
    if (hadDefaultValue || this.valueChanged) {
      this._onDidChangeValue.fire(this);
    }
  }
  toString() {
    return `${this.name}
${this.value}`;
  }
  async setExpression(value, stackFrame) {
    if (!this.session) {
      return;
    }
    const response = await this.session.setExpression(
      stackFrame.frameId,
      this.name,
      value
    );
    handleSetResponse(this, response);
  }
}
class Variable extends ExpressionContainer {
  constructor(session, threadId, parent, reference, name, evaluateName, value, namedVariables, indexedVariables, memoryReference, presentationHint, type = void 0, variableMenuContext = void 0, available = true, startOfVariables = 0, idDuplicationIndex = "", declarationLocationReference = void 0, valueLocationReference = void 0) {
    super(
      session,
      threadId,
      reference,
      `variable:${parent.getId()}:${name}:${idDuplicationIndex}`,
      namedVariables,
      indexedVariables,
      memoryReference,
      startOfVariables,
      presentationHint,
      valueLocationReference
    );
    this.parent = parent;
    this.name = name;
    this.evaluateName = evaluateName;
    this.variableMenuContext = variableMenuContext;
    this.available = available;
    this.declarationLocationReference = declarationLocationReference;
    this.value = value || "";
    this.type = type;
  }
  // Used to show the error message coming from the adapter when setting the value #7807
  errorMessage;
  getThreadId() {
    return this.threadId;
  }
  async setVariable(value, stackFrame) {
    if (!this.session) {
      return;
    }
    try {
      if (this.session.capabilities.supportsSetExpression && !this.session.capabilities.supportsSetVariable && this.evaluateName) {
        return this.setExpression(value, stackFrame);
      }
      const response = await this.session.setVariable(
        this.parent.reference,
        this.name,
        value
      );
      handleSetResponse(this, response);
    } catch (err) {
      this.errorMessage = err.message;
    }
  }
  async setExpression(value, stackFrame) {
    if (!this.session || !this.evaluateName) {
      return;
    }
    const response = await this.session.setExpression(
      stackFrame.frameId,
      this.evaluateName,
      value
    );
    handleSetResponse(this, response);
  }
  toString() {
    return this.name ? `${this.name}: ${this.value}` : this.value;
  }
  adoptLazyResponse(response) {
    this.evaluateName = response.evaluateName;
  }
  toDebugProtocolObject() {
    return {
      name: this.name,
      variablesReference: this.reference || 0,
      memoryReference: this.memoryReference,
      value: this.value,
      evaluateName: this.evaluateName
    };
  }
}
class Scope extends ExpressionContainer {
  constructor(stackFrame, id, name, reference, expensive, namedVariables, indexedVariables, range) {
    super(
      stackFrame.thread.session,
      stackFrame.thread.threadId,
      reference,
      `scope:${name}:${id}`,
      namedVariables,
      indexedVariables
    );
    this.stackFrame = stackFrame;
    this.name = name;
    this.expensive = expensive;
    this.range = range;
  }
  toString() {
    return this.name;
  }
  toDebugProtocolObject() {
    return {
      name: this.name,
      variablesReference: this.reference || 0,
      expensive: this.expensive
    };
  }
}
class ErrorScope extends Scope {
  constructor(stackFrame, index, message) {
    super(stackFrame, index, message, 0, false);
  }
  toString() {
    return this.name;
  }
}
class StackFrame {
  constructor(thread, frameId, source, name, presentationHint, range, index, canRestart, instructionPointerReference) {
    this.thread = thread;
    this.frameId = frameId;
    this.source = source;
    this.name = name;
    this.presentationHint = presentationHint;
    this.range = range;
    this.index = index;
    this.canRestart = canRestart;
    this.instructionPointerReference = instructionPointerReference;
  }
  scopes;
  getId() {
    return `stackframe:${this.thread.getId()}:${this.index}:${this.source.name}`;
  }
  getScopes() {
    if (!this.scopes) {
      this.scopes = this.thread.session.scopes(this.frameId, this.thread.threadId).then(
        (response) => {
          if (!response || !response.body || !response.body.scopes) {
            return [];
          }
          const usedIds = /* @__PURE__ */ new Set();
          return response.body.scopes.map((rs) => {
            let id = 0;
            do {
              id = stringHash(
                `${rs.name}:${rs.line}:${rs.column}`,
                id
              );
            } while (usedIds.has(id));
            usedIds.add(id);
            return new Scope(
              this,
              id,
              rs.name,
              rs.variablesReference,
              rs.expensive,
              rs.namedVariables,
              rs.indexedVariables,
              rs.line && rs.column && rs.endLine && rs.endColumn ? new Range(
                rs.line,
                rs.column,
                rs.endLine,
                rs.endColumn
              ) : void 0
            );
          });
        },
        (err) => [new ErrorScope(this, 0, err.message)]
      );
    }
    return this.scopes;
  }
  async getMostSpecificScopes(range) {
    const scopes = await this.getScopes();
    const nonExpensiveScopes = scopes.filter((s) => !s.expensive);
    const haveRangeInfo = nonExpensiveScopes.some((s) => !!s.range);
    if (!haveRangeInfo) {
      return nonExpensiveScopes;
    }
    const scopesContainingRange = nonExpensiveScopes.filter(
      (scope) => scope.range && Range.containsRange(scope.range, range)
    ).sort(
      (first, second) => first.range.endLineNumber - first.range.startLineNumber - (second.range.endLineNumber - second.range.startLineNumber)
    );
    return scopesContainingRange.length ? scopesContainingRange : nonExpensiveScopes;
  }
  restart() {
    return this.thread.session.restartFrame(
      this.frameId,
      this.thread.threadId
    );
  }
  forgetScopes() {
    this.scopes = void 0;
  }
  toString() {
    const lineNumberToString = typeof this.range.startLineNumber === "number" ? `:${this.range.startLineNumber}` : "";
    const sourceToString = `${this.source.inMemory ? this.source.name : this.source.uri.fsPath}${lineNumberToString}`;
    return sourceToString === UNKNOWN_SOURCE_LABEL ? this.name : `${this.name} (${sourceToString})`;
  }
  async openInEditor(editorService, preserveFocus, sideBySide, pinned) {
    const threadStopReason = this.thread.stoppedDetails?.reason;
    if (this.instructionPointerReference && (threadStopReason === "instruction breakpoint" || threadStopReason === "step" && this.thread.lastSteppingGranularity === "instruction" || editorService.activeEditor instanceof DisassemblyViewInput)) {
      return editorService.openEditor(DisassemblyViewInput.instance, {
        pinned: true,
        revealIfOpened: true
      });
    }
    if (this.source.available) {
      return this.source.openInEditor(
        editorService,
        this.range,
        preserveFocus,
        sideBySide,
        pinned
      );
    }
    return void 0;
  }
  equals(other) {
    return this.name === other.name && other.thread === this.thread && this.frameId === other.frameId && other.source === this.source && Range.equalsRange(this.range, other.range);
  }
}
const KEEP_SUBTLE_FRAME_AT_TOP_REASONS = [
  "breakpoint",
  "step",
  "function breakpoint"
];
class Thread {
  constructor(session, name, threadId) {
    this.session = session;
    this.name = name;
    this.threadId = threadId;
    this.callStack = [];
    this.staleCallStack = [];
    this.stopped = false;
  }
  callStack;
  staleCallStack;
  callStackCancellationTokens = [];
  stoppedDetails;
  stopped;
  reachedEndOfCallStack = false;
  lastSteppingGranularity;
  getId() {
    return `thread:${this.session.getId()}:${this.threadId}`;
  }
  clearCallStack() {
    if (this.callStack.length) {
      this.staleCallStack = this.callStack;
    }
    this.callStack = [];
    this.callStackCancellationTokens.forEach((c) => c.dispose(true));
    this.callStackCancellationTokens = [];
  }
  getCallStack() {
    return this.callStack;
  }
  getStaleCallStack() {
    return this.staleCallStack;
  }
  getTopStackFrame() {
    const callStack = this.getCallStack();
    const stopReason = this.stoppedDetails?.reason;
    const firstAvailableStackFrame = callStack.find(
      (sf) => !!((stopReason === "instruction breakpoint" || stopReason === "step" && this.lastSteppingGranularity === "instruction") && sf.instructionPointerReference || sf.source && sf.source.available && (KEEP_SUBTLE_FRAME_AT_TOP_REASONS.includes(
        stopReason
      ) || !isFrameDeemphasized(sf)))
    );
    return firstAvailableStackFrame;
  }
  get stateLabel() {
    if (this.stoppedDetails) {
      return this.stoppedDetails.description || (this.stoppedDetails.reason ? nls.localize(
        {
          key: "pausedOn",
          comment: [
            "indicates reason for program being paused"
          ]
        },
        "Paused on {0}",
        this.stoppedDetails.reason
      ) : nls.localize("paused", "Paused"));
    }
    return nls.localize(
      { key: "running", comment: ["indicates state"] },
      "Running"
    );
  }
  /**
   * Queries the debug adapter for the callstack and returns a promise
   * which completes once the call stack has been retrieved.
   * If the thread is not stopped, it returns a promise to an empty array.
   * Only fetches the first stack frame for performance reasons. Calling this method consecutive times
   * gets the remainder of the call stack.
   */
  async fetchCallStack(levels = 20) {
    if (this.stopped) {
      const start = this.callStack.length;
      const callStack = await this.getCallStackImpl(start, levels);
      this.reachedEndOfCallStack = callStack.length < levels;
      if (start < this.callStack.length) {
        this.callStack.splice(start, this.callStack.length - start);
      }
      this.callStack = this.callStack.concat(callStack || []);
      if (typeof this.stoppedDetails?.totalFrames === "number" && this.stoppedDetails.totalFrames === this.callStack.length) {
        this.reachedEndOfCallStack = true;
      }
    }
  }
  async getCallStackImpl(startFrame, levels) {
    try {
      const tokenSource = new CancellationTokenSource();
      this.callStackCancellationTokens.push(tokenSource);
      const response = await this.session.stackTrace(
        this.threadId,
        startFrame,
        levels,
        tokenSource.token
      );
      if (!response || !response.body || tokenSource.token.isCancellationRequested) {
        return [];
      }
      if (this.stoppedDetails) {
        this.stoppedDetails.totalFrames = response.body.totalFrames;
      }
      return response.body.stackFrames.map((rsf, index) => {
        const source = this.session.getSource(rsf.source);
        return new StackFrame(
          this,
          rsf.id,
          source,
          rsf.name,
          rsf.presentationHint,
          new Range(
            rsf.line,
            rsf.column,
            rsf.endLine || rsf.line,
            rsf.endColumn || rsf.column
          ),
          startFrame + index,
          typeof rsf.canRestart === "boolean" ? rsf.canRestart : true,
          rsf.instructionPointerReference
        );
      });
    } catch (err) {
      if (this.stoppedDetails) {
        this.stoppedDetails.framesErrorMessage = err.message;
      }
      return [];
    }
  }
  /**
   * Returns exception info promise if the exception was thrown, otherwise undefined
   */
  get exceptionInfo() {
    if (this.stoppedDetails && this.stoppedDetails.reason === "exception") {
      if (this.session.capabilities.supportsExceptionInfoRequest) {
        return this.session.exceptionInfo(this.threadId);
      }
      return Promise.resolve({
        description: this.stoppedDetails.text,
        breakMode: null
      });
    }
    return Promise.resolve(void 0);
  }
  next(granularity) {
    return this.session.next(this.threadId, granularity);
  }
  stepIn(granularity) {
    return this.session.stepIn(this.threadId, void 0, granularity);
  }
  stepOut(granularity) {
    return this.session.stepOut(this.threadId, granularity);
  }
  stepBack(granularity) {
    return this.session.stepBack(this.threadId, granularity);
  }
  continue() {
    return this.session.continue(this.threadId);
  }
  pause() {
    return this.session.pause(this.threadId);
  }
  terminate() {
    return this.session.terminateThreads([this.threadId]);
  }
  reverseContinue() {
    return this.session.reverseContinue(this.threadId);
  }
}
const getUriForDebugMemory = (sessionId, memoryReference, range, displayName = "memory") => {
  return URI.from({
    scheme: DEBUG_MEMORY_SCHEME,
    authority: sessionId,
    path: "/" + encodeURIComponent(memoryReference) + `/${encodeURIComponent(displayName)}.bin`,
    query: range ? `?range=${range.fromOffset}:${range.toOffset}` : void 0
  });
};
class MemoryRegion extends Disposable {
  constructor(memoryReference, session) {
    super();
    this.memoryReference = memoryReference;
    this.session = session;
    this._register(
      session.onDidInvalidateMemory((e) => {
        if (e.body.memoryReference === memoryReference) {
          this.invalidate(
            e.body.offset,
            e.body.count - e.body.offset
          );
        }
      })
    );
  }
  invalidateEmitter = this._register(
    new Emitter()
  );
  /** @inheritdoc */
  onDidInvalidate = this.invalidateEmitter.event;
  /** @inheritdoc */
  writable = !!this.session.capabilities.supportsWriteMemoryRequest;
  async read(fromOffset, toOffset) {
    const length = toOffset - fromOffset;
    const offset = fromOffset;
    const result = await this.session.readMemory(
      this.memoryReference,
      offset,
      length
    );
    if (result === void 0 || !result.body?.data) {
      return [{ type: MemoryRangeType.Unreadable, offset, length }];
    }
    let data;
    try {
      data = decodeBase64(result.body.data);
    } catch {
      return [
        {
          type: MemoryRangeType.Error,
          offset,
          length,
          error: "Invalid base64 data from debug adapter"
        }
      ];
    }
    const unreadable = result.body.unreadableBytes || 0;
    const dataLength = length - unreadable;
    if (data.byteLength < dataLength) {
      const pad = VSBuffer.alloc(dataLength - data.byteLength);
      pad.buffer.fill(0);
      data = VSBuffer.concat([data, pad], dataLength);
    } else if (data.byteLength > dataLength) {
      data = data.slice(0, dataLength);
    }
    if (!unreadable) {
      return [{ type: MemoryRangeType.Valid, offset, length, data }];
    }
    return [
      { type: MemoryRangeType.Valid, offset, length: dataLength, data },
      {
        type: MemoryRangeType.Unreadable,
        offset: offset + dataLength,
        length: unreadable
      }
    ];
  }
  async write(offset, data) {
    const result = await this.session.writeMemory(
      this.memoryReference,
      offset,
      encodeBase64(data),
      true
    );
    const written = result?.body?.bytesWritten ?? data.byteLength;
    this.invalidate(offset, offset + written);
    return written;
  }
  dispose() {
    super.dispose();
  }
  invalidate(fromOffset, toOffset) {
    this.invalidateEmitter.fire({ fromOffset, toOffset });
  }
}
class Enablement {
  constructor(enabled, id) {
    this.enabled = enabled;
    this.id = id;
  }
  getId() {
    return this.id;
  }
}
function toBreakpointSessionData(data, capabilities) {
  return mixin(
    {
      supportsConditionalBreakpoints: !!capabilities.supportsConditionalBreakpoints,
      supportsHitConditionalBreakpoints: !!capabilities.supportsHitConditionalBreakpoints,
      supportsLogPoints: !!capabilities.supportsLogPoints,
      supportsFunctionBreakpoints: !!capabilities.supportsFunctionBreakpoints,
      supportsDataBreakpoints: !!capabilities.supportsDataBreakpoints,
      supportsInstructionBreakpoints: !!capabilities.supportsInstructionBreakpoints
    },
    data
  );
}
class BaseBreakpoint extends Enablement {
  sessionData = /* @__PURE__ */ new Map();
  data;
  hitCondition;
  condition;
  logMessage;
  mode;
  modeLabel;
  constructor(id, opts) {
    super(opts.enabled ?? true, id);
    this.condition = opts.condition;
    this.hitCondition = opts.hitCondition;
    this.logMessage = opts.logMessage;
    this.mode = opts.mode;
    this.modeLabel = opts.modeLabel;
  }
  setSessionData(sessionId, data) {
    if (data) {
      data.sessionId = sessionId;
      this.sessionData.set(sessionId, data);
    } else {
      this.sessionData.delete(sessionId);
    }
    const allData = Array.from(this.sessionData.values());
    const verifiedData = distinct(
      allData.filter((d) => d.verified),
      (d) => `${d.line}:${d.column}`
    );
    if (verifiedData.length) {
      this.data = verifiedData.length === 1 ? verifiedData[0] : void 0;
    } else {
      this.data = allData.length ? allData[0] : void 0;
    }
  }
  get message() {
    if (!this.data) {
      return void 0;
    }
    return this.data.message;
  }
  get verified() {
    return this.data ? this.data.verified : true;
  }
  get sessionsThatVerified() {
    const sessionIds = [];
    for (const [sessionId, data] of this.sessionData) {
      if (data.verified) {
        sessionIds.push(sessionId);
      }
    }
    return sessionIds;
  }
  getIdFromAdapter(sessionId) {
    const data = this.sessionData.get(sessionId);
    return data ? data.id : void 0;
  }
  getDebugProtocolBreakpoint(sessionId) {
    const data = this.sessionData.get(sessionId);
    if (data) {
      const bp = {
        id: data.id,
        verified: data.verified,
        message: data.message,
        source: data.source,
        line: data.line,
        column: data.column,
        endLine: data.endLine,
        endColumn: data.endColumn,
        instructionReference: data.instructionReference,
        offset: data.offset
      };
      return bp;
    }
    return void 0;
  }
  toJSON() {
    return {
      id: this.getId(),
      enabled: this.enabled,
      condition: this.condition,
      hitCondition: this.hitCondition,
      logMessage: this.logMessage,
      mode: this.mode,
      modeLabel: this.modeLabel
    };
  }
}
class Breakpoint extends BaseBreakpoint {
  constructor(opts, textFileService, uriIdentityService, logService, id = generateUuid()) {
    super(id, opts);
    this.textFileService = textFileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this._uri = opts.uri;
    this._lineNumber = opts.lineNumber;
    this._column = opts.column;
    this._adapterData = opts.adapterData;
    this.triggeredBy = opts.triggeredBy;
  }
  sessionsDidTrigger;
  _uri;
  _adapterData;
  _lineNumber;
  _column;
  triggeredBy;
  toDAP() {
    return {
      line: this.sessionAgnosticData.lineNumber,
      column: this.sessionAgnosticData.column,
      condition: this.condition,
      hitCondition: this.hitCondition,
      logMessage: this.logMessage,
      mode: this.mode
    };
  }
  get originalUri() {
    return this._uri;
  }
  get lineNumber() {
    return this.verified && this.data && typeof this.data.line === "number" ? this.data.line : this._lineNumber;
  }
  get verified() {
    if (this.data) {
      return this.data.verified && !this.textFileService.isDirty(this._uri);
    }
    return true;
  }
  get pending() {
    if (this.data) {
      return false;
    }
    return this.triggeredBy !== void 0;
  }
  get uri() {
    return this.verified && this.data && this.data.source ? getUriFromSource(
      this.data.source,
      this.data.source.path,
      this.data.sessionId,
      this.uriIdentityService,
      this.logService
    ) : this._uri;
  }
  get column() {
    return this.verified && this.data && typeof this.data.column === "number" ? this.data.column : this._column;
  }
  get message() {
    if (this.textFileService.isDirty(this.uri)) {
      return nls.localize(
        "breakpointDirtydHover",
        "Unverified breakpoint. File is modified, please restart debug session."
      );
    }
    return super.message;
  }
  get adapterData() {
    return this.data && this.data.source && this.data.source.adapterData ? this.data.source.adapterData : this._adapterData;
  }
  get endLineNumber() {
    return this.verified && this.data ? this.data.endLine : void 0;
  }
  get endColumn() {
    return this.verified && this.data ? this.data.endColumn : void 0;
  }
  get sessionAgnosticData() {
    return {
      lineNumber: this._lineNumber,
      column: this._column
    };
  }
  get supported() {
    if (!this.data) {
      return true;
    }
    if (this.logMessage && !this.data.supportsLogPoints) {
      return false;
    }
    if (this.condition && !this.data.supportsConditionalBreakpoints) {
      return false;
    }
    if (this.hitCondition && !this.data.supportsHitConditionalBreakpoints) {
      return false;
    }
    return true;
  }
  setSessionData(sessionId, data) {
    super.setSessionData(sessionId, data);
    if (!this._adapterData) {
      this._adapterData = this.adapterData;
    }
  }
  toJSON() {
    return {
      ...super.toJSON(),
      uri: this._uri,
      lineNumber: this._lineNumber,
      column: this._column,
      adapterData: this.adapterData,
      triggeredBy: this.triggeredBy
    };
  }
  toString() {
    return `${resources.basenameOrAuthority(this.uri)} ${this.lineNumber}`;
  }
  setSessionDidTrigger(sessionId) {
    this.sessionsDidTrigger ??= /* @__PURE__ */ new Set();
    this.sessionsDidTrigger.add(sessionId);
  }
  getSessionDidTrigger(sessionId) {
    return !!this.sessionsDidTrigger?.has(sessionId);
  }
  update(data) {
    if (data.hasOwnProperty("lineNumber") && !isUndefinedOrNull(data.lineNumber)) {
      this._lineNumber = data.lineNumber;
    }
    if (data.hasOwnProperty("column")) {
      this._column = data.column;
    }
    if (data.hasOwnProperty("condition")) {
      this.condition = data.condition;
    }
    if (data.hasOwnProperty("hitCondition")) {
      this.hitCondition = data.hitCondition;
    }
    if (data.hasOwnProperty("logMessage")) {
      this.logMessage = data.logMessage;
    }
    if (data.hasOwnProperty("mode")) {
      this.mode = data.mode;
      this.modeLabel = data.modeLabel;
    }
    if (data.hasOwnProperty("triggeredBy")) {
      this.triggeredBy = data.triggeredBy;
      this.sessionsDidTrigger = void 0;
    }
  }
}
class FunctionBreakpoint extends BaseBreakpoint {
  name;
  constructor(opts, id = generateUuid()) {
    super(id, opts);
    this.name = opts.name;
  }
  toDAP() {
    return {
      name: this.name,
      condition: this.condition,
      hitCondition: this.hitCondition
    };
  }
  toJSON() {
    return {
      ...super.toJSON(),
      name: this.name
    };
  }
  get supported() {
    if (!this.data) {
      return true;
    }
    return this.data.supportsFunctionBreakpoints;
  }
  toString() {
    return this.name;
  }
}
class DataBreakpoint extends BaseBreakpoint {
  sessionDataIdForAddr = /* @__PURE__ */ new WeakMap();
  description;
  src;
  canPersist;
  accessTypes;
  accessType;
  constructor(opts, id = generateUuid()) {
    super(id, opts);
    this.description = opts.description;
    if ("dataId" in opts) {
      opts.src = {
        type: DataBreakpointSetType.Variable,
        dataId: opts.dataId
      };
    }
    this.src = opts.src;
    this.canPersist = opts.canPersist;
    this.accessTypes = opts.accessTypes;
    this.accessType = opts.accessType;
    if (opts.initialSessionData) {
      this.sessionDataIdForAddr.set(
        opts.initialSessionData.session,
        opts.initialSessionData.dataId
      );
    }
  }
  async toDAP(session) {
    let dataId;
    if (this.src.type === DataBreakpointSetType.Variable) {
      dataId = this.src.dataId;
    } else {
      let sessionDataId = this.sessionDataIdForAddr.get(session);
      if (!sessionDataId) {
        sessionDataId = (await session.dataBytesBreakpointInfo(
          this.src.address,
          this.src.bytes
        ))?.dataId;
        if (!sessionDataId) {
          return void 0;
        }
        this.sessionDataIdForAddr.set(session, sessionDataId);
      }
      dataId = sessionDataId;
    }
    return {
      dataId,
      accessType: this.accessType,
      condition: this.condition,
      hitCondition: this.hitCondition
    };
  }
  toJSON() {
    return {
      ...super.toJSON(),
      description: this.description,
      src: this.src,
      accessTypes: this.accessTypes,
      accessType: this.accessType,
      canPersist: this.canPersist
    };
  }
  get supported() {
    if (!this.data) {
      return true;
    }
    return this.data.supportsDataBreakpoints;
  }
  toString() {
    return this.description;
  }
}
class ExceptionBreakpoint extends BaseBreakpoint {
  supportedSessions = /* @__PURE__ */ new Set();
  filter;
  label;
  supportsCondition;
  description;
  conditionDescription;
  fallback = false;
  constructor(opts, id = generateUuid()) {
    super(id, opts);
    this.filter = opts.filter;
    this.label = opts.label;
    this.supportsCondition = opts.supportsCondition;
    this.description = opts.description;
    this.conditionDescription = opts.conditionDescription;
    this.fallback = opts.fallback || false;
  }
  toJSON() {
    return {
      ...super.toJSON(),
      filter: this.filter,
      label: this.label,
      enabled: this.enabled,
      supportsCondition: this.supportsCondition,
      conditionDescription: this.conditionDescription,
      condition: this.condition,
      fallback: this.fallback,
      description: this.description
    };
  }
  setSupportedSession(sessionId, supported) {
    if (supported) {
      this.supportedSessions.add(sessionId);
    } else {
      this.supportedSessions.delete(sessionId);
    }
  }
  /**
   * Used to specify which breakpoints to show when no session is specified.
   * Useful when no session is active and we want to show the exception breakpoints from the last session.
   */
  setFallback(isFallback) {
    this.fallback = isFallback;
  }
  get supported() {
    return true;
  }
  /**
   * Checks if the breakpoint is applicable for the specified session.
   * If sessionId is undefined, returns true if this breakpoint is a fallback breakpoint.
   */
  isSupportedSession(sessionId) {
    return sessionId ? this.supportedSessions.has(sessionId) : this.fallback;
  }
  matches(filter) {
    return this.filter === filter.filter && this.label === filter.label && this.supportsCondition === !!filter.supportsCondition && this.conditionDescription === filter.conditionDescription && this.description === filter.description;
  }
  toString() {
    return this.label;
  }
}
class InstructionBreakpoint extends BaseBreakpoint {
  instructionReference;
  offset;
  canPersist;
  address;
  constructor(opts, id = generateUuid()) {
    super(id, opts);
    this.instructionReference = opts.instructionReference;
    this.offset = opts.offset;
    this.canPersist = opts.canPersist;
    this.address = opts.address;
  }
  toDAP() {
    return {
      instructionReference: this.instructionReference,
      condition: this.condition,
      hitCondition: this.hitCondition,
      mode: this.mode,
      offset: this.offset
    };
  }
  toJSON() {
    return {
      ...super.toJSON(),
      instructionReference: this.instructionReference,
      offset: this.offset,
      canPersist: this.canPersist,
      address: this.address
    };
  }
  get supported() {
    if (!this.data) {
      return true;
    }
    return this.data.supportsInstructionBreakpoints;
  }
  toString() {
    return this.instructionReference;
  }
}
class ThreadAndSessionIds {
  constructor(sessionId, threadId) {
    this.sessionId = sessionId;
    this.threadId = threadId;
  }
  getId() {
    return `${this.sessionId}:${this.threadId}`;
  }
}
let DebugModel = class extends Disposable {
  constructor(debugStorage, textFileService, uriIdentityService, logService) {
    super();
    this.textFileService = textFileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this._register(
      autorun((reader) => {
        this.breakpoints = debugStorage.breakpoints.read(reader);
        this.functionBreakpoints = debugStorage.functionBreakpoints.read(reader);
        this.exceptionBreakpoints = debugStorage.exceptionBreakpoints.read(reader);
        this.dataBreakpoints = debugStorage.dataBreakpoints.read(reader);
        this._onDidChangeBreakpoints.fire(void 0);
      })
    );
    this._register(
      autorun((reader) => {
        this.watchExpressions = debugStorage.watchExpressions.read(reader);
        this._onDidChangeWatchExpressions.fire(void 0);
      })
    );
    this.instructionBreakpoints = [];
    this.sessions = [];
    for (const we of this.watchExpressions) {
      this.watchExpressionChangeListeners.set(
        we.getId(),
        we.onDidChangeValue(
          (e) => this._onDidChangeWatchExpressionValue.fire(e)
        )
      );
    }
  }
  sessions;
  schedulers = /* @__PURE__ */ new Map();
  breakpointsActivated = true;
  _onDidChangeBreakpoints = this._register(
    new Emitter()
  );
  _onDidChangeCallStack = this._register(
    new Emitter()
  );
  _onDidChangeWatchExpressions = this._register(
    new Emitter()
  );
  _onDidChangeWatchExpressionValue = this._register(
    new Emitter()
  );
  _breakpointModes = /* @__PURE__ */ new Map();
  breakpoints;
  functionBreakpoints;
  exceptionBreakpoints;
  dataBreakpoints;
  watchExpressions;
  watchExpressionChangeListeners = this._register(new DisposableMap());
  instructionBreakpoints;
  getId() {
    return "root";
  }
  getSession(sessionId, includeInactive = false) {
    if (sessionId) {
      return this.getSessions(includeInactive).find(
        (s) => s.getId() === sessionId
      );
    }
    return void 0;
  }
  getSessions(includeInactive = false) {
    return this.sessions.filter(
      (s) => includeInactive || s.state !== State.Inactive
    );
  }
  addSession(session) {
    this.sessions = this.sessions.filter((s) => {
      if (s.getId() === session.getId()) {
        return false;
      }
      if (s.state === State.Inactive && s.configuration.name === session.configuration.name) {
        return false;
      }
      return true;
    });
    let i = 1;
    while (this.sessions.some((s) => s.getLabel() === session.getLabel())) {
      session.setName(`${session.configuration.name} ${++i}`);
    }
    let index = -1;
    if (session.parentSession) {
      index = findLastIdx(
        this.sessions,
        (s) => s.parentSession === session.parentSession || s === session.parentSession
      );
    }
    if (index >= 0) {
      this.sessions.splice(index + 1, 0, session);
    } else {
      this.sessions.push(session);
    }
    this._onDidChangeCallStack.fire(void 0);
  }
  get onDidChangeBreakpoints() {
    return this._onDidChangeBreakpoints.event;
  }
  get onDidChangeCallStack() {
    return this._onDidChangeCallStack.event;
  }
  get onDidChangeWatchExpressions() {
    return this._onDidChangeWatchExpressions.event;
  }
  get onDidChangeWatchExpressionValue() {
    return this._onDidChangeWatchExpressionValue.event;
  }
  rawUpdate(data) {
    const session = this.sessions.find((p) => p.getId() === data.sessionId);
    if (session) {
      session.rawUpdate(data);
      this._onDidChangeCallStack.fire(void 0);
    }
  }
  clearThreads(id, removeThreads, reference = void 0) {
    const session = this.sessions.find((p) => p.getId() === id);
    this.schedulers.forEach((entry) => {
      entry.scheduler.dispose();
      entry.completeDeferred.complete();
    });
    this.schedulers.clear();
    if (session) {
      session.clearThreads(removeThreads, reference);
      this._onDidChangeCallStack.fire(void 0);
    }
  }
  /**
   * Update the call stack and notify the call stack view that changes have occurred.
   */
  async fetchCallstack(thread, levels) {
    if (thread.reachedEndOfCallStack) {
      return;
    }
    const totalFrames = thread.stoppedDetails?.totalFrames;
    const remainingFrames = typeof totalFrames === "number" ? totalFrames - thread.getCallStack().length : void 0;
    if (!levels || remainingFrames && levels > remainingFrames) {
      levels = remainingFrames;
    }
    if (levels && levels > 0) {
      await thread.fetchCallStack(levels);
      this._onDidChangeCallStack.fire();
    }
    return;
  }
  refreshTopOfCallstack(thread, fetchFullStack = true) {
    if (thread.session.capabilities.supportsDelayedStackTraceLoading) {
      let topCallStack = Promise.resolve();
      const wholeCallStack2 = new Promise((c, e) => {
        topCallStack = thread.fetchCallStack(1).then(() => {
          if (!fetchFullStack) {
            c();
            this._onDidChangeCallStack.fire();
            return;
          }
          if (!this.schedulers.has(thread.getId())) {
            const deferred = new DeferredPromise();
            this.schedulers.set(thread.getId(), {
              completeDeferred: deferred,
              scheduler: new RunOnceScheduler(() => {
                thread.fetchCallStack(19).then(() => {
                  const stale = thread.getStaleCallStack();
                  const current = thread.getCallStack();
                  let bottomOfCallStackChanged = stale.length !== current.length;
                  for (let i = 1; i < stale.length && !bottomOfCallStackChanged; i++) {
                    bottomOfCallStackChanged = !stale[i].equals(current[i]);
                  }
                  if (bottomOfCallStackChanged) {
                    this._onDidChangeCallStack.fire();
                  }
                }).finally(() => {
                  deferred.complete();
                  this.schedulers.delete(thread.getId());
                });
              }, 420)
            });
          }
          const entry = this.schedulers.get(thread.getId());
          entry.scheduler.schedule();
          entry.completeDeferred.p.then(c, e);
          this._onDidChangeCallStack.fire();
        });
      });
      return { topCallStack, wholeCallStack: wholeCallStack2 };
    }
    const wholeCallStack = thread.fetchCallStack();
    return { wholeCallStack, topCallStack: wholeCallStack };
  }
  getBreakpoints(filter) {
    if (filter) {
      const uriStr = filter.uri?.toString();
      const originalUriStr = filter.originalUri?.toString();
      return this.breakpoints.filter((bp) => {
        if (uriStr && bp.uri.toString() !== uriStr) {
          return false;
        }
        if (originalUriStr && bp.originalUri.toString() !== originalUriStr) {
          return false;
        }
        if (filter.lineNumber && bp.lineNumber !== filter.lineNumber) {
          return false;
        }
        if (filter.column && bp.column !== filter.column) {
          return false;
        }
        if (filter.enabledOnly && (!this.breakpointsActivated || !bp.enabled)) {
          return false;
        }
        if (filter.triggeredOnly && bp.triggeredBy === void 0) {
          return false;
        }
        return true;
      });
    }
    return this.breakpoints;
  }
  getFunctionBreakpoints() {
    return this.functionBreakpoints;
  }
  getDataBreakpoints() {
    return this.dataBreakpoints;
  }
  getExceptionBreakpoints() {
    return this.exceptionBreakpoints;
  }
  getExceptionBreakpointsForSession(sessionId) {
    return this.exceptionBreakpoints.filter(
      (ebp) => ebp.isSupportedSession(sessionId)
    );
  }
  getInstructionBreakpoints() {
    return this.instructionBreakpoints;
  }
  setExceptionBreakpointsForSession(sessionId, filters) {
    if (!filters) {
      return;
    }
    let didChangeBreakpoints = false;
    filters.forEach((d) => {
      let ebp = this.exceptionBreakpoints.filter((exbp) => exbp.matches(d)).pop();
      if (!ebp) {
        didChangeBreakpoints = true;
        ebp = new ExceptionBreakpoint({
          filter: d.filter,
          label: d.label,
          enabled: !!d.default,
          supportsCondition: !!d.supportsCondition,
          description: d.description,
          conditionDescription: d.conditionDescription
        });
        this.exceptionBreakpoints.push(ebp);
      }
      ebp.setSupportedSession(sessionId, true);
    });
    if (didChangeBreakpoints) {
      this._onDidChangeBreakpoints.fire(void 0);
    }
  }
  removeExceptionBreakpointsForSession(sessionId) {
    this.exceptionBreakpoints.forEach(
      (ebp) => ebp.setSupportedSession(sessionId, false)
    );
  }
  // Set last focused session as fallback session.
  // This is done to keep track of the exception breakpoints to show when no session is active.
  setExceptionBreakpointFallbackSession(sessionId) {
    this.exceptionBreakpoints.forEach(
      (ebp) => ebp.setFallback(ebp.isSupportedSession(sessionId))
    );
  }
  setExceptionBreakpointCondition(exceptionBreakpoint, condition) {
    exceptionBreakpoint.condition = condition;
    this._onDidChangeBreakpoints.fire(void 0);
  }
  areBreakpointsActivated() {
    return this.breakpointsActivated;
  }
  setBreakpointsActivated(activated) {
    this.breakpointsActivated = activated;
    this._onDidChangeBreakpoints.fire(void 0);
  }
  addBreakpoints(uri, rawData, fireEvent = true) {
    const newBreakpoints = rawData.map((rawBp) => {
      return new Breakpoint(
        {
          uri,
          lineNumber: rawBp.lineNumber,
          column: rawBp.column,
          enabled: rawBp.enabled ?? true,
          condition: rawBp.condition,
          hitCondition: rawBp.hitCondition,
          logMessage: rawBp.logMessage,
          triggeredBy: rawBp.triggeredBy,
          adapterData: void 0,
          mode: rawBp.mode,
          modeLabel: rawBp.modeLabel
        },
        this.textFileService,
        this.uriIdentityService,
        this.logService,
        rawBp.id
      );
    });
    this.breakpoints = this.breakpoints.concat(newBreakpoints);
    this.breakpointsActivated = true;
    this.sortAndDeDup();
    if (fireEvent) {
      this._onDidChangeBreakpoints.fire({
        added: newBreakpoints,
        sessionOnly: false
      });
    }
    return newBreakpoints;
  }
  removeBreakpoints(toRemove) {
    this.breakpoints = this.breakpoints.filter(
      (bp) => !toRemove.some((toRemove2) => toRemove2.getId() === bp.getId())
    );
    this._onDidChangeBreakpoints.fire({
      removed: toRemove,
      sessionOnly: false
    });
  }
  updateBreakpoints(data) {
    const updated = [];
    this.breakpoints.forEach((bp) => {
      const bpData = data.get(bp.getId());
      if (bpData) {
        bp.update(bpData);
        updated.push(bp);
      }
    });
    this.sortAndDeDup();
    this._onDidChangeBreakpoints.fire({
      changed: updated,
      sessionOnly: false
    });
  }
  setBreakpointSessionData(sessionId, capabilites, data) {
    this.breakpoints.forEach((bp) => {
      if (data) {
        const bpData = data.get(bp.getId());
        if (bpData) {
          bp.setSessionData(
            sessionId,
            toBreakpointSessionData(bpData, capabilites)
          );
        }
      } else {
        bp.setSessionData(sessionId, void 0);
      }
    });
    this.functionBreakpoints.forEach((fbp) => {
      if (data) {
        const fbpData = data.get(fbp.getId());
        if (fbpData) {
          fbp.setSessionData(
            sessionId,
            toBreakpointSessionData(fbpData, capabilites)
          );
        }
      } else {
        fbp.setSessionData(sessionId, void 0);
      }
    });
    this.dataBreakpoints.forEach((dbp) => {
      if (data) {
        const dbpData = data.get(dbp.getId());
        if (dbpData) {
          dbp.setSessionData(
            sessionId,
            toBreakpointSessionData(dbpData, capabilites)
          );
        }
      } else {
        dbp.setSessionData(sessionId, void 0);
      }
    });
    this.exceptionBreakpoints.forEach((ebp) => {
      if (data) {
        const ebpData = data.get(ebp.getId());
        if (ebpData) {
          ebp.setSessionData(
            sessionId,
            toBreakpointSessionData(ebpData, capabilites)
          );
        }
      } else {
        ebp.setSessionData(sessionId, void 0);
      }
    });
    this.instructionBreakpoints.forEach((ibp) => {
      if (data) {
        const ibpData = data.get(ibp.getId());
        if (ibpData) {
          ibp.setSessionData(
            sessionId,
            toBreakpointSessionData(ibpData, capabilites)
          );
        }
      } else {
        ibp.setSessionData(sessionId, void 0);
      }
    });
    this._onDidChangeBreakpoints.fire({
      sessionOnly: true
    });
  }
  getDebugProtocolBreakpoint(breakpointId, sessionId) {
    const bp = this.breakpoints.find((bp2) => bp2.getId() === breakpointId);
    if (bp) {
      return bp.getDebugProtocolBreakpoint(sessionId);
    }
    return void 0;
  }
  getBreakpointModes(forBreakpointType) {
    return [...this._breakpointModes.values()].filter(
      (mode) => mode.appliesTo.includes(forBreakpointType)
    );
  }
  registerBreakpointModes(debugType, modes) {
    for (const mode of modes) {
      const key = `${mode.mode}/${mode.label}`;
      const rec = this._breakpointModes.get(key);
      if (rec) {
        for (const target of mode.appliesTo) {
          if (!rec.appliesTo.includes(target)) {
            rec.appliesTo.push(target);
          }
        }
      } else {
        const duplicate = [...this._breakpointModes.values()].find(
          (r) => r !== rec && r.label === mode.label
        );
        if (duplicate) {
          duplicate.label = `${duplicate.label} (${duplicate.firstFromDebugType})`;
        }
        this._breakpointModes.set(key, {
          mode: mode.mode,
          label: duplicate ? `${mode.label} (${debugType})` : mode.label,
          firstFromDebugType: debugType,
          description: mode.description,
          appliesTo: mode.appliesTo.slice()
          // avoid later mutations
        });
      }
    }
  }
  sortAndDeDup() {
    this.breakpoints = this.breakpoints.sort((first, second) => {
      if (first.uri.toString() !== second.uri.toString()) {
        return resources.basenameOrAuthority(first.uri).localeCompare(resources.basenameOrAuthority(second.uri));
      }
      if (first.lineNumber === second.lineNumber) {
        if (first.column && second.column) {
          return first.column - second.column;
        }
        return 1;
      }
      return first.lineNumber - second.lineNumber;
    });
    this.breakpoints = distinct(
      this.breakpoints,
      (bp) => `${bp.uri.toString()}:${bp.lineNumber}:${bp.column}`
    );
  }
  setEnablement(element, enable) {
    if (element instanceof Breakpoint || element instanceof FunctionBreakpoint || element instanceof ExceptionBreakpoint || element instanceof DataBreakpoint || element instanceof InstructionBreakpoint) {
      const changed = [];
      if (element.enabled !== enable && (element instanceof Breakpoint || element instanceof FunctionBreakpoint || element instanceof DataBreakpoint || element instanceof InstructionBreakpoint)) {
        changed.push(element);
      }
      element.enabled = enable;
      if (enable) {
        this.breakpointsActivated = true;
      }
      this._onDidChangeBreakpoints.fire({
        changed,
        sessionOnly: false
      });
    }
  }
  enableOrDisableAllBreakpoints(enable) {
    const changed = [];
    this.breakpoints.forEach((bp) => {
      if (bp.enabled !== enable) {
        changed.push(bp);
      }
      bp.enabled = enable;
    });
    this.functionBreakpoints.forEach((fbp) => {
      if (fbp.enabled !== enable) {
        changed.push(fbp);
      }
      fbp.enabled = enable;
    });
    this.dataBreakpoints.forEach((dbp) => {
      if (dbp.enabled !== enable) {
        changed.push(dbp);
      }
      dbp.enabled = enable;
    });
    this.instructionBreakpoints.forEach((ibp) => {
      if (ibp.enabled !== enable) {
        changed.push(ibp);
      }
      ibp.enabled = enable;
    });
    if (enable) {
      this.breakpointsActivated = true;
    }
    this._onDidChangeBreakpoints.fire({
      changed,
      sessionOnly: false
    });
  }
  addFunctionBreakpoint(opts, id) {
    const newFunctionBreakpoint = new FunctionBreakpoint(opts, id);
    this.functionBreakpoints.push(newFunctionBreakpoint);
    this._onDidChangeBreakpoints.fire({
      added: [newFunctionBreakpoint],
      sessionOnly: false
    });
    return newFunctionBreakpoint;
  }
  updateFunctionBreakpoint(id, update) {
    const functionBreakpoint = this.functionBreakpoints.find(
      (fbp) => fbp.getId() === id
    );
    if (functionBreakpoint) {
      if (typeof update.name === "string") {
        functionBreakpoint.name = update.name;
      }
      if (typeof update.condition === "string") {
        functionBreakpoint.condition = update.condition;
      }
      if (typeof update.hitCondition === "string") {
        functionBreakpoint.hitCondition = update.hitCondition;
      }
      this._onDidChangeBreakpoints.fire({
        changed: [functionBreakpoint],
        sessionOnly: false
      });
    }
  }
  removeFunctionBreakpoints(id) {
    let removed;
    if (id) {
      removed = this.functionBreakpoints.filter(
        (fbp) => fbp.getId() === id
      );
      this.functionBreakpoints = this.functionBreakpoints.filter(
        (fbp) => fbp.getId() !== id
      );
    } else {
      removed = this.functionBreakpoints;
      this.functionBreakpoints = [];
    }
    this._onDidChangeBreakpoints.fire({ removed, sessionOnly: false });
  }
  addDataBreakpoint(opts, id) {
    const newDataBreakpoint = new DataBreakpoint(opts, id);
    this.dataBreakpoints.push(newDataBreakpoint);
    this._onDidChangeBreakpoints.fire({
      added: [newDataBreakpoint],
      sessionOnly: false
    });
  }
  updateDataBreakpoint(id, update) {
    const dataBreakpoint = this.dataBreakpoints.find(
      (fbp) => fbp.getId() === id
    );
    if (dataBreakpoint) {
      if (typeof update.condition === "string") {
        dataBreakpoint.condition = update.condition;
      }
      if (typeof update.hitCondition === "string") {
        dataBreakpoint.hitCondition = update.hitCondition;
      }
      this._onDidChangeBreakpoints.fire({
        changed: [dataBreakpoint],
        sessionOnly: false
      });
    }
  }
  removeDataBreakpoints(id) {
    let removed;
    if (id) {
      removed = this.dataBreakpoints.filter((fbp) => fbp.getId() === id);
      this.dataBreakpoints = this.dataBreakpoints.filter(
        (fbp) => fbp.getId() !== id
      );
    } else {
      removed = this.dataBreakpoints;
      this.dataBreakpoints = [];
    }
    this._onDidChangeBreakpoints.fire({ removed, sessionOnly: false });
  }
  addInstructionBreakpoint(opts) {
    const newInstructionBreakpoint = new InstructionBreakpoint(opts);
    this.instructionBreakpoints.push(newInstructionBreakpoint);
    this._onDidChangeBreakpoints.fire({
      added: [newInstructionBreakpoint],
      sessionOnly: true
    });
  }
  removeInstructionBreakpoints(instructionReference, offset) {
    let removed = [];
    if (instructionReference) {
      for (let i = 0; i < this.instructionBreakpoints.length; i++) {
        const ibp = this.instructionBreakpoints[i];
        if (ibp.instructionReference === instructionReference && (offset === void 0 || ibp.offset === offset)) {
          removed.push(ibp);
          this.instructionBreakpoints.splice(i--, 1);
        }
      }
    } else {
      removed = this.instructionBreakpoints;
      this.instructionBreakpoints = [];
    }
    this._onDidChangeBreakpoints.fire({ removed, sessionOnly: false });
  }
  getWatchExpressions() {
    return this.watchExpressions;
  }
  addWatchExpression(name) {
    const we = new Expression(name || "");
    this.watchExpressionChangeListeners.set(
      we.getId(),
      we.onDidChangeValue(
        (e) => this._onDidChangeWatchExpressionValue.fire(e)
      )
    );
    this.watchExpressions.push(we);
    this._onDidChangeWatchExpressions.fire(we);
    return we;
  }
  renameWatchExpression(id, newName) {
    const filtered = this.watchExpressions.filter(
      (we) => we.getId() === id
    );
    if (filtered.length === 1) {
      filtered[0].name = newName;
      this._onDidChangeWatchExpressions.fire(filtered[0]);
    }
  }
  removeWatchExpressions(id = null) {
    this.watchExpressions = id ? this.watchExpressions.filter((we) => we.getId() !== id) : [];
    this._onDidChangeWatchExpressions.fire(void 0);
    if (!id) {
      this.watchExpressionChangeListeners.clearAndDisposeAll();
      return;
    }
    this.watchExpressionChangeListeners.deleteAndDispose(id);
  }
  moveWatchExpression(id, position) {
    const we = this.watchExpressions.find((we2) => we2.getId() === id);
    if (we) {
      this.watchExpressions = this.watchExpressions.filter(
        (we2) => we2.getId() !== id
      );
      this.watchExpressions = this.watchExpressions.slice(0, position).concat(we, this.watchExpressions.slice(position));
      this._onDidChangeWatchExpressions.fire(void 0);
    }
  }
  sourceIsNotAvailable(uri) {
    this.sessions.forEach((s) => {
      const source = s.getSourceForUri(uri);
      if (source) {
        source.available = false;
      }
    });
    this._onDidChangeCallStack.fire(void 0);
  }
};
DebugModel = __decorateClass([
  __decorateParam(1, ITextFileService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, ILogService)
], DebugModel);
export {
  BaseBreakpoint,
  Breakpoint,
  DataBreakpoint,
  DebugModel,
  Enablement,
  ErrorScope,
  ExceptionBreakpoint,
  Expression,
  ExpressionContainer,
  FunctionBreakpoint,
  InstructionBreakpoint,
  MemoryRegion,
  Scope,
  StackFrame,
  Thread,
  ThreadAndSessionIds,
  Variable,
  VisualizedExpression,
  getUriForDebugMemory
};
