import{deepStrictEqual as s}from"assert";import{importAMDNodeModule as d}from"../../../../../../amdX.js";import{ensureNoDisposablesAreLeakedInTestSuite as l}from"../../../../../../base/test/common/utils.js";import{PartialCommandDetectionCapability as p}from"../../../../../../platform/terminal/common/capabilities/partialCommandDetectionCapability.js";import{writeP as a}from"../../../browser/terminalTestHelpers.js";suite("PartialCommandDetectionCapability",()=>{const r=l();let t,n,m;function e(o){s(n.commands.map(i=>i.line),o),s(m.map(i=>i.line),o)}setup(async()=>{const o=(await d("@xterm/xterm","lib/xterm.js")).Terminal;t=r.add(new o({allowProposedApi:!0,cols:80})),n=r.add(new p(t)),m=[],r.add(n.onCommandFinished(i=>m.push(i)))}),test("should not add commands when the cursor position is too close to the left side",async()=>{e([]),t.input("\r"),await a(t,`\r
`),e([]),await a(t,"a"),t.input("\r"),await a(t,`\r
`),e([])}),test("should add commands when the cursor position is not too close to the left side",async()=>{e([]),await a(t,"ab"),t.input("\r"),await a(t,`\r
\r
`),e([0]),await a(t,"cd"),t.input("\r"),await a(t,`\r
`),e([0,2])})});
