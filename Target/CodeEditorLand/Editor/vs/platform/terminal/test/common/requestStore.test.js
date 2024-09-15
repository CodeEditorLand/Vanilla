import { fail, strictEqual } from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { TestInstantiationService } from "../../../instantiation/test/common/instantiationServiceMock.js";
import { ConsoleLogger, ILogService } from "../../../log/common/log.js";
import { LogService } from "../../../log/common/logService.js";
import { RequestStore } from "../../common/requestStore.js";
suite("RequestStore", () => {
  let instantiationService;
  setup(() => {
    instantiationService = new TestInstantiationService();
    instantiationService.stub(ILogService, new LogService(new ConsoleLogger()));
  });
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  test("should resolve requests", async () => {
    const requestStore = store.add(instantiationService.createInstance(RequestStore, void 0));
    let eventArgs;
    store.add(requestStore.onCreateRequest((e) => eventArgs = e));
    const request = requestStore.createRequest({ arg: "foo" });
    strictEqual(typeof eventArgs?.requestId, "number");
    strictEqual(eventArgs?.arg, "foo");
    requestStore.acceptReply(eventArgs.requestId, { data: "bar" });
    const result = await request;
    strictEqual(result.data, "bar");
  });
  test("should reject the promise when the request times out", async () => {
    const requestStore = store.add(instantiationService.createInstance(RequestStore, 1));
    const request = requestStore.createRequest({ arg: "foo" });
    let threw = false;
    try {
      await request;
    } catch (e) {
      threw = true;
    }
    if (!threw) {
      fail();
    }
  });
});
//# sourceMappingURL=requestStore.test.js.map
