import r from"assert";import{URI as o}from"../../../../../base/common/uri.js";import"../../../../../platform/instantiation/common/instantiation.js";import{workbenchInstantiationService as S,TestServiceAccessor as y,TestInMemoryFileSystemProvider as v}from"../../../../test/browser/workbenchTestServices.js";import{StoredFileWorkingCopy as m}from"../../common/storedFileWorkingCopy.js";import{bufferToStream as C,VSBuffer as k}from"../../../../../base/common/buffer.js";import{TestStoredFileWorkingCopyModelFactory as w}from"./storedFileWorkingCopy.test.js";import{Schemas as f}from"../../../../../base/common/network.js";import{FileWorkingCopyManager as h}from"../../common/fileWorkingCopyManager.js";import{TestUntitledFileWorkingCopyModelFactory as E}from"./untitledFileWorkingCopy.test.js";import{UntitledFileWorkingCopy as q}from"../../common/untitledFileWorkingCopy.js";import{DisposableStore as F}from"../../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as W}from"../../../../../base/test/common/utils.js";suite("FileWorkingCopyManager",()=>{const n=new F;let p,i,s;setup(()=>{p=S(void 0,n),i=p.createInstance(y),i.fileService.registerProvider(f.file,new v),i.fileService.registerProvider(f.vscodeRemote,new v),s=n.add(new h("testFileWorkingCopyType",new w,new E,i.fileService,i.lifecycleService,i.labelService,i.logService,i.workingCopyFileService,i.workingCopyBackupService,i.uriIdentityService,i.fileDialogService,i.filesConfigurationService,i.workingCopyService,i.notificationService,i.workingCopyEditorService,i.editorService,i.elevatedFileService,i.pathService,i.environmentService,i.dialogService,i.decorationsService,i.progressService))}),teardown(()=>{n.clear()}),test("onDidCreate, get, workingCopies",async()=>{let e=0;n.add(s.onDidCreate(g=>{e++}));const t=o.file("/test.html");r.strictEqual(s.workingCopies.length,0),r.strictEqual(s.get(t),void 0);const a=await s.resolve(t),l=await s.resolve();r.strictEqual(s.workingCopies.length,2),r.strictEqual(e,2),r.strictEqual(s.get(a.resource),a),r.strictEqual(s.get(l.resource),l);const u=n.add(await s.resolve(t)),d=n.add(await s.resolve({untitledResource:l.resource}));r.strictEqual(u,a),r.strictEqual(d,l),r.strictEqual(s.workingCopies.length,2),r.strictEqual(e,2)}),test("resolve",async()=>{const e=n.add(await s.resolve(o.file("/test.html")));r.ok(e instanceof m),r.strictEqual(await s.stored.resolve(e.resource),e);const t=n.add(await s.resolve());r.ok(t instanceof q),r.strictEqual(await s.untitled.resolve({untitledResource:t.resource}),t),r.strictEqual(await s.resolve(t.resource),t)}),test("destroy",async()=>{r.strictEqual(i.workingCopyService.workingCopies.length,0),await s.resolve(o.file("/test.html")),await s.resolve({contents:{value:C(k.fromString("Hello Untitled"))}}),r.strictEqual(i.workingCopyService.workingCopies.length,2),r.strictEqual(s.stored.workingCopies.length,1),r.strictEqual(s.untitled.workingCopies.length,1),await s.destroy(),r.strictEqual(i.workingCopyService.workingCopies.length,0),r.strictEqual(s.stored.workingCopies.length,0),r.strictEqual(s.untitled.workingCopies.length,0)}),test("saveAs - file (same target, unresolved source, unresolved target)",()=>{const e=o.file("/path/source.txt");return c(e,e,!1,!1)}),test("saveAs - file (same target, different case, unresolved source, unresolved target)",async()=>{const e=o.file("/path/source.txt"),t=o.file("/path/SOURCE.txt");return c(e,t,!1,!1)}),test("saveAs - file (different target, unresolved source, unresolved target)",async()=>{const e=o.file("/path/source.txt"),t=o.file("/path/target.txt");return c(e,t,!1,!1)}),test("saveAs - file (same target, resolved source, unresolved target)",()=>{const e=o.file("/path/source.txt");return c(e,e,!0,!1)}),test("saveAs - file (same target, different case, resolved source, unresolved target)",async()=>{const e=o.file("/path/source.txt"),t=o.file("/path/SOURCE.txt");return c(e,t,!0,!1)}),test("saveAs - file (different target, resolved source, unresolved target)",async()=>{const e=o.file("/path/source.txt"),t=o.file("/path/target.txt");return c(e,t,!0,!1)}),test("saveAs - file (same target, unresolved source, resolved target)",()=>{const e=o.file("/path/source.txt");return c(e,e,!1,!0)}),test("saveAs - file (same target, different case, unresolved source, resolved target)",async()=>{const e=o.file("/path/source.txt"),t=o.file("/path/SOURCE.txt");return c(e,t,!1,!0)}),test("saveAs - file (different target, unresolved source, resolved target)",async()=>{const e=o.file("/path/source.txt"),t=o.file("/path/target.txt");return c(e,t,!1,!0)}),test("saveAs - file (same target, resolved source, resolved target)",()=>{const e=o.file("/path/source.txt");return c(e,e,!0,!0)}),test("saveAs - file (different target, resolved source, resolved target)",async()=>{const e=o.file("/path/source.txt"),t=o.file("/path/target.txt");return c(e,t,!0,!0)});async function c(e,t,a,l){let u;a&&(u=n.add(await s.resolve(e)),u.model?.updateContents("hello world"),r.ok(u.isDirty()));let d;l&&(d=n.add(await s.resolve(t)),d.model?.updateContents("hello world"),r.ok(d.isDirty()));const g=await s.saveAs(e,t);i.uriIdentityService.extUri.isEqual(e,t)&&a?r.strictEqual(e.toString(),g?.resource.toString()):a||l?r.strictEqual(t.toString(),g?.resource.toString()):i.uriIdentityService.extUri.isEqual(e,t)?r.strictEqual(void 0,g):r.strictEqual(t.toString(),g?.resource.toString()),a&&r.strictEqual(u?.isDirty(),!1),l&&r.strictEqual(d?.isDirty(),!1),g?.dispose()}test("saveAs - untitled (without associated resource)",async()=>{const e=n.add(await s.resolve());e.model?.updateContents("Simple Save As");const t=o.file("simple/file.txt");i.fileDialogService.setPickFileToSave(t);const a=await s.saveAs(e.resource,void 0);r.strictEqual(a?.resource.toString(),t.toString()),r.strictEqual((a?.model).contents,"Simple Save As"),r.strictEqual(s.untitled.get(e.resource),void 0),a?.dispose()}),test("saveAs - untitled (with associated resource)",async()=>{const e=n.add(await s.resolve({associatedResource:{path:"/some/associated.txt"}}));e.model?.updateContents("Simple Save As with associated resource");const t=o.from({scheme:f.file,path:"/some/associated.txt"});i.fileService.notExistsSet.set(t,!0);const a=await s.saveAs(e.resource,void 0);r.strictEqual(a?.resource.toString(),t.toString()),r.strictEqual((a?.model).contents,"Simple Save As with associated resource"),r.strictEqual(s.untitled.get(e.resource),void 0),a?.dispose()}),test("saveAs - untitled (target exists and is resolved)",async()=>{const e=n.add(await s.resolve());e.model?.updateContents("Simple Save As");const t=o.file("simple/file.txt"),a=await s.resolve(t);i.fileDialogService.setPickFileToSave(t);const l=await s.saveAs(e.resource,void 0);r.strictEqual(l,a),r.strictEqual((l?.model).contents,"Simple Save As"),r.strictEqual(s.untitled.get(e.resource),void 0),l?.dispose()}),W()});