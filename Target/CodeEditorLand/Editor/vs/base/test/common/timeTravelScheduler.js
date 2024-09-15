var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { compareBy, numberComparator, tieBreakComparators } from "../../common/arrays.js";
import { Emitter, Event } from "../../common/event.js";
import { Disposable, IDisposable } from "../../common/lifecycle.js";
import { setTimeout0, setTimeout0IsFaster } from "../../common/platform.js";
const scheduledTaskComparator = tieBreakComparators(
  compareBy((i) => i.time, numberComparator),
  compareBy((i) => i.id, numberComparator)
);
class TimeTravelScheduler {
  static {
    __name(this, "TimeTravelScheduler");
  }
  taskCounter = 0;
  _now = 0;
  queue = new SimplePriorityQueue([], scheduledTaskComparator);
  taskScheduledEmitter = new Emitter();
  onTaskScheduled = this.taskScheduledEmitter.event;
  schedule(task) {
    if (task.time < this._now) {
      throw new Error(`Scheduled time (${task.time}) must be equal to or greater than the current time (${this._now}).`);
    }
    const extendedTask = { ...task, id: this.taskCounter++ };
    this.queue.add(extendedTask);
    this.taskScheduledEmitter.fire({ task });
    return { dispose: /* @__PURE__ */ __name(() => this.queue.remove(extendedTask), "dispose") };
  }
  get now() {
    return this._now;
  }
  get hasScheduledTasks() {
    return this.queue.length > 0;
  }
  getScheduledTasks() {
    return this.queue.toSortedArray();
  }
  runNext() {
    const task = this.queue.removeMin();
    if (task) {
      this._now = task.time;
      task.run();
    }
    return task;
  }
  installGlobally() {
    return overwriteGlobals(this);
  }
}
class AsyncSchedulerProcessor extends Disposable {
  constructor(scheduler, options) {
    super();
    this.scheduler = scheduler;
    this.maxTaskCount = options && options.maxTaskCount ? options.maxTaskCount : 100;
    this.useSetImmediate = options && options.useSetImmediate ? options.useSetImmediate : false;
    this._register(scheduler.onTaskScheduled(() => {
      if (this.isProcessing) {
        return;
      } else {
        this.isProcessing = true;
        this.schedule();
      }
    }));
  }
  static {
    __name(this, "AsyncSchedulerProcessor");
  }
  isProcessing = false;
  _history = new Array();
  get history() {
    return this._history;
  }
  maxTaskCount;
  useSetImmediate;
  queueEmptyEmitter = new Emitter();
  onTaskQueueEmpty = this.queueEmptyEmitter.event;
  lastError;
  schedule() {
    Promise.resolve().then(() => {
      if (this.useSetImmediate) {
        originalGlobalValues.setImmediate(() => this.process());
      } else if (setTimeout0IsFaster) {
        setTimeout0(() => this.process());
      } else {
        originalGlobalValues.setTimeout(() => this.process());
      }
    });
  }
  process() {
    const executedTask = this.scheduler.runNext();
    if (executedTask) {
      this._history.push(executedTask);
      if (this.history.length >= this.maxTaskCount && this.scheduler.hasScheduledTasks) {
        const lastTasks = this._history.slice(Math.max(0, this.history.length - 10)).map((h) => `${h.source.toString()}: ${h.source.stackTrace}`);
        const e = new Error(`Queue did not get empty after processing ${this.history.length} items. These are the last ${lastTasks.length} scheduled tasks:
${lastTasks.join("\n\n\n")}`);
        this.lastError = e;
        throw e;
      }
    }
    if (this.scheduler.hasScheduledTasks) {
      this.schedule();
    } else {
      this.isProcessing = false;
      this.queueEmptyEmitter.fire();
    }
  }
  waitForEmptyQueue() {
    if (this.lastError) {
      const error = this.lastError;
      this.lastError = void 0;
      throw error;
    }
    if (!this.isProcessing) {
      return Promise.resolve();
    } else {
      return Event.toPromise(this.onTaskQueueEmpty).then(() => {
        if (this.lastError) {
          throw this.lastError;
        }
      });
    }
  }
}
async function runWithFakedTimers(options, fn) {
  const useFakeTimers = options.useFakeTimers === void 0 ? true : options.useFakeTimers;
  if (!useFakeTimers) {
    return fn();
  }
  const scheduler = new TimeTravelScheduler();
  const schedulerProcessor = new AsyncSchedulerProcessor(scheduler, { useSetImmediate: options.useSetImmediate, maxTaskCount: options.maxTaskCount });
  const globalInstallDisposable = scheduler.installGlobally();
  let result;
  try {
    result = await fn();
  } finally {
    globalInstallDisposable.dispose();
    try {
      await schedulerProcessor.waitForEmptyQueue();
    } finally {
      schedulerProcessor.dispose();
    }
  }
  return result;
}
__name(runWithFakedTimers, "runWithFakedTimers");
const originalGlobalValues = {
  setTimeout: globalThis.setTimeout.bind(globalThis),
  clearTimeout: globalThis.clearTimeout.bind(globalThis),
  setInterval: globalThis.setInterval.bind(globalThis),
  clearInterval: globalThis.clearInterval.bind(globalThis),
  setImmediate: globalThis.setImmediate?.bind(globalThis),
  clearImmediate: globalThis.clearImmediate?.bind(globalThis),
  requestAnimationFrame: globalThis.requestAnimationFrame?.bind(globalThis),
  cancelAnimationFrame: globalThis.cancelAnimationFrame?.bind(globalThis),
  Date: globalThis.Date
};
function setTimeout(scheduler, handler, timeout = 0) {
  if (typeof handler === "string") {
    throw new Error("String handler args should not be used and are not supported");
  }
  return scheduler.schedule({
    time: scheduler.now + timeout,
    run: /* @__PURE__ */ __name(() => {
      handler();
    }, "run"),
    source: {
      toString() {
        return "setTimeout";
      },
      stackTrace: new Error().stack
    }
  });
}
__name(setTimeout, "setTimeout");
function setInterval(scheduler, handler, interval) {
  if (typeof handler === "string") {
    throw new Error("String handler args should not be used and are not supported");
  }
  const validatedHandler = handler;
  let iterCount = 0;
  const stackTrace = new Error().stack;
  let disposed = false;
  let lastDisposable;
  function schedule() {
    iterCount++;
    const curIter = iterCount;
    lastDisposable = scheduler.schedule({
      time: scheduler.now + interval,
      run() {
        if (!disposed) {
          schedule();
          validatedHandler();
        }
      },
      source: {
        toString() {
          return `setInterval (iteration ${curIter})`;
        },
        stackTrace
      }
    });
  }
  __name(schedule, "schedule");
  schedule();
  return {
    dispose: /* @__PURE__ */ __name(() => {
      if (disposed) {
        return;
      }
      disposed = true;
      lastDisposable.dispose();
    }, "dispose")
  };
}
__name(setInterval, "setInterval");
function overwriteGlobals(scheduler) {
  globalThis.setTimeout = (handler, timeout) => setTimeout(scheduler, handler, timeout);
  globalThis.clearTimeout = (timeoutId) => {
    if (typeof timeoutId === "object" && timeoutId && "dispose" in timeoutId) {
      timeoutId.dispose();
    } else {
      originalGlobalValues.clearTimeout(timeoutId);
    }
  };
  globalThis.setInterval = (handler, timeout) => setInterval(scheduler, handler, timeout);
  globalThis.clearInterval = (timeoutId) => {
    if (typeof timeoutId === "object" && timeoutId && "dispose" in timeoutId) {
      timeoutId.dispose();
    } else {
      originalGlobalValues.clearInterval(timeoutId);
    }
  };
  globalThis.Date = createDateClass(scheduler);
  return {
    dispose: /* @__PURE__ */ __name(() => {
      Object.assign(globalThis, originalGlobalValues);
    }, "dispose")
  };
}
__name(overwriteGlobals, "overwriteGlobals");
function createDateClass(scheduler) {
  const OriginalDate = originalGlobalValues.Date;
  function SchedulerDate(...args) {
    if (!(this instanceof SchedulerDate)) {
      return new OriginalDate(scheduler.now).toString();
    }
    if (args.length === 0) {
      return new OriginalDate(scheduler.now);
    }
    return new OriginalDate(...args);
  }
  __name(SchedulerDate, "SchedulerDate");
  for (const prop in OriginalDate) {
    if (OriginalDate.hasOwnProperty(prop)) {
      SchedulerDate[prop] = OriginalDate[prop];
    }
  }
  SchedulerDate.now = /* @__PURE__ */ __name(function now() {
    return scheduler.now;
  }, "now");
  SchedulerDate.toString = /* @__PURE__ */ __name(function toString() {
    return OriginalDate.toString();
  }, "toString");
  SchedulerDate.prototype = OriginalDate.prototype;
  SchedulerDate.parse = OriginalDate.parse;
  SchedulerDate.UTC = OriginalDate.UTC;
  SchedulerDate.prototype.toUTCString = OriginalDate.prototype.toUTCString;
  return SchedulerDate;
}
__name(createDateClass, "createDateClass");
class SimplePriorityQueue {
  constructor(items, compare) {
    this.compare = compare;
    this.items = items;
  }
  static {
    __name(this, "SimplePriorityQueue");
  }
  isSorted = false;
  items;
  get length() {
    return this.items.length;
  }
  add(value) {
    this.items.push(value);
    this.isSorted = false;
  }
  remove(value) {
    this.items.splice(this.items.indexOf(value), 1);
    this.isSorted = false;
  }
  removeMin() {
    this.ensureSorted();
    return this.items.shift();
  }
  getMin() {
    this.ensureSorted();
    return this.items[0];
  }
  toSortedArray() {
    this.ensureSorted();
    return [...this.items];
  }
  ensureSorted() {
    if (!this.isSorted) {
      this.items.sort(this.compare);
      this.isSorted = true;
    }
  }
}
export {
  AsyncSchedulerProcessor,
  TimeTravelScheduler,
  originalGlobalValues,
  runWithFakedTimers
};
//# sourceMappingURL=timeTravelScheduler.js.map
