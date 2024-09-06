import { AsyncIterableObject } from "vs/base/common/async";
import { CancellationToken } from "vs/base/common/cancellation";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { HoverStartSource, IHoverComputer } from "vs/editor/contrib/hover/browser/hoverOperation";
import { HoverAnchor, IEditorHoverParticipant, IHoverPart } from "vs/editor/contrib/hover/browser/hoverTypes";
export declare class ContentHoverComputer implements IHoverComputer<IHoverPart> {
    private readonly _editor;
    private readonly _participants;
    private _anchor;
    get anchor(): HoverAnchor | null;
    set anchor(value: HoverAnchor | null);
    private _shouldFocus;
    get shouldFocus(): boolean;
    set shouldFocus(value: boolean);
    private _source;
    get source(): HoverStartSource;
    set source(value: HoverStartSource);
    private _insistOnKeepingHoverVisible;
    get insistOnKeepingHoverVisible(): boolean;
    set insistOnKeepingHoverVisible(value: boolean);
    constructor(_editor: ICodeEditor, _participants: readonly IEditorHoverParticipant[]);
    private static _getLineDecorations;
    computeAsync(token: CancellationToken): AsyncIterableObject<IHoverPart>;
    computeSync(): IHoverPart[];
}
