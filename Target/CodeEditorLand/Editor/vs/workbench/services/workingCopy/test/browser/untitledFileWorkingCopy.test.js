import t from"assert";import{newWriteableBufferStream as m,VSBuffer as d,streamToBuffer as C,bufferToStream as g,readableToBuffer as v}from"../../../../../base/common/buffer.js";import{CancellationToken as u}from"../../../../../base/common/cancellation.js";import{Emitter as y}from"../../../../../base/common/event.js";import{Disposable as k,DisposableStore as w}from"../../../../../base/common/lifecycle.js";import{Schemas as E}from"../../../../../base/common/network.js";import{basename as S}from"../../../../../base/common/resources.js";import{consumeReadable as q,consumeStream as D,isReadable as b,isReadableStream as h}from"../../../../../base/common/stream.js";import{URI as I}from"../../../../../base/common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as U}from"../../../../../base/test/common/utils.js";import"../../../../../platform/instantiation/common/instantiation.js";import"../../common/fileWorkingCopy.js";import{UntitledFileWorkingCopy as W}from"../../common/untitledFileWorkingCopy.js";import{TestServiceAccessor as F,workbenchInstantiationService as B}from"../../../../test/browser/workbenchTestServices.js";class R extends k{constructor(n,r){super();this.resource=n;this.contents=r}_onDidChangeContent=this._register(new y);onDidChangeContent=this._onDidChangeContent.event;_onWillDispose=this._register(new y);onWillDispose=this._onWillDispose.event;fireContentChangeEvent(n){this._onDidChangeContent.fire(n)}updateContents(n){this.doUpdate(n)}throwOnSnapshot=!1;setThrowOnSnapshot(){this.throwOnSnapshot=!0}async snapshot(n,r){if(this.throwOnSnapshot)throw new Error("Fail");const a=m();return a.end(d.fromString(this.contents)),a}async update(n,r){this.doUpdate((await C(n)).toString())}doUpdate(n){this.contents=n,this.versionId++,this._onDidChangeContent.fire({isInitial:n.length===0})}versionId=0;pushedStackElement=!1;pushStackElement(){this.pushedStackElement=!0}dispose(){this._onWillDispose.fire(),super.dispose()}}class T{async createModel(s,n,r){return new R(s,(await C(n)).toString())}}suite("UntitledFileWorkingCopy",()=>{const p=new T,s=new w,n=I.from({scheme:E.untitled,path:"Untitled-1"});let r,a,e;function l(i=n,o=!1,c=""){return s.add(new W("testUntitledWorkingCopyType",i,S(i),o,!1,c.length>0?{value:g(d.fromString(c))}:void 0,p,async f=>(await f.revert(),!0),a.workingCopyService,a.workingCopyBackupService,a.logService))}setup(()=>{r=B(void 0,s),a=r.createInstance(F),e=s.add(l())}),teardown(()=>{s.clear()}),test("registers with working copy service",async()=>{t.strictEqual(a.workingCopyService.workingCopies.length,1),e.dispose(),t.strictEqual(a.workingCopyService.workingCopies.length,0)}),test("dirty",async()=>{t.strictEqual(e.isDirty(),!1);let i=0;s.add(e.onDidChangeDirty(()=>{i++}));let o=0;s.add(e.onDidChangeContent(()=>{o++})),await e.resolve(),t.strictEqual(e.isResolved(),!0),e.model?.updateContents("hello dirty"),t.strictEqual(o,1),t.strictEqual(e.isDirty(),!0),t.strictEqual(i,1),await e.save(),t.strictEqual(e.isDirty(),!1),t.strictEqual(i,2)}),test("dirty - cleared when content event signals isEmpty",async()=>{t.strictEqual(e.isDirty(),!1),await e.resolve(),e.model?.updateContents("hello dirty"),t.strictEqual(e.isDirty(),!0),e.model?.fireContentChangeEvent({isInitial:!0}),t.strictEqual(e.isDirty(),!1)}),test("dirty - not cleared when content event signals isEmpty when associated resource",async()=>{e.dispose(),e=l(n,!0),await e.resolve(),e.model?.updateContents("hello dirty"),t.strictEqual(e.isDirty(),!0),e.model?.fireContentChangeEvent({isInitial:!0}),t.strictEqual(e.isDirty(),!0)}),test("revert",async()=>{let i=0;s.add(e.onDidRevert(()=>{i++}));let o=0;s.add(e.onWillDispose(()=>{o++})),await e.resolve(),e.model?.updateContents("hello dirty"),t.strictEqual(e.isDirty(),!0),await e.revert(),t.strictEqual(i,1),t.strictEqual(o,1),t.strictEqual(e.isDirty(),!1)}),test("dispose",async()=>{let i=0;s.add(e.onWillDispose(()=>{i++})),await e.resolve(),e.dispose(),t.strictEqual(i,1)}),test("backup",async()=>{t.strictEqual((await e.backup(u.None)).content,void 0),await e.resolve(),e.model?.updateContents("Hello Backup");const i=await e.backup(u.None);let o;h(i.content)?o=(await D(i.content,c=>d.concat(c))).toString():i.content&&(o=q(i.content,c=>d.concat(c)).toString()),t.strictEqual(o,"Hello Backup")}),test("resolve - without contents",async()=>{t.strictEqual(e.isResolved(),!1),t.strictEqual(e.hasAssociatedFilePath,!1),t.strictEqual(e.model,void 0),await e.resolve(),t.strictEqual(e.isResolved(),!0),t.ok(e.model)}),test("resolve - with initial contents",async()=>{e.dispose(),e=l(n,!1,"Hello Initial");let i=0;s.add(e.onDidChangeContent(()=>{i++})),t.strictEqual(e.isDirty(),!0),await e.resolve(),t.strictEqual(e.isDirty(),!0),t.strictEqual(e.model?.contents,"Hello Initial"),t.strictEqual(i,1),e.model.updateContents("Changed contents"),await e.resolve(),t.strictEqual(e.model?.contents,"Changed contents")}),test("backup - with initial contents uses those even if unresolved",async()=>{e.dispose(),e=l(n,!1,"Hello Initial"),t.strictEqual(e.isDirty(),!0);const i=(await e.backup(u.None)).content;if(h(i)){const o=await C(i);t.strictEqual(o.toString(),"Hello Initial")}else if(b(i)){const o=v(i);t.strictEqual(o.toString(),"Hello Initial")}else t.fail("Missing untitled backup")}),test("resolve - with associated resource",async()=>{e.dispose(),e=l(n,!0),await e.resolve(),t.strictEqual(e.isDirty(),!0),t.strictEqual(e.hasAssociatedFilePath,!0)}),test("resolve - with backup",async()=>{await e.resolve(),e.model?.updateContents("Hello Backup");const i=await e.backup(u.None);await a.workingCopyBackupService.backup(e,i.content,void 0,i.meta),t.strictEqual(a.workingCopyBackupService.hasBackupSync(e),!0),e.dispose(),e=l();let o=0;s.add(e.onDidChangeContent(()=>{o++})),await e.resolve(),t.strictEqual(e.isDirty(),!0),t.strictEqual(e.model?.contents,"Hello Backup"),t.strictEqual(o,1)}),U()});export{R as TestUntitledFileWorkingCopyModel,T as TestUntitledFileWorkingCopyModelFactory};
