import t from"assert";import{URI as d}from"../../../../../base/common/uri.js";import{TextResourceEditorInput as u}from"../../../../common/editor/textResourceEditorInput.js";import"../../../../common/editor/textResourceEditorModel.js";import"../../../../../platform/instantiation/common/instantiation.js";import{workbenchInstantiationService as l,TestServiceAccessor as m}from"../../workbenchTestServices.js";import{snapshotToString as g}from"../../../../services/textfile/common/textfiles.js";import{PLAINTEXT_LANGUAGE_ID as c}from"../../../../../editor/common/languages/modesRegistry.js";import{DisposableStore as p}from"../../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as h}from"../../../../../base/test/common/utils.js";suite("TextResourceEditorInput",()=>{const r=new p;let s,n;setup(()=>{s=l(void 0,r),n=s.createInstance(m)}),teardown(()=>{r.clear()}),test("basics",async()=>{const a=d.from({scheme:"inmemory",authority:null,path:"thePath"});n.modelService.createModel("function test() {}",n.languageService.createById(c),a);const o=r.add(s.createInstance(u,a,"The Name","The Description",void 0,void 0)),e=r.add(await o.resolve());t.ok(e),t.strictEqual(g(e.createSnapshot()),"function test() {}")}),test("preferred language (via ctor)",async()=>{const a=n.languageService.registerLanguage({id:"resource-input-test"}),o=d.from({scheme:"inmemory",authority:null,path:"thePath"});n.modelService.createModel("function test() {}",n.languageService.createById(c),o);const e=r.add(s.createInstance(u,o,"The Name","The Description","resource-input-test",void 0)),i=r.add(await e.resolve());t.ok(i),t.strictEqual(i.textEditorModel?.getLanguageId(),"resource-input-test"),e.setLanguageId("text"),t.strictEqual(i.textEditorModel?.getLanguageId(),c),r.add(await e.resolve()),t.strictEqual(i.textEditorModel?.getLanguageId(),c),a.dispose()}),test("preferred language (via setPreferredLanguageId)",async()=>{const a=n.languageService.registerLanguage({id:"resource-input-test"}),o=d.from({scheme:"inmemory",authority:null,path:"thePath"});n.modelService.createModel("function test() {}",n.languageService.createById(c),o);const e=r.add(s.createInstance(u,o,"The Name","The Description",void 0,void 0));e.setPreferredLanguageId("resource-input-test");const i=r.add(await e.resolve());t.ok(i),t.strictEqual(i.textEditorModel?.getLanguageId(),"resource-input-test"),a.dispose()}),test("preferred contents (via ctor)",async()=>{const a=d.from({scheme:"inmemory",authority:null,path:"thePath"});n.modelService.createModel("function test() {}",n.languageService.createById(c),a);const o=r.add(s.createInstance(u,a,"The Name","The Description",void 0,"My Resource Input Contents")),e=r.add(await o.resolve());t.ok(e),t.strictEqual(e.textEditorModel?.getValue(),"My Resource Input Contents"),e.textEditorModel.setValue("Some other contents"),t.strictEqual(e.textEditorModel?.getValue(),"Some other contents"),r.add(await o.resolve()),t.strictEqual(e.textEditorModel?.getValue(),"Some other contents")}),test("preferred contents (via setPreferredContents)",async()=>{const a=d.from({scheme:"inmemory",authority:null,path:"thePath"});n.modelService.createModel("function test() {}",n.languageService.createById(c),a);const o=r.add(s.createInstance(u,a,"The Name","The Description",void 0,void 0));o.setPreferredContents("My Resource Input Contents");const e=r.add(await o.resolve());t.ok(e),t.strictEqual(e.textEditorModel?.getValue(),"My Resource Input Contents"),e.textEditorModel.setValue("Some other contents"),t.strictEqual(e.textEditorModel?.getValue(),"Some other contents"),r.add(await o.resolve()),t.strictEqual(e.textEditorModel?.getValue(),"Some other contents")}),h()});
