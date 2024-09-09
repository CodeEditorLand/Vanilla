import s from"assert";import{timeout as w}from"../../../../base/common/async.js";import{newWriteableBufferStream as U}from"../../../../base/common/buffer.js";import{CancellationToken as h}from"../../../../base/common/cancellation.js";import{Event as A}from"../../../../base/common/event.js";import{isWeb as E}from"../../../../base/common/platform.js";import{runWithFakedTimers as S}from"../../../../base/test/common/timeTravelScheduler.js";import{ensureNoDisposablesAreLeakedInTestSuite as W}from"../../../../base/test/common/utils.js";import{NullLogService as m}from"../../../log/common/log.js";import{IProductService as y}from"../../../product/common/productService.js";import"../../../request/common/request.js";import{IUserDataSyncStoreService as r,SyncResource as o,UserDataSyncErrorCode as f,UserDataSyncStoreError as g}from"../../common/userDataSync.js";import{RequestsSession as I,UserDataSyncStoreService as H}from"../../common/userDataSyncStoreService.js";import{UserDataSyncClient as l,UserDataSyncTestServer as c}from"./userDataSyncClient.js";suite("UserDataSyncStoreService",()=>{const i=W();test("test read manifest for the first time",async()=>{const e=new c,a=i.add(new l(e));await a.setUp();const t=a.instantiationService.get(r),n=a.instantiationService.get(y);await t.manifest(null),s.strictEqual(e.requestsWithAllHeaders.length,1),s.strictEqual(e.requestsWithAllHeaders[0].headers["X-Client-Name"],`${n.applicationName}${E?"-web":""}`),s.strictEqual(e.requestsWithAllHeaders[0].headers["X-Client-Version"],n.version),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],void 0),s.strictEqual(e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],void 0)}),test("test read manifest for the second time when session is not yet created",async()=>{const e=new c,a=i.add(new l(e));await a.setUp();const t=a.instantiationService.get(r);await t.manifest(null);const n=e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"];e.reset(),await t.manifest(null),s.strictEqual(e.requestsWithAllHeaders.length,1),s.strictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],n),s.strictEqual(e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],void 0)}),test("test session id header is not set in the first manifest request after session is created",async()=>{const e=new c,a=i.add(new l(e));await a.setUp();const t=a.instantiationService.get(r);await t.manifest(null);const n=e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"];await t.writeResource(o.Settings,"some content",null),e.reset(),await t.manifest(null),s.strictEqual(e.requestsWithAllHeaders.length,1),s.strictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],n),s.strictEqual(e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],void 0)}),test("test session id header is set from the second manifest request after session is created",async()=>{const e=new c,a=i.add(new l(e));await a.setUp();const t=a.instantiationService.get(r);await t.manifest(null);const n=e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"];await t.writeResource(o.Settings,"some content",null),await t.manifest(null),e.reset(),await t.manifest(null),s.strictEqual(e.requestsWithAllHeaders.length,1),s.strictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],n),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],void 0)}),test("test headers are send for write request",async()=>{const e=new c,a=i.add(new l(e));await a.setUp();const t=a.instantiationService.get(r);await t.manifest(null);const n=e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"];await t.writeResource(o.Settings,"some content",null),await t.manifest(null),await t.manifest(null),e.reset(),await t.writeResource(o.Settings,"some content",null),s.strictEqual(e.requestsWithAllHeaders.length,1),s.strictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],n),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],void 0)}),test("test headers are send for read request",async()=>{const e=new c,a=i.add(new l(e));await a.setUp();const t=a.instantiationService.get(r);await t.manifest(null);const n=e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"];await t.writeResource(o.Settings,"some content",null),await t.manifest(null),await t.manifest(null),e.reset(),await t.readResource(o.Settings,null),s.strictEqual(e.requestsWithAllHeaders.length,1),s.strictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],n),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],void 0)}),test("test headers are reset after session is cleared ",async()=>{const e=new c,a=i.add(new l(e));await a.setUp();const t=a.instantiationService.get(r);await t.manifest(null);const n=e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"];await t.writeResource(o.Settings,"some content",null),await t.manifest(null),await t.manifest(null),await t.clear(),e.reset(),await t.manifest(null),s.strictEqual(e.requestsWithAllHeaders.length,1),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],void 0),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],n),s.strictEqual(e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],void 0)}),test("test old headers are sent after session is changed on server ",async()=>{const e=new c,a=i.add(new l(e));await a.setUp();const t=a.instantiationService.get(r);await t.manifest(null),await t.writeResource(o.Settings,"some content",null),await t.manifest(null),e.reset(),await t.manifest(null);const n=e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],d=e.requestsWithAllHeaders[0].headers["X-User-Session-Id"];await e.clear();const u=i.add(new l(e));await u.setUp(),await u.instantiationService.get(r).writeResource(o.Settings,"some content",null),e.reset(),await t.manifest(null),s.strictEqual(e.requestsWithAllHeaders.length,1),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],void 0),s.strictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],n),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],void 0),s.strictEqual(e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],d)}),test("test old headers are reset from second request after session is changed on server ",async()=>{const e=new c,a=i.add(new l(e));await a.setUp();const t=a.instantiationService.get(r);await t.manifest(null),await t.writeResource(o.Settings,"some content",null),await t.manifest(null),e.reset(),await t.manifest(null);const n=e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],d=e.requestsWithAllHeaders[0].headers["X-User-Session-Id"];await e.clear();const u=i.add(new l(e));await u.setUp(),await u.instantiationService.get(r).writeResource(o.Settings,"some content",null),await t.manifest(null),e.reset(),await t.manifest(null),s.strictEqual(e.requestsWithAllHeaders.length,1),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],void 0),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],n),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],void 0),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],d)}),test("test old headers are sent after session is cleared from another server ",async()=>{const e=new c,a=i.add(new l(e));await a.setUp();const t=a.instantiationService.get(r);await t.manifest(null),await t.writeResource(o.Settings,"some content",null),await t.manifest(null),e.reset(),await t.manifest(null);const n=e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],d=e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],u=i.add(new l(e));await u.setUp(),await u.instantiationService.get(r).clear(),e.reset(),await t.manifest(null),s.strictEqual(e.requestsWithAllHeaders.length,1),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],void 0),s.strictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],n),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],void 0),s.strictEqual(e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],d)}),test("test headers are reset after session is cleared from another server ",async()=>{const e=new c,a=i.add(new l(e));await a.setUp();const t=a.instantiationService.get(r);await t.manifest(null),await t.writeResource(o.Settings,"some content",null),await t.manifest(null),e.reset(),await t.manifest(null);const n=e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],d=i.add(new l(e));await d.setUp(),await d.instantiationService.get(r).clear(),await t.manifest(null),e.reset(),await t.manifest(null),s.strictEqual(e.requestsWithAllHeaders.length,1),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],void 0),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],n),s.strictEqual(e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],void 0)}),test("test headers are reset after session is cleared from another server - started syncing again",async()=>{const e=new c,a=i.add(new l(e));await a.setUp();const t=a.instantiationService.get(r);await t.manifest(null),await t.writeResource(o.Settings,"some content",null),await t.manifest(null),e.reset(),await t.manifest(null);const n=e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],d=e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],u=i.add(new l(e));await u.setUp(),await u.instantiationService.get(r).clear(),await t.manifest(null),await t.writeResource(o.Settings,"some content",null),await t.manifest(null),e.reset(),await t.manifest(null),s.strictEqual(e.requestsWithAllHeaders.length,1),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],void 0),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-Machine-Session-Id"],n),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],d),s.notStrictEqual(e.requestsWithAllHeaders[0].headers["X-User-Session-Id"],void 0)}),test("test rate limit on server with retry after",async()=>{const e=new c(1,1),a=i.add(new l(e));await a.setUp();const t=a.instantiationService.get(r);await t.manifest(null);const n=A.toPromise(t.onDidChangeDonotMakeRequestsUntil);try{await t.manifest(null),s.fail("should fail")}catch(d){s.ok(d instanceof g),s.deepStrictEqual(d.code,f.TooManyRequestsAndRetryAfter),await n,s.ok(!!t.donotMakeRequestsUntil)}}),test("test donotMakeRequestsUntil is reset after retry time is finished",async()=>S({useFakeTimers:!0},async()=>{const e=i.add(new l(new c(1,.25)));await e.setUp();const a=e.instantiationService.get(r);await a.manifest(null);try{await a.manifest(null),s.fail("should fail")}catch{}const t=A.toPromise(a.onDidChangeDonotMakeRequestsUntil);await w(300),await t,s.ok(!a.donotMakeRequestsUntil)})),test("test donotMakeRequestsUntil is retrieved",async()=>{const e=i.add(new l(new c(1,1)));await e.setUp();const a=e.instantiationService.get(r);await a.manifest(null);try{await a.manifest(null)}catch{}const t=i.add(e.instantiationService.createInstance(H));s.strictEqual(t.donotMakeRequestsUntil?.getTime(),a.donotMakeRequestsUntil?.getTime())}),test("test donotMakeRequestsUntil is checked and reset after retreived",async()=>S({useFakeTimers:!0},async()=>{const e=i.add(new l(new c(1,.25)));await e.setUp();const a=e.instantiationService.get(r);await a.manifest(null);try{await a.manifest(null),s.fail("should fail")}catch{}await w(300);const t=i.add(e.instantiationService.createInstance(H));s.ok(!t.donotMakeRequestsUntil)})),test("test read resource request handles 304",async()=>{const e=new c,a=i.add(new l(e));await a.setUp(),await a.sync();const t=a.instantiationService.get(r),n=await t.readResource(o.Settings,null),d=await t.readResource(o.Settings,n);s.strictEqual(d,n)})}),suite("UserDataSyncRequestsSession",()=>{const i={_serviceBrand:void 0,async request(){return{res:{headers:{}},stream:U()}},async resolveProxy(){},async lookupAuthorization(){},async lookupKerberosAuthorization(){},async loadCertificates(){return[]}};W(),test("too many requests are thrown when limit exceeded",async()=>{const e=new I(1,500,i,new m);await e.request("url",{},h.None);try{await e.request("url",{},h.None)}catch(a){s.ok(a instanceof g),s.strictEqual(a.code,f.LocalTooManyRequests);return}s.fail("Should fail with limit exceeded")}),test("requests are handled after session is expired",()=>S({useFakeTimers:!0},async()=>{const e=new I(1,100,i,new m);await e.request("url",{},h.None),await w(125),await e.request("url",{},h.None)})),test("too many requests are thrown after session is expired",()=>S({useFakeTimers:!0},async()=>{const e=new I(1,100,i,new m);await e.request("url",{},h.None),await w(125),await e.request("url",{},h.None);try{await e.request("url",{},h.None)}catch(a){s.ok(a instanceof g),s.strictEqual(a.code,f.LocalTooManyRequests);return}s.fail("Should fail with limit exceeded")}))});
