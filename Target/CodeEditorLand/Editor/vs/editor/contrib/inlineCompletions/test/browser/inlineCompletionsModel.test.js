import c from"assert";import{Position as t}from"../../../../common/core/position.js";import{getSecondaryEdits as d}from"../../browser/model/inlineCompletionsModel.js";import{SingleTextEdit as e}from"../../../../common/core/textEdit.js";import{createTextModel as a}from"../../../../test/common/testTextModel.js";import{Range as i}from"../../../../common/core/range.js";import{ensureNoDisposablesAreLeakedInTestSuite as u}from"../../../../../base/test/common/utils.js";suite("inlineCompletionModel",()=>{u(),test("getSecondaryEdits - basic",async function(){const n=a(["function fib(","function fib("].join(`
`)),o=[new t(1,14),new t(2,14)],s=new e(new i(1,1,1,14),"function fib() {"),r=d(n,o,s);c.deepStrictEqual(r,[new e(new i(2,14,2,14),") {")]),n.dispose()}),test("getSecondaryEdits - cursor not on same line as primary edit 1",async function(){const n=a(["function fib(","","function fib(",""].join(`
`)),o=[new t(2,1),new t(4,1)],s=new e(new i(1,1,2,1),["function fib() {","	return 0;","}"].join(`
`)),r=d(n,o,s);c.deepStrictEqual(r,[new e(new i(4,1,4,1),["	return 0;","}"].join(`
`))]),n.dispose()}),test("getSecondaryEdits - cursor not on same line as primary edit 2",async function(){const n=a(["class A {","","class B {","","function f() {}"].join(`
`)),o=[new t(2,1),new t(4,1)],s=new e(new i(1,1,2,1),["class A {","	public x: number = 0;","   public y: number = 0;","}"].join(`
`)),r=d(n,o,s);c.deepStrictEqual(r,[new e(new i(4,1,4,1),["	public x: number = 0;","   public y: number = 0;","}"].join(`
`))]),n.dispose()})});
