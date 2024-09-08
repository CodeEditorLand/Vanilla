import a from"assert";import{ActionBar as h,prepareActions as p}from"../../browser/ui/actionbar/actionbar.js";import{Action as i,Separator as e}from"../../common/actions.js";import{ensureNoDisposablesAreLeakedInTestSuite as d}from"../common/utils.js";suite("Actionbar",()=>{const c=d();test("prepareActions()",function(){const r=new e,t=new e,s=c.add(new i("a3")),n=new e,u=new e,l=c.add(new i("a6")),A=new e,o=p([r,t,s,n,u,l,A]);a.strictEqual(o.length,3),a(o[0]===s),a(o[1]===u),a(o[2]===l)}),test("hasAction()",function(){const r=document.createElement("div"),t=c.add(new h(r)),s=c.add(new i("a1")),n=c.add(new i("a2"));t.push(s),a.strictEqual(t.hasAction(s),!0),a.strictEqual(t.hasAction(n),!1),t.pull(0),a.strictEqual(t.hasAction(s),!1),t.push(s,{index:1}),t.push(n,{index:0}),a.strictEqual(t.hasAction(s),!0),a.strictEqual(t.hasAction(n),!0),t.pull(0),a.strictEqual(t.hasAction(s),!0),a.strictEqual(t.hasAction(n),!1),t.pull(0),a.strictEqual(t.hasAction(s),!1),a.strictEqual(t.hasAction(n),!1),t.push(s),a.strictEqual(t.hasAction(s),!0),t.clear(),a.strictEqual(t.hasAction(s),!1)})});
