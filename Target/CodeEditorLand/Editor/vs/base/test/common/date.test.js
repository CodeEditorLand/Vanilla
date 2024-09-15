import { strictEqual } from "assert";
import { fromNow, fromNowByDay, getDurationString } from "../../common/date.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
suite("Date", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  suite("fromNow", () => {
    test("appendAgoLabel", () => {
      strictEqual(fromNow(Date.now() - 35e3), "35 secs");
      strictEqual(fromNow(Date.now() - 35e3, false), "35 secs");
      strictEqual(fromNow(Date.now() - 35e3, true), "35 secs ago");
    });
    test("useFullTimeWords", () => {
      strictEqual(fromNow(Date.now() - 35e3), "35 secs");
      strictEqual(fromNow(Date.now() - 35e3, void 0, false), "35 secs");
      strictEqual(fromNow(Date.now() - 35e3, void 0, true), "35 seconds");
    });
    test("disallowNow", () => {
      strictEqual(fromNow(Date.now() - 5e3), "now");
      strictEqual(fromNow(Date.now() - 5e3, void 0, void 0, false), "now");
      strictEqual(fromNow(Date.now() - 5e3, void 0, void 0, true), "5 secs");
    });
  });
  suite("fromNowByDay", () => {
    test("today", () => {
      const now = /* @__PURE__ */ new Date();
      strictEqual(fromNowByDay(now), "Today");
    });
    test("yesterday", () => {
      const yesterday = /* @__PURE__ */ new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      strictEqual(fromNowByDay(yesterday), "Yesterday");
    });
    test("daysAgo", () => {
      const daysAgo = /* @__PURE__ */ new Date();
      daysAgo.setDate(daysAgo.getDate() - 5);
      strictEqual(fromNowByDay(daysAgo, true), "5 days ago");
    });
  });
  suite("getDurationString", () => {
    test("basic", () => {
      strictEqual(getDurationString(1), "1ms");
      strictEqual(getDurationString(999), "999ms");
      strictEqual(getDurationString(1e3), "1s");
      strictEqual(getDurationString(1e3 * 60 - 1), "59.999s");
      strictEqual(getDurationString(1e3 * 60), "1 mins");
      strictEqual(getDurationString(1e3 * 60 * 60 - 1), "60 mins");
      strictEqual(getDurationString(1e3 * 60 * 60), "1 hrs");
      strictEqual(getDurationString(1e3 * 60 * 60 * 24 - 1), "24 hrs");
      strictEqual(getDurationString(1e3 * 60 * 60 * 24), "1 days");
    });
    test("useFullTimeWords", () => {
      strictEqual(getDurationString(1, true), "1 milliseconds");
      strictEqual(getDurationString(999, true), "999 milliseconds");
      strictEqual(getDurationString(1e3, true), "1 seconds");
      strictEqual(getDurationString(1e3 * 60 - 1, true), "59.999 seconds");
      strictEqual(getDurationString(1e3 * 60, true), "1 minutes");
      strictEqual(getDurationString(1e3 * 60 * 60 - 1, true), "60 minutes");
      strictEqual(getDurationString(1e3 * 60 * 60, true), "1 hours");
      strictEqual(getDurationString(1e3 * 60 * 60 * 24 - 1, true), "24 hours");
      strictEqual(getDurationString(1e3 * 60 * 60 * 24, true), "1 days");
    });
  });
});
//# sourceMappingURL=date.test.js.map
