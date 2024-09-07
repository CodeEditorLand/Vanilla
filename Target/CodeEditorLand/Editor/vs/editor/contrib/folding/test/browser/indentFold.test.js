import f from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as N}from"../../../../../base/test/common/utils.js";import{computeRanges as S}from"../../browser/indentRangeProvider.js";import{createTextModel as k}from"../../../../test/common/testTextModel.js";suite("Indentation Folding",()=>{N();function n(l,e){return{start:l,end:e}}test("Limit by indent",()=>{const l=["A","  A","  A","    A","      A","    A","      A","      A","         A","      A","         A","  A","              A","                 A","A","  A"],e=n(1,14),o=n(3,11),i=n(4,5),u=n(6,11),a=n(8,9),A=n(10,11),s=n(12,14),p=n(13,14),r=n(15,16),g=k(l.join(`
`));function t(c,L,b){let I=!1;const m=S(g,!0,void 0,{limit:c,update:(d,h)=>I=h});f.ok(m.length<=c,"max "+b);const R=[];for(let d=0;d<m.length;d++)R.push({start:m.getStartLineNumber(d),end:m.getEndLineNumber(d)});f.deepStrictEqual(R,L,b),f.equal(I,9<=c?!1:c,"limited")}t(1e3,[e,o,i,u,a,A,s,p,r],"1000"),t(9,[e,o,i,u,a,A,s,p,r],"9"),t(8,[e,o,i,u,a,A,s,r],"8"),t(7,[e,o,i,u,a,s,r],"7"),t(6,[e,o,i,u,s,r],"6"),t(5,[e,o,i,s,r],"5"),t(4,[e,o,s,r],"4"),t(3,[e,o,r],"3"),t(2,[e,r],"2"),t(1,[e],"1"),t(0,[],"0"),g.dispose()})});