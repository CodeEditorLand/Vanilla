var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { importAMDNodeModule } from "../../../amdX.js";
import * as filters from "../../common/filters.js";
import { FileAccess } from "../../common/network.js";
const patterns = ["cci", "ida", "pos", "CCI", "enbled", "callback", "gGame", "cons", "zyx", "aBc"];
const _enablePerf = false;
function perfSuite(name, callback) {
  if (_enablePerf) {
    suite(name, callback);
  }
}
__name(perfSuite, "perfSuite");
perfSuite("Performance - fuzzyMatch", async function() {
  const uri = FileAccess.asBrowserUri("vs/base/test/common/filters.perf.data").toString(true);
  const { data } = await importAMDNodeModule(uri, "");
  console.log(`Matching ${data.length} items against ${patterns.length} patterns (${data.length * patterns.length} operations) `);
  function perfTest(name, match) {
    test(name, () => {
      const t1 = Date.now();
      let count = 0;
      for (let i = 0; i < 2; i++) {
        for (const pattern of patterns) {
          const patternLow = pattern.toLowerCase();
          for (const item of data) {
            count += 1;
            match(pattern, patternLow, 0, item, item.toLowerCase(), 0);
          }
        }
      }
      const d = Date.now() - t1;
      console.log(name, `${d}ms, ${Math.round(count / d) * 15}/15ms, ${Math.round(count / d)}/1ms`);
    });
  }
  __name(perfTest, "perfTest");
  perfTest("fuzzyScore", filters.fuzzyScore);
  perfTest("fuzzyScoreGraceful", filters.fuzzyScoreGraceful);
  perfTest("fuzzyScoreGracefulAggressive", filters.fuzzyScoreGracefulAggressive);
});
perfSuite("Performance - IFilter", async function() {
  const uri = FileAccess.asBrowserUri("vs/base/test/common/filters.perf.data").toString(true);
  const { data } = await importAMDNodeModule(uri, "");
  function perfTest(name, match) {
    test(name, () => {
      const t1 = Date.now();
      let count = 0;
      for (let i = 0; i < 2; i++) {
        for (const pattern of patterns) {
          for (const item of data) {
            count += 1;
            match(pattern, item);
          }
        }
      }
      const d = Date.now() - t1;
      console.log(name, `${d}ms, ${Math.round(count / d) * 15}/15ms, ${Math.round(count / d)}/1ms`);
    });
  }
  __name(perfTest, "perfTest");
  perfTest("matchesFuzzy", filters.matchesFuzzy);
  perfTest("matchesFuzzy2", filters.matchesFuzzy2);
  perfTest("matchesPrefix", filters.matchesPrefix);
  perfTest("matchesContiguousSubString", filters.matchesContiguousSubString);
  perfTest("matchesCamelCase", filters.matchesCamelCase);
});
//# sourceMappingURL=filters.perf.test.js.map
