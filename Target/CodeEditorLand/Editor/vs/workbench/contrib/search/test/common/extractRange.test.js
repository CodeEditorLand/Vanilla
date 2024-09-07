import t from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as i}from"../../../../../base/test/common/utils.js";import{extractRangeFromFilter as l}from"../../common/search.js";suite("extractRangeFromFilter",()=>{i(),test("basics",async function(){t.ok(!l("")),t.ok(!l("/some/path")),t.ok(!l("/some/path/file.txt"));for(const s of[":","#","(",":line "])for(const n of[":","#",","]){const r="/some/path/file.txt";let e=l(`${r}${s}20`);t.strictEqual(e?.filter,r),t.strictEqual(e?.range.startLineNumber,20),t.strictEqual(e?.range.startColumn,1),e=l(`${r}${s}20${n}`),t.strictEqual(e?.filter,r),t.strictEqual(e?.range.startLineNumber,20),t.strictEqual(e?.range.startColumn,1),e=l(`${r}${s}20${n}3`),t.strictEqual(e?.filter,r),t.strictEqual(e?.range.startLineNumber,20),t.strictEqual(e?.range.startColumn,3)}}),test("allow space after path",async function(){const s=l("/some/path/file.txt (19,20)");t.strictEqual(s?.filter,"/some/path/file.txt"),t.strictEqual(s?.range.startLineNumber,19),t.strictEqual(s?.range.startColumn,20)}),suite("unless",function(){const s=[{filter:"/some/path/file.txt@alphasymbol",unless:["@"],result:void 0},{filter:"@/some/path/file.txt (19,20)",unless:["@"],result:void 0},{filter:"/some/path/file.txt (19,20)@",unless:["@"],result:void 0},{filter:"/some/@path/file.txt (19,20)",unless:["@"],result:{filter:"/some/@path/file.txt",range:{endColumn:20,endLineNumber:19,startColumn:20,startLineNumber:19}}},{filter:"/some/@path/file.txt:19:20",unless:["@"],result:{filter:"/some/@path/file.txt",range:{endColumn:20,endLineNumber:19,startColumn:20,startLineNumber:19}}},{filter:"/some/@path/file.txt#19",unless:["@"],result:{filter:"/some/@path/file.txt",range:{endColumn:1,endLineNumber:19,startColumn:1,startLineNumber:19}}}];for(const{filter:n,unless:r,result:e}of s)test(`${n} - ${JSON.stringify(r)}`,()=>{t.deepStrictEqual(l(n,r),e)})})});