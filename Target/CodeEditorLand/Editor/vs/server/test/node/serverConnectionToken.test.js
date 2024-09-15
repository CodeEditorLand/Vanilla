var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../base/test/common/utils.js";
import { getRandomTestPath } from "../../../base/test/node/testUtils.js";
import { parseServerConnectionToken, ServerConnectionToken, ServerConnectionTokenParseError, ServerConnectionTokenType } from "../../node/serverConnectionToken.js";
import { ServerParsedArgs } from "../../node/serverEnvironmentService.js";
suite("parseServerConnectionToken", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  function isError(r) {
    return r instanceof ServerConnectionTokenParseError;
  }
  __name(isError, "isError");
  function assertIsError(r) {
    assert.strictEqual(isError(r), true);
  }
  __name(assertIsError, "assertIsError");
  test("no arguments generates a token that is mandatory", async () => {
    const result = await parseServerConnectionToken({}, async () => "defaultTokenValue");
    assert.ok(!(result instanceof ServerConnectionTokenParseError));
    assert.ok(result.type === ServerConnectionTokenType.Mandatory);
  });
  test("--without-connection-token", async () => {
    const result = await parseServerConnectionToken({ "without-connection-token": true }, async () => "defaultTokenValue");
    assert.ok(!(result instanceof ServerConnectionTokenParseError));
    assert.ok(result.type === ServerConnectionTokenType.None);
  });
  test("--without-connection-token --connection-token results in error", async () => {
    assertIsError(await parseServerConnectionToken({ "without-connection-token": true, "connection-token": "0" }, async () => "defaultTokenValue"));
  });
  test("--without-connection-token --connection-token-file results in error", async () => {
    assertIsError(await parseServerConnectionToken({ "without-connection-token": true, "connection-token-file": "0" }, async () => "defaultTokenValue"));
  });
  test("--connection-token-file --connection-token results in error", async () => {
    assertIsError(await parseServerConnectionToken({ "connection-token-file": "0", "connection-token": "0" }, async () => "defaultTokenValue"));
  });
  test("--connection-token-file", async function() {
    this.timeout(1e4);
    const testDir = getRandomTestPath(os.tmpdir(), "vsctests", "server-connection-token");
    fs.mkdirSync(testDir, { recursive: true });
    const filename = path.join(testDir, "connection-token-file");
    const connectionToken = `12345-123-abc`;
    fs.writeFileSync(filename, connectionToken);
    const result = await parseServerConnectionToken({ "connection-token-file": filename }, async () => "defaultTokenValue");
    assert.ok(!(result instanceof ServerConnectionTokenParseError));
    assert.ok(result.type === ServerConnectionTokenType.Mandatory);
    assert.strictEqual(result.value, connectionToken);
    fs.rmSync(testDir, { recursive: true, force: true });
  });
  test("--connection-token", async () => {
    const connectionToken = `12345-123-abc`;
    const result = await parseServerConnectionToken({ "connection-token": connectionToken }, async () => "defaultTokenValue");
    assert.ok(!(result instanceof ServerConnectionTokenParseError));
    assert.ok(result.type === ServerConnectionTokenType.Mandatory);
    assert.strictEqual(result.value, connectionToken);
  });
});
//# sourceMappingURL=serverConnectionToken.test.js.map
