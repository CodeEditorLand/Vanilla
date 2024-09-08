import assert from "assert";
import { toErrorMessage } from "../../common/errorMessage.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("Errors", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("Get Error Message", () => {
    assert.strictEqual(toErrorMessage("Foo Bar"), "Foo Bar");
    assert.strictEqual(toErrorMessage(new Error("Foo Bar")), "Foo Bar");
    let error = new Error();
    error = new Error();
    error.detail = {};
    error.detail.exception = {};
    error.detail.exception.message = "Foo Bar";
    assert.strictEqual(toErrorMessage(error), "Foo Bar");
    assert.strictEqual(toErrorMessage(error, true), "Foo Bar");
    assert(toErrorMessage());
    assert(toErrorMessage(null));
    assert(toErrorMessage({}));
    try {
      throw new Error();
    } catch (error2) {
      assert.strictEqual(
        toErrorMessage(error2),
        "An unknown error occurred. Please consult the log for more details."
      );
      assert.ok(
        toErrorMessage(error2, true).length > "An unknown error occurred. Please consult the log for more details.".length
      );
    }
  });
});
