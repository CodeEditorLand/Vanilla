import { randomPath } from "../../common/extpath.js";
import { join } from "../../common/path.js";
import * as testUtils from "../common/testUtils.js";
function getRandomTestPath(tmpdir, ...segments) {
  return randomPath(join(tmpdir, ...segments));
}
const flakySuite = testUtils.flakySuite;
export {
  flakySuite,
  getRandomTestPath
};
