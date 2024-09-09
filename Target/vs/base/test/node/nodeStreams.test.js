import{Writable as s}from"stream";import l from"assert";import{StreamSplitter as a}from"../../node/nodeStreams.js";import{ensureNoDisposablesAreLeakedInTestSuite as w}from"../common/utils.js";suite("StreamSplitter",()=>{w(),test("should split a stream on a single character splitter",r=>{const e=[],t=new a(`
`),o=new s({write(i,p,n){e.push(i.toString()),n()}});t.pipe(o),t.write(`hello
wor`),t.write(`ld
`),t.write(`foo
bar
z`),t.end(()=>{l.deepStrictEqual(e,[`hello
`,`world
`,`foo
`,`bar
`,"z"]),r()})}),test("should split a stream on a multi-character splitter",r=>{const e=[],t=new a("---"),o=new s({write(i,p,n){e.push(i.toString()),n()}});t.pipe(o),t.write("hello---wor"),t.write("ld---"),t.write("foo---bar---z"),t.end(()=>{l.deepStrictEqual(e,["hello---","world---","foo---","bar---","z"]),r()})})});
