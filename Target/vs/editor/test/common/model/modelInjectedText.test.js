import t from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as u}from"../../../../base/test/common/utils.js";import{EditOperation as o}from"../../../common/core/editOperation.js";import{Range as l}from"../../../common/core/range.js";import{InternalModelContentChangeEvent as m,LineInjectedText as g,RawContentChangedType as r}from"../../../common/textModelEvents.js";import{createTextModel as f}from"../testTextModel.js";suite("Editor Model - Injected Text Events",()=>{const e=u();test("Basic",()=>{const n=e.add(f(`First Line
Second Line`)),i=new Array;e.add(n.onDidChangeContentOrInjectedText(d=>{const c=d instanceof m?d.rawContentChangedEvent.changes:d.changes;for(const p of c)i.push(h(p))}));let s=n.deltaDecorations([],[{options:{after:{content:"injected1"},description:"test1",showIfCollapsed:!0},range:new l(1,1,1,1)}]);t.deepStrictEqual(i.splice(0),[{kind:"lineChanged",line:"[injected1]First Line",lineNumber:1}]),s=n.deltaDecorations(s,[{options:{after:{content:"injected1"},description:"test1",showIfCollapsed:!0},range:new l(2,1,2,1)},{options:{after:{content:"injected2"},description:"test2",showIfCollapsed:!0},range:new l(2,2,2,2)}]),t.deepStrictEqual(i.splice(0),[{kind:"lineChanged",line:"First Line",lineNumber:1},{kind:"lineChanged",line:"[injected1]S[injected2]econd Line",lineNumber:2}]),n.applyEdits([o.replace(new l(2,2,2,2),"Hello")]),t.deepStrictEqual(i.splice(0),[{kind:"lineChanged",line:"[injected1]SHello[injected2]econd Line",lineNumber:2}]),n.pushEditOperations(null,[o.replace(new l(2,2,2,2),`


`)],null),t.deepStrictEqual(n.getAllDecorations(void 0).map(d=>({description:d.options.description,range:d.range.toString()})),[{description:"test1",range:"[2,1 -> 2,1]"},{description:"test2",range:"[2,2 -> 5,6]"}]),t.deepStrictEqual(i.splice(0),[{kind:"lineChanged",line:"[injected1]S",lineNumber:2},{fromLineNumber:3,kind:"linesInserted",lines:["","","Hello[injected2]econd Line"]}]),n.pushEditOperations(null,[o.replace(new l(3,1,5,1),`












`)],null),t.deepStrictEqual(i.splice(0),[{kind:"lineChanged",line:"",lineNumber:5},{kind:"lineChanged",line:"",lineNumber:4},{kind:"lineChanged",line:"",lineNumber:3},{fromLineNumber:6,kind:"linesInserted",lines:["","","","","","","","","","","Hello[injected2]econd Line"]}]),t.strictEqual(n.undo(),void 0),t.deepStrictEqual(i.splice(0),[{kind:"lineChanged",line:"[injected1]SHello[injected2]econd Line",lineNumber:2},{kind:"linesDeleted"}])})});function h(e){return e.changeType===r.LineChanged?((e.injectedText||[]).every(n=>{t.deepStrictEqual(n.lineNumber,e.lineNumber)}),{kind:"lineChanged",line:a(e.detail,e.injectedText),lineNumber:e.lineNumber}):e.changeType===r.LinesInserted?{kind:"linesInserted",lines:e.detail.map((n,i)=>a(n,e.injectedTexts[i])),fromLineNumber:e.fromLineNumber}:e.changeType===r.LinesDeleted?{kind:"linesDeleted"}:e.changeType===r.EOLChanged?{kind:"eolChanged"}:e.changeType===r.Flush?{kind:"flush"}:{kind:"unknown"}}function a(e,n){return g.applyInjectedText(e,(n||[]).map(i=>i.withText(`[${i.options.content}]`)))}
