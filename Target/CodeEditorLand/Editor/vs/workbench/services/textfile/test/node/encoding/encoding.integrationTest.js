import e from"assert";import*as t from"../../../../../../base/node/terminalEncoding.js";import*as i from"../../../common/encoding.js";suite("Encoding",function(){this.timeout(1e4),test("resolve terminal encoding (detect)",async function(){const n=await t.resolveTerminalEncoding();e.ok(n.length>0)}),test("resolve terminal encoding (environment)",async function(){process.env.VSCODE_CLI_ENCODING="utf16le";const n=await t.resolveTerminalEncoding();e.ok(await i.encodingExists(n)),e.strictEqual(n,"utf16le")})});