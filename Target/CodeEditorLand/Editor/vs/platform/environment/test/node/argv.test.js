var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { formatOptions, Option, OptionDescriptions, Subcommand, parseArgs, ErrorReporter } from "../../node/argv.js";
import { addArg } from "../../node/argvHelper.js";
function o(description, type = "string") {
  return {
    description,
    type
  };
}
__name(o, "o");
function c(description, options) {
  return {
    description,
    type: "subcommand",
    options
  };
}
__name(c, "c");
suite("formatOptions", () => {
  test("Text should display small columns correctly", () => {
    assert.deepStrictEqual(
      formatOptions({
        "add": o("bar")
      }, 80),
      ["  --add        bar"]
    );
    assert.deepStrictEqual(
      formatOptions({
        "add": o("bar"),
        "wait": o("ba"),
        "trace": o("b")
      }, 80),
      [
        "  --add        bar",
        "  --wait       ba",
        "  --trace      b"
      ]
    );
  });
  test("Text should wrap", () => {
    assert.deepStrictEqual(
      formatOptions({
        "add": o("bar ".repeat(9))
      }, 40),
      [
        "  --add        bar bar bar bar bar bar",
        "               bar bar bar"
      ]
    );
  });
  test("Text should revert to the condensed view when the terminal is too narrow", () => {
    assert.deepStrictEqual(
      formatOptions({
        "add": o("bar ".repeat(9))
      }, 30),
      [
        "  --add",
        "      bar bar bar bar bar bar bar bar bar "
      ]
    );
  });
  test("addArg", () => {
    assert.deepStrictEqual(addArg([], "foo"), ["foo"]);
    assert.deepStrictEqual(addArg([], "foo", "bar"), ["foo", "bar"]);
    assert.deepStrictEqual(addArg(["foo"], "bar"), ["foo", "bar"]);
    assert.deepStrictEqual(addArg(["--wait"], "bar"), ["--wait", "bar"]);
    assert.deepStrictEqual(addArg(["--wait", "--", "--foo"], "bar"), ["--wait", "bar", "--", "--foo"]);
    assert.deepStrictEqual(addArg(["--", "--foo"], "bar"), ["bar", "--", "--foo"]);
  });
  test("subcommands", () => {
    assert.deepStrictEqual(
      formatOptions({
        "testcmd": c("A test command", { add: o("A test command option") })
      }, 30),
      [
        "  --testcmd",
        "      A test command"
      ]
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
suite("parseArgs", () => {
  function newErrorReporter(result = [], command = "") {
    const commandPrefix = command ? command + "-" : "";
    return {
      onDeprecatedOption: /* @__PURE__ */ __name((deprecatedId) => result.push(`${commandPrefix}onDeprecatedOption ${deprecatedId}`), "onDeprecatedOption"),
      onUnknownOption: /* @__PURE__ */ __name((id) => result.push(`${commandPrefix}onUnknownOption ${id}`), "onUnknownOption"),
      onEmptyValue: /* @__PURE__ */ __name((id) => result.push(`${commandPrefix}onEmptyValue ${id}`), "onEmptyValue"),
      onMultipleValues: /* @__PURE__ */ __name((id, usedValue) => result.push(`${commandPrefix}onMultipleValues ${id} ${usedValue}`), "onMultipleValues"),
      getSubcommandReporter: /* @__PURE__ */ __name((c2) => newErrorReporter(result, commandPrefix + c2), "getSubcommandReporter"),
      result
    };
  }
  __name(newErrorReporter, "newErrorReporter");
  function assertParse(options, input, expected, expectedErrors) {
    const errorReporter = newErrorReporter();
    assert.deepStrictEqual(parseArgs(input, options, errorReporter), expected);
    assert.deepStrictEqual(errorReporter.result, expectedErrors);
  }
  __name(assertParse, "assertParse");
  test("subcommands", () => {
    const options1 = {
      "testcmd": c("A test command", {
        testArg: o("A test command option"),
        _: { type: "string[]" }
      }),
      _: { type: "string[]" }
    };
    assertParse(
      options1,
      ["testcmd", "--testArg=foo"],
      { testcmd: { testArg: "foo", "_": [] }, "_": [] },
      []
    );
    assertParse(
      options1,
      ["testcmd", "--testArg=foo", "--testX"],
      { testcmd: { testArg: "foo", "_": [] }, "_": [] },
      ["testcmd-onUnknownOption testX"]
    );
    const options2 = {
      "testcmd": c("A test command", {
        testArg: o("A test command option")
      }),
      testX: { type: "boolean", global: true, description: "" },
      _: { type: "string[]" }
    };
    assertParse(
      options2,
      ["testcmd", "--testArg=foo", "--testX"],
      { testcmd: { testArg: "foo", testX: true, "_": [] }, "_": [] },
      []
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=argv.test.js.map
