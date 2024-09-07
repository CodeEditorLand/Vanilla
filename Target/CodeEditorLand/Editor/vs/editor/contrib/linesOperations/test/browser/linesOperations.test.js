import l from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as B}from"../../../../../base/test/common/utils.js";import{CoreEditingCommands as h}from"../../../../browser/coreCommands.js";import"../../../../browser/editorExtensions.js";import{Position as L}from"../../../../common/core/position.js";import{Selection as n}from"../../../../common/core/selection.js";import{Handler as b}from"../../../../common/editorCommon.js";import"../../../../common/model.js";import"../../../../common/viewModel/viewModelImpl.js";import{CamelCaseAction as k,PascalCaseAction as I,DeleteAllLeftAction as C,DeleteAllRightAction as S,DeleteDuplicateLinesAction as p,DeleteLinesAction as d,IndentLinesAction as f,InsertLineAfterAction as P,InsertLineBeforeAction as D,JoinLinesAction as q,KebabCaseAction as j,LowerCaseAction as M,SnakeCaseAction as F,SortLinesAscendingAction as m,SortLinesDescendingAction as T,TitleCaseAction as _,TransposeAction as y,UpperCaseAction as v}from"../../browser/linesOperations.js";import{withTestCodeEditor as c}from"../../../../test/browser/testCodeEditor.js";import{createTextModel as A}from"../../../../test/common/testTextModel.js";function i(r,e){Array.isArray(e)||(e=[e]),l.deepStrictEqual(r.getSelections(),e)}function o(r,e){r.run(null,e,void 0)}suite("Editor Contrib - Line Operations",()=>{B(),suite("SortLinesAscendingAction",()=>{test("should sort selected lines in ascending order",function(){c(["omicron","beta","alpha"],{},e=>{const t=e.getModel(),s=new m;e.setSelection(new n(1,1,3,5)),o(s,e),l.deepStrictEqual(t.getLinesContent(),["alpha","beta","omicron"]),i(e,new n(1,1,3,7))})}),test("should sort lines in ascending order",function(){c(["omicron","beta","alpha"],{},e=>{const t=e.getModel(),s=new m;o(s,e),l.deepStrictEqual(t.getLinesContent(),["alpha","beta","omicron"])})}),test("should sort multiple selections in ascending order",function(){c(["omicron","beta","alpha","","omicron","beta","alpha"],{},e=>{const t=e.getModel(),s=new m;e.setSelections([new n(1,1,3,5),new n(5,1,7,5)]),o(s,e),l.deepStrictEqual(t.getLinesContent(),["alpha","beta","omicron","","alpha","beta","omicron"]);const u=[new n(1,1,3,7),new n(5,1,7,7)];e.getSelections().forEach((g,a)=>{l.deepStrictEqual(g.toString(),u[a].toString())})})})}),suite("SortLinesDescendingAction",()=>{test("should sort selected lines in descending order",function(){c(["alpha","beta","omicron"],{},e=>{const t=e.getModel(),s=new T;e.setSelection(new n(1,1,3,7)),o(s,e),l.deepStrictEqual(t.getLinesContent(),["omicron","beta","alpha"]),i(e,new n(1,1,3,5))})}),test("should sort multiple selections in descending order",function(){c(["alpha","beta","omicron","","alpha","beta","omicron"],{},e=>{const t=e.getModel(),s=new T;e.setSelections([new n(1,1,3,7),new n(5,1,7,7)]),o(s,e),l.deepStrictEqual(t.getLinesContent(),["omicron","beta","alpha","","omicron","beta","alpha"]);const u=[new n(1,1,3,5),new n(5,1,7,5)];e.getSelections().forEach((g,a)=>{l.deepStrictEqual(g.toString(),u[a].toString())})})})}),suite("DeleteDuplicateLinesAction",()=>{test("should remove duplicate lines within selection",function(){c(["alpha","beta","beta","beta","alpha","omicron"],{},e=>{const t=e.getModel(),s=new p;e.setSelection(new n(1,3,6,4)),o(s,e),l.deepStrictEqual(t.getLinesContent(),["alpha","beta","omicron"]),i(e,new n(1,1,3,7))})}),test("should remove duplicate lines",function(){c(["alpha","beta","beta","beta","alpha","omicron"],{},e=>{const t=e.getModel(),s=new p;o(s,e),l.deepStrictEqual(t.getLinesContent(),["alpha","beta","omicron"]),l.ok(e.getSelection().isEmpty())})}),test("should remove duplicate lines in multiple selections",function(){c(["alpha","beta","beta","omicron","","alpha","alpha","beta"],{},e=>{const t=e.getModel(),s=new p;e.setSelections([new n(1,2,4,3),new n(6,2,8,3)]),o(s,e),l.deepStrictEqual(t.getLinesContent(),["alpha","beta","omicron","","alpha","beta"]);const u=[new n(1,1,3,7),new n(5,1,6,4)];e.getSelections().forEach((g,a)=>{l.deepStrictEqual(g.toString(),u[a].toString())})})})}),suite("DeleteAllLeftAction",()=>{test("should delete to the left of the cursor",function(){c(["one","two","three"],{},e=>{const t=e.getModel(),s=new C;e.setSelection(new n(1,2,1,2)),o(s,e),l.strictEqual(t.getLineContent(1),"ne"),e.setSelections([new n(2,2,2,2),new n(3,2,3,2)]),o(s,e),l.strictEqual(t.getLineContent(2),"wo"),l.strictEqual(t.getLineContent(3),"hree")})}),test("should jump to the previous line when on first column",function(){c(["one","two","three"],{},e=>{const t=e.getModel(),s=new C;e.setSelection(new n(2,1,2,1)),o(s,e),l.strictEqual(t.getLineContent(1),"onetwo"),e.setSelections([new n(1,1,1,1),new n(2,1,2,1)]),o(s,e),l.strictEqual(t.getLinesContent()[0],"onetwothree"),l.strictEqual(t.getLinesContent().length,1),e.setSelection(new n(1,1,1,1)),o(s,e),l.strictEqual(t.getLinesContent()[0],"onetwothree")})}),test("should keep deleting lines in multi cursor mode",function(){c(["hi my name is Carlos Matos","BCC","waso waso waso","my wife doesnt believe in me","nonononono","bitconneeeect"],{},e=>{const t=e.getModel(),s=new C,u=new n(3,5,3,5),g=new n(2,4,2,4),a=new n(5,11,5,11);e.setSelections([u,g,a]),o(s,e);let w=e.getSelections();l.strictEqual(t.getLineContent(2),""),l.strictEqual(t.getLineContent(3)," waso waso"),l.strictEqual(t.getLineContent(5),""),l.deepStrictEqual([w[0].startLineNumber,w[0].startColumn,w[0].endLineNumber,w[0].endColumn],[3,1,3,1]),l.deepStrictEqual([w[1].startLineNumber,w[1].startColumn,w[1].endLineNumber,w[1].endColumn],[2,1,2,1]),l.deepStrictEqual([w[2].startLineNumber,w[2].startColumn,w[2].endLineNumber,w[2].endColumn],[5,1,5,1]),o(s,e),w=e.getSelections(),l.strictEqual(t.getLineContent(1),"hi my name is Carlos Matos waso waso"),l.strictEqual(w.length,2),l.deepStrictEqual([w[0].startLineNumber,w[0].startColumn,w[0].endLineNumber,w[0].endColumn],[1,27,1,27]),l.deepStrictEqual([w[1].startLineNumber,w[1].startColumn,w[1].endLineNumber,w[1].endColumn],[2,29,2,29])})}),test("should work in multi cursor mode",function(){c(["hello","world","hello world","hello","bonjour","hola","world","hello world"],{},e=>{const t=e.getModel(),s=new C;e.setSelections([new n(1,2,1,2),new n(1,4,1,4)]),o(s,e),l.strictEqual(t.getLineContent(1),"lo"),e.setSelections([new n(2,2,2,2),new n(2,4,2,5)]),o(s,e),l.strictEqual(t.getLineContent(2),"d"),e.setSelections([new n(3,2,3,5),new n(3,7,3,7)]),o(s,e),l.strictEqual(t.getLineContent(3),"world"),e.setSelections([new n(4,3,4,3),new n(4,5,5,4)]),o(s,e),l.strictEqual(t.getLineContent(4),"jour"),e.setSelections([new n(5,3,6,3),new n(6,5,7,5),new n(7,7,7,7)]),o(s,e),l.strictEqual(t.getLineContent(5),"world")})}),test("issue #36234: should push undo stop",()=>{c(["one","two","three"],{},e=>{const t=e.getModel(),s=new C;e.setSelection(new n(1,1,1,1)),e.trigger("keyboard",b.Type,{text:"Typing some text here on line "}),l.strictEqual(t.getLineContent(1),"Typing some text here on line one"),l.deepStrictEqual(e.getSelection(),new n(1,31,1,31)),o(s,e),l.strictEqual(t.getLineContent(1),"one"),l.deepStrictEqual(e.getSelection(),new n(1,1,1,1)),h.Undo.runEditorCommand(null,e,null),l.strictEqual(t.getLineContent(1),"Typing some text here on line one"),l.deepStrictEqual(e.getSelection(),new n(1,31,1,31))})})}),suite("JoinLinesAction",()=>{test("should join lines and insert space if necessary",function(){c(["hello","world","hello ","world","hello		","	world","hello   ","	world","","","hello world"],{},e=>{const t=e.getModel(),s=new q;e.setSelection(new n(1,2,1,2)),o(s,e),l.strictEqual(t.getLineContent(1),"hello world"),i(e,new n(1,6,1,6)),e.setSelection(new n(2,2,2,2)),o(s,e),l.strictEqual(t.getLineContent(2),"hello world"),i(e,new n(2,7,2,7)),e.setSelection(new n(3,2,3,2)),o(s,e),l.strictEqual(t.getLineContent(3),"hello world"),i(e,new n(3,7,3,7)),e.setSelection(new n(4,2,5,3)),o(s,e),l.strictEqual(t.getLineContent(4),"hello world"),i(e,new n(4,2,4,8)),e.setSelection(new n(5,1,7,3)),o(s,e),l.strictEqual(t.getLineContent(5),"hello world"),i(e,new n(5,1,5,3))})}),test("#50471 Join lines at the end of document",function(){c(["hello","world"],{},e=>{const t=e.getModel(),s=new q;e.setSelection(new n(2,1,2,1)),o(s,e),l.strictEqual(t.getLineContent(1),"hello"),l.strictEqual(t.getLineContent(2),"world"),i(e,new n(2,6,2,6))})}),test("should work in multi cursor mode",function(){c(["hello","world","hello ","world","hello		","	world","hello   ","	world","","","hello world"],{},e=>{const t=e.getModel(),s=new q;e.setSelections([new n(5,2,5,2),new n(1,2,1,2),new n(3,2,4,2),new n(5,4,6,3),new n(7,5,8,4),new n(10,1,10,1)]),o(s,e),l.strictEqual(t.getLinesContent().join(`
`),`hello world
hello world
hello world
hello world

hello world`),i(e,[new n(3,4,3,8),new n(1,6,1,6),new n(2,2,2,8),new n(4,5,4,9),new n(6,1,6,1)])})}),test("should push undo stop",function(){c(["hello","world"],{},e=>{const t=e.getModel(),s=new q;e.setSelection(new n(1,6,1,6)),e.trigger("keyboard",b.Type,{text:" my dear"}),l.strictEqual(t.getLineContent(1),"hello my dear"),l.deepStrictEqual(e.getSelection(),new n(1,14,1,14)),o(s,e),l.strictEqual(t.getLineContent(1),"hello my dear world"),l.deepStrictEqual(e.getSelection(),new n(1,14,1,14)),h.Undo.runEditorCommand(null,e,null),l.strictEqual(t.getLineContent(1),"hello my dear"),l.deepStrictEqual(e.getSelection(),new n(1,14,1,14))})})}),test("transpose",()=>{c(["hello world","","","   "],{},e=>{const t=e.getModel(),s=new y;e.setSelection(new n(1,1,1,1)),o(s,e),l.strictEqual(t.getLineContent(1),"hello world"),i(e,new n(1,2,1,2)),e.setSelection(new n(1,6,1,6)),o(s,e),l.strictEqual(t.getLineContent(1),"hell oworld"),i(e,new n(1,7,1,7)),e.setSelection(new n(1,12,1,12)),o(s,e),l.strictEqual(t.getLineContent(1),"hell oworl"),i(e,new n(2,2,2,2)),e.setSelection(new n(3,1,3,1)),o(s,e),l.strictEqual(t.getLineContent(3),""),i(e,new n(4,1,4,1)),e.setSelection(new n(4,2,4,2)),o(s,e),l.strictEqual(t.getLineContent(4),"   "),i(e,new n(4,3,4,3))}),c(["","","hello","world","","hello world","","hello world"],{},e=>{const t=e.getModel(),s=new y;e.setSelection(new n(1,1,1,1)),o(s,e),l.strictEqual(t.getLineContent(2),""),i(e,new n(2,1,2,1)),e.setSelection(new n(3,6,3,6)),o(s,e),l.strictEqual(t.getLineContent(4),"oworld"),i(e,new n(4,2,4,2)),e.setSelection(new n(6,12,6,12)),o(s,e),l.strictEqual(t.getLineContent(7),"d"),i(e,new n(7,2,7,2)),e.setSelection(new n(8,12,8,12)),o(s,e),l.strictEqual(t.getLineContent(8),"hello world"),i(e,new n(8,12,8,12))})}),test("toggle case",function(){c(["hello world","\xF6\xE7\u015F\u011F\xFC","parseHTMLString","getElementById","insertHTML","PascalCase","CSSSelectorsList","iD","tEST","\xF6\xE7\u015F\xD6\xC7\u015E\u011F\xFC\u011E\xDC","audioConverter.convertM4AToMP3();","snake_case","Capital_Snake_Case",`function helloWorld() {
				return someGlobalObject.printHelloWorld("en", "utf-8");
				}
				helloWorld();`.replace(/^\s+/gm,""),"'JavaScript'","parseHTML4String","_accessor: ServicesAccessor"],{},e=>{const t=e.getModel(),s=new v,u=new M,g=new _,a=new F;e.setSelection(new n(1,1,1,12)),o(s,e),l.strictEqual(t.getLineContent(1),"HELLO WORLD"),i(e,new n(1,1,1,12)),e.setSelection(new n(1,1,1,12)),o(u,e),l.strictEqual(t.getLineContent(1),"hello world"),i(e,new n(1,1,1,12)),e.setSelection(new n(1,3,1,3)),o(s,e),l.strictEqual(t.getLineContent(1),"HELLO world"),i(e,new n(1,3,1,3)),e.setSelection(new n(1,4,1,4)),o(u,e),l.strictEqual(t.getLineContent(1),"hello world"),i(e,new n(1,4,1,4)),e.setSelection(new n(1,1,1,12)),o(g,e),l.strictEqual(t.getLineContent(1),"Hello World"),i(e,new n(1,1,1,12)),e.setSelection(new n(2,1,2,6)),o(s,e),l.strictEqual(t.getLineContent(2),"\xD6\xC7\u015E\u011E\xDC"),i(e,new n(2,1,2,6)),e.setSelection(new n(2,1,2,6)),o(u,e),l.strictEqual(t.getLineContent(2),"\xF6\xE7\u015F\u011F\xFC"),i(e,new n(2,1,2,6)),e.setSelection(new n(2,1,2,6)),o(g,e),l.strictEqual(t.getLineContent(2),"\xD6\xE7\u015F\u011F\xFC"),i(e,new n(2,1,2,6)),e.setSelection(new n(3,1,3,16)),o(a,e),l.strictEqual(t.getLineContent(3),"parse_html_string"),i(e,new n(3,1,3,18)),e.setSelection(new n(4,1,4,15)),o(a,e),l.strictEqual(t.getLineContent(4),"get_element_by_id"),i(e,new n(4,1,4,18)),e.setSelection(new n(5,1,5,11)),o(a,e),l.strictEqual(t.getLineContent(5),"insert_html"),i(e,new n(5,1,5,12)),e.setSelection(new n(6,1,6,11)),o(a,e),l.strictEqual(t.getLineContent(6),"pascal_case"),i(e,new n(6,1,6,12)),e.setSelection(new n(7,1,7,17)),o(a,e),l.strictEqual(t.getLineContent(7),"css_selectors_list"),i(e,new n(7,1,7,19)),e.setSelection(new n(8,1,8,3)),o(a,e),l.strictEqual(t.getLineContent(8),"i_d"),i(e,new n(8,1,8,4)),e.setSelection(new n(9,1,9,5)),o(a,e),l.strictEqual(t.getLineContent(9),"t_est"),i(e,new n(9,1,9,6)),e.setSelection(new n(10,1,10,11)),o(a,e),l.strictEqual(t.getLineContent(10),"\xF6\xE7\u015F_\xF6\xE7_\u015F\u011F\xFC_\u011F\xFC"),i(e,new n(10,1,10,14)),e.setSelection(new n(11,1,11,34)),o(a,e),l.strictEqual(t.getLineContent(11),"audio_converter.convert_m4a_to_mp3();"),i(e,new n(11,1,11,38)),e.setSelection(new n(12,1,12,11)),o(a,e),l.strictEqual(t.getLineContent(12),"snake_case"),i(e,new n(12,1,12,11)),e.setSelection(new n(13,1,13,19)),o(a,e),l.strictEqual(t.getLineContent(13),"capital_snake_case"),i(e,new n(13,1,13,19)),e.setSelection(new n(14,1,17,14)),o(a,e),l.strictEqual(t.getValueInRange(new n(14,1,17,15)),`function hello_world() {
					return some_global_object.print_hello_world("en", "utf-8");
				}
				hello_world();`.replace(/^\s+/gm,"")),i(e,new n(14,1,17,15)),e.setSelection(new n(18,1,18,13)),o(a,e),l.strictEqual(t.getLineContent(18),"'java_script'"),i(e,new n(18,1,18,14)),e.setSelection(new n(19,1,19,17)),o(a,e),l.strictEqual(t.getLineContent(19),"parse_html4_string"),i(e,new n(19,1,19,19)),e.setSelection(new n(20,1,20,28)),o(a,e),l.strictEqual(t.getLineContent(20),"_accessor: services_accessor"),i(e,new n(20,1,20,29))}),c(["foO baR BaZ","foO'baR'BaZ","foO[baR]BaZ","foO`baR~BaZ","foO^baR%BaZ","foO$baR!BaZ","'physician's assistant'"],{},e=>{const t=e.getModel(),s=new _;e.setSelection(new n(1,1,1,12)),o(s,e),l.strictEqual(t.getLineContent(1),"Foo Bar Baz"),e.setSelection(new n(2,1,2,12)),o(s,e),l.strictEqual(t.getLineContent(2),"Foo'bar'baz"),e.setSelection(new n(3,1,3,12)),o(s,e),l.strictEqual(t.getLineContent(3),"Foo[Bar]Baz"),e.setSelection(new n(4,1,4,12)),o(s,e),l.strictEqual(t.getLineContent(4),"Foo`Bar~Baz"),e.setSelection(new n(5,1,5,12)),o(s,e),l.strictEqual(t.getLineContent(5),"Foo^Bar%Baz"),e.setSelection(new n(6,1,6,12)),o(s,e),l.strictEqual(t.getLineContent(6),"Foo$Bar!Baz"),e.setSelection(new n(7,1,7,23)),o(s,e),l.strictEqual(t.getLineContent(7),"'Physician's Assistant'")}),c(["camel from words","from_snake_case","from-kebab-case","alreadyCamel","ReTain_any_CAPitalization","my_var.test_function()","\xF6\xE7\u015F_\xF6\xE7_\u015F\u011F\xFC_\u011F\xFC"],{},e=>{const t=e.getModel(),s=new k;e.setSelection(new n(1,1,1,18)),o(s,e),l.strictEqual(t.getLineContent(1),"camelFromWords"),e.setSelection(new n(2,1,2,15)),o(s,e),l.strictEqual(t.getLineContent(2),"fromSnakeCase"),e.setSelection(new n(3,1,3,15)),o(s,e),l.strictEqual(t.getLineContent(3),"fromKebabCase"),e.setSelection(new n(4,1,4,12)),o(s,e),l.strictEqual(t.getLineContent(4),"alreadyCamel"),e.setSelection(new n(5,1,5,26)),o(s,e),l.strictEqual(t.getLineContent(5),"ReTainAnyCAPitalization"),e.setSelection(new n(6,1,6,23)),o(s,e),l.strictEqual(t.getLineContent(6),"myVar.testFunction()"),e.setSelection(new n(7,1,7,14)),o(s,e),l.strictEqual(t.getLineContent(7),"\xF6\xE7\u015F\xD6\xE7\u015E\u011F\xFC\u011E\xFC")}),c(["","   "],{},e=>{const t=e.getModel(),s=new v,u=new M;e.setSelection(new n(1,1,1,1)),o(s,e),l.strictEqual(t.getLineContent(1),""),i(e,new n(1,1,1,1)),e.setSelection(new n(1,1,1,1)),o(u,e),l.strictEqual(t.getLineContent(1),""),i(e,new n(1,1,1,1)),e.setSelection(new n(2,2,2,2)),o(s,e),l.strictEqual(t.getLineContent(2),"   "),i(e,new n(2,2,2,2)),e.setSelection(new n(2,2,2,2)),o(u,e),l.strictEqual(t.getLineContent(2),"   "),i(e,new n(2,2,2,2))}),c(["hello world","\xF6\xE7\u015F\u011F\xFC","parseHTMLString","getElementById","PascalCase","\xF6\xE7\u015F\xD6\xC7\u015E\u011F\xFC\u011E\xDC","audioConverter.convertM4AToMP3();","Capital_Snake_Case","parseHTML4String","_accessor: ServicesAccessor","Kebab-Case"],{},e=>{const t=e.getModel(),s=new j;e.setSelection(new n(1,1,1,12)),o(s,e),l.strictEqual(t.getLineContent(1),"hello world"),i(e,new n(1,1,1,12)),e.setSelection(new n(2,1,2,6)),o(s,e),l.strictEqual(t.getLineContent(2),"\xF6\xE7\u015F\u011F\xFC"),i(e,new n(2,1,2,6)),e.setSelection(new n(3,1,3,16)),o(s,e),l.strictEqual(t.getLineContent(3),"parse-html-string"),i(e,new n(3,1,3,18)),e.setSelection(new n(4,1,4,15)),o(s,e),l.strictEqual(t.getLineContent(4),"get-element-by-id"),i(e,new n(4,1,4,18)),e.setSelection(new n(5,1,5,11)),o(s,e),l.strictEqual(t.getLineContent(5),"pascal-case"),i(e,new n(5,1,5,12)),e.setSelection(new n(6,1,6,11)),o(s,e),l.strictEqual(t.getLineContent(6),"\xF6\xE7\u015F-\xF6\xE7-\u015F\u011F\xFC-\u011F\xFC"),i(e,new n(6,1,6,14)),e.setSelection(new n(7,1,7,34)),o(s,e),l.strictEqual(t.getLineContent(7),"audio-converter.convert-m4a-to-mp3();"),i(e,new n(7,1,7,38)),e.setSelection(new n(8,1,8,19)),o(s,e),l.strictEqual(t.getLineContent(8),"capital-snake-case"),i(e,new n(8,1,8,19)),e.setSelection(new n(9,1,9,17)),o(s,e),l.strictEqual(t.getLineContent(9),"parse-html4-string"),i(e,new n(9,1,9,19)),e.setSelection(new n(10,1,10,28)),o(s,e),l.strictEqual(t.getLineContent(10),"_accessor: services-accessor"),i(e,new n(10,1,10,29)),e.setSelection(new n(11,1,11,11)),o(s,e),l.strictEqual(t.getLineContent(11),"kebab-case"),i(e,new n(11,1,11,11))}),c(["hello world","\xF6\xE7\u015F\u011F\xFC","parseHTMLString","getElementById","PascalCase","\xF6\xE7\u015F\xD6\xC7\u015E\u011F\xFC\u011E\xDC","audioConverter.convertM4AToMP3();","Capital_Snake_Case","parseHTML4String","Kebab-Case"],{},e=>{const t=e.getModel(),s=new I;e.setSelection(new n(1,1,1,12)),o(s,e),l.strictEqual(t.getLineContent(1),"HelloWorld"),i(e,new n(1,1,1,11)),e.setSelection(new n(2,1,2,6)),o(s,e),l.strictEqual(t.getLineContent(2),"\xD6\xE7\u015F\u011F\xFC"),i(e,new n(2,1,2,6)),e.setSelection(new n(3,1,3,16)),o(s,e),l.strictEqual(t.getLineContent(3),"ParseHTMLString"),i(e,new n(3,1,3,16)),e.setSelection(new n(4,1,4,15)),o(s,e),l.strictEqual(t.getLineContent(4),"GetElementById"),i(e,new n(4,1,4,15)),e.setSelection(new n(5,1,5,11)),o(s,e),l.strictEqual(t.getLineContent(5),"PascalCase"),i(e,new n(5,1,5,11)),e.setSelection(new n(6,1,6,11)),o(s,e),l.strictEqual(t.getLineContent(6),"\xD6\xE7\u015F\xD6\xC7\u015E\u011F\xFC\u011E\xDC"),i(e,new n(6,1,6,11)),e.setSelection(new n(7,1,7,34)),o(s,e),l.strictEqual(t.getLineContent(7),"AudioConverter.ConvertM4AToMP3();"),i(e,new n(7,1,7,34)),e.setSelection(new n(8,1,8,19)),o(s,e),l.strictEqual(t.getLineContent(8),"CapitalSnakeCase"),i(e,new n(8,1,8,17)),e.setSelection(new n(9,1,9,17)),o(s,e),l.strictEqual(t.getLineContent(9),"ParseHTML4String"),i(e,new n(9,1,9,17)),e.setSelection(new n(10,1,10,11)),o(s,e),l.strictEqual(t.getLineContent(10),"KebabCase"),i(e,new n(10,1,10,10))})}),suite("DeleteAllRightAction",()=>{test("should be noop on empty",()=>{c([""],{},e=>{const t=e.getModel(),s=new S;o(s,e),l.deepStrictEqual(t.getLinesContent(),[""]),l.deepStrictEqual(e.getSelections(),[new n(1,1,1,1)]),e.setSelection(new n(1,1,1,1)),o(s,e),l.deepStrictEqual(t.getLinesContent(),[""]),l.deepStrictEqual(e.getSelections(),[new n(1,1,1,1)]),e.setSelections([new n(1,1,1,1),new n(1,1,1,1),new n(1,1,1,1)]),o(s,e),l.deepStrictEqual(t.getLinesContent(),[""]),l.deepStrictEqual(e.getSelections(),[new n(1,1,1,1)])})}),test("should delete selected range",()=>{c(["hello","world"],{},e=>{const t=e.getModel(),s=new S;e.setSelection(new n(1,2,1,5)),o(s,e),l.deepStrictEqual(t.getLinesContent(),["ho","world"]),l.deepStrictEqual(e.getSelections(),[new n(1,2,1,2)]),e.setSelection(new n(1,1,2,4)),o(s,e),l.deepStrictEqual(t.getLinesContent(),["ld"]),l.deepStrictEqual(e.getSelections(),[new n(1,1,1,1)]),e.setSelection(new n(1,1,1,3)),o(s,e),l.deepStrictEqual(t.getLinesContent(),[""]),l.deepStrictEqual(e.getSelections(),[new n(1,1,1,1)])})}),test("should delete to the right of the cursor",()=>{c(["hello","world"],{},e=>{const t=e.getModel(),s=new S;e.setSelection(new n(1,3,1,3)),o(s,e),l.deepStrictEqual(t.getLinesContent(),["he","world"]),l.deepStrictEqual(e.getSelections(),[new n(1,3,1,3)]),e.setSelection(new n(2,1,2,1)),o(s,e),l.deepStrictEqual(t.getLinesContent(),["he",""]),l.deepStrictEqual(e.getSelections(),[new n(2,1,2,1)])})}),test("should join two lines, if at the end of the line",()=>{c(["hello","world"],{},e=>{const t=e.getModel(),s=new S;e.setSelection(new n(1,6,1,6)),o(s,e),l.deepStrictEqual(t.getLinesContent(),["helloworld"]),l.deepStrictEqual(e.getSelections(),[new n(1,6,1,6)]),e.setSelection(new n(1,6,1,6)),o(s,e),l.deepStrictEqual(t.getLinesContent(),["hello"]),l.deepStrictEqual(e.getSelections(),[new n(1,6,1,6)]),e.setSelection(new n(1,6,1,6)),o(s,e),l.deepStrictEqual(t.getLinesContent(),["hello"]),l.deepStrictEqual(e.getSelections(),[new n(1,6,1,6)])})}),test("should work with multiple cursors",()=>{c(["hello","there","world"],{},e=>{const t=e.getModel(),s=new S;e.setSelections([new n(1,3,1,3),new n(1,6,1,6),new n(3,4,3,4)]),o(s,e),l.deepStrictEqual(t.getLinesContent(),["hethere","wor"]),l.deepStrictEqual(e.getSelections(),[new n(1,3,1,3),new n(2,4,2,4)]),o(s,e),l.deepStrictEqual(t.getLinesContent(),["he","wor"]),l.deepStrictEqual(e.getSelections(),[new n(1,3,1,3),new n(2,4,2,4)]),o(s,e),l.deepStrictEqual(t.getLinesContent(),["hewor"]),l.deepStrictEqual(e.getSelections(),[new n(1,3,1,3),new n(1,6,1,6)]),o(s,e),l.deepStrictEqual(t.getLinesContent(),["he"]),l.deepStrictEqual(e.getSelections(),[new n(1,3,1,3)]),o(s,e),l.deepStrictEqual(t.getLinesContent(),["he"]),l.deepStrictEqual(e.getSelections(),[new n(1,3,1,3)])})}),test("should work with undo/redo",()=>{c(["hello","there","world"],{},e=>{const t=e.getModel(),s=new S;e.setSelections([new n(1,3,1,3),new n(1,6,1,6),new n(3,4,3,4)]),o(s,e),l.deepStrictEqual(t.getLinesContent(),["hethere","wor"]),l.deepStrictEqual(e.getSelections(),[new n(1,3,1,3),new n(2,4,2,4)]),h.Undo.runEditorCommand(null,e,null),l.deepStrictEqual(e.getSelections(),[new n(1,3,1,3),new n(1,6,1,6),new n(3,4,3,4)]),h.Redo.runEditorCommand(null,e,null),l.deepStrictEqual(e.getSelections(),[new n(1,3,1,3),new n(2,4,2,4)])})})}),test("InsertLineBeforeAction",()=>{function e(t,s,u){c(["First line","Second line","Third line"],{},(a,w)=>{a.setPosition(new L(t,s));const E=new D;o(E,a),u(a.getModel(),w)})}e(1,3,(t,s)=>{l.deepStrictEqual(s.getSelection(),new n(1,1,1,1)),l.strictEqual(t.getLineContent(1),""),l.strictEqual(t.getLineContent(2),"First line"),l.strictEqual(t.getLineContent(3),"Second line"),l.strictEqual(t.getLineContent(4),"Third line")}),e(2,3,(t,s)=>{l.deepStrictEqual(s.getSelection(),new n(2,1,2,1)),l.strictEqual(t.getLineContent(1),"First line"),l.strictEqual(t.getLineContent(2),""),l.strictEqual(t.getLineContent(3),"Second line"),l.strictEqual(t.getLineContent(4),"Third line")}),e(3,3,(t,s)=>{l.deepStrictEqual(s.getSelection(),new n(3,1,3,1)),l.strictEqual(t.getLineContent(1),"First line"),l.strictEqual(t.getLineContent(2),"Second line"),l.strictEqual(t.getLineContent(3),""),l.strictEqual(t.getLineContent(4),"Third line")})}),test("InsertLineAfterAction",()=>{function e(t,s,u){c(["First line","Second line","Third line"],{},(a,w)=>{a.setPosition(new L(t,s));const E=new P;o(E,a),u(a.getModel(),w)})}e(1,3,(t,s)=>{l.deepStrictEqual(s.getSelection(),new n(2,1,2,1)),l.strictEqual(t.getLineContent(1),"First line"),l.strictEqual(t.getLineContent(2),""),l.strictEqual(t.getLineContent(3),"Second line"),l.strictEqual(t.getLineContent(4),"Third line")}),e(2,3,(t,s)=>{l.deepStrictEqual(s.getSelection(),new n(3,1,3,1)),l.strictEqual(t.getLineContent(1),"First line"),l.strictEqual(t.getLineContent(2),"Second line"),l.strictEqual(t.getLineContent(3),""),l.strictEqual(t.getLineContent(4),"Third line")}),e(3,3,(t,s)=>{l.deepStrictEqual(s.getSelection(),new n(4,1,4,1)),l.strictEqual(t.getLineContent(1),"First line"),l.strictEqual(t.getLineContent(2),"Second line"),l.strictEqual(t.getLineContent(3),"Third line"),l.strictEqual(t.getLineContent(4),"")})}),test("Bug 18276:[editor] Indentation broken when selection is empty",()=>{const e=A(["function baz() {"].join(`
`),void 0,{insertSpaces:!1});c(e,{},t=>{const s=new f;t.setPosition(new L(1,2)),o(s,t),l.strictEqual(e.getLineContent(1),"	function baz() {"),l.deepStrictEqual(t.getSelection(),new n(1,3,1,3)),h.Tab.runEditorCommand(null,t,null),l.strictEqual(e.getLineContent(1),"	f	unction baz() {")}),e.dispose()}),test("issue #80736: Indenting while the cursor is at the start of a line of text causes the added spaces or tab to be selected",()=>{const e=A(["Some text"].join(`
`),void 0,{insertSpaces:!1});c(e,{},t=>{const s=new f;t.setPosition(new L(1,1)),o(s,t),l.strictEqual(e.getLineContent(1),"	Some text"),l.deepStrictEqual(t.getSelection(),new n(1,2,1,2))}),e.dispose()}),test("Indenting on empty line should move cursor",()=>{const e=A([""].join(`
`));c(e,{useTabStops:!1},t=>{const s=new f;t.setPosition(new L(1,1)),o(s,t),l.strictEqual(e.getLineContent(1),"    "),l.deepStrictEqual(t.getSelection(),new n(1,5,1,5))}),e.dispose()}),test("issue #62112: Delete line does not work properly when multiple cursors are on line",()=>{c(["a","foo boo","too","c"],{},t=>{t.setSelections([new n(2,4,2,4),new n(2,8,2,8),new n(3,4,3,4)]);const s=new d;o(s,t),l.strictEqual(t.getValue(),`a
c`)})});function r(e,t,s,u){const g=Array.isArray(t)?t:[t],a=Array.isArray(u)?u:[u];c(e,{},w=>{w.setSelections(g);const E=new d;o(E,w),l.strictEqual(w.getValue(),s.join(`
`)),l.deepStrictEqual(w.getSelections(),a)})}test("empty selection in middle of lines",function(){r(["first","second line","third line","fourth line","fifth"],new n(2,3,2,3),["first","third line","fourth line","fifth"],new n(2,3,2,3))}),test("empty selection at top of lines",function(){r(["first","second line","third line","fourth line","fifth"],new n(1,5,1,5),["second line","third line","fourth line","fifth"],new n(1,5,1,5))}),test("empty selection at end of lines",function(){r(["first","second line","third line","fourth line","fifth"],new n(5,2,5,2),["first","second line","third line","fourth line"],new n(4,2,4,2))}),test("with selection in middle of lines",function(){r(["first","second line","third line","fourth line","fifth"],new n(3,3,2,2),["first","fourth line","fifth"],new n(2,2,2,2))}),test("with selection at top of lines",function(){r(["first","second line","third line","fourth line","fifth"],new n(1,4,1,5),["second line","third line","fourth line","fifth"],new n(1,5,1,5))}),test("with selection at end of lines",function(){r(["first","second line","third line","fourth line","fifth"],new n(5,1,5,2),["first","second line","third line","fourth line"],new n(4,2,4,2))}),test("with full line selection in middle of lines",function(){r(["first","second line","third line","fourth line","fifth"],new n(4,1,2,1),["first","fourth line","fifth"],new n(2,1,2,1))}),test("with full line selection at top of lines",function(){r(["first","second line","third line","fourth line","fifth"],new n(2,1,1,5),["second line","third line","fourth line","fifth"],new n(1,5,1,5))}),test("with full line selection at end of lines",function(){r(["first","second line","third line","fourth line","fifth"],new n(4,1,5,2),["first","second line","third line"],new n(3,2,3,2))}),test("multicursor 1",function(){r(["class P {","","    getA() {","        if (true) {",'            return "a";',"        }","    }","","    getB() {","        if (true) {",'            return "b";',"        }","    }","","    getC() {","        if (true) {",'            return "c";',"        }","    }","}"],[new n(4,1,5,1),new n(10,1,11,1),new n(16,1,17,1)],["class P {","","    getA() {",'            return "a";',"        }","    }","","    getB() {",'            return "b";',"        }","    }","","    getC() {",'            return "c";',"        }","    }","}"],[new n(4,1,4,1),new n(9,1,9,1),new n(14,1,14,1)])})});