import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { HoverVerbosityAction } from "vs/editor/common/languages";
import { ContentHoverComputer } from "vs/editor/contrib/hover/browser/contentHoverComputer";
import { HoverResult } from "vs/editor/contrib/hover/browser/contentHoverTypes";
import { HoverStartSource } from "vs/editor/contrib/hover/browser/hoverOperation";
import { IEditorHoverContext, IEditorHoverParticipant, IHoverPart } from "vs/editor/contrib/hover/browser/hoverTypes";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
export declare class RenderedContentHover extends Disposable {
    closestMouseDistance: number | undefined;
    initialMousePosX: number | undefined;
    initialMousePosY: number | undefined;
    readonly showAtPosition: Position;
    readonly showAtSecondaryPosition: Position;
    readonly shouldFocus: boolean;
    readonly source: HoverStartSource;
    readonly shouldAppearBeforeContent: boolean;
    private readonly _renderedHoverParts;
    constructor(editor: ICodeEditor, hoverResult: HoverResult, participants: IEditorHoverParticipant<IHoverPart>[], computer: ContentHoverComputer, context: IEditorHoverContext, keybindingService: IKeybindingService);
    get domNode(): DocumentFragment;
    get domNodeHasChildren(): boolean;
    get focusedHoverPartIndex(): number;
    focusHoverPartWithIndex(index: number): void;
    getAccessibleWidgetContent(): string;
    getAccessibleWidgetContentAtIndex(index: number): string;
    updateHoverVerbosityLevel(action: HoverVerbosityAction, index: number, focus?: boolean): Promise<void>;
    doesHoverAtIndexSupportVerbosityAction(index: number, action: HoverVerbosityAction): boolean;
    isColorPickerVisible(): boolean;
    static computeHoverPositions(editor: ICodeEditor, anchorRange: Range, hoverParts: IHoverPart[]): {
        showAtPosition: Position;
        showAtSecondaryPosition: Position;
    };
}
