var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import * as cp from "child_process";
import { FileAccess } from "../../../common/network.js";
import * as objects from "../../../common/objects.js";
import * as platform from "../../../common/platform.js";
import * as processes from "../../../node/processes.js";
function fork(id) {
  const opts = {
    env: objects.mixin(objects.deepClone(process.env), {
      VSCODE_AMD_ENTRYPOINT: id,
      VSCODE_PIPE_LOGGING: "true",
      VSCODE_VERBOSE_LOGGING: true
    })
  };
  return cp.fork(FileAccess.asFileUri("bootstrap-fork").fsPath, ["--type=processTests"], opts);
}
__name(fork, "fork");
suite("Processes", () => {
  test("buffered sending - simple data", function(done) {
    if (process.env["VSCODE_PID"]) {
      return done();
    }
    const child = fork("vs/base/test/node/processes/fixtures/fork");
    const sender = processes.createQueuedSender(child);
    let counter = 0;
    const msg1 = "Hello One";
    const msg2 = "Hello Two";
    const msg3 = "Hello Three";
    child.on("message", (msgFromChild) => {
      if (msgFromChild === "ready") {
        sender.send(msg1);
        sender.send(msg2);
        sender.send(msg3);
      } else {
        counter++;
        if (counter === 1) {
          assert.strictEqual(msgFromChild, msg1);
        } else if (counter === 2) {
          assert.strictEqual(msgFromChild, msg2);
        } else if (counter === 3) {
          assert.strictEqual(msgFromChild, msg3);
          child.kill();
          done();
        }
      }
    });
  });
  (!platform.isWindows || process.env["VSCODE_PID"] ? test.skip : test)("buffered sending - lots of data (potential deadlock on win32)", function(done) {
    const child = fork("vs/base/test/node/processes/fixtures/fork_large");
    const sender = processes.createQueuedSender(child);
    const largeObj = /* @__PURE__ */ Object.create(null);
    for (let i = 0; i < 1e4; i++) {
      largeObj[i] = "some data";
    }
    const msg = JSON.stringify(largeObj);
    child.on("message", (msgFromChild) => {
      if (msgFromChild === "ready") {
        sender.send(msg);
        sender.send(msg);
        sender.send(msg);
      } else if (msgFromChild === "done") {
        child.kill();
        done();
      }
    });
  });
});
//# sourceMappingURL=processes.integrationTest.js.map
