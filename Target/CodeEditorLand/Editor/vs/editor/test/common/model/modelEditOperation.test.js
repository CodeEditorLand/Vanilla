import i from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as m}from"../../../../base/test/common/utils.js";import"../../../common/core/editOperation.js";import{Range as d}from"../../../common/core/range.js";import"../../../common/model/textModel.js";import{createTextModel as y}from"../testTextModel.js";suite("Editor Model - Model Edit Operation",()=>{const E="My First Line",o="		My Second Line",a="    Third Line",t="",n="1";let e;setup(()=>{const p=E+`\r
`+o+`
`+a+`
`+t+`\r
`+n;e=y(p)}),teardown(()=>{e.dispose()}),m();function r(p,c,u,L=c,M=u){return{range:new d(L,M,c,u),text:p,forceMoveMarkers:!1}}function s(p,c){const u=[p],L=e.applyEdits(u,!0);i.strictEqual(e.getLineCount(),c.length);for(let l=0;l<c.length;l++)i.strictEqual(e.getLineContent(l+1),c[l]);const M=e.applyEdits(L,!0);i.strictEqual(e.getLineCount(),5),i.strictEqual(e.getLineContent(1),E),i.strictEqual(e.getLineContent(2),o),i.strictEqual(e.getLineContent(3),a),i.strictEqual(e.getLineContent(4),t),i.strictEqual(e.getLineContent(5),n);const g=l=>({range:l.range,text:l.text,forceMoveMarkers:l.forceMoveMarkers||!1});i.deepStrictEqual(M.map(g),u.map(g))}test("Insert inline",()=>{s(r("a",1,1),["aMy First Line",o,a,t,n])}),test("Replace inline/inline 1",()=>{s(r(" incredibly awesome",1,3),["My incredibly awesome First Line",o,a,t,n])}),test("Replace inline/inline 2",()=>{s(r(" with text at the end.",1,14),["My First Line with text at the end.",o,a,t,n])}),test("Replace inline/inline 3",()=>{s(r("My new First Line.",1,1,1,14),["My new First Line.",o,a,t,n])}),test("Replace inline/multi line 1",()=>{s(r("My new First Line.",1,1,3,15),["My new First Line.",t,n])}),test("Replace inline/multi line 2",()=>{s(r("My new First Line.",1,2,3,15),["MMy new First Line.",t,n])}),test("Replace inline/multi line 3",()=>{s(r("My new First Line.",1,2,3,2),["MMy new First Line.   Third Line",t,n])}),test("Replace muli line/multi line",()=>{s(r(`1
2
3
4
`,1,1),["1","2","3","4",E,o,a,t,n])})});