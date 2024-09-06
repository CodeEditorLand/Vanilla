import { IMarkdownString } from "vs/base/common/htmlContent";
import "vs/css!./messageController";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IPosition } from "vs/editor/common/core/position";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IOpenerService } from "vs/platform/opener/common/opener";
export declare class MessageController implements IEditorContribution {
    private readonly _openerService;
    static readonly ID = "editor.contrib.messageController";
    static readonly MESSAGE_VISIBLE: any;
    static get(editor: ICodeEditor): MessageController | null;
    private readonly _editor;
    private readonly _visible;
    private readonly _messageWidget;
    private readonly _messageListeners;
    private _message;
    private _mouseOverMessage;
    constructor(editor: ICodeEditor, contextKeyService: IContextKeyService, _openerService: IOpenerService);
    dispose(): void;
    isVisible(): any;
    showMessage(message: IMarkdownString | string, position: IPosition): void;
    closeMessage(): void;
}
