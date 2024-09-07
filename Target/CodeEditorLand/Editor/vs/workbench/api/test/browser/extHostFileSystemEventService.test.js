import e from"assert";import{ExtHostFileSystemEventService as i}from"../../common/extHostFileSystemEventService.js";import"../../common/extHost.protocol.js";import{NullLogService as s}from"../../../../platform/log/common/log.js";import{ensureNoDisposablesAreLeakedInTestSuite as o}from"../../../../base/test/common/utils.js";suite("ExtHostFileSystemEventService",()=>{o(),test("FileSystemWatcher ignore events properties are reversed #26851",function(){const r={getProxy:()=>{},set:void 0,dispose:void 0,assertRegistered:void 0,drain:void 0},t=new i(r,new s,void 0).createFileSystemWatcher(void 0,void 0,"**/somethingInteresting",{correlate:!1});e.strictEqual(t.ignoreChangeEvents,!1),e.strictEqual(t.ignoreCreateEvents,!1),e.strictEqual(t.ignoreDeleteEvents,!1),t.dispose();const n=new i(r,new s,void 0).createFileSystemWatcher(void 0,void 0,"**/somethingBoring",{ignoreCreateEvents:!0,ignoreChangeEvents:!0,ignoreDeleteEvents:!0,correlate:!1});e.strictEqual(n.ignoreChangeEvents,!0),e.strictEqual(n.ignoreCreateEvents,!0),e.strictEqual(n.ignoreDeleteEvents,!0),n.dispose()})});