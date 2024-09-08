import t from"assert";import{Lazy as c}from"../../../../base/common/lazy.js";import{URI as p}from"../../../../base/common/uri.js";import{mock as b}from"../../../../base/test/common/mock.js";import{ensureNoDisposablesAreLeakedInTestSuite as d}from"../../../../base/test/common/utils.js";import{RenderLineNumbersType as a,TextEditorCursorStyle as i}from"../../../../editor/common/config/editorOptions.js";import{NullLogService as o}from"../../../../platform/log/common/log.js";import"../../common/extHost.protocol.js";import{ExtHostDocumentData as m}from"../../common/extHostDocumentData.js";import{ExtHostTextEditor as z,ExtHostTextEditorOptions as f}from"../../common/extHostTextEditor.js";import{Range as v,TextEditorLineNumbersStyle as l}from"../../common/extHostTypes.js";suite("ExtHostTextEditor",()=>{let e;const n=new m(void 0,p.file(""),["aaaa bbbb+cccc abc"],`
`,1,"text",!1);setup(()=>{e=new z("fake",null,new o,new c(()=>n.document),[],{cursorStyle:i.Line,insertSpaces:!0,lineNumbers:1,tabSize:4,indentSize:4,originalIndentSize:"tabSize"},[],1)}),test("disposed editor",()=>{t.ok(e.value.document),e._acceptViewColumn(3),t.strictEqual(3,e.value.viewColumn),e.dispose(),t.throws(()=>e._acceptViewColumn(2)),t.strictEqual(3,e.value.viewColumn),t.ok(e.value.document),t.throws(()=>e._acceptOptions(null)),t.throws(()=>e._acceptSelections([]))}),test("API [bug]: registerTextEditorCommand clears redo stack even if no edits are made #55163",async function(){let s=0;const r=new z("edt1",new class extends b(){$tryApplyEdits(){return s+=1,Promise.resolve(!0)}},new o,new c(()=>n.document),[],{cursorStyle:i.Line,insertSpaces:!0,lineNumbers:1,tabSize:4,indentSize:4,originalIndentSize:"tabSize"},[],1);await r.value.edit(S=>{}),t.strictEqual(s,0),await r.value.edit(S=>{S.setEndOfLine(1)}),t.strictEqual(s,1),await r.value.edit(S=>{S.delete(new v(0,0,1,1))}),t.strictEqual(s,2)}),d()}),suite("ExtHostTextEditorOptions",()=>{let e,n=[];setup(()=>{n=[];const r={dispose:void 0,$trySetOptions:(S,u)=>(t.strictEqual(S,"1"),n.push(u),Promise.resolve(void 0)),$tryShowTextDocument:void 0,$registerTextEditorDecorationType:void 0,$removeTextEditorDecorationType:void 0,$tryShowEditor:void 0,$tryHideEditor:void 0,$trySetDecorations:void 0,$trySetDecorationsFast:void 0,$tryRevealRange:void 0,$trySetSelections:void 0,$tryApplyEdits:void 0,$tryInsertSnippet:void 0,$getDiffInformation:void 0};e=new f(r,"1",{tabSize:4,indentSize:4,originalIndentSize:"tabSize",insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On},new o)}),teardown(()=>{e=null,n=null});function s(r,S){const u={tabSize:r.value.tabSize,indentSize:r.value.indentSize,insertSpaces:r.value.insertSpaces,cursorStyle:r.value.cursorStyle,lineNumbers:r.value.lineNumbers};t.deepStrictEqual(u,S)}test("can set tabSize to the same value",()=>{e.value.tabSize=4,s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[])}),test("can change tabSize to positive integer",()=>{e.value.tabSize=1,s(e,{tabSize:1,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[{tabSize:1}])}),test("can change tabSize to positive float",()=>{e.value.tabSize=2.3,s(e,{tabSize:2,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[{tabSize:2}])}),test("can change tabSize to a string number",()=>{e.value.tabSize="2",s(e,{tabSize:2,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[{tabSize:2}])}),test("tabSize can request indentation detection",()=>{e.value.tabSize="auto",s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[{tabSize:"auto"}])}),test("ignores invalid tabSize 1",()=>{e.value.tabSize=null,s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[])}),test("ignores invalid tabSize 2",()=>{e.value.tabSize=-5,s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[])}),test("ignores invalid tabSize 3",()=>{e.value.tabSize="hello",s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[])}),test("ignores invalid tabSize 4",()=>{e.value.tabSize="-17",s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[])}),test("can set indentSize to the same value",()=>{e.value.indentSize=4,s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[{indentSize:4}])}),test("can change indentSize to positive integer",()=>{e.value.indentSize=1,s(e,{tabSize:4,indentSize:1,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[{indentSize:1}])}),test("can change indentSize to positive float",()=>{e.value.indentSize=2.3,s(e,{tabSize:4,indentSize:2,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[{indentSize:2}])}),test("can change indentSize to a string number",()=>{e.value.indentSize="2",s(e,{tabSize:4,indentSize:2,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[{indentSize:2}])}),test("indentSize can request to use tabSize",()=>{e.value.indentSize="tabSize",s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[{indentSize:"tabSize"}])}),test("indentSize cannot request indentation detection",()=>{e.value.indentSize="auto",s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[])}),test("ignores invalid indentSize 1",()=>{e.value.indentSize=null,s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[])}),test("ignores invalid indentSize 2",()=>{e.value.indentSize=-5,s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[])}),test("ignores invalid indentSize 3",()=>{e.value.indentSize="hello",s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[])}),test("ignores invalid indentSize 4",()=>{e.value.indentSize="-17",s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[])}),test("can set insertSpaces to the same value",()=>{e.value.insertSpaces=!1,s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[])}),test("can set insertSpaces to boolean",()=>{e.value.insertSpaces=!0,s(e,{tabSize:4,indentSize:4,insertSpaces:!0,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[{insertSpaces:!0}])}),test("can set insertSpaces to false string",()=>{e.value.insertSpaces="false",s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[])}),test("can set insertSpaces to truey",()=>{e.value.insertSpaces="hello",s(e,{tabSize:4,indentSize:4,insertSpaces:!0,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[{insertSpaces:!0}])}),test("insertSpaces can request indentation detection",()=>{e.value.insertSpaces="auto",s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[{insertSpaces:"auto"}])}),test("can set cursorStyle to same value",()=>{e.value.cursorStyle=i.Line,s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[])}),test("can change cursorStyle",()=>{e.value.cursorStyle=i.Block,s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Block,lineNumbers:a.On}),t.deepStrictEqual(n,[{cursorStyle:i.Block}])}),test("can set lineNumbers to same value",()=>{e.value.lineNumbers=l.On,s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[])}),test("can change lineNumbers",()=>{e.value.lineNumbers=l.Off,s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.Off}),t.deepStrictEqual(n,[{lineNumbers:a.Off}])}),test("can do bulk updates 0",()=>{e.assign({tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:l.On}),s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[{indentSize:4}])}),test("can do bulk updates 1",()=>{e.assign({tabSize:"auto",insertSpaces:!0}),s(e,{tabSize:4,indentSize:4,insertSpaces:!0,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[{tabSize:"auto",insertSpaces:!0}])}),test("can do bulk updates 2",()=>{e.assign({tabSize:3,insertSpaces:"auto"}),s(e,{tabSize:3,indentSize:4,insertSpaces:!1,cursorStyle:i.Line,lineNumbers:a.On}),t.deepStrictEqual(n,[{tabSize:3,insertSpaces:"auto"}])}),test("can do bulk updates 3",()=>{e.assign({cursorStyle:i.Block,lineNumbers:l.Relative}),s(e,{tabSize:4,indentSize:4,insertSpaces:!1,cursorStyle:i.Block,lineNumbers:a.Relative}),t.deepStrictEqual(n,[{cursorStyle:i.Block,lineNumbers:a.Relative}])}),d()});
