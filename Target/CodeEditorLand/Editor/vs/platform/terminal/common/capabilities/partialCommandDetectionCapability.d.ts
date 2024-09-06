import type { IMarker, Terminal } from "@xterm/headless";
import { DisposableStore } from "vs/base/common/lifecycle";
import { IPartialCommandDetectionCapability } from "vs/platform/terminal/common/capabilities/capabilities";
/**
 * This capability guesses where commands are based on where the cursor was when enter was pressed.
 * It's very hit or miss but it's often correct and better than nothing.
 */
export declare class PartialCommandDetectionCapability extends DisposableStore implements IPartialCommandDetectionCapability {
    private readonly _terminal;
    readonly type: any;
    private readonly _commands;
    get commands(): readonly IMarker[];
    private readonly _onCommandFinished;
    readonly onCommandFinished: any;
    constructor(_terminal: Terminal);
    private _onData;
    private _onEnter;
    private _clearCommandsInViewport;
}
