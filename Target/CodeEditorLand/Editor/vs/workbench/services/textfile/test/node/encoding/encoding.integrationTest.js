import assert from "assert";
import * as terminalEncoding from "../../../../../../base/node/terminalEncoding.js";
import * as encoding from "../../../common/encoding.js";
suite("Encoding", function() {
  this.timeout(1e4);
  test("resolve terminal encoding (detect)", async () => {
    const enc = await terminalEncoding.resolveTerminalEncoding();
    assert.ok(enc.length > 0);
  });
  test("resolve terminal encoding (environment)", async () => {
    process.env["VSCODE_CLI_ENCODING"] = "utf16le";
    const enc = await terminalEncoding.resolveTerminalEncoding();
    assert.ok(await encoding.encodingExists(enc));
    assert.strictEqual(enc, "utf16le");
  });
});
