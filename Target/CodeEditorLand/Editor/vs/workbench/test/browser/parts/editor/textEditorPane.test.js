import o from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as I,toResource as T}from"../../../../../base/test/common/utils.js";import{IEditorService as v}from"../../../../services/editor/common/editorService.js";import{workbenchInstantiationService as x,TestServiceAccessor as F,registerTestFileEditor as D,createEditorPart as P}from"../../workbenchTestServices.js";import"../../../../services/textfile/common/textfiles.js";import{IEditorGroupsService as g}from"../../../../services/editor/common/editorGroupsService.js";import{DisposableStore as h}from"../../../../../base/common/lifecycle.js";import{EditorService as R}from"../../../../services/editor/browser/editorService.js";import{EditorPaneSelectionChangeReason as d,EditorPaneSelectionCompareResult as n,isEditorPaneWithSelection as S}from"../../../../common/editor.js";import{DeferredPromise as A}from"../../../../../base/common/async.js";import{TextEditorPaneSelection as E}from"../../../../browser/parts/editor/textEditor.js";import{Selection as a}from"../../../../../editor/common/core/selection.js";import"../../../../../platform/editor/common/editor.js";suite("TextEditorPane",()=>{const r=new h;setup(()=>{r.add(D())}),teardown(()=>{r.clear()});async function u(){const e=x(void 0,r),i=await P(e,r);e.stub(g,i);const t=r.add(e.createInstance(R,void 0));return e.stub(v,t),e.createInstance(F)}test("editor pane selection",async function(){const e=await u(),i=T.call(this,"/path/index.txt");let t=await e.editorService.openEditor({resource:i});o.ok(t&&S(t));const s=new A;r.add(t.onDidChangeSelection(m=>{m.reason===d.EDIT&&s.complete(m)}));const c=r.add(await e.textFileService.files.resolve(i));c.textEditorModel.setValue("Hello World");const w=await s.p;o.strictEqual(w.reason,d.EDIT),t.setSelection(new a(1,1,1,1),d.USER);const l=t.getSelection();o.ok(l),await t.group.closeAllEditors();const f=l.restore({});t=await e.editorService.openEditor({resource:i,options:f}),o.ok(t&&S(t));const p=t.getSelection();o.ok(p),o.strictEqual(p.compare(l),n.IDENTICAL),await c.revert(),await t.group.closeAllEditors()}),test("TextEditorPaneSelection",function(){const e=new E(new a(1,1,2,2)),i=new E(new a(5,5,6,6)),t=new E(new a(50,50,60,60)),s={compare:()=>{throw new Error},restore:c=>c};o.strictEqual(e.compare(e),n.IDENTICAL),o.strictEqual(e.compare(i),n.SIMILAR),o.strictEqual(e.compare(t),n.DIFFERENT),o.strictEqual(e.compare(s),n.DIFFERENT)}),I()});
