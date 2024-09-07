import o from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as l}from"../../../../../base/test/common/utils.js";import{Range as t}from"../../../../../editor/common/core/range.js";import{FindMatch as c}from"../../../../../editor/common/model.js";import{QueryType as p}from"../../common/search.js";import{getTextSearchMatchWithModelContext as u,editorMatchesToTextSearchResults as m}from"../../common/searchHelpers.js";suite("SearchHelpers",()=>{suite("editorMatchesToTextSearchResults",()=>{l();const a={getLineContent(n){return""+n}};function r(n,e){if(!Array.isArray(n))throw new Error("Expected array of ranges");o.strictEqual(n.length,e.length),n.forEach((s,w)=>{const i=e[w];o.deepStrictEqual({startLineNumber:s.startLineNumber,startColumn:s.startColumn,endLineNumber:s.endLineNumber,endColumn:s.endColumn},{startLineNumber:i.startLineNumber,startColumn:i.startColumn,endLineNumber:i.endLineNumber,endColumn:i.endColumn})})}test("simple",()=>{const n=m([new c(new t(6,1,6,2),null)],a);o.strictEqual(n.length,1),o.strictEqual(n[0].previewText,`6
`),r(n[0].rangeLocations.map(e=>e.preview),[new t(0,0,0,1)]),r(n[0].rangeLocations.map(e=>e.source),[new t(5,0,5,1)])}),test("multiple",()=>{const n=m([new c(new t(6,1,6,2),null),new c(new t(6,4,8,2),null),new c(new t(9,1,10,3),null)],a);o.strictEqual(n.length,2),r(n[0].rangeLocations.map(e=>e.preview),[new t(0,0,0,1),new t(0,3,2,1)]),r(n[0].rangeLocations.map(e=>e.source),[new t(5,0,5,1),new t(5,3,7,1)]),o.strictEqual(n[0].previewText,`6
7
8
`),r(n[1].rangeLocations.map(e=>e.preview),[new t(0,0,1,2)]),r(n[1].rangeLocations.map(e=>e.source),[new t(8,0,9,2)]),o.strictEqual(n[1].previewText,`9
10
`)})}),suite("addContextToEditorMatches",()=>{l();const a=100,r={getLineContent(e){if(e<1||e>a)throw new Error(`invalid line count: ${e}`);return""+e},getLineCount(){return a}};function n(e){return{folderQueries:[],type:p.Text,contentPattern:{pattern:"test"},surroundingContext:e}}test("no context",()=>{const e=[{previewText:"foo",rangeLocations:[{preview:new t(0,0,0,10),source:new t(0,0,0,10)}]}];o.deepStrictEqual(u(e,r,n()),e)}),test("simple",()=>{const e=[{previewText:"foo",rangeLocations:[{preview:new t(0,0,0,10),source:new t(1,0,1,10)}]}];o.deepStrictEqual(u(e,r,n(1)),[{text:"1",lineNumber:1},...e,{text:"3",lineNumber:3}])}),test("multiple matches next to each other",()=>{const e=[{previewText:"foo",rangeLocations:[{preview:new t(0,0,0,10),source:new t(1,0,1,10)}]},{previewText:"bar",rangeLocations:[{preview:new t(0,0,0,10),source:new t(2,0,2,10)}]}];o.deepStrictEqual(u(e,r,n(1)),[{text:"1",lineNumber:1},...e,{text:"4",lineNumber:4}])}),test("boundaries",()=>{const e=[{previewText:"foo",rangeLocations:[{preview:new t(0,0,0,10),source:new t(0,0,0,10)}]},{previewText:"bar",rangeLocations:[{preview:new t(0,0,0,10),source:new t(a-1,0,a-1,10)}]}];o.deepStrictEqual(u(e,r,n(1)),[e[0],{text:"2",lineNumber:2},{text:""+(a-1),lineNumber:a-1},e[1]])})})});