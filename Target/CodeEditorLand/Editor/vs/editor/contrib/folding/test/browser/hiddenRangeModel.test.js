import t from"assert";import"../../../../common/core/range.js";import{FoldingModel as l}from"../../browser/foldingModel.js";import{HiddenRangeModel as u}from"../../browser/hiddenRangeModel.js";import{computeRanges as o}from"../../browser/indentRangeProvider.js";import{createTextModel as c}from"../../../../test/common/testTextModel.js";import{TestDecorationProvider as g}from"./foldingModel.test.js";import{ensureNoDisposablesAreLeakedInTestSuite as f}from"../../../../../base/test/common/utils.js";suite("Hidden Range Model",()=>{f();function n(a,s){return{startLineNumber:a,endLineNumber:s}}function d(a,s,i){t.deepStrictEqual(a.map(e=>({startLineNumber:e.startLineNumber,endLineNumber:e.endLineNumber})),s,i)}test("hasRanges",()=>{const s=c(["/**"," * Comment"," */","class A {","  void foo() {","    if (true) {","      //hello","    }","  }","}"].join(`
`)),i=new l(s,new g(s)),e=new u(i);try{t.strictEqual(e.hasRanges(),!1);const r=o(s,!1,void 0);i.update(r),i.toggleCollapseState([i.getRegionAtLine(1),i.getRegionAtLine(6)]),d(e.hiddenRanges,[n(2,3),n(7,7)]),t.strictEqual(e.hasRanges(),!0),t.strictEqual(e.isHidden(1),!1),t.strictEqual(e.isHidden(2),!0),t.strictEqual(e.isHidden(3),!0),t.strictEqual(e.isHidden(4),!1),t.strictEqual(e.isHidden(5),!1),t.strictEqual(e.isHidden(6),!1),t.strictEqual(e.isHidden(7),!0),t.strictEqual(e.isHidden(8),!1),t.strictEqual(e.isHidden(9),!1),t.strictEqual(e.isHidden(10),!1),i.toggleCollapseState([i.getRegionAtLine(4)]),d(e.hiddenRanges,[n(2,3),n(5,9)]),t.strictEqual(e.hasRanges(),!0),t.strictEqual(e.isHidden(1),!1),t.strictEqual(e.isHidden(2),!0),t.strictEqual(e.isHidden(3),!0),t.strictEqual(e.isHidden(4),!1),t.strictEqual(e.isHidden(5),!0),t.strictEqual(e.isHidden(6),!0),t.strictEqual(e.isHidden(7),!0),t.strictEqual(e.isHidden(8),!0),t.strictEqual(e.isHidden(9),!0),t.strictEqual(e.isHidden(10),!1),i.toggleCollapseState([i.getRegionAtLine(1),i.getRegionAtLine(6),i.getRegionAtLine(4)]),d(e.hiddenRanges,[]),t.strictEqual(e.hasRanges(),!1),t.strictEqual(e.isHidden(1),!1),t.strictEqual(e.isHidden(2),!1),t.strictEqual(e.isHidden(3),!1),t.strictEqual(e.isHidden(4),!1),t.strictEqual(e.isHidden(5),!1),t.strictEqual(e.isHidden(6),!1),t.strictEqual(e.isHidden(7),!1),t.strictEqual(e.isHidden(8),!1),t.strictEqual(e.isHidden(9),!1),t.strictEqual(e.isHidden(10),!1)}finally{s.dispose(),e.dispose()}})});