import{performCellDropEdits as c}from"../../browser/view/cellParts/cellDnd.js";import{CellKind as i}from"../../common/notebookCommon.js";import{withTestNotebook as l}from"./testNotebookEditor.js";import a from"assert";import"../../common/notebookRange.js";import{ensureNoDisposablesAreLeakedInTestSuite as g}from"../../../../../base/test/common/utils.js";async function e(s,d,r){await l(s.startOrder.map(t=>[t,"plaintext",i.Code,[]]),(t,n)=>{t.setSelections(s.selections),t.setFocus({start:s.focus,end:s.focus+1}),c(t,n.cellAt(d.dragIdx),d.direction,n.cellAt(d.dragOverIdx));for(const o in r.endOrder)a.equal(n.viewCells[o].getText(),r.endOrder[o]);a.equal(t.getSelections().length,1),a.deepStrictEqual(t.getSelections()[0],r.selection),a.deepStrictEqual(t.getFocus(),{start:r.focus,end:r.focus+1})})}suite("cellDND",()=>{g(),test("drag 1 cell",async()=>{await e({startOrder:["0","1","2","3"],selections:[{start:0,end:1}],focus:0},{dragIdx:0,dragOverIdx:1,direction:"below"},{endOrder:["1","0","2","3"],selection:{start:1,end:2},focus:1})}),test("drag multiple contiguous cells down",async()=>{await e({startOrder:["0","1","2","3"],selections:[{start:1,end:3}],focus:1},{dragIdx:1,dragOverIdx:3,direction:"below"},{endOrder:["0","3","1","2"],selection:{start:2,end:4},focus:2})}),test("drag multiple contiguous cells up",async()=>{await e({startOrder:["0","1","2","3"],selections:[{start:2,end:4}],focus:2},{dragIdx:3,dragOverIdx:0,direction:"above"},{endOrder:["2","3","0","1"],selection:{start:0,end:2},focus:0})}),test("drag ranges down",async()=>{await e({startOrder:["0","1","2","3"],selections:[{start:0,end:1},{start:2,end:3}],focus:0},{dragIdx:0,dragOverIdx:3,direction:"below"},{endOrder:["1","3","0","2"],selection:{start:2,end:4},focus:2})}),test("drag ranges up",async()=>{await e({startOrder:["0","1","2","3"],selections:[{start:1,end:2},{start:3,end:4}],focus:1},{dragIdx:1,dragOverIdx:0,direction:"above"},{endOrder:["1","3","0","2"],selection:{start:0,end:2},focus:0})}),test("drag ranges between ranges",async()=>{await e({startOrder:["0","1","2","3"],selections:[{start:0,end:1},{start:3,end:4}],focus:0},{dragIdx:0,dragOverIdx:1,direction:"below"},{endOrder:["1","0","3","2"],selection:{start:1,end:3},focus:1})}),test("drag ranges just above a range",async()=>{await e({startOrder:["0","1","2","3"],selections:[{start:1,end:2},{start:3,end:4}],focus:1},{dragIdx:1,dragOverIdx:1,direction:"above"},{endOrder:["0","1","3","2"],selection:{start:1,end:3},focus:1})}),test("drag ranges inside a range",async()=>{await e({startOrder:["0","1","2","3"],selections:[{start:0,end:2},{start:3,end:4}],focus:0},{dragIdx:0,dragOverIdx:0,direction:"below"},{endOrder:["0","1","3","2"],selection:{start:0,end:3},focus:0})}),test("dragged cell is not focused or selected",async()=>{await e({startOrder:["0","1","2","3"],selections:[{start:1,end:2}],focus:1},{dragIdx:2,dragOverIdx:3,direction:"below"},{endOrder:["0","1","3","2"],selection:{start:3,end:4},focus:3})})});