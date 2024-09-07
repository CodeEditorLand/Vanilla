import o from"assert";import{splitLines as I}from"../../../../../base/common/strings.js";import{ensureNoDisposablesAreLeakedInTestSuite as P}from"../../../../../base/test/common/utils.js";import"../../../../common/core/position.js";import{Range as y}from"../../../../common/core/range.js";import{BeforeEditPositionMapper as q,TextEditInfo as B}from"../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/beforeEditPositionMapper.js";import{lengthOfString as M,lengthToObj as O,lengthToPosition as S,toLength as t}from"../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/length.js";suite("Bracket Pair Colorizer - BeforeEditPositionMapper",()=>{P(),test("Single-Line 1",()=>{o.deepStrictEqual(a(["0123456789"],[new n(t(0,4),t(0,7),"xy")]),["0  1  2  3  x  y  7  8  9  ","0  0  0  0  0  0  0  0  0  0  ","0  1  2  3  4  5  7  8  9  10 ","0  0  0  0  0  0  \u221E  \u221E  \u221E  \u221E  ","4  3  2  1  0  0  \u221E  \u221E  \u221E  \u221E  "])}),test("Single-Line 2",()=>{o.deepStrictEqual(a(["0123456789"],[new n(t(0,2),t(0,4),"xxxx"),new n(t(0,6),t(0,6),"yy")]),["0  1  x  x  x  x  4  5  y  y  6  7  8  9  ","0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  ","0  1  2  3  4  5  4  5  6  7  6  7  8  9  10 ","0  0  0  0  0  0  0  0  0  0  \u221E  \u221E  \u221E  \u221E  \u221E  ","2  1  0  0  0  0  2  1  0  0  \u221E  \u221E  \u221E  \u221E  \u221E  "])}),test("Multi-Line Replace 1",()=>{o.deepStrictEqual(a(["\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089","0123456789","\u2070\xB9\xB2\xB3\u2074\u2075\u2076\u2077\u2078\u2079"],[new n(t(0,3),t(1,3),"xy")]),["\u2080  \u2081  \u2082  x  y  3  4  5  6  7  8  9  ","0  0  0  0  0  1  1  1  1  1  1  1  1  ","0  1  2  3  4  3  4  5  6  7  8  9  10 ","0  0  0  0  0  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ","3  2  1  0  0  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ","\u2070  \xB9  \xB2  \xB3  \u2074  \u2075  \u2076  \u2077  \u2078  \u2079  ","2  2  2  2  2  2  2  2  2  2  2  ","0  1  2  3  4  5  6  7  8  9  10 ","\u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ","\u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  "])}),test("Multi-Line Replace 2",()=>{o.deepStrictEqual(a(["\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089","012345678","\u2070\xB9\xB2\xB3\u2074\u2075\u2076\u2077\u2078\u2079"],[new n(t(0,3),t(1,0),"ab"),new n(t(1,5),t(1,7),"c")]),["\u2080  \u2081  \u2082  a  b  0  1  2  3  4  c  7  8  ","0  0  0  0  0  1  1  1  1  1  1  1  1  1  ","0  1  2  3  4  0  1  2  3  4  5  7  8  9  ","0  0  0  0  0  0  0  0  0  0  0  \u221E  \u221E  \u221E  ","3  2  1  0  0  5  4  3  2  1  0  \u221E  \u221E  \u221E  ","\u2070  \xB9  \xB2  \xB3  \u2074  \u2075  \u2076  \u2077  \u2078  \u2079  ","2  2  2  2  2  2  2  2  2  2  2  ","0  1  2  3  4  5  6  7  8  9  10 ","\u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ","\u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  "])}),test("Multi-Line Replace 3",()=>{o.deepStrictEqual(a(["\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089","012345678","\u2070\xB9\xB2\xB3\u2074\u2075\u2076\u2077\u2078\u2079"],[new n(t(0,3),t(1,0),"ab"),new n(t(1,5),t(1,7),"c"),new n(t(1,8),t(2,4),"d")]),["\u2080  \u2081  \u2082  a  b  0  1  2  3  4  c  7  d  \u2074  \u2075  \u2076  \u2077  \u2078  \u2079  ","0  0  0  0  0  1  1  1  1  1  1  1  1  2  2  2  2  2  2  2  ","0  1  2  3  4  0  1  2  3  4  5  7  8  4  5  6  7  8  9  10 ","0  0  0  0  0  0  0  0  0  0  0  0  0  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ","3  2  1  0  0  5  4  3  2  1  0  1  0  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  "])}),test("Multi-Line Insert 1",()=>{o.deepStrictEqual(a(["012345678"],[new n(t(0,3),t(0,5),`a
b`)]),["0  1  2  a  ","0  0  0  0  0  ","0  1  2  3  4  ","0  0  0  0  0  ","3  2  1  0  0  ","b  5  6  7  8  ","1  0  0  0  0  0  ","0  5  6  7  8  9  ","0  \u221E  \u221E  \u221E  \u221E  \u221E  ","0  \u221E  \u221E  \u221E  \u221E  \u221E  "])}),test("Multi-Line Insert 2",()=>{o.deepStrictEqual(a(["012345678"],[new n(t(0,3),t(0,5),`a
b`),new n(t(0,7),t(0,8),`x
y`)]),["0  1  2  a  ","0  0  0  0  0  ","0  1  2  3  4  ","0  0  0  0  0  ","3  2  1  0  0  ","b  5  6  x  ","1  0  0  0  0  ","0  5  6  7  8  ","0  0  0  0  0  ","0  2  1  0  0  ","y  8  ","1  0  0  ","0  8  9  ","0  \u221E  \u221E  ","0  \u221E  \u221E  "])}),test("Multi-Line Replace/Insert 1",()=>{o.deepStrictEqual(a(["\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089","012345678","\u2070\xB9\xB2\xB3\u2074\u2075\u2076\u2077\u2078\u2079"],[new n(t(0,3),t(1,1),`aaa
bbb`)]),["\u2080  \u2081  \u2082  a  a  a  ","0  0  0  0  0  0  0  ","0  1  2  3  4  5  6  ","0  0  0  0  0  0  0  ","3  2  1  0  0  0  0  ","b  b  b  1  2  3  4  5  6  7  8  ","1  1  1  1  1  1  1  1  1  1  1  1  ","0  1  2  1  2  3  4  5  6  7  8  9  ","0  0  0  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ","0  0  0  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ","\u2070  \xB9  \xB2  \xB3  \u2074  \u2075  \u2076  \u2077  \u2078  \u2079  ","2  2  2  2  2  2  2  2  2  2  2  ","0  1  2  3  4  5  6  7  8  9  10 ","\u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ","\u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  "])}),test("Multi-Line Replace/Insert 2",()=>{o.deepStrictEqual(a(["\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089","012345678","\u2070\xB9\xB2\xB3\u2074\u2075\u2076\u2077\u2078\u2079"],[new n(t(0,3),t(1,1),`aaa
bbb`),new n(t(1,5),t(1,5),`x
y`),new n(t(1,7),t(2,4),`k
l`)]),["\u2080  \u2081  \u2082  a  a  a  ","0  0  0  0  0  0  0  ","0  1  2  3  4  5  6  ","0  0  0  0  0  0  0  ","3  2  1  0  0  0  0  ","b  b  b  1  2  3  4  x  ","1  1  1  1  1  1  1  1  1  ","0  1  2  1  2  3  4  5  6  ","0  0  0  0  0  0  0  0  0  ","0  0  0  4  3  2  1  0  0  ","y  5  6  k  ","2  1  1  1  1  ","0  5  6  7  8  ","0  0  0  0  0  ","0  2  1  0  0  ","l  \u2074  \u2075  \u2076  \u2077  \u2078  \u2079  ","2  2  2  2  2  2  2  2  ","0  4  5  6  7  8  9  10 ","0  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  ","0  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  \u221E  "])})});function a(i,s){const r=I(C(i.join(`
`),s.map(u=>({text:u.newText,range:y.fromPositions(S(u.startOffset),S(u.endOffset))})))),f=new q(s),e=new Array;let l=0;for(const u of r){let b="",x="",m="",g="",d="";for(let c=0;c<=u.length;c++){const E=f.getOffsetBeforeChange(t(l,c)),h=O(E);c<u.length&&(m+=p(u[c],3)),b+=p(""+h.lineCount,3),x+=p(""+h.columnCount,3);const L=f.getDistanceToNextChange(t(l,c));if(L===null)d+="\u221E  ",g+="\u221E  ";else{const w=O(L);d+=p(""+w.lineCount,3),g+=p(""+w.columnCount,3)}}e.push(m),e.push(b),e.push(x),e.push(d),e.push(g),l++}return e}class n extends B{constructor(r,f,e){super(r,f,M(e));this.newText=e}}class T{lineStartOffsetByLineIdx;constructor(s){this.lineStartOffsetByLineIdx=[],this.lineStartOffsetByLineIdx.push(0);for(let r=0;r<s.length;r++)s.charAt(r)===`
`&&this.lineStartOffsetByLineIdx.push(r+1)}getOffset(s){return this.lineStartOffsetByLineIdx[s.lineNumber-1]+s.column-1}}function C(i,s){const r=new T(i),f=s.map(e=>{const l=y.lift(e.range);return{startOffset:r.getOffset(l.getStartPosition()),endOffset:r.getOffset(l.getEndPosition()),text:e.text}});f.sort((e,l)=>l.startOffset-e.startOffset);for(const e of f)i=i.substring(0,e.startOffset)+e.text+i.substring(e.endOffset);return i}function p(i,s){for(;i.length<s;)i+=" ";return i}export{n as TextEdit};