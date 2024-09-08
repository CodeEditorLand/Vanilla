import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import product from "../../../product/common/product.js";
import { parseExtensionHostDebugPort } from "../../common/environmentService.js";
import { OPTIONS, parseArgs } from "../../node/argv.js";
import { NativeEnvironmentService } from "../../node/environmentService.js";
suite("EnvironmentService", () => {
  test("parseExtensionHostPort when built", () => {
    const parse = (a) => parseExtensionHostDebugPort(parseArgs(a, OPTIONS), true);
    assert.deepStrictEqual(parse([]), {
      port: null,
      break: false,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(parse(["--debugPluginHost"]), {
      port: null,
      break: false,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(parse(["--debugPluginHost=1234"]), {
      port: 1234,
      break: false,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(parse(["--debugBrkPluginHost"]), {
      port: null,
      break: false,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(parse(["--debugBrkPluginHost=5678"]), {
      port: 5678,
      break: true,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(
      parse([
        "--debugPluginHost=1234",
        "--debugBrkPluginHost=5678",
        "--debugId=7"
      ]),
      { port: 5678, break: true, env: void 0, debugId: "7" }
    );
    assert.deepStrictEqual(parse(["--inspect-extensions"]), {
      port: null,
      break: false,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(parse(["--inspect-extensions=1234"]), {
      port: 1234,
      break: false,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(parse(["--inspect-brk-extensions"]), {
      port: null,
      break: false,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(parse(["--inspect-brk-extensions=5678"]), {
      port: 5678,
      break: true,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(
      parse([
        "--inspect-extensions=1234",
        "--inspect-brk-extensions=5678",
        "--debugId=7"
      ]),
      { port: 5678, break: true, env: void 0, debugId: "7" }
    );
    assert.deepStrictEqual(
      parse([
        "--inspect-extensions=1234",
        "--inspect-brk-extensions=5678",
        '--extensionEnvironment={"COOL":"1"}'
      ]),
      { port: 5678, break: true, env: { COOL: "1" }, debugId: void 0 }
    );
  });
  test("parseExtensionHostPort when unbuilt", () => {
    const parse = (a) => parseExtensionHostDebugPort(parseArgs(a, OPTIONS), false);
    assert.deepStrictEqual(parse([]), {
      port: 5870,
      break: false,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(parse(["--debugPluginHost"]), {
      port: 5870,
      break: false,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(parse(["--debugPluginHost=1234"]), {
      port: 1234,
      break: false,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(parse(["--debugBrkPluginHost"]), {
      port: 5870,
      break: false,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(parse(["--debugBrkPluginHost=5678"]), {
      port: 5678,
      break: true,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(
      parse([
        "--debugPluginHost=1234",
        "--debugBrkPluginHost=5678",
        "--debugId=7"
      ]),
      { port: 5678, break: true, env: void 0, debugId: "7" }
    );
    assert.deepStrictEqual(parse(["--inspect-extensions"]), {
      port: 5870,
      break: false,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(parse(["--inspect-extensions=1234"]), {
      port: 1234,
      break: false,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(parse(["--inspect-brk-extensions"]), {
      port: 5870,
      break: false,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(parse(["--inspect-brk-extensions=5678"]), {
      port: 5678,
      break: true,
      env: void 0,
      debugId: void 0
    });
    assert.deepStrictEqual(
      parse([
        "--inspect-extensions=1234",
        "--inspect-brk-extensions=5678",
        "--debugId=7"
      ]),
      { port: 5678, break: true, env: void 0, debugId: "7" }
    );
  });
  test("careful with boolean file names", () => {
    let actual = parseArgs(["-r", "arg.txt"], OPTIONS);
    assert(actual["reuse-window"]);
    assert.deepStrictEqual(actual._, ["arg.txt"]);
    actual = parseArgs(["-r", "true.txt"], OPTIONS);
    assert(actual["reuse-window"]);
    assert.deepStrictEqual(actual._, ["true.txt"]);
  });
  test("userDataDir", () => {
    const service1 = new NativeEnvironmentService(
      parseArgs(process.argv, OPTIONS),
      { _serviceBrand: void 0, ...product }
    );
    assert.ok(service1.userDataPath.length > 0);
    const args = parseArgs(process.argv, OPTIONS);
    args["user-data-dir"] = "/userDataDir/folder";
    const service2 = new NativeEnvironmentService(args, {
      _serviceBrand: void 0,
      ...product
    });
    assert.notStrictEqual(service1.userDataPath, service2.userDataPath);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
