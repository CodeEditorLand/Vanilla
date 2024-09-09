import e from"assert";import{DisposableStore as v}from"../../../../../base/common/lifecycle.js";import{URI as o}from"../../../../../base/common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as C}from"../../../../../base/test/common/utils.js";import{EditorResourceAccessor as k,isResourceSideBySideEditorInput as B,isSideBySideEditorInput as l}from"../../../../common/editor.js";import{EditorInput as b}from"../../../../common/editor/editorInput.js";import{SideBySideEditorInput as p}from"../../../../common/editor/sideBySideEditorInput.js";import{TestFileEditorInput as I,workbenchInstantiationService as y}from"../../workbenchTestServices.js";suite("SideBySideEditorInput",()=>{const t=new v;teardown(()=>{t.clear()});class c extends b{constructor(i=void 0){super();this.resource=i}fireCapabilitiesChangeEvent(){this._onDidChangeCapabilities.fire()}fireDirtyChangeEvent(){this._onDidChangeDirty.fire()}fireLabelChangeEvent(){this._onDidChangeLabel.fire()}get typeId(){return"myEditorInput"}resolve(){return null}toUntyped(){return{resource:this.resource,options:{override:this.typeId}}}matches(i){return super.matches(i)?!0:k.getCanonicalUri(i)?.toString()===this.resource?.toString()}}test("basics",()=>{const s=y(void 0,t);let d=0;const i=t.add(new c(o.file("/fake")));t.add(i.onWillDispose(()=>{e(!0),d++}));const r=t.add(new c(o.file("/fake2")));t.add(r.onWillDispose(()=>{e(!0),d++}));const n=t.add(s.createInstance(p,"name","description",i,r));e.strictEqual(n.getName(),"name"),e.strictEqual(n.getDescription(),"description"),e.ok(l(n)),e.ok(!l(i)),e.strictEqual(n.secondary,i),e.strictEqual(n.primary,r),e(n.matches(n)),e(!n.matches(r)),n.dispose(),e.strictEqual(d,0);const a=t.add(s.createInstance(p,void 0,void 0,i,i));e.strictEqual(a.getName(),i.getName()),e.strictEqual(a.getDescription(),i.getDescription()),e.strictEqual(a.getTitle(),i.getTitle()),e.strictEqual(a.resource?.toString(),i.resource?.toString())}),test("events dispatching",()=>{const s=y(void 0,t),d=t.add(new c),i=t.add(new c),r=t.add(s.createInstance(p,"name","description",i,d));e.ok(l(r));let n=0;t.add(r.onDidChangeCapabilities(()=>n++));let a=0;t.add(r.onDidChangeDirty(()=>a++));let u=0;t.add(r.onDidChangeLabel(()=>u++)),d.fireCapabilitiesChangeEvent(),e.strictEqual(n,1),i.fireCapabilitiesChangeEvent(),e.strictEqual(n,2),d.fireDirtyChangeEvent(),i.fireDirtyChangeEvent(),e.strictEqual(a,1),d.fireLabelChangeEvent(),i.fireLabelChangeEvent(),e.strictEqual(u,2)}),test("toUntyped",()=>{const s=y(void 0,t),d=t.add(new c(o.file("/fake"))),i=t.add(new c(o.file("/fake2"))),n=t.add(s.createInstance(p,"Side By Side Test",void 0,i,d)).toUntyped();e.ok(B(n))}),test("untyped matches",()=>{const s=y(void 0,t),d=t.add(new I(o.file("/fake"),"primaryId")),i=t.add(new I(o.file("/fake2"),"secondaryId")),r=t.add(s.createInstance(p,"Side By Side Test",void 0,i,d)),n={resource:o.file("/fake"),options:{override:"primaryId"}},a={resource:o.file("/fake2"),options:{override:"secondaryId"}},u={primary:n,secondary:a};e.ok(r.matches(u));const f={resource:o.file("/fake"),options:{override:"primaryIdWrong"}},m={resource:o.file("/fake2"),options:{override:"secondaryId"}},S={primary:f,secondary:m};e.ok(!r.matches(S));const E={resource:o.file("/fake"),options:{override:"primaryId"}},g={resource:o.file("/fake2Wrong"),options:{override:"secondaryId"}},h={primary:E,secondary:g};e.ok(!r.matches(h))}),C()});
