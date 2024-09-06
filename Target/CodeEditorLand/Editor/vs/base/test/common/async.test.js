import t from"assert";import*as i from"../../common/async.js";import*as w from"../../common/symbols.js";import{CancellationTokenSource as m}from"../../common/cancellation.js";import{isCancellationError as y}from"../../common/errors.js";import{Event as g}from"../../common/event.js";import{URI as h}from"../../common/uri.js";import{runWithFakedTimers as f}from"./timeTravelScheduler.js";import{ensureNoDisposablesAreLeakedInTestSuite as k}from"./utils.js";import{DisposableStore as p}from"../../common/lifecycle.js";suite("Async",()=>{const d=k();suite("cancelablePromise",function(){test("set token, don't wait for inner promise",function(){let e=0;const r=i.createCancelablePromise(s=>(d.add(s.onCancellationRequested(a=>{e+=1})),new Promise(a=>{}))),n=r.then(s=>t.ok(!1),s=>{t.strictEqual(e,1),t.ok(y(s))});return r.cancel(),r.cancel(),n}),test("cancel despite inner promise being resolved",function(){let e=0;const r=i.createCancelablePromise(s=>(d.add(s.onCancellationRequested(a=>{e+=1})),Promise.resolve(1234))),n=r.then(s=>t.ok(!1),s=>{t.strictEqual(e,1),t.ok(y(s))});return r.cancel(),n}),test("execution order (sync)",function(){const e=[],r=i.createCancelablePromise(s=>(e.push("in callback"),d.add(s.onCancellationRequested(a=>e.push("cancelled"))),Promise.resolve(1234)));e.push("afterCreate");const n=r.then(void 0,s=>null).then(()=>e.push("finally"));return r.cancel(),e.push("afterCancel"),n.then(()=>t.deepStrictEqual(e,["in callback","afterCreate","cancelled","afterCancel","finally"]))}),test("execution order (async)",function(){const e=[],r=i.createCancelablePromise(s=>(e.push("in callback"),d.add(s.onCancellationRequested(a=>e.push("cancelled"))),new Promise(a=>setTimeout(a.bind(1234),0))));e.push("afterCreate");const n=r.then(void 0,s=>null).then(()=>e.push("finally"));return r.cancel(),e.push("afterCancel"),n.then(()=>t.deepStrictEqual(e,["in callback","afterCreate","cancelled","afterCancel","finally"]))}),test("execution order (async with late listener)",async function(){const e=[],r=i.createCancelablePromise(async s=>{e.push("in callback"),await i.timeout(0),d.add(s.onCancellationRequested(a=>e.push("cancelled"))),r.cancel(),e.push("afterCancel")});return e.push("afterCreate"),r.then(void 0,s=>null).then(()=>e.push("finally")).then(()=>t.deepStrictEqual(e,["in callback","afterCreate","cancelled","afterCancel","finally"]))}),test("get inner result",async function(){const r=await i.createCancelablePromise(n=>i.timeout(12).then(s=>1234));t.strictEqual(r,1234)})}),suite("Throttler",function(){test("non async",function(){let e=0;const r=()=>Promise.resolve(++e),n=new i.Throttler;return Promise.all([n.queue(r).then(s=>{t.strictEqual(s,1)}),n.queue(r).then(s=>{t.strictEqual(s,2)}),n.queue(r).then(s=>{t.strictEqual(s,2)}),n.queue(r).then(s=>{t.strictEqual(s,2)}),n.queue(r).then(s=>{t.strictEqual(s,2)})]).then(()=>t.strictEqual(e,2))}),test("async",()=>{let e=0;const r=()=>i.timeout(0).then(()=>++e),n=new i.Throttler;return Promise.all([n.queue(r).then(s=>{t.strictEqual(s,1)}),n.queue(r).then(s=>{t.strictEqual(s,2)}),n.queue(r).then(s=>{t.strictEqual(s,2)}),n.queue(r).then(s=>{t.strictEqual(s,2)}),n.queue(r).then(s=>{t.strictEqual(s,2)})]).then(()=>Promise.all([n.queue(r).then(s=>{t.strictEqual(s,3)}),n.queue(r).then(s=>{t.strictEqual(s,4)}),n.queue(r).then(s=>{t.strictEqual(s,4)}),n.queue(r).then(s=>{t.strictEqual(s,4)}),n.queue(r).then(s=>{t.strictEqual(s,4)})]))}),test("last factory should be the one getting called",function(){const e=s=>()=>i.timeout(0).then(()=>s),r=new i.Throttler,n=[];return n.push(r.queue(e(1)).then(s=>{t.strictEqual(s,1)})),n.push(r.queue(e(2)).then(s=>{t.strictEqual(s,3)})),n.push(r.queue(e(3)).then(s=>{t.strictEqual(s,3)})),Promise.all(n)}),test("disposal after queueing",async()=>{let e=0;const r=async()=>(e++,i.timeout(0)),n=new i.Throttler,s=[];s.push(n.queue(r)),s.push(n.queue(r)),n.dispose(),await Promise.all(s),t.strictEqual(e,1)}),test("disposal before queueing",async()=>{let e=0;const r=async()=>(e++,i.timeout(0)),n=new i.Throttler,s=[];n.dispose(),s.push(n.queue(r));try{await Promise.all(s),t.fail("should fail")}catch{t.strictEqual(e,0)}})}),suite("Delayer",function(){test("simple",()=>{let e=0;const r=()=>Promise.resolve(++e),n=new i.Delayer(0),s=[];return t(!n.isTriggered()),s.push(n.trigger(r).then(a=>{t.strictEqual(a,1),t(!n.isTriggered())})),t(n.isTriggered()),s.push(n.trigger(r).then(a=>{t.strictEqual(a,1),t(!n.isTriggered())})),t(n.isTriggered()),s.push(n.trigger(r).then(a=>{t.strictEqual(a,1),t(!n.isTriggered())})),t(n.isTriggered()),Promise.all(s).then(()=>{t(!n.isTriggered())})}),test("microtask delay simple",()=>{let e=0;const r=()=>Promise.resolve(++e),n=new i.Delayer(w.MicrotaskDelay),s=[];return t(!n.isTriggered()),s.push(n.trigger(r).then(a=>{t.strictEqual(a,1),t(!n.isTriggered())})),t(n.isTriggered()),s.push(n.trigger(r).then(a=>{t.strictEqual(a,1),t(!n.isTriggered())})),t(n.isTriggered()),s.push(n.trigger(r).then(a=>{t.strictEqual(a,1),t(!n.isTriggered())})),t(n.isTriggered()),Promise.all(s).then(()=>{t(!n.isTriggered())})}),suite("ThrottledDelayer",()=>{test("promise should resolve if disposed",async()=>{const e=new i.ThrottledDelayer(100),r=e.trigger(async()=>{},0);e.dispose();try{await r,t.fail("SHOULD NOT BE HERE")}catch{}}),test("trigger after dispose throws",async()=>{const e=new i.ThrottledDelayer(100);e.dispose(),await t.rejects(()=>e.trigger(async()=>{},0))})}),test("simple cancel",function(){let e=0;const r=()=>Promise.resolve(++e),n=new i.Delayer(0);t(!n.isTriggered());const s=n.trigger(r).then(()=>{t(!1)},()=>{t(!0,"yes, it was cancelled")});return t(n.isTriggered()),n.cancel(),t(!n.isTriggered()),s}),test("simple cancel microtask",function(){let e=0;const r=()=>Promise.resolve(++e),n=new i.Delayer(w.MicrotaskDelay);t(!n.isTriggered());const s=n.trigger(r).then(()=>{t(!1)},()=>{t(!0,"yes, it was cancelled")});return t(n.isTriggered()),n.cancel(),t(!n.isTriggered()),s}),test("cancel should cancel all calls to trigger",function(){let e=0;const r=()=>Promise.resolve(++e),n=new i.Delayer(0),s=[];return t(!n.isTriggered()),s.push(n.trigger(r).then(void 0,()=>{t(!0,"yes, it was cancelled")})),t(n.isTriggered()),s.push(n.trigger(r).then(void 0,()=>{t(!0,"yes, it was cancelled")})),t(n.isTriggered()),s.push(n.trigger(r).then(void 0,()=>{t(!0,"yes, it was cancelled")})),t(n.isTriggered()),n.cancel(),Promise.all(s).then(()=>{t(!n.isTriggered())})}),test("trigger, cancel, then trigger again",function(){let e=0;const r=()=>Promise.resolve(++e),n=new i.Delayer(0);let s=[];t(!n.isTriggered());const a=n.trigger(r).then(o=>(t.strictEqual(o,1),t(!n.isTriggered()),s.push(n.trigger(r).then(void 0,()=>{t(!0,"yes, it was cancelled")})),t(n.isTriggered()),s.push(n.trigger(r).then(void 0,()=>{t(!0,"yes, it was cancelled")})),t(n.isTriggered()),n.cancel(),Promise.all(s).then(()=>{s=[],t(!n.isTriggered()),s.push(n.trigger(r).then(()=>{t.strictEqual(o,1),t(!n.isTriggered())})),t(n.isTriggered()),s.push(n.trigger(r).then(()=>{t.strictEqual(o,1),t(!n.isTriggered())})),t(n.isTriggered());const u=Promise.all(s).then(()=>{t(!n.isTriggered())});return t(n.isTriggered()),u})));return t(n.isTriggered()),a}),test("last task should be the one getting called",function(){const e=a=>()=>Promise.resolve(a),r=new i.Delayer(0),n=[];t(!r.isTriggered()),n.push(r.trigger(e(1)).then(a=>{t.strictEqual(a,3)})),n.push(r.trigger(e(2)).then(a=>{t.strictEqual(a,3)})),n.push(r.trigger(e(3)).then(a=>{t.strictEqual(a,3)}));const s=Promise.all(n).then(()=>{t(!r.isTriggered())});return t(r.isTriggered()),s})}),suite("sequence",()=>{test("simple",()=>{const e=r=>()=>Promise.resolve(r);return i.sequence([e(1),e(2),e(3),e(4),e(5)]).then(r=>{t.strictEqual(5,r.length),t.strictEqual(1,r[0]),t.strictEqual(2,r[1]),t.strictEqual(3,r[2]),t.strictEqual(4,r[3]),t.strictEqual(5,r[4])})})}),suite("Limiter",()=>{test("assert degree of paralellism",function(){let e=0;const r=a=>()=>(e++,t(e<6),i.timeout(0).then(()=>(e--,a))),n=new i.Limiter(5),s=[];return[0,1,2,3,4,5,6,7,8,9].forEach(a=>s.push(n.queue(r(a)))),Promise.all(s).then(a=>{t.strictEqual(10,a.length),t.deepStrictEqual([0,1,2,3,4,5,6,7,8,9],a)})})}),suite("Queue",()=>{test("simple",function(){const e=new i.Queue;let r=!1;const n=()=>Promise.resolve(!0).then(()=>r=!0);let s=!1;const a=()=>i.timeout(10).then(()=>s=!0);t.strictEqual(e.size,0),e.queue(n),t.strictEqual(e.size,1);const o=e.queue(a);return t.strictEqual(e.size,2),o.then(()=>{t.strictEqual(e.size,0),t.ok(r),t.ok(s)})}),test("stop processing on dispose",async function(){const e=new i.Queue;let r=0;const n=async()=>{await i.timeout(0),r++,e.dispose()},s=e.queue(n);e.queue(n),e.queue(n),t.strictEqual(e.size,3),await s,t.strictEqual(r,1)}),test("stop on clear",async function(){const e=new i.Queue;let r=0;const n=async()=>{await i.timeout(0),r++,e.clear(),t.strictEqual(e.size,1)},s=e.queue(n);e.queue(n),e.queue(n),t.strictEqual(e.size,3),await s,t.strictEqual(r,1),t.strictEqual(e.size,0),await e.queue(n),t.strictEqual(r,2)}),test("clear and drain (1)",async function(){const e=new i.Queue;let r=0;const n=async()=>{await i.timeout(0),r++,e.clear()},s=g.toPromise(e.onDrained);await e.queue(n),await s,t.strictEqual(r,1),e.dispose()}),test("clear and drain (2)",async function(){const e=new i.Queue;let r=!1;const n=e.onDrained(()=>{r=!0});e.clear(),t.strictEqual(r,!1),n.dispose(),e.dispose()}),test("drain timing",async function(){const e=new i.Queue,r=new class{time=0;tick(){return this.time++}};let n=0,s=0,a=0;const o=e.onDrained(()=>{n=r.tick()}),c=e.queue(()=>(s=r.tick(),Promise.resolve())),u=e.queue(async()=>{await i.timeout(10),a=r.tick()});await Promise.all([c,u]),t.strictEqual(s,0),t.strictEqual(a,1),t.strictEqual(n,2),o.dispose(),e.dispose()}),test("drain event is send only once",async function(){const e=new i.Queue;let r=0;const n=e.onDrained(()=>{r++});e.queue(async()=>{}),e.queue(async()=>{}),e.queue(async()=>{}),e.queue(async()=>{}),t.strictEqual(r,0),t.strictEqual(e.size,4),await e.whenIdle(),t.strictEqual(r,1),n.dispose(),e.dispose()}),test("order is kept",function(){return f({},()=>{const e=new i.Queue,r=[],n=()=>Promise.resolve(!0).then(()=>r.push(1)),s=()=>i.timeout(10).then(()=>r.push(2)),a=()=>Promise.resolve(!0).then(()=>r.push(3)),o=()=>i.timeout(20).then(()=>r.push(4)),c=()=>i.timeout(0).then(()=>r.push(5));return e.queue(n),e.queue(s),e.queue(a),e.queue(o),e.queue(c).then(()=>{t.strictEqual(r[0],1),t.strictEqual(r[1],2),t.strictEqual(r[2],3),t.strictEqual(r[3],4),t.strictEqual(r[4],5)})})}),test("errors bubble individually but not cause stop",function(){const e=new i.Queue,r=[];let n=!1;const s=()=>Promise.resolve(!0).then(()=>r.push(1)),a=()=>i.timeout(10).then(()=>r.push(2)),o=()=>Promise.resolve(!0).then(()=>Promise.reject(new Error("error"))),c=()=>i.timeout(20).then(()=>r.push(4)),u=()=>i.timeout(0).then(()=>r.push(5));return e.queue(s),e.queue(a),e.queue(o).then(void 0,()=>n=!0),e.queue(c),e.queue(u).then(()=>{t.strictEqual(r[0],1),t.strictEqual(r[1],2),t.ok(n),t.strictEqual(r[2],4),t.strictEqual(r[3],5)})}),test("order is kept (chained)",function(){const e=new i.Queue,r=[],n=()=>Promise.resolve(!0).then(()=>r.push(1)),s=()=>i.timeout(10).then(()=>r.push(2)),a=()=>Promise.resolve(!0).then(()=>r.push(3)),o=()=>i.timeout(20).then(()=>r.push(4)),c=()=>i.timeout(0).then(()=>r.push(5));return e.queue(n).then(()=>e.queue(s).then(()=>e.queue(a).then(()=>e.queue(o).then(()=>e.queue(c).then(()=>{t.strictEqual(r[0],1),t.strictEqual(r[1],2),t.strictEqual(r[2],3),t.strictEqual(r[3],4),t.strictEqual(r[4],5)})))))}),test("events",async function(){const e=new i.Queue;let r=!1;const n=g.toPromise(e.onDrained).then(()=>r=!0),s=[],a=()=>i.timeout(10).then(()=>s.push(2)),o=()=>i.timeout(20).then(()=>s.push(4)),c=()=>i.timeout(0).then(()=>s.push(5)),u=e.queue(a),l=e.queue(o);e.queue(c),u.then(()=>{t.ok(!r),l.then(()=>{t.ok(!r)})}),await n,t.ok(r)})}),suite("ResourceQueue",()=>{test("simple",async function(){const e=new i.ResourceQueue;await e.whenDrained();let r=!1;e.queueFor(h.file("/some/path"),async()=>{r=!0}),await e.whenDrained(),t.strictEqual(r,!0);let n=!1;e.queueFor(h.file("/some/other/path"),async()=>{n=!0}),await e.whenDrained(),t.strictEqual(n,!0);const s=new i.DeferredPromise;e.queueFor(h.file("/some/path"),()=>s.p);let a=!1;e.whenDrained().then(()=>a=!0),t.strictEqual(a,!1),await s.complete(),await i.timeout(0),t.strictEqual(a,!0);const o=new i.DeferredPromise,c=new i.DeferredPromise;e.queueFor(h.file("/some/path"),()=>o.p),e.queueFor(h.file("/some/other/path"),()=>c.p),a=!1,e.whenDrained().then(()=>a=!0),e.dispose(),await i.timeout(0),t.strictEqual(a,!0)})}),suite("retry",()=>{test("success case",async()=>f({useFakeTimers:!0},async()=>{let e=0;const r=await i.retry(()=>(e++,e<2?Promise.reject(new Error("fail")):Promise.resolve(!0)),10,3);t.strictEqual(r,!0)})),test("error case",async()=>f({useFakeTimers:!0},async()=>{const e=new Error("fail");try{await i.retry(()=>Promise.reject(e),10,3)}catch(r){t.strictEqual(r,r)}}))}),suite("TaskSequentializer",()=>{test("execution basics",async function(){const e=new i.TaskSequentializer;t.ok(!e.isRunning()),t.ok(!e.hasQueued()),t.ok(!e.isRunning(2323)),t.ok(!e.running),await e.run(1,Promise.resolve()),t.ok(!e.isRunning()),t.ok(!e.isRunning(1)),t.ok(!e.running),t.ok(!e.hasQueued()),e.run(2,i.timeout(1)),t.ok(e.isRunning()),t.ok(e.isRunning(2)),t.ok(!e.hasQueued()),t.strictEqual(e.isRunning(1),!1),t.ok(e.running),await i.timeout(2),t.strictEqual(e.isRunning(),!1),t.strictEqual(e.isRunning(2),!1),t.ok(!e.running)}),test("executing and queued (finishes instantly)",async function(){const e=new i.TaskSequentializer;let r=!1;e.run(1,i.timeout(1).then(()=>{r=!0}));let n=!1;const s=e.queue(()=>Promise.resolve(null).then(()=>{n=!0}));t.ok(e.hasQueued()),await s,t.ok(r),t.ok(n),t.ok(!e.hasQueued())}),test("executing and queued (finishes after timeout)",async function(){const e=new i.TaskSequentializer;let r=!1;e.run(1,i.timeout(1).then(()=>{r=!0}));let n=!1;await e.queue(()=>i.timeout(1).then(()=>{n=!0})),t.ok(r),t.ok(n),t.ok(!e.hasQueued())}),test("join (without executing or queued)",async function(){const e=new i.TaskSequentializer;await e.join(),t.ok(!e.hasQueued())}),test("join (without queued)",async function(){const e=new i.TaskSequentializer;let r=!1;e.run(1,i.timeout(1).then(()=>{r=!0})),await e.join(),t.ok(r),t.ok(!e.isRunning())}),test("join (with executing and queued)",async function(){const e=new i.TaskSequentializer;let r=!1;e.run(1,i.timeout(1).then(()=>{r=!0}));let n=!1;e.queue(()=>i.timeout(1).then(()=>{n=!0})),await e.join(),t.ok(r),t.ok(n),t.ok(!e.isRunning()),t.ok(!e.hasQueued())}),test("executing and multiple queued (last one wins)",async function(){const e=new i.TaskSequentializer;let r=!1;e.run(1,i.timeout(1).then(()=>{r=!0}));let n=!1;const s=e.queue(()=>i.timeout(2).then(()=>{n=!0}));let a=!1;const o=e.queue(()=>i.timeout(3).then(()=>{a=!0}));let c=!1;const u=e.queue(()=>i.timeout(4).then(()=>{c=!0}));await Promise.all([s,o,u]),t.ok(r),t.ok(!n),t.ok(!a),t.ok(c)}),test("cancel executing",async function(){const e=new i.TaskSequentializer,r=d.add(new m);let n=!1;const s=i.timeout(1,r.token);e.run(1,s,()=>n=!0),e.cancelRunning(),t.ok(n),r.cancel()})}),suite("disposableTimeout",()=>{test("handler only success",async()=>{let e=!1;const r=i.disposableTimeout(()=>e=!0);await i.timeout(0),t.strictEqual(e,!0),r.dispose()}),test("handler only cancel",async()=>{let e=!1;i.disposableTimeout(()=>e=!0).dispose(),await i.timeout(0),t.strictEqual(e,!1)}),test("store managed success",async()=>{let e=!1;const r=new p;i.disposableTimeout(()=>e=!0,0,r),await i.timeout(0),t.strictEqual(e,!0),r.dispose()}),test("store managed cancel via disposable",async()=>{let e=!1;const r=new p;i.disposableTimeout(()=>e=!0,0,r).dispose(),await i.timeout(0),t.strictEqual(e,!1),r.dispose()}),test("store managed cancel via store",async()=>{let e=!1;const r=new p;i.disposableTimeout(()=>e=!0,0,r),r.dispose(),await i.timeout(0),t.strictEqual(e,!1)})}),test("raceCancellation",async()=>{const e=d.add(new m),r=d.add(new m);let n=!1;const s=i.timeout(100,r.token),a=i.raceCancellation(s.then(()=>n=!0),e.token);e.cancel(),await a,t.ok(!n),r.cancel()}),test("raceTimeout",async()=>{const e=d.add(new m);let r=!1,n=!1;const s=d.add(new m),a=i.timeout(100,s.token),o=i.raceTimeout(a.then(()=>n=!0),1,()=>r=!0);e.cancel(),await o,t.ok(!n),t.strictEqual(r,!0),s.cancel(),r=!1;const c=d.add(new m),u=i.timeout(1,c.token),l=i.raceTimeout(u.then(()=>n=!0),100,()=>r=!0);e.cancel(),await l,t.ok(n),t.strictEqual(r,!1),c.cancel()}),test("SequencerByKey",async()=>{const e=new i.SequencerByKey,r=await e.queue("key1",()=>Promise.resolve("hello"));t.strictEqual(r,"hello"),await e.queue("key2",()=>Promise.reject(new Error("failed"))).then(()=>{throw new Error("should not be resolved")},s=>{t.strictEqual(s.message,"failed")});const n=await e.queue("key2",()=>Promise.resolve("hello"));t.strictEqual(n,"hello")}),test("IntervalCounter",async()=>{let e=0;const r=new i.IntervalCounter(5,()=>e);t.strictEqual(r.increment(),1),t.strictEqual(r.increment(),2),t.strictEqual(r.increment(),3),e=10,t.strictEqual(r.increment(),1),t.strictEqual(r.increment(),2),t.strictEqual(r.increment(),3)}),suite("firstParallel",()=>{test("simple",async()=>{const e=await i.firstParallel([Promise.resolve(1),Promise.resolve(2),Promise.resolve(3)],r=>r===2);t.strictEqual(e,2)}),test("uses null default",async()=>{t.strictEqual(await i.firstParallel([Promise.resolve(1)],e=>e===2),null)}),test("uses value default",async()=>{t.strictEqual(await i.firstParallel([Promise.resolve(1)],e=>e===2,4),4)}),test("empty",async()=>{t.strictEqual(await i.firstParallel([],e=>e===2,4),4)}),test("cancels",async()=>{let e;const r=i.createCancelablePromise(async a=>(e=a,await i.timeout(200,a),1));let n;const s=i.createCancelablePromise(async a=>(n=a,await i.timeout(2,a),2));t.strictEqual(await i.firstParallel([r,s],a=>a===2,4),2),t.strictEqual(e.isCancellationRequested,!0,"should cancel a"),t.strictEqual(n.isCancellationRequested,!0,"should cancel b")}),test("rejection handling",async()=>{let e;const r=i.createCancelablePromise(async a=>(e=a,await i.timeout(200,a),1));let n;const s=i.createCancelablePromise(async a=>{throw n=a,await i.timeout(2,a),new Error("oh no")});t.strictEqual(await i.firstParallel([r,s],a=>a===2,4).catch(()=>"ok"),"ok"),t.strictEqual(e.isCancellationRequested,!0,"should cancel a"),t.strictEqual(n.isCancellationRequested,!0,"should cancel b")})}),suite("DeferredPromise",()=>{test("resolves",async()=>{const e=new i.DeferredPromise;t.strictEqual(e.isResolved,!1),e.complete(42),t.strictEqual(await e.p,42),t.strictEqual(e.isResolved,!0)}),test("rejects",async()=>{const e=new i.DeferredPromise;t.strictEqual(e.isRejected,!1);const r=new Error("oh no!");e.error(r),t.strictEqual(await e.p.catch(n=>n),r),t.strictEqual(e.isRejected,!0)}),test("cancels",async()=>{const e=new i.DeferredPromise;t.strictEqual(e.isRejected,!1),e.cancel(),t.strictEqual((await e.p.catch(r=>r)).name,"Canceled"),t.strictEqual(e.isRejected,!0)})}),suite("Promises.settled",()=>{test("resolves",async()=>{const e=Promise.resolve(1),r=i.timeout(1).then(()=>2),n=i.timeout(2).then(()=>3),s=await i.Promises.settled([e,r,n]);t.strictEqual(s.length,3),t.deepStrictEqual(s[0],1),t.deepStrictEqual(s[1],2),t.deepStrictEqual(s[2],3)}),test("resolves in order",async()=>{const e=i.timeout(2).then(()=>1),r=i.timeout(1).then(()=>2),n=Promise.resolve(3),s=await i.Promises.settled([e,r,n]);t.strictEqual(s.length,3),t.deepStrictEqual(s[0],1),t.deepStrictEqual(s[1],2),t.deepStrictEqual(s[2],3)}),test("rejects with first error but handles all promises (all errors)",async()=>{const e=Promise.reject(1);let r=!1;const n=new Error("2"),s=i.timeout(1).then(()=>{throw r=!0,n});let a=!1;const o=new Error("3"),c=i.timeout(2).then(()=>{throw a=!0,o});let u;try{await i.Promises.settled([e,s,c])}catch(l){u=l}t.ok(u),t.notStrictEqual(u,n),t.notStrictEqual(u,o),t.ok(r),t.ok(a)}),test("rejects with first error but handles all promises (1 error)",async()=>{const e=Promise.resolve(1);let r=!1;const n=new Error("2"),s=i.timeout(1).then(()=>{throw r=!0,n});let a=!1;const o=i.timeout(2).then(()=>(a=!0,3));let c;try{await i.Promises.settled([e,s,o])}catch(u){c=u}t.strictEqual(c,n),t.ok(r),t.ok(a)})}),suite("Promises.withAsyncBody",()=>{test("basics",async()=>{const e=i.Promises.withAsyncBody(async(c,u)=>{c(1)}),r=i.Promises.withAsyncBody(async(c,u)=>{u(new Error("error"))}),n=i.Promises.withAsyncBody(async(c,u)=>{throw new Error("error")}),s=await e;t.strictEqual(s,1);let a;try{await r}catch(c){a=c}t.ok(a instanceof Error);let o;try{await n}catch(c){o=c}t.ok(o instanceof Error)})}),suite("ThrottledWorker",()=>{function e(r,n){t.strictEqual(r.length,n.length);for(let s=0;s<r.length;s++)t.strictEqual(r[s],n[s])}test("basics",async()=>{let r=[],n,s=new Promise(q=>n=q),a=1,o=0;const c=q=>{r.push(...q),o++,o===a&&(n(),s=new Promise(E=>n=E),o=0)},u=d.add(new i.ThrottledWorker({maxWorkChunkSize:5,maxBufferedWork:void 0,throttleDelay:1},c));let l=u.work([1,2,3]);e(r,[1,2,3]),t.strictEqual(u.pending,0),t.strictEqual(l,!0),u.work([4,5]),l=u.work([6]),e(r,[1,2,3,4,5,6]),t.strictEqual(u.pending,0),t.strictEqual(l,!0),r=[],a=2,l=u.work([1,2,3,4,5,6,7]),e(r,[1,2,3,4,5]),t.strictEqual(u.pending,2),t.strictEqual(l,!0),await s,e(r,[1,2,3,4,5,6,7]),r=[],a=4,l=u.work([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]),e(r,[1,2,3,4,5]),t.strictEqual(u.pending,14),t.strictEqual(l,!0),await s,e(r,[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]),r=[],a=2,l=u.work([1,2,3,4,5,6,7,8,9,10]),e(r,[1,2,3,4,5]),t.strictEqual(u.pending,5),t.strictEqual(l,!0),await s,e(r,[1,2,3,4,5,6,7,8,9,10]),r=[],a=3,l=u.work([1,2,3,4,5,6,7]),e(r,[1,2,3,4,5]),t.strictEqual(u.pending,2),t.strictEqual(l,!0),u.work([8]),l=u.work([9,10,11]),e(r,[1,2,3,4,5]),t.strictEqual(u.pending,6),t.strictEqual(l,!0),await s,e(r,[1,2,3,4,5,6,7,8,9,10,11]),t.strictEqual(u.pending,0),r=[],a=2,l=u.work([1,2,3,4,5,6,7]),e(r,[1,2,3,4,5]),t.strictEqual(l,!0),u.work([8]),l=u.work([9,10]),e(r,[1,2,3,4,5]),t.strictEqual(l,!0),await s,e(r,[1,2,3,4,5,6,7,8,9,10])}),test("do not accept too much work",async()=>{const r=[],n=o=>r.push(...o),s=d.add(new i.ThrottledWorker({maxWorkChunkSize:5,maxBufferedWork:5,throttleDelay:1},n));let a=s.work([1,2,3]);t.strictEqual(a,!0),a=s.work([1,2,3,4,5,6]),t.strictEqual(a,!0),t.strictEqual(s.pending,1),a=s.work([7]),t.strictEqual(a,!0),t.strictEqual(s.pending,2),a=s.work([8,9,10,11]),t.strictEqual(a,!1),t.strictEqual(s.pending,2)}),test("do not accept too much work (account for max chunk size",async()=>{const r=[],n=o=>r.push(...o),s=d.add(new i.ThrottledWorker({maxWorkChunkSize:5,maxBufferedWork:5,throttleDelay:1},n));let a=s.work([1,2,3,4,5,6,7,8,9,10,11]);t.strictEqual(a,!1),t.strictEqual(s.pending,0),a=s.work([1,2,3,4,5,6,7,8,9,10]),t.strictEqual(a,!0),t.strictEqual(s.pending,5)}),test("disposed",async()=>{const r=[],n=o=>r.push(...o),s=d.add(new i.ThrottledWorker({maxWorkChunkSize:5,maxBufferedWork:void 0,throttleDelay:1},n));s.dispose();const a=s.work([1,2,3]);e(r,[]),t.strictEqual(s.pending,0),t.strictEqual(a,!1)})}),suite("LimitedQueue",()=>{test("basics (with long running task)",async()=>{const e=new i.LimitedQueue;let r=0;const n=[];for(let s=0;s<5;s++)n.push(e.queue(async()=>{r=s,await i.timeout(1)}));await Promise.all(n),t.strictEqual(r,4)}),test("basics (with sync running task)",async()=>{const e=new i.LimitedQueue;let r=0;const n=[];for(let s=0;s<5;s++)n.push(e.queue(async()=>{r=s}));await Promise.all(n),t.strictEqual(r,4)})}),suite("AsyncIterableObject",function(){test("onReturn NOT called",async function(){let e=!1;const r=new i.AsyncIterableObject(n=>{n.emitMany([1,2,3,4,5])},()=>{e=!0});for await(const n of r)t.strictEqual(typeof n,"number");t.strictEqual(e,!1)}),test("onReturn called on break",async function(){let e=!1;const r=new i.AsyncIterableObject(n=>{n.emitMany([1,2,3,4,5])},()=>{e=!0});for await(const n of r){t.strictEqual(n,1);break}t.strictEqual(e,!0)}),test("onReturn called on return",async function(){let e=!1;const r=new i.AsyncIterableObject(n=>{n.emitMany([1,2,3,4,5])},()=>{e=!0});await async function(){for await(const s of r){t.strictEqual(s,1);return}}(),t.strictEqual(e,!0)}),test("onReturn called on throwing",async function(){let e=!1;const r=new i.AsyncIterableObject(n=>{n.emitMany([1,2,3,4,5])},()=>{e=!0});try{for await(const n of r)throw t.strictEqual(n,1),new Error}catch{}t.strictEqual(e,!0)})}),suite("AsyncIterableSource",function(){test("onReturn is wired up",async function(){let e=!1;const r=new i.AsyncIterableSource(()=>{e=!0});r.emitOne(1),r.emitOne(2),r.emitOne(3),r.resolve();for await(const n of r.asyncIterable){t.strictEqual(n,1);break}t.strictEqual(e,!0)}),test("onReturn is wired up 2",async function(){let e=!1;const r=new i.AsyncIterableSource(()=>{e=!0});r.emitOne(1),r.emitOne(2),r.emitOne(3),r.resolve();for await(const n of r.asyncIterable)t.strictEqual(typeof n,"number");t.strictEqual(e,!1)})})});
