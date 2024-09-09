var ee=Object.defineProperty;var se=Object.getOwnPropertyDescriptor;var L=(a,c,i,u)=>{for(var o=u>1?void 0:u?se(c,i):c,n=a.length-1,d;n>=0;n--)(d=a[n])&&(o=(u?d(c,i,o):d(o))||o);return u&&o&&ee(c,i,o),o},M=(a,c)=>(i,u)=>c(i,u,a);import e from"assert";import{Registry as h}from"../../../platform/registry/common/platform.js";import{Extensions as y}from"../../../platform/quickinput/common/quickAccess.js";import{IQuickInputService as te}from"../../../platform/quickinput/common/quickInput.js";import"../../../base/common/cancellation.js";import{TestServiceAccessor as re,workbenchInstantiationService as ie,createEditorPart as ce}from"./workbenchTestServices.js";import{DisposableStore as S,toDisposable as D}from"../../../base/common/lifecycle.js";import{timeout as k}from"../../../base/common/async.js";import{PickerQuickAccessProvider as _}from"../../../platform/quickinput/browser/pickerQuickAccess.js";import{URI as T}from"../../../base/common/uri.js";import{IEditorGroupsService as ae}from"../../services/editor/common/editorGroupsService.js";import{IEditorService as oe}from"../../services/editor/common/editorService.js";import{EditorService as le}from"../../services/editor/browser/editorService.js";import{PickerEditorState as ue}from"../../browser/quickaccess.js";import{EditorsOrder as ne}from"../../common/editor.js";import{Range as N}from"../../../editor/common/core/range.js";import"../../../platform/instantiation/test/common/instantiationServiceMock.js";suite("QuickAccess",()=>{let a,c,i,u=!1,o=!1,n=!1,d=!1,v=!1,E=!1,P=!1,g=!1,b=!1,I=!1,m=!1,A=!1,Q=class{constructor(r,t){this.quickInputService=r}provide(r,t){return e.ok(r),u=!0,t.onCancellationRequested(()=>o=!0),setTimeout(()=>this.quickInputService.quickAccess.show(O.prefix)),D(()=>n=!0)}};Q=L([M(0,te)],Q);class U{provide(r,t){return e.ok(r),d=!0,t.onCancellationRequested(()=>v=!0),D(()=>E=!0)}}class Y{provide(r,t){return e.ok(r),P=!0,t.onCancellationRequested(()=>g=!0),D(()=>b=!0)}}class j{provide(r,t){return e.ok(r),I=!0,t.onCancellationRequested(()=>m=!0),setTimeout(()=>r.hide()),D(()=>A=!0)}}const w={ctor:Q,prefix:"",helpEntries:[]},R={ctor:U,prefix:"test",helpEntries:[]},z={ctor:Y,prefix:"test something",helpEntries:[]},O={ctor:j,prefix:"changed",helpEntries:[]};setup(()=>{a=new S,c=ie(void 0,a),i=c.createInstance(re)}),teardown(()=>{a.dispose()}),test("registry",()=>{const s=h.as(y.Quickaccess),r=s.clear();e.ok(!s.getQuickAccessProvider("test"));const t=new S;t.add(s.registerQuickAccessProvider(w)),e(s.getQuickAccessProvider("")===w),e(s.getQuickAccessProvider("test")===w);const l=t.add(s.registerQuickAccessProvider(R));e(s.getQuickAccessProvider("test")===R);const C=s.getQuickAccessProviders();e(C.some(G=>G.prefix==="test")),l.dispose(),e(s.getQuickAccessProvider("test")===w),t.dispose(),e.ok(!s.getQuickAccessProvider("test")),r()}),test("provider",async()=>{const s=h.as(y.Quickaccess),r=s.clear(),t=new S;t.add(s.registerQuickAccessProvider(w)),t.add(s.registerQuickAccessProvider(R)),t.add(s.registerQuickAccessProvider(z)),t.add(s.registerQuickAccessProvider(O)),i.quickInputService.quickAccess.show("test"),e.strictEqual(u,!1),e.strictEqual(d,!0),e.strictEqual(P,!1),e.strictEqual(I,!1),e.strictEqual(o,!1),e.strictEqual(v,!1),e.strictEqual(g,!1),e.strictEqual(m,!1),e.strictEqual(n,!1),e.strictEqual(E,!1),e.strictEqual(b,!1),e.strictEqual(A,!1),d=!1,i.quickInputService.quickAccess.show("test something"),e.strictEqual(u,!1),e.strictEqual(d,!1),e.strictEqual(P,!0),e.strictEqual(I,!1),e.strictEqual(o,!1),e.strictEqual(v,!0),e.strictEqual(g,!1),e.strictEqual(m,!1),e.strictEqual(n,!1),e.strictEqual(E,!0),e.strictEqual(b,!1),e.strictEqual(A,!1),P=!1,v=!1,E=!1,i.quickInputService.quickAccess.show("usedefault"),e.strictEqual(u,!0),e.strictEqual(d,!1),e.strictEqual(P,!1),e.strictEqual(I,!1),e.strictEqual(o,!1),e.strictEqual(v,!1),e.strictEqual(g,!0),e.strictEqual(m,!1),e.strictEqual(n,!1),e.strictEqual(E,!1),e.strictEqual(b,!0),e.strictEqual(A,!1),await k(1),e.strictEqual(o,!0),e.strictEqual(n,!0),e.strictEqual(I,!0),await k(1),e.strictEqual(m,!0),e.strictEqual(A,!0),t.dispose(),r()});let p=!1,f=!1,q=!1,x=!1,F=!1;class B extends _{constructor(){super("fast")}_getPicks(r,t,l){return p=!0,[{label:"Fast Pick"}]}}class H extends _{constructor(){super("slow")}async _getPicks(r,t,l){return f=!0,await k(1),l.isCancellationRequested&&(x=!0),[{label:"Slow Pick"}]}}class J extends _{constructor(){super("bothFastAndSlow")}_getPicks(r,t,l){return q=!0,{picks:[{label:"Fast Pick"}],additionalPicks:(async()=>(await k(1),l.isCancellationRequested&&(F=!0),[{label:"Slow Pick"}]))()}}}const V={ctor:B,prefix:"fast",helpEntries:[]},K={ctor:H,prefix:"slow",helpEntries:[]},W={ctor:J,prefix:"bothFastAndSlow",helpEntries:[]};test("quick pick access - show()",async()=>{const s=h.as(y.Quickaccess),r=s.clear(),t=new S;t.add(s.registerQuickAccessProvider(V)),t.add(s.registerQuickAccessProvider(K)),t.add(s.registerQuickAccessProvider(W)),i.quickInputService.quickAccess.show("fast"),e.strictEqual(p,!0),e.strictEqual(f,!1),e.strictEqual(q,!1),p=!1,i.quickInputService.quickAccess.show("slow"),await k(2),e.strictEqual(p,!1),e.strictEqual(f,!0),e.strictEqual(x,!1),e.strictEqual(q,!1),f=!1,i.quickInputService.quickAccess.show("bothFastAndSlow"),await k(2),e.strictEqual(p,!1),e.strictEqual(f,!1),e.strictEqual(q,!0),e.strictEqual(F,!1),q=!1,i.quickInputService.quickAccess.show("slow"),i.quickInputService.quickAccess.show("bothFastAndSlow"),i.quickInputService.quickAccess.show("fast"),e.strictEqual(p,!0),e.strictEqual(f,!0),e.strictEqual(q,!0),await k(2),e.strictEqual(x,!0),e.strictEqual(F,!0),t.dispose(),r()}),test("quick pick access - pick()",async()=>{const s=h.as(y.Quickaccess),r=s.clear(),t=new S;t.add(s.registerQuickAccessProvider(V));const l=i.quickInputService.quickAccess.pick("fast");e.strictEqual(p,!0),e.ok(l instanceof Promise),t.dispose(),r()}),test("PickerEditorState can properly restore editors",async()=>{const s=await ce(c,a);c.stub(ae,s);const r=a.add(c.createInstance(le,void 0));c.stub(oe,r);const t=a.add(c.createInstance(ue));a.add(s),a.add(r);const l={resource:T.parse("foo://bar1"),options:{pinned:!0,preserveFocus:!0,selection:new N(1,0,1,3)}},C={resource:T.parse("foo://bar2"),options:{pinned:!0,selection:new N(1,0,1,3)}},G={resource:T.parse("foo://bar3")},X={resource:T.parse("foo://bar4")},Z=await r.openEditor(l);e.strictEqual(Z,r.activeEditorPane),t.set(),await r.openEditor(C),await t.openTransientEditor(G),await t.openTransientEditor(X),await t.restore(),e.strictEqual(s.activeGroup.activeEditor?.resource,l.resource),e.deepStrictEqual(s.activeGroup.getEditors(ne.MOST_RECENTLY_ACTIVE).map($=>$.resource),[l.resource,C.resource]),s.activeGroup.activeEditorPane?.getSelection&&e.deepStrictEqual(s.activeGroup.activeEditorPane?.getSelection(),l.options.selection),await s.activeGroup.closeAllEditors()})});
