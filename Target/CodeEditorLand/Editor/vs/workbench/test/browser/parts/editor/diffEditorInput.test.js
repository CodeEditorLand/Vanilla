import n from"assert";import{EditorInput as l}from"../../../../common/editor/editorInput.js";import{DiffEditorInput as u}from"../../../../common/editor/diffEditorInput.js";import{workbenchInstantiationService as c}from"../../workbenchTestServices.js";import{EditorResourceAccessor as I,isDiffEditorInput as a,isResourceDiffEditorInput as m,isResourceSideBySideEditorInput as E}from"../../../../common/editor.js";import{URI as p}from"../../../../../base/common/uri.js";import{DisposableStore as h}from"../../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as w}from"../../../../../base/test/common/utils.js";suite("Diff editor input",()=>{class s extends l{constructor(t=void 0){super();this.resource=t}get typeId(){return"myEditorInput"}resolve(){return null}toUntyped(){return{resource:this.resource,options:{override:this.typeId}}}matches(t){return super.matches(t)?!0:I.getCanonicalUri(t)?.toString()===this.resource?.toString()}}const e=new h;teardown(()=>{e.clear()}),test("basics",()=>{const d=c(void 0,e);let r=0;const t=e.add(new s);e.add(t.onWillDispose(()=>{n(!0),r++}));const i=e.add(new s);e.add(i.onWillDispose(()=>{n(!0),r++}));const o=d.createInstance(u,"name","description",t,i,void 0);n.ok(a(o)),n.ok(!a(t)),n.strictEqual(o.original,t),n.strictEqual(o.modified,i),n(o.matches(o)),n(!o.matches(i)),o.dispose(),n.strictEqual(r,0)}),test("toUntyped",()=>{const d=c(void 0,e),r=e.add(new s(p.file("foo/bar1"))),t=e.add(new s(p.file("foo/bar2"))),i=d.createInstance(u,"name","description",r,t,void 0),o=i.toUntyped();n.ok(m(o)),n.ok(!E(o)),n.ok(i.matches(o))}),test("disposes when input inside disposes",function(){const d=c(void 0,e);let r=0,t=e.add(new s),i=e.add(new s);const o=e.add(d.createInstance(u,"name","description",t,i,void 0));e.add(o.onWillDispose(()=>{r++,n(!0)})),t.dispose(),t=e.add(new s),i=e.add(new s);const f=e.add(d.createInstance(u,"name","description",t,i,void 0));e.add(f.onWillDispose(()=>{r++,n(!0)})),i.dispose(),n.strictEqual(r,2)}),w()});