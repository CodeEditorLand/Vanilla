import { AsyncIterableObject } from "../../../../base/common/async.js";
import type { CancellationToken } from "../../../../base/common/cancellation.js";
import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import type { HoverStartSource, IHoverComputer } from "./hoverOperation.js";
import { type HoverAnchor, type IEditorHoverParticipant, type IHoverPart } from "./hoverTypes.js";
export interface ContentHoverComputerOptions {
    shouldFocus: boolean;
    anchor: HoverAnchor;
    source: HoverStartSource;
    insistOnKeepingHoverVisible: boolean;
}
export declare class ContentHoverComputer implements IHoverComputer<ContentHoverComputerOptions, IHoverPart> {
    private readonly _editor;
    private readonly _participants;
    constructor(_editor: ICodeEditor, _participants: readonly IEditorHoverParticipant[]);
    private static _getLineDecorations;
    computeAsync(options: ContentHoverComputerOptions, token: CancellationToken): AsyncIterableObject<IHoverPart>;
    computeSync(options: ContentHoverComputerOptions): IHoverPart[];
}
