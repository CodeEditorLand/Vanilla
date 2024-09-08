import {
  compareBy,
  numberComparator,
  tieBreakComparators
} from "../../common/arrays.js";
import { Emitter, Event } from "../../common/event.js";
import { Disposable } from "../../common/lifecycle.js";
import { setTimeout0, setTimeout0IsFaster } from "../../common/platform.js";
const scheduledTaskComparator = tieBreakComparators(
  compareBy((i) => i.time, numberComparator),
  compareBy((i) => i.id, numberComparator)
);
class TimeTravelScheduler {
  taskCounter = 0;
  _now = 0;
  queue = new SimplePriorityQueue(
    [],
    scheduledTaskComparator
  );
  taskScheduledEmitter = new Emitter();
  onTaskScheduled = this.taskScheduledEmitter.event;
  schedule(task) {
    if (task.time < this._now) {
      throw new Error(
        `Scheduled time (${task.time}) must be equal to or greater than the current time (${this._now}).`
      );
    }
    const extendedTask = {
      ...task,
      id: this.taskCounter++
    };
    this.queue.add(extendedTask);
    this.taskScheduledEmitter.fire({ task });
    return { dispose: () => this.queue.remove(extendedTask) };
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
    this._register(
      scheduler.onTaskScheduled(() => {
        if (this.isProcessing) {
          return;
        } else {
          this.isProcessing = true;
          this.schedule();
        }
      })
    );
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
        const lastTasks = this._history.slice(Math.max(0, this.history.length - 10)).map(
          (h) => `${h.source.toString()}: ${h.source.stackTrace}`
        );
        const e = new Error(
          `Queue did not get empty after processing ${this.history.length} items. These are the last ${lastTasks.length} scheduled tasks:
${lastTasks.join("\n\n\n")}`
        );
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
    if (this.isProcessing) {
      return Event.toPromise(this.onTaskQueueEmpty).then(() => {
        if (this.lastError) {
          throw this.lastError;
        }
      });
    } else {
      return Promise.resolve();
    }
  }
}
async function runWithFakedTimers(options, fn) {
  const useFakeTimers = options.useFakeTimers === void 0 ? true : options.useFakeTimers;
  if (!useFakeTimers) {
    return fn();
  }
  const scheduler = new TimeTravelScheduler();
  const schedulerProcessor = new AsyncSchedulerProcessor(scheduler, {
    useSetImmediate: options.useSetImmediate,
    maxTaskCount: options.maxTaskCount
  });
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
    throw new Error(
      "String handler args should not be used and are not supported"
    );
  }
  return scheduler.schedule({
    time: scheduler.now + timeout,
    run: () => {
      handler();
    },
    source: {
      toString() {
        return "setTimeout";
      },
      stackTrace: new Error().stack
    }
  });
}
function setInterval(scheduler, handler, interval) {
  if (typeof handler === "string") {
    throw new Error(
      "String handler args should not be used and are not supported"
    );
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
  schedule();
  return {
    dispose: () => {
      if (disposed) {
        return;
      }
      disposed = true;
      lastDisposable.dispose();
    }
  };
}
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
    dispose: () => {
      Object.assign(globalThis, originalGlobalValues);
    }
  };
}
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
  for (const prop in OriginalDate) {
    if (OriginalDate.hasOwnProperty(prop)) {
      SchedulerDate[prop] = OriginalDate[prop];
    }
  }
  SchedulerDate.now = function now() {
    return scheduler.now;
  };
  SchedulerDate.toString = function toString() {
    return OriginalDate.toString();
  };
  SchedulerDate.prototype = OriginalDate.prototype;
  SchedulerDate.parse = OriginalDate.parse;
  SchedulerDate.UTC = OriginalDate.UTC;
  SchedulerDate.prototype.toUTCString = OriginalDate.prototype.toUTCString;
  return SchedulerDate;
}
class SimplePriorityQueue {
  constructor(items, compare) {
    this.compare = compare;
    this.items = items;
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
