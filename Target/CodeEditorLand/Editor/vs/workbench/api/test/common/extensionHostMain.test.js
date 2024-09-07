import e from"assert";import{errorHandler as k,onUnexpectedError as c}from"../../../../base/common/errors.js";import{isFirefox as m,isSafari as x}from"../../../../base/common/platform.js";import{TernarySearchTree as w}from"../../../../base/common/ternarySearchTree.js";import"../../../../base/common/uri.js";import{mock as p}from"../../../../base/test/common/mock.js";import{ensureNoDisposablesAreLeakedInTestSuite as v}from"../../../../base/test/common/utils.js";import"../../../../platform/extensions/common/extensions.js";import{InstantiationService as I}from"../../../../platform/instantiation/common/instantiationService.js";import{ServiceCollection as _}from"../../../../platform/instantiation/common/serviceCollection.js";import{ILogService as g,NullLogService as y}from"../../../../platform/log/common/log.js";import"../../common/extHost.protocol.js";import{ExtensionPaths as h,IExtHostExtensionService as q}from"../../common/extHostExtensionService.js";import{IExtHostRpcService as H}from"../../common/extHostRpcService.js";import{IExtHostTelemetry as b}from"../../common/extHostTelemetry.js";import{ErrorHandler as P}from"../../common/extensionHostMain.js";import{nullExtensionDescription as R}from"../../../services/extensions/common/extensions.js";import"../../../services/extensions/common/proxyIdentifier.js";suite("ExtensionHostMain#ErrorHandler - Wrapping prepareStackTrace can cause slowdown and eventual stack overflow #184926 ",function(){if(m||x)return;const l=w.forUris(),d=new class extends p(){$onExtensionRuntimeError(r,a){}},f=new _([g,new y],[b,new class extends p(){onExtensionError(r,a){return!0}}],[q,new class extends p(){getExtensionPathIndex(){return new class extends h{findSubstr(r){return o++,R}}(l)}}],[H,new class extends p(){getProxy(r){return d}}]),S=Error.prepareStackTrace,u=new I(f,!1);let E,o=0;v(),suiteSetup(async function(){E=k.getUnexpectedErrorHandler(),await u.invokeFunction(P.installFullHandler)}),suiteTeardown(function(){k.setUnexpectedErrorHandler(E)}),setup(async function(){o=0}),teardown(()=>{Error.prepareStackTrace=S}),test("basics",function(){const r=new Error("test1");c(r),e.strictEqual(o,1)}),test("set/reset prepareStackTrace-callback",function(){const r=Error.prepareStackTrace;Error.prepareStackTrace=(n,s)=>"stack";const a=new Error,t=a.stack;e.ok(t),Error.prepareStackTrace=r,e.strictEqual(o,1),c(a),e.strictEqual(o,1);const i=new Error("test2");c(i),e.strictEqual(o,2)}),test("wrap prepareStackTrace-callback",function(){function r(n){return n}const a=Error.prepareStackTrace;Error.prepareStackTrace=(...n)=>a?.(...n);const t=new Error,i=t.stack;e.ok(i),c(t),e.strictEqual(o,1)}),test("prevent rewrapping",function(){let r=0;function a(s){r++}Error.prepareStackTrace=(s,T)=>(a(T),"fakestack");for(let s=0;s<2500;++s)Error.prepareStackTrace=Error.prepareStackTrace;const t=new Error,i=t.stack;e.strictEqual(i,"fakestack"),c(t),e.strictEqual(o,1);const n=new Error;c(n),e.strictEqual(o,2),e.strictEqual(r,2)}),suite("https://gist.github.com/thecrypticace/f0f2e182082072efdaf0f8e1537d2cce",function(){test("Restored, separate operations",()=>{let r;r=Error.prepareStackTrace;for(let t=0;t<12500;++t)Error.prepareStackTrace=Error.prepareStackTrace;const a=new Error;e.ok(a.stack),e.strictEqual(o,1),Error.prepareStackTrace=r,r=Error.prepareStackTrace;for(let t=0;t<12500;++t)Error.prepareStackTrace=Error.prepareStackTrace;e.ok(new Error().stack),e.strictEqual(o,2),Error.prepareStackTrace=r,r=Error.prepareStackTrace;for(let t=0;t<12500;++t)Error.prepareStackTrace=Error.prepareStackTrace;e.ok(new Error().stack),e.strictEqual(o,3),Error.prepareStackTrace=r,r=Error.prepareStackTrace;for(let t=0;t<12500;++t)Error.prepareStackTrace=Error.prepareStackTrace;e.ok(new Error().stack),e.strictEqual(o,4),Error.prepareStackTrace=r,e.ok(a.stack),e.strictEqual(o,4)}),test("Never restored, separate operations",()=>{for(let r=0;r<12500;++r)Error.prepareStackTrace=Error.prepareStackTrace;e.ok(new Error().stack);for(let r=0;r<12500;++r)Error.prepareStackTrace=Error.prepareStackTrace;e.ok(new Error().stack);for(let r=0;r<12500;++r)Error.prepareStackTrace=Error.prepareStackTrace;e.ok(new Error().stack);for(let r=0;r<12500;++r)Error.prepareStackTrace=Error.prepareStackTrace;e.ok(new Error().stack)}),test("Restored, too many uses before restoration",async()=>{const r=Error.prepareStackTrace;Error.prepareStackTrace=(a,t)=>t;for(let a=0;a<1e4;++a)Error.prepareStackTrace=Error.prepareStackTrace;e.ok(new Error().stack),Error.prepareStackTrace=r})})});