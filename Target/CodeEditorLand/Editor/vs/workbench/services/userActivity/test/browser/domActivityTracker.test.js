import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { DomActivityTracker } from "../../browser/domActivityTracker.js";
import { UserActivityService } from "../../common/userActivityService.js";
import * as sinon from "sinon";
import assert from "assert";
suite("DomActivityTracker", () => {
  let uas;
  let dom;
  let insta;
  let clock;
  const maxTimeToBecomeIdle = 3 * 3e4;
  setup(() => {
    clock = sinon.useFakeTimers();
    insta = new TestInstantiationService();
    uas = new UserActivityService(insta);
    dom = new DomActivityTracker(uas);
  });
  teardown(() => {
    dom.dispose();
    uas.dispose();
    clock.restore();
    insta.dispose();
  });
  test("marks inactive on no input", () => {
    assert.equal(uas.isActive, true);
    clock.tick(maxTimeToBecomeIdle);
    assert.equal(uas.isActive, false);
  });
  test("preserves activity state when active", () => {
    assert.equal(uas.isActive, true);
    const div = 10;
    for (let i = 0; i < div; i++) {
      document.dispatchEvent(new MouseEvent("keydown"));
      clock.tick(maxTimeToBecomeIdle / div);
    }
    assert.equal(uas.isActive, true);
  });
  test("restores active state", () => {
    assert.equal(uas.isActive, true);
    clock.tick(maxTimeToBecomeIdle);
    assert.equal(uas.isActive, false);
    document.dispatchEvent(new MouseEvent("keydown"));
    assert.equal(uas.isActive, true);
    clock.tick(maxTimeToBecomeIdle);
    assert.equal(uas.isActive, false);
  });
});
//# sourceMappingURL=domActivityTracker.test.js.map
