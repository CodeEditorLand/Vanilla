import a from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as q}from"../../../../base/test/common/utils.js";import{Position as r}from"../../../common/core/position.js";import{Range as l}from"../../../common/core/range.js";import{getMapForWordSeparators as v}from"../../../common/core/wordCharacterClassifier.js";import{USUAL_WORD_SEPARATORS as M}from"../../../common/core/wordHelper.js";import{EndOfLineSequence as F,FindMatch as w,SearchData as d}from"../../../common/model.js";import"../../../common/model/textModel.js";import{SearchParams as f,TextModelSearch as s,isMultilineRegexSource as m}from"../../../common/model/textModelSearch.js";import{createTextModel as h}from"../testTextModel.js";suite("TextModelSearch",()=>{q();const S=v(M,[]);function o(e,t,n=null){a.deepStrictEqual(e,new w(t,n))}function E(e,t,n){const N=s.findMatches(e,t,e.getFullModelRange(),!1,1e3);a.deepStrictEqual(N,n,"findMatches OK");let c=new r(1,1),x=s.findNextMatch(e,t,c,!1);a.deepStrictEqual(x,n[0],`findNextMatch ${c}`);for(const g of n)c=g.range.getStartPosition(),x=s.findNextMatch(e,t,c,!1),a.deepStrictEqual(x,g,`findNextMatch ${c}`);c=new r(e.getLineCount(),e.getLineMaxColumn(e.getLineCount())),x=s.findPreviousMatch(e,t,c,!1),a.deepStrictEqual(x,n[n.length-1],`findPrevMatch ${c}`);for(const g of n)c=g.range.getEndPosition(),x=s.findPreviousMatch(e,t,c,!1),a.deepStrictEqual(x,g,`findPrevMatch ${c}`)}function i(e,t,n,N,c,x){const j=x.map(P=>new l(P[0],P[1],P[2],P[3])).map(P=>new w(P,null)),J=new f(t,n,N,c),R=h(e);E(R,J,j),R.dispose();const b=h(e);b.setEOL(F.CRLF),E(b,J,j),b.dispose()}const p=["This is some foo - bar text which contains foo and bar - as in Barcelona.","Now it begins a word fooBar and now it is caps Foo-isn't this great?","And here's a dull line with nothing interesting in it","It is also interesting if it's part of a word like amazingFooBar","Again nothing interesting here"];test("Simple find",()=>{i(p.join(`
`),"foo",!1,!1,null,[[1,14,1,17],[1,44,1,47],[2,22,2,25],[2,48,2,51],[4,59,4,62]])}),test("Case sensitive find",()=>{i(p.join(`
`),"foo",!1,!0,null,[[1,14,1,17],[1,44,1,47],[2,22,2,25]])}),test("Whole words find",()=>{i(p.join(`
`),"foo",!1,!1,M,[[1,14,1,17],[1,44,1,47],[2,48,2,51]])}),test("/^/ find",()=>{i(p.join(`
`),"^",!0,!1,null,[[1,1,1,1],[2,1,2,1],[3,1,3,1],[4,1,4,1],[5,1,5,1]])}),test("/$/ find",()=>{i(p.join(`
`),"$",!0,!1,null,[[1,74,1,74],[2,69,2,69],[3,54,3,54],[4,65,4,65],[5,31,5,31]])}),test("/.*/ find",()=>{i(p.join(`
`),".*",!0,!1,null,[[1,1,1,74],[2,1,2,69],[3,1,3,54],[4,1,4,65],[5,1,5,31]])}),test("/^$/ find",()=>{i(["This is some foo - bar text which contains foo and bar - as in Barcelona.","","And here's a dull line with nothing interesting in it","","Again nothing interesting here"].join(`
`),"^$",!0,!1,null,[[2,1,2,1],[4,1,4,1]])}),test("multiline find 1",()=>{i(["Just some text text","Just some text text","some text again","again some text"].join(`
`),"text\\n",!0,!1,null,[[1,16,2,1],[2,16,3,1]])}),test("multiline find 2",()=>{i(["Just some text text","Just some text text","some text again","again some text"].join(`
`),"text\\nJust",!0,!1,null,[[1,16,2,5]])}),test("multiline find 3",()=>{i(["Just some text text","Just some text text","some text again","again some text"].join(`
`),"\\nagain",!0,!1,null,[[3,16,4,6]])}),test("multiline find 4",()=>{i(["Just some text text","Just some text text","some text again","again some text"].join(`
`),".*\\nJust.*\\n",!0,!1,null,[[1,1,3,1]])}),test("multiline find with line beginning regex",()=>{i(["if","else","","if","else"].join(`
`),"^if\\nelse",!0,!1,null,[[1,1,2,5],[4,1,5,5]])}),test("matching empty lines using boundary expression",()=>{i(["if","","else","  ","if"," ","else"].join(`
`),"^\\s*$\\n",!0,!1,null,[[2,1,3,1],[4,1,5,1],[6,1,7,1]])}),test("matching lines starting with A and ending with B",()=>{i(["a if b","a","ab","eb"].join(`
`),"^a.*b$",!0,!1,null,[[1,1,1,7],[3,1,3,3]])}),test("multiline find with line ending regex",()=>{i(["if","else","","if","elseif","else"].join(`
`),"if\\nelse$",!0,!1,null,[[1,1,2,5],[5,5,6,5]])}),test("issue #4836 - ^.*$",()=>{i(["Just some text text","","some text again","","again some text"].join(`
`),"^.*$",!0,!1,null,[[1,1,1,20],[2,1,2,1],[3,1,3,16],[4,1,4,1],[5,1,5,16]])}),test("multiline find for non-regex string",()=>{i(["Just some text text","some text text","some text again","again some text","but not some"].join(`
`),`text
some`,!1,!1,null,[[1,16,2,5],[2,11,3,5]])}),test("issue #3623: Match whole word does not work for not latin characters",()=>{i(["\u044F","\u043A\u043E\u043C\u043F\u0438\u043B\u044F\u0442\u043E\u0440","\u043E\u0431\u0444\u0443\u0441\u043A\u0430\u0446\u0438\u044F",":\u044F-\u044F"].join(`
`),"\u044F",!1,!1,M,[[1,1,1,2],[4,2,4,3],[4,4,4,5]])}),test("issue #27459: Match whole words regression",()=>{i(["this._register(this._textAreaInput.onKeyDown((e: IKeyboardEvent) => {","	this._viewController.emitKeyDown(e);","}));"].join(`
`),"((e: ",!1,!1,M,[[1,45,1,50]])}),test("issue #27594: Search results disappear",()=>{i(["this.server.listen(0);"].join(`
`),"listen(",!1,!1,M,[[1,13,1,20]])}),test("findNextMatch without regex",()=>{const e=h(`line line one
line two
three`),t=new f("line",!1,!1,null);let n=s.findNextMatch(e,t,new r(1,1),!1);o(n,new l(1,1,1,5)),n=s.findNextMatch(e,t,n.range.getEndPosition(),!1),o(n,new l(1,6,1,10)),n=s.findNextMatch(e,t,new r(1,3),!1),o(n,new l(1,6,1,10)),n=s.findNextMatch(e,t,n.range.getEndPosition(),!1),o(n,new l(2,1,2,5)),n=s.findNextMatch(e,t,n.range.getEndPosition(),!1),o(n,new l(1,1,1,5)),e.dispose()}),test("findNextMatch with beginning boundary regex",()=>{const e=h(`line one
line two
three`),t=new f("^line",!0,!1,null);let n=s.findNextMatch(e,t,new r(1,1),!1);o(n,new l(1,1,1,5)),n=s.findNextMatch(e,t,n.range.getEndPosition(),!1),o(n,new l(2,1,2,5)),n=s.findNextMatch(e,t,new r(1,3),!1),o(n,new l(2,1,2,5)),n=s.findNextMatch(e,t,n.range.getEndPosition(),!1),o(n,new l(1,1,1,5)),e.dispose()}),test("findNextMatch with beginning boundary regex and line has repetitive beginnings",()=>{const e=h(`line line one
line two
three`),t=new f("^line",!0,!1,null);let n=s.findNextMatch(e,t,new r(1,1),!1);o(n,new l(1,1,1,5)),n=s.findNextMatch(e,t,n.range.getEndPosition(),!1),o(n,new l(2,1,2,5)),n=s.findNextMatch(e,t,new r(1,3),!1),o(n,new l(2,1,2,5)),n=s.findNextMatch(e,t,n.range.getEndPosition(),!1),o(n,new l(1,1,1,5)),e.dispose()}),test("findNextMatch with beginning boundary multiline regex and line has repetitive beginnings",()=>{const e=h(`line line one
line two
line three
line four`),t=new f("^line.*\\nline",!0,!1,null);let n=s.findNextMatch(e,t,new r(1,1),!1);o(n,new l(1,1,2,5)),n=s.findNextMatch(e,t,n.range.getEndPosition(),!1),o(n,new l(3,1,4,5)),n=s.findNextMatch(e,t,new r(2,1),!1),o(n,new l(2,1,3,5)),e.dispose()}),test("findNextMatch with ending boundary regex",()=>{const e=h(`one line line
two line
three`),t=new f("line$",!0,!1,null);let n=s.findNextMatch(e,t,new r(1,1),!1);o(n,new l(1,10,1,14)),n=s.findNextMatch(e,t,new r(1,4),!1),o(n,new l(1,10,1,14)),n=s.findNextMatch(e,t,n.range.getEndPosition(),!1),o(n,new l(2,5,2,9)),n=s.findNextMatch(e,t,n.range.getEndPosition(),!1),o(n,new l(1,10,1,14)),e.dispose()}),test("findMatches with capturing matches",()=>{const e=h(`one line line
two line
three`),t=new f("(l(in)e)",!0,!1,null),n=s.findMatches(e,t,e.getFullModelRange(),!0,100);a.deepStrictEqual(n,[new w(new l(1,5,1,9),["line","line","in"]),new w(new l(1,10,1,14),["line","line","in"]),new w(new l(2,5,2,9),["line","line","in"])]),e.dispose()}),test("findMatches multiline with capturing matches",()=>{const e=h(`one line line
two line
three`),t=new f("(l(in)e)\\n",!0,!1,null),n=s.findMatches(e,t,e.getFullModelRange(),!0,100);a.deepStrictEqual(n,[new w(new l(1,10,2,1),[`line
`,"line","in"]),new w(new l(2,5,3,1),[`line
`,"line","in"])]),e.dispose()}),test("findNextMatch with capturing matches",()=>{const e=h(`one line line
two line
three`),t=new f("(l(in)e)",!0,!1,null),n=s.findNextMatch(e,t,new r(1,1),!0);o(n,new l(1,5,1,9),["line","line","in"]),e.dispose()}),test("findNextMatch multiline with capturing matches",()=>{const e=h(`one line line
two line
three`),t=new f("(l(in)e)\\n",!0,!1,null),n=s.findNextMatch(e,t,new r(1,1),!0);o(n,new l(1,10,2,1),[`line
`,"line","in"]),e.dispose()}),test("findPreviousMatch with capturing matches",()=>{const e=h(`one line line
two line
three`),t=new f("(l(in)e)",!0,!1,null),n=s.findPreviousMatch(e,t,new r(1,1),!0);o(n,new l(2,5,2,9),["line","line","in"]),e.dispose()}),test("findPreviousMatch multiline with capturing matches",()=>{const e=h(`one line line
two line
three`),t=new f("(l(in)e)\\n",!0,!1,null),n=s.findPreviousMatch(e,t,new r(1,1),!0);o(n,new l(2,5,3,1),[`line
`,"line","in"]),e.dispose()}),test("\\n matches \\r\\n",()=>{const e=h(`a\r
b\r
c\r
d\r
e\r
f\r
g\r
h\r
i`);a.strictEqual(e.getEOL(),`\r
`);let t=new f("h\\n",!0,!1,null),n=s.findNextMatch(e,t,new r(1,1),!0);n=s.findMatches(e,t,e.getFullModelRange(),!0,1e3)[0],o(n,new l(8,1,9,1),[`h
`]),t=new f("g\\nh\\n",!0,!1,null),n=s.findNextMatch(e,t,new r(1,1),!0),n=s.findMatches(e,t,e.getFullModelRange(),!0,1e3)[0],o(n,new l(7,1,9,1),[`g
h
`]),t=new f("\\ni",!0,!1,null),n=s.findNextMatch(e,t,new r(1,1),!0),n=s.findMatches(e,t,e.getFullModelRange(),!0,1e3)[0],o(n,new l(8,2,9,2),[`
i`]),e.dispose()}),test("\\r can never be found",()=>{const e=h(`a\r
b\r
c\r
d\r
e\r
f\r
g\r
h\r
i`);a.strictEqual(e.getEOL(),`\r
`);const t=new f("\\r\\n",!0,!1,null),n=s.findNextMatch(e,t,new r(1,1),!0);a.strictEqual(n,null),a.deepStrictEqual(s.findMatches(e,t,e.getFullModelRange(),!0,1e3),[]),e.dispose()});function u(e,t,n,N,c){const g=new f(e,t,n,N).parseSearchRequest();c===null?a.ok(g===null):(a.deepStrictEqual(g.regex,c.regex),a.deepStrictEqual(g.simpleSearch,c.simpleSearch),N?a.ok(g.wordSeparators!==null):a.ok(g.wordSeparators===null))}test("parseSearchRequest invalid",()=>{u("",!0,!0,M,null),u("(",!0,!1,null,null)}),test("parseSearchRequest non regex",()=>{u("foo",!1,!1,null,new d(/foo/giu,null,null)),u("foo",!1,!1,M,new d(/foo/giu,S,null)),u("foo",!1,!0,null,new d(/foo/gu,null,"foo")),u("foo",!1,!0,M,new d(/foo/gu,S,"foo")),u("foo\\n",!1,!1,null,new d(/foo\\n/giu,null,null)),u("foo\\\\n",!1,!1,null,new d(/foo\\\\n/giu,null,null)),u("foo\\r",!1,!1,null,new d(/foo\\r/giu,null,null)),u("foo\\\\r",!1,!1,null,new d(/foo\\\\r/giu,null,null))}),test("parseSearchRequest regex",()=>{u("foo",!0,!1,null,new d(/foo/giu,null,null)),u("foo",!0,!1,M,new d(/foo/giu,S,null)),u("foo",!0,!0,null,new d(/foo/gu,null,null)),u("foo",!0,!0,M,new d(/foo/gu,S,null)),u("foo\\n",!0,!1,null,new d(/foo\n/gimu,null,null)),u("foo\\\\n",!0,!1,null,new d(/foo\\n/giu,null,null)),u("foo\\r",!0,!1,null,new d(/foo\r/gimu,null,null)),u("foo\\\\r",!0,!1,null,new d(/foo\\r/giu,null,null))}),test("issue #53415. W should match line break.",()=>{i(["text","180702-","180703-180704"].join(`
`),"\\d{6}-\\W",!0,!1,null,[[2,1,3,1]]),i(["Just some text","","Just"].join(`
`),"\\W",!0,!1,null,[[1,5,1,6],[1,10,1,11],[1,15,2,1],[2,1,3,1]]),i(["Just some text","","Just"].join(`\r
`),"\\W",!0,!1,null,[[1,5,1,6],[1,10,1,11],[1,15,2,1],[2,1,3,1]]),i(["Just some text","	Just","Just"].join(`
`),"\\W",!0,!1,null,[[1,5,1,6],[1,10,1,11],[1,15,2,1],[2,1,2,2],[2,6,3,1]]),i(["Just  some text","","Just"].join(`
`),"\\W{2}",!0,!1,null,[[1,5,1,7],[1,16,3,1]]),i(["Just  some text","","Just"].join(`\r
`),"\\W{2}",!0,!1,null,[[1,5,1,7],[1,16,3,1]])}),test("Simple find using unicode escape sequences",()=>{i(p.join(`
`),"\\u{0066}\\u006f\\u006F",!0,!1,null,[[1,14,1,17],[1,44,1,47],[2,22,2,25],[2,48,2,51],[4,59,4,62]])}),test("isMultilineRegexSource",()=>{a(!m("foo")),a(!m("")),a(!m("foo\\sbar")),a(!m("\\\\notnewline")),a(m("foo\\nbar")),a(m("foo\\nbar\\s")),a(m("foo\\r\\n")),a(m("\\n")),a(m("foo\\W")),a(m(`foo
`)),a(m(`foo\r
`))}),test("issue #74715. \\d* finds empty string and stops searching.",()=>{const e=h("10.243.30.10"),t=new f("\\d*",!0,!1,null),n=s.findMatches(e,t,e.getFullModelRange(),!0,100);a.deepStrictEqual(n,[new w(new l(1,1,1,3),["10"]),new w(new l(1,3,1,3),[""]),new w(new l(1,4,1,7),["243"]),new w(new l(1,7,1,7),[""]),new w(new l(1,8,1,10),["30"]),new w(new l(1,10,1,10),[""]),new w(new l(1,11,1,13),["10"])]),e.dispose()}),test("issue #100134. Zero-length matches should properly step over surrogate pairs",()=>{i("1\u{1F4BB}1","()",!0,!1,null,[[1,1,1,1],[1,2,1,2],[1,4,1,4],[1,5,1,5]]),i("1\u{1F431}\u200D\u{1F4BB}1","()",!0,!1,null,[[1,1,1,1],[1,2,1,2],[1,4,1,4],[1,5,1,5],[1,7,1,7],[1,8,1,8]])})});
