import x from"assert";import{existsSync as M,readFileSync as D,readdirSync as T,rmSync as b,writeFileSync as f}from"fs";import{join as m,resolve as O}from"path";import{setUnexpectedErrorHandler as $}from"../../../../base/common/errors.js";import{FileAccess as J}from"../../../../base/common/network.js";import{RangeMapping as j}from"../../../common/diff/rangeMapping.js";import{LegacyLinesDiffComputer as P}from"../../../common/diff/legacyLinesDiffComputer.js";import{DefaultLinesDiffComputer as k}from"../../../common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer.js";import"../../../common/core/range.js";import{ensureNoDisposablesAreLeakedInTestSuite as q}from"../../../../base/test/common/utils.js";import{ArrayText as A,SingleTextEdit as W,TextEdit as U}from"../../../common/core/textEdit.js";import"../../../common/diff/linesDiffComputer.js";suite("diffing fixtures",()=>{q(),setup(()=>{$(i=>{throw i})});const d=J.asFileUri("vs/editor/test/node/diffing/fixtures").fsPath,l=O(d).replaceAll("\\","/").replace("/out/vs/editor/","/src/vs/editor/"),o=T(l);function p(i,n){const s=m(l,i),v=T(s),w=v.find(e=>e.startsWith("1.")),C=v.find(e=>e.startsWith("2.")),y=D(m(s,w),"utf8").replaceAll(`\r
`,`
`).replaceAll("\r",`
`),R=y.split(/\n/),E=D(m(s,C),"utf8").replaceAll(`\r
`,`
`).replaceAll("\r",`
`),h=E.split(/\n/),F=n==="legacy"?new P:new k,I=i.indexOf("trimws")>=0,S=F.computeDiff(R,h,{ignoreTrimWhitespace:I,maxComputationTimeMs:Number.MAX_SAFE_INTEGER,computeMoves:!0});n==="advanced"&&!I&&_(S,R,h);function L(e){for(const t of e)j.assertSorted(t.innerChanges??[]);return e.map(t=>({originalRange:t.original.toString(),modifiedRange:t.modified.toString(),innerChanges:t.innerChanges?.map(r=>({originalRange:N(r.originalRange,R),modifiedRange:N(r.modifiedRange,h)}))||null}))}function N(e,t){const r=e.endColumn===t[e.endLineNumber-1].length+1;return"["+e.startLineNumber+","+e.startColumn+" -> "+e.endLineNumber+","+e.endColumn+(r?" EOL":"")+"]"}const g={original:{content:y,fileName:`./${w}`},modified:{content:E,fileName:`./${C}`},diffs:L(S.changes),moves:S.moves.map(e=>({originalRange:e.lineRangeMapping.original.toString(),modifiedRange:e.lineRangeMapping.modified.toString(),changes:L(e.changes)}))};g.moves?.length===0&&delete g.moves;const a=m(s,`${n}.expected.diff.json`),c=m(s,`${n}.invalid.diff.json`),u=JSON.stringify(g,null,"	");if(!M(a))throw f(a,u),f(c,""),new Error("No expected file! Expected and invalid files were written. Delete the invalid file to make the test pass.");if(M(c)){const e=D(c,"utf8");if(e==="")throw f(a,u),new Error(`Delete the invalid ${c} file to make the test pass.`);{const t=JSON.parse(e);try{x.deepStrictEqual(g,t)}catch(r){throw f(a,u),r}f(a,e),b(c)}}else{const e=D(a,"utf8"),t=JSON.parse(e);try{x.deepStrictEqual(g,t)}catch(r){throw f(c,e),f(a,u),r}}}test("test",()=>{p("invalid-diff-trimws","advanced")});for(const i of o)for(const n of["legacy","advanced"])test(`${i}-${n}`,()=>{p(i,n)})});function _(d,l,o){const p=d.changes.flatMap(s=>s.innerChanges),n=z(p,new A(o)).normalize().apply(new A(l));x.deepStrictEqual(n,o.join(`
`))}function z(d,l){return new U(d.map(o=>new W(o.originalRange,l.getValueOfRange(o.modifiedRange))))}