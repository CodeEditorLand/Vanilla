var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { randomPath } from "../../common/extpath.js";
import { join } from "../../common/path.js";
import * as testUtils from "../common/testUtils.js";
function getRandomTestPath(tmpdir, ...segments) {
  return randomPath(join(tmpdir, ...segments));
}
__name(getRandomTestPath, "getRandomTestPath");
const flakySuite = testUtils.flakySuite;
export {
  flakySuite,
  getRandomTestPath
};
//# sourceMappingURL=testUtils.js.map
