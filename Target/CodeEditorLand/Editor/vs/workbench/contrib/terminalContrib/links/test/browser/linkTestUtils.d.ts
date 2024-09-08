import type { URI } from "../../../../../../base/common/uri.js";
import type { ITerminalLinkDetector, TerminalLinkType } from "../../browser/links.js";
export declare function assertLinkHelper(text: string, expected: ({
    uri: URI;
    range: [number, number][];
} | {
    text: string;
    range: [number, number][];
})[], detector: ITerminalLinkDetector, expectedType: TerminalLinkType): Promise<void>;
