import{ensureNoDisposablesAreLeakedInTestSuite as c}from"../../../../../base/test/common/utils.js";import{Selection as n}from"../../../../common/core/selection.js";import{SortLinesCommand as r}from"../../browser/sortLinesCommand.js";import{testCommand as l}from"../../../../test/browser/testCommand.js";function i(e,t,s,o){l(e,null,t,(h,f)=>new r(f,!1),s,o)}function d(e,t,s,o){l(e,null,t,(h,f)=>new r(f,!0),s,o)}suite("Editor Contrib - Sort Lines Command",()=>{c(),test("no op unless at least two lines selected 1",function(){i(["first","second line","third line","fourth line","fifth"],new n(1,3,1,1),["first","second line","third line","fourth line","fifth"],new n(1,3,1,1))}),test("no op unless at least two lines selected 2",function(){i(["first","second line","third line","fourth line","fifth"],new n(1,3,2,1),["first","second line","third line","fourth line","fifth"],new n(1,3,2,1))}),test("sorting two lines ascending",function(){i(["first","second line","third line","fourth line","fifth"],new n(3,3,4,2),["first","second line","fourth line","third line","fifth"],new n(3,3,4,1))}),test("sorting first 4 lines ascending",function(){i(["first","second line","third line","fourth line","fifth"],new n(1,1,5,1),["first","fourth line","second line","third line","fifth"],new n(1,1,5,1))}),test("sorting all lines ascending",function(){i(["first","second line","third line","fourth line","fifth"],new n(1,1,5,6),["fifth","first","fourth line","second line","third line"],new n(1,1,5,11))}),test("sorting first 4 lines descending",function(){d(["first","second line","third line","fourth line","fifth"],new n(1,1,5,1),["third line","second line","fourth line","first","fifth"],new n(1,1,5,1))}),test("sorting all lines descending",function(){d(["first","second line","third line","fourth line","fifth"],new n(1,1,5,6),["third line","second line","fourth line","first","fifth"],new n(1,1,5,6))})});
