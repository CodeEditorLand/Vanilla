import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import {
  formatOptions,
  parseArgs
} from "../../node/argv.js";
import { addArg } from "../../node/argvHelper.js";
function o(description, type = "string") {
  return {
    description,
    type
  };
}
function c(description, options) {
  return {
    description,
    type: "subcommand",
    options
  };
}
suite("formatOptions", () => {
  test("Text should display small columns correctly", () => {
    assert.deepStrictEqual(
      formatOptions(
        {
          add: o("bar")
        },
        80
      ),
      ["  --add        bar"]
    );
    assert.deepStrictEqual(
      formatOptions(
        {
          add: o("bar"),
          wait: o("ba"),
          trace: o("b")
        },
        80
      ),
      ["  --add        bar", "  --wait       ba", "  --trace      b"]
    );
  });
  test("Text should wrap", () => {
    assert.deepStrictEqual(
      formatOptions(
        {
          add: o("bar ".repeat(9))
        },
        40
      ),
      [
        "  --add        bar bar bar bar bar bar",
        "               bar bar bar"
      ]
    );
  });
  test("Text should revert to the condensed view when the terminal is too narrow", () => {
    assert.deepStrictEqual(
      formatOptions(
        {
          add: o("bar ".repeat(9))
        },
        30
      ),
      ["  --add", "      bar bar bar bar bar bar bar bar bar "]
    );
  });
  test("addArg", () => {
    assert.deepStrictEqual(addArg([], "foo"), ["foo"]);
    assert.deepStrictEqual(addArg([], "foo", "bar"), ["foo", "bar"]);
    assert.deepStrictEqual(addArg(["foo"], "bar"), ["foo", "bar"]);
    assert.deepStrictEqual(addArg(["--wait"], "bar"), ["--wait", "bar"]);
    assert.deepStrictEqual(addArg(["--wait", "--", "--foo"], "bar"), [
      "--wait",
      "bar",
      "--",
      "--foo"
    ]);
    assert.deepStrictEqual(addArg(["--", "--foo"], "bar"), [
      "bar",
      "--",
      "--foo"
    ]);
  });
  test("subcommands", () => {
    assert.deepStrictEqual(
      formatOptions(
        {
          testcmd: c("A test command", {
            add: o("A test command option")
          })
        },
        30
      ),
      ["  --testcmd", "      A test command"]
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
suite("parseArgs", () => {
  function newErrorReporter(result = [], command = "") {
    const commandPrefix = command ? command + "-" : "";
    return {
      onDeprecatedOption: (deprecatedId) => result.push(
        `${commandPrefix}onDeprecatedOption ${deprecatedId}`
      ),
      onUnknownOption: (id) => result.push(`${commandPrefix}onUnknownOption ${id}`),
      onEmptyValue: (id) => result.push(`${commandPrefix}onEmptyValue ${id}`),
      onMultipleValues: (id, usedValue) => result.push(
        `${commandPrefix}onMultipleValues ${id} ${usedValue}`
      ),
      getSubcommandReporter: (c2) => newErrorReporter(result, commandPrefix + c2),
      result
    };
  }
  function assertParse(options, input, expected, expectedErrors) {
    const errorReporter = newErrorReporter();
    assert.deepStrictEqual(
      parseArgs(input, options, errorReporter),
      expected
    );
    assert.deepStrictEqual(errorReporter.result, expectedErrors);
  }
  test("subcommands", () => {
    const options1 = {
      testcmd: c("A test command", {
        testArg: o("A test command option"),
        _: { type: "string[]" }
      }),
      _: { type: "string[]" }
    };
    assertParse(
      options1,
      ["testcmd", "--testArg=foo"],
      { testcmd: { testArg: "foo", _: [] }, _: [] },
      []
    );
    assertParse(
      options1,
      ["testcmd", "--testArg=foo", "--testX"],
      { testcmd: { testArg: "foo", _: [] }, _: [] },
      ["testcmd-onUnknownOption testX"]
    );
    const options2 = {
      testcmd: c("A test command", {
        testArg: o("A test command option")
      }),
      testX: { type: "boolean", global: true, description: "" },
      _: { type: "string[]" }
    };
    assertParse(
      options2,
      ["testcmd", "--testArg=foo", "--testX"],
      { testcmd: { testArg: "foo", testX: true, _: [] }, _: [] },
      []
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
