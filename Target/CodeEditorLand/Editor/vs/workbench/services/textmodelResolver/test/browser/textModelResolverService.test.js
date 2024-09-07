import s from"assert";import"../../../../../editor/common/model.js";import{URI as T}from"../../../../../base/common/uri.js";import{TextResourceEditorInput as I}from"../../../../common/editor/textResourceEditorInput.js";import"../../../../common/editor/textResourceEditorModel.js";import"../../../../../platform/instantiation/common/instantiation.js";import{workbenchInstantiationService as y,TestServiceAccessor as g}from"../../../../test/browser/workbenchTestServices.js";import{ensureNoDisposablesAreLeakedInTestSuite as F,toResource as M}from"../../../../../base/test/common/utils.js";import{TextFileEditorModel as x}from"../../../textfile/common/textFileEditorModel.js";import{snapshotToString as b}from"../../../textfile/common/textfiles.js";import"../../../textfile/common/textFileEditorModelManager.js";import{Event as v}from"../../../../../base/common/event.js";import{timeout as c}from"../../../../../base/common/async.js";import{UntitledTextEditorInput as P}from"../../../untitled/common/untitledTextEditorInput.js";import{createTextBufferFactory as h}from"../../../../../editor/common/model/textModel.js";import{DisposableStore as q}from"../../../../../base/common/lifecycle.js";suite("Workbench - TextModelResolverService",()=>{const i=new q;let n,o;setup(()=>{n=y(void 0,i),o=n.createInstance(g),i.add(o.textFileService.files)}),teardown(()=>{i.clear()}),test("resolve resource",async()=>{i.add(o.textModelResolverService.registerTextModelContentProvider("test",{provideTextContent:async function(a){if(a.scheme==="test"){const f="Hello Test",m=o.languageService.createById("json");return o.modelService.createModel(f,m,a)}return null}}));const e=T.from({scheme:"test",authority:null,path:"thePath"}),r=n.createInstance(I,e,"The Name","The Description",void 0,void 0),t=i.add(await r.resolve());s.ok(t),s.strictEqual(b(t.createSnapshot()),"Hello Test");let l=!1;const d=new Promise(a=>{v.once(t.onWillDispose)(()=>{l=!0,a()})});r.dispose(),await d,s.strictEqual(l,!0)}),test("resolve file",async function(){const e=i.add(n.createInstance(x,M.call(this,"/path/file_resolver.txt"),"utf8",void 0));o.textFileService.files.add(e.resource,e),await e.resolve();const r=await o.textModelResolverService.createModelReference(e.resource),t=r.object,l=t.textEditorModel;s.ok(l),s.strictEqual(l.getValue(),"Hello Html");let d=!1;v.once(t.onWillDispose)(()=>{d=!0}),r.dispose(),await c(0),s.strictEqual(d,!0)}),test("resolved dirty file eventually disposes",async function(){const e=i.add(n.createInstance(x,M.call(this,"/path/file_resolver.txt"),"utf8",void 0));o.textFileService.files.add(e.resource,e),await e.resolve(),e.updateTextEditorModel(h("make dirty"));const r=await o.textModelResolverService.createModelReference(e.resource);let t=!1;v.once(e.onWillDispose)(()=>{t=!0}),r.dispose(),await c(0),s.strictEqual(t,!1),e.revert(),await c(0),s.strictEqual(t,!0)}),test("resolved dirty file does not dispose when new reference created",async function(){const e=i.add(n.createInstance(x,M.call(this,"/path/file_resolver.txt"),"utf8",void 0));o.textFileService.files.add(e.resource,e),await e.resolve(),e.updateTextEditorModel(h("make dirty"));const r=await o.textModelResolverService.createModelReference(e.resource);let t=!1;v.once(e.onWillDispose)(()=>{t=!0}),r.dispose(),await c(0),s.strictEqual(t,!1);const l=await o.textModelResolverService.createModelReference(e.resource);e.revert(),await c(0),s.strictEqual(t,!1),l.dispose(),await c(0),s.strictEqual(t,!0)}),test("resolve untitled",async()=>{const e=o.untitledTextEditorService,r=i.add(e.create()),t=i.add(n.createInstance(P,r));await t.resolve();const l=await o.textModelResolverService.createModelReference(t.resource),d=l.object;s.strictEqual(r,d);const a=d.textEditorModel;s.ok(a),l.dispose(),t.dispose(),d.dispose()}),test("even loading documents should be refcounted",async()=>{let e;const r=new Promise(u=>e=u);i.add(o.textModelResolverService.registerTextModelContentProvider("test",{provideTextContent:async u=>{await r;const E="Hello Test",R=o.languageService.createById("json");return i.add(o.modelService.createModel(E,R,u))}}));const t=T.from({scheme:"test",authority:null,path:"thePath"}),l=o.textModelResolverService.createModelReference(t),d=o.textModelResolverService.createModelReference(t);e();const a=await l,f=a.object,m=await d,S=m.object,p=f.textEditorModel;s.strictEqual(f,S,"they are the same model"),s(!p.isDisposed(),"the text model should not be disposed"),a.dispose(),s(!p.isDisposed(),"the text model should still not be disposed");const w=new Promise(u=>i.add(p.onWillDispose(u)));m.dispose(),await w,s(p.isDisposed(),"the text model should finally be disposed")}),F()});