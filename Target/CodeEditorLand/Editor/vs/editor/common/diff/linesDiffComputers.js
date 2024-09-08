import { DefaultLinesDiffComputer } from "./defaultLinesDiffComputer/defaultLinesDiffComputer.js";
import { LegacyLinesDiffComputer } from "./legacyLinesDiffComputer.js";
const linesDiffComputers = {
  getLegacy: () => new LegacyLinesDiffComputer(),
  getDefault: () => new DefaultLinesDiffComputer()
};
export {
  linesDiffComputers
};
