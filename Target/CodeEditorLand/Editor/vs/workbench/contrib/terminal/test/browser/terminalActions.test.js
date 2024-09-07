import{deepStrictEqual as p}from"assert";import{URI as d}from"../../../../../base/common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as m}from"../../../../../base/test/common/utils.js";import"../../../../../platform/workspace/common/workspace.js";import{shrinkWorkspaceFolderCwdPairs as c}from"../../browser/terminalActions.js";function u(o,e){return{name:o,uri:e,index:0,toResource:()=>e}}function t(o,e,i){return{folder:o,cwd:e?e instanceof d?e:e.uri:o.uri,isAbsolute:!!i,isOverridden:!!e&&e.toString()!==o.uri.toString()}}suite("terminalActions",()=>{m();const o=d.file("/some-root"),e=u("a",d.joinPath(o,"a")),i=u("b",d.joinPath(o,"b")),n=u("c",d.joinPath(o,"c")),h=u("d",d.joinPath(o,"d"));suite("shrinkWorkspaceFolderCwdPairs",()=>{test("should return empty when given array is empty",()=>{p(c([]),[])}),test("should return the only single pair when given argument is a single element array",()=>{const r=[t(e)];p(c(r),r)}),test("should return all pairs when no repeated cwds",()=>{const r=[t(e),t(i),t(n)];p(c(r),r)}),suite("should select the pair that has the same URI when repeated cwds exist",()=>{test("all repeated",()=>{const r=t(e),a=t(i,e),s=t(n,e);p(c([r,a,s]),[r])}),test("two repeated + one different",()=>{const r=t(e),a=t(i,e),s=t(n);p(c([r,a,s]),[r,s])}),test("two repeated + two repeated",()=>{const r=t(e),a=t(i,e),s=t(n),l=t(h,n);p(c([r,a,s,l]),[r,s])}),test("two repeated + two repeated (reverse order)",()=>{const r=t(i,e),a=t(e),s=t(h,n),l=t(n);p(c([a,r,l,s]),[a,l])})})})});