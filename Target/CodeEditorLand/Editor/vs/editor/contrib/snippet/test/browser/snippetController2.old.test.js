var b=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var g=(i,e,t,n)=>{for(var r=n>1?void 0:n?w(e,t):e,a=i.length-1,u;a>=0;a--)(u=i[a])&&(r=(n?u(e,t,r):u(r))||r);return n&&r&&b(e,t,r),r},c=(i,e)=>(t,n)=>e(t,n,i);import s from"assert";import{mock as m}from"../../../../../base/test/common/mock.js";import{ensureNoDisposablesAreLeakedInTestSuite as q}from"../../../../../base/test/common/utils.js";import"../../../../browser/editorBrowser.js";import{Position as f}from"../../../../common/core/position.js";import{Selection as o}from"../../../../common/core/selection.js";import{LanguageFeaturesService as L}from"../../../../common/services/languageFeaturesService.js";import{SnippetController2 as S}from"../../browser/snippetController2.js";import{withTestCodeEditor as C}from"../../../../test/browser/testCodeEditor.js";import{TestLanguageConfigurationService as d}from"../../../../test/common/modes/testLanguageConfigurationService.js";import{IContextKeyService as E}from"../../../../../platform/contextkey/common/contextkey.js";import{ServiceCollection as v}from"../../../../../platform/instantiation/common/serviceCollection.js";import{ILabelService as h}from"../../../../../platform/label/common/label.js";import{NullLogService as N}from"../../../../../platform/log/common/log.js";import{IWorkspaceContextService as M}from"../../../../../platform/workspace/common/workspace.js";let l=class extends S{constructor(t,n){const r=new d;super(t,new N,new L,n,r);this._contextKeyService=n;this._testLanguageConfigurationService=r}_testLanguageConfigurationService;dispose(){super.dispose(),this._testLanguageConfigurationService.dispose()}isInSnippetMode(){return S.InSnippetMode.getValue(this._contextKeyService)}};l=g([c(1,E)],l),suite("SnippetController",()=>{q();function i(e,t){t||(t=["function test() {","	var x = 3;","	var arr = [];","	","}"]);const n=new v([h,new class extends m(){}],[M,new class extends m(){}]);C(t,{serviceCollection:n},r=>{r.getModel().updateOptions({insertSpaces:!1});const a=r.registerAndInstantiateContribution(l.ID,l),u=["for (var ${1:index}; $1 < ${2:array}.length; $1++) {","	var element = $2[$1];","	$0","}"].join(`
`);e(r,u,a),a.dispose()})}test("Simple accepted",()=>{i((e,t,n)=>{e.setPosition({lineNumber:4,column:2}),n.insert(t),s.strictEqual(e.getModel().getLineContent(4),"	for (var index; index < array.length; index++) {"),s.strictEqual(e.getModel().getLineContent(5),"		var element = array[index];"),s.strictEqual(e.getModel().getLineContent(6),"		"),s.strictEqual(e.getModel().getLineContent(7),"	}"),e.trigger("test","type",{text:"i"}),s.strictEqual(e.getModel().getLineContent(4),"	for (var i; i < array.length; i++) {"),s.strictEqual(e.getModel().getLineContent(5),"		var element = array[i];"),s.strictEqual(e.getModel().getLineContent(6),"		"),s.strictEqual(e.getModel().getLineContent(7),"	}"),n.next(),e.trigger("test","type",{text:"arr"}),s.strictEqual(e.getModel().getLineContent(4),"	for (var i; i < arr.length; i++) {"),s.strictEqual(e.getModel().getLineContent(5),"		var element = arr[i];"),s.strictEqual(e.getModel().getLineContent(6),"		"),s.strictEqual(e.getModel().getLineContent(7),"	}"),n.prev(),e.trigger("test","type",{text:"j"}),s.strictEqual(e.getModel().getLineContent(4),"	for (var j; j < arr.length; j++) {"),s.strictEqual(e.getModel().getLineContent(5),"		var element = arr[j];"),s.strictEqual(e.getModel().getLineContent(6),"		"),s.strictEqual(e.getModel().getLineContent(7),"	}"),n.next(),n.next(),s.deepStrictEqual(e.getPosition(),new f(6,3))})}),test("Simple canceled",()=>{i((e,t,n)=>{e.setPosition({lineNumber:4,column:2}),n.insert(t),s.strictEqual(e.getModel().getLineContent(4),"	for (var index; index < array.length; index++) {"),s.strictEqual(e.getModel().getLineContent(5),"		var element = array[index];"),s.strictEqual(e.getModel().getLineContent(6),"		"),s.strictEqual(e.getModel().getLineContent(7),"	}"),n.cancel(),s.deepStrictEqual(e.getPosition(),new f(4,16))})}),test("Stops when calling model.setValue()",()=>{i((e,t,n)=>{e.setPosition({lineNumber:4,column:2}),n.insert(t),e.getModel().setValue("goodbye"),s.strictEqual(n.isInSnippetMode(),!1)})}),test("Stops when undoing",()=>{i((e,t,n)=>{e.setPosition({lineNumber:4,column:2}),n.insert(t),e.getModel().undo(),s.strictEqual(n.isInSnippetMode(),!1)})}),test("Stops when moving cursor outside",()=>{i((e,t,n)=>{e.setPosition({lineNumber:4,column:2}),n.insert(t),e.setPosition({lineNumber:1,column:1}),s.strictEqual(n.isInSnippetMode(),!1)})}),test("Stops when disconnecting editor model",()=>{i((e,t,n)=>{e.setPosition({lineNumber:4,column:2}),n.insert(t),e.setModel(null),s.strictEqual(n.isInSnippetMode(),!1)})}),test("Stops when disposing editor",()=>{i((e,t,n)=>{e.setPosition({lineNumber:4,column:2}),n.insert(t),n.dispose(),s.strictEqual(n.isInSnippetMode(),!1)})}),test("Final tabstop with multiple selections",()=>{i((e,t,n)=>{e.setSelections([new o(1,1,1,1),new o(2,1,2,1)]),t="foo$0",n.insert(t),s.strictEqual(e.getSelections().length,2);const[r,a]=e.getSelections();s.ok(r.equalsRange({startLineNumber:1,startColumn:4,endLineNumber:1,endColumn:4}),r.toString()),s.ok(a.equalsRange({startLineNumber:2,startColumn:4,endLineNumber:2,endColumn:4}),a.toString())}),i((e,t,n)=>{e.setSelections([new o(1,1,1,1),new o(2,1,2,1)]),t="foo$0bar",n.insert(t),s.strictEqual(e.getSelections().length,2);const[r,a]=e.getSelections();s.ok(r.equalsRange({startLineNumber:1,startColumn:4,endLineNumber:1,endColumn:4}),r.toString()),s.ok(a.equalsRange({startLineNumber:2,startColumn:4,endLineNumber:2,endColumn:4}),a.toString())}),i((e,t,n)=>{e.setSelections([new o(1,1,1,1),new o(1,5,1,5)]),t="foo$0bar",n.insert(t),s.strictEqual(e.getSelections().length,2);const[r,a]=e.getSelections();s.ok(r.equalsRange({startLineNumber:1,startColumn:4,endLineNumber:1,endColumn:4}),r.toString()),s.ok(a.equalsRange({startLineNumber:1,startColumn:14,endLineNumber:1,endColumn:14}),a.toString())}),i((e,t,n)=>{e.setSelections([new o(1,1,1,1),new o(1,5,1,5)]),t=`foo
$0
bar`,n.insert(t),s.strictEqual(e.getSelections().length,2);const[r,a]=e.getSelections();s.ok(r.equalsRange({startLineNumber:2,startColumn:1,endLineNumber:2,endColumn:1}),r.toString()),s.ok(a.equalsRange({startLineNumber:4,startColumn:1,endLineNumber:4,endColumn:1}),a.toString())}),i((e,t,n)=>{e.setSelections([new o(1,1,1,1),new o(1,5,1,5)]),t=`foo
$0
bar`,n.insert(t),s.strictEqual(e.getSelections().length,2);const[r,a]=e.getSelections();s.ok(r.equalsRange({startLineNumber:2,startColumn:1,endLineNumber:2,endColumn:1}),r.toString()),s.ok(a.equalsRange({startLineNumber:4,startColumn:1,endLineNumber:4,endColumn:1}),a.toString())}),i((e,t,n)=>{e.setSelections([new o(2,7,2,7)]),t="xo$0r",n.insert(t,{overwriteBefore:1}),s.strictEqual(e.getSelections().length,1),s.ok(e.getSelection().equalsRange({startLineNumber:2,startColumn:8,endColumn:8,endLineNumber:2}))})}),test("Final tabstop, #11742 simple",()=>{i((e,t,n)=>{e.setSelection(new o(1,19,1,19)),t="{{% url_**$1** %}}",n.insert(t,{overwriteBefore:2}),s.strictEqual(e.getSelections().length,1),s.ok(e.getSelection().equalsRange({startLineNumber:1,startColumn:27,endLineNumber:1,endColumn:27})),s.strictEqual(e.getModel().getValue(),"example example {{% url_**** %}}")},["example example sc"]),i((e,t,n)=>{e.setSelection(new o(1,3,1,3)),t=["afterEach((done) => {","	${1}test","});"].join(`
`),n.insert(t,{overwriteBefore:2}),s.strictEqual(e.getSelections().length,1),s.ok(e.getSelection().equalsRange({startLineNumber:2,startColumn:2,endLineNumber:2,endColumn:2}),e.getSelection().toString()),s.strictEqual(e.getModel().getValue(),`afterEach((done) => {
	test
});`)},["af"]),i((e,t,n)=>{e.setSelection(new o(1,3,1,3)),t=["afterEach((done) => {","${1}	test","});"].join(`
`),n.insert(t,{overwriteBefore:2}),s.strictEqual(e.getSelections().length,1),s.ok(e.getSelection().equalsRange({startLineNumber:2,startColumn:1,endLineNumber:2,endColumn:1}),e.getSelection().toString()),s.strictEqual(e.getModel().getValue(),`afterEach((done) => {
	test
});`)},["af"]),i((e,t,n)=>{e.setSelection(new o(1,9,1,9)),t=["aft${1}er"].join(`
`),n.insert(t,{overwriteBefore:8}),s.strictEqual(e.getModel().getValue(),"after"),s.strictEqual(e.getSelections().length,1),s.ok(e.getSelection().equalsRange({startLineNumber:1,startColumn:4,endLineNumber:1,endColumn:4}),e.getSelection().toString())},["afterone"])}),test("Final tabstop, #11742 different indents",()=>{i((e,t,n)=>{e.setSelections([new o(2,4,2,4),new o(1,3,1,3)]),t=["afterEach((done) => {","	${0}test","});"].join(`
`),n.insert(t,{overwriteBefore:2}),s.strictEqual(e.getSelections().length,2);const[r,a]=e.getSelections();s.ok(r.equalsRange({startLineNumber:5,startColumn:3,endLineNumber:5,endColumn:3}),r.toString()),s.ok(a.equalsRange({startLineNumber:2,startColumn:2,endLineNumber:2,endColumn:2}),a.toString())},["af","	af"])}),test("Final tabstop, #11890 stay at the beginning",()=>{i((e,t,n)=>{e.setSelections([new o(1,5,1,5)]),t=["afterEach((done) => {","${1}	test","});"].join(`
`),n.insert(t,{overwriteBefore:2}),s.strictEqual(e.getSelections().length,1);const[r]=e.getSelections();s.ok(r.equalsRange({startLineNumber:2,startColumn:3,endLineNumber:2,endColumn:3}),r.toString())},["  af"])}),test("Final tabstop, no tabstop",()=>{i((e,t,n)=>{e.setSelections([new o(1,3,1,3)]),t="afterEach",n.insert(t,{overwriteBefore:2}),s.ok(e.getSelection().equalsRange({startLineNumber:1,startColumn:10,endLineNumber:1,endColumn:10}))},["af","	af"])}),test("Multiple cursor and overwriteBefore/After, issue #11060",()=>{i((e,t,n)=>{e.setSelections([new o(1,7,1,7),new o(2,4,2,4)]),t="_foo",n.insert(t,{overwriteBefore:1}),s.strictEqual(e.getModel().getValue(),`this._foo
abc_foo`)},["this._","abc"]),i((e,t,n)=>{e.setSelections([new o(1,7,1,7),new o(2,4,2,4)]),t="XX",n.insert(t,{overwriteBefore:1}),s.strictEqual(e.getModel().getValue(),`this.XX
abcXX`)},["this._","abc"]),i((e,t,n)=>{e.setSelections([new o(1,7,1,7),new o(2,4,2,4),new o(3,5,3,5)]),t="_foo",n.insert(t,{overwriteBefore:1}),s.strictEqual(e.getModel().getValue(),`this._foo
abc_foo
def_foo`)},["this._","abc","def_"]),i((e,t,n)=>{e.setSelections([new o(1,7,1,7),new o(2,4,2,4),new o(3,6,3,6)]),t="._foo",n.insert(t,{overwriteBefore:2}),s.strictEqual(e.getModel().getValue(),`this._foo
abc._foo
def._foo`)},["this._","abc","def._"]),i((e,t,n)=>{e.setSelections([new o(3,6,3,6),new o(1,7,1,7),new o(2,4,2,4)]),t="._foo",n.insert(t,{overwriteBefore:2}),s.strictEqual(e.getModel().getValue(),`this._foo
abc._foo
def._foo`)},["this._","abc","def._"]),i((e,t,n)=>{e.setSelections([new o(2,4,2,4),new o(3,6,3,6),new o(1,7,1,7)]),t="._foo",n.insert(t,{overwriteBefore:2}),s.strictEqual(e.getModel().getValue(),`this._._foo
a._foo
def._._foo`)},["this._","abc","def._"])}),test("Multiple cursor and overwriteBefore/After, #16277",()=>{i((e,t,n)=>{e.setSelections([new o(1,5,1,5),new o(2,5,2,5)]),t="document",n.insert(t,{overwriteBefore:3}),s.strictEqual(e.getModel().getValue(),`{document}
{document && true}`)},["{foo}","{foo && true}"])}),test("Insert snippet twice, #19449",()=>{i((e,t,n)=>{e.setSelections([new o(1,1,1,1)]),t="for (var ${1:i}=0; ${1:i}<len; ${1:i}++) { $0 }",n.insert(t),s.strictEqual(e.getModel().getValue(),"for (var i=0; i<len; i++) {  }for (var i=0; i<len; i++) {  }")},["for (var i=0; i<len; i++) {  }"]),i((e,t,n)=>{e.setSelections([new o(1,1,1,1)]),t="for (let ${1:i}=0; ${1:i}<len; ${1:i}++) { $0 }",n.insert(t),s.strictEqual(e.getModel().getValue(),"for (let i=0; i<len; i++) {  }for (var i=0; i<len; i++) {  }")},["for (var i=0; i<len; i++) {  }"])})});
