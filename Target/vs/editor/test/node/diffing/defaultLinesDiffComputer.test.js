import n from"assert";import{Range as t}from"../../../common/core/range.js";import{RangeMapping as s}from"../../../common/diff/rangeMapping.js";import{OffsetRange as i}from"../../../common/core/offsetRange.js";import{getLineRangeMapping as a}from"../../../common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer.js";import{LinesSliceCharSequence as l}from"../../../common/diff/defaultLinesDiffComputer/linesSliceCharSequence.js";import{MyersDiffAlgorithm as m}from"../../../common/diff/defaultLinesDiffComputer/algorithms/myersDiffAlgorithm.js";import"../../../common/diff/defaultLinesDiffComputer/algorithms/dynamicProgrammingDiffing.js";import{ensureNoDisposablesAreLeakedInTestSuite as o}from"../../../../base/test/common/utils.js";suite("myers",()=>{o(),test("1",()=>{const e=new l(["hello world"],new t(1,1,1,Number.MAX_SAFE_INTEGER),!0),r=new l(["hallo welt"],new t(1,1,1,Number.MAX_SAFE_INTEGER),!0);new m().compute(e,r)})}),suite("lineRangeMapping",()=>{o(),test("Simple",()=>{n.deepStrictEqual(a(new s(new t(2,1,3,1),new t(2,1,2,1)),['const abc = "helloworld".split("");',"",""],['const asciiLower = "helloworld".split("");',""]).toString(),"{[2,3)->[2,2)}")}),test("Empty Lines",()=>{n.deepStrictEqual(a(new s(new t(2,1,2,1),new t(2,1,4,1)),["",""],["","","",""]).toString(),"{[2,2)->[2,4)}")})}),suite("LinesSliceCharSequence",()=>{o();const e=new l(["line1: foo","line2: fizzbuzz","line3: barr","line4: hello world","line5: bazz"],new t(2,1,5,1),!0);test("translateOffset",()=>{n.deepStrictEqual({result:i.ofLength(e.length).map(r=>e.translateOffset(r).toString())},{result:["(2,1)","(2,2)","(2,3)","(2,4)","(2,5)","(2,6)","(2,7)","(2,8)","(2,9)","(2,10)","(2,11)","(2,12)","(2,13)","(2,14)","(2,15)","(2,16)","(3,1)","(3,2)","(3,3)","(3,4)","(3,5)","(3,6)","(3,7)","(3,8)","(3,9)","(3,10)","(3,11)","(3,12)","(4,1)","(4,2)","(4,3)","(4,4)","(4,5)","(4,6)","(4,7)","(4,8)","(4,9)","(4,10)","(4,11)","(4,12)","(4,13)","(4,14)","(4,15)","(4,16)","(4,17)","(4,18)","(4,19)"]})}),test("extendToFullLines",()=>{n.deepStrictEqual({result:e.getText(e.extendToFullLines(new i(20,25)))},{result:`line3: barr
`}),n.deepStrictEqual({result:e.getText(e.extendToFullLines(new i(20,45)))},{result:`line3: barr
line4: hello world
`})})});
