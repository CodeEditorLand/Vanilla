import assert from "assert";
import { Event } from "../../../../common/event.js";
import { FileAccess } from "../../../../common/network.js";
import { Client } from "../../node/ipc.cp.js";
import { TestServiceClient } from "./testService.js";
function createClient() {
  return new Client(FileAccess.asFileUri("bootstrap-fork").fsPath, {
    serverName: "TestServer",
    env: {
      VSCODE_AMD_ENTRYPOINT: "vs/base/parts/ipc/test/node/testApp",
      verbose: true
    }
  });
}
suite("IPC, Child Process", function() {
  this.slow(2e3);
  this.timeout(1e4);
  let client;
  let channel;
  let service;
  setup(() => {
    client = createClient();
    channel = client.getChannel("test");
    service = new TestServiceClient(channel);
  });
  teardown(() => {
    client.dispose();
  });
  test("createChannel", async () => {
    const result = await service.pong("ping");
    assert.strictEqual(result.incoming, "ping");
    assert.strictEqual(result.outgoing, "pong");
  });
  test("events", async () => {
    const event = Event.toPromise(Event.once(service.onMarco));
    const promise = service.marco();
    const [promiseResult, eventResult] = await Promise.all([
      promise,
      event
    ]);
    assert.strictEqual(promiseResult, "polo");
    assert.strictEqual(eventResult.answer, "polo");
  });
  test("event dispose", async () => {
    let count = 0;
    const disposable = service.onMarco(() => count++);
    const answer = await service.marco();
    assert.strictEqual(answer, "polo");
    assert.strictEqual(count, 1);
    const answer_1 = await service.marco();
    assert.strictEqual(answer_1, "polo");
    assert.strictEqual(count, 2);
    disposable.dispose();
    const answer_2 = await service.marco();
    assert.strictEqual(answer_2, "polo");
    assert.strictEqual(count, 2);
  });
});
