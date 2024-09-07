import t from"assert";import{Lazy as s}from"../../common/lazy.js";import{ensureNoDisposablesAreLeakedInTestSuite as l}from"./utils.js";suite("Lazy",()=>{test("lazy values should only be resolved once",()=>{let a=0;const e=new s(()=>++a);t.strictEqual(e.hasValue,!1),t.strictEqual(e.value,1),t.strictEqual(e.hasValue,!0),t.strictEqual(e.value,1)}),test("lazy values handle error case",()=>{let a=0;const e=new s(()=>{throw new Error(`${++a}`)});t.strictEqual(e.hasValue,!1),t.throws(()=>e.value,/\b1\b/),t.strictEqual(e.hasValue,!0),t.throws(()=>e.value,/\b1\b/)}),l()});