import assert from "assert";
import * as async from "../../common/async.js";
import {
  CancellationTokenSource
} from "../../common/cancellation.js";
import { isCancellationError } from "../../common/errors.js";
import { Event } from "../../common/event.js";
import { DisposableStore } from "../../common/lifecycle.js";
import * as MicrotaskDelay from "../../common/symbols.js";
import { URI } from "../../common/uri.js";
import { runWithFakedTimers } from "./timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("Async", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  suite("cancelablePromise", () => {
    test("set token, don't wait for inner promise", () => {
      let canceled = 0;
      const promise = async.createCancelablePromise((token) => {
        store.add(
          token.onCancellationRequested((_) => {
            canceled += 1;
          })
        );
        return new Promise((resolve) => {
        });
      });
      const result = promise.then(
        (_) => assert.ok(false),
        (err) => {
          assert.strictEqual(canceled, 1);
          assert.ok(isCancellationError(err));
        }
      );
      promise.cancel();
      promise.cancel();
      return result;
    });
    test("cancel despite inner promise being resolved", () => {
      let canceled = 0;
      const promise = async.createCancelablePromise((token) => {
        store.add(
          token.onCancellationRequested((_) => {
            canceled += 1;
          })
        );
        return Promise.resolve(1234);
      });
      const result = promise.then(
        (_) => assert.ok(false),
        (err) => {
          assert.strictEqual(canceled, 1);
          assert.ok(isCancellationError(err));
        }
      );
      promise.cancel();
      return result;
    });
    test("execution order (sync)", () => {
      const order = [];
      const cancellablePromise = async.createCancelablePromise(
        (token) => {
          order.push("in callback");
          store.add(
            token.onCancellationRequested(
              (_) => order.push("cancelled")
            )
          );
          return Promise.resolve(1234);
        }
      );
      order.push("afterCreate");
      const promise = cancellablePromise.then(void 0, (err) => null).then(() => order.push("finally"));
      cancellablePromise.cancel();
      order.push("afterCancel");
      return promise.then(
        () => assert.deepStrictEqual(order, [
          "in callback",
          "afterCreate",
          "cancelled",
          "afterCancel",
          "finally"
        ])
      );
    });
    test("execution order (async)", () => {
      const order = [];
      const cancellablePromise = async.createCancelablePromise(
        (token) => {
          order.push("in callback");
          store.add(
            token.onCancellationRequested(
              (_) => order.push("cancelled")
            )
          );
          return new Promise((c) => setTimeout(c.bind(1234), 0));
        }
      );
      order.push("afterCreate");
      const promise = cancellablePromise.then(void 0, (err) => null).then(() => order.push("finally"));
      cancellablePromise.cancel();
      order.push("afterCancel");
      return promise.then(
        () => assert.deepStrictEqual(order, [
          "in callback",
          "afterCreate",
          "cancelled",
          "afterCancel",
          "finally"
        ])
      );
    });
    test("execution order (async with late listener)", async () => {
      const order = [];
      const cancellablePromise = async.createCancelablePromise(
        async (token) => {
          order.push("in callback");
          await async.timeout(0);
          store.add(
            token.onCancellationRequested(
              (_) => order.push("cancelled")
            )
          );
          cancellablePromise.cancel();
          order.push("afterCancel");
        }
      );
      order.push("afterCreate");
      const promise = cancellablePromise.then(void 0, (err) => null).then(() => order.push("finally"));
      return promise.then(
        () => assert.deepStrictEqual(order, [
          "in callback",
          "afterCreate",
          "cancelled",
          "afterCancel",
          "finally"
        ])
      );
    });
    test("get inner result", async () => {
      const promise = async.createCancelablePromise((token) => {
        return async.timeout(12).then((_) => 1234);
      });
      const result = await promise;
      assert.strictEqual(result, 1234);
    });
  });
  suite("Throttler", () => {
    test("non async", () => {
      let count = 0;
      const factory = () => {
        return Promise.resolve(++count);
      };
      const throttler = new async.Throttler();
      return Promise.all([
        throttler.queue(factory).then((result) => {
          assert.strictEqual(result, 1);
        }),
        throttler.queue(factory).then((result) => {
          assert.strictEqual(result, 2);
        }),
        throttler.queue(factory).then((result) => {
          assert.strictEqual(result, 2);
        }),
        throttler.queue(factory).then((result) => {
          assert.strictEqual(result, 2);
        }),
        throttler.queue(factory).then((result) => {
          assert.strictEqual(result, 2);
        })
      ]).then(() => assert.strictEqual(count, 2));
    });
    test("async", () => {
      let count = 0;
      const factory = () => async.timeout(0).then(() => ++count);
      const throttler = new async.Throttler();
      return Promise.all([
        throttler.queue(factory).then((result) => {
          assert.strictEqual(result, 1);
        }),
        throttler.queue(factory).then((result) => {
          assert.strictEqual(result, 2);
        }),
        throttler.queue(factory).then((result) => {
          assert.strictEqual(result, 2);
        }),
        throttler.queue(factory).then((result) => {
          assert.strictEqual(result, 2);
        }),
        throttler.queue(factory).then((result) => {
          assert.strictEqual(result, 2);
        })
      ]).then(() => {
        return Promise.all([
          throttler.queue(factory).then((result) => {
            assert.strictEqual(result, 3);
          }),
          throttler.queue(factory).then((result) => {
            assert.strictEqual(result, 4);
          }),
          throttler.queue(factory).then((result) => {
            assert.strictEqual(result, 4);
          }),
          throttler.queue(factory).then((result) => {
            assert.strictEqual(result, 4);
          }),
          throttler.queue(factory).then((result) => {
            assert.strictEqual(result, 4);
          })
        ]);
      });
    });
    test("last factory should be the one getting called", () => {
      const factoryFactory = (n) => () => {
        return async.timeout(0).then(() => n);
      };
      const throttler = new async.Throttler();
      const promises = [];
      promises.push(
        throttler.queue(factoryFactory(1)).then((n) => {
          assert.strictEqual(n, 1);
        })
      );
      promises.push(
        throttler.queue(factoryFactory(2)).then((n) => {
          assert.strictEqual(n, 3);
        })
      );
      promises.push(
        throttler.queue(factoryFactory(3)).then((n) => {
          assert.strictEqual(n, 3);
        })
      );
      return Promise.all(promises);
    });
    test("disposal after queueing", async () => {
      let factoryCalls = 0;
      const factory = async () => {
        factoryCalls++;
        return async.timeout(0);
      };
      const throttler = new async.Throttler();
      const promises = [];
      promises.push(throttler.queue(factory));
      promises.push(throttler.queue(factory));
      throttler.dispose();
      await Promise.all(promises);
      assert.strictEqual(factoryCalls, 1);
    });
    test("disposal before queueing", async () => {
      let factoryCalls = 0;
      const factory = async () => {
        factoryCalls++;
        return async.timeout(0);
      };
      const throttler = new async.Throttler();
      const promises = [];
      throttler.dispose();
      promises.push(throttler.queue(factory));
      try {
        await Promise.all(promises);
        assert.fail("should fail");
      } catch (err) {
        assert.strictEqual(factoryCalls, 0);
      }
    });
  });
  suite("Delayer", () => {
    test("simple", () => {
      let count = 0;
      const factory = () => {
        return Promise.resolve(++count);
      };
      const delayer = new async.Delayer(0);
      const promises = [];
      assert(!delayer.isTriggered());
      promises.push(
        delayer.trigger(factory).then((result) => {
          assert.strictEqual(result, 1);
          assert(!delayer.isTriggered());
        })
      );
      assert(delayer.isTriggered());
      promises.push(
        delayer.trigger(factory).then((result) => {
          assert.strictEqual(result, 1);
          assert(!delayer.isTriggered());
        })
      );
      assert(delayer.isTriggered());
      promises.push(
        delayer.trigger(factory).then((result) => {
          assert.strictEqual(result, 1);
          assert(!delayer.isTriggered());
        })
      );
      assert(delayer.isTriggered());
      return Promise.all(promises).then(() => {
        assert(!delayer.isTriggered());
      });
    });
    test("microtask delay simple", () => {
      let count = 0;
      const factory = () => {
        return Promise.resolve(++count);
      };
      const delayer = new async.Delayer(MicrotaskDelay.MicrotaskDelay);
      const promises = [];
      assert(!delayer.isTriggered());
      promises.push(
        delayer.trigger(factory).then((result) => {
          assert.strictEqual(result, 1);
          assert(!delayer.isTriggered());
        })
      );
      assert(delayer.isTriggered());
      promises.push(
        delayer.trigger(factory).then((result) => {
          assert.strictEqual(result, 1);
          assert(!delayer.isTriggered());
        })
      );
      assert(delayer.isTriggered());
      promises.push(
        delayer.trigger(factory).then((result) => {
          assert.strictEqual(result, 1);
          assert(!delayer.isTriggered());
        })
      );
      assert(delayer.isTriggered());
      return Promise.all(promises).then(() => {
        assert(!delayer.isTriggered());
      });
    });
    suite("ThrottledDelayer", () => {
      test("promise should resolve if disposed", async () => {
        const throttledDelayer = new async.ThrottledDelayer(100);
        const promise = throttledDelayer.trigger(async () => {
        }, 0);
        throttledDelayer.dispose();
        try {
          await promise;
          assert.fail("SHOULD NOT BE HERE");
        } catch (err) {
        }
      });
      test("trigger after dispose throws", async () => {
        const throttledDelayer = new async.ThrottledDelayer(100);
        throttledDelayer.dispose();
        await assert.rejects(
          () => throttledDelayer.trigger(async () => {
          }, 0)
        );
      });
    });
    test("simple cancel", () => {
      let count = 0;
      const factory = () => {
        return Promise.resolve(++count);
      };
      const delayer = new async.Delayer(0);
      assert(!delayer.isTriggered());
      const p = delayer.trigger(factory).then(
        () => {
          assert(false);
        },
        () => {
          assert(true, "yes, it was cancelled");
        }
      );
      assert(delayer.isTriggered());
      delayer.cancel();
      assert(!delayer.isTriggered());
      return p;
    });
    test("simple cancel microtask", () => {
      let count = 0;
      const factory = () => {
        return Promise.resolve(++count);
      };
      const delayer = new async.Delayer(MicrotaskDelay.MicrotaskDelay);
      assert(!delayer.isTriggered());
      const p = delayer.trigger(factory).then(
        () => {
          assert(false);
        },
        () => {
          assert(true, "yes, it was cancelled");
        }
      );
      assert(delayer.isTriggered());
      delayer.cancel();
      assert(!delayer.isTriggered());
      return p;
    });
    test("cancel should cancel all calls to trigger", () => {
      let count = 0;
      const factory = () => {
        return Promise.resolve(++count);
      };
      const delayer = new async.Delayer(0);
      const promises = [];
      assert(!delayer.isTriggered());
      promises.push(
        delayer.trigger(factory).then(void 0, () => {
          assert(true, "yes, it was cancelled");
        })
      );
      assert(delayer.isTriggered());
      promises.push(
        delayer.trigger(factory).then(void 0, () => {
          assert(true, "yes, it was cancelled");
        })
      );
      assert(delayer.isTriggered());
      promises.push(
        delayer.trigger(factory).then(void 0, () => {
          assert(true, "yes, it was cancelled");
        })
      );
      assert(delayer.isTriggered());
      delayer.cancel();
      return Promise.all(promises).then(() => {
        assert(!delayer.isTriggered());
      });
    });
    test("trigger, cancel, then trigger again", () => {
      let count = 0;
      const factory = () => {
        return Promise.resolve(++count);
      };
      const delayer = new async.Delayer(0);
      let promises = [];
      assert(!delayer.isTriggered());
      const p = delayer.trigger(factory).then((result) => {
        assert.strictEqual(result, 1);
        assert(!delayer.isTriggered());
        promises.push(
          delayer.trigger(factory).then(void 0, () => {
            assert(true, "yes, it was cancelled");
          })
        );
        assert(delayer.isTriggered());
        promises.push(
          delayer.trigger(factory).then(void 0, () => {
            assert(true, "yes, it was cancelled");
          })
        );
        assert(delayer.isTriggered());
        delayer.cancel();
        const p2 = Promise.all(promises).then(() => {
          promises = [];
          assert(!delayer.isTriggered());
          promises.push(
            delayer.trigger(factory).then(() => {
              assert.strictEqual(result, 1);
              assert(!delayer.isTriggered());
            })
          );
          assert(delayer.isTriggered());
          promises.push(
            delayer.trigger(factory).then(() => {
              assert.strictEqual(result, 1);
              assert(!delayer.isTriggered());
            })
          );
          assert(delayer.isTriggered());
          const p3 = Promise.all(promises).then(() => {
            assert(!delayer.isTriggered());
          });
          assert(delayer.isTriggered());
          return p3;
        });
        return p2;
      });
      assert(delayer.isTriggered());
      return p;
    });
    test("last task should be the one getting called", () => {
      const factoryFactory = (n) => () => {
        return Promise.resolve(n);
      };
      const delayer = new async.Delayer(0);
      const promises = [];
      assert(!delayer.isTriggered());
      promises.push(
        delayer.trigger(factoryFactory(1)).then((n) => {
          assert.strictEqual(n, 3);
        })
      );
      promises.push(
        delayer.trigger(factoryFactory(2)).then((n) => {
          assert.strictEqual(n, 3);
        })
      );
      promises.push(
        delayer.trigger(factoryFactory(3)).then((n) => {
          assert.strictEqual(n, 3);
        })
      );
      const p = Promise.all(promises).then(() => {
        assert(!delayer.isTriggered());
      });
      assert(delayer.isTriggered());
      return p;
    });
  });
  suite("sequence", () => {
    test("simple", () => {
      const factoryFactory = (n) => () => {
        return Promise.resolve(n);
      };
      return async.sequence([
        factoryFactory(1),
        factoryFactory(2),
        factoryFactory(3),
        factoryFactory(4),
        factoryFactory(5)
      ]).then((result) => {
        assert.strictEqual(5, result.length);
        assert.strictEqual(1, result[0]);
        assert.strictEqual(2, result[1]);
        assert.strictEqual(3, result[2]);
        assert.strictEqual(4, result[3]);
        assert.strictEqual(5, result[4]);
      });
    });
  });
  suite("Limiter", () => {
    test("assert degree of paralellism", () => {
      let activePromises = 0;
      const factoryFactory = (n) => () => {
        activePromises++;
        assert(activePromises < 6);
        return async.timeout(0).then(() => {
          activePromises--;
          return n;
        });
      };
      const limiter = new async.Limiter(5);
      const promises = [];
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(
        (n) => promises.push(limiter.queue(factoryFactory(n)))
      );
      return Promise.all(promises).then((res) => {
        assert.strictEqual(10, res.length);
        assert.deepStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], res);
      });
    });
  });
  suite("Queue", () => {
    test("simple", () => {
      const queue = new async.Queue();
      let syncPromise = false;
      const f1 = () => Promise.resolve(true).then(() => syncPromise = true);
      let asyncPromise = false;
      const f2 = () => async.timeout(10).then(() => asyncPromise = true);
      assert.strictEqual(queue.size, 0);
      queue.queue(f1);
      assert.strictEqual(queue.size, 1);
      const p = queue.queue(f2);
      assert.strictEqual(queue.size, 2);
      return p.then(() => {
        assert.strictEqual(queue.size, 0);
        assert.ok(syncPromise);
        assert.ok(asyncPromise);
      });
    });
    test("stop processing on dispose", async () => {
      const queue = new async.Queue();
      let workCounter = 0;
      const task = async () => {
        await async.timeout(0);
        workCounter++;
        queue.dispose();
      };
      const p1 = queue.queue(task);
      queue.queue(task);
      queue.queue(task);
      assert.strictEqual(queue.size, 3);
      await p1;
      assert.strictEqual(workCounter, 1);
    });
    test("stop on clear", async () => {
      const queue = new async.Queue();
      let workCounter = 0;
      const task = async () => {
        await async.timeout(0);
        workCounter++;
        queue.clear();
        assert.strictEqual(queue.size, 1);
      };
      const p1 = queue.queue(task);
      queue.queue(task);
      queue.queue(task);
      assert.strictEqual(queue.size, 3);
      await p1;
      assert.strictEqual(workCounter, 1);
      assert.strictEqual(queue.size, 0);
      const p2 = queue.queue(task);
      await p2;
      assert.strictEqual(workCounter, 2);
    });
    test("clear and drain (1)", async () => {
      const queue = new async.Queue();
      let workCounter = 0;
      const task = async () => {
        await async.timeout(0);
        workCounter++;
        queue.clear();
      };
      const p0 = Event.toPromise(queue.onDrained);
      const p1 = queue.queue(task);
      await p1;
      await p0;
      assert.strictEqual(workCounter, 1);
      queue.dispose();
    });
    test("clear and drain (2)", async () => {
      const queue = new async.Queue();
      let didFire = false;
      const d = queue.onDrained(() => {
        didFire = true;
      });
      queue.clear();
      assert.strictEqual(didFire, false);
      d.dispose();
      queue.dispose();
    });
    test("drain timing", async () => {
      const queue = new async.Queue();
      const logicClock = new class {
        time = 0;
        tick() {
          return this.time++;
        }
      }();
      let didDrainTime = 0;
      let didFinishTime1 = 0;
      let didFinishTime2 = 0;
      const d = queue.onDrained(() => {
        didDrainTime = logicClock.tick();
      });
      const p1 = queue.queue(() => {
        didFinishTime1 = logicClock.tick();
        return Promise.resolve();
      });
      const p2 = queue.queue(async () => {
        await async.timeout(10);
        didFinishTime2 = logicClock.tick();
      });
      await Promise.all([p1, p2]);
      assert.strictEqual(didFinishTime1, 0);
      assert.strictEqual(didFinishTime2, 1);
      assert.strictEqual(didDrainTime, 2);
      d.dispose();
      queue.dispose();
    });
    test("drain event is send only once", async () => {
      const queue = new async.Queue();
      let drainCount = 0;
      const d = queue.onDrained(() => {
        drainCount++;
      });
      queue.queue(async () => {
      });
      queue.queue(async () => {
      });
      queue.queue(async () => {
      });
      queue.queue(async () => {
      });
      assert.strictEqual(drainCount, 0);
      assert.strictEqual(queue.size, 4);
      await queue.whenIdle();
      assert.strictEqual(drainCount, 1);
      d.dispose();
      queue.dispose();
    });
    test("order is kept", () => runWithFakedTimers({}, () => {
      const queue = new async.Queue();
      const res = [];
      const f1 = () => Promise.resolve(true).then(() => res.push(1));
      const f2 = () => async.timeout(10).then(() => res.push(2));
      const f3 = () => Promise.resolve(true).then(() => res.push(3));
      const f4 = () => async.timeout(20).then(() => res.push(4));
      const f5 = () => async.timeout(0).then(() => res.push(5));
      queue.queue(f1);
      queue.queue(f2);
      queue.queue(f3);
      queue.queue(f4);
      return queue.queue(f5).then(() => {
        assert.strictEqual(res[0], 1);
        assert.strictEqual(res[1], 2);
        assert.strictEqual(res[2], 3);
        assert.strictEqual(res[3], 4);
        assert.strictEqual(res[4], 5);
      });
    }));
    test("errors bubble individually but not cause stop", () => {
      const queue = new async.Queue();
      const res = [];
      let error = false;
      const f1 = () => Promise.resolve(true).then(() => res.push(1));
      const f2 = () => async.timeout(10).then(() => res.push(2));
      const f3 = () => Promise.resolve(true).then(
        () => Promise.reject(new Error("error"))
      );
      const f4 = () => async.timeout(20).then(() => res.push(4));
      const f5 = () => async.timeout(0).then(() => res.push(5));
      queue.queue(f1);
      queue.queue(f2);
      queue.queue(f3).then(void 0, () => error = true);
      queue.queue(f4);
      return queue.queue(f5).then(() => {
        assert.strictEqual(res[0], 1);
        assert.strictEqual(res[1], 2);
        assert.ok(error);
        assert.strictEqual(res[2], 4);
        assert.strictEqual(res[3], 5);
      });
    });
    test("order is kept (chained)", () => {
      const queue = new async.Queue();
      const res = [];
      const f1 = () => Promise.resolve(true).then(() => res.push(1));
      const f2 = () => async.timeout(10).then(() => res.push(2));
      const f3 = () => Promise.resolve(true).then(() => res.push(3));
      const f4 = () => async.timeout(20).then(() => res.push(4));
      const f5 = () => async.timeout(0).then(() => res.push(5));
      return queue.queue(f1).then(() => {
        return queue.queue(f2).then(() => {
          return queue.queue(f3).then(() => {
            return queue.queue(f4).then(() => {
              return queue.queue(f5).then(() => {
                assert.strictEqual(res[0], 1);
                assert.strictEqual(res[1], 2);
                assert.strictEqual(res[2], 3);
                assert.strictEqual(res[3], 4);
                assert.strictEqual(res[4], 5);
              });
            });
          });
        });
      });
    });
    test("events", async () => {
      const queue = new async.Queue();
      let drained = false;
      const onDrained = Event.toPromise(queue.onDrained).then(
        () => drained = true
      );
      const res = [];
      const f1 = () => async.timeout(10).then(() => res.push(2));
      const f2 = () => async.timeout(20).then(() => res.push(4));
      const f3 = () => async.timeout(0).then(() => res.push(5));
      const q1 = queue.queue(f1);
      const q2 = queue.queue(f2);
      queue.queue(f3);
      q1.then(() => {
        assert.ok(!drained);
        q2.then(() => {
          assert.ok(!drained);
        });
      });
      await onDrained;
      assert.ok(drained);
    });
  });
  suite("ResourceQueue", () => {
    test("simple", async () => {
      const queue = new async.ResourceQueue();
      await queue.whenDrained();
      let done1 = false;
      queue.queueFor(URI.file("/some/path"), async () => {
        done1 = true;
      });
      await queue.whenDrained();
      assert.strictEqual(done1, true);
      let done2 = false;
      queue.queueFor(URI.file("/some/other/path"), async () => {
        done2 = true;
      });
      await queue.whenDrained();
      assert.strictEqual(done2, true);
      const w1 = new async.DeferredPromise();
      queue.queueFor(URI.file("/some/path"), () => w1.p);
      let drained = false;
      queue.whenDrained().then(() => drained = true);
      assert.strictEqual(drained, false);
      await w1.complete();
      await async.timeout(0);
      assert.strictEqual(drained, true);
      const w2 = new async.DeferredPromise();
      const w3 = new async.DeferredPromise();
      queue.queueFor(URI.file("/some/path"), () => w2.p);
      queue.queueFor(URI.file("/some/other/path"), () => w3.p);
      drained = false;
      queue.whenDrained().then(() => drained = true);
      queue.dispose();
      await async.timeout(0);
      assert.strictEqual(drained, true);
    });
  });
  suite("retry", () => {
    test("success case", async () => {
      return runWithFakedTimers({ useFakeTimers: true }, async () => {
        let counter = 0;
        const res = await async.retry(
          () => {
            counter++;
            if (counter < 2) {
              return Promise.reject(new Error("fail"));
            }
            return Promise.resolve(true);
          },
          10,
          3
        );
        assert.strictEqual(res, true);
      });
    });
    test("error case", async () => {
      return runWithFakedTimers({ useFakeTimers: true }, async () => {
        const expectedError = new Error("fail");
        try {
          await async.retry(
            () => {
              return Promise.reject(expectedError);
            },
            10,
            3
          );
        } catch (error) {
          assert.strictEqual(error, error);
        }
      });
    });
  });
  suite("TaskSequentializer", () => {
    test("execution basics", async () => {
      const sequentializer = new async.TaskSequentializer();
      assert.ok(!sequentializer.isRunning());
      assert.ok(!sequentializer.hasQueued());
      assert.ok(!sequentializer.isRunning(2323));
      assert.ok(!sequentializer.running);
      await sequentializer.run(1, Promise.resolve());
      assert.ok(!sequentializer.isRunning());
      assert.ok(!sequentializer.isRunning(1));
      assert.ok(!sequentializer.running);
      assert.ok(!sequentializer.hasQueued());
      sequentializer.run(2, async.timeout(1));
      assert.ok(sequentializer.isRunning());
      assert.ok(sequentializer.isRunning(2));
      assert.ok(!sequentializer.hasQueued());
      assert.strictEqual(sequentializer.isRunning(1), false);
      assert.ok(sequentializer.running);
      await async.timeout(2);
      assert.strictEqual(sequentializer.isRunning(), false);
      assert.strictEqual(sequentializer.isRunning(2), false);
      assert.ok(!sequentializer.running);
    });
    test("executing and queued (finishes instantly)", async () => {
      const sequentializer = new async.TaskSequentializer();
      let pendingDone = false;
      sequentializer.run(
        1,
        async.timeout(1).then(() => {
          pendingDone = true;
          return;
        })
      );
      let queuedDone = false;
      const res = sequentializer.queue(
        () => Promise.resolve(null).then(() => {
          queuedDone = true;
          return;
        })
      );
      assert.ok(sequentializer.hasQueued());
      await res;
      assert.ok(pendingDone);
      assert.ok(queuedDone);
      assert.ok(!sequentializer.hasQueued());
    });
    test("executing and queued (finishes after timeout)", async () => {
      const sequentializer = new async.TaskSequentializer();
      let pendingDone = false;
      sequentializer.run(
        1,
        async.timeout(1).then(() => {
          pendingDone = true;
          return;
        })
      );
      let queuedDone = false;
      const res = sequentializer.queue(
        () => async.timeout(1).then(() => {
          queuedDone = true;
          return;
        })
      );
      await res;
      assert.ok(pendingDone);
      assert.ok(queuedDone);
      assert.ok(!sequentializer.hasQueued());
    });
    test("join (without executing or queued)", async () => {
      const sequentializer = new async.TaskSequentializer();
      await sequentializer.join();
      assert.ok(!sequentializer.hasQueued());
    });
    test("join (without queued)", async () => {
      const sequentializer = new async.TaskSequentializer();
      let pendingDone = false;
      sequentializer.run(
        1,
        async.timeout(1).then(() => {
          pendingDone = true;
          return;
        })
      );
      await sequentializer.join();
      assert.ok(pendingDone);
      assert.ok(!sequentializer.isRunning());
    });
    test("join (with executing and queued)", async () => {
      const sequentializer = new async.TaskSequentializer();
      let pendingDone = false;
      sequentializer.run(
        1,
        async.timeout(1).then(() => {
          pendingDone = true;
          return;
        })
      );
      let queuedDone = false;
      sequentializer.queue(
        () => async.timeout(1).then(() => {
          queuedDone = true;
          return;
        })
      );
      await sequentializer.join();
      assert.ok(pendingDone);
      assert.ok(queuedDone);
      assert.ok(!sequentializer.isRunning());
      assert.ok(!sequentializer.hasQueued());
    });
    test("executing and multiple queued (last one wins)", async () => {
      const sequentializer = new async.TaskSequentializer();
      let pendingDone = false;
      sequentializer.run(
        1,
        async.timeout(1).then(() => {
          pendingDone = true;
          return;
        })
      );
      let firstDone = false;
      const firstRes = sequentializer.queue(
        () => async.timeout(2).then(() => {
          firstDone = true;
          return;
        })
      );
      let secondDone = false;
      const secondRes = sequentializer.queue(
        () => async.timeout(3).then(() => {
          secondDone = true;
          return;
        })
      );
      let thirdDone = false;
      const thirdRes = sequentializer.queue(
        () => async.timeout(4).then(() => {
          thirdDone = true;
          return;
        })
      );
      await Promise.all([firstRes, secondRes, thirdRes]);
      assert.ok(pendingDone);
      assert.ok(!firstDone);
      assert.ok(!secondDone);
      assert.ok(thirdDone);
    });
    test("cancel executing", async () => {
      const sequentializer = new async.TaskSequentializer();
      const ctsTimeout = store.add(new CancellationTokenSource());
      let pendingCancelled = false;
      const timeout = async.timeout(1, ctsTimeout.token);
      sequentializer.run(1, timeout, () => pendingCancelled = true);
      sequentializer.cancelRunning();
      assert.ok(pendingCancelled);
      ctsTimeout.cancel();
    });
  });
  suite("disposableTimeout", () => {
    test("handler only success", async () => {
      let cb = false;
      const t = async.disposableTimeout(() => cb = true);
      await async.timeout(0);
      assert.strictEqual(cb, true);
      t.dispose();
    });
    test("handler only cancel", async () => {
      let cb = false;
      const t = async.disposableTimeout(() => cb = true);
      t.dispose();
      await async.timeout(0);
      assert.strictEqual(cb, false);
    });
    test("store managed success", async () => {
      let cb = false;
      const s = new DisposableStore();
      async.disposableTimeout(() => cb = true, 0, s);
      await async.timeout(0);
      assert.strictEqual(cb, true);
      s.dispose();
    });
    test("store managed cancel via disposable", async () => {
      let cb = false;
      const s = new DisposableStore();
      const t = async.disposableTimeout(() => cb = true, 0, s);
      t.dispose();
      await async.timeout(0);
      assert.strictEqual(cb, false);
      s.dispose();
    });
    test("store managed cancel via store", async () => {
      let cb = false;
      const s = new DisposableStore();
      async.disposableTimeout(() => cb = true, 0, s);
      s.dispose();
      await async.timeout(0);
      assert.strictEqual(cb, false);
    });
  });
  test("raceCancellation", async () => {
    const cts = store.add(new CancellationTokenSource());
    const ctsTimeout = store.add(new CancellationTokenSource());
    let triggered = false;
    const timeout = async.timeout(100, ctsTimeout.token);
    const p = async.raceCancellation(
      timeout.then(() => triggered = true),
      cts.token
    );
    cts.cancel();
    await p;
    assert.ok(!triggered);
    ctsTimeout.cancel();
  });
  test("raceTimeout", async () => {
    const cts = store.add(new CancellationTokenSource());
    let timedout = false;
    let triggered = false;
    const ctsTimeout1 = store.add(new CancellationTokenSource());
    const timeout1 = async.timeout(100, ctsTimeout1.token);
    const p1 = async.raceTimeout(
      timeout1.then(() => triggered = true),
      1,
      () => timedout = true
    );
    cts.cancel();
    await p1;
    assert.ok(!triggered);
    assert.strictEqual(timedout, true);
    ctsTimeout1.cancel();
    timedout = false;
    const ctsTimeout2 = store.add(new CancellationTokenSource());
    const timeout2 = async.timeout(1, ctsTimeout2.token);
    const p2 = async.raceTimeout(
      timeout2.then(() => triggered = true),
      100,
      () => timedout = true
    );
    cts.cancel();
    await p2;
    assert.ok(triggered);
    assert.strictEqual(timedout, false);
    ctsTimeout2.cancel();
  });
  test("SequencerByKey", async () => {
    const s = new async.SequencerByKey();
    const r1 = await s.queue("key1", () => Promise.resolve("hello"));
    assert.strictEqual(r1, "hello");
    await s.queue("key2", () => Promise.reject(new Error("failed"))).then(
      () => {
        throw new Error("should not be resolved");
      },
      (err) => {
        assert.strictEqual(err.message, "failed");
      }
    );
    const r3 = await s.queue("key2", () => Promise.resolve("hello"));
    assert.strictEqual(r3, "hello");
  });
  test("IntervalCounter", async () => {
    let now = 0;
    const counter = new async.IntervalCounter(5, () => now);
    assert.strictEqual(counter.increment(), 1);
    assert.strictEqual(counter.increment(), 2);
    assert.strictEqual(counter.increment(), 3);
    now = 10;
    assert.strictEqual(counter.increment(), 1);
    assert.strictEqual(counter.increment(), 2);
    assert.strictEqual(counter.increment(), 3);
  });
  suite("firstParallel", () => {
    test("simple", async () => {
      const a = await async.firstParallel(
        [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)],
        (v) => v === 2
      );
      assert.strictEqual(a, 2);
    });
    test("uses null default", async () => {
      assert.strictEqual(
        await async.firstParallel([Promise.resolve(1)], (v) => v === 2),
        null
      );
    });
    test("uses value default", async () => {
      assert.strictEqual(
        await async.firstParallel(
          [Promise.resolve(1)],
          (v) => v === 2,
          4
        ),
        4
      );
    });
    test("empty", async () => {
      assert.strictEqual(
        await async.firstParallel([], (v) => v === 2, 4),
        4
      );
    });
    test("cancels", async () => {
      let ct1;
      const p1 = async.createCancelablePromise(async (ct) => {
        ct1 = ct;
        await async.timeout(200, ct);
        return 1;
      });
      let ct2;
      const p2 = async.createCancelablePromise(async (ct) => {
        ct2 = ct;
        await async.timeout(2, ct);
        return 2;
      });
      assert.strictEqual(
        await async.firstParallel([p1, p2], (v) => v === 2, 4),
        2
      );
      assert.strictEqual(
        ct1.isCancellationRequested,
        true,
        "should cancel a"
      );
      assert.strictEqual(
        ct2.isCancellationRequested,
        true,
        "should cancel b"
      );
    });
    test("rejection handling", async () => {
      let ct1;
      const p1 = async.createCancelablePromise(async (ct) => {
        ct1 = ct;
        await async.timeout(200, ct);
        return 1;
      });
      let ct2;
      const p2 = async.createCancelablePromise(async (ct) => {
        ct2 = ct;
        await async.timeout(2, ct);
        throw new Error("oh no");
      });
      assert.strictEqual(
        await async.firstParallel([p1, p2], (v) => v === 2, 4).catch(() => "ok"),
        "ok"
      );
      assert.strictEqual(
        ct1.isCancellationRequested,
        true,
        "should cancel a"
      );
      assert.strictEqual(
        ct2.isCancellationRequested,
        true,
        "should cancel b"
      );
    });
  });
  suite("DeferredPromise", () => {
    test("resolves", async () => {
      const deferred = new async.DeferredPromise();
      assert.strictEqual(deferred.isResolved, false);
      deferred.complete(42);
      assert.strictEqual(await deferred.p, 42);
      assert.strictEqual(deferred.isResolved, true);
    });
    test("rejects", async () => {
      const deferred = new async.DeferredPromise();
      assert.strictEqual(deferred.isRejected, false);
      const err = new Error("oh no!");
      deferred.error(err);
      assert.strictEqual(await deferred.p.catch((e) => e), err);
      assert.strictEqual(deferred.isRejected, true);
    });
    test("cancels", async () => {
      const deferred = new async.DeferredPromise();
      assert.strictEqual(deferred.isRejected, false);
      deferred.cancel();
      assert.strictEqual(
        (await deferred.p.catch((e) => e)).name,
        "Canceled"
      );
      assert.strictEqual(deferred.isRejected, true);
    });
  });
  suite("Promises.settled", () => {
    test("resolves", async () => {
      const p1 = Promise.resolve(1);
      const p2 = async.timeout(1).then(() => 2);
      const p3 = async.timeout(2).then(() => 3);
      const result = await async.Promises.settled([p1, p2, p3]);
      assert.strictEqual(result.length, 3);
      assert.deepStrictEqual(result[0], 1);
      assert.deepStrictEqual(result[1], 2);
      assert.deepStrictEqual(result[2], 3);
    });
    test("resolves in order", async () => {
      const p1 = async.timeout(2).then(() => 1);
      const p2 = async.timeout(1).then(() => 2);
      const p3 = Promise.resolve(3);
      const result = await async.Promises.settled([p1, p2, p3]);
      assert.strictEqual(result.length, 3);
      assert.deepStrictEqual(result[0], 1);
      assert.deepStrictEqual(result[1], 2);
      assert.deepStrictEqual(result[2], 3);
    });
    test("rejects with first error but handles all promises (all errors)", async () => {
      const p1 = Promise.reject(1);
      let p2Handled = false;
      const p2Error = new Error("2");
      const p2 = async.timeout(1).then(() => {
        p2Handled = true;
        throw p2Error;
      });
      let p3Handled = false;
      const p3Error = new Error("3");
      const p3 = async.timeout(2).then(() => {
        p3Handled = true;
        throw p3Error;
      });
      let error;
      try {
        await async.Promises.settled([p1, p2, p3]);
      } catch (e) {
        error = e;
      }
      assert.ok(error);
      assert.notStrictEqual(error, p2Error);
      assert.notStrictEqual(error, p3Error);
      assert.ok(p2Handled);
      assert.ok(p3Handled);
    });
    test("rejects with first error but handles all promises (1 error)", async () => {
      const p1 = Promise.resolve(1);
      let p2Handled = false;
      const p2Error = new Error("2");
      const p2 = async.timeout(1).then(() => {
        p2Handled = true;
        throw p2Error;
      });
      let p3Handled = false;
      const p3 = async.timeout(2).then(() => {
        p3Handled = true;
        return 3;
      });
      let error;
      try {
        await async.Promises.settled([p1, p2, p3]);
      } catch (e) {
        error = e;
      }
      assert.strictEqual(error, p2Error);
      assert.ok(p2Handled);
      assert.ok(p3Handled);
    });
  });
  suite("Promises.withAsyncBody", () => {
    test("basics", async () => {
      const p1 = async.Promises.withAsyncBody(async (resolve, reject) => {
        resolve(1);
      });
      const p2 = async.Promises.withAsyncBody(async (resolve, reject) => {
        reject(new Error("error"));
      });
      const p3 = async.Promises.withAsyncBody(async (resolve, reject) => {
        throw new Error("error");
      });
      const r1 = await p1;
      assert.strictEqual(r1, 1);
      let e2;
      try {
        await p2;
      } catch (error) {
        e2 = error;
      }
      assert.ok(e2 instanceof Error);
      let e3;
      try {
        await p3;
      } catch (error) {
        e3 = error;
      }
      assert.ok(e3 instanceof Error);
    });
  });
  suite("ThrottledWorker", () => {
    function assertArrayEquals(actual, expected) {
      assert.strictEqual(actual.length, expected.length);
      for (let i = 0; i < actual.length; i++) {
        assert.strictEqual(actual[i], expected[i]);
      }
    }
    test("basics", async () => {
      let handled = [];
      let handledCallback;
      let handledPromise = new Promise(
        (resolve) => handledCallback = resolve
      );
      let handledCounterToResolve = 1;
      let currentHandledCounter = 0;
      const handler = (units) => {
        handled.push(...units);
        currentHandledCounter++;
        if (currentHandledCounter === handledCounterToResolve) {
          handledCallback();
          handledPromise = new Promise(
            (resolve) => handledCallback = resolve
          );
          currentHandledCounter = 0;
        }
      };
      const worker = store.add(
        new async.ThrottledWorker(
          {
            maxWorkChunkSize: 5,
            maxBufferedWork: void 0,
            throttleDelay: 1
          },
          handler
        )
      );
      let worked = worker.work([1, 2, 3]);
      assertArrayEquals(handled, [1, 2, 3]);
      assert.strictEqual(worker.pending, 0);
      assert.strictEqual(worked, true);
      worker.work([4, 5]);
      worked = worker.work([6]);
      assertArrayEquals(handled, [1, 2, 3, 4, 5, 6]);
      assert.strictEqual(worker.pending, 0);
      assert.strictEqual(worked, true);
      handled = [];
      handledCounterToResolve = 2;
      worked = worker.work([1, 2, 3, 4, 5, 6, 7]);
      assertArrayEquals(handled, [1, 2, 3, 4, 5]);
      assert.strictEqual(worker.pending, 2);
      assert.strictEqual(worked, true);
      await handledPromise;
      assertArrayEquals(handled, [1, 2, 3, 4, 5, 6, 7]);
      handled = [];
      handledCounterToResolve = 4;
      worked = worker.work([
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19
      ]);
      assertArrayEquals(handled, [1, 2, 3, 4, 5]);
      assert.strictEqual(worker.pending, 14);
      assert.strictEqual(worked, true);
      await handledPromise;
      assertArrayEquals(
        handled,
        [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19
        ]
      );
      handled = [];
      handledCounterToResolve = 2;
      worked = worker.work([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      assertArrayEquals(handled, [1, 2, 3, 4, 5]);
      assert.strictEqual(worker.pending, 5);
      assert.strictEqual(worked, true);
      await handledPromise;
      assertArrayEquals(handled, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      handled = [];
      handledCounterToResolve = 3;
      worked = worker.work([1, 2, 3, 4, 5, 6, 7]);
      assertArrayEquals(handled, [1, 2, 3, 4, 5]);
      assert.strictEqual(worker.pending, 2);
      assert.strictEqual(worked, true);
      worker.work([8]);
      worked = worker.work([9, 10, 11]);
      assertArrayEquals(handled, [1, 2, 3, 4, 5]);
      assert.strictEqual(worker.pending, 6);
      assert.strictEqual(worked, true);
      await handledPromise;
      assertArrayEquals(handled, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
      assert.strictEqual(worker.pending, 0);
      handled = [];
      handledCounterToResolve = 2;
      worked = worker.work([1, 2, 3, 4, 5, 6, 7]);
      assertArrayEquals(handled, [1, 2, 3, 4, 5]);
      assert.strictEqual(worked, true);
      worker.work([8]);
      worked = worker.work([9, 10]);
      assertArrayEquals(handled, [1, 2, 3, 4, 5]);
      assert.strictEqual(worked, true);
      await handledPromise;
      assertArrayEquals(handled, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
    test("do not accept too much work", async () => {
      const handled = [];
      const handler = (units) => handled.push(...units);
      const worker = store.add(
        new async.ThrottledWorker(
          {
            maxWorkChunkSize: 5,
            maxBufferedWork: 5,
            throttleDelay: 1
          },
          handler
        )
      );
      let worked = worker.work([1, 2, 3]);
      assert.strictEqual(worked, true);
      worked = worker.work([1, 2, 3, 4, 5, 6]);
      assert.strictEqual(worked, true);
      assert.strictEqual(worker.pending, 1);
      worked = worker.work([7]);
      assert.strictEqual(worked, true);
      assert.strictEqual(worker.pending, 2);
      worked = worker.work([8, 9, 10, 11]);
      assert.strictEqual(worked, false);
      assert.strictEqual(worker.pending, 2);
    });
    test("do not accept too much work (account for max chunk size", async () => {
      const handled = [];
      const handler = (units) => handled.push(...units);
      const worker = store.add(
        new async.ThrottledWorker(
          {
            maxWorkChunkSize: 5,
            maxBufferedWork: 5,
            throttleDelay: 1
          },
          handler
        )
      );
      let worked = worker.work([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
      assert.strictEqual(worked, false);
      assert.strictEqual(worker.pending, 0);
      worked = worker.work([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      assert.strictEqual(worked, true);
      assert.strictEqual(worker.pending, 5);
    });
    test("disposed", async () => {
      const handled = [];
      const handler = (units) => handled.push(...units);
      const worker = store.add(
        new async.ThrottledWorker(
          {
            maxWorkChunkSize: 5,
            maxBufferedWork: void 0,
            throttleDelay: 1
          },
          handler
        )
      );
      worker.dispose();
      const worked = worker.work([1, 2, 3]);
      assertArrayEquals(handled, []);
      assert.strictEqual(worker.pending, 0);
      assert.strictEqual(worked, false);
    });
  });
  suite("LimitedQueue", () => {
    test("basics (with long running task)", async () => {
      const limitedQueue = new async.LimitedQueue();
      let counter = 0;
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          limitedQueue.queue(async () => {
            counter = i;
            await async.timeout(1);
          })
        );
      }
      await Promise.all(promises);
      assert.strictEqual(counter, 4);
    });
    test("basics (with sync running task)", async () => {
      const limitedQueue = new async.LimitedQueue();
      let counter = 0;
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          limitedQueue.queue(async () => {
            counter = i;
          })
        );
      }
      await Promise.all(promises);
      assert.strictEqual(counter, 4);
    });
  });
  suite("AsyncIterableObject", () => {
    test("onReturn NOT called", async () => {
      let calledOnReturn = false;
      const iter = new async.AsyncIterableObject(
        (writer) => {
          writer.emitMany([1, 2, 3, 4, 5]);
        },
        () => {
          calledOnReturn = true;
        }
      );
      for await (const item of iter) {
        assert.strictEqual(typeof item, "number");
      }
      assert.strictEqual(calledOnReturn, false);
    });
    test("onReturn called on break", async () => {
      let calledOnReturn = false;
      const iter = new async.AsyncIterableObject(
        (writer) => {
          writer.emitMany([1, 2, 3, 4, 5]);
        },
        () => {
          calledOnReturn = true;
        }
      );
      for await (const item of iter) {
        assert.strictEqual(item, 1);
        break;
      }
      assert.strictEqual(calledOnReturn, true);
    });
    test("onReturn called on return", async () => {
      let calledOnReturn = false;
      const iter = new async.AsyncIterableObject(
        (writer) => {
          writer.emitMany([1, 2, 3, 4, 5]);
        },
        () => {
          calledOnReturn = true;
        }
      );
      await async function test2() {
        for await (const item of iter) {
          assert.strictEqual(item, 1);
          return;
        }
      }();
      assert.strictEqual(calledOnReturn, true);
    });
    test("onReturn called on throwing", async () => {
      let calledOnReturn = false;
      const iter = new async.AsyncIterableObject(
        (writer) => {
          writer.emitMany([1, 2, 3, 4, 5]);
        },
        () => {
          calledOnReturn = true;
        }
      );
      try {
        for await (const item of iter) {
          assert.strictEqual(item, 1);
          throw new Error();
        }
      } catch (e) {
      }
      assert.strictEqual(calledOnReturn, true);
    });
  });
  suite("AsyncIterableSource", () => {
    test("onReturn is wired up", async () => {
      let calledOnReturn = false;
      const source = new async.AsyncIterableSource(() => {
        calledOnReturn = true;
      });
      source.emitOne(1);
      source.emitOne(2);
      source.emitOne(3);
      source.resolve();
      for await (const item of source.asyncIterable) {
        assert.strictEqual(item, 1);
        break;
      }
      assert.strictEqual(calledOnReturn, true);
    });
    test("onReturn is wired up 2", async () => {
      let calledOnReturn = false;
      const source = new async.AsyncIterableSource(() => {
        calledOnReturn = true;
      });
      source.emitOne(1);
      source.emitOne(2);
      source.emitOne(3);
      source.resolve();
      for await (const item of source.asyncIterable) {
        assert.strictEqual(typeof item, "number");
      }
      assert.strictEqual(calledOnReturn, false);
    });
  });
});
