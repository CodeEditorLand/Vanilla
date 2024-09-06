import "vs/css!./findOptionsWidget";
import { Widget } from "vs/base/browser/ui/widget";
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from "vs/editor/browser/editorBrowser";
import { FindReplaceState } from "vs/editor/contrib/find/browser/findState";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
export declare class FindOptionsWidget extends Widget implements IOverlayWidget {
    private static readonly ID;
    private readonly _editor;
    private readonly _state;
    private readonly _keybindingService;
    private readonly _domNode;
    private readonly regex;
    private readonly wholeWords;
    private readonly caseSensitive;
    constructor(editor: ICodeEditor, state: FindReplaceState, keybindingService: IKeybindingService);
    private _keybindingLabelFor;
    dispose(): void;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition;
    highlightFindOptions(): void;
    private _hideSoon;
    private _revealTemporarily;
    private _onMouseLeave;
    private _onMouseOver;
    private _isVisible;
    private _show;
    private _hide;
}