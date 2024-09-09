import t from"assert";import{DisposableStore as a}from"../../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as u}from"../../../../../base/test/common/utils.js";import{AbstractProgressScope as c,ScopedProgressIndicator as f}from"../../browser/progressIndicator.js";class d{fTotal=0;fWorked=0;fInfinite=!1;fDone=!1;infinite(){return this.fDone=null,this.fInfinite=!0,this}total(e){return this.fDone=null,this.fTotal=e,this}hasTotal(){return!!this.fTotal}worked(e){return this.fDone=null,this.fWorked?this.fWorked+=e:this.fWorked=e,this}done(){return this.fDone=!0,this.fInfinite=null,this.fWorked=null,this.fTotal=null,this}stop(){return this.done()}show(){}hide(){}}suite("Progress Indicator",()=>{const n=new a;teardown(()=>{n.clear()}),test("ScopedProgressIndicator",async()=>{const e=new d,o=n.add(new class extends c{constructor(){super("test.scopeId",!0)}testOnScopeOpened(l){super.onScopeOpened(l)}testOnScopeClosed(l){super.onScopeClosed(l)}}),r=n.add(new f(e,o));let s=r.show(!0);t.strictEqual(!0,e.fInfinite),s.done(),t.strictEqual(!0,e.fDone),s=r.show(100),t.strictEqual(!1,!!e.fInfinite),t.strictEqual(100,e.fTotal),s.worked(20),t.strictEqual(20,e.fWorked),s.total(80),t.strictEqual(80,e.fTotal),s.done(),t.strictEqual(!0,e.fDone),o.testOnScopeClosed("test.scopeId"),r.show(!0),t.strictEqual(!1,!!e.fInfinite),o.testOnScopeOpened("test.scopeId"),t.strictEqual(!0,e.fInfinite),o.testOnScopeClosed("test.scopeId"),s=r.show(100),s.total(80),s.worked(20),t.strictEqual(!1,!!e.fTotal),o.testOnScopeOpened("test.scopeId"),t.strictEqual(20,e.fWorked),t.strictEqual(80,e.fTotal);let i=Promise.resolve(null);await r.showWhile(i),t.strictEqual(!0,e.fDone),o.testOnScopeClosed("test.scopeId"),i=Promise.resolve(null),await r.showWhile(i),t.strictEqual(!0,e.fDone),o.testOnScopeOpened("test.scopeId"),t.strictEqual(!0,e.fDone)}),u()});
