import s from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as r}from"../../../../base/test/common/utils.js";import{OffsetRange as i}from"../../../common/core/offsetRange.js";import{PositionOffsetTransformer as n}from"../../../common/core/positionToOffset.js";suite("PositionOffsetTransformer",()=>{r();const e=`123456
abcdef
ghijkl
mnopqr`,o=new n(e);test("getPosition",()=>{s.deepStrictEqual(new i(0,e.length+2).map(t=>o.getPosition(t).toString()),["(1,1)","(1,2)","(1,3)","(1,4)","(1,5)","(1,6)","(1,7)","(2,1)","(2,2)","(2,3)","(2,4)","(2,5)","(2,6)","(2,7)","(3,1)","(3,2)","(3,3)","(3,4)","(3,5)","(3,6)","(3,7)","(4,1)","(4,2)","(4,3)","(4,4)","(4,5)","(4,6)","(4,7)","(4,8)"])}),test("getOffset",()=>{for(let t=0;t<e.length+2;t++)s.strictEqual(o.getOffset(o.getPosition(t)),t)})});
