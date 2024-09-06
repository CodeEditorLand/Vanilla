import s from"assert";import{WordCharacterClassifier as A}from"../../../../common/core/wordCharacterClassifier.js";import{Position as a}from"../../../../common/core/position.js";import{Range as o}from"../../../../common/core/range.js";import{DefaultEndOfLine as R,SearchData as P}from"../../../../common/model.js";import"../../../../common/model/pieceTreeTextBuffer/pieceTreeBase.js";import"../../../../common/model/pieceTreeTextBuffer/pieceTreeTextBuffer.js";import{PieceTreeTextBufferBuilder as S}from"../../../../common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder.js";import{NodeColor as C,SENTINEL as T}from"../../../../common/model/pieceTreeTextBuffer/rbTreeBase.js";import{createTextModel as Y}from"../../testTextModel.js";import{splitLines as h}from"../../../../../base/common/strings.js";import{ensureNoDisposablesAreLeakedInTestSuite as f}from"../../../../../base/test/common/utils.js";const Z=`abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\r
`;function k(){return Z[E(Z.length)]}function E(r){return Math.floor(Math.random()*r)}function m(r){return r===null&&(r=10),function(){let e,n;const t=[];for(e=1,n=r;1<=n?e<n:e>n;1<=n?e++:e--)t.push(k());return t}().join("")}function O(r){return r.length===0?r:r.length===1?r.charCodeAt(r.length-1)===10||r.charCodeAt(r.length-1)===13?"":r:r.charCodeAt(r.length-1)===10?r.charCodeAt(r.length-2)===13?r.slice(0,-2):r.slice(0,-1):r.charCodeAt(r.length-1)===13?r.slice(0,-1):r}function l(r,e){const n=h(r);s.strictEqual(e.getLineCount(),n.length),s.strictEqual(e.getLinesRawContent(),r);for(let t=0;t<n.length;t++)s.strictEqual(e.getLineContent(t+1),n[t]),s.strictEqual(O(e.getValueInRange(new o(t+1,1,t+1,n[t].length+(t===n.length-1?1:2)))),n[t])}function p(r,e){const n=[0],t=new RegExp(/\r\n|\r|\n/g);t.lastIndex=0;let u=-1,d=0,b;do{if(u+d===r.length||(b=t.exec(r),!b))break;const c=b.index,q=b[0].length;if(c===u&&q===d)break;u=c,d=q,n.push(c+q)}while(b);for(let c=0;c<n.length;c++)s.deepStrictEqual(e.getPositionAt(n[c]),new a(c+1,1)),s.strictEqual(e.getOffsetAt(c+1,1),n[c]);for(let c=1;c<n.length;c++){const q=e.getPositionAt(n[c]-1);s.strictEqual(e.getOffsetAt(q.lineNumber,q.column),n[c]-1)}}function i(r,e=!0){const n=new S;for(const u of r)n.acceptChunk(u);return n.finish(e).create(R.LF).textBuffer}function g(r){s(T.color===C.Black),s(T.parent===T),s(T.left===T),s(T.right===T),s(T.size_left===0),s(T.lf_left===0),B(r)}function L(r){return r===T?1:(s(L(r.left)===L(r.right)),(r.color===C.Black?1:0)+L(r.left))}function X(r){if(r===T)return{size:0,lf_cnt:0};const e=r.left,n=r.right;r.color===C.Red&&(s(e.color===C.Black),s(n.color===C.Black));const t=X(e);s(t.lf_cnt===r.lf_left),s(t.size===r.size_left);const u=X(n);return{size:r.size_left+r.piece.length+u.size,lf_cnt:r.lf_left+r.piece.lineFeedCnt+u.lf_cnt}}function B(r){r.root!==T&&(s(r.root.color===C.Black),s(L(r.root.left)===L(r.root.right)),X(r.root))}suite("inserts and deletes",()=>{const r=f();test("basic insert/delete",()=>{const e=i(["This is a document with some text."]);r.add(e);const n=e.getPieceTree();n.insert(34,"This is some more text to insert at offset 34."),s.strictEqual(n.getLinesRawContent(),"This is a document with some text.This is some more text to insert at offset 34."),n.delete(42,5),s.strictEqual(n.getLinesRawContent(),"This is a document with some text.This is more text to insert at offset 34."),g(n)}),test("more inserts",()=>{const e=i([""]);r.add(e);const n=e.getPieceTree();n.insert(0,"AAA"),s.strictEqual(n.getLinesRawContent(),"AAA"),n.insert(0,"BBB"),s.strictEqual(n.getLinesRawContent(),"BBBAAA"),n.insert(6,"CCC"),s.strictEqual(n.getLinesRawContent(),"BBBAAACCC"),n.insert(5,"DDD"),s.strictEqual(n.getLinesRawContent(),"BBBAADDDACCC"),g(n)}),test("more deletes",()=>{const e=i(["012345678"]);r.add(e);const n=e.getPieceTree();n.delete(8,1),s.strictEqual(n.getLinesRawContent(),"01234567"),n.delete(0,1),s.strictEqual(n.getLinesRawContent(),"1234567"),n.delete(5,1),s.strictEqual(n.getLinesRawContent(),"123457"),n.delete(5,1),s.strictEqual(n.getLinesRawContent(),"12345"),n.delete(0,5),s.strictEqual(n.getLinesRawContent(),""),g(n)}),test("random test 1",()=>{let e="";const n=i([""]);r.add(n);const t=n.getPieceTree();t.insert(0,"ceLPHmFzvCtFeHkCBej "),e=e.substring(0,0)+"ceLPHmFzvCtFeHkCBej "+e.substring(0),s.strictEqual(t.getLinesRawContent(),e),t.insert(8,"gDCEfNYiBUNkSwtvB K "),e=e.substring(0,8)+"gDCEfNYiBUNkSwtvB K "+e.substring(8),s.strictEqual(t.getLinesRawContent(),e),t.insert(38,"cyNcHxjNPPoehBJldLS "),e=e.substring(0,38)+"cyNcHxjNPPoehBJldLS "+e.substring(38),s.strictEqual(t.getLinesRawContent(),e),t.insert(59,`ejMx
OTgWlbpeDExjOk `),e=e.substring(0,59)+`ejMx
OTgWlbpeDExjOk `+e.substring(59),s.strictEqual(t.getLinesRawContent(),e),g(t)}),test("random test 2",()=>{let e="";const n=i([""]);r.add(n);const t=n.getPieceTree();t.insert(0,"VgPG "),e=e.substring(0,0)+"VgPG "+e.substring(0),t.insert(2,"DdWF "),e=e.substring(0,2)+"DdWF "+e.substring(2),t.insert(0,"hUJc "),e=e.substring(0,0)+"hUJc "+e.substring(0),t.insert(8,"lQEq "),e=e.substring(0,8)+"lQEq "+e.substring(8),t.insert(10,"Gbtp "),e=e.substring(0,10)+"Gbtp "+e.substring(10),s.strictEqual(t.getLinesRawContent(),e),g(t)}),test("random test 3",()=>{let e="";const n=i([""]);r.add(n);const t=n.getPieceTree();t.insert(0,"gYSz"),e=e.substring(0,0)+"gYSz"+e.substring(0),t.insert(1,"mDQe"),e=e.substring(0,1)+"mDQe"+e.substring(1),t.insert(1,"DTMQ"),e=e.substring(0,1)+"DTMQ"+e.substring(1),t.insert(2,"GGZB"),e=e.substring(0,2)+"GGZB"+e.substring(2),t.insert(12,"wXpq"),e=e.substring(0,12)+"wXpq"+e.substring(12),s.strictEqual(t.getLinesRawContent(),e)}),test("random delete 1",()=>{let e="";const n=i([""]);r.add(n);const t=n.getPieceTree();t.insert(0,"vfb"),e=e.substring(0,0)+"vfb"+e.substring(0),s.strictEqual(t.getLinesRawContent(),e),t.insert(0,"zRq"),e=e.substring(0,0)+"zRq"+e.substring(0),s.strictEqual(t.getLinesRawContent(),e),t.delete(5,1),e=e.substring(0,5)+e.substring(6),s.strictEqual(t.getLinesRawContent(),e),t.insert(1,"UNw"),e=e.substring(0,1)+"UNw"+e.substring(1),s.strictEqual(t.getLinesRawContent(),e),t.delete(4,3),e=e.substring(0,4)+e.substring(7),s.strictEqual(t.getLinesRawContent(),e),t.delete(1,4),e=e.substring(0,1)+e.substring(5),s.strictEqual(t.getLinesRawContent(),e),t.delete(0,1),e=e.substring(0,0)+e.substring(1),s.strictEqual(t.getLinesRawContent(),e),g(t)}),test("random delete 2",()=>{let e="";const n=i([""]);r.add(n);const t=n.getPieceTree();t.insert(0,"IDT"),e=e.substring(0,0)+"IDT"+e.substring(0),t.insert(3,"wwA"),e=e.substring(0,3)+"wwA"+e.substring(3),t.insert(3,"Gnr"),e=e.substring(0,3)+"Gnr"+e.substring(3),t.delete(6,3),e=e.substring(0,6)+e.substring(9),t.insert(4,"eHp"),e=e.substring(0,4)+"eHp"+e.substring(4),t.insert(1,"UAi"),e=e.substring(0,1)+"UAi"+e.substring(1),t.insert(2,"FrR"),e=e.substring(0,2)+"FrR"+e.substring(2),t.delete(6,7),e=e.substring(0,6)+e.substring(13),t.delete(3,5),e=e.substring(0,3)+e.substring(8),s.strictEqual(t.getLinesRawContent(),e),g(t)}),test("random delete 3",()=>{let e="";const n=i([""]);r.add(n);const t=n.getPieceTree();t.insert(0,"PqM"),e=e.substring(0,0)+"PqM"+e.substring(0),t.delete(1,2),e=e.substring(0,1)+e.substring(3),t.insert(1,"zLc"),e=e.substring(0,1)+"zLc"+e.substring(1),t.insert(0,"MEX"),e=e.substring(0,0)+"MEX"+e.substring(0),t.insert(0,"jZh"),e=e.substring(0,0)+"jZh"+e.substring(0),t.insert(8,"GwQ"),e=e.substring(0,8)+"GwQ"+e.substring(8),t.delete(5,6),e=e.substring(0,5)+e.substring(11),t.insert(4,"ktw"),e=e.substring(0,4)+"ktw"+e.substring(4),t.insert(5,"GVu"),e=e.substring(0,5)+"GVu"+e.substring(5),t.insert(9,"jdm"),e=e.substring(0,9)+"jdm"+e.substring(9),t.insert(15,`na
`),e=e.substring(0,15)+`na
`+e.substring(15),t.delete(5,8),e=e.substring(0,5)+e.substring(13),t.delete(3,4),e=e.substring(0,3)+e.substring(7),s.strictEqual(t.getLinesRawContent(),e),g(t)}),test("random insert/delete \\r bug 1",()=>{let e="a";const n=i(["a"]);r.add(n);const t=n.getPieceTree();t.delete(0,1),e=e.substring(0,0)+e.substring(1),t.insert(0,`\r\r

`),e=e.substring(0,0)+`\r\r

`+e.substring(0),t.delete(3,1),e=e.substring(0,3)+e.substring(4),t.insert(2,`

\ra`),e=e.substring(0,2)+`

\ra`+e.substring(2),t.delete(4,3),e=e.substring(0,4)+e.substring(7),t.insert(2,`
a\r\r`),e=e.substring(0,2)+`
a\r\r`+e.substring(2),t.insert(6,`\ra

`),e=e.substring(0,6)+`\ra

`+e.substring(6),t.insert(0,`aa

`),e=e.substring(0,0)+`aa

`+e.substring(0),t.insert(5,`

a\r`),e=e.substring(0,5)+`

a\r`+e.substring(5),s.strictEqual(t.getLinesRawContent(),e),g(t)}),test("random insert/delete \\r bug 2",()=>{let e="a";const n=i(["a"]);r.add(n);const t=n.getPieceTree();t.insert(1,`
aa\r`),e=e.substring(0,1)+`
aa\r`+e.substring(1),t.delete(0,4),e=e.substring(0,0)+e.substring(4),t.insert(1,`\r\r
a`),e=e.substring(0,1)+`\r\r
a`+e.substring(1),t.insert(2,`
\r\ra`),e=e.substring(0,2)+`
\r\ra`+e.substring(2),t.delete(4,1),e=e.substring(0,4)+e.substring(5),t.insert(8,`\r
\r\r`),e=e.substring(0,8)+`\r
\r\r`+e.substring(8),t.insert(7,`


a`),e=e.substring(0,7)+`


a`+e.substring(7),t.insert(13,`a

a`),e=e.substring(0,13)+`a

a`+e.substring(13),t.delete(17,3),e=e.substring(0,17)+e.substring(20),t.insert(2,`a\ra
`),e=e.substring(0,2)+`a\ra
`+e.substring(2),s.strictEqual(t.getLinesRawContent(),e),g(t)}),test("random insert/delete \\r bug 3",()=>{let e="a";const n=i(["a"]);r.add(n);const t=n.getPieceTree();t.insert(0,`\r
a\r`),e=e.substring(0,0)+`\r
a\r`+e.substring(0),t.delete(2,3),e=e.substring(0,2)+e.substring(5),t.insert(2,`a\r
\r`),e=e.substring(0,2)+`a\r
\r`+e.substring(2),t.delete(4,2),e=e.substring(0,4)+e.substring(6),t.insert(4,`a
\r
`),e=e.substring(0,4)+`a
\r
`+e.substring(4),t.insert(1,`aa
\r`),e=e.substring(0,1)+`aa
\r`+e.substring(1),t.insert(7,`
a\r
`),e=e.substring(0,7)+`
a\r
`+e.substring(7),t.insert(5,`

a\r`),e=e.substring(0,5)+`

a\r`+e.substring(5),t.insert(10,`\r\r
\r`),e=e.substring(0,10)+`\r\r
\r`+e.substring(10),s.strictEqual(t.getLinesRawContent(),e),t.delete(21,3),e=e.substring(0,21)+e.substring(24),s.strictEqual(t.getLinesRawContent(),e),g(t)}),test("random insert/delete \\r bug 4s",()=>{let e="a";const n=i(["a"]);r.add(n);const t=n.getPieceTree();t.delete(0,1),e=e.substring(0,0)+e.substring(1),t.insert(0,`
aaa`),e=e.substring(0,0)+`
aaa`+e.substring(0),t.insert(2,`

aa`),e=e.substring(0,2)+`

aa`+e.substring(2),t.delete(1,4),e=e.substring(0,1)+e.substring(5),t.delete(3,1),e=e.substring(0,3)+e.substring(4),t.delete(1,2),e=e.substring(0,1)+e.substring(3),t.delete(0,1),e=e.substring(0,0)+e.substring(1),t.insert(0,`a

\r`),e=e.substring(0,0)+`a

\r`+e.substring(0),t.insert(2,`aa\r
`),e=e.substring(0,2)+`aa\r
`+e.substring(2),t.insert(3,`a
aa`),e=e.substring(0,3)+`a
aa`+e.substring(3),s.strictEqual(t.getLinesRawContent(),e),g(t)}),test("random insert/delete \\r bug 5",()=>{let e="";const n=i([""]);r.add(n);const t=n.getPieceTree();t.insert(0,`


\r`),e=e.substring(0,0)+`


\r`+e.substring(0),t.insert(1,`


\r`),e=e.substring(0,1)+`


\r`+e.substring(1),t.insert(2,`
\r\r\r`),e=e.substring(0,2)+`
\r\r\r`+e.substring(2),t.insert(8,`
\r
\r`),e=e.substring(0,8)+`
\r
\r`+e.substring(8),t.delete(5,2),e=e.substring(0,5)+e.substring(7),t.insert(4,`
\r\r\r`),e=e.substring(0,4)+`
\r\r\r`+e.substring(4),t.insert(8,`


\r`),e=e.substring(0,8)+`


\r`+e.substring(8),t.delete(0,7),e=e.substring(0,0)+e.substring(7),t.insert(1,`\r
\r\r`),e=e.substring(0,1)+`\r
\r\r`+e.substring(1),t.insert(15,`
\r\r\r`),e=e.substring(0,15)+`
\r\r\r`+e.substring(15),s.strictEqual(t.getLinesRawContent(),e),g(t)})}),suite("prefix sum for line feed",()=>{const r=f();test("basic",()=>{const e=i([`1
2
3
4`]);r.add(e);const n=e.getPieceTree();s.strictEqual(n.getLineCount(),4),s.deepStrictEqual(n.getPositionAt(0),new a(1,1)),s.deepStrictEqual(n.getPositionAt(1),new a(1,2)),s.deepStrictEqual(n.getPositionAt(2),new a(2,1)),s.deepStrictEqual(n.getPositionAt(3),new a(2,2)),s.deepStrictEqual(n.getPositionAt(4),new a(3,1)),s.deepStrictEqual(n.getPositionAt(5),new a(3,2)),s.deepStrictEqual(n.getPositionAt(6),new a(4,1)),s.strictEqual(n.getOffsetAt(1,1),0),s.strictEqual(n.getOffsetAt(1,2),1),s.strictEqual(n.getOffsetAt(2,1),2),s.strictEqual(n.getOffsetAt(2,2),3),s.strictEqual(n.getOffsetAt(3,1),4),s.strictEqual(n.getOffsetAt(3,2),5),s.strictEqual(n.getOffsetAt(4,1),6),g(n)}),test("append",()=>{const e=i([`a
b
c
de`]);r.add(e);const n=e.getPieceTree();n.insert(8,`fh
i
jk`),s.strictEqual(n.getLineCount(),6),s.deepStrictEqual(n.getPositionAt(9),new a(4,4)),s.strictEqual(n.getOffsetAt(1,1),0),g(n)}),test("insert",()=>{const e=i([`a
b
c
de`]);r.add(e);const n=e.getPieceTree();n.insert(7,`fh
i
jk`),s.strictEqual(n.getLineCount(),6),s.deepStrictEqual(n.getPositionAt(6),new a(4,1)),s.deepStrictEqual(n.getPositionAt(7),new a(4,2)),s.deepStrictEqual(n.getPositionAt(8),new a(4,3)),s.deepStrictEqual(n.getPositionAt(9),new a(4,4)),s.deepStrictEqual(n.getPositionAt(12),new a(6,1)),s.deepStrictEqual(n.getPositionAt(13),new a(6,2)),s.deepStrictEqual(n.getPositionAt(14),new a(6,3)),s.strictEqual(n.getOffsetAt(4,1),6),s.strictEqual(n.getOffsetAt(4,2),7),s.strictEqual(n.getOffsetAt(4,3),8),s.strictEqual(n.getOffsetAt(4,4),9),s.strictEqual(n.getOffsetAt(6,1),12),s.strictEqual(n.getOffsetAt(6,2),13),s.strictEqual(n.getOffsetAt(6,3),14),g(n)}),test("delete",()=>{const e=i([`a
b
c
defh
i
jk`]);r.add(e);const n=e.getPieceTree();n.delete(7,2),s.strictEqual(n.getLinesRawContent(),`a
b
c
dh
i
jk`),s.strictEqual(n.getLineCount(),6),s.deepStrictEqual(n.getPositionAt(6),new a(4,1)),s.deepStrictEqual(n.getPositionAt(7),new a(4,2)),s.deepStrictEqual(n.getPositionAt(8),new a(4,3)),s.deepStrictEqual(n.getPositionAt(9),new a(5,1)),s.deepStrictEqual(n.getPositionAt(11),new a(6,1)),s.deepStrictEqual(n.getPositionAt(12),new a(6,2)),s.deepStrictEqual(n.getPositionAt(13),new a(6,3)),s.strictEqual(n.getOffsetAt(4,1),6),s.strictEqual(n.getOffsetAt(4,2),7),s.strictEqual(n.getOffsetAt(4,3),8),s.strictEqual(n.getOffsetAt(5,1),9),s.strictEqual(n.getOffsetAt(6,1),11),s.strictEqual(n.getOffsetAt(6,2),12),s.strictEqual(n.getOffsetAt(6,3),13),g(n)}),test("add+delete 1",()=>{const e=i([`a
b
c
de`]);r.add(e);const n=e.getPieceTree();n.insert(8,`fh
i
jk`),n.delete(7,2),s.strictEqual(n.getLinesRawContent(),`a
b
c
dh
i
jk`),s.strictEqual(n.getLineCount(),6),s.deepStrictEqual(n.getPositionAt(6),new a(4,1)),s.deepStrictEqual(n.getPositionAt(7),new a(4,2)),s.deepStrictEqual(n.getPositionAt(8),new a(4,3)),s.deepStrictEqual(n.getPositionAt(9),new a(5,1)),s.deepStrictEqual(n.getPositionAt(11),new a(6,1)),s.deepStrictEqual(n.getPositionAt(12),new a(6,2)),s.deepStrictEqual(n.getPositionAt(13),new a(6,3)),s.strictEqual(n.getOffsetAt(4,1),6),s.strictEqual(n.getOffsetAt(4,2),7),s.strictEqual(n.getOffsetAt(4,3),8),s.strictEqual(n.getOffsetAt(5,1),9),s.strictEqual(n.getOffsetAt(6,1),11),s.strictEqual(n.getOffsetAt(6,2),12),s.strictEqual(n.getOffsetAt(6,3),13),g(n)}),test("insert random bug 1: prefixSumComputer.removeValues(start, cnt) cnt is 1 based.",()=>{let e="";const n=i([""]);r.add(n);const t=n.getPieceTree();t.insert(0,` ZX 
 Z
Z
 YZ
Y
ZXX `),e=e.substring(0,0)+` ZX 
 Z
Z
 YZ
Y
ZXX `+e.substring(0),t.insert(14,`X ZZ
YZZYZXXY Y XY
 `),e=e.substring(0,14)+`X ZZ
YZZYZXXY Y XY
 `+e.substring(14),s.strictEqual(t.getLinesRawContent(),e),p(e,t),g(t)}),test("insert random bug 2: prefixSumComputer initialize does not do deep copy of UInt32Array.",()=>{let e="";const n=i([""]);r.add(n);const t=n.getPieceTree();t.insert(0,`ZYZ
YY XY
X 
Z Y 
Z `),e=e.substring(0,0)+`ZYZ
YY XY
X 
Z Y 
Z `+e.substring(0),t.insert(3,`XXY 

Y Y YYY  ZYXY `),e=e.substring(0,3)+`XXY 

Y Y YYY  ZYXY `+e.substring(3),s.strictEqual(t.getLinesRawContent(),e),p(e,t),g(t)}),test("delete random bug 1: I forgot to update the lineFeedCnt when deletion is on one single piece.",()=>{const e=i([""]);r.add(e);const n=e.getPieceTree();n.insert(0,`ba
a
ca
ba
cbab
caa `),n.insert(13,`cca
aabb
cac
ccc
ab `),n.delete(5,8),n.delete(30,2),n.insert(24,`cbbacccbac
baaab

c `),n.delete(29,3),n.delete(23,9),n.delete(21,5),n.delete(30,3),n.insert(3,`cb
ac
c

acc
bb
b
c `),n.delete(19,5),n.insert(18,`
bb

acbc
cbb
c
bb
 `),n.insert(65,`cbccbac
bc

ccabba
 `),n.insert(77,`a
cacb

ac




abab `),n.delete(30,9),n.insert(45,`b

c
ba

bbbba

aa
 `),n.insert(82,`ab
bb
cabacab
cbc
a `),n.delete(123,9),n.delete(71,2),n.insert(33,`acaa
acb

aa

c



 `);const t=n.getLinesRawContent();p(t,n),g(n)}),test("delete random bug rb tree 1",()=>{let e="";const n=i([e]);r.add(n);const t=n.getPieceTree();t.insert(0,`YXXZ

YY
`),e=e.substring(0,0)+`YXXZ

YY
`+e.substring(0),t.delete(0,5),e=e.substring(0,0)+e.substring(5),t.insert(0,`ZXYY
X
Z
`),e=e.substring(0,0)+`ZXYY
X
Z
`+e.substring(0),t.insert(10,`
XY
YXYXY`),e=e.substring(0,10)+`
XY
YXYXY`+e.substring(10),p(e,t),g(t)}),test("delete random bug rb tree 2",()=>{let e="";const n=i([e]);r.add(n);const t=n.getPieceTree();t.insert(0,`YXXZ

YY
`),e=e.substring(0,0)+`YXXZ

YY
`+e.substring(0),t.insert(0,`ZXYY
X
Z
`),e=e.substring(0,0)+`ZXYY
X
Z
`+e.substring(0),t.insert(10,`
XY
YXYXY`),e=e.substring(0,10)+`
XY
YXYXY`+e.substring(10),t.insert(8,`YZXY
Z
YX`),e=e.substring(0,8)+`YZXY
Z
YX`+e.substring(8),t.insert(12,`XX
XXYXYZ`),e=e.substring(0,12)+`XX
XXYXYZ`+e.substring(12),t.delete(0,4),e=e.substring(0,0)+e.substring(4),p(e,t),g(t)}),test("delete random bug rb tree 3",()=>{let e="";const n=i([e]);r.add(n);const t=n.getPieceTree();t.insert(0,`YXXZ

YY
`),e=e.substring(0,0)+`YXXZ

YY
`+e.substring(0),t.delete(7,2),e=e.substring(0,7)+e.substring(9),t.delete(6,1),e=e.substring(0,6)+e.substring(7),t.delete(0,5),e=e.substring(0,0)+e.substring(5),t.insert(0,`ZXYY
X
Z
`),e=e.substring(0,0)+`ZXYY
X
Z
`+e.substring(0),t.insert(10,`
XY
YXYXY`),e=e.substring(0,10)+`
XY
YXYXY`+e.substring(10),t.insert(8,`YZXY
Z
YX`),e=e.substring(0,8)+`YZXY
Z
YX`+e.substring(8),t.insert(12,`XX
XXYXYZ`),e=e.substring(0,12)+`XX
XXYXYZ`+e.substring(12),t.delete(0,4),e=e.substring(0,0)+e.substring(4),t.delete(30,3),e=e.substring(0,30)+e.substring(33),p(e,t),g(t)})}),suite("offset 2 position",()=>{const r=f();test("random tests bug 1",()=>{let e="";const n=i([""]);r.add(n);const t=n.getPieceTree();t.insert(0,"huuyYzUfKOENwGgZLqn "),e=e.substring(0,0)+"huuyYzUfKOENwGgZLqn "+e.substring(0),t.delete(18,2),e=e.substring(0,18)+e.substring(20),t.delete(3,1),e=e.substring(0,3)+e.substring(4),t.delete(12,4),e=e.substring(0,12)+e.substring(16),t.insert(3,"hMbnVEdTSdhLlPevXKF "),e=e.substring(0,3)+"hMbnVEdTSdhLlPevXKF "+e.substring(3),t.delete(22,8),e=e.substring(0,22)+e.substring(30),t.insert(4,`S umSnYrqOmOAV
EbZJ `),e=e.substring(0,4)+`S umSnYrqOmOAV
EbZJ `+e.substring(4),p(e,t),g(t)})}),suite("get text in range",()=>{const r=f();test("getContentInRange",()=>{const e=i([`a
b
c
de`]);r.add(e);const n=e.getPieceTree();n.insert(8,`fh
i
jk`),n.delete(7,2),s.strictEqual(n.getValueInRange(new o(1,1,1,3)),`a
`),s.strictEqual(n.getValueInRange(new o(2,1,2,3)),`b
`),s.strictEqual(n.getValueInRange(new o(3,1,3,3)),`c
`),s.strictEqual(n.getValueInRange(new o(4,1,4,4)),`dh
`),s.strictEqual(n.getValueInRange(new o(5,1,5,3)),`i
`),s.strictEqual(n.getValueInRange(new o(6,1,6,3)),"jk"),g(n)}),test("random test value in range",()=>{let e="";const n=i([e]);r.add(n);const t=n.getPieceTree();t.insert(0,"ZXXY"),e=e.substring(0,0)+"ZXXY"+e.substring(0),t.insert(1,"XZZY"),e=e.substring(0,1)+"XZZY"+e.substring(1),t.insert(5,`
X

`),e=e.substring(0,5)+`
X

`+e.substring(5),t.insert(3,`
XX
`),e=e.substring(0,3)+`
XX
`+e.substring(3),t.insert(12,"YYYX"),e=e.substring(0,12)+"YYYX"+e.substring(12),l(e,t),g(t)}),test("random test value in range exception",()=>{let e="";const n=i([e]);r.add(n);const t=n.getPieceTree();t.insert(0,`XZ
Z`),e=e.substring(0,0)+`XZ
Z`+e.substring(0),t.delete(0,3),e=e.substring(0,0)+e.substring(3),t.delete(0,1),e=e.substring(0,0)+e.substring(1),t.insert(0,`ZYX
`),e=e.substring(0,0)+`ZYX
`+e.substring(0),t.delete(0,4),e=e.substring(0,0)+e.substring(4),t.getValueInRange(new o(1,1,1,1)),g(t)}),test("random tests bug 1",()=>{let e="";const n=i([""]);r.add(n);const t=n.getPieceTree();t.insert(0,"huuyYzUfKOENwGgZLqn "),e=e.substring(0,0)+"huuyYzUfKOENwGgZLqn "+e.substring(0),t.delete(18,2),e=e.substring(0,18)+e.substring(20),t.delete(3,1),e=e.substring(0,3)+e.substring(4),t.delete(12,4),e=e.substring(0,12)+e.substring(16),t.insert(3,"hMbnVEdTSdhLlPevXKF "),e=e.substring(0,3)+"hMbnVEdTSdhLlPevXKF "+e.substring(3),t.delete(22,8),e=e.substring(0,22)+e.substring(30),t.insert(4,`S umSnYrqOmOAV
EbZJ `),e=e.substring(0,4)+`S umSnYrqOmOAV
EbZJ `+e.substring(4),l(e,t),g(t)}),test("random tests bug 2",()=>{let e="";const n=i([""]);r.add(n);const t=n.getPieceTree();t.insert(0,`xfouRDZwdAHjVXJAMV
 `),e=e.substring(0,0)+`xfouRDZwdAHjVXJAMV
 `+e.substring(0),t.insert(16,"dBGndxpFZBEAIKykYYx "),e=e.substring(0,16)+"dBGndxpFZBEAIKykYYx "+e.substring(16),t.delete(7,6),e=e.substring(0,7)+e.substring(13),t.delete(9,7),e=e.substring(0,9)+e.substring(16),t.delete(17,6),e=e.substring(0,17)+e.substring(23),t.delete(0,4),e=e.substring(0,0)+e.substring(4),t.insert(9,"qvEFXCNvVkWgvykahYt "),e=e.substring(0,9)+"qvEFXCNvVkWgvykahYt "+e.substring(9),t.delete(4,6),e=e.substring(0,4)+e.substring(10),t.insert(11,`OcSChUYT
zPEBOpsGmR `),e=e.substring(0,11)+`OcSChUYT
zPEBOpsGmR `+e.substring(11),t.insert(15,`KJCozaXTvkE
xnqAeTz `),e=e.substring(0,15)+`KJCozaXTvkE
xnqAeTz `+e.substring(15),l(e,t),g(t)}),test("get line content",()=>{const e=i(["1"]);r.add(e);const n=e.getPieceTree();s.strictEqual(n.getLineRawContent(1),"1"),n.insert(1,"2"),s.strictEqual(n.getLineRawContent(1),"12"),g(n)}),test("get line content basic",()=>{const e=i([`1
2
3
4`]);r.add(e);const n=e.getPieceTree();s.strictEqual(n.getLineRawContent(1),`1
`),s.strictEqual(n.getLineRawContent(2),`2
`),s.strictEqual(n.getLineRawContent(3),`3
`),s.strictEqual(n.getLineRawContent(4),"4"),g(n)}),test("get line content after inserts/deletes",()=>{const e=i([`a
b
c
de`]);r.add(e);const n=e.getPieceTree();n.insert(8,`fh
i
jk`),n.delete(7,2),s.strictEqual(n.getLineRawContent(1),`a
`),s.strictEqual(n.getLineRawContent(2),`b
`),s.strictEqual(n.getLineRawContent(3),`c
`),s.strictEqual(n.getLineRawContent(4),`dh
`),s.strictEqual(n.getLineRawContent(5),`i
`),s.strictEqual(n.getLineRawContent(6),"jk"),g(n)}),test("random 1",()=>{let e="";const n=i([""]);r.add(n);const t=n.getPieceTree();t.insert(0,`J eNnDzQpnlWyjmUu
y `),e=e.substring(0,0)+`J eNnDzQpnlWyjmUu
y `+e.substring(0),t.insert(0,"QPEeRAQmRwlJqtZSWhQ "),e=e.substring(0,0)+"QPEeRAQmRwlJqtZSWhQ "+e.substring(0),t.delete(5,1),e=e.substring(0,5)+e.substring(6),l(e,t),g(t)}),test("random 2",()=>{let e="";const n=i([""]);r.add(n);const t=n.getPieceTree();t.insert(0,"DZoQ tglPCRHMltejRI "),e=e.substring(0,0)+"DZoQ tglPCRHMltejRI "+e.substring(0),t.insert(10,"JRXiyYqJ qqdcmbfkKX "),e=e.substring(0,10)+"JRXiyYqJ qqdcmbfkKX "+e.substring(10),t.delete(16,3),e=e.substring(0,16)+e.substring(19),t.delete(25,1),e=e.substring(0,25)+e.substring(26),t.insert(18,`vH
NlvfqQJPm
SFkhMc `),e=e.substring(0,18)+`vH
NlvfqQJPm
SFkhMc `+e.substring(18),l(e,t),g(t)})}),suite("CRLF",()=>{const r=f();test("delete CR in CRLF 1",()=>{const e=i([""],!1);r.add(e);const n=e.getPieceTree();n.insert(0,`a\r
b`),n.delete(0,2),s.strictEqual(n.getLineCount(),2),g(n)}),test("delete CR in CRLF 2",()=>{const e=i([""],!1);r.add(e);const n=e.getPieceTree();n.insert(0,`a\r
b`),n.delete(2,2),s.strictEqual(n.getLineCount(),2),g(n)}),test("random bug 1",()=>{let e="";const n=i([""],!1);r.add(n);const t=n.getPieceTree();t.insert(0,`

\r\r`),e=e.substring(0,0)+`

\r\r`+e.substring(0),t.insert(1,`\r
\r
`),e=e.substring(0,1)+`\r
\r
`+e.substring(1),t.delete(5,3),e=e.substring(0,5)+e.substring(8),t.delete(2,3),e=e.substring(0,2)+e.substring(5);const u=h(e);s.strictEqual(t.getLineCount(),u.length),g(t)}),test("random bug 2",()=>{let e="";const n=i([""],!1);r.add(n);const t=n.getPieceTree();t.insert(0,`
\r
\r`),e=e.substring(0,0)+`
\r
\r`+e.substring(0),t.insert(2,`
\r\r\r`),e=e.substring(0,2)+`
\r\r\r`+e.substring(2),t.delete(4,1),e=e.substring(0,4)+e.substring(5);const u=h(e);s.strictEqual(t.getLineCount(),u.length),g(t)}),test("random bug 3",()=>{let e="";const n=i([""],!1);r.add(n);const t=n.getPieceTree();t.insert(0,`


\r`),e=e.substring(0,0)+`


\r`+e.substring(0),t.delete(2,2),e=e.substring(0,2)+e.substring(4),t.delete(0,2),e=e.substring(0,0)+e.substring(2),t.insert(0,"\r\r\r\r"),e=e.substring(0,0)+"\r\r\r\r"+e.substring(0),t.insert(2,`\r
\r\r`),e=e.substring(0,2)+`\r
\r\r`+e.substring(2),t.insert(3,`\r\r\r
`),e=e.substring(0,3)+`\r\r\r
`+e.substring(3);const u=h(e);s.strictEqual(t.getLineCount(),u.length),g(t)}),test("random bug 4",()=>{let e="";const n=i([""],!1);r.add(n);const t=n.getPieceTree();t.insert(0,`



`),e=e.substring(0,0)+`



`+e.substring(0),t.delete(3,1),e=e.substring(0,3)+e.substring(4),t.insert(1,"\r\r\r\r"),e=e.substring(0,1)+"\r\r\r\r"+e.substring(1),t.insert(6,`\r

\r`),e=e.substring(0,6)+`\r

\r`+e.substring(6),t.delete(5,3),e=e.substring(0,5)+e.substring(8),l(e,t),g(t)}),test("random bug 5",()=>{let e="";const n=i([""],!1);r.add(n);const t=n.getPieceTree();t.insert(0,`



`),e=e.substring(0,0)+`



`+e.substring(0),t.delete(3,1),e=e.substring(0,3)+e.substring(4),t.insert(0,`
\r\r
`),e=e.substring(0,0)+`
\r\r
`+e.substring(0),t.insert(4,`
\r\r
`),e=e.substring(0,4)+`
\r\r
`+e.substring(4),t.delete(4,3),e=e.substring(0,4)+e.substring(7),t.insert(5,`\r\r
\r`),e=e.substring(0,5)+`\r\r
\r`+e.substring(5),t.insert(12,`


\r`),e=e.substring(0,12)+`


\r`+e.substring(12),t.insert(5,`\r\r\r
`),e=e.substring(0,5)+`\r\r\r
`+e.substring(5),t.insert(20,`

\r
`),e=e.substring(0,20)+`

\r
`+e.substring(20),l(e,t),g(t)}),test("random bug 6",()=>{let e="";const n=i([""],!1);r.add(n);const t=n.getPieceTree();t.insert(0,`
\r\r
`),e=e.substring(0,0)+`
\r\r
`+e.substring(0),t.insert(4,`\r

\r`),e=e.substring(0,4)+`\r

\r`+e.substring(4),t.insert(3,`\r


`),e=e.substring(0,3)+`\r


`+e.substring(3),t.delete(4,8),e=e.substring(0,4)+e.substring(12),t.insert(4,`\r

\r`),e=e.substring(0,4)+`\r

\r`+e.substring(4),t.insert(0,`\r

\r`),e=e.substring(0,0)+`\r

\r`+e.substring(0),t.delete(4,0),e=e.substring(0,4)+e.substring(4),t.delete(8,4),e=e.substring(0,8)+e.substring(12),l(e,t),g(t)}),test("random bug 8",()=>{let e="";const n=i([""],!1);r.add(n);const t=n.getPieceTree();t.insert(0,`\r

\r`),e=e.substring(0,0)+`\r

\r`+e.substring(0),t.delete(1,0),e=e.substring(0,1)+e.substring(1),t.insert(3,`


\r`),e=e.substring(0,3)+`


\r`+e.substring(3),t.insert(7,`

\r
`),e=e.substring(0,7)+`

\r
`+e.substring(7),l(e,t),g(t)}),test("random bug 7",()=>{let e="";const n=i([""],!1);r.add(n);const t=n.getPieceTree();t.insert(0,`\r\r

`),e=e.substring(0,0)+`\r\r

`+e.substring(0),t.insert(4,`\r

\r`),e=e.substring(0,4)+`\r

\r`+e.substring(4),t.insert(7,`
\r\r\r`),e=e.substring(0,7)+`
\r\r\r`+e.substring(7),t.insert(11,`

\r
`),e=e.substring(0,11)+`

\r
`+e.substring(11),l(e,t),g(t)}),test("random bug 10",()=>{let e="";const n=i([""],!1);r.add(n);const t=n.getPieceTree();t.insert(0,"qneW"),e=e.substring(0,0)+"qneW"+e.substring(0),t.insert(0,"YhIl"),e=e.substring(0,0)+"YhIl"+e.substring(0),t.insert(0,"qdsm"),e=e.substring(0,0)+"qdsm"+e.substring(0),t.delete(7,0),e=e.substring(0,7)+e.substring(7),t.insert(12,"iiPv"),e=e.substring(0,12)+"iiPv"+e.substring(12),t.insert(9,"V\rSA"),e=e.substring(0,9)+"V\rSA"+e.substring(9),l(e,t),g(t)}),test("random bug 9",()=>{let e="";const n=i([""],!1);r.add(n);const t=n.getPieceTree();t.insert(0,`



`),e=e.substring(0,0)+`



`+e.substring(0),t.insert(3,`
\r
\r`),e=e.substring(0,3)+`
\r
\r`+e.substring(3),t.insert(2,`
\r

`),e=e.substring(0,2)+`
\r

`+e.substring(2),t.insert(0,`

\r\r`),e=e.substring(0,0)+`

\r\r`+e.substring(0),t.insert(3,"\r\r\r\r"),e=e.substring(0,3)+"\r\r\r\r"+e.substring(3),t.insert(3,`

\r\r`),e=e.substring(0,3)+`

\r\r`+e.substring(3),l(e,t),g(t)})}),suite("centralized lineStarts with CRLF",()=>{const r=f();test("delete CR in CRLF 1",()=>{const e=i([`a\r
b`],!1);r.add(e);const n=e.getPieceTree();n.delete(2,2),s.strictEqual(n.getLineCount(),2),g(n)}),test("delete CR in CRLF 2",()=>{const e=i([`a\r
b`]);r.add(e);const n=e.getPieceTree();n.delete(0,2),s.strictEqual(n.getLineCount(),2),g(n)}),test("random bug 1",()=>{let e=`

\r\r`;const n=i([`

\r\r`],!1);r.add(n);const t=n.getPieceTree();t.insert(1,`\r
\r
`),e=e.substring(0,1)+`\r
\r
`+e.substring(1),t.delete(5,3),e=e.substring(0,5)+e.substring(8),t.delete(2,3),e=e.substring(0,2)+e.substring(5);const u=h(e);s.strictEqual(t.getLineCount(),u.length),g(t)}),test("random bug 2",()=>{let e=`
\r
\r`;const n=i([`
\r
\r`],!1);r.add(n);const t=n.getPieceTree();t.insert(2,`
\r\r\r`),e=e.substring(0,2)+`
\r\r\r`+e.substring(2),t.delete(4,1),e=e.substring(0,4)+e.substring(5);const u=h(e);s.strictEqual(t.getLineCount(),u.length),g(t)}),test("random bug 3",()=>{let e=`


\r`;const n=i([`


\r`],!1);r.add(n);const t=n.getPieceTree();t.delete(2,2),e=e.substring(0,2)+e.substring(4),t.delete(0,2),e=e.substring(0,0)+e.substring(2),t.insert(0,"\r\r\r\r"),e=e.substring(0,0)+"\r\r\r\r"+e.substring(0),t.insert(2,`\r
\r\r`),e=e.substring(0,2)+`\r
\r\r`+e.substring(2),t.insert(3,`\r\r\r
`),e=e.substring(0,3)+`\r\r\r
`+e.substring(3);const u=h(e);s.strictEqual(t.getLineCount(),u.length),g(t)}),test("random bug 4",()=>{let e=`



`;const n=i([`



`],!1);r.add(n);const t=n.getPieceTree();t.delete(3,1),e=e.substring(0,3)+e.substring(4),t.insert(1,"\r\r\r\r"),e=e.substring(0,1)+"\r\r\r\r"+e.substring(1),t.insert(6,`\r

\r`),e=e.substring(0,6)+`\r

\r`+e.substring(6),t.delete(5,3),e=e.substring(0,5)+e.substring(8),l(e,t),g(t)}),test("random bug 5",()=>{let e=`



`;const n=i([`



`],!1);r.add(n);const t=n.getPieceTree();t.delete(3,1),e=e.substring(0,3)+e.substring(4),t.insert(0,`
\r\r
`),e=e.substring(0,0)+`
\r\r
`+e.substring(0),t.insert(4,`
\r\r
`),e=e.substring(0,4)+`
\r\r
`+e.substring(4),t.delete(4,3),e=e.substring(0,4)+e.substring(7),t.insert(5,`\r\r
\r`),e=e.substring(0,5)+`\r\r
\r`+e.substring(5),t.insert(12,`


\r`),e=e.substring(0,12)+`


\r`+e.substring(12),t.insert(5,`\r\r\r
`),e=e.substring(0,5)+`\r\r\r
`+e.substring(5),t.insert(20,`

\r
`),e=e.substring(0,20)+`

\r
`+e.substring(20),l(e,t),g(t)}),test("random bug 6",()=>{let e=`
\r\r
`;const n=i([`
\r\r
`],!1);r.add(n);const t=n.getPieceTree();t.insert(4,`\r

\r`),e=e.substring(0,4)+`\r

\r`+e.substring(4),t.insert(3,`\r


`),e=e.substring(0,3)+`\r


`+e.substring(3),t.delete(4,8),e=e.substring(0,4)+e.substring(12),t.insert(4,`\r

\r`),e=e.substring(0,4)+`\r

\r`+e.substring(4),t.insert(0,`\r

\r`),e=e.substring(0,0)+`\r

\r`+e.substring(0),t.delete(4,0),e=e.substring(0,4)+e.substring(4),t.delete(8,4),e=e.substring(0,8)+e.substring(12),l(e,t),g(t)}),test("random bug 7",()=>{let e=`\r

\r`;const n=i([`\r

\r`],!1);r.add(n);const t=n.getPieceTree();t.delete(1,0),e=e.substring(0,1)+e.substring(1),t.insert(3,`


\r`),e=e.substring(0,3)+`


\r`+e.substring(3),t.insert(7,`

\r
`),e=e.substring(0,7)+`

\r
`+e.substring(7),l(e,t),g(t)}),test("random bug 8",()=>{let e=`\r\r

`;const n=i([`\r\r

`],!1);r.add(n);const t=n.getPieceTree();t.insert(4,`\r

\r`),e=e.substring(0,4)+`\r

\r`+e.substring(4),t.insert(7,`
\r\r\r`),e=e.substring(0,7)+`
\r\r\r`+e.substring(7),t.insert(11,`

\r
`),e=e.substring(0,11)+`

\r
`+e.substring(11),l(e,t),g(t)}),test("random bug 9",()=>{let e="qneW";const n=i(["qneW"],!1);r.add(n);const t=n.getPieceTree();t.insert(0,"YhIl"),e=e.substring(0,0)+"YhIl"+e.substring(0),t.insert(0,"qdsm"),e=e.substring(0,0)+"qdsm"+e.substring(0),t.delete(7,0),e=e.substring(0,7)+e.substring(7),t.insert(12,"iiPv"),e=e.substring(0,12)+"iiPv"+e.substring(12),t.insert(9,"V\rSA"),e=e.substring(0,9)+"V\rSA"+e.substring(9),l(e,t),g(t)}),test("random bug 10",()=>{let e=`



`;const n=i([`



`],!1);r.add(n);const t=n.getPieceTree();t.insert(3,`
\r
\r`),e=e.substring(0,3)+`
\r
\r`+e.substring(3),t.insert(2,`
\r

`),e=e.substring(0,2)+`
\r

`+e.substring(2),t.insert(0,`

\r\r`),e=e.substring(0,0)+`

\r\r`+e.substring(0),t.insert(3,"\r\r\r\r"),e=e.substring(0,3)+"\r\r\r\r"+e.substring(3),t.insert(3,`

\r\r`),e=e.substring(0,3)+`

\r\r`+e.substring(3),l(e,t),g(t)}),test("random chunk bug 1",()=>{const e=i([`
\r\r


\r
\r`],!1);r.add(e);const n=e.getPieceTree();let t=`
\r\r


\r
\r`;n.delete(0,2),t=t.substring(0,0)+t.substring(2),n.insert(1,`\r\r

`),t=t.substring(0,1)+`\r\r

`+t.substring(1),n.insert(7,"\r\r\r\r"),t=t.substring(0,7)+"\r\r\r\r"+t.substring(7),s.strictEqual(n.getLinesRawContent(),t),p(t,n),g(n)}),test("random chunk bug 2",()=>{const e=i([`
\r


\r
\r
\r\r


\r\r
\r
`],!1);r.add(e);const n=e.getPieceTree();let t=`
\r


\r
\r
\r\r


\r\r
\r
`;n.insert(16,`\r
\r\r`),t=t.substring(0,16)+`\r
\r\r`+t.substring(16),n.insert(13,`

\r\r`),t=t.substring(0,13)+`

\r\r`+t.substring(13),n.insert(19,`

\r
`),t=t.substring(0,19)+`

\r
`+t.substring(19),n.delete(5,0),t=t.substring(0,5)+t.substring(5),n.delete(11,2),t=t.substring(0,11)+t.substring(13),s.strictEqual(n.getLinesRawContent(),t),p(t,n),g(n)}),test("random chunk bug 3",()=>{const e=i([`\r





\r
`],!1);r.add(e);const n=e.getPieceTree();let t=`\r





\r
`;n.insert(4,`

\r
\r\r

\r`),t=t.substring(0,4)+`

\r
\r\r

\r`+t.substring(4),n.delete(4,4),t=t.substring(0,4)+t.substring(8),n.insert(11,`\r
\r

\r\r

`),t=t.substring(0,11)+`\r
\r

\r\r

`+t.substring(11),n.delete(1,2),t=t.substring(0,1)+t.substring(3),s.strictEqual(n.getLinesRawContent(),t),p(t,n),g(n)}),test("random chunk bug 4",()=>{const e=i([`
\r
\r`],!1);r.add(e);const n=e.getPieceTree();let t=`
\r
\r`;n.insert(4,`

\r
`),t=t.substring(0,4)+`

\r
`+t.substring(4),n.insert(3,`\r


`),t=t.substring(0,3)+`\r


`+t.substring(3),s.strictEqual(n.getLinesRawContent(),t),p(t,n),g(n)})}),suite("random is unsupervised",()=>{const r=f();test("splitting large change buffer",function(){const e=i([""],!1);r.add(e);const n=e.getPieceTree();let t="";n.insert(0,`WUZ
XVZY
`),t=t.substring(0,0)+`WUZ
XVZY
`+t.substring(0),n.insert(8,`\r\r
ZXUWVW`),t=t.substring(0,8)+`\r\r
ZXUWVW`+t.substring(8),n.delete(10,7),t=t.substring(0,10)+t.substring(17),n.delete(10,1),t=t.substring(0,10)+t.substring(11),n.insert(4,`VX\r\r
WZVZ`),t=t.substring(0,4)+`VX\r\r
WZVZ`+t.substring(4),n.delete(11,3),t=t.substring(0,11)+t.substring(14),n.delete(12,4),t=t.substring(0,12)+t.substring(16),n.delete(8,0),t=t.substring(0,8)+t.substring(8),n.delete(10,2),t=t.substring(0,10)+t.substring(12),n.insert(0,"VZXXZYZX\r"),t=t.substring(0,0)+"VZXXZYZX\r"+t.substring(0),s.strictEqual(n.getLinesRawContent(),t),p(t,n),l(t,n),g(n)}),test("random insert delete",function(){this.timeout(5e5);let e="";const n=i([e],!1);r.add(n);const t=n.getPieceTree();for(let u=0;u<1e3;u++)if(Math.random()<.6){const d=m(100),b=E(e.length+1);t.insert(b,d),e=e.substring(0,b)+d+e.substring(b)}else{const d=E(e.length),b=Math.min(e.length-d,Math.floor(Math.random()*10));t.delete(d,b),e=e.substring(0,d)+e.substring(d+b)}s.strictEqual(t.getLinesRawContent(),e),p(e,t),l(e,t),g(t)}),test("random chunks",function(){this.timeout(5e5);const e=[];for(let d=0;d<5;d++)e.push(m(1e3));const n=i(e,!1);r.add(n);const t=n.getPieceTree();let u=e.join("");for(let d=0;d<1e3;d++)if(Math.random()<.6){const b=m(100),c=E(u.length+1);t.insert(c,b),u=u.substring(0,c)+b+u.substring(c)}else{const b=E(u.length),c=Math.min(u.length-b,Math.floor(Math.random()*10));t.delete(b,c),u=u.substring(0,b)+u.substring(b+c)}s.strictEqual(t.getLinesRawContent(),u),p(u,t),l(u,t),g(t)}),test("random chunks 2",function(){this.timeout(5e5);const e=[];e.push(m(1e3));const n=i(e,!1);r.add(n);const t=n.getPieceTree();let u=e.join("");for(let d=0;d<50;d++){if(Math.random()<.6){const b=m(30),c=E(u.length+1);t.insert(c,b),u=u.substring(0,c)+b+u.substring(c)}else{const b=E(u.length),c=Math.min(u.length-b,Math.floor(Math.random()*10));t.delete(b,c),u=u.substring(0,b)+u.substring(b+c)}l(u,t)}s.strictEqual(t.getLinesRawContent(),u),p(u,t),l(u,t),g(t)})}),suite("buffer api",()=>{const r=f();test("equal",()=>{const e=i(["abc"]),n=i(["ab","c"]),t=i(["abd"]),u=i(["abcd"]);r.add(e),r.add(n),r.add(t),r.add(u),s(e.getPieceTree().equal(n.getPieceTree())),s(!e.getPieceTree().equal(t.getPieceTree())),s(!e.getPieceTree().equal(u.getPieceTree()))}),test("equal with more chunks",()=>{const e=i(["ab","cd","e"]),n=i(["ab","c","de"]);r.add(e),r.add(n),s(e.getPieceTree().equal(n.getPieceTree()))}),test("equal 2, empty buffer",()=>{const e=i([""]),n=i([""]);r.add(e),r.add(n),s(e.getPieceTree().equal(n.getPieceTree()))}),test("equal 3, empty buffer",()=>{const e=i(["a"]),n=i([""]);r.add(e),r.add(n),s(!e.getPieceTree().equal(n.getPieceTree()))}),test("getLineCharCode - issue #45735",()=>{const e=i([`LINE1
line2`]);r.add(e);const n=e.getPieceTree();s.strictEqual(n.getLineCharCode(1,0),76,"L"),s.strictEqual(n.getLineCharCode(1,1),73,"I"),s.strictEqual(n.getLineCharCode(1,2),78,"N"),s.strictEqual(n.getLineCharCode(1,3),69,"E"),s.strictEqual(n.getLineCharCode(1,4),49,"1"),s.strictEqual(n.getLineCharCode(1,5),10,"\\n"),s.strictEqual(n.getLineCharCode(2,0),108,"l"),s.strictEqual(n.getLineCharCode(2,1),105,"i"),s.strictEqual(n.getLineCharCode(2,2),110,"n"),s.strictEqual(n.getLineCharCode(2,3),101,"e"),s.strictEqual(n.getLineCharCode(2,4),50,"2")}),test("getLineCharCode - issue #47733",()=>{const e=i(["",`LINE1
`,"line2"]);r.add(e);const n=e.getPieceTree();s.strictEqual(n.getLineCharCode(1,0),76,"L"),s.strictEqual(n.getLineCharCode(1,1),73,"I"),s.strictEqual(n.getLineCharCode(1,2),78,"N"),s.strictEqual(n.getLineCharCode(1,3),69,"E"),s.strictEqual(n.getLineCharCode(1,4),49,"1"),s.strictEqual(n.getLineCharCode(1,5),10,"\\n"),s.strictEqual(n.getLineCharCode(2,0),108,"l"),s.strictEqual(n.getLineCharCode(2,1),105,"i"),s.strictEqual(n.getLineCharCode(2,2),110,"n"),s.strictEqual(n.getLineCharCode(2,3),101,"e"),s.strictEqual(n.getLineCharCode(2,4),50,"2")}),test("getNearestChunk",()=>{const e=i(["012345678"]);r.add(e);const n=e.getPieceTree();n.insert(3,"ABC"),s.equal(n.getLineContent(1),"012ABC345678"),s.equal(n.getNearestChunk(3),"ABC"),s.equal(n.getNearestChunk(6),"345678"),n.delete(9,1),s.equal(n.getLineContent(1),"012ABC34578"),s.equal(n.getNearestChunk(6),"345"),s.equal(n.getNearestChunk(9),"78")})}),suite("search offset cache",()=>{const r=f();test("render white space exception",()=>{const e=i([`class Name{
	
			get() {

			}
		}`]);r.add(e);const n=e.getPieceTree();let t=`class Name{
	
			get() {

			}
		}`;n.insert(12,"s"),t=t.substring(0,12)+"s"+t.substring(12),n.insert(13,"e"),t=t.substring(0,13)+"e"+t.substring(13),n.insert(14,"t"),t=t.substring(0,14)+"t"+t.substring(14),n.insert(15,"()"),t=t.substring(0,15)+"()"+t.substring(15),n.delete(16,1),t=t.substring(0,16)+t.substring(17),n.insert(17,"()"),t=t.substring(0,17)+"()"+t.substring(17),n.delete(18,1),t=t.substring(0,18)+t.substring(19),n.insert(18,"}"),t=t.substring(0,18)+"}"+t.substring(18),n.insert(12,`
`),t=t.substring(0,12)+`
`+t.substring(12),n.delete(12,1),t=t.substring(0,12)+t.substring(13),n.delete(18,1),t=t.substring(0,18)+t.substring(19),n.insert(18,"}"),t=t.substring(0,18)+"}"+t.substring(18),n.delete(17,2),t=t.substring(0,17)+t.substring(19),n.delete(16,1),t=t.substring(0,16)+t.substring(17),n.insert(16,")"),t=t.substring(0,16)+")"+t.substring(16),n.delete(15,2),t=t.substring(0,15)+t.substring(17);const u=n.getLinesRawContent();s(u===t)}),test("Line breaks replacement is not necessary when EOL is normalized",()=>{const e=i(["abc"]);r.add(e);const n=e.getPieceTree();let t="abc";n.insert(3,`def
abc`),t=t+`def
abc`,p(t,n),l(t,n),g(n)}),test("Line breaks replacement is not necessary when EOL is normalized 2",()=>{const e=i([`abc
`]);r.add(e);const n=e.getPieceTree();let t=`abc
`;n.insert(4,`def
abc`),t=t+`def
abc`,p(t,n),l(t,n),g(n)}),test("Line breaks replacement is not necessary when EOL is normalized 3",()=>{const e=i([`abc
`]);r.add(e);const n=e.getPieceTree();let t=`abc
`;n.insert(2,`def
abc`),t=t.substring(0,2)+`def
abc`+t.substring(2),p(t,n),l(t,n),g(n)}),test("Line breaks replacement is not necessary when EOL is normalized 4",()=>{const e=i([`abc
`]);r.add(e);const n=e.getPieceTree();let t=`abc
`;n.insert(3,`def
abc`),t=t.substring(0,3)+`def
abc`+t.substring(3),p(t,n),l(t,n),g(n)})});function w(r){let e="",n=r.read();for(;n!==null;)e+=n,n=r.read();return e}suite("snapshot",()=>{f(),test("bug #45564, piece tree pieces should be immutable",()=>{const r=Y(`
`);r.applyEdits([{range:new o(2,1,2,1),text:"!"}]);const e=r.createSnapshot(),n=r.createSnapshot();s.strictEqual(r.getLinesContent().join(`
`),w(e)),r.applyEdits([{range:new o(2,1,2,2),text:""}]),r.applyEdits([{range:new o(2,1,2,1),text:"!"}]),s.strictEqual(r.getLinesContent().join(`
`),w(n)),r.dispose()}),test("immutable snapshot 1",()=>{const r=Y(`abc
def`),e=r.createSnapshot();r.applyEdits([{range:new o(2,1,2,4),text:""}]),r.applyEdits([{range:new o(1,1,2,1),text:`abc
def`}]),s.strictEqual(r.getLinesContent().join(`
`),w(e)),r.dispose()}),test("immutable snapshot 2",()=>{const r=Y(`abc
def`),e=r.createSnapshot();r.applyEdits([{range:new o(2,1,2,1),text:"!"}]),r.applyEdits([{range:new o(2,1,2,2),text:""}]),s.strictEqual(r.getLinesContent().join(`
`),w(e)),r.dispose()}),test("immutable snapshot 3",()=>{const r=Y(`abc
def`);r.applyEdits([{range:new o(2,4,2,4),text:"!"}]);const e=r.createSnapshot();r.applyEdits([{range:new o(2,5,2,5),text:"!"}]),s.notStrictEqual(r.getLinesContent().join(`
`),w(e)),r.dispose()})}),suite("chunk based search",()=>{const r=f();test("#45892. For some cases, the buffer is empty but we still try to search",()=>{const e=i([""]);r.add(e),e.getPieceTree().delete(0,1);const t=e.findMatchesLineByLine(new o(1,1,1,1),new P(/abc/,new A(",./",[]),"abc"),!0,1e3);s.strictEqual(t.length,0)}),test("#45770. FindInNode should not cross node boundary.",()=>{const e=i([["balabalababalabalababalabalaba","balabalababalabalababalabalaba","","* [ ] task1","* [x] task2 balabalaba","* [ ] task 3"].join(`
`)]);r.add(e);const n=e.getPieceTree();n.delete(0,62),n.delete(16,1),n.insert(16," ");const t=n.findMatchesLineByLine(new o(1,1,4,13),new P(/\[/gi,new A(",./",[]),"["),!0,1e3);s.strictEqual(t.length,3),s.deepStrictEqual(t[0].range,new o(2,3,2,4)),s.deepStrictEqual(t[1].range,new o(3,3,3,4)),s.deepStrictEqual(t[2].range,new o(4,3,4,4))}),test("search searching from the middle",()=>{const e=i([["def","dbcabc"].join(`
`)]);r.add(e);const n=e.getPieceTree();n.delete(4,1);let t=n.findMatchesLineByLine(new o(2,3,2,6),new P(/a/gi,null,"a"),!0,1e3);s.strictEqual(t.length,1),s.deepStrictEqual(t[0].range,new o(2,3,2,4)),n.delete(4,1),t=n.findMatchesLineByLine(new o(2,2,2,5),new P(/a/gi,null,"a"),!0,1e3),s.strictEqual(t.length,1),s.deepStrictEqual(t[0].range,new o(2,2,2,3))})});
