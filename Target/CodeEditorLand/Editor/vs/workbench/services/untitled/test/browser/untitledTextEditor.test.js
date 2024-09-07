import e from"assert";import{URI as f}from"../../../../../base/common/uri.js";import{join as q}from"../../../../../base/common/path.js";import"../../../../../platform/instantiation/common/instantiation.js";import"../../common/untitledTextEditorService.js";import{workbenchInstantiationService as I,TestServiceAccessor as D}from"../../../../test/browser/workbenchTestServices.js";import{snapshotToString as k}from"../../../textfile/common/textfiles.js";import{PLAINTEXT_LANGUAGE_ID as y}from"../../../../../editor/common/languages/modesRegistry.js";import"../../../../../editor/common/core/editOperation.js";import{Range as T}from"../../../../../editor/common/core/range.js";import{UntitledTextEditorInput as d}from"../../common/untitledTextEditorInput.js";import"../../common/untitledTextEditorModel.js";import{CancellationToken as M}from"../../../../../base/common/cancellation.js";import{EditorInputCapabilities as m}from"../../../../common/editor.js";import{DisposableStore as C}from"../../../../../base/common/lifecycle.js";import{isReadable as L,isReadableStream as b}from"../../../../../base/common/stream.js";import{readableToBuffer as V,streamToBuffer as U}from"../../../../../base/common/buffer.js";import{LanguageDetectionLanguageEventSource as R}from"../../../languageDetection/common/languageDetectionWorkerService.js";import{ensureNoDisposablesAreLeakedInTestSuite as N}from"../../../../../base/test/common/utils.js";import{timeout as W}from"../../../../../base/common/async.js";suite("Untitled text editors",()=>{class S extends d{getModel(){return this.model}}const o=new C;let c,n;setup(()=>{c=I(void 0,o),n=c.createInstance(D),o.add(n.untitledTextEditorService)}),teardown(()=>{o.clear()}),test("basics",async()=>{const a=n.untitledTextEditorService,r=n.workingCopyService,i=[];o.add(a.onDidCreate(w=>{i.push(w)}));const t=c.createInstance(S,a.create());await t.resolve(),e.strictEqual(a.get(t.resource),t.getModel()),e.ok(!n.untitledTextEditorService.isUntitledWithAssociatedResource(t.resource)),e.strictEqual(i.length,1),e.strictEqual(i[0].resource.toString(),t.getModel().resource.toString()),e.ok(a.get(t.resource)),e.ok(!a.get(f.file("testing"))),e.ok(t.hasCapability(m.Untitled)),e.ok(!t.hasCapability(m.Readonly)),e.ok(!t.isReadonly()),e.ok(!t.hasCapability(m.Singleton)),e.ok(!t.hasCapability(m.RequiresTrust)),e.ok(!t.hasCapability(m.Scratchpad));const s=c.createInstance(S,a.create());e.strictEqual(a.get(s.resource),s.getModel());const l=t.toUntyped({preserveViewState:0});e.strictEqual(l.forceUntitled,!0),e.strictEqual(a.get(t.resource),t.getModel()),e.strictEqual(a.get(s.resource),s.getModel()),await t.revert(0),e.ok(t.isDisposed()),e.ok(!a.get(t.resource));const u=await s.resolve();e.strictEqual(await a.resolve({untitledResource:s.resource}),u),e.ok(a.get(u.resource)),e.strictEqual(i.length,2),e.strictEqual(i[1].resource.toString(),s.resource.toString()),e.ok(!s.isDirty());const E=h(n.untitledTextEditorService);u.textEditorModel?.setValue("foo bar");const v=await E;e.strictEqual(v.toString(),s.resource.toString()),e.ok(s.isDirty());const p=s.toUntyped({preserveViewState:0});e.strictEqual(p.contents,"foo bar"),e.strictEqual(p.resource,void 0);const g=s.toUntyped({preserveViewState:0,preserveResource:!0});e.strictEqual(g.contents,"foo bar"),e.strictEqual(g?.resource?.toString(),s.resource.toString());const x=s.toUntyped();e.strictEqual(x.resource?.toString(),s.resource.toString()),e.strictEqual(x.contents,void 0),e.ok(r.isDirty(s.resource)),e.strictEqual(r.dirtyCount,1),await t.revert(0),await s.revert(0),e.ok(!a.get(t.resource)),e.ok(!a.get(s.resource)),e.ok(!s.isDirty()),e.ok(!u.isDirty()),e.ok(!r.isDirty(s.resource)),e.strictEqual(r.dirtyCount,0),await t.revert(0),e.ok(t.isDisposed()),e.ok(!a.get(t.resource)),s.dispose(),e.ok(!a.get(s.resource))});function h(a){return new Promise(r=>{const i=a.onDidChangeDirty(async t=>{i.dispose(),r(t.resource)})})}test("associated resource is dirty",async()=>{const a=n.untitledTextEditorService,r=f.file(q("C:\\","/foo/file.txt"));let i;o.add(a.onDidChangeDirty(u=>{i=u}));const t=o.add(a.create({associatedResource:r}));e.ok(n.untitledTextEditorService.isUntitledWithAssociatedResource(t.resource));const s=o.add(c.createInstance(d,t));e.ok(s.isDirty()),e.strictEqual(t,i);const l=await s.resolve();e.ok(l.hasAssociatedFilePath),e.strictEqual(s.isDirty(),!0)}),test("no longer dirty when content gets empty (not with associated resource)",async()=>{const a=n.untitledTextEditorService,r=n.workingCopyService,i=o.add(c.createInstance(d,a.create())),t=o.add(await i.resolve());t.textEditorModel?.setValue("foo bar"),e.ok(t.isDirty()),e.ok(r.isDirty(t.resource,t.typeId)),t.textEditorModel?.setValue(""),e.ok(!t.isDirty()),e.ok(!r.isDirty(t.resource,t.typeId))}),test("via create options",async()=>{const a=n.untitledTextEditorService,r=o.add(c.createInstance(d,a.create())),i=o.add(await r.resolve());i.textEditorModel.setValue("foo bar"),e.ok(i.isDirty()),i.textEditorModel.setValue(""),e.ok(!i.isDirty());const t=o.add(c.createInstance(d,a.create({initialValue:"Hello World"}))),s=o.add(await t.resolve());e.strictEqual(k(s.createSnapshot()),"Hello World");const l=o.add(c.createInstance(d,o.add(a.create()))),u=o.add(c.createInstance(d,a.create({untitledResource:l.resource}))),E=o.add(await u.resolve());e.strictEqual(E.resource.toString(),l.resource.toString());const v=f.file(q("C:\\","/foo/file44.txt")),p=o.add(c.createInstance(d,a.create({associatedResource:v}))),g=o.add(await p.resolve());e.ok(g.hasAssociatedFilePath),e.ok(g.isDirty())}),test("associated path remains dirty when content gets empty",async()=>{const a=n.untitledTextEditorService,r=f.file(q("C:\\","/foo/file.txt")),i=o.add(c.createInstance(d,a.create({associatedResource:r}))),t=o.add(await i.resolve());t.textEditorModel?.setValue("foo bar"),e.ok(t.isDirty()),t.textEditorModel?.setValue(""),e.ok(t.isDirty())}),test("initial content is dirty",async()=>{const a=n.untitledTextEditorService,r=n.workingCopyService,i=o.add(c.createInstance(S,a.create({initialValue:"Hello World"})));e.ok(i.isDirty());const t=(await i.getModel().backup(M.None)).content;if(b(t)){const l=await U(t);e.strictEqual(l.toString(),"Hello World")}else if(L(t)){const l=V(t);e.strictEqual(l.toString(),"Hello World")}else e.fail("Missing untitled backup");const s=o.add(await i.resolve());e.ok(s.isDirty()),e.strictEqual(r.dirtyCount,1)}),test("created with files.defaultLanguage setting",()=>{const a="javascript",r=n.testConfigurationService;r.setUserConfiguration("files",{defaultLanguage:a});const i=n.untitledTextEditorService,t=o.add(i.create());e.strictEqual(t.getLanguageId(),a),r.setUserConfiguration("files",{defaultLanguage:void 0})}),test("created with files.defaultLanguage setting (${activeEditorLanguage})",async()=>{const a=n.testConfigurationService;a.setUserConfiguration("files",{defaultLanguage:"${activeEditorLanguage}"}),n.editorService.activeTextEditorLanguageId="typescript";const r=n.untitledTextEditorService,i=o.add(r.create());e.strictEqual(i.getLanguageId(),"typescript"),a.setUserConfiguration("files",{defaultLanguage:void 0}),n.editorService.activeTextEditorLanguageId=void 0}),test("created with language overrides files.defaultLanguage setting",()=>{const a="typescript",r="javascript",i=n.testConfigurationService;i.setUserConfiguration("files",{defaultLanguage:r});const t=n.untitledTextEditorService,s=o.add(t.create({languageId:a}));e.strictEqual(s.getLanguageId(),a),i.setUserConfiguration("files",{defaultLanguage:void 0})}),test("can change language afterwards",async()=>{const a="untitled-input-test";o.add(n.languageService.registerLanguage({id:a}));const r=n.untitledTextEditorService,i=o.add(c.createInstance(d,r.create({languageId:a})));e.strictEqual(i.getLanguageId(),a);const t=o.add(await i.resolve());e.strictEqual(t.getLanguageId(),a),i.setLanguageId(y),e.strictEqual(i.getLanguageId(),y)}),test("remembers that language was set explicitly",async()=>{o.add(n.languageService.registerLanguage({id:"untitled-input-test"}));const r=n.untitledTextEditorService,i=o.add(r.create()),t=o.add(c.createInstance(d,i));e.ok(!t.hasLanguageSetExplicitly),t.setLanguageId(y),e.ok(t.hasLanguageSetExplicitly),e.strictEqual(t.getLanguageId(),y)}),test("remembers that language was set explicitly if set by another source (i.e. ModelService)",async()=>{const a="untitled-input-test";o.add(n.languageService.registerLanguage({id:a}));const r=n.untitledTextEditorService,i=o.add(r.create()),t=o.add(c.createInstance(d,i));o.add(await t.resolve()),e.ok(!t.hasLanguageSetExplicitly),i.textEditorModel.setLanguage(n.languageService.createById(a)),e.ok(t.hasLanguageSetExplicitly),e.strictEqual(i.getLanguageId(),a)}),test("Language is not set explicitly if set by language detection source",async()=>{const a="untitled-input-test";o.add(n.languageService.registerLanguage({id:a}));const r=n.untitledTextEditorService,i=o.add(r.create()),t=o.add(c.createInstance(d,i));await t.resolve(),e.ok(!t.hasLanguageSetExplicitly),i.textEditorModel.setLanguage(n.languageService.createById(a),R),e.ok(!t.hasLanguageSetExplicitly),e.strictEqual(i.getLanguageId(),a)}),test("service#onDidChangeEncoding",async()=>{const a=n.untitledTextEditorService,r=o.add(c.createInstance(d,a.create()));let i=0;o.add(a.onDidChangeEncoding(s=>{i++,e.strictEqual(s.resource.toString(),r.resource.toString())})),await o.add(await r.resolve()).setEncoding("utf16"),e.strictEqual(i,1)}),test("service#onDidChangeLabel",async()=>{const a=n.untitledTextEditorService,r=o.add(c.createInstance(d,a.create()));let i=0;o.add(a.onDidChangeLabel(s=>{i++,e.strictEqual(s.resource.toString(),r.resource.toString())})),o.add(await r.resolve()).textEditorModel?.setValue("Foo Bar"),e.strictEqual(i,1)}),test("service#onWillDispose",async()=>{const a=n.untitledTextEditorService,r=o.add(c.createInstance(d,a.create()));let i=0;o.add(a.onWillDispose(s=>{i++,e.strictEqual(s.resource.toString(),r.resource.toString())}));const t=o.add(await r.resolve());e.strictEqual(i,0),t.dispose(),e.strictEqual(i,1)}),test("service#getValue",async()=>{const a=n.untitledTextEditorService,r=o.add(c.createInstance(d,a.create())),i=o.add(await r.resolve());i.textEditorModel.setValue("foo bar"),e.strictEqual(a.getValue(i.resource),"foo bar"),i.dispose(),e.strictEqual(a.getValue(f.parse("https://www.microsoft.com")),void 0)}),test("model#onDidChangeContent",async function(){const a=n.untitledTextEditorService,r=o.add(c.createInstance(d,a.create()));let i=0;const t=o.add(await r.resolve());o.add(t.onDidChangeContent(()=>i++)),t.textEditorModel?.setValue("foo"),e.strictEqual(i,1,"Dirty model should trigger event"),t.textEditorModel?.setValue("bar"),e.strictEqual(i,2,"Content change when dirty should trigger event"),t.textEditorModel?.setValue(""),e.strictEqual(i,3,"Manual revert should trigger event"),t.textEditorModel?.setValue("foo"),e.strictEqual(i,4,"Dirty model should trigger event")}),test("model#onDidRevert and input disposed when reverted",async function(){const a=n.untitledTextEditorService,r=o.add(c.createInstance(d,a.create()));let i=0;const t=o.add(await r.resolve());o.add(t.onDidRevert(()=>i++)),t.textEditorModel?.setValue("foo"),await t.revert(),e.ok(r.isDisposed()),e.ok(i===1)}),test("model#onDidChangeName and input name",async function(){const a=n.untitledTextEditorService,r=o.add(c.createInstance(d,a.create()));let i=0,t=o.add(await r.resolve());o.add(t.onDidChangeName(()=>i++)),t.textEditorModel?.setValue("foo"),e.strictEqual(r.getName(),"foo"),e.strictEqual(t.name,"foo"),e.strictEqual(i,1),t.textEditorModel?.setValue("bar"),e.strictEqual(r.getName(),"bar"),e.strictEqual(t.name,"bar"),e.strictEqual(i,2),t.textEditorModel?.setValue(""),e.strictEqual(r.getName(),"Untitled-1"),e.strictEqual(t.name,"Untitled-1"),t.textEditorModel?.setValue("        "),e.strictEqual(r.getName(),"Untitled-1"),e.strictEqual(t.name,"Untitled-1"),t.textEditorModel?.setValue("([]}"),e.strictEqual(r.getName(),"Untitled-1"),e.strictEqual(t.name,"Untitled-1"),t.textEditorModel?.setValue("([]}hello   "),e.strictEqual(r.getName(),"([]}hello"),e.strictEqual(t.name,"([]}hello"),t.textEditorModel?.setValue("12345678901234567890123456789012345678901234567890"),e.strictEqual(r.getName(),"1234567890123456789012345678901234567890"),e.strictEqual(t.name,"1234567890123456789012345678901234567890"),t.textEditorModel?.setValue("123456789012345678901234567890123456789\u{1F31E}"),e.strictEqual(r.getName(),"123456789012345678901234567890123456789"),e.strictEqual(t.name,"123456789012345678901234567890123456789"),t.textEditorModel?.setValue("hello\u202Eworld"),e.strictEqual(r.getName(),"helloworld"),e.strictEqual(t.name,"helloworld"),e.strictEqual(i,7),t.textEditorModel?.setValue(`Hello
World`),e.strictEqual(i,8);function s(u,E,v,p=E,g=v){return{range:new T(p,g,E,v),text:u,forceMoveMarkers:!1}}t.textEditorModel?.applyEdits([s("hello",2,2)]),e.strictEqual(i,8),r.dispose(),t.dispose();const l=o.add(c.createInstance(d,a.create({initialValue:"Foo"})));t=o.add(await l.resolve()),e.strictEqual(l.getName(),"Foo")}),test("model#onDidChangeDirty",async function(){const a=n.untitledTextEditorService,r=o.add(c.createInstance(d,a.create()));let i=0;const t=o.add(await r.resolve());o.add(t.onDidChangeDirty(()=>i++)),t.textEditorModel?.setValue("foo"),e.strictEqual(i,1,"Dirty model should trigger event"),t.textEditorModel?.setValue("bar"),e.strictEqual(i,1,"Another change does not fire event")}),test("model#onDidChangeEncoding",async function(){const a=n.untitledTextEditorService,r=o.add(c.createInstance(d,a.create()));let i=0;const t=o.add(await r.resolve());o.add(t.onDidChangeEncoding(()=>i++)),await t.setEncoding("utf16"),e.strictEqual(i,1,"Dirty model should trigger event"),await t.setEncoding("utf16"),e.strictEqual(i,1,"Another change to same encoding does not fire event")}),test("canDispose with dirty model",async function(){const a=n.untitledTextEditorService,r=o.add(c.createInstance(d,a.create())),i=o.add(await r.resolve());i.textEditorModel?.setValue("foo");const t=a.canDispose(i);e.ok(t instanceof Promise);let s=!1;(async()=>s=await t)(),e.strictEqual(s,!1),i.revert({soft:!0}),await W(0),e.strictEqual(s,!0);const l=a.canDispose(i);e.strictEqual(l,!0)}),N()});