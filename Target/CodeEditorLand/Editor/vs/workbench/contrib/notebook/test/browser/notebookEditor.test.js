import e from"assert";import{mock as p}from"../../../../../base/test/common/mock.js";import"../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{FoldingModel as I,updateFoldingStateAtIndex as u}from"../../browser/viewModel/foldingModel.js";import{expandCellRangesWithHiddenCells as c}from"../../browser/notebookBrowser.js";import{CellKind as n}from"../../common/notebookCommon.js";import{createNotebookCellList as V,setupInstantiationService as E,withTestNotebook as q}from"./testNotebookEditor.js";import{ListViewInfoAccessor as R}from"../../browser/view/notebookCellList.js";import{ensureNoDisposablesAreLeakedInTestSuite as w}from"../../../../../base/test/common/utils.js";import{DisposableStore as A}from"../../../../../base/common/lifecycle.js";suite("ListViewInfoAccessor",()=>{let l,g;teardown(()=>{l.dispose()}),w(),setup(()=>{l=new A,g=E(l)}),test("basics",async function(){await q([["# header a","markdown",n.Markup,[],{}],["var b = 1;","javascript",n.Code,[],{}],["# header b","markdown",n.Markup,[],{}],["var b = 2;","javascript",n.Code,[],{}],["var c = 3;","javascript",n.Code,[],{}]],(C,t,i)=>{const s=i.add(new I);s.attachViewModel(t);const o=i.add(V(g,i));o.attachViewModel(t);const r=i.add(new R(o));e.strictEqual(r.getViewIndex(t.cellAt(0)),0),e.strictEqual(r.getViewIndex(t.cellAt(1)),1),e.strictEqual(r.getViewIndex(t.cellAt(2)),2),e.strictEqual(r.getViewIndex(t.cellAt(3)),3),e.strictEqual(r.getViewIndex(t.cellAt(4)),4),e.deepStrictEqual(r.getCellRangeFromViewRange(0,1),{start:0,end:1}),e.deepStrictEqual(r.getCellRangeFromViewRange(1,2),{start:1,end:2}),u(s,0,!0),u(s,2,!0),t.updateFoldingRanges(s.regions),o.setHiddenAreas(t.getHiddenRanges(),!0),e.strictEqual(r.getViewIndex(t.cellAt(0)),0),e.strictEqual(r.getViewIndex(t.cellAt(1)),-1),e.strictEqual(r.getViewIndex(t.cellAt(2)),1),e.strictEqual(r.getViewIndex(t.cellAt(3)),-1),e.strictEqual(r.getViewIndex(t.cellAt(4)),-1),e.deepStrictEqual(r.getCellRangeFromViewRange(0,1),{start:0,end:2}),e.deepStrictEqual(r.getCellRangeFromViewRange(1,2),{start:2,end:5}),e.deepStrictEqual(r.getCellsFromViewRange(0,1),t.getCellsInRange({start:0,end:2})),e.deepStrictEqual(r.getCellsFromViewRange(1,2),t.getCellsInRange({start:2,end:5}));const d=new class extends p(){getViewIndexByModelIndex(a){return r.getViewIndex(t.viewCells[a])}getCellRangeFromViewRange(a,m){return r.getCellRangeFromViewRange(a,m)}cellAt(a){return t.cellAt(a)}};e.deepStrictEqual(c(d,[{start:0,end:1}]),[{start:0,end:2}]),e.deepStrictEqual(c(d,[{start:2,end:3}]),[{start:2,end:5}]),e.deepStrictEqual(c(d,[{start:0,end:1},{start:2,end:3}]),[{start:0,end:5}])})})});
