import s from"assert";import{URI as l}from"../../../../base/common/uri.js";import{ExtHostDocumentsAndEditors as p}from"../../common/extHostDocumentsAndEditors.js";import{SingleProxyRPCProtocol as h}from"../common/testRPCProtocol.js";import{NullLogService as c}from"../../../../platform/log/common/log.js";import{ensureNoDisposablesAreLeakedInTestSuite as v}from"../../../../base/test/common/utils.js";import{ExtHostDocumentContentProvider as C}from"../../common/extHostDocumentContentProviders.js";import{Emitter as f}from"../../../../base/common/event.js";import"../../common/extHost.protocol.js";import{timeout as m}from"../../../../base/common/async.js";import{runWithFakedTimers as D}from"../../../../base/test/common/timeTravelScheduler.js";suite("ExtHostDocumentContentProvider",()=>{v();const i=l.parse("foo:bar");let a,d;const o=[];setup(()=>{o.length=0,d=new class{$registerTextContentProvider(r,t){}$unregisterTextContentProvider(r){}async $onVirtualDocumentChange(r,t){await m(10),o.push([r,t])}dispose(){throw new Error("Method not implemented.")}};const e=h(d),n=new p(e,new c);n.$acceptDocumentsAndEditorsDelta({addedDocuments:[{isDirty:!1,languageId:"foo",uri:i,versionId:1,lines:["foo"],EOL:`
`}]}),a=new C(e,n,new c)}),test("TextDocumentContentProvider drops onDidChange events when they happen quickly #179711",async()=>{await D({},async function(){const e=new f,n=["X","Y"];let r=0,t=0;const u=a.registerTextDocumentContentProvider(i.scheme,{onDidChange:e.event,async provideTextDocumentContent(g){s.strictEqual(t,0),t++;try{return await m(0),n[r++%n.length]}finally{t--}}});e.fire(i),e.fire(i),await m(100),s.strictEqual(o.length,2),s.strictEqual(o[0][1],"X"),s.strictEqual(o[1][1],"Y"),u.dispose()})})});