import o from"assert";import{URI as n}from"../../../../../base/common/uri.js";import"../../../../../platform/instantiation/common/instantiation.js";import{workbenchInstantiationService as q,TestServiceAccessor as I}from"../../../../test/browser/workbenchTestServices.js";import{TextFileEditorModel as E}from"../../common/textFileEditorModel.js";import{FileChangesEvent as p,FileChangeType as M,FileOperationError as F,FileOperationResult as w}from"../../../../../platform/files/common/files.js";import{ensureNoDisposablesAreLeakedInTestSuite as D,toResource as g}from"../../../../../base/test/common/utils.js";import{PLAINTEXT_LANGUAGE_ID as y}from"../../../../../editor/common/languages/modesRegistry.js";import"../../common/textfiles.js";import{createTextBufferFactory as v}from"../../../../../editor/common/model/textModel.js";import{timeout as R}from"../../../../../base/common/async.js";import{DisposableStore as C,toDisposable as k}from"../../../../../base/common/lifecycle.js";suite("Files - TextFileEditorModelManager",()=>{const s=new C;let f,l;setup(()=>{f=q(void 0,s),l=f.createInstance(I),s.add(k(()=>l.textFileService.files))}),teardown(()=>{s.clear()}),test("add, remove, clear, get, getAll",function(){const e=l.textFileService.files,t=s.add(f.createInstance(E,g.call(this,"/path/random1.txt"),"utf8",void 0)),i=s.add(f.createInstance(E,g.call(this,"/path/random2.txt"),"utf8",void 0)),r=s.add(f.createInstance(E,g.call(this,"/path/random3.txt"),"utf8",void 0));e.add(n.file("/test.html"),t),e.add(n.file("/some/other.html"),i),e.add(n.file("/some/this.txt"),r);const d=n.file("/TEST.html");o(!e.get(n.file("foo"))),o.strictEqual(e.get(n.file("/test.html")),t),o.ok(!e.get(d));let a=e.models;o.strictEqual(3,a.length);let c=e.get(n.file("/yes"));o.ok(!c),c=e.get(n.file("/some/other.txt")),o.ok(!c),c=e.get(n.file("/some/other.html")),o.ok(c),c=e.get(d),o.ok(!c),e.remove(n.file("")),a=e.models,o.strictEqual(3,a.length),e.remove(n.file("/some/other.html")),a=e.models,o.strictEqual(2,a.length),e.remove(d),a=e.models,o.strictEqual(2,a.length),e.dispose(),a=e.models,o.strictEqual(0,a.length)}),test("resolve",async()=>{const e=l.textFileService.files,t=n.file("/test.html"),i="utf8",r=[];s.add(e.onDidCreate(h=>{r.push(h)}));const d=e.resolve(t,{encoding:i});o.ok(e.get(t));const a=await d;o.ok(a),o.strictEqual(a.getEncoding(),i),o.strictEqual(e.get(t),a);const c=await e.resolve(t,{encoding:i});o.strictEqual(c,a),a.dispose();const x=await e.resolve(t,{encoding:i});o.notStrictEqual(x,c),o.strictEqual(e.get(t),x),x.dispose(),o.strictEqual(r.length,2),o.strictEqual(r[0].resource.toString(),a.resource.toString()),o.strictEqual(r[1].resource.toString(),c.resource.toString())}),test("resolve (async)",async()=>{const e=l.textFileService.files,t=n.file("/path/index.txt");s.add(await e.resolve(t));let i=!1;const r=new Promise(d=>{s.add(e.onDidResolve(({model:a})=>{a.resource.toString()===t.toString()&&(i=!0,d())}))});e.resolve(t,{reload:{async:!0}}),await r,o.strictEqual(i,!0)}),test("resolve (sync)",async()=>{const e=l.textFileService.files,t=n.file("/path/index.txt");s.add(await e.resolve(t));let i=!1;s.add(e.onDidResolve(({model:r})=>{r.resource.toString()===t.toString()&&(i=!0)})),await e.resolve(t,{reload:{async:!1}}),o.strictEqual(i,!0)}),test("resolve (sync) - model disposed when error and first call to resolve",async()=>{const e=l.textFileService.files,t=n.file("/path/index.txt");l.textFileService.setReadStreamErrorOnce(new F("fail",w.FILE_OTHER_ERROR));let i;try{s.add(await e.resolve(t))}catch(r){i=r}o.ok(i),o.strictEqual(e.models.length,0)}),test("resolve (sync) - model not disposed when error and model existed before",async()=>{const e=l.textFileService.files,t=n.file("/path/index.txt");s.add(await e.resolve(t)),l.textFileService.setReadStreamErrorOnce(new F("fail",w.FILE_OTHER_ERROR));let i;try{s.add(await e.resolve(t,{reload:{async:!1}}))}catch(r){i=r}o.ok(i),o.strictEqual(e.models.length,1)}),test("resolve with initial contents",async()=>{const e=l.textFileService.files,t=n.file("/test.html"),i=s.add(await e.resolve(t,{contents:v("Hello World")}));o.strictEqual(i.textEditorModel?.getValue(),"Hello World"),o.strictEqual(i.isDirty(),!0),s.add(await e.resolve(t,{contents:v("More Changes")})),o.strictEqual(i.textEditorModel?.getValue(),"More Changes"),o.strictEqual(i.isDirty(),!0)}),test("multiple resolves execute in sequence",async()=>{const e=l.textFileService.files,t=n.file("/test.html");let i;const r=[];s.add(e.onDidResolve(d=>{d.model.resource.toString()===t.toString()&&(i=s.add(d.model),r.push(d.model.textEditorModel.getValue()))})),await Promise.all([e.resolve(t),e.resolve(t,{contents:v("Hello World")}),e.resolve(t,{reload:{async:!1}}),e.resolve(t,{contents:v("More Changes")})]),o.ok(i instanceof E),o.strictEqual(i.textEditorModel?.getValue(),"More Changes"),o.strictEqual(i.isDirty(),!0),o.strictEqual(r[0],"Hello Html"),o.strictEqual(r[1],"Hello World"),o.strictEqual(r[2],"More Changes")}),test("removed from cache when model disposed",function(){const e=l.textFileService.files,t=s.add(f.createInstance(E,g.call(this,"/path/random1.txt"),"utf8",void 0)),i=s.add(f.createInstance(E,g.call(this,"/path/random2.txt"),"utf8",void 0)),r=s.add(f.createInstance(E,g.call(this,"/path/random3.txt"),"utf8",void 0));e.add(n.file("/test.html"),t),e.add(n.file("/some/other.html"),i),e.add(n.file("/some/this.txt"),r),o.strictEqual(e.get(n.file("/test.html")),t),t.dispose(),o(!e.get(n.file("/test.html")))}),test("events",async function(){const e=l.textFileService.files,t=g.call(this,"/path/index.txt"),i=g.call(this,"/path/other.txt");let r=0,d=0,a=0,c=0,x=0,h=0,S=0;s.add(e.onDidResolve(({model:u})=>{u.resource.toString()===t.toString()&&r++})),s.add(e.onDidRemove(u=>{(u.toString()===t.toString()||u.toString()===i.toString())&&d++})),s.add(e.onDidChangeDirty(u=>{u.resource.toString()===t.toString()&&(u.isDirty()?a++:c++)})),s.add(e.onDidRevert(u=>{u.resource.toString()===t.toString()&&x++})),s.add(e.onDidSave(({model:u})=>{u.resource.toString()===t.toString()&&h++})),s.add(e.onDidChangeEncoding(u=>{u.resource.toString()===t.toString()&&S++}));const m=await e.resolve(t,{encoding:"utf8"});o.strictEqual(r,1),l.fileService.fireFileChanges(new p([{resource:t,type:M.DELETED}],!1)),l.fileService.fireFileChanges(new p([{resource:t,type:M.ADDED}],!1));const T=await e.resolve(i,{encoding:"utf8"});o.strictEqual(r,2),m.updateTextEditorModel(v("changed")),m.updatePreferredEncoding("utf16"),await m.revert(),m.updateTextEditorModel(v("changed again")),await m.save(),m.dispose(),T.dispose(),await m.revert(),o.strictEqual(d,2),o.strictEqual(a,2),o.strictEqual(c,2),o.strictEqual(x,1),o.strictEqual(h,1),o.strictEqual(S,2),m.dispose(),T.dispose(),o.ok(!l.modelService.getModel(t)),o.ok(!l.modelService.getModel(i))}),test("disposing model takes it out of the manager",async function(){const e=l.textFileService.files,t=g.call(this,"/path/index_something.txt"),i=await e.resolve(t,{encoding:"utf8"});i.dispose(),o.ok(!e.get(t)),o.ok(!l.modelService.getModel(i.resource))}),test("canDispose with dirty model",async function(){const e=l.textFileService.files,t=g.call(this,"/path/index_something.txt"),i=s.add(await e.resolve(t,{encoding:"utf8"}));i.updateTextEditorModel(v("make dirty"));const r=e.canDispose(i);o.ok(r instanceof Promise);let d=!1;(async()=>d=await r)(),o.strictEqual(d,!1),i.revert({soft:!0}),await R(0),o.strictEqual(d,!0);const a=e.canDispose(i);o.strictEqual(a,!0)}),test("language",async function(){const e="text-file-model-manager-test";s.add(l.languageService.registerLanguage({id:e}));const t=l.textFileService.files,i=g.call(this,"/path/index_something.txt");let r=s.add(await t.resolve(i,{languageId:e}));o.strictEqual(r.textEditorModel.getLanguageId(),e),r=await t.resolve(i,{languageId:"text"}),o.strictEqual(r.textEditorModel.getLanguageId(),y)}),test("file change events trigger reload (on a resolved model)",async()=>{const e=l.textFileService.files,t=n.file("/path/index.txt");s.add(await e.resolve(t));let i=!1;const r=new Promise(d=>{s.add(e.onDidResolve(({model:a})=>{a.resource.toString()===t.toString()&&(i=!0,d())}))});l.fileService.fireFileChanges(new p([{resource:t,type:M.UPDATED}],!1)),await r,o.strictEqual(i,!0)}),test("file change events trigger reload (after a model is resolved: https://github.com/microsoft/vscode/issues/132765)",async()=>{const e=l.textFileService.files,t=n.file("/path/index.txt");e.resolve(t);let i=!1,r=0;const d=new Promise(a=>{s.add(e.onDidResolve(({model:c})=>{s.add(c),c.resource.toString()===t.toString()&&(r++,r===2&&(i=!0,a()))}))});l.fileService.fireFileChanges(new p([{resource:t,type:M.UPDATED}],!1)),await d,o.strictEqual(i,!0)}),D()});
