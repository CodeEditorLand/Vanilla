import * as http from "http";
import { AddressInfo } from "net";
import assert from "assert";
import { CancellationToken, CancellationTokenSource } from "../../../../common/cancellation.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../test/common/utils.js";
import { request } from "../../browser/request.js";
import { streamToBuffer } from "../../../../common/buffer.js";
import { flakySuite } from "../../../../test/common/testUtils.js";
flakySuite("Request", () => {
  let port;
  let server;
  setup(async () => {
    port = await new Promise((resolvePort, rejectPort) => {
      server = http.createServer((req, res) => {
        if (req.url === "/noreply") {
          return;
        }
        res.setHeader("Content-Type", "application/json");
        if (req.headers["echo-header"]) {
          res.setHeader("echo-header", req.headers["echo-header"]);
        }
        const data = [];
        req.on("data", (chunk) => data.push(chunk));
        req.on("end", () => {
          res.end(JSON.stringify({
            method: req.method,
            url: req.url,
            data: Buffer.concat(data).toString()
          }));
        });
      }).listen(0, "127.0.0.1", () => {
        const address = server.address();
        resolvePort(address.port);
      }).on("error", (err) => {
        rejectPort(err);
      });
    });
  });
  teardown(async () => {
    await new Promise((resolve, reject) => {
      server.close((err) => err ? reject(err) : resolve());
    });
  });
  test("GET", async () => {
    const context = await request({
      url: `http://127.0.0.1:${port}`,
      headers: {
        "echo-header": "echo-value"
      }
    }, CancellationToken.None);
    assert.strictEqual(context.res.statusCode, 200);
    assert.strictEqual(context.res.headers["content-type"], "application/json");
    assert.strictEqual(context.res.headers["echo-header"], "echo-value");
    const buffer = await streamToBuffer(context.stream);
    const body = JSON.parse(buffer.toString());
    assert.strictEqual(body.method, "GET");
    assert.strictEqual(body.url, "/");
  });
  test("POST", async () => {
    const context = await request({
      type: "POST",
      url: `http://127.0.0.1:${port}/postpath`,
      data: "Some data"
    }, CancellationToken.None);
    assert.strictEqual(context.res.statusCode, 200);
    assert.strictEqual(context.res.headers["content-type"], "application/json");
    const buffer = await streamToBuffer(context.stream);
    const body = JSON.parse(buffer.toString());
    assert.strictEqual(body.method, "POST");
    assert.strictEqual(body.url, "/postpath");
    assert.strictEqual(body.data, "Some data");
  });
  test("timeout", async () => {
    try {
      await request({
        type: "GET",
        url: `http://127.0.0.1:${port}/noreply`,
        timeout: 123
      }, CancellationToken.None);
      assert.fail("Should fail with timeout");
    } catch (err) {
      assert.strictEqual(err.message, "Fetch timeout: 123ms");
    }
  });
  test("cancel", async () => {
    try {
      const source = new CancellationTokenSource();
      const res = request({
        type: "GET",
        url: `http://127.0.0.1:${port}/noreply`
      }, source.token);
      await new Promise((resolve) => setTimeout(resolve, 100));
      source.cancel();
      await res;
      assert.fail("Should fail with cancellation");
    } catch (err) {
      assert.strictEqual(err.message, "Canceled");
    }
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=request.test.js.map
