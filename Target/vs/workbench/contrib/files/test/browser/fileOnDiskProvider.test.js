import t from"assert";import{URI as a}from"../../../../../base/common/uri.js";import{workbenchInstantiationService as c,TestServiceAccessor as l}from"../../../../test/browser/workbenchTestServices.js";import"../../../../../platform/instantiation/common/instantiation.js";import{TextFileContentProvider as m}from"../../common/files.js";import{snapshotToString as p}from"../../../../services/textfile/common/textfiles.js";import{DisposableStore as d}from"../../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as f}from"../../../../../base/test/common/utils.js";suite("Files - FileOnDiskContentProvider",()=>{const i=new d;let o,r;setup(()=>{o=c(void 0,i),r=o.createInstance(l)}),teardown(()=>{i.clear()}),test("provideTextContent",async()=>{const n=i.add(o.createInstance(m)),e=a.parse("testFileOnDiskContentProvider://foo"),s=await n.provideTextContent(e.with({scheme:"conflictResolution",query:JSON.stringify({scheme:e.scheme})}));t.ok(s),t.strictEqual(p(s.createSnapshot()),"Hello Html"),t.strictEqual(r.fileService.getLastReadFileUri().scheme,e.scheme),t.strictEqual(r.fileService.getLastReadFileUri().path,e.path),s.dispose()}),f()});
