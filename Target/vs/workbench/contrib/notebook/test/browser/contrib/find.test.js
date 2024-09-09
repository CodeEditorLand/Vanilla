import t from"assert";import{Range as E}from"../../../../../../editor/common/core/range.js";import{FindMatch as v,ValidAnnotatedEditOperation as C}from"../../../../../../editor/common/model.js";import{USUAL_WORD_SEPARATORS as b}from"../../../../../../editor/common/core/wordHelper.js";import{ILanguageService as F}from"../../../../../../editor/common/languages/language.js";import{FindReplaceState as m}from"../../../../../../editor/contrib/find/browser/findState.js";import{IConfigurationService as p}from"../../../../../../platform/configuration/common/configuration.js";import{TestConfigurationService as S}from"../../../../../../platform/configuration/test/common/testConfigurationService.js";import"../../../browser/contrib/find/findFilters.js";import{CellFindMatchModel as R,FindModel as w}from"../../../browser/contrib/find/findModel.js";import"../../../browser/notebookBrowser.js";import"../../../browser/viewModel/notebookViewModelImpl.js";import{CellEditType as k,CellKind as n}from"../../../common/notebookCommon.js";import{TestCell as y,withTestNotebook as f}from"../testNotebookEditor.js";import{ensureNoDisposablesAreLeakedInTestSuite as I}from"../../../../../../base/test/common/utils.js";suite("Notebook Find",()=>{const i=I(),q={value:b},M=new class extends S{inspect(){return q}},g=(r,u)=>{r.changeModelDecorations=c=>c({deltaDecorations:(d,a)=>{const e=[];return a.forEach(l=>{const o=u.viewCells.find(s=>s.handle===l.ownerId)?.deltaModelDecorations([],l.decorations)??[];o.length>0&&e.push({ownerId:l.ownerId,decorations:o})}),e}})};test("Update find matches basics",async function(){await f([["# header 1","markdown",n.Markup,[],{}],["paragraph 1","markdown",n.Markup,[],{}],["paragraph 2","markdown",n.Markup,[],{}]],async(r,u,c,d)=>{d.stub(p,M);const a=i.add(new m),e=i.add(new w(r,a,d.get(p))),l=new Promise(o=>i.add(a.onFindReplaceStateChange(s=>{s.matchesCount&&o(!0)})));a.change({isRevealed:!0},!0),a.change({searchString:"1"},!0),await l,t.strictEqual(e.findMatches.length,2),t.strictEqual(e.currentMatch,0),e.find({previous:!1}),t.strictEqual(e.currentMatch,1),e.find({previous:!1}),t.strictEqual(e.currentMatch,0),e.find({previous:!1}),t.strictEqual(e.currentMatch,1),t.strictEqual(r.textModel.length,3);const h=new Promise(o=>i.add(a.onFindReplaceStateChange(s=>{s.matchesCount&&o(!0)})));r.textModel.applyEdits([{editType:k.Replace,index:3,count:0,cells:[i.add(new y(u.viewType,3,"# next paragraph 1","markdown",n.Code,[],d.get(F)))]}],!0,void 0,()=>{},void 0,!0),await h,t.strictEqual(r.textModel.length,4),t.strictEqual(e.findMatches.length,3),t.strictEqual(e.currentMatch,1)})}),test("Update find matches basics 2",async function(){await f([["# header 1","markdown",n.Markup,[],{}],["paragraph 1.1","markdown",n.Markup,[],{}],["paragraph 1.2","markdown",n.Markup,[],{}],["paragraph 1.3","markdown",n.Markup,[],{}],["paragraph 2","markdown",n.Markup,[],{}]],async(r,u,c,d)=>{g(r,u),d.stub(p,M);const a=i.add(new m),e=i.add(new w(r,a,d.get(p))),l=new Promise(o=>i.add(a.onFindReplaceStateChange(s=>{s.matchesCount&&o(!0)})));a.change({isRevealed:!0},!0),a.change({searchString:"1"},!0),await l,t.strictEqual(e.findMatches.length,4),t.strictEqual(e.currentMatch,0),e.find({previous:!1}),t.strictEqual(e.currentMatch,1),e.find({previous:!1}),t.strictEqual(e.currentMatch,2),e.find({previous:!1}),t.strictEqual(e.currentMatch,3);const h=new Promise(o=>i.add(a.onFindReplaceStateChange(s=>{s.matchesCount&&o(!0)})));r.textModel.applyEdits([{editType:k.Replace,index:2,count:1,cells:[]}],!0,void 0,()=>{},void 0,!0),await h,t.strictEqual(e.findMatches.length,3),t.strictEqual(e.currentMatch,0),e.find({previous:!0}),t.strictEqual(e.currentMatch,3),e.find({previous:!1}),t.strictEqual(e.currentMatch,0),e.find({previous:!1}),t.strictEqual(e.currentMatch,1),e.find({previous:!1}),t.strictEqual(e.currentMatch,2)})}),test("Update find matches basics 3",async function(){await f([["# header 1","markdown",n.Markup,[],{}],["paragraph 1.1","markdown",n.Markup,[],{}],["paragraph 1.2","markdown",n.Markup,[],{}],["paragraph 1.3","markdown",n.Markup,[],{}],["paragraph 2","markdown",n.Markup,[],{}]],async(r,u,c,d)=>{g(r,u),d.stub(p,M);const a=i.add(new m),e=i.add(new w(r,a,d.get(p))),l=new Promise(o=>i.add(a.onFindReplaceStateChange(s=>{s.matchesCount&&o(!0)})));a.change({isRevealed:!0},!0),a.change({searchString:"1"},!0),await l,t.strictEqual(e.findMatches.length,4),t.strictEqual(e.currentMatch,0),e.find({previous:!0}),t.strictEqual(e.currentMatch,4);const h=new Promise(o=>i.add(a.onFindReplaceStateChange(s=>{s.matchesCount&&o(!0)})));r.textModel.applyEdits([{editType:k.Replace,index:2,count:1,cells:[]}],!0,void 0,()=>{},void 0,!0),await h,t.strictEqual(e.findMatches.length,3),t.strictEqual(e.currentMatch,0),e.find({previous:!0}),t.strictEqual(e.currentMatch,3),e.find({previous:!0}),t.strictEqual(e.currentMatch,2)})}),test("Update find matches, #112748",async function(){await f([["# header 1","markdown",n.Markup,[],{}],["paragraph 1.1","markdown",n.Markup,[],{}],["paragraph 1.2","markdown",n.Markup,[],{}],["paragraph 1.3","markdown",n.Markup,[],{}],["paragraph 2","markdown",n.Markup,[],{}]],async(r,u,c,d)=>{g(r,u),d.stub(p,M);const a=i.add(new m),e=i.add(new w(r,a,d.get(p))),l=new Promise(o=>i.add(a.onFindReplaceStateChange(s=>{s.matchesCount&&o(!0)})));a.change({isRevealed:!0},!0),a.change({searchString:"1"},!0),await l,t.strictEqual(e.findMatches.length,4),t.strictEqual(e.currentMatch,0),e.find({previous:!1}),e.find({previous:!1}),e.find({previous:!1}),t.strictEqual(e.currentMatch,3);const h=new Promise(o=>i.add(a.onFindReplaceStateChange(s=>{s.matchesCount&&o(!0)})));u.viewCells[1].textBuffer.applyEdits([new C(null,new E(1,1,1,14),"",!1,!1,!1)],!1,!0),e.research(),await h,t.strictEqual(e.currentMatch,1)})}),test("Reset when match not found, #127198",async function(){await f([["# header 1","markdown",n.Markup,[],{}],["paragraph 1","markdown",n.Markup,[],{}],["paragraph 2","markdown",n.Markup,[],{}]],async(r,u,c,d)=>{d.stub(p,M);const a=i.add(new m),e=i.add(new w(r,a,d.get(p))),l=new Promise(o=>i.add(a.onFindReplaceStateChange(s=>{s.matchesCount&&o(!0)})));a.change({isRevealed:!0},!0),a.change({searchString:"1"},!0),await l,t.strictEqual(e.findMatches.length,2),t.strictEqual(e.currentMatch,0),e.find({previous:!1}),t.strictEqual(e.currentMatch,1),e.find({previous:!1}),t.strictEqual(e.currentMatch,0),e.find({previous:!1}),t.strictEqual(e.currentMatch,1),t.strictEqual(r.textModel.length,3);const h=new Promise(o=>i.add(a.onFindReplaceStateChange(s=>{s.matchesCount&&o(!0)})));a.change({searchString:"3"},!0),await h,t.strictEqual(e.currentMatch,-1),t.strictEqual(e.findMatches.length,0)})}),test("CellFindMatchModel",async function(){await f([["# header 1","markdown",n.Markup,[],{}],["print(1)","typescript",n.Code,[],{}]],async r=>{const u=r.cellAt(0),c=new R(u,0,[],[]);t.strictEqual(c.length,0),c.contentMatches.push(new v(new E(1,1,1,2),[])),t.strictEqual(c.length,1),c.webviewMatches.push({index:0,searchPreviewInfo:{line:"",range:{start:0,end:0}}},{index:1,searchPreviewInfo:{line:"",range:{start:0,end:0}}}),t.strictEqual(c.length,3),t.strictEqual(c.getMatch(0),c.contentMatches[0]),t.strictEqual(c.getMatch(1),c.webviewMatches[0]),t.strictEqual(c.getMatch(2),c.webviewMatches[1])})})});
