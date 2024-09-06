import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor, IContentWidget, IContentWidgetPosition } from "vs/editor/browser/editorBrowser";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
export declare class ReplInputHintContentWidget extends Disposable implements IContentWidget {
    private readonly editor;
    private readonly configurationService;
    private readonly keybindingService;
    private static readonly ID;
    private domNode;
    private ariaLabel;
    constructor(editor: ICodeEditor, configurationService: IConfigurationService, keybindingService: IKeybindingService);
    getId(): string;
    getPosition(): IContentWidgetPosition | null;
    getDomNode(): HTMLElement;
    private setHint;
    private getKeybinding;
    dispose(): void;
}
