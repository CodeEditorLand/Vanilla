import { type IMarkdownString } from "../../../../base/common/htmlContent.js";
import "./messageController.css";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { type ICodeEditor } from "../../../browser/editorBrowser.js";
import type { IPosition } from "../../../common/core/position.js";
import { type IEditorContribution } from "../../../common/editorCommon.js";
export declare class MessageController implements IEditorContribution {
    private readonly _openerService;
    static readonly ID = "editor.contrib.messageController";
    static readonly MESSAGE_VISIBLE: RawContextKey<boolean>;
    static get(editor: ICodeEditor): MessageController | null;
    private readonly _editor;
    private readonly _visible;
    private readonly _messageWidget;
    private readonly _messageListeners;
    private _message;
    private _mouseOverMessage;
    constructor(editor: ICodeEditor, contextKeyService: IContextKeyService, _openerService: IOpenerService);
    dispose(): void;
    isVisible(): boolean | undefined;
    showMessage(message: IMarkdownString | string, position: IPosition): void;
    closeMessage(): void;
}
