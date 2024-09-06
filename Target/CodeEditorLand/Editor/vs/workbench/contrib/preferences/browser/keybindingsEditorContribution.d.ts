import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
export declare class KeybindingEditorDecorationsRenderer extends Disposable {
    private _editor;
    private readonly _keybindingService;
    private _updateDecorations;
    private readonly _dec;
    constructor(_editor: ICodeEditor, _keybindingService: IKeybindingService);
    private _updateDecorationsNow;
    private _getDecorationForEntry;
    static _userSettingsFuzzyEquals(a: string, b: string): boolean;
    private _createDecoration;
}
