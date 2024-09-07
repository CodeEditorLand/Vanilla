import e from"assert";import{CancellationToken as i}from"../../../../../../base/common/cancellation.js";import{mock as b}from"../../../../../../base/test/common/mock.js";import{ensureNoDisposablesAreLeakedInTestSuite as y}from"../../../../../../base/test/common/utils.js";import"../../../../../../editor/common/model.js";import"../../../../../../editor/contrib/documentSymbols/browser/outlineModel.js";import"../../../browser/notebookBrowser.js";import{NotebookOutlineEntryFactory as u}from"../../../browser/viewModel/notebookOutlineEntryFactory.js";import"../../../common/notebookExecutionStateService.js";import"../testNotebookEditor.js";suite("Notebook Symbols",function(){y();const d={};function r(n,l="textId"){d[l]=n}const a=new class extends b(){getCellExecution(){}};class g{constructor(l){this.textId=l}getTopLevelSymbols(){return d[this.textId]}}const s=new class extends b(){getOrCreate(n,l){const t=new g(n.id);return Promise.resolve(t)}getDebounceValue(n){return 0}};function o(n=1,l="textId"){return{textBuffer:{getLineCount(){return 0}},getText(){return"# code"},model:{textModel:{id:l,getVersionId(){return n}}},resolveTextModel(){return this.model.textModel}}}test("Cell without symbols cache",function(){r([{name:"var",range:{}}]);const l=new u(a).getOutlineEntries(o(),0);e.equal(l.length,1,"no entries created"),e.equal(l[0].label,"# code","entry should fall back to first line of cell")}),test("Cell with simple symbols",async function(){r([{name:"var1",range:{}},{name:"var2",range:{}}]);const n=new u(a),l=o();await n.cacheSymbols(l,s,i.None);const t=n.getOutlineEntries(l,0);e.equal(t.length,3,"wrong number of outline entries"),e.equal(t[0].label,"# code"),e.equal(t[1].label,"var1"),e.equal(t[1].level,8),e.equal(t[1].index,1),e.equal(t[2].label,"var2"),e.equal(t[2].level,8),e.equal(t[2].index,2)}),test("Cell with nested symbols",async function(){r([{name:"root1",range:{},children:[{name:"nested1",range:{}},{name:"nested2",range:{}}]},{name:"root2",range:{},children:[{name:"nested1",range:{}}]}]);const n=new u(a),l=o();await n.cacheSymbols(l,s,i.None);const t=n.getOutlineEntries(o(),0);e.equal(t.length,6,"wrong number of outline entries"),e.equal(t[0].label,"# code"),e.equal(t[1].label,"root1"),e.equal(t[1].level,8),e.equal(t[2].label,"nested1"),e.equal(t[2].level,9),e.equal(t[3].label,"nested2"),e.equal(t[3].level,9),e.equal(t[4].label,"root2"),e.equal(t[4].level,8),e.equal(t[5].label,"nested1"),e.equal(t[5].level,9)}),test("Multiple Cells with symbols",async function(){r([{name:"var1",range:{}}],"$1"),r([{name:"var2",range:{}}],"$2");const n=new u(a),l=o(1,"$1"),t=o(1,"$2");await n.cacheSymbols(l,s,i.None),await n.cacheSymbols(t,s,i.None);const c=n.getOutlineEntries(o(1,"$1"),0),m=n.getOutlineEntries(o(1,"$2"),0);e.equal(c.length,2,"wrong number of outline entries"),e.equal(c[0].label,"# code"),e.equal(c[1].label,"var1"),e.equal(m.length,2,"wrong number of outline entries"),e.equal(m[0].label,"# code"),e.equal(m[1].label,"var2")})});