import a from"assert";import{writeUInt16LE as t}from"../../../../base/common/buffer.js";import{CharCode as c}from"../../../../base/common/charCode.js";import{ensureNoDisposablesAreLeakedInTestSuite as i}from"../../../../base/test/common/utils.js";import{decodeUTF16LE as o,StringBuilder as d}from"../../../common/core/stringBuilder.js";suite("decodeUTF16LE",()=>{i(),test("issue #118041: unicode character undo bug 1",()=>{const e=new Uint8Array(2);t(e,65279,0);const r=o(e,0,1);a.deepStrictEqual(r,"\uFEFF")}),test("issue #118041: unicode character undo bug 2",()=>{const e=new Uint8Array(4);t(e,97,0),t(e,65279,2);const r=o(e,0,2);a.deepStrictEqual(r,"a\uFEFF")}),test("issue #118041: unicode character undo bug 3",()=>{const e=new Uint8Array(6);t(e,97,0),t(e,65279,2),t(e,98,4);const r=o(e,0,3);a.deepStrictEqual(r,"a\uFEFFb")})}),suite("StringBuilder",()=>{i(),test("basic",()=>{const e=new d(100);e.appendASCIICharCode(c.A),e.appendASCIICharCode(c.Space),e.appendString("\u{1F60A}"),a.strictEqual(e.build(),"A \u{1F60A}")})});
