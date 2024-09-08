import e from"assert";import"../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as u}from"../../../../base/test/common/utils.js";import{EditOperation as o}from"../../../common/core/editOperation.js";import{Position as d}from"../../../common/core/position.js";import{Range as p}from"../../../common/core/range.js";import*as k from"../../../common/languages.js";import{NullState as L}from"../../../common/languages/nullTokenize.js";import"../../../common/model/textModel.js";import{createTextModel as E}from"../testTextModel.js";suite("Editor Model - Model Modes 1",()=>{let r=[];function n(){const c=r;return r=[],c}const a={getInitialState:()=>L,tokenize:void 0,tokenizeEncoded:(c,s,l)=>(r.push(c.charAt(0)),new k.EncodedTokenizationResult(new Uint32Array(0),l))};let t,i;setup(()=>{const c=`1\r
2
3
4\r
5`,s="modelModeTest1";r=[],i=k.TokenizationRegistry.register(s,a),t=E(c,s)}),teardown(()=>{t.dispose(),i.dispose(),r=[]}),u(),test("model calls syntax highlighter 1",()=>{t.tokenization.forceTokenization(1),e.deepStrictEqual(n(),["1"])}),test("model calls syntax highlighter 2",()=>{t.tokenization.forceTokenization(2),e.deepStrictEqual(n(),["1","2"]),t.tokenization.forceTokenization(2),e.deepStrictEqual(n(),[])}),test("model caches states",()=>{t.tokenization.forceTokenization(1),e.deepStrictEqual(n(),["1"]),t.tokenization.forceTokenization(2),e.deepStrictEqual(n(),["2"]),t.tokenization.forceTokenization(3),e.deepStrictEqual(n(),["3"]),t.tokenization.forceTokenization(4),e.deepStrictEqual(n(),["4"]),t.tokenization.forceTokenization(5),e.deepStrictEqual(n(),["5"]),t.tokenization.forceTokenization(5),e.deepStrictEqual(n(),[])}),test("model invalidates states for one line insert",()=>{t.tokenization.forceTokenization(5),e.deepStrictEqual(n(),["1","2","3","4","5"]),t.applyEdits([o.insert(new d(1,1),"-")]),t.tokenization.forceTokenization(5),e.deepStrictEqual(n(),["-"]),t.tokenization.forceTokenization(5),e.deepStrictEqual(n(),[])}),test("model invalidates states for many lines insert",()=>{t.tokenization.forceTokenization(5),e.deepStrictEqual(n(),["1","2","3","4","5"]),t.applyEdits([o.insert(new d(1,1),`0
-
+`)]),e.strictEqual(t.getLineCount(),7),t.tokenization.forceTokenization(7),e.deepStrictEqual(n(),["0","-","+"]),t.tokenization.forceTokenization(7),e.deepStrictEqual(n(),[])}),test("model invalidates states for one new line",()=>{t.tokenization.forceTokenization(5),e.deepStrictEqual(n(),["1","2","3","4","5"]),t.applyEdits([o.insert(new d(1,2),`
`)]),t.applyEdits([o.insert(new d(2,1),"a")]),t.tokenization.forceTokenization(6),e.deepStrictEqual(n(),["1","a"])}),test("model invalidates states for one line delete",()=>{t.tokenization.forceTokenization(5),e.deepStrictEqual(n(),["1","2","3","4","5"]),t.applyEdits([o.insert(new d(1,2),"-")]),t.tokenization.forceTokenization(5),e.deepStrictEqual(n(),["1"]),t.applyEdits([o.delete(new p(1,1,1,2))]),t.tokenization.forceTokenization(5),e.deepStrictEqual(n(),["-"]),t.tokenization.forceTokenization(5),e.deepStrictEqual(n(),[])}),test("model invalidates states for many lines delete",()=>{t.tokenization.forceTokenization(5),e.deepStrictEqual(n(),["1","2","3","4","5"]),t.applyEdits([o.delete(new p(1,1,3,1))]),t.tokenization.forceTokenization(3),e.deepStrictEqual(n(),["3"]),t.tokenization.forceTokenization(3),e.deepStrictEqual(n(),[])})}),suite("Editor Model - Model Modes 2",()=>{class r{prevLineContent;constructor(l){this.prevLineContent=l}clone(){return new r(this.prevLineContent)}equals(l){return l instanceof r&&l.prevLineContent===this.prevLineContent}}let n=[];function a(){const s=n;return n=[],s}const t={getInitialState:()=>new r(""),tokenize:void 0,tokenizeEncoded:(s,l,z)=>(n.push(s),z.prevLineContent=s,new k.EncodedTokenizationResult(new Uint32Array(0),z))};let i,c;setup(()=>{const s=`Line1\r
Line2
Line3
Line4\r
Line5`,l="modelModeTest2";c=k.TokenizationRegistry.register(l,t),i=E(s,l)}),teardown(()=>{i.dispose(),c.dispose()}),u(),test("getTokensForInvalidLines one text insert",()=>{i.tokenization.forceTokenization(5),e.deepStrictEqual(a(),["Line1","Line2","Line3","Line4","Line5"]),i.applyEdits([o.insert(new d(1,6),"-")]),i.tokenization.forceTokenization(5),e.deepStrictEqual(a(),["Line1-","Line2"])}),test("getTokensForInvalidLines two text insert",()=>{i.tokenization.forceTokenization(5),e.deepStrictEqual(a(),["Line1","Line2","Line3","Line4","Line5"]),i.applyEdits([o.insert(new d(1,6),"-"),o.insert(new d(3,6),"-")]),i.tokenization.forceTokenization(5),e.deepStrictEqual(a(),["Line1-","Line2","Line3-","Line4"])}),test("getTokensForInvalidLines one multi-line text insert, one small text insert",()=>{i.tokenization.forceTokenization(5),e.deepStrictEqual(a(),["Line1","Line2","Line3","Line4","Line5"]),i.applyEdits([o.insert(new d(1,6),`
New line
Another new line`)]),i.applyEdits([o.insert(new d(5,6),"-")]),i.tokenization.forceTokenization(7),e.deepStrictEqual(a(),["Line1","New line","Another new line","Line2","Line3-","Line4"])}),test("getTokensForInvalidLines one delete text",()=>{i.tokenization.forceTokenization(5),e.deepStrictEqual(a(),["Line1","Line2","Line3","Line4","Line5"]),i.applyEdits([o.delete(new p(1,1,1,5))]),i.tokenization.forceTokenization(5),e.deepStrictEqual(a(),["1","Line2"])}),test("getTokensForInvalidLines one line delete text",()=>{i.tokenization.forceTokenization(5),e.deepStrictEqual(a(),["Line1","Line2","Line3","Line4","Line5"]),i.applyEdits([o.delete(new p(1,1,2,1))]),i.tokenization.forceTokenization(4),e.deepStrictEqual(a(),["Line2"])}),test("getTokensForInvalidLines multiple lines delete text",()=>{i.tokenization.forceTokenization(5),e.deepStrictEqual(a(),["Line1","Line2","Line3","Line4","Line5"]),i.applyEdits([o.delete(new p(1,1,3,3))]),i.tokenization.forceTokenization(3),e.deepStrictEqual(a(),["ne3","Line4"])})});
