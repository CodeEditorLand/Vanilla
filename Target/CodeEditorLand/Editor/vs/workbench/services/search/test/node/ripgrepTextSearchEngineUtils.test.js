import a from"assert";import{joinPath as c}from"../../../../../base/common/resources.js";import{URI as g}from"../../../../../base/common/uri.js";import{fixRegexNewline as l,RipgrepParser as w,unicodeEscapesToPCRE2 as i,fixNewline as R,getRgArgs as d,performBraceExpansionForRipgrep as x}from"../../node/ripgrepTextSearchEngine.js";import{Range as o,TextSearchMatchNew as u}from"../../common/searchExtTypes.js";import{ensureNoDisposablesAreLeakedInTestSuite as E}from"../../../../../base/test/common/utils.js";import"../../common/searchExtTypesInternal.js";import{DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS as m}from"../../common/search.js";suite("RipgrepTextSearchEngine",()=>{E(),test("unicodeEscapesToPCRE2",async()=>{a.strictEqual(i("\\u1234"),"\\x{1234}"),a.strictEqual(i("\\u1234\\u0001"),"\\x{1234}\\x{0001}"),a.strictEqual(i("foo\\u1234bar"),"foo\\x{1234}bar"),a.strictEqual(i("\\\\\\u1234"),"\\\\\\x{1234}"),a.strictEqual(i("foo\\\\\\u1234"),"foo\\\\\\x{1234}"),a.strictEqual(i("\\u{1234}"),"\\x{1234}"),a.strictEqual(i("\\u{1234}\\u{0001}"),"\\x{1234}\\x{0001}"),a.strictEqual(i("foo\\u{1234}bar"),"foo\\x{1234}bar"),a.strictEqual(i("[\\u00A0-\\u00FF]"),"[\\x{00A0}-\\x{00FF}]"),a.strictEqual(i("foo\\u{123456}7bar"),"foo\\u{123456}7bar"),a.strictEqual(i("\\u123"),"\\u123"),a.strictEqual(i("foo"),"foo"),a.strictEqual(i(""),"")}),test("fixRegexNewline - src",()=>{const n=[["foo","foo"],["invalid(","invalid("],["fo\\no","fo\\r?\\no"],["f\\no\\no","f\\r?\\no\\r?\\no"],["f[a-z\\n1]","f(?:[a-z1]|\\r?\\n)"],["f[\\n-a]","f[\\n-a]"],["(?<=\\n)\\w","(?<=\\n)\\w"],["fo\\n+o","fo(?:\\r?\\n)+o"],["fo[^\\n]o","fo(?!\\r?\\n)o"],["fo[^\\na-z]o","fo(?!\\r?\\n|[a-z])o"],["foo[^\\n]+o","foo.+o"],["foo[^\\nzq]+o","foo[^zq]+o"],["foo[^\\nzq]+o","foo[^zq]+o"],["fo[^\\S\\n]*o","fo[^\\S]*o"],["fo[^\\S\\n]{3,}o","fo[^\\S]{3,}o"]];for(const[t,e]of n)a.strictEqual(l(t),e,`${t} -> ${e}`)}),test("fixRegexNewline - re",()=>{function n([t,e,r]){const s=l(t),f=new RegExp(s);a.strictEqual(f.test(e),r,`${t} => ${f}, ${e}, ${r}`)}[["foo","foo",!0],["foo\\n",`foo\r
`,!0],["foo\\n\\n",`foo

`,!0],["foo\\n\\n",`foo\r
\r
`,!0],["foo\\n",`foo
`,!0],["foo\\nabc",`foo\r
abc`,!0],["foo\\nabc",`foo
abc`,!0],["foo\\r\\n",`foo\r
`,!0],["foo\\n+abc",`foo\r
abc`,!0],["foo\\n+abc",`foo


abc`,!0],["foo\\n+abc",`foo\r
\r
\r
abc`,!0],["foo[\\n-9]+abc","foo1abc",!0]].forEach(n)}),test("fixNewline - matching",()=>{function n([t,e,r=!0]){const s=R(t),f=new RegExp(s);a.strictEqual(f.test(e),r,`${t} => ${f}, ${e}, ${r}`)}[["foo","foo"],[`foo
`,`foo\r
`],[`foo
`,`foo
`],[`foo
abc`,`foo\r
abc`],[`foo
abc`,`foo
abc`],[`foo\r
`,`foo\r
`],[`foo
barc`,"foobar",!1],["foobar",`foo
bar`,!1]].forEach(n)}),suite("RipgrepParser",()=>{const n=g.file("/foo/bar");function t(r,s){const f=new w(1e3,n,m),b=[];f.on("result",p=>{b.push(p)}),r.forEach(p=>f.handleData(p)),f.flush(),a.deepStrictEqual(b,s)}function e(r,s,f,b){return JSON.stringify({type:"match",data:{path:{text:r},lines:{text:s},line_number:f,absolute_offset:0,submatches:b.map(p=>({...p,match:{text:s.substring(p.start,p.end)}}))}})+`
`}test("single result",()=>{t([e("file1.js","foobar",4,[{start:3,end:6}])],[new u(c(n,"file1.js"),[{previewRange:new o(0,3,0,6),sourceRange:new o(3,3,3,6)}],"foobar")])}),test("multiple results",()=>{t([e("file1.js","foobar",4,[{start:3,end:6}]),e("app/file2.js","foobar",4,[{start:3,end:6}]),e("app2/file3.js","foobar",4,[{start:3,end:6}])],[new u(c(n,"file1.js"),[{previewRange:new o(0,3,0,6),sourceRange:new o(3,3,3,6)}],"foobar"),new u(c(n,"app/file2.js"),[{previewRange:new o(0,3,0,6),sourceRange:new o(3,3,3,6)}],"foobar"),new u(c(n,"app2/file3.js"),[{previewRange:new o(0,3,0,6),sourceRange:new o(3,3,3,6)}],"foobar")])}),test("chopped-up input chunks",()=>{const r=[e("file1.js","foo bar",4,[{start:3,end:7}]),e("app/file2.js","foobar",4,[{start:3,end:6}]),e("app2/file3.js","foobar",4,[{start:3,end:6}])],s=r[0].indexOf(" ");t([r[0].substring(0,s+1),r[0].substring(s+1),`
`,r[1].trim(),`
`+r[2].substring(0,25),r[2].substring(25)],[new u(c(n,"file1.js"),[{previewRange:new o(0,3,0,7),sourceRange:new o(3,3,3,7)}],"foo bar"),new u(c(n,"app/file2.js"),[{previewRange:new o(0,3,0,6),sourceRange:new o(3,3,3,6)}],"foobar"),new u(c(n,"app2/file3.js"),[{previewRange:new o(0,3,0,6),sourceRange:new o(3,3,3,6)}],"foobar")])}),test("empty result (#100569)",()=>{t([e("file1.js","foobar",4,[]),e("file1.js","",5,[])],[new u(c(n,"file1.js"),[{previewRange:new o(0,0,0,1),sourceRange:new o(3,0,3,1)}],"foobar"),new u(c(n,"file1.js"),[{previewRange:new o(0,0,0,0),sourceRange:new o(4,0,4,0)}],"")])}),test("multiple submatches without newline in between (#131507)",()=>{t([e("file1.js","foobarbazquux",4,[{start:0,end:4},{start:6,end:10}])],[new u(c(n,"file1.js"),[{previewRange:new o(0,0,0,4),sourceRange:new o(3,0,3,4)},{previewRange:new o(0,6,0,10),sourceRange:new o(3,6,3,10)}],"foobarbazquux")])}),test("multiple submatches with newline in between (#131507)",()=>{t([e("file1.js",`foo
bar
baz
quux`,4,[{start:0,end:5},{start:8,end:13}])],[new u(c(n,"file1.js"),[{previewRange:new o(0,0,1,1),sourceRange:new o(3,0,4,1)},{previewRange:new o(2,0,3,1),sourceRange:new o(5,0,6,1)}],`foo
bar
baz
quux`)])})}),suite("getRgArgs",()=>{test("simple includes",()=>{function n(t,e){const r={pattern:"test"},s={folderOptions:{includes:t,excludes:[],useIgnoreFiles:{local:!1,global:!1,parent:!1},followSymlinks:!1,folder:g.file("/some/folder"),encoding:"utf8"},maxResults:1e3},f=["--hidden","--no-require-git","--ignore-case",...e,"--no-ignore","--crlf","--fixed-strings","--no-config","--no-ignore-global","--json","--","test","."],b=d(r,s);a.deepStrictEqual(b,f)}[[["a/*","b/*"],["-g","!*","-g","/a","-g","/a/*","-g","/b","-g","/b/*"]],[["**/a/*","b/*"],["-g","!*","-g","/b","-g","/b/*","-g","**/a/*"]],[["**/a/*","**/b/*"],["-g","**/a/*","-g","**/b/*"]],[["foo/*bar/something/**"],["-g","!*","-g","/foo","-g","/foo/*bar","-g","/foo/*bar/something","-g","/foo/*bar/something/**"]]].forEach(([t,e])=>n(t,e))})}),test("brace expansion for ripgrep",()=>{function n(t,e){const r=x(t);a.deepStrictEqual(r,e)}[["eep/{a,b}/test",["eep/a/test","eep/b/test"]],["eep/{a,b}/{c,d,e}",["eep/a/c","eep/a/d","eep/a/e","eep/b/c","eep/b/d","eep/b/e"]],["eep/{a,b}/\\{c,d,e}",["eep/a/{c,d,e}","eep/b/{c,d,e}"]],["eep/{a,b\\}/test",["eep/{a,b}/test"]],["eep/{a,b\\\\}/test",["eep/a/test","eep/b\\\\/test"]],["eep/{a,b\\\\\\}/test",["eep/{a,b\\\\}/test"]],["e\\{ep/{a,b}/test",["e{ep/a/test","e{ep/b/test"]],["eep/{a,\\b}/test",["eep/a/test","eep/\\b/test"]],["{a/*.*,b/*.*}",["a/*.*","b/*.*"]],["{{}",["{{}"]],["aa{{}",["aa{{}"]],["{b{}",["{b{}"]],["{{}c",["{{}c"]],["{{}}",["{{}}"]],["\\{{}}",["{}"]],["{}foo",["foo"]],["bar{ }foo",["bar foo"]],["{}",[""]]].forEach(([t,e])=>n(t,e))})});
