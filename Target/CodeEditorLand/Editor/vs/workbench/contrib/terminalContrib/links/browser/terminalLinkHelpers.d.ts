import type { IBuffer, IBufferLine, IBufferRange, IViewportRange } from "@xterm/xterm";
import { IPath } from "vs/base/common/path";
import { OperatingSystem } from "vs/base/common/platform";
import { IRange } from "vs/editor/common/core/range";
import { ITerminalCapabilityStore } from "vs/platform/terminal/common/capabilities/capabilities";
import { ITerminalLogService } from "vs/platform/terminal/common/terminal";
/**
 * Converts a possibly wrapped link's range (comprised of string indices) into a buffer range that plays nicely with xterm.js
 *
 * @param lines A single line (not the entire buffer)
 * @param bufferWidth The number of columns in the terminal
 * @param range The link range - string indices
 * @param startLine The absolute y position (on the buffer) of the line
 */
export declare function convertLinkRangeToBuffer(lines: IBufferLine[], bufferWidth: number, range: IRange, startLine: number): IBufferRange;
export declare function convertBufferRangeToViewport(bufferRange: IBufferRange, viewportY: number): IViewportRange;
export declare function getXtermLineContent(buffer: IBuffer, lineStart: number, lineEnd: number, cols: number): string;
export declare function getXtermRangesByAttr(buffer: IBuffer, lineStart: number, lineEnd: number, cols: number): IBufferRange[];
/**
 * For shells with the CommandDetection capability, the cwd for a command relative to the line of
 * the particular link can be used to narrow down the result for an exact file match.
 */
export declare function updateLinkWithRelativeCwd(capabilities: ITerminalCapabilityStore, y: number, text: string, osPath: IPath, logService: ITerminalLogService): string[] | undefined;
export declare function osPathModule(os: OperatingSystem): IPath;
