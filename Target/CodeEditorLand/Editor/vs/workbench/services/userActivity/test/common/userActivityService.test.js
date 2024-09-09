import*as e from"assert";import*as n from"sinon";import{ensureNoDisposablesAreLeakedInTestSuite as v}from"../../../../../base/test/common/utils.js";import{TestInstantiationService as l}from"../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{UserActivityService as A}from"../../common/userActivityService.js";const r=1e4;suite("UserActivityService",()=>{let t,i;const o=v();setup(()=>{i=n.useFakeTimers(),t=o.add(new A(o.add(new l)))}),teardown(()=>{i.restore()}),test("isActive should be true initially",()=>{e.ok(t.isActive)}),test("markActive should be inactive when all handles gone",()=>{const s=t.markActive(),c=t.markActive();e.strictEqual(t.isActive,!0),s.dispose(),e.strictEqual(t.isActive,!0),c.dispose(),i.tick(r),e.strictEqual(t.isActive,!1)}),test("markActive sets active whenHeldFor",async()=>{t.markActive().dispose(),i.tick(r);const s=100,c={whenHeldFor:s},a=t.markActive(c);e.strictEqual(t.isActive,!1),i.tick(s-1),e.strictEqual(t.isActive,!1),i.tick(1),e.strictEqual(t.isActive,!0),a.dispose(),i.tick(r),e.strictEqual(t.isActive,!1)}),test("markActive whenHeldFor before triggers",async()=>{t.markActive().dispose(),i.tick(r);const s=100,c={whenHeldFor:s};t.markActive(c).dispose(),e.strictEqual(t.isActive,!1),i.tick(s+r),e.strictEqual(t.isActive,!1)})});
