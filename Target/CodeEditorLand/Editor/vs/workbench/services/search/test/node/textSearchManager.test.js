import i from"assert";import{CancellationToken as n}from"../../../../../base/common/cancellation.js";import{URI as s}from"../../../../../base/common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as a}from"../../../../../base/test/common/utils.js";import"../../../../../platform/progress/common/progress.js";import{QueryType as c}from"../../common/search.js";import"../../common/searchExtTypes.js";import{NativeTextSearchManager as l}from"../../node/textSearchManager.js";suite("NativeTextSearchManager",()=>{test("fixes encoding",async()=>{let e=!1;const r={provideTextSearchResults(p,o,T,d){return e=o.folderOptions[0].encoding==="windows-1252",null}},t={type:c.Text,contentPattern:{pattern:"a"},folderQueries:[{folder:s.file("/some/folder"),fileEncoding:"windows1252"}]};await new l(t,r).search(()=>{},n.None),i.ok(e)}),a()});