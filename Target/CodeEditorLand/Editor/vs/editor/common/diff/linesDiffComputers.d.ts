import { DefaultLinesDiffComputer } from "./defaultLinesDiffComputer/defaultLinesDiffComputer.js";
import { LegacyLinesDiffComputer } from "./legacyLinesDiffComputer.js";
export declare const linesDiffComputers: {
    getLegacy: () => LegacyLinesDiffComputer;
    getDefault: () => DefaultLinesDiffComputer;
};
