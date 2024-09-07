import d from"assert";import{DisposableStore as r}from"../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as u}from"../../../../base/test/common/utils.js";import{Range as l}from"../../../common/core/range.js";import{Selection as h}from"../../../common/core/selection.js";import{ILanguageService as c}from"../../../common/languages/language.js";import{ILanguageConfigurationService as p}from"../../../common/languages/languageConfigurationRegistry.js";import{withTestCodeEditor as g}from"../testCodeEditor.js";suite("CodeEditorWidget",()=>{u(),test("onDidChangeModelDecorations",()=>{g("",{},(o,a)=>{const n=new r;let t=!1;n.add(o.onDidChangeModelDecorations(e=>{t=!0})),a.model.deltaDecorations([],[{range:new l(1,1,1,1),options:{description:"test"}}]),d.deepStrictEqual(t,!0),n.dispose()})}),test("onDidChangeModelLanguage",()=>{g("",{},(o,a,n)=>{const t=n.get(c),e=new r;e.add(t.registerLanguage({id:"testMode"}));let i=!1;e.add(o.onDidChangeModelLanguage(s=>{i=!0})),a.model.setLanguage("testMode"),d.deepStrictEqual(i,!0),e.dispose()})}),test("onDidChangeModelLanguageConfiguration",()=>{g("",{},(o,a,n)=>{const t=n.get(p),e=n.get(c),i=new r;i.add(e.registerLanguage({id:"testMode"})),a.model.setLanguage("testMode");let s=!1;i.add(o.onDidChangeModelLanguageConfiguration(C=>{s=!0})),i.add(t.register("testMode",{brackets:[["(",")"]]})),d.deepStrictEqual(s,!0),i.dispose()})}),test("onDidChangeModelContent",()=>{g("",{},(o,a)=>{const n=new r;let t=!1;n.add(o.onDidChangeModelContent(e=>{t=!0})),a.type("hello","test"),d.deepStrictEqual(t,!0),n.dispose()})}),test("onDidChangeModelOptions",()=>{g("",{},(o,a)=>{const n=new r;let t=!1;n.add(o.onDidChangeModelOptions(e=>{t=!0})),a.model.updateOptions({tabSize:3}),d.deepStrictEqual(t,!0),n.dispose()})}),test("issue #145872 - Model change events are emitted before the selection updates",()=>{g("",{},(o,a)=>{const n=new r;let t=null;n.add(o.onDidChangeModelContent(e=>{t=o.getSelection()})),a.type("hello","test"),d.deepStrictEqual(t,new h(1,6,1,6)),n.dispose()})}),test("monaco-editor issue #2774 - Wrong order of events onDidChangeModelContent and onDidChangeCursorSelection on redo",()=>{g("",{},(o,a)=>{const n=new r,t=[];n.add(o.onDidChangeModelContent(e=>{t.push(`contentchange(${e.changes.reduce((i,s)=>[...i,s.text,s.rangeOffset,s.rangeLength],[]).join(", ")})`)})),n.add(o.onDidChangeCursorSelection(e=>{t.push(`cursorchange(${e.selection.positionLineNumber}, ${e.selection.positionColumn})`)})),a.type("a","test"),a.model.undo(),a.model.redo(),d.deepStrictEqual(t,["contentchange(a, 0, 0)","cursorchange(1, 2)","contentchange(, 0, 1)","cursorchange(1, 1)","contentchange(a, 0, 0)","cursorchange(1, 2)"]),n.dispose()})}),test("issue #146174: Events delivered out of order when adding decorations in content change listener (1 of 2)",()=>{g("",{},(o,a)=>{const n=new r,t=[];n.add(o.onDidChangeModelContent(e=>{t.push(`listener1 - contentchange(${e.changes.reduce((i,s)=>[...i,s.text,s.rangeOffset,s.rangeLength],[]).join(", ")})`)})),n.add(o.onDidChangeCursorSelection(e=>{t.push(`listener1 - cursorchange(${e.selection.positionLineNumber}, ${e.selection.positionColumn})`)})),n.add(o.onDidChangeModelContent(e=>{t.push(`listener2 - contentchange(${e.changes.reduce((i,s)=>[...i,s.text,s.rangeOffset,s.rangeLength],[]).join(", ")})`)})),n.add(o.onDidChangeCursorSelection(e=>{t.push(`listener2 - cursorchange(${e.selection.positionLineNumber}, ${e.selection.positionColumn})`)})),a.type("a","test"),d.deepStrictEqual(t,["listener1 - contentchange(a, 0, 0)","listener2 - contentchange(a, 0, 0)","listener1 - cursorchange(1, 2)","listener2 - cursorchange(1, 2)"]),n.dispose()})}),test("issue #146174: Events delivered out of order when adding decorations in content change listener (2 of 2)",()=>{g("",{},(o,a)=>{const n=new r,t=[];n.add(o.onDidChangeModelContent(e=>{t.push(`listener1 - contentchange(${e.changes.reduce((i,s)=>[...i,s.text,s.rangeOffset,s.rangeLength],[]).join(", ")})`),o.changeDecorations(i=>{i.deltaDecorations([],[{range:new l(1,1,1,1),options:{description:"test"}}])})})),n.add(o.onDidChangeCursorSelection(e=>{t.push(`listener1 - cursorchange(${e.selection.positionLineNumber}, ${e.selection.positionColumn})`)})),n.add(o.onDidChangeModelContent(e=>{t.push(`listener2 - contentchange(${e.changes.reduce((i,s)=>[...i,s.text,s.rangeOffset,s.rangeLength],[]).join(", ")})`)})),n.add(o.onDidChangeCursorSelection(e=>{t.push(`listener2 - cursorchange(${e.selection.positionLineNumber}, ${e.selection.positionColumn})`)})),a.type("a","test"),d.deepStrictEqual(t,["listener1 - contentchange(a, 0, 0)","listener2 - contentchange(a, 0, 0)","listener1 - cursorchange(1, 2)","listener2 - cursorchange(1, 2)"]),n.dispose()})})});