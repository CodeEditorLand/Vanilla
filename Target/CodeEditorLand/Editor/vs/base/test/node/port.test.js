import assert from "assert";
import * as net from "net";
import * as ports from "../../node/ports.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../common/utils.js";
import { flakySuite } from "./testUtils.js";
flakySuite("Ports", () => {
  (process.env["VSCODE_PID"] ? test.skip : test)("Finds a free port (no timeout)", (done) => {
    ports.findFreePort(7e3, 100, 3e5).then(
      (initialPort) => {
        assert.ok(initialPort >= 7e3);
        const server = net.createServer();
        server.listen(initialPort, void 0, void 0, () => {
          ports.findFreePort(7e3, 50, 3e5).then(
            (freePort) => {
              assert.ok(
                freePort >= 7e3 && freePort !== initialPort
              );
              server.close();
              done();
            },
            (err) => done(err)
          );
        });
      },
      (err) => done(err)
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
