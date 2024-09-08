import assert from "assert";
import * as crypto from "crypto";
import * as net from "net";
import { tmpdir } from "os";
import { join } from "../../../../../base/common/path.js";
import * as platform from "../../../../../base/common/platform.js";
import * as ports from "../../../../../base/node/ports.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  NamedPipeDebugAdapter,
  SocketDebugAdapter
} from "../../node/debugAdapter.js";
function sendInitializeRequest(debugAdapter) {
  return new Promise((resolve, reject) => {
    debugAdapter.sendRequest(
      "initialize",
      { adapterID: "test" },
      (result) => {
        resolve(result);
      },
      3e3
    );
  });
}
function serverConnection(socket) {
  socket.on("data", (data) => {
    const str = data.toString().split("\r\n")[2];
    const request = JSON.parse(str);
    const response = {
      seq: request.seq,
      request_seq: request.seq,
      type: "response",
      command: request.command
    };
    if (request.arguments.adapterID === "test") {
      response.success = true;
    } else {
      response.success = false;
      response.message = "failed";
    }
    const responsePayload = JSON.stringify(response);
    socket.write(
      `Content-Length: ${responsePayload.length}\r
\r
${responsePayload}`
    );
  });
}
suite("Debug - StreamDebugAdapter", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test(`StreamDebugAdapter (NamedPipeDebugAdapter) can initialize a connection`, async () => {
    const pipeName = crypto.randomBytes(10).toString("hex");
    const pipePath = platform.isWindows ? join("\\\\.\\pipe\\", pipeName) : join(tmpdir(), pipeName);
    const server = await new Promise((resolve, reject) => {
      const server2 = net.createServer(serverConnection);
      server2.once("listening", () => resolve(server2));
      server2.once("error", reject);
      server2.listen(pipePath);
    });
    const debugAdapter = new NamedPipeDebugAdapter({
      type: "pipeServer",
      path: pipePath
    });
    try {
      await debugAdapter.startSession();
      const response = await sendInitializeRequest(debugAdapter);
      assert.strictEqual(response.command, "initialize");
      assert.strictEqual(response.request_seq, 1);
      assert.strictEqual(response.success, true, response.message);
    } finally {
      await debugAdapter.stopSession();
      server.close();
      debugAdapter.dispose();
    }
  });
  test(`StreamDebugAdapter (SocketDebugAdapter) can initialize a connection`, async () => {
    const rndPort = Math.floor(Math.random() * 1e3 + 8e3);
    const port = await ports.findFreePort(
      rndPort,
      10,
      3e3,
      87
    );
    const server = net.createServer(serverConnection).listen(port);
    const debugAdapter = new SocketDebugAdapter({
      type: "server",
      port
    });
    try {
      await debugAdapter.startSession();
      const response = await sendInitializeRequest(debugAdapter);
      assert.strictEqual(response.command, "initialize");
      assert.strictEqual(response.request_seq, 1);
      assert.strictEqual(response.success, true, response.message);
    } finally {
      await debugAdapter.stopSession();
      server.close();
      debugAdapter.dispose();
    }
  });
});
